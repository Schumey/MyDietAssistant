"""v1.23: step plan (optional feature "ramp"): the daily goal rises or falls in fixed steps every few days,
e.g. a reverse diet (+100 kcal per week) or a slow cut (-5 g carbs per week)."""
from datetime import date, timedelta

from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from extras import feature_on, get_pref, set_pref
from main import GOAL_HOOKS, app, get_goal, user_from

KEYS = ("kcal", "protein", "carbs", "fat")
LIMITS = {"kcal": 1000.0, "protein": 100.0, "carbs": 300.0, "fat": 100.0}   # largest allowed step per interval (absolute)
PREVIEW_STEPS = 12


def ramp_config(owner: str) -> dict | None:
    r = get_pref(owner, "ramp", None)
    return r if isinstance(r, dict) and r.get("start") else None


def step_at(cfg: dict, day: date) -> int:
    """How many steps are applied on a day: 0 until the first interval is over, capped by max_steps (0 = no cap)."""
    n = max(0, (day - date.fromisoformat(cfg["start"])).days // cfg["every_days"])
    return min(n, cfg["max_steps"]) if cfg["max_steps"] else n


def apply_steps(g: dict, cfg: dict, n: int) -> dict:
    """Macros without a goal (0) stay without one; nothing drops below 0."""
    out = dict(g)
    for k in KEYS:
        d = cfg["step"].get(k, 0)
        if d and (k == "kcal" or g[k] > 0):
            out[k] = max(0.0, g[k] + n * d)
    return out


def goal_hook(c, owner: str, day: str, g: dict):
    if not feature_on(owner, "ramp"):
        return
    cfg = ramp_config(owner)
    if not cfg or not cfg.get("active", True):
        return
    n = step_at(cfg, date.fromisoformat(day))
    g.update(apply_steps(g, cfg, n))
    g["ramp_step"] = n


GOAL_HOOKS.append(goal_hook)


class RampIn(BaseModel):
    start: str
    every_days: int = 7
    kcal: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    max_steps: int = 0


def need_feature(owner: str):
    if not feature_on(owner, "ramp"):
        raise HTTPException(403, "Funktion „Stufenplan“ ist ausgeschaltet")


@app.get("/api/ramp")
def get_ramp(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_feature(owner)
    cfg = ramp_config(owner)
    if not cfg:
        return {"config": None}
    today = date.today()
    with db.conn() as c:
        base = get_goal(c, owner)   # without a day no hook runs, so this is the plain daily goal
    n = step_at(cfg, today)
    start = date.fromisoformat(cfg["start"])
    last = cfg["max_steps"] or None
    shown = list(range(0, (last if last else PREVIEW_STEPS) + 1))
    if last and last > PREVIEW_STEPS:
        shown = shown[:PREVIEW_STEPS] + [last]
    preview = [{"step": i, "from": (start + timedelta(days=i * cfg["every_days"])).isoformat(),
                **{k: round(apply_steps(base, cfg, i)[k], 1) for k in KEYS}} for i in shown]
    done = bool(last) and n >= last
    nxt = None if done else (start + timedelta(days=(n + 1) * cfg["every_days"])).isoformat()
    return {"config": cfg, "step": n, "next_change": nxt, "done": done, "base": {k: base[k] for k in KEYS},
            "today": {k: round(apply_steps(base, cfg, n)[k], 1) for k in KEYS}, "preview": preview}


@app.put("/api/ramp")
def put_ramp(r: RampIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_feature(owner)
    try:
        date.fromisoformat(r.start)
    except ValueError:
        raise HTTPException(400, "Startdatum muss JJJJ-MM-TT sein")
    if not 1 <= r.every_days <= 60:
        raise HTTPException(400, "Abstand: 1 bis 60 Tage")
    if not 0 <= r.max_steps <= 200:
        raise HTTPException(400, "Anzahl Schritte: 0 bis 200")
    step = {k: float(getattr(r, k)) for k in KEYS}
    if all(v == 0 for v in step.values()):
        raise HTTPException(400, "Mindestens ein Schritt muss ungleich 0 sein")
    for k, v in step.items():
        if abs(v) > LIMITS[k]:
            raise HTTPException(400, "Schritt außerhalb des Bereichs")
    set_pref(owner, "ramp", {"start": r.start, "every_days": r.every_days, "step": step, "max_steps": r.max_steps, "active": True})
    return {"ok": True}


@app.delete("/api/ramp")
def delete_ramp(x_remote_user_id: str | None = Header(None)):
    """Stops the plan: the goal returns to the plain daily goal."""
    owner = user_from(x_remote_user_id)
    need_feature(owner)
    set_pref(owner, "ramp", None)
    return {"ok": True}
