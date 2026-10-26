import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.environ.get("MYDIET_DB", "/data/mydiet.db")

DEFAULT_MEALS = ("Frühstück", "Mittagessen", "Abendessen", "Snacks")

SCHEMA = """
CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  kcal REAL NOT NULL,      -- per 100 g
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fat REAL NOT NULL DEFAULT 0,
  serving_g REAL NOT NULL DEFAULT 100,
  category TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0   -- hidden on days without entries
);
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  day TEXT NOT NULL,       -- YYYY-MM-DD
  meal_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grams REAL NOT NULL,
  kcal REAL NOT NULL,      -- totals for this entry
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS entries_day ON entries(owner, day);
CREATE TABLE IF NOT EXISTS goals (
  owner TEXT PRIMARY KEY,
  kcal REAL NOT NULL,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fat REAL NOT NULL DEFAULT 0,
  target_weight REAL
);
CREATE TABLE IF NOT EXISTS weights (
  owner TEXT NOT NULL,
  day TEXT NOT NULL,
  kg REAL NOT NULL,
  PRIMARY KEY (owner, day)
);
CREATE TABLE IF NOT EXISTS saved_meals (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  min_scale REAL NOT NULL DEFAULT 0,      -- meal suggestions: smallest / largest factor (0 = default range)
  max_scale REAL NOT NULL DEFAULT 0,
  shared INTEGER NOT NULL DEFAULT 0       -- v1.15: offered in the household library
);
CREATE TABLE IF NOT EXISTS saved_meal_items (
  id INTEGER PRIMARY KEY,
  saved_meal_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grams REAL NOT NULL,
  kcal REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  mode TEXT NOT NULL DEFAULT 'scale',     -- suggestions: 'scale' (follows the meal factor) | 'fixed'
  tol REAL NOT NULL DEFAULT 0,            -- allowed deviation from the ratio in percent
  pack_g REAL NOT NULL DEFAULT 0,         -- fixed items: package size (1 or 2 packages), 0 = exactly the stored amount
  step_g REAL NOT NULL DEFAULT 0,         -- rounding step in grams, 0 = automatic
  pack_min INTEGER NOT NULL DEFAULT 1,    -- fixed items with a package: a suggestion uses between pack_min and pack_max packages
  pack_max INTEGER NOT NULL DEFAULT 2
);
CREATE TABLE IF NOT EXISTS suggest_addons (   -- foods that go with any meal (nuts ...): suggestions may add them
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  food_id INTEGER NOT NULL,
  min_g REAL NOT NULL DEFAULT 0,
  max_g REAL NOT NULL DEFAULT 30,
  step_g REAL NOT NULL DEFAULT 5
);
CREATE TABLE IF NOT EXISTS prefs (
  owner TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (owner, key)
);
CREATE TABLE IF NOT EXISTS triggers (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  kind TEXT NOT NULL,           -- 'state' | 'calendar'
  entity TEXT NOT NULL,         -- HA entity id
  match TEXT NOT NULL DEFAULT '',  -- state value / calendar title substring
  meal_id INTEGER NOT NULL,     -- diary meal the item is added to
  saved_meal_id INTEGER,        -- what to add: a saved meal ...
  food_id INTEGER,              -- ... or a food
  grams REAL,
  enabled INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS meal_triggers (   -- show a diary meal only when the rule applies
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  meal_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  entity TEXT NOT NULL,
  match TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS meal_trigger_log (meal_trigger_id INTEGER NOT NULL, day TEXT NOT NULL,
  PRIMARY KEY (meal_trigger_id, day));
CREATE TABLE IF NOT EXISTS day_flags (        -- days whose empty meals are hidden (totals-only imports)
  owner TEXT NOT NULL,
  day TEXT NOT NULL,
  PRIMARY KEY (owner, day)
);
CREATE TABLE IF NOT EXISTS saved_meal_uses (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  saved_meal_id INTEGER NOT NULL,
  meal_id INTEGER
);
CREATE TABLE IF NOT EXISTS goal_weekdays (    -- optional per-weekday goals (0 = Monday)
  owner TEXT NOT NULL,
  wd INTEGER NOT NULL,
  kcal REAL NOT NULL,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fat REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (owner, wd)
);
CREATE TABLE IF NOT EXISTS food_portions (    -- "1 slice = 30 g", "1 can = 330 g"
  id INTEGER PRIMARY KEY,
  food_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grams REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS goal_profiles (    -- named goal sets (training day, rest day ...), switched by triggers
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  kcal REAL NOT NULL,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fat REAL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS day_profile (      -- which profile applies on a day
  owner TEXT NOT NULL,
  day TEXT NOT NULL,
  profile_id INTEGER NOT NULL,
  PRIMARY KEY (owner, day)
);
CREATE TABLE IF NOT EXISTS day_notes (        -- free text per day (meal_id 0) or per meal
  owner TEXT NOT NULL,
  day TEXT NOT NULL,
  meal_id INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  PRIMARY KEY (owner, day, meal_id)
);
CREATE TABLE IF NOT EXISTS recipes (          -- optional: ingredients + portions, mirrored into a food
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  portions REAL NOT NULL DEFAULT 1,
  cooked_g REAL,
  category TEXT NOT NULL DEFAULT '',
  food_id INTEGER,
  source TEXT NOT NULL DEFAULT '',          -- v1.1: page the recipe was imported from
  instructions TEXT NOT NULL DEFAULT '',    -- v1.1: preparation steps, one per line
  shared INTEGER NOT NULL DEFAULT 0         -- v1.15: offered in the household library
);
CREATE TABLE IF NOT EXISTS recipe_items (
  id INTEGER PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grams REAL NOT NULL,
  kcal REAL NOT NULL,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fat REAL NOT NULL DEFAULT 0,
  fiber REAL NOT NULL DEFAULT 0,
  sugar REAL NOT NULL DEFAULT 0,
  salt REAL NOT NULL DEFAULT 0,
  sat_fat REAL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS body_measures (    -- optional: waist, chest, arm ... (cm, %)
  owner TEXT NOT NULL,
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  value REAL NOT NULL,
  PRIMARY KEY (owner, day, name)
);
CREATE TABLE IF NOT EXISTS body_photos (      -- progress photos; the files live in <data>/photos/<id>.img
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  day TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  mime TEXT NOT NULL DEFAULT 'image/jpeg'
);
CREATE TABLE IF NOT EXISTS trackers (         -- optional: water, caffeine, creatine ...
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  goal REAL,
  step REAL NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tracker_log (
  tracker_id INTEGER NOT NULL,
  day TEXT NOT NULL,
  amount REAL NOT NULL,
  PRIMARY KEY (tracker_id, day)
);
CREATE TABLE IF NOT EXISTS trigger_runs (     -- what a trigger entered, so it can be undone
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  trigger_id INTEGER,
  label TEXT NOT NULL DEFAULT '',
  day TEXT NOT NULL,
  ts TEXT NOT NULL,
  entry_ids TEXT NOT NULL DEFAULT '[]',
  undone INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS trigger_log (
  trigger_id INTEGER NOT NULL,
  day TEXT NOT NULL,
  PRIMARY KEY (trigger_id, day)
);
CREATE TABLE IF NOT EXISTS lookup_cache (     -- cached answers of online food databases
  key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  fetched TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS activity_days (    -- optional: steps / active kcal per day (from HA sensors or typed in)
  owner TEXT NOT NULL,
  day TEXT NOT NULL,
  steps REAL NOT NULL DEFAULT 0,
  kcal REAL NOT NULL DEFAULT 0,
  manual INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (owner, day)
);
"""


