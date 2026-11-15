"""Built-in exercise catalog (German names first, English for the UI).

The catalog is data, not code: add entries at will, but never change a `key`
(it is the stable identity of an exercise and is stored as `catalog_key`).
Bump CATALOG_VERSION whenever entries change so seeding runs again.

`aliases` are names from other apps (GymRun) that mean the same exercise; the
entry's own German name always matches too. Only merge variants that are
really the same movement on the same equipment: merging changes the history
the progression looks at.
"""
from __future__ import annotations

import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

CATALOG_VERSION = 1
_NS = uuid.UUID("0b8c4e1a-7a52-4d0f-9d57-2f4c9c3a6e21")

MUSCLES = {
    "chest": ("Brust", "Chest"),
    "lats": ("Latissimus", "Lats"),
    "upper_back": ("Oberer Rücken", "Upper back"),
    "lower_back": ("Unterer Rücken", "Lower back"),
    "traps": ("Trapezmuskel", "Traps"),
    "shoulders": ("Schultern", "Shoulders"),
    "rear_delts": ("Hintere Schulter", "Rear delts"),
    "biceps": ("Bizeps", "Biceps"),
    "triceps": ("Trizeps", "Triceps"),
    "forearms": ("Unterarme", "Forearms"),
    "abs": ("Bauch", "Abs"),
    "obliques": ("Seitliche Bauchmuskeln", "Obliques"),
    "quads": ("Oberschenkel vorn", "Quads"),
    "hamstrings": ("Oberschenkel hinten", "Hamstrings"),
    "glutes": ("Gesäß", "Glutes"),
    "adductors": ("Adduktoren", "Adductors"),
    "abductors": ("Abduktoren", "Abductors"),
    "calves": ("Waden", "Calves"),
    "hip_flexors": ("Hüftbeuger", "Hip flexors"),
}
EQUIPMENT_TYPES = ("machine", "cable", "barbell", "dumbbell", "bodyweight", "kettlebell", "band", "cardio", "other")
KINDS = ("strength", "bodyweight", "time", "cardio")


@dataclass(frozen=True)
class Entry:
    key: str
    de: str
    en: str
    kind: str
    primary: tuple[str, ...]
    secondary: tuple[str, ...]
    equipment: str
    unilateral: bool = False
    aliases: tuple[str, ...] = ()


def E(key, de, en, kind, primary, secondary, equipment, unilateral=False, aliases=()):
    return Entry(key, de, en, kind, tuple(primary.split()), tuple(secondary.split()), equipment,
                 bool(unilateral), tuple(aliases))


_S, _B, _T, _C = "strength", "bodyweight", "time", "cardio"

