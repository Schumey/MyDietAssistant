"""v0.3 features: categories, saved meals, export/import, energy balance, triggers."""
import csv
import io
import json
import re
import threading
import time
from contextlib import contextmanager
from contextvars import ContextVar
from datetime import date, datetime, timedelta, timezone

import httpx
from fastapi import Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

import db
from main import SUPERVISOR_TOKEN, app, check_day, check_time, day_totals, get_goal, publish, user_from

KCAL_PER_KG = 7700


# --- prefs -----------------------------------------------------------------

_pref_memo: ContextVar = ContextVar("pref_memo", default=None)
_MISSING = object()


@contextmanager
def pref_cache():
    """Inside the block repeated pref reads are served from memory (loops that ask for the goal of every day)."""
    token = _pref_memo.set({})
    try:
        yield
    finally:
        _pref_memo.reset(token)


def get_pref(owner: str, key: str, default=None):
    memo = _pref_memo.get()
    if memo is not None and (owner, key) in memo:
        return default if memo[(owner, key)] is _MISSING else memo[(owner, key)]
    with db.conn() as c:
        r = c.execute("SELECT value FROM prefs WHERE owner=? AND key=?", (owner, key)).fetchone()
    value = json.loads(r["value"]) if r else _MISSING
    if memo is not None:
        memo[(owner, key)] = value
    return default if value is _MISSING else value


def set_pref(owner: str, key: str, value):
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO prefs(owner,key,value) VALUES(?,?,?)",
                  (owner, key, json.dumps(value)))
    memo = _pref_memo.get()
    if memo is not None:
        memo[(owner, key)] = json.loads(json.dumps(value))


# --- settings -------------------------------------------------------------

FEATURES = ("weekday_goals", "trackers", "micros", "notes", "body", "recipes", "sources", "household", "activity", "schedule")   # optional features, off by default


def features(owner: str) -> dict:
    saved = get_pref(owner, "features", {})
    return {k: bool(saved.get(k, False)) for k in FEATURES}


def feature_on(owner: str, name: str) -> bool:
    return features(owner).get(name, False)


GOAL_MODES = ("lose", "maintain", "gain")


def goal_hit(mode: str, kcal: float, goal: float) -> bool:
    """Did a day meet the calorie goal? lose: at or under, gain: at or over, maintain: within 10 %."""
    if mode == "gain":
        return kcal >= goal
    if mode == "maintain":
        return abs(kcal - goal) <= goal * 0.1
    return kcal <= goal


class SettingsIn(BaseModel):
    diary_mode: str | None = None   # 'meals' | 'times'
    goal_mode: str | None = None    # 'lose' | 'maintain' | 'gain'
    lang: str | None = None         # 'auto' | 'de' | 'en'
    units: str | None = None        # 'metric' | 'imperial'
    mass: str | None = None         # food amounts: 'g' | 'oz'
    goal_rate: float | None = None  # intended kg per week (positive)
    skin: str | None = None         # 'auto' | 'default' | 'win'
    features: dict[str, bool] | None = None


