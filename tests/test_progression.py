from datetime import date, timedelta

import pytest

from core import progression as p
from core.progression import SetRec, Session, Settings

TODAY = date(2026, 11, 10)
STEPS = [20.0, 22.5, 25.0, 27.5, 30.0, 32.5, 35.0]


def sess(days_ago, *sets):
    """sess(3, (30, 12), (30, 11)) -> a session 3 days ago with those (weight, reps) sets."""
    recs = tuple(s if isinstance(s, SetRec) else SetRec(s[0], s[1], s[2] if len(s) > 2 else "work") for s in sets)
    return Session(TODAY - timedelta(days=days_ago), recs)


def go(sessions, phase="maintain", lo=8, hi=12, steps=STEPS, **kw):
    return p.suggest(sessions, lo, hi, phase, TODAY, steps, **kw)


# --- steps ---------------------------------------------------------------------

def test_expand_steps_variants():
    assert p.expand_steps([30, 20, 20]) == [20.0, 30.0]
    assert p.expand_steps({"min": 5, "max": 20, "step": 5}) == [5, 10, 15, 20]
    assert p.expand_steps('{"min": 2.5, "max": 7.5, "step": 2.5}') == [2.5, 5.0, 7.5]
    assert p.expand_steps("[10, 20]") == [10, 20]
    assert p.expand_steps(None) is None and p.expand_steps("") is None and p.expand_steps("kaputt") is None
    assert p.expand_steps({"min": 10, "max": 5, "step": 5}) is None
    assert p.expand_steps({"min": 5, "max": 20, "step": 0}) is None


def test_step_helpers():
    assert p.step_up(30, STEPS, 2.5) == 32.5
    assert p.step_up(35, STEPS, 2.5) is None
    assert p.step_up(31, STEPS, 2.5) == 32.5          # off-grid weight goes to the next step
    assert p.step_up(30, None, 2.5) == 32.5
    assert p.step_down(30, STEPS, 2.5) == 27.5
    assert p.step_down(20, STEPS, 2.5) == 20           # stays at the lowest
    assert p.step_down(1, None, 2.5) == 0
    assert p.snap(31, STEPS) == 30 and p.snap(31.25, STEPS) == 30 and p.snap(31.3, STEPS) == 32.5
    assert p.snap(31, None) == 31


# --- reading sessions ---------------------------------------------------------------

def test_working_weight_is_mode_ties_to_heavier():
    assert p.working_weight(sess(1, (20, 10), (30, 10), (30, 9))) == 30
    assert p.working_weight(sess(1, (50, 10), (70, 8), (77, 8))) == 77          # ramp: all distinct
    assert p.working_weight(sess(1, (30, 10), (30, 9), (40, 5))) == 30


def test_working_weight_ignores_warmups_drops_and_zero_reps():
    s = sess(1, (10, 15, "warmup"), (30, 10, "drop"), (25, 0), (25, 8))
    assert p.working_weight(s) == 25
    assert p.working_weight(sess(1, (10, 15, "warmup"))) is None


def test_session_without_work_sets_is_skipped():
    assert go([sess(2, (10, 15, "warmup"))]) is None
    assert go([]) is None


# --- double progression (maintain) ------------------------------------------------------

def test_up_when_top_of_range_reached():
    t = go([sess(3, (30, 12), (30, 12), (30, 12))])
    assert (t.weight, t.reps, t.code) == (32.5, 8, "up")


def test_hold_aims_one_rep_more():
    t = go([sess(3, (30, 10), (30, 9), (30, 10))])
    assert (t.weight, t.reps, t.code) == (30, 10, "hold")        # lowest set had 9 -> 10


def test_hold_reps_are_clamped_into_range():
    assert go([sess(3, (30, 8), (30, 9))]).reps == 9
    t = go([sess(3, (30, 12), (30, 11))], hi=12)               # one set short of the top
    assert (t.code, t.reps) == ("hold", 12)
    assert go([sess(3, (30, 8), (30, 8))], lo=10, hi=12).reps == 10    # at least the bottom


def test_single_miss_in_maintain_holds_instead_of_down():
    t = go([sess(3, (30, 6), (30, 6), (30, 6))])
    assert t.code == "hold" and t.weight == 30 and t.reps == 8


def test_down_after_two_missed_workouts_in_a_row():
    t = go([sess(3, (30, 6), (30, 6)), sess(6, (30, 7), (30, 7))])
    assert (t.weight, t.reps, t.code) == (27.5, 8, "down")


def test_misses_at_different_weights_do_not_chain():
    # earlier miss was at another weight: only one miss at 30 kg
    t = go([sess(3, (30, 6), (30, 6)), sess(6, (32.5, 6), (32.5, 6))])
    assert t.code == "hold"


def test_streak_is_broken_by_a_good_session():
    t = go([sess(3, (30, 6), (30, 6)), sess(6, (30, 10), (30, 10)), sess(9, (30, 6), (30, 6))])
    assert t.code == "hold"


