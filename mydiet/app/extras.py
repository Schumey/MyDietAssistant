"""v0.3 features: categories, saved meals, export/import, energy balance, triggers."""
import csv
import io
import json
import re
import threading
import time
from datetime import date, datetime, timedelta

import httpx
from fastapi import Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

import db
from main import SUPERVISOR_TOKEN, app, check_day, check_time, publish, user_from

KCAL_PER_KG = 7700


# --- prefs -----------------------------------------------------------------

def get_pref(owner: str, key: str, default=None):
    with db.conn() as c:
        r = c.execute("SELECT value FROM prefs WHERE owner=? AND key=?", (owner, key)).fetchone()
    return json.loads(r["value"]) if r else default


def set_pref(owner: str, key: str, value):
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO prefs(owner,key,value) VALUES(?,?,?)",
                  (owner, key, json.dumps(value)))


# --- settings -------------------------------------------------------------

class SettingsIn(BaseModel):
    diary_mode: str | None = None   # 'meals' | 'times'
    skin: str | None = None         # 'auto' | 'default' | 'win'


@app.get("/api/settings")
def read_settings(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    return {"diary_mode": get_pref(owner, "diary_mode", "meals"), "skin": get_pref(owner, "skin", "auto")}


@app.put("/api/settings")
def write_settings(s: SettingsIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if s.diary_mode is not None:
        if s.diary_mode not in ("meals", "times"):
            raise HTTPException(400, "diary_mode must be meals or times")
        set_pref(owner, "diary_mode", s.diary_mode)
    if s.skin is not None:
        if s.skin not in ("auto", "default", "win"):
            raise HTTPException(400, "skin must be auto, default or win")
        set_pref(owner, "skin", s.skin)
    return {"ok": True}


# --- categories ------------------------------------------------------------

class HiddenIn(BaseModel):
    hidden: list[str]


@app.get("/api/categories")
def categories(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        names = {r[0] for r in c.execute(
            "SELECT category FROM foods WHERE owner=? AND category!=''"
            " UNION SELECT category FROM saved_meals WHERE owner=? AND category!=''", (owner, owner))}
    hidden = get_pref(owner, "hidden_categories", [])
    return {"all": sorted(names | set(hidden), key=str.lower), "hidden": hidden}


@app.put("/api/categories/hidden")
def set_hidden(h: HiddenIn, x_remote_user_id: str | None = Header(None)):
    set_pref(user_from(x_remote_user_id), "hidden_categories", h.hidden)
    return {"ok": True}


# --- saved meals -----------------------------------------------------------

class SaveMealIn(BaseModel):
    day: str
    meal_id: int | None = None      # meal mode: all entries of this meal
    entry_ids: list[int] | None = None  # time mode: selected entries
    name: str
    category: str = ""


class SavedMealEdit(BaseModel):
    name: str
    category: str = ""


class UseSavedIn(BaseModel):
    day: str
    meal_id: int | None = None
    time: str | None = None
    factor: float = 1


def saved_meal_rows(c, owner: str):
    out = []
    for m in c.execute("SELECT * FROM saved_meals WHERE owner=? ORDER BY name COLLATE NOCASE", (owner,)):
        items = [dict(i) for i in c.execute(
            "SELECT name, grams, kcal, protein, carbs, fat FROM saved_meal_items"
            " WHERE saved_meal_id=? ORDER BY id", (m["id"],))]
        out.append({**dict(m), "items": items,
                    **{k: round(sum(i[k] for i in items), 1) for k in ("kcal", "protein", "carbs", "fat")}})
    return out


@app.get("/api/saved-meals")
def list_saved(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return saved_meal_rows(c, user_from(x_remote_user_id))


@app.post("/api/saved-meals")
def save_from_diary(s: SaveMealIn, x_remote_user_id: str | None = Header(None)):
    check_day(s.day)
    owner = user_from(x_remote_user_id)
    if not s.name.strip():
        raise HTTPException(400, "name required")
    with db.conn() as c:
        if s.entry_ids is not None:
            rows = [r for r in c.execute("SELECT * FROM entries WHERE owner=? AND day=? ORDER BY time, id",
                                         (owner, s.day)) if r["id"] in s.entry_ids]
        else:
            rows = c.execute("SELECT * FROM entries WHERE owner=? AND day=? AND meal_id=? ORDER BY id",
                             (owner, s.day, s.meal_id)).fetchall()
        if not rows:
            raise HTTPException(400, "Mahlzeit ist leer")
        cur = c.execute("INSERT INTO saved_meals(owner,name,category) VALUES(?,?,?)",
                        (owner, s.name.strip(), s.category.strip()))
        c.executemany(
            "INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat)"
            " VALUES(?,?,?,?,?,?,?)",
            [(cur.lastrowid, r["name"], r["grams"], r["kcal"], r["protein"], r["carbs"], r["fat"])
             for r in rows])
        return {"id": cur.lastrowid}


@app.put("/api/saved-meals/{sid}")
def edit_saved(sid: int, s: SavedMealEdit, x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        c.execute("UPDATE saved_meals SET name=?, category=? WHERE id=? AND owner=?",
                  (s.name.strip(), s.category.strip(), sid, user_from(x_remote_user_id)))
    return {"ok": True}


@app.delete("/api/saved-meals/{sid}")
def del_saved(sid: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        if c.execute("SELECT 1 FROM saved_meals WHERE id=? AND owner=?", (sid, owner)).fetchone():
            c.execute("DELETE FROM saved_meal_items WHERE saved_meal_id=?", (sid,))
            c.execute("DELETE FROM saved_meals WHERE id=?", (sid,))
            c.execute("DELETE FROM triggers WHERE saved_meal_id=? AND owner=?", (sid, owner))
    return {"ok": True}


def first_meal(c, owner: str) -> int:
    db.ensure_meals(c, owner)
    return c.execute("SELECT id FROM meals WHERE owner=? ORDER BY position", (owner,)).fetchone()["id"]


def note_use(c, owner: str, sid: int, meal_id: int | None):
    c.execute("INSERT INTO saved_meal_uses(owner,saved_meal_id,meal_id) VALUES(?,?,?)", (owner, sid, meal_id))


def add_saved_to_diary(c, owner: str, sid: int, day: str, meal_id: int | None, factor: float = 1,
                       time: str | None = None):
    meal_id = meal_id or first_meal(c, owner)
    note_use(c, owner, sid, meal_id)
    if not c.execute("SELECT 1 FROM saved_meals WHERE id=? AND owner=?", (sid, owner)).fetchone():
        raise HTTPException(404, "saved meal not found")
    if not c.execute("SELECT 1 FROM meals WHERE id=? AND owner=?", (meal_id, owner)).fetchone():
        raise HTTPException(404, "meal not found")
    for i in c.execute("SELECT * FROM saved_meal_items WHERE saved_meal_id=? ORDER BY id", (sid,)).fetchall():
        c.execute(
            "INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,time)"
            " VALUES(?,?,?,?,?,?,?,?,?,?)",
            (owner, day, meal_id, i["name"], i["grams"] * factor, i["kcal"] * factor,
             i["protein"] * factor, i["carbs"] * factor, i["fat"] * factor, time))


@app.post("/api/saved-meals/{sid}/add")
def use_saved(sid: int, u: UseSavedIn, x_remote_user_id: str | None = Header(None),
              x_remote_user_display_name: str | None = Header(None)):
    check_day(u.day)
    if u.factor <= 0:
        raise HTTPException(400, "factor must be > 0")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        add_saved_to_diary(c, owner, sid, u.day, u.meal_id, u.factor, check_time(u.time))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


# --- energy balance --------------------------------------------------------

def energy_balance(owner: str, days: list[dict]) -> dict | None:
    """Estimate daily energy balance from the weight trend and the logged intake.

    Weight slope (least squares over the range) * 7700 kcal/kg = surplus (+) / deficit (-)
    per day; TDEE = average intake - balance.
    """
    logged = [d for d in days if d["logged"]]
    with db.conn() as c:
        w = [(date.fromisoformat(r["day"]), r["kg"]) for r in c.execute(
            "SELECT day, kg FROM weights WHERE owner=? AND day>=? ORDER BY day", (owner, days[0]["day"]))]
    if not logged:
        return None
    intake = sum(d["kcal"] for d in logged) / len(logged)
    res = {"intake": round(intake), "logged_days": len(logged), "range_days": len(days),
           "weights": len(w), "balance": None, "tdee": None, "kg_per_week": None}
    if len(w) >= 2 and (w[-1][0] - w[0][0]).days >= 6:
        x0 = w[0][0]
        xs = [(d - x0).days for d, _ in w]
        ys = [kg for _, kg in w]
        mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
        var = sum((x - mx) ** 2 for x in xs)
        slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / var if var else 0
        res["kg_per_week"] = round(slope * 7, 2)
        res["balance"] = round(slope * KCAL_PER_KG)
        res["tdee"] = round(intake - slope * KCAL_PER_KG)
    return res


# --- export ----------------------------------------------------------------

def dump(owner: str) -> dict:
    with db.conn() as c:
        q = lambda sql, *a: [dict(r) for r in c.execute(sql, a)]
        return {
            "app": "MyDietAssistant", "version": 1,
            "foods": q("SELECT id,name,brand,kcal,protein,carbs,fat,serving_g,category FROM foods WHERE owner=?", owner),
            "meals": q("SELECT id,name,position,archived FROM meals WHERE owner=? ORDER BY position", owner),
            "settings": {"diary_mode": get_pref(owner, "diary_mode", "meals")},
            "entries": q("SELECT day,time,meal_id,name,grams,kcal,protein,carbs,fat FROM entries WHERE owner=? ORDER BY day,id", owner),
            "goal": q("SELECT kcal,protein,carbs,fat,target_weight FROM goals WHERE owner=?", owner),
            "weights": q("SELECT day,kg FROM weights WHERE owner=? ORDER BY day", owner),
            "saved_meals": saved_meal_rows(c, owner),
            "hidden_categories": get_pref(owner, "hidden_categories", []),
        }


@app.get("/api/export/json")
def export_json(x_remote_user_id: str | None = Header(None)):
    body = json.dumps(dump(user_from(x_remote_user_id)), ensure_ascii=False, indent=1)
    return Response(body, media_type="application/json", headers={
        "Content-Disposition": f'attachment; filename="mydiet-{date.today().isoformat()}.json"'})


@app.get("/api/export/csv")
def export_csv(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    out = io.StringIO()
    wr = csv.writer(out)
    wr.writerow(["Date", "Time", "Meal", "Food", "Grams", "Calories", "Carbs", "Fat", "Protein"])
    with db.conn() as c:
        for r in c.execute(
                "SELECT e.day, e.time, m.name meal, e.name, e.grams, e.kcal, e.carbs, e.fat, e.protein"
                " FROM entries e LEFT JOIN meals m ON m.id=e.meal_id WHERE e.owner=? ORDER BY e.day, e.id",
                (owner,)):
            wr.writerow([r["day"], r["time"] or "", r["meal"], r["name"], round(r["grams"], 1), round(r["kcal"], 1),
                         round(r["carbs"], 1), round(r["fat"], 1), round(r["protein"], 1)])
        for r in c.execute("SELECT day, kg FROM weights WHERE owner=? ORDER BY day", (owner,)):
            wr.writerow([r["day"], "", "[Weight]", f"{r['kg']} kg", "", "", "", "", ""])
    return Response("﻿" + out.getvalue(), media_type="text/csv; charset=utf-8", headers={
        "Content-Disposition": f'attachment; filename="mydiet-{date.today().isoformat()}.csv"'})


# --- import: own JSON backup ----------------------------------------------

class JsonImport(BaseModel):
    data: dict


@app.post("/api/import/json")
def import_json(j: JsonImport, x_remote_user_id: str | None = Header(None)):
    """Restore a backup: replaces ALL data of the current user."""
    d = j.data
    if d.get("app") != "MyDietAssistant":
        raise HTTPException(400, "Keine MyDietAssistant-Sicherung")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        for t in ("foods", "meals", "entries", "goals", "weights", "saved_meals"):
            if t == "saved_meals":
                c.execute("DELETE FROM saved_meal_items WHERE saved_meal_id IN"
                          " (SELECT id FROM saved_meals WHERE owner=?)", (owner,))
            c.execute(f"DELETE FROM {t} WHERE owner=?", (owner,))
        c.execute("DELETE FROM triggers WHERE owner=?", (owner,))
        for f in d.get("foods", []):
            c.execute("INSERT INTO foods(owner,name,brand,kcal,protein,carbs,fat,serving_g,category)"
                      " VALUES(?,?,?,?,?,?,?,?,?)",
                      (owner, f["name"], f.get("brand", ""), f["kcal"], f.get("protein", 0),
                       f.get("carbs", 0), f.get("fat", 0), f.get("serving_g", 100), f.get("category", "")))
        mmap = {}
        for m in d.get("meals", []):
            mmap[m["id"]] = c.execute("INSERT INTO meals(owner,name,position,archived) VALUES(?,?,?,?)",
                                      (owner, m["name"], m["position"], m.get("archived", 0))).lastrowid
        for e in d.get("entries", []):
            if e["meal_id"] in mmap:
                c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,time)"
                          " VALUES(?,?,?,?,?,?,?,?,?,?)",
                          (owner, e["day"], mmap[e["meal_id"]], e["name"], e["grams"], e["kcal"],
                           e["protein"], e["carbs"], e["fat"], e.get("time")))
        for g in d.get("goal", []):
            c.execute("INSERT INTO goals(owner,kcal,protein,carbs,fat,target_weight) VALUES(?,?,?,?,?,?)",
                      (owner, g["kcal"], g["protein"], g["carbs"], g["fat"], g.get("target_weight")))
        for w in d.get("weights", []):
            c.execute("INSERT INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, w["day"], w["kg"]))
        for s in d.get("saved_meals", []):
            sid = c.execute("INSERT INTO saved_meals(owner,name,category) VALUES(?,?,?)",
                            (owner, s["name"], s.get("category", ""))).lastrowid
            for i in s.get("items", []):
                c.execute("INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat)"
                          " VALUES(?,?,?,?,?,?,?)",
                          (sid, i["name"], i["grams"], i["kcal"], i["protein"], i["carbs"], i["fat"]))
    set_pref(owner, "hidden_categories", d.get("hidden_categories", []))
    set_pref(owner, "diary_mode", d.get("settings", {}).get("diary_mode", "meals"))
    return {"ok": True}


# --- import: MyFitnessPal CSV ----------------------------------------------

MONTHS = {m: i + 1 for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"])}


def mfp_date(s: str) -> str | None:
    m = re.fullmatch(r"\s*([A-Za-z]{3})[a-z]*\.? (\d{1,2}), (\d{4})\s*", s)
    if m and m[1].lower() in MONTHS:
        return date(int(m[3]), MONTHS[m[1].lower()], int(m[2])).isoformat()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s.strip()):
        return s.strip()
    return None


def mfp_num(s: str) -> float:
    m = re.match(r"\s*(-?[\d.,]+)", s or "")
    if not m:
        return 0.0
    v = m[1]
    if "," in v and "." not in v:
        v = v.replace(",", ".")
    else:
        v = v.replace(",", "")
    try:
        return float(v)
    except ValueError:
        return 0.0


def mfp_grams(food: str) -> float:
    """Quantity in g/ml from 'Name, 110 g' or 'Name, 1 container (125,00 Gramm)'; 0 if unknown."""
    m = re.search(r"\(([\d.,]+)\s*(?:gram\w*|g|ml)\)\s*$", food, re.I) or \
        re.search(r",\s*([\d.,]+)\s*(?:gram\w*|g|ml)\s*$", food, re.I)
    return mfp_num(m[1]) if m else 0.0


def parse_mfp(text: str) -> dict:
    rdr = csv.DictReader(io.StringIO(text.lstrip("﻿")))
    if not rdr.fieldnames or not {"Date", "Meal", "Food", "Calories"} <= set(rdr.fieldnames):
        raise HTTPException(400, "Das sieht nicht nach einem MyFitnessPal-Export aus.")
    items, totals, weights = [], {}, {}
    for r in rdr:
        day = mfp_date(r["Date"])
        if not day:
            continue
        meal, food = r["Meal"], r["Food"]
        if meal == "[Daily Total]":
            totals[day] = {"kcal": mfp_num(r["Calories"]), "carbs": mfp_num(r["Carbs"]),
                           "fat": mfp_num(r["Fat"]), "protein": mfp_num(r["Protein"])}
        elif meal.startswith("[Measurement: Weight]") or meal == "[Measurement: Weight]":
            kg = mfp_num(food)
            if re.search(r"pound|lb", food, re.I):
                kg *= 0.45359237
            elif re.search(r"stone", food, re.I):
                kg *= 6.35029
            if kg > 0:
                weights[day] = round(kg, 2)
        elif meal.startswith("["):
            continue  # other measurements
        else:
            grams = mfp_grams(food)
            food = food.replace(" ", " ")
            if grams:  # "Name, 110 g" / "Name, 1 container (125,00 Gramm)": quantity is shown separately
                food = re.sub(r",\s*(?:[^,()]*\([^)]*\)|[^,]*)\s*$", "", food).strip()
            items.append({"day": day, "meal": meal, "name": food, "grams": grams,
                          "kcal": mfp_num(r["Calories"]), "carbs": mfp_num(r["Carbs"]),
                          "fat": mfp_num(r["Fat"]), "protein": mfp_num(r["Protein"])})
    # days without a total row: sum the items
    for it in items:
        t = totals.setdefault(it["day"], {"kcal": 0, "carbs": 0, "fat": 0, "protein": 0, "_sum": True})
        if t.get("_sum"):
            for k in ("kcal", "carbs", "fat", "protein"):
                t[k] += it[k]
    for t in totals.values():
        t.pop("_sum", None)
    return {"items": items, "totals": totals, "weights": weights}


class MfpPreviewIn(BaseModel):
    csv: str


class MfpImportIn(BaseModel):
    csv: str
    mode: str = "full"                 # 'full' | 'totals'
    weights: bool = True
    meal_map: dict[str, int | None] = {}  # file meal name -> own meal id (None/missing: create)
    replace: bool = True               # clear existing entries on imported days
    hide_empty: bool = False           # totals-only: hide the other (empty) meals on imported days


@app.post("/api/import/mfp/preview")
def mfp_preview(p: MfpPreviewIn, x_remote_user_id: str | None = Header(None)):
    d = parse_mfp(p.csv)
    owner = user_from(x_remote_user_id)
    days = sorted(set(d["totals"]) | set(d["weights"]))
    with db.conn() as c:
        from db import ensure_meals
        ensure_meals(c, owner)
        own = [dict(r) for r in c.execute("SELECT id, name FROM meals WHERE owner=? ORDER BY position", (owner,))]
    names = []
    for it in d["items"]:
        if it["meal"] not in names:
            names.append(it["meal"])
    guess = {}
    for n in names:  # prefix match, e.g. "Mittag" -> "Mittagessen"
        hit = next((m for m in own if m["name"].lower() == n.lower()), None) or \
              next((m for m in own if m["name"].lower().startswith(n.lower()) or n.lower().startswith(m["name"].lower())), None)
        guess[n] = hit["id"] if hit else None
    return {"days": len(d["totals"]), "from": days[0] if days else None, "to": days[-1] if days else None,
            "items": len(d["items"]), "weights": len(d["weights"]),
            "meals": names, "own_meals": own, "guess": guess}


@app.post("/api/import/mfp")
def mfp_import(p: MfpImportIn, x_remote_user_id: str | None = Header(None),
               x_remote_user_display_name: str | None = Header(None)):
    d = parse_mfp(p.csv)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        db.ensure_meals(c, owner)
        own_ids = {r["id"] for r in c.execute("SELECT id FROM meals WHERE owner=?", (owner,))}
        created: dict[str, int] = {}

        def meal_id(name: str) -> int:
            mid = p.meal_map.get(name)
            if mid in own_ids:
                return mid
            if name not in created:
                pos = c.execute("SELECT COALESCE(MAX(position),-1)+1 FROM meals WHERE owner=?", (owner,)).fetchone()[0]
                created[name] = c.execute("INSERT INTO meals(owner,name,position) VALUES(?,?,?)",
                                          (owner, name, pos)).lastrowid
            return created[name]

        days = list(d["totals"])
        if p.replace:
            c.executemany("DELETE FROM entries WHERE owner=? AND day=?", [(owner, x) for x in days])
        if p.mode == "full":
            for it in d["items"]:
                c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat)"
                          " VALUES(?,?,?,?,?,?,?,?,?)",
                          (owner, it["day"], meal_id(it["meal"]), it["name"], it["grams"], it["kcal"],
                           it["protein"], it["carbs"], it["fat"]))
        else:
            mid = meal_id("MyFitnessPal (Tagessumme)")
            c.execute("UPDATE meals SET archived=1 WHERE id=?", (mid,))
            if p.hide_empty:
                c.executemany("INSERT OR IGNORE INTO day_flags(owner,day) VALUES(?,?)",
                              [(owner, x) for x in days])
            for day, t in d["totals"].items():
                c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat)"
                          " VALUES(?,?,?,?,?,?,?,?,?)",
                          (owner, day, mid, "Tagessumme (MyFitnessPal)", 0, t["kcal"], t["protein"],
                           t["carbs"], t["fat"]))
        nw = 0
        if p.weights:
            for day, kg in d["weights"].items():
                c.execute("INSERT OR REPLACE INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, day, kg))
                nw += 1
    publish(owner, x_remote_user_display_name or owner)
    return {"days": len(days), "entries": len(d["items"]) if p.mode == "full" else len(days), "weights": nw}


# --- triggers ---------------------------------------------------------------

class TriggerIn(BaseModel):
    kind: str                       # 'state' | 'calendar'
    entity: str
    match: str = ""
    meal_id: int
    saved_meal_id: int | None = None
    food_id: int | None = None
    grams: float | None = None
    enabled: bool = True
    negate: bool = False
    days_ahead: int = 0             # calendar triggers: also fill the next N days
    part: str = "any"               # calendar triggers: 'any' day of the event | 'start' day | 'end' day


def ha_get(path: str, **params):
    r = httpx.get(f"http://supervisor/core/api/{path}", params=params, timeout=8,
                  headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"})
    r.raise_for_status()
    return r.json()


@app.get("/api/ha/entities")
def ha_entities():
    """Entity ids for the trigger form (states and calendars)."""
    if not SUPERVISOR_TOKEN:
        return []
    try:
        return sorted(
            ({"id": s["entity_id"], "name": s["attributes"].get("friendly_name", ""), "state": s["state"]}
             for s in ha_get("states")
             if s["entity_id"].split(".")[0] in {"calendar", "person", "device_tracker", "binary_sensor",
                                                 "input_boolean", "input_select", "sensor", "zone", "switch"}),
            key=lambda e: e["id"])
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, "Home Assistant nicht erreichbar")


def trigger_rows(c, owner: str):
    rows = []
    for t in c.execute("SELECT * FROM triggers WHERE owner=? ORDER BY id", (owner,)):
        label = None
        if t["saved_meal_id"]:
            r = c.execute("SELECT name FROM saved_meals WHERE id=?", (t["saved_meal_id"],)).fetchone()
            label = r["name"] if r else None
        elif t["food_id"]:
            r = c.execute("SELECT name FROM foods WHERE id=?", (t["food_id"],)).fetchone()
            label = r["name"] if r else None
        m = c.execute("SELECT name FROM meals WHERE id=?", (t["meal_id"],)).fetchone()
        last = c.execute("SELECT MAX(day) d FROM trigger_log WHERE trigger_id=?", (t["id"],)).fetchone()["d"]
        rows.append({**dict(t), "enabled": bool(t["enabled"]), "item": label,
                     "meal": m["name"] if m else None, "last_run": last})
    return rows


def check_trigger_body(c, owner: str, t: TriggerIn):
    if t.kind not in ("state", "calendar"):
        raise HTTPException(400, "kind must be state or calendar")
    if t.part not in ("any", "start", "end"):
        raise HTTPException(400, "part must be any, start or end")
    if not t.entity.strip():
        raise HTTPException(400, "entity required")
    if bool(t.saved_meal_id) == bool(t.food_id):
        raise HTTPException(400, "genau eines von Mahlzeit/Lebensmittel angeben")
    if not c.execute("SELECT 1 FROM meals WHERE id=? AND owner=?", (t.meal_id, owner)).fetchone():
        raise HTTPException(404, "meal not found")


@app.get("/api/triggers")
def list_triggers(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return trigger_rows(c, user_from(x_remote_user_id))


@app.post("/api/triggers")
def add_trigger(t: TriggerIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        check_trigger_body(c, owner, t)
        cur = c.execute(
            "INSERT INTO triggers(owner,kind,entity,match,meal_id,saved_meal_id,food_id,grams,enabled,negate,days_ahead,part)"
            " VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            (owner, t.kind, t.entity.strip(), t.match.strip(), t.meal_id, t.saved_meal_id, t.food_id,
             t.grams, int(t.enabled), int(t.negate), max(0, min(t.days_ahead, 60)), t.part))
        return {"id": cur.lastrowid}


@app.put("/api/triggers/{tid}")
def edit_trigger(tid: int, t: TriggerIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        check_trigger_body(c, owner, t)
        c.execute("UPDATE triggers SET kind=?,entity=?,match=?,meal_id=?,saved_meal_id=?,food_id=?,"
                  "grams=?,enabled=?,negate=?,days_ahead=?,part=? WHERE id=? AND owner=?",
                  (t.kind, t.entity.strip(), t.match.strip(), t.meal_id, t.saved_meal_id, t.food_id,
                   t.grams, int(t.enabled), int(t.negate), max(0, min(t.days_ahead, 60)), t.part, tid, owner))
    return {"ok": True}


@app.delete("/api/triggers/{tid}")
def del_trigger(tid: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        if c.execute("SELECT 1 FROM triggers WHERE id=? AND owner=?", (tid, owner)).fetchone():
            c.execute("DELETE FROM triggers WHERE id=?", (tid,))
            c.execute("DELETE FROM trigger_log WHERE trigger_id=?", (tid,))
    return {"ok": True}


def fire(c, t, day: str):
    owner = t["owner"]
    # planned days ahead get no clock time; today is stamped with the current time
    stamp = datetime.now().strftime("%H:%M") if day == date.today().isoformat() else None
    if t["saved_meal_id"]:
        add_saved_to_diary(c, owner, t["saved_meal_id"], day, t["meal_id"], time=stamp)
    elif t["food_id"]:
        f = c.execute("SELECT * FROM foods WHERE id=? AND owner=?", (t["food_id"], owner)).fetchone()
        if not f:
            return
        g = t["grams"] or f["serving_g"] or 100
        k = g / 100
        c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,time)"
                  " VALUES(?,?,?,?,?,?,?,?,?,?)",
                  (owner, day, t["meal_id"], f["name"], g, f["kcal"] * k, f["protein"] * k,
                   f["carbs"] * k, f["fat"] * k, stamp))
    c.execute("INSERT OR IGNORE INTO trigger_log(trigger_id, day) VALUES(?,?)", (t["id"], day))


@app.post("/api/triggers/{tid}/run")
def run_trigger(tid: int, x_remote_user_id: str | None = Header(None),
                x_remote_user_display_name: str | None = Header(None)):
    """Fire manually (for testing); adds the item to today's diary."""
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        t = c.execute("SELECT * FROM triggers WHERE id=? AND owner=?", (tid, owner)).fetchone()
        if not t:
            raise HTTPException(404, "trigger not found")
        fire(c, t, date.today().isoformat())
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


def condition_met(t, now: datetime, day: str | None = None) -> bool:
    """Does the rule apply (now, or for the given day)? With t['negate'] the condition is inverted."""
    neg = bool(t["negate"])
    part = t["part"] if t["kind"] == "calendar" else "any"
    if day and day != now.date().isoformat():  # calendar day in the future: any matching event counts
        return calendar_has_event(t["entity"], t["match"], day, part) != neg
    if t["kind"] == "state":
        st = ha_get(f"states/{t['entity']}")["state"]
        want = t["match"].strip().lower()
        return (st.lower() == want if want else st.lower() in ("on", "home", "true")) != neg
    if neg or part != "any":  # "has no event ...", or only the start/end day of an event: judged for the whole day
        return calendar_has_event(t["entity"], t["match"], now.date().isoformat(), part) != neg
    start = now.strftime("%Y-%m-%dT00:00:00")
    end = (now + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")
    for ev in ha_get(f"calendars/{t['entity']}", start=start, end=end):
        if t["match"].strip().lower() not in str(ev.get("summary", "")).lower():
            continue
        s = ev.get("start")
        s = s.get("dateTime") or s.get("date") if isinstance(s, dict) else s
        if not s or len(s) <= 10:  # all-day event
            return True
        try:
            st = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            return True
        if st.tzinfo:
            st = st.astimezone().replace(tzinfo=None)
        if st <= now:
            return True
    return False


poll_state = {"token": bool(SUPERVISOR_TOKEN), "last": None, "log": []}


def note(msg: str):
    line = f"{datetime.now():%H:%M:%S} {msg}"
    print("[trigger] " + line, flush=True)
    poll_state["log"] = (poll_state["log"] + [line])[-30:]


def poll_triggers():
    now = datetime.now()
    poll_state["last"] = now.strftime("%Y-%m-%d %H:%M:%S")
    day = now.date().isoformat()
    with db.conn() as c:
        triggers = c.execute("SELECT * FROM triggers WHERE enabled=1").fetchall()
        done = {(r["trigger_id"], r["day"]) for r in c.execute("SELECT trigger_id, day FROM trigger_log WHERE day>=?", (day,))}
    pending = []  # (trigger, day): state triggers act today only, calendar triggers also days ahead
    for t in triggers:
        for i in range(0, (t["days_ahead"] if t["kind"] == "calendar" else 0) + 1):
            d = (now.date() + timedelta(days=i)).isoformat()
            if (t["id"], d) not in done:
                pending.append((t, d))
    with db.conn() as c:
        rules = c.execute("SELECT * FROM meal_triggers WHERE enabled=1 AND kind='state'").fetchall()
        for t in rules:
            meal_rule_active(c, t, day)  # logs the day once the state was seen
    for t, d in pending:
        try:
            if not condition_met(t, now, d):
                continue
        except (httpx.HTTPError, ValueError, KeyError) as e:
            note(f"Trigger {t['id']} ({t['entity']}, {d}): Fehler {e!r}")
            continue
        with db.conn() as c:
            fire(c, t, d)
        note(f"Trigger {t['id']} ({t['entity']}): für {d} eingetragen")
        publish(t["owner"], get_pref(t["owner"], "display", t["owner"]))


def trigger_loop():
    time.sleep(5)
    while True:
        try:
            poll_triggers()
        except Exception as e:  # keep the loop alive whatever HA does
            note(f"Abfrage fehlgeschlagen: {e!r}")
        time.sleep(60)


@app.get("/api/triggers/status")
def trigger_status():
    return poll_state


@app.post("/api/triggers/poll")
def trigger_poll_now():
    """Run the check right away (for diagnosing)."""
    poll_triggers()
    return poll_state


if SUPERVISOR_TOKEN:
    threading.Thread(target=trigger_loop, daemon=True, name="triggers").start()
    note("Trigger-Prüfung gestartet (alle 60 s)")
else:
    note("Kein SUPERVISOR_TOKEN: Trigger-Prüfung inaktiv")


# --- copy / clear / suggestions ---------------------------------------------

class CopyIn(BaseModel):
    ids: list[int]
    day: str
    meal_id: int | None = None
    time: str | None = None
    factor: float = 1


@app.post("/api/entries/copy")
def copy_entries(cp: CopyIn, x_remote_user_id: str | None = Header(None),
                 x_remote_user_display_name: str | None = Header(None)):
    """Copy diary entries to another meal and/or day (optionally scaled)."""
    check_day(cp.day)
    if cp.factor <= 0:
        raise HTTPException(400, "factor must be > 0")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        meal_id = cp.meal_id or first_meal(c, owner)
        if not c.execute("SELECT 1 FROM meals WHERE id=? AND owner=?", (meal_id, owner)).fetchone():
            raise HTTPException(404, "meal not found")
        n = 0
        for eid in cp.ids:
            e = c.execute("SELECT * FROM entries WHERE id=? AND owner=?", (eid, owner)).fetchone()
            if not e:
                continue
            k = cp.factor
            c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,time)"
                      " VALUES(?,?,?,?,?,?,?,?,?,?)",
                      (owner, cp.day, meal_id, e["name"], e["grams"] * k, e["kcal"] * k, e["protein"] * k,
                       e["carbs"] * k, e["fat"] * k, check_time(cp.time) if cp.time else e["time"]))
            n += 1
    publish(owner, x_remote_user_display_name or owner)
    return {"copied": n}


@app.delete("/api/day/{day}/entries")
def clear_entries(day: str, meal_id: int | None = None, x_remote_user_id: str | None = Header(None),
                  x_remote_user_display_name: str | None = Header(None)):
    """Delete all entries of a diary meal (or of the whole day without meal_id)."""
    check_day(day)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        if meal_id is None:
            c.execute("DELETE FROM entries WHERE owner=? AND day=?", (owner, day))
        else:
            c.execute("DELETE FROM entries WHERE owner=? AND day=? AND meal_id=?", (owner, day, meal_id))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


@app.get("/api/suggestions")
def suggestions(meal_id: int | None = None, limit: int = 6, x_remote_user_id: str | None = Header(None)):
    """Frequently used entries and saved meals, for the given diary meal if any."""
    owner = user_from(x_remote_user_id)
    limit = max(1, min(limit, 20))
    with db.conn() as c:
        where, args = ("AND meal_id=?", (owner, meal_id)) if meal_id else ("", (owner,))
        items = []
        for r in c.execute(
                f"SELECT name, COUNT(*) n, MAX(id) last_id FROM entries WHERE owner=? {where} AND grams>0"
                " GROUP BY name ORDER BY n DESC, last_id DESC LIMIT ?", (*args, limit)):
            e = c.execute("SELECT id, grams, kcal, protein, carbs, fat FROM entries WHERE id=?",
                          (r["last_id"],)).fetchone()
            items.append({"name": r["name"], "n": r["n"], "entry_id": e["id"], "grams": e["grams"],
                          "kcal": e["kcal"], "protein": e["protein"], "carbs": e["carbs"], "fat": e["fat"]})
        uw, ua = ("AND u.meal_id=?", (owner, meal_id)) if meal_id else ("", (owner,))
        ids = [(r["saved_meal_id"], r["n"]) for r in c.execute(
            f"SELECT u.saved_meal_id, COUNT(*) n FROM saved_meal_uses u WHERE u.owner=? {uw}"
            " GROUP BY u.saved_meal_id ORDER BY n DESC, MAX(u.id) DESC LIMIT ?", (*ua, limit))]
        by_id = {s["id"]: s for s in saved_meal_rows(c, owner)}
        saved = [{**by_id[i], "n": n} for i, n in ids if i in by_id]
    return {"items": items, "saved": saved}


# --- meal visibility rules ----------------------------------------------------

_cal_cache: dict[tuple, tuple[float, bool]] = {}


def _event_day(v, last: bool):
    """Local date of an event boundary from HA's calendar API (all-day ends are exclusive)."""
    v = v.get("dateTime") or v.get("date") if isinstance(v, dict) else v
    if not v:
        return None
    if len(v) <= 10:
        d = date.fromisoformat(v)
        return d - timedelta(days=1) if last else d
    dt = datetime.fromisoformat(v.replace("Z", "+00:00"))
    if dt.tzinfo:
        dt = dt.astimezone().replace(tzinfo=None)
    return (dt - timedelta(microseconds=1) if last else dt).date()


def _event_on(ev, day: str, part: str) -> bool:
    if part == "any":
        return True
    try:
        d = _event_day(ev.get("start") if part == "start" else ev.get("end"), part == "end")
    except ValueError:
        return True
    return d is None or d.isoformat() == day


def calendar_has_event(entity: str, match: str, day: str, part: str = "any") -> bool:
    key = (entity, match, day, part)
    hit = _cal_cache.get(key)
    now = datetime.now().timestamp()
    if hit and now - hit[0] < 60:
        return hit[1]
    nxt = (date.fromisoformat(day) + timedelta(days=1)).isoformat()
    events = ha_get(f"calendars/{entity}", start=f"{day}T00:00:00", end=f"{nxt}T00:00:00")
    res = any(match.strip().lower() in str(ev.get("summary", "")).lower() and _event_on(ev, day, part) for ev in events)
    _cal_cache[key] = (now, res)
    return res


def meal_rule_active(c, t, day: str) -> bool:
    if c.execute("SELECT 1 FROM meal_trigger_log WHERE meal_trigger_id=? AND day=?", (t["id"], day)).fetchone():
        return True
    if not SUPERVISOR_TOKEN:
        return True  # no HA (local dev): don't hide anything
    try:
        if t["kind"] == "calendar":
            return calendar_has_event(t["entity"], t["match"], day, t["part"]) != bool(t["negate"])
        if day == date.today().isoformat() and condition_met(t, datetime.now()):
            c.execute("INSERT OR IGNORE INTO meal_trigger_log VALUES(?,?)", (t["id"], day))
            return True
        return False
    except (httpx.HTTPError, ValueError, KeyError):
        return True  # HA unreachable: show rather than hide


def hidden_meals(c, owner: str, day: str, meals: list[dict], with_entries: set[int]) -> set[int]:
    """Meals not shown on this day: gated by a rule that doesn't apply, or empty on a totals-only day."""
    rules = c.execute("SELECT * FROM meal_triggers WHERE owner=? AND enabled=1", (owner,)).fetchall()
    gated = {t["meal_id"] for t in rules}
    active = {t["meal_id"] for t in rules if meal_rule_active(c, t, day)}
    flagged = c.execute("SELECT 1 FROM day_flags WHERE owner=? AND day=?", (owner, day)).fetchone()
    return {m["id"] for m in meals if m["id"] not in with_entries
            and (m["archived"] or flagged or (m["id"] in gated and m["id"] not in active))}


class MealRuleIn(BaseModel):
    meal_id: int
    kind: str
    entity: str
    match: str = ""
    negate: bool = False
    part: str = "any"


@app.get("/api/meal-triggers")
def list_meal_triggers(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return [dict(r) for r in c.execute(
            "SELECT t.*, m.name meal FROM meal_triggers t LEFT JOIN meals m ON m.id=t.meal_id"
            " WHERE t.owner=? ORDER BY t.id", (user_from(x_remote_user_id),))]


@app.post("/api/meal-triggers")
def add_meal_trigger(r: MealRuleIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if r.kind not in ("state", "calendar") or not r.entity.strip():
        raise HTTPException(400, "kind/entity invalid")
    with db.conn() as c:
        if not c.execute("SELECT 1 FROM meals WHERE id=? AND owner=?", (r.meal_id, owner)).fetchone():
            raise HTTPException(404, "meal not found")
        cur = c.execute("INSERT INTO meal_triggers(owner,meal_id,kind,entity,match,negate,part) VALUES(?,?,?,?,?,?,?)",
                        (owner, r.meal_id, r.kind, r.entity.strip(), r.match.strip(), int(r.negate),
                         r.part if r.part in ("any", "start", "end") else "any"))
        return {"id": cur.lastrowid}


@app.put("/api/meal-triggers/{rid}")
def edit_meal_trigger(rid: int, r: MealRuleIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if r.kind not in ("state", "calendar") or not r.entity.strip():
        raise HTTPException(400, "kind/entity invalid")
    with db.conn() as c:
        c.execute("UPDATE meal_triggers SET meal_id=?,kind=?,entity=?,match=?,negate=?,part=? WHERE id=? AND owner=?",
                  (r.meal_id, r.kind, r.entity.strip(), r.match.strip(), int(r.negate),
                   r.part if r.part in ("any", "start", "end") else "any", rid, owner))
        c.execute("DELETE FROM meal_trigger_log WHERE meal_trigger_id=?", (rid,))
    return {"ok": True}


class ArchiveIn(BaseModel):
    archived: bool


@app.put("/api/meals/{meal_id}/archived")
def archive_meal(meal_id: int, a: ArchiveIn, x_remote_user_id: str | None = Header(None)):
    """Hide a meal on days without entries (e.g. the one created by a totals-only import)."""
    with db.conn() as c:
        c.execute("UPDATE meals SET archived=? WHERE id=? AND owner=?",
                  (int(a.archived), meal_id, user_from(x_remote_user_id)))
    return {"ok": True}


@app.delete("/api/meal-triggers/{rid}")
def del_meal_trigger(rid: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        if c.execute("SELECT 1 FROM meal_triggers WHERE id=? AND owner=?", (rid, owner)).fetchone():
            c.execute("DELETE FROM meal_triggers WHERE id=?", (rid,))
            c.execute("DELETE FROM meal_trigger_log WHERE meal_trigger_id=?", (rid,))
    return {"ok": True}
