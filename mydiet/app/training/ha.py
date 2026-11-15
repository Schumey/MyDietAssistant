"""Training and Home Assistant: entities, events, zone, AI and the background job (formerly the integration's hub).

Everything goes through the Supervisor's proxy to the HA REST API (`http://supervisor/core/api`, token SUPERVISOR_TOKEN):
- entities `sensor.hafs_<name>_*` and `binary_sensor.hafs_<name>_workout_active` per user, as plain states or (option
  `mqtt_discovery`) as MQTT entities with unique id, like the nutrition sensors. <name> follows MDA's rule (display name,
  everything but a-z0-9 -> "_").
- events `hafs_workout_started`, `hafs_workout_finished`, `hafs_record` after a push (`POST events/<type>`).
- the zone of the user's person entity (`GET states`), the AI task (`POST services/ai_task/generate_data?return_response`).
Without SUPERVISOR_TOKEN (local development, tests) nothing is sent and zone/AI report that HA is missing.
"""
from __future__ import annotations

import json
import re
import threading
import time
from datetime import date, datetime

import httpx

import main
from extras import feature_on, get_pref
from training.core import zones as zones_mod

from training import api

# key -> (domain, label, unit, device_class, icon, state_class)
ENTITIES = {
    "training_state": ("sensor", "training state", "", "enum", "mdi:dumbbell", ""),
    "workouts_today": ("sensor", "workouts today", "", "", "mdi:counter", "measurement"),
    "workouts_week": ("sensor", "workouts this week", "", "", "mdi:calendar-week", "measurement"),
    "volume_week": ("sensor", "volume this week", "kg", "", "mdi:weight-lifter", "measurement"),
    "last_workout": ("sensor", "last workout", "", "timestamp", "mdi:history", ""),
    "next_routine": ("sensor", "next routine", "", "", "mdi:format-list-checks", ""),
    "phase": ("sensor", "phase", "", "enum", "mdi:scale-bathroom", ""),
    "workout_active": ("binary_sensor", "workout active", "", "", "mdi:dumbbell", ""),
}
OPTIONS_OF = {"training_state": ["none", "active", "done"], "phase": ["bulk", "maintain", "cut"]}
REFRESH_S = 30 * 60          # states are sent again after this long even when unchanged (a restarted HA forgets REST states)

_sent: dict[str, tuple[str, float]] = {}     # owner -> (fingerprint, time) of the last publish
_discovered: set[str] = set()                # MQTT discovery topics announced in this process
_lock = threading.Lock()


def enabled() -> bool:
    return bool(main.SUPERVISOR_TOKEN)


def _get(path: str, **params):
    r = httpx.get(f"http://supervisor/core/api/{path}", params=params, timeout=8,
                  headers={"Authorization": f"Bearer {main.SUPERVISOR_TOKEN}"})
    r.raise_for_status()
    return r.json()


def _post(path: str, body: dict, timeout: float = 5):
    r = httpx.post(f"http://supervisor/core/api/{path}", json=body, timeout=timeout,
                   headers={"Authorization": f"Bearer {main.SUPERVISOR_TOKEN}"})
    r.raise_for_status()
    return r.json() if r.content else None


def slug_of(owner: str) -> str:
    """The <name> in entity ids, the same rule as the nutrition sensors (main.publish)."""
    display = get_pref(owner, "display", owner) or owner
    return re.sub(r"[^a-z0-9]+", "_", display.lower()).strip("_") or "default"


# ---- entities --------------------------------------------------------------------------------

def values(owner: str) -> dict[str, tuple[str, dict]]:
    """key -> (state, attributes) of all training entities of [owner]."""
    now = datetime.now().astimezone()
    st = api.store.status(owner, now, now.tzinfo)
    phase = api.refresh_phase(owner)
    nxt = st.get("next") or {}
    last = st.get("last") or {}
    last_at = st.get("last_workout_at")
    return {
        "training_state": (st.get("state", "none"), st.get("attrs", {})),
        "workouts_today": (str(st.get("workouts_today", 0)), {}),
        "workouts_week": (str(st.get("workouts_week", 0)), {}),
        "volume_week": (str(st.get("volume_week_kg", 0)), {}),
        "last_workout": (last_at or "unknown",
                         {k: last[k] for k in ("duration_min", "volume_kg", "sets", "kcal_estimate", "routine") if k in last}),
        "next_routine": (nxt.get("routine") or "unknown", {"program": nxt.get("program"), "exercises": nxt.get("exercises", [])}),
        "phase": (phase["phase"] or "unknown", {"source": phase["source"]}),
        "workout_active": ("on" if st.get("active") else "off", {}),
    }


