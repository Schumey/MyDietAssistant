"""Read-only queries for the web panel (pure, no Home Assistant).

The panel asks for one view at a time through `run`; every query is scoped to one owner. Writes
go through the normal sync (`hafs/sync/push`), exactly like the app.
"""
from __future__ import annotations

import json
import sqlite3
from datetime import date, datetime, timedelta, timezone
from typing import Any, Callable

from . import status as st
from . import targets

MAX_PAGE = 100


def _week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _parse_day(text: str | None) -> date | None:
    try:
        return date.fromisoformat((text or "")[:10])
    except ValueError:
        return None


def muscle_weeks(conn: sqlite3.Connection, owner: str, today: date, weeks: int = 12) -> dict:
    """Working sets per muscle group and finished workouts per calendar week, oldest week first.

    Primary muscles count fully, secondary ones half; warm-up sets, cardio and timed exercises do not count."""
    start = _week_start(today) - timedelta(weeks=weeks - 1)
    starts = [start + timedelta(weeks=i) for i in range(weeks)]
    index = {d.isoformat(): i for i, d in enumerate(starts)}
    muscles: dict[str, list[float]] = {}
    for r in conn.execute(
            "SELECT s.done_at, e.muscles_primary mp, e.muscles_secondary ms FROM workout_set s "
            "JOIN exercise e ON e.id=s.exercise_id JOIN workout w ON w.id=s.workout_id "
            "WHERE s.owner=? AND s.deleted=0 AND w.deleted=0 AND s.kind!='warmup' "
            "AND e.kind IN ('strength','bodyweight') AND s.done_at >= ?", (owner, start.isoformat())):
        d = _parse_day(r["done_at"])
        i = index.get(_week_start(d).isoformat()) if d else None
        if i is None:
            continue
        for key in (r["mp"] or "").split():
            muscles.setdefault(key, [0.0] * weeks)[i] += 1
        for key in (r["ms"] or "").split():
            muscles.setdefault(key, [0.0] * weeks)[i] += 0.5
    workouts = [0] * weeks
    for r in conn.execute("SELECT started_at FROM workout WHERE owner=? AND deleted=0 AND ended_at IS NOT NULL AND started_at >= ?",
                          (owner, start.isoformat())):
        d = _parse_day(r["started_at"])
        i = index.get(_week_start(d).isoformat()) if d else None
        if i is not None:
            workouts[i] += 1
    return {"weeks": [d.isoformat() for d in starts], "muscles": muscles, "workouts": workouts}


def overview(conn, owner, now, tz, params) -> dict:
    s = st.status(conn, owner, now, tz)
    s.pop("attrs", None)
    local = now.astimezone(tz) if tz else now
    active = conn.execute("SELECT started_at FROM workout WHERE owner=? AND deleted=0 AND ended_at IS NULL "
                          "ORDER BY started_at DESC LIMIT 1", (owner,)).fetchone() if s["active"] else None
    next_exercises: list[dict] = []
    if s["next"]:
        for prog in st.plan(conn, owner, local)["programs"]:
            if prog["program"] == s["next"]["program"]:
                next_exercises = next((r["exercises"] for r in prog["routines"] if r["routine"] == s["next"]["routine"]), [])
                break
    return {
        "status": s,
        "active_since": active["started_at"] if active else None,
        "next_exercises": next_exercises,
        "phase": targets._phase(conn, owner),
        "phase_manual": targets.get_pref(conn, owner, "phase"),
        "recent": st.recent_workouts(conn, owner, 3650, 5, now),
        "weeks": muscle_weeks(conn, owner, local.date(), 12),
    }


def muscles(conn, owner, now, tz, params) -> dict:
    weeks = int(params.get("weeks", 52))
    if not 4 <= weeks <= 104:
        raise ValueError("weeks must be 4 to 104")
    local = now.astimezone(tz) if tz else now
    return muscle_weeks(conn, owner, local.date(), weeks)


