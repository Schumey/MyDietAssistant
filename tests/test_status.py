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
