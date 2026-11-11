"""Weight suggestions: double progression, shifted by the nutrition phase.

Pure functions, no I/O. Input: the last sessions of one exercise (on one
piece of equipment), the rep range, the phase and the equipment's weight
steps. Output: the next target (weight, reps, optionally a set count) with a
reason code that clients render in their own language (`describe` renders
German or English).

Rules (see CLAUDE.md, section 3):
  up    the working sets reach the top of the rep range -> one step more,
        reps back to the bottom of the range
  hold  reps inside the range -> same weight, aim for one more rep
  down  the working sets fall below the bottom of the range -> one step less
The phase decides how often "up" must be reached in a row and how often "down"
must happen in a row (defaults below). After a break of `break_days` or more
the weight goes one step down. A different piece of equipment snaps the last
weight to the nearest step instead of taking it over blindly.

"Working weight" of a session = the weight used by the most working sets (a tie
goes to the heavier weight). Warm-up sets, drop sets and sets without
repetitions do not count.
"""
from __future__ import annotations

import json
from collections import Counter
from dataclasses import dataclass, field
from datetime import date
from typing import Any

PHASES = ("bulk", "maintain", "cut")
_WORK_KINDS = ("work", "failure")


@dataclass(frozen=True)
class Settings:
    break_days: int = 14
    default_step: float = 2.5          # used when the equipment has no step list
    hit_fraction: float = 1.0          # share of working sets that must reach the top of the range
    miss_fraction: float = 0.5         # share of working sets below the bottom that counts as "missed"
    up_streak: dict = field(default_factory=lambda: {"bulk": 1, "maintain": 1, "cut": 2})
    down_streak: dict = field(default_factory=lambda: {"bulk": 2, "maintain": 2, "cut": 1})
    cut_drop_set_first: bool = False   # in a cut remove a set before lowering the weight
    min_sets: int = 2                  # never remove sets below this number


DEFAULT_SETTINGS = Settings()


@dataclass(frozen=True)
class SetRec:
    weight: float | None
    reps: int | None
    kind: str = "work"


@dataclass(frozen=True)
class Session:
    day: date
    sets: tuple[SetRec, ...]


@dataclass(frozen=True)
class Target:
    weight: float
    reps: int
    code: str                       # reason code, see TEXTS
    params: dict[str, Any] = field(default_factory=dict)
    sets: int | None = None         # only set when the number of sets should change


# --- weight steps -----------------------------------------------------------

MAX_STEPS = 2000


def _expand_plates(spec: dict) -> list[float] | None:
    """Plate-loaded machine: sled/lever weight `base` plus plates. With the plates on both sides (`sides` 2, the default)
    the smallest change is two of the smallest plate; `max` (default: 40 such steps above `base`) limits the load."""
    try:
        base = float(spec.get("base") or 0)
        plates = [float(x) for x in spec["plates"] if float(x) > 0]
        sides = 1 if spec.get("sides") == 1 else 2
        unit = sides * min(plates)
        hi = float(spec["max"]) if spec.get("max") else base + 40 * unit
    except (TypeError, ValueError, KeyError):
        return None
    if base < 0 or not plates or hi < base or (hi - base) / unit > MAX_STEPS:
        return None
    n = int(round((hi - base) / unit))
    return [round(base + i * unit, 4) for i in range(n + 1)]


def expand_steps(spec: Any) -> list[float] | None:
    """Equipment steps -> sorted list of weights, or None when unknown.

    Accepts a list of numbers, {"min", "max", "step"} or the JSON text of either, and two machine forms:
    stack-loaded with an optional add-on weight ({"min", "max", "step", "extra"} or {"values": [...], "extra"}: every pin
    position, with and without the add-on) and plate-loaded ({"base", "plates", "sides", "max"})."""
    if spec in (None, "", []):
        return None
    if isinstance(spec, str):
        try:
            spec = json.loads(spec)
        except ValueError:
            return None
    if isinstance(spec, dict):
        if "plates" in spec:
            return _expand_plates(spec)
        if isinstance(spec.get("values"), list):
            grid = sorted({round(float(v), 4) for v in spec["values"]})
        else:
            lo, hi, step = spec.get("min"), spec.get("max"), spec.get("step")
            if lo is None or hi is None or not step or step <= 0 or hi < lo:
                return None
            n = int(round((hi - lo) / step))
            grid = [round(lo + i * step, 4) for i in range(n + 1)]
        extra = spec.get("extra")
        if extra and extra > 0 and grid:
            grid = sorted(set(grid) | {round(v + extra, 4) for v in grid})
        return grid or None
    if isinstance(spec, (list, tuple)):
        values = sorted({round(float(v), 4) for v in spec})
        return values or None
    return None


