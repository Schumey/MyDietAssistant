"""Several users: user list, admin view (list / export / delete a user's data) and household meals (optional feature "household")."""
import json
import os
from datetime import datetime

from fastapi import Header, HTTPException, Response
from pydantic import BaseModel

import db
from extras import dump, feature_on, get_pref
from extras3 import PHOTO_DIR
from main import OPTIONS, app, publish, user_from


def init_tables():
    with db.conn() as c:
        c.execute("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', first_seen TEXT NOT NULL, last_seen TEXT NOT NULL)")


init_tables()


def touch_user(uid: str, name: str | None):
    now = datetime.now().isoformat(timespec="seconds")
    with db.conn() as c:
        c.execute("INSERT INTO users(id,name,first_seen,last_seen) VALUES(?,?,?,?)"
                  " ON CONFLICT(id) DO UPDATE SET last_seen=excluded.last_seen, name=CASE WHEN ?<>'' THEN ? ELSE users.name END",
                  (uid, name or "", now, now, name or "", name or ""))


def is_admin(uid: str) -> bool:
    """Admins: the ids/names in the add-on option admin_users; with an empty list the first user who ever opened the add-on."""
    if uid == "default":
        return True
    admins = [str(a).strip().lower() for a in (OPTIONS.get("admin_users") or []) if str(a).strip()]
    with db.conn() as c:
        row = c.execute("SELECT name FROM users WHERE id=?", (uid,)).fetchone()
        if admins:
            return uid.lower() in admins or bool(row and row["name"].lower() in admins)
        first = c.execute("SELECT id FROM users ORDER BY first_seen, id LIMIT 1").fetchone()
    return bool(first and first["id"] == uid)


def need_admin(uid: str):
    if not is_admin(uid):
        raise HTTPException(403, "Nur für Administratoren")


@app.get("/api/me")
def me(x_remote_user_id: str | None = Header(None), x_remote_user_display_name: str | None = Header(None)):
    uid = user_from(x_remote_user_id)
    if x_remote_user_display_name:
        from extras import set_pref
        set_pref(uid, "display", x_remote_user_display_name)
    touch_user(uid, x_remote_user_display_name)
    return {"id": uid, "name": x_remote_user_display_name or "Lokal", "admin": is_admin(uid)}


# --- admin view --------------------------------------------------------------

@app.get("/api/admin/users")
def admin_users(x_remote_user_id: str | None = Header(None)):
    need_admin(user_from(x_remote_user_id))
    out = []
    with db.conn() as c:
        ids = {r[0] for r in c.execute("SELECT id FROM users")} | {r[0] for r in c.execute("SELECT owner FROM entries UNION SELECT owner FROM foods UNION SELECT owner FROM weights")}
        for uid in sorted(ids):
            u = c.execute("SELECT name, last_seen FROM users WHERE id=?", (uid,)).fetchone()
            e = c.execute("SELECT COUNT(*) n, COUNT(DISTINCT day) d, MAX(day) last FROM entries WHERE owner=?", (uid,)).fetchone()
            out.append({"id": uid, "name": (u["name"] if u and u["name"] else get_pref(uid, "display", "")) or "", "last_seen": u["last_seen"] if u else "",
                        "entries": e["n"], "days": e["d"], "last_entry": e["last"],
                        "foods": c.execute("SELECT COUNT(*) FROM foods WHERE owner=?", (uid,)).fetchone()[0],
                        "weights": c.execute("SELECT COUNT(*) FROM weights WHERE owner=?", (uid,)).fetchone()[0],
                        "admin": is_admin(uid)})
    return out


@app.get("/api/admin/users/{uid}/export")
def admin_export(uid: str, x_remote_user_id: str | None = Header(None)):
    need_admin(user_from(x_remote_user_id))
    body = json.dumps(dump(uid), ensure_ascii=False, indent=1)
    return Response(body, media_type="application/json", headers={"Content-Disposition": f'attachment; filename="mydiet-{uid[:12]}.json"'})


CHILDREN = (("food_portions", "food_id", "foods"), ("saved_meal_items", "saved_meal_id", "saved_meals"), ("recipe_items", "recipe_id", "recipes"),
            ("tracker_log", "tracker_id", "trackers"), ("trigger_log", "trigger_id", "triggers"), ("meal_trigger_log", "meal_trigger_id", "meal_triggers"))


def delete_user_data(c, uid: str):
    for t, col, parent in CHILDREN:
        c.execute(f"DELETE FROM {t} WHERE {col} IN (SELECT id FROM {parent} WHERE owner=?)", (uid,))
    photos = [r[0] for r in c.execute("SELECT id FROM body_photos WHERE owner=?", (uid,))]
    for (t,) in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall():
        if t != "users" and "owner" in {r["name"] for r in c.execute(f"PRAGMA table_info({t})")}:
            c.execute(f"DELETE FROM {t} WHERE owner=?", (uid,))
    c.execute("DELETE FROM users WHERE id=?", (uid,))
    for pid in photos:
        p = os.path.join(PHOTO_DIR, f"{pid}.img")
        if os.path.exists(p):
            os.remove(p)


