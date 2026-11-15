"""Write app/assets/schema.json from the server's migrations (single source of truth).

Run after every change to core/db.py or SYNC_TABLES:  python tools/export_schema.py
`tests/test_schema_export.py` fails when the file is out of date.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "mydiet" / "app" / "training"))

from core import db, sync  # noqa: E402

TARGET = ROOT / "app" / "assets" / "schema.json"


def build() -> str:
    data = {"migrations": db.MIGRATIONS, "sync_tables": list(sync.SYNC_TABLES), "api_version": 1}
    return json.dumps(data, ensure_ascii=False, indent=1) + "\n"


if __name__ == "__main__":
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(build(), encoding="utf-8", newline="\n")
    print(f"wrote {TARGET} ({len(db.MIGRATIONS)} migrations)")
