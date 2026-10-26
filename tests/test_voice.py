"""Sentence entry for voice assistants (v1.10): parser, name matching and /api/ext/say."""
import pytest

import voice
from conftest import add_food, meal_ids

DAY = "2026-03-10"
KEY = {"X-MDA-Key": "geheim"}


def test_split_and_parse():
    assert voice.split_parts("zwei Äpfel und 200g Skyr, eine Banane") == ["zwei äpfel", "200 g skyr", "eine banane"]
    p = voice.parse_part("200 g von der pute")
    assert (p["grams"], p["words"]) == (200, ["pute"])
    p = voice.parse_part("1,5 kg reis")
    assert p["grams"] == 1500
    assert voice.parse_part("ein halbes brot")["qty"] == 0.5
    assert voice.parse_part("1 1/2 scheiben brot")["qty"] == 1.5
    assert voice.parse_part("2 scheiben brot")["words"] == ["scheiben", "brot"]
    assert voice.parse_part("skyr") == {"qty": 1.0, "grams": None, "words": ["skyr"], "explicit": False}


def test_matching_ignores_umlauts_plural_and_prefers_exact():
    names = ["Apfel", "Apfelsaft", "Magerquark", "Skyr natur"]
    assert names[voice.best("äpfel", names)[0]] == "Apfel"
    assert names[voice.best("skyr", names)[0]] == "Skyr natur"
    assert names[voice.best("magerquark natur", names)[0]] == "Magerquark"
    assert voice.best("pizza", names) is None


@pytest.fixture
def api(user, monkeypatch):
    import main
    monkeypatch.setitem(main.OPTIONS, "api_key", "geheim")
    c = user()
    c.post_say = lambda text, **kw: c.post("/api/ext/say", headers=KEY, json={"user": c.uid, "text": text, "day": DAY, **kw})
    return c


def entries(c):
    return c.get(f"/api/day/{DAY}").json()["entries"]


def test_needs_the_key(api):
    assert api.post("/api/ext/say", json={"user": api.uid, "text": "Apfel"}).status_code in (401, 403)
    assert api.post("/api/ext/say", headers={"X-MDA-Key": "falsch"}, json={"user": api.uid, "text": "Apfel"}).status_code == 401


def test_enters_several_foods_with_amounts(api):
    add_food(api, "Apfel", 52, 0.3, 14, 0.2, serving_g=180)
    add_food(api, "Skyr natur", 63, 11, 4, 0.2)
    add_food(api, "Brot", 250, 8, 48, 2, portions=[{"name": "Scheibe", "grams": 40}])
    r = api.post_say("zwei Äpfel und 200 g Skyr und 3 Scheiben Brot und Sushi").json()
    assert r["ok"] and r["unmatched"] == ["sushi"]
    got = {e["name"]: e["grams"] for e in entries(api)}
    assert got == {"Apfel": 360, "Skyr natur": 200, "Brot": 120}
    assert "Eingetragen" in r["message"] and "Nicht gefunden: sushi" in r["message"]


def test_saved_meal_and_quantity(api):
    f = add_food(api, "Whey", 400, 80, 8, 6)
    mid = meal_ids(api, DAY)[0]
    api.post("/api/entries", json={"day": DAY, "meal_id": mid, "food_id": f, "grams": 30})
    sid = api.post("/api/saved-meals", json={"day": DAY, "meal_id": mid, "name": "Post-Workout-Shake"}).json()["id"]
    api.delete(f"/api/day/{DAY}/entries?meal_id={mid}")
    r = api.post_say("Post-Workout-Shake").json()
    assert r["ok"] and entries(api)[0]["grams"] == 30
    r = api.post_say("2 Post-Workout-Shake").json()
    assert sum(e["grams"] for e in entries(api)) == 90


def test_dry_run_and_nothing_found(api):
    add_food(api, "Apfel", 52, 0.3, 14, 0.2)
    r = api.post_say("einen Apfel", dry_run=True).json()
    assert r["ok"] and r["dry_run"] and entries(api) == []
    r = api.post_say("Sushi", lang="en")
    assert r.status_code == 200 and r.json() == {**r.json(), "ok": False, "message": "Not found: sushi."}
    assert api.post_say("   ").status_code == 400


def test_meal_by_name(api):
    add_food(api, "Apfel", 52, 0.3, 14, 0.2)
    api.post_say("Apfel", meal="Snacks")
    names = {m["id"]: m["name"] for m in api.get(f"/api/day/{DAY}").json()["meals"]}
    assert names[entries(api)[0]["meal_id"]] == "Snacks"
