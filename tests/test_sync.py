import pytest

from core import db, gymrun, sync
from core.store import Store

T1, T2, T3 = "2026-01-01T10:00:00+00:00", "2026-01-01T11:00:00+00:00", "2026-01-01T12:00:00+00:00"


def ex(i, name, at=T1, **kw):
    return {"id": i, "updated_at": at, "name": name, **kw}


@pytest.fixture
def conn():
    return db.connect(":memory:")


def test_push_inserts_and_is_idempotent(conn):
    recs = {"exercise": [ex("e1", "Bankdrücken")]}
    assert sync.push(conn, "u1", recs) == {"applied": 1, "skipped": 0, "rejected": []}
    again = sync.push(conn, "u1", recs)
    assert again["applied"] == 1  # same updated_at is accepted, content identical
    assert conn.execute("SELECT COUNT(*) FROM exercise").fetchone()[0] == 1


def test_push_newer_wins_older_skipped(conn):
    sync.push(conn, "u1", {"exercise": [ex("e1", "A", T2)]})
    old = sync.push(conn, "u1", {"exercise": [ex("e1", "B", T1)]})
    assert old["skipped"] == 1 and old["applied"] == 0
    assert conn.execute("SELECT name FROM exercise").fetchone()[0] == "A"
    new = sync.push(conn, "u1", {"exercise": [ex("e1", "C", T3)]})
    assert new["applied"] == 1
    assert conn.execute("SELECT name FROM exercise").fetchone()[0] == "C"


def test_push_cannot_touch_other_owner(conn):
    sync.push(conn, "u1", {"exercise": [ex("e1", "A")]})
    res = sync.push(conn, "u2", {"exercise": [ex("e1", "Hacked", T3, owner="u1")]})
    assert res["skipped"] == 1
    row = conn.execute("SELECT owner, name FROM exercise").fetchone()
    assert (row["owner"], row["name"]) == ("u1", "A")


def test_push_owner_is_forced(conn):
    sync.push(conn, "u1", {"exercise": [ex("e1", "A", owner="someone-else")]})
    assert conn.execute("SELECT owner FROM exercise").fetchone()[0] == "u1"


def test_push_rejects_bad_records(conn):
    res = sync.push(conn, "u1", {
        "nope": [{"id": "x"}],
        "exercise": [{"id": "e1", "updated_at": T1}, {"updated_at": T1, "name": "x"}],
    })
    assert res["applied"] == 0 and len(res["rejected"]) == 3
    assert any("name" in r["reason"] for r in res["rejected"])


def test_push_rejects_duplicate_active_name(conn):
    sync.push(conn, "u1", {"exercise": [ex("e1", "A")]})
    res = sync.push(conn, "u1", {"exercise": [ex("e2", "A")]})
    assert len(res["rejected"]) == 1


def test_push_limit(conn):
    with pytest.raises(ValueError):
        sync.push(conn, "u1", {"exercise": [ex(str(i), str(i)) for i in range(sync.MAX_PUSH + 1)]})


def test_pull_cursor_paging_and_owner_filter(conn):
    sync.push(conn, "u1", {"exercise": [ex(f"e{i}", f"N{i}", T1) for i in range(5)]})
    sync.push(conn, "u2", {"exercise": [ex("x", "other")]})
    seen = []
    cursors = None
    for _ in range(10):
        page = sync.pull(conn, "u1", cursors, limit=2)
        seen += [r["id"] for r in page["records"]["exercise"]]
        cursors = page["cursors"]
        if not page["more"]:
            break
    assert sorted(seen) == [f"e{i}" for i in range(5)]  # same updated_at: id breaks ties
    assert sync.pull(conn, "u1", cursors)["records"]["exercise"] == []
    sync.push(conn, "u1", {"exercise": [ex("e0", "N0", T2)]})
    assert [r["id"] for r in sync.pull(conn, "u1", cursors)["records"]["exercise"]] == ["e0"]


def test_export_contains_only_owner(conn):
    sync.push(conn, "u1", {"exercise": [ex("e1", "A")]})
    sync.push(conn, "u2", {"exercise": [ex("e2", "B")]})
    out = sync.export_all(conn, "u1")
    assert out["schema_version"] == db.SCHEMA_VERSION
    assert [r["id"] for r in out["tables"]["exercise"]] == ["e1"]


def test_store_roundtrip_with_gymrun(tmp_path):
    store = Store(str(tmp_path / "sub" / "hafs.db"))
    assert store.init() == db.SCHEMA_VERSION
    text = (
        "Date;Time;Routine;Exercise;Set;Weight;Reps;Duration;Distance;Para6;Para7;Para8;Para9;Para10;Note;Type;Book;Version1\n"
        "06.06.2018;10:47:20;;Rudern;1;18;15;;;;;;;;;1;1;1\n")
    dry = store.import_gymrun("u1", text, dry_run=True)
    assert dry["summary"]["sets"] == 1 and "added" not in dry
    assert store.pull("u1", None, 100)["records"]["workout_set"] == []
    done = store.import_gymrun("u1", text, dry_run=False)
    assert done["added"]["sets"] == 1
    pulled = store.pull("u1", None, 100)["records"]
    assert len(pulled["workout_set"]) == 1 and len(pulled["exercise"]) == 1
