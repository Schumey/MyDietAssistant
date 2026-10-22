"""Further nutrition data sources (optional feature "sources"): Open Food Facts search and USDA FoodData Central,
returned in one common shape so the app can compare them with each other and with the user's own values."""
import httpx
from fastapi import Header, HTTPException

import db
from extras import feature_on
from main import CACHE_DAYS, OPTIONS, app, off_product, user_from

QUERY_CACHE_DAYS = 14   # text searches go stale faster than a product's barcode entry

UA = {"User-Agent": "MyDietAssistant/1.0 (Home Assistant add-on; github.com/Schumey/MyDietAssistant)"}
NUTR = ("kcal", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sat_fat")


def num(v) -> float:
    try:
        return round(float(v), 2)
    except (TypeError, ValueError):
        return 0.0


def off_item(p: dict) -> dict:
    n = p.get("nutriments") or {}
    brands = p.get("brands") or ""
    if isinstance(brands, list):
        brands = ", ".join(brands)
    salt = n.get("salt_100g")
    if salt is None and n.get("sodium_100g") is not None:
        salt = float(n["sodium_100g"]) * 2.5
    kcal = n.get("energy-kcal_100g")
    if kcal is None and n.get("energy-kj_100g") is not None:
        kcal = float(n["energy-kj_100g"]) / 4.184
    return {"source": "off", "code": p.get("code", ""), "name": p.get("product_name") or "", "brand": brands.split(",")[0].strip(),
            "kcal": num(kcal), "protein": num(n.get("proteins_100g")), "carbs": num(n.get("carbohydrates_100g")),
            "fat": num(n.get("fat_100g")), "fiber": num(n.get("fiber_100g")), "sugar": num(n.get("sugars_100g")),
            "salt": num(salt), "sat_fat": num(n.get("saturated-fat_100g"))}


def search_off(q: str, barcode: str) -> list[dict]:
    if barcode:
        p = off_product(barcode)
        return [off_item({**p, "code": barcode})] if p else []
    r = httpx.get("https://search.openfoodfacts.org/search",
                  params={"q": q, "page_size": 8, "fields": "code,product_name,brands,nutriments"}, headers=UA, timeout=10)
    return [i for i in (off_item(p) for p in r.json().get("hits", [])) if i["name"] and i["kcal"]]


USDA_IDS = {"kcal": (1008, 2047, 2048), "protein": (1003,), "carbs": (1005,), "fat": (1004,), "fiber": (1079,), "sugar": (2000, 1063),
            "sat_fat": (1258,), "sodium": (1093,)}


def usda_item(f: dict) -> dict:
    vals = {}
    for n in f.get("foodNutrients", []):
        vals.setdefault(n.get("nutrientId"), n.get("value"))
    pick = lambda key: next((vals[i] for i in USDA_IDS[key] if vals.get(i) is not None), None)
    name = f.get("description") or ""
    if name.isupper():
        name = name.capitalize()
    brand = f.get("brandName") or f.get("brandOwner") or ""
    if brand.isupper():
        brand = brand.title()
    sodium = pick("sodium")
    return {"source": "usda", "code": f.get("gtinUpc") or str(f.get("fdcId", "")), "name": name, "brand": brand,
            "kcal": num(pick("kcal")), "protein": num(pick("protein")), "carbs": num(pick("carbs")), "fat": num(pick("fat")),
            "fiber": num(pick("fiber")), "sugar": num(pick("sugar")), "salt": num(float(sodium) * 2.5 / 1000 if sodium is not None else None),
            "sat_fat": num(pick("sat_fat"))}


def search_usda(q: str, barcode: str) -> list[dict]:
    key = OPTIONS.get("usda_api_key") or "DEMO_KEY"
    r = httpx.get("https://api.nal.usda.gov/fdc/v1/foods/search",
                  params={"api_key": key, "query": barcode or q, "pageSize": 15 if barcode else 8,
                          "dataType": "Branded" if barcode else "Foundation,SR Legacy,Branded"}, headers=UA, timeout=10)
    if r.status_code == 429:
        raise HTTPException(429, "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)")
    foods = r.json().get("foods", [])
    if barcode:   # the search is full-text: keep exact barcode hits (UPC-A may drop the leading zero)
        foods = [f for f in foods if (f.get("gtinUpc") or "").lstrip("0") == barcode.lstrip("0")]
    return [i for i in (usda_item(f) for f in foods) if i["name"] and i["kcal"]]


SOURCES = {"off": search_off, "usda": search_usda}


def cached_search(source: str, q: str, barcode: str) -> tuple[list[dict], bool]:
    """(results, from_cache). Barcode hits of Open Food Facts are cached by main.off_product itself."""
    if source == "off" and barcode:
        hit = db.cache_get(f"off:{barcode}", CACHE_DAYS) is not None
        return SOURCES[source](q, barcode), hit
    key = f"{source}:{'b' if barcode else 'q'}:{(barcode or q).lower()}"
    hit = db.cache_get(key, CACHE_DAYS if barcode else QUERY_CACHE_DAYS)
    if hit is not None:
        return hit, True
    res = SOURCES[source](q, barcode)
    if res:
        db.cache_put(key, res)
    return res, False


@app.get("/api/lookup")
def lookup(q: str = "", barcode: str = "", sources: str = "off,usda", x_remote_user_id: str | None = Header(None)):
    """Search several nutrition databases at once. Needs the feature "sources" (queries leave the device)."""
    if not feature_on(user_from(x_remote_user_id), "sources"):
        raise HTTPException(403, "Weitere Datenquellen sind nicht aktiviert")
    q, barcode = q.strip(), barcode.strip()
    if barcode and not barcode.isdigit():
        raise HTTPException(400, "bad barcode")
    if not q and not barcode:
        raise HTTPException(400, "Suchbegriff oder Barcode angeben")
    results, errors, cached = [], {}, []
    for s in [x for x in sources.split(",") if x in SOURCES]:
        try:
            res, hit = cached_search(s, q, barcode)
            results += res
            if hit:
                cached.append(s)
        except HTTPException as e:
            errors[s] = e.detail
        except (httpx.HTTPError, ValueError, KeyError):
            errors[s] = "nicht erreichbar"
    return {"results": results, "errors": errors, "cached": cached}
