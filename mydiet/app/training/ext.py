"""Training for Home Assistant automations and Assist (replaces the integration's services and intents), plus the app packages.

All `/api/ext/training/*` endpoints use the key of the external API (option `api_key`, header X-MDA-Key) like `/api/ext/*`,
take `user` (HA user id, default "default") and answer JSON for `rest_command` with `response_variable`:

    POST /api/ext/training/status    sensors in one answer (state, next routine, last workout, phase)
    POST /api/ext/training/plan      programs, routines and the routine due next          (was hafs.get_plan)
    POST /api/ext/training/workouts  recent finished workouts (days, limit)              (was hafs.get_workouts)
    POST /api/ext/training/review    review, optionally with the AI summary (ai, ...)     (was hafs.get_review)
    POST /api/ext/training/suggest   AI plan draft (days, minutes, goal, notes, ...)      (was hafs.suggest_program)
    POST /api/ext/training/say       spoken answer: {"intent": "next" | "last", "language"} -> {"message"} (was the intents)

App packages for self-update (the Flutter app), from the folder /share/hafs/app (or HAFS_APP_DIR):
    GET /api/training/app            newest `hafs-<version>.apk`: version, name, size, sha256 (404 when there is none)
    GET /api/training/app/{name}     the file
"""
from __future__ import annotations

import os
from datetime import date

from fastapi import Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from main import app, user_from
from extras import feature_on
from extras2 import check_key

from training import api
from training.core import appfiles, speech

APP_DIR = os.environ.get("HAFS_APP_DIR") or "/share/hafs/app"


class ExtUser(BaseModel):
    user: str = "default"


class ExtWorkouts(ExtUser):
    days: int = Field(30, ge=1, le=3650)
    limit: int = Field(50, ge=1, le=500)


class ExtReview(ExtUser):
    ai: bool = False
    language: str = "de"
    entity_id: str | None = None


class ExtSuggest(ExtUser):
    days: int = Field(..., ge=1, le=6)
    minutes: int = Field(60, ge=20, le=180)
    goal: str = Field("", max_length=200)
    notes: str = Field("", max_length=500)
    language: str = "de"
    entity_id: str | None = None


class ExtSay(ExtUser):
    intent: str = Field(..., pattern="^(next|last)$")
    language: str = "de"


def _owner(b: ExtUser, key: str | None) -> str:
    check_key(key)
    if not feature_on(b.user, "training"):
        raise HTTPException(403, "Training ist für diesen Benutzer aus")
    return b.user


def _run(fn, *args):
    try:
        return fn(*args)
    except ValueError as err:
        raise HTTPException(400, str(err)) from err


@app.post("/api/ext/training/status")
def ext_training_status(b: ExtUser, x_mda_key: str | None = Header(None)):
    owner = _owner(b, x_mda_key)
    now = api._now()
    st = api.store.status(owner, now, now.tzinfo)
    return {"user_id": owner, **st, "phase": api.refresh_phase(owner)}


@app.post("/api/ext/training/plan")
def ext_training_plan(b: ExtUser, x_mda_key: str | None = Header(None)):
    owner = _owner(b, x_mda_key)
    return {"user_id": owner, **api.store.plan(owner, api._now())}


@app.post("/api/ext/training/workouts")
def ext_training_workouts(b: ExtWorkouts, x_mda_key: str | None = Header(None)):
    owner = _owner(b, x_mda_key)
    return {"user_id": owner, "workouts": api.store.recent_workouts(owner, b.days, b.limit)}


@app.post("/api/ext/training/review")
def ext_training_review(b: ExtReview, x_mda_key: str | None = Header(None)):
    owner = _owner(b, x_mda_key)
    return {"user_id": owner, **_run(api.review, owner, b.ai, b.language, b.entity_id)}


@app.post("/api/ext/training/suggest")
def ext_training_suggest(b: ExtSuggest, x_mda_key: str | None = Header(None)):
    owner = _owner(b, x_mda_key)
    return {"user_id": owner, **_run(api.suggest_plan, owner, b.days, b.minutes, b.goal, b.notes, b.language, b.entity_id)}


@app.post("/api/ext/training/say")
def ext_training_say(b: ExtSay, x_mda_key: str | None = Header(None)):
    """For intent_script: always 200 with `message`, so Assist has something to say."""
    check_key(x_mda_key)
    lang = "de" if b.language.lower().startswith("de") else "en"
    if not feature_on(b.user, "training"):
        return {"message": speech.next_workout({}, lang) if b.intent == "next" else speech.last_workout({}, date.today(), lang)}
    now = api._now()
    st = api.store.status(b.user, now, now.tzinfo)
    text = speech.next_workout(st, lang) if b.intent == "next" else speech.last_workout(st, now.date(), lang)
    return {"message": text}


# ---- app packages ----------------------------------------------------------------------------

@app.get("/api/training/app")
def training_app_info(x_remote_user_id: str | None = Header(None)):
    user_from(x_remote_user_id)
    info = appfiles.latest(APP_DIR)
    if info is None:
        raise HTTPException(404, "Kein App-Paket vorhanden")
    return info


@app.get("/api/training/app/{name}")
def training_app_file(name: str, x_remote_user_id: str | None = Header(None)):
    user_from(x_remote_user_id)
    path = appfiles.resolve(APP_DIR, name)
    if path is None:
        raise HTTPException(404, "Nicht gefunden")
    return FileResponse(path, media_type="application/vnd.android.package-archive", filename=name)
