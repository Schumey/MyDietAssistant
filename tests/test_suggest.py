"""Meal suggestions (v1.7): solver, endpoints, history combinations, export/import."""
import suggest
from conftest import add_food, meal_ids

DAY = "2026-03-10"


def item(name, grams, kcal, p, c, f, **kw):
    return {"name": name, "grams": grams, "kcal": kcal, "protein": p, "carbs": c, "fat": f, **kw}


def cand(items, **kw):
    from extras13 import cand_from_items
    return cand_from_items("Test", "", items, "saved", 1, **kw)


PASTA = item("Nudeln", 100, 350, 12, 70, 2, tol=0)
SAUCE = item("Soße", 150, 90, 3, 12, 3, tol=0)
CHEESE = item("Hüttenkäse", 200, 200, 25, 6, 8, mode="fixed", pack_g=200)

PRIO = {"kcal": 2, "protein": 2, "carbs": 1, "fat": 1}


def grams(res, name):
    return next(i["grams"] for i in res["items"] if i["name"] == name)


def test_fixed_item_stays_and_ratio_is_kept():
    c = cand([PASTA, SAUCE, CHEESE])
    # base meal: 640 kcal; ask for roughly 800
    res = suggest.best_fit(c, [], {"kcal": 800, "protein": 60, "carbs": 120, "fat": 20}, PRIO, {})
    assert grams(res, "Hüttenkäse") == 200
    ratio = grams(res, "Soße") / grams(res, "Nudeln")
    assert 1.4 <= ratio <= 1.6        # base ratio 1.5, only rounding may shift it
    assert grams(res, "Nudeln") > 100


def test_scale_range_is_respected():
    c = cand([PASTA, SAUCE], min_scale=0.8, max_scale=1.2)
    res = suggest.best_fit(c, [], {"kcal": 5000, "protein": 0, "carbs": 0, "fat": 0}, PRIO, {})
    assert grams(res, "Nudeln") <= 120
    res = suggest.best_fit(c, [], {"kcal": 10, "protein": 0, "carbs": 0, "fat": 0}, PRIO, {})
    assert grams(res, "Nudeln") >= 80


def test_tolerance_lets_an_item_deviate_but_not_beyond():
    sauce = {**SAUCE, "tol": 20}
    c = cand([PASTA, sauce], min_scale=1, max_scale=1)
    # wants a lot of fat: the sauce (fat) may grow by 20 % at most
    res = suggest.best_fit(c, [], {"kcal": 440, "protein": None, "carbs": None, "fat": 40}, {"kcal": 0, "protein": 0, "carbs": 0, "fat": 3}, {})
    assert 170 <= grams(res, "Soße") <= 185
    assert grams(res, "Nudeln") == 100


def test_pack_multiples():
    c = cand([PASTA, CHEESE], min_scale=1, max_scale=1)
    big = suggest.best_fit(c, [], {"kcal": 760, "protein": 62, "carbs": 82, "fat": 34}, PRIO, {})
    assert grams(big, "Hüttenkäse") == 400      # two packages fit this goal better
    single = cand([PASTA, {**CHEESE, "pack_min": 1, "pack_max": 1}], min_scale=1, max_scale=1)
    one = suggest.best_fit(single, [], {"kcal": 760, "protein": 62, "carbs": 82, "fat": 34}, PRIO, {})
    assert grams(one, "Hüttenkäse") == 200      # limited to a single package
    triple = cand([PASTA, {**CHEESE, "pack_min": 2, "pack_max": 3}], min_scale=1, max_scale=1)
    assert grams(suggest.best_fit(triple, [], {"kcal": 300, "protein": 20, "carbs": 70, "fat": 5}, PRIO, {}), "Hüttenkäse") == 400   # at least two packages
    optional = cand([PASTA, {**CHEESE, "pack_min": 0, "pack_max": 1}], min_scale=1, max_scale=1)
    res = suggest.best_fit(optional, [], {"kcal": 350, "protein": 12, "carbs": 70, "fat": 2}, PRIO, {})
    assert [i["name"] for i in res["items"]] == ["Nudeln"]           # zero packages: the ingredient is left out
    small = suggest.best_fit(c, [], {"kcal": 550, "protein": 37, "carbs": 76, "fat": 10}, PRIO, {})
    assert grams(small, "Hüttenkäse") == 200


