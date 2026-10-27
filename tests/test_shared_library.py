"""v1.15: recipes and saved meals in the shared household library."""
from conftest import add_food, meal_ids

DAY = "2026-03-10"


def make_recipe(c, name="Linsensuppe"):
    r = c.post("/api/recipes", json={"name": name, "portions": 2, "items": [
        {"name": "Linsen", "grams": 200, "kcal": 700, "protein": 50, "carbs": 120, "fat": 4}]})
    assert r.status_code == 200, r.text
    return r.json()["id"]


def make_meal(c, name="Frühstücksquark"):
    fid = add_food(c, "Quark", 67, 12, 4, 0.3)
    mid = meal_ids(c, DAY)[0]
    c.post("/api/entries", json={"day": DAY, "meal_id": mid, "food_id": fid, "grams": 250})
    sid = c.post("/api/saved-meals", json={"day": DAY, "meal_id": mid, "name": name}).json()["id"]
    c.delete(f"/api/day/{DAY}/entries?meal_id={mid}")
    return sid


def names(rows):
    return [r["name"] for r in rows]


def test_shared_recipe_is_visible_copyable_but_only_editable_by_its_owner(user):
    a, b, outsider = user("Anna", ("household", "recipes")), user("Ben", ("household", "recipes")), user("Otto", ("recipes",))
    rid = make_recipe(a)
    assert b.get("/api/recipes").json() == []                                  # not offered yet
    body = {"name": "Linsensuppe", "portions": 2, "shared": True, "items": a.get("/api/recipes").json()[0]["items"]}
    assert a.put(f"/api/recipes/{rid}", json=body).status_code == 200
    seen = b.get("/api/recipes").json()
    assert names(seen) == ["Linsensuppe"] and seen[0]["mine"] is False and seen[0]["owner_name"] == "Anna"
    assert outsider.get("/api/recipes").json() == []
    # its food is usable by Ben; he cannot change or delete the recipe
    assert b.put(f"/api/recipes/{rid}", json={**body, "name": "Geklaut"}).status_code == 404
    b.delete(f"/api/recipes/{rid}")
    assert names(a.get("/api/recipes").json()) == ["Linsensuppe"]
    food = next(f for f in b.get("/api/foods?q=Linsensuppe").json())
    assert b.post("/api/entries", json={"day": DAY, "food_id": food["id"], "grams": 100}).status_code == 200
    # Ben takes his own copy: it is his, and not shared
    new = b.post(f"/api/recipes/{rid}/copy").json()["id"]
    mine = [r for r in b.get("/api/recipes").json() if r["id"] == new][0]
    assert mine["mine"] and not mine["shared"] and mine["name"].endswith("(Kopie)")
    assert names(a.get("/api/recipes").json()) == ["Linsensuppe"]              # Anna does not see Ben's copy
    # unsharing hides it again, together with its food
    a.put(f"/api/recipes/{rid}", json={**body, "shared": False})
    assert [r["name"] for r in b.get("/api/recipes").json()] == ["Linsensuppe (Kopie)"]
    assert [f for f in b.get("/api/foods?q=Linsensuppe").json() if f["owner"] == a.uid] == []


def test_shared_meal_can_be_logged_and_copied_by_the_household(user):
    a, b = user("Anna", ("household",)), user("Ben", ("household",))
    sid = make_meal(a)
    assert b.get("/api/saved-meals").json() == []
    assert a.put(f"/api/saved-meals/{sid}", json={"name": "Frühstücksquark", "shared": True}).status_code == 200
    seen = b.get("/api/saved-meals").json()
    assert names(seen) == ["Frühstücksquark"] and not seen[0]["mine"] and seen[0]["owner_name"] == "Anna"
    assert b.post(f"/api/saved-meals/{sid}/add", json={"day": DAY, "factor": 2}).status_code == 200
    got = b.get(f"/api/day/{DAY}").json()["entries"]
    assert [e["name"] for e in got] == ["Quark"] and got[0]["grams"] == 500
    assert b.put(f"/api/saved-meals/{sid}", json={"name": "Geklaut", "shared": False}).status_code == 200      # silently ignored for non-owners
    assert names(a.get("/api/saved-meals").json()) == ["Frühstücksquark"] and a.get("/api/saved-meals").json()[0]["shared"] == 1
    b.delete(f"/api/saved-meals/{sid}")
    assert names(a.get("/api/saved-meals").json()) == ["Frühstücksquark"]
    new = b.post(f"/api/saved-meals/{sid}/copy").json()["id"]
    assert new != sid and [m for m in b.get("/api/saved-meals").json() if m["id"] == new][0]["mine"]


