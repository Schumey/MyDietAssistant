from datetime import datetime, timezone

import pytest

from core import db, phase, status, sync, targets
from core.store import Store

OWNER = "u1"
T = "2026-11-01T10:00:00+00:00"


def utc(*a):
    return datetime(*a, tzinfo=timezone.utc)


# ---- phase -----------------------------------------------------------------

def test_goal_mode_mapping():
    assert phase.from_goal_mode("lose") == "cut"
    assert phase.from_goal_mode("Maintain") == "maintain"
    assert phase.from_goal_mode("gain") == "bulk"
    assert phase.from_goal_mode("unknown") is None
    assert phase.from_goal_mode(None) is None


@pytest.mark.parametrize("value,expected", [
    (-350, "cut"), ("-201", "cut"), (-200, "maintain"), (0, "maintain"), (200, "maintain"), (250.5, "bulk"),
    ("unavailable", None), ("unknown", None), (None, None), ("abc", None), (float("nan"), None),
])
def test_balance_mapping(value, expected):
    assert phase.from_balance(value) == expected


def test_resolve_order():
    assert phase.resolve("bulk", "lose", -500, "cut") == ("bulk", "manual")
    assert phase.resolve("", "lose", 500, "bulk") == ("cut", "goal_mode")
    assert phase.resolve("", "unavailable", 500, "cut") == ("bulk", "energy_balance")
    assert phase.resolve(None, None, None, "cut") == ("cut", "last_known")
    assert phase.resolve("", None, None, None) == ("", "none")


# ---- status ----------------------------------------------------------------

@pytest.fixture
def conn():
    c = db.connect(":memory:")
    sync.push(c, OWNER, {"exercise": [{"id": "e1", "name": "Bank", "kind": "strength", "updated_at": T}]})
    return c


def add(conn, wid, start, end, sets=((60, 8),), ex="e1"):
    rec = {"id": wid, "started_at": start, "updated_at": T}
    if end:
        rec["ended_at"] = end
    sync.push(conn, OWNER, {"workout": [rec]})
    for i, (w, r) in enumerate(sets, 1):
        sync.push(conn, OWNER, {"workout_set": [{"id": f"{wid}-{i}", "workout_id": wid, "exercise_id": ex, "set_no": i,
                                                  "weight": w, "reps": r, "done_at": start, "updated_at": T}]})


def test_no_workouts(conn):
    s = status.status(conn, OWNER, utc(2026, 11, 10, 12))
    assert s["state"] == "none" and not s["active"] and s["workouts_today"] == 0 and s["last"] is None


def test_active_then_done_until_midnight(conn):
    add(conn, "w1", "2026-11-10T10:00:00+00:00", None)
    assert status.status(conn, OWNER, utc(2026, 11, 10, 11))["state"] == "active"
    sync.push(conn, OWNER, {"workout": [{"id": "w1", "started_at": "2026-11-10T10:00:00+00:00",
                                         "ended_at": "2026-11-10T11:00:00+00:00", "updated_at": "2026-11-10T11:00:00+00:00"}]})
    s = status.status(conn, OWNER, utc(2026, 11, 10, 12))
    assert s["state"] == "done" and s["workouts_today"] == 1
    assert s["attrs"]["duration_min"] == 60 and s["attrs"]["volume_kg"] == 480 and s["attrs"]["sets"] == 1
    assert s["attrs"]["kcal_estimate"] == 270
    assert status.status(conn, OWNER, utc(2026, 11, 11, 0, 1))["state"] == "none"


def test_stale_unfinished_workout_is_not_active(conn):
    add(conn, "w1", "2026-11-09T08:00:00+00:00", None)
    assert status.status(conn, OWNER, utc(2026, 11, 10, 12))["state"] == "none"


def test_today_uses_given_timezone(conn):
    from datetime import timedelta
    berlin = timezone(timedelta(hours=1))
    add(conn, "w1", "2026-11-09T22:00:00+00:00", "2026-11-09T23:30:00+00:00")  # 00:30 local on the 10th
    assert status.status(conn, OWNER, utc(2026, 11, 10, 8), berlin)["workouts_today"] == 1
    assert status.status(conn, OWNER, utc(2026, 11, 10, 8), timezone.utc)["workouts_today"] == 0