def test_addon_only_when_it_helps():
    nuts = {"food_id": 1, "name": "Walnüsse", "min_g": 0, "max_g": 30, "step_g": 5,
            "per100": {"kcal": 700, "protein": 15, "carbs": 7, "fat": 65, "fiber": 0, "sugar": 0, "salt": 0, "sat_fat": 0}}
    c = cand([PASTA, SAUCE], min_scale=1, max_scale=1)
    base_kcal = 440
    hit = suggest.best_fit(c, [nuts], {"kcal": base_kcal, "protein": None, "carbs": None, "fat": None}, {"kcal": 3}, {})
    assert all(i["kind"] == "item" for i in hit["items"])
    more = suggest.best_fit(c, [nuts], {"kcal": base_kcal + 140, "protein": None, "carbs": None, "fat": None}, {"kcal": 3}, {})
    nut = [i for i in more["items"] if i["kind"] == "addon"]
    assert nut and 15 <= nut[0]["grams"] <= 25


def test_priorities_change_the_ranking():
    protein_meal = cand([item("Quark", 250, 170, 30, 10, 1)])
    carb_meal = cand([item("Reis", 250, 340, 6, 75, 1)])
    target = {"kcal": 250, "protein": 30, "carbs": 70, "fat": 5}
    for prio, first in (({"kcal": 0, "protein": 3, "carbs": 0, "fat": 0}, "Quark"), ({"kcal": 0, "protein": 0, "carbs": 3, "fat": 0}, "Reis")):
        out = suggest.rank([protein_meal, carb_meal], [], target, prio, {})
        assert out[0]["items"][0]["name"] == first


def test_kcal_cap_avoids_overshoot():
    big = cand([item("Pizza", 300, 900, 30, 100, 40)], min_scale=1, max_scale=1)
    small = cand([item("Salat", 300, 250, 8, 20, 12)], min_scale=1, max_scale=1)
    target = {"kcal": 600, "protein": 20, "carbs": 60, "fat": 25}
    out = suggest.rank([big, small], [], target, PRIO, {"kcal_cap": True})
    assert out[0]["items"][0]["name"] == "Salat"


# --- endpoints ----------------------------------------------------------------------------

def setup_user(user):
    c = user(feature=("suggest",))
    c.put("/api/goal", json={"kcal": 2000, "protein": 150, "carbs": 200, "fat": 70})
    return c


def save_meal(c, name, items, day=DAY):
    mid = meal_ids(c, day)[0]
    for fid, g in items:
        c.post("/api/entries", json={"day": day, "meal_id": mid, "food_id": fid, "grams": g})
    r = c.post("/api/saved-meals", json={"day": day, "meal_id": mid, "name": name})
    c.delete(f"/api/day/{day}/entries?meal_id={mid}")
    return r.json()["id"]


def test_feature_is_off_by_default(user):
    c = user()
    assert c.get(f"/api/suggest?day={DAY}").status_code == 403


def test_suggestions_use_saved_meal_modes(user):
    c = setup_user(user)
    nud = add_food(c, "Nudeln", 350, 12, 70, 2)
    sau = add_food(c, "Soße", 60, 2, 8, 2)
    kae = add_food(c, "Hüttenkäse", 100, 12, 3, 4)
    sid = save_meal(c, "Nudeln mit Hüttenkäse", [(nud, 100), (sau, 150), (kae, 200)])
    items = c.get("/api/saved-meals").json()[0]["items"]
    assert [i["mode"] for i in items] == ["scale"] * 3
    items[2].update(mode="fixed", pack_g=200)
    items[1].update(tol=20)
    assert c.put(f"/api/saved-meals/{sid}", json={"name": "Nudeln mit Hüttenkäse", "items": items, "min_scale": 0.7, "max_scale": 1.5}).status_code == 200
    again = c.get("/api/saved-meals").json()[0]
    assert (again["min_scale"], again["max_scale"]) == (0.7, 1.5)
    assert again["items"][2]["mode"] == "fixed" and again["items"][1]["tol"] == 20

    r = c.get(f"/api/suggest?day={DAY}&scope=day").json()
    assert not r["reached"] and r["items"]
    top = r["items"][0]
    assert top["source"] == "saved" and top["saved_meal_id"] == sid
    assert next(i for i in top["items"] if i["name"] == "Hüttenkäse")["grams"] in (200, 400)
    assert set(top["diff"]) == {"kcal", "protein", "carbs", "fat"}


def test_next_meal_scope_divides_the_rest(user):
    c = setup_user(user)
    nud = add_food(c, "Nudeln", 350, 12, 70, 2)
    save_meal(c, "Nudeln", [(nud, 100)])
    day = c.get(f"/api/suggest?day={DAY}&scope=day").json()
    nxt = c.get(f"/api/suggest?day={DAY}&scope=next").json()
    assert nxt["slots"] == 4 and abs(nxt["target"]["kcal"] - day["target"]["kcal"] / 4) < 1


