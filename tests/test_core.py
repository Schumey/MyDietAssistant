"""Diary, foods, goals, weights, statistics."""
from conftest import add_food, meal_ids

DAY = "2026-01-05"


def test_entry_scales_food_per_100g(me):
    fid = add_food(me, kcal=370, protein=13, carbs=60, fat=7)
    assert me.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 50}).status_code == 200
    d = me.get(f"/api/day/{DAY}").json()
    assert len(d["entries"]) == 1
    e = d["entries"][0]
    assert (e["grams"], e["kcal"], e["protein"]) == (50, 185, 6.5)
    assert d["totals"]["kcal"] == 185
    assert [m["name"] for m in d["meals"]] == ["Frühstück", "Mittagessen", "Abendessen", "Snacks"]


def test_entries_are_snapshots(me):
    fid = add_food(me, kcal=100)
    me.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 100})
    me.put(f"/api/foods/{fid}", json={"name": "Anders", "kcal": 999})
    e = me.get(f"/api/day/{DAY}").json()["entries"][0]
    assert (e["name"], e["kcal"]) == ("Haferflocken", 100)


def test_edit_and_delete_entry(me):
    fid = add_food(me, kcal=200)
    me.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 100})
    eid = me.get(f"/api/day/{DAY}").json()["entries"][0]["id"]
    assert me.put(f"/api/entries/{eid}", json={"grams": 150}).status_code == 200
    assert me.get(f"/api/day/{DAY}").json()["totals"]["kcal"] == 300
    assert me.delete(f"/api/entries/{eid}").status_code == 200
    assert me.get(f"/api/day/{DAY}").json()["entries"] == []


def test_quick_entry_has_no_grams(me):
    r = me.post("/api/entries/quick", json={"day": DAY, "name": "Restaurant", "kcal": 800, "protein": 30})
    assert r.status_code == 200
    e = me.get(f"/api/day/{DAY}").json()["entries"][0]
    assert (e["grams"], e["kcal"]) == (0, 800)


def test_input_validation(me):
    fid = add_food(me)
    assert me.get("/api/day/not-a-date").status_code == 400
    assert me.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 0}).status_code == 400
    assert me.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 10, "time": "25:00"}).status_code == 400
    assert me.post("/api/entries", json={"day": DAY, "food_id": 99999, "grams": 10}).status_code == 404
    assert me.put("/api/weights/2026-01-01", json={"kg": 5}).status_code == 400


def test_users_are_separated(user):
    a, b = user(), user()
    fid = add_food(a)
    a.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 100})
    assert b.get("/api/foods").json() == []
    assert b.get(f"/api/day/{DAY}").json()["entries"] == []
    assert b.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 100}).status_code == 404


def test_meals_can_be_added_renamed_and_deleted(me):
    me.get(f"/api/day/{DAY}")
    mid = me.post("/api/meals", json={"name": "Nachtschicht"}).json()["id"]
    assert me.put(f"/api/meals/{mid}", json={"name": "PWO"}).status_code == 200
    assert "PWO" in [m["name"] for m in me.get(f"/api/day/{DAY}").json()["meals"]]
    fid = add_food(me)
    me.post("/api/entries", json={"day": DAY, "meal_id": mid, "food_id": fid, "grams": 10})
    assert me.delete(f"/api/meals/{mid}").status_code == 409   # still has entries
    eid = me.get(f"/api/day/{DAY}").json()["entries"][0]["id"]
    me.delete(f"/api/entries/{eid}")
    assert me.delete(f"/api/meals/{mid}").status_code == 200


def test_goal_and_stats_per_day(me):
    me.put("/api/goal", json={"kcal": 2000, "protein": 100})
    fid = add_food(me, kcal=100)
    me.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 500})
    s = me.get("/api/stats?days=3").json()
    assert s["goal"]["kcal"] == 2000 and len(s["days"]) == 3
    assert all(d["goal_kcal"] == 2000 for d in s["days"])
    assert s["mode"] == "lose"


