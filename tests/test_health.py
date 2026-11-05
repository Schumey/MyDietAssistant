"""v1.29: weight and activity from the Android app (Health Connect)."""
from datetime import date, timedelta


def day(n: int) -> str:
    return (date.today() - timedelta(days=n)).isoformat()


def weights(c):
    return {w["day"]: w["kg"] for w in c.get("/api/weights").json()}


def test_weights_fill_only_days_without_a_weight(user):
    c = user()
    c.put(f"/api/weights/{day(1)}", json={"kg": 80.0})
    r = c.post("/api/health/import", json={"weights": [
        {"day": day(2), "kg": 81.234}, {"day": day(1), "kg": 79.0}, {"day": day(0), "kg": 600}]}).json()
    assert r["weights"] == 1 and r["skipped"] == 2
    assert weights(c) == {day(2): 81.23, day(1): 80.0}


def test_weights_outside_the_window_or_in_the_future_are_skipped(user):
    c = user()
    r = c.post("/api/health/import", json={"weights": [
        {"day": day(-1), "kg": 80}, {"day": day(500), "kg": 80}, {"day": "gestern", "kg": 80}]}).json()
    assert r == {"weights": 0, "activity": 0, "skipped": 3, "activity_off": False}
    assert weights(c) == {}


def test_activity_needs_the_feature(user):
    c = user()
    r = c.post("/api/health/import", json={"activity": [{"day": day(0), "steps": 9000, "kcal": 350}]}).json()
    assert r["activity_off"] and r["activity"] == 0


def test_activity_is_stored_but_never_over_a_manual_day(user):
    c = user(feature=("activity",))
    c.put(f"/api/activity/{day(1)}", json={"steps": 100, "kcal": 10})
    r = c.post("/api/health/import", json={"activity": [
        {"day": day(0), "steps": 9000.4, "kcal": 350.6}, {"day": day(1), "steps": 5000, "kcal": 200},
        {"day": day(2), "steps": 0, "kcal": 0}]}).json()
    assert r["activity"] == 1 and r["skipped"] == 2
    today = c.get(f"/api/activity?day={day(0)}").json()
    assert (today["steps"], today["kcal"], today["manual"]) == (9000, 351, False)
    assert c.get(f"/api/activity?day={day(1)}").json()["steps"] == 100
    # a second import of the same day replaces the phone's value (the phone's total grows during the day)
    c.post("/api/health/import", json={"activity": [{"day": day(0), "steps": 12000, "kcal": 500}]})
    assert c.get(f"/api/activity?day={day(0)}").json()["steps"] == 12000


def test_users_are_separate(user):
    a, b = user(), user()
    a.post("/api/health/import", json={"weights": [{"day": day(0), "kg": 70}]})
    assert weights(b) == {}
