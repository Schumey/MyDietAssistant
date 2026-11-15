import sqlite3
from pathlib import Path

import pytest

from core import catalog, db, gymrun
from core.store import Store

HEAD = "Date;Time;Routine;Exercise;Set;Weight;Reps;Duration;Distance;Para6;Para7;Para8;Para9;Para10;Note;Type;Book;Version1\n"
CSV = HEAD + (
    "06.06.2018;11:12:04;;Bauchpresse;1;40;5;;;;;;;;;1;1;1\n"
    "06.06.2018;11:33:47;;Bauchpresse am Gerät (sitzend);1;36;15;;;;;;;;;1;1;1\n"
    "06.06.2018;12:00:00;;Meine Spezialübung;1;10;10;;;;;;;;;1;1;1\n"
    "06.06.2018;12:10:00;;Dips;1;;12;;;;;;;;;1;6;1\n"
)
OWNER = "u1"


def v1_db_with_import() -> sqlite3.Connection:
    """A database as it was before the catalog existed (schema 1, imported data)."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(db.MIGRATIONS[0] + "PRAGMA user_version = 1;")
    # import_into only uses columns that exist in schema 1
    gymrun.import_into(conn, OWNER, gymrun.parse(CSV))
    return conn


def test_catalog_is_consistent():
    assert len(catalog.ENTRIES) >= 130
    names = catalog.alias_map()
    assert len(names) >= len(catalog.ENTRIES)
    info = catalog.info()
    assert {e["key"] for e in info["entries"]} == {e.key for e in catalog.ENTRIES}
    assert all(e.en for e in catalog.ENTRIES)


def test_seed_creates_all_entries_and_is_idempotent():
    conn = db.connect(":memory:")
    first = catalog.seed(conn, OWNER)
    assert first["added"] == len(catalog.ENTRIES)
    assert catalog.seed(conn, OWNER) == {"skipped": True}
    other = catalog.seed(conn, "u2")
    assert other["added"] == len(catalog.ENTRIES)
    ids = [r[0] for r in conn.execute("SELECT id FROM exercise")]
    assert len(ids) == len(set(ids))  # ids differ per owner


def test_seed_adopts_and_merges_existing_history():
    conn = v1_db_with_import()
    db.migrate(conn)  # schema 2
    before = conn.execute("SELECT COUNT(*) FROM workout_set").fetchone()[0]
    res = catalog.seed(conn, OWNER)
    assert res["adopted"] == 2 and res["merged"] == 1  # Bauchpresse am Gerät + Dips adopted, Bauchpresse merged
    assert conn.execute("SELECT COUNT(*) FROM workout_set").fetchone()[0] == before
    ab = conn.execute("SELECT id FROM exercise WHERE catalog_key='ab_crunch_machine'").fetchone()[0]
    assert conn.execute("SELECT COUNT(*) FROM workout_set WHERE exercise_id=?", (ab,)).fetchone()[0] == 2
    old = conn.execute("SELECT deleted FROM exercise WHERE name='Bauchpresse'").fetchone()[0]
    assert old == 1
    custom = conn.execute("SELECT catalog_key FROM exercise WHERE name='Meine Spezialübung' AND deleted=0").fetchone()
    assert custom[0] == ""  # unknown exercises stay custom
    # nothing points at a deleted exercise
    assert conn.execute(
        "SELECT COUNT(*) FROM workout_set s JOIN exercise e ON e.id=s.exercise_id WHERE e.deleted=1").fetchone()[0] == 0


def test_import_after_seed_maps_to_catalog():
    store_conn = db.connect(":memory:")
    catalog.seed(store_conn, OWNER)
    res = gymrun.parse(CSV)
    added = gymrun.import_into(store_conn, OWNER, res, catalog.exercise_ids(store_conn, OWNER))
    assert added["exercises"] == 1  # only the custom one is new
    n = store_conn.execute(
        "SELECT COUNT(*) FROM workout_set s JOIN exercise e ON e.id=s.exercise_id WHERE e.catalog_key='ab_crunch_machine'"
    ).fetchone()[0]
    assert n == 2


def test_store_pull_seeds_catalog(tmp_path):
    store = Store(str(tmp_path / "hafs.db"))
    store.init()
    out = store.pull(OWNER, None, 1000)
    assert len(out["records"]["exercise"]) == len(catalog.ENTRIES)
    assert store.pull(OWNER, out["cursors"], 1000)["records"]["exercise"] == []


REAL = Path(__file__).resolve().parent.parent / "GymRun_10Nov26.csv"


@pytest.mark.skipif(not REAL.exists(), reason="real export not present")
def test_every_real_gymrun_exercise_is_known_except_the_custom_ones():
    res = gymrun.parse(REAL.read_text(encoding="utf-8"))
    unknown = set(res.exercises) - set(catalog.alias_map())
    assert unknown == set()
