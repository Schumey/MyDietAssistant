"""v1.1: recipe import from web pages, live shared household library, HA history backfill, current-meal sensor, MQTT discovery."""
import json
from datetime import datetime, timedelta, timezone

import pytest

import recipe_import as ri
from conftest import add_food

PAGE = """<html><head><title>Pfannkuchen</title>
<script type="application/ld+json">%s</script></head><body></body></html>"""

RECIPE = {"@context": "https://schema.org", "@graph": [
    {"@type": "WebSite", "name": "Kochseite"},
    {"@type": "Recipe", "name": "Pfannkuchen &amp; mehr", "recipeYield": ["4", "4 Portionen"],
     "recipeIngredient": ["200 g Weizenmehl", "2 Eier", "250 ml Milch", "1 Prise Salz", "1 1/2 EL Zucker"],
     "recipeInstructions": [{"@type": "HowToStep", "text": "Teig anrühren."}, {"@type": "HowToStep", "text": "Ausbacken."}],
     "nutrition": {"calories": "320 kcal", "proteinContent": "9 g"}}]}


def page(data=RECIPE):
    return PAGE % json.dumps(data)


# --- parsing ---------------------------------------------------------------------

@pytest.mark.parametrize("line,qty,unit,grams,name", [
    ("200 g Weizenmehl, gesiebt", 200, "g", 200, "Weizenmehl"),
    ("1 1/2 TL Salz", 1.5, "tl", 7.5, "Salz"),
    ("2-3 Zwiebeln", 3, "", None, "Zwiebeln"),
    ("½ Bund Petersilie", 0.5, "bund", None, "Petersilie"),
    ("250ml Milch", 250, "ml", 250, "Milch"),
    ("1,5 EL Olivenöl", 1.5, "el", 22.5, "Olivenöl"),
    ("1 Dose Tomaten (400 g)", 1, "dose", 400, "Tomaten"),
    ("2 cups all-purpose flour", 2, "cups", 480, "all-purpose flour"),
    ("Salz und Pfeffer", None, "", None, "Salz und Pfeffer"),
])
def test_ingredient_lines(line, qty, unit, grams, name):
    p = ri.parse_ingredient(line)
    assert (p["qty"], p["unit"], p["grams"], p["name"]) == (qty, unit, grams, name)


def test_ingredients_are_matched_to_foods_including_compound_words():
    foods = [{"name": "Mehl", "serving_g": 100, "kcal": 340}, {"name": "Eier", "serving_g": 60, "kcal": 140},
             {"name": "Olivenöl", "serving_g": 10, "kcal": 880}]
    items = ri.build_items(["200 g Weizenmehl", "2 Eier", "1 Prise Zimt"], foods)
    assert [i["matched"] for i in items] == [True, True, False]
    assert items[0]["name"] == "Mehl" and items[0]["kcal"] == 680
    assert items[1]["grams"] == 120 and items[1]["kcal"] == 168      # pieces use the food's serving size
    assert items[2]["name"] == "Zimt" and items[2]["kcal"] == 0


def test_draft_from_json_ld_graph():
    d = ri.to_draft(page(), "https://x.test/r", [])
    assert d["name"] == "Pfannkuchen & mehr" and d["portions"] == 4
    assert d["instructions"].splitlines() == ["Teig anrühren.", "Ausbacken."]
    assert d["nutrition"] == {"kcal": 320.0, "protein": 9.0}
    assert len(d["items"]) == 5 and d["source"] == "https://x.test/r"


def test_microdata_fallback_and_missing_recipe():
    html = '<h1>Suppe</h1><li itemprop="recipeIngredient">300 g Kartoffeln</li><li itemprop="recipeIngredient">1 l Brühe</li>'
    d = ri.to_draft(html, "https://x.test", [])
    assert d["name"] == "Suppe" and [i["grams"] for i in d["items"]] == [300, 1000]
    with pytest.raises(ValueError):
        ri.to_draft("<html>nichts</html>", "https://x.test", [])


def test_kj_calories_are_converted():
    assert ri.nutrition_of({"nutrition": {"calories": "1046 kJ"}})["kcal"] == 250.0


@pytest.mark.parametrize("url", ["ftp://example.com/x", "http://127.0.0.1/x", "http://localhost:8123/", "http://192.168.1.2/", "http://169.254.169.254/"])
def test_local_and_foreign_schemes_are_refused(url):
    with pytest.raises(ValueError):
        ri.check_public(url)


# --- endpoint ----------------------------------------------------------------------

