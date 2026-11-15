import pytest

from core import db, importers
from core.store import Store

STRONG = (
    "Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE\n"
    '2026-11-02 18:00:00,Push,1h 10m,Bench Press (Barbell),W,40,10,0,0,,,\n'
    '2026-11-02 18:00:00,Push,1h 10m,Bench Press (Barbell),1,"60,5",8,0,0,links,,\n'
    '2026-11-02 18:00:00,Push,1h 10m,Bench Press (Barbell),2,60.5,7,0,0,,,\n'
    "2026-11-02 18:00:00,Push,1h 10m,Plank,1,0,0,0,60,,,\n"
    "2026-11-02 18:00:00,Push,1h 10m,Pull Up,1,0,9,0,0,,,\n"
    "2026-11-04 18:00:00,Pull,45m,Pull Up,1,0,10,0,0,,,\n"
    "2026-11-04 18:00:00,Pull,45m,Pull Up,1,0,10,0,0,,,\n"
)
HEVY = (
    "title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe\n"
    '"Leg Day","6 Mar 2024, 17:00","6 Mar 2024, 18:15","","Squat (Barbell)",,"",0,warmup,40,10,,,\n'
    '"Leg Day","6 Mar 2024, 17:00","6 Mar 2024, 18:15","","Squat (Barbell)",,"",1,normal,100,5,,,\n'
    '"Leg Day","6 Mar 2024, 17:00","6 Mar 2024, 18:15","","Squat (Barbell)",,"",2,dropset,80,8,,,\n'
    '"Leg Day","6 Mar 2024, 17:00","6 Mar 2024, 18:15","","Running",,"",0,normal,,,5,1500,\n'
)


def test_detect():
    assert importers.detect(STRONG) == "strong" and importers.detect(HEVY) == "hevy"
    assert importers.detect("Date;Time;Routine;Exercise;Set\n") == "gymrun"
    with pytest.raises(ValueError):
        importers.detect("a,b,c\n1,2,3\n")


def test_strong_parse():
    res = importers.parse_strong(STRONG)
    assert res.duplicates == 1 and [w.routine for w in res.workouts] == ["Push", "Pull"]
    push = res.workouts[0]
    assert push.started_at == "2026-11-02T18:00:00" and push.ended_at == "2026-11-02T19:10:00"
    warm, a, b, plank, pull = push.sets
    assert warm.kind == "warmup" and a.weight == 60.5 and a.reps == 8 and a.note == "links" and a.set_no == 1
    assert (plank.exercise_kind, plank.duration_s, plank.weight) == ("time", 60, None)
    assert pull.exercise_kind == "bodyweight" and pull.weight is None
    assert [s.done_at for s in push.sets] == sorted(s.done_at for s in push.sets)


def test_hevy_parse():
    res = importers.parse_hevy(HEVY)
    (w,) = res.workouts
    assert w.routine == "Leg Day" and w.started_at == "2024-03-06T17:00:00" and w.ended_at == "2024-03-06T18:15:00"
    assert [s.kind for s in w.sets] == ["warmup", "work", "drop", "work"]
    assert w.sets[1].weight == 100 and w.sets[1].set_no == 2
    assert w.sets[3].exercise_kind == "cardio" and w.sets[3].duration_s == 1500


def test_name_mapping_strips_equipment_note():
    known = {"Bench Press": "e1", "Plank": "e2"}
    assert importers.name_mapping(["Bench Press (Barbell)", "Plank", "Other"], known) == {"Bench Press (Barbell)": "e1", "Plank": "e2"}


def test_store_import_detects_and_is_idempotent(tmp_path):
    store = Store(str(tmp_path / "h.db"))
    out = store.import_gymrun("u1", STRONG, True)
    assert out["format"] == "strong" and out["summary"]["workouts"] == 2 and "added" not in out
    first = store.import_gymrun("u1", STRONG, False)
    assert first["added"]["workouts"] == 2 and first["added"]["sets"] == 6
    again = store.import_gymrun("u1", STRONG, False)
    assert again["added"] == {"exercises": 0, "workouts": 0, "sets": 0}
    hevy = store.import_gymrun("u1", HEVY, False)
    assert hevy["format"] == "hevy" and hevy["added"]["workouts"] == 1
    with store._conn() as conn:
        assert {r[0] for r in conn.execute("SELECT DISTINCT source FROM workout")} == {"strong", "hevy"}
