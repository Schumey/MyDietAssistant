"""Compute and store the next target per exercise (and equipment) from the history.

This is the glue between the database and the pure rules in `progression`.
Targets live in the `target` table and reach the apps through the normal sync.
"""
from __future__ import annotations

import json
import sqlite3
import uuid
from collections import defaultdict
from dataclasses import replace
from datetime import date, datetime, timezone

from . import progression as pr

_NS = uuid.UUID("c3a1f0a4-5b1e-4d8e-8c53-6a1d0f5e9b72")
SESSIONS_PER_KEY = 8
RECENT_DAYS = 365
PHASE_VALUES = ("", "bulk", "maintain", "cut")


def get_pref(conn: sqlite3.Connection, owner: str, key: str, default: str = "") -> str:
    row = conn.execute("SELECT value FROM pref WHERE owner=? AND key=?", (owner, key)).fetchone()
    return row[0] if row else default


def count_warmups(conn: sqlite3.Connection, owner: str) -> bool:
    """Do warm-up sets count in the volume, set count and muscle statistics? (never for records and progression)"""
    return get_pref(conn, owner, "count_warmups") == "1"


def set_pref(conn: sqlite3.Connection, owner: str, key: str, value: str) -> None:
    with conn:
        conn.execute("INSERT INTO pref(owner,key,value) VALUES (?,?,?)"
                     " ON CONFLICT(owner,key) DO UPDATE SET value=excluded.value", (owner, key, value))


# Preferences that change the progression rules (besides `phase`). Value checks live here so that the
# WebSocket layer only asks `valid_pref`.
SETTING_KEYS = ("hit_fraction", "miss_fraction", "cut_drop_set_first", "break_days")
# Preferences that do not touch the progression (no recompute when they change).
TODAY_BLOCKS = ("next", "facts", "muscles", "recent")     # blocks of the panel's "Today" page
OTHER_KEYS = ("today_hidden", "rest_default", "mda_name", "count_warmups")


def valid_pref(key: str, value: str) -> bool:
    if key == "phase":
        return value in PHASE_VALUES
    if key in ("hit_fraction", "miss_fraction"):
        try:
            return 0.1 <= float(value) <= 1.0
        except ValueError:
            return False
    if key in ("cut_drop_set_first", "count_warmups"):  # count_warmups: warm-up sets count in volume, set and muscle statistics
        return value in ("0", "1")
    if key == "mda_name":  # the user name MyDietAssistant puts into its entity ids ('' = derive from the HA name)
        return len(value) <= 40 and all(c.isascii() and (c.islower() or c.isdigit() or c == "_") for c in value)
    if key == "break_days":
        return value.isdigit() and 3 <= int(value) <= 120
    if key == "today_hidden":  # blocks of the "Today" page that are switched off ('' = show all)
        parts = [p for p in value.split(",") if p]
        return len(set(parts)) == len(parts) and all(p in TODAY_BLOCKS for p in parts)
    if key == "rest_default":  # default rest between sets in seconds (0 = no timer)
        return value.isdigit() and int(value) <= 600
    return False


def set_target(conn: sqlite3.Connection, owner: str, exercise_id: str, weight: float) -> int:
    """Set the next weight of an exercise by hand (a one-time suggestion: the next recompute after a workout replaces it).

    Every existing target of the exercise (one per equipment) gets the weight; without any, the general one is created
    under the same id `compute_exercise` uses. Returns the number of rows written."""
    if not 0 <= weight <= 1000:
        raise ValueError("weight out of range")
    ex = conn.execute("SELECT kind FROM exercise WHERE id=? AND owner=? AND deleted=0", (exercise_id, owner)).fetchone()
    if ex is None or ex["kind"] not in ("strength", "bodyweight"):
        raise ValueError("exercise not found or without weights")
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    reason = "Von Hand gesetzt"
    with conn:
        rows = conn.execute("SELECT id FROM target WHERE owner=? AND exercise_id=? AND deleted=0", (owner, exercise_id)).fetchall()
        if rows:
            for r in rows:
                conn.execute("UPDATE target SET weight=?, updated_at=?, reason=?, reason_code='manual', reason_params='{}' WHERE id=?",
                             (weight, now, reason, r["id"]))
            return len(rows)
        tid = str(uuid.uuid5(_NS, f"{owner}|{exercise_id}|"))
        conn.execute(
            "INSERT INTO target(id, owner, updated_at, deleted, exercise_id, equipment_id, weight, reps, sets, reason, reason_code, reason_params)"
            " VALUES (?,?,?,0,?,'',?,NULL,NULL,?,'manual','{}') ON CONFLICT(id) DO UPDATE SET updated_at=excluded.updated_at, deleted=0,"
            " weight=excluded.weight, reason=excluded.reason, reason_code='manual', reason_params='{}'",
            (tid, owner, now, exercise_id, weight, reason))
        return 1


def load_settings(conn: sqlite3.Connection, owner: str) -> pr.Settings:
    """Progression settings of the user: defaults overridden by the stored preferences."""
    changes: dict = {}
    for key in SETTING_KEYS:
        raw = get_pref(conn, owner, key)
        if not raw or not valid_pref(key, raw):
            continue
        changes[key] = {"hit_fraction": float, "miss_fraction": float, "break_days": int,
                        "cut_drop_set_first": lambda v: v == "1"}[key](raw)
    return replace(pr.DEFAULT_SETTINGS, **changes)


def _phase(conn: sqlite3.Connection, owner: str) -> str:
    manual = get_pref(conn, owner, "phase")
    if manual in PHASE_VALUES[1:]:
        return manual
    auto = get_pref(conn, owner, "phase_auto")  # written by the HA side from MyDietAssistant's sensors
    if auto in PHASE_VALUES[1:]:
        return auto
    row = conn.execute("SELECT phase FROM workout WHERE owner=? AND deleted=0 AND phase!='' "
                       "ORDER BY started_at DESC LIMIT 1", (owner,)).fetchone()
    return row[0] if row else ""


