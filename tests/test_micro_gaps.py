"""v1.17: nutrient gaps over the last days."""
from datetime import date, timedelta

import pytest

from conftest import add_food, meal_ids


def log(c, food, day, grams=100):
    c.post("/api/entries", json={"day": day.isoformat(), "meal_id": meal_ids(c, day.isoformat())[0], "food_id": food, "grams": grams})


def days_ago(n):
    return date.today() - timedelta(days=n)


def test_needs_the_micros_feature(user):
    assert user().get("/api/micros/gaps").status_code == 403


def test_gaps_compare_averages_with_goals_per_nutrient(user):
    c = user(feature=("micros",))
    f = add_food(c, "Müsli", 380, 10, 60, 6, fiber=10, sugar=20, salt=1, sat_fat=2)        # per 100 g
    for n in range(4):
        log(c, f, days_ago(n), 200)                                                         # 20 g fiber, 40 g sugar, 2 g salt, 4 g sat. fat per day
    r = c.get("/api/micros/gaps").json()
    by = {i["key"]: i for i in r["items"]}
    assert r["logged"] == 4 and r["days"] == 7
    assert (by["fiber"]["avg"], by["fiber"]["goal"], by["fiber"]["delta_pct"], by["fiber"]["status"]) == (20.0, 30.0, -33, "low")
    assert (by["sugar"]["status"], by["salt"]["status"], by["sat_fat"]["status"]) == ("ok", "ok", "ok")
    log(c, add_food(c, "Chips", 540, 6, 50, 33, salt=3, sat_fat=15, fiber=4, sugar=1), days_ago(1), 200)    # +6 g salt, +30 g sat. fat on one day
    by = {i["key"]: i for i in c.get("/api/micros/gaps").json()["items"]}
    assert by["salt"]["status"] == "ok" and by["sat_fat"]["status"] == "ok"                 # averaged over four days: 3.5 g and 11.5 g
    for n in range(4):
        log(c, f, days_ago(n), 1000)
    by = {i["key"]: i for i in c.get("/api/micros/gaps").json()["items"]}
    assert by["salt"]["status"] == "high" and by["salt"]["delta_pct"] > 5


def test_unknown_values_are_not_reported_as_gaps(user):
    c = user(feature=("micros",))
    plain = add_food(c, "Wasser mit Geschmack", 10)                                          # no micros stored
    for n in range(3):
        log(c, plain, days_ago(n))
    by = {i["key"]: i for i in c.get("/api/micros/gaps").json()["items"]}
    assert all(i["status"] == "unknown" and i["avg"] is None for i in by.values())


def test_goals_can_be_changed_and_are_validated(user):
    c = user(feature=("micros",))
    assert c.get("/api/micros/gaps").json()["goals"] == {"fiber": 30, "sugar": 50, "salt": 6, "sat_fat": 20}
    assert c.put("/api/micros/goals", json={"fiber": 25, "sugar": 40, "salt": 5, "sat_fat": 18}).status_code == 200
    assert c.get("/api/micros/gaps").json()["goals"]["fiber"] == 25
    assert c.put("/api/micros/goals", json={"fiber": 0, "sugar": 40, "salt": 5, "sat_fat": 18}).status_code == 400
    assert c.get("/api/micros/gaps?end=2020-01-05&days=500").json()["days"] == 90
