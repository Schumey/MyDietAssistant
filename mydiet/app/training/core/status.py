"""Workout status for sensors and events (pure, no Home Assistant).

`training_state` is none | active | done, where
`done` lasts until local midnight.
"""
from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta, timezone

ACTIVE_MAX_H = 12          # an unfinished workout older than this no longer counts as active
KCAL_PER_MIN = 4.5         # rough estimate for strength training, display only


def _parse(text: str | None) -> datetime | None:
    if not text:
        return None
    try:
        d = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def workout_stats(conn: sqlite3.Connection, owner: str, workout_id: str) -> dict | None:
    w = conn.execute("SELECT * FROM workout WHERE id=? AND owner=? AND deleted=0", (workout_id, owner)).fetchone()
    if w is None:
        return None
    sets = conn.execute(
        "SELECT weight, reps, kind, done_at FROM workout_set WHERE workout_id=? AND owner=? AND deleted=0",
        (workout_id, owner)).fetchall()
    work = [s for s in sets if s["kind"] != "warmup"]
    volume = sum((s["weight"] or 0) * (s["reps"] or 0) for s in work)
    start = _parse(w["started_at"])
    end = _parse(w["ended_at"])
    if end is None and sets:
        end = max((d for d in (_parse(s["done_at"]) for s in sets) if d), default=None)
    minutes = round((end - start).total_seconds() / 60) if start and end and end > start else 0
    return {
        "workout_id": w["id"], "started_at": w["started_at"], "ended_at": w["ended_at"],
        "routine": w["routine_name"], "sets": len(work), "volume_kg": round(volume, 1),
        "duration_min": minutes, "kcal_estimate": round(minutes * KCAL_PER_MIN),
    }


