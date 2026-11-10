"""HAFS - HomeAssistant Fitness Suite: strength training log for Home Assistant."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
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