@app.delete("/api/admin/users/{uid}")
def admin_delete(uid: str, confirm: str = "", x_remote_user_id: str | None = Header(None)):
    me_id = user_from(x_remote_user_id)
    need_admin(me_id)
    if uid == me_id:
        raise HTTPException(400, "Das eigene Konto kann hier nicht gelöscht werden")
    with db.conn() as c:
        u = c.execute("SELECT name FROM users WHERE id=?", (uid,)).fetchone()
        shown = (u["name"] if u and u["name"] else "") or uid
        if confirm.strip().lower() != shown.lower():
            raise HTTPException(400, "Zur Bestätigung den Namen des Benutzers eingeben")
        delete_user_data(c, uid)
    return {"ok": True}


# --- household meals ---------------------------------------------------------

class ShareTarget(BaseModel):
    user: str
    factor: float = 1.0            # portion relative to the shared entry


class ShareIn(BaseModel):
    targets: list[ShareTarget]


@app.get("/api/household/users")
def household_users(x_remote_user_id: str | None = Header(None)):
    """Other users who switched on the household feature (the opt-in to receive entries)."""
    me_id = user_from(x_remote_user_id)
    if not feature_on(me_id, "household"):
        return []
    with db.conn() as c:
        rows = [dict(r) for r in c.execute("SELECT id, name FROM users WHERE id<>? ORDER BY name", (me_id,))]
    return [{"id": r["id"], "name": r["name"] or r["id"]} for r in rows if feature_on(r["id"], "household")]


@app.post("/api/entries/{eid}/share")
def share_entry(eid: int, s: ShareIn, x_remote_user_id: str | None = Header(None), x_remote_user_display_name: str | None = Header(None)):
    """Copy a diary entry into other users' diaries with their own portion size."""
    me_id = user_from(x_remote_user_id)
    if not feature_on(me_id, "household"):
        raise HTTPException(403, "Haushaltsfunktion ist nicht aktiviert")
    sender = x_remote_user_display_name or get_pref(me_id, "display", "") or me_id
    done = []
    with db.conn() as c:
        e = c.execute("SELECT e.*, m.name meal_name FROM entries e LEFT JOIN meals m ON m.id=e.meal_id WHERE e.id=? AND e.owner=?", (eid, me_id)).fetchone()
        if not e:
            raise HTTPException(404, "entry not found")
        for t in s.targets:
            if t.user == me_id or not t.factor > 0 or t.factor > 50:
                continue
            if not (c.execute("SELECT 1 FROM users WHERE id=?", (t.user,)).fetchone() and feature_on(t.user, "household")):
                raise HTTPException(403, "Dieser Benutzer nimmt nicht am Haushalt teil")
            db.ensure_meals(c, t.user)
            meals = [dict(r) for r in c.execute("SELECT id, name FROM meals WHERE owner=? AND archived=0 ORDER BY position", (t.user,))] or \
                    [dict(r) for r in c.execute("SELECT id, name FROM meals WHERE owner=? ORDER BY position", (t.user,))]
            mname = (e["meal_name"] or "").lower()
            meal = next((m for m in meals if m["name"].lower() == mname), None) or meals[0]
            k = t.factor
            c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      (t.user, e["day"], meal["id"], f"{e['name']} (von {sender})", e["grams"] * k, e["kcal"] * k, e["protein"] * k, e["carbs"] * k, e["fat"] * k,
                       e["fiber"] * k, e["sugar"] * k, e["salt"] * k, e["sat_fat"] * k, e["time"]))
            done.append(t.user)
    for u in done:
        publish(u, get_pref(u, "display", "") or u)
    return {"shared": len(done)}


# --- version / update check ----------------------------------------------------

REPO_CONFIG_URL = "https://raw.githubusercontent.com/Schumey/MyDietAssistant/main/mydiet/config.yaml"


def _version_of(text: str) -> str:
    import re
    m = re.search(r'^version:\s*"?([0-9][^"\s]*)"?\s*$', text, re.M)
    return m.group(1) if m else ""


def installed_version() -> str:
    """The Supervisor knows the installed version; outside HA fall back to the config.yaml next to the app."""
    import httpx
    from main import SUPERVISOR_TOKEN
    if SUPERVISOR_TOKEN:
        try:
            r = httpx.get("http://supervisor/addons/self/info", timeout=5, headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"})
            v = (r.json().get("data") or {}).get("version")
            if v:
                return str(v)
        except Exception:
            pass
    try:
        with open(os.path.join(os.path.dirname(__file__), "..", "config.yaml"), encoding="utf-8") as f:
            return _version_of(f.read())
    except OSError:
        return ""


def _tuple(v: str):
    return tuple(int(p) if p.isdigit() else 0 for p in v.split("."))


@app.get("/api/version")
def version_info(check: bool = False):
    """Installed version; with check=1 also the newest version published in the repository."""
    out = {"version": installed_version(), "latest": None, "update": False, "error": None}
    if check:
        import httpx
        try:
            r = httpx.get(REPO_CONFIG_URL, timeout=8, follow_redirects=True)
            r.raise_for_status()
            out["latest"] = _version_of(r.text) or None
            out["update"] = bool(out["latest"] and out["version"] and _tuple(out["latest"]) > _tuple(out["version"]))
        except Exception as e:
            out["error"] = str(e) or e.__class__.__name__
    return out