@app.get("/api/settings")
def read_settings(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    return {"diary_mode": get_pref(owner, "diary_mode", "meals"), "skin": get_pref(owner, "skin", "auto"),
            "features": features(owner), "lang": get_pref(owner, "lang", "auto"), "units": get_pref(owner, "units", "metric"), "mass": get_pref(owner, "mass", "g"),
            "goal_mode": get_pref(owner, "goal_mode", "lose"),
            "goal_rate": get_pref(owner, "goal_rate", 0.5)}


@app.put("/api/settings")
def write_settings(s: SettingsIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if s.diary_mode is not None:
        if s.diary_mode not in ("meals", "times"):
            raise HTTPException(400, "diary_mode must be meals or times")
        set_pref(owner, "diary_mode", s.diary_mode)
    if s.lang is not None:
        if s.lang not in ("auto", "de", "en"):
            raise HTTPException(400, "lang must be auto, de or en")
        set_pref(owner, "lang", s.lang)
    if s.units is not None:
        if s.units not in ("metric", "imperial"):
            raise HTTPException(400, "units must be metric or imperial")
        set_pref(owner, "units", s.units)
    if s.mass is not None:
        if s.mass not in ("g", "oz"):
            raise HTTPException(400, "mass must be g or oz")
        set_pref(owner, "mass", s.mass)
    if s.goal_mode is not None:
        if s.goal_mode not in GOAL_MODES:
            raise HTTPException(400, "goal_mode must be lose, maintain or gain")
        set_pref(owner, "goal_mode", s.goal_mode)
    if s.goal_rate is not None:
        set_pref(owner, "goal_rate", max(0.0, min(float(s.goal_rate), 2.0)))
    if s.skin is not None:
        if s.skin not in ("auto", "default", "win"):
            raise HTTPException(400, "skin must be auto, default or win")
        set_pref(owner, "skin", s.skin)
    if s.features is not None:
        set_pref(owner, "features", {**features(owner), **{k: v for k, v in s.features.items() if k in FEATURES}})
    return {"ok": True}


# --- per-weekday goals (optional feature) -----------------------------------

class WeekdayGoalIn(BaseModel):
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0


@app.get("/api/goal-weekdays")
def list_weekday_goals(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return {str(r["wd"]): {k: r[k] for k in ("kcal", "protein", "carbs", "fat")}
                for r in c.execute("SELECT * FROM goal_weekdays WHERE owner=?", (user_from(x_remote_user_id),))}


@app.put("/api/goal-weekdays/{wd}")
def set_weekday_goal(wd: int, g: WeekdayGoalIn, x_remote_user_id: str | None = Header(None)):
    if not 0 <= wd <= 6:
        raise HTTPException(400, "wd must be 0..6")
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO goal_weekdays(owner,wd,kcal,protein,carbs,fat) VALUES(?,?,?,?,?,?)",
                  (user_from(x_remote_user_id), wd, g.kcal, g.protein, g.carbs, g.fat))
    return {"ok": True}


@app.delete("/api/goal-weekdays/{wd}")
def del_weekday_goal(wd: int, x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        c.execute("DELETE FROM goal_weekdays WHERE owner=? AND wd=?", (user_from(x_remote_user_id), wd))
    return {"ok": True}


# --- water & supplements (optional feature) ---------------------------------

DEFAULT_TRACKERS = (("Wasser", "ml", 2000, 250), ("Koffein", "mg", 400, 80), ("Kreatin", "g", 5, 5))


class TrackerIn(BaseModel):
    name: str
    unit: str = ""
    goal: float | None = None
    step: float = 1


class TrackerLogIn(BaseModel):
    amount: float


def ensure_trackers(c, owner: str):
    if c.execute("SELECT 1 FROM trackers WHERE owner=?", (owner,)).fetchone():
        return
    c.executemany("INSERT INTO trackers(owner,name,unit,goal,step,position) VALUES(?,?,?,?,?,?)",
                  [(owner, n, u, g, st, i) for i, (n, u, g, st) in enumerate(DEFAULT_TRACKERS)])


@app.get("/api/trackers")
def list_trackers(day: str, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    owner = user_from(x_remote_user_id)
    if not feature_on(owner, "trackers"):
        return []
    with db.conn() as c:
        ensure_trackers(c, owner)
        return [dict(r) for r in c.execute(
            "SELECT t.id, t.name, t.unit, t.goal, t.step, COALESCE(l.amount, 0) amount FROM trackers t"
            " LEFT JOIN tracker_log l ON l.tracker_id=t.id AND l.day=?"
            " WHERE t.owner=? ORDER BY t.position, t.id", (day, owner))]


@app.get("/api/trackers/stats")
def tracker_stats(days: int = 30, x_remote_user_id: str | None = Header(None)):
    """Per tracker: average per day, days with a log, days the goal was reached, over the last `days` days."""
    owner = user_from(x_remote_user_id)
    if not feature_on(owner, "trackers"):
        return []
    days = max(1, min(days, 3650))
    since = (datetime.now(timezone.utc).astimezone().date() - timedelta(days=days - 1)).isoformat()
    with db.conn() as c:
        ensure_trackers(c, owner)
        out = []
        for t in c.execute("SELECT id,name,unit,goal FROM trackers WHERE owner=? ORDER BY position,id", (owner,)).fetchall():
            amounts = [r["amount"] for r in c.execute(
                "SELECT amount FROM tracker_log WHERE tracker_id=? AND day>=? AND amount>0", (t["id"], since))]
            out.append({**dict(t), "days": days, "logged": len(amounts),
                        "avg": round(sum(amounts) / days, 1),
                        "reached": sum(1 for a in amounts if t["goal"] and a >= t["goal"])})
        return out


@app.post("/api/trackers")
def add_tracker(t: TrackerIn, x_remote_user_id: str | None = Header(None)):
    if not t.name.strip() or t.step <= 0:
        raise HTTPException(400, "name and step required")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        ensure_trackers(c, owner)
        pos = c.execute("SELECT COALESCE(MAX(position),-1)+1 FROM trackers WHERE owner=?", (owner,)).fetchone()[0]
        cur = c.execute("INSERT INTO trackers(owner,name,unit,goal,step,position) VALUES(?,?,?,?,?,?)",
                        (owner, t.name.strip(), t.unit.strip(), t.goal, t.step, pos))
        return {"id": cur.lastrowid}


@app.put("/api/trackers/{tid}")
def edit_tracker(tid: int, t: TrackerIn, x_remote_user_id: str | None = Header(None)):
    if not t.name.strip() or t.step <= 0:
        raise HTTPException(400, "name and step required")
    with db.conn() as c:
        c.execute("UPDATE trackers SET name=?, unit=?, goal=?, step=? WHERE id=? AND owner=?",
                  (t.name.strip(), t.unit.strip(), t.goal, t.step, tid, user_from(x_remote_user_id)))
    return {"ok": True}


@app.delete("/api/trackers/{tid}")
def del_tracker(tid: int, x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        if c.execute("SELECT 1 FROM trackers WHERE id=? AND owner=?", (tid, user_from(x_remote_user_id))).fetchone():
            c.execute("DELETE FROM tracker_log WHERE tracker_id=?", (tid,))
            c.execute("DELETE FROM trackers WHERE id=?", (tid,))
    return {"ok": True}


@app.put("/api/trackers/{tid}/log/{day}")
def set_tracker_log(tid: int, day: str, a: TrackerLogIn, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    with db.conn() as c:
        if not c.execute("SELECT 1 FROM trackers WHERE id=? AND owner=?", (tid, user_from(x_remote_user_id))).fetchone():
            raise HTTPException(404, "tracker not found")
        if a.amount <= 0:
            c.execute("DELETE FROM tracker_log WHERE tracker_id=? AND day=?", (tid, day))
        else:
            c.execute("INSERT OR REPLACE INTO tracker_log(tracker_id,day,amount) VALUES(?,?,?)", (tid, day, a.amount))
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


class SavedItemIn(BaseModel):
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


class SavedMealEdit(BaseModel):
    name: str
    category: str = ""
    items: list[SavedItemIn] | None = None   # replaces all components when given


class UseSavedIn(BaseModel):
    day: str
    meal_id: int | None = None
    time: str | None = None
    factor: float = 1


def saved_meal_rows(c, owner: str):
    out = []
    for m in c.execute("SELECT * FROM saved_meals WHERE owner=? ORDER BY name COLLATE NOCASE", (owner,)):
        items = [dict(i) for i in c.execute(
            "SELECT name, grams, kcal, protein, carbs, fat, fiber, sugar, salt, sat_fat FROM saved_meal_items"
            " WHERE saved_meal_id=? ORDER BY id", (m["id"],))]
        out.append({**dict(m), "items": items,
                    **{k: round(sum(i[k] for i in items), 1) for k in ("kcal", "protein", "carbs", "fat", *db.MICROS)}})
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
            "INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat)"
            " VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            [(cur.lastrowid, r["name"], r["grams"], r["kcal"], r["protein"], r["carbs"], r["fat"],
              *(r[m] for m in db.MICROS)) for r in rows])
        return {"id": cur.lastrowid}


@app.put("/api/saved-meals/{sid}")
def edit_saved(sid: int, s: SavedMealEdit, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if s.items is not None and not s.items:
        raise HTTPException(400, "Mahlzeit braucht mindestens eine Komponente")
    with db.conn() as c:
        c.execute("UPDATE saved_meals SET name=?, category=? WHERE id=? AND owner=?",
                  (s.name.strip(), s.category.strip(), sid, owner))
        if s.items is not None and c.execute("SELECT 1 FROM saved_meals WHERE id=? AND owner=?", (sid, owner)).fetchone():
            c.execute("DELETE FROM saved_meal_items WHERE saved_meal_id=?", (sid,))
            c.executemany(
                "INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [(sid, i.name, i.grams, i.kcal, i.protein, i.carbs, i.fat, i.fiber, i.sugar, i.salt, i.sat_fat) for i in s.items])
    return {"ok": True}


@app.post("/api/saved-meals/{sid}/copy")
def copy_saved(sid: int, x_remote_user_id: str | None = Header(None)):
    """Duplicate a saved meal as a starting point for a variant."""
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        m = c.execute("SELECT * FROM saved_meals WHERE id=? AND owner=?", (sid, owner)).fetchone()
        if not m:
            raise HTTPException(404, "saved meal not found")
        cur = c.execute("INSERT INTO saved_meals(owner,name,category) VALUES(?,?,?)",
                        (owner, f"{m['name']} (Kopie)", m["category"]))
        c.execute("INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat)"
                  " SELECT ?,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat FROM saved_meal_items WHERE saved_meal_id=? ORDER BY id",
                  (cur.lastrowid, sid))
        return {"id": cur.lastrowid}


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
    ids = []
    for i in c.execute("SELECT * FROM saved_meal_items WHERE saved_meal_id=? ORDER BY id", (sid,)).fetchall():
        ids.append(c.execute(
            "INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time)"
            " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (owner, day, meal_id, i["name"], i["grams"] * factor, i["kcal"] * factor,
             i["protein"] * factor, i["carbs"] * factor, i["fat"] * factor,
             *(i[m] * factor for m in db.MICROS), time)).lastrowid)
    return ids


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


def sensor_extras(owner: str) -> list:
    """More HA sensors: remaining kcal today, 7-day average, weight trend, estimated daily balance."""
    today = date.today()
    out = []
    with db.conn() as c:
        goal = get_goal(c, owner, today.isoformat())
        eaten = day_totals(c, owner, today.isoformat())["kcal"]
        week = [r["k"] for r in c.execute(
            "SELECT SUM(kcal) k FROM entries WHERE owner=? AND day>? AND day<=? GROUP BY day",
            (owner, (today - timedelta(days=7)).isoformat(), today.isoformat()))]
        weights = [(r["day"], r["kg"]) for r in c.execute("SELECT day, kg FROM weights WHERE owner=? ORDER BY day", (owner,))]
    if goal["kcal"]:
        out.append(("kcal_remaining", round(goal["kcal"] - eaten), "kcal"))
    if week:
        out.append(("kcal_week_avg", round(sum(week) / len(week)), "kcal"))
    if weights:
        tr, prev = None, None
        for day, kg in weights:
            d = date.fromisoformat(day)
            tr = kg if tr is None else tr + (1 - 0.9 ** max(1, (d - prev).days)) * (kg - tr)
            prev = d
        out.append(("weight_trend", round(tr, 1), "kg"))
    start = today - timedelta(days=29)
    with db.conn() as c:
        rows = {r["day"]: r["k"] for r in c.execute(
            "SELECT day, SUM(kcal) k FROM entries WHERE owner=? AND day>=? GROUP BY day", (owner, start.isoformat()))}
    days = [{"day": (start + timedelta(days=i)).isoformat(), "logged": (start + timedelta(days=i)).isoformat() in rows,
             "kcal": rows.get((start + timedelta(days=i)).isoformat(), 0)} for i in range(30)]
    b = energy_balance(owner, days)
    if b and b["balance"] is not None:
        out.append(("energy_balance", b["balance"], "kcal"))
    return out


# --- export ----------------------------------------------------------------

def dump(owner: str) -> dict:
    with db.conn() as c:
        q = lambda sql, *a: [dict(r) for r in c.execute(sql, a)]
        return {
            "app": "MyDietAssistant", "version": 1,
            "foods": [{**f, "portions": q("SELECT name,grams FROM food_portions WHERE food_id=? ORDER BY id", f["id"])}
                      for f in q("SELECT id,name,brand,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,serving_g,category,favorite,barcode FROM foods WHERE owner=?", owner)],
            "meals": q("SELECT id,name,position,archived,from_time,to_time FROM meals WHERE owner=? ORDER BY position", owner),
            "activity": get_pref(owner, "activity", {}),
            "activity_days": q("SELECT day,steps,kcal,manual FROM activity_days WHERE owner=? ORDER BY day", owner),
            "settings": {"diary_mode": get_pref(owner, "diary_mode", "meals"),
                         "goal_mode": get_pref(owner, "goal_mode", "lose"), "goal_rate": get_pref(owner, "goal_rate", 0.5),
                         "lang": get_pref(owner, "lang", "auto"), "units": get_pref(owner, "units", "metric"),
                         "mass": get_pref(owner, "mass", "g")},
            "entries": q("SELECT day,time,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat FROM entries WHERE owner=? ORDER BY day,id", owner),
            "goal": q("SELECT kcal,protein,carbs,fat,target_weight FROM goals WHERE owner=?", owner),
            "weights": q("SELECT day,kg FROM weights WHERE owner=? ORDER BY day", owner),
            "saved_meals": saved_meal_rows(c, owner),
            "hidden_categories": get_pref(owner, "hidden_categories", []),
            "features": features(owner),
            "goal_weekdays": q("SELECT wd,kcal,protein,carbs,fat FROM goal_weekdays WHERE owner=?", owner),
            "notes": q("SELECT day,meal_id,text FROM day_notes WHERE owner=?", owner),
            "recipes": [{**r, "items": q("SELECT name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat FROM recipe_items WHERE recipe_id=?", r["id"])}
                        for r in q("SELECT id,name,portions,cooked_g,category,food_id FROM recipes WHERE owner=?", owner)],
            "body_measures": q("SELECT day,name,value FROM body_measures WHERE owner=? ORDER BY day,name", owner),
            "goal_profiles": q("SELECT id,name,kcal,protein,carbs,fat FROM goal_profiles WHERE owner=?", owner),
            "day_profile": q("SELECT day,profile_id FROM day_profile WHERE owner=?", owner),
            "trackers": [{**t, "log": q("SELECT day,amount FROM tracker_log WHERE tracker_id=?", t["id"])}
                         for t in q("SELECT id,name,unit,goal,step,position FROM trackers WHERE owner=?", owner)],
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
        c.execute("DELETE FROM food_portions WHERE food_id IN (SELECT id FROM foods WHERE owner=?)", (owner,))
        for t in ("foods", "meals", "entries", "goals", "weights", "saved_meals"):
            if t == "saved_meals":
                c.execute("DELETE FROM saved_meal_items WHERE saved_meal_id IN"
                          " (SELECT id FROM saved_meals WHERE owner=?)", (owner,))
            c.execute(f"DELETE FROM {t} WHERE owner=?", (owner,))
        c.execute("DELETE FROM triggers WHERE owner=?", (owner,))
        c.execute("DELETE FROM goal_weekdays WHERE owner=?", (owner,))
        c.execute("DELETE FROM day_notes WHERE owner=?", (owner,))
        c.execute("DELETE FROM body_measures WHERE owner=?", (owner,))
        c.execute("DELETE FROM activity_days WHERE owner=?", (owner,))
        for a in d.get("activity_days", []):
            c.execute("INSERT OR REPLACE INTO activity_days(owner,day,steps,kcal,manual) VALUES(?,?,?,?,?)",
                      (owner, a["day"], a.get("steps", 0), a.get("kcal", 0), a.get("manual", 0)))
        c.execute("DELETE FROM recipe_items WHERE recipe_id IN (SELECT id FROM recipes WHERE owner=?)", (owner,))
        c.execute("DELETE FROM recipes WHERE owner=?", (owner,))
        for b in d.get("body_measures", []):
            c.execute("INSERT OR REPLACE INTO body_measures(owner,day,name,value) VALUES(?,?,?,?)", (owner, b["day"], b["name"], b["value"]))
        c.execute("DELETE FROM goal_profiles WHERE owner=?", (owner,))
        c.execute("DELETE FROM day_profile WHERE owner=?", (owner,))
        c.execute("DELETE FROM tracker_log WHERE tracker_id IN (SELECT id FROM trackers WHERE owner=?)", (owner,))
        c.execute("DELETE FROM trackers WHERE owner=?", (owner,))
        for g in d.get("goal_weekdays", []):
            c.execute("INSERT INTO goal_weekdays(owner,wd,kcal,protein,carbs,fat) VALUES(?,?,?,?,?,?)",
                      (owner, g["wd"], g["kcal"], g.get("protein", 0), g.get("carbs", 0), g.get("fat", 0)))
        for t in d.get("trackers", []):
            tid = c.execute("INSERT INTO trackers(owner,name,unit,goal,step,position) VALUES(?,?,?,?,?,?)",
                            (owner, t["name"], t.get("unit", ""), t.get("goal"), t.get("step", 1),
                             t.get("position", 0))).lastrowid
            for l in t.get("log", []):
                c.execute("INSERT INTO tracker_log(tracker_id,day,amount) VALUES(?,?,?)", (tid, l["day"], l["amount"]))
        fmap = {}
        for f in d.get("foods", []):
            fid = fmap[f.get("id")] = c.execute("INSERT INTO foods(owner,name,brand,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,serving_g,category,favorite,barcode)"
                            " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            (owner, f["name"], f.get("brand", ""), f["kcal"], f.get("protein", 0),
                             f.get("carbs", 0), f.get("fat", 0), *(f.get(m, 0) for m in db.MICROS),
                             f.get("serving_g", 100), f.get("category", ""), f.get("favorite", 0), f.get("barcode", ""))).lastrowid
            for p in f.get("portions", []):
                c.execute("INSERT INTO food_portions(food_id,name,grams) VALUES(?,?,?)", (fid, p["name"], p["grams"]))
        for r in d.get("recipes", []):
            rid = c.execute("INSERT INTO recipes(owner,name,portions,cooked_g,category,food_id) VALUES(?,?,?,?,?,?)",
                            (owner, r["name"], r["portions"], r.get("cooked_g"), r.get("category", ""), fmap.get(r.get("food_id")))).lastrowid
            for i in r.get("items", []):
                c.execute("INSERT INTO recipe_items(recipe_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                          (rid, i["name"], i["grams"], i["kcal"], i.get("protein", 0), i.get("carbs", 0), i.get("fat", 0), *(i.get(m, 0) for m in db.MICROS)))
        mmap = {}
        for m in d.get("meals", []):
            mmap[m["id"]] = c.execute("INSERT INTO meals(owner,name,position,archived,from_time,to_time) VALUES(?,?,?,?,?,?)",
                                      (owner, m["name"], m["position"], m.get("archived", 0), m.get("from_time", ""), m.get("to_time", ""))).lastrowid
        for e in d.get("entries", []):
            if e["meal_id"] in mmap:
                c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time)"
                          " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                          (owner, e["day"], mmap[e["meal_id"]], e["name"], e["grams"], e["kcal"],
                           e["protein"], e["carbs"], e["fat"], *(e.get(m, 0) for m in db.MICROS), e.get("time")))
        for g in d.get("goal", []):
            c.execute("INSERT INTO goals(owner,kcal,protein,carbs,fat,target_weight) VALUES(?,?,?,?,?,?)",
                      (owner, g["kcal"], g["protein"], g["carbs"], g["fat"], g.get("target_weight")))
        for w in d.get("weights", []):
            c.execute("INSERT INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, w["day"], w["kg"]))
        for s in d.get("saved_meals", []):
            sid = c.execute("INSERT INTO saved_meals(owner,name,category) VALUES(?,?,?)",
                            (owner, s["name"], s.get("category", ""))).lastrowid
            for i in s.get("items", []):
                c.execute("INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat)"
                          " VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                          (sid, i["name"], i["grams"], i["kcal"], i["protein"], i["carbs"], i["fat"],
                           *(i.get(m, 0) for m in db.MICROS)))
        pmap = {}
        for p in d.get("goal_profiles", []):
            pmap[p["id"]] = c.execute("INSERT INTO goal_profiles(owner,name,kcal,protein,carbs,fat) VALUES(?,?,?,?,?,?)",
                                      (owner, p["name"], p["kcal"], p.get("protein", 0), p.get("carbs", 0), p.get("fat", 0))).lastrowid
        for dp in d.get("day_profile", []):
            if dp["profile_id"] in pmap:
                c.execute("INSERT OR REPLACE INTO day_profile(owner,day,profile_id) VALUES(?,?,?)", (owner, dp["day"], pmap[dp["profile_id"]]))
        for n in d.get("notes", []):
            mid = 0 if not n["meal_id"] else mmap.get(n["meal_id"])
            if mid is not None:
                c.execute("INSERT OR REPLACE INTO day_notes(owner,day,meal_id,text) VALUES(?,?,?,?)",
                          (owner, n["day"], mid, n["text"]))
    set_pref(owner, "hidden_categories", d.get("hidden_categories", []))
    set_pref(owner, "diary_mode", d.get("settings", {}).get("diary_mode", "meals"))
    if d.get("settings", {}).get("lang") in ("auto", "de", "en"):
        set_pref(owner, "lang", d["settings"]["lang"])
    if d.get("settings", {}).get("units") in ("metric", "imperial"):
        set_pref(owner, "units", d["settings"]["units"])
    if d.get("settings", {}).get("mass") in ("g", "oz"):
        set_pref(owner, "mass", d["settings"]["mass"])
    if d.get("settings", {}).get("goal_mode") in GOAL_MODES:
        set_pref(owner, "goal_mode", d["settings"]["goal_mode"])
        set_pref(owner, "goal_rate", d["settings"].get("goal_rate", 0.5))
    if "features" in d:
        set_pref(owner, "features", d["features"])
    if isinstance(d.get("activity"), dict):
        set_pref(owner, "activity", d["activity"])
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

class ExtraCond(BaseModel):
    kind: str = "state"             # 'state' | 'calendar'
    entity: str
    match: str = ""
    negate: bool = False


class TriggerIn(BaseModel):
    kind: str                       # 'state' | 'calendar' | 'time'
    entity: str = ""
    match: str = ""
    meal_id: int | None = None
    saved_meal_id: int | None = None
    food_id: int | None = None
    profile_id: int | None = None   # action: switch the day to a goal profile instead of adding food
    extra: list[ExtraCond] = []     # further conditions, combined with the main one
    combine: str = "and"            # 'and' | 'or'
    grams: float | None = None
    enabled: bool = True
    negate: bool = False
    days_ahead: int = 0             # calendar triggers: also fill the next N days
    part: str = "any"               # calendar triggers: 'any' day of the event | 'start' day | 'end' day
    hold_min: int = 0               # state triggers: only after the state lasted this many minutes
    win_from: str = ""              # only between these times of day (HH:MM, either may be empty)
    win_to: str = ""


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
        elif t["profile_id"]:
            r = c.execute("SELECT name FROM goal_profiles WHERE id=?", (t["profile_id"],)).fetchone()
            label = f"Tagesziel „{r['name']}“" if r else None
        m = c.execute("SELECT name FROM meals WHERE id=?", (t["meal_id"],)).fetchone()
        last = c.execute("SELECT MAX(day) d FROM trigger_log WHERE trigger_id=?", (t["id"],)).fetchone()["d"]
        rows.append({**dict(t), "enabled": bool(t["enabled"]), "item": label, "extra": json.loads(t["extra"] or "[]"),
                     "meal": m["name"] if m else None, "last_run": last})
    return rows


def check_trigger_body(c, owner: str, t: TriggerIn):
    if t.kind not in ("state", "calendar", "time"):
        raise HTTPException(400, "kind must be state, calendar or time")
    if t.part not in ("any", "start", "end"):
        raise HTTPException(400, "part must be any, start or end")
    if t.kind == "time":
        if not check_time(t.match.strip()):
            raise HTTPException(400, "Uhrzeit (HH:MM) erforderlich")
    elif not t.entity.strip():
        raise HTTPException(400, "entity required")
    check_time(t.win_from.strip())
    check_time(t.win_to.strip())
    if t.hold_min < 0:
        raise HTTPException(400, "hold_min must be >= 0")
    if sum(bool(x) for x in (t.saved_meal_id, t.food_id, t.profile_id)) != 1:
        raise HTTPException(400, "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben")
    if t.profile_id:
        if not c.execute("SELECT 1 FROM goal_profiles WHERE id=? AND owner=?", (t.profile_id, owner)).fetchone():
            raise HTTPException(404, "profile not found")
    elif not c.execute("SELECT 1 FROM meals WHERE id=? AND owner=?", (t.meal_id, owner)).fetchone():
        raise HTTPException(404, "meal not found")
    if t.combine not in ("and", "or"):
        raise HTTPException(400, "combine must be and or or")
    for x in t.extra:
        if x.kind not in ("state", "calendar") or not x.entity.strip():
            raise HTTPException(400, "weitere Bedingung: Art und Entität erforderlich")


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
            "INSERT INTO triggers(owner,kind,entity,match,meal_id,saved_meal_id,food_id,grams,enabled,negate,days_ahead,part,"
            "hold_min,win_from,win_to,profile_id,extra,combine) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (owner, t.kind, t.entity.strip(), t.match.strip(), t.meal_id or 0, t.saved_meal_id, t.food_id,
             t.grams, int(t.enabled), int(t.negate), 0 if t.kind != "calendar" else max(0, min(t.days_ahead, 60)), t.part,
             t.hold_min if t.kind == "state" else 0, t.win_from.strip(), t.win_to.strip(),
             t.profile_id, json.dumps([x.model_dump() for x in t.extra]), t.combine))
        return {"id": cur.lastrowid}