def test_import_endpoint_matches_library_and_saves_with_source(user, monkeypatch):
    c = user(feature=("recipes",))
    add_food(c, "Mehl", 340)
    add_food(c, "Milch", 65)
    monkeypatch.setattr(ri, "fetch_page", lambda url: page())
    d = c.post("/api/recipes/import-url", json={"url": "x.test/pfannkuchen"}).json()
    assert d["source"] == "https://x.test/pfannkuchen"
    assert [i["matched"] for i in d["items"]] == [True, False, True, False, False]
    body = {"name": d["name"], "portions": d["portions"], "source": d["source"], "instructions": d["instructions"],
            "items": [i for i in d["items"] if i["grams"] > 0]}
    rid = c.post("/api/recipes", json=body).json()["id"]
    r = next(x for x in c.get("/api/recipes").json() if x["id"] == rid)
    assert r["source"] == "https://x.test/pfannkuchen" and "Ausbacken." in r["instructions"]
    export = c.get("/api/export/json").json()
    assert export["recipes"][0]["source"] == "https://x.test/pfannkuchen"
    other = user()
    assert other.post("/api/import/json", json={"data": export}).status_code == 200
    assert other.get("/api/recipes").json()[0]["instructions"] == r["instructions"]


def test_import_endpoint_errors(user, monkeypatch):
    c = user(feature=("recipes",))
    assert c.post("/api/recipes/import-url", json={"url": "http://127.0.0.1/"}).status_code == 400
    monkeypatch.setattr(ri, "fetch_page", lambda url: "<html></html>")
    assert c.post("/api/recipes/import-url", json={"url": "https://x.test"}).status_code == 400
    assert user().post("/api/recipes/import-url", json={"url": "https://x.test"}).status_code == 403


# --- shared household library ---------------------------------------------------------

def test_shared_foods_are_visible_usable_and_editable_by_household_members(user):
    a, b, outsider = user("Anna", ("household",)), user("Ben", ("household",)), user("Otto")
    fid = add_food(a, "Eigenbrot", 250)
    private = add_food(a, "Geheim", 100)
    assert b.get("/api/foods?q=Eigenbrot").json() == []
    a.put(f"/api/foods/{fid}", json={"name": "Eigenbrot", "kcal": 250, "shared": True})
    seen = b.get("/api/foods?q=Eigenbrot").json()
    assert [f["name"] for f in seen] == ["Eigenbrot"] and seen[0]["mine"] is False and seen[0]["owner_name"] == "Anna"
    assert outsider.get("/api/foods?q=Eigenbrot").json() == []
    assert private not in [f["id"] for f in b.get("/api/foods?q=Geheim").json()]
    day = "2026-02-03"
    assert b.post("/api/entries", json={"day": day, "food_id": fid, "grams": 100}).status_code == 200
    assert b.post("/api/entries", json={"day": day, "food_id": private, "grams": 100}).status_code == 404
    # edits by a member apply to everybody, the share flag stays with the owner
    b.put(f"/api/foods/{fid}", json={"name": "Eigenbrot", "kcal": 300, "shared": False})
    assert a.get("/api/foods?q=Eigen").json()[0]["kcal"] == 300 and a.get("/api/foods?q=Eigen").json()[0]["shared"] == 1
    assert b.delete(f"/api/foods/{fid}").status_code == 200
    assert len(a.get("/api/foods?q=Eigen").json()) == 1       # only the owner deletes


def test_sharing_needs_both_sides_to_opt_in(user):
    a, b = user("Anna", ("household",)), user("Ben")
    fid = add_food(a, "Quark", 70)
    a.put(f"/api/foods/{fid}", json={"name": "Quark", "kcal": 70, "shared": True})
    assert b.get("/api/foods?q=Quark").json() == []
    b.put("/api/settings", json={"features": {"household": True}})
    assert [f["name"] for f in b.get("/api/foods?q=Quark").json()] == ["Quark"]


def test_shared_flag_survives_export_and_import(user):
    a = user("Anna", ("household",))
    fid = add_food(a, "Quark", 70)
    a.put(f"/api/foods/{fid}", json={"name": "Quark", "kcal": 70, "shared": True})
    b = user()
    b.post("/api/import/json", json={"data": a.get("/api/export/json").json()})
    assert b.get("/api/foods").json()[0]["shared"] == 1


# --- activity history ----------------------------------------------------------------

