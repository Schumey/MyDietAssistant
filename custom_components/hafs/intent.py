"""Assist: "What do I train today?" and "When did I last train?".

The sentences live in `custom_sentences/<language>/hafs.yaml` (copy that folder to /config/custom_sentences).
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import intent
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .core import speech

NEXT = "HafsNextWorkout"
LAST = "HafsLastWorkout"


class _Handler(intent.IntentHandler):
    def __init__(self, intent_type: str) -> None:
        self.intent_type = intent_type

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hub = intent_obj.hass.data.get(DOMAIN)
        response = intent_obj.create_response()
        lang = intent_obj.language or "en"
        if hub is None:
            response.async_set_speech(speech.next_workout({}, lang))
            return response
        owner = intent_obj.context.user_id if intent_obj.context.user_id in hub.state else None
        if owner is None and len(hub.state) == 1:
            owner = next(iter(hub.state))        # single user: no need to know who is asking
        state = hub.state.get(owner or "", {})
        if self.intent_type == NEXT:
            response.async_set_speech(speech.next_workout(state, lang))
        else:
            response.async_set_speech(speech.last_workout(state, dt_util.now().date(), lang))
        return response


async def async_setup_intents(hass: HomeAssistant) -> None:
    """Called by Home Assistant's intent integration for every integration that has an intent.py."""
    intent.async_register(hass, _Handler(NEXT))
    intent.async_register(hass, _Handler(LAST))
