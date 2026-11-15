from core import phase


def test_no_hint_in_the_morning():
    assert phase.intake_hint(100, 5, 9)["hint"] is None


def test_low_kcal_or_carbs_after_noon():
    assert phase.intake_hint(500, 120, 14) == {"hint": "low_kcal", "kcal": 500.0, "carbs": 120.0}
    assert phase.intake_hint("1500", "40", 14)["hint"] == "low_carbs"
    assert phase.intake_hint(1500, 200, 14)["hint"] is None


def test_unknown_values_say_nothing():
    for bad in (None, "unknown", "unavailable", "", "x", float("nan")):
        assert phase.intake_hint(bad, bad, 18)["hint"] is None
