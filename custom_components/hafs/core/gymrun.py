"""GymRun CSV import (format checked against a real export, 10 Nov 2026).

One CSV row = one set. There are no workouts, gyms, equipment or end times, so
workouts are rebuilt from the timestamps: a new workout starts after a pause
of more than GAP_S or when the routine name changes to another non-empty one.
IDs are deterministic (uuid5), so re-importing skips what is already there.
"""
from __future__ import annotations

import csv
import io
import sqlite3
import uuid
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone

GAP_S = 2 * 3600
_NS = uuid.UUID("6f1f2a0e-3d5b-4a57-9c1e-4f0a5c7b8d11")

# GymRun "Book": 1 weight x reps, 2 duration in minutes, 6 bodyweight x reps
_BOOK_KIND = {"1": "strength", "2": "time", "6": "bodyweight"}
_CARDIO = {"Crosstrainer", "Ergometer"}
# GymRun "Type": 1 work, 2 warm-up (assumed), 3 drop set (assumed)
_TYPE_KIND = {"1": "work", "2": "warmup", "3": "drop"}


@dataclass
class GSet:
    done_at: str
    exercise: str
    exercise_kind: str
    set_no: int | None
    weight: float | None
    reps: int | None
    duration_s: int | None
    kind: str
    note: str
    key: str = ""


@dataclass
class GWorkout:
    started_at: str
    ended_at: str
    routine: str
    sets: list[GSet] = field(default_factory=list)


@dataclass
class ParseResult:
    workouts: list[GWorkout]
    exercises: Counter
    warnings: list[str]
    rows: int
    duplicates: int


def _num(s: str) -> float | None:
    s = s.strip().replace(",", ".")
    return float(s) if s else None


def parse(text: str) -> ParseResult:
    reader = csv.DictReader(io.StringIO(text.lstrip("﻿"), newline=""), delimiter=";")
    need = {"Date", "Time", "Exercise", "Set", "Weight", "Reps", "Duration", "Routine", "Note", "Type", "Book"}
    if not reader.fieldnames or not need <= set(reader.fieldnames):
        raise ValueError("not a GymRun CSV export (columns missing)")
    warnings: list[str] = []
    seen: set[tuple] = set()
    items: list[tuple[str, str, GSet]] = []
    exercises: Counter = Counter()
    rows = duplicates = 0
    for n, r in enumerate(reader, start=2):
        rows += 1
        sig = tuple(r.values())
        if sig in seen:
            duplicates += 1
            continue
        seen.add(sig)
        try:
            ts = datetime.strptime(f"{r['Date']} {r['Time']}", "%d.%m.%Y %H:%M:%S").isoformat()
            name = r["Exercise"].strip()
            if not name:
                raise ValueError("no exercise")
            kind = _BOOK_KIND.get(r["Book"], "strength")
            if name in _CARDIO:
                kind = "cardio"
            dur = _num(r["Duration"])
            reps = _num(r["Reps"])
            s = GSet(
                done_at=ts, exercise=name, exercise_kind=kind,
                set_no=int(r["Set"]) if r["Set"].strip() else None,
                weight=_num(r["Weight"]), reps=int(reps) if reps is not None else None,
                duration_s=int(round(dur * 60)) if dur is not None else None,
                kind=_TYPE_KIND.get(r["Type"], "work"), note=r["Note"].strip(),
            )
        except (ValueError, KeyError) as e:
            warnings.append(f"line {n}: skipped ({e})")
            continue
        if kind in ("strength", "bodyweight") and s.reps is None:
            warnings.append(f"line {n}: {name} without repetitions")
        s.key = f"{ts}|{name}|{s.set_no}|{s.weight}|{s.reps}|{s.duration_s}"
        exercises[name] += 1
        items.append((r["Routine"].strip(), ts, s))

    items.sort(key=lambda t: t[1])
    workouts: list[GWorkout] = []
    cur: GWorkout | None = None
    last: datetime | None = None
    for routine, ts, s in items:
        t = datetime.fromisoformat(ts)
        new = cur is None or (t - last).total_seconds() > GAP_S
        if not new and routine and cur.routine and routine != cur.routine:
            new = True
        if new:
            cur = GWorkout(started_at=ts, ended_at=ts, routine=routine)
            workouts.append(cur)
        elif routine and not cur.routine:
            cur.routine = routine
        cur.sets.append(s)
        cur.ended_at = ts
        last = t
    return ParseResult(workouts, exercises, warnings, rows, duplicates)


def summary(res: ParseResult) -> dict:
    sets = sum(len(w.sets) for w in res.workouts)
    return {
        "rows": res.rows, "sets": sets, "workouts": len(res.workouts),
        "exercises": len(res.exercises), "duplicates": res.duplicates,
        "first": res.workouts[0].started_at if res.workouts else None,
        "last": res.workouts[-1].started_at if res.workouts else None,
        "warnings": res.warnings,
    }


def _id(owner: str, *parts: str) -> str:
    return str(uuid.uuid5(_NS, "|".join((owner, *parts))))


def import_into(conn: sqlite3.Connection, owner: str, res: ParseResult,
                mapping: dict[str, str] | None = None) -> dict:
    """Write a parsed export. `mapping` maps GymRun exercise names to existing
    exercise ids (e.g. from the catalog); unmapped names create new exercises.
    Returns counts of newly inserted records."""
    mapping = mapping or {}
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    added = {"exercises": 0, "workouts": 0, "sets": 0}
    ex_ids: dict[str, str] = {}
    kinds = {s.exercise: s.exercise_kind for w in res.workouts for s in w.sets}
    with conn:
        for name in res.exercises:
            if name in mapping:
                ex_ids[name] = mapping[name]
                continue
            eid = _id(owner, "exercise", name)
            ex_ids[name] = eid
            c = conn.execute(
                "INSERT OR IGNORE INTO exercise(id, owner, updated_at, name, kind) VALUES (?,?,?,?,?)",
                (eid, owner, now, name, kinds[name]))
            added["exercises"] += c.rowcount
        for w in res.workouts:
            wid = _id(owner, "workout", w.started_at)
            c = conn.execute(
                "INSERT OR IGNORE INTO workout(id, owner, updated_at, started_at, ended_at, routine_name, source)"
                " VALUES (?,?,?,?,?,?, 'gymrun')", (wid, owner, now, w.started_at, w.ended_at, w.routine))
            added["workouts"] += c.rowcount
            for s in w.sets:
                c = conn.execute(
                    "INSERT OR IGNORE INTO workout_set(id, owner, updated_at, workout_id, exercise_id, set_no,"
                    " weight, reps, duration_s, kind, note, done_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                    (_id(owner, "set", s.key), owner, now, wid, ex_ids[s.exercise], s.set_no, s.weight,
                     s.reps, s.duration_s, s.kind, s.note, s.done_at))
                added["sets"] += c.rowcount
    return added
