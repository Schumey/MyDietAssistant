import sqlite3
from pathlib import Path

import pytest

from core import db, gymrun

HEAD = "Date;Time;Routine;Exercise;Set;Weight;Reps;Duration;Distance;Para6;Para7;Para8;Para9;Para10;Note;Type;Book;Version1\n"
SAMPLE = HEAD + (
    "06.06.2018;10:30:37;;Crosstrainer;;;;13;;;;;;;;1;2;1\n"
    "06.06.2018;10:47:20;;Rudern;1;18;15;;;;;;;;;1;1;1\n"
    "06.06.2018;10:47:20;;Rudern;1;18;15;;;;;;;;;1;1;1\n"
    "06.06.2018;10:50:21;Oberkörper;Rudern;2;20.5;15;;;;;;;;🔼;2;1;1\n"
    "06.06.2018;18:00:00;Unterkörper;Dips;1;;12;;;;;;;;;1;6;1\n"
)


def test_parse_groups_and_kinds():
    res = gymrun.parse(SAMPLE)
    assert res.duplicates == 1
    assert [w.routine for w in res.workouts] == ["Oberkörper", "Unterkörper"]
    first = res.workouts[0]
    assert first.started_at == "2018-06-06T10:30:37" and first.ended_at == "2018-06-06T10:50:21"
    cardio, row1, row2 = first.sets
    assert (cardio.exercise_kind, cardio.duration_s) == ("cardio", 780)
    assert row2.weight == 20.5 and row2.kind == "warmup" and row2.note == "🔼"
    assert res.workouts[1].sets[0].exercise_kind == "bodyweight"
    assert res.workouts[1].sets[0].weight is None


def test_routine_change_splits_workout():
    text = HEAD + (
        "01.01.2020;10:00:00;Push;A;1;10;8;;;;;;;;;1;1;1\n"
        "01.01.2020;10:05:00;Pull;B;1;10;8;;;;;;;;;1;1;1\n"
    )
    assert len(gymrun.parse(text).workouts) == 2


def test_rejects_other_csv():
    with pytest.raises(ValueError):
        gymrun.parse("a;b\n1;2\n")


def test_import_is_idempotent():
    conn = db.connect(":memory:")
    res = gymrun.parse(SAMPLE)
    first = gymrun.import_into(conn, "u1", res)
    assert first == {"exercises": 3, "workouts": 2, "sets": 4}
    assert gymrun.import_into(conn, "u1", res) == {"exercises": 0, "workouts": 0, "sets": 0}
    other = gymrun.import_into(conn, "u2", res)
    assert other["sets"] == 4  # separate owner, separate records


def test_migrate_sets_version_and_is_repeatable():
    conn = sqlite3.connect(":memory:")
    assert db.migrate(conn) == db.SCHEMA_VERSION
    assert db.migrate(conn) == db.SCHEMA_VERSION


REAL = Path(__file__).resolve().parent.parent / "GymRun_10Nov26.csv"


@pytest.mark.skipif(not REAL.exists(), reason="real export not present")
def test_real_export():
    res = gymrun.parse(REAL.read_text(encoding="utf-8"))
    s = gymrun.summary(res)
    assert s["rows"] == 29467 and s["exercises"] == 72 and s["duplicates"] == 5
    assert s["first"].startswith("2018-06-06")
