"""v1.35: period slider (tracked span, days=0 for everything) and use counts of saved meals and recipes."""
from datetime import date, timedelta

from conftest import add_food, meal_ids
from test_shared_library import make_meal, make_recipe


def ago(n):
    return (date.today() - timedelta(days=n)).isoformat()


def test_span_and_all_days(user):
    c = user()
    assert c.get("/api/stats/span").json() == {"first_day": None, "days": 0}
    fid = add_food(c, kcal=100)
    meal = meal_ids(c, ago(0))[0]
    c.post("/api/entries", json={"day": ago(63), "meal_id": meal, "food_id": fid, "grams": 100})
    c.post("/api/entries", json={"day": ago(0), "meal_id": meal, "food_id": fid, "grams": 100})
    assert c.get("/api/stats/span").json() == {"first_day": ago(63), "days": 64}
    days = c.get("/api/stats?days=0").json()["days"]
    assert len(days) == 64 and days[0]["day"] == ago(63) and days[0]["logged"]
    assert len(c.get("/api/stats?days=1000").json()["days"]) == 1000       # longer than two years is allowed now
    assert len(c.get("/api/stats?days=99999").json()["days"]) == 3650


def test_saved_meals_count_their_uses(user):
    c = user()
    a, b = make_meal(c, "A"), make_meal(c, "B")
    for sid in (b, b, a):
        assert c.post(f"/api/saved-meals/{sid}/add", json={"day": ago(1)}).status_code == 200
    rows = {m["name"]: m for m in c.get("/api/saved-meals").json()}
    assert rows["B"]["uses"] == 2 and rows["A"]["uses"] == 1
    assert rows["A"]["last_use"] > rows["B"]["last_use"]


def test_recipes_count_diary_entries_of_their_food(user):
    c = user(feature=("recipes",))
    rid = make_recipe(c, "Linsensuppe")
    make_recipe(c, "Chili")
    r = next(x for x in c.get("/api/recipes").json() if x["id"] == rid)
    meal = meal_ids(c, ago(0))[0]
    c.post("/api/entries", json={"day": ago(2), "meal_id": meal, "food_id": r["food_id"], "grams": 300})
    rows = {x["name"]: x for x in c.get("/api/recipes").json()}
    assert rows["Linsensuppe"]["uses"] == 1 and rows["Linsensuppe"]["last_used"] == ago(2)
    assert rows["Chili"]["uses"] == 0 and rows["Chili"]["last_used"] is None