@contextmanager
def conn():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    try:
        yield c
        c.commit()
    finally:
        c.close()


MICROS = ("fiber", "sugar", "salt", "sat_fat")


def _cols(c, table: str) -> set:
    return {r["name"] for r in c.execute(f"PRAGMA table_info({table})")}


def _add(c, table: str, col: str, ddl: str):
    if col not in _cols(c, table):
        c.execute(f"ALTER TABLE {table} ADD COLUMN {col} {ddl}")


def _m1_legacy(c):
    """Everything up to v0.26 (formerly one column check after the other); idempotent."""
    _add(c, "foods", "category", "TEXT NOT NULL DEFAULT ''")
    _add(c, "meals", "archived", "INTEGER NOT NULL DEFAULT 0")
    _add(c, "triggers", "days_ahead", "INTEGER NOT NULL DEFAULT 0")
    for t in ("triggers", "meal_triggers"):
        _add(c, t, "negate", "INTEGER NOT NULL DEFAULT 0")        # v0.5: "does NOT match" conditions
        _add(c, t, "part", "TEXT NOT NULL DEFAULT 'any'")         # v0.9: start/end day of a calendar event
    for col, ddl in (("hold_min", "INTEGER NOT NULL DEFAULT 0"), ("win_from", "TEXT NOT NULL DEFAULT ''"),
                     ("win_to", "TEXT NOT NULL DEFAULT ''"),      # v0.11: hold time and time window
                     ("extra", "TEXT NOT NULL DEFAULT '[]'"), ("combine", "TEXT NOT NULL DEFAULT 'and'"),
                     ("profile_id", "INTEGER"),                   # v0.16: several conditions, goal-profile action
                     ("paused_until", "TEXT NOT NULL DEFAULT ''")):  # v0.15: pause a trigger
        _add(c, "triggers", col, ddl)
    _add(c, "trigger_runs", "profile_id", "INTEGER")
    _add(c, "foods", "favorite", "INTEGER NOT NULL DEFAULT 0")   # v0.11
    _add(c, "entries", "time", "TEXT")                           # HH:MM, time-based diary
    for t in ("foods", "entries", "saved_meal_items"):           # v0.15: optional micronutrients
        for col in MICROS:
            _add(c, t, col, "REAL NOT NULL DEFAULT 0")


