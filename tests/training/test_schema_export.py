import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))

import export_schema  # noqa: E402


def test_app_schema_asset_is_up_to_date():
    current = export_schema.TARGET.read_text(encoding="utf-8").replace("\r\n", "\n")
    assert current == export_schema.build(), "run: python tools/export_schema.py"
