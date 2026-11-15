"""Training (HAFS) inside the app: one HTTP endpoint that answers the messages the HAFS integration took over WebSocket.

    POST api/training/call   body {"type": "hafs/sync/pull", ...}   -> the same result the WebSocket command returned

Errors come back as {"code": ..., "message": ...} like Home Assistant's WebSocket errors: 400 invalid_format,
403 not_enabled (feature `training` off), 404 unknown_command. The data lives in its own file (`hafs.db` next to
`mydiet.db`, or `HAFS_DB`), because the Flutter app's schema is generated from exactly these migrations.

Not wired to Home Assistant yet (stage 4): AI review/plan, zone of the person entity, entities and events.
Events of a push are handed to AFTER_PUSH hooks (owner, events), so that part can attach later.
"""
from __future__ import annotations

import os
from datetime import date, datetime
from typing import Any, Callable

from fastapi import Body, Header
from fastapi.responses import JSONResponse

import db as mda_db
from main import app, day_totals, user_from
from extras import feature_on, get_pref as mda_pref

from training.core import catalog, phase as phase_mod, sync, targets, webview
from training.core.store import Store

API_VERSION = 1   # bumped when the call API changes incompatibly (same number the integration used)
DB_PATH = os.environ.get("HAFS_DB") or os.path.join(os.path.dirname(os.path.abspath(mda_db.DB_PATH)), "hafs.db")

store = Store(DB_PATH)
store.init()

AFTER_PUSH: list[Callable[[str, list[dict]], None]] = []   # (owner, events) after a push that changed something
PREF_KEYS = ("phase", *targets.SETTING_KEYS, *targets.OTHER_KEYS)
WEB_QUERIES = sorted(webview.QUERIES)


class CallError(Exception):
    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status, self.code = status, code


def _bad(message: str) -> CallError:
    return CallError(400, "invalid_format", message)


# ---- argument checks (the voluptuous schemas of the integration) ----------------------------

def _opt(msg: dict, key: str, kind: type | tuple, default: Any) -> Any:
    value = msg.get(key, default)
    if kind is int and isinstance(value, bool) or not isinstance(value, kind):
        raise _bad(f"{key} has the wrong type")
    return value


def _req(msg: dict, key: str, kind: type | tuple) -> Any:
    if key not in msg:
        raise _bad(f"{key} is required")
    return _opt(msg, key, kind, None)


def _int_range(msg: dict, key: str, lo: int, hi: int, default: int | None = None) -> int:
    value = _req(msg, key, int) if default is None else _opt(msg, key, int, default)
    if not lo <= value <= hi:
        raise _bad(f"{key} must be between {lo} and {hi}")
    return value


def _text(msg: dict, key: str, max_len: int, default: str = "") -> str:
    value = _opt(msg, key, str, default)
    if len(value) > max_len:
        raise _bad(f"{key} is too long")
    return value


# ---- phase from the nutrition goal ----------------------------------------------------------

def refresh_phase(owner: str) -> dict:
    """Manual choice -> nutrition goal (`goal_mode` set in the settings) -> last known. The integration read MDA's
    goal_mode/energy_balance sensors; here the goal comes straight from the nutrition preferences. Only an explicitly
    chosen goal counts (MDA's default "lose" would put every training-only user into a cut)."""
    manual = store.get_pref(owner, "phase")
    last = store.get_pref(owner, "phase_auto")
    value, source = phase_mod.resolve(manual, mda_pref(owner, "goal_mode", None), None, last)
    if source == "goal_mode" and value in targets.PHASE_VALUES[1:]:
        store.set_auto_phase(owner, value)
    return {"phase": value, "source": source}


def _now() -> datetime:
    return datetime.now().astimezone()   # the process time zone follows HA (extras2.sync_timezone)


# ---- the commands ---------------------------------------------------------------------------

def c_info(owner: str, msg: dict) -> dict:
    return {"api_version": API_VERSION, "version": APP_VERSION, "ready": True, "user_id": owner, **store.info()}


def c_sync_push(owner: str, msg: dict) -> dict:
    records = _req(msg, "records", dict)
    for table, rows in records.items():
        if not isinstance(table, str) or not isinstance(rows, list) or not all(isinstance(r, dict) for r in rows):
            raise _bad("records must map table names to lists of records")
    result, events = store.push_ex(owner, records)
    if result["applied"]:
        for hook in AFTER_PUSH:
            hook(owner, events)
    return result


def c_sync_pull(owner: str, msg: dict) -> dict:
    cursors = _opt(msg, "cursors", dict, {})
    for table, cur in cursors.items():
        if not (isinstance(cur, dict) and isinstance(cur.get("at"), str) and isinstance(cur.get("id"), str)):
            raise _bad(f"cursor of {table} needs at and id")
    limit = _int_range(msg, "limit", 1, 10000, sync.DEFAULT_PULL_LIMIT)
    refresh_phase(owner)
    return store.pull(owner, cursors or None, limit)


def c_catalog_info(owner: str, msg: dict) -> dict:
    return catalog.info()


def _pref_key(msg: dict) -> str:
    key = _req(msg, "key", str)
    if key not in PREF_KEYS:
        raise _bad(f"unknown key {key}")
    return key


def c_pref_get(owner: str, msg: dict) -> dict:
    key = _pref_key(msg)
    return {"key": key, "value": store.get_pref(owner, key)}