def workouts(conn, owner, now, tz, params) -> dict:
    """A page of workouts, newest first. `before` = started_at of the last row of the previous page."""
    limit = max(1, min(int(params.get("limit", 30)), MAX_PAGE))
    before = params.get("before")
    where, args = "w.owner=? AND w.deleted=0", [owner]
    if before:
        where += " AND w.started_at < ?"
        args.append(str(before))
    rows = conn.execute(
        "SELECT w.id, w.started_at, w.ended_at, w.routine_name, w.phase, w.source, g.name AS gym FROM workout w "
        f"LEFT JOIN gym g ON g.id=w.gym_id WHERE {where} ORDER BY w.started_at DESC LIMIT ?", (*args, limit + 1)).fetchall()
    out = []
    for r in rows[:limit]:
        stats = st.workout_stats(conn, owner, r["id"]) or {}
        names = [x["name"] for x in conn.execute(
            "SELECT e.name FROM workout_set s JOIN exercise e ON e.id=s.exercise_id "
            "WHERE s.workout_id=? AND s.owner=? AND s.deleted=0 GROUP BY e.id ORDER BY MIN(s.done_at)", (r["id"], owner))]
        out.append({"id": r["id"], "started_at": r["started_at"], "ended_at": r["ended_at"], "routine": r["routine_name"],
                    "gym": r["gym"], "phase": r["phase"], "source": r["source"], "sets": stats.get("sets", 0),
                    "volume_kg": stats.get("volume_kg", 0), "duration_min": stats.get("duration_min", 0), "exercises": names})
    return {"workouts": out, "more": len(rows) > limit}


def workout(conn, owner, now, tz, params) -> dict:
    wid = params.get("id")
    w = conn.execute("SELECT w.*, g.name AS gym FROM workout w LEFT JOIN gym g ON g.id=w.gym_id "
                     "WHERE w.id=? AND w.owner=? AND w.deleted=0", (wid, owner)).fetchone()
    if w is None:
        raise ValueError("workout not found")
    groups: dict[str, dict] = {}
    for r in conn.execute(
            "SELECT s.*, e.name AS ex_name, e.kind AS ex_kind, q.name AS eq_name FROM workout_set s "
            "JOIN exercise e ON e.id=s.exercise_id LEFT JOIN equipment q ON q.id=s.equipment_id "
            "WHERE s.workout_id=? AND s.owner=? AND s.deleted=0 ORDER BY s.done_at, s.set_no", (wid, owner)):
        g = groups.setdefault(r["exercise_id"], {"exercise_id": r["exercise_id"], "name": r["ex_name"], "kind": r["ex_kind"],
                                                  "equipment": r["eq_name"], "sets": []})
        g["sets"].append({"no": r["set_no"], "weight": r["weight"], "reps": r["reps"], "duration_s": r["duration_s"],
                          "distance_m": r["distance_m"], "kind": r["kind"], "rir": r["rir"], "note": r["note"],
                          "target_weight": r["target_weight"], "target_reps": r["target_reps"], "done_at": r["done_at"]})
    stats = st.workout_stats(conn, owner, wid) or {}
    return {"id": wid, "started_at": w["started_at"], "ended_at": w["ended_at"], "routine": w["routine_name"], "gym": w["gym"],
            "note": w["note"], "phase": w["phase"], "source": w["source"], "feeling": w["feeling"],
            "sets": stats.get("sets", 0), "volume_kg": stats.get("volume_kg", 0), "duration_min": stats.get("duration_min", 0),
            "exercises": list(groups.values())}


def exercises(conn, owner, now, tz, params) -> dict:
    """Exercises that have sets, most trained first (the picker of the statistics view)."""
    rows = conn.execute(
        "SELECT e.id, e.name, e.kind, e.muscles_primary mp, COUNT(s.id) n, COUNT(DISTINCT s.workout_id) times, MAX(s.done_at) last FROM exercise e "
        "JOIN workout_set s ON s.exercise_id=e.id AND s.deleted=0 AND s.kind!='warmup' "
        "JOIN workout w ON w.id=s.workout_id AND w.deleted=0 "
        "WHERE e.owner=? AND e.deleted=0 GROUP BY e.id ORDER BY n DESC, e.name COLLATE NOCASE", (owner,)).fetchall()
    return {"exercises": [{"id": r["id"], "name": r["name"], "kind": r["kind"], "muscles": (r["mp"] or "").split(),
                           "sets": r["n"], "times": r["times"], "last": (r["last"] or "")[:10]} for r in rows]}


