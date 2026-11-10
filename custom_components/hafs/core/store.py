"""Thin synchronous facade over the database file. Each call opens its own
connection, so it is safe to run in an executor thread."""
from __future__ import annotations

import os
from contextlib import closing
from typing import Any

from . import catalog, db, gymrun, sync


class Store:
    def __init__(self, path: str) -> None:
        self.path = path

    def init(self) -> int:
        os.makedirs(os.path.dirname(self.path) or ".", exist_ok=True)
        with closing(db.connect(self.path)) as conn:
            return db.migrate(conn)

    def _conn(self):
        return closing(db.connect(self.path))

    def info(self) -> dict:
        with self._conn() as conn:
            return {"schema_version": conn.execute("PRAGMA user_version").fetchone()[0]}

    def push(self, owner: str, records: dict[str, list[dict[str, Any]]]) -> dict:
        with self._conn() as conn:
            return sync.push(conn, owner, records)

    def pull(self, owner: str, cursors: dict | None, limit: int) -> dict:
        with self._conn() as conn:
            catalog.seed(conn, owner)
            return sync.pull(conn, owner, cursors, limit)

    def export_all(self, owner: str) -> dict:
        with self._conn() as conn:
            catalog.seed(conn, owner)
            return sync.export_all(conn, owner)

    def import_gymrun(self, owner: str, text: str, dry_run: bool) -> dict:
        res = gymrun.parse(text)
        out = {"summary": gymrun.summary(res)}
        if not dry_run:
            with self._conn() as conn:
                catalog.seed(conn, owner)
                out["added"] = gymrun.import_into(conn, owner, res, catalog.exercise_ids(conn, owner))
        return out
