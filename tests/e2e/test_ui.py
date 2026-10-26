"""End-to-end tests of the real front end in a headless browser (Playwright). Skipped when Playwright or its browser is not installed:
    pip install playwright && python -m playwright install chromium
"""
import os
import socket
import subprocess
import sys
import tempfile
import time

import httpx
import pytest

sync_api = pytest.importorskip("playwright.sync_api")

from conftest import ROOT  # noqa: E402


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="module")
def server():
    port = free_port()
    env = {**os.environ, "MYDIET_DB": os.path.join(tempfile.mkdtemp(prefix="mda-e2e-"), "e2e.db")}
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", str(port), "--log-level", "warning"],
                            cwd=os.path.join(ROOT, "mydiet", "app"), env=env)
    base = f"http://127.0.0.1:{port}"
    for _ in range(100):
        try:
            if httpx.get(base + "/api/me", timeout=1).status_code == 200:
                break
        except httpx.HTTPError:
            time.sleep(0.2)
    else:
        proc.kill()
        pytest.fail("server did not start")
    yield base
    proc.kill()


@pytest.fixture(scope="module")
def browser():
    with sync_api.sync_playwright() as p:
        try:
            b = p.chromium.launch()
        except Exception as e:   # browser binary missing
            pytest.skip(f"no browser: {e}")
        yield b
        b.close()


@pytest.fixture
def page(browser, server):
    ctx = browser.new_context(viewport={"width": 1100, "height": 900})
    pg = ctx.new_page()
    pg.errors = []
    pg.on("pageerror", lambda e: pg.errors.append(str(e)))
    pg.base = server
    yield pg
    ctx.close()


def settings(base, **kw):
    r = httpx.put(base + "/api/settings", json=kw)
    assert r.status_code == 200, r.text


def test_app_starts_with_all_tabs_and_no_script_errors(page):
    settings(page.base, lang="de", features={"recipes": True})
    page.goto(page.base + "/")
    page.wait_for_selector("#diary .daynav")
    assert [b.text_content() for b in page.query_selector_all("#tabs button:not([hidden])")] == \
        ["Tagebuch", "Lebensmittel", "Mahlzeiten", "Rezepte", "Gewicht", "Statistik", "Einstellungen"]
    assert page.errors == []


def test_food_can_be_created_and_found_in_the_library(page):
    page.goto(page.base + "/")
    page.click('#tabs button[data-tab="foods"]')
    page.click("text=+ Neues Lebensmittel")
    page.fill("#nf-name", "Testquark")
    page.fill("#nf-kcal", "67")
    page.fill("#nf-protein", "12")
    page.click("text=Speichern & wählen")
    page.wait_for_selector("#foods >> text=Testquark")
    page.fill('#foods input[type="search"]', "quark")
    page.wait_for_selector("#foods >> text=Testquark")
    assert page.errors == []


def test_entry_added_through_the_api_shows_up_in_the_diary(page):
    fid = httpx.post(page.base + "/api/foods", json={"name": "Haferbrei", "kcal": 360, "protein": 12, "carbs": 60, "fat": 7}).json()["id"]
    from datetime import date
    httpx.post(page.base + "/api/entries", json={"day": date.today().isoformat(), "food_id": fid, "grams": 50})
    page.goto(page.base + "/")
    page.wait_for_selector("#diary >> text=Haferbrei")
    assert "180" in page.inner_text("#diary")      # 50 g of 360 kcal/100 g


def test_recipe_import_dialog_rejects_local_addresses(page):
    settings(page.base, features={"recipes": True})
    page.goto(page.base + "/")
    page.click('#tabs button[data-tab="recipes"]')
    page.click("text=Von Webseite")
    page.fill('#dlg input[type="url"]', "http://127.0.0.1:8123/rezept")
    page.click("#dlg >> text=Importieren")
    page.wait_for_selector("#dlg >> text=Adressen im lokalen Netz sind nicht erlaubt.")
    assert page.errors == []


def test_imported_recipe_draft_opens_in_the_editor_and_can_be_saved(page):
    """The server's answer is faked (the real endpoint refuses local addresses); this checks the editor side."""
    import json
    draft = {"name": "Pfannkuchen", "portions": 4, "source": "https://kochseite.test/pfannkuchen", "instructions": "Teig anrühren.\nAusbacken.",
             "nutrition": {"kcal": 320}, "items": [
                 {"name": "Mehl", "grams": 200, "text": "200 g Weizenmehl", "matched": True, "kcal": 680, "protein": 20, "carbs": 140, "fat": 2},
                 {"name": "Zimt", "grams": 1, "text": "1 Prise Zimt", "matched": False, "kcal": 0, "protein": 0, "carbs": 0, "fat": 0}]}
    settings(page.base, features={"recipes": True})
    page.route("**/api/recipes/import-url", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(draft)))
    page.goto(page.base + "/")
    page.click('#tabs button[data-tab="recipes"]')
    page.click("text=Von Webseite")
    page.fill('#dlg input[type="url"]', "https://kochseite.test/pfannkuchen")
    page.click("#dlg >> text=Importieren")
    page.wait_for_selector("#dlg >> text=1 Zutat nicht zugeordnet")
    assert page.input_value('#dlg input[type="url"]') == "https://kochseite.test/pfannkuchen"
    assert "Angabe der Webseite: 320 kcal pro Portion" in page.inner_text("#dlg")
    assert page.query_selector_all("#dlg .list > div.unmatched")
    page.click("#dlg >> text=Speichern")
    page.wait_for_selector("#recipes >> text=Pfannkuchen")
    page.click("#recipes >> text=Zubereitung")
    assert "Ausbacken." in page.inner_text("#recipes")
    assert page.get_attribute('#recipes a[href^="https://kochseite.test"]', "rel") == "noopener noreferrer"
    assert page.errors == []


