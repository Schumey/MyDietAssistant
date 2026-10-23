"""Recipe import from web pages: fetch the page, read the schema.org Recipe data (JSON-LD or microdata)
and turn the ingredient lines into grams and matches against the user's own foods. No network code runs on import."""
import html
import ipaddress
import json
import re
import socket
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse

import httpx

MAX_BYTES = 3_000_000
UA = {"User-Agent": "Mozilla/5.0 (compatible; MyDietAssistant/1.1; +https://github.com/Schumey/MyDietAssistant)",
      "Accept": "text/html,application/xhtml+xml", "Accept-Language": "de,en;q=0.8"}


# --- fetching ------------------------------------------------------------------

def check_public(url: str):
    """Only http(s) pages on public addresses: the add-on must not become a way into the home network."""
    u = urlparse(url)
    if u.scheme not in ("http", "https") or not u.hostname:
        raise ValueError("Bitte eine Adresse mit http:// oder https:// angeben.")
    try:
        infos = socket.getaddrinfo(u.hostname, u.port or (443 if u.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        raise ValueError("Die Adresse wurde nicht gefunden.")
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if not ip.is_global:
            raise ValueError("Adressen im lokalen Netz sind nicht erlaubt.")


def fetch_page(url: str, get=httpx.stream) -> str:
    """Download a page (follows up to 4 redirects, each checked, at most 3 MB)."""
    for _ in range(5):
        check_public(url)
        with get("GET", url, headers=UA, timeout=12, follow_redirects=False) as r:
            if r.is_redirect:
                url = urljoin(url, r.headers.get("location", ""))
                continue
            if r.status_code >= 400:
                raise ValueError(f"Die Seite antwortete mit Fehler {r.status_code}.")
            data = b""
            for chunk in r.iter_bytes():
                data += chunk
                if len(data) > MAX_BYTES:
                    raise ValueError("Die Seite ist zu groß.")
            enc = r.charset_encoding or "utf-8"
            return data.decode(enc, errors="replace")
    raise ValueError("Zu viele Weiterleitungen.")


# --- schema.org Recipe -----------------------------------------------------------

def _nodes(data):
    if isinstance(data, list):
        for d in data:
            yield from _nodes(d)
    elif isinstance(data, dict):
        yield data
        yield from _nodes(data.get("@graph", []))


def _is_recipe(n: dict) -> bool:
    t = n.get("@type")
    return "Recipe" in t if isinstance(t, list) else t == "Recipe"


def clean(s) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", str(s)))).strip()


def find_recipe(page: str) -> dict | None:
    for m in re.finditer(r"<script[^>]+type=[\"']application/ld\+json[\"'][^>]*>(.*?)</script>", page, flags=re.S | re.I):
        try:
            data = json.loads(html.unescape(m.group(1)) if "&quot;" in m.group(1) else m.group(1))
        except ValueError:
            continue
        for n in _nodes(data):
            if _is_recipe(n):
                return n
    ings = [clean(x) for x in re.findall(r"itemprop=[\"'](?:recipeIngredient|ingredients)[\"'][^>]*>(.*?)</", page, flags=re.S | re.I)]
    if ings:   # old microdata markup
        title = re.search(r"<h1[^>]*>(.*?)</h1>", page, flags=re.S | re.I) or re.search(r"<title[^>]*>(.*?)</title>", page, flags=re.S | re.I)
        steps = [clean(x) for x in re.findall(r"itemprop=[\"']recipeInstructions[\"'][^>]*>(.*?)</", page, flags=re.S | re.I)]
        return {"name": clean(title.group(1)) if title else "", "recipeIngredient": ings, "recipeInstructions": steps}
    return None


def _steps(v) -> list[str]:
    if isinstance(v, str):
        parts = re.split(r"\r?\n|(?<=[.!?])\s+(?=[A-ZÄÖÜ])", clean_keep_lines(v))
        return [p.strip() for p in parts if p.strip()]
    out = []
    if isinstance(v, list):
        for x in v:
            out += _steps(x)
    elif isinstance(v, dict):
        out += _steps(v.get("itemListElement") or v.get("text") or v.get("name") or "")
    return out


def clean_keep_lines(s: str) -> str:
    s = re.sub(r"<br\s*/?>|</p>|</li>", "\n", str(s), flags=re.I)
    return "\n".join(clean(line) for line in html.unescape(re.sub(r"<[^>]+>", " ", s)).split("\n"))


def first_number(v) -> float | None:
    if isinstance(v, (list, tuple)):
        for x in v:
            n = first_number(x)
            if n is not None:
                return n
        return None
    m = re.search(r"\d+(?:[.,]\d+)?", str(v or ""))
    return float(m.group().replace(",", ".")) if m else None


def nutrition_of(n: dict) -> dict | None:
    """Per-portion values the page states (kcal, protein, carbs, fat), as a plausibility check for the computed ones."""
    nu = n.get("nutrition")
    if not isinstance(nu, dict):
        return None
    kcal = first_number(nu.get("calories"))
    if kcal is not None and re.search(r"kj", str(nu.get("calories")), re.I) and not re.search(r"kcal|cal", str(nu.get("calories")), re.I):
        kcal /= 4.184
    out = {"kcal": kcal, "protein": first_number(nu.get("proteinContent")), "carbs": first_number(nu.get("carbohydrateContent")),
           "fat": first_number(nu.get("fatContent"))}
    return {k: round(v, 1) for k, v in out.items() if v is not None} or None


# --- ingredient lines --------------------------------------------------------------

FRACTIONS = {"½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75, "⅛": 0.125, "⅕": 0.2}
# unit -> grams (liquids count as water: ml = g, a rough but usual approximation); None = a piece, resolved with the food's serving size
UNITS = {"g": 1, "gr": 1, "gramm": 1, "kg": 1000, "mg": 0.001, "ml": 1, "cl": 10, "dl": 100, "l": 1000, "liter": 1000,
         "el": 15, "essl": 15, "esslöffel": 15, "tbsp": 15, "tablespoon": 15, "tablespoons": 15,
         "tl": 5, "teel": 5, "teelöffel": 5, "tsp": 5, "teaspoon": 5, "teaspoons": 5,
         "prise": 0.5, "prisen": 0.5, "msp": 0.5, "messerspitze": 0.5, "pinch": 0.5,
         "cup": 240, "cups": 240, "tasse": 240, "tassen": 240, "oz": 28.35, "ounce": 28.35, "ounces": 28.35,
         "lb": 453.6, "lbs": 453.6, "pound": 453.6, "pounds": 453.6, "pfund": 500, "glas": 200, "becher": 150,
         "stück": None, "stücke": None, "stk": None, "scheibe": None, "scheiben": None, "zehe": None, "zehen": None,
         "bund": None, "dose": None, "dosen": None, "packung": None, "pkg": None, "päckchen": None, "kopf": None,
         "piece": None, "pieces": None, "slice": None, "slices": None, "clove": None, "cloves": None, "can": None}
# a few pieces have a typical weight when the library's food gives none
PIECE_G = {"zehe": 4, "zehen": 4, "clove": 4, "cloves": 4, "scheibe": 30, "scheiben": 30, "slice": 30, "slices": 30,
           "bund": 50, "dose": 400, "dosen": 400, "can": 400, "päckchen": 15, "packung": 250}
STOP = {"und", "oder", "mit", "von", "frisch", "frische", "frischer", "frisches", "gehackt", "gehackte", "gerieben", "geriebene", "ca", "etwa",
        "evtl", "nach", "belieben", "fein", "grob", "klein", "große", "großer", "kleine", "kleiner", "der", "die", "das", "dem", "für", "zum", "zur",
        "the", "and", "of", "fresh", "chopped", "large", "small", "medium", "optional", "extra", "bio", "etwas", "ein", "eine", "einen", "einige"}


def parse_qty(s: str) -> tuple[float | None, str]:
    """Leading quantity ("1 1/2", "2-3", "½", "1,5") and the rest of the line."""
    s = s.strip()
    total, used = None, 0
    pos = 0
    while True:
        m = re.match(r"\s*(\d+)\s*[–\-]\s*(\d+)", s[pos:]) if total is None else None
        if m:   # range: take the upper value
            total, pos = float(m.group(2)), pos + m.end()
            break
        m = re.match(r"\s*(\d+(?:[.,]\d+)?)(?:\s*/\s*(\d+))?", s[pos:])
        f = re.match(r"\s*([½⅓⅔¼¾⅛⅕])", s[pos:])
        if m and m.group(2) and float(m.group(2)):
            v = float(m.group(1).replace(",", ".")) / float(m.group(2))
        elif m:
            v = float(m.group(1).replace(",", "."))
        elif f:
            v = FRACTIONS[f.group(1)]
        else:
            break
        total = (total or 0) + v
        pos += (m or f).end()
        used += 1
        if used > 2 or not re.match(r"\s+(\d+/\d+|[½⅓⅔¼¾⅛⅕])", s[pos:]):
            break
    return total, s[pos:].strip()


def parse_ingredient(line: str) -> dict:
    """{"qty", "unit", "grams" (None = unknown/piece), "name", "text"} for a line like "200 g Weizenmehl, gesiebt"."""
    text = clean(line)
    qty, rest = parse_qty(text)
    unit = ""
    m = re.match(r"([A-Za-zÄÖÜäöüß.]+)\b\.?", rest)
    if qty is not None and m and m.group(1).lower().rstrip(".") in UNITS:
        unit = m.group(1).lower().rstrip(".")
        rest = rest[m.end():].lstrip(" .")
    else:
        m2 = re.match(r"(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)\b", text, flags=re.I)   # "250g Mehl" without a gap is handled by parse_qty; this guards odd input
        if qty is None and m2:
            qty, unit, rest = float(m2.group(1).replace(",", ".")), m2.group(2).lower(), text[m2.end():].strip()
    rest = re.sub(r"^(of|von|vom)\s+", "", rest, flags=re.I)
    name = re.split(r",|;| – | - |\(| oder ", rest)[0].strip() or rest
    grams = None
    if qty is not None and unit and UNITS.get(unit) is not None:
        grams = qty * UNITS[unit]
    elif qty is not None and unit:   # "1 Dose Tomaten (400 g)": the weight in brackets belongs to one piece
        w = re.search(r"\((?:ca\.?\s*)?(\d+(?:[.,]\d+)?)\s*(g|ml)\)", text)
        if w:
            grams = qty * float(w.group(1).replace(",", "."))
    return {"qty": qty, "unit": unit, "grams": grams, "name": name, "text": text}


def _stem(w: str) -> str:
    for suf in ("en", "er", "n", "e", "s"):
        if len(w) > 4 and w.endswith(suf):
            return w[:-len(suf)]
    return w


def tokens(s: str) -> list[str]:
    return [_stem(w) for w in re.findall(r"[a-zäöüß]+", s.lower()) if len(w) > 2 and w not in STOP]


def _hit(a: str, b: str) -> bool:
    """Same word, or one is the ending/beginning of the other (German compounds: "Weizenmehl" ~ "Mehl")."""
    if a == b:
        return True
    short, long_ = (a, b) if len(a) <= len(b) else (b, a)
    return len(short) >= 4 and (long_.endswith(short) or long_.startswith(short))


def best_food(name: str, foods: list[dict]) -> dict | None:
    want = tokens(name)
    if not want:
        return None
    best, best_score = None, 0.0
    for f in foods:
        ft = tokens(f["name"])
        if not ft:
            continue
        hits = sum(1 for t in ft if any(_hit(t, w) for w in want))
        if not hits:
            continue
        cover = hits / len(ft)                       # how much of the food's name appears in the ingredient
        score = cover * 0.7 + (hits / len(want)) * 0.3 - len(ft) * 0.001
        if cover >= 0.5 and score > best_score:
            best, best_score = f, score
    return best


NUTR = ("kcal", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sat_fat")


def build_items(lines: list[str], foods: list[dict]) -> list[dict]:
    """Recipe items from ingredient lines: matched ones carry the food's values for the amount, others have zero values
    and matched=False so the user can pick a food (or keep them as they are, e.g. water)."""
    items = []
    for line in lines:
        p = parse_ingredient(line)
        f = best_food(p["name"], foods)
        grams = p["grams"]
        if grams is None and p["qty"] is not None and f:   # pieces: use the food's serving size
            piece = PIECE_G.get(p["unit"]) if p["unit"] else None
            grams = p["qty"] * (piece or f.get("serving_g") or 0) or None
        item = {"name": f["name"] if f else p["name"] or p["text"], "grams": round(grams, 1) if grams else 0, "text": p["text"], "matched": bool(f),
                "qty": p["qty"], "unit": p["unit"]}
        k = (grams or 0) / 100
        for key in NUTR:
            item[key] = round((f.get(key) or 0) * k, 2) if f else 0
        items.append(item)
    return items


MAX_LOOKUPS = 25
# typical weight of one piece (or one bunch, stick, capsule …) for staples without a gram amount, and the database search term where
# it differs from the ingredient name; only used for ingredients the library does not know
STAPLE_PIECE = {"blumenkohl": (600, ""), "brokkoli": (400, ""), "zwiebel": (80, ""), "schalotte": (30, ""), "knoblauch": (4, ""),
                "kartoffel": (100, ""), "süßkartoffel": (250, ""), "tomate": (100, ""), "paprika": (150, ""), "karotte": (80, ""),
                "möhre": (80, ""), "gurke": (400, ""), "zucchini": (250, ""), "aubergine": (300, ""), "lauch": (200, ""), "porree": (200, ""),
                "apfel": (150, ""), "banane": (120, ""), "orange": (200, ""), "avocado": (150, ""), "zitrone": (80, ""), "limette": (70, ""),
                "chili": (10, ""), "ei": (60, ""), "zimtstange": (3, "zimt"), "kardamomkapsel": (0.3, "kardamom"), "lorbeerblatt": (0.2, "lorbeer"),
                "nelke": (0.1, "gewürznelken"), "sternanis": (1, "anis"), "vanilleschote": (3, "vanille")}
JUICE_SHARE = {"zitrone": 0.5, "limette": 0.45}   # "(Saft davon)": about half the fruit's weight


def staple_piece(item: dict) -> tuple[float, str] | None:
    """(grams of the whole amount, search term) for a counted ingredient like "1 Blumenkohl" or "1,5 Bund Koriander"."""
    qty = item.get("qty")
    if not qty:
        return None
    name = item["name"].lower()
    key = next((k for k in STAPLE_PIECE if k in name), None)
    per, query = STAPLE_PIECE[key] if key else (None, "")
    if item.get("unit") in PIECE_G:   # bunch, clove, slice, can …: the unit decides the weight
        per = PIECE_G[item["unit"]]
    if per is None:
        return None
    if key in JUICE_SHARE and "saft" in item["text"].lower():
        per *= JUICE_SHARE[key]
    return qty * per, query or item["name"]


def _qualifies(hit_name: str, head: str) -> bool:
    """The database product is the ingredient itself or a compound ending in it (Weizenmehl for Mehl), not a dish that merely
    mentions it (curry simmer sauce for Currypulver)."""
    return any(t == head or t.endswith(head) for t in tokens(hit_name))


def consensus(name: str, hits: list[dict]) -> dict | None:
    """Per-100 g values for a staple from database hits: only hits that are the ingredient itself count, the ones with the
    shortest names (closest to the plain ingredient) come first, and the median of up to five of them smooths out odd products."""
    want = tokens(name)
    if not want:
        return None
    ok = [h for h in hits if _qualifies(h["name"], want[-1])]
    ok = sorted(ok, key=lambda h: len(tokens(h["name"])))[:5]
    if not ok:
        return None
    mid = lambda key: sorted(h.get(key) or 0 for h in ok)[len(ok) // 2]
    return {"source": ok[0]["source"], **{k: mid(k) for k in NUTR}}


def fill_missing(items: list[dict], search) -> None:
    """Complete unmatched ingredients from nutrition databases (`search` is a function term -> hits, or a list of them tried in
    order: the first database with a fitting product wins, so a rate-limited one is only asked when needed). Counted ingredients without
    grams get a typical piece weight first. Filled items become matched=True and carry `source`, so the editor shows them as a
    database guess to review. Failing lookups leave the item as it was."""
    plan = []
    for i in items:
        if i["matched"] or not i["name"]:
            continue
        if i["grams"] > 0:
            plan.append((i, i["grams"], i["name"]))
        elif (g := staple_piece(i)):
            plan.append((i, g[0], g[1]))
    plan = plan[:MAX_LOOKUPS]

    searches = search if isinstance(search, (list, tuple)) else [search]

    def one(entry):
        for fn in searches:
            try:
                per100 = consensus(entry[2], fn(entry[2]))
            except Exception:   # offline, rate limit, odd payload: try the next database, else the ingredient stays unmatched
                continue
            if per100:
                return per100
        return None
    with ThreadPoolExecutor(max_workers=6) as pool:
        for (item, grams, _), per100 in zip(plan, pool.map(one, plan)):
            if per100:
                item.update({key: round(per100[key] * grams / 100, 2) for key in NUTR})
                item["grams"] = round(grams, 1)
                item["matched"], item["source"] = True, per100["source"]


def to_draft(page: str, url: str, foods: list[dict]) -> dict:
    n = find_recipe(page)
    if not n:
        raise ValueError("Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).")
    return draft_from_node(n, url, foods)


def draft_from_node(n: dict, url: str, foods: list[dict]) -> dict:
    """Draft from a schema.org-shaped recipe dict (also used for recipes that come from Mealie)."""
    ings = n.get("recipeIngredient") or n.get("ingredients") or []
    if isinstance(ings, str):
        ings = [ings]
    ings = [clean(i) for i in ings if clean(i)]
    if not ings:
        raise ValueError("Das Rezept enthält keine Zutaten.")
    name = clean(n.get("name") or "")
    portions = first_number(n.get("recipeYield")) or 1
    draft = {"name": name or "Importiertes Rezept", "portions": portions if portions > 0 else 1, "source": url,
             "instructions": "\n".join(_steps(n.get("recipeInstructions") or "")), "items": build_items(ings, foods),
             "nutrition": nutrition_of(n)}
    return draft
