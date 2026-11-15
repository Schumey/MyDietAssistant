"""Moving over from the HAFS integration: read its database (/config/hafs/hafs.db, read-only) and take over every user.

The HA app sees Home Assistant's config folder at /homeassistant (`map: homeassistant_config`, read-only); older setups
mount it at /config. HAFS_LEGACY_DB overrides the path. The integration used the same owner ids (HA user ids) as the app,
so every user's data lands in their own account. Taking over replaces the training data that user already has in the app.
"""
from __future__ import annotations

import os
import sqlite3
from contextlib import closing

from extras import features, set_pref

from training.core import db as tdb, sync

CANDIDATES = ("/homeassistant/hafs/hafs.db", "/config/hafs/hafs.db")


def path() -> str | None:
    for p in ([os.environ["HAFS_LEGACY_DB"]] if os.environ.get("HAFS_LEGACY_DB") else []) + list(CANDIDATES):
        if os.path.isfile(p):
            return p
    return None


def _open(p: str) -> sqlite3.Connection:
    conn = sqlite3.connect(f"file:{p}?mode=ro", uri=True, timeout=10)   # never written: HA may still have it open
    conn.row_factory = sqlite3.Row
    return conn


def exports() -> dict[str, dict]:
    """owner -> export (`export_all` format) of every user in the integration's database. Raises ValueError."""
    p = path()
    if p is None:
        raise ValueError("no database of the HAFS integration found (/config/hafs/hafs.db)")
    with closing(_open(p)) as conn:
        version = conn.execute("PRAGMA user_version").fetchone()[0]
        if version > tdb.SCHEMA_VERSION:
            raise ValueError(f"the integration's database has schema {version}, this version knows {tdb.SCHEMA_VERSION}: update first")
        if version < 1:
            raise ValueError("the integration's database is empty")
        present = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        owners: set[str] = set()
        for t in sync.EXPORT_TABLES:
            if t in present:
                owners |= {r[0] for r in conn.execute(f"SELECT DISTINCT owner FROM {t}")}
        return {o: {"schema_version": version,
                    "tables": {t: [dict(r) for r in conn.execute(f"SELECT * FROM {t} WHERE owner=?", (o,))] for t in sync.EXPORT_TABLES if t in present}}
                for o in sorted(owners)}


def preview(store, names: dict[str, str]) -> dict:
    """Users found in the integration with what they bring and what they already have in the app."""
    p = path()
    if p is None:
        return {"found": False, "path": None, "users": []}
    users = []
    for owner, data in exports().items():
        users.append({"user_id": owner, "name": names.get(owner) or owner[:8], **sync.export_summary(data), "in_app": store.has_data(owner)})
    return {"found": True, "path": p, "users": users}


def take_over(store, owners: list[str] | None) -> dict:
    """Restore the given users (all when None) from the integration and switch training on for them."""
    found = exports()
    chosen = [o for o in found if owners is None or o in owners]
    out = {}
    for owner in chosen:
        res = store.restore(owner, found[owner])
        out[owner] = {"restored": res["restored"], "skipped": res["skipped"]}
        if not features(owner).get("training"):
            on = features(owner)
            on["training"] = True
            set_pref(owner, "features", on)
    return {"users": out}
