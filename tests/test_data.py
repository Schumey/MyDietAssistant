"""Database migrations, backup export/import and the table importers."""
import json
import os
import sqlite3

import pytest

from conftest import add_food, meal_ids

OLD_SCHEMA = """
CREATE TABLE foods (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL, brand TEXT DEFAULT '',
  kcal REAL NOT NULL, protein REAL NOT NULL DEFAULT 0, carbs REAL NOT NULL DEFAULT 0, fat REAL NOT NULL DEFAULT 0,
  serving_g REAL NOT NULL DEFAULT 100);
CREATE TABLE meals (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL, position INTEGER NOT NULL);
CREATE TABLE entries (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, day TEXT NOT NULL, meal_id INTEGER NOT NULL,
  name TEXT NOT NULL, grams REAL NOT NULL, kcal REAL NOT NULL, protein REAL NOT NULL, carbs REAL NOT NULL, fat REAL NOT NULL);
CREATE TABLE triggers (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, kind TEXT NOT NULL, entity TEXT NOT NULL,
  match TEXT NOT NULL DEFAULT '', meal_id INTEGER NOT NULL, saved_meal_id INTEGER, food_id INTEGER, grams REAL,
  enabled INTEGER NOT NULL DEFAULT 1);
CREATE TABLE meal_triggers (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, meal_id INTEGER NOT NULL, kind TEXT NOT NULL,
  entity TEXT NOT NULL, match TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1);
CREATE TABLE trigger_runs (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, trigger_id INTEGER, label TEXT NOT NULL DEFAULT '',
  day TEXT NOT NULL, ts TEXT NOT NULL, entry_ids TEXT NOT NULL DEFAULT '[]', undone INTEGER NOT NULL DEFAULT 0);
CREATE TABLE saved_meal_items (id INTEGER PRIMARY KEY, saved_meal_id INTEGER NOT NULL, name TEXT NOT NULL, grams REAL NOT NULL,
  kcal REAL NOT NULL, protein REAL NOT NULL, carbs REAL NOT NULL, fat REAL NOT NULL);
"""


def columns(path, table):
    c = sqlite3.connect(path)
    try:
        return {r[1] for r in c.execute(f"PRAGMA table_info({table})")}
    finally:
        c.close()


def test_migration_upgrades_an_old_database_and_keeps_data(tmp_path, monkeypatch):
    import db
    path = str(tmp_path / "old.db")
    raw = sqlite3.connect(path)
    raw.executescript(OLD_SCHEMA)
    raw.execute("INSERT INTO foods(owner,name,kcal) VALUES('u','Brot',250)")
    raw.commit()
    raw.close()
    monkeypatch.setattr(db, "DB_PATH", path)
    db.init()
    assert db.schema_version() == len(db.MIGRATIONS)
    assert {"barcode", "category", "favorite", "fiber", "salt"} <= columns(path, "foods")
    assert {"from_time", "to_time", "archived"} <= columns(path, "meals")
    assert {"time", "sat_fat"} <= columns(path, "entries")
    assert {"hold_min", "negate", "extra", "paused_until"} <= columns(path, "triggers")
    with db.conn() as c:
        assert c.execute("SELECT name FROM foods").fetchone()[0] == "Brot"
    assert os.path.exists(path + ".v0.bak")   # a database with data is copied before its first migration
    db.init()   # idempotent
    assert db.schema_version() == len(db.MIGRATIONS)


def test_a_fresh_database_needs_no_backup_copy(tmp_path, monkeypatch):
    import db
    path = str(tmp_path / "new.db")
    monkeypatch.setattr(db, "DB_PATH", path)
    db.init()
    assert db.schema_version() == len(db.MIGRATIONS)
    assert not [f for f in os.listdir(tmp_path) if f.endswith(".bak")]


def test_migration_makes_a_copy_before_upgrading_a_versioned_database(tmp_path, monkeypatch):
    import db
    path = str(tmp_path / "v1.db")
    monkeypatch.setattr(db, "DB_PATH", path)
    db.init()
    with db.conn() as c:
        c.execute("PRAGMA user_version = 1")
    db.init()
    assert os.path.exists(path + ".v1.bak")
    assert db.schema_version() == len(db.MIGRATIONS)


def test_backup_roundtrip_keeps_everything(user):
    a, b = user(), user()
    a.put("/api/settings", json={"features": {"schedule": True, "activity": True}})
    fid = add_food(a, name="Skyr", barcode="4012345678901", category="Diät")
    a.post("/api/entries", json={"day": "2026-02-01", "food_id": fid, "grams": 250})
    mid = a.post("/api/meals", json={"name": "Spät", "from_time": "21:00", "to_time": "23:00"}).json()["id"]
    a.put("/api/weights/2026-02-01", json={"kg": 80.4})
    a.put("/api/activity/2026-02-01", json={"steps": 9000, "kcal": 300})
    a.put("/api/activity/config", json={"steps_entity": "sensor.steps", "kcal_entity": "", "share": 40})
    dump = a.get("/api/export/json").json()
    assert dump["foods"][0]["barcode"] == "4012345678901"
    assert any(m["name"] == "Spät" and m["from_time"] == "21:00" for m in dump["meals"])
    assert b.post("/api/import/json", json={"data": dump}).status_code == 200
    f = b.get("/api/foods").json()[0]
    assert (f["name"], f["barcode"], f["category"]) == ("Skyr", "4012345678901", "Diät")
    assert any(m["name"] == "Spät" and m["to_time"] == "23:00" for m in b.get("/api/day/2026-02-01").json()["meals"])
    assert b.get("/api/day/2026-02-01").json()["totals"]["kcal"] == a.get("/api/day/2026-02-01").json()["totals"]["kcal"]
    assert b.get("/api/weights").json() == [{"day": "2026-02-01", "kg": 80.4}]
    assert b.get("/api/settings").json()["features"]["schedule"] is True
    act = b.get("/api/activity?day=2026-02-01").json()
    assert (act["steps"], act["kcal"], act["config"]["share"]) == (9000, 300, 40)


