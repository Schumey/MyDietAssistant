"""v1.4: body weight from a Home Assistant sensor, e.g. a smart scale (optional feature "scale")."""
import re
from datetime import date, datetime, timedelta

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from extras import feature_on, get_pref, ha_get, set_pref
from extras2 import owners
from main import SUPERVISOR_TOKEN, app, publish, user_from

UNIT_KG = {"kg": 1.0, "g": 0.001, "lb": 0.45359237, "lbs": 0.45359237, "st": 6.35029318}
MAX_AGE_DAYS = 30   # an old reading left in the sensor is still a real measurement of its own day, but not an ancient one
DEFAULT_SCALE = {"entity": "", "unit": "auto"}


def scale_config(owner: str) -> dict:
    return {**DEFAULT_SCALE, **(get_pref(owner, "scale", {}) or {})}


def to_kg(value: float, unit: str, attrs: dict) -> float | None:
    """Kilograms from a sensor value; unit "auto" follows the sensor's own unit_of_measurement (kg when it has none)."""
    if unit == "auto":
        unit = str(attrs.get("unit_of_measurement") or "kg").strip().lower()
    f = UNIT_KG.get(unit)
    if f is None:
        return None
    kg = value * f
    return round(kg, 2) if 20 <= kg <= 500 else None


def local_day(stamp: str) -> date:
    return datetime.fromisoformat(stamp.replace("Z", "+00:00")).astimezone().date()


def read_scale(owner: str, force: bool = False) -> dict:
    """Look at the sensor once. A new reading (its last_updated differs from the one already stored) is only written after it
    stayed the same for one more look, so a scale that is still settling does not leave intermediate values; force skips that wait.
    The weight is stored for the local day of the reading."""
    cfg = scale_config(owner)
    if not cfg["entity"]:
        return {"status": "no_sensor"}
    try:
        st = ha_get(f"states/{cfg['entity']}")
        value, stamp = float(st["state"]), st["last_updated"]
    except httpx.HTTPError:
        return {"status": "unreachable"}
    except (ValueError, KeyError, TypeError):
        return {"status": "unavailable"}   # "unknown", "unavailable", no number
    kg = to_kg(value, cfg["unit"], st.get("attributes") or {})
    if kg is None:
        return {"status": "out_of_range", "value": value}
    state = get_pref(owner, "scale_state", {}) or {}
    if stamp == state.get("done"):
        return {"status": "up_to_date", "last": state.get("last")}
    if not force and state.get("seen") != stamp:
        set_pref(owner, "scale_state", {**state, "seen": stamp})
        return {"status": "waiting", "kg": kg}
    day = local_day(stamp)
    if not date.today() - timedelta(days=MAX_AGE_DAYS) <= day <= date.today():
        set_pref(owner, "scale_state", {**state, "seen": stamp, "done": stamp})
        return {"status": "too_old", "day": day.isoformat()}
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, day.isoformat(), kg))
    last = {"day": day.isoformat(), "kg": kg}
    set_pref(owner, "scale_state", {"seen": stamp, "done": stamp, "last": last})
    publish(owner, get_pref(owner, "display", owner))
    return {"status": "saved", "last": last}


class ScaleConfigIn(BaseModel):
    entity: str = ""
    unit: str = "auto"


@app.get("/api/scale")
def get_scale(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    return {"config": scale_config(owner), "last": (get_pref(owner, "scale_state", {}) or {}).get("last")}


@app.put("/api/scale")
def put_scale(s: ScaleConfigIn, x_remote_user_id: str | None = Header(None)):
    if s.entity and not re.fullmatch(r"[a-z_]+\.[a-z0-9_]+", s.entity):
        raise HTTPException(400, "Ungültige Entität")
    if s.unit != "auto" and s.unit not in UNIT_KG:
        raise HTTPException(400, "Ungültige Einheit")
    owner = user_from(x_remote_user_id)
    old = scale_config(owner)
    set_pref(owner, "scale", {"entity": s.entity, "unit": s.unit})
    if s.entity != old["entity"]:   # another sensor: its current reading counts as new
        set_pref(owner, "scale_state", {})
    return {"ok": True}


@app.post("/api/scale/read")
def read_scale_now(x_remote_user_id: str | None = Header(None)):
    """Take over the sensor's current reading now (button in the settings)."""
    if not SUPERVISOR_TOKEN:
        raise HTTPException(503, "Nur im Home-Assistant-Add-on möglich")
    return read_scale(user_from(x_remote_user_id), force=True)


def sync_scale():
    if not SUPERVISOR_TOKEN:
        return
    for o in owners():
        if feature_on(o, "scale") and scale_config(o)["entity"]:
            read_scale(o)


import extras2  # noqa: E402

extras2.EXTRA_JOBS.append(sync_scale)
