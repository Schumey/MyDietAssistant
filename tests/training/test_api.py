"""Training inside the app: POST /api/training/call answers the messages of the former WebSocket API."""
import pytest

T0 = "2026-11-10T10:00:00+00:00"

STRONG = (
    "Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE\n"
    "2026-11-02 18:00:00,Push,1h 10m,Bench Press (Barbell),1,60,8,0,0,,,\n"
    "2026-11-02 18:00:00,Push,1h 10m,Bench Press (Barbell),2,60,7,0,0,,,\n"
)


@pytest.fixture
def athlete(user):
    return user("Sportler", feature=("training",))


def call(c, type_, **kw):
    return c.post("/api/training/call", json={"type": type_, **kw})


def ok(c, type_, **kw):
    r = call(c, type_, **kw)
    assert r.status_code == 200, r.text
    return r.json()


def exercise_id(c, catalog_key="bench_press_barbell"):
    rows = ok(c, "hafs/sync/pull", limit=10000)["records"]["exercise"]
    return next(r["id"] for r in rows if r["catalog_key"] == catalog_key)


def push_workout(c, ended=True):
    ex = exercise_id(c)
    w = {"id": "w1", "started_at": "2026-11-10T18:00:00", "routine_name": "Push", "updated_at": T0}
    if ended:
        w["ended_at"] = "2026-11-10T19:00:00"
    sets = [{"id": f"s{i}", "workout_id": "w1", "exercise_id": ex, "set_no": i, "weight": 60.0, "reps": 8,
             "kind": "work", "done_at": f"2026-11-10T18:0{i}:00", "updated_at": T0} for i in (1, 2, 3)]
    return ok(c, "hafs/sync/push", records={"workout": [w], "workout_set": sets})


def test_feature_off_is_refused(user):
    c = user("Ohne")
    r = call(c, "hafs/info")
    assert r.status_code == 403 and r.json()["code"] == "not_enabled"


def test_areas_setting(user):
    c = user("Bereiche")
    assert c.get("/api/settings").json()["areas"] == "nutrition"
    assert c.put("/api/settings", json={"areas": "both"}).status_code == 200
    s = c.get("/api/settings").json()
    assert s["areas"] == "both" and s["features"]["training"] is True
    # from the training settings: training only, then back to nutrition only (which switches training off)
    assert ok(c, "hafs/areas", value="training") == {"areas": "training"}
    assert ok(c, "hafs/areas") == {"areas": "training"}
    assert call(c, "hafs/areas", value="all").status_code == 400
    assert ok(c, "hafs/areas", value="nutrition") == {"areas": "nutrition"}
    assert c.get("/api/settings").json()["features"]["training"] is False
    assert call(c, "hafs/info").status_code == 403
    assert c.put("/api/settings", json={"areas": "x"}).status_code == 400
    # switching training on by itself (take-over, old clients) shows both areas
    c.put("/api/settings", json={"features": {"training": True}})
    assert c.get("/api/settings").json()["areas"] == "both"


def test_unknown_command_and_bad_body(athlete):
    r = call(athlete, "hafs/nope")
    assert r.status_code == 404 and r.json() == {"code": "unknown_command", "message": "hafs/nope"}
    r = athlete.post("/api/training/call", json={"no": "type"})
    assert r.status_code == 400 and r.json()["code"] == "invalid_format"


def test_info(athlete):
    info = ok(athlete, "hafs/info")
    assert info["api_version"] == 1 and info["ready"] is True and info["user_id"] == athlete.uid
    assert info["schema_version"] >= 5 and info["version"]


def test_catalog_and_pull_seed_the_exercises(athlete):
    assert ok(athlete, "hafs/catalog/info")
    pulled = ok(athlete, "hafs/sync/pull")
    assert pulled["records"]["exercise"] and "cursors" in pulled
    assert exercise_id(athlete)


def test_push_pull_and_events(athlete, monkeypatch):
    import training.api as api
    seen = []
    monkeypatch.setattr(api, "AFTER_PUSH", [lambda owner, events: seen.append((owner, [e["event"] for e in events]))])
    res = push_workout(athlete)
    assert res["applied"] == 4 and res["rejected"] == []
    assert len(seen) == 1 and seen[0][0] == athlete.uid
    assert seen[0][1][:2] == ["workout_started", "workout_finished"]
    workouts = ok(athlete, "hafs/sync/pull", limit=10000)["records"]["workout"]
    assert [w["id"] for w in workouts] == ["w1"]
    overview = ok(athlete, "hafs/web/query", q="overview")
    assert overview