def test_miss_threshold_needs_half_the_sets():
    one_of_three = [sess(3, (30, 10), (30, 10), (30, 5)), sess(6, (30, 10), (30, 10), (30, 5))]
    assert go(one_of_three).code == "hold"
    two_of_three = [sess(3, (30, 10), (30, 5), (30, 5)), sess(6, (30, 10), (30, 5), (30, 5))]
    assert go(two_of_three).code == "down"


def test_input_order_does_not_matter():
    a, b = sess(3, (30, 6), (30, 6)), sess(6, (30, 7), (30, 7))
    assert go([a, b]) == go([b, a])


# --- phases -----------------------------------------------------------------------------

def test_bulk_behaves_like_maintain():
    assert go([sess(3, (30, 12), (30, 12))], "bulk").code == "up"
    assert go([sess(3, (30, 6)), sess(6, (30, 6))], "bulk").code == "down"


def test_unknown_phase_falls_back_to_maintain():
    assert go([sess(3, (30, 12))], None).code == "up"
    assert go([sess(3, (30, 12))], "quatsch").code == "up"


def test_cut_needs_top_of_range_twice():
    once = go([sess(3, (30, 12), (30, 12))], "cut")
    assert once.code == "hold_cut" and once.weight == 30
    twice = go([sess(3, (30, 12), (30, 12)), sess(6, (30, 12), (30, 12))], "cut")
    assert (twice.weight, twice.code) == (32.5, "up_cut")


def test_cut_two_hits_must_be_at_the_same_weight():
    t = go([sess(3, (32.5, 12), (32.5, 12)), sess(6, (30, 12), (30, 12))], "cut")
    assert t.code == "hold_cut"        # the earlier hit was at a lighter weight


def test_cut_goes_down_after_one_missed_workout():
    t = go([sess(3, (30, 6), (30, 7))], "cut")
    assert (t.weight, t.code) == (27.5, "down_cut")


def test_cut_drops_a_set_first_when_enabled():
    st = Settings(cut_drop_set_first=True)
    t = go([sess(3, (30, 6), (30, 6), (30, 6))], "cut", settings=st)
    assert (t.code, t.weight, t.sets) == ("cut_drop_set", 30, 2)
    # already at the minimum number of sets -> lower the weight instead
    t = go([sess(3, (30, 6), (30, 6))], "cut", settings=st)
    assert (t.code, t.weight) == ("down_cut", 27.5)


def test_up_restores_the_target_set_count():
    t = go([sess(3, (30, 12), (30, 12))], target_sets=3)
    assert t.code == "hold"            # fewer sets than planned never counts as a hit
    t = go([sess(3, (30, 12), (30, 12), (30, 12))], target_sets=3)
    assert t.code == "up" and t.sets is None
    st = Settings(cut_drop_set_first=True)
    t = go([sess(3, (30, 12), (30, 12)), sess(6, (30, 12), (30, 12))], "cut", settings=st, target_sets=2)
    assert t.code == "up_cut"


# --- breaks, equipment, limits ------------------------------------------------------------

def test_break_goes_one_step_down():
    t = go([sess(14, (30, 12), (30, 12))])
    assert (t.weight, t.reps, t.code) == (27.5, 8, "break") and t.params["days"] == 14


def test_no_break_below_threshold():
    assert go([sess(13, (30, 12), (30, 12))]).code == "up"


def test_break_threshold_is_a_setting():
    assert go([sess(8, (30, 12))], settings=Settings(break_days=7)).code == "break"


def test_equipment_change_snaps_to_nearest_step():
    other = [20.0, 25.0, 30.0, 35.0]
    t = go([sess(3, (27.5, 10), (27.5, 10))], steps=other)
    assert (t.code, t.weight, t.reps) == ("device_change", 25.0, 8)    # 27.5 sits between, lower one wins
    t = go([sess(3, (28, 10))], steps=other)
    assert t.weight == 30


def test_foreign_history_is_only_snapped():
    t = go([sess(3, (30, 12), (30, 12))], steps=[20, 25, 35], foreign=True)
    assert (t.code, t.weight, t.reps) == ("device_change", 25, 8)       # not "up", even with a perfect session


def test_top_of_equipment_asks_for_reps():
    t = go([sess(3, (35, 12), (35, 12))])
    assert (t.code, t.weight, t.reps) == ("at_max", 35, 12)


def test_bottom_of_equipment_cannot_go_lower():
    t = go([sess(3, (20, 5)), sess(6, (20, 5))])
    assert (t.code, t.weight) == ("at_min", 20)


def test_without_steps_default_step_is_used():
    t = go([sess(3, (30, 12), (30, 12))], steps=None)
    assert t.weight == 32.5
    t = go([sess(3, (30, 12), (30, 12))], steps=None, settings=Settings(default_step=5))
    assert t.weight == 35
    t = go([sess(3, (30, 6)), sess(6, (30, 6))], steps=None)
    assert t.weight == 27.5


