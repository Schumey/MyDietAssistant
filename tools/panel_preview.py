"""Preview of the web panel without Home Assistant, on synthetic data.

    python tools/panel_preview.py [port]      then open http://localhost:8765/

Serves custom_components/hafs/www and answers the panel's WebSocket-style calls over HTTP from a temporary
database (never a real one). The page fakes the `hass` object the panel gets from Home Assistant.
Theme: add ?dark=1 to the address.
"""
from __future__ import annotations

import json
import random
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "custom_components" / "hafs"))

from core import catalog, targets  # noqa: E402
from core.store import Store  # noqa: E402

OWNER = "preview"
WWW = ROOT / "custom_components" / "hafs" / "www"

PAGE = """<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HAFS preview</title><style>
html,body{margin:0;height:100%}
body{--primary-color:#03a9f4;--primary-text-color:#212121;--secondary-text-color:#727272;--primary-background-color:#fafafa;
--card-background-color:#fff;--secondary-background-color:#e5e5e5;--app-header-background-color:#03a9f4;--app-header-text-color:#fff;--divider-color:#e0e0e0;--text-primary-color:#fff;--error-color:#db4437;--success-color:#43a047;
font-family:Roboto,system-ui,sans-serif}
body.dark{--primary-text-color:#e1e1e1;--secondary-text-color:#9b9b9b;--primary-background-color:#111;--card-background-color:#1c1c1c;--secondary-background-color:#202020;--divider-color:#333}
hafs-panel{display:block;height:100%;overflow:auto}
</style></head><body><hafs-panel></hafs-panel><script type="module">
if (location.search.includes("dark")) document.body.classList.add("dark");
const lang = new URLSearchParams(location.search).get("lang") || "de";
const hass = { language: lang, connection: { sendMessagePromise: async (msg) => {
  const r = await fetch("/ws", { method: "POST", body: JSON.stringify(msg) });
  const j = await r.json();
  if (!r.ok) throw j;
  return j;
} } };
await import("/hafs_static/hafs-panel.js?v=preview");
const el = document.querySelector("hafs-panel");
el.narrow = innerWidth < 760; el.hass = hass;
</script></body></html>"""


CARD_PAGE = PAGE.split("</style>")[0] + """.row{padding:16px;max-width:460px}
ha-card{display:block;background:var(--card-background-color);border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.2)}
</style></head><body><div class="row"><hafs-card id="c"></hafs-card></div><script type="module">
if (location.search.includes("dark")) document.body.classList.add("dark");
const lang = new URLSearchParams(location.search).get("lang") || "de";
const hass = { language: lang, states: {}, connection: { sendMessagePromise: async (msg) => {
  const r = await fetch("/ws", { method: "POST", body: JSON.stringify(msg) });
  const j = await r.json();
  if (!r.ok) throw j;
  return j;
} } };
if (!customElements.get("ha-card")) customElements.define("ha-card", class extends HTMLElement {});
await import("/hafs_static/hafs-card.js?v=preview");
const el = document.getElementById("c");
el.setConfig({});
el.hass = hass;
</script></body></html>"""


