"""WebSocket API used by the HAFS app. All commands are prefixed with "hafs/".

The data sync is record based: the app pushes records with client-made UUIDs
(`hafs/sync/push`) and pulls what changed (`hafs/sync/pull`, cursor per table).
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.loader import async_get_integration

from .const import API_VERSION, DOMAIN
from .core import catalog, sync, targets
from .core.store import Store


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    for command in (ws_info, ws_sync_push, ws_sync_pull, ws_export, ws_import_gymrun, ws_catalog_info,
                    ws_pref_get, ws_pref_set, ws_targets_recompute):
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


PREF_VALUES = {"phase": targets.PHASE_VALUES}


@websocket_api.websocket_command({vol.Required("type"): "hafs/pref/get", vol.Required("key"): vol.In(list(PREF_VALUES))})
@websocket_api.async_response
@_with_store
async def ws_pref_get(hass, connection, msg, store: Store) -> dict:
    return {"key": msg["key"], "value": await hass.async_add_executor_job(store.get_pref, connection.user.id, msg["key"])}


@websocket_api.websocket_command(
    {vol.Required("type"): "hafs/pref/set", vol.Required("key"): vol.In(list(PREF_VALUES)), vol.Required("value"): str}
)
@websocket_api.async_response
@_with_store
async def ws_pref_set(hass, connection, msg, store: Store) -> dict:
    """Set a preference. `phase` is "", "bulk", "maintain" or "cut" and recomputes all targets."""
    if msg["value"] not in PREF_VALUES[msg["key"]]:
        raise ValueError(f"invalid value for {msg['key']}")
    targets_result = await hass.async_add_executor_job(store.set_pref, connection.user.id, msg["key"], msg["value"])
    if (hub := hass.data.get(DOMAIN)) is not None:
        await hub.async_after_pref(connection.user.id)
    return {"key": msg["key"], "value": msg["value"], "targets": targets_result}


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