def test_nothing_is_shared_unless_both_sides_opt_in(user):
    a, b = user("Anna", ("household",)), user("Ben")
    sid = make_meal(a)
    a.put(f"/api/saved-meals/{sid}", json={"name": "Frühstücksquark", "shared": True})
    assert b.get("/api/saved-meals").json() == []
    assert b.post(f"/api/saved-meals/{sid}/add", json={"day": DAY}).status_code == 404


def test_other_members_meals_do_not_leak_into_suggestions_or_export(user):
    a, b = user("Anna", ("household", "suggest")), user("Ben", ("household", "suggest"))
    sid = make_meal(a)
    a.put(f"/api/saved-meals/{sid}", json={"name": "Frühstücksquark", "shared": True})
    assert b.get("/api/export/json").json()["saved_meals"] == []
    exported = a.get("/api/export/json").json()["saved_meals"]
    assert exported[0]["shared"] == 1
    c = user()
    c.post("/api/import/json", json={"data": a.get("/api/export/json").json()})
    assert c.get("/api/saved-meals").json()[0]["shared"] == 1


def test_shopping_list_can_use_shared_recipes(user):
    a, b = user("Anna", ("household", "recipes")), user("Ben", ("household", "shopping"))
    rid = make_recipe(a)
    a.put(f"/api/recipes/{rid}", json={"name": "Linsensuppe", "portions": 2, "shared": True, "items": a.get("/api/recipes").json()[0]["items"]})
    r = b.post("/api/shopping/list", json={"recipes": [{"id": rid, "amount": 4}]}).json()["items"]
    assert r == [{"name": "Linsen", "grams": 400.0}]


def test_members_may_change_what_is_offered_for_changing(user):
    a, b = user("Anna", ("household", "recipes")), user("Ben", ("household", "recipes"))
    rid = make_recipe(a)
    mine = lambda c, path: [r for r in c.get(path).json() if r["mine"]]
    items = mine(a, "/api/recipes")[0]["items"]
    body = {"name": "Linsensuppe", "portions": 2, "items": items}
    a.put(f"/api/recipes/{rid}", json={**body, "shared": 1})
    assert b.put(f"/api/recipes/{rid}", json={**body, "name": "Neu"}).status_code == 404           # offered for use only
    a.put(f"/api/recipes/{rid}", json={**body, "shared": 2})
    changed = [{**items[0], "grams": 400, "kcal": 1400}]
    assert b.put(f"/api/recipes/{rid}", json={**body, "name": "Linsensuppe XL", "shared": 0, "items": changed}).status_code == 200
    seen = mine(a, "/api/recipes")[0]
    assert seen["name"] == "Linsensuppe XL" and seen["items"][0]["grams"] == 400 and seen["shared"] == 2 and seen["mine"]      # the share level stays with Anna
    food = [f for f in a.get("/api/foods?q=Linsensuppe XL").json() if f["owner"] == a.uid][0]
    assert food["name"] == "Linsensuppe XL" and food["shared"] == 1                                    # the recipe's food follows, owned by Anna
    b.delete(f"/api/recipes/{rid}")
    assert len(mine(a, "/api/recipes")) == 1                                                            # deleting stays with the owner


def test_editable_saved_meals(user):
    a, b = user("Anna", ("household",)), user("Ben", ("household",))
    sid = make_meal(a, "Änderbares Müsli")
    mine = lambda c: [m for m in c.get("/api/saved-meals").json() if m["mine"]]
    a.put(f"/api/saved-meals/{sid}", json={"name": "Änderbares Müsli", "shared": 1})
    b.put(f"/api/saved-meals/{sid}", json={"name": "Geändert"})
    assert names(mine(a)) == ["Änderbares Müsli"]
    a.put(f"/api/saved-meals/{sid}", json={"name": "Änderbares Müsli", "shared": 2})
    items = mine(a)[0]["items"]
    assert b.put(f"/api/saved-meals/{sid}", json={"name": "Geändert", "shared": 0, "items": items}).status_code == 200
    got = mine(a)[0]
    assert got["name"] == "Geändert" and got["shared"] == 2
    assert b.put(f"/api/saved-meals/{sid}", json={"name": "Geändert", "items": []}).status_code == 400          # at least one component, as always
