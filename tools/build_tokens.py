"""Build the design tokens (design/tokens.json) for the web interface and the Flutter app.

    python tools/build_tokens.py          writes mydiet/app/static/tokens.css and app/lib/theme_tokens.dart

`tests/test_tokens.py` fails when one of the two files is out of date.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design" / "tokens.json"
CSS = ROOT / "mydiet" / "app" / "static" / "tokens.css"
DART = ROOT / "app" / "lib" / "theme_tokens.dart"


def load() -> dict:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    return {group: values for group, values in data.items() if not group.startswith("_")}


def _camel(*parts: str) -> str:
    words = [w for p in parts for w in re.split(r"[-_]", p) if w]
    return words[0] + "".join(w[:1].upper() + w[1:] for w in words[1:])


def css(tokens: dict) -> str:
    lines = ["/* Generated from design/tokens.json by tools/build_tokens.py - do not edit. */", ":root {"]
    for group, values in tokens.items():
        for name, value in values.items():
            unit = "" if group == "color" else "px"
            lines.append(f"  --hafs-{group}-{name}: {value}{unit};")
    lines.append("}")
    return "\n".join(lines) + "\n"


def dart(tokens: dict) -> str:
    lines = ["// Generated from design/tokens.json by tools/build_tokens.py - do not edit.", "",
             "import 'dart:ui';", "", "/// Design tokens shared with the web interface (mydiet/app/static/tokens.css).",
             "abstract final class HafsTokens {"]
    for group, values in tokens.items():
        for name, value in values.items():
            ident = _camel(group, name)
            if group == "color":
                lines.append(f"  static const {ident} = Color(0xFF{value.lstrip('#').upper()});")
            else:
                lines.append(f"  static const double {ident} = {float(value)};")
    lines.append("}")
    return "\n".join(lines) + "\n"


def outputs() -> dict[Path, str]:
    tokens = load()
    return {CSS: css(tokens), DART: dart(tokens)}


if __name__ == "__main__":
    for path, text in outputs().items():
        path.write_text(text, encoding="utf-8", newline="\n")
        print(f"wrote {path.relative_to(ROOT)}")
    sys.exit(0)