def _sessions(conn: sqlite3.Connection, owner: str, exercise_id: str) -> dict[str, list[pr.Session]]:
    """Recent sessions of one exercise, grouped by equipment id ('' = unknown)."""
    rows = conn.execute(
        "SELECT s.workout_id, s.equipment_id, s.weight, s.reps, s.kind, w.started_at "
        "FROM workout_set s JOIN workout w ON w.id = s.workout_id "
        "WHERE s.owner=? AND s.exercise_id=? AND s.deleted=0 AND w.deleted=0 "
        "ORDER BY w.started_at DESC, s.done_at, s.set_no", (owner, exercise_id)).fetchall()
    grouped: dict[tuple[str, str], list] = defaultdict(list)
    first_seen: dict[tuple[str, str], str] = {}
    for r in rows:
        key = (r["equipment_id"] or "", r["workout_id"])
        grouped[key].append(pr.SetRec(r["weight"], r["reps"], r["kind"]))
        first_seen[key] = r["started_at"]
    out: dict[str, list[pr.Session]] = defaultdict(list)
    for (equipment, workout_id), sets in sorted(grouped.items(), key=lambda kv: first_seen[kv[0]], reverse=True):
        if len(out[equipment]) < SESSIONS_PER_KEY:
            out[equipment].append(pr.Session(date.fromisoformat(first_seen[(equipment, workout_id)][:10]), tuple(sets)))
    return out


def _routine_range(conn: sqlite3.Connection, owner: str, exercise_id: str):
    return conn.execute(
        "SELECT reps_min, reps_max, target_sets FROM routine_exercise WHERE owner=? AND exercise_id=? AND deleted=0"
        " AND reps_min IS NOT NULL AND reps_max IS NOT NULL ORDER BY updated_at DESC LIMIT 1",
        (owner, exercise_id)).fetchone()


def compute_exercise(conn: sqlite3.Connection, owner: str, exercise_id: str, today: date, phase: str,
                     settings: pr.Settings = pr.DEFAULT_SETTINGS) -> int:
    """Recompute the targets of one exercise. Returns the number of rows written or changed."""
    ex = conn.execute("SELECT kind FROM exercise WHERE id=? AND owner=? AND deleted=0", (exercise_id, owner)).fetchone()
    if ex is None or ex["kind"] not in ("strength", "bodyweight"):
        return 0
    routine = _routine_range(conn, owner, exercise_id)
    written = 0
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for equipment, sessions in _sessions(conn, owner, exercise_id).items():
        if routine:
            lo, hi, target_sets = routine["reps_min"], routine["reps_max"], routine["target_sets"]
        else:
            inferred = pr.infer_rep_range(sessions)
            if inferred is None:
                continue
            (lo, hi), target_sets = inferred, None
        steps = None
        if equipment:
            eq = conn.execute("SELECT steps FROM equipment WHERE id=? AND owner=?", (equipment, owner)).fetchone()
            steps = pr.expand_steps(eq["steps"]) if eq else None
        use = settings
        if not steps:  # unknown equipment steps: learn the step size from what was used
            use = replace(settings, default_step=pr.infer_step(sessions, settings.default_step))
        t = pr.suggest(sessions, lo, hi, phase, today, steps, use, target_sets)
        if t is None:
            continue
        params = json.dumps(t.params, sort_keys=True)
        tid = str(uuid.uuid5(_NS, f"{owner}|{exercise_id}|{equipment}"))
        old = conn.execute("SELECT weight, reps, sets, reason_code, reason_params, deleted FROM target WHERE id=?",
                           (tid,)).fetchone()
        if old and (old["weight"], old["reps"], old["sets"], old["reason_code"], old["reason_params"], old["deleted"]) \
                == (t.weight, t.reps, t.sets, t.code, params, 0):
            continue
        conn.execute(
            "INSERT INTO target(id, owner, updated_at, deleted, exercise_id, equipment_id, weight, reps, sets,"
            " reason, reason_code, reason_params) VALUES (?,?,?,0,?,?,?,?,?,?,?,?) "
            "ON CONFLICT(id) DO UPDATE SET updated_at=excluded.updated_at, deleted=0, weight=excluded.weight,"
            " reps=excluded.reps, sets=excluded.sets, reason=excluded.reason, reason_code=excluded.reason_code,"
            " reason_params=excluded.reason_params",
            (tid, owner, now, exercise_id, equipment, t.weight, t.reps, t.sets, pr.describe(t, "de"), t.code, params))
        written += 1
    return written


def recompute(conn: sqlite3.Connection, owner: str, exercise_ids: list[str] | None = None,
              today: date | None = None, settings: pr.Settings | None = None) -> dict:
    """Recompute targets for the given exercises, or for every exercise trained in the last year."""
    today = today or date.today()
    phase = _phase(conn, owner)
    settings = settings or load_settings(conn, owner)
    if exercise_ids is None:
        since = date.fromordinal(today.toordinal() - RECENT_DAYS).isoformat()
        exercise_ids = [r[0] for r in conn.execute(
            "SELECT DISTINCT s.exercise_id FROM workout_set s JOIN workout w ON w.id=s.workout_id "
            "WHERE s.owner=? AND s.deleted=0 AND w.deleted=0 AND w.started_at >= ?", (owner, since))]
    written = 0
    with conn:
        for eid in set(exercise_ids):
            written += compute_exercise(conn, owner, eid, today, phase, settings)
    return {"exercises": len(set(exercise_ids)), "written": written, "phase": phase}
