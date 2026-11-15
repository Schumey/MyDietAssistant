"""The training area in the app's page: panel files are served, app.js loads them and offers the switch."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "mydiet" / "app" / "static"
APP_JS = (STATIC / "app.js").read_text(encoding="utf-8")


def test_panel_modules_and_their_imports_are_served(app_module):
    from fastapi.testclient import TestClient
    c = TestClient(app_module.app)
    panel = c.get("/static/training/hafs-panel.js")
    assert panel.status_code == 200 and "javascript" in panel.headers["content-type"]
    for name in re.findall(r'import\(`\./([\w-]+\.js)', panel.text):   # hafs-common, hafs-edit, hafs-editor
        assert c.get(f"/static/training/{name}").status_code == 200, name


def test_app_js_loads_the_panel_relative_to_itself():
    assert 'import("./training/hafs-panel.js")' in APP_JS
    assert (STATIC / "training" / "hafs-panel.js").is_file()
    assert '"api/training/call"' in APP_JS   # relative URL: works behind ingress


def test_training_feature_has_a_switch_and_tabs_match_the_panel():
    from extras import FEATURES
    assert "training" in FEATURES
    assert 'feat("training"' in APP_JS
    tabs = re.search(r'const TRAIN_TABS = \[([^\]]*)\]', APP_JS).group(1)
    panel = (STATIC / "training" / "hafs-panel.js").read_text(encoding="utf-8")
    panel_tabs = re.search(r'const TABS = \[([^\]]*)\]', panel).group(1)
    assert re.findall(r'"t-(\w+)"', tabs) == re.findall(r'"(\w+)"', panel_tabs)


def test_panel_can_run_without_its_own_bar():
    panel = (STATIC / "training" / "hafs-panel.js").read_text(encoding="utf-8")
    assert 'hasAttribute("embedded")' in panel and ":host([embedded])" in panel
    assert '"hafs-tab"' in panel


def test_win_skin_covers_the_area_switch():
    css = (STATIC / "style.css").read_text(encoding="utf-8")
    assert 'html[data-skin="win"] .area button' in css
