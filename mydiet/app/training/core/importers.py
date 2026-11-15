"""CSV imports of other workout apps (Strong, Hevy) and format detection.

Both formats already know workouts, so they are turned into the same `gymrun.ParseResult`
and written with `gymrun.import_into` (source `strong` / `hevy`). Sets carry no timestamps: they
are spaced one second apart from the workout start, which keeps their order. Weights are taken as kg
(Strong exports the unit chosen in the app; a lbs column is converted).
IDs are deterministic, so re-importing skips what is already there.
"""
from __future__ import annotations

import csv
import io
import re
from collections import Counter
from datetime import datetime, timedelta

from . import gymrun
from .gymrun import GSet, GWorkout, ParseResult

LB = 0.45359237
_MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def detect(text: str) -> str:
    """'gymrun', 'strong' or 'hevy'; raises ValueError for anything else."""
    head = text.lstrip("﻿").split("\n", 1)[0]
    if ";" in head and "Routine" in head and "Exercise" in head:
        return "gymrun"
    if "Workout Name" in head and "Exercise Name" in head:
        return "strong"
    if "exercise_title" in head and "start_time" in head:
        return "hevy"
    raise ValueError("unknown CSV format (expected GymRun, Strong or Hevy)")


def _num(s: str | None) -> float | None:
    s = (s or "").strip().replace(",", ".")
    try:
        return float(s) if s else None
    except ValueError:
        return None


def _strong_duration(s: str) -> int:
    """'1h 12m', '45m' or '1h' to seconds (0 when unknown)."""
    h = re.search(r"(\d+)\s*h", s or "")
    m = re.search(r"(\d+)\s*m", s or "")
    sec = re.search(r"(\d+)\s*s", s or "")
    return (int(h.group(1)) * 3600 if h else 0) + (int(m.group(1)) * 60 if m else 0) + (int(sec.group(1)) if sec else 0)


def _hevy_time(s: str) -> datetime:
    """'6 Mar 2024, 17:00' (English month names, also ISO)."""
    s = (s or "").strip()
    m = re.match(r"(\d{1,2}) (\w{3})\w*,? (\d{4}),? (\d{1,2}):(\d{2})", s)
    if m and m.group(2).lower() in _MONTHS:
        return datetime(int(m.group(3)), _MONTHS[m.group(2).lower()], int(m.group(1)), int(m.group(4)), int(m.group(5)))
    return datetime.fromisoformat(s.replace("Z", "")[:19])


def _exercise_kind(sets: list[GSet], distance: bool) -> str:
    if any(s.weight for s in sets):
        return "strength"
    if any(s.reps for s in sets):
        return "bodyweight"
    return "cardio" if distance else "time"


def _build(groups: dict[str, dict], warnings: list[str], rows: int, duplicates: int) -> ParseResult:
    """groups: start iso -> {routine, end (iso or ''), sets: [(exercise, GSet, distance flag)]}."""
    workouts: list[GWorkout] = []
    exercises: Counter = Counter()
    kinds: dict[str, list[GSet]] = {}
    dist: dict[str, bool] = {}
    for start in sorted(groups):
        g = groups[start]
        t0 = datetime.fromisoformat(start)
        w = GWorkout(started_at=start, ended_at=start, routine=g["routine"])
        for i, (name, s, has_dist) in enumerate(g["sets"]):
            s.done_at = (t0 + timedelta(seconds=i)).isoformat()
            s.key = f"{start}|{name}|{i}|{s.set_no}|{s.weight}|{s.reps}|{s.duration_s}"
            w.sets.append(s)
            exercises[name] += 1
            kinds.setdefault(name, []).append(s)
            dist[name] = dist.get(name, False) or has_dist
        last = (t0 + timedelta(seconds=max(len(g["sets"]) - 1, 0))).isoformat()
        w.ended_at = max(g["end"] or last, last)
        workouts.append(w)
    for w in workouts:
        for s in w.sets:
            s.exercise_kind = _exercise_kind(kinds[s.exercise], dist[s.exercise])
    return ParseResult(workouts, exercises, warnings, rows, duplicates)


