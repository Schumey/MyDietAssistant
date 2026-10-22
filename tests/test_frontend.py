"""The static front end: files the start page needs, caching, syntax, packaging consistency."""
import os
import re
import shutil
import subprocess

import pytest
from fastapi.testclient import TestClient

from conftest import ROOT

STATIC = os.path.join(ROOT, "mydiet", "app", "static")
read = lambda *p: open(os.path.join(ROOT, *p), encoding="utf-8").read()


def test_start_page_is_served_without_caching(app_module):
    r = TestClient(app_module.app).get("/")
    assert r.status_code == 200 and r.headers["cache-control"] == "no-cache"


def test_every_file_referenced_by_index_html_exists_and_is_served(app_module):
    html = read("mydiet", "app", "static", "index.html")
    refs = re.findall(r'(?:src|href)="(static/[^"]+)"', html)
    assert "static/app.js" in refs and "static/style.css" in refs
    c = TestClient(app_module.app)
    for ref in refs:
        assert c.get("/" + ref).status_code == 200, ref


def test_no_external_resources_are_loaded():
    for name in ("index.html", "style.css", "theme.js"):
        assert not re.search(r'(src|href)="https?://|url\(\s*["\']?https?://', read("mydiet", "app", "static", name)), name


def test_translation_is_defined_before_it_is_used():
    """Regression (0.22): the translation lived in a second script a cached index.html did not load."""
    js = read("mydiet", "app", "static", "app.js")
    assert js.index("const I18N") < js.index("I18N.locale")
    assert js.index("const EN = {") < js.index("const I18N")


@pytest.mark.skipif(not shutil.which("node"), reason="node not installed")
def test_app_js_has_valid_syntax():
    subprocess.run(["node", "--check", os.path.join(STATIC, "app.js")], check=True)


def test_english_dictionary_has_no_duplicate_keys():
    js = read("mydiet", "app", "static", "app.js")
    body = js[js.index("const EN = {"):js.index("const I18N")]
    keys = re.findall(r'^\s*"((?:[^"\\]|\\.)*)"\s*:', body, flags=re.M)
    dup = {k for k in keys if keys.count(k) > 1}
    assert not dup, sorted(dup)[:10]


def test_version_in_config_matches_the_changelog():
    version = re.search(r'^version: "([^"]+)"', read("mydiet", "config.yaml"), flags=re.M)[1]
    top = re.search(r"^## (\S+)", read("mydiet", "CHANGELOG.md"), flags=re.M)[1]
    assert version == top


def test_every_add_on_option_is_translated_and_documented():
    cfg = read("mydiet", "config.yaml")
    options = re.findall(r"^  (\w+):", cfg.split("options:")[1].split("schema:")[0], flags=re.M)
    assert options
    for lang in ("en", "de"):
        tr = read("mydiet", "translations", f"{lang}.yaml")
        for o in options:
            assert f"  {o}:" in tr, (lang, o)
