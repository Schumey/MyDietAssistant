"""Optional features: activity budget, meal schedule, lookup cache, food check, food table import, household."""
import io
import zipfile
from datetime import datetime

import pytest

import extras9
from conftest import add_food

DAY = "2026-04-06"


# --- activity -----------------------------------------------------------------------

def test_activity_adds_a_share_of_burned_kcal_to_the_goal(user):
    c = user(feature=("activity",))
    c.put("/api/goal", json={"kcal": 2000})
    assert c.get(f"/api/day/{DAY}").json()["goal"]["kcal"] == 2000
    c.put(f"/api/activity/{DAY}", json={"steps": 8000, "kcal": 400})   # default share 50 %
    g = c.get(f"/api/day/{DAY}").json()["goal"]
    assert (g["kcal"], g["activity_bonus"], g["activity_kcal"]) == (2200, 200, 400)
    c.put("/api/activity/config", json={"share": 100})
    assert c.get(f"/api/day/{DAY}").json()["goal"]["kcal"] == 2400
    assert next(d for d in c.get("/api/stats?days=400").json()["days"] if d["day"] == DAY)["goal_kcal"] == 2400


def test_activity_off_by_default(user):
    c = user()
    c.put("/api/goal", json={"kcal": 2000})
    c.put(f"/api/activity/{DAY}", json={"steps": 8000, "kcal": 400})
    assert c.get(f"/api/day/{DAY}").json()["goal"]["kcal"] == 2000


def test_steps_alone_are_converted_with_the_body_weight(user):
    c = user(feature=("activity",))
    c.put("/api/weights/2026-04-01", json={"kg": 80})
    c.put(f"/api/activity/{DAY}", json={"steps": 10000, "kcal": 0})
    a = c.get(f"/api/activity?day={DAY}").json()
    assert (a["kcal"], a["estimated"]) == (400, True)   # 10 000 steps * 80 kg * 0.0005
    assert a["bonus"] == 200


def test_activity_sensor_sync_keeps_the_highest_value_and_respects_manual_days(user, monkeypatch):
    c = user(feature=("activity",))
    c.put("/api/activity/config", json={"steps_entity": "sensor.steps", "kcal_entity": "sensor.active"})
    monkeypatch.setattr(extras9, "SUPERVISOR_TOKEN", "x")
    values = {"sensor.steps": 5000.0, "sensor.active": 250.0}
    monkeypatch.setattr(extras9, "sensor_value", lambda e: values[e])
    today = datetime.now().date().isoformat()
    r = c.post("/api/activity/sync").json()
    assert (r["steps"], r["kcal"]) == (5000, 250)
    values.update({"sensor.steps": 100.0, "sensor.active": 5.0})   # sensor reset at midnight
    assert c.post("/api/activity/sync").json()["steps"] == 5000
    c.put(f"/api/activity/{today}", json={"steps": 1, "kcal": 1})   # typed in by hand: sensors no longer overwrite
    values["sensor.steps"] = 99999.0
    assert c.post("/api/activity/sync").json()["steps"] == 1
    c.delete(f"/api/activity/{today}")
    assert c.post("/api/activity/sync").json()["steps"] == 99999


def test_activity_config_validation(me):
    assert me.put("/api/activity/config", json={"steps_entity": "no entity"}).status_code == 400
    assert me.put(f"/api/activity/{DAY}", json={"steps": -1}).status_code == 400


# --- meal schedule ------------------------------------------------------------------

def at(h, m=0):
    return datetime(2026, 4, 6, h, m)


def test_schedule_uses_default_windows_and_finds_the_next_meal(me):
    names = lambda s: {m["id"]: m["name"] for m in s["meals"]}
    s = extras9.schedule(me.uid, at(12))
    assert names(s)[s["current"]] == "Mittagessen"
    s = extras9.schedule(me.uid, at(15))
    assert s["current"] is None and names(s)[s["next"]] == "Abendessen"
    assert extras9.schedule(me.uid, at(23, 30))["next"] is None


