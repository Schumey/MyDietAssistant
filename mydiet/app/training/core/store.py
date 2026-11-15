"""Thin synchronous facade over the database file. Each call opens its own
connection, so it is safe to run in an executor thread."""
from __future__ import annotations

import os
from contextlib import closing
from typing import Any

from . import aiplan, catalog, db, gymrun, importers, review as review_mod, status, sync, targets, webview, zones


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
        return self.push_ex(owner, records)[0]

    def push_ex(self, owner: str, records: dict[str, list[dict[str, Any]]]) -> tuple[dict, list[dict]]:
        """Like `push`, plus the events (workout started / finished / record) this push caused."""
        with self._conn() as conn:
            ids = [r["id"] for r in records.get("workout", []) if isinstance(r.get("id"), str)]
            before = status.workout_ids(conn, owner, ids)
            result = sync.push(conn, owner, records)
            if not result["applied"]:
                return result, []
            self._stamp_phase(conn, owner, ids)
            # New sets change the suggestions of exactly these exercises.
            touched = {r["exercise_id"] for r in records.get("workout_set", []) if r.get("exercise_id")}
            if touched:
                result["targets"] = targets.recompute(conn, owner, list(touched))
            events: list[dict] = []
            after = status.workout_ids(conn, owner, ids)
            for wid, ended in after.items():
                if wid not in before:
                    stats = status.workout_stats(conn, owner, wid)
                    events.append({"event": "workout_started", "data": {"workout_id": wid, "started_at": stats["started_at"],
                                                                           "routine": stats["routine"]}})
                if ended and not before.get(wid):
                    stats = status.workout_stats(conn, owner, wid)
                    events.append({"event": "workout_finished", "data": stats})
                    for rec in status.records_in(conn, owner, wid):
                        events.append({"event": "record", "data": rec})
            return result, events

    @staticmethod
    def _stamp_phase(conn, owner: str, ids: list[str]) -> None:
        """Remember the nutrition phase on workouts that have none (snapshot at the time of training)."""
        if not ids:
            return
        phase = targets._phase(conn, owner)
        if not phase:
            return
        q = ",".join("?" * len(ids))
        with conn:
            conn.execute(f"UPDATE workout SET phase=? WHERE owner=? AND phase='' AND source='' AND id IN ({q})",
                         (phase, owner, *ids))

    def status(self, owner: str, now=None, tz=None) -> dict:
        with self._conn() as conn:
            return status.status(conn, owner, now, tz)

    def recent_workouts(self, owner: str, days: int = 30, limit: int = 50) -> list[dict]:
        with self._conn() as conn:
            return status.recent_workouts(conn, owner, days, limit)

    def plan(self, owner: str, now=None) -> dict:
        with self._conn() as conn:
            return status.plan(conn, owner, now)

    def gym_for_zone(self, owner: str, zone: str | None) -> dict | None:
        with self._conn() as conn:
            return zones.gym_for_zone(conn, owner, zone)

    def plan_request(self, owner: str, days: int, minutes: int, goal: str, notes: str, lang: str) -> dict:
        """Instructions for the AI and the id -> name map needed to validate the answer."""
        with self._conn() as conn:
            exercises = aiplan.candidate_exercises(conn, owner)
            phase = targets.get_pref(conn, owner, "phase") or targets.get_pref(conn, owner, "phase_auto")
        return {"instructions": aiplan.build_instructions(days, minutes, goal, notes, phase, exercises, lang),
                "known": {e["id"]: e["name"] for e in exercises}}

    def review(self, owner: str, now, tz, lang: str = "de") -> dict:
        """Stagnating exercises and neglected muscle groups, with the prompt for the optional AI summary."""
        local = now.astimezone(tz) if tz else now
        with self._conn() as conn:
            phase = targets.get_pref(conn, owner, "phase") or targets.get_pref(conn, owner, "phase_auto")
            data = review_mod.review(conn, owner, local.date(), webview.muscle_weeks(conn, owner, local.date(), 16), phase)
        data["instructions"] = review_mod.build_instructions(data["stagnating"], data["neglected"], phase, lang)
        return data

    def web_query(self, owner: str, q: str, params: dict | None = None, now=None, tz=None) -> dict:
        """One read-only view for the web panel (see `core/webview.py`)."""
        with self._conn() as conn:
            return webview.run(conn, owner, q, params, now, tz)

    def owners(self) -> list[str]:
        with self._conn() as conn:
            return [r[0] for r in conn.execute("SELECT DISTINCT owner FROM workout WHERE deleted=0")]

    def set_auto_phase(self, owner: str, phase: str) -> bool:
        """Store the phase derived from MDA; recompute targets when it changed. Returns True if it changed."""
        with self._conn() as conn:
            if targets.get_pref(conn, owner, "phase_auto") == phase:
                return False
            targets.set_pref(conn, owner, "phase_auto", phase)
            targets.recompute(conn, owner)
            return True

    def recompute_targets(self, owner: str, today=None) -> dict:
        with self._conn() as conn:
            catalog.seed(conn, owner)
            return targets.recompute(conn, owner, today=today)

    def set_target(self, owner: str, exercise_id: str, weight: float) -> int:
        with self._conn() as conn:
            return targets.set_target(conn, owner, exercise_id, weight)

    def get_pref(self, owner: str, key: str) -> str:
        with self._conn() as conn:
            return targets.get_pref(conn, owner, key)

    def set_pref(self, owner: str, key: str, value: str) -> dict:
        """Store a preference; a new phase recomputes every target."""
        with self._conn() as conn:
            targets.set_pref(conn, owner, key, value)
            return targets.recompute(conn, owner) if key == "phase" or key in targets.SETTING_KEYS else {}

    def pull(self, owner: str, cursors: dict | None, limit: int) -> dict:
        with self._conn() as conn:
            catalog.seed(conn, owner)
            return sync.pull(conn, owner, cursors, limit)

    def export_all(self, owner: str) -> dict:
        with self._conn() as conn:
            catalog.seed(conn, owner)
            return sync.export_all(conn, owner)

    def restore(self, owner: str, data: dict) -> dict:
        """Replace all training data of [owner] with an export; targets are computed again afterwards."""
        with self._conn() as conn:
            out = sync.restore(conn, owner, data)
            catalog.seed(conn, owner)
            out["targets"] = targets.recompute(conn, owner)
            return out

    def has_data(self, owner: str) -> dict:
        """Workouts and programs of [owner] (to warn before a restore replaces them)."""
        with self._conn() as conn:
            return {"workouts": conn.execute("SELECT COUNT(*) FROM workout WHERE owner=? AND deleted=0", (owner,)).fetchone()[0],
                    "programs": conn.execute("SELECT COUNT(*) FROM program WHERE owner=? AND deleted=0", (owner,)).fetchone()[0]}

    def import_gymrun(self, owner: str, text: str, dry_run: bool) -> dict:
        """Import a workout CSV; the format (GymRun, Strong, Hevy) is detected from the header."""
        fmt, res = importers.parse(text)
        out = {"summary": gymrun.summary(res), "format": fmt}
        if not dry_run:
            with self._conn() as conn:
                catalog.seed(conn, owner)
                mapping = importers.name_mapping(res.exercises, catalog.exercise_ids(conn, owner))
                out["added"] = gymrun.import_into(conn, owner, res, mapping, source=fmt)
                out["targets"] = targets.recompute(conn, owner)
        return out
