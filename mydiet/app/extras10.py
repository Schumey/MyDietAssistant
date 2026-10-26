"""v1.0: share foods and saved meals with the household, import a food table (BLS, Open Food Facts CSV, own lists)
and check the own foods against the online databases."""
import csv
import io
import json
import re
import zipfile
from xml.etree import ElementTree as ET

from fastapi import Header, HTTPException, Request
from pydantic import BaseModel

import db
from extras import feature_on, get_pref
from extras7 import detect_delim, to_num
from main import app, user_from

# --- sharing with the household ----------------------------------------------------

class ShareFoodsIn(BaseModel):
    ids: list[int]
    users: list[str]


def share_targets(me_id: str, users: list[str]) -> list[str]:
    if not feature_on(me_id, "household"):
        raise HTTPException(403, "Haushaltsfunktion ist nicht aktiviert")
    out = []
    with db.conn() as c:
        for u in users:
            if u == me_id:
                continue
            if not (c.execute("SELECT 1 FROM users WHERE id=?", (u,)).fetchone() and feature_on(u, "household")):
                raise HTTPException(403, "Dieser Benutzer nimmt nicht am Haushalt teil")
            out.append(u)
    return out


@app.post("/api/foods/share")
def share_foods(s: ShareFoodsIn, x_remote_user_id: str | None = Header(None)):
    """Copy foods into other household members' libraries. A food they already have (same name and brand) is left alone."""
    me_id = user_from(x_remote_user_id)
    targets = share_targets(me_id, s.users)
    copied = skipped = 0
    with db.conn() as c:
        foods = [dict(f) for f in c.execute(f"SELECT * FROM foods WHERE owner=? AND id IN ({','.join('?' * len(s.ids))})", [me_id, *s.ids])] if s.ids else []
        for u in targets:
            have = {(r["name"].strip().lower(), r["brand"].strip().lower()) for r in c.execute("SELECT name, brand FROM foods WHERE owner=?", (u,))}
            for f in foods:
                if (f["name"].strip().lower(), f["brand"].strip().lower()) in have:
                    skipped += 1
                    continue
                cur = c.execute("INSERT INTO foods(owner,name,brand,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,serving_g,category,barcode)"
                                " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                                (u, f["name"], f["brand"], f["kcal"], f["protein"], f["carbs"], f["fat"], f["fiber"], f["sugar"], f["salt"],
                                 f["sat_fat"], f["serving_g"], f["category"], f["barcode"]))
                c.execute("INSERT INTO food_portions(food_id,name,grams) SELECT ?,name,grams FROM food_portions WHERE food_id=?", (cur.lastrowid, f["id"]))
                copied += 1
    return {"copied": copied, "skipped": skipped}


@app.post("/api/saved-meals/share")
def share_saved_meals(s: ShareFoodsIn, x_remote_user_id: str | None = Header(None)):
    """Copy saved meals to other household members (a meal with the same name there is left alone)."""
    me_id = user_from(x_remote_user_id)
    targets = share_targets(me_id, s.users)
    copied = skipped = 0
    with db.conn() as c:
        meals = [dict(m) for m in c.execute(f"SELECT * FROM saved_meals WHERE owner=? AND id IN ({','.join('?' * len(s.ids))})", [me_id, *s.ids])] if s.ids else []
        for u in targets:
            have = {r["name"].strip().lower() for r in c.execute("SELECT name FROM saved_meals WHERE owner=?", (u,))}
            for m in meals:
                if m["name"].strip().lower() in have:
                    skipped += 1
                    continue
                cur = c.execute("INSERT INTO saved_meals(owner,name,category,min_scale,max_scale) VALUES(?,?,?,?,?)",
                                (u, m["name"], m["category"], m["min_scale"], m["max_scale"]))
                c.execute("INSERT INTO saved_meal_items(saved_meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,mode,tol,pack_g,step_g,pack_min,pack_max)"
                          " SELECT ?,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,mode,tol,pack_g,step_g,pack_min,pack_max FROM saved_meal_items WHERE saved_meal_id=? ORDER BY id",
                          (cur.lastrowid, m["id"]))
                copied += 1
    return {"copied": copied, "skipped": skipped}