def parse_strong(text: str) -> ParseResult:
    reader = csv.DictReader(io.StringIO(text.lstrip("﻿"), newline=""))
    names = reader.fieldnames or []
    if not {"Date", "Workout Name", "Exercise Name"} <= set(names):
        raise ValueError("not a Strong CSV export (columns missing)")
    wcol = next((c for c in names if c.startswith("Weight")), None)
    lbs = bool(wcol and "lb" in wcol.lower())
    groups: dict[str, dict] = {}
    warnings: list[str] = []
    seen: set[tuple] = set()
    rows = duplicates = 0
    for n, r in enumerate(reader, start=2):
        rows += 1
        sig = tuple(r.values())
        if sig in seen:
            duplicates += 1
            continue
        seen.add(sig)
        try:
            start = datetime.strptime((r["Date"] or "").strip()[:19], "%Y-%m-%d %H:%M:%S").isoformat()
            name = (r["Exercise Name"] or "").strip()
            if not name:
                raise ValueError("no exercise")
        except ValueError as e:
            warnings.append(f"line {n}: skipped ({e})")
            continue
        order = (r.get("Set Order") or "").strip().upper()
        kind = {"W": "warmup", "D": "drop"}.get(order, "work")   # F = failure stays a work set
        weight = _num(r.get(wcol)) if wcol else None
        if weight is not None and lbs:
            weight = round(weight * LB, 2)
        reps = _num(r.get("Reps"))
        secs = _num(r.get("Seconds"))
        dist = _num(r.get("Distance"))
        g = groups.setdefault(start, {"routine": (r.get("Workout Name") or "").strip(), "end": "", "sets": []})
        dur = _strong_duration(r.get("Duration") or "")
        if dur and not g["end"]:
            g["end"] = (datetime.fromisoformat(start) + timedelta(seconds=dur)).isoformat()
        note = (r.get("Notes") or "").strip()
        g["sets"].append((name, GSet(
            done_at="", exercise=name, exercise_kind="strength", set_no=int(order) if order.isdigit() else None,
            weight=weight or None, reps=int(reps) if reps else None, duration_s=int(secs) if secs else None,
            kind=kind, note=note), bool(dist)))
    return _build(groups, warnings, rows, duplicates)


def parse_hevy(text: str) -> ParseResult:
    reader = csv.DictReader(io.StringIO(text.lstrip("﻿"), newline=""))
    names = reader.fieldnames or []
    if not {"title", "start_time", "exercise_title"} <= set(names):
        raise ValueError("not a Hevy CSV export (columns missing)")
    groups: dict[str, dict] = {}
    warnings: list[str] = []
    seen: set[tuple] = set()
    rows = duplicates = 0
    for n, r in enumerate(reader, start=2):
        rows += 1
        sig = tuple(r.values())
        if sig in seen:
            duplicates += 1
            continue
        seen.add(sig)
        try:
            start = _hevy_time(r["start_time"]).isoformat()
            end = _hevy_time(r["end_time"]).isoformat() if (r.get("end_time") or "").strip() else ""
            name = (r["exercise_title"] or "").strip()
            if not name:
                raise ValueError("no exercise")
        except ValueError as e:
            warnings.append(f"line {n}: skipped ({e})")
            continue
        kind = {"warmup": "warmup", "dropset": "drop"}.get((r.get("set_type") or "").strip().lower(), "work")
        weight = _num(r.get("weight_kg"))
        if weight is None and _num(r.get("weight_lbs")) is not None:
            weight = round(_num(r.get("weight_lbs")) * LB, 2)
        idx = _num(r.get("set_index"))
        reps = _num(r.get("reps"))
        secs = _num(r.get("duration_seconds"))
        g = groups.setdefault(start, {"routine": (r.get("title") or "").strip(), "end": end, "sets": []})
        g["sets"].append((name, GSet(
            done_at="", exercise=name, exercise_kind="strength", set_no=int(idx) + 1 if idx is not None else None,
            weight=weight or None, reps=int(reps) if reps else None, duration_s=int(secs) if secs else None,
            kind=kind, note=(r.get("exercise_notes") or "").strip()), bool(_num(r.get("distance_km")))))
    return _build(groups, warnings, rows, duplicates)


def parse(text: str) -> tuple[str, ParseResult]:
    """Detect the format and parse; returns (format, result)."""
    fmt = detect(text)
    return fmt, {"gymrun": gymrun.parse, "strong": parse_strong, "hevy": parse_hevy}[fmt](text)


def name_mapping(names, known: dict[str, str]) -> dict[str, str]:
    """Exercise names of an import -> existing exercise ids. Tries the name as it is, then without a trailing
    equipment note such as 'Bench Press (Barbell)'."""
    out: dict[str, str] = {}
    for n in names:
        if n in known:
            out[n] = known[n]
            continue
        bare = re.sub(r"\s*\([^)]*\)\s*$", "", n)
        if bare != n and bare in known:
            out[n] = known[bare]
    return out
