"""Shopping list (v1.14): adding up recipes and meals, sending to a Home Assistant to-do list."""
import httpx
import pytest

import extras15
from conftest import add_food, meal_ids

DAY = "2026-03-10"


def recipe(c, name, portions, items):
    r = c.post("/api/recipes", json={"name": name, "portions": portions, "items": [
        {"name": n, "grams": g, "kcal": g, "protein": 0, "carbs": 0, "fat": 0} for n, g in items]})
    assert r.status_code == 200, r.text
    return r.json()["id"]


@pytest.fixture
def shop(user):
    c = user(feature=("recipes", "shopping"))
    pasta = recipe(c, "Pasta", 2, [("Nudeln", 200), ("Tomaten", 400), ("Käse", 50)])
    salad = recipe(c, "Salat", 1, [("tomaten", 150), ("Gurke", 100)])
    fid = add_food(c, "Skyr", 63, 11, 4, 0.2)
    mid = meal_ids(c, DAY)[0]
    c.post("/api/entries", json={"day": DAY, "meal_id": mid, "food_id": fid, "grams": 250})
    meal = c.post("/api/saved-meals", json={"day": DAY, "meal_id": mid, "name": "Frühstück"}).json()["id"]
    c.pick = {"pasta": pasta, "salad": salad, "meal": meal}
    return c


def test_off_by_default(user):
    assert user().post("/api/shopping/list", json={}).status_code == 403


def test_amounts_are_scaled_by_portions_and_summed_by_name(shop):
    p = shop.pick
    r = shop.post("/api/shopping/list", json={"recipes": [{"id": p["pasta"], "amount": 4}, {"id": p["salad"], "amount": 2}],
                                             "meals": [{"id": p["meal"], "amount": 2}]}).json()["items"]
    got = {i["name"].lower(): i["grams"] for i in r}
    assert got == {"nudeln": 400, "tomaten": 800 + 300, "käse": 100, "gurke": 200, "skyr": 500}
    assert [i["name"].lower() for i in r] == sorted(got)           # alphabetical
    assert shop.post("/api/shopping/list", json={"recipes": [{"id": p["pasta"], "amount": 0}]}).json()["items"] == []


def test_other_users_recipes_are_not_visible(shop, user):
    other = user(feature=("shopping",))
    assert other.post("/api/shopping/list", json={"recipes": [{"id": shop.pick["pasta"], "amount": 2}]}).json()["items"] == []


def test_lines_and_sending_to_a_todo_list(shop, monkeypatch):
    assert extras15.line({"name": "Skyr", "grams": 450}) == "Skyr – 450 g"
    assert extras15.line({"name": "Reis", "grams": 1250}) == "Reis – 1,25 kg"
    assert extras15.line({"name": "Salz", "grams": 0}) == "Salz"
    calls = []
    monkeypatch.setattr(extras15, "SUPERVISOR_TOKEN", "x")
    monkeypatch.setattr(extras15, "_ha_post", lambda path, body: calls.append((path, body)))
    monkeypatch.setattr(extras15, "ha_get", lambda path: [
        {"entity_id": "todo.shopping_list", "attributes": {"friendly_name": "Shopping List"}}, {"entity_id": "sensor.x", "attributes": {}}])
    assert shop.get("/api/shopping/todos").json() == {"entities": [{"id": "todo.shopping_list", "name": "Shopping List"}], "last": ""}
    r = shop.post("/api/shopping/send", json={"entity": "todo.shopping_list", "items": [{"name": "Skyr", "grams": 450}, {"name": "Salz", "grams": 0}]})
    assert r.json() == {"sent": 2}
    assert calls == [("services/todo/add_item", {"entity_id": "todo.shopping_list", "item": "Skyr – 450 g"}),
                     ("services/todo/add_item", {"entity_id": "todo.shopping_list", "item": "Salz"})]
    assert shop.get("/api/shopping/todos").json()["last"] == "todo.shopping_list"      # remembered for next time


def test_send_validates_and_reports_a_broken_connection(shop, monkeypatch):
    assert shop.post("/api/shopping/send", json={"entity": "sensor.x", "items": [{"name": "a", "grams": 1}]}).status_code == 400
    assert shop.post("/api/shopping/send", json={"entity": "todo.a", "items": []}).status_code == 400
    monkeypatch.setattr(extras15, "SUPERVISOR_TOKEN", "x")

    def boom(path, body):
        raise httpx.ConnectError("down")
    monkeypatch.setattr(extras15, "_ha_post", boom)
    assert shop.post("/api/shopping/send", json={"entity": "todo.a", "items": [{"name": "a", "grams": 1}]}).status_code == 502
