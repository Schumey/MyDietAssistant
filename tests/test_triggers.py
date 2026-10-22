"""Trigger conditions: time windows, hold time, calendar start/end days (Home Assistant is replaced by stubs)."""
from datetime import datetime, timedelta, timezone

import pytest

import extras


def trig(**kw):
    base = {"kind": "state", "entity": "person.a", "match": "home", "negate": 0, "part": "any", "hold_min": 0,
            "win_from": "", "win_to": "", "extra": "[]", "combine": "and"}
    return {**base, **kw}


def at(h, m=0, day="2026-03-10"):
    return datetime.fromisoformat(f"{day}T{h:02d}:{m:02d}:00")


@pytest.mark.parametrize("win,hour,expected", [
    (("08:00", "10:00"), 9, True), (("08:00", "10:00"), 11, False),
    (("22:00", "02:00"), 23, True), (("22:00", "02:00"), 1, True), (("22:00", "02:00"), 12, False),
    (("", "06:00"), 5, True), (("", "06:00"), 7, False), (("18:00", ""), 19, True), (("18:00", ""), 9, False),
    (("", ""), 3, True)])
def test_time_window(win, hour, expected):
    assert extras.in_window(trig(win_from=win[0], win_to=win[1]), at(hour)) is expected


def test_time_trigger_fires_after_the_set_time():
    t = trig(kind="time", match="07:30")
    assert not extras.condition_met(t, at(7, 0))
    assert extras.condition_met(t, at(7, 30))


def fake_state(monkeypatch, state, changed_ago_min=0):
    changed = (datetime.now(timezone.utc) - timedelta(minutes=changed_ago_min)).isoformat()
    monkeypatch.setattr(extras, "ha_get", lambda path, **kw: {"state": state, "last_changed": changed})


def test_state_trigger_and_negation(monkeypatch):
    fake_state(monkeypatch, "home")
    assert extras.condition_met(trig(), at(12))
    assert not extras.condition_met(trig(negate=1), at(12))
    fake_state(monkeypatch, "not_home")
    assert not extras.condition_met(trig(), at(12))
    assert extras.condition_met(trig(negate=1), at(12))


def test_hold_time(monkeypatch):
    fake_state(monkeypatch, "home", changed_ago_min=5)
    assert not extras.condition_met(trig(hold_min=20), at(12))
    fake_state(monkeypatch, "home", changed_ago_min=30)
    assert extras.condition_met(trig(hold_min=20), at(12))


def test_extra_conditions_and_or(monkeypatch):
    states = {"person.a": "home", "person.b": "away"}
    monkeypatch.setattr(extras, "ha_get", lambda path, **kw: {"state": states[path.split("/")[-1]], "last_changed": datetime.now(timezone.utc).isoformat()})
    extra = '[{"kind": "state", "entity": "person.b", "match": "home"}]'
    assert not extras.trigger_met(trig(extra=extra, combine="and"), at(12))
    assert extras.trigger_met(trig(extra=extra, combine="or"), at(12))


def test_calendar_start_and_end_day(monkeypatch):
    extras._cal_cache.clear()
    event = {"summary": "Urlaub", "start": {"date": "2026-03-09"}, "end": {"date": "2026-03-12"}}   # all-day, end exclusive: 9th-11th
    monkeypatch.setattr(extras, "ha_get", lambda path, **kw: [event])
    cal = lambda part, day: extras.calendar_has_event("calendar.x", "Urlaub", day, part)
    assert cal("any", "2026-03-10")
    assert cal("start", "2026-03-09") and not cal("start", "2026-03-10")
    extras._cal_cache.clear()
    assert cal("end", "2026-03-11") and not cal("end", "2026-03-12")
    extras._cal_cache.clear()
    assert not extras.calendar_has_event("calendar.x", "Sport", "2026-03-10")


def test_meal_rule_with_a_state_does_not_crash(user, monkeypatch):
    """Regression (v0.16.1): a meal rule with kind 'state' raised IndexError while building the diary."""
    c = user()
    mid = c.get("/api/day/2026-03-10").json()["meals"][0]["id"]
    assert c.post("/api/meal-triggers", json={"meal_id": mid, "kind": "state", "entity": "person.a", "match": "home"}).status_code == 200
    monkeypatch.setattr(extras, "SUPERVISOR_TOKEN", "x")
    fake_state(monkeypatch, "not_home")
    day = c.get("/api/day/2026-03-10")
    assert day.status_code == 200
    assert next(m for m in day.json()["meals"] if m["id"] == mid)["hidden"] is True
