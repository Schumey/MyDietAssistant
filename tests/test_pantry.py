"""Pantry (v1.33): stock reduced by matching diary entries, restock, alerts to notify/to-do, backup round trip."""
import httpx
import pytest

import extras20
from conftest import add_food, meal_ids

DAY = "2026-03-10"


@pytest.fixture
def pan(user):
    c = user(feature=("pantry",))
    c.food = add_food(c, "Skyr Natur", 63, 11, 4, 0.2)
    c.meal = meal_ids(c, DAY)[0]
    return c


def eat(c, grams, day=DAY):
    r = c.post("/api/entries", json={"day": day, "meal_id": c.meal, "food_id": c.food, "grams": grams})
    assert r.status_code == 200, r.text
    return r.json()


def items(c):
    return {i["name"]: i for i in c.get("/api/pantry").json()["items"]}


def test_off_by_default(user):
    assert user().get("/api/pantry").status_code == 403


def test_diary_entries_reduce_the_stock_by_name(pan):
    pan.post("/api/pantry", json={"name": "Skyr", "remaining": 1000, "min_amount": 300})
    eat(pan, 250)
    eat(pan, 100)
    i = items(pan)["Skyr"]
    assert i["remaining"] == 650 and not i["low"]
    eat(pan, 400)
    assert items(pan)["Skyr"]["low"]


def test_entries_logged_before_the_stock_was_set_do_not_count(pan):
    eat(pan, 500)
    pan.post("/api/pantry", json={"name": "Skyr", "remaining": 1000})
    assert items(pan)["Skyr"]["remaining"] == 1000


def test_deleting_or_editing_an_entry_corrects_the_stock(pan):
    pan.post("/api/pantry", json={"name": "Skyr", "remaining": 1000})
    eat(pan, 300)
    eid = pan.get(f"/api/day/{DAY}").json()["entries"][0]["id"]
    assert items(pan)["Skyr"]["remaining"] == 700
    pan.put(f"/api/entries/{eid}", json={"grams": 100})
    assert items(pan)["Skyr"]["remaining"] == 900
    pan.delete(f"/api/entries/{eid}")
    assert items(pan)["Skyr"]["remaining"] == 1000


def test_match_words_and_quick_entries(pan):
    pan.post("/api/pantry", json={"name": "Joghurt", "match": "skyr, quark", "remaining": 500})
    eat(pan, 100)
    assert items(pan)["Joghurt"]["remaining"] == 400
    pan.post("/api/entries", json={"day": DAY, "meal_id": pan.meal, "name": "Skyr schnell", "kcal": 50})   # grams 0: no effect
    assert items(pan)["Joghurt"]["remaining"] == 400


def test_restock_adds_to_the_remaining_stock(pan):
    iid = pan.post("/api/pantry", json={"name": "Skyr", "remaining": 300, "pack_g": 500}).json()["id"]
    eat(pan, 100)
    assert pan.post(f"/api/pantry/{iid}/restock", json={}).status_code == 200
    assert items(pan)["Skyr"]["remaining"] == 700
    pan.post(f"/api/pantry/{iid}/restock", json={"grams": 50})
    assert items(pan)["Skyr"]["remaining"] == 750
    other = pan.post("/api/pantry", json={"name": "Quark", "remaining": 1}).json()["id"]
    assert pan.post(f"/api/pantry/{other}/restock", json={}).status_code == 400    # no pack size


def test_edit_sets_the_stock_only_when_given(pan):
    iid = pan.post("/api/pantry", json={"name": "Skyr", "remaining": 1000}).json()["id"]
    eat(pan, 200)
    pan.put(f"/api/pantry/{iid}", json={"name": "Skyr", "min_amount": 100})
    assert items(pan)["Skyr"]["remaining"] == 800
    pan.put(f"/api/pantry/{iid}", json={"name": "Skyr", "remaining": 1500})
    assert items(pan)["Skyr"]["remaining"] == 1500


