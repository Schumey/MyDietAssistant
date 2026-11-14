import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "mydiet" / "app"))
import suggest  # noqa: E402

W = {"kcal": 2, "protein": 2, "carbs": 1, "fat": 1}
T = {"kcal": 300, "protein": 7, "carbs": 57, "fat": 15}


def test_massive_protein_overshoot_is_dropped():
    tot = {"kcal": 441, "protein": 43.7, "carbs": 58, "fat": 4}
    assert suggest.too_far(tot, T, W)


def test_small_overshoot_is_kept():
    tot = {"kcal": 380, "protein": 18, "carbs": 60, "fat": 14}
    assert not suggest.too_far(tot, T, W)


def test_unweighted_macro_is_ignored():
    tot = {"kcal": 300, "protein": 50, "carbs": 57, "fat": 15}
    assert not suggest.too_far(tot, T, {**W, "protein": 0})


def test_limits_are_tighter_while_losing_weight():
    tot = {"kcal": 300, "protein": 7, "carbs": 57, "fat": 15}
    tot = {**tot, "kcal": 300 + 100}      # +100 kcal on a 300 kcal target
    assert not suggest.too_far(tot, T, W, strict=False)
    assert suggest.too_far(tot, T, W, strict=True)