def c_pref_set(owner: str, msg: dict) -> dict:
    key, value = _pref_key(msg), _req(msg, "value", str)
    if not targets.valid_pref(key, value):
        raise _bad(f"invalid value for {key}")
    result = store.set_pref(owner, key, value)
    if key == "phase":
        refresh_phase(owner)   # back to automatic: the goal applies again
    return {"key": key, "value": value, "targets": result}


def c_target_set(owner: str, msg: dict) -> dict:
    exercise_id = _req(msg, "exercise_id", str)
    weight = _req(msg, "weight", (int, float))
    if isinstance(weight, bool) or not 0 <= weight <= 1000:
        raise _bad("weight must be between 0 and 1000")
    return {"written": store.set_target(owner, exercise_id, float(weight))}


def c_targets_recompute(owner: str, msg: dict) -> dict:
    refresh_phase(owner)
    return store.recompute_targets(owner)


def c_gym_current(owner: str, msg: dict) -> dict:
    zone = None   # stage 4: zone of the user's person entity over the HA API
    return {"zone": zone, **(store.gym_for_zone(owner, zone) or {"gym_id": None, "gym": None})}


def c_intake_hint(owner: str, msg: dict) -> dict:
    """"Little eaten today" before training, straight from the nutrition diary (no sensors involved)."""
    with mda_db.conn() as c:
        t = day_totals(c, owner, date.today().isoformat())
        eaten = c.execute("SELECT 1 FROM entries WHERE owner=? LIMIT 1", (owner,)).fetchone()
    if not eaten:   # never logged food: no basis for a hint
        return {"hint": None, "kcal": None, "carbs": None}
    return phase_mod.intake_hint(t["kcal"], t["carbs"], _now().hour)


def c_review(owner: str, msg: dict) -> dict:
    ai = _opt(msg, "ai", bool, False)
    language = _opt(msg, "language", str, "de")
    _opt(msg, "entity_id", str, "")
    now = _now()
    data = store.review(owner, now, now.tzinfo, language)
    data.pop("instructions")
    data["text"] = None
    if ai and (data["stagnating"] or data["neglected"]):
        raise _bad("Home Assistant has no AI task set up (ai_task)")   # stage 4: ai_task.generate_data over the HA API
    return data


def c_plan_suggest(owner: str, msg: dict) -> dict:
    days = _int_range(msg, "days", 1, 6)
    minutes = _int_range(msg, "minutes", 20, 180, 60)
    goal, notes = _text(msg, "goal", 200), _text(msg, "notes", 500)
    req = store.plan_request(owner, days, minutes, goal, notes, _opt(msg, "language", str, "de"))
    if not req["known"]:
        raise _bad("no exercises to build a plan from")
    raise _bad("Home Assistant has no AI task set up (ai_task)")   # stage 4


def c_web_query(owner: str, msg: dict) -> dict:
    q = _req(msg, "q", str)
    if q not in WEB_QUERIES:
        raise _bad(f"unknown query {q}")
    now = _now()
    return store.web_query(owner, q, _opt(msg, "params", dict, {}), now, now.tzinfo)


def c_export(owner: str, msg: dict) -> dict:
    return store.export_all(owner)


def c_import_gymrun(owner: str, msg: dict) -> dict:
    return store.import_gymrun(owner, _req(msg, "csv", str), _opt(msg, "dry_run", bool, True))


COMMANDS: dict[str, Callable[[str, dict], dict]] = {
    "hafs/info": c_info,
    "hafs/sync/push": c_sync_push,
    "hafs/sync/pull": c_sync_pull,
    "hafs/catalog/info": c_catalog_info,
    "hafs/pref/get": c_pref_get,
    "hafs/pref/set": c_pref_set,
    "hafs/target/set": c_target_set,
    "hafs/targets/recompute": c_targets_recompute,
    "hafs/gym/current": c_gym_current,
    "hafs/intake/hint": c_intake_hint,
    "hafs/review": c_review,
    "hafs/plan/suggest": c_plan_suggest,
    "hafs/web/query": c_web_query,
    "hafs/export": c_export,
    "hafs/import/gymrun": c_import_gymrun,
}


def _read_version() -> str:
    """Version of the app from config.yaml (copied into the image next to main.py; in the repo one folder up)."""
    app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for path in (os.path.join(app_dir, "config.yaml"), os.path.join(os.path.dirname(app_dir), "config.yaml")):
        try:
            with open(path, encoding="utf-8") as f:
                for line in f:
                    if line.startswith("version:"):
                        return line.split(":", 1)[1].strip().strip('"')
        except OSError:
            continue
    return ""


APP_VERSION = _read_version()


def call(owner: str, msg: Any) -> dict:
    """Run one message for [owner]; raises CallError."""
    if not isinstance(msg, dict) or not isinstance(msg.get("type"), str):
        raise _bad("type is required")
    handler = COMMANDS.get(msg["type"])
    if handler is None:
        raise CallError(404, "unknown_command", msg["type"])
    if not feature_on(owner, "training"):
        raise CallError(403, "not_enabled", "Training ist aus: in den Einstellungen unter Zusatzfunktionen einschalten")
    try:
        return handler(owner, msg)
    except ValueError as err:   # the core raises ValueError for bad records or CSV
        raise _bad(str(err)) from err


@app.post("/api/training/call")
def training_call(msg: Any = Body(...), x_remote_user_id: str | None = Header(None)):
    try:
        return call(user_from(x_remote_user_id), msg)
    except CallError as err:
        return JSONResponse({"code": err.code, "message": str(err)}, status_code=err.status)
