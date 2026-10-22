import json
import os
import re
from datetime import date, timedelta

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

def _supervisor_token():
    # The base image's s6 entrypoint does not pass the add-on environment on to CMD;
    # it keeps the variables as files instead.
    token = os.environ.get("SUPERVISOR_TOKEN")
    if token:
        return token
    for path in ("/run/s6/container_environment/SUPERVISOR_TOKEN", "/var/run/s6/container_environment/SUPERVISOR_TOKEN"):
        try:
            with open(path) as f:
                return f.read().strip() or None
        except OSError:
            continue
    return None


SUPERVISOR_TOKEN = _supervisor_token()
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
    category: str = ""


class EntryIn(BaseModel):
    day: str
    meal_id: int | None = None
    food_id: int
    grams: float
    time: str | None = None


class EntryEdit(BaseModel):
    grams: float | None = None
    time: str | None = None


class GoalIn(BaseModel):
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    target_weight: float | None = None


class MealIn(BaseModel):
    name: str


class OrderIn(BaseModel):
    ids: list[int]


class WeightIn(BaseModel):
    kg: float


def check_day(day: str):
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day):
        raise HTTPException(400, "day must be YYYY-MM-DD")


def check_time(t: str | None) -> str | None:
    if not t:
        return None
    if not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", t):
        raise HTTPException(400, "time must be HH:MM")
    return t


def get_goal(c, owner: str) -> dict:
    r = c.execute("SELECT * FROM goals WHERE owner=?", (owner,)).fetchone()
    if r:
        return {k: r[k] for k in ("kcal", "protein", "carbs", "fat", "target_weight")}
    return {"kcal": OPTIONS.get("default_kcal_goal", 2000), "protein": 0, "carbs": 0,
            "fat": 0, "target_weight": None}


def day_totals(c, owner: str, day: str) -> dict:
    r = c.execute(
        "SELECT COALESCE(SUM(kcal),0) kcal, COALESCE(SUM(protein),0) protein,"
        " COALESCE(SUM(carbs),0) carbs, COALESCE(SUM(fat),0) fat"
        " FROM entries WHERE owner=? AND day=?", (owner, day)).fetchone()
    return {k: round(r[k], 1) for k in r.keys()}


def publish(owner: str, display: str):
    """Push today's totals and latest weight into HA as sensor states."""
    if not SUPERVISOR_TOKEN or not OPTIONS.get("publish_sensors", True):
        return
    slug = re.sub(r"[^a-z0-9]+", "_", display.lower()).strip("_") or "default"
    with db.conn() as c:
        t = day_totals(c, owner, date.today().isoformat())
        w = c.execute("SELECT kg FROM weights WHERE owner=? ORDER BY day DESC LIMIT 1",
                      (owner,)).fetchone()
    states = [("kcal", t["kcal"], "kcal"), ("protein", t["protein"], "g"),
              ("carbs", t["carbs"], "g"), ("fat", t["fat"], "g")]
    if w:
        states.append(("weight", w["kg"], "kg"))
    for key, val, unit in states:
        suffix = "" if key == "weight" else "_today"
        try:
            httpx.post(
                f"http://supervisor/core/api/states/sensor.mydiet_{slug}_{key}{suffix}",
                headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                json={"state": val, "attributes": {
                    "unit_of_measurement": unit,
                    "friendly_name": f"{display} {key}",
                    "state_class": "measurement" if key == "weight" else "total",
                }}, timeout=5)
        except httpx.HTTPError:
            pass


@app.get("/api/me")
def me(x_remote_user_id: str | None = Header(None),
       x_remote_user_display_name: str | None = Header(None)):
    if x_remote_user_display_name:
        set_pref(user_from(x_remote_user_id), "display", x_remote_user_display_name)
    return {"id": user_from(x_remote_user_id), "name": x_remote_user_display_name or "Lokal"}


# --- diary -----------------------------------------------------------------

