import extras


def test_goal_sensors(user):
    c = user()
    out = {k: (v, u) for k, v, u in extras.sensor_extras(c.uid)}
    assert out["goal_mode"] == ("lose", "")
    assert out["goal_rate"] == (0.5, "kg/week")
    c.put("/api/settings", json={"goal_mode": "gain", "goal_rate": 0.25})
    out = {k: (v, u) for k, v, u in extras.sensor_extras(c.uid)}
    assert out["goal_mode"] == ("gain", "")
    assert out["goal_rate"] == (0.25, "kg/week")