def test_custom_window_over_midnight_and_logged_flag(me):
    mid = me.post("/api/meals", json={"name": "Nachtschicht", "from_time": "22:00", "to_time": "02:00"}).json()["id"]
    assert extras9.schedule(me.uid, at(23))["current"] == mid
    assert extras9.schedule(me.uid, at(1))["current"] == mid
    assert extras9.schedule(me.uid, at(12))["current"] != mid
    me.put(f"/api/meals/{mid}", json={"name": "Nachtschicht", "from_time": "", "to_time": ""})
    assert extras9.schedule(me.uid, at(23))["current"] is None


def test_schedule_endpoint_is_empty_without_the_feature(user):
    assert user().get("/api/schedule").json()["meals"] == []
    s = user(feature=("schedule",)).get("/api/schedule").json()
    assert [m["name"] for m in s["meals"]][:2] == ["Frühstück", "Mittagessen"]


def test_meal_times_are_validated(me):
    me.get(f"/api/day/{DAY}")
    assert me.post("/api/meals", json={"name": "X", "from_time": "99:99"}).status_code == 400


# --- lookup cache and online sources --------------------------------------------------

class FakeResponse:
    def __init__(self, data, status=200):
        self.data, self.status_code = data, status

    def json(self):
        return self.data


@pytest.fixture
def online(monkeypatch):
    """Replace the internet: counts requests per host and serves small fixed answers."""
    calls = []
    product = {"code": "", "product_name": "Magerquark", "brands": "Milram", "nutriments": {
        "energy-kcal_100g": 67, "proteins_100g": 12, "carbohydrates_100g": 3.5, "fat_100g": 0.3, "salt_100g": 0.1}}

    def fake_get(url, **kw):
        calls.append(url)
        if "search.openfoodfacts.org" in url:
            return FakeResponse({"hits": [product]})
        if "openfoodfacts.org/api" in url:
            return FakeResponse({"product": None if url.endswith("/0000.json") else product})
        if "nal.usda.gov" in url:
            return FakeResponse({"foods": [{"description": "QUARK", "brandName": "TEST", "fdcId": 1, "gtinUpc": "4011111111116", "foodNutrients": [
                {"nutrientId": 1008, "value": 70}, {"nutrientId": 1003, "value": 11}, {"nutrientId": 1005, "value": 4}, {"nutrientId": 1004, "value": 0.5}]}]})
        raise AssertionError(url)

    import httpx
    monkeypatch.setattr(httpx, "get", fake_get)
    return calls


def test_barcode_lookups_are_cached_locally(user, online):
    c = user(feature=("sources",))
    first = c.get("/api/lookup?barcode=4011111111116&sources=off").json()
    assert first["results"][0]["name"] == "Magerquark" and first["cached"] == []
    second = c.get("/api/lookup?barcode=4011111111116&sources=off").json()
    assert second["results"] == first["results"] and second["cached"] == ["off"]
    assert len([u for u in online if "openfoodfacts" in u]) == 1


def test_text_searches_are_cached_and_the_cache_can_be_cleared(user, online):
    c = user(feature=("sources",))
    c.get("/api/lookup?q=Quark%20Cache&sources=off,usda")
    r = c.get("/api/lookup?q=Quark%20Cache&sources=off,usda").json()
    assert sorted(r["cached"]) == ["off", "usda"] and len(online) == 2
    assert c.get("/api/lookup/cache").json()["entries"] >= 2
    c.delete("/api/lookup/cache")
    assert c.get("/api/lookup/cache").json()["entries"] == 0


def test_unknown_products_are_cached_too(me, online):
    assert me.get("/api/off/barcode/0000").status_code == 404
    assert me.get("/api/off/barcode/0000").status_code == 404
    assert len(online) == 1


def test_lookup_needs_the_feature_and_valid_input(user):
    assert user().get("/api/lookup?q=x").status_code == 403
    c = user(feature=("sources",))
    assert c.get("/api/lookup").status_code == 400
    assert c.get("/api/lookup?barcode=12ab").status_code == 400