def snap(weight: float, steps: list[float] | None) -> float:
    """Nearest available weight (the lower one on a tie)."""
    if not steps:
        return weight
    return min(steps, key=lambda s: (abs(s - weight), s))


def step_up(weight: float, steps: list[float] | None, default: float) -> float | None:
    """Next heavier weight; None when already at the top of the equipment."""
    if not steps:
        return round(weight + default, 4)
    heavier = [s for s in steps if s > weight + 1e-9]
    return heavier[0] if heavier else None


def step_down(weight: float, steps: list[float] | None, default: float) -> float:
    """Next lighter weight (stays at the lowest weight, never below 0)."""
    if not steps:
        return max(0.0, round(weight - default, 4))
    lighter = [s for s in steps if s < weight - 1e-9]
    return lighter[-1] if lighter else steps[0]


# --- reading a session --------------------------------------------------------

def working_sets(session: Session) -> list[SetRec]:
    return [s for s in session.sets if s.kind in _WORK_KINDS and s.reps and s.reps > 0]


def working_weight(session: Session) -> float | None:
    sets = working_sets(session)
    if not sets:
        return None
    counts = Counter(round(s.weight or 0.0, 2) for s in sets)
    top = max(counts.values())
    return max(w for w, c in counts.items() if c == top)


def _at_weight(session: Session, weight: float) -> list[SetRec]:
    return [s for s in working_sets(session) if round(s.weight or 0.0, 2) == weight]


