"""binary_sensor.hafs_<name>_workout_active: on while a workout is running."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .hub import HafsHub


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    hub: HafsHub = hass.data[DOMAIN]

    def add(owners: list[str]) -> None:
        async_add_entities([WorkoutActive(hub, owner) for owner in owners])

    hub.register_platform(add)
    add(list(hub.names))


class WorkoutActive(BinarySensorEntity):
    _attr_should_poll = False
    _attr_icon = "mdi:dumbbell"

    def __init__(self, hub: HafsHub, owner: str) -> None:
        self.hub = hub
        self.owner = owner
        self._attr_unique_id = f"{owner}_workout_active"
        self._attr_name = f"HAFS {hub.names.get(owner, owner[:8])} workout active"
        self.entity_id = f"binary_sensor.hafs_{hub.object_name(owner)}_workout_active"

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.hub.async_listen(self.owner, self.async_write_ha_state))

    @property
    def is_on(self) -> bool:
        return bool(self.hub.state.get(self.owner, {}).get("active"))