ENTRIES: tuple[Entry, ...] = (
    # --- Brust ---
    E("bench_press_barbell", "Flachbankdrücken Langhantel", "Barbell bench press", _S, "chest", "triceps shoulders", "barbell"),
    E("bench_press_machine", "Flachbankdrücken am Gerät", "Machine bench press", _S, "chest", "triceps shoulders", "machine"),
    E("chest_press_seated_machine", "Bankdrücken am Gerät (sitzend)", "Seated machine chest press", _S, "chest", "triceps shoulders", "machine"),
    E("chest_press_machine", "Brustpresse", "Chest press machine", _S, "chest", "triceps shoulders", "machine"),
    E("incline_press_barbell", "Schrägbankdrücken Langhantel (positiv)", "Incline barbell press", _S, "chest", "shoulders triceps", "barbell"),
    E("incline_press_dumbbell", "Schrägbankdrücken Kurzhantel (positiv)", "Incline dumbbell press", _S, "chest", "shoulders triceps", "dumbbell"),
    E("incline_press_machine", "Schrägbankdrücken am Gerät (positiv)", "Incline machine press", _S, "chest", "shoulders triceps", "machine"),
    E("decline_press_machine", "Schrägbankdrücken am Gerät (negativ)", "Decline machine press", _S, "chest", "triceps", "machine"),
    E("bench_press_dumbbell", "Flachbankdrücken Kurzhantel", "Dumbbell bench press", _S, "chest", "triceps shoulders", "dumbbell"),
    E("decline_press_barbell", "Negativbankdrücken Langhantel", "Decline barbell press", _S, "chest", "triceps", "barbell"),
    E("pec_fly_machine", "Butterflys am Gerät (sitzend)", "Pec deck fly", _S, "chest", "shoulders", "machine"),
    E("chest_fly_dumbbell", "Fliegende Kurzhantel", "Dumbbell fly", _S, "chest", "shoulders", "dumbbell"),
    E("cable_crossover", "Kabelzug-Fliegende (Cable Crossover)", "Cable crossover", _S, "chest", "shoulders", "cable"),
    E("push_up", "Liegestütze", "Push-up", _B, "chest", "triceps shoulders abs", "bodyweight"),
    E("dips", "Dips", "Dips", _B, "chest triceps", "shoulders", "bodyweight"),
    # --- Rücken ---
    E("lat_pulldown_machine", "Latziehen am Gerät (sitzend)", "Lat pulldown machine", _S, "lats", "biceps upper_back", "machine"),
    E("lat_pulldown_wide_cable", "Latziehen zur Brust am Kabelzug mit breitem Griff (sitzend)", "Wide-grip lat pulldown", _S, "lats", "biceps upper_back", "cable"),
    E("lat_pulldown_close_cable", "Latziehen zur Brust am Kabelzug mit engem Hammergriff (sitzend)", "Close neutral-grip lat pulldown", _S, "lats", "biceps upper_back", "cable"),
    E("lat_pulldown_underhand", "Latziehen mit Untergriff", "Underhand lat pulldown", _S, "lats", "biceps", "cable"),
    E("straight_arm_pulldown", "Latziehen mit geraden Armen", "Straight-arm pulldown", _S, "lats", "triceps", "cable"),
    E("pull_up_overhand", "Klimmzüge mit Obergriff", "Pull-up", _B, "lats", "biceps upper_back", "bodyweight"),
    E("chin_up", "Klimmzüge mit Untergriff", "Chin-up", _B, "lats biceps", "upper_back", "bodyweight"),
    E("row_seated_machine", "Rudern am Gerät (sitzend)", "Seated machine row", _S, "upper_back lats", "biceps rear_delts", "machine"),
    E("row_seated_cable", "Rudern am Seilzug (sitzend)", "Seated cable row", _S, "upper_back lats", "biceps rear_delts", "cable"),
    E("row_barbell_underhand", "Rudern Langhantel vorgebeugt mit Untergriff (stehend)", "Underhand barbell row", _S, "lats upper_back", "biceps lower_back", "barbell"),
    E("row_barbell_overhand", "Rudern Langhantel vorgebeugt mit Obergriff (stehend)", "Overhand barbell row", _S, "upper_back lats", "biceps lower_back rear_delts", "barbell"),
    E("row_tbar", "Rudern T-Bar", "T-bar row", _S, "upper_back lats", "biceps lower_back", "barbell"),
    E("row_dumbbell_one_arm", "Rudern einarmig Kurzhantel", "One-arm dumbbell row", _S, "lats upper_back", "biceps", "dumbbell", True),
    E("row_inverted", "Rudern am Reck (Inverted Row)", "Inverted row", _B, "upper_back lats", "biceps", "bodyweight"),
    E("face_pull", "Facepulls", "Face pull", _S, "rear_delts upper_back", "traps", "cable"),
    E("rear_delt_fly_machine", "Reverse Butterfly", "Reverse pec deck", _S, "rear_delts", "upper_back", "machine"),
    E("rear_delt_fly_dumbbell", "Reverse Flys Kurzhantel", "Dumbbell reverse fly", _S, "rear_delts", "upper_back", "dumbbell"),
    E("shrug_dumbbell", "Schulterheben Kurzhantel (stehend)", "Dumbbell shrug", _S, "traps", "forearms", "dumbbell"),
    E("shrug_barbell", "Schulterheben Langhantel (stehend)", "Barbell shrug", _S, "traps", "forearms", "barbell"),
    E("deadlift_barbell", "Kreuzheben Langhantel", "Barbell deadlift", _S, "lower_back glutes hamstrings", "quads traps forearms", "barbell"),
    E("deadlift_sumo", "Sumo-Kreuzheben", "Sumo deadlift", _S, "glutes quads adductors", "lower_back hamstrings", "barbell"),
    E("deadlift_romanian", "Rumänisches Kreuzheben", "Romanian deadlift", _S, "hamstrings glutes", "lower_back", "barbell"),
    E("deadlift_trap_bar", "Kreuzheben Trap-Bar", "Trap bar deadlift", _S, "quads glutes lower_back", "hamstrings traps", "barbell"),
    E("good_morning", "Good Morning", "Good morning", _S, "lower_back hamstrings", "glutes", "barbell"),
    E("back_extension_machine", "Hyperextensions am Gerät (sitzend)", "Back extension machine", _S, "lower_back", "glutes hamstrings", "machine",
      aliases=("Hyperextensions am Gerät",)),
    E("lower_back_machine", "Rückenstrecker", "Lower back machine", _S, "lower_back", "glutes", "machine"),
    E("back_extension_bench", "Hyperextensions Flachbank (Bauchlage)", "Back extension (flat bench)", _S, "lower_back", "glutes hamstrings", "other"),
    # --- Schultern ---
    E("shoulder_press_machine", "Schulterpresse", "Shoulder press machine", _S, "shoulders", "triceps", "machine"),
    E("shoulder_press_military_machine", "Schulterdrücken am Gerät, Military (sitzend)", "Military shoulder press machine", _S, "shoulders", "triceps", "machine"),
    E("shoulder_press_dumbbell_seated", "Schulterdrücken Kurzhantel (sitzend)", "Seated dumbbell shoulder press", _S, "shoulders", "triceps", "dumbbell"),
    E("shoulder_press_barbell", "Schulterdrücken Langhantel (stehend)", "Overhead press", _S, "shoulders", "triceps abs", "barbell"),
    E("shoulder_press_dumbbell_standing", "Schulterdrücken Kurzhantel (stehend)", "Standing dumbbell press", _S, "shoulders", "triceps abs", "dumbbell"),
    E("arnold_press", "Arnoldpress", "Arnold press", _S, "shoulders", "triceps", "dumbbell"),
    E("lateral_raise_dumbbell", "Seitheben Kurzhantel (stehend)", "Dumbbell lateral raise", _S, "shoulders", "traps", "dumbbell"),
    E("lateral_raise_machine", "Seitheben am Gerät", "Lateral raise machine", _S, "shoulders", "", "machine"),
    E("lateral_raise_cable", "Seitheben am Kabelzug", "Cable lateral raise", _S, "shoulders", "", "cable", True),
    E("front_raise_dumbbell", "Frontheben Kurzhantel", "Dumbbell front raise", _S, "shoulders", "chest", "dumbbell"),
    E("upright_row", "Aufrechtes Rudern", "Upright row", _S, "shoulders traps", "biceps", "barbell"),
    # --- Arme ---
    E("curl_biceps_dumbbell_seated", "Bizeps-Curls Kurzhantel (sitzend)", "Seated dumbbell curl", _S, "biceps", "forearms", "dumbbell"),
    E("curl_biceps_dumbbell_alt", "Bizeps-Curls Kurzhantel abwechselnd (stehend)", "Alternating dumbbell curl", _S, "biceps", "forearms", "dumbbell"),
    E("curl_biceps_barbell", "Bizeps-Curls Langhantel (stehend)", "Barbell curl", _S, "biceps", "forearms", "barbell"),
    E("curl_biceps_machine", "Bizeps-Curls am Gerät (sitzend)", "Machine biceps curl", _S, "biceps", "forearms", "machine",
      aliases=("Bizeps Dropsätze am Gerät",)),
    E("curl_biceps_cable", "Bizeps-Curls am Kabelzug (stehend)", "Cable biceps curl", _S, "biceps", "forearms", "cable"),
    E("biceps_machine", "Bizepsmaschine", "Biceps machine", _S, "biceps", "forearms", "machine"),
    E("curl_biceps_dropset", "Bizeps-Curls Dropsatz", "Biceps curl (drop sets)", _S, "biceps", "forearms", "cable"),
    E("curl_unspecified", "Curls", "Curls", _S, "biceps", "forearms", "other"),
    E("curl_hammer", "Hammercurls", "Hammer curl", _S, "biceps forearms", "", "dumbbell"),
    E("curl_incline_dumbbell", "Schrägbank-Curls Kurzhantel", "Incline dumbbell curl", _S, "biceps", "", "dumbbell"),
    E("curl_preacher", "Preacher-Curls", "Preacher curl", _S, "biceps", "", "barbell"),
    E("curl_ez_bar", "SZ-Stangen-Curls", "EZ-bar curl", _S, "biceps", "forearms", "barbell"),
    E("curl_concentration", "Konzentrationscurls", "Concentration curl", _S, "biceps", "", "dumbbell", True),
    E("curl_wrist", "Handgelenkcurls", "Wrist curl", _S, "forearms", "", "barbell"),
    E("triceps_pushdown_cable", "Trizepsdrücken am Kabelzug (stehend)", "Triceps pushdown", _S, "triceps", "", "cable"),
    E("triceps_pushdown_rope", "Trizepsdrücken am Kabelzug mit Seil (stehend)", "Rope triceps pushdown", _S, "triceps", "", "cable"),
    E("triceps_overhead_dumbbell", "Trizepsdrücken beidarmig Kurzhantel über Kopf (sitzend)", "Overhead dumbbell triceps extension", _S, "triceps", "", "dumbbell"),
    E("triceps_french_press_incline", "French Press Schrägbank KH", "Incline dumbbell french press", _S, "triceps", "", "dumbbell"),
    E("triceps_curl_dropset", "Trizeps-Curls Dropsatz", "Triceps extension (drop sets)", _S, "triceps", "", "cable"),
    E("triceps_skull_crusher", "French Press Langhantel (Skull Crusher)", "Skull crusher", _S, "triceps", "", "barbell"),
    E("triceps_overhead_cable", "Trizepsstrecken über Kopf am Kabelzug", "Overhead cable triceps extension", _S, "triceps", "", "cable"),
    E("triceps_kickback", "Trizeps-Kickbacks", "Triceps kickback", _S, "triceps", "", "dumbbell", True),
    E("triceps_bench_dips", "Bankdips", "Bench dips", _B, "triceps", "chest shoulders", "bodyweight"),
    E("bench_press_close_grip", "Enges Bankdrücken", "Close-grip bench press", _S, "triceps chest", "shoulders", "barbell"),
    # --- Beine ---
    E("leg_press_machine", "Beinpresse am Gerät", "Leg press", _S, "quads glutes", "hamstrings", "machine"),
    E("squat_barbell", "Kniebeuge Langhantel Schulterauflage (stehend)", "Barbell back squat", _S, "quads glutes", "hamstrings lower_back adductors", "barbell"),
    E("squat_machine", "Kniebeuge am Gerät (positiv)", "Machine squat", _S, "quads glutes", "hamstrings", "machine"),
    E("squat_front", "Frontkniebeuge", "Front squat", _S, "quads", "glutes abs", "barbell"),
    E("squat_goblet", "Goblet Squat", "Goblet squat", _S, "quads glutes", "abs", "dumbbell"),
    E("squat_hack_machine", "Hackenschmidt-Kniebeuge am Gerät", "Hack squat", _S, "quads", "glutes", "machine"),
    E("squat_bulgarian", "Bulgarian Split Squat", "Bulgarian split squat", _S, "quads glutes", "hamstrings", "dumbbell", True),
    E("lunge_dumbbell", "Ausfallschritte Kurzhantel", "Dumbbell lunge", _S, "quads glutes", "hamstrings", "dumbbell"),
    E("lunge_walking", "Gehende Ausfallschritte", "Walking lunge", _S, "quads glutes", "hamstrings", "dumbbell"),
    E("step_up", "Step-ups", "Step-up", _S, "quads glutes", "", "dumbbell", True),
    E("leg_extension_machine", "Beinstrecken am Gerät (sitzend)", "Leg extension", _S, "quads", "", "machine"),
    E("leg_curl_seated_machine", "Beinbeuger am Gerät (sitzend)", "Seated leg curl", _S, "hamstrings", "calves", "machine"),
    E("leg_curl_lying_machine", "Beinbeuger am Gerät (liegend)", "Lying leg curl", _S, "hamstrings", "calves", "machine"),
    E("hip_abduction_machine", "Abduktionsdrücken am Gerät (sitzend)", "Hip abduction machine", _S, "abductors glutes", "", "machine"),
    E("hip_adduction_machine", "Adduktorendrücken am Gerät (sitzend)", "Hip adduction machine", _S, "adductors", "", "machine"),
    E("hip_thrust_barbell", "Hip Thrust Langhantel", "Barbell hip thrust", _S, "glutes", "hamstrings", "barbell"),
    E("glute_bridge", "Glute Bridge", "Glute bridge", _B, "glutes", "hamstrings", "bodyweight"),
    E("glute_kickback_cable", "Glute Kickback am Kabelzug", "Cable glute kickback", _S, "glutes", "hamstrings", "cable", True),
    E("deadlift_stiff_dumbbell", "Gestrecktes Kreuzheben Kurzhantel", "Dumbbell stiff-leg deadlift", _S, "hamstrings glutes", "lower_back", "dumbbell"),
    E("calf_raise_seated_machine", "Wadenheben am Gerät (sitzend)", "Seated calf raise", _S, "calves", "", "machine"),
    E("calf_raise_barbell_standing", "Wadenheben Langhantel (stehend)", "Standing barbell calf raise", _S, "calves", "", "barbell"),
    E("calf_raise_standing_machine", "Wadenheben am Gerät (stehend)", "Standing calf raise machine", _S, "calves", "", "machine"),
    E("calf_raise_leg_press", "Wadenheben an der Beinpresse", "Leg press calf raise", _S, "calves", "", "machine"),
    # --- Bauch / Rumpf ---
    E("ab_crunch_machine", "Bauchpresse am Gerät (sitzend)", "Ab crunch machine", _S, "abs", "obliques", "machine",
      aliases=("Bauchpresse",)),
    E("ab_cable_crunch", "Bauchpresse am Seilzug (sitzend)", "Cable crunch", _S, "abs", "obliques", "cable"),
    E("crunch_decline", "Crunches (Schrägbank negativ)", "Decline crunch", _B, "abs", "", "bodyweight"),
    E("situp_decline", "Sit-ups (Schrägbank negativ)", "Decline sit-up", _B, "abs", "hip_flexors", "bodyweight"),
    E("situp_twist", "Sit-ups angewinkelte Beine mit Oberkörperdrehung", "Twisting sit-up", _B, "abs obliques", "", "bodyweight"),
    E("crunch_floor", "Crunches (Boden)", "Floor crunch", _B, "abs", "", "bodyweight"),
    E("crunch_bicycle", "Fahrrad-Crunches", "Bicycle crunch", _B, "abs obliques", "", "bodyweight"),
    E("crunch_side_machine", "Seitliche Crunches am Gerät", "Side crunch machine", _S, "obliques", "abs", "machine"),
    E("rotary_torso", "Rotary Torso", "Rotary torso machine", _S, "obliques", "abs", "machine"),
    E("rotary_torso_seated", "Rotary Torso sitzend", "Seated rotary torso machine", _S, "obliques", "abs", "machine"),
    E("trunk_twist", "Rumpfdrehen", "Trunk twist", _B, "obliques", "abs", "bodyweight"),
    E("russian_twist", "Russian Twists", "Russian twist", _S, "obliques abs", "", "dumbbell"),
    E("hanging_leg_raise", "Beinheben am Gerät (hängend)", "Captain's chair leg raise", _B, "abs", "hip_flexors", "bodyweight"),
    E("hanging_knee_raise", "Kniehebe hängend", "Hanging knee raise", _B, "abs", "hip_flexors", "bodyweight"),
    E("leg_raise_lying", "Beinheben liegend", "Lying leg raise", _B, "abs", "hip_flexors", "bodyweight"),
    E("ab_wheel", "Ab Wheel", "Ab wheel rollout", _B, "abs", "shoulders lats", "other"),
    E("woodchop_cable", "Cable Woodchop", "Cable woodchop", _S, "obliques", "abs shoulders", "cable"),
    E("pallof_press", "Pallof Press", "Pallof press", _S, "obliques abs", "", "cable", True),
    E("plank", "Planks", "Plank", _T, "abs", "shoulders glutes", "bodyweight"),
    E("plank_side", "Seitstütz", "Side plank", _T, "obliques", "abs", "bodyweight", True),
    E("dead_bug", "Dead Bug", "Dead bug", _B, "abs", "", "bodyweight"),
    E("wall_sit", "Wandsitzen", "Wall sit", _T, "quads", "glutes", "bodyweight"),
    # --- Ganzkörper / Sonstiges ---
    E("farmers_walk", "Farmer's Walk", "Farmer's walk", _T, "forearms traps", "abs glutes", "dumbbell"),
    E("kettlebell_swing", "Kettlebell Swing", "Kettlebell swing", _S, "glutes hamstrings", "lower_back shoulders", "kettlebell"),
    E("burpee", "Burpees", "Burpee", _B, "quads chest", "abs shoulders", "bodyweight"),
    # --- Cardio ---
    E("crosstrainer", "Crosstrainer", "Elliptical trainer", _C, "", "", "cardio"),
    E("ergometer", "Ergometer", "Exercise bike", _C, "", "", "cardio"),
    E("treadmill", "Laufband", "Treadmill", _C, "", "", "cardio"),
    E("running", "Laufen", "Running", _C, "", "", "cardio"),
    E("cycling", "Radfahren", "Cycling", _C, "", "", "cardio"),
    E("rowing_machine", "Rudergerät", "Rowing machine", _C, "", "", "cardio"),
    E("stair_climber", "Stepper", "Stair climber", _C, "", "", "cardio"),
    E("walking", "Gehen", "Walking", _C, "", "", "cardio"),
    E("swimming", "Schwimmen", "Swimming", _C, "", "", "cardio"),
    E("jump_rope", "Seilspringen", "Jump rope", _C, "", "", "cardio"),
)

