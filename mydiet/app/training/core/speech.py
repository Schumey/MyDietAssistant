"""Spoken answers for Assist (pure functions, German and English)."""

from __future__ import annotations

from datetime import date, datetime

_TEXT = {
    "de": {
        "next": "Heute steht {routine} an: {exercises}.",
        "next_short": "Heute steht {routine} an.",
        "next_none": "Es gibt noch keinen Trainingsplan.",
        "last_today": "Du hast heute schon trainiert.",
        "last_yesterday": "Du warst gestern zuletzt trainieren.",
        "last_days": "Dein letztes Training war vor {n} Tagen.",
        "last_none": "Ich kenne noch kein Training von Dir.",
    },
    "en": {
        "next": "Today is {routine}: {exercises}.",
        "next_short": "Today is {routine}.",
        "next_none": "There is no training plan yet.",
        "last_today": "You already trained today.",
        "last_yesterday": "You last trained yesterday.",
        "last_days": "Your last workout was {n} days ago.",
        "last_none": "I don't know of any workout yet.",
    },
}


def _t(lang: str) -> dict[str, str]:
    return _TEXT.get(lang[:2].lower(), _TEXT["en"])


def next_workout(state: dict, lang: str, limit: int = 4) -> str:
    """Answer to "what do I train today?" from `status()["next"]`."""
    t = _t(lang)
    nxt = state.get("next")
    if not nxt:
        return t["next_none"]
    exercises = nxt.get("exercises") or []
    if not exercises:
        return t["next_short"].format(routine=nxt["routine"])
    return t["next"].format(routine=nxt["routine"], exercises=", ".join(exercises[:limit]))


def last_workout(state: dict, today: date, lang: str) -> str:
    """Answer to "when did I last train?" from `status()["last_workout_at"]` (ISO timestamp)."""
    t = _t(lang)
    stamp = state.get("last_workout_at")
    if not stamp:
        return t["last_none"]
    days = (today - datetime.fromisoformat(stamp).date()).days
    if days <= 0:
        return t["last_today"]
    if days == 1:
        return t["last_yesterday"]
    return t["last_days"].format(n=days)
