import sqlite3

from core import db


def test_migration_4_adds_warmup_columns_and_keeps_existing_rows():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    for i in range(3):                                   # a database as it is in Home Assistant today (schema 3)
        conn.executescript("BEGIN;\n" + db.MIGRATIONS[i] + f"\nPRAGMA user_version = {i + 1};\nCOMMIT;")
    conn.execute("INSERT INTO routine_exercise(id, owner, updated_at, routine_id, exercise_id, rest_s) VALUES ('x1','u','t','r','e',90)")
    assert db.migrate(conn) == db.SCHEMA_VERSION >= 4
    row = conn.execute("SELECT * FROM routine_exercise WHERE id='x1'").fetchone()
    assert row["rest_s"] == 90 and (row["warmup_sets"], row["warmup_reps"], row["warmup_pct"]) == (None, None, None)


def test_migration_5_adds_the_attachment_column_with_an_empty_default():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    for i in range(4):
        conn.executescript("BEGIN;\n" + db.MIGRATIONS[i] + f"\nPRAGMA user_version = {i + 1};\nCOMMIT;")
    conn.execute("INSERT INTO workout_set(id, owner, updated_at, workout_id, exercise_id, done_at) VALUES ('s1','u','t','w','e','d')")
    assert db.migrate(conn) == db.SCHEMA_VERSION >= 5
    assert conn.execute("SELECT attachment FROM workout_set WHERE id='s1'").fetchone()[0] == ""
