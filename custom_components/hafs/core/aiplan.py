"""AI plan suggestions: build the request for `ai_task.generate_data` and validate what comes back.

The AI only proposes a draft from the user's own exercises (by id). Weights are never part of it: the progression
decides them. Everything the model returns is checked before the app sees it.
"""

from __future__ import annotations

import json
import re
import sqlite3
from typing import Any

MAX_DAYS = 7
MAX_EXERCISES_PER_DAY = 12
SHAPE = '{"days": [{"name": "Push", "exercises": [{"id": "<exercise id>", "sets": 3, "reps_min": 6, "reps_max": 10}]}]}'


def candidate_exercises(conn: sqlite3.Connection, owner: str, limit: int = 90) -> list[dict[str, Any]]:
    """Strength exercises of the user, the most trained first, as compact dicts."""
    rows = conn.execute(
        "SELECT e.id, e.name, e.muscles_primary mp, e.kind, "
        "(SELECT COUNT(*) FROM workout_set s WHERE s.exercise_id=e.id AND s.deleted=0 AND s.kind='work') n "
        "FROM exercise e WHERE e.owner=? AND e.deleted=0 AND e.kind IN ('strength','bodyweight') "
        "ORDER BY n DESC, e.name LIMIT ?", (owner, limit)).fetchall()
    return [{"id": r["id"], "name": r["name"], "muscles": (r["mp"] or "").split(), "sets_done": r["n"]} for r in rows]


def build_instructions(days: int, minutes: int, goal: str, notes: str, phase: str, exercises: list[dict[str, Any]], lang: str = "de") -> str:
    """Prompt text. [notes] and [goal] are free text from the user."""
    listing = "\n".join(f'- {e["id"]} | {e["name"]} | {",".join(e["muscles"])}' for e in exercises)
    return (
        f"Create a strength training plan with {days} training days per week, about {minutes} minutes each.\n"
        f"Goal: {goal or 'general strength and muscle'}. Nutrition phase: {phase or 'unknown'} "
        "(in a cut keep volume moderate, in a bulk it can be higher).\n"
        f"Restrictions and wishes from the user: {notes or 'none'}.\n"
        "Use ONLY exercises from this list, referenced by their id (id | name | main muscles):\n"
        f"{listing}\n"
        f"Per day at most {MAX_EXERCISES_PER_DAY} exercises, 2 to 6 sets each, a sensible repetition range (reps_min <= reps_max). "
        "Do not repeat an exercise within a day; spread the muscle groups over the week. "
        f"Name the days in {'German' if lang.startswith('de') else 'English'}. "
        f"Answer with JSON only, in this shape: {SHAPE}"
    )


def parse_draft(text: str, known: dict[str, str]) -> list[dict[str, Any]]:
    """Validate the model's answer. [known] maps exercise id -> name. Unknown exercises, duplicates within a day and
    implausible numbers are dropped or clamped; days without exercises vanish. Raises ValueError if nothing usable is left."""
    match = re.search(r"\{.*\}", text.strip(), re.S)       # tolerate prose or code fences around the JSON
    if not match:
        raise ValueError("no JSON in the answer")
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError as err:
        raise ValueError(f"invalid JSON: {err}") from err
    days_in = data.get("days") if isinstance(data, dict) else None
    if not isinstance(days_in, list):
        raise ValueError("no days in the answer")
    out: list[dict[str, Any]] = []
    for day in days_in[:MAX_DAYS]:
        if not isinstance(day, dict) or not isinstance(day.get("exercises"), list):
            continue
        seen: set[str] = set()
        exercises = []
        for x in day["exercises"]:
            if not isinstance(x, dict) or x.get("id") not in known or x["id"] in seen:
                continue
            seen.add(x["id"])
            sets = _clamp(x.get("sets"), 2, 6, 3)
            lo = _clamp(x.get("reps_min"), 1, 30, 8)
            hi = max(lo, _clamp(x.get("reps_max"), 1, 40, 12))
            exercises.append({"id": x["id"], "name": known[x["id"]], "sets": sets, "reps_min": lo, "reps_max": hi})
            if len(exercises) >= MAX_EXERCISES_PER_DAY:
                break
        if exercises:
            out.append({"name": str(day.get("name") or f"Day {len(out) + 1}")[:40], "exercises": exercises})
    if not out:
        raise ValueError("the answer contained no usable exercises")
    return out


def _clamp(value: Any, lo: int, hi: int, default: int) -> int:
    try:
        return max(lo, min(hi, int(value)))
    except (TypeError, ValueError):
        return default
