"""Backup archive (ZIP): one format for export, automatic backups and the admin backup of everyone."""
import io
import json
import zipfile

import pytest

import backup_zip
import db
import extras
from conftest import add_food

TRAIN_T0 = "2026-11-10T10:00:00+00:00"

# Tables with an owner column that the JSON export (extras._dump) carries, and tables that deliberately stay out.
# A new table must be added to one of the two sets (and to the export if it is user data): the test below fails otherwise.
IN_BACKUP = {"foods", "meals", "entries", "goals", "weights", "saved_meals", "suggest_addons", "prefs", "triggers", "meal_triggers",
             "day_flags", "goal_weekdays", "goal_profiles", "day_profile", "day_notes", "incomplete_days", "recipes",
             "body_measures", "trackers", "pantry", "activity_days", "bmr_days"}
NOT_IN_BACKUP = {"users": "accounts are created when someone opens the app",
                 "body_photos": "photos stay separate (files in <data>/photos, part of the Home Assistant backup)",
                 "trigger_runs": "what a trigger entered today, for undo", "trigger_log": "log of trigger runs",
                 "lookup_cache": "cache of online queries", "saved_meal_uses": "usage counter for sorting",
                 "meal_trigger_log": "log of meal triggers"}


def owner_tables():
    with db.conn() as c:
        names = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
        return {n for n in names if "owner" in [r[1] for r in c.execute(f"PRAGMA table_info({n})")]}


def test_every_user_table_is_in_the_backup_or_excluded():
    unknown = owner_tables() - IN_BACKUP - set(NOT_IN_BACKUP)
    assert not unknown, f"new table(s) {sorted(unknown)}: put them into the export (extras._dump / import_json) or into NOT_IN_BACKUP"


def test_every_training_table_is_exported():
    import sqlite3
    from training.core import sync
    from training.core.db import migrate
    conn = sqlite3.connect(":memory:")
    migrate(conn)
    names = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
    with_owner = {n for n in names if "owner" in [r[1] for r in conn.execute(f"PRAGMA table_info({n})")]}
    assert with_owner <= set(sync.EXPORT_TABLES), f"training table(s) {sorted(with_owner - set(sync.EXPORT_TABLES))} missing in sync.EXPORT_TABLES"


def push_workout(c):
    rows = c.post("/api/training/call", json={"type": "hafs/sync/pull", "limit": 10000}).json()["records"]["exercise"]
    ex = next(r["id"] for r in rows if r["catalog_key"] == "bench_press_barbell")
    w = {"id": f"w-{c.uid}", "started_at": "2026-11-10T18:00:00", "ended_at": "2026-11-10T19:00:00", "routine_name": "Push", "updated_at": TRAIN_T0}
    sets = [{"id": f"s{i}-{c.uid}", "workout_id": f"w-{c.uid}", "exercise_id": ex, "set_no": i, "weight": 60.0, "reps": 8, "kind": "work",
             "done_at": f"2026-11-10T18:0{i}:00", "updated_at": TRAIN_T0} for i in (1, 2)]
    r = c.post("/api/training/call", json={"type": "hafs/sync/push", "records": {"workout": [w], "workout_set": sets}})
    assert r.status_code == 200, r.text


def workouts(c):
    return c.post("/api/training/call", json={"type": "hafs/export"}).json()["tables"]["workout"]


@pytest.fixture
def athlete(user):
    c = user("Sportler", feature=("training",))
    add_food(c, "Skyr", 63, 11, 4, 0.2)
    push_workout(c)
    return c


def open_zip(blob):
    return zipfile.ZipFile(io.BytesIO(blob))


def test_zip_has_manifest_and_one_file_per_part(athlete):
    r = athlete.get("/api/backup/zip")
    assert r.status_code == 200 and r.headers["content-type"] == "application/zip"
    z = open_zip(r.content)
    m = json.loads(z.read("manifest.json"))
    assert m["format"] == "hafs-backup" and m["version"] == 2 and m["scope"] == "user" and len(m["users"]) == 1
    u = m["users"][0]
    assert u["owner"] == athlete.uid and u["parts"]["nutrition"]["foods"] == 1 and u["parts"]["training"]["workouts"] == 1
    assert {n for n in z.namelist()} == {"manifest.json", f"users/{u['dir']}/nutrition.json", f"users/{u['dir']}/training.json"}
    assert "training" not in json.loads(z.read(f"users/{u['dir']}/nutrition.json"))


def test_user_without_training_has_no_training_part(user):
    c = user("Nur Essen")
    z = open_zip(c.get("/api/backup/zip").content)
    assert not [n for n in z.namelist() if n.endswith("training.json")]


def food_names(c):
    return [f["name"] for f in c.get("/api/foods").json()]


def spy_training_restore(monkeypatch):
    """Training rows keep their global ids, so another user cannot take them over: watch the call instead."""
    import training.api as api
    calls = []
    monkeypatch.setattr(api.store, "restore", lambda owner, data: calls.append(owner) or {})
    return calls


def test_zip_round_trip_through_the_restore_dialog_path(athlete, monkeypatch):
    blob = athlete.get("/api/backup/zip").content
    for f in athlete.get("/api/foods").json():
        athlete.delete(f"/api/foods/{f['id']}")
    assert food_names(athlete) == []
    calls = spy_training_restore(monkeypatch)
    opened = athlete.post("/api/backup/open", content=blob)
    assert opened.status_code == 200
    data = opened.json()["data"]
    assert data["foods"][0]["name"] == "Skyr" and data["training"]["tables"]["workout"]
    assert athlete.post("/api/import/json", json={"data": data}).status_code == 200
    assert food_names(athlete) == ["Skyr"] and calls == [athlete.uid]


