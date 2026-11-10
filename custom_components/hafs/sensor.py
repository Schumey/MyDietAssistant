"""HAFS sensors, one set per Home Assistant user (see MDA.md, section 2)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .hub import HafsHub


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    hub: HafsHub = hass.data[DOMAIN]

    def add(owners: list[str]) -> None:
        async_add_entities([cls(hub, owner) for owner in owners for cls in
                            (TrainingState, WorkoutsToday, WorkoutsWeek, LastWorkout, PhaseSensor)])

    hub.register_platform(add)
    add(list(hub.names))


class _Base(SensorEntity):
    _attr_should_poll = False
    key = ""
    label = ""

    def __init__(self, hub: HafsHub, owner: str) -> None:
        self.hub = hub
        self.owner = owner
        self._attr_unique_id = f"{owner}_{self.key}"
        self._attr_name = f"HAFS {hub.names.get(owner, owner[:8])} {self.label}"
        self.entity_id = f"sensor.hafs_{hub.object_name(owner)}_{self.key}"

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.hub.async_listen(self.owner, self.async_write_ha_state))

    @property
    def status(self) -> dict[str, Any]:
        return self.hub.state.get(self.owner, {})


class TrainingState(_Base):
    key, label = "training_state", "training state"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ["none", "active", "done"]
    _attr_icon = "mdi:dumbbell"

    @property
    def native_value(self) -> str:
        return self.status.get("state", "none")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self.status.get("attrs", {})


class WorkoutsToday(_Base):
    key, label = "workouts_today", "workouts today"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_icon = "mdi:counter"

    @property
    def native_value(self) -> int:
        return self.status.get("workouts_today", 0)


class WorkoutsWeek(_Base):
    key, label = "workouts_week", "workouts this week"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_icon = "mdi:calendar-week"

    @property
    def native_value(self) -> int:
        return self.status.get("workouts_week", 0)


class LastWorkout(_Base):
    key, label = "last_workout", "last workout"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self) -> datetime | None:
        value = self.status.get("last_workout_at")
        return dt_util.parse_datetime(value) if value else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        last = self.status.get("last") or {}
        return {k: last[k] for k in ("duration_min", "volume_kg", "sets", "kcal_estimate", "routine") if k in last}


class PhaseSensor(_Base):
    key, label = "phase", "phase"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ["bulk", "maintain", "cut"]
    _attr_icon = "mdi:scale-bathroom"

    @property
    def native_value(self) -> str | None:
        return self.hub.phase.get(self.owner, {}).get("phase") or None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"source": self.hub.phase.get(self.owner, {}).get("source", "none")}