def test_daily_max_takes_the_highest_value_per_local_day():
    import extras9
    day = datetime(2026, 3, 1, 12, 0).astimezone()
    rows = [{"state": "100", "last_changed": day.isoformat()},
            {"state": "8500", "last_changed": (day + timedelta(hours=3)).isoformat()},
            {"state": "unavailable", "last_changed": day.isoformat()},
            {"state": "40", "last_changed": (day + timedelta(days=1)).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")},
            {"state": "x"}]
    out = extras9.daily_max(rows)
    assert out[day.date().isoformat()] == 8500 and out[(day + timedelta(days=1)).date().isoformat()] == 40


def test_backfill_fills_days_but_keeps_manual_ones(user, monkeypatch, app_module):
    import extras9
    c = user("Anna", ("activity",))
    c.put("/api/activity/config", json={"steps_entity": "sensor.steps", "kcal_entity": "", "share": 50})
    today = datetime.now().astimezone().replace(hour=12)
    d1, d2 = (today - timedelta(days=1)), (today - timedelta(days=2))
    c.put(f"/api/activity/{d2.date().isoformat()}", json={"steps": 111, "kcal": 0})
    monkeypatch.setattr(extras9, "ha_get", lambda path, **kw: [[{"state": "9000", "last_changed": d1.isoformat()},
                                                                 {"state": "5000", "last_changed": d2.isoformat()}]])
    monkeypatch.setattr(extras9, "SUPERVISOR_TOKEN", "x")
    monkeypatch.setattr(app_module, "SUPERVISOR_TOKEN", "x")
    assert c.post("/api/activity/backfill?days=7").json() == {"days": 1}
    assert c.get(f"/api/activity?day={d1.date().isoformat()}").json()["steps"] == 9000
    assert c.get(f"/api/activity?day={d2.date().isoformat()}").json()["steps"] == 111
    assert c.post("/api/activity/backfill?days=0").status_code == 400


# --- sensors ---------------------------------------------------------------------------

def test_current_meal_sensor_follows_the_schedule(user, monkeypatch):
    import extras9
    c = user("Anna", ("schedule",))
    monkeypatch.setattr(extras9, "datetime", type("D", (datetime,), {"now": classmethod(lambda cls, tz=None: datetime(2026, 5, 4, 12, 0))}))
    assert extras9.current_meal_sensor(c.uid) == [("current_meal", "Mittagessen", "")]
    monkeypatch.setattr(extras9, "datetime", type("D", (datetime,), {"now": classmethod(lambda cls, tz=None: datetime(2026, 5, 4, 3, 0))}))
    assert extras9.current_meal_sensor(c.uid) == [("current_meal", "none", "")]
    assert extras9.current_meal_sensor(user("Otto").uid) == []


def test_publish_sends_mqtt_discovery_once_and_falls_back_to_states(user, monkeypatch, app_module):
    import httpx
    c = user("Anna")
    calls = []
    monkeypatch.setattr(app_module, "SUPERVISOR_TOKEN", "x")
    monkeypatch.setitem(app_module.OPTIONS, "mqtt_discovery", True)
    monkeypatch.setattr(app_module, "_discovered", set())
    monkeypatch.setattr(app_module, "_ha_post", lambda path, body: calls.append((path, body)))
    app_module.publish(c.uid, "Anna")
    cfg = [b for p, b in calls if b.get("topic", "").endswith("/config")]
    assert cfg and all(json.loads(b["payload"])["unique_id"].startswith("mydiet_anna_") for b in cfg)
    first = len(calls)
    app_module.publish(c.uid, "Anna")
    assert len(calls) - first < first                 # discovery is announced only once per process

    calls.clear()
    monkeypatch.setattr(app_module, "_discovered", set())

    def no_mqtt(path, body):
        if path.startswith("services/mqtt"):
            raise httpx.HTTPError("no mqtt")
        calls.append((path, body))
    monkeypatch.setattr(app_module, "_ha_post", no_mqtt)
    app_module.publish(c.uid, "Anna")
    assert any(p == "states/sensor.mydiet_anna_kcal_today" for p, _ in calls)


def test_text_sensor_has_no_unit_attributes(app_module):
    assert "unit_of_measurement" not in app_module.sensor_attrs("Anna", "current_meal", "")
    assert app_module.sensor_attrs("Anna", "kcal", "kcal")["state_class"] == "total"


# --- more table formats ------------------------------------------------------------------

def test_ciqual_columns_are_recognised(user):
    import extras10
    head = ["alim_code", "alim_nom_fr", "Energie, Règlement UE N° 1169/2011 (kJ/100 g)", "Energie, Règlement UE N° 1169/2011 (kcal/100 g)",
            "Protéines, N x 6.25 (g/100 g)", "Glucides (g/100 g)", "Lipides (g/100 g)", "Sucres (g/100 g)", "Fibres alimentaires (g/100 g)",
            "AG saturés (g/100 g)", "Sel chlorure de sodium (g/100 g)"]
    m = extras10.guess_food_mapping(head)
    assert [m[k] for k in ("name", "kcal", "kj", "protein", "carbs", "fat", "sugar", "fiber", "sat_fat", "salt")] == [1, 3, 2, 4, 5, 6, 7, 8, 9, 10]
    csv = ";".join(head) + "\n20047;Pomme, crue;218;52,1;0,3;11,8;0,2;10,1;2,1;< 0,1;0,01\n"
    foods, bad = extras10.parse_foods(csv.encode("utf-8"), m)
    assert bad == 0 and foods[0]["name"] == "Pomme, crue" and foods[0]["kcal"] == 52.1 and foods[0]["fiber"] == 2.1 and foods[0]["salt"] == 0.01


def test_swiss_database_columns_are_recognised():
    import extras10
    head = ["Name", "Energie, Kilokalorien (kcal)", "Protein (g)", "Kohlenhydrate, verfügbar (g)", "Fett, total (g)", "Nahrungsfasern (g)", "Zucker (g)",
            "Fettsäuren, gesättigt (g)", "Natrium (mg)"]
    m = extras10.guess_food_mapping(head)
    assert [m[k] for k in ("name", "kcal", "protein", "carbs", "fat", "fiber", "sugar", "sat_fat", "sodium")] == [0, 1, 2, 3, 4, 5, 6, 7, 8]


# --- fetching ----------------------------------------------------------------------------

class FakeResponse:
    def __init__(self, status=200, body=b"", location=None):
        self.status_code, self.body, self.headers = status, body, ({"location": location} if location else {})
        self.is_redirect = location is not None
        self.charset_encoding = "utf-8"

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False

    def iter_bytes(self):
        yield self.body


def test_fetch_follows_redirects_but_checks_every_hop(monkeypatch):
    monkeypatch.setattr(ri, "check_public", lambda url: None if "example.test" in url else (_ for _ in ()).throw(ValueError("lokal")))
    pages = {"https://example.test/a": FakeResponse(301, location="/b"), "https://example.test/b": FakeResponse(200, "Rezept äö".encode())}
    assert ri.fetch_page("https://example.test/a", get=lambda m, url, **kw: pages[url]) == "Rezept äö"
    evil = {"https://example.test/a": FakeResponse(302, location="http://192.168.0.1/admin")}
    with pytest.raises(ValueError):
        ri.fetch_page("https://example.test/a", get=lambda m, url, **kw: evil[url])


def test_fetch_limits_size_errors_and_redirect_loops(monkeypatch):
    monkeypatch.setattr(ri, "check_public", lambda url: None)
    with pytest.raises(ValueError, match="zu groß"):
        ri.fetch_page("https://x.test", get=lambda m, url, **kw: FakeResponse(200, b"x" * (ri.MAX_BYTES + 1)))
    with pytest.raises(ValueError, match="404"):
        ri.fetch_page("https://x.test", get=lambda m, url, **kw: FakeResponse(404))
    with pytest.raises(ValueError, match="Weiterleitungen"):
        ri.fetch_page("https://x.test", get=lambda m, url, **kw: FakeResponse(302, location="https://x.test"))


# --- staples from nutrition databases ------------------------------------------------

def _hit(name, kcal, source="off"):
    return {"source": source, "name": name, "kcal": kcal, "protein": 1, "carbs": 2, "fat": 3, "fiber": 0, "sugar": 0, "salt": 0, "sat_fat": 0}


def test_missing_staples_are_filled_from_database_hits():
    items = ri.build_items(["200 g Weizenmehl", "100 g Haferflocken", "1 Prise Zimt"], [{"name": "Mehl", "kcal": 340}])
    hits = {"Haferflocken": [_hit("Zarte Haferflocken", 360), _hit("Bio Haferflocken", 370), _hit("Schokoriegel", 500), _hit("Haferflocken kernig", 380)]}
    ri.fill_missing(items, lambda name: hits.get(name, []))
    assert items[0]["matched"] and "source" not in items[0]                      # library match stays as it was
    assert items[1]["matched"] and items[1]["source"] == "off" and items[1]["kcal"] == 370   # median of the three matching hits, per 100 g
    assert not items[2]["matched"] and items[2]["kcal"] == 0                      # no amount, no lookup


def test_failing_lookup_leaves_the_ingredient_unmatched():
    items = ri.build_items(["100 g Haferflocken"], [])
    def boom(name):
        raise OSError("offline")
    ri.fill_missing(items, boom)
    assert items[0]["matched"] is False


def test_import_endpoint_uses_databases_only_with_the_sources_feature(user, monkeypatch):
    import extras5
    monkeypatch.setattr(ri, "fetch_page", lambda url: page())
    calls = []
    monkeypatch.setattr(extras5, "cached_search", lambda s, q, b: (calls.append((s, q)) or [_hit(q, 400, s)], False))
    plain = user(feature=("recipes",))
    assert all(i["matched"] is False or i["name"] for i in plain.post("/api/recipes/import-url", json={"url": "x.test/p"}).json()["items"])
    assert calls == []
    c = user(feature=("recipes", "sources"))
    d = c.post("/api/recipes/import-url", json={"url": "x.test/p"}).json()
    assert calls and [i["name"] for i in d["items"] if i.get("source")]
    assert all(i["kcal"] > 0 for i in d["items"] if i.get("source"))


def test_database_hits_must_be_the_ingredient_not_a_dish_with_it():
    hits = [_hit("Madras curry simmer sauce", 117, "usda"), _hit("Päckchen Currypulver", 356), _hit("Curry Currypulver mild", 340)]
    assert ri.consensus("Madras-Currypulver", hits)["kcal"] == 356
    assert ri.consensus("Madras-Currypulver", hits[:1]) is None


def test_counted_staples_get_a_typical_piece_weight():
    items = ri.build_items(["1 Blumenkohl", "1 Limette (Saft davon)", "1,5 Bund Koriander", "Salz"], [])
    seen = []
    def search(term):
        seen.append(term)
        return [_hit(term, 100)]
    ri.fill_missing(items, search)
    assert [i["grams"] for i in items[:3]] == [600, 31.5, 75] and [i["kcal"] for i in items[:3]] == [600, 31.5, 75]
    assert items[3]["matched"] is False and items[3]["grams"] == 0      # no amount at all: left to the user


def test_second_database_is_only_asked_when_the_first_has_nothing():
    items = ri.build_items(["100 g Flour", "100 g Butter"], [])
    asked = []
    off = lambda t: (asked.append(("off", t)), [_hit("Butter", 740)] if t == "Butter" else [])[1]
    usda = lambda t: (asked.append(("usda", t)), [_hit("Flour", 364, "usda")])[1]
    ri.fill_missing(items, [off, usda])
    assert [i["source"] for i in items] == ["usda", "off"] and ("usda", "Butter") not in asked


def test_version_endpoint(user, monkeypatch):
    c = user()
    v = c.get("/api/version").json()
    assert v["version"] and v["latest"] is None and v["update"] is False
    import httpx

    class R:
        text = 'name: x\nversion: "99.0.0"\n'
        def raise_for_status(self): pass
    monkeypatch.setattr(httpx, "get", lambda *a, **k: R())
    v = c.get("/api/version?check=1").json()
    assert v["latest"] == "99.0.0" and v["update"] is True


def test_usda_and_austrian_table_columns_are_recognised():
    import extras10
    usda = ["Description", "Energy (kcal)", "Protein (g)", "Carbohydrate, by difference (g)", "Total lipid (fat) (g)", "Fiber, total dietary (g)",
            "Sugars, total including NLEA (g)", "Fatty acids, total saturated (g)", "Sodium, Na (mg)"]
    m = extras10.guess_food_mapping(usda)
    assert [m[k] for k in ("name", "kcal", "protein", "carbs", "fat", "fiber", "sugar", "sat_fat", "sodium")] == [0, 1, 2, 3, 4, 5, 6, 7, 8]
    at = ["Lebensmittelname", "Energie (kJ)", "Energie (kcal)", "Eiweiß (g)", "Verfügbare Kohlenhydrate (g)", "Fett gesamt (g)", "Ballaststoffe gesamt (g)", "Zucker gesamt (g)",
          "Gesättigte Fettsäuren gesamt (g)", "Salz (g)"]
    m = extras10.guess_food_mapping(at)
    assert [m[k] for k in ("name", "kj", "kcal", "protein", "carbs", "fat", "fiber", "sugar", "sat_fat", "salt")] == [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
