"""v1.0: activity-based calorie budget (optional feature "activity"), meal schedule (optional feature "schedule")
and the local cache of online food lookups."""
import re
from datetime import date, datetime, timedelta

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from extras import feature_on, get_pref, ha_get, set_pref
from extras2 import owners
from main import GOAL_HOOKS, SENSOR_HOOKS, SUPERVISOR_TOKEN, app, check_day, check_time, publish, user_from


# --- activity ------------------------------------------------------------------

DEFAULT_ACTIVITY = {"steps_entity": "", "kcal_entity": "", "share": 50, "stride_kcal": 0.0005}   # share = % of burned kcal added to the budget


def activity_config(owner: str) -> dict:
    return {**DEFAULT_ACTIVITY, **(get_pref(owner, "activity", {}) or {})}


def latest_kg(c, owner: str) -> float:
    r = c.execute("SELECT kg FROM weights WHERE owner=? ORDER BY day DESC LIMIT 1", (owner,)).fetchone()
    return r["kg"] if r else 70.0


def burned(c, owner: str, day: str, cfg: dict | None = None) -> dict:
    """Steps and burned kcal of a day; without a kcal value, steps * weight * factor estimates it."""
    cfg = cfg or activity_config(owner)
    r = c.execute("SELECT steps, kcal, manual FROM activity_days WHERE owner=? AND day=?", (owner, day)).fetchone()
    steps, kcal, manual = (r["steps"], r["kcal"], bool(r["manual"])) if r else (0.0, 0.0, False)
    est = False
    if not kcal and steps:
        kcal, est = steps * latest_kg(c, owner) * cfg["stride_kcal"], True
    return {"steps": round(steps), "kcal": round(kcal), "estimated": est, "manual": manual}


def bonus_for(c, owner: str, day: str) -> tuple[int, dict]:
    cfg = activity_config(owner)
    b = burned(c, owner, day, cfg)
    return round(b["kcal"] * cfg["share"] / 100), b


def goal_hook(c, owner: str, day: str, g: dict):
    if not feature_on(owner, "activity"):
        return
    bonus, b = bonus_for(c, owner, day)
    g["activity_kcal"], g["activity_bonus"] = b["kcal"], bonus
    if bonus:
        g["kcal"] = g["kcal"] + bonus


GOAL_HOOKS.append(goal_hook)


class ActivityConfigIn(BaseModel):
    steps_entity: str = ""
    kcal_entity: str = ""
    share: float = 50
    stride_kcal: float = 0.0005


class ActivityDayIn(BaseModel):
    steps: float = 0
    kcal: float = 0


@app.get("/api/activity")
def get_activity(day: str, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        bonus, b = bonus_for(c, owner, day)
    return {**b, "bonus": bonus, "config": activity_config(owner)}


@app.put("/api/activity/config")
def put_activity_config(a: ActivityConfigIn, x_remote_user_id: str | None = Header(None)):
    for e in (a.steps_entity, a.kcal_entity):
        if e and not re.fullmatch(r"[a-z_]+\.[a-z0-9_]+", e):
            raise HTTPException(400, "Ungültige Entität")
    set_pref(user_from(x_remote_user_id), "activity", {
        "steps_entity": a.steps_entity, "kcal_entity": a.kcal_entity,
        "share": max(0.0, min(float(a.share), 100.0)), "stride_kcal": max(0.0001, min(float(a.stride_kcal), 0.002))})
    return {"ok": True}


@app.put("/api/activity/{day}")
def put_activity_day(day: str, a: ActivityDayIn, x_remote_user_id: str | None = Header(None)):
    """Type in a day by hand (it is then no longer overwritten by the sensors)."""
    check_day(day)
    if a.steps < 0 or a.kcal < 0 or a.steps > 200000 or a.kcal > 20000:
        raise HTTPException(400, "Wert außerhalb des Bereichs")
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO activity_days(owner,day,steps,kcal,manual) VALUES(?,?,?,?,1)",
                  (user_from(x_remote_user_id), day, a.steps, a.kcal))
    return {"ok": True}