def _m2_v1(c):
    """v1.0: barcode on foods, meal time windows, indexes for large diaries."""
    _add(c, "foods", "barcode", "TEXT NOT NULL DEFAULT ''")
    _add(c, "meals", "from_time", "TEXT NOT NULL DEFAULT ''")
    _add(c, "meals", "to_time", "TEXT NOT NULL DEFAULT ''")
    for ddl in ("CREATE INDEX IF NOT EXISTS foods_owner_name ON foods(owner, name COLLATE NOCASE)",
                "CREATE INDEX IF NOT EXISTS foods_owner_barcode ON foods(owner, barcode)",
                "CREATE INDEX IF NOT EXISTS entries_owner_meal ON entries(owner, meal_id)",
                "CREATE INDEX IF NOT EXISTS entries_owner_name ON entries(owner, name)",
                "CREATE INDEX IF NOT EXISTS meals_owner ON meals(owner, position)",
                "CREATE INDEX IF NOT EXISTS saved_meals_owner ON saved_meals(owner)",
                "CREATE INDEX IF NOT EXISTS saved_items_meal ON saved_meal_items(saved_meal_id)",
                "CREATE INDEX IF NOT EXISTS portions_food ON food_portions(food_id)",
                "CREATE INDEX IF NOT EXISTS recipe_items_recipe ON recipe_items(recipe_id)",
                "CREATE INDEX IF NOT EXISTS weights_day ON weights(owner, day)",
                "CREATE INDEX IF NOT EXISTS triggers_owner ON triggers(owner)"):
        c.execute(ddl)


# Append new migrations here; never edit or reorder old ones. The database stores how many have run (PRAGMA user_version).
def _m3_v11(c):
    """v1.1: recipe source and instructions (website import), foods shared live within the household."""
    _add(c, "recipes", "source", "TEXT NOT NULL DEFAULT ''")
    _add(c, "recipes", "instructions", "TEXT NOT NULL DEFAULT ''")
    _add(c, "foods", "shared", "INTEGER NOT NULL DEFAULT 0")
    c.execute("CREATE INDEX IF NOT EXISTS foods_shared ON foods(shared)")


