"""v1.34: sort orders of the food list (name, age, use in the diary, calories, protein density)."""
from conftest import add_food, meal_ids

DAY = "2026-03-10"


def names(c, sort):
    return [f["name"] for f in c.get(f"/api/foods?sort={sort}").json()]


def test_food_sort_orders(user):
    c = user()
    apple = add_food(c, "Apfel", 52, 0.3, 14, 0.2)
    skyr = add_food(c, "Skyr", 63, 11, 4, 0.2)
    add_food(c, "Butter", 740, 0.7, 0.6, 83)
    meal = meal_ids(c, DAY)[0]
    for fid, day in ((apple, "2026-03-01"), (apple, "2026-03-02"), (skyr, "2026-03-05")):
        assert c.post("/api/entries", json={"day": day, "meal_id": meal, "food_id": fid, "grams": 100}).status_code == 200
    assert names(c, "new") == ["Butter", "Skyr", "Apfel"]
    assert names(c, "old") == ["Apfel", "Skyr", "Butter"]
    assert names(c, "name") == ["Apfel", "Butter", "Skyr"]
    assert names(c, "used") == ["Apfel", "Skyr", "Butter"]
    assert names(c, "recent") == ["Skyr", "Apfel", "Butter"]
    assert names(c, "kcal") == ["Apfel", "Skyr", "Butter"]
    assert names(c, "protein")[0] == "Skyr"
    used = {f["name"]: f["uses"] for f in c.get("/api/foods?sort=used").json()}
    assert used == {"Apfel": 2, "Skyr": 1, "Butter": 0}
    assert names(c, "bogus") == names(c, "new")
    assert [f["name"] for f in c.get("/api/foods?sort=used&q=sky").json()] == ["Skyr"]