@pytest.mark.parametrize("lang,diary_tab", [("en", "Diary"), ("fr", "Journal"), ("es", "Diario"), ("nl", "Dagboek")])
def test_interface_language_switches(page, lang, diary_tab):
    settings(page.base, lang=lang)
    try:
        page.goto(page.base + "/")
        page.wait_for_selector("#diary .daynav")
        assert page.text_content('#tabs button[data-tab="diary"]') == diary_tab
        assert page.errors == []
    finally:
        settings(page.base, lang="de")


# --- training day -------------------------------------------------------------------------------

def seed_training(base):
    """Foods, a shake and two dinner meals; returns the shake's id. The shake is configured with a protein target."""
    from datetime import date
    day = date.today().isoformat()
    settings(base, lang="de", features={"suggest": True})
    httpx.put(base + "/api/goal", json={"kcal": 2600, "protein": 160, "carbs": 300, "fat": 80})
    mid = [m["id"] for m in httpx.get(f"{base}/api/day/{day}").json()["meals"]]

    def food(name, k, p, c, f):
        return httpx.post(base + "/api/foods", json={"name": name, "kcal": k, "protein": p, "carbs": c, "fat": f}).json()["id"]

    def save(name, items):
        for fid, g in items:
            httpx.post(base + "/api/entries", json={"day": day, "meal_id": mid[0], "food_id": fid, "grams": g})
        sid = httpx.post(base + "/api/saved-meals", json={"day": day, "meal_id": mid[0], "name": name}).json()["id"]
        httpx.delete(f"{base}/api/day/{day}/entries?meal_id={mid[0]}")
        return sid
    whey, milk = food("Whey", 400, 80, 8, 6), food("Milch", 47, 3.4, 4.8, 1.5)
    shake = save("Test-Shake", [(whey, 30), (milk, 300)])
    save("Reis mit Hähnchen", [(food("Reis", 350, 7, 78, 1), 80), (food("Hähnchen", 110, 23, 0, 1.5), 150)])
    save("Quark pur", [(food("Magerquark", 67, 12, 4, 0.3), 250)])
    return shake, mid, day


def test_training_settings_save_with_empty_fields_and_the_button_follows_the_day(page):
    shake, mid, day = seed_training(page.base)
    page.goto(page.base + "/")
    page.wait_for_selector("#diary .daynav")
    assert page.query_selector("#diary >> text=Mahlzeit vorschlagen")
    page.click("#diary >> text=Trainingstag")                        # not set up yet: the button leads to the setup
    page.click("#dlg >> text=Prioritäten und Beigaben")
    page.select_option('#dlg select:has(option:text("– kein Shake –"))', str(shake))
    page.fill('#dlg input[placeholder="egal"] >> nth=1', "40")      # protein only; calories, carbs and fat stay empty
    page.click("#dlg >> text=Speichern")
    page.wait_for_selector("#dlg >> text=Shake")
    assert not page.query_selector("#dlg .err:not(:empty)")
    page.click("#dlg >> text=Schließen")
    page.reload()
    page.wait_for_selector("#diary .daynav")
    assert not page.query_selector("#diary button:text-is('Trainingstag')")     # configured, but no training yet today
    httpx.post(f"{page.base}/api/saved-meals/{shake}/add", json={"day": day, "meal_id": mid[0]})
    page.reload()
    page.wait_for_selector("#diary button:text-is('Trainingstag')")
    assert page.errors == []


def test_training_dialog_shows_dinners_after_the_shake_is_in_the_diary(page):
    shake, mid, day = seed_training(page.base)
    httpx.put(page.base + "/api/suggest/training", json={"saved_meal_id": shake, "target": {"protein": 40}, "shake_meal_id": mid[0], "dinner_meal_id": mid[-1], "always": True})
    page.goto(page.base + "/")
    page.click("#diary button:text-is('Trainingstag')")
    page.wait_for_selector("#dlg h3:text-is('Shake')")
    assert "Ziel für den Shake" in page.inner_text("#dlg")
    page.click("#dlg >> text=Eintragen >> nth=0")                    # enter the fitted shake; the dialog stays open and reloads
    page.wait_for_selector("#dlg >> text=Der Shake ist für heute schon eingetragen.")
    page.wait_for_selector("#dlg >> text=Reis mit Hähnchen")
    assert page.query_selector("#diary >> text=Whey")
    assert page.errors == []


def test_italian_interface_is_complete_on_the_main_pages(page):
    settings(page.base, lang="it", features={})
    page.goto(page.base + "/")
    page.wait_for_selector("#diary .daynav")
    tabs = [b.text_content() for b in page.query_selector_all("#tabs button:not([hidden])")]
    assert [t for t in tabs if t != "Ricette"] == ["Diario", "Alimenti", "Pasti", "Peso", "Statistiche", "Impostazioni"]
    assert "Obiettivo giornaliero" in page.inner_text("#diary") or "Il tuo obiettivo giornaliero" in page.inner_text("#diary")
    assert page.errors == []
    settings(page.base, lang="de")