def seed(store: Store) -> None:
    store.recompute_targets(OWNER)             # seeds the catalog and creates the exercise rows
    with store._conn() as conn:
        ids = {r["catalog_key"]: r["id"] for r in conn.execute("SELECT id, catalog_key FROM exercise WHERE owner=?", (OWNER,))}
    now = datetime.now(timezone.utc)
    stamp = now.isoformat(timespec="seconds")
    plan = {"Push": [("bench_press_barbell", 3, 6, 10, 60.0, 2.5), ("incline_press_dumbbell", 3, 8, 12, 22.0, 2),
                     ("shoulder_press_machine", 3, 8, 12, 40.0, 5)],
            "Pull": [("lat_pulldown_machine", 3, 8, 12, 55.0, 5), ("row_seated_cable", 3, 8, 12, 50.0, 5), ("deadlift_barbell", 3, 5, 8, 90.0, 5)]}
    recs: dict[str, list] = {"gym": [{"id": "g1", "name": "CleverFit", "zone": "", "updated_at": stamp}],
                             "equipment": [{"id": "q1", "gym_id": "g1", "name": "Langhantel", "type": "barbell", "steps": "[20, 22.5, 25]", "updated_at": stamp},
                                           {"id": "q3", "gym_id": "g1", "name": "Rack", "type": "rack", "steps": "", "updated_at": stamp},
                                           {"id": "q2", "gym_id": "g1", "name": "Latzug", "type": "cable", "steps": '{"min": 5, "max": 100, "step": 5}',
                                            "out_of_order": 1, "updated_at": stamp}],
                             "exercise_equipment": [{"id": "l1", "exercise_id": ids["deadlift_barbell"], "equipment_id": "q1", "updated_at": stamp}],
                             "program": [{"id": "p1", "name": "Push/Pull", "rhythm": "", "updated_at": stamp}],
                             "routine": [], "routine_exercise": [], "workout": [], "workout_set": []}
    for pos, (name, rows) in enumerate(plan.items()):
        rid = f"r-{name}"
        recs["routine"].append({"id": rid, "program_id": "p1", "name": name, "position": pos, "updated_at": stamp})
        for i, (key, sets, lo, hi, _, _) in enumerate(rows):
            recs["routine_exercise"].append({"id": f"{rid}-{i}", "routine_id": rid, "exercise_id": ids[key], "position": i,
                                             "target_sets": sets, "reps_min": lo, "reps_max": hi,
                                             "superset_group": "A" if name == "Pull" and i in (0, 1) else "", "updated_at": stamp})
    rnd = random.Random(7)
    names = list(plan)
    for n in range(36):
        day = now - timedelta(days=(35 - n) * 4 + 1)
        name = names[n % 2]
        wid = f"w{n}"
        start = day.replace(hour=18, minute=rnd.randint(0, 30), second=0, microsecond=0)
        recs["workout"].append({"id": wid, "started_at": start.replace(tzinfo=None).isoformat(), "ended_at": (start + timedelta(minutes=70)).replace(tzinfo=None).isoformat(),
                                "gym_id": "g1", "routine_id": f"r-{name}", "routine_name": name, "phase": "cut" if n > 20 else "bulk", "updated_at": stamp})
        for key, sets, lo, hi, base, step in plan[name]:
            weight = base + (n // 2) * step * 0.4
            for s in range(sets):
                t = start + timedelta(minutes=5 * len(recs["workout_set"]) % 60 + s)
                recs["workout_set"].append({"id": f"{wid}-{key}-{s}", "workout_id": wid, "exercise_id": ids[key], "set_no": s + 1, "weight": round(weight / step) * step,
                                            "reps": max(lo, hi - s - rnd.randint(0, 2)), "kind": "work", "done_at": t.replace(tzinfo=None).isoformat(), "updated_at": stamp})
    store.push(OWNER, recs)


class Handler(BaseHTTPRequestHandler):
    store: Store

    def log_message(self, *args) -> None:  # quiet
        pass

    def _send(self, code: int, body: bytes, ctype: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path.split("?")[0] == "/":
            return self._send(200, PAGE.encode(), "text/html; charset=utf-8")
        if self.path.split("?")[0] == "/card":
            return self._send(200, CARD_PAGE.encode(), "text/html; charset=utf-8")
        if self.path.startswith("/hafs_static/"):
            f = (WWW / self.path.split("?")[0].removeprefix("/hafs_static/")).resolve()
            if f.is_file() and WWW in f.parents:
                return self._send(200, f.read_bytes(), "text/javascript; charset=utf-8")
        self._send(404, b"not found", "text/plain")

    def do_POST(self) -> None:
        msg = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        s, kind = self.store, msg["type"]
        try:
            if kind == "hafs/web/query":
                now = datetime.now(timezone.utc)
                out = s.web_query(OWNER, msg["q"], msg.get("params") or {}, now, now.tzinfo)
            elif kind == "hafs/catalog/info":
                out = catalog.info()
            elif kind == "hafs/pref/get":
                out = {"key": msg["key"], "value": s.get_pref(OWNER, msg["key"])}
            elif kind == "hafs/target/set":
                out = {"written": s.set_target(OWNER, msg["exercise_id"], float(msg["weight"]))}
            elif kind == "hafs/pref/set":
                if not targets.valid_pref(msg["key"], msg["value"]):
                    raise ValueError(f"invalid value for {msg['key']}")
                out = {"key": msg["key"], "value": msg["value"], "targets": s.set_pref(OWNER, msg["key"], msg["value"])}
            elif kind == "hafs/sync/push":
                out = s.push(OWNER, msg["records"])
            elif kind == "hafs/export":
                out = s.export_all(OWNER)
            elif kind == "hafs/import/gymrun":
                out = s.import_gymrun(OWNER, msg["csv"], msg.get("dry_run", True))
            else:
                return self._send(404, json.dumps({"code": "unknown_command", "message": kind}).encode(), "application/json")
        except ValueError as err:
            return self._send(400, json.dumps({"code": "invalid_format", "message": str(err)}).encode(), "application/json")
        self._send(200, json.dumps(out).encode(), "application/json")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    tmp = tempfile.mkdtemp(prefix="hafs-preview-")
    Handler.store = Store(str(Path(tmp) / "preview.db"))
    Handler.store.init()
    seed(Handler.store)
    print(f"Preview on http://localhost:{port}/  (data in {tmp})")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
