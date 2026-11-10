"""HAFS - HomeAssistant Fitness Suite: strength training log for Home Assistant."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.exceptions import HomeAssistantError
import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DB_SUBPATH, DOMAIN
from .core.store import Store
from .hub import HafsHub
from .websocket_api import async_register_websocket_commands

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS = [Platform.SENSOR, Platform.BINARY_SENSOR]

type HafsConfigEntry = ConfigEntry[Store]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async_register_websocket_commands(hass)

    async def get_workouts(call: ServiceCall) -> dict:
        """Recent finished workouts of a user (default: the user who called the service)."""
        hub: HafsHub | None = hass.data.get(DOMAIN)
        if hub is None:
            raise HomeAssistantError("HAFS is not set up")
        owner = call.data.get("user_id") or call.context.user_id
        if not owner:
            raise HomeAssistantError("user_id is required when the caller is not a user")
        workouts = await hass.async_add_executor_job(hub.store.recent_workouts, owner, call.data["days"], call.data["limit"])
        return {"user_id": owner, "workouts": workouts}

    hass.services.async_register(
        DOMAIN, "get_workouts", get_workouts,
        schema=vol.Schema({
            vol.Optional("user_id"): cv.string,
            vol.Optional("days", default=30): vol.All(int, vol.Range(min=1, max=3650)),
            vol.Optional("limit", default=50): vol.All(int, vol.Range(min=1, max=500)),
        }),
        supports_response=SupportsResponse.ONLY,
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HafsConfigEntry) -> bool:
    store = Store(hass.config.path(DB_SUBPATH))
    await hass.async_add_executor_job(store.init)
    entry.runtime_data = store
    hub = HafsHub(hass, store)
    hass.data[DOMAIN] = hub
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)  # platforms register with the hub first
    await hub.async_start()                                                 # then entities are created per user
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HafsConfigEntry) -> bool:
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok and (hub := hass.data.pop(DOMAIN, None)):
        hub.async_stop()
    return ok