def test_other_users_cannot_touch_the_item(pan, user):
    iid = pan.post("/api/pantry", json={"name": "Skyr", "remaining": 10}).json()["id"]
    other = user(feature=("pantry",))
    assert other.put(f"/api/pantry/{iid}", json={"name": "x"}).status_code == 404
    other.delete(f"/api/pantry/{iid}")
    assert "Skyr" in items(pan)
    assert other.get("/api/pantry").json()["items"] == []


def test_config_is_validated_and_not_taken_for_an_id(pan):
    assert pan.put("/api/pantry/config", json={"notify": "light.x"}).status_code == 400
    assert pan.put("/api/pantry/config", json={"todo": "notify.x"}).status_code == 400
    assert pan.put("/api/pantry/config", json={"notify": "notify.mobile_app_pixel", "todo": "todo.bring"}).status_code == 200
    assert pan.get("/api/pantry").json()["config"] == {"notify": "notify.mobile_app_pixel", "todo": "todo.bring"}


def test_alert_is_sent_once_and_rearmed_after_restock(pan, monkeypatch):
    monkeypatch.setattr(extras20, "SUPERVISOR_TOKEN", "x")
    calls = []
    monkeypatch.setattr(extras20, "_ha_post", lambda path, body: calls.append((path, body)))
    iid = pan.post("/api/pantry", json={"name": "Skyr", "remaining": 500, "min_amount": 200, "pack_g": 500}).json()["id"]
    pan.put("/api/pantry/config", json={"notify": "notify.pixel", "todo": "todo.bring"})
    assert extras20.check_pantry(pan.uid) == 0
    eat(pan, 350)
    assert extras20.check_pantry(pan.uid) == 1
    paths = {p: b for p, b in calls}
    assert paths["services/todo/add_item"] == {"entity_id": "todo.bring", "item": "Skyr – 500 g"}
    assert "Skyr" in paths["services/notify/pixel"]["message"] and "150" in paths["services/notify/pixel"]["message"]
    assert extras20.check_pantry(pan.uid) == 0                    # not again while it stays low
    pan.post(f"/api/pantry/{iid}/restock", json={})
    extras20.check_pantry(pan.uid)                                # re-armed
    eat(pan, 600)
    assert extras20.check_pantry(pan.uid) == 1


def test_failed_target_is_retried_and_no_target_sends_nothing(pan, monkeypatch):
    monkeypatch.setattr(extras20, "SUPERVISOR_TOKEN", "x")
    pan.post("/api/pantry", json={"name": "Skyr", "remaining": 100, "min_amount": 200})
    assert extras20.check_pantry(pan.uid) == 0                    # nothing configured
    pan.put("/api/pantry/config", json={"todo": "todo.bring"})

    def fail(path, body):
        raise httpx.ConnectError("down")
    monkeypatch.setattr(extras20, "_ha_post", fail)
    assert extras20.check_pantry(pan.uid) == 0
    monkeypatch.setattr(extras20, "_ha_post", lambda path, body: None)
    assert extras20.check_pantry(pan.uid) == 1


def test_sensor_lists_low_foods(pan):
    pan.post("/api/pantry", json={"name": "Skyr", "remaining": 100, "min_amount": 200})
    pan.post("/api/pantry", json={"name": "Reis", "remaining": 900, "min_amount": 200})
    assert extras20.pantry_sensor(pan.uid) == [("pantry_low", "Skyr", "")]


def test_backup_round_trip_keeps_the_remaining_stock(pan):
    pan.post("/api/pantry", json={"name": "Skyr", "remaining": 1000, "min_amount": 100, "pack_g": 500})
    eat(pan, 250)
    pan.put("/api/pantry/config", json={"todo": "todo.bring"})
    dump = pan.get("/api/export/json").json()
    assert dump["pantry"][0]["amount"] == 750
    assert pan.post("/api/import/json", json={"data": dump}).status_code == 200
    got = items(pan)["Skyr"]
    assert got["remaining"] == 750 and got["min_amount"] == 100 and got["pack_g"] == 500
    assert pan.get("/api/pantry").json()["config"]["todo"] == "todo.bring"