def test_zip_of_one_user_opens_for_another_account(athlete, user):
    other = user("Anderer")
    opened = other.post("/api/backup/open", content=athlete.get("/api/backup/zip").content)   # only one user inside
    assert opened.status_code == 200 and opened.json()["source"] == athlete.uid


def test_restore_only_one_part(athlete, monkeypatch):
    dump = athlete.get("/api/export/json").json()
    calls = spy_training_restore(monkeypatch)
    for f in athlete.get("/api/foods").json():
        athlete.delete(f"/api/foods/{f['id']}")
    add_food(athlete, "Reis", 130, 3, 28, 0.3)
    # only training: the nutrition data stays
    assert athlete.post("/api/import/json?parts=training", json={"data": dump}).status_code == 200
    assert food_names(athlete) == ["Reis"] and calls == [athlete.uid]
    # only nutrition: training stays
    calls.clear()
    assert athlete.post("/api/import/json?parts=nutrition", json={"data": dump}).status_code == 200
    assert food_names(athlete) == ["Skyr"] and calls == []


def test_old_json_backup_still_restores(user):
    c = user("Alt")
    data = {"app": "MyDietAssistant", "version": 1, "foods": [{"id": 1, "name": "Alt", "kcal": 1}]}
    assert c.post("/api/import/json", json={"data": data}).status_code == 200
    assert [f["name"] for f in c.get("/api/foods").json()] == ["Alt"]


def test_admin_backup_of_everyone_and_restore(user, monkeypatch):
    import extras8
    admin, a, b = user("Admin"), user("A"), user("B")
    monkeypatch.setitem(extras8.OPTIONS, "admin_users", [admin.uid])
    add_food(a, "Apfel", 52, 0.3, 14, 0.2)
    add_food(b, "Birne", 57, 0.4, 15, 0.1)
    assert a.get("/api/backup/zip?scope=all").status_code == 403
    blob = admin.get("/api/backup/zip?scope=all").content
    m = json.loads(open_zip(blob).read("manifest.json"))
    assert m["scope"] == "all" and {a.uid, b.uid} <= {u["owner"] for u in m["users"]}
    # a user opens their own entry of an all-users archive; someone not in it cannot pick another
    assert a.post("/api/backup/open", content=blob).json()["data"]["foods"][0]["name"] == "Apfel"
    assert a.post(f"/api/backup/open?source={b.uid}", content=blob).status_code == 403
    assert admin.post(f"/api/backup/open?source={b.uid}", content=blob).json()["data"]["foods"][0]["name"] == "Birne"
    # restore everyone: dry run changes nothing, the real run puts the data back
    a.delete(f"/api/foods/{a.get('/api/foods').json()[0]['id']}")
    assert a.get("/api/foods").json() == []
    assert a.post("/api/backup/restore-all", content=blob).status_code == 403
    dry = admin.post("/api/backup/restore-all", content=blob).json()
    assert dry["dry"] and a.get("/api/foods").json() == [] and any(u["owner"] == a.uid for u in dry["users"])
    assert admin.post("/api/backup/restore-all?dry=false", content=blob).json()["dry"] is False
    assert [f["name"] for f in a.get("/api/foods").json()] == ["Apfel"]


def test_bad_archives_are_refused(user):
    c = user("Boese")
    assert c.post("/api/backup/open", content=b"not a zip").status_code == 400
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("manifest.json", json.dumps({"format": "other", "users": []}))
    assert c.post("/api/backup/open", content=buf.getvalue()).status_code == 400
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:   # a directory name with a path escape must not be followed
        z.writestr("manifest.json", json.dumps({"format": "hafs-backup", "version": 2, "users": [{"owner": "x", "dir": "../evil"}]}))
    assert c.post("/api/backup/open", content=buf.getvalue()).status_code == 400
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("manifest.json", json.dumps({"format": "hafs-backup", "version": 99, "users": []}))
    assert c.post("/api/backup/open", content=buf.getvalue()).status_code == 400


def test_automatic_backup_is_a_zip_and_restores(athlete, monkeypatch, tmp_path):
    import extras2
    monkeypatch.setattr(extras2, "BACKUP_DIR", str(tmp_path))
    name = athlete.post("/api/backups").json()["name"]
    assert name.endswith(".zip") and (tmp_path / name).exists()
    files = athlete.get("/api/backups").json()["files"]
    assert [f["name"] for f in files] == [name]
    data = athlete.get(f"/api/backups/{name}").json()
    assert data["foods"][0]["name"] == "Skyr" and data["training"]["tables"]["workout"]
    (tmp_path / f"mydiet-{athlete.uid}-2026-01-01_0000.json").write_text(json.dumps(extras.dump(athlete.uid)))   # old backups stay listed
    assert len(athlete.get("/api/backups").json()["files"]) == 2


def test_archive_reader_limits_unpacked_size(monkeypatch):
    monkeypatch.setattr(backup_zip, "MAX_UNPACKED", 10)
    blob = backup_zip.build([{"owner": "u", "name": "", "data": {"app": "MyDietAssistant", "foods": []}, "summary": {}}], "user", "", [])
    with pytest.raises(backup_zip.BadArchive):
        backup_zip.read(blob, [])
