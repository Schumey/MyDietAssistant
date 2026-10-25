"""v1.7: meal suggestions. Fits saved meals and combinations found in the diary to the macros still open today
(solver in suggest.py). Priorities per macro and add-on foods (nuts ...) are per user (pref "suggest", table suggest_addons)."""
import math
from datetime import date, timedelta

from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
import suggest
from extras import feature_on, get_pref, note_use, set_pref
from extras import SavedItemIn, pack_range, saved_meal_rows
from main import app, check_day, check_time, day_totals, food_scope, get_goal, publish, user_from

HISTORY_DAYS = 180
HISTORY_MIN_COUNT = 2     # a combination must have been eaten this often to become a candidate
HISTORY_TOL = 15          # default ratio tolerance (percent) for combinations from the diary
HISTORY_LIMIT = 40
SHOWN = 8


def need_suggest(owner: str):
    if not feature_on(owner, "suggest"):
        raise HTTPException(403, "Mahlzeiten-Vorschläge sind nicht aktiviert")


def suggest_config(owner: str) -> dict:
    saved = get_pref(owner, "suggest", {}) or {}
    prio = {**suggest.DEFAULT_PRIO, **{k: v for k, v in (saved.get("prio") or {}).items() if k in suggest.KEYS}}
    return {"prio": prio, "kcal_cap": bool(saved.get("kcal_cap")), "protein_min": bool(saved.get("protein_min")),
            "scope": saved.get("scope") if saved.get("scope") in ("day", "next") else "day"}


class ConfigIn(BaseModel):
    prio: dict[str, int] | None = None   # kcal / protein / carbs / fat: 0 (egal) .. 3 (sehr wichtig)
    kcal_cap: bool | None = None
    protein_min: bool | None = None
    scope: str | None = None


class AddonIn(BaseModel):
    food_id: int
    min_g: float = 0
    max_g: float = 30
    step_g: float = 5


class AddonsIn(BaseModel):
    addons: list[AddonIn]


def addon_rows(c, owner: str) -> list:
    scope, sp = food_scope(c, owner)
    out = []
    for a in c.execute("SELECT * FROM suggest_addons WHERE owner=? ORDER BY id", (owner,)):
        f = c.execute(f"SELECT * FROM foods WHERE id=? AND {scope}", (a["food_id"], *sp)).fetchone()
        if f:
            out.append({"food_id": a["food_id"], "name": f["name"], "min_g": a["min_g"], "max_g": a["max_g"], "step_g": a["step_g"],
                        "per100": {k: f[k] for k in (*suggest.KEYS, *suggest.MICROS)}})
    return out


