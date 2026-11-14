"""Training review: which exercises stagnate and which muscle groups are trained less than before.

Pure and rule based (no AI). The optional AI step only phrases advice from the facts found here; what is
sent to it is built by `build_instructions` (names and numbers of exercises and muscle groups, no personal data).
"""
from __future__ import annotations

import sqlite3
from datetime import date, timedelta

from . import status as st

WINDOW_WEEKS = 6        # the recent period that is looked at
MIN_SESSIONS = 4        # sessions with the exercise in that period, otherwise there is no trend to speak of
MIN_BEFORE = 2          # sessions before the period, to know what the best was
MUSCLE_DROP = 0.6       # a muscle group below this share of its earlier weekly average counts as neglected
MIN_EARLIER_SETS = 6.0  # weekly sets earlier, below that a drop is noise


def _day(text: str | None) -> date | None:
    try:
        return date.fromisoformat((text or "")[:10])
    except ValueError:
        return None


def stagnation(conn: sqlite3.Connection, owner: str, today: date, window_weeks: int = WINDOW_WEEKS) -> list[dict]:
    """Exercises with at least MIN_SESSIONS sessions in the last `window_weeks` weeks and no new best (estimated 1RM,
    or heaviest weight without a 1RM) in that period compared with everything before. Most sessions first."""
    start = today - timedelta(weeks=window_weeks)
    sessions: dict[tuple[str, str], dict] = {}
    names: dict[str, str] = {}
    for r in conn.execute(
            "SELECT s.exercise_id, e.name, s.workout_id, w.started_at, s.weight, s.reps FROM workout_set s "
            "JOIN exercise e ON e.id=s.exercise_id JOIN workout w ON w.id=s.workout_id "
            "WHERE s.owner=? AND s.deleted=0 AND w.deleted=0 AND s.kind!='warmup' AND e.kind IN ('strength','bodyweight') "
            "AND e.deleted=0", (owner,)):
        d = _day(r["started_at"])
        if d is None or d > today:
            continue
        names[r["exercise_id"]] = r["name"]
        e = sessions.setdefault((r["exercise_id"], r["workout_id"]), {"day": d, "e1rm": 0.0, "weight": 0.0})
        e["e1rm"] = max(e["e1rm"], st._e1rm(r["weight"], r["reps"]))
        e["weight"] = max(e["weight"], r["weight"] or 0.0)
    per: dict[str, list[dict]] = {}
    for (eid, _), e in sessions.items():
        per.setdefault(eid, []).append(e)
    out = []
    for eid, items in per.items():
        recent = [e for e in items if e["day"] > start]
        before = [e for e in items if e["day"] <= start]
        if len(recent) < MIN_SESSIONS or len(before) < MIN_BEFORE:
            continue
        key = "e1rm" if any(e["e1rm"] > 0 for e in items) else "weight"
        best_before = max(e[key] for e in before)
        best_recent = max(e[key] for e in recent)
        if best_before <= 0 or best_recent > best_before:
            continue
        out.append({"exercise_id": eid, "name": names[eid], "sessions": len(recent), "weeks": window_weeks,
                    "metric": key, "best": round(best_before, 1), "recent_best": round(best_recent, 1)})
    out.sort(key=lambda x: (-x["sessions"], x["name"].lower()))
    return out


def neglected_muscles(weekly: dict, recent_weeks: int = 4) -> list[dict]:
    """From `webview.muscle_weeks`: muscle groups whose weekly sets of the last `recent_weeks` full weeks
    (the running week is left out) are below MUSCLE_DROP of the average of the weeks before."""
    out = []
    for muscle, series in weekly.get("muscles", {}).items():
        done = series[:-1]
        if len(done) <= recent_weeks:
            continue
        recent, earlier = done[-recent_weeks:], done[:-recent_weeks]
        avg_recent, avg_earlier = sum(recent) / len(recent), sum(earlier) / len(earlier)
        if avg_earlier >= MIN_EARLIER_SETS and avg_recent < avg_earlier * MUSCLE_DROP:
            out.append({"muscle": muscle, "recent": round(avg_recent, 1), "earlier": round(avg_earlier, 1)})
    out.sort(key=lambda x: x["recent"] / x["earlier"])
    return out


def build_instructions(stagnating: list[dict], neglected: list[dict], phase: str, lang: str = "de") -> str:
    """Prompt for the AI: phrase short, practical advice. Only exercise and muscle names and numbers go in."""
    de = lang.lower().startswith("de")
    lines = []
    for x in stagnating[:12]:
        lines.append(f"- {x['name']}: {x['sessions']} sessions in {x['weeks']} weeks, no new best ({x['best']} kg)")
    for x in neglected[:8]:
        lines.append(f"- muscle group {x['muscle']}: {x['recent']} sets/week lately, {x['earlier']} before")
    head = ("Du bist ein Krafttrainings-Coach. Fasse in höchstens 6 kurzen Sätzen zusammen, was auffällt, und gib je Punkt einen "
            "praktischen Vorschlag (Gewicht, Wiederholungen, Pause, Übungsvariante, Volumen). Keine medizinischen Aussagen. "
            "Antworte auf Deutsch." if de else
            "You are a strength coach. Summarise in at most 6 short sentences what stands out and give one practical suggestion per point "
            "(weight, reps, rest, exercise variation, volume). No medical statements. Answer in English.")
    phase_line = {"cut": "Ernährungsphase: Diät (Kraft halten ist ein Erfolg)." if de else "Nutrition phase: cutting (holding strength is a success).",
                  "bulk": "Ernährungsphase: Masseaufbau." if de else "Nutrition phase: bulking.",
                  "maintain": "Ernährungsphase: Halten." if de else "Nutrition phase: maintenance."}.get(phase, "")
    return "\n".join([head, phase_line, "Befunde:" if de else "Findings:", *lines])


def review(conn: sqlite3.Connection, owner: str, today: date, weekly: dict, phase: str = "") -> dict:
    stag = stagnation(conn, owner, today)
    neglected = neglected_muscles(weekly)
    return {"stagnating": stag, "neglected": neglected, "phase": phase}
