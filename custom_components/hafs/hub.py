"""Glue between the store and Home Assistant: per-user state, entities, events, MDA phase."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime, timedelta, timezone
from typing import Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change, async_track_time_interval
from homeassistant.util import dt as dt_util
from homeassistant.util import slugify

from .const import DOMAIN
from .core import phase as phase_mod
from .core import targets
from .core import zones as zones_mod
from .core.store import Store

_LOGGER = logging.getLogger(__name__)

SIGNAL = f"{DOMAIN}_update"
EVENT_PREFIX = "hafs_"


class HafsHub:
    def __init__(self, hass: HomeAssistant, store: Store) -> None:
        self.hass = hass
        self.store = store
        self.names: dict[str, str] = {}                 # owner -> display name
        self.state: dict[str, dict[str, Any]] = {}      # owner -> status() result
        self.phase: dict[str, dict[str, str]] = {}      # owner -> {"phase", "source"}
        self.mda_names: dict[str, str] = {}             # owner -> name used in MDA entity ids (override)
        self._adders: list[Callable[[list[str]], None]] = []
        self._tracked: dict[str, Callable[[], None]] = {}
        self._unsubs: list[Callable[[], None]] = []

    # ---- setup / teardown -------------------------------------------------

    def register_platform(self, add: Callable[[list[str]], None]) -> None:
        """Platforms register a function that creates their entities for new owners."""
        self._adders.append(add)

    async def async_start(self) -> None:
        for owner in await self.hass.async_add_executor_job(self.store.owners):
            await self.async_ensure_owner(owner)
        self._unsubs.append(async_track_time_change(self.hass, self._midnight, hour=0, minute=0, second=10))
        self._unsubs.append(async_track_time_interval(self.hass, self._tick, timedelta(minutes=15)))

    @callback
    def async_stop(self) -> None:
        for unsub in (*self._unsubs, *self._tracked.values()):
            unsub()
        self._unsubs.clear()
        self._tracked.clear()

    # ---- owners -----------------------------------------------------------

    def object_name(self, owner: str) -> str:
        """Lowercase name used in entity ids (HAFS and, as default, MDA)."""
        return slugify(self.names.get(owner) or owner[:8])

    def mda_name(self, owner: str) -> str:
        return self.mda_names.get(owner) or self.object_name(owner)

    async def _track_mda(self, owner: str) -> None:
        """(Re)subscribe to the MDA sensors of this user; the name can be overridden with the `mda_name` pref."""
        self.mda_names[owner] = await self.hass.async_add_executor_job(self.store.get_pref, owner, "mda_name")
        if (old := self._tracked.pop(owner, None)):
            old()
        mda = f"sensor.mydiet_{self.mda_name(owner)}"
        self._tracked[owner] = async_track_state_change_event(
            self.hass, [f"{mda}_goal_mode", f"{mda}_energy_balance"], self._mda_changed(owner))

    async def async_ensure_owner(self, owner: str) -> None:
        if owner in self.names:
            return
        user = await self.hass.auth.async_get_user(owner)
        self.names[owner] = (user.name if user and user.name else owner[:8])
        await self.async_refresh(owner, fire=False)
        await self._track_mda(owner)
        await self.async_refresh_phase(owner)
        for add in self._adders:
            add([owner])

    def _mda_changed(self, owner: str) -> Callable[[Event], Any]:
        async def handler(_event: Event) -> None:
            await self.async_refresh_phase(owner)
        return handler

    # ---- location ---------------------------------------------------------

    def current_zone(self, owner: str) -> str | None:
        """Zone entity id the user's person entity is in right now (None when away or unknown)."""
        zones = {s.name: s.entity_id for s in self.hass.states.async_all("zone")}
        zones.update({s.attributes.get("friendly_name", ""): s.entity_id for s in self.hass.states.async_all("zone")})
        for person in self.hass.states.async_all("person"):
            if person.attributes.get("user_id") == owner:
                return zones_mod.zone_entity(person.state, zones)
        return None

    # ---- refresh ----------------------------------------------------------

    async def async_refresh(self, owner: str, fire: bool = True) -> None:
        tz = dt_util.get_default_time_zone()
        self.state[owner] = await self.hass.async_add_executor_job(self.store.status, owner, datetime.now(timezone.utc), tz)
        if fire:
            async_dispatcher_send(self.hass, SIGNAL, owner)

    async def async_refresh_phase(self, owner: str) -> None:
        """Resolve manual choice -> MDA goal_mode -> MDA energy_balance and hand it to the store."""
        prefix = f"sensor.mydiet_{self.mda_name(owner)}"
        goal = self.hass.states.get(f"{prefix}_goal_mode")
        balance = self.hass.states.get(f"{prefix}_energy_balance")
        manual = await self.hass.async_add_executor_job(self.store.get_pref, owner, "phase")
        last = await self.hass.async_add_executor_job(self.store.get_pref, owner, "phase_auto")
        value, source = phase_mod.resolve(manual, goal.state if goal else None, balance.state if balance else None, last)
        self.phase[owner] = {"phase": value, "source": source}
        if source in ("goal_mode", "energy_balance") and value in targets.PHASE_VALUES[1:]:
            if await self.hass.async_add_executor_job(self.store.set_auto_phase, owner, value):
                _LOGGER.info("HAFS phase for %s is now %s (%s)", self.names.get(owner), value, source)
        async_dispatcher_send(self.hass, SIGNAL, owner)

    async def async_after_push(self, owner: str, events: list[dict]) -> None:
        await self.async_ensure_owner(owner)
        for ev in events:
            self.hass.bus.async_fire(EVENT_PREFIX + ev["event"], {"user_id": owner, **ev["data"]})
        await self.async_refresh(owner)

    async def async_after_pref(self, owner: str) -> None:
        await self.async_ensure_owner(owner)
        await self._track_mda(owner)
        await self.async_refresh_phase(owner)

    async def _midnight(self, _now: datetime) -> None:
        for owner in list(self.names):
            await self.async_refresh(owner)

    async def _tick(self, _now: datetime) -> None:
        for owner in list(self.names):
            await self.async_refresh(owner)

    @callback
    def async_listen(self, owner: str, update: Callable[[], None]) -> Callable[[], None]:
        @callback
        def _signal(changed: str) -> None:
            if changed == owner:
                update()
        return async_dispatcher_connect(self.hass, SIGNAL, _signal)