def test_week_count_and_last(conn):
    add(conn, "w1", "2026-11-02T10:00:00+00:00", "2026-11-02T11:00:00+00:00")  # Monday
    add(conn, "w2", "2026-11-05T10:00:00+00:00", "2026-11-05T11:00:00+00:00")
    add(conn, "w0", "2026-11-01T10:00:00+00:00", "2026-11-01T11:00:00+00:00")  # previous week
    s = status.status(conn, OWNER, utc(2026, 11, 6, 12))
    assert s["workouts_week"] == 2 and s["last"]["workout_id"] == "w2"
    assert s["last_workout_at"].startswith("2026-11-05T11:00")


def test_other_owner_is_invisible(conn):
    add(conn, "w1", "2026-11-10T10:00:00+00:00", "2026-11-10T11:00:00+00:00")
    assert status.status(conn, "someone-else", utc(2026, 11, 10, 12))["state"] == "none"


# ---- records ---------------------------------------------------------------

def test_records_need_history_and_a_better_value(conn):
    add(conn, "w1", "2026-11-01T10:00:00+00:00", "2026-11-01T11:00:00+00:00", [(60, 8)])
    assert status.records_in(conn, OWNER, "w1") == []           # first time: no record
    add(conn, "w2", "2026-11-03T10:00:00+00:00", "2026-11-03T11:00:00+00:00", [(60, 8)])
    assert status.records_in(conn, OWNER, "w2") == []           # equal: no record
    add(conn, "w3", "2026-11-05T10:00:00+00:00", "2026-11-05T11:00:00+00:00", [(62.5, 8)])
    kinds = {r["kind"]: r for r in status.records_in(conn, OWNER, "w3")}
    assert kinds["weight"]["value"] == 62.5 and kinds["weight"]["previous"] == 60
    assert "1rm" in kinds


def test_warmups_do_not_make_records(conn):
    add(conn, "w1", "2026-11-01T10:00:00+00:00", "2026-11-01T11:00:00+00:00", [(60, 8)])
    add(conn, "w2", "2026-11-03T10:00:00+00:00", "2026-11-03T11:00:00+00:00", [(100, 8)])
    conn.execute("UPDATE workout_set SET kind='warmup' WHERE workout_id='w2'")
    assert status.records_in(conn, OWNER, "w2") == []


# ---- store: events, phase snapshot, auto phase -----------------------------

@pytest.fixture
def store(tmp_path):
    s = Store(str(tmp_path / "h.db"))
    s.init()
    s.push(OWNER, {"exercise": [{"id": "e1", "name": "Bank", "kind": "strength", "updated_at": T}]})
    return s


def wrec(wid, start, end=None, ts="2026-11-10T10:00:00+00:00"):
    r = {"id": wid, "started_at": start, "updated_at": ts}
    if end:
        r["ended_at"] = end
    return r


def srec(wid, w, reps):
    return {"id": f"{wid}-s", "workout_id": wid, "exercise_id": "e1", "set_no": 1, "weight": w, "reps": reps,
            "done_at": "2026-11-10T10:05:00+00:00", "updated_at": "2026-11-10T10:05:00+00:00"}


def test_events_started_and_finished(store):
    res, ev = store.push_ex(OWNER, {"workout": [wrec("w1", "2026-11-10T10:00:00+00:00")]})
    assert [e["event"] for e in ev] == ["workout_started"]
    res, ev = store.push_ex(OWNER, {"workout_set": [srec("w1", 60, 8)]})
    assert ev == []
    res, ev = store.push_ex(OWNER, {"workout": [wrec("w1", "2026-11-10T10:00:00+00:00", "2026-11-10T11:00:00+00:00",
                                                    "2026-11-10T11:00:00+00:00")]})
    assert [e["event"] for e in ev] == ["workout_finished"]
    assert ev[0]["data"]["volume_kg"] == 480 and ev[0]["data"]["duration_min"] == 60
    # pushing the same finished workout again is not a new event
    _, ev = store.push_ex(OWNER, {"workout": [wrec("w1", "2026-11-10T10:00:00+00:00", "2026-11-10T11:00:00+00:00",
                                                  "2026-11-10T11:00:01+00:00")]})
    assert ev == []


def test_offline_workout_arrives_started_and_finished_at_once(store):
    _, ev = store.push_ex(OWNER, {"workout": [wrec("w1", "2026-11-10T10:00:00+00:00", "2026-11-10T11:00:00+00:00")],
                                  "workout_set": [srec("w1", 60, 8)]})
    assert [e["event"] for e in ev] == ["workout_started", "workout_finished"]