def status(conn: sqlite3.Connection, owner: str, now: datetime | None = None, tz: timezone | None = None) -> dict:
    """Current state for the sensors. `tz` defines what 'today' means (Home Assistant's time zone)."""
    now = now or datetime.now(timezone.utc)
    tz = tz or now.tzinfo or timezone.utc
    local_now = now.astimezone(tz)
    day_start = local_now.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
    week_start = (local_now - timedelta(days=local_now.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)

    rows = conn.execute("SELECT id, started_at, ended_at FROM workout WHERE owner=? AND deleted=0 "
                        "ORDER BY started_at DESC LIMIT 400", (owner,)).fetchall()
    active = None
    finished: list[tuple[datetime, str]] = []
    for r in rows:
        started, ended = _parse(r["started_at"]), _parse(r["ended_at"])
        if started is None:
            continue
        if ended is None:
            if active is None and now - started < timedelta(hours=ACTIVE_MAX_H) and started <= now + timedelta(minutes=5):
                active = r["id"]
        else:
            finished.append((ended, r["id"]))
    finished.sort(reverse=True)
    today = [f for f in finished if f[0] >= day_start]
    week = [f for f in finished if f[0] >= week_start]
    state = "active" if active else ("done" if today else "none")
    last = workout_stats(conn, owner, finished[0][1]) if finished else None
    volume_week = sum((workout_stats(conn, owner, wid) or {}).get("volume_kg", 0) for _, wid in week)
    out = {"state": state, "active": bool(active), "workouts_today": len(today), "workouts_week": len(week),
           "volume_week_kg": round(volume_week, 1), "next": next_routine(conn, owner, local_now),
           "last_workout_at": finished[0][0].isoformat() if finished else None, "last": last}
    if state == "done":
        out["attrs"] = {k: last[k] for k in ("duration_min", "volume_kg", "sets", "kcal_estimate", "routine")}
        out["attrs"]["finished_at"] = last["ended_at"]
    return out


def workout_ids(conn: sqlite3.Connection, owner: str, ids: list[str]) -> dict[str, str | None]:
    """workout id -> ended_at (None = running) for those that exist, used to detect transitions."""
    if not ids:
        return {}
    q = ",".join("?" * len(ids))
    return {r["id"]: r["ended_at"] for r in conn.execute(
        f"SELECT id, ended_at FROM workout WHERE owner=? AND deleted=0 AND id IN ({q})", (owner, *ids))}


def _e1rm(weight: float | None, reps: int | None) -> float:
    if not weight or not reps or reps < 1 or reps > 12:
        return 0.0
    return weight * (1 + reps / 30)


def records_in(conn: sqlite3.Connection, owner: str, workout_id: str) -> list[dict]:
    """New personal bests of a workout: heaviest weight and best estimated 1RM per exercise.

    Only exercises that already had history count (the first workout is no 'record')."""
    w = conn.execute("SELECT started_at FROM workout WHERE id=? AND owner=? AND deleted=0", (workout_id, owner)).fetchone()
    if w is None:
        return []
    out = []
    exercises = conn.execute(
        "SELECT DISTINCT s.exercise_id, e.name FROM workout_set s JOIN exercise e ON e.id=s.exercise_id "
        "WHERE s.workout_id=? AND s.owner=? AND s.deleted=0", (workout_id, owner)).fetchall()
    for ex in exercises:
        def sets(where: str, params: tuple):
            return conn.execute(
                "SELECT s.weight, s.reps FROM workout_set s JOIN workout w ON w.id=s.workout_id "
                f"WHERE s.owner=? AND s.exercise_id=? AND s.deleted=0 AND w.deleted=0 AND s.kind!='warmup' AND {where}",
                (owner, ex["exercise_id"], *params)).fetchall()
        now_sets = sets("s.workout_id=?", (workout_id,))
        old_sets = sets("s.workout_id!=? AND w.started_at < ?", (workout_id, w["started_at"]))
        if not old_sets:
            continue
        for kind, fn in (("weight", lambda s: s["weight"] or 0.0), ("1rm", lambda s: _e1rm(s["weight"], s["reps"]))):
            best_old = max((fn(s) for s in old_sets), default=0.0)
            best_new = max((fn(s) for s in now_sets), default=0.0)
            if best_new > best_old > 0:
                out.append({"workout_id": workout_id, "exercise_id": ex["exercise_id"], "exercise": ex["name"],
                            "kind": kind, "value": round(best_new, 1), "previous": round(best_old, 1)})
    return out


def recent_workouts(conn: sqlite3.Connection, owner: str, days: int = 30, limit: int = 50,
                    now: datetime | None = None) -> list[dict]:
    """Finished workouts of the last `days` days, newest first, with their per-exercise summary."""
    now = now or datetime.now(timezone.utc)
    since = (now - timedelta(days=days)).isoformat()
    ids = [r["id"] for r in conn.execute(
        "SELECT id FROM workout WHERE owner=? AND deleted=0 AND ended_at IS NOT NULL AND started_at >= ? "
        "ORDER BY started_at DESC LIMIT ?", (owner, since, limit))]
    out = []
    for wid in ids:
        stats = workout_stats(conn, owner, wid)
        if stats is None:
            continue
        stats["exercises"] = [
            {"name": r["name"], "sets": r["n"], "best_weight": r["best"]}
            for r in conn.execute(
                "SELECT e.name, COUNT(*) n, MAX(s.weight) best FROM workout_set s JOIN exercise e ON e.id=s.exercise_id "
                "WHERE s.workout_id=? AND s.owner=? AND s.deleted=0 AND s.kind!='warmup' GROUP BY e.id ORDER BY MIN(s.done_at)",
                (wid, owner))]
        out.append(stats)
    return out


def parse_rhythm(text: str, count: int) -> list[int]:
    """Weekdays (1 = Monday .. 7 = Sunday) of a program rhythm like "1,3,5"; empty unless there is one per routine."""
    try:
        days = sorted({int(x) for x in text.split(",") if x.strip()})
    except ValueError:
        return []
    return days if len(days) == count and all(1 <= d <= 7 for d in days) else []


def pick_next(count: int, last_index: int, days: list[int], today: int, trained_today: bool) -> int:
    """Index of the next routine: by weekday plan when there is one (the routine of today's weekday, or the next
    training day once today is done), else rotation after the last finished routine."""
    if not days:
        return (last_index + 1) % count
    if not trained_today and today in days:
        return days.index(today)
    later = [d for d in days if d > today]
    return days.index(later[0]) if later else 0


def next_routine(conn: sqlite3.Connection, owner: str, now: datetime | None = None) -> dict | None:
    """The routine that follows the last finished one in the first program that has routines
    (same rule as the app: rotation, free workouts do not count). None without a program."""
    for prog in conn.execute("SELECT id, name, rhythm FROM program WHERE owner=? AND deleted=0 ORDER BY name COLLATE NOCASE", (owner,)):
        routines = conn.execute(
            "SELECT id, name FROM routine WHERE owner=? AND program_id=? AND deleted=0 ORDER BY position, name COLLATE NOCASE",
            (owner, prog["id"])).fetchall()
        if not routines:
            continue
        ids = [r["id"] for r in routines]
        q = ",".join("?" * len(ids))
        last = conn.execute(
            f"SELECT routine_id, started_at FROM workout WHERE owner=? AND deleted=0 AND ended_at IS NOT NULL AND routine_id IN ({q}) "
            "ORDER BY started_at DESC LIMIT 1", (owner, *ids)).fetchone()
        i = ids.index(last["routine_id"]) if last else -1
        days = parse_rhythm(prog["rhythm"], len(routines)) if now else []
        today = now.isoweekday() if now else 0
        trained_today = bool(last and now and str(last["started_at"])[:10] == now.date().isoformat())
        nxt = routines[pick_next(len(routines), i, days, today, trained_today)]
        exercises = [r["name"] for r in conn.execute(
            "SELECT e.name FROM routine_exercise x JOIN exercise e ON e.id=x.exercise_id "
            "WHERE x.routine_id=? AND x.deleted=0 AND e.deleted=0 ORDER BY x.position", (nxt["id"],))]
        return {"routine_id": nxt["id"], "routine": nxt["name"], "program": prog["name"], "exercises": exercises}
    return None


def warmup_of(x) -> dict | None:
    """Warm-up sets of a planned exercise ({sets, reps, pct}) or None when there are none."""
    if not x["warmup_sets"]:
        return None
    return {"sets": x["warmup_sets"], "reps": x["warmup_reps"], "pct": x["warmup_pct"]}


def plan(conn: sqlite3.Connection, owner: str, now: datetime | None = None) -> dict:
    """All programs with their routines and exercises (sets, rep range, superset group, current target), plus the
    routine that is due next."""
    programs = []
    for prog in conn.execute("SELECT id, name, rhythm FROM program WHERE owner=? AND deleted=0 ORDER BY name COLLATE NOCASE", (owner,)):
        routines = []
        for r in conn.execute("SELECT id, name FROM routine WHERE owner=? AND program_id=? AND deleted=0 ORDER BY position, name COLLATE NOCASE",
                              (owner, prog["id"])):
            exercises = []
            for x in conn.execute(
                    "SELECT x.exercise_id, e.name, x.target_sets, x.reps_min, x.reps_max, x.superset_group, x.rest_s, "
                    "x.warmup_sets, x.warmup_reps, x.warmup_pct, "
                    "(SELECT weight FROM target t WHERE t.owner=x.owner AND t.exercise_id=x.exercise_id AND t.deleted=0 "
                    " ORDER BY t.updated_at DESC LIMIT 1) AS weight "
                    "FROM routine_exercise x JOIN exercise e ON e.id=x.exercise_id "
                    "WHERE x.routine_id=? AND x.deleted=0 AND e.deleted=0 ORDER BY x.position", (r["id"],)):
                exercises.append({"exercise": x["name"], "sets": x["target_sets"], "reps_min": x["reps_min"], "reps_max": x["reps_max"],
                                  "superset": x["superset_group"] or None, "target_weight": x["weight"],
                                  "rest_s": x["rest_s"], "warmup": warmup_of(x)})
            routines.append({"id": r["id"], "routine": r["name"], "exercises": exercises})
        days = parse_rhythm(prog["rhythm"], len(routines))
        programs.append({"id": prog["id"], "program": prog["name"], "weekdays": days or None, "routines": routines})
    nxt = next_routine(conn, owner, now)
    return {"programs": programs, "next": {k: nxt[k] for k in ("routine", "program")} if nxt else None}