def test_goal_modes():
    from extras import goal_hit
    assert goal_hit("lose", 1900, 2000) and not goal_hit("lose", 2100, 2000)
    assert goal_hit("gain", 2100, 2000) and not goal_hit("gain", 1900, 2000)
    assert goal_hit("maintain", 2150, 2000) and not goal_hit("maintain", 2300, 2000)


def test_weight_roundtrip(me):
    assert me.put("/api/weights/2026-01-01", json={"kg": 82.5}).status_code == 200
    me.put("/api/weights/2026-01-02", json={"kg": 82.1})
    assert [w["kg"] for w in me.get("/api/weights").json()] == [82.5, 82.1]
    me.delete("/api/weights/2026-01-01")
    assert len(me.get("/api/weights").json()) == 1


def test_weekday_goals_need_the_feature(user):
    c = user()
    c.put("/api/goal", json={"kcal": 2000})
    c.put("/api/goal-weekdays/0", json={"kcal": 1500})
    assert c.get("/api/day/2026-01-05").json()["goal"]["kcal"] == 2000   # a Monday, feature still off
    c.put("/api/settings", json={"features": {"weekday_goals": True}})
    assert c.get("/api/day/2026-01-05").json()["goal"]["kcal"] == 1500
    assert c.get("/api/day/2026-01-06").json()["goal"]["kcal"] == 2000


def test_food_duplicates_and_merge(me):
    a = add_food(me, name="Reis")
    b = add_food(me, name="reis")
    groups = me.get("/api/foods/duplicates").json()
    assert len(groups) == 1 and {f["id"] for f in groups[0]} == {a, b}
    assert me.post("/api/foods/merge", json={"keep_id": a, "merge_ids": [b]}).json()["merged"] == 1
    assert [f["id"] for f in me.get("/api/foods").json()] == [a]


def test_food_list_paging_and_barcode(me):
    for i in range(7):
        add_food(me, name=f"Food {i}", barcode="4000000000017" if i == 3 else "")
    assert len(me.get("/api/foods?limit=3").json()) == 3
    assert len(me.get("/api/foods?limit=3&offset=6").json()) == 1
    hit = me.get("/api/foods?barcode=4000000000017").json()
    assert [f["name"] for f in hit] == ["Food 3"]
    assert me.get("/api/foods?q=4000000000017").json()[0]["barcode"] == "4000000000017"
    assert me.post("/api/foods", json={"name": "x", "kcal": 1, "barcode": "12ab"}).status_code == 200
    assert me.get("/api/foods?q=x").json()[0]["barcode"] == ""   # non-numeric barcodes are dropped


def test_saved_meal_roundtrip(me):
    fid = add_food(me, kcal=100)
    me.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 200})
    mid = meal_ids(me, DAY)[0]
    sid = me.post("/api/saved-meals", json={"day": DAY, "meal_id": mid, "name": "Standard"}).json()["id"]
    assert me.post(f"/api/saved-meals/{sid}/add", json={"day": "2026-01-06", "factor": 0.5}).status_code == 200
    assert me.get("/api/day/2026-01-06").json()["totals"]["kcal"] == 100


def test_pref_cache_serves_reads_from_memory_but_sees_writes():
    import extras
    from extras import get_pref, pref_cache, set_pref
    set_pref("cache-user", "k", {"a": 1})
    with pref_cache():
        assert get_pref("cache-user", "k") == {"a": 1}
        assert get_pref("cache-user", "none", "dflt") == "dflt"
        set_pref("cache-user", "k", {"a": 2})
        assert get_pref("cache-user", "k") == {"a": 2}
        assert get_pref("cache-user", "none", "other") == "other"
    assert get_pref("cache-user", "k") == {"a": 2}


def test_a_year_of_statistics_is_fast(user):
    import time
    c = user(feature=("activity", "weekday_goals"))
    c.put("/api/goal", json={"kcal": 2000})
    t = time.time()
    s = c.get("/api/stats?days=365").json()
    assert len(s["days"]) == 365
    assert time.time() - t < 1.0
