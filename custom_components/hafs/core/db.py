"""SQLite schema and numbered migrations (PRAGMA user_version).

Rules: append new migrations at the END of MIGRATIONS, never edit old ones.
Every record has a client-generated UUID `id`, an `owner`, `updated_at`
(UTC ISO) and `deleted` (tombstone for sync). Weights are kg.
Timestamps of imported/recorded sets are local wall-clock ISO strings.
"""
from __future__ import annotations

import sqlite3

_COMMON = "id TEXT PRIMARY KEY, owner TEXT NOT NULL, updated_at TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0"

MIGRATIONS: list[str] = [
    # 1: initial schema
    f"""
    CREATE TABLE exercise (
      {_COMMON},
      name TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'strength',      -- strength | bodyweight | time | cardio
      muscles_primary TEXT NOT NULL DEFAULT '',
      muscles_secondary TEXT NOT NULL DEFAULT '',
      equipment_type TEXT NOT NULL DEFAULT '',
      unilateral INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT ''
    );
    CREATE UNIQUE INDEX exercise_name ON exercise(owner, name) WHERE deleted = 0;
    CREATE TABLE gym (
      {_COMMON},
      name TEXT NOT NULL,
      zone TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE equipment (
      {_COMMON},
      gym_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '',
      steps TEXT NOT NULL DEFAULT '',             -- JSON: list of weights or {{min,max,step}}
      base_weight REAL NOT NULL DEFAULT 0,
      cable_ratio REAL NOT NULL DEFAULT 1,
      settings TEXT NOT NULL DEFAULT '',
      photo TEXT NOT NULL DEFAULT '',
      out_of_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE exercise_equipment (
      {_COMMON},
      exercise_id TEXT NOT NULL,
      equipment_id TEXT NOT NULL
    );
    CREATE TABLE program (
      {_COMMON},
      name TEXT NOT NULL,
      rhythm TEXT NOT NULL DEFAULT '',
      origin TEXT NOT NULL DEFAULT 'own'          -- own | template | ai | import
    );
    CREATE TABLE routine (
      {_COMMON},
      program_id TEXT,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE routine_exercise (
      {_COMMON},
      routine_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      target_sets INTEGER,
      reps_min INTEGER,
      reps_max INTEGER,
      rest_s INTEGER,
      superset_group TEXT NOT NULL DEFAULT '',
      equipment_id TEXT
    );
    CREATE TABLE workout (
      {_COMMON},
      started_at TEXT NOT NULL,
      ended_at TEXT,
      gym_id TEXT,
      routine_id TEXT,
      routine_name TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      phase TEXT NOT NULL DEFAULT '',             -- snapshot: bulk | maintain | cut | ''
      feeling INTEGER,
      source TEXT NOT NULL DEFAULT ''             -- '' | gymrun
    );
    CREATE INDEX workout_started ON workout(owner, started_at);
    CREATE TABLE workout_set (
      {_COMMON},
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      equipment_id TEXT,
      set_no INTEGER,
      weight REAL,
      reps INTEGER,
      duration_s INTEGER,
      distance_m REAL,
      kind TEXT NOT NULL DEFAULT 'work',          -- warmup | work | drop | failure
      rir REAL,
      target_weight REAL,
      target_reps INTEGER,
      note TEXT NOT NULL DEFAULT '',
      done_at TEXT NOT NULL
    );
    CREATE INDEX workout_set_workout ON workout_set(workout_id);
    CREATE INDEX workout_set_exercise ON workout_set(owner, exercise_id, done_at);
    CREATE TABLE target (
      {_COMMON},
      exercise_id TEXT NOT NULL,
      equipment_id TEXT NOT NULL DEFAULT '',
      weight REAL,
      reps INTEGER,
      reason TEXT NOT NULL DEFAULT ''
    );
    CREATE UNIQUE INDEX target_key ON target(owner, exercise_id, equipment_id);
    CREATE TABLE pref (
      owner TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (owner, key)
    );
    """,
    # 2: link exercises to the built-in catalog
    """
    ALTER TABLE exercise ADD COLUMN catalog_key TEXT NOT NULL DEFAULT '';
    CREATE INDEX exercise_catalog ON exercise(owner, catalog_key) WHERE catalog_key != '';
    """,
    # 3: structured reason and set count for suggested targets
    """
    ALTER TABLE target ADD COLUMN sets INTEGER;
    ALTER TABLE target ADD COLUMN reason_code TEXT NOT NULL DEFAULT '';
    ALTER TABLE target ADD COLUMN reason_params TEXT NOT NULL DEFAULT '';
    """,
    # 4: warm-up sets of a planned exercise (count, reps, weight as percent of the working weight)
    """
    ALTER TABLE routine_exercise ADD COLUMN warmup_sets INTEGER;
    ALTER TABLE routine_exercise ADD COLUMN warmup_reps INTEGER;
    ALTER TABLE routine_exercise ADD COLUMN warmup_pct REAL;
    """,
]

SCHEMA_VERSION = len(MIGRATIONS)


def migrate(conn: sqlite3.Connection) -> int:
    """Apply missing migrations; returns the resulting schema version."""
    version = conn.execute("PRAGMA user_version").fetchone()[0]
    if version > SCHEMA_VERSION:
        raise RuntimeError(f"database schema {version} is newer than supported {SCHEMA_VERSION}")
    for i in range(version, SCHEMA_VERSION):
        conn.executescript("BEGIN;\n" + MIGRATIONS[i] + f"\nPRAGMA user_version = {i + 1};\nCOMMIT;")
    return SCHEMA_VERSION


def connect(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    migrate(conn)
    return conn
