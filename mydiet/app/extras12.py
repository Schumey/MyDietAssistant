"""v1.5: recipe import from a Mealie server. Address and API token are per user (prefs "mealie"); the token never leaves the add-on
(not in the export, not returned by the API)."""
import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
import mealie
import recipe_import
from extras import feature_on, get_pref, set_pref
from main import app, food_scope, user_from


def config(owner: str) -> dict:
    return {"url": "", "token": "", **(get_pref(owner, "mealie", {}) or {})}


def need(owner: str) -> dict:
    if not feature_on(owner, "recipes"):
        raise HTTPException(403, "Rezepte sind nicht aktiviert")
    cfg = config(owner)
    if not cfg["url"] or not cfg["token"]:
        raise HTTPException(400, "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).")
    return cfg


class MealieConfigIn(BaseModel):
    url: str = ""
    token: str | None = None   # None keeps the stored token


@app.get("/api/mealie")
def get_mealie(x_remote_user_id: str | None = Header(None)):
    cfg = config(user_from(x_remote_user_id))
    return {"url": cfg["url"], "token_set": bool(cfg["token"])}


@app.put("/api/mealie")
def put_mealie(b: MealieConfigIn, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    try:
        url = mealie.normalize_url(b.url)
    except ValueError as e:
        raise HTTPException(400, str(e))
    token = config(owner)["token"] if b.token is None else b.token.strip()
    set_pref(owner, "mealie", {"url": url, "token": token if url else ""})
    return {"ok": True, "url": url}


@app.get("/api/mealie/recipes")
def mealie_recipes(q: str = "", page: int = 1, x_remote_user_id: str | None = Header(None)):
    cfg = need(user_from(x_remote_user_id))
    try:
        return mealie.list_recipes(cfg["url"], cfg["token"], q.strip()[:100], page)
    except ValueError as e:
        raise HTTPException(400, str(e))


class MealieImportIn(BaseModel):
    slug: str


@app.post("/api/mealie/import")
def mealie_import(b: MealieImportIn, x_remote_user_id: str | None = Header(None)):
    """Read one Mealie recipe and return a draft for the recipe editor; nothing is saved."""
    owner = user_from(x_remote_user_id)
    cfg = need(owner)
    try:
        node, source = mealie.get_recipe(cfg["url"], cfg["token"], b.slug)
        with db.conn() as c:
            scope, sp = food_scope(c, owner)
            foods = [dict(r) for r in c.execute(f"SELECT * FROM foods WHERE {scope}", sp)]
        draft = recipe_import.draft_from_node(node, source, foods)
        if feature_on(owner, "sources"):   # same as the web import: missing staples come from the online databases
            import extras5

            def src(name):
                return lambda term: extras5.cached_search(name, term, "")[0]
            recipe_import.fill_missing(draft["items"], [src("off"), src("usda")])
        return draft
    except ValueError as e:
        raise HTTPException(400, str(e))
    except httpx.HTTPError:
        raise HTTPException(502, "Mealie konnte nicht erreicht werden.")
