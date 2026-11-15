"""Offline sync: idempotent upserts and cursor-based pulls.

Clients create UUIDs themselves and push whole records. The server keeps the
record with the newer `updated_at` (last writer wins; records are mostly
append-only so conflicts are rare). Every query is limited to one `owner`.
"""
from __future__ import annotations

import sqlite3
from typing import Any

# Tables that take part in the sync (all have id, owner, updated_at, deleted).
SYNC_TABLES = (
    "exercise", "gym", "equipment", "exercise_equipment", "program", "routine",
    "routine_exercise", "workout", "workout_set", "target",
)
EXPORT_TABLES = SYNC_TABLES + ("pref",)
MAX_PUSH = 5000
DEFAULT_PULL_LIMIT = 2000
_RESERVED = {"owner"}  # set by the server, never taken from the client


def _columns(conn: sqlite3.Connection, table: str) -> list[sqlite3.Row]:
    return conn.execute(f"PRAGMA table_info({table})").fetchall()


MAX_PHOTO = 300_000  # characters of the data URL (a 640 px JPEG is about 50 to 100 KB, base64 adds a third)


def _photo_problem(photo: Any) -> str | None:
    """Equipment photos are small images stored as data URLs in `equipment.photo`; anything else is refused."""
    if photo in (None, ""):
        return None
    if not isinstance(photo, str) or not photo.startswith("data:image/"):
        return "photo must be an image data URL"
    if len(photo) > MAX_PHOTO:
        return "photo too large"
    return None


def push(conn: sqlite3.Connection, owner: str, records: dict[str, list[dict[str, Any]]]) -> dict:
    """Upsert records per table. Returns {"applied": n, "skipped": n, "rejected": [...]}.

    `skipped` are records the server already has in a newer version.
    `rejected` are invalid records (unknown table, missing fields, constraint errors).
    """
    total = sum(len(v) for v in records.values())
    if total > MAX_PUSH:
        raise ValueError(f"too many records in one push (max {MAX_PUSH})")
    applied = skipped = 0
    rejected: list[dict] = []
    with conn:
        for table, rows in records.items():
            if table not in SYNC_TABLES:
                rejected.extend({"table": table, "id": r.get("id"), "reason": "unknown table"} for r in rows)
                continue
            cols = [c["name"] for c in _columns(conn, table)]
            required = {c["name"] for c in _columns(conn, table) if c["notnull"] and c["dflt_value"] is None}
            for r in rows:
                rid = r.get("id")
                data = {k: v for k, v in r.items() if k in cols and k not in _RESERVED}
                missing = (required - {"owner"}) - data.keys()
                if not isinstance(rid, str) or not rid or not data.get("updated_at") or missing:
                    reason = "missing " + ", ".join(sorted(missing | ({"id"} if not rid else set())
                                                           | ({"updated_at"} if not data.get("updated_at") else set())))
                    rejected.append({"table": table, "id": rid, "reason": reason})
                    continue
                if table == "equipment" and (bad := _photo_problem(data.get("photo"))):
                    rejected.append({"table": table, "id": rid, "reason": bad})
                    continue
                data["owner"] = owner
                names = list(data)
                updates = ", ".join(f"{n}=excluded.{n}" for n in names if n not in ("id", "owner"))
                sql = (
                    f"INSERT INTO {table}({', '.join(names)}) VALUES ({', '.join('?' * len(names))}) "
                    f"ON CONFLICT(id) DO UPDATE SET {updates} "
                    f"WHERE {table}.owner = excluded.owner AND excluded.updated_at >= {table}.updated_at"
                )
                before = conn.total_changes
                try:
                    conn.execute(sql, [data[n] for n in names])
                except sqlite3.IntegrityError as e:
                    rejected.append({"table": table, "id": rid, "reason": str(e)})
                    continue
                if conn.total_changes > before:
                    applied += 1
                else:
                    skipped += 1
    return {"applied": applied, "skipped": skipped, "rejected": rejected}


