"""v1.33: pantry (optional feature "pantry"). The stock of a food is the amount entered minus the grams of all diary entries
logged afterwards whose name matches; editing or deleting an entry therefore corrects the stock by itself. When the stock
reaches the threshold, a push notification and/or an item on a Home Assistant to-do list (e.g. Bring!) is sent once, until
the stock is raised again."""
import re

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
import extras2
from extras import SUPERVISOR_TOKEN, feature_on, get_pref, ha_get, set_pref
from extras2 import owners
from extras15 import line
from main import SENSOR_HOOKS, _ha_post, app, publish, user_from

MAX_ITEMS = 300


def need_pantry(owner: str):
    if not feature_on(owner, "pantry"):
        raise HTTPException(403, "Vorrat nicht aktiviert")


def words(item) -> list[str]:
    raw = item["match"] or item["name"]
    return [w.strip().lower() for w in raw.split(",") if w.strip()]


def used_grams(entries, item) -> float:
    ws = words(item)
    return sum(e["grams"] for e in entries if e["id"] > item["since_id"] and any(w in e["name"].lower() for w in ws))


def rows(c, owner: str) -> list[dict]:
    items = [dict(r) for r in c.execute("SELECT * FROM pantry WHERE owner=? ORDER BY name COLLATE NOCASE, id", (owner,))]
    entries = [dict(r) for r in c.execute("SELECT id,name,grams FROM entries WHERE owner=? AND grams>0", (owner,))] if items else []
    for i in items:
        i["remaining"] = round(i["amount"] - used_grams(entries, i), 1)
        i["low"] = i["remaining"] <= i["min_amount"]
    return items


def max_entry_id(c) -> int:
    return c.execute("SELECT COALESCE(MAX(id),0) FROM entries").fetchone()[0]


def shown(i: dict) -> dict:
    return {"id": i["id"], "name": i["name"], "match": i["match"], "remaining": max(i["remaining"], 0), "min_amount": i["min_amount"],
            "pack_g": i["pack_g"], "low": i["low"]}


class ItemIn(BaseModel):
    name: str
    match: str = ""
    remaining: float | None = None     # set the stock now (new items: start value); None keeps it
    min_amount: float = 0
    pack_g: float = 0


def clean(b: ItemIn) -> tuple:
    name = b.name.strip()
    if not name:
        raise HTTPException(400, "Name fehlt")
    if min(b.min_amount, b.pack_g, b.remaining if b.remaining is not None else 0) < 0:
        raise HTTPException(400, "Mengen dürfen nicht negativ sein")
    return name[:100], re.sub(r"\s*,\s*", ",", b.match.strip())[:200]