@app.get("/api/day/{day}")
def get_day(day: str, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        db.ensure_meals(c, owner)
        meals = [dict(r) for r in c.execute(
            "SELECT id, name, archived FROM meals WHERE owner=? ORDER BY position", (owner,))]
        entries = [dict(r) for r in c.execute(
            "SELECT * FROM entries WHERE owner=? AND day=? ORDER BY id", (owner, day))]
        hidden = hidden_meals(c, owner, day, meals, {e["meal_id"] for e in entries})
        for m in meals:
            m["hidden"] = m["id"] in hidden
        return {"meals": meals, "entries": entries, "mode": get_pref(owner, "diary_mode", "meals"),
                "totals": day_totals(c, owner, day), "goal": get_goal(c, owner)}


@app.post("/api/entries")
def add_entry(e: EntryIn, x_remote_user_id: str | None = Header(None),
              x_remote_user_display_name: str | None = Header(None)):
    check_day(e.day)
    if e.grams <= 0:
        raise HTTPException(400, "grams must be > 0")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        f = c.execute("SELECT * FROM foods WHERE id=? AND owner=?", (e.food_id, owner)).fetchone()
        if not f:
            raise HTTPException(404, "food not found")
        db.ensure_meals(c, owner)
        meal_id = e.meal_id or c.execute("SELECT id FROM meals WHERE owner=? ORDER BY position",
                                         (owner,)).fetchone()["id"]
        if not c.execute("SELECT 1 FROM meals WHERE id=? AND owner=?", (meal_id, owner)).fetchone():
            raise HTTPException(404, "meal not found")
        k = e.grams / 100
        c.execute(
            "INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,time)"
            " VALUES(?,?,?,?,?,?,?,?,?,?)",
            (owner, e.day, meal_id, f["name"], e.grams, f["kcal"] * k, f["protein"] * k,
             f["carbs"] * k, f["fat"] * k, check_time(e.time)))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


@app.put("/api/entries/{entry_id}")
def edit_entry(entry_id: int, g: EntryEdit, x_remote_user_id: str | None = Header(None),
               x_remote_user_display_name: str | None = Header(None)):
    if g.grams is not None and g.grams <= 0:
        raise HTTPException(400, "grams must be > 0")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        r = c.execute("SELECT * FROM entries WHERE id=? AND owner=?", (entry_id, owner)).fetchone()
        if not r:
            raise HTTPException(404, "entry not found")
        grams = g.grams if g.grams is not None else r["grams"]
        k = grams / r["grams"] if r["grams"] else 1
        c.execute("UPDATE entries SET grams=?, kcal=?, protein=?, carbs=?, fat=?, time=? WHERE id=?",
                  (grams, r["kcal"] * k, r["protein"] * k, r["carbs"] * k, r["fat"] * k,
                   check_time(g.time) if g.time is not None else r["time"], entry_id))
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


# --- foods -----------------------------------------------------------------

@app.get("/api/foods")
def list_foods(q: str = "", x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        rows = c.execute(
            "SELECT * FROM foods WHERE owner=? AND (name LIKE ? OR brand LIKE ?)"
            " ORDER BY id DESC LIMIT 200", (owner, f"%{q}%", f"%{q}%"))
        return [dict(r) for r in rows]


@app.post("/api/foods")
def add_food(f: FoodIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        cur = c.execute(
            "INSERT INTO foods(owner,name,brand,kcal,protein,carbs,fat,serving_g,category)"
            " VALUES(?,?,?,?,?,?,?,?,?)",
            (owner, f.name.strip(), f.brand.strip(), f.kcal, f.protein, f.carbs, f.fat, f.serving_g,
             f.category.strip()))
        return {"id": cur.lastrowid}


@app.put("/api/foods/{food_id}")
def edit_food(food_id: int, f: FoodIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        c.execute(
            "UPDATE foods SET name=?,brand=?,kcal=?,protein=?,carbs=?,fat=?,serving_g=?,category=?"
            " WHERE id=? AND owner=?",
            (f.name.strip(), f.brand.strip(), f.kcal, f.protein, f.carbs, f.fat, f.serving_g,
             f.category.strip(), food_id, owner))
    return {"ok": True}


@app.delete("/api/foods/{food_id}")
def del_food(food_id: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        c.execute("DELETE FROM foods WHERE id=? AND owner=?", (food_id, owner))
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


# --- meals & goals ---------------------------------------------------------

@app.post("/api/meals")
def add_meal(m: MealIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        db.ensure_meals(c, owner)
        pos = c.execute("SELECT COALESCE(MAX(position),-1)+1 FROM meals WHERE owner=?",
                        (owner,)).fetchone()[0]
        cur = c.execute("INSERT INTO meals(owner,name,position) VALUES(?,?,?)",
                        (owner, m.name.strip(), pos))
        return {"id": cur.lastrowid}


@app.put("/api/meals/order")
def order_meals(o: OrderIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        for i, mid in enumerate(o.ids):
            c.execute("UPDATE meals SET position=? WHERE id=? AND owner=?", (i, mid, owner))
    return {"ok": True}


@app.put("/api/meals/{meal_id}")
def rename_meal(meal_id: int, m: MealIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        c.execute("UPDATE meals SET name=? WHERE id=? AND owner=?", (m.name.strip(), meal_id, owner))
    return {"ok": True}


@app.delete("/api/meals/{meal_id}")
def del_meal(meal_id: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        if c.execute("SELECT 1 FROM entries WHERE meal_id=? AND owner=?", (meal_id, owner)).fetchone():
            raise HTTPException(409, "Mahlzeit enthält noch Einträge")
        c.execute("DELETE FROM meals WHERE id=? AND owner=?", (meal_id, owner))
    return {"ok": True}


@app.get("/api/goal")
def read_goal(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return get_goal(c, user_from(x_remote_user_id))


@app.put("/api/goal")
def set_goal(g: GoalIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO goals(owner,kcal,protein,carbs,fat,target_weight)"
                  " VALUES(?,?,?,?,?,?)",
                  (owner, g.kcal, g.protein, g.carbs, g.fat, g.target_weight))
    return {"ok": True}


# --- weight & stats --------------------------------------------------------

@app.get("/api/weights")
def list_weights(days: int = 0, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    since = (date.today() - timedelta(days=days)).isoformat() if days else "0000-00-00"
    with db.conn() as c:
        rows = c.execute("SELECT day, kg FROM weights WHERE owner=? AND day>=? ORDER BY day",
                         (owner, since))
        return [dict(r) for r in rows]


@app.put("/api/weights/{day}")
def set_weight(day: str, w: WeightIn, x_remote_user_id: str | None = Header(None),
               x_remote_user_display_name: str | None = Header(None)):
    check_day(day)
    if not 20 <= w.kg <= 500:
        raise HTTPException(400, "kg out of range")
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, day, w.kg))
    publish(owner, x_remote_user_display_name or owner)
    return {"ok": True}


@app.delete("/api/weights/{day}")
def del_weight(day: str, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    with db.conn() as c:
        c.execute("DELETE FROM weights WHERE owner=? AND day=?", (user_from(x_remote_user_id), day))
    return {"ok": True}


@app.get("/api/stats")
def stats(days: int = 30, x_remote_user_id: str | None = Header(None)):
    days = max(1, min(days, 365))
    owner = user_from(x_remote_user_id)
    start = date.today() - timedelta(days=days - 1)
    with db.conn() as c:
        rows = {r["day"]: dict(r) for r in c.execute(
            "SELECT day, SUM(kcal) kcal, SUM(protein) protein, SUM(carbs) carbs, SUM(fat) fat"
            " FROM entries WHERE owner=? AND day>=? GROUP BY day", (owner, start.isoformat()))}
        goal = get_goal(c, owner)
    out = []
    for i in range(days):
        d = (start + timedelta(days=i)).isoformat()
        r = rows.get(d)
        out.append({"day": d, "logged": bool(r), **{k: (r[k] if r else 0) for k in ("kcal", "protein", "carbs", "fat")}})
    return {"days": out, "goal": goal, "balance": energy_balance(owner, out)}


from extras import *  # noqa: E402,F401,F403  (routes for v0.3 features)


@app.get("/")
def index():
    return FileResponse(os.path.join(STATIC, "index.html"))


app.mount("/static", StaticFiles(directory=STATIC), name="static")