def test_check_food_compares_with_the_online_value(user, online):
    c = user(feature=("sources",))
    ok = add_food(c, name="Magerquark", brand="Milram", kcal=67, protein=12, carbs=3.5, fat=0.3, barcode="4022222222223")
    off = add_food(c, name="Magerquark Milram", kcal=120, protein=12, carbs=3.5, fat=0.3)
    none = add_food(c, name="Völlig anderes Zeug")
    assert c.get(f"/api/foods/{ok}/check").json()["level"] == "ok"
    r = c.get(f"/api/foods/{off}/check").json()
    assert r["level"] == "differs" and r["diff"]["kcal"] == -53
    assert c.get(f"/api/foods/{none}/check").json()["level"] == "none"
    assert c.get("/api/foods/99999/check").status_code == 404


# --- food table import ---------------------------------------------------------------

BLS = ("SBLS;ST;STE;GCAL;GJ;ZE;ZF;ZK;ZB\n"
       "B100000;Weizenvollkornbrot;Wholemeal bread;215,0;900;7,5;1,2;42,1;6,0\n"
       "B200000;Butter;Butter;741;3100;0,7;83,2;0,6;0\n"
       "X;Ohne Energie;;;;1;1;1;1\n")


def test_bls_style_csv_is_mapped_and_imported(me):
    p = me.post("/api/import/foods/preview", content=BLS.encode("cp1252")).json()
    assert p["preset"] == "BLS" and p["items"] == 2 and p["skipped"] == 1
    h = p["headers"]
    assert {f: h[i] for f, i in p["mapping"].items() if i is not None} == {
        "name": "ST", "kcal": "GCAL", "kj": "GJ", "protein": "ZE", "fat": "ZF", "carbs": "ZK", "fiber": "ZB"}
    assert p["sample"][0]["kcal"] == 215 and p["sample"][0]["protein"] == 7.5
    import json
    q = f"/api/import/foods?category=BLS&mapping={json.dumps(p['mapping'])}"
    assert me.post(q, content=BLS.encode("cp1252")).json() == {"added": 2, "duplicates": 0, "skipped": 1}
    assert me.post(q, content=BLS.encode("cp1252")).json()["added"] == 0   # same foods again: skipped
    foods = {f["name"]: f for f in me.get("/api/foods").json()}
    assert foods["Butter"]["category"] == "BLS" and foods["Butter"]["fat"] == 83.2


def xlsx(rows):
    def cell(ref, v):
        return f'<c r="{ref}"><v>{v}</v></c>' if isinstance(v, (int, float)) else f'<c r="{ref}" t="inlineStr"><is><t>{v}</t></is></c>'
    sheet = "".join(f'<row r="{i}">' + "".join(cell(f"{chr(65 + j)}{i}", v) for j, v in enumerate(r)) + "</row>" for i, r in enumerate(rows, 1))
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("xl/worksheets/sheet1.xml", f'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>{sheet}</sheetData></worksheet>')
    return buf.getvalue()


def test_xlsx_import_and_energy_in_kilojoules(me):
    data = xlsx([["Name", "Energy (kJ)", "Protein (g)", "Sodium (mg)"], ["Cracker", 1900, 9, 800], ["Oel", 3700, 0, 0]])
    p = me.post("/api/import/foods/preview", content=data).json()
    assert p["items"] == 2
    import json
    me.post(f"/api/import/foods?mapping={json.dumps(p['mapping'])}", content=data)
    f = {x["name"]: x for x in me.get("/api/foods").json()}
    assert round(f["Cracker"]["kcal"]) == 454 and f["Cracker"]["salt"] == 2.0   # 800 mg sodium = 2 g salt


def test_broken_food_files_are_rejected(me):
    assert me.post("/api/import/foods/preview", content=b"").status_code == 400
    assert me.post("/api/import/foods/preview", content=b"PK\x03\x04nonsense").status_code == 400
    assert me.post("/api/import/foods/preview", content=b"only one line").status_code == 400
    assert me.post("/api/import/foods?mapping=%7B%7D", content=BLS.encode()).status_code == 400


