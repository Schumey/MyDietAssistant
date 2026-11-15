"""Training (HAFS) inside the app: one HTTP endpoint that answers the messages the HAFS integration took over WebSocket.

    POST api/training/call   body {"type": "hafs/sync/pull", ...}   -> the same result the WebSocket command returned

Errors come back as {"code": ..., "message": ...} like Home Assistant's WebSocket errors: 400 invalid_format,
403 not_enabled (feature `training` off), 404 unknown_command. The data lives in its own file (`hafs.db` next to
`mydiet.db`, or `HAFS_DB`), because the Flutter app's schema is generated from exactly these migrations.

Home Assistant is reached through `training/ha.py`, which fills HA (zone, zones, AI) and the hooks AFTER_PUSH (owner,
events: fires the events, sends the entities) and AFTER_CHANGE (owner: settings, targets or import changed).
"""
from __future__ import annotations

import json
import os
from datetime import date, datetime
from typing import Any, Callable

from fastapi import Body, Header
from fastapi.responses import JSONResponse

import db as mda_db
from main import app, day_totals, user_from
from extras import feature_on, get_pref as mda_pref

from training.core import aiplan, catalog, phase as phase_mod, sync, targets, webview
from training.core.store import Store

API_VERSION = 1   # bumped when the call API changes incompatibly (same number the integration used)
DB_PATH = os.environ.get("HAFS_DB") or os.path.join(os.path.dirname(os.path.abspath(mda_db.DB_PATH)), "hafs.db")

store = Store(DB_PATH)
store.init()

AFTER_PUSH: list[Callable[[str, list[dict]], None]] = []   # (owner, events) after a push that changed something
AFTER_CHANGE: list[Callable[[str], None]] = []              # (owner) after settings, targets or an import changed
NO_AI = "Home Assistant has no AI task set up (ai_task)"


def _no_ai(*_args, **_kw):
    raise ValueError(NO_AI)


# Home Assistant access, replaced by training/ha.py: zone(owner) -> zone entity id or None, zones() -> [{entity_id, name}],
# ai(task_name, instructions, structure, entity_id) -> answer data (raises ValueError)
HA: dict[str, Callable] = {"zone": lambda owner: None, "zones": lambda: [], "ai": _no_ai, "people": lambda: {}}
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
    """The gym the user is at, from the zone of their person entity and the `zone` field of their gyms."""
    zone = HA["zone"](owner)
    return {"zone": zone, **(store.gym_for_zone(owner, zone) or {"gym_id": None, "gym": None})}


def c_zones(owner: str, msg: dict) -> dict:
    """Zones of Home Assistant for the gym editor (the panel read them from `hass.states`)."""
    return {"zones": HA["zones"]()}


def c_intake_hint(owner: str, msg: dict) -> dict:
    """"Little eaten today" before training, straight from the nutrition diary (no sensors involved)."""
    with mda_db.conn() as c:
        t = day_totals(c, owner, date.today().isoformat())
        eaten = c.execute("SELECT 1 FROM entries WHERE owner=? LIMIT 1", (owner,)).fetchone()
    if not eaten:   # never logged food: no basis for a hint
        return {"hint": None, "kcal": None, "carbs": None}
    return phase_mod.intake_hint(t["kcal"], t["carbs"], _now().hour)


def review(owner: str, ai: bool, language: str = "de", entity_id: str | None = None) -> dict:
    """Stagnating exercises and neglected muscle groups; with [ai] also a short summary from HA's AI task. The AI step sends
    only exercise and muscle group names with numbers (see core/review.py) and is skipped when nothing stands out."""
    now = _now()
    data = store.review(owner, now, now.tzinfo, language)
    instructions = data.pop("instructions")
    data["text"] = None
    if ai and (data["stagnating"] or data["neglected"]):
        answer = HA["ai"]("HAFS training review", instructions,
                          {"summary": {"description": "The summary as plain text", "required": True, "selector": {"text": {"multiline": True}}}},
                          entity_id)
        text = answer.get("summary") if isinstance(answer, dict) else answer
        data["text"] = text if isinstance(text, str) and text else (json.dumps(answer) if answer else None)
    return data