def _is_hit(sets: list[SetRec], reps_max: int, target_sets: int | None, st: Settings) -> bool:
    if target_sets and len(sets) < target_sets:
        return False
    reached = sum(1 for s in sets if s.reps >= reps_max)
    return reached >= max(1, -(-len(sets) * st.hit_fraction // 1))  # ceil


def _is_miss(sets: list[SetRec], reps_min: int, st: Settings) -> bool:
    below = sum(1 for s in sets if s.reps < reps_min)
    return below > 0 and below >= len(sets) * st.miss_fraction


# --- the suggestion --------------------------------------------------------------

def infer_rep_range(sessions: list[Session], last: int = 5) -> tuple[int, int] | None:
    """Rep target for exercises without a routine: the most common best set of the
    last sessions, as a fixed target (min = max)."""
    best = []
    for s in sorted(sessions, key=lambda x: x.day, reverse=True)[:last]:
        sets = working_sets(s)
        if sets:
            best.append(max(x.reps for x in sets))
    if not best:
        return None
    top = Counter(best).most_common()
    target = max(r for r, c in top if c == top[0][1])
    return target, target


def infer_step(sessions: list[Session], default: float) -> float:
    """Step size for equipment without a step list: the most common difference
    between neighbouring weights that were actually used (a tie goes to the
    smaller one). Falls back to `default` with fewer than two distinct weights."""
    weights = sorted({round(s.weight or 0.0, 2) for sess in sessions for s in working_sets(sess)} - {0.0})
    diffs = Counter(round(b - a, 2) for a, b in zip(weights, weights[1:]) if b - a >= 0.5)
    if not diffs:
        return default
    top = max(diffs.values())
    return min(d for d, c in diffs.items() if c == top)


def suggest(
    sessions: list[Session],
    reps_min: int,
    reps_max: int,
    phase: str | None,
    today: date,
    steps: list[float] | None = None,
    settings: Settings = DEFAULT_SETTINGS,
    target_sets: int | None = None,
    foreign: bool = False,
) -> Target | None:
    """Next target for one exercise. `sessions` = past sessions on this equipment
    (any order); with `foreign=True` they come from other equipment and the last
    weight is only snapped to `steps`. None when there is nothing to build on."""
    if reps_min > reps_max:
        reps_min, reps_max = reps_max, reps_min
    ordered = sorted((s for s in sessions if working_weight(s) is not None), key=lambda s: s.day, reverse=True)
    if not ordered:
        return None
    phase = phase if phase in PHASES else "maintain"
    last = ordered[0]
    weight = working_weight(last)
    sets = _at_weight(last, weight)

    if foreign:
        new = snap(weight, steps)
        return Target(new, reps_min, "device_change", {"from": weight, "weight": new})

    # Weight not on the equipment's steps (equipment changed or steps edited): snap.
    on_steps = snap(weight, steps)
    if steps and abs(on_steps - weight) > 1e-9:
        return Target(on_steps, reps_min, "device_change", {"from": weight, "weight": on_steps})

    days = (today - last.day).days
    if days >= settings.break_days:
        new = step_down(weight, steps, settings.default_step)
        return Target(new, reps_min, "break", {"days": days, "from": weight, "weight": new})

    # Streaks of sessions at the same working weight, newest first.
    hits = misses = 0
    counting_hits = counting_misses = True
    for s in ordered:
        if working_weight(s) != weight:
            break
        at = _at_weight(s, weight)
        hit, miss = _is_hit(at, reps_max, target_sets, settings), _is_miss(at, reps_min, settings)
        counting_hits = counting_hits and hit
        counting_misses = counting_misses and miss
        hits += counting_hits
        misses += counting_misses
        if not counting_hits and not counting_misses:
            break

    need_up = settings.up_streak.get(phase, 1)
    need_down = settings.down_streak.get(phase, 2)
    n = len(sets)

    if hits >= need_up:
        new = step_up(weight, steps, settings.default_step)
        if new is None:
            return Target(weight, reps_max, "at_max", {"weight": weight, "reps_max": reps_max})
        restore = target_sets if target_sets and n < target_sets else None
        code = "up_cut" if phase == "cut" else "up"
        return Target(new, reps_min, code, {"from": weight, "weight": new, "reps_max": reps_max, "streak": hits},
                      restore)

    if misses >= need_down:
        if phase == "cut" and settings.cut_drop_set_first and n > settings.min_sets:
            return Target(weight, reps_min, "cut_drop_set", {"weight": weight, "sets": n - 1, "reps_min": reps_min, "streak": misses}, n - 1)
        new = step_down(weight, steps, settings.default_step)
        if new < weight - 1e-9:
            code = "down_cut" if phase == "cut" else "down"
            return Target(new, reps_min, code, {"from": weight, "weight": new, "reps_min": reps_min, "streak": misses})
        return Target(weight, reps_min, "at_min", {"weight": weight, "reps_min": reps_min})

    lowest = min(s.reps for s in sets)
    reps = min(reps_max, max(reps_min, lowest + 1))
    code = "hold_cut" if phase == "cut" else "hold"
    return Target(weight, reps, code, {"weight": weight, "reps": reps, "reps_min": reps_min, "reps_max": reps_max,
                                       "hits": hits, "need_up": need_up})


# --- texts -----------------------------------------------------------------------------

def _kg(x: float) -> str:
    return f"{x:g}"


TEXTS: dict[str, dict[str, str]] = {
    "de": {
        "up": "Obere Grenze ({reps_max} Wdh.) erreicht → eine Stufe mehr: {weight} kg",
        "up_cut": "Diät: obere Grenze ({reps_max} Wdh.) {streak}× in Folge erreicht → eine Stufe mehr: {weight} kg",
        "hold": "Im Bereich {reps_min}–{reps_max} Wdh. → Gewicht halten, Ziel {reps} Wdh.",
        "hold_cut": "Diät: Gewicht {weight} kg halten, Ziel {reps} Wdh. (erst {need_up}× obere Grenze, dann steigern)",
        "down": "Unter {reps_min} Wdh. → eine Stufe weniger: {weight} kg",
        "down_cut": "Diät: unter {reps_min} Wdh. → eine Stufe weniger: {weight} kg",
        "cut_drop_set": "Diät: unter {reps_min} Wdh. → erst einen Satz streichen ({sets} Sätze), Gewicht halten",
        "break": "{days} Tage Pause → eine Stufe weniger: {weight} kg",
        "device_change": "Anderes Gerät oder neue Stufen → nächstliegendes Gewicht: {weight} kg (zuletzt {from} kg)",
        "at_max": "Höchstes Gewicht des Geräts erreicht → mehr Wiederholungen ({reps_max})",
        "at_min": "Niedrigstes Gewicht des Geräts erreicht → Wiederholungen steigern",
    },
    "en": {
        "up": "Top of the range ({reps_max} reps) reached → one step up: {weight} kg",
        "up_cut": "Cut: top of the range ({reps_max} reps) reached {streak}× in a row → one step up: {weight} kg",
        "hold": "Within {reps_min}–{reps_max} reps → keep the weight, aim for {reps} reps",
        "hold_cut": "Cut: keep {weight} kg, aim for {reps} reps (top of the range {need_up}× first, then increase)",
        "down": "Below {reps_min} reps → one step down: {weight} kg",
        "down_cut": "Cut: below {reps_min} reps → one step down: {weight} kg",
        "cut_drop_set": "Cut: below {reps_min} reps → drop a set first ({sets} sets), keep the weight",
        "break": "{days} days off → one step down: {weight} kg",
        "device_change": "Different equipment or new steps → nearest weight: {weight} kg (last {from} kg)",
        "at_max": "Heaviest weight of the equipment reached → more reps ({reps_max})",
        "at_min": "Lightest weight of the equipment reached → build reps",
    },
}


def describe(target: Target, lang: str = "de") -> str:
    table = TEXTS.get(lang, TEXTS["en"])
    p = {k: (_kg(v) if isinstance(v, float) else v) for k, v in {**target.params, "reps": target.reps}.items()}
    return table[target.code].format(**p)