@app.get("/api/pantry")
def pantry_list(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    with db.conn() as c:
        return {"items": [shown(i) for i in rows(c, owner)], "config": config(owner)}


@app.post("/api/pantry")
def pantry_add(b: ItemIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    name, match = clean(b)
    with db.conn() as c:
        if c.execute("SELECT COUNT(*) FROM pantry WHERE owner=?", (owner,)).fetchone()[0] >= MAX_ITEMS:
            raise HTTPException(400, "Zu viele Einträge")
        cur = c.execute("INSERT INTO pantry(owner,name,match,amount,since_id,min_amount,pack_g) VALUES(?,?,?,?,?,?,?)",
                        (owner, name, match, b.remaining or 0, max_entry_id(c), b.min_amount, b.pack_g))
        return {"id": cur.lastrowid}


# --- alert targets (declared before /{item_id}, so "config" is not read as an id) ---

DEFAULT_CONFIG = {"notify": "", "todo": ""}


def config(owner: str) -> dict:
    return {**DEFAULT_CONFIG, **(get_pref(owner, "pantry", {}) or {})}


class ConfigIn(BaseModel):
    notify: str = ""     # e.g. notify.mobile_app_pixel; empty = no push
    todo: str = ""       # e.g. todo.bring; empty = no to-do item


@app.put("/api/pantry/config")
def pantry_config(b: ConfigIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    if b.notify and not re.fullmatch(r"notify\.[a-z0-9_]+", b.notify):
        raise HTTPException(400, "Benachrichtigungsdienst wie notify.mobile_app_handy angeben")
    if b.todo and not re.fullmatch(r"todo\.[a-z0-9_]+", b.todo):
        raise HTTPException(400, "Todo-Liste fehlt")
    set_pref(owner, "pantry", {"notify": b.notify, "todo": b.todo})
    return {"ok": True}


@app.get("/api/pantry/targets")
def pantry_targets(x_remote_user_id: str | None = Header(None)):
    """Notification services and to-do lists of Home Assistant for the pickers (empty when it is not reachable)."""
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    todos, notifies = [], []
    if SUPERVISOR_TOKEN:
        try:
            todos = sorted(({"id": s["entity_id"], "name": s["attributes"].get("friendly_name", "")}
                            for s in ha_get("states") if s["entity_id"].startswith("todo.")), key=lambda e: e["id"])
            notifies = sorted(f"notify.{n}" for d in ha_get("services") if d.get("domain") == "notify" for n in d.get("services", {}))
        except (httpx.HTTPError, ValueError):
            pass
    return {"todos": todos, "notifies": notifies}


def own_item(c, owner: str, item_id: int) -> dict:
    found = [i for i in rows(c, owner) if i["id"] == item_id]
    if not found:
        raise HTTPException(404, "Eintrag nicht gefunden")
    return found[0]


@app.put("/api/pantry/{item_id}")
def pantry_edit(item_id: int, b: ItemIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    name, match = clean(b)
    with db.conn() as c:
        old = own_item(c, owner, item_id)
        amount, since = (old["amount"], old["since_id"]) if b.remaining is None else (b.remaining, max_entry_id(c))
        c.execute("UPDATE pantry SET name=?,match=?,amount=?,since_id=?,min_amount=?,pack_g=? WHERE id=? AND owner=?",
                  (name, match, amount, since, b.min_amount, b.pack_g, item_id, owner))
    return {"ok": True}


class RestockIn(BaseModel):
    grams: float = 0      # 0 = one pack


@app.post("/api/pantry/{item_id}/restock")
def pantry_restock(item_id: int, b: RestockIn, x_remote_user_id: str | None = Header(None)):
    """Bought something: add to the current stock (default one pack)."""
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    with db.conn() as c:
        old = own_item(c, owner, item_id)
        add = b.grams or old["pack_g"]
        if add <= 0:
            raise HTTPException(400, "Menge oder Packungsgröße fehlt")
        c.execute("UPDATE pantry SET amount=?, since_id=? WHERE id=? AND owner=?", (max(old["remaining"], 0) + add, max_entry_id(c), item_id, owner))
    return {"ok": True}


@app.delete("/api/pantry/{item_id}")
def pantry_delete(item_id: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    with db.conn() as c:
        c.execute("DELETE FROM pantry WHERE id=? AND owner=?", (item_id, owner))
    return {"ok": True}


PANTRY_NOTIFY = {   # (title, message with the food and the remaining grams)
    "de": ("Vorrat", "{} wird knapp (noch {} g)."),
    "en": ("Pantry", "{} is running low ({} g left)."),
    "fr": ("Réserve", "{} est bientôt épuisé (reste {} g)."),
    "es": ("Despensa", "{} se está acabando (quedan {} g)."),
    "nl": ("Voorraad", "{} raakt op (nog {} g)."),
    "it": ("Dispensa", "{} sta finendo (restano {} g)."),
    "pt": ("Despensa", "{} está a acabar (restam {} g)."),
    "pl": ("Spiżarnia", "{} się kończy (zostało {} g)."),
}


def alert(owner: str, cfg: dict, item: dict):
    """Send the push and/or the to-do item of one food; raises httpx.HTTPError when a target fails."""
    if cfg["todo"]:
        _ha_post("services/todo/add_item", {"entity_id": cfg["todo"], "item": line({"name": item["name"], "grams": item["pack_g"]})})
    if cfg["notify"]:
        title, text = PANTRY_NOTIFY.get(get_pref(owner, "lang", "auto"), PANTRY_NOTIFY["de"])
        domain, _, svc = cfg["notify"].partition(".")
        _ha_post(f"services/{domain}/{svc}", {"title": title, "message": text.format(item["name"], round(max(item["remaining"], 0)))})


def check_pantry(only: str | None = None) -> int:
    """Alert foods that dropped to their threshold (once each) and re-arm foods that were restocked. Returns the number of alerts."""
    if not SUPERVISOR_TOKEN:
        return 0
    sent = 0
    for o in ([only] if only else owners()):
        if not feature_on(o, "pantry"):
            continue
        cfg = config(o)
        with db.conn() as c:
            for i in rows(c, o):
                if i["low"] and not i["alerted"] and (cfg["notify"] or cfg["todo"]):
                    try:
                        alert(o, cfg, i)
                    except httpx.HTTPError as e:
                        print(f"[pantry] {o}: {e!r}", flush=True)
                        continue
                    c.execute("UPDATE pantry SET alerted=1 WHERE id=?", (i["id"],))
                    sent += 1
                elif not i["low"] and i["alerted"]:
                    c.execute("UPDATE pantry SET alerted=0 WHERE id=?", (i["id"],))
    return sent


@app.post("/api/pantry/check")
def pantry_check(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    need_pantry(owner)
    if not SUPERVISOR_TOKEN:
        raise HTTPException(502, "Home Assistant nicht erreichbar")
    return {"sent": check_pantry(owner)}


def pantry_sensor(owner: str) -> list:
    """sensor.mydiet_<name>_pantry_low: names of the foods at or below their threshold, or "none"."""
    if not feature_on(owner, "pantry"):
        return []
    with db.conn() as c:
        low = [i["name"] for i in rows(c, owner) if i["low"]]
    return [("pantry_low", ", ".join(low)[:250] or "none", "")]


SENSOR_HOOKS.append(pantry_sensor)
extras2.EXTRA_JOBS.append(check_pantry)
