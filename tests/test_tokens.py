"""Design tokens: the generated CSS and Dart files match design/tokens.json, and the interfaces use them."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_tokens  # noqa: E402


def test_generated_files_are_current():
    for path, text in build_tokens.outputs().items():
        assert path.read_text(encoding="utf-8") == text, f"run: python tools/build_tokens.py ({path.name})"


def test_web_and_app_use_the_tokens():
    style = (ROOT / "mydiet" / "app" / "static" / "style.css").read_text(encoding="utf-8")
    assert style.startswith('@import url("tokens.css");')
    assert "var(--hafs-color-nutrition)" in style and "var(--hafs-color-training)" in style
    panel = (ROOT / "mydiet" / "app" / "static" / "training" / "hafs-panel.js").read_text(encoding="utf-8")
    assert "--hafs-color-training" in panel
    home = (ROOT / "app" / "lib" / "home_screen.dart").read_text(encoding="utf-8")
    assert "HafsTokens.colorNutrition" in home and "HafsTokens.colorTraining" in home