def exercise(conn, owner, now, tz, params) -> dict:
    """History of one exercise: one entry per workout, plus records and the current suggestion."""
    eid = params.get("id")
    ex = conn.execute("SELECT id, name, kind, muscles_primary mp FROM exercise WHERE id=? AND owner=? AND deleted=0",
                      (eid, owner)).fetchone()
    if ex is None:
        raise ValueError("exercise not found")
    by_workout: dict[str, dict] = {}
    for r in conn.execute(
            "SELECT s.workout_id, w.started_at, s.weight, s.reps, s.duration_s, s.kind FROM workout_set s "
            "JOIN workout w ON w.id=s.workout_id WHERE s.owner=? AND s.exercise_id=? AND s.deleted=0 AND w.deleted=0 "
            "AND s.kind!='warmup' ORDER BY w.started_at, s.done_at", (owner, eid)):
        e = by_workout.setdefault(r["workout_id"], {"workout_id": r["workout_id"], "date": (r["started_at"] or "")[:10],
                                                     "sets": 0, "best_weight": 0.0, "e1rm": 0.0, "volume": 0.0,
                                                     "total_reps": 0, "total_s": 0, "top": None})
        weight, reps = r["weight"] or 0.0, r["reps"] or 0
        e["sets"] += 1
        e["volume"] += weight * reps
        e["total_reps"] += reps
        e["total_s"] += r["duration_s"] or 0
        e["best_weight"] = max(e["best_weight"], weight)
        e["e1rm"] = max(e["e1rm"], st._e1rm(r["weight"], r["reps"]))
        if e["top"] is None or (weight, reps) > (e["top"]["weight"], e["top"]["reps"]):
            e["top"] = {"weight": weight, "reps": reps}
    sessions = list(by_workout.values())
    for e in sessions:
        e["volume"] = round(e["volume"], 1)
        e["e1rm"] = round(e["e1rm"], 1)
    records = {
        "weight": max((e["best_weight"] for e in sessions), default=0),
        "e1rm": max((e["e1rm"] for e in sessions), default=0),
        "volume": max((e["volume"] for e in sessions), default=0),
        "reps": max((e["total_reps"] for e in sessions), default=0),
    }
    t = conn.execute("SELECT weight, reps, sets, reason, reason_code, reason_params FROM target WHERE owner=? AND exercise_id=? "
                     "AND deleted=0 ORDER BY updated_at DESC LIMIT 1", (owner, eid)).fetchone()
    return {"exercise": {"id": ex["id"], "name": ex["name"], "kind": ex["kind"], "muscles": (ex["mp"] or "").split()},
            "sessions": sessions, "records": records, "target": dict(t) if t else None}


