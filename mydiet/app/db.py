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
  category TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS saved_meal_items (
  id INTEGER PRIMARY KEY,
  saved_meal_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  grams REAL NOT NULL,
  kcal REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL
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


def init():
    with conn() as c:
        c.executescript(SCHEMA)
        cols = {r["name"] for r in c.execute("PRAGMA table_info(foods)")}
        if "archived" not in {r["name"] for r in c.execute("PRAGMA table_info(meals)")}:
            c.execute("ALTER TABLE meals ADD COLUMN archived INTEGER NOT NULL DEFAULT 0")
        if "days_ahead" not in {r["name"] for r in c.execute("PRAGMA table_info(triggers)")}:
            c.execute("ALTER TABLE triggers ADD COLUMN days_ahead INTEGER NOT NULL DEFAULT 0")
        for t in ("triggers", "meal_triggers"):  # v0.5: "does NOT match" conditions
            if "negate" not in {r["name"] for r in c.execute(f"PRAGMA table_info({t})")}:
                c.execute(f"ALTER TABLE {t} ADD COLUMN negate INTEGER NOT NULL DEFAULT 0")
        for t in ("triggers", "meal_triggers"):  # v0.9: calendar triggers on the start/end day of an event only
            if "part" not in {r["name"] for r in c.execute(f"PRAGMA table_info({t})")}:
                c.execute(f"ALTER TABLE {t} ADD COLUMN part TEXT NOT NULL DEFAULT 'any'")
        for col, ddl in (("hold_min", "INTEGER NOT NULL DEFAULT 0"), ("win_from", "TEXT NOT NULL DEFAULT ''"),
                         ("win_to", "TEXT NOT NULL DEFAULT ''")):  # v0.11: hold time and time window
            if col not in {r["name"] for r in c.execute("PRAGMA table_info(triggers)")}:
                c.execute(f"ALTER TABLE triggers ADD COLUMN {col} {ddl}")
        for col, ddl in (("extra", "TEXT NOT NULL DEFAULT '[]'"), ("combine", "TEXT NOT NULL DEFAULT 'and'"),
                         ("profile_id", "INTEGER")):  # v0.16: several conditions, goal-profile action
            if col not in {r["name"] for r in c.execute("PRAGMA table_info(triggers)")}:
                c.execute(f"ALTER TABLE triggers ADD COLUMN {col} {ddl}")
        if "profile_id" not in {r["name"] for r in c.execute("PRAGMA table_info(trigger_runs)")}:
            c.execute("ALTER TABLE trigger_runs ADD COLUMN profile_id INTEGER")
        if "paused_until" not in {r["name"] for r in c.execute("PRAGMA table_info(triggers)")}:  # v0.15: pause a trigger
            c.execute("ALTER TABLE triggers ADD COLUMN paused_until TEXT NOT NULL DEFAULT ''")
        if "favorite" not in cols:  # v0.11: favourite foods
            c.execute("ALTER TABLE foods ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0")
        if "time" not in {r["name"] for r in c.execute("PRAGMA table_info(entries)")}:
            c.execute("ALTER TABLE entries ADD COLUMN time TEXT")  # HH:MM, time-based diary
        for t in ("foods", "entries", "saved_meal_items"):  # v0.15: optional micronutrients (g per 100 g / absolute)
            have = {r["name"] for r in c.execute(f"PRAGMA table_info({t})")}
            for col in MICROS:
                if col not in have:
                    c.execute(f"ALTER TABLE {t} ADD COLUMN {col} REAL NOT NULL DEFAULT 0")
        if "category" not in cols:  # database from v0.2
            c.execute("ALTER TABLE foods ADD COLUMN category TEXT NOT NULL DEFAULT ''")


def ensure_meals(c, owner: str):
    if c.execute("SELECT 1 FROM meals WHERE owner=?", (owner,)).fetchone():
        return
    c.executemany("INSERT INTO meals(owner,name,position) VALUES(?,?,?)",
                  [(owner, n, i) for i, n in enumerate(DEFAULT_MEALS)])
