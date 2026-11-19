from datetime import datetime, timezone

import pytest

from core import db, sync, webview

OWNER = "u1"
T = "2026-11-01T10:00:00+00:00"
NOW = datetime(2026, 11, 11, 12, tzinfo=timezone.utc)   # a Wednesday


@pytest.fixture
def conn():
    c = db.connect(":memory:")
    sync.push(c, OWNER, {"exercise": [
        {"id": "bench", "name": "Bankdrücken", "kind": "strength", "muscles_primary": "chest", "muscles_secondary": "triceps", "updated_at": T},
        {"id": "row", "name": "Rudern", "kind": "strength", "muscles_primary": "lats", "updated_at": T},
        {"id": "plank", "name": "Plank", "kind": "time", "muscles_primary": "abs", "updated_at": T},
    ], "gym": [{"id": "g1", "name": "Studio", "updated_at": T}],
        "equipment": [{"id": "q1", "gym_id": "g1", "name": "Hantelbank", "type": "barbell", "steps": "[20, 22.5]", "updated_at": T}]})
    return c


def add(conn, wid, day, sets, end=True, ex="bench", routine="Push"):
    rec = {"id": wid, "started_at": f"{day}T10:00:00", "routine_name": routine, "updated_at": T, "gym_id": "g1"}
    if end:
        rec["ended_at"] = f"{day}T11:00:00"
    sync.push(conn, OWNER, {"workout": [rec]})
    for i, (w, r, kind) in enumerate(sets, 1):
        sync.push(conn, OWNER, {"workout_set": [{"id": f"{wid}-{i}", "workout_id": wid, "exercise_id": ex, "set_no": i, "weight": w,
                                                  "reps": r, "kind": kind, "done_at": f"{day}T10:{i:02d}:00", "updated_at": T}]})


def run(conn, q, **params):
    return webview.run(conn, OWNER, q, params, NOW, timezone.utc)


def test_muscle_weeks_counts_primary_full_secondary_half_and_skips_warmup(conn):
    add(conn, "w1", "2026-11-09", [(40, 10, "warmup"), (60, 8, "work"), (60, 8, "work")])      # this week
    add(conn, "w2", "2026-11-02", [(60, 8, "work")])                                           # last week
    r = run(conn, "muscles", weeks=4)
    assert len(r["weeks"]) == 4 and r["weeks"][-1] == "2026-11-09"
    assert r["muscles"]["chest"] == [0, 0, 1, 2] and r["muscles"]["triceps"] == [0, 0, 0.5, 1]
    assert r["workouts"] == [0, 0, 1, 1]


def test_muscles_ignore_time_exercises(conn):
    add(conn, "w1", "2026-11-09", [(None, None, "work")], ex="plank")
    assert "abs" not in run(conn, "muscles", weeks=4)["muscles"]


def test_overview_next_routine_with_exercises(conn):
    sync.push(conn, OWNER, {"program": [{"id": "p1", "name": "PPL", "updated_at": T}],
                            "routine": [{"id": "r1", "program_id": "p1", "name": "Push", "position": 0, "updated_at": T},
                                        {"id": "r2", "program_id": "p1", "name": "Pull", "position": 1, "updated_at": T}],
                            "routine_exercise": [{"id": "x1", "routine_id": "r1", "exercise_id": "bench", "position": 0,
                                                  "target_sets": 3, "reps_min": 6, "reps_max": 10, "updated_at": T}]})
    add(conn, "w1", "2026-11-09", [(60, 8, "work")])
    sync.push(conn, OWNER, {"workout": [{"id": "w1", "started_at": "2026-11-09T10:00:00", "ended_at": "2026-11-09T11:00:00",
                                         "routine_id": "r1", "routine_name": "Push", "updated_at": "2026-11-09T11:00:00+00:00"}]})
    o = run(conn, "overview")
    assert o["status"]["next"]["routine"] == "Pull" and o["next_exercises"] == []
    sync.push(conn, OWNER, {"workout": [{"id": "w1", "started_at": "2026-11-09T10:00:00", "ended_at": "2026-11-09T11:00:00",
                                         "routine_id": "r2", "routine_name": "Pull", "updated_at": "2026-11-10T11:00:00+00:00"}]})
    o = run(conn, "overview")
    assert o["status"]["next"]["routine"] == "Push"
    assert o["next_exercises"][0]["exercise"] == "Bankdrücken" and o["next_exercises"][0]["sets"] == 3
    assert o["active_since"] is None and len(o["recent"]) == 1


