"""Recipe import from a Mealie server (https://mealie.io): list and read recipes through its REST API with an API token and
convert them into the schema.org-shaped dict that recipe_import turns into a draft. Nothing is written to Mealie."""
import ipaddress
import re
import socket
from urllib.parse import quote, urlparse

import httpx

PER_PAGE = 30


def normalize_url(url: str) -> str:
    """Base address of the Mealie server; only http(s) without credentials, and never the add-on itself or a link-local address
    (cloud metadata etc.). The home network is allowed on purpose: that is where Mealie runs."""
    url = (url or "").strip()
    if not url:
        return ""
    if "://" not in url:
        url = "http://" + url
    u = urlparse(url)
    if u.scheme not in ("http", "https") or not u.hostname or u.username or u.password:
        raise ValueError("Bitte eine Adresse wie http://mealie:9000 angeben.")
    try:
        infos = socket.getaddrinfo(u.hostname, u.port or 80, proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        infos = []   # a server that is down right now may still be configured
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_loopback or ip.is_link_local or ip.is_unspecified:
            raise ValueError("Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).")
    return f"{u.scheme}://{u.netloc}{u.path.rstrip('/')}"


def get_json(base: str, token: str, path: str, params: dict | None = None):
    try:
        r = httpx.get(base + path, params=params, headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
                      timeout=15, follow_redirects=True)
    except httpx.HTTPError:
        raise ValueError("Mealie ist nicht erreichbar.")
    if r.status_code in (401, 403):
        raise ValueError("Mealie hat den Zugriffstoken abgelehnt.")
    if r.status_code == 404:
        raise ValueError("Nicht gefunden (Adresse oder Rezept prüfen).")
    if r.status_code >= 400:
        raise ValueError(f"Mealie antwortete mit Fehler {r.status_code}.")
    try:
        return r.json()
    except ValueError:
        raise ValueError("Unter dieser Adresse läuft kein Mealie.")


def list_recipes(base: str, token: str, search: str = "", page: int = 1) -> dict:
    data = get_json(base, token, "/api/recipes", {"page": max(1, page), "perPage": PER_PAGE, "orderBy": "name",
                                                 "orderDirection": "asc", **({"search": search} if search else {})})
    if not isinstance(data, dict) or not isinstance(data.get("items"), list):
        raise ValueError("Unter dieser Adresse läuft kein Mealie.")
    items = [{"slug": r["slug"], "name": r.get("name") or r["slug"], "servings": r.get("recipeServings") or None}
             for r in data["items"] if isinstance(r, dict) and r.get("slug")]
    return {"items": items, "total": int(data.get("total") or len(items)), "page": int(data.get("page") or page),
            "per_page": PER_PAGE}


def ingredient_line(i: dict) -> str:
    """One ingredient as text: Mealie's rendered line, else what was typed, else assembled from the parsed parts."""
    for key in ("display", "originalText", "note"):
        if isinstance(i.get(key), str) and i[key].strip():
            return i[key].strip()
    unit = i.get("unit") if isinstance(i.get("unit"), dict) else {}
    food = i.get("food") if isinstance(i.get("food"), dict) else {}
    qty = i.get("quantity")
    parts = [f"{qty:g}" if isinstance(qty, (int, float)) and qty else "", unit.get("abbreviation") or unit.get("name") or "",
             food.get("name") or ""]
    return " ".join(p for p in parts if p)


def node_of(r: dict) -> dict:
    """schema.org-style recipe dict from a Mealie recipe."""
    return {"name": r.get("name") or "",
            "recipeYield": r.get("recipeServings") or r.get("recipeYield") or r.get("recipeYieldQuantity") or "",
            "recipeIngredient": [line for line in (ingredient_line(i) for i in r.get("recipeIngredient") or [] if isinstance(i, dict)) if line],
            "recipeInstructions": [s["text"] for s in r.get("recipeInstructions") or [] if isinstance(s, dict) and s.get("text")],
            "nutrition": r.get("nutrition") if isinstance(r.get("nutrition"), dict) else None}


def get_recipe(base: str, token: str, slug: str) -> tuple[dict, str]:
    """(schema.org-style dict, link to the original recipe if Mealie knows one)."""
    if not re.fullmatch(r"[\w.-]+", slug):
        raise ValueError("Ungültiges Rezept.")
    r = get_json(base, token, f"/api/recipes/{quote(slug)}")
    if not isinstance(r, dict):
        raise ValueError("Unter dieser Adresse läuft kein Mealie.")
    org = r.get("orgURL") or ""
    return node_of(r), org if re.match(r"https?://", org) else ""
