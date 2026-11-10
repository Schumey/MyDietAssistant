"""WebSocket API used by the HAFS app. All commands are prefixed with "hafs/".

The data sync is record based: the app pushes records with client-made UUIDs
(`hafs/sync/push`) and pulls what changed (`hafs/sync/pull`, cursor per table).
"""

from __future__ import annotations

import json
from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.loader import async_get_integration

from .const import API_VERSION, DOMAIN
from .core import aiplan, catalog, sync, targets
from .core.store import Store


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    for command in (ws_info, ws_sync_push, ws_sync_pull, ws_export, ws_import_gymrun, ws_catalog_info,
                    ws_pref_get, ws_pref_set, ws_targets_recompute, ws_gym_current, ws_plan_suggest):
        websocket_api.async_register_command(hass, command)


def _get_store(hass: HomeAssistant) -> Store | None:
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is ConfigEntryState.LOADED:
            return entry.runtime_data
    return None


def _with_store(handler: Callable[..., Any]):
    """Resolve the store (or answer "not loaded") and run the async handler."""

    async def wrapper(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
        store = _get_store(hass)
        if store is None:
            connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "HAFS is not set up")
            return
        try:
            result = await handler(hass, connection, msg, store)
        except ValueError as err:
            connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, str(err))
            return
        connection.send_result(msg["id"], result)

    wrapper.__name__ = handler.__name__
    return wrapper


@websocket_api.websocket_command({vol.Required("type"): "hafs/info"})
@websocket_api.async_response
async def ws_info(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    integration = await async_get_integration(hass, DOMAIN)
    store = _get_store(hass)
    result: dict[str, Any] = {"api_version": API_VERSION, "version": str(integration.version), "ready": store is not None}
    if store is not None:
        result.update(await hass.async_add_executor_job(store.info))
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {vol.Required("type"): "hafs/sync/push", vol.Required("records"): {str: [dict]}}
)
@websocket_api.async_response
@_with_store
async def ws_sync_push(hass, connection, msg, store: Store) -> dict:
    result, events = await hass.async_add_executor_job(store.push_ex, connection.user.id, msg["records"])
    if (hub := hass.data.get(DOMAIN)) is not None and result["applied"]:
        await hub.async_after_push(connection.user.id, events)
    return result


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hafs/sync/pull",
        vol.Optional("cursors"): {str: {vol.Required("at"): str, vol.Required("id"): str}},
        vol.Optional("limit", default=sync.DEFAULT_PULL_LIMIT): vol.All(int, vol.Range(min=1, max=10000)),
    }
)
@websocket_api.async_response
@_with_store
async def ws_sync_pull(hass, connection, msg, store: Store) -> dict:
    return await hass.async_add_executor_job(store.pull, connection.user.id, msg.get("cursors"), msg["limit"])


