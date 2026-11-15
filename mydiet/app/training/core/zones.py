"""Which of the user's gyms they are at, from the Home Assistant person state (pure functions)."""

from __future__ import annotations

import sqlite3


def zone_entity(person_state: str, zones: dict[str, str]) -> str | None:
    """Zone entity id for a person state: "home" is zone.home, a zone's name maps through [zones] (name -> entity id);
    "not_home", unknown and unavailable give None."""
    if person_state == "home":
        return "zone.home"
    if person_state in ("not_home", "unknown", "unavailable", ""):
        return None
    return zones.get(person_state)


def gym_for_zone(conn: sqlite3.Connection, owner: str, zone: str | None) -> dict | None:
    """The gym of the user that has this zone entity id in its `zone` field."""
    if not zone:
        return None
    row = conn.execute("SELECT id, name FROM gym WHERE owner=? AND deleted=0 AND lower(zone)=lower(?) LIMIT 1", (owner, zone.strip())).fetchone()
    return {"gym_id": row["id"], "gym": row["name"]} if row else None
