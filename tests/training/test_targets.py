import json
from datetime import date
from pathlib import Path

import pytest

from core import catalog, db, gymrun, sync, targets
from core.store import Store

OWNER = "u1"
TODAY = date(2026, 11, 10)
T = "2026-11-01T10:00:00+00:00"


def put(conn, table, **rec):
    rec.setdefault("updated_at", T)
    sync.push(conn, OWNER, {table: [rec]})


def setup_exercise(conn, ex="e1", kind="strength"):
    put(conn, "exercise", id=ex, name=f"Ü {ex}", kind=kind)


def add_workout(conn, wid, day, sets, ex="e1", equipment=None, phase=""):
    put(conn, "workout", id=wid, started_at=f"{day}T10:00:00", phase=phase)
    for i, (w, r) in enumerate(sets, 1):
        put(conn, "workout_set", id=f"{wid}-{i}", workout_id=wid, exercise_id=ex, set_no=i, weight=w, reps=r,
            done_at=f"{day}T10:{i:02d}:00", equipment_id=equipment, kind="work")


def row(conn, ex="e1", equipment=""):
    return conn.execute("SELECT * FROM target WHERE owner=? AND exercise_id=? AND equipment_id=? AND deleted=0",
                        (OWNER, ex, equipment)).fetchone()


@pytest.fixture
def conn():
    c = db.connect(":memory:")
    setup_exercise(c)
    return c


def test_target_written_from_history(conn):
    add_workout(conn, "w1", "2026-11-05", [(30, 8), (30, 8), (30, 8)])
    res = targets.recompute(conn, OWNER, today=TODAY)
    assert res["written"] == 1
    t = row(conn)
    # no routine: the rep target is inferred (8 reps), all sets reached it -> up
    assert (t["weight"], t["reps"], t["reason_code"]) == (32.5, 8, "up")
    assert "32.5 kg" in t["reason"]
    assert json.loads(t["reason_params"])["weight"] == 32.5


def test_unchanged_target_is_not_rewritten(conn):
    add_workout(conn, "w1", "2026-11-05", [(30, 8), (30, 8)])
    targets.recompute(conn, OWNER, today=TODAY)
    first = row(conn)["updated_at"]
    assert targets.recompute(conn, OWNER, today=TODAY)["written"] == 0
    assert row(conn)["updated_at"] == first


def test_routine_range_wins_over_inference(conn):
    add_workout(conn, "w1", "2026-11-05", [(30, 10), (30, 10), (30, 10)])
    put(conn, "routine_exercise", id="re1", routine_id="r", exercise_id="e1", reps_min=8, reps_max=12, target_sets=3)
    targets.recompute(conn, OWNER, today=TODAY)
    t = row(conn)
    assert (t["weight"], t["reps"], t["reason_code"]) == (30, 11, "hold")


def test_equipment_steps_are_used_and_targets_are_per_equipment(conn):
    put(conn, "gym", id="g", name="Studio")
    put(conn, "equipment", id="m1", gym_id="g", name="Maschine", steps=json.dumps({"min": 10, "max": 60, "step": 5}))
    add_workout(conn, "w1", "2026-11-05", [(30, 8), (30, 8)], equipment="m1")
    add_workout(conn, "w2", "2026-11-04", [(40, 8), (40, 8)])           # no equipment known
    targets.recompute(conn, OWNER, today=TODAY)
    assert row(conn, equipment="m1")["weight"] == 35                   # next step of the machine
    assert row(conn, equipment="")["weight"] == 42.5                   # default step 2.5


def test_phase_pref_changes_targets_and_recomputes(conn):
    add_workout(conn, "w1", "2026-11-05", [(30, 8), (30, 8)])
    targets.recompute(conn, OWNER, today=TODAY)
    assert row(conn)["reason_code"] == "up"
    targets.set_pref(conn, OWNER, "phase", "cut")
    targets.recompute(conn, OWNER, today=TODAY)
    t = row(conn)
    assert t["reason_code"] == "hold_cut" and t["weight"] == 30        # needs the top twice in a cut


def test_phase_falls_back_to_the_latest_workout_snapshot(conn):
    add_workout(conn, "w1", "2026-11-05", [(30, 8), (30, 8)], phase="cut")
    assert targets.recompute(conn, OWNER, today=TODAY)["phase"] == "cut"
    targets.set_pref(conn, OWNER, "phase", "bulk")                      # a manual choice wins
    assert targets.recompute(conn, OWNER, today=TODAY)["phase"] == "bulk"


def test_cardio_and_time_exercises_get_no_target(conn):
    setup_exercise(conn, "c1", "cardio")
    add_workout(conn, "w1", "2026-11-05", [(30, 8)], ex="c1")
    assert targets.recompute(conn, OWNER, today=TODAY)["written"] == 0


def test_old_history_is_not_recomputed_but_break_rule_applies(conn):
    add_workout(conn, "w1", "2026-10-01", [(30, 8), (30, 8)])
    targets.recompute(conn, OWNER, today=TODAY)
    assert row(conn)["reason_code"] == "break"
    add_workout(conn, "w0", "2024-01-01", [(30, 8)], ex="e2")
    setup_exercise(conn, "e2")
    assert targets.recompute(conn, OWNER, today=TODAY)["exercises"] == 1   # only the last year