@app.put("/api/triggers/{tid}")
def edit_trigger(tid: int, t: TriggerIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        check_trigger_body(c, owner, t)
        c.execute("UPDATE triggers SET kind=?,entity=?,match=?,meal_id=?,saved_meal_id=?,food_id=?,"
                  "grams=?,enabled=?,negate=?,days_ahead=?,part=?,hold_min=?,win_from=?,win_to=?,profile_id=?,extra=?,"
                  "combine=? WHERE id=? AND owner=?",
                  (t.kind, t.entity.strip(), t.match.strip(), t.meal_id or 0, t.saved_meal_id, t.food_id,
                   t.grams, int(t.enabled), int(t.negate), 0 if t.kind != "calendar" else max(0, min(t.days_ahead, 60)), t.part,
                   t.hold_min if t.kind == "state" else 0, t.win_from.strip(), t.win_to.strip(),
                   t.profile_id, json.dumps([x.model_dump() for x in t.extra]), t.combine, tid, owner))
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
    ids, label = [], ""
    if t["saved_meal_id"]:
        ids = add_saved_to_diary(c, owner, t["saved_meal_id"], day, t["meal_id"], time=stamp)
        r = c.execute("SELECT name FROM saved_meals WHERE id=?", (t["saved_meal_id"],)).fetchone()
        label = r["name"] if r else ""
    elif t["food_id"]:
        f = c.execute("SELECT * FROM foods WHERE id=? AND owner=?", (t["food_id"], owner)).fetchone()
        if not f:
            return
        g = t["grams"] or f["serving_g"] or 100
        k = g / 100
        ids.append(c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time)"
                             " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                             (owner, day, t["meal_id"], f["name"], g, f["kcal"] * k, f["protein"] * k,
                              f["carbs"] * k, f["fat"] * k, *(f[m] * k for m in db.MICROS), stamp)).lastrowid)
        label = f["name"]
    elif t["profile_id"]:
        p = c.execute("SELECT name FROM goal_profiles WHERE id=? AND owner=?", (t["profile_id"], owner)).fetchone()
        if not p:
            return
        c.execute("INSERT OR REPLACE INTO day_profile(owner,day,profile_id) VALUES(?,?,?)", (owner, day, t["profile_id"]))
        label = f"Tagesziel „{p['name']}“"
    c.execute("INSERT OR IGNORE INTO trigger_log(trigger_id, day) VALUES(?,?)", (t["id"], day))
    c.execute("INSERT INTO trigger_runs(owner,trigger_id,label,day,ts,entry_ids,profile_id) VALUES(?,?,?,?,?,?,?)",
              (owner, t["id"], label, day, datetime.now().strftime("%Y-%m-%d %H:%M"), json.dumps(ids), t["profile_id"]))
    c.execute("DELETE FROM trigger_runs WHERE owner=? AND id NOT IN"
              " (SELECT id FROM trigger_runs WHERE owner=? ORDER BY id DESC LIMIT 200)", (owner, owner))


