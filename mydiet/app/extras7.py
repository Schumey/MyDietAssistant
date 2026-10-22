"""Generic table import (Cronometer, FDDB, Yazio, Google Fit, other CSV exports) and bulk records (Apple Health).

The table importer detects the delimiter and guesses which column is which from the header names (German and
English); the user can correct the guess in the preview before importing."""
import csv
import io
import re
from datetime import date

from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from main import app, publish, user_from

FIELDS = ("date", "time", "meal", "name", "amount", "kcal", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sodium", "sat_fat", "weight", "metric", "unit")

# header text (lower case, units in brackets removed) -> field; first match in this order wins
SYNONYMS = [
    ("date", ("date", "datum", "day", "tag")),
    ("time", ("time", "uhrzeit", "zeit")),
    ("meal", ("meal", "mahlzeit", "group", "daytime", "meal type", "category")),
    ("name", ("food name", "name", "food", "lebensmittel", "bezeichnung", "produkt", "product", "item", "description", "beschreibung")),
    ("amount", ("amount", "menge", "quantity", "grams", "gramm", "serving size", "portion")),
    ("kcal", ("energy", "kalorien", "calories", "kcal", "energie", "brennwert", "energy kcal")),
    ("protein", ("protein", "eiweiß", "eiweiss", "proteins", "proteine")),
    ("carbs", ("carbs", "carbohydrates", "kohlenhydrate", "carbohydrate", "net carbs", "kh")),
    ("fat", ("fat", "fett", "fats", "total fat")),
    ("fiber", ("fiber", "fibre", "ballaststoffe")),
    ("sugar", ("sugars", "sugar", "zucker")),
    ("salt", ("salt", "salz")),
    ("sodium", ("sodium", "natrium")),
    ("sat_fat", ("saturated", "saturated fat", "gesättigte fettsäuren", "gesättigte", "sat fat")),
    ("metric", ("metric",)),
    ("unit", ("unit", "einheit")),
    ("weight", ("weight", "gewicht", "körpergewicht", "average weight", "avg weight")),
]


def sniff(text: str) -> tuple[str, list[list[str]]]:
    text = text.lstrip("﻿")
    head = text[:4000]
    delim = max(",;\t", key=lambda d: head.count(d))
    rows = [r for r in csv.reader(io.StringIO(text), delimiter=delim) if any(x.strip() for x in r)]
    if len(rows) < 2:
        raise HTTPException(400, "Die Datei enthält keine Datenzeilen.")
    return delim, rows


def norm_header(h: str) -> str:
    h = re.sub(r"\([^)]*\)", " ", h.lower())          # "Energy (kcal)" -> "energy"
    return re.sub(r"\s+", " ", h.replace("_", " ")).strip()


def guess_mapping(headers: list[str]) -> dict[str, int | None]:
    norm = [norm_header(h) for h in headers]
    raw = [h.lower() for h in headers]
    mapping: dict[str, int | None] = {f: None for f in FIELDS}
    used: set[int] = set()
    for field, names in SYNONYMS:
        for syn in names:
            hit = next((i for i, n in enumerate(norm) if i not in used and (n == syn or (field == "kcal" and "kcal" in raw[i]))), None)
            if hit is None and field in ("kcal", "weight", "sodium"):
                hit = next((i for i, n in enumerate(norm) if i not in used and n.startswith(syn)), None)
            if hit is not None:
                mapping[field] = hit
                used.add(hit)
                break
    if any(n.startswith("average weight") for n in norm):      # Google Fit: "Calories" there means burned calories
        for f in ("kcal", "protein", "carbs", "fat", "name", "meal", "amount"):
            mapping[f] = None
    if mapping["kcal"] is not None and "kj" in raw[mapping["kcal"]] and "kcal" not in raw[mapping["kcal"]]:
        mapping["kcal"] = None
    return mapping


def preset_name(headers: list[str], mapping: dict) -> str:
    h = " ".join(x.lower() for x in headers)
    if "food name" in h and "energy" in h:
        return "Cronometer"
    if mapping["metric"] is not None and mapping["unit"] is not None:
        return "Cronometer (Biometrie)"
    if "average weight" in h or "max weight" in h:
        return "Google Fit"
    if "kalorien" in h or "bezeichnung" in h:
        return "FDDB / deutsch"
    return ""


def to_num(s: str, decimal_comma: bool = False) -> float:
    m = re.match(r"\s*(-?[\d.,]+)", s or "")
    if not m:
        return 0.0
    v = m[1]
    if "," in v and "." in v:
        v = v.replace(".", "").replace(",", ".") if v.rfind(",") > v.rfind(".") else v.replace(",", "")
    elif "," in v:
        v = v.replace(",", ".") if decimal_comma or len(v.split(",")[-1]) != 3 else v.replace(",", "")
    try:
        return float(v)
    except ValueError:
        return 0.0


def date_order(values: list[str]) -> str:
    """'dmy' or 'mdy' for dd/mm/yyyy style dates, decided by the data (a part > 12 gives it away)."""
    first = second = False
    for v in values:
        m = re.match(r"\s*(\d{1,2})[./-](\d{1,2})[./-]\d{2,4}", v or "")
        if m:
            first |= int(m[1]) > 12
            second |= int(m[2]) > 12
    if first:
        return "dmy"
    if second:
        return "mdy"
    return "dmy" if any("." in (v or "") for v in values[:20]) else "mdy"


def to_day(s: str, order: str) -> str | None:
    s = (s or "").strip()
    m = re.match(r"(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m:
        y, mo, d = map(int, m.groups())
    else:
        m = re.match(r"(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})", s)
        if not m:
            return None
        a, b, y = map(int, m.groups())
        mo, d = (b, a) if order == "dmy" else (a, b)
        if y < 100:
            y += 2000
    try:
        return date(y, mo, d).isoformat()
    except ValueError:
        return None


def to_grams(amount: str, decimal_comma: bool) -> float:
    """'100 g' / '2,5 oz' -> grams; amounts in pieces or cups stay 0 (the entry keeps its calories only)."""
    m = re.match(r"\s*(-?[\d.,]+)\s*([A-Za-zµ]*)", amount or "")
    if not m:
        return 0.0
    n, unit = to_num(m[1], decimal_comma), m[2].lower()
    if unit in ("g", "gr", "gram", "grams", "gramm", "ml"):
        return n
    if unit in ("kg",):
        return n * 1000
    if unit in ("oz", "ounce", "ounces"):
        return n * 28.3495
    if unit == "" and re.fullmatch(r"\s*[\d.,]+\s*", amount):
        return n        # bare number in a grams column
    return 0.0


class TablePreviewIn(BaseModel):
    text: str
    mapping: dict[str, int | None] | None = None    # the user's corrections; guessed from the headers when missing


class TableImportIn(BaseModel):
    text: str
    mapping: dict[str, int | None]
    replace: bool = False          # clear existing entries on the imported days first
    weights: bool = True
    weight_unit: str = "kg"        # kg | lb | st (for a plain weight column without unit column)


def parse_table(text: str, mapping: dict[str, int | None], weight_unit: str = "kg") -> dict:
    delim, rows = sniff(text)
    body = rows[1:]
    cell = lambda r, f: r[mapping[f]].strip() if mapping.get(f) is not None and mapping[f] < len(r) else ""
    if mapping.get("date") is None:
        raise HTTPException(400, "Bitte die Spalte mit dem Datum zuordnen.")
    order = date_order([cell(r, "date") for r in body])
    dc = delim in (";", "\t") or any(re.search(r"\d,\d", cell(r, "kcal")) for r in body[:30])
    items, weights = [], {}
    for r in body:
        day = to_day(cell(r, "date"), order)
        if not day:
            continue
        # weight rows: a weight column, or a metric/unit/amount layout (Cronometer biometrics)
        wv = None
        if mapping.get("metric") is not None and "weight" in cell(r, "metric").lower():
            wv, unit = to_num(cell(r, "amount") or cell(r, "weight"), dc), (cell(r, "unit") or weight_unit).lower()
        elif mapping.get("weight") is not None and cell(r, "weight") and not cell(r, "kcal"):
            wv, unit = to_num(cell(r, "weight"), dc), weight_unit
        if wv:
            kg = wv * 0.45359237 if unit.startswith(("lb", "pound")) else wv * 6.35029 if unit.startswith("st") else wv
            if 20 <= kg <= 500:
                weights[day] = round(kg, 2)
            continue
        if mapping.get("metric") is not None:
            continue       # other biometrics
        kcal = to_num(cell(r, "kcal"), dc)
        if not cell(r, "kcal") or (not kcal and not cell(r, "name")):
            continue
        salt = to_num(cell(r, "salt"), dc) or to_num(cell(r, "sodium"), dc) * 2.5 / 1000
        items.append({"day": day, "meal": cell(r, "meal"), "time": cell(r, "time")[:5] if re.match(r"\d{1,2}:\d{2}", cell(r, "time")) else None,
                      "name": cell(r, "name") or "Import", "grams": to_grams(cell(r, "amount"), dc), "kcal": kcal,
                      "protein": to_num(cell(r, "protein"), dc), "carbs": to_num(cell(r, "carbs"), dc), "fat": to_num(cell(r, "fat"), dc),
                      "fiber": to_num(cell(r, "fiber"), dc), "sugar": to_num(cell(r, "sugar"), dc), "salt": salt, "sat_fat": to_num(cell(r, "sat_fat"), dc)})
    return {"items": items, "weights": weights, "delimiter": delim, "order": order}


@app.post("/api/import/table/preview")
def table_preview(p: TablePreviewIn):
    delim, rows = sniff(p.text)
    mapping = p.mapping or guess_mapping(rows[0])
    sample = parse_table(p.text, mapping) if mapping.get("date") is not None else {"items": [], "weights": {}, "order": ""}
    days = sorted({i["day"] for i in sample["items"]} | set(sample["weights"]))
    return {"headers": rows[0], "rows": rows[1:6], "mapping": mapping, "preset": preset_name(rows[0], mapping), "delimiter": delim,
            "count": len(rows) - 1, "items": len(sample["items"]), "weights": len(sample["weights"]), "from": days[0] if days else None,
            "to": days[-1] if days else None}


ALIASES = {"breakfast": "frühstück", "brunch": "frühstück", "lunch": "mittagessen", "dinner": "abendessen", "supper": "abendessen",
           "snack": "snacks", "snacks": "snacks", "mittag": "mittagessen", "abend": "abendessen"}


def find_meal(c, owner: str, name: str, cache: dict) -> int:
    """Own meal by name (prefix match either way), created when missing; empty name -> first meal."""
    key = ALIASES.get(name.strip().lower(), name.strip().lower())
    if key in cache:
        return cache[key]
    own = [dict(r) for r in c.execute("SELECT id, name FROM meals WHERE owner=? ORDER BY position", (owner,))]
    if not key:
        cache[key] = own[0]["id"]
    else:
        hit = next((m for m in own if m["name"].lower() == key), None) or \
            next((m for m in own if m["name"].lower().startswith(key) or key.startswith(m["name"].lower())), None)
        if hit:
            cache[key] = hit["id"]
        else:
            pos = c.execute("SELECT COALESCE(MAX(position),-1)+1 FROM meals WHERE owner=?", (owner,)).fetchone()[0]
            cache[key] = c.execute("INSERT INTO meals(owner,name,position) VALUES(?,?,?)", (owner, name.strip(), pos)).lastrowid
    return cache[key]


@app.post("/api/import/table")
def table_import(p: TableImportIn, x_remote_user_id: str | None = Header(None), x_remote_user_display_name: str | None = Header(None)):
    d = parse_table(p.text, p.mapping, p.weight_unit)
    owner = user_from(x_remote_user_id)
    cache: dict = {}
    with db.conn() as c:
        db.ensure_meals(c, owner)
        if p.replace:
            c.executemany("DELETE FROM entries WHERE owner=? AND day=?", [(owner, x) for x in {i["day"] for i in d["items"]}])
        for it in d["items"]:
            c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      (owner, it["day"], find_meal(c, owner, it["meal"], cache), it["name"], it["grams"], it["kcal"], it["protein"], it["carbs"],
                       it["fat"], it["fiber"], it["sugar"], it["salt"], it["sat_fat"], it["time"]))
        nw = 0
        if p.weights:
            for day, kg in d["weights"].items():
                c.execute("INSERT OR REPLACE INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, day, kg))
                nw += 1
    publish(owner, x_remote_user_display_name or owner)
    return {"entries": len(d["items"]), "weights": nw, "days": len({i["day"] for i in d["items"]})}


# --- bulk records read in the browser (Apple Health export.xml is too large to upload) ---------------

class RecordsIn(BaseModel):
    source: str = "Apple Health"
    weights: dict[str, float] = {}                       # day -> kg
    nutrition: dict[str, dict[str, float]] = {}          # day -> {kcal, protein, carbs, fat}
    replace: bool = False


@app.post("/api/import/records")
def records_import(r: RecordsIn, x_remote_user_id: str | None = Header(None), x_remote_user_display_name: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    days = [x for x in r.nutrition if re.fullmatch(r"\d{4}-\d{2}-\d{2}", x)]
    cache: dict = {}
    with db.conn() as c:
        db.ensure_meals(c, owner)
        for day in days:
            t = r.nutrition[day]
            if not t.get("kcal"):
                continue
            if r.replace:
                c.execute("DELETE FROM entries WHERE owner=? AND day=? AND name=?", (owner, day, f"Tagessumme ({r.source})"))
            c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat) VALUES(?,?,?,?,?,?,?,?,?)",
                      (owner, day, find_meal(c, owner, "", cache), f"Tagessumme ({r.source})", 0, t["kcal"], t.get("protein", 0), t.get("carbs", 0), t.get("fat", 0)))
        nw = 0
        for day, kg in r.weights.items():
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) and 20 <= kg <= 500:
                c.execute("INSERT OR REPLACE INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, day, round(kg, 2)))
                nw += 1
    publish(owner, x_remote_user_display_name or owner)
    return {"entries": len(days), "weights": nw}