def plan(conn, owner, now, tz, params) -> dict:
    """Programs, loose routines and the gyms with their equipment (read only; editing happens in the app)."""
    local = now.astimezone(tz) if tz else now
    out = st.plan(conn, owner, local)
    loose = []
    for r in conn.execute(
            "SELECT r.id, r.name FROM routine r LEFT JOIN program p ON p.id=r.program_id AND p.deleted=0 "
            "WHERE r.owner=? AND r.deleted=0 AND p.id IS NULL ORDER BY r.name COLLATE NOCASE", (owner,)):
        loose.append({"id": r["id"], "routine": r["name"], "exercises": [
            {"exercise": x["name"], "sets": x["target_sets"], "reps_min": x["reps_min"], "reps_max": x["reps_max"],
             "superset": x["superset_group"] or None, "target_weight": None, "rest_s": x["rest_s"], "warmup": st.warmup_of(x)}
            for x in conn.execute(
                "SELECT e.name, x.target_sets, x.reps_min, x.reps_max, x.superset_group, x.rest_s, x.warmup_sets, x.warmup_reps, x.warmup_pct "
                "FROM routine_exercise x "
                "JOIN exercise e ON e.id=x.exercise_id WHERE x.routine_id=? AND x.deleted=0 AND e.deleted=0 ORDER BY x.position",
                (r["id"],))]})
    gyms = []
    for g in conn.execute("SELECT id, name, zone FROM gym WHERE owner=? AND deleted=0 ORDER BY name COLLATE NOCASE", (owner,)):
        eq = []
        for q in conn.execute("SELECT name, type, steps, out_of_order FROM equipment WHERE gym_id=? AND deleted=0 "
                              "ORDER BY name COLLATE NOCASE", (g["id"],)):
            try:
                steps = json.loads(q["steps"]) if q["steps"] else None
            except ValueError:
                steps = None
            eq.append({"name": q["name"], "type": q["type"], "steps": steps, "out_of_order": bool(q["out_of_order"])})
        gyms.append({"id": g["id"], "name": g["name"], "zone": g["zone"], "equipment": eq})
    return {**out, "loose": loose, "gyms": gyms}


def plan_edit(conn, owner, now, tz, params) -> dict:
    """Everything the plan editor needs as full records (so the panel can push them back unchanged apart from its edits)."""
    def rows(sql: str) -> list[dict]:
        return [{k: v for k, v in dict(r).items() if k != "owner"} for r in conn.execute(sql, (owner,))]

    ex = [{"id": r["id"], "name": r["name"], "kind": r["kind"], "muscles": (r["mp"] or "").split(), "equipment_type": r["equipment_type"]}
          for r in conn.execute(
        "SELECT id, name, kind, muscles_primary mp, equipment_type FROM exercise WHERE owner=? AND deleted=0 ORDER BY name COLLATE NOCASE", (owner,))]
    return {
        "programs": rows("SELECT * FROM program WHERE owner=? AND deleted=0 ORDER BY name COLLATE NOCASE"),
        "routines": rows("SELECT * FROM routine WHERE owner=? AND deleted=0 ORDER BY position, name COLLATE NOCASE"),
        "routine_exercises": rows("SELECT * FROM routine_exercise WHERE owner=? AND deleted=0 ORDER BY position"),
        "gyms": rows("SELECT * FROM gym WHERE owner=? AND deleted=0 ORDER BY name COLLATE NOCASE"),
        "equipment": rows("SELECT * FROM equipment WHERE owner=? AND deleted=0 ORDER BY name COLLATE NOCASE"),
        "links": rows("SELECT * FROM exercise_equipment WHERE owner=? AND deleted=0"),
        "exercises": ex,
        # the weight the next workout starts with, per exercise (latest target; the plan editor shows and sets it)
        "target_weights": {r["exercise_id"]: r["weight"] for r in conn.execute(
            "SELECT exercise_id, weight FROM target WHERE owner=? AND deleted=0 AND weight IS NOT NULL ORDER BY updated_at", (owner,))},
    }


QUERIES: dict[str, Callable[..., dict]] = {
    "plan_edit": plan_edit,
    "overview": overview, "muscles": muscles, "workouts": workouts, "workout": workout,
    "exercises": exercises, "exercise": exercise, "plan": plan,
}


def run(conn: sqlite3.Connection, owner: str, q: str, params: dict[str, Any] | None = None,
        now: datetime | None = None, tz: timezone | None = None) -> dict:
    fn = QUERIES.get(q)
    if fn is None:
        raise ValueError(f"unknown query {q}")
    now = now or datetime.now(timezone.utc)
    try:
        return fn(conn, owner, now, tz or now.tzinfo or timezone.utc, params or {})
    except (TypeError, KeyError) as err:  # malformed parameters
        raise ValueError(f"invalid parameters: {err}") from err