@app.get("/api/trigger-runs")
def trigger_runs(limit: int = 30, x_remote_user_id: str | None = Header(None)):
    """History of what triggers entered (newest first), with the trigger's condition for context."""
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        rows = c.execute(
            "SELECT r.*, t.kind, t.entity, t.match, t.negate FROM trigger_runs r"
            " LEFT JOIN triggers t ON t.id=r.trigger_id WHERE r.owner=? ORDER BY r.id DESC LIMIT ?",
            (owner, max(1, min(limit, 200)))).fetchall()
        out = []
        for r in rows:
            ids = json.loads(r["entry_ids"])
            alive = [i for i in ids if c.execute("SELECT 1 FROM entries WHERE id=? AND owner=?", (i, owner)).fetchone()]
            if r["profile_id"] and c.execute("SELECT 1 FROM day_profile WHERE owner=? AND day=? AND profile_id=?",
                                             (owner, r["day"], r["profile_id"])).fetchone():
                alive = [0]
            out.append({**{k: r[k] for k in ("id", "label", "day", "ts", "kind", "entity", "match", "negate")},
                        "undone": bool(r["undone"]), "entries": len(alive)})
        return out


@app.post("/api/trigger-runs/{rid}/undo")
def undo_trigger_run(rid: int, x_remote_user_id: str | None = Header(None),
                     x_remote_user_display_name: str | None = Header(None)):
    """Remove the entries a trigger run created. The trigger will not fire again for that day."""
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        r = c.execute("SELECT * FROM trigger_runs WHERE id=? AND owner=?", (rid, owner)).fetchone()
        if not r:
            raise HTTPException(404, "run not found")
        for i in json.loads(r["entry_ids"]):
            c.execute("DELETE FROM entries WHERE id=? AND owner=?", (i, owner))
        if r["profile_id"]:
            c.execute("DELETE FROM day_profile WHERE owner=? AND day=? AND profile_id=?", (owner, r["day"], r["profile_id"]))
        c.execute("UPDATE trigger_runs SET undone=1 WHERE id=?", (rid,))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


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