def test_backup_roundtrip_keeps_triggers(user):
    a, b = user(), user()
    fid = add_food(a, name="Skyr")
    mid = a.post("/api/meals", json={"name": "Spät"}).json()["id"]
    a.post("/api/triggers", json={"kind": "state", "entity": "input_boolean.x", "match": "on", "meal_id": mid,
                                  "food_id": fid, "grams": 150, "hold_min": 5, "win_from": "20:00", "win_to": "23:00",
                                  "extra": [{"kind": "state", "entity": "sensor.y", "match": "home"}], "combine": "or"})
    a.post("/api/meal-triggers", json={"meal_id": mid, "kind": "state", "entity": "input_boolean.z", "match": "on"})
    dump = a.get("/api/export/json").json()
    assert len(dump["triggers"]) == 1 and len(dump["meal_triggers"]) == 1
    # restoring twice must not duplicate, and ids must point at the new rows
    for _ in range(2):
        assert b.post("/api/import/json", json={"data": dump}).status_code == 200
    t = b.get("/api/triggers").json()
    assert len(t) == 1
    assert (t[0]["item"], t[0]["meal"], t[0]["grams"], t[0]["hold_min"], t[0]["combine"]) == ("Skyr", "Spät", 150, 5, "or")
    assert t[0]["extra"][0]["entity"] == "sensor.y"
    mt = b.get("/api/meal-triggers").json()
    assert len(mt) == 1 and mt[0]["meal"] == "Spät"
    # an old backup without trigger keys still imports
    old = {k: v for k, v in dump.items() if k not in ("triggers", "meal_triggers")}
    assert b.post("/api/import/json", json={"data": old}).status_code == 200
    assert b.get("/api/triggers").json() == []


def test_import_rejects_foreign_json(me):
    assert me.post("/api/import/json", json={"data": {"app": "other"}}).status_code == 400


TABLES = {
    "cronometer": ("Day,Time,Group,Food Name,Amount,Energy (kcal),Alcohol (g),Fiber (g),Carbs (g),Fat (g),Protein (g),Saturated (g),Sugars (g),Sodium (mg)\n"
                   '2026-10-01,08:15:00,Breakfast,"Oats, Rolled",80.00 g,300,0,8,54,6,10,1.1,1,5\n'
                   "2026-10-01,12:30:00,Lunch,Bread,2.00 slice,180,0,3,30,2,6,0.4,2,400\n"),
    "fddb": ("Datum;Uhrzeit;Mahlzeit;Bezeichnung;Menge;Kalorien (kcal);Fett (g);Kohlenhydrate (g);Eiweiß (g)\n"
             "01.10.2026;08:00;Frühstück;Haferflocken;80 g;296,5;5,6;48,2;11,0\n13.10.2026;12:00;Mittag;Pizza;1 Stück;650;30;70;25\n"),
    "us": "Date,Meal,Name,Calories,Carbs,Fat,Protein\n10/25/2026,Dinner,Steak,700,0,50,60\n10/13/2026,Lunch,Salad,200,10,5,3\n",
}


def import_table(c, text):
    p = c.post("/api/import/table/preview", json={"text": text}).json()
    r = c.post("/api/import/table", json={"text": text, "mapping": p["mapping"], "replace": True})
    assert r.status_code == 200, r.text
    return p, r.json()


def test_cronometer_import(me):
    p, _ = import_table(me, TABLES["cronometer"])
    assert p["preset"] == "Cronometer" and p["items"] == 2
    d = me.get("/api/day/2026-10-01").json()
    assert sorted(e["name"] for e in d["entries"]) == ["Bread", "Oats, Rolled"]
    assert d["totals"]["kcal"] == 480
    oats = next(e for e in d["entries"] if e["name"].startswith("Oats"))
    assert (oats["grams"], oats["time"]) == (80, "08:15")


def test_german_table_import_uses_decimal_commas_and_day_first_dates(me):
    import_table(me, TABLES["fddb"])
    e = me.get("/api/day/2026-10-01").json()["entries"][0]
    assert (e["name"], e["kcal"]) == ("Haferflocken", 296.5)
    assert me.get("/api/day/2026-10-13").json()["totals"]["kcal"] == 650


def test_us_dates_are_detected_from_the_data(me):
    import_table(me, TABLES["us"])
    assert me.get("/api/day/2026-10-25").json()["totals"]["kcal"] == 700
    assert me.get("/api/day/2026-10-13").json()["totals"]["kcal"] == 200


def test_table_without_data_is_rejected(me):
    assert me.post("/api/import/table/preview", json={"text": "a\n"}).status_code == 400


def test_bulk_records_import_weights_and_totals(me):
    r = me.post("/api/import/records", json={"weights": {"2026-09-01": 90.5, "2026-09-02": 5},
                                             "nutrition": {"2026-09-01": {"kcal": 2100, "protein": 100, "carbs": 200, "fat": 70}}})
    assert r.status_code == 200
    assert [w["kg"] for w in me.get("/api/weights").json()] == [90.5]   # 5 kg is implausible
    assert me.get("/api/day/2026-09-01").json()["totals"]["kcal"] == 2100