def _m4_v17(c):
    """v1.7: meal suggestions (ingredient modes and ranges, factor range, add-on foods)."""
    _add(c, "saved_meals", "min_scale", "REAL NOT NULL DEFAULT 0")
    _add(c, "saved_meals", "max_scale", "REAL NOT NULL DEFAULT 0")
    _add(c, "saved_meal_items", "mode", "TEXT NOT NULL DEFAULT 'scale'")
    _add(c, "saved_meal_items", "tol", "REAL NOT NULL DEFAULT 0")
    _add(c, "saved_meal_items", "pack_g", "REAL NOT NULL DEFAULT 0")
    _add(c, "saved_meal_items", "step_g", "REAL NOT NULL DEFAULT 0")
    c.execute("CREATE INDEX IF NOT EXISTS suggest_addons_owner ON suggest_addons(owner)")


def _m5_v171(c):
    """v1.7.1: fixed ingredients with a package can be limited to a single package."""
    _add(c, "saved_meal_items", "pack_max", "INTEGER NOT NULL DEFAULT 2")


def _m6_v176(c):
    """v1.7.6: number of packages of a fixed ingredient is a range (pack_min to pack_max), not just 1 or 2."""
    _add(c, "saved_meal_items", "pack_min", "INTEGER NOT NULL DEFAULT 1")


def _m7_v115(c):
    """v1.15: saved meals and recipes can be offered in the household library like foods."""
    _add(c, "saved_meals", "shared", "INTEGER NOT NULL DEFAULT 0")
    _add(c, "recipes", "shared", "INTEGER NOT NULL DEFAULT 0")
    c.execute("CREATE INDEX IF NOT EXISTS saved_meals_shared ON saved_meals(shared)")
    c.execute("CREATE INDEX IF NOT EXISTS recipes_shared ON recipes(shared)")


MIGRATIONS = (_m1_legacy, _m2_v1, _m3_v11, _m4_v17, _m5_v171, _m6_v176, _m7_v115)


def init():
    existed = os.path.exists(DB_PATH)
    with conn() as c:
        had_data = existed and c.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='entries'").fetchone() is not None
        c.executescript(SCHEMA)
        done = c.execute("PRAGMA user_version").fetchone()[0]
        todo = MIGRATIONS[done:]
        if todo and had_data:   # keep a copy before upgrading a database that already holds data
            try:
                import shutil
                shutil.copyfile(DB_PATH, f"{DB_PATH}.v{done}.bak")
            except OSError:
                pass
        for m in todo:
            m(c)
        if todo:
            c.execute(f"PRAGMA user_version = {len(MIGRATIONS)}")


def schema_version() -> int:
    with conn() as c:
        return c.execute("PRAGMA user_version").fetchone()[0]


def ensure_meals(c, owner: str):
    if c.execute("SELECT 1 FROM meals WHERE owner=?", (owner,)).fetchone():
        return
    c.executemany("INSERT INTO meals(owner,name,position) VALUES(?,?,?)",
                  [(owner, n, i) for i, n in enumerate(DEFAULT_MEALS)])


def cache_get(key: str, max_age_days: int):
    """Cached online lookups (Open Food Facts, USDA). Product data is public, so one cache serves all users."""
    from datetime import datetime, timedelta
    with conn() as c:
        r = c.execute("SELECT payload, fetched FROM lookup_cache WHERE key=?", (key,)).fetchone()
    if not r or datetime.fromisoformat(r["fetched"]) < datetime.now() - timedelta(days=max_age_days):
        return None
    import json
    return json.loads(r["payload"])


def cache_put(key: str, payload):
    import json
    from datetime import datetime
    with conn() as c:
        c.execute("INSERT OR REPLACE INTO lookup_cache(key,payload,fetched) VALUES(?,?,?)",
                  (key, json.dumps(payload, ensure_ascii=False), datetime.now().isoformat(timespec="seconds")))


def cache_stats() -> dict:
    with conn() as c:
        r = c.execute("SELECT COUNT(*) n, COALESCE(SUM(LENGTH(payload)),0) b FROM lookup_cache").fetchone()
    return {"entries": r["n"], "bytes": r["b"]}


def cache_clear():
    with conn() as c:
        c.execute("DELETE FROM lookup_cache")