def test_overview_active_workout_has_start(conn):
    add(conn, "w1", "2026-11-11", [(60, 8, "work")], end=False)
    o = run(conn, "overview")
    assert o["status"]["active"] and o["active_since"] == "2026-11-11T10:00:00"


def test_workouts_are_paged_newest_first(conn):
    for i in range(5):
        add(conn, f"w{i}", f"2026-10-{10 + i}", [(60, 8, "work")])
    page = run(conn, "workouts", limit=3)
    assert [w["id"] for w in page["workouts"]] == ["w4", "w3", "w2"] and page["more"]
    assert page["workouts"][0]["gym"] == "Studio" and page["workouts"][0]["exercises"] == ["Bankdrücken"]
    rest = run(conn, "workouts", limit=3, before=page["workouts"][-1]["started_at"])
    assert [w["id"] for w in rest["workouts"]] == ["w1", "w0"] and not rest["more"]


def test_workout_detail_groups_sets(conn):
    add(conn, "w1", "2026-11-09", [(40, 10, "warmup"), (60, 8, "work")])
    d = run(conn, "workout", id="w1")
    assert d["gym"] == "Studio" and d["sets"] == 1 and d["volume_kg"] == 480
    assert d["exercises"][0]["name"] == "Bankdrücken" and [s["kind"] for s in d["exercises"][0]["sets"]] == ["warmup", "work"]
    with pytest.raises(ValueError):
        run(conn, "workout", id="nope")


def test_exercise_sessions_records_and_picker(conn):
    add(conn, "w1", "2026-10-01", [(60, 8, "work"), (60, 6, "work")])
    add(conn, "w2", "2026-10-08", [(62.5, 8, "work")])
    d = run(conn, "exercise", id="bench")
    assert [s["date"] for s in d["sessions"]] == ["2026-10-01", "2026-10-08"]
    assert d["sessions"][0]["volume"] == 840 and d["sessions"][0]["top"] == {"weight": 60.0, "reps": 8}
    assert d["records"]["weight"] == 62.5 and d["records"]["volume"] == 840
    assert d["target"] is None
    names = [e["name"] for e in run(conn, "exercises")["exercises"]]
    assert names == ["Bankdrücken"]                      # only exercises with sets
    ex = run(conn, "exercises")["exercises"][0]
    assert (ex["sets"], ex["times"], ex["last"]) == (3, 2, "2026-10-08")   # sets vs. workouts it was done in


def test_plan_lists_loose_routines_and_gyms(conn):
    sync.push(conn, OWNER, {"routine": [{"id": "r9", "name": "Ohne Programm", "updated_at": T}]})
    p = run(conn, "plan")
    assert [r["routine"] for r in p["loose"]] == ["Ohne Programm"]
    assert p["gyms"][0]["name"] == "Studio" and p["gyms"][0]["equipment"][0]["steps"] == [20, 22.5]


def test_other_owner_sees_nothing(conn):
    add(conn, "w1", "2026-11-09", [(60, 8, "work")])
    other = webview.run(conn, "someone", "workouts", {}, NOW, timezone.utc)
    assert other["workouts"] == []
    with pytest.raises(ValueError):
        webview.run(conn, "someone", "workout", {"id": "w1"}, NOW, timezone.utc)


