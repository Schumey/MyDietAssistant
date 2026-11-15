import json

import pytest

from core import aiplan
from core.store import Store

KNOWN = {"e1": "Bankdrücken", "e2": "Rudern"}


def test_parse_draft_validates():
    text = "Hier der Plan:\n```json\n" + json.dumps({"days": [
        {"name": "Push", "exercises": [
            {"id": "e1", "sets": 9, "reps_min": 12, "reps_max": 5},   # clamped, range fixed
            {"id": "e1", "sets": 3},                                   # duplicate: dropped
            {"id": "ghost", "sets": 3},                                # unknown: dropped
            {"id": "e2", "sets": "x"},                                 # bad number: default
        ]},
        {"name": "Leer", "exercises": [{"id": "ghost"}]},              # nothing usable: dropped
    ]}) + "\n```"
    days = aiplan.parse_draft(text, KNOWN)
    assert [d["name"] for d in days] == ["Push"]
    a, b = days[0]["exercises"]
    assert (a["id"], a["name"], a["sets"], a["reps_min"], a["reps_max"]) == ("e1", "Bankdrücken", 6, 12, 12)
    assert (b["sets"], b["reps_min"], b["reps_max"]) == (3, 8, 12)


@pytest.mark.parametrize("bad", ["", "kein json", '{"days": 5}', '{"days": [{"exercises": []}]}', "{broken"])
def test_parse_draft_rejects(bad):
    with pytest.raises(ValueError):
        aiplan.parse_draft(bad, KNOWN)


def test_instructions_and_candidates(tmp_path):
    store = Store(str(tmp_path / "t.db"))
    store.init()
    t = "2026-11-01T10:00:00+00:00"
    store.push("u1", {"exercise": [
        {"id": "e1", "name": "Bank", "kind": "strength", "muscles_primary": "chest", "updated_at": t},
        {"id": "e2", "name": "Crosstrainer", "kind": "cardio", "updated_at": t}]})
    req = store.plan_request("u1", 3, 60, "Kraft", "Schulter schonen", "de")
    assert req["known"] == {"e1": "Bank"}                              # cardio is not offered
    assert "e1 | Bank | chest" in req["instructions"]
    assert "3 training days" in req["instructions"] and "Schulter schonen" in req["instructions"]
    assert "German" in req["instructions"]
