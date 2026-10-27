"""v1.18: recipe from pasted text."""
import pytest

import recipe_import
from conftest import add_food

HEADED = """Linsensuppe
Für 4 Portionen

Zutaten
- 200 g rote Linsen
- 1 Zwiebel
2 EL Olivenöl
1,5 l Gemüsebrühe

Zubereitung
1. Zwiebel würfeln und im Öl andünsten.
2. Linsen und Brühe zugeben und 20 Minuten kochen.
"""

UNHEADED = """Pfannkuchen
250 g Mehl
2 Eier
500 ml Milch
Alles verrühren und portionsweise in der heißen Pfanne goldbraun ausbacken.
"""


def test_headings_split_title_yield_ingredients_and_steps():
    n = recipe_import.parse_recipe_text(HEADED)
    assert n["name"] == "Linsensuppe" and n["recipeYield"] == "4"
    assert n["recipeIngredient"] == ["200 g rote Linsen", "1 Zwiebel", "2 EL Olivenöl", "1,5 l Gemüsebrühe"]
    assert n["recipeInstructions"] == ["Zwiebel würfeln und im Öl andünsten.", "Linsen und Brühe zugeben und 20 Minuten kochen."]


def test_without_headings_amounts_mark_ingredients():
    n = recipe_import.parse_recipe_text(UNHEADED)
    assert n["name"] == "Pfannkuchen" and n["recipeIngredient"] == ["250 g Mehl", "2 Eier", "500 ml Milch"]
    assert n["recipeInstructions"][0].startswith("Alles verrühren")


def test_text_without_ingredients_is_refused():
    with pytest.raises(ValueError):
        recipe_import.parse_recipe_text("Ein Gedicht über Suppe\nohne Mengen")


def test_endpoint_returns_a_draft_with_matched_foods(user):
    c = user(feature=("recipes",))
    add_food(c, "Rote Linsen", 340, 24, 50, 1.5)
    r = c.post("/api/recipes/import-text", json={"text": HEADED})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["name"] == "Linsensuppe" and d["portions"] == 4 and d["source"] == "" and "Zwiebel würfeln" in d["instructions"]
    lentils = next(i for i in d["items"] if "Linsen" in i["name"])
    assert lentils["matched"] and lentils["grams"] == 200 and round(lentils["kcal"]) == 680
    assert any(not i["matched"] for i in d["items"])          # the onion is not in the library yet


def test_endpoint_needs_the_feature_and_valid_text(user):
    assert user().post("/api/recipes/import-text", json={"text": HEADED}).status_code == 403
    c = user(feature=("recipes",))
    assert c.post("/api/recipes/import-text", json={"text": "kein Rezept"}).status_code == 400
    assert c.post("/api/recipes/import-text", json={"text": "x" * 40000}).status_code == 400
