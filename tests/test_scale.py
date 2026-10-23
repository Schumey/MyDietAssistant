"""v1.4: weight from a Home Assistant sensor (feature "scale")."""
from datetime import datetime, timedelta, timezone

import pytest

import extras11


def state(value, stamp=None, unit=None):
    stamp = stamp or datetime.now(timezone.utc).isoformat()
    return {"state": str(value), "last_updated": stamp, "attributes": {"unit_of_measurement": unit} if unit else {}}


def weights(c):
    return {w["day"]: w["kg"] for w in c.get("/api/weights").json()}


@pytest.mark.parametrize("value,unit,attrs,kg", [
    (81.4, "kg", {}, 81.4), (81400, "g", {}, 81.4), (180, "lb", {}, 81.65), (81.4, "auto", {}, 81.4),
    (81400, "auto", {"unit_of_measurement": "g"}, 81.4), (180, "auto", {"unit_of_measurement": "lbs"}, 81.65),
    (12.8, "st", {}, 81.28), (5, "kg", {}, None), (900, "kg", {}, None), (81, "stones?", {}, None)])
def test_unit_conversion_and_range(value, unit, attrs, kg):
    assert extras11.to_kg(value, unit, attrs) == kg


def test_new_reading_is_taken_over_after_it_stayed_stable(user, monkeypatch):
    c = user(feature=("scale",))
    c.put("/api/scale", json={"entity": "sensor.waage", "unit": "auto"})
    stamp = datetime.now(timezone.utc).isoformat()
    monkeypatch.setattr(extras11, "ha_get", lambda path: state(81400, stamp, "g"))
    assert extras11.read_scale(c.uid)["status"] == "waiting" and weights(c) == {}
    r = extras11.read_scale(c.uid)
    assert r["status"] == "saved" and list(weights(c).values()) == [81.4]
    assert extras11.read_scale(c.uid)["status"] == "up_to_date"
    assert c.get("/api/scale").json()["last"]["kg"] == 81.4


def test_a_changing_value_waits_and_the_last_one_counts(user, monkeypatch):
    c = user(feature=("scale",))
    c.put("/api/scale", json={"entity": "sensor.waage", "unit": "kg"})
    now = datetime.now(timezone.utc)
    seq = iter([state(80.1, now.isoformat()), state(81.9, (now + timedelta(seconds=20)).isoformat()), state(81.9, (now + timedelta(seconds=20)).isoformat())])
    monkeypatch.setattr(extras11, "ha_get", lambda path: next(seq))
    assert [extras11.read_scale(c.uid)["status"] for _ in range(3)] == ["waiting", "waiting", "saved"]
    assert list(weights(c).values()) == [81.9]


def test_old_reading_goes_to_its_own_day_and_ancient_ones_are_skipped(user, monkeypatch):
    c = user(feature=("scale",))
    c.put("/api/scale", json={"entity": "sensor.waage", "unit": "kg"})
    three = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
    monkeypatch.setattr(extras11, "ha_get", lambda path: state(80, three))
    extras11.read_scale(c.uid, force=True)
    assert list(weights(c)) == [extras11.local_day(three).isoformat()]
    d = user(feature=("scale",))
    d.put("/api/scale", json={"entity": "sensor.waage", "unit": "kg"})
    monkeypatch.setattr(extras11, "ha_get", lambda path: state(80, (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()))
    assert extras11.read_scale(d.uid, force=True)["status"] == "too_old" and weights(d) == {}


@pytest.mark.parametrize("raw,status", [("unavailable", "unavailable"), ("unknown", "unavailable"), ("999", "out_of_range")])
def test_unusable_states_are_not_stored(user, monkeypatch, raw, status):
    c = user(feature=("scale",))
    c.put("/api/scale", json={"entity": "sensor.waage", "unit": "kg"})
    monkeypatch.setattr(extras11, "ha_get", lambda path: state(raw))
    assert extras11.read_scale(c.uid, force=True)["status"] == status and weights(c) == {}


def test_config_is_validated_and_exported(user):
    c = user(feature=("scale",))
    assert c.put("/api/scale", json={"entity": "bad entity"}).status_code == 400
    assert c.put("/api/scale", json={"entity": "sensor.waage", "unit": "stone"}).status_code == 400
    assert c.put("/api/scale", json={"entity": "sensor.waage", "unit": "g"}).status_code == 200
    export = c.get("/api/export/json").json()
    assert export["scale"] == {"entity": "sensor.waage", "unit": "g"}
    other = user()
    other.post("/api/import/json", json={"data": export})
    assert other.get("/api/scale").json()["config"]["entity"] == "sensor.waage"


def test_feature_is_off_by_default(user):
    assert user().get("/api/settings").json()["features"]["scale"] is False