def pull(conn: sqlite3.Connection, owner: str, cursors: dict[str, dict] | None = None,
         limit: int = DEFAULT_PULL_LIMIT) -> dict:
    """Records changed after the given per-table cursors ({"at": updated_at, "id": id}).

    Returns {"records": {table: [...]}, "cursors": {table: {...}}, "more": bool}.
    Call again with the returned cursors while `more` is true.
    """
    cursors = dict(cursors or {})
    records: dict[str, list[dict]] = {}
    more = False
    for table in SYNC_TABLES:
        cur = cursors.get(table) or {"at": "", "id": ""}
        rows = conn.execute(
            f"SELECT * FROM {table} WHERE owner = ? AND (updated_at, id) > (?, ?) "
            f"ORDER BY updated_at, id LIMIT ?",
            (owner, cur["at"], cur["id"], limit + 1),
        ).fetchall()
        if len(rows) > limit:
            more = True
            rows = rows[:limit]
        records[table] = [dict(r) for r in rows]
        if rows:
            cursors[table] = {"at": rows[-1]["updated_at"], "id": rows[-1]["id"]}
    return {"records": records, "cursors": cursors, "more": more}


def export_all(conn: sqlite3.Connection, owner: str) -> dict:
    """Everything of one owner as plain data (restore format)."""
    version = conn.execute("PRAGMA user_version").fetchone()[0]
    tables = {t: [dict(r) for r in conn.execute(f"SELECT * FROM {t} WHERE owner = ?", (owner,))]
              for t in EXPORT_TABLES}
    return {"schema_version": version, "tables": tables}


def check_export(data: Any) -> dict:
    """Validate an export (`export_all` format) and return its tables; raises ValueError."""
    if not isinstance(data, dict) or not isinstance(data.get("tables"), dict) or not isinstance(data.get("schema_version"), int):
        raise ValueError("not a HAFS export (schema_version and tables expected)")
    from .db import SCHEMA_VERSION
    if data["schema_version"] > SCHEMA_VERSION:
        raise ValueError(f"export has schema {data['schema_version']}, this version knows {SCHEMA_VERSION}: update first")
    tables = data["tables"]
    for t, rows in tables.items():
        if t not in EXPORT_TABLES or not isinstance(rows, list) or not all(isinstance(r, dict) for r in rows):
            raise ValueError(f"unexpected table {t} in the export")
    return tables


def export_summary(data: Any) -> dict:
    """Counts shown before a restore: workouts, sets, exercises of one's own, programs, first and last workout."""
    tables = check_export(data)
    live = lambda t: [r for r in tables.get(t, []) if not r.get("deleted")]   # noqa: E731
    starts = sorted(str(w.get("started_at") or "") for w in live("workout") if w.get("started_at"))
    return {"workouts": len(live("workout")), "sets": len(live("workout_set")), "programs": len(live("program")),
            "gyms": len(live("gym")), "first": starts[0][:10] if starts else None, "last": starts[-1][:10] if starts else None}


def restore(conn: sqlite3.Connection, owner: str, data: Any) -> dict:
    """Replace ALL training data of [owner] with an export (own backup, the integration's database or another
    installation). Rows keep their ids; the owner is always [owner]. Columns the export lacks get their defaults, columns
    this schema does not know are dropped. A row whose id belongs to another user is skipped (ids are global).
    Returns {"restored": {table: n}, "skipped": n}."""
    tables = check_export(data)
    restored: dict[str, int] = {}
    skipped = 0
    with conn:
        for t in EXPORT_TABLES:
            conn.execute(f"DELETE FROM {t} WHERE owner = ?", (owner,))
        for t in EXPORT_TABLES:
            cols = {c["name"] for c in _columns(conn, t)}
            n = 0
            for r in tables.get(t, []):
                row = {k: v for k, v in r.items() if k in cols}
                row["owner"] = owner
                if t == "equipment" and _photo_problem(row.get("photo")):
                    row["photo"] = ""
                names = list(row)
                conflict = "ON CONFLICT(owner, key) DO UPDATE SET value=excluded.value" if t == "pref" else "ON CONFLICT(id) DO NOTHING"
                try:
                    cur = conn.execute(f"INSERT INTO {t}({', '.join(names)}) VALUES ({', '.join('?' * len(names))}) {conflict}",
                                       [row[k] for k in names])
                except sqlite3.IntegrityError:
                    skipped += 1
                    continue
                if cur.rowcount:
                    n += 1
                else:
                    skipped += 1
            restored[t] = n
    return {"restored": restored, "skipped": skipped}