def test_unknown_query_and_bad_params(conn):
    with pytest.raises(ValueError):
        run(conn, "nope")
    with pytest.raises(ValueError):
        run(conn, "muscles", weeks=2)
    with pytest.raises(ValueError):
        run(conn, "workouts", limit="abc")


def test_plan_edit_returns_full_records_without_owner(conn):
    sync.push(conn, OWNER, {"program": [{"id": "p1", "name": "PPL", "rhythm": "1,3", "updated_at": T}],
                            "routine": [{"id": "r1", "program_id": "p1", "name": "Push", "updated_at": T}],
                            "routine_exercise": [{"id": "x1", "routine_id": "r1", "exercise_id": "bench", "rest_s": 90, "updated_at": T}]})
    d = run(conn, "plan_edit")
    assert d["programs"][0]["rhythm"] == "1,3" and "owner" not in d["programs"][0]
    assert d["routine_exercises"][0]["rest_s"] == 90 and d["gyms"][0]["name"] == "Studio"
    assert d["equipment"][0]["steps"] == "[20, 22.5]" and {e["id"] for e in d["exercises"]} == {"bench", "row", "plank"}
    # a pushed-back record is accepted as it is
    assert sync.push(conn, OWNER, {"routine": d["routines"]})["rejected"] == []


def test_plan_edit_has_next_weights_and_warmup_columns_and_plan_shows_rest_and_warmup(conn):
    sync.push(conn, OWNER, {"program": [{"id": "p1", "name": "PPL", "rhythm": "", "updated_at": T}],
                            "routine": [{"id": "r1", "program_id": "p1", "name": "Push", "updated_at": T}],
                            "routine_exercise": [{"id": "x1", "routine_id": "r1", "exercise_id": "bench", "rest_s": 180, "warmup_sets": 2,
                                                  "warmup_reps": 5, "warmup_pct": 50, "updated_at": T}],
                            "target": [{"id": "t1", "exercise_id": "bench", "equipment_id": "", "weight": 62.5, "updated_at": T}]})
    d = run(conn, "plan_edit")
    assert d["target_weights"] == {"bench": 62.5}
    x = d["routine_exercises"][0]
    assert (x["warmup_sets"], x["warmup_reps"], x["warmup_pct"]) == (2, 5, 50)
    row = run(conn, "plan")["programs"][0]["routines"][0]["exercises"][0]
    assert row["rest_s"] == 180 and row["warmup"] == {"sets": 2, "reps": 5, "pct": 50}
    assert d["exercises"][0]["equipment_type"] == ""


def test_workout_detail_shows_the_attachment_of_cable_sets(conn):
    add(conn, "w1", "2026-11-09", [(40, 10, "work")])
    sync.push(conn, OWNER, {"workout_set": [{"id": "w1-1", "workout_id": "w1", "exercise_id": "bench", "set_no": 1, "weight": 40, "reps": 10,
                                              "kind": "work", "done_at": "2026-11-09T10:01:00", "attachment": "rope", "updated_at": "2026-11-12T10:00:00+00:00"}]})
    assert run(conn, "workout", id="w1")["exercises"][0]["sets"][0]["attachment"] == "rope"


def test_exercises_list_can_include_untrained_ones_and_marks_own_exercises(conn):
    add(conn, "w1", "2026-11-09", [(60, 8, "work")])
    sync.push(conn, OWNER, {"exercise": [{"id": "cat", "name": "Katalog", "kind": "strength", "catalog_key": "k", "muscles_primary": "chest", "updated_at": T}]})
    default = run(conn, "exercises")["exercises"]
    assert [e["id"] for e in default] == ["bench"]                       # only what was trained
    everything = {e["id"]: e for e in run(conn, "exercises", all=True)["exercises"]}
    assert set(everything) == {"bench", "row", "plank", "cat"}
    assert everything["cat"]["own"] is False and everything["row"]["own"] is True
    assert (everything["row"]["times"], everything["row"]["last"]) == (0, "") and everything["bench"]["times"] == 1