# --- food table import ---------------------------------------------------------------

FOOD_FIELDS = ("name", "brand", "barcode", "kcal", "kj", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sodium", "sat_fat")

# normalised header (lower case, brackets and "_100g" removed) or its first word -> field. BLS codes (GCAL, ZE, ...) and
# Open Food Facts column names are included next to plain German and English headings.
FOOD_SYNONYMS = [
    ("name", ("name", "lebensmittel", "lebensmittelbezeichnung", "bezeichnung", "st", "food", "food name", "description", "produkt", "product", "product name",
              "alim nom fr", "alim nom eng", "alim nom")),   # CIQUAL
    ("brand", ("brand", "brands", "marke", "hersteller")),
    ("barcode", ("barcode", "ean", "gtin", "upc")),
    ("kcal", ("kcal", "gcal", "enercc", "energie kcal", "energy kcal", "energy-kcal", "kalorien", "calories")),
    ("kj", ("kj", "gj", "enercj", "energie kj", "energy kj", "energy-kj")),
    ("protein", ("protein", "proteins", "eiweiß", "eiweiss", "ze", "prot625", "proteine", "protéines", "proteínas")),
    ("carbs", ("carbs", "carbohydrates", "kohlenhydrate", "zk", "cho", "chavl", "carbohydrate", "glucides", "kohlenhydrate verfügbar")),
    ("fat", ("fat", "fett", "zf", "fat total", "lipides")),
    ("fiber", ("fiber", "fibre", "ballaststoffe", "zb", "fibt", "fibres", "nahrungsfasern", "fibre total")),
    ("sugar", ("sugar", "sugars", "zucker", "sucres")),
    ("salt", ("salt", "salz", "nacl", "sel", "salz nacl")),
    ("sodium", ("sodium", "natrium", "na")),
    ("sat_fat", ("saturated fat", "saturated-fat", "gesättigte fettsäuren", "fasat", "saturated", "gesättigte", "ag saturés", "acides gras saturés",
                "fettsäuren gesättigt", "fettsäuren, gesättigt", "fatty acids saturated", "fatty acids, saturated")),
]


def norm_head(h: str) -> str:
    h = re.sub(r"\([^)]*\)|\[[^\]]*\]", " ", (h or "").lower()).replace("_100g", " ").replace("_", " ")
    return re.sub(r"\s+", " ", h).strip()


def guess_food_mapping(headers: list[str]) -> dict:
    norm = [norm_head(h) for h in headers]
    first = [re.split(r"[ ,;:]", n)[0] if n else "" for n in norm]   # "Protéines, N x 6.25" -> "protéines"
    mapping, used = {f: None for f in FOOD_FIELDS}, set()
    for field, names in FOOD_SYNONYMS:
        hit = next((i for i, n in enumerate(norm) if i not in used and n in names), None)
        if hit is None:
            hit = next((i for i, n in enumerate(first) if i not in used and n in names), None)
        if hit is None and field in ("kcal", "kj"):
            hit = next((i for i, h in enumerate(headers) if i not in used and field in h.lower() and (field == "kcal" or "kcal" not in h.lower())), None)
        if hit is not None:
            mapping[field] = hit
            used.add(hit)
    return mapping


def xlsx_rows(data: bytes) -> list[list[str]]:
    """First worksheet of an .xlsx file as rows of text (no external library)."""
    ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", ns):
                shared.append("".join(t.text or "" for t in si.iter("{%s}t" % ns["m"])))
        sheets = sorted(n for n in z.namelist() if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", n))
        if not sheets:
            raise HTTPException(400, "Die Excel-Datei enthält kein Tabellenblatt.")
        if any(z.getinfo(n).file_size > 300_000_000 for n in (*sheets, "xl/sharedStrings.xml") if n in z.namelist()):
            raise HTTPException(400, "Die Excel-Datei ist zu groß.")
        rows = []
        for row in ET.fromstring(z.read(sheets[0])).iter("{%s}row" % ns["m"]):
            cells = {}
            for c in row.findall("m:c", ns):
                col = 0
                for ch in re.match(r"[A-Z]+", c.get("r", "A"))[0]:
                    col = col * 26 + ord(ch) - 64
                t = c.get("t")
                if t == "inlineStr":
                    val = "".join(x.text or "" for x in c.iter("{%s}t" % ns["m"]))
                else:
                    v = c.find("m:v", ns)
                    val = (v.text or "") if v is not None else ""
                    if t == "s" and val:
                        val = shared[int(val)]
                cells[col - 1] = val
            if cells:
                rows.append([cells.get(i, "") for i in range(max(cells) + 1)])
    return rows


def read_table(data: bytes) -> tuple[list[list[str]], bool]:
    """Rows of a CSV/TXT/XLSX upload and whether numbers use decimal commas."""
    if data[:2] == b"PK":
        rows = xlsx_rows(data)
        return rows, any("," in c and re.fullmatch(r"\s*-?\d+,\d+\s*", c) for r in rows[1:40] for c in r)
    for enc in ("utf-8-sig", "cp1252"):
        try:
            text = data.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    delim = detect_delim(text)
    rows = [r for r in csv.reader(io.StringIO(text), delimiter=delim) if any(x.strip() for x in r)]
    return rows, delim == ";" or (delim != "," and any(re.fullmatch(r"\s*-?\d+,\d+\s*", c) for r in rows[1:40] for c in r))


def parse_foods(data: bytes, mapping: dict) -> tuple[list[dict], int]:
    rows, comma = read_table(data)
    if len(rows) < 2:
        raise HTTPException(400, "Die Datei enthält keine Datenzeilen.")
    headers = rows[0]
    sodium_mg = mapping.get("sodium") is not None and "mg" in headers[mapping["sodium"]].lower()
    col = lambda r, f: r[mapping[f]] if mapping.get(f) is not None and mapping[f] < len(r) else ""
    out, bad = [], 0
    for r in rows[1:]:
        name = col(r, "name").strip()
        kcal = to_num(col(r, "kcal"), comma)
        if not kcal and col(r, "kj"):
            kcal = to_num(col(r, "kj"), comma) / 4.184
        if not name or not kcal or kcal > 950:
            bad += 1
            continue
        salt = to_num(col(r, "salt"), comma)
        if not salt and col(r, "sodium"):
            na = to_num(col(r, "sodium"), comma)
            salt = (na / 1000 if sodium_mg or na > 10 else na) * 2.5
        out.append({"name": name[:200], "brand": col(r, "brand").split(",")[0].strip()[:100], "barcode": col(r, "barcode").strip() if col(r, "barcode").strip().isdigit() else "",
                    "kcal": round(kcal, 1), "protein": to_num(col(r, "protein"), comma), "carbs": to_num(col(r, "carbs"), comma), "fat": to_num(col(r, "fat"), comma),
                    "fiber": to_num(col(r, "fiber"), comma), "sugar": to_num(col(r, "sugar"), comma), "salt": round(salt, 3), "sat_fat": to_num(col(r, "sat_fat"), comma)})
    return out, bad


@app.post("/api/import/foods/preview")
async def foods_preview(request: Request, mapping: str = ""):
    """Upload (raw body) of a food table: which column is which, plus a few parsed rows."""
    data = await request.body()
    if not data:
        raise HTTPException(400, "Leere Datei")
    try:
        rows, _ = read_table(data)
    except (zipfile.BadZipFile, ET.ParseError, KeyError):
        raise HTTPException(400, "Die Datei konnte nicht gelesen werden.")
    if len(rows) < 2:
        raise HTTPException(400, "Die Datei enthält keine Datenzeilen.")
    headers = [h.strip() for h in rows[0]]
    try:
        chosen = {k: v for k, v in json.loads(mapping).items() if k in FOOD_FIELDS} if mapping else guess_food_mapping(headers)
    except (ValueError, AttributeError):
        raise HTTPException(400, "bad mapping")
    mapping = {f: chosen.get(f) for f in FOOD_FIELDS}
    foods, bad = parse_foods(data, mapping) if mapping["name"] is not None and (mapping["kcal"] is not None or mapping["kj"] is not None) else ([], len(rows) - 1)
    preset = "BLS" if any(h.upper() in ("SBLS", "GCAL") or h.startswith("BLS") for h in headers) else ("Open Food Facts" if "product_name" in [h.lower() for h in headers] else "")
    return {"headers": headers, "mapping": mapping, "rows": len(rows) - 1, "items": len(foods), "skipped": bad, "sample": foods[:5], "preset": preset}


@app.post("/api/import/foods")
async def foods_import(request: Request, mapping: str, category: str = "", x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    try:
        mp = {k: v for k, v in json.loads(mapping).items() if k in FOOD_FIELDS}
    except (ValueError, AttributeError):
        raise HTTPException(400, "bad mapping")
    if mp.get("name") is None or (mp.get("kcal") is None and mp.get("kj") is None):
        raise HTTPException(400, "Spalten für Name und Kalorien (kcal oder kJ) zuordnen")
    foods, bad = parse_foods(await request.body(), mp)
    if len(foods) > 50000:
        raise HTTPException(400, "Zu viele Zeilen (höchstens 50 000)")
    with db.conn() as c:
        have = {(r["name"].strip().lower(), r["brand"].strip().lower()) for r in c.execute("SELECT name, brand FROM foods WHERE owner=?", (owner,))}
        new = []
        for f in foods:
            key = (f["name"].lower(), f["brand"].lower())
            if key in have:
                continue
            have.add(key)
            new.append((owner, f["name"], f["brand"], f["kcal"], f["protein"], f["carbs"], f["fat"], f["fiber"], f["sugar"], f["salt"], f["sat_fat"], 100, category.strip()[:60], f["barcode"]))
        c.executemany("INSERT INTO foods(owner,name,brand,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,serving_g,category,barcode) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", new)
    return {"added": len(new), "duplicates": len(foods) - len(new), "skipped": bad}


# --- check own foods against the online databases -----------------------------------------

def tokens(s: str) -> set:
    return {t for t in re.findall(r"[a-zäöüß0-9]+", s.lower()) if len(t) > 1}


def similarity(a: str, b: str) -> float:
    x, y = tokens(a), tokens(b)
    return len(x & y) / len(x | y) if x and y else 0.0


COMPARE = (("kcal", 0.10, 15), ("protein", 0.15, 2), ("carbs", 0.15, 2), ("fat", 0.15, 2))   # relative and absolute tolerance


@app.get("/api/foods/{fid}/check")
def check_food(fid: int, sources: str = "off", x_remote_user_id: str | None = Header(None)):
    """Compare one own food with the best online match (by barcode, else by name). Needs the feature "sources"."""
    import httpx
    from extras5 import SOURCES, cached_search
    owner = user_from(x_remote_user_id)
    if not feature_on(owner, "sources"):
        raise HTTPException(403, "Weitere Datenquellen sind nicht aktiviert")
    with db.conn() as c:
        f = c.execute("SELECT * FROM foods WHERE id=? AND owner=?", (fid, owner)).fetchone()
    if not f:
        raise HTTPException(404, "food not found")
    f = dict(f)
    q = f"{f['brand']} {f['name']}".strip()
    best, score, error = None, 0.0, ""
    for s in [x for x in sources.split(",") if x in SOURCES]:
        try:
            res, _ = cached_search(s, "" if f["barcode"] else q, f["barcode"])
        except HTTPException as e:
            error = str(e.detail)
            continue
        except (httpx.HTTPError, ValueError, KeyError):
            error = "nicht erreichbar"
            continue
        for r in res:
            sc = 1.0 if f["barcode"] else similarity(q, f"{r['brand']} {r['name']}")
            if sc > score:
                best, score = r, sc
    if not best or score < 0.5:
        return {"level": "error" if error and not best else "none", "error": error, "match": None, "diff": {}}
    diff = {k: round(best[k] - f[k], 1) for k, _, _ in COMPARE}
    differs = any(abs(diff[k]) > max(absol, rel * abs(f[k])) for k, rel, absol in COMPARE)
    return {"level": "differs" if differs else "ok", "match": best, "diff": diff, "score": round(score, 2), "error": ""}