@app.get("/api/suggest/config")
def suggest_get_config(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        addons = [{k: v for k, v in a.items() if k != "per100"} for a in addon_rows(c, owner)]
    return {**suggest_config(owner), "addons": addons}


@app.put("/api/suggest/config")
def suggest_put_config(b: ConfigIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    cur = suggest_config(owner)
    if b.prio is not None:
        cur["prio"].update({k: max(0, min(3, v)) for k, v in b.prio.items() if k in suggest.KEYS})
    if b.kcal_cap is not None:
        cur["kcal_cap"] = b.kcal_cap
    if b.protein_min is not None:
        cur["protein_min"] = b.protein_min
    if b.scope in ("day", "next"):
        cur["scope"] = b.scope
    set_pref(owner, "suggest", cur)
    return {"ok": True}


@app.put("/api/suggest/addons")
def suggest_put_addons(b: AddonsIn, x_remote_user_id: str | None = Header(None)):
    """Replace the add-on list (foods that go with any meal)."""
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        scope, sp = food_scope(c, owner)
        rows = []
        for a in b.addons[:20]:
            if not c.execute(f"SELECT 1 FROM foods WHERE id=? AND {scope}", (a.food_id, *sp)).fetchone():
                raise HTTPException(404, "food not found")
            hi = max(a.max_g, 0)
            rows.append((owner, a.food_id, min(max(a.min_g, 0), hi), hi, a.step_g if a.step_g > 0 else 5))
        c.execute("DELETE FROM suggest_addons WHERE owner=?", (owner,))
        c.executemany("INSERT INTO suggest_addons(owner,food_id,min_g,max_g,step_g) VALUES(?,?,?,?,?)", rows)
    return {"ok": True}


# --- candidates ----------------------------------------------------------------------------

def cand_from_items(name, category, items, source, sid=None, min_scale=0, max_scale=0):
    """items: dicts with name, grams, kcal.. (totals for that amount) and optional mode/tol/pack_g/step_g."""
    return {"name": name, "category": category, "source": source, "saved_meal_id": sid, "min_scale": min_scale, "max_scale": max_scale,
            "items": [{"name": i["name"], "grams": i["grams"], "mode": "fixed" if i.get("mode") == "fixed" else "scale",
                       "tol": i.get("tol", 0), "pack_g": i.get("pack_g", 0), "step_g": i.get("step_g", 0), "pack_min": i.get("pack_min", 1), "pack_max": i.get("pack_max", 2),
                       "base": {k: i.get(k, 0.0) or 0.0 for k in (*suggest.KEYS, *suggest.MICROS)}} for i in items]}


def signature(names) -> tuple:
    return tuple(sorted(n.strip().lower() for n in names))


def history_candidates(c, owner: str, today: str, known: set) -> list:
    """Combinations of foods eaten together in one meal at least twice (average amounts), not yet saved as a meal."""
    since = (date.fromisoformat(today) - timedelta(days=HISTORY_DAYS)).isoformat()
    groups = {}
    for e in c.execute("SELECT day, meal_id, time, name, grams, kcal, protein, carbs, fat, fiber, sugar, salt, sat_fat FROM entries"
                       " WHERE owner=? AND day>=? AND day<? ORDER BY day, id", (owner, since, today)):
        groups.setdefault((e["day"], e["meal_id"] if e["time"] is None else e["time"][:2]), []).append(dict(e))
    combos = {}
    for rows in groups.values():
        if any(r["grams"] <= 0 for r in rows) or len({r["name"].strip().lower() for r in rows}) != len(rows) or len(rows) > 8:
            continue
        combos.setdefault(signature(r["name"] for r in rows), []).append(rows)
    out = []
    for sig, occ in sorted(combos.items(), key=lambda kv: -len(kv[1])):
        if len(occ) < HISTORY_MIN_COUNT or sig in known:
            continue
        first = occ[0]
        items = []
        for r in first:
            same = [x for o in occ for x in o if x["name"].strip().lower() == r["name"].strip().lower()]
            n = len(same)
            avg = {k: sum(x[k] for x in same) / n for k in ("grams", "kcal", "protein", "carbs", "fat", *suggest.MICROS)}
            items.append({"name": r["name"], **avg, "mode": "scale", "tol": HISTORY_TOL})
        name = " + ".join(i["name"] for i in items)
        cand = cand_from_items(name if len(name) <= 70 else name[:67] + "…", "", items, "history", None)
        cand["count"] = len(occ)
        cand["last"] = max(o[0]["day"] for o in occ)
        out.append(cand)
        if len(out) >= HISTORY_LIMIT:
            break
    return out


def saved_candidates(c, owner: str) -> list:
    uses = {r["saved_meal_id"]: r["n"] for r in c.execute(
        "SELECT saved_meal_id, COUNT(*) n FROM saved_meal_uses WHERE owner=? GROUP BY saved_meal_id", (owner,))}
    out = []
    for m in saved_meal_rows(c, owner):
        if not m["items"]:
            continue
        cand = cand_from_items(m["name"], m["category"], m["items"], "saved", m["id"], m["min_scale"], m["max_scale"])
        cand["uses"] = uses.get(m["id"], 0)
        out.append(cand)
    return out


def bias_for(cand: dict, meal_name: str, today_names: set, yesterday_names: set) -> float:
    """Small nudges next to the macro fit: fitting category, variety, familiarity (all in units of the fit cost)."""
    b = 0.0
    names = {i["name"].strip().lower() for i in cand["items"]}
    if cand.get("category") and meal_name and cand["category"].strip().lower() == meal_name.strip().lower():
        b -= 0.15
    if names and names <= today_names:
        b += 0.4
    elif names and names <= yesterday_names:
        b += 0.15
    b -= 0.05 * math.log1p(cand.get("uses", 0) + 2 * cand.get("count", 0))
    return b


def open_slots(c, owner: str, day: str, meal_id: int | None, times: bool) -> int:
    if times:
        return 1
    used = {r[0] for r in c.execute("SELECT DISTINCT meal_id FROM entries WHERE owner=? AND day=?", (owner, day))}
    ids = [r["id"] for r in c.execute("SELECT id FROM meals WHERE owner=? AND archived=0", (owner,))]
    free = [i for i in ids if i not in used]
    return max(1, len(free) + (1 if meal_id is not None and meal_id not in free else 0))


def proposal(r: dict, remaining: dict, target: dict) -> dict:
    cand, tot = r["cand"], r["totals"]
    return {"key": f"{cand['source']}:{cand['saved_meal_id'] or cand['name']}", "source": cand["source"], "saved_meal_id": cand["saved_meal_id"],
            "name": cand["name"], "category": cand.get("category", ""), "count": cand.get("count"), "items": [
                {k: (round(v, 1) if isinstance(v, float) else v) for k, v in it.items()} for it in r["items"]],
            "totals": {k: round(v, 1) for k, v in tot.items()},
            "diff": {k: round(tot[k] - target[k], 1) for k in suggest.KEYS if target.get(k) is not None},
            "left": {k: round(remaining[k] - tot[k], 1) for k in suggest.KEYS if remaining.get(k) is not None},
            "scale": round(r["s"], 2), "cost": round(r["cost"], 3)}


@app.get("/api/suggest")
def suggest_list(day: str, meal_id: int | None = None, scope: str | None = None, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    owner = user_from(x_remote_user_id)
    need_suggest(owner)
    cfg = suggest_config(owner)
    scope = scope if scope in ("day", "next") else cfg["scope"]
    with db.conn() as c:
        db.ensure_meals(c, owner)
        goal, tot = get_goal(c, owner, day), day_totals(c, owner, day)
        remaining = {k: (max(goal[k] - tot[k], 0.0) if goal.get(k) else None) for k in suggest.KEYS}
        times = get_pref(owner, "diary_mode", "meals") == "times"
        meal = c.execute("SELECT name FROM meals WHERE id=? AND owner=?", (meal_id, owner)).fetchone() if meal_id else None
        share = open_slots(c, owner, day, meal_id, times) if scope == "next" else 1
        target = {k: (v / share if v is not None else None) for k, v in remaining.items()}
        known = set()
        cands = saved_candidates(c, owner)
        for cd in cands:
            known.add(signature(i["name"] for i in cd["items"]))
        cands += history_candidates(c, owner, day, known)
        addons = addon_rows(c, owner)
        today_names = {r[0].strip().lower() for r in c.execute("SELECT name FROM entries WHERE owner=? AND day=?", (owner, day))}
        y = (date.fromisoformat(day) - timedelta(days=1)).isoformat()
        yesterday_names = {r[0].strip().lower() for r in c.execute("SELECT name FROM entries WHERE owner=? AND day=?", (owner, y))}
    for cd in cands:
        cd["bias"] = bias_for(cd, meal["name"] if meal else "", today_names, yesterday_names)
    if not any(v for v in target.values()):
        return {"remaining": remaining, "target": target, "scope": scope, "slots": share, "items": [], "reached": True}
    ranked = suggest.rank(cands, addons, target, cfg["prio"], cfg, limit=SHOWN)
    return {"remaining": {k: (round(v, 1) if v is not None else None) for k, v in remaining.items()},
            "target": {k: (round(v, 1) if v is not None else None) for k, v in target.items()},
            "scope": scope, "slots": share, "reached": False, "items": [proposal(r, remaining, target) for r in ranked]}


# --- use a suggestion ----------------------------------------------------------------------

class SuggestItem(BaseModel):
    name: str
    grams: float
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0
    sugar: float = 0
    salt: float = 0
    sat_fat: float = 0


class SuggestAddIn(BaseModel):
    day: str
    meal_id: int | None = None
    time: str | None = None
    saved_meal_id: int | None = None
    items: list[SuggestItem]


@app.post("/api/suggest/add")
def suggest_add(b: SuggestAddIn, x_remote_user_id: str | None = Header(None), x_remote_user_display_name: str | None = Header(None)):
    """Enter a (possibly adjusted) suggestion as diary entries."""
    check_day(b.day)
    owner = user_from(x_remote_user_id)
    need_suggest(owner)
    if not b.items or len(b.items) > 30:
        raise HTTPException(400, "Vorschlag ist leer")
    for i in b.items:
        if not all(math.isfinite(v) and v >= 0 for v in (i.grams, i.kcal, i.protein, i.carbs, i.fat, i.fiber, i.sugar, i.salt, i.sat_fat)):
            raise HTTPException(400, "Ungültige Werte")
    with db.conn() as c:
        db.ensure_meals(c, owner)
        meal_id = b.meal_id or c.execute("SELECT id FROM meals WHERE owner=? ORDER BY position", (owner,)).fetchone()["id"]
        if not c.execute("SELECT 1 FROM meals WHERE id=? AND owner=?", (meal_id, owner)).fetchone():
            raise HTTPException(404, "meal not found")
        if b.saved_meal_id and c.execute("SELECT 1 FROM saved_meals WHERE id=? AND owner=?", (b.saved_meal_id, owner)).fetchone():
            note_use(c, owner, b.saved_meal_id, meal_id)
        t = check_time(b.time)
        for i in b.items:
            c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time)"
                      " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      (owner, b.day, meal_id, i.name, i.grams, i.kcal, i.protein, i.carbs, i.fat, i.fiber, i.sugar, i.salt, i.sat_fat, t))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


class KeepIn(BaseModel):
    name: str
    category: str = ""
    items: list[SavedItemIn]


@app.post("/api/suggest/keep")
def suggest_keep(b: KeepIn, x_remote_user_id: str | None = Header(None)):
    """Save a combination found in the diary as a meal (ratio tolerance already set)."""
    owner = user_from(x_remote_user_id)
    need_suggest(owner)
    if not b.name.strip() or not b.items:
        raise HTTPException(400, "name required")
    with db.conn() as c:
        cur = c.execute("INSERT INTO saved_meals(owner,name,category) VALUES(?,?,?)", (owner, b.name.strip(), b.category.strip()))
        c.executemany(
            "INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,mode,tol,pack_g,step_g,pack_min,pack_max)"
            " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [(cur.lastrowid, i.name, i.grams, i.kcal, i.protein, i.carbs, i.fat, i.fiber, i.sugar, i.salt, i.sat_fat,
              "fixed" if i.mode == "fixed" else "scale", min(max(i.tol, 0), 100), max(i.pack_g, 0), max(i.step_g, 0), *pack_range(i)) for i in b.items])
        return {"id": cur.lastrowid}