def test_goal_reached_returns_no_suggestions(user):
    c = user(feature=("suggest",))
    c.put("/api/goal", json={"kcal": 100})
    f = add_food(c, "Kuchen", 400, 5, 50, 20)
    c.post("/api/entries", json={"day": DAY, "meal_id": meal_ids(c)[0], "food_id": f, "grams": 100})
    r = c.get(f"/api/suggest?day={DAY}").json()
    assert r["reached"] and r["items"] == []


def test_history_combination_becomes_a_candidate(user):
    c = setup_user(user)
    a, b = add_food(c, "Skyr", 63, 11, 4, 0.2), add_food(c, "Beeren", 45, 1, 9, 0.3)
    mid = meal_ids(c)[0]
    for day in ("2026-03-01", "2026-03-02", "2026-03-04"):
        for fid, g in ((a, 250), (b, 80)):
            c.post("/api/entries", json={"day": day, "meal_id": mid, "food_id": fid, "grams": g})
    r = c.get(f"/api/suggest?day={DAY}").json()
    hist = [i for i in r["items"] if i["source"] == "history"]
    assert hist and hist[0]["count"] == 3 and {i["name"] for i in hist[0]["items"]} == {"Skyr", "Beeren"}
    kept = c.post("/api/suggest/keep", json={"name": "Skyr mit Beeren", "items": hist[0]["items"]}).json()
    assert any(m["id"] == kept["id"] for m in c.get("/api/saved-meals").json())
    # once saved it is no longer listed as a combination
    again = c.get(f"/api/suggest?day={DAY}").json()
    assert not [i for i in again["items"] if i["source"] == "history"]


def test_addons_and_add_to_diary(user):
    c = setup_user(user)
    nud = add_food(c, "Nudeln", 350, 12, 70, 2)
    nuss = add_food(c, "Walnüsse", 700, 15, 7, 65)
    save_meal(c, "Nudeln", [(nud, 100)])
    assert c.put("/api/suggest/addons", json={"addons": [{"food_id": nuss, "max_g": 30}]}).status_code == 200
    cfg = c.get("/api/suggest/config").json()
    assert cfg["addons"][0]["name"] == "Walnüsse" and cfg["prio"]["kcal"] == 2
    top = c.get(f"/api/suggest?day={DAY}").json()["items"][0]
    mid = meal_ids(c)[0]
    assert c.post("/api/suggest/add", json={"day": DAY, "meal_id": mid, "saved_meal_id": top["saved_meal_id"], "items": top["items"]}).status_code == 200
    day = c.get(f"/api/day/{DAY}").json()
    assert len(day["entries"]) == len(top["items"])
    assert abs(day["totals"]["kcal"] - top["totals"]["kcal"]) < 2
    assert c.post("/api/suggest/add", json={"day": DAY, "items": []}).status_code == 400


def test_config_roundtrip_and_export_import(user):
    c = setup_user(user)
    nud = add_food(c, "Nudeln", 350, 12, 70, 2)
    nuss = add_food(c, "Walnüsse", 700, 15, 7, 65)
    sid = save_meal(c, "Nudeln", [(nud, 100)])
    items = c.get("/api/saved-meals").json()[0]["items"]
    items[0].update(mode="fixed", pack_g=100, tol=10, step_g=10, pack_min=0, pack_max=3)
    c.put(f"/api/saved-meals/{sid}", json={"name": "Nudeln", "items": items, "min_scale": 0.5, "max_scale": 2})
    c.put("/api/suggest/addons", json={"addons": [{"food_id": nuss, "min_g": 0, "max_g": 40, "step_g": 10}]})
    c.put("/api/suggest/config", json={"prio": {"kcal": 3, "fat": 0}, "kcal_cap": True, "scope": "next"})
    backup = c.get("/api/export/json").json()
    assert c.post("/api/import/json", json={"data": backup}).status_code == 200
    m = c.get("/api/saved-meals").json()[0]
    assert (m["min_scale"], m["max_scale"]) == (0.5, 2) and m["items"][0]["pack_g"] == 100 and (m["items"][0]["pack_min"], m["items"][0]["pack_max"]) == (0, 3) and m["items"][0]["step_g"] == 10
    cfg = c.get("/api/suggest/config").json()
    assert cfg["prio"] == {"kcal": 3, "protein": 2, "carbs": 1, "fat": 0} and cfg["kcal_cap"] and cfg["scope"] == "next"
    assert cfg["addons"][0]["name"] == "Walnüsse" and cfg["addons"][0]["max_g"] == 40
    # copying a meal keeps the settings
    cp = c.post(f"/api/saved-meals/{m['id']}/copy").json()["id"]
    copy = next(x for x in c.get("/api/saved-meals").json() if x["id"] == cp)
    assert copy["items"][0]["mode"] == "fixed" and copy["max_scale"] == 2
