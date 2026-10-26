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


def test_static_files_are_revalidated_so_updates_show_up(app_module):
    r = TestClient(app_module.app).get("/static/app.js")
    assert r.status_code == 200 and r.headers["cache-control"] == "no-cache" and r.headers.get("etag")


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
    body = js[js.index("const EN = {"):js.index("// Languages: German is the source text")]
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


@pytest.mark.skipif(not shutil.which("node"), reason="node not installed")
def test_every_language_covers_the_english_dictionary_with_the_same_placeholders(tmp_path):
    """EN is the reference: FR, ES and NL must translate every key and keep the {} placeholders (a missing entry shows German text)."""
    js = read("mydiet", "app", "static", "app.js")
    script = tmp_path / "dump.js"
    script.write_text(js[:js.index("const I18N")] + ";process.stdout.write(JSON.stringify({en: EN, langs: LANGS}))", encoding="utf-8")
    import json
    out = json.loads(subprocess.run(["node", str(script)], check=True, capture_output=True, encoding="utf-8").stdout)
    assert set(out["langs"]) == {"en", "fr", "es", "nl"}
    for lang, table in out["langs"].items():
        assert set(table) == set(out["en"]), (lang, sorted(set(out["en"]) ^ set(table))[:5])
        for key, text in table.items():
            assert key.count("{}") == text.count("{}"), (lang, key)
            assert text.strip(), (lang, key)


def test_language_dictionaries_have_no_duplicate_keys():
    js = read("mydiet", "app", "static", "app.js")
    body = js[js.index("Object.assign(LANGS"):js.index("const I18N")]
    for block in re.split(r"^  (?:fr|es|nl): [{]", body, flags=re.M)[1:]:
        keys = re.findall(r'^    "((?:[^"\\]|\\.)*)":', block, flags=re.M)
        assert len(keys) == len(set(keys)) > 600


def test_server_accepts_exactly_the_languages_the_front_end_offers():
    import extras
    js = read("mydiet", "app", "static", "app.js")
    select = re.search(r"const langSel = .*?Español.*?\n", js, flags=re.S)[0]
    offered = set(re.findall(r'value: "(\w+)"', select)) - {"auto"}
    assert offered == {lang for lang in extras.LANGS if lang != "auto"}


@pytest.mark.skipif(not shutil.which("node"), reason="node not installed")
def test_german_server_messages_have_a_translation(tmp_path):
    """The front end shows server errors through the dictionary; a German message without an entry reaches FR/ES/NL users untranslated."""
    import ast
    import glob
    import json
    js = read("mydiet", "app", "static", "app.js")
    script = tmp_path / "dump.js"
    script.write_text(js[:js.index("const I18N")] + ";process.stdout.write(JSON.stringify(EN))", encoding="utf-8")
    en = json.loads(subprocess.run(["node", str(script)], check=True, capture_output=True, encoding="utf-8").stdout)
    exact = {k.strip() for k in en if "{}" not in k}
    pats = [re.compile("^" + "(.*?)".join(re.escape(p) for p in k.split("{}")) + "$", re.S) for k in en if "{}" in k]
    german = re.compile(r"[äöüßÄÖÜ]|\b(nicht|und|oder|bitte|keine?|wird|für|Datei|Fehler|gefunden|Lebensmittel|Mahlzeit)\b")

    def text(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            return node.value
        if isinstance(node, ast.JoinedStr):
            return "".join(v.value if isinstance(v, ast.Constant) else "{}" for v in node.values)
        return None

    missing = []
    for f in glob.glob(os.path.join(ROOT, "mydiet", "app", "*.py")):
        for n in ast.walk(ast.parse(open(f, encoding="utf-8").read())):
            if isinstance(n, ast.Call) and getattr(n.func, "id", "") == "HTTPException":
                arg = n.args[1] if len(n.args) > 1 else None
            elif isinstance(n, ast.Raise) and isinstance(n.exc, ast.Call) and n.exc.args and getattr(n.exc.func, "id", "") == "ValueError":
                arg = n.exc.args[0]
            else:
                continue
            t = text(arg) if arg is not None else None
            if t and german.search(t) and t not in exact and not any(p.match(t) for p in pats):
                missing.append((os.path.basename(f), t))
    assert not missing, missing