# --- household: sharing -----------------------------------------------------------------

def test_sharing_foods_and_meals_copies_them_to_household_members(user):
    a, b, outsider = user(feature=("household",)), user(feature=("household",)), user()
    fid = add_food(a, name="Selbstgemachte Soße", barcode="4033333333339")
    a.put(f"/api/foods/{fid}", json={"name": "Selbstgemachte Soße", "kcal": 100, "barcode": "4033333333339",
                                      "portions": [{"name": "Löffel", "grams": 15}]})
    assert a.post("/api/foods/share", json={"ids": [fid], "users": [b.uid]}).json() == {"copied": 1, "skipped": 0}
    got = b.get("/api/foods").json()[0]
    assert (got["name"], got["barcode"], got["portions"]) == ("Selbstgemachte Soße", "4033333333339", [{"name": "Löffel", "grams": 15}])
    assert a.post("/api/foods/share", json={"ids": [fid], "users": [b.uid]}).json() == {"copied": 0, "skipped": 1}
    assert a.post("/api/foods/share", json={"ids": [fid], "users": [outsider.uid]}).status_code == 403
    assert outsider.post("/api/foods/share", json={"ids": [fid], "users": [a.uid]}).status_code == 403

    a.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 100})
    mid = a.get(f"/api/day/{DAY}").json()["meals"][0]["id"]
    sid = a.post("/api/saved-meals", json={"day": DAY, "meal_id": mid, "name": "Sonntagsessen"}).json()["id"]
    assert a.post("/api/saved-meals/share", json={"ids": [sid], "users": [b.uid]}).json()["copied"] == 1
    assert [m["name"] for m in b.get("/api/saved-meals").json()] == ["Sonntagsessen"]
    assert a.get("/api/foods").json()[0]["id"] == fid   # the sender keeps his own


def test_sharing_a_diary_entry_scales_the_portion(user):
    a, b = user("Anna", feature=("household",)), user("Ben", feature=("household",))
    names = [u["name"] for u in a.get("/api/household/users").json()]
    assert "Ben" in names and "Anna" not in names
    fid = add_food(a, name="Lasagne", kcal=200)
    a.post("/api/entries", json={"day": DAY, "food_id": fid, "grams": 400})
    eid = a.get(f"/api/day/{DAY}").json()["entries"][0]["id"]
    assert a.post(f"/api/entries/{eid}/share", json={"targets": [{"user": b.uid, "factor": 0.5}]}).json() == {"shared": 1}
    e = b.get(f"/api/day/{DAY}").json()["entries"][0]
    assert (e["name"], e["grams"], e["kcal"]) == ("Lasagne (von Anna)", 200, 400)
    assert a.post(f"/api/entries/{eid}/share", json={"targets": [{"user": "nobody", "factor": 1}]}).status_code == 403


# --- admin ------------------------------------------------------------------------------

def test_admin_view_is_limited_to_admins(user, app_module, monkeypatch):
    boss, other = user("Boss"), user("Other")
    monkeypatch.setitem(app_module.OPTIONS, "admin_users", [boss.uid])
    assert boss.get("/api/me").json()["admin"] is True and other.get("/api/me").json()["admin"] is False
    assert other.get("/api/admin/users").status_code == 403
    assert other.delete(f"/api/admin/users/{boss.uid}?confirm=Boss").status_code == 403
    ids = [u["id"] for u in boss.get("/api/admin/users").json()]
    assert other.uid in ids
    add_food(other, name="Geheim")
    assert any(f["name"] == "Geheim" for f in boss.get(f"/api/admin/users/{other.uid}/export").json()["foods"])
    assert boss.delete(f"/api/admin/users/{other.uid}?confirm=falsch").status_code == 400
    assert boss.delete(f"/api/admin/users/{other.uid}?confirm=Other").status_code == 200
    assert other.get("/api/foods").json() == []
    assert boss.delete(f"/api/admin/users/{boss.uid}?confirm=Boss").status_code == 400   # not your own account