def suggest_plan(owner: str, days: int, minutes: int, goal: str, notes: str, language: str, entity_id: str | None = None) -> dict:
    """A plan draft from HA's AI task built from the user's own exercises. Returns validated days; nothing is saved."""
    req = store.plan_request(owner, days, minutes, goal, notes, language)
    if not req["known"]:
        raise ValueError("no exercises to build a plan from")
    answer = HA["ai"]("HAFS training plan", req["instructions"],
                      {"plan": {"description": "The plan as JSON text", "required": True, "selector": {"text": {"multiline": True}}}},
                      entity_id)
    text = answer.get("plan") if isinstance(answer, dict) else answer
    if not isinstance(text, str):
        text = json.dumps(answer) if answer else ""
    return {"days": aiplan.parse_draft(text, req["known"])}


def c_review(owner: str, msg: dict) -> dict:
    return review(owner, _opt(msg, "ai", bool, False), _opt(msg, "language", str, "de"), _opt(msg, "entity_id", str, "") or None)


def c_plan_suggest(owner: str, msg: dict) -> dict:
    days = _int_range(msg, "days", 1, 6)
    minutes = _int_range(msg, "minutes", 20, 180, 60)
    goal, notes = _text(msg, "goal", 200), _text(msg, "notes", 500)
    return suggest_plan(owner, days, minutes, goal, notes, _opt(msg, "language", str, "de"), _opt(msg, "entity_id", str, "") or None)


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


def c_restore(owner: str, msg: dict) -> dict:
    """Replace one's own training data with an export (the panel's or the integration's JSON). dry_run (default): only
    the counts of the file and of what is there now."""
    data = _req(msg, "data", dict)
    out = {"file": sync.export_summary(data), "current": store.has_data(owner)}
    if not _opt(msg, "dry_run", bool, True):
        out.update(store.restore(owner, data))
    return out


def _user_names() -> dict[str, str]:
    """Names for user ids: Home Assistant's persons (attribute user_id), then the users who opened the app."""
    names = dict(HA["people"]())
    with mda_db.conn() as c:
        names.update({r["id"]: r["name"] for r in c.execute("SELECT id, name FROM users") if r["name"]})
    return names


def c_legacy_preview(owner: str, msg: dict) -> dict:
    """Users in the HAFS integration's database. Admins see everyone, others only themselves."""
    from extras8 import is_admin
    from training import legacy
    out = legacy.preview(store, _user_names())
    admin = is_admin(owner)
    if not admin:
        out["users"] = [u for u in out["users"] if u["user_id"] == owner]
    return {**out, "admin": admin}


def c_legacy_import(owner: str, msg: dict) -> dict:
    """Take over the integration's data: admins all users (or `users`), others only their own."""
    from extras8 import is_admin
    from training import legacy
    users = _opt(msg, "users", list, None) if "users" in msg else None
    if not is_admin(owner):
        users = [owner]
    return legacy.take_over(store, users)


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
    "hafs/zones": c_zones,
    "hafs/restore": c_restore,
    "hafs/legacy/preview": c_legacy_preview,
    "hafs/legacy/import": c_legacy_import,
}
# commands after which the entities should follow at once (AFTER_CHANGE); a push has its own hook
CHANGING = {"hafs/pref/set", "hafs/target/set", "hafs/targets/recompute", "hafs/import/gymrun", "hafs/restore", "hafs/legacy/import"}


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
        result = handler(owner, msg)
    except ValueError as err:   # the core raises ValueError for bad records or CSV
        raise _bad(str(err)) from err
    if msg["type"] in CHANGING and not (msg["type"] in ("hafs/import/gymrun", "hafs/restore") and msg.get("dry_run", True)):
        for hook in AFTER_CHANGE:
            hook(owner)
    return result


def _dump(owner: str) -> dict:
    """Training in the app's JSON export and automatic backups (when the feature is on or there is training data)."""
    if not feature_on(owner, "training") and not any(store.has_data(owner).values()):
        return {}
    return {"training": store.export_all(owner)}


def _restore(owner: str, d: dict) -> None:
    """Restoring a backup with a training part replaces the training data too; older backups leave it alone."""
    if isinstance(d.get("training"), dict):
        store.restore(owner, d["training"])


import extras as _extras  # noqa: E402

_extras.DUMP_HOOKS.append(_dump)
_extras.RESTORE_HOOKS.append(_restore)


@app.post("/api/training/call")
def training_call(msg: Any = Body(...), x_remote_user_id: str | None = Header(None)):
    try:
        return call(user_from(x_remote_user_id), msg)
    except CallError as err:
        return JSONResponse({"code": err.code, "message": str(err)}, status_code=err.status)
