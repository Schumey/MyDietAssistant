"""Backup archive (ZIP): export of one user or, for admins, of everyone; opening a ZIP for the restore dialog; restoring all
users at once (admin). Format: backup_zip.py. Parts: "nutrition" plus the parts hooks add (extras.HOOK_PARTS, e.g. training)."""
from datetime import date

from fastapi import Header, HTTPException, Request, Response

import backup_zip
import db
from extras import HOOK_PARTS, dump, restore_data
from extras2 import owners, summarize
from extras8 import is_admin
from main import app, user_from


def _version() -> str:
    try:
        from training.api import APP_VERSION
        return APP_VERSION
    except ImportError:
        return ""


def _names() -> dict[str, str]:
    with db.conn() as c:
        return {r["id"]: r["name"] for r in c.execute("SELECT id, name FROM users") if r["name"]}


def _summaries(data: dict) -> dict:
    s = summarize(data)
    out = {"nutrition": {k: v for k, v in s.items() if k != "workouts"}}
    if "training" in data:
        out["training"] = {"workouts": s.get("workouts", 0)}
    return out


def archive(who: list[str], scope: str) -> bytes:
    names = _names()
    users = []
    for o in who:
        d = dump(o)
        users.append({"owner": o, "name": names.get(o, ""), "data": d, "summary": _summaries(d)})
    return backup_zip.build(users, scope, _version(), HOOK_PARTS)


def _read(blob: bytes):
    try:
        return backup_zip.read(blob, HOOK_PARTS)
    except backup_zip.BadArchive as e:
        raise HTTPException(400, str(e))


@app.get("/api/backup/zip")
def backup_zip_download(scope: str = "me", x_remote_user_id: str | None = Header(None)):
    """scope=me: the user's own backup; scope=all: every user (admins only)."""
    owner = user_from(x_remote_user_id)
    if scope == "all":
        if not is_admin(owner):
            raise HTTPException(403, "Nur für Admins")
        who = sorted(set(owners()) | {owner})
    elif scope == "me":
        who = [owner]
    else:
        raise HTTPException(400, "scope must be me or all")
    return Response(archive(who, "all" if scope == "all" else "user"), media_type="application/zip", headers={
        "Content-Disposition": f'attachment; filename="hafs-{"alle-" if scope == "all" else ""}{date.today().isoformat()}.zip"'})


@app.post("/api/backup/open")
async def backup_open(request: Request, source: str | None = None, x_remote_user_id: str | None = Header(None)):
    """The user's data in a ZIP as the JSON export dict (the restore dialog works on that). The entry is the caller's own,
    or the only one in the archive; source picks another one (admins only)."""
    owner = user_from(x_remote_user_id)
    manifest, users = _read(await request.body())
    listing = [{"owner": u["owner"], "name": u.get("name") or ""} for u in manifest["users"]]
    if source and source != owner:
        if not is_admin(owner):
            raise HTTPException(403, "Nur für Admins")
        pick = source
    elif owner in users:
        pick = owner
    elif len(users) == 1:
        pick = next(iter(users))
    else:
        raise HTTPException(409, "Die Sicherung enthält mehrere Benutzer, dein Konto ist nicht dabei")
    if pick not in users:
        raise HTTPException(404, "Benutzer nicht in der Sicherung")
    return {"data": users[pick], "users": listing, "source": pick, "created": manifest.get("created"), "scope": manifest.get("scope")}


@app.post("/api/backup/restore-all")
async def backup_restore_all(request: Request, dry: bool = True, x_remote_user_id: str | None = Header(None)):
    """Admins: restore every user in the archive under their own id (dry run by default: counts only)."""
    if not is_admin(user_from(x_remote_user_id)):
        raise HTTPException(403, "Nur für Admins")
    manifest, users = _read(await request.body())
    names = _names()
    rows = [{"owner": o, "name": names.get(o, ""), "parts": _summaries(d), "current": _summaries(dump(o))} for o, d in users.items()]
    if not dry:
        for o, d in users.items():
            restore_data(o, d)
    return {"dry": dry, "users": rows, "created": manifest.get("created")}
