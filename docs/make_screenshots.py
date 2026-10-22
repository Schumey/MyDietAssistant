"""Seed demo data into a throw-away DB and take the README screenshots (HA default light theme, 2x).
Needs playwright (python -m playwright install chromium). Run: python docs/make_screenshots.py"""
import json, math, os, socket, subprocess, sys, tempfile, time
from datetime import date, timedelta

import httpx
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "screenshots")

T = {
    "de": dict(meals=["Frühstück", "Mittagessen", "Abendessen", "Snacks"],
               foods=[("Haferflocken", 372, 13.5, 58.7, 7, "Getreide"), ("Magerquark", 67, 12, 4, 0.3, "Milchprodukte"),
                      ("Banane", 93, 1.1, 20.4, 0.2, "Obst"), ("Vollkornbrot", 220, 8, 41, 1.5, "Brot"),
                      ("Hähnchenbrust", 110, 23, 0, 1.5, "Fleisch"), ("Basmatireis, gekocht", 130, 2.7, 28, 0.3, "Getreide"),
                      ("Brokkoli", 34, 2.8, 4, 0.4, "Gemüse"), ("Olivenöl", 884, 0, 0, 100, "Öle"),
                      ("Skyr natur", 63, 11, 4, 0.2, "Milchprodukte"), ("Mandeln", 575, 21, 5, 51, "Nüsse"),
                      ("Lachsfilet", 202, 20, 0, 13, "Fisch"), ("Ei", 137, 12.5, 0.7, 9.5, "Eier")],
               recipe=dict(name="Hähnchen-Reis-Bowl", portions=2, category="Mittagessen",
                           instructions="Reis nach Packungsangabe kochen.\nHähnchenbrust würzen und in Olivenöl anbraten.\nBrokkoli 4 Minuten dämpfen.\nAlles in zwei Schalen anrichten.",
                           source="https://kochseite.example/haehnchen-reis-bowl",
                           items=[("Basmatireis, gekocht", 300, 390, 8.1, 84, 0.9), ("Hähnchenbrust", 250, 275, 57.5, 0, 3.8),
                                  ("Brokkoli", 200, 68, 5.6, 8, 0.8), ("Olivenöl", 10, 88, 0, 0, 10)]),
               import_draft=dict(name="Pfannkuchen", portions=4, source="https://kochseite.example/pfannkuchen",
                                 instructions="Teig anrühren.\nPortionsweise ausbacken.", nutrition={"kcal": 320},
                                 items=[dict(name="Weizenmehl", grams=250, text="250 g Weizenmehl", matched=True, kcal=850, protein=25, carbs=175, fat=3),
                                        dict(name="Milch", grams=400, text="400 ml Milch", matched=True, kcal=260, protein=13, carbs=19, fat=14),
                                        dict(name="Ei", grams=120, text="2 Eier", matched=True, kcal=164, protein=15, carbs=1, fat=11),
                                        dict(name="Vanillezucker", grams=8, text="1 Päckchen Vanillezucker", matched=False, kcal=0, protein=0, carbs=0, fat=0)]),
               imp="Von Webseite", importbtn="Importieren"),
    "en": dict(meals=["Breakfast", "Lunch", "Dinner", "Snacks"],
               foods=[("Rolled oats", 372, 13.5, 58.7, 7, "Grains"), ("Low-fat quark", 67, 12, 4, 0.3, "Dairy"),
                      ("Banana", 93, 1.1, 20.4, 0.2, "Fruit"), ("Wholemeal bread", 220, 8, 41, 1.5, "Bread"),
                      ("Chicken breast", 110, 23, 0, 1.5, "Meat"), ("Basmati rice, cooked", 130, 2.7, 28, 0.3, "Grains"),
                      ("Broccoli", 34, 2.8, 4, 0.4, "Vegetables"), ("Olive oil", 884, 0, 0, 100, "Oils"),
                      ("Skyr, plain", 63, 11, 4, 0.2, "Dairy"), ("Almonds", 575, 21, 5, 51, "Nuts"),
                      ("Salmon fillet", 202, 20, 0, 13, "Fish"), ("Egg", 137, 12.5, 0.7, 9.5, "Eggs")],
               recipe=dict(name="Chicken rice bowl", portions=2, category="Lunch",
                           instructions="Cook the rice as directed.\nSeason the chicken and sear it in olive oil.\nSteam the broccoli for 4 minutes.\nDivide between two bowls.",
                           source="https://kochseite.example/chicken-rice-bowl",
                           items=[("Basmati rice, cooked", 300, 390, 8.1, 84, 0.9), ("Chicken breast", 250, 275, 57.5, 0, 3.8),
                                  ("Broccoli", 200, 68, 5.6, 8, 0.8), ("Olive oil", 10, 88, 0, 0, 10)]),
               import_draft=dict(name="Pancakes", portions=4, source="https://kochseite.example/pancakes",
                                 instructions="Mix the batter.\nFry in batches.", nutrition={"kcal": 320},
                                 items=[dict(name="Plain flour", grams=250, text="250 g plain flour", matched=True, kcal=850, protein=25, carbs=175, fat=3),
                                        dict(name="Milk", grams=400, text="400 ml milk", matched=True, kcal=260, protein=13, carbs=19, fat=14),
                                        dict(name="Egg", grams=120, text="2 eggs", matched=True, kcal=164, protein=15, carbs=1, fat=11),
                                        dict(name="Vanilla sugar", grams=8, text="1 sachet vanilla sugar", matched=False, kcal=0, protein=0, carbs=0, fat=0)]),
               imp="From web page", importbtn="Import"),
}