@websocket_api.websocket_command({vol.Required("type"): "hafs/catalog/info"})
@callback
def ws_catalog_info(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Labels and English names of the built-in catalog (the exercises themselves arrive via sync)."""
    connection.send_result(msg["id"], catalog.info())


PREF_KEYS = ["phase", *targets.SETTING_KEYS, "mda_name"]


@websocket_api.websocket_command({vol.Required("type"): "hafs/pref/get", vol.Required("key"): vol.In(PREF_KEYS)})
@websocket_api.async_response
@_with_store
async def ws_pref_get(hass, connection, msg, store: Store) -> dict:
    return {"key": msg["key"], "value": await hass.async_add_executor_job(store.get_pref, connection.user.id, msg["key"])}


@websocket_api.websocket_command(
    {vol.Required("type"): "hafs/pref/set", vol.Required("key"): vol.In(PREF_KEYS), vol.Required("value"): str}
)
@websocket_api.async_response
@_with_store
async def ws_pref_set(hass, connection, msg, store: Store) -> dict:
    """Set a preference. `phase` is "", "bulk", "maintain" or "cut"; hit_fraction/miss_fraction (0.1 to 1), cut_drop_set_first ("0"/"1"),
    break_days (3 to 120) tune the progression. Every change recomputes all targets."""
    if not targets.valid_pref(msg["key"], msg["value"]):
        raise ValueError(f"invalid value for {msg['key']}")
    targets_result = await hass.async_add_executor_job(store.set_pref, connection.user.id, msg["key"], msg["value"])
    if (hub := hass.data.get(DOMAIN)) is not None:
        await hub.async_after_pref(connection.user.id)
    return {"key": msg["key"], "value": msg["value"], "targets": targets_result}


@websocket_api.websocket_command({vol.Required("type"): "hafs/gym/current"})
@websocket_api.async_response
@_with_store
async def ws_gym_current(hass, connection, msg, store: Store) -> dict:
    """The gym the user is at, from the zone of their person entity and the `zone` field of their gyms."""
    hub = hass.data.get(DOMAIN)
    zone = hub.current_zone(connection.user.id) if hub is not None else None
    found = await hass.async_add_executor_job(store.gym_for_zone, connection.user.id, zone)
    return {"zone": zone, **(found or {"gym_id": None, "gym": None})}


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hafs/plan/suggest",
        vol.Required("days"): vol.All(int, vol.Range(min=1, max=6)),
        vol.Optional("minutes", default=60): vol.All(int, vol.Range(min=20, max=180)),
        vol.Optional("goal", default=""): vol.All(str, vol.Length(max=200)),
        vol.Optional("notes", default=""): vol.All(str, vol.Length(max=500)),
        vol.Optional("language", default="de"): str,
        vol.Optional("entity_id"): str,
    }
)
@websocket_api.async_response
@_with_store
async def ws_plan_suggest(hass, connection, msg, store: Store) -> dict:
    """Ask the AI configured in Home Assistant (`ai_task.generate_data`) for a plan draft built from the user's own
    exercises. Returns validated days; nothing is saved."""
    req = await hass.async_add_executor_job(
        store.plan_request, connection.user.id, msg["days"], msg["minutes"], msg["goal"], msg["notes"], msg["language"])
    if not req["known"]:
        raise ValueError("no exercises to build a plan from")
    if not hass.services.has_service("ai_task", "generate_data"):
        raise ValueError("Home Assistant has no AI task set up (ai_task)")
    data = {
        "task_name": "HAFS training plan",
        "instructions": req["instructions"],
        "structure": {"plan": {"description": "The plan as JSON text", "required": True, "selector": {"text": {"multiline": True}}}},
    }
    if msg.get("entity_id"):
        data["entity_id"] = msg["entity_id"]
    try:
        result = await hass.services.async_call("ai_task", "generate_data", data, blocking=True, return_response=True)
    except Exception as err:  # noqa: BLE001 - surface any provider error to the app as a message
        raise ValueError(f"AI request failed: {err}") from err
    answer = (result or {}).get("data", {})
    text = answer.get("plan") if isinstance(answer, dict) else None
    if not isinstance(text, str):
        text = json.dumps(answer) if answer else str((result or {}).get("text", ""))
    return {"days": aiplan.parse_draft(text, req["known"])}


@websocket_api.websocket_command({vol.Required("type"): "hafs/targets/recompute"})
@websocket_api.async_response
@_with_store
async def ws_targets_recompute(hass, connection, msg, store: Store) -> dict:
    return await hass.async_add_executor_job(store.recompute_targets, connection.user.id)


@websocket_api.websocket_command({vol.Required("type"): "hafs/export"})
@websocket_api.async_response
@_with_store
async def ws_export(hass, connection, msg, store: Store) -> dict:
    return await hass.async_add_executor_job(store.export_all, connection.user.id)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hafs/import/gymrun",
        vol.Required("csv"): str,
        vol.Optional("dry_run", default=True): bool,
    }
)
@websocket_api.async_response
@_with_store
async def ws_import_gymrun(hass, connection, msg, store: Store) -> dict:
    return await hass.async_add_executor_job(store.import_gymrun, connection.user.id, msg["csv"], msg["dry_run"])