def test_hit_fraction_setting_for_fading_reps():
    fading = [sess(3, (84, 12), (84, 10), (84, 9))]
    assert go(fading, steps=None).code == "hold"                       # default: every set must hit
    assert go(fading, steps=None, settings=Settings(hit_fraction=0.3)).code == "up"   # one of three is enough


def test_bodyweight_exercise_adds_weight_at_the_top():
    t = go([sess(3, (0, 12), (0, 12))], steps=None)
    assert (t.code, t.weight) == ("up", 2.5)
    t = go([sess(3, (None, 10), (None, 9))], steps=None)
    assert (t.code, t.weight, t.reps) == ("hold", 0, 10)


def test_swapped_range_is_tolerated():
    assert go([sess(3, (30, 12))], lo=12, hi=8).code == "up"


# --- rep range inference ----------------------------------------------------------------------

def test_infer_rep_range_from_best_sets():
    h = [sess(1, (30, 8), (30, 6)), sess(4, (30, 8), (30, 7)), sess(7, (30, 8), (30, 4)), sess(10, (30, 10), (30, 5))]
    assert p.infer_rep_range(h) == (8, 8)
    assert p.infer_rep_range([]) is None
    assert p.infer_rep_range([sess(1, (10, 15, "warmup"))]) is None


def test_fixed_target_progresses_like_a_range():
    lo = hi = p.infer_rep_range([sess(1, (85, 6), (85, 6), (85, 6), (85, 6))])[0]
    assert go([sess(3, (85, 6), (85, 6), (85, 6), (85, 6))], lo=lo, hi=hi, steps=None).code == "up"
    assert go([sess(3, (85, 6), (85, 6), (85, 6), (85, 5))], lo=lo, hi=hi, steps=None).code == "hold"


def test_infer_step_from_used_weights():
    leg_press = [sess(1, (300, 10), (325, 10), (350, 3)), sess(5, (300, 10), (325, 10), (350, 5))]
    assert p.infer_step(leg_press, 2.5) == 25
    assert p.infer_step([sess(1, (30, 8), (32.5, 8)), sess(5, (30, 8), (35, 8))], 5) == 2.5   # 2.5 twice, 5 once
    assert p.infer_step([sess(1, (30, 8), (30, 8))], 2.5) == 2.5          # one weight only -> default
    assert p.infer_step([], 2.5) == 2.5
    assert p.infer_step([sess(1, (30, 8), (30.2, 8))], 2.5) == 2.5        # tiny differences are noise
    assert p.infer_step([sess(1, (0, 8), (5, 8))], 2.5) == 2.5            # bodyweight 0 is not a step


# --- texts --------------------------------------------------------------------------------------

@pytest.mark.parametrize("lang", ["de", "en"])
def test_every_reason_code_has_a_text(lang):
    cases = [
        go([sess(3, (30, 12))]), go([sess(3, (30, 12)), sess(6, (30, 12))], "cut"), go([sess(3, (30, 10))]),
        go([sess(3, (30, 10))], "cut"), go([sess(3, (30, 5)), sess(6, (30, 5))]),
        go([sess(3, (30, 5))], "cut"), go([sess(3, (30, 5), (30, 5), (30, 5))], "cut",
                                          settings=Settings(cut_drop_set_first=True)),
        go([sess(20, (30, 10))]), go([sess(3, (27.5, 10))], steps=[20, 25, 30]),
        go([sess(3, (35, 12))]), go([sess(3, (20, 5)), sess(6, (20, 5))]),
    ]
    assert {c.code for c in cases} == set(p.TEXTS[lang])
    for c in cases:
        text = p.describe(c, lang)
        assert text and "{" not in text


def test_describe_content():
    t = go([sess(3, (30, 12), (30, 12))])
    assert "32.5 kg" in p.describe(t, "de") and "32.5 kg" in p.describe(t, "en")
    assert p.describe(t, "fr") == p.describe(t, "en")          # unknown language -> English


def test_expand_steps_stack_with_addon_weight():
    assert p.expand_steps({"min": 7, "max": 21, "step": 7, "extra": 2.5}) == [7, 9.5, 14, 16.5, 21, 23.5]
    assert p.expand_steps({"values": [10, 20], "extra": 2.5}) == [10, 12.5, 20, 22.5]
    assert p.expand_steps({"min": 7, "max": 14, "step": 7, "extra": 0}) == [7, 14]


def test_expand_steps_plate_loaded():
    # sled 100 kg, plates on both sides, smallest plate 2.5 -> steps of 5 kg
    assert p.expand_steps({"base": 100, "plates": [25, 10, 2.5], "max": 120}) == [100, 105, 110, 115, 120]
    assert p.expand_steps({"base": 20, "plates": [1.25, 5], "sides": 1, "max": 22.5}) == [20, 21.25, 22.5]
    assert len(p.expand_steps({"base": 0, "plates": [5]})) == 41           # default: 40 steps above the base
    assert p.expand_steps({"base": 100, "plates": [], "max": 200}) is None
    assert p.expand_steps({"base": 100, "plates": [2.5], "max": 50}) is None
    assert p.expand_steps({"base": 0, "plates": [0.001], "max": 100}) is None