def seed(base, lang):
    t = T[lang]
    h = lambda m, p, **kw: getattr(httpx, m)(base + p, timeout=30, **kw)
    h("put", "/api/settings", json=dict(lang=lang, features={"recipes": True, "notes": True}))
    h("put", "/api/goal", json=dict(kcal=2100, protein=150, carbs=230, fat=70, target_weight=76))
    ids = {}
    for name, kcal, p, c, f, cat in t["foods"]:
        ids[name] = h("post", "/api/foods", json=dict(name=name, kcal=kcal, protein=p, carbs=c, fat=f, category=cat, serving_g=100)).json()["id"]
    for name in ("Banana", "Bananen", "Skyr, plain", "Skyr natur", "Chicken breast", "Hähnchenbrust"):
        if name in ids:
            h("put", f"/api/foods/{ids[name]}/favorite", json=dict(favorite=True))
    r = t["recipe"]
    h("post", "/api/recipes", json=dict(name=r["name"], portions=r["portions"], category=r["category"], instructions=r["instructions"], source=r["source"],
                                      items=[dict(name=n, grams=g, kcal=k, protein=p, carbs=c, fat=f) for n, g, k, p, c, f in r["items"]]))
    meals = {m["name"]: m["id"] for m in h("get", f"/api/day/{date.today().isoformat()}").json()["meals"]}
    # fix meal names to the language (defaults are German)
    day = h("get", f"/api/day/{date.today().isoformat()}").json()
    for m, name in zip(day["meals"], t["meals"]):
        h("put", f"/api/meals/{m['id']}", json=dict(name=name))
    mid = [m["id"] for m in day["meals"]]
    names = [f[0] for f in t["foods"]]
    plan = [  # (meal index, food, grams)
        (0, names[0], 60), (0, names[1], 150), (0, names[2], 120),
        (1, names[4], 180), (1, names[5], 220), (1, names[6], 150), (1, names[7], 10),
        (2, names[10], 160), (2, names[3], 80), (2, names[6], 120),
        (3, names[8], 150), (3, names[9], 25)]
    today = date.today()
    for back in range(0, 31):
        d = (today - timedelta(days=back)).isoformat()
        scale = 1.0 if back == 0 else 0.82 + 0.28 * (0.5 + 0.5 * math.sin(back * 1.7))
        for mi, food, g in plan:
            if back == 0 and mi == 3:
                continue
            h("post", "/api/entries", json=dict(day=d, meal_id=mid[mi], food_id=ids[food], grams=round(g * scale)))
    # weight: 90 days, slow decline with noise
    for back in range(0, 91):
        kg = 84.0 - (90 - back) * 0.062 + 0.35 * math.sin(back * 2.3)
        h("put", f"/api/weights/{(today - timedelta(days=back)).isoformat()}", json=dict(kg=round(kg, 1)))
    return mid


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for lang in ("de", "en"):
            port = free_port()
            env = {**os.environ, "MYDIET_DB": os.path.join(tempfile.mkdtemp(prefix="mda-shot-"), "s.db")}
            proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", str(port), "--log-level", "warning"],
                                    cwd=os.path.join(ROOT, "mydiet", "app"), env=env)
            base = f"http://127.0.0.1:{port}"
            try:
                for _ in range(100):
                    try:
                        if httpx.get(base + "/api/me", timeout=1).status_code == 200:
                            break
                    except httpx.HTTPError:
                        time.sleep(0.2)
                seed(base, lang)
                out = os.path.join(OUT, lang)
                os.makedirs(out, exist_ok=True)
                ctx = browser.new_context(viewport={"width": 1100, "height": 900}, device_scale_factor=2, color_scheme="light", locale=lang)
                pg = ctx.new_page()
                pg.goto(base + "/")
                pg.wait_for_selector("#diary .daynav")
                time.sleep(0.8)
                pg.screenshot(path=os.path.join(out, "diary.png"), full_page=True)
                for tab in ("foods", "recipes", "weight", "stats", "settings"):
                    pg.click(f'#tabs button[data-tab="{tab}"]')
                    time.sleep(1.2)
                    pg.screenshot(path=os.path.join(out, f"{tab}.png"), full_page=(tab != "settings"))
                # recipe import dialog with a faked server answer (the real one refuses local addresses)
                draft = T[lang]["import_draft"]
                pg.route("**/api/recipes/import-url", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(draft)))
                pg.click('#tabs button[data-tab="recipes"]')
                pg.click(f"text={T[lang]['imp']}")
                pg.fill('#dlg input[type="url"]', draft["source"])
                pg.click(f"#dlg >> text={T[lang]['importbtn']}")
                time.sleep(1.2)
                pg.screenshot(path=os.path.join(out, "recipe-import.png"))
                ctx.close()
                m = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3, color_scheme="light", locale=lang, is_mobile=True, has_touch=True)
                mp = m.new_page()
                mp.goto(base + "/")
                mp.wait_for_selector("#diary .daynav")
                time.sleep(0.8)
                mp.screenshot(path=os.path.join(out, "diary-mobile.png"))
                m.close()
            finally:
                proc.kill()
        browser.close()


main()