def in_window(t, now: datetime) -> bool:
    """Is the current time inside the trigger's optional time-of-day window (may span midnight)?"""
    a, b = t["win_from"], t["win_to"]
    cur = now.strftime("%H:%M")
    if a and b:
        return a <= cur <= b if a <= b else (cur >= a or cur <= b)
    return (cur >= a) if a else (cur <= b if b else True)


def condition_met(t, now: datetime, day: str | None = None) -> bool:
    """Does the rule apply (now, or for the given day)? With t['negate'] the condition is inverted."""
    neg = bool(t["negate"])
    part = t["part"] if t["kind"] == "calendar" else "any"
    if day and day != now.date().isoformat():  # calendar day in the future: any matching event counts
        return calendar_has_event(t["entity"], t["match"], day, part) != neg
    if not in_window(t, now):
        return False
    if t["kind"] == "time":
        return now.strftime("%H:%M") >= t["match"].strip()
    if t["kind"] == "state":
        s = ha_get(f"states/{t['entity']}")
        st = s["state"]
        want = t["match"].strip().lower()
        ok = (st.lower() == want if want else st.lower() in ("on", "home", "true")) != neg
        if ok and t["hold_min"]:  # the state must have lasted for a while (e.g. at the gym for 20 minutes)
            since = datetime.fromisoformat(s["last_changed"].replace("Z", "+00:00"))
            ok = (datetime.now(timezone.utc) - since).total_seconds() >= t["hold_min"] * 60
        return ok
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