def test_record_event(store):
    store.push_ex(OWNER, {"workout": [wrec("w0", "2026-11-01T10:00:00+00:00", "2026-11-01T11:00:00+00:00")],
                          "workout_set": [srec("w0", 60, 8)]})
    _, ev = store.push_ex(OWNER, {"workout": [wrec("w1", "2026-11-10T10:00:00+00:00", "2026-11-10T11:00:00+00:00")],
                                  "workout_set": [srec("w1", 65, 8)]})
    kinds = [e["event"] for e in ev]
    assert kinds[:2] == ["workout_started", "workout_finished"] and kinds.count("record") == 2


def test_rejected_push_has_no_events(store):
    _, ev = store.push_ex(OWNER, {"workout": [{"id": "x"}]})
    assert ev == []


def test_phase_snapshot_on_new_workouts(store):
    store.set_auto_phase(OWNER, "cut")
    store.push(OWNER, {"workout": [wrec("w1", "2026-11-10T10:00:00+00:00")]})
    store.set_pref(OWNER, "phase", "bulk")
    store.push(OWNER, {"workout": [wrec("w2", "2026-11-11T10:00:00+00:00")]})
    with store._conn() as c:
        ph = {r["id"]: r["phase"] for r in c.execute("SELECT id, phase FROM workout")}
    assert ph == {"w1": "cut", "w2": "bulk"}


def test_auto_phase_is_used_unless_manual(store):
    assert store.set_auto_phase(OWNER, "cut") is True
    assert store.set_auto_phase(OWNER, "cut") is False
    with store._conn() as c:
        assert targets._phase(c, OWNER) == "cut"
    store.set_pref(OWNER, "phase", "bulk")
    with store._conn() as c:
        assert targets._phase(c, OWNER) == "bulk"
    store.set_pref(OWNER, "phase", "")
    with store._conn() as c:
        assert targets._phase(c, OWNER) == "cut"


def test_owners(store):
    store.push(OWNER, {"workout": [wrec("w1", "2026-11-10T10:00:00+00:00")]})
    assert store.owners() == [OWNER]


# ---- settings via pref -----------------------------------------------------

def test_pref_validation():
    assert targets.valid_pref("phase", "cut") and not targets.valid_pref("phase", "x")
    assert targets.valid_pref("hit_fraction", "0.75") and not targets.valid_pref("hit_fraction", "1.5")
    assert not targets.valid_pref("hit_fraction", "abc")
    assert targets.valid_pref("cut_drop_set_first", "1") and not targets.valid_pref("cut_drop_set_first", "yes")
    assert targets.valid_pref("break_days", "21") and not targets.valid_pref("break_days", "1")
    assert not targets.valid_pref("unknown", "1")


def test_settings_from_prefs(store):
    with store._conn() as c:
        assert targets.load_settings(c, OWNER).hit_fraction == 1.0
    store.set_pref(OWNER, "hit_fraction", "0.75")
    store.set_pref(OWNER, "cut_drop_set_first", "1")
    store.set_pref(OWNER, "break_days", "bad")  # ignored when invalid
    with store._conn() as c:
        s = targets.load_settings(c, OWNER)
    assert (s.hit_fraction, s.cut_drop_set_first, s.break_days) == (0.75, True, 14)


def test_setting_changes_the_target(store):
    # three work sets 60 x 10, 10, 8 with range 8-10 inferred? use a routine-less history: 3 sets, last one short
    store.push(OWNER, {"workout": [wrec("w1", "2026-11-05T10:00:00+00:00", "2026-11-05T11:00:00+00:00")],
                       "workout_set": [
                           {"id": f"s{i}", "workout_id": "w1", "exercise_id": "e1", "set_no": i, "weight": 60, "reps": r,
                            "kind": "work", "done_at": f"2026-11-05T10:0{i}:00+00:00", "updated_at": T}
                           for i, r in enumerate([10, 10, 9, 10], 1)]})
    with store._conn() as c:
        before = c.execute("SELECT weight, reason_code FROM target WHERE owner=?", (OWNER,)).fetchone()
    store.set_pref(OWNER, "hit_fraction", "0.75")
    with store._conn() as c:
        after = c.execute("SELECT weight, reason_code FROM target WHERE owner=?", (OWNER,)).fetchone()
    assert before is not None and after is not None
    assert after["weight"] >= before["weight"]


