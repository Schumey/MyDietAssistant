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
  serving_g REAL NOT NULL DEFAULT 100
);
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL
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


def init():
    with conn() as c:
        c.executescript(SCHEMA)


def ensure_meals(c, owner: str):
    if c.execute("SELECT 1 FROM meals WHERE owner=?", (owner,)).fetchone():
        return
    c.executemany("INSERT INTO meals(owner,name,position) VALUES(?,?,?)",
                  [(owner, n, i) for i, n in enumerate(DEFAULT_MEALS)])