def test_other_owner_is_untouched(conn):
    add_workout(conn, "w1", "2026-11-05", [(30, 8), (30, 8)])
    assert targets.recompute(conn, "u2", today=TODAY)["exercises"] == 0
    assert conn.execute("SELECT COUNT(*) FROM target WHERE owner='u2'").fetchone()[0] == 0


def test_deleted_sets_do_not_count(conn):
    add_workout(conn, "w1", "2026-11-05", [(30, 8)])
    conn.execute("UPDATE workout_set SET deleted=1")
    assert targets.recompute(conn, OWNER, today=TODAY)["written"] == 0


def test_store_push_recomputes_touched_exercises(tmp_path):
    store = Store(str(tmp_path / "h.db"))
    store.init()
    now = "2026-11-05T10:00:00+00:00"
    recs = {
        "exercise": [{"id": "e1", "updated_at": now, "name": "Bank", "kind": "strength"}],
        "workout": [{"id": "w1", "updated_at": now, "started_at": "2026-11-05T10:00:00"}],
        "workout_set": [{"id": f"s{i}", "updated_at": now, "workout_id": "w1", "exercise_id": "e1", "weight": 50,
                         "reps": 8, "done_at": "2026-11-05T10:0%d:00" % i, "set_no": i} for i in (1, 2)],
    }
    res = store.push("u1", recs)
    assert res["rejected"] == [] and res["targets"]["written"] == 1
    pulled = store.pull("u1", None, 1000)["records"]["target"]
    assert len(pulled) == 1 and pulled[0]["weight"] == 52.5
    assert store.set_pref("u1", "phase", "cut")["written"] == 1


def test_store_gymrun_import_computes_targets(tmp_path):
    store = Store(str(tmp_path / "h.db"))
    store.init()
    csv = "Date;Time;Routine;Exercise;Set;Weight;Reps;Duration;Distance;Para6;Para7;Para8;Para9;Para10;Note;Type;Book;Version1\n"
    day = date.today().strftime("%d.%m.%Y")
    for i in (1, 2):
        csv += f"{day};10:0{i}:00;;Beinpresse am Gerät;{i};100;8;;;;;;;;;1;1;1\n"
    out = store.import_gymrun("u1", csv, dry_run=False)
    assert out["targets"]["written"] == 1
    t = store.pull("u1", None, 1000)["records"]["target"][0]
    assert t["weight"] == 102.5 and t["reason_code"] == "up"


REAL = Path(__file__).resolve().parents[2] / "GymRun_10Nov26.csv"


@pytest.mark.skipif(not REAL.exists(), reason="real export not present")
def test_real_export_produces_sane_targets():
    c = db.connect(":memory:")
    catalog.seed(c, OWNER)
    res = gymrun.parse(REAL.read_text(encoding="utf-8"))
    gymrun.import_into(c, OWNER, res, catalog.exercise_ids(c, OWNER))
    out = targets.recompute(c, OWNER, today=date(2026, 11, 10))
    assert out["written"] >= 20
    rows = c.execute("SELECT * FROM target").fetchall()
    assert all(r["weight"] is not None and r["reps"] and r["reason"] and "{" not in r["reason"] for r in rows)
    assert all(r["weight"] >= 0 for r in rows)


def test_manual_weight_creates_the_general_target_and_is_replaced_by_the_next_recompute(conn):
    assert targets.set_target(conn, OWNER, "e1", 55) == 1
    t = row(conn)
    assert (t["weight"], t["reason_code"]) == (55, "manual")
    # a workout later: the progression takes over again, under the same id (no duplicate)
    add_workout(conn, "w1", "2026-11-05", [(30, 8), (30, 8), (30, 8)])
    targets.recompute(conn, OWNER, today=TODAY)
    t = row(conn)
    assert (t["weight"], t["reason_code"]) == (32.5, "up")
    assert conn.execute("SELECT COUNT(*) FROM target WHERE exercise_id='e1'").fetchone()[0] == 1


def test_manual_weight_updates_every_existing_target_of_the_exercise(conn):
    put(conn, "target", id="t1", exercise_id="e1", equipment_id="", weight=30, reps=8)
    put(conn, "target", id="t2", exercise_id="e1", equipment_id="q1", weight=40, reps=8)
    assert targets.set_target(conn, OWNER, "e1", 45) == 2
    assert {r["weight"] for r in conn.execute("SELECT weight FROM target WHERE exercise_id='e1'")} == {45}


def test_manual_weight_rejects_unknown_or_weightless_exercises(conn):
    setup_exercise(conn, "t1", kind="time")
    for ex, w in (("nope", 10), ("t1", 10), ("e1", -1), ("e1", 5000)):
        with pytest.raises(ValueError):
            targets.set_target(conn, OWNER, ex, w)


def test_panel_prefs_are_validated():
    assert targets.valid_pref("today_hidden", "") and targets.valid_pref("today_hidden", "facts,recent")
    assert not targets.valid_pref("today_hidden", "facts,facts") and not targets.valid_pref("today_hidden", "foo")
    assert targets.valid_pref("rest_default", "90") and targets.valid_pref("rest_default", "0")
    assert not targets.valid_pref("rest_default", "601") and not targets.valid_pref("rest_default", "-5")


def test_panel_prefs_do_not_recompute_targets(tmp_path):
    store = Store(str(tmp_path / "h.db"))
    store.init()
    assert store.set_pref(OWNER, "rest_default", "120") == {} and store.get_pref(OWNER, "rest_default") == "120"