def trigger_met(t, now: datetime, day: str | None = None) -> bool:
    """Main condition plus optional extra conditions (all must hold with combine 'and', one suffices with 'or')."""
    extra = json.loads(t["extra"] or "[]")
    base = {**dict(t), "win_from": "", "win_to": ""}
    if not extra:
        return condition_met(t, now, day)
    if (day is None or day == now.date().isoformat()) and not in_window(t, now):
        return False
    future = bool(day) and day != now.date().isoformat()
    results = []
    for c in [base] + [{**base, "kind": x["kind"], "entity": x["entity"], "match": x.get("match", ""),
                        "negate": int(x.get("negate", False)), "part": "any", "hold_min": 0} for x in extra]:
        # for a day ahead only calendar conditions can be judged
        results.append(False if future and c["kind"] != "calendar" else condition_met(c, now, day))
    return any(results) if t["combine"] == "or" else all(results)


poll_state = {"token": bool(SUPERVISOR_TOKEN), "last": None, "log": [], "error": None}


def note(msg: str):
    line = f"{datetime.now():%H:%M:%S} {msg}"
    print("[trigger] " + line, flush=True)
    poll_state["log"] = (poll_state["log"] + [line])[-30:]


def poll_triggers():
    now = datetime.now()
    poll_state["last"] = now.strftime("%Y-%m-%d %H:%M:%S")
    day = now.date().isoformat()
    with db.conn() as c:
        triggers = c.execute("SELECT * FROM triggers WHERE enabled=1 AND paused_until < ?", (day,)).fetchall()
        done = {(r["trigger_id"], r["day"]) for r in c.execute("SELECT trigger_id, day FROM trigger_log WHERE day>=?", (day,))}
    errors = []
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
            if not trigger_met(t, now, d):
                continue
        except (httpx.HTTPError, ValueError, KeyError) as e:
            note(f"Trigger {t['id']} ({t['entity']}, {d}): Fehler {e!r}")
            errors.append(f"{t['entity'] or 'Uhrzeit'}: {e}")
            continue
        with db.conn() as c:
            fire(c, t, d)
        note(f"Trigger {t['id']} ({t['entity']}): für {d} eingetragen")
        publish(t["owner"], get_pref(t["owner"], "display", t["owner"]))
    poll_state["error"] = {"ts": now.strftime("%Y-%m-%d %H:%M"), "msg": errors[-1]} if errors else None


