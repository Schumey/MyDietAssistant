"""Recipes (optional feature "recipes"): ingredients + portions, kept in sync with a food that can be logged like any other."""
import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
import recipe_import
from main import app, food_scope, owner_names, share_level, user_from

NUTR = ("kcal", "protein", "carbs", "fat", *db.MICROS)


class IngredientIn(BaseModel):
    name: str
    grams: float
    kcal: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0
    sugar: float = 0
    salt: float = 0
    sat_fat: float = 0


class RecipeIn(BaseModel):
    name: str
    portions: float = 1
    cooked_g: float | None = None       # weight after cooking; default = sum of the raw ingredients
    category: str = ""
    source: str = ""            # page the recipe came from
    instructions: str = ""      # preparation steps, one per line
    shared: bool | int | None = None  # household: 0 private, 1 offered (use, copy), 2 others may change it too (owner only; None keeps)
    items: list[IngredientIn]


def check_recipe(r: RecipeIn):
    if not r.name.strip():
        raise HTTPException(400, "Bitte einen Namen angeben.")
    if not r.items:
        raise HTTPException(400, "Mindestens eine Zutat nötig.")
    if not r.portions > 0:
        raise HTTPException(400, "Portionen müssen größer als 0 sein.")
    if any(not i.grams > 0 for i in r.items):
        raise HTTPException(400, "Jede Zutat braucht eine Menge in Gramm.")
    if r.cooked_g is not None and not r.cooked_g > 0:
        raise HTTPException(400, "Gewicht nach dem Kochen muss größer als 0 sein.")


def totals(items, cooked_g):
    raw = sum(i["grams"] for i in items)
    grams = cooked_g or raw
    return grams, {k: sum(i[k] for i in items) for k in NUTR}


def sync_food(c, owner: str, rid: int):
    """Create or update the food that stands for the recipe (per 100 g of the finished dish, one named portion)."""
    r = c.execute("SELECT * FROM recipes WHERE id=? AND owner=?", (rid, owner)).fetchone()
    items = [dict(i) for i in c.execute("SELECT * FROM recipe_items WHERE recipe_id=?", (rid,))]
    grams, tot = totals(items, r["cooked_g"])
    per100 = {k: tot[k] / grams * 100 for k in NUTR}
    portion_g = grams / r["portions"]
    vals = (r["name"], "Rezept", *(per100[k] for k in NUTR), portion_g, r["category"])
    fid = r["food_id"]
    if fid and c.execute("SELECT 1 FROM foods WHERE id=? AND owner=?", (fid, owner)).fetchone():
        c.execute("UPDATE foods SET name=?,brand=?,kcal=?,protein=?,carbs=?,fat=?,fiber=?,sugar=?,salt=?,sat_fat=?,serving_g=?,category=?"
                  " WHERE id=?", (*vals, fid))
    else:
        fid = c.execute("INSERT INTO foods(owner,name,brand,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,serving_g,category)"
                        " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", (owner, *vals)).lastrowid
        c.execute("UPDATE recipes SET food_id=? WHERE id=?", (fid, rid))
    c.execute("UPDATE foods SET shared=? WHERE id=?", (int(r["shared"] > 0), fid))      # the recipe's food follows the recipe's sharing
    c.execute("DELETE FROM food_portions WHERE food_id=?", (fid,))
    c.execute("INSERT INTO food_portions(food_id,name,grams) VALUES(?,?,?)", (fid, "1 Portion", portion_g))
    return fid


