"""v1.17: gaps in fiber, sugar, salt and saturated fat over the last days against reference goals (optional feature "micros")."""
from datetime import date, timedelta

from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from extras import feature_on, get_pref, set_pref
from main import app, check_day, user_from

# "min": reach at least this much per day; "max": stay below. Everyday reference values, adjustable per user.
MICRO_KINDS = {"fiber": "min", "sugar": "max", "salt": "max", "sat_fat": "max"}
MICRO_DEFAULTS = {"fiber": 30.0, "sugar": 50.0, "salt": 6.0, "sat_fat": 20.0}
OK_BAND = 5      # within this many percent of the goal counts as on target


def micro_goals(owner: str) -> dict:
    saved = get_pref(owner, "micro_goals", {}) or {}
    return {k: float(saved[k]) if isinstance(saved.get(k), (int, float)) and 0 < saved[k] <= 1000 else d for k, d in MICRO_DEFAULTS.items()}


def gaps(c, owner: str, end: date, days: int) -> dict:
    """Average per logged day (only days where the nutrient is known, i.e. above 0) against the goal."""
    start = end - timedelta(days=days - 1)
    goals = micro_goals(owner)
    rows = c.execute("SELECT day, SUM(fiber) fiber, SUM(sugar) sugar, SUM(salt) salt, SUM(sat_fat) sat_fat, COUNT(*) n FROM entries"
                     " WHERE owner=? AND day BETWEEN ? AND ? GROUP BY day", (owner, start.isoformat(), end.isoformat())).fetchall()
    items = []
    for key, kind in MICRO_KINDS.items():
        known = [r[key] for r in rows if (r[key] or 0) > 0]
        avg = sum(known) / len(known) if known else None
        item = {"key": key, "kind": kind, "goal": goals[key], "avg": round(avg, 1) if avg is not None else None, "known_days": len(known),
                "delta_pct": None, "status": "unknown"}
        if avg is not None and len(known) * 2 >= len(rows):       # values are missing for too many days to say anything
            delta = (avg - goals[key]) / goals[key] * 100
            item["delta_pct"] = round(delta)
            bad = delta < -OK_BAND if kind == "min" else delta > OK_BAND
            item["status"] = ("low" if kind == "min" else "high") if bad else "ok"
        items.append(item)
    return {"from": start.isoformat(), "to": end.isoformat(), "days": days, "logged": len(rows), "items": items, "goals": goals}


@app.get("/api/micros/gaps")
def micro_gaps(end: str | None = None, days: int = 7, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    if not feature_on(owner, "micros"):
        raise HTTPException(403, "Weitere Nährwerte sind nicht aktiviert")
    end = end or date.today().isoformat()
    check_day(end)
    with db.conn() as c:
        return gaps(c, owner, date.fromisoformat(end), max(1, min(days, 90)))


class MicroGoalsIn(BaseModel):
    fiber: float
    sugar: float
    salt: float
    sat_fat: float


@app.put("/api/micros/goals")
def put_micro_goals(g: MicroGoalsIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    vals = g.model_dump()
    if not all(0 < v <= 1000 for v in vals.values()):
        raise HTTPException(400, "Ziele müssen zwischen 0 und 1000 liegen")
    set_pref(owner, "micro_goals", vals)
    return {"ok": True}