def _attrs(display: str, key: str) -> dict:
    _, label, unit, dclass, icon, sclass = ENTITIES[key]
    out = {"friendly_name": f"HAFS {display} {label}", "icon": icon}
    if unit:
        out["unit_of_measurement"] = unit
    if dclass:
        out["device_class"] = dclass
    if key in OPTIONS_OF:
        out["options"] = OPTIONS_OF[key]
    if sclass:
        out["state_class"] = sclass
    return out


def _mqtt(slug: str, display: str, key: str, state: str, extra: dict) -> None:
    domain, label, unit, dclass, icon, sclass = ENTITIES[key]
    object_id = f"hafs_{slug}_{key}"
    topic = f"hafs/{slug}/{key}"
    if object_id not in _discovered:
        cfg = {"name": f"HAFS {display} {label}", "unique_id": object_id, "default_entity_id": f"{domain}.{object_id}",
               "state_topic": topic, "json_attributes_topic": f"{topic}/attributes", "icon": icon,
               "device": {"identifiers": [f"hafs_{slug}"], "name": f"HAFS {display}", "manufacturer": "HAFS"}}
        if domain == "binary_sensor":
            cfg.update(payload_on="on", payload_off="off")
        if unit:
            cfg["unit_of_measurement"] = unit
        if dclass:
            cfg["device_class"] = dclass
        if key in OPTIONS_OF:
            cfg["options"] = OPTIONS_OF[key]
        if sclass:
            cfg["state_class"] = sclass
        _post("services/mqtt/publish", {"topic": f"homeassistant/{domain}/{object_id}/config", "payload": json.dumps(cfg), "retain": True})
        _discovered.add(object_id)
    # MQTT sensors know no "unknown" state: an empty payload (None for timestamps/enums) clears the value
    payload = "None" if state == "unknown" else state
    _post("services/mqtt/publish", {"topic": topic, "payload": payload, "retain": True})
    _post("services/mqtt/publish", {"topic": f"{topic}/attributes", "payload": json.dumps(extra), "retain": True})


def publish(owner: str, force: bool = False) -> bool:
    """Send the training entities of [owner] to HA when they changed (or REFRESH_S passed). Returns True when sent."""
    if not enabled() or not main.OPTIONS.get("publish_sensors", True) or not feature_on(owner, "training"):
        return False
    vals = values(owner)
    fingerprint = json.dumps(vals, sort_keys=True, default=str)
    with _lock:
        last = _sent.get(owner)
        if not force and last and last[0] == fingerprint and time.time() - last[1] < REFRESH_S:
            return False
        _sent[owner] = (fingerprint, time.time())
    display = get_pref(owner, "display", owner) or owner
    slug = slug_of(owner)
    use_mqtt = bool(main.OPTIONS.get("mqtt_discovery"))
    for key, (state, extra) in vals.items():
        domain = ENTITIES[key][0]
        try:
            if use_mqtt:
                try:
                    _mqtt(slug, display, key, state, extra)
                    continue
                except httpx.HTTPError:   # no MQTT integration: plain state for this entity
                    _discovered.discard(f"hafs_{slug}_{key}")
            _post(f"states/{domain}.hafs_{slug}_{key}", {"state": state, "attributes": {**_attrs(display, key), **extra}})
        except httpx.HTTPError as e:
            print(f"[training] publish {key}: {e!r}", flush=True)
    return True


# ---- events ----------------------------------------------------------------------------------

def fire_events(owner: str, events: list[dict]) -> None:
    for ev in events:
        try:
            _post(f"events/hafs_{ev['event']}", {"user_id": owner, **ev["data"]})
        except httpx.HTTPError as e:
            print(f"[training] event {ev['event']}: {e!r}", flush=True)


