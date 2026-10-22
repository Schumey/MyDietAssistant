"""Shared test setup: one temporary database for the whole run, one fresh user per test."""
import itertools
import os
import sys
import tempfile

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ["MYDIET_DB"] = os.path.join(tempfile.mkdtemp(prefix="mda-test-"), "test.db")
sys.path.insert(0, os.path.join(ROOT, "mydiet", "app"))

import main  # noqa: E402  (needs MYDIET_DB and sys.path from above)
from fastapi.testclient import TestClient  # noqa: E402

_ids = itertools.count(1)


@pytest.fixture(scope="session")
def app_module():
    return main


@pytest.fixture
def user():
    """Factory: a test client that acts as a new Home Assistant user (X-Remote-User-Id)."""
    def make(name: str | None = None, feature: tuple = ()):
        uid = f"user{next(_ids)}"
        c = TestClient(main.app)
        c.headers.update({"X-Remote-User-Id": uid, "X-Remote-User-Display-Name": name or uid})
        c.uid = uid
        c.get("/api/me")   # registers the user
        if feature:
            c.put("/api/settings", json={"features": {f: True for f in feature}})
        return c
    return make


@pytest.fixture
def me(user):
    return user("Tester")


def add_food(c, name="Haferflocken", kcal=370, protein=13, carbs=60, fat=7, **kw):
    r = c.post("/api/foods", json={"name": name, "kcal": kcal, "protein": protein, "carbs": carbs, "fat": fat, **kw})
    assert r.status_code == 200, r.text
    return r.json()["id"]


def meal_ids(c, day="2026-01-05"):
    return [m["id"] for m in c.get(f"/api/day/{day}").json()["meals"]]
