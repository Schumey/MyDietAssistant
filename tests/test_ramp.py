"""Step plan / reverse diet (feature "ramp")."""
from datetime import date, timedelta


def iso(d):
    return d.isoformat()


def goal(c, day):
    return c.get(f"/api/day/{iso(day)}").json()["goal"]


def test_ramp_needs_feature(user):
    c = user()
    assert c.get("/api/ramp").status_code == 403
    assert c.put("/api/ramp", json={"start": "2026-01-01", "kcal": 100}).status_code == 403


def test_ramp_validation(user):
    c = user(feature=("ramp",))
    assert c.get("/api/ramp").json() == {"config": None}
    ok = {"start": "2026-01-01", "kcal": 100}
    assert c.put("/api/ramp", json={**ok, "start": "x"}).status_code == 400
    assert c.put("/api/ramp", json={**ok, "every_days": 0}).status_code == 400
    assert c.put("/api/ramp", json={**ok, "max_steps": 999}).status_code == 400
    assert c.put("/api/ramp", json={"start": "2026-01-01"}).status_code == 400      # no step at all
    assert c.put("/api/ramp", json={**ok, "kcal": 5000}).status_code == 400


def test_reverse_diet_raises_goal_in_steps(user):
    c = user(feature=("ramp",))
    c.put("/api/goal", json={"kcal": 2000, "protein": 150, "carbs": 200, "fat": 60})
    start = date.today() - timedelta(days=15)      # 15 days in: two full weekly steps
    assert c.put("/api/ramp", json={"start": iso(start), "every_days": 7, "kcal": 100, "carbs": 25, "max_steps": 0}).status_code == 200
    g = goal(c, date.today())
    assert (g["kcal"], g["carbs"], g["protein"], g["fat"], g["ramp_step"]) == (2200, 250, 150, 60, 2)
    assert goal(c, start)["kcal"] == 2000 and goal(c, start - timedelta(days=3))["ramp_step"] == 0
    r = c.get("/api/ramp").json()
    assert r["step"] == 2 and r["today"]["kcal"] == 2200 and r["base"]["kcal"] == 2000
    assert r["next_change"] == iso(start + timedelta(days=21))
    assert [p["kcal"] for p in r["preview"][:3]] == [2000, 2100, 2200]


def test_step_cap_and_floor(user):
    c = user(feature=("ramp",))
    c.put("/api/goal", json={"kcal": 2000, "protein": 0, "carbs": 30, "fat": 60})
    start = date.today() - timedelta(days=40)
    c.put("/api/ramp", json={"start": iso(start), "every_days": 7, "kcal": 100, "protein": 10, "carbs": -20, "max_steps": 3})
    g = goal(c, date.today())
    assert g["kcal"] == 2300 and g["protein"] == 0 and g["carbs"] == 0       # capped at 3 steps; no goal stays none; never below 0
    r = c.get("/api/ramp").json()
    assert r["done"] is True and r["next_change"] is None and r["preview"][-1]["step"] == 3


def test_ramp_stop_and_off(user):
    c = user(feature=("ramp",))
    c.put("/api/goal", json={"kcal": 2000, "protein": 0, "carbs": 0, "fat": 0})
    c.put("/api/ramp", json={"start": iso(date.today() - timedelta(days=8)), "kcal": 100})
    assert goal(c, date.today())["kcal"] == 2100
    c.put("/api/settings", json={"features": {"ramp": False}})
    assert goal(c, date.today())["kcal"] == 2000
    c.put("/api/settings", json={"features": {"ramp": True}})
    assert c.delete("/api/ramp").status_code == 200
    assert goal(c, date.today())["kcal"] == 2000 and c.get("/api/ramp").json() == {"config": None}