def after_push(owner: str, events: list[dict]) -> None:
    """Hook of api.AFTER_PUSH: events and fresh entities, in a thread so the app's sync does not wait for HA."""
    if not enabled():
        return
    threading.Thread(target=lambda: (fire_events(owner, events), publish(owner, force=True)), daemon=True).start()


def after_change(owner: str) -> None:
    """Hook of api.AFTER_CHANGE (settings, targets, import): entities follow at once."""
    if enabled():
        threading.Thread(target=publish, args=(owner, True), daemon=True).start()


# ---- zone ------------------------------------------------------------------------------------

def current_zone(owner: str) -> str | None:
    """Zone entity id the user's person entity is in (None when away, unknown or without HA)."""
    if not enabled():
        return None
    try:
        states = _get("states")
    except (httpx.HTTPError, ValueError):
        return None
    zones = {}
    for s in states:
        if s["entity_id"].startswith("zone."):
            zones[s["entity_id"].split(".", 1)[1]] = s["entity_id"]
            if name := s.get("attributes", {}).get("friendly_name"):
                zones[name] = s["entity_id"]
    for s in states:
        if s["entity_id"].startswith("person.") and s.get("attributes", {}).get("user_id") == owner:
            return zones_mod.zone_entity(s["state"], zones)
    return None


def zone_list() -> list[dict]:
    """Zones for the gym editor (entity id and name)."""
    if not enabled():
        return []
    try:
        return sorted(({"entity_id": s["entity_id"], "name": s.get("attributes", {}).get("friendly_name", "")}
                       for s in _get("states") if s["entity_id"].startswith("zone.")), key=lambda z: z["entity_id"])
    except (httpx.HTTPError, ValueError):
        return []


# ---- AI --------------------------------------------------------------------------------------

def ai_generate(task_name: str, instructions: str, structure: dict, entity_id: str | None = None) -> dict:
    """Run `ai_task.generate_data` and return its `data` (a dict for structured answers). Raises ValueError."""
    if not enabled():
        raise ValueError("Home Assistant has no AI task set up (ai_task)")
    try:
        services = _get("services")
    except (httpx.HTTPError, ValueError) as err:
        raise ValueError(f"Home Assistant not reachable: {err}") from err
    if not any(d.get("domain") == "ai_task" and "generate_data" in (d.get("services") or {}) for d in services):
        raise ValueError("Home Assistant has no AI task set up (ai_task)")
    body = {"task_name": task_name, "instructions": instructions, "structure": structure}
    if entity_id:
        body["entity_id"] = entity_id
    try:
        r = httpx.post("http://supervisor/core/api/services/ai_task/generate_data?return_response", json=body, timeout=120,
                       headers={"Authorization": f"Bearer {main.SUPERVISOR_TOKEN}"})
        r.raise_for_status()
        result = r.json()
    except (httpx.HTTPError, ValueError) as err:
        raise ValueError(f"AI request failed: {err}") from err
    response = (result or {}).get("service_response") or {}
    return response.get("data") if isinstance(response.get("data"), (dict, str)) else response


# ---- background job --------------------------------------------------------------------------

_day = {"date": None}


def training_owners() -> list[str]:
    """Users with the feature on: known HA users (users table), diary owners and owners of workouts."""
    import db
    import extras2
    with db.conn() as c:
        known = {r[0] for r in c.execute("SELECT id FROM users")}
    return sorted(o for o in known | set(extras2.owners()) | set(api.store.owners()) if feature_on(o, "training"))


def job() -> None:
    """Every minute (extras2.maintenance_loop): after midnight recompute the targets (break days count from today),
    keep the phase in line with the nutrition goal and send the entities when they changed."""
    today = date.today()
    new_day = _day["date"] != today
    _day["date"] = today
    for owner in training_owners():
        if new_day:
            api.store.recompute_targets(owner)
        if enabled():
            publish(owner)


def setup() -> None:
    import extras2
    api.AFTER_PUSH.append(after_push)
    api.AFTER_CHANGE.append(after_change)
    api.HA.update(zone=current_zone, zones=zone_list, ai=ai_generate)
    extras2.EXTRA_JOBS.append(job)


setup()