def trigger_loop():
    time.sleep(5)
    while True:
        try:
            poll_triggers()
        except Exception as e:  # keep the loop alive whatever HA does
            note(f"Abfrage fehlgeschlagen: {e!r}")
            poll_state["error"] = {"ts": datetime.now().strftime("%Y-%m-%d %H:%M"), "msg": str(e)}
        time.sleep(60)


@app.get("/api/triggers/status")
def trigger_status():
    return poll_state


class ProfileIn(BaseModel):
    name: str
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0


@app.get("/api/goal-profiles")
def list_profiles(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return [dict(r) for r in c.execute("SELECT id,name,kcal,protein,carbs,fat FROM goal_profiles WHERE owner=? ORDER BY id",
                                           (user_from(x_remote_user_id),))]


@app.post("/api/goal-profiles")
def add_profile(p: ProfileIn, x_remote_user_id: str | None = Header(None)):
    if not p.name.strip() or p.kcal <= 0:
        raise HTTPException(400, "Name und Kalorien erforderlich")
    with db.conn() as c:
        return {"id": c.execute("INSERT INTO goal_profiles(owner,name,kcal,protein,carbs,fat) VALUES(?,?,?,?,?,?)",
                                (user_from(x_remote_user_id), p.name.strip(), p.kcal, p.protein, p.carbs, p.fat)).lastrowid}


@app.put("/api/goal-profiles/{pid}")
def edit_profile(pid: int, p: ProfileIn, x_remote_user_id: str | None = Header(None)):
    if not p.name.strip() or p.kcal <= 0:
        raise HTTPException(400, "Name und Kalorien erforderlich")
    with db.conn() as c:
        c.execute("UPDATE goal_profiles SET name=?,kcal=?,protein=?,carbs=?,fat=? WHERE id=? AND owner=?",
                  (p.name.strip(), p.kcal, p.protein, p.carbs, p.fat, pid, user_from(x_remote_user_id)))
    return {"ok": True}


@app.delete("/api/goal-profiles/{pid}")
def del_profile(pid: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        if c.execute("SELECT 1 FROM goal_profiles WHERE id=? AND owner=?", (pid, owner)).fetchone():
            c.execute("DELETE FROM triggers WHERE profile_id=? AND owner=?", (pid, owner))
            c.execute("DELETE FROM day_profile WHERE profile_id=? AND owner=?", (pid, owner))
            c.execute("DELETE FROM goal_profiles WHERE id=?", (pid,))
    return {"ok": True}


class PauseIn(BaseModel):
    until: str = ""      # last paused day (YYYY-MM-DD); empty = resume


@app.put("/api/triggers/{tid}/pause")
def pause_trigger(tid: int, p: PauseIn, x_remote_user_id: str | None = Header(None)):
    """Pause a trigger up to and including a day, without touching its enabled switch."""
    if p.until:
        check_day(p.until)
    with db.conn() as c:
        c.execute("UPDATE triggers SET paused_until=? WHERE id=? AND owner=?", (p.until, tid, user_from(x_remote_user_id)))
    return {"ok": True}


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


# --- period report / comparison ----------------------------------------------

def period_report(c, owner: str, start: date, end: date) -> dict:
    """Averages, goal hits, best/worst day and weight change for the days start..end (inclusive)."""
    n = (end - start).days + 1
    mode = get_pref(owner, "goal_mode", "lose")
    rows = {r["day"]: dict(r) for r in c.execute(
        "SELECT day, SUM(kcal) kcal, SUM(protein) protein, SUM(carbs) carbs, SUM(fat) fat FROM entries"
        " WHERE owner=? AND day BETWEEN ? AND ? GROUP BY day", (owner, start.isoformat(), end.isoformat()))}
    logged = []
    with pref_cache():
        for d, r in sorted(rows.items()):
            g = get_goal(c, owner, d)
            logged.append({**r, "goal_kcal": g["kcal"], "goal_protein": g["protein"]})
    avg = lambda k: round(sum(r[k] for r in logged) / len(logged), 1) if logged else 0
    with_goal = [r for r in logged if r["goal_kcal"]]
    best = min(with_goal, key=lambda r: abs(r["kcal"] - r["goal_kcal"]), default=None)
    worst = max(with_goal, key=lambda r: abs(r["kcal"] - r["goal_kcal"]), default=None)
    w = c.execute("SELECT day, kg FROM weights WHERE owner=? AND day BETWEEN ? AND ? ORDER BY day",
                  (owner, start.isoformat(), end.isoformat())).fetchall()
    pick = lambda r: {"day": r["day"], "kcal": round(r["kcal"]), "goal": round(r["goal_kcal"])} if r else None
    return {
        "from": start.isoformat(), "to": end.isoformat(), "days": n, "logged": len(logged),
        "kcal": avg("kcal"), "protein": avg("protein"), "carbs": avg("carbs"), "fat": avg("fat"),
        "goal_kcal": round(sum(r["goal_kcal"] for r in logged) / len(logged)) if logged else 0,
        "protein_days": sum(1 for r in logged if r["goal_protein"] and r["protein"] >= r["goal_protein"]),
        "protein_goal_days": sum(1 for r in logged if r["goal_protein"]),
        "kcal_days": sum(1 for r in with_goal if goal_hit(mode, r["kcal"], r["goal_kcal"])),
        "kcal_goal_days": len(with_goal),
        "best": pick(best), "worst": pick(worst),
        "weight_change": round(w[-1]["kg"] - w[0]["kg"], 1) if len(w) > 1 else None,
        "weights": len(w),
    }


@app.get("/api/report")
def report(a_from: str, a_to: str, b_from: str | None = None, b_to: str | None = None,
           x_remote_user_id: str | None = Header(None)):
    """Report for period A and, if given, period B (for comparison)."""
    for d in (a_from, a_to, b_from, b_to):
        if d:
            check_day(d)
    owner = user_from(x_remote_user_id)
    spans = [(a_from, a_to)] + ([(b_from, b_to)] if b_from and b_to else [])
    out = []
    for f, t in spans:
        s, e = date.fromisoformat(f), date.fromisoformat(t)
        if e < s or (e - s).days > 3650:
            raise HTTPException(400, "ungültiger Zeitraum")
        with db.conn() as c:
            out.append(period_report(c, owner, s, e))
    return out


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
            c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time)"
                      " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      (owner, cp.day, meal_id, e["name"], e["grams"] * k, e["kcal"] * k, e["protein"] * k,
                       e["carbs"] * k, e["fat"] * k, *(e[m] * k for m in db.MICROS),
                       check_time(cp.time) if cp.time else e["time"]))
            n += 1
    publish(owner, x_remote_user_display_name or owner)
    return {"copied": n}


