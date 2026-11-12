"""Two users share one database: nothing of one may show up for, or be changed by, the other."""

from datetime import datetime, timezone

import pytest

from core.store import Store

NOW = datetime(2026, 11, 12, 12, 0, tzinfo=timezone.utc)
T = "2026-11-12T10:00:00+00:00"


@pytest.fixture
def store(tmp_path):
    s = Store(str(tmp_path / "hafs.db"))
    s.init()
    return s


def workout_records(prefix: str, name: str) -> dict:
    return {
        "exercise": [{"id": f"{prefix}e", "updated_at": T, "name": name, "kind": "strength"}],
        "workout": [{"id": f"{prefix}w", "updated_at": T, "started_at": "2026-11-12T10:00:00", "ended_at": "2026-11-12T11:00:00",
                     "routine_name": f"Plan {prefix}"}],
        "workout_set": [{"id": f"{prefix}s{i}", "updated_at": T, "workout_id": f"{prefix}w", "exercise_id": f"{prefix}e",
                         "set_no": i, "weight": 50.0 + i, "reps": 8, "kind": "work", "done_at": f"2026-11-12T10:0{i}:00"}
                        for i in range(1, 4)],
    }


def test_push_and_pull_are_separate(store):
    store.push("alice", workout_records("a", "Bankdrücken"))
    store.push("bob", workout_records("b", "Kniebeuge"))
    for owner, prefix in (("alice", "a"), ("bob", "b")):
        pulled = store.pull(owner, None, 1000)["records"]
        assert {r["id"] for r in pulled["workout"]} == {f"{prefix}w"}
        assert {r["id"] for r in pulled["workout_set"]} == {f"{prefix}s1", f"{prefix}s2", f"{prefix}s3"}
        assert all(r["owner"] == owner for rows in pulled.values() for r in rows)


def test_export_contains_only_own_data(store):
    store.push("alice", workout_records("a", "Bankdrücken"))
    store.push("bob", workout_records("b", "Kniebeuge"))
    out = store.export_all("bob")["tables"]
    assert {r["id"] for r in out["workout"]} == {"bw"}
    assert all(r["owner"] == "bob" for rows in out.values() for r in rows)


def test_web_views_and_status_are_per_user(store):
    store.push("alice", workout_records("a", "Bankdrücken"))
    store.push("bob", {})
    a = store.web_query("alice", "overview", {}, NOW, timezone.utc)
    b = store.web_query("bob", "overview", {}, NOW, timezone.utc)
    assert a["status"]["workouts_week"] == 1 and a["status"]["state"] == "done"
    assert b["status"]["workouts_week"] == 0 and b["status"]["state"] == "none"
    assert [w["id"] for w in store.web_query("bob", "workouts", {}, NOW, timezone.utc)["workouts"]] == []
    with pytest.raises(ValueError):
        store.web_query("bob", "workout", {"id": "aw"}, NOW, timezone.utc)  # another user's workout does not exist for bob


def test_owners_lists_both_and_prefs_are_separate(store):
    store.push("alice", workout_records("a", "Bankdrücken"))
    store.push("bob", workout_records("b", "Kniebeuge"))
    assert set(store.owners()) >= {"alice", "bob"}
    store.set_pref("alice", "phase", "cut")
    assert store.get_pref("alice", "phase") == "cut"
    assert store.get_pref("bob", "phase") == ""
    store.set_pref("bob", "rest_default", "120")
    assert store.get_pref("alice", "rest_default") == ""


def test_catalog_seed_and_targets_per_user_and_same_names_allowed(store):
    store.recompute_targets("alice")
    store.recompute_targets("bob")
    counts = {o: len(store.pull(o, None, 5000)["records"]["exercise"]) for o in ("alice", "bob")}
    assert counts["alice"] == counts["bob"] > 100  # both got their own copy of the catalog
    ids = {r["id"] for o in ("alice", "bob") for r in store.pull(o, None, 5000)["records"]["exercise"]}
    assert len(ids) == counts["alice"] + counts["bob"]  # different ids: nothing is shared


def test_one_user_cannot_overwrite_the_other(store):
    store.push("alice", workout_records("a", "Bankdrücken"))
    evil = {"exercise": [{"id": "ae", "updated_at": "2026-11-13T00:00:00+00:00", "name": "Hacked", "kind": "strength"}]}
    res = store.push("bob", evil)
    assert res["skipped"] == 1
    names = {r["name"] for r in store.pull("alice", None, 1000)["records"]["exercise"]}
    assert "Bankdrücken" in names and "Hacked" not in names  # (pull also seeds the catalog)
    with pytest.raises(ValueError):
        store.set_target("bob", "ae", 100.0)  # another user's exercise does not exist for bob
