from datetime import date, datetime, timezone

import pytest

from core import db, review, sync, webview
from core.store import Store

OWNER = "u1"
T = "2026-01-01T00:00:00+00:00"
TODAY = date(2026, 11, 14)


@pytest.fixture
def conn():
    c = db.connect(":memory:")
    sync.push(c, OWNER, {"exercise": [
        {"id": "bench", "name": "Bankdrücken", "kind": "strength", "muscles_primary": "chest", "updated_at": T},
        {"id": "row", "name": "Rudern", "kind": "strength", "muscles_primary": "lats", "updated_at": T},
        {"id": "plank", "name": "Plank", "kind": "time", "updated_at": T}]})
    return c


def session(conn, wid, day, ex, weight, reps, sets=1):
    sync.push(conn, OWNER, {"workout": [{"id": wid, "started_at": f"{day}T10:00:00", "ended_at": f"{day}T11:00:00", "updated_at": T}]})
    for i in range(sets):
        sync.push(conn, OWNER, {"workout_set": [{"id": f"{wid}-{ex}-{i}", "workout_id": wid, "exercise_id": ex, "set_no": i + 1,
                                                  "weight": weight, "reps": reps, "kind": "work", "done_at": f"{day}T10:0{i}:00", "updated_at": T}]})


def test_stagnation_needs_sessions_and_no_new_best(conn):
    for i, day in enumerate(["2026-08-03", "2026-08-10"]):             # before the 6-week window: the best
        session(conn, f"b{i}", day, "bench", 80, 8)
    for i, day in enumerate(["2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02"]):
        session(conn, f"r{i}", day, "bench", 75, 8)                    # four sessions, lower than before
    for i, day in enumerate(["2026-08-03", "2026-08-10", "2026-10-19", "2026-11-02", "2026-11-09"]):
        session(conn, f"x{i}", day, "row", 50 + i * 5, 8)              # keeps improving
    found = review.stagnation(conn, OWNER, TODAY)
    assert [x["name"] for x in found] == ["Bankdrücken"]
    assert found[0]["sessions"] == 4 and found[0]["metric"] == "e1rm" and found[0]["best"] > found[0]["recent_best"]


def test_few_sessions_or_no_history_are_not_stagnation(conn):
    session(conn, "a", "2026-08-03", "bench", 80, 8)
    session(conn, "b", "2026-08-10", "bench", 80, 8)
    session(conn, "c", "2026-11-02", "bench", 75, 8)                   # only one recent session
    session(conn, "d", "2026-10-12", "row", 50, 8)
    session(conn, "e", "2026-10-19", "row", 50, 8)
    session(conn, "f", "2026-10-26", "row", 50, 8)
    session(conn, "g", "2026-11-02", "row", 50, 8)                     # nothing before the window
    assert review.stagnation(conn, OWNER, TODAY) == []


def test_neglected_muscles_compares_recent_weeks_with_earlier_ones():
    weekly = {"muscles": {"chest": [12] * 11 + [3, 3, 3, 3, 5], "lats": [10] * 15 + [9], "calves": [2] * 16}}
    assert review.neglected_muscles(weekly) == [{"muscle": "chest", "recent": 3.0, "earlier": 12.0}]


def test_instructions_contain_only_names_and_numbers():
    text = review.build_instructions([{"name": "Bankdrücken", "sessions": 4, "weeks": 6, "best": 100.0}],
                                     [{"muscle": "chest", "recent": 3.0, "earlier": 12.0}], "cut", "de")
    assert "Bankdrücken" in text and "chest" in text and "Diät" in text and "Deutsch" in text


def test_store_review(tmp_path):
    store = Store(str(tmp_path / "h.db"))
    out = store.review(OWNER, datetime(2026, 11, 14, 12, tzinfo=timezone.utc), timezone.utc, "en")
    assert out["stagnating"] == [] and out["neglected"] == [] and "Findings" in out["instructions"]