@app.delete("/api/activity/{day}")
def del_activity_day(day: str, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    with db.conn() as c:
        c.execute("DELETE FROM activity_days WHERE owner=? AND day=?", (user_from(x_remote_user_id), day))
    return {"ok": True}


def sensor_value(entity: str) -> float | None:
    try:
        v = float(ha_get(f"states/{entity}")["state"])
    except (httpx.HTTPError, ValueError, KeyError, TypeError):
        return None
    return v if v >= 0 else None


def sync_activity_for(owner: str) -> dict:
    """Read today's values from the configured HA sensors. They are daily sensors that reset at midnight,
    so the highest value seen during a day is the day's total."""
    cfg = activity_config(owner)
    today = date.today().isoformat()
    got = {}
    for key, entity in (("steps", cfg["steps_entity"]), ("kcal", cfg["kcal_entity"])):
        if entity and SUPERVISOR_TOKEN:
            v = sensor_value(entity)
            if v is not None:
                got[key] = v
    if got:
        with db.conn() as c:
            r = c.execute("SELECT steps, kcal, manual FROM activity_days WHERE owner=? AND day=?", (owner, today)).fetchone()
            if not (r and r["manual"]):
                steps = max(got.get("steps", 0), r["steps"] if r else 0)
                kcal = max(got.get("kcal", 0), r["kcal"] if r else 0)
                c.execute("INSERT OR REPLACE INTO activity_days(owner,day,steps,kcal,manual) VALUES(?,?,?,?,0)", (owner, today, steps, kcal))
    with db.conn() as c:
        return burned(c, owner, today, cfg)


@app.post("/api/activity/sync")
def sync_activity_now(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if not SUPERVISOR_TOKEN:
        raise HTTPException(503, "Nur im Home-Assistant-Add-on möglich")
    return sync_activity_for(owner)


def daily_max(history: list) -> dict[str, float]:
    """Highest value per local day from a HA history response (list of state changes of one daily sensor)."""
    out = {}
    for row in history:
        try:
            v = float(row["state"])
            day = datetime.fromisoformat(row["last_changed"].replace("Z", "+00:00")).astimezone().date().isoformat()
        except (KeyError, ValueError, TypeError):
            continue   # "unavailable", "unknown", malformed rows
        if v >= 0:
            out[day] = max(out.get(day, 0), v)
    return out


def backfill_activity_for(owner: str, days: int) -> int:
    """Fill past days from the HA history database (the sensors only get collected from switching the feature on otherwise).
    Days with manual values stay untouched; returns the number of days written."""
    cfg = activity_config(owner)
    start = datetime.now().astimezone() - timedelta(days=days)
    per_day: dict[str, dict] = {}
    for key, entity in (("steps", cfg["steps_entity"]), ("kcal", cfg["kcal_entity"])):
        if not entity:
            continue
        data = ha_get(f"history/period/{start.isoformat()}", filter_entity_id=entity, minimal_response="", no_attributes="")
        for day, v in daily_max(data[0] if data else []).items():
            per_day.setdefault(day, {})[key] = v
    n = 0
    with db.conn() as c:
        for day, got in per_day.items():
            r = c.execute("SELECT steps, kcal, manual FROM activity_days WHERE owner=? AND day=?", (owner, day)).fetchone()
            if r and r["manual"]:
                continue
            steps = max(got.get("steps", 0), r["steps"] if r else 0)
            kcal = max(got.get("kcal", 0), r["kcal"] if r else 0)
            c.execute("INSERT OR REPLACE INTO activity_days(owner,day,steps,kcal,manual) VALUES(?,?,?,?,0)", (owner, day, steps, kcal))
            n += 1
    return n


@app.post("/api/activity/backfill")
def backfill_activity(days: int = 30, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if not SUPERVISOR_TOKEN:
        raise HTTPException(503, "Nur im Home-Assistant-Add-on möglich")
    if not 1 <= days <= 365:
        raise HTTPException(400, "Zeitraum: 1 bis 365 Tage")
    cfg = activity_config(owner)
    if not (cfg["steps_entity"] or cfg["kcal_entity"]):
        raise HTTPException(400, "Zuerst einen Sensor für Schritte oder Kalorien wählen")
    try:
        return {"days": backfill_activity_for(owner, days)}
    except httpx.HTTPError:
        raise HTTPException(502, "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)")


tick = {"n": 0}


def sync_activity():
    tick["n"] += 1
    if tick["n"] % 5:   # the maintenance loop runs every minute, sensors are read every five
        return
    for o in owners():
        if feature_on(o, "activity"):
            sync_activity_for(o)


# --- meal schedule -------------------------------------------------------------

DEFAULT_WINDOWS = {"frühstück": ("05:00", "10:30"), "mittagessen": ("11:00", "14:30"), "abendessen": ("17:00", "21:00")}


def minutes(t: str) -> int:
    return int(t[:2]) * 60 + int(t[3:5])


def in_range(now: int, a: str, b: str) -> bool:
    x, y = minutes(a), minutes(b)
    return x <= now < y if x <= y else (now >= x or now < y)   # a window may run over midnight


def window_of(m: dict) -> tuple[str, str] | None:
    if m["from_time"] and m["to_time"]:
        return m["from_time"], m["to_time"]
    return DEFAULT_WINDOWS.get(m["name"].strip().lower())


def schedule(owner: str, now: datetime | None = None) -> dict:
    """Which meal is due now: the one whose window contains the time, else the next one starting today."""
    now = now or datetime.now()
    nm = now.hour * 60 + now.minute
    day = now.date().isoformat()
    with db.conn() as c:
        db.ensure_meals(c, owner)
        meals = [dict(r) for r in c.execute("SELECT id, name, from_time, to_time FROM meals WHERE owner=? AND archived=0 ORDER BY position", (owner,))]
        counts = {r["meal_id"]: r["n"] for r in c.execute("SELECT meal_id, COUNT(*) n FROM entries WHERE owner=? AND day=? GROUP BY meal_id", (owner, day))}
    current, upcoming = None, None
    for m in meals:
        w = window_of(m)
        m["window"] = list(w) if w else None
        m["logged"] = counts.get(m["id"], 0)
        if w and current is None and in_range(nm, *w):
            current = m
        if w and minutes(w[0]) > nm and (upcoming is None or minutes(w[0]) < minutes(upcoming["window"][0])):
            upcoming = m
    return {"now": now.strftime("%H:%M"), "current": current["id"] if current else None,
            "next": upcoming["id"] if upcoming else None, "meals": meals}


@app.get("/api/schedule")
def get_schedule(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if not feature_on(owner, "schedule"):
        return {"now": datetime.now().strftime("%H:%M"), "current": None, "next": None, "meals": []}
    return {**schedule(owner), "nudge": bool(get_pref(owner, "schedule_nudge", False))}


class NudgeIn(BaseModel):
    nudge: bool


@app.put("/api/schedule/nudge")
def put_nudge(n: NudgeIn, x_remote_user_id: str | None = Header(None)):
    set_pref(user_from(x_remote_user_id), "schedule_nudge", n.nudge)
    return {"ok": True}


def send_meal_nudges():
    """Notify (using the reminder's notify service) when a meal window has begun and the meal is still empty."""
    if not SUPERVISOR_TOKEN:
        return
    now = datetime.now()
    today = now.date().isoformat()
    for o in owners():
        rem = get_pref(o, "reminder") or {}
        if not (feature_on(o, "schedule") and get_pref(o, "schedule_nudge", False) and rem.get("notify")):
            continue
        sent = get_pref(o, "nudge_sent", {})
        if sent.get("day") != today:
            sent = {"day": today, "ids": []}
        s = schedule(o, now)
        m = next((x for x in s["meals"] if x["id"] == s["current"]), None)
        if not m or m["logged"] or m["id"] in sent["ids"]:
            continue
        sent["ids"].append(m["id"])
        set_pref(o, "nudge_sent", sent)
        domain, _, svc = rem["notify"].partition(".")
        try:
            httpx.post(f"http://supervisor/core/api/services/{domain}/{svc}", timeout=8,
                       headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                       json={"title": "Ernährungstagebuch", "message": f"{m['name']} steht an ({m['window'][0]}–{m['window'][1]} Uhr)."}).raise_for_status()
        except httpx.HTTPError as e:
            print(f"[nudge] {o}: {e!r}", flush=True)


def current_meal_sensor(owner: str) -> list:
    """sensor.mydiet_<name>_current_meal: the meal whose window is open now, "none" otherwise."""
    if not feature_on(owner, "schedule"):
        return []
    s = schedule(owner)
    m = next((x for x in s["meals"] if x["id"] == s["current"]), None)
    return [("current_meal", m["name"] if m else "none", "")]


SENSOR_HOOKS.append(current_meal_sensor)
last_meal = {}


def publish_meal_changes():
    """Update the current-meal sensor when a window opens or closes (the other sensors only change on edits)."""
    if not SUPERVISOR_TOKEN:
        return
    for o in owners():
        if not feature_on(o, "schedule"):
            continue
        cur = current_meal_sensor(o)[0][1]
        if last_meal.get(o) != cur:
            last_meal[o] = cur
            publish(o, get_pref(o, "display", o))


# --- lookup cache --------------------------------------------------------------

@app.get("/api/lookup/cache")
def lookup_cache_info():
    return db.cache_stats()


@app.delete("/api/lookup/cache")
def lookup_cache_clear():
    db.cache_clear()
    return {"ok": True}


# the maintenance loop (extras2) picks the jobs up from here
import extras2  # noqa: E402

extras2.EXTRA_JOBS.extend([sync_activity, send_meal_nudges, publish_meal_changes])
