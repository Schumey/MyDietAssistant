"""v1.5: recipe import from a Mealie server."""
import pytest

import mealie
from conftest import add_food

RECIPE = {"name": "Pfannkuchen", "slug": "pfannkuchen", "recipeServings": 4, "orgURL": "https://koch.test/pfannkuchen",
          "recipeIngredient": [
              {"display": "200 g Mehl", "quantity": 200, "unit": {"name": "Gramm", "abbreviation": "g"}, "food": {"name": "Mehl"}},
              {"display": "", "originalText": "250 ml Milch"},
              {"display": "", "originalText": "", "note": "", "quantity": 2, "unit": None, "food": {"name": "Eier"}},
              {"display": "", "originalText": "", "note": ""}],
          "recipeInstructions": [{"title": "", "text": "Teig anrühren."}, {"title": "", "text": "Ausbacken."}],
          "nutrition": {"calories": "320", "proteinContent": "9"}}


@pytest.fixture
def server(monkeypatch):
    calls = []

    def get_json(base, token, path, params=None):
        calls.append((base, token, path, params))
        if path == "/api/recipes":
            return {"page": 1, "per_page": 30, "total": 31, "items": [{"slug": "pfannkuchen", "name": "Pfannkuchen", "recipeServings": 4},
                                                                  {"name": "ohne Slug"}]}
        if path == "/api/recipes/pfannkuchen":
            return RECIPE
        raise ValueError("Nicht gefunden (Adresse oder Rezept prüfen).")

    monkeypatch.setattr(mealie, "get_json", get_json)
    return calls


def setup(c):
    assert c.put("/api/mealie", json={"url": "http://mealie.test:9000/", "token": " abc "}).json()["url"] == "http://mealie.test:9000"


def test_ingredient_lines_and_node():
    node = mealie.node_of(RECIPE)
    assert node["recipeIngredient"] == ["200 g Mehl", "250 ml Milch", "2 Eier"]
    assert node["recipeInstructions"] == ["Teig anrühren.", "Ausbacken."] and node["recipeYield"] == 4


def test_config_never_returns_the_token_and_keeps_it_when_omitted(user):
    c = user(feature=("recipes",))
    setup(c)
    assert c.get("/api/mealie").json() == {"url": "http://mealie.test:9000", "token_set": True}
    assert c.put("/api/mealie", json={"url": "http://mealie.test:9000/x"}).status_code == 200
    assert c.get("/api/mealie").json()["token_set"] is True
    assert "abc" not in str(c.get("/api/export/json").json())
    c.put("/api/mealie", json={"url": ""})
    assert c.get("/api/mealie").json() == {"url": "", "token_set": False}


@pytest.mark.parametrize("url", ["ftp://mealie", "http://user:pw@mealie.test", "http://127.0.0.1:9000", "http://169.254.169.254/"])
def test_bad_addresses_are_refused(user, url):
    assert user(feature=("recipes",)).put("/api/mealie", json={"url": url, "token": "t"}).status_code == 400


def test_list_and_import_draft(user, server):
    c = user(feature=("recipes",))
    add_food(c, "Mehl", 340)
    setup(c)
    lst = c.get("/api/mealie/recipes", params={"q": "pfann"}).json()
    assert lst["items"] == [{"slug": "pfannkuchen", "name": "Pfannkuchen", "servings": 4}] and lst["total"] == 31
    assert server[0][1] == "abc" and server[0][3]["search"] == "pfann"
    d = c.post("/api/mealie/import", json={"slug": "pfannkuchen"}).json()
    assert d["name"] == "Pfannkuchen" and d["portions"] == 4 and d["source"] == "https://koch.test/pfannkuchen"
    assert [i["matched"] for i in d["items"]] == [True, False, False] and d["items"][0]["kcal"] == 680
    assert d["instructions"].splitlines() == ["Teig anrühren.", "Ausbacken."] and d["nutrition"]["kcal"] == 320


def test_errors_and_access(user, server):
    c = user(feature=("recipes",))
    assert c.get("/api/mealie/recipes").status_code == 400   # not set up
    setup(c)
    assert c.post("/api/mealie/import", json={"slug": "gibt-es-nicht"}).status_code == 400
    assert c.post("/api/mealie/import", json={"slug": "../etc"}).status_code == 400
    assert user().get("/api/mealie/recipes").status_code == 403   # recipes feature off
