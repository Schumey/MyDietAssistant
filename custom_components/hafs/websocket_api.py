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
from .core import sync
from .core.store import Store


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    for command in (ws_info, ws_sync_push, ws_sync_pull, ws_export, ws_import_gymrun):
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
    return await hass.async_add_executor_job(store.push, connection.user.id, msg["records"])


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