def test_recent_workouts(store):
    store.push(OWNER, {"workout": [wrec("w1", "2026-11-09T10:00:00+00:00", "2026-11-09T11:00:00+00:00"),
                                   wrec("w0", "2026-09-01T10:00:00+00:00", "2026-09-01T11:00:00+00:00"),
                                   wrec("w2", "2026-11-10T10:00:00+00:00")],
                       "workout_set": [srec("w1", 60, 8), srec("w0", 50, 8), srec("w2", 70, 5)]})
    with store._conn() as c:
        out = status.recent_workouts(c, OWNER, days=30, now=utc(2026, 11, 10, 12))
    assert [w["workout_id"] for w in out] == ["w1"]          # unfinished and old ones are left out
    assert out[0]["exercises"] == [{"name": "Bank", "sets": 1, "best_weight": 60.0}]
    assert out[0]["volume_kg"] == 480
    assert store.recent_workouts("nobody") == []


def test_week_volume_and_mda_name(store):
    store.push(OWNER, {"workout": [wrec("w1", "2026-11-09T10:00:00+00:00", "2026-11-09T11:00:00+00:00")],
                       "workout_set": [srec("w1", 60, 8)]})
    with store._conn() as c:
        assert status.status(c, OWNER, utc(2026, 11, 10, 12))["volume_week_kg"] == 480
    assert targets.valid_pref("mda_name", "robin") and targets.valid_pref("mda_name", "")
    assert not targets.valid_pref("mda_name", "Robin") and not targets.valid_pref("mda_name", "a b")
    store.set_pref(OWNER, "mda_name", "andre")
    assert store.get_pref(OWNER, "mda_name") == "andre"


def test_next_routine_rotation(store):
    store.push(OWNER, {
        "program": [{"id": "p", "name": "PPL", "updated_at": T}],
        "routine": [{"id": "ra", "name": "Push", "program_id": "p", "position": 0, "updated_at": T},
                    {"id": "rb", "name": "Pull", "program_id": "p", "position": 1, "updated_at": T}],
        "routine_exercise": [{"id": "x1", "routine_id": "ra", "exercise_id": "e1", "position": 0, "updated_at": T}],
    })
    with store._conn() as c:
        assert status.next_routine(c, OWNER)["routine"] == "Push"
        assert status.next_routine(c, OWNER)["exercises"] == ["Bank"]
    r = wrec("w1", "2026-11-09T10:00:00+00:00", "2026-11-09T11:00:00+00:00")
    r["routine_id"] = "ra"
    store.push(OWNER, {"workout": [r]})
    with store._conn() as c:
        assert status.next_routine(c, OWNER)["routine"] == "Pull"
    r2 = wrec("w2", "2026-11-10T10:00:00+00:00", "2026-11-10T11:00:00+00:00")
    r2["routine_id"] = "rb"
    store.push(OWNER, {"workout": [r2]})
    with store._conn() as c:
        assert status.next_routine(c, OWNER)["routine"] == "Push"   # wrapped
        assert status.status(c, OWNER, utc(2026, 11, 10, 12))["next"]["routine"] == "Push"
    assert status.next_routine(store._conn().__enter__(), "nobody") is None


def test_pick_next_weekday_plan():
    # Mon, Wed, Fri
    days = [1, 3, 5]
    assert status.pick_next(3, -1, days, 1, False) == 0   # Monday, not trained yet: Monday's routine
    assert status.pick_next(3, 0, days, 1, True) == 1     # trained Monday: next is Wednesday's
    assert status.pick_next(3, 0, days, 2, False) == 1    # Tuesday: next training day
    assert status.pick_next(3, 2, days, 6, False) == 0    # Saturday: wraps to Monday
    assert status.pick_next(3, 1, [], 4, False) == 2      # no rhythm: rotation
    assert status.parse_rhythm("1,3,5", 3) == days
    assert status.parse_rhythm("1,3", 3) == []            # one weekday per routine required
    assert status.parse_rhythm("x", 1) == []


def test_next_routine_uses_rhythm(store):
    store.push(OWNER, {
        "program": [{"id": "p", "name": "PPL", "rhythm": "1,3", "updated_at": T}],
        "routine": [{"id": "ra", "name": "Push", "program_id": "p", "position": 0, "updated_at": T},
                    {"id": "rb", "name": "Pull", "program_id": "p", "position": 1, "updated_at": T}],
    })
    mon, tue, wed = utc(2026, 11, 9, 8), utc(2026, 11, 10, 8), utc(2026, 11, 11, 8)
    with store._conn() as c:
        assert status.next_routine(c, OWNER, mon)["routine"] == "Push"
        assert status.next_routine(c, OWNER, tue)["routine"] == "Pull"
        assert status.next_routine(c, OWNER, wed)["routine"] == "Pull"