class DayCopyIn(BaseModel):
    to_day: str
    factor: float = 1


@app.post("/api/day/{day}/copy")
def copy_day(day: str, cp: DayCopyIn, x_remote_user_id: str | None = Header(None),
             x_remote_user_display_name: str | None = Header(None)):
    """Copy all entries of a day to another day, keeping meal and time."""
    check_day(day)
    check_day(cp.to_day)
    if cp.factor <= 0:
        raise HTTPException(400, "factor must be > 0")
    if day == cp.to_day:
        raise HTTPException(400, "Quell- und Zieltag sind gleich")
    owner = user_from(x_remote_user_id)
    k = cp.factor
    with db.conn() as c:
        rows = c.execute("SELECT * FROM entries WHERE owner=? AND day=? ORDER BY id", (owner, day)).fetchall()
        c.executemany(
            "INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [(owner, cp.to_day, r["meal_id"], r["name"], r["grams"] * k, r["kcal"] * k, r["protein"] * k,
              r["carbs"] * k, r["fat"] * k, *(r[m] * k for m in db.MICROS), r["time"]) for r in rows])
    publish(owner, x_remote_user_display_name or owner)
    return {"copied": len(rows)}


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
        rule = {**dict(t), "win_from": "", "win_to": "", "hold_min": 0}  # meal rules have no window / hold time
        if day == date.today().isoformat() and condition_met(rule, datetime.now()):
            c.execute("INSERT OR IGNORE INTO meal_trigger_log VALUES(?,?)", (t["id"], day))
            return True
        return False
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
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
