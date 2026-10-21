import json
import os
import re
from datetime import date

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import db

OPTIONS = {}
if os.path.exists("/data/options.json"):
    with open("/data/options.json") as f:
        OPTIONS = json.load(f)

SUPERVISOR_TOKEN = os.environ.get("SUPERVISOR_TOKEN")
MEALS = ("breakfast", "lunch", "dinner", "snack")
STATIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

app = FastAPI()
db.init()


def user_from(user_id: str | None) -> str:
    """HA ingress sets X-Remote-User-Id; fall back for local dev."""
    return user_id or "default"


class FoodIn(BaseModel):
    name: str
    brand: str = ""
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    serving_g: float = 100


class EntryIn(BaseModel):
    day: str
    meal: str
    food_id: int
    grams: float


class GoalIn(BaseModel):
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0


def check_day(day: str):
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day):
        raise HTTPException(400, "day must be YYYY-MM-DD")


def totals(owner: str, day: str) -> dict:
    with db.conn() as c:
        r = c.execute(
            "SELECT COALESCE(SUM(kcal),0) kcal, COALESCE(SUM(protein),0) protein,"
            " COALESCE(SUM(carbs),0) carbs, COALESCE(SUM(fat),0) fat"
            " FROM entries WHERE owner=? AND day=?", (owner, day)).fetchone()
    return {k: round(r[k], 1) for k in r.keys()}


def get_goal(owner: str) -> dict:
    with db.conn() as c:
        r = c.execute("SELECT * FROM goals WHERE owner=?", (owner,)).fetchone()
    if r:
        return {k: r[k] for k in ("kcal", "protein", "carbs", "fat")}
    return {"kcal": OPTIONS.get("default_kcal_goal", 2000), "protein": 0, "carbs": 0, "fat": 0}


def publish(owner: str, display: str):
    """Push today's totals into HA as sensor states (needs homeassistant_api)."""
    if not SUPERVISOR_TOKEN or not OPTIONS.get("publish_sensors", True):
        return
    slug = re.sub(r"[^a-z0-9]+", "_", display.lower()).strip("_") or "default"
    t = totals(owner, date.today().isoformat())
    for key, unit in (("kcal", "kcal"), ("protein", "g"), ("carbs", "g"), ("fat", "g")):
        try:
            httpx.post(
                f"http://supervisor/core/api/states/sensor.mydiet_{slug}_{key}_today",
                headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                json={"state": t[key], "attributes": {
                    "unit_of_measurement": unit,
                    "friendly_name": f"{display} {key} heute",
                    "state_class": "total",
                }}, timeout=5)
        except httpx.HTTPError:
            pass


@app.get("/api/me")
def me(x_remote_user_id: str | None = Header(None),
       x_remote_user_display_name: str | None = Header(None)):
    return {"id": user_from(x_remote_user_id), "name": x_remote_user_display_name or "Lokal"}


@app.get("/api/day/{day}")
def get_day(day: str, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        rows = [dict(r) for r in c.execute(
            "SELECT * FROM entries WHERE owner=? AND day=? ORDER BY id", (owner, day))]
    return {"entries": rows, "totals": totals(owner, day), "goal": get_goal(owner)}


@app.post("/api/entries")
def add_entry(e: EntryIn, x_remote_user_id: str | None = Header(None),
              x_remote_user_display_name: str | None = Header(None)):
    check_day(e.day)
    if e.meal not in MEALS:
        raise HTTPException(400, "bad meal")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        f = c.execute("SELECT * FROM foods WHERE id=? AND owner=?", (e.food_id, owner)).fetchone()
        if not f:
            raise HTTPException(404, "food not found")
        k = e.grams / 100
        c.execute(
            "INSERT INTO entries(owner,day,meal,name,grams,kcal,protein,carbs,fat)"
            " VALUES(?,?,?,?,?,?,?,?,?)",
            (owner, e.day, e.meal, f["name"], e.grams, f["kcal"] * k, f["protein"] * k,
             f["carbs"] * k, f["fat"] * k))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


@app.delete("/api/entries/{entry_id}")
def del_entry(entry_id: int, x_remote_user_id: str | None = Header(None),
              x_remote_user_display_name: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        c.execute("DELETE FROM entries WHERE id=? AND owner=?", (entry_id, owner))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


@app.get("/api/foods")
def list_foods(q: str = "", x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        rows = c.execute(
            "SELECT * FROM foods WHERE owner=? AND (name LIKE ? OR brand LIKE ?)"
            " ORDER BY name LIMIT 200", (owner, f"%{q}%", f"%{q}%"))
        return [dict(r) for r in rows]


@app.post("/api/foods")
def add_food(f: FoodIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        cur = c.execute(
            "INSERT INTO foods(owner,name,brand,kcal,protein,carbs,fat,serving_g)"
            " VALUES(?,?,?,?,?,?,?,?)",
            (owner, f.name, f.brand, f.kcal, f.protein, f.carbs, f.fat, f.serving_g))
        return {"id": cur.lastrowid}


@app.put("/api/goal")
def set_goal(g: GoalIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO goals(owner,kcal,protein,carbs,fat) VALUES(?,?,?,?,?)",
                  (owner, g.kcal, g.protein, g.carbs, g.fat))
    return {"ok": True}


@app.get("/api/off/barcode/{code}")
def off_barcode(code: str):
    """Look up a product on Open Food Facts (only call that needs internet)."""
    if not code.isdigit():
        raise HTTPException(400, "bad barcode")
    try:
        r = httpx.get(f"https://world.openfoodfacts.org/api/v2/product/{code}.json",
                      params={"fields": "product_name,brands,nutriments"}, timeout=10)
        p = r.json().get("product")
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, "Open Food Facts nicht erreichbar")
    if not p:
        raise HTTPException(404, "not found")
    n = p.get("nutriments", {})
    return {"name": p.get("product_name", ""), "brand": p.get("brands", ""),
            "kcal": n.get("energy-kcal_100g", 0), "protein": n.get("proteins_100g", 0),
            "carbs": n.get("carbohydrates_100g", 0), "fat": n.get("fat_100g", 0)}


@app.get("/")
def index():
    return FileResponse(os.path.join(STATIC, "index.html"))


app.mount("/static", StaticFiles(directory=STATIC), name="static")
