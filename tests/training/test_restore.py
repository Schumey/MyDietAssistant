"""Moving training data: restore from an export, the app's JSON backup, taking over the HAFS integration's database."""
from contextlib import closing

import pytest

T0 = "2026-11-10T10:00:00+00:00"


def call(c, type_, status=200, **kw):
    r = c.post("/api/training/call", json={"type": type_, **kw})
    assert r.status_code == status, r.text
    return r.json()


def workout(uid, n, day="2026-11-10"):
    wid = f"w{n}-{uid}"
    return {"workout": [{"id": wid, "started_at": f"{day}T18:00:00", "ended_at": f"{day}T19:00:00", "routine_name": f"Tag {n}", "updated_at": T0}],
            "program": [{"id": f"p{n}-{uid}", "name": f"Plan {n}", "updated_at": T0}]}


def workout_ids(c):
    return sorted(w["id"] for w in call(c, "hafs/export")["tables"]["workout"] if not w["deleted"])


@pytest.fixture
def anna(user):
    return user("Anna", feature=("training",))


def test_restore_replaces_own_data_and_dry_run_only_counts(anna):
    call(anna, "hafs/sync/push", records=workout(anna.uid, 1))
    backup = call(anna, "hafs/export")
    call(anna, "hafs/sync/push", records=workout(anna.uid, 2))
    assert len(workout_ids(anna)) == 2
    dry = call(anna, "hafs/restore", data=backup)
    assert dry["file"]["workouts"] == 1 and dry["current"]["workouts"] == 2 and "restored" not in dry
    assert len(workout_ids(anna)) == 2
    done = call(anna, "hafs/restore", data=backup, dry_run=False)
    assert done["restored"]["workout"] == 1
    assert workout_ids(anna) == [f"w1-{anna.uid}"]
    assert call(anna, "hafs/sync/pull")["records"]["exercise"]      # catalog is there again


def test_restore_refuses_other_files(anna):
    assert "not a HAFS export" in call(anna, "hafs/restore", 400, data={"app": "MyDietAssistant"})["message"]
    assert "update first" in call(anna, "hafs/restore", 400, data={"schema_version": 99, "tables": {}})["message"]
    assert "unexpected table" in call(anna, "hafs/restore", 400, data={"schema_version": 5, "tables": {"users": []}})["message"]


def test_rows_of_another_user_are_not_taken(user):
    a, b = user("A", feature=("training",)), user("B", feature=("training",))
    call(a, "hafs/sync/push", records=workout(a.uid, 1))
    out = call(b, "hafs/restore", data=call(a, "hafs/export"), dry_run=False)
    assert out["restored"]["workout"] == 0 and out["skipped"] >= 1
    assert workout_ids(a) == [f"w1-{a.uid}"]


def test_app_backup_carries_training(anna):
    call(anna, "hafs/sync/push", records=workout(anna.uid, 1))
    backup = anna.get("/api/export/json").json()
    assert backup["training"]["tables"]["workout"][0]["id"] == f"w1-{anna.uid}"
    call(anna, "hafs/sync/push", records=workout(anna.uid, 2))
    preview = anna.post("/api/import/json/preview", json={"data": backup}).json()
    assert preview["current"]["workouts"] == 2 and preview["backup"]["workouts"] == 1
    assert anna.post("/api/import/json", json={"data": backup}).status_code == 200
    assert workout_ids(anna) == [f"w1-{anna.uid}"]
    old = {k: v for k, v in backup.items() if k != "training"}           # a 1.x backup: training stays as it is
    call(anna, "hafs/sync/push", records=workout(anna.uid, 3))
    assert anna.post("/api/import/json", json={"data": old}).status_code == 200
    assert len(workout_ids(anna)) == 2


def test_backup_without_training_has_no_training_part(user):
    c = user("Nur Essen")
    assert "training" not in c.get("/api/export/json").json()


# ---- the integration's database ---------------------------------------------------------------

@pytest.fixture
def legacy(tmp_path, monkeypatch):
    """A database like the integration's, with two users."""
    from training.core import db as tdb, sync
    path = tmp_path / "hafs.db"
    owners = {}

    def add(owner, n):
        with closing(tdb.connect(str(path))) as conn:
            sync.push(conn, owner, workout(owner, n))
        owners[owner] = n
    monkeypatch.setenv("HAFS_LEGACY_DB", str(path))
    return add


def test_take_over_every_user_as_admin(user, legacy, app_module, monkeypatch):
    admin = user("Chef", feature=("training",))
    other = user("Bea")                                    # training still off
    monkeypatch.setitem(app_module.OPTIONS, "admin_users", [admin.uid])
    legacy(admin.uid, 7)
    legacy(other.uid, 8)
    call(admin, "hafs/sync/push", records=workout(admin.uid, 1))     # something already in the app: gets replaced
    pre = call(admin, "hafs/legacy/preview")
    assert pre["found"] and pre["admin"]
    users = {u["user_id"]: u for u in pre["users"]}
    assert users[admin.uid]["workouts"] == 1 and users[admin.uid]["in_app"]["workouts"] == 1
    assert users[other.uid]["name"] == "Bea"
    out = call(admin, "hafs/legacy/import")
    assert set(out["users"]) == {admin.uid, other.uid}
    assert workout_ids(admin) == [f"w7-{admin.uid}"]
    assert other.get("/api/settings").json()["features"]["training"] is True
    assert workout_ids(other) == [f"w8-{other.uid}"]


def test_non_admin_takes_over_only_own_data(user, legacy, app_module, monkeypatch):
    boss, me = user("Boss"), user("Ich", feature=("training",))
    monkeypatch.setitem(app_module.OPTIONS, "admin_users", [boss.uid])
    legacy(boss.uid, 3)
    legacy(me.uid, 4)
    pre = call(me, "hafs/legacy/preview")
    assert not pre["admin"] and [u["user_id"] for u in pre["users"]] == [me.uid]
    out = call(me, "hafs/legacy/import", users=[boss.uid, me.uid])
    assert list(out["users"]) == [me.uid]


def test_no_integration_database(anna, monkeypatch):
    import training.legacy as lg
    monkeypatch.delenv("HAFS_LEGACY_DB", raising=False)
    monkeypatch.setattr(lg, "CANDIDATES", ())
    assert call(anna, "hafs/legacy/preview") == {"found": False, "path": None, "users": [], "admin": call(anna, "hafs/legacy/preview")["admin"]}
    assert "no database" in call(anna, "hafs/legacy/import", 400)["message"]