def test_bad_arguments(athlete):
    assert call(athlete, "hafs/sync/push", records=[]).status_code == 400
    assert call(athlete, "hafs/sync/pull", limit=0).status_code == 400
    assert call(athlete, "hafs/sync/pull", cursors={"workout": {"at": T0}}).status_code == 400
    assert call(athlete, "hafs/pref/get", key="secret").status_code == 400
    assert call(athlete, "hafs/pref/set", key="phase", value="party").status_code == 400
    assert call(athlete, "hafs/target/set", exercise_id="x", weight=5000).status_code == 400
    assert call(athlete, "hafs/web/query", q="drop_tables").status_code == 400
    assert call(athlete, "hafs/plan/suggest", days=9).status_code == 400


def test_prefs_and_targets(athlete):
    out = ok(athlete, "hafs/pref/set", key="phase", value="bulk")
    assert out["key"] == "phase" and out["value"] == "bulk" and "targets" in out
    assert ok(athlete, "hafs/pref/get", key="phase") == {"key": "phase", "value": "bulk"}
    ex = exercise_id(athlete)
    assert ok(athlete, "hafs/target/set", exercise_id=ex, weight=62.5)["written"] == 1
    assert isinstance(ok(athlete, "hafs/targets/recompute"), dict)


def test_phase_follows_the_nutrition_goal(athlete):
    import training.api as api
    assert api.refresh_phase(athlete.uid) == {"phase": "", "source": "none"}   # no goal chosen yet
    athlete.put("/api/settings", json={"goal_mode": "gain"})
    assert api.refresh_phase(athlete.uid) == {"phase": "bulk", "source": "goal_mode"}
    assert api.store.get_pref(athlete.uid, "phase_auto") == "bulk"
    ok(athlete, "hafs/pref/set", key="phase", value="cut")          # manual choice wins
    assert api.refresh_phase(athlete.uid)["source"] == "manual"


def test_intake_hint_reads_the_diary(athlete, monkeypatch):
    import training.api as api
    assert ok(athlete, "hafs/intake/hint") == {"hint": None, "kcal": None, "carbs": None}   # never logged food
    from datetime import date
    r = athlete.post("/api/entries/quick", json={"day": date.today().isoformat(), "name": "Apfel",
                                                 "kcal": 300, "protein": 1, "carbs": 60, "fat": 0})
    assert r.status_code == 200, r.text
    from datetime import datetime
    monkeypatch.setattr(api, "_now", lambda: datetime(2026, 11, 10, 15, 0).astimezone())
    hint = ok(athlete, "hafs/intake/hint")
    assert hint["hint"] == "low_kcal" and hint["kcal"] == 300


def test_review_without_ai_and_plan_needs_ai(athlete):
    push_workout(athlete)
    review = ok(athlete, "hafs/review")
    assert "stagnating" in review and review["text"] is None and "instructions" not in review
    r = call(athlete, "hafs/plan/suggest", days=3)
    assert r.status_code == 400 and "ai_task" in r.json()["message"]


def test_gym_current_without_zone(athlete):
    assert ok(athlete, "hafs/gym/current") == {"zone": None, "gym_id": None, "gym": None}


def test_import_and_export(athlete):
    dry = ok(athlete, "hafs/import/gymrun", csv=STRONG)
    assert dry["format"] == "strong" and "added" not in dry
    done = ok(athlete, "hafs/import/gymrun", csv=STRONG, dry_run=False)
    assert done["added"]
    exported = ok(athlete, "hafs/export")
    assert any(w.get("source") == "strong" for w in exported["tables"]["workout"])
    assert call(athlete, "hafs/import/gymrun", csv="not,a,known\nformat").status_code == 400


def test_users_are_separate(user):
    a, b = user("A", feature=("training",)), user("B", feature=("training",))
    push_workout(a)
    assert ok(b, "hafs/sync/pull", limit=10000)["records"].get("workout", []) == []