def test_plan_edit_exercises_are_full_records_for_the_exercise_editor(conn):
    ex = next(e for e in run(conn, "plan_edit")["exercises"] if e["id"] == "bench")
    assert ex["muscles_secondary"] == "triceps" and ex["catalog_key"] == "" and "owner" not in ex and ex["muscles"] == ["chest"]
    assert sync.push(conn, OWNER, {"exercise": [{k: v for k, v in ex.items() if k != "muscles"}]})["rejected"] == []


def test_overview_week_days_monday_to_sunday(conn):
    add(conn, "w1", "2026-11-09", [(60, 8, "work")])                 # Monday
    add(conn, "w2", "2026-11-09", [(60, 8, "work")])                 # second one the same day
    add(conn, "w3", "2026-11-11", [(60, 8, "work")], end=False)      # running, does not count
    add(conn, "w4", "2026-11-08", [(60, 8, "work")])                 # last Sunday
    days = run(conn, "overview")["week_days"]
    assert [d["date"] for d in days] == [f"2026-11-{n:02d}" for n in range(9, 16)]
    assert [d["workouts"] for d in days] == [2, 0, 0, 0, 0, 0, 0]
    assert [d["today"] for d in days] == [False, False, True, False, False, False, False]


def test_session_offers_routines_plan_and_running_workout(conn):
    sync.push(conn, OWNER, {"program": [{"id": "p1", "name": "PPL", "updated_at": T}],
                            "routine": [{"id": "r1", "program_id": "p1", "name": "Push", "position": 0, "updated_at": T}],
                            "routine_exercise": [{"id": "x1", "routine_id": "r1", "exercise_id": "bench", "position": 0,
                                                  "target_sets": 3, "reps_min": 6, "reps_max": 10, "updated_at": T}],
                            "exercise_equipment": [{"id": "l1", "exercise_id": "bench", "equipment_id": "q1", "updated_at": T}]})
    add(conn, "old", "2026-11-09", [(60, 8, "work"), (60, 7, "work")])
    r = run(conn, "session")
    assert r["active"] is None and r["plan"] is None
    assert r["routines"] == [{"id": "r1", "name": "Push", "program": "PPL"}] and r["next_routine_id"] == "r1"
    assert {e["id"] for e in r["exercises"]} == {"bench", "row", "plank"}
    plan = run(conn, "session", routine_id="r1")["plan"]
    bench = plan["exercises"][0]
    assert (plan["routine"], bench["sets"], bench["reps_min"], bench["steps"]) == ("Push", 3, 6, [20, 22.5])
    assert bench["last"] == [{"weight": 60, "reps": 8, "duration_s": None}, {"weight": 60, "reps": 7, "duration_s": None}]
    # a running workout (started two hours ago) is found again, with the exercise that was added to it
    sync.push(conn, OWNER, {"workout": [{"id": "now", "started_at": "2026-11-11T10:00:00", "routine_id": "r1", "routine_name": "Push", "updated_at": T}],
                            "workout_set": [{"id": "s1", "workout_id": "now", "exercise_id": "row", "set_no": 1, "weight": 50, "reps": 10,
                                             "done_at": "2026-11-11T10:05:00", "updated_at": T}]})
    r = run(conn, "session")
    assert r["active"]["id"] == "now" and [s["exercise_id"] for s in r["active"]["sets"]] == ["row"]
    assert [x["exercise_id"] for x in r["plan"]["exercises"]] == ["bench", "row"]
    assert run(conn, "session", exercise_id="plank")["picked"]["kind"] == "time"
    # a workout left open for days no longer counts
    sync.push(conn, OWNER, {"workout": [{"id": "now", "started_at": "2026-11-01T10:00:00", "updated_at": "2026-11-12T00:00:00+00:00"}]})
    assert run(conn, "session")["active"] is None
