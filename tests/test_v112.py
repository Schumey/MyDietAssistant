"""v1.12: next-meal sensors, weight-goal sensors."""
from datetime import date, datetime, timedelta

import extras


def fake_now(monkeypatch, module, when):
    monkeypatch.setattr(module, "datetime", type("D", (datetime,), {"now": classmethod(lambda cls, tz=None: when)}))


def test_next_meal_sensors_follow_the_schedule(user, monkeypatch):
    import extras9
    c = user("Anna", ("schedule",))
    fake_now(monkeypatch, extras9, datetime(2026, 5, 4, 3, 0))
    assert extras9.next_meal_sensor(c.uid) == [("next_meal", "Frühstück", ""), ("next_meal_time", "05:00", "")]
    fake_now(monkeypatch, extras9, datetime(2026, 5, 4, 12, 0))
    assert extras9.next_meal_sensor(c.uid) == [("next_meal", "Abendessen", ""), ("next_meal_time", "17:00", "")]
    fake_now(monkeypatch, extras9, datetime(2026, 5, 4, 22, 0))
    assert extras9.next_meal_sensor(c.uid) == [("next_meal", "none", ""), ("next_meal_time", "none", "")]
    assert extras9.next_meal_sensor(user("Otto").uid) == []


def series(start_kg, per_day, days, today=None):
    today = today or date.today()
    return [((today - timedelta(days=days - 1 - i)).isoformat(), start_kg + per_day * i) for i in range(days)]


def test_forecast_names_the_day_the_target_is_reached():
    w = series(90.0, -0.1, 30)                       # losing 100 g a day, now about 87.1 kg after smoothing
    fc = extras.goal_forecast(w, 80.0)
    assert fc["date"] != "none" and fc["kg_left"] > 5
    reached = date.fromisoformat(fc["date"])
    assert date.today() + timedelta(days=40) < reached < date.today() + timedelta(days=160)


def test_forecast_gives_no_date_when_it_is_not_in_sight():
    assert extras.goal_forecast(series(90.0, -0.1, 30), 95.0)["date"] == "none"          # wrong direction
    assert extras.goal_forecast(series(90.0, 0.0, 30), 80.0)["date"] == "none"           # no movement
    assert extras.goal_forecast(series(90.0, -0.1, 7), 80.0)["date"] == "none"           # too little data
    assert extras.goal_forecast(series(90.0, -0.1, 30), None) is None
    assert extras.goal_forecast(series(80.1, 0.0, 30), 80.0) == {"kg_left": 0.0, "date": "reached"}


def test_weight_goal_sensors_are_published(user):
    c = user("Anna")
    for day, kg in series(90.0, -0.1, 30):
        assert c.put(f"/api/weights/{day}", json={"kg": kg}).status_code == 200
    c.put("/api/goal", json={"kcal": 2000, "target_weight": 80})
    out = {k: v for k, v, _ in extras.sensor_extras(c.uid)}
    assert out["weight_to_goal"] > 5 and out["weight_goal_date"] not in ("none", "reached")
