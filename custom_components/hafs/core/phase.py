"""Nutrition phase (bulk / maintain / cut) from MyDietAssistant's sensors.

Order (MDA.md): manual choice in HAFS -> MDA `goal_mode` -> MDA `energy_balance`
-> the last phase that was known -> '' (treated like maintain by the progression).
"""
from __future__ import annotations

GOAL_MODE_TO_PHASE = {"lose": "cut", "maintain": "maintain", "gain": "bulk"}
PHASES = ("bulk", "maintain", "cut")
BALANCE_THRESHOLD = 200.0  # kcal per day: below -200 = cut, above +200 = bulk
_BAD = {"unknown", "unavailable", "none", ""}


def from_goal_mode(value: object) -> str | None:
    """`lose` | `maintain` | `gain` (state of sensor.mydiet_<name>_goal_mode) -> phase."""
    if not isinstance(value, str):
        return None
    return GOAL_MODE_TO_PHASE.get(value.strip().lower())


def from_balance(value: object, threshold: float = BALANCE_THRESHOLD) -> str | None:
    """Estimated daily kcal balance (state of sensor.mydiet_<name>_energy_balance) -> phase."""
    if value is None or (isinstance(value, str) and value.strip().lower() in _BAD):
        return None
    try:
        kcal = float(value)
    except (TypeError, ValueError):
        return None
    if kcal != kcal:  # NaN
        return None
    if kcal < -threshold:
        return "cut"
    if kcal > threshold:
        return "bulk"
    return "maintain"


def resolve(manual: str | None, goal_mode: object, balance: object, last_known: str | None = None) -> tuple[str, str]:
    """Returns (phase, source); source is manual | goal_mode | energy_balance | last_known | none."""
    if manual in PHASES:
        return manual, "manual"
    if (p := from_goal_mode(goal_mode)):
        return p, "goal_mode"
    if (p := from_balance(balance)):
        return p, "energy_balance"
    if last_known in PHASES:
        return last_known, "last_known"
    return "", "none"
