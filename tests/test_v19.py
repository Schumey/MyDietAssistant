"""v1.9: categories from imported tables, deleting parts of the own data, localized reports and notifications."""
import json

import pytest

from conftest import add_food, meal_ids


def import_table(c, data: bytes, category=""):
    p = c.post("/api/import/foods/preview", content=data).json()
    r = c.post(f"/api/import/foods?category={category}&mapping={json.dumps(p['mapping'])}", content=data)
    assert r.status_code == 200, r.text
    return p


def test_categories_of_an_imported_table_are_kept(me):
    data = "Name;Kategorie;kcal\nApfel;Obst;52\nBrot;;250\nKäse;Milch, Käse;350\n".encode()
    p = import_table(me, data, category="Meine Liste")
    assert p["mapping"]["category"] == 1
    cats = {f["name"]: f["category"] for f in me.get("/api/foods").json()}
    assert cats == {"Apfel": "Obst", "Brot": "Meine Liste", "Käse": "Milch"}   # empty cell: the dialog's category, several: the first


def test_open_food_facts_category_tags_lose_their_language_prefix(me):
    data = "product_name,categories,energy-kcal_100g\nHafer,\"en:cereals,en:oats\",370\n".encode()
    import_table(me, data)
    assert me.get("/api/foods").json()[0]["category"] == "cereals"


def seed(c):
    fid = add_food(c, "Hafer")
    assert c.post("/api/entries", json={"day": "2026-01-05", "food_id": fid, "grams": 50}).status_code == 200
    assert c.post("/api/saved-meals", json={"day": "2026-01-05", "meal_id": meal_ids(c)[0], "name": "Müsli"}).status_code == 200
    assert c.put("/api/weights/2026-01-05", json={"kg": 80}).status_code == 200


def test_delete_chosen_parts_only(user):
    a, b = user("A"), user("B")
    seed(a); seed(b)
    counts = a.get("/api/data/counts").json()
    assert counts["foods"] == 1 and counts["diary"] == 1 and counts["weights"] == 1 and counts["saved_meals"] == 1
    assert a.post("/api/data/delete", json={"parts": ["diary", "weights"]}).json() == {"deleted": ["diary", "weights"]}
    after = a.get("/api/data/counts").json()
    assert after["diary"] == 0 and after["weights"] == 0 and after["foods"] == 1 and after["saved_meals"] == 1
    assert b.get("/api/data/counts").json()["diary"] == 1   # other users are untouched
    a.post("/api/data/delete", json={"parts": ["foods", "saved_meals", "recipes", "goals", "triggers"]})
    assert not any(a.get("/api/data/counts").json().values())
    assert len(b.get("/api/foods").json()) == 1


def test_delete_needs_a_known_part(me):
    assert me.post("/api/data/delete", json={"parts": []}).status_code == 400
    assert me.post("/api/data/delete", json={"parts": ["users"]}).status_code == 400


def test_deleting_recipes_removes_their_foods(user):
    c = user("R", feature=("recipes",))
    r = c.post("/api/recipes", json={"name": "Brei", "portions": 2, "items": [{"name": "Hafer", "grams": 100, "kcal": 370, "protein": 13, "carbs": 60, "fat": 7}]})
    assert r.status_code == 200, r.text
    assert c.get("/api/data/counts").json()["foods"] == 1
    c.post("/api/data/delete", json={"parts": ["recipes"]})
    assert c.get("/api/data/counts").json()["foods"] == 0


@pytest.mark.parametrize("lang,word", [("nl", "Voedingsrapport"), ("it", "Rapporto nutrizionale"), ("fr", "Rapport nutritionnel"), ("es", "Informe nutricional"), ("en", "Nutrition report"), ("de", "Ernährungsbericht")])
def test_report_follows_the_interface_language(me, lang, word):
    me.put("/api/settings", json={"lang": lang})
    assert word in me.get("/api/export/report").text


def test_report_in_auto_mode_follows_the_browser_language(me):
    assert "Voedingsrapport" in me.get("/api/export/report", headers={"Accept-Language": "nl-NL,nl;q=0.9,en;q=0.5"}).text
    assert "Ernährungsbericht" in me.get("/api/export/report", headers={"Accept-Language": "sv"}).text


def test_push_texts_follow_the_interface_language(me):
    import extras2
    me.put("/api/settings", json={"lang": "nl"})
    title, msg = extras2.notify_text(me.uid, 1, "20:00")
    assert title == "Voedingsdagboek" and "20:00" in msg and "Uhr" not in msg
    assert extras2.notify_text("someone-else", 2, "Lunch", "12:00", "14:00")[0] == "Ernährungstagebuch"
