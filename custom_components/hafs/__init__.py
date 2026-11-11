"""HAFS - HomeAssistant Fitness Suite: strength training log for Home Assistant."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.loader import async_get_integration
from homeassistant.exceptions import HomeAssistantError
import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DB_SUBPATH, DOMAIN, PANEL_STATIC_URL, PANEL_URL_PATH
from .core.store import Store
from .hub import HafsHub
from .views import async_register_views
from .websocket_api import async_register_websocket_commands

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS = [Platform.SENSOR, Platform.BINARY_SENSOR]

type HafsConfigEntry = ConfigEntry[Store]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async_register_websocket_commands(hass)
    async_register_views(hass)
    await hass.http.async_register_static_paths(
        [StaticPathConfig(PANEL_STATIC_URL, str(Path(__file__).parent / "www"), cache_headers=False)]
    )

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

    async def get_plan(call: ServiceCall) -> dict:
        """Programs with routines and exercises of a user, plus the routine due next."""
        hub: HafsHub | None = hass.data.get(DOMAIN)
        if hub is None:
            raise HomeAssistantError("HAFS is not set up")
        owner = call.data.get("user_id") or call.context.user_id
        if not owner:
            raise HomeAssistantError("user_id is required when the caller is not a user")
        from homeassistant.util import dt as dt_util
        now = dt_util.now()
        return {"user_id": owner, **await hass.async_add_executor_job(hub.store.plan, owner, now)}

    hass.services.async_register(
        DOMAIN, "get_plan", get_plan,
        schema=vol.Schema({vol.Optional("user_id"): cv.string}),
        supports_response=SupportsResponse.ONLY,
    )
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
    integration = await async_get_integration(hass, DOMAIN)
    www = Path(__file__).parent / "www"
    # Version plus the newest file time: every change of the panel files busts the browser cache, not just a new release.
    stamp = await hass.async_add_executor_job(lambda: max((int(f.stat().st_mtime) for f in www.glob("*.js")), default=0))
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name="hafs-panel",
        sidebar_title="HAFS",
        sidebar_icon="mdi:dumbbell",
        module_url=f"{PANEL_STATIC_URL}/hafs-panel.js?v={integration.version}-{stamp}",
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HafsConfigEntry) -> bool:
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok and (hub := hass.data.pop(DOMAIN, None)):
        hub.async_stop()
        frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
    return ok