def write_items(c, rid: int, items):
    c.execute("DELETE FROM recipe_items WHERE recipe_id=?", (rid,))
    c.executemany(
        "INSERT INTO recipe_items(recipe_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        [(rid, i.name, i.grams, i.kcal, i.protein, i.carbs, i.fat, i.fiber, i.sugar, i.salt, i.sat_fat) for i in items])


def recipe_rows(c, owner: str, only: int | None = None, shared: bool = False) -> list[dict]:
    """The user's recipes; with shared=True also those other household members offer (marked mine / owner_name)."""
    out = []
    scope, sp = food_scope(c, owner) if shared else ("owner=?", [owner])
    for r in c.execute(f"SELECT * FROM recipes WHERE {scope}" + (" AND id=?" if only else "") + " ORDER BY name COLLATE NOCASE",
                       (*sp, only) if only else sp):
        items = [dict(i) for i in c.execute("SELECT * FROM recipe_items WHERE recipe_id=? ORDER BY id", (r["id"],))]
        grams, tot = totals(items, r["cooked_g"])
        out.append({**dict(r), "items": items, "total_g": grams, "total": tot,
                    "portion": {k: v / r["portions"] for k, v in tot.items()}, "portion_g": grams / r["portions"]})
    owner_names(c, out, owner)
    return out


@app.get("/api/recipes")
def list_recipes(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return recipe_rows(c, user_from(x_remote_user_id), shared=True)


@app.post("/api/recipes")
def add_recipe(r: RecipeIn, x_remote_user_id: str | None = Header(None)):
    check_recipe(r)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        rid = c.execute("INSERT INTO recipes(owner,name,portions,cooked_g,category,source,instructions,shared) VALUES(?,?,?,?,?,?,?,?)",
                        (owner, r.name.strip(), r.portions, r.cooked_g, r.category.strip(), r.source.strip()[:500], r.instructions.strip()[:20000],
                         share_level(r.shared))).lastrowid
        write_items(c, rid, r.items)
        sync_food(c, owner, rid)
    return {"id": rid}


@app.put("/api/recipes/{rid}")
def edit_recipe(rid: int, r: RecipeIn, x_remote_user_id: str | None = Header(None)):
    check_recipe(r)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        scope, sp = food_scope(c, owner)
        row = c.execute(f"SELECT owner, shared FROM recipes WHERE id=? AND {scope}", (rid, *sp)).fetchone()
        if not row or (row["owner"] != owner and row["shared"] != 2):      # others may only change what is offered for changing
            raise HTTPException(404, "Rezept nicht gefunden")
        c.execute("UPDATE recipes SET name=?,portions=?,cooked_g=?,category=?,source=?,instructions=? WHERE id=?",
                  (r.name.strip(), r.portions, r.cooked_g, r.category.strip(), r.source.strip()[:500], r.instructions.strip()[:20000], rid))
        if r.shared is not None and row["owner"] == owner:
            c.execute("UPDATE recipes SET shared=? WHERE id=?", (share_level(r.shared), rid))
        write_items(c, rid, r.items)
        sync_food(c, row["owner"], rid)
    return {"ok": True}


@app.post("/api/recipes/{rid}/copy")
def copy_recipe(rid: int, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        scope, sp = food_scope(c, owner)
        src = c.execute(f"SELECT * FROM recipes WHERE id=? AND {scope}", (rid, *sp)).fetchone()
        if not src:
            raise HTTPException(404, "Rezept nicht gefunden")
        new = c.execute("INSERT INTO recipes(owner,name,portions,cooked_g,category,source,instructions) VALUES(?,?,?,?,?,?,?)",
                        (owner, f"{src['name']} (Kopie)", src["portions"], src["cooked_g"], src["category"], src["source"], src["instructions"])).lastrowid
        c.execute("INSERT INTO recipe_items(recipe_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat)"
                  " SELECT ?,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat FROM recipe_items WHERE recipe_id=?", (new, rid))
        sync_food(c, owner, new)
    return {"id": new}


@app.delete("/api/recipes/{rid}")
def del_recipe(rid: int, keep_food: bool = False, x_remote_user_id: str | None = Header(None)):
    """Delete a recipe and, unless keep_food, the food that stands for it (logged entries are snapshots and stay)."""
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        r = c.execute("SELECT food_id FROM recipes WHERE id=? AND owner=?", (rid, owner)).fetchone()
        if not r:
            return {"ok": True}
        c.execute("DELETE FROM recipe_items WHERE recipe_id=?", (rid,))
        c.execute("DELETE FROM recipes WHERE id=?", (rid,))
        if r["food_id"] and not keep_food:
            c.execute("DELETE FROM food_portions WHERE food_id=?", (r["food_id"],))
            c.execute("DELETE FROM foods WHERE id=? AND owner=?", (r["food_id"], owner))
    return {"ok": True}


class ImportUrlIn(BaseModel):
    url: str


class ImportTextIn(BaseModel):
    text: str


def finish_draft(owner: str, draft: dict) -> dict:
    """Staples missing from the library come from the online databases (needs the feature: queries leave the device)."""
    from extras import feature_on
    if feature_on(owner, "sources"):
        import extras5

        def source(name):
            return lambda term: extras5.cached_search(name, term, "")[0]
        recipe_import.fill_missing(draft["items"], [source("off"), source("usda")])
    return draft


@app.post("/api/recipes/import-text")
def import_recipe_text(b: ImportTextIn, x_remote_user_id: str | None = Header(None)):
    """Read a recipe from pasted text (title, ingredients, steps) and return a draft for the recipe editor; nothing is saved."""
    owner = user_from(x_remote_user_id)
    from extras import feature_on
    if not feature_on(owner, "recipes"):
        raise HTTPException(403, "Rezepte sind nicht aktiviert")
    if len(b.text) > 30000:
        raise HTTPException(400, "Der Text ist zu lang.")
    try:
        node = recipe_import.parse_recipe_text(b.text)
        with db.conn() as c:
            scope, sp = food_scope(c, owner)
            foods = [dict(r) for r in c.execute(f"SELECT * FROM foods WHERE {scope}", sp)]
        return finish_draft(owner, recipe_import.draft_from_node(node, "", foods))
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.post("/api/recipes/import-url")
def import_recipe_url(b: ImportUrlIn, x_remote_user_id: str | None = Header(None)):
    """Read a recipe from a web page (schema.org data) and return a draft for the recipe editor; nothing is saved."""
    owner = user_from(x_remote_user_id)
    from extras import feature_on
    if not feature_on(owner, "recipes"):
        raise HTTPException(403, "Rezepte sind nicht aktiviert")
    url = b.url.strip()
    if "://" not in url:
        url = "https://" + url
    try:
        page = recipe_import.fetch_page(url)
        with db.conn() as c:
            scope, sp = food_scope(c, owner)
            foods = [dict(r) for r in c.execute(f"SELECT * FROM foods WHERE {scope}", sp)]
        draft = recipe_import.to_draft(page, url, foods)
        return finish_draft(owner, draft)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except httpx.HTTPError:
        raise HTTPException(502, "Die Seite konnte nicht geladen werden.")
