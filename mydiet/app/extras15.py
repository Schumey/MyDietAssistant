"""v1.14: shopping list (optional feature "shopping"). Adds up the ingredients of chosen recipes and saved meals and can send
them to a to-do list in Home Assistant (e.g. the built-in shopping list) through the service todo.add_item."""
import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from extras import SUPERVISOR_TOKEN, feature_on, get_pref, ha_get, saved_meal_rows, set_pref
from extras4 import recipe_rows
from main import _ha_post, app, user_from

MAX_LINES = 300


def need_shopping(owner: str):
    if not feature_on(owner, "shopping"):
        raise HTTPException(403, "Einkaufsliste nicht aktiviert")


class Pick(BaseModel):
    id: int
    amount: float          # recipes: wanted portions; saved meals: multiple of the saved amounts (1 = once)


class ListIn(BaseModel):
    recipes: list[Pick] = []
    meals: list[Pick] = []


def add_up(c, owner: str, b: ListIn) -> list:
    """[{'name', 'grams'}] summed by name (case-insensitive), alphabetical; items without an amount count 0 g."""
    sums = {}

    def put(name: str, grams: float):
        key = name.strip().lower()
        row = sums.setdefault(key, {"name": name.strip(), "grams": 0.0})
        row["grams"] += grams
    for p in b.recipes:
        if p.amount <= 0:
            continue
        for r in recipe_rows(c, owner, p.id, shared=True):
            for i in r["items"]:
                put(i["name"], i["grams"] * p.amount / r["portions"])
    wanted = {p.id: p.amount for p in b.meals if p.amount > 0}
    for m in saved_meal_rows(c, owner, shared=True):
        for i in m["items"] if m["id"] in wanted else []:
            put(i["name"], i["grams"] * wanted[m["id"]])
    return sorted(({"name": v["name"], "grams": round(v["grams"], 1)} for v in sums.values()), key=lambda v: v["name"].lower())


@app.post("/api/shopping/list")
def shopping_list(b: ListIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_shopping(owner)
    with db.conn() as c:
        return {"items": add_up(c, owner, b)}


@app.get("/api/shopping/todos")
def shopping_todos(x_remote_user_id: str | None = Header(None)):
    """To-do lists of Home Assistant for the picker, plus the one used last."""
    owner = user_from(x_remote_user_id)
    need_shopping(owner)
    last = (get_pref(owner, "shopping", {}) or {}).get("entity", "")
    if not SUPERVISOR_TOKEN:
        return {"entities": [], "last": last}
    try:
        states = ha_get("states")
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, "Home Assistant nicht erreichbar")
    return {"entities": sorted(({"id": s["entity_id"], "name": s["attributes"].get("friendly_name", "")}
                                for s in states if s["entity_id"].startswith("todo.")), key=lambda e: e["id"]), "last": last}


class SendIn(BaseModel):
    entity: str
    items: list[dict]      # [{'name', 'grams'}]


def line(item: dict) -> str:
    g = float(item.get("grams") or 0)
    if g <= 0:
        return str(item["name"])
    amount = f"{g / 1000:.2f}".rstrip("0").rstrip(".").replace(".", ",") + " kg" if g >= 1000 else f"{g:.0f} g"
    return f"{item['name']} – {amount}"


@app.post("/api/shopping/send")
def shopping_send(b: SendIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_shopping(owner)
    if not b.entity.startswith("todo."):
        raise HTTPException(400, "Todo-Liste fehlt")
    items = [i for i in b.items if isinstance(i, dict) and str(i.get("name", "")).strip()][:MAX_LINES]
    if not items:
        raise HTTPException(400, "Keine Einträge")
    if not SUPERVISOR_TOKEN:
        raise HTTPException(502, "Home Assistant nicht erreichbar")
    sent = 0
    try:
        for i in items:
            _ha_post("services/todo/add_item", {"entity_id": b.entity, "item": line(i)})
            sent += 1
    except httpx.HTTPError:
        raise HTTPException(502, f"Home Assistant nicht erreichbar (gesendet: {sent})")
    set_pref(owner, "shopping", {"entity": b.entity})
    return {"sent": sent}