_BY_KEY = {e.key: e for e in ENTRIES}


def _check() -> None:
    assert len(_BY_KEY) == len(ENTRIES), "duplicate catalog key"
    names: set[str] = set()
    for e in ENTRIES:
        assert e.kind in KINDS and e.equipment in EQUIPMENT_TYPES, e.key
        for m in e.primary + e.secondary:
            assert m in MUSCLES, (e.key, m)
        for n in (e.de, *e.aliases):
            assert n not in names, f"name used twice: {n}"
            names.add(n)


_check()


def alias_map() -> dict[str, str]:
    """Every known name (German name and aliases) -> catalog key."""
    out: dict[str, str] = {}
    for e in ENTRIES:
        for n in (e.de, *e.aliases):
            out[n] = e.key
    return out


def info() -> dict:
    """Catalog metadata for clients (labels, English names)."""
    return {
        "version": CATALOG_VERSION,
        "muscles": {k: {"de": v[0], "en": v[1]} for k, v in MUSCLES.items()},
        "equipment_types": list(EQUIPMENT_TYPES),
        "entries": [{"key": e.key, "de": e.de, "en": e.en} for e in ENTRIES],
    }


def _new_id(owner: str, key: str) -> str:
    return str(uuid.uuid5(_NS, f"{owner}|{key}"))


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def seed(conn: sqlite3.Connection, owner: str) -> dict:
    """Make sure the owner has an exercise row for every catalog entry and
    move history of alias names onto the canonical exercise. Idempotent; skipped
    when the stored catalog version is current. Returns counts."""
    done = conn.execute("SELECT value FROM pref WHERE owner=? AND key='catalog_version'", (owner,)).fetchone()
    if done and done[0] == str(CATALOG_VERSION):
        return {"skipped": True}
    now = _now()
    added = adopted = merged = 0
    with conn:
        by_key = {r["catalog_key"]: r["id"] for r in conn.execute(
            "SELECT id, catalog_key FROM exercise WHERE owner=? AND deleted=0 AND catalog_key!=''", (owner,))}
        by_name = {r["name"]: r["id"] for r in conn.execute(
            "SELECT id, name FROM exercise WHERE owner=? AND deleted=0 AND catalog_key=''", (owner,))}
        for e in ENTRIES:
            fields = (e.de, e.kind, " ".join(e.primary), " ".join(e.secondary), e.equipment, int(e.unilateral))
            if e.key in by_key:
                eid = by_key[e.key]
            elif e.de in by_name:
                eid = by_name.pop(e.de)
                conn.execute(
                    "UPDATE exercise SET catalog_key=?, kind=?, muscles_primary=?, muscles_secondary=?,"
                    " equipment_type=?, unilateral=?, updated_at=? WHERE id=?",
                    (e.key, e.kind, fields[2], fields[3], e.equipment, fields[5], now, eid))
                adopted += 1
            else:
                eid = _new_id(owner, e.key)
                conn.execute(
                    "INSERT INTO exercise(id, owner, updated_at, name, kind, muscles_primary, muscles_secondary,"
                    " equipment_type, unilateral, catalog_key) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (eid, owner, now, *fields[:2], fields[2], fields[3], e.equipment, fields[5], e.key))
                added += 1
            by_key[e.key] = eid
            for alias in e.aliases:
                old = by_name.pop(alias, None)
                if old:
                    _merge(conn, old, eid, now)
                    merged += 1
        conn.execute("INSERT INTO pref(owner,key,value) VALUES (?, 'catalog_version', ?)"
                     " ON CONFLICT(owner,key) DO UPDATE SET value=excluded.value", (owner, str(CATALOG_VERSION)))
    return {"added": added, "adopted": adopted, "merged": merged}


def _merge(conn: sqlite3.Connection, old: str, new: str, now: str) -> None:
    """Move everything that points at exercise `old` to `new`; tombstone `old`."""
    for table in ("workout_set", "routine_exercise", "exercise_equipment"):
        conn.execute(f"UPDATE {table} SET exercise_id=?, updated_at=? WHERE exercise_id=?", (new, now, old))
    # Suggested targets are recomputed from the history, so stale ones are dropped.
    conn.execute("DELETE FROM target WHERE exercise_id=?", (old,))
    conn.execute("UPDATE exercise SET deleted=1, updated_at=? WHERE id=?", (now, old))


def exercise_ids(conn: sqlite3.Connection, owner: str) -> dict[str, str]:
    """Known name (incl. aliases) -> the owner's exercise id, for importers."""
    keys = {r["catalog_key"]: r["id"] for r in conn.execute(
        "SELECT id, catalog_key FROM exercise WHERE owner=? AND deleted=0 AND catalog_key!=''", (owner,))}
    return {name: keys[key] for name, key in alias_map().items() if key in keys}
