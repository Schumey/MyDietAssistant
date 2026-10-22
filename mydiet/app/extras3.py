"""Body measurements and progress photos (optional feature "body")."""
import base64
import os
import re

from fastapi import Header, HTTPException, Response
from pydantic import BaseModel

import db
from main import app, check_day, user_from

PHOTO_DIR = os.path.join(os.path.dirname(os.path.abspath(db.DB_PATH)), "photos")
MAX_PHOTO = 8 * 1024 * 1024


# --- measurements ----------------------------------------------------------

class BodyIn(BaseModel):
    values: dict[str, float | None]     # name -> value, null/missing deletes that value for the day


@app.get("/api/body")
def list_body(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return [dict(r) for r in c.execute(
            "SELECT day, name, value FROM body_measures WHERE owner=? ORDER BY day, name", (user_from(x_remote_user_id),))]


@app.put("/api/body/{day}")
def put_body(day: str, b: BodyIn, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    owner = user_from(x_remote_user_id)
    with db.conn() as c:
        for name, v in b.values.items():
            name = name.strip()[:40]
            if not name:
                continue
            if v is None:
                c.execute("DELETE FROM body_measures WHERE owner=? AND day=? AND name=?", (owner, day, name))
            elif 0 < v < 1000:
                c.execute("INSERT OR REPLACE INTO body_measures(owner,day,name,value) VALUES(?,?,?,?)", (owner, day, name, v))
            else:
                raise HTTPException(400, f"Ungültiger Wert für {name}")
    return {"ok": True}


@app.delete("/api/body/values/{day}/{name}")
def del_body(day: str, name: str, x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        c.execute("DELETE FROM body_measures WHERE owner=? AND day=? AND name=?", (user_from(x_remote_user_id), day, name))
    return {"ok": True}


# --- progress photos (files next to the database, never in the JSON export) -----

class PhotoIn(BaseModel):
    day: str
    note: str = ""
    data: str            # data URL or plain base64 of a JPEG/PNG/WebP


def photo_path(pid: int) -> str:
    return os.path.join(PHOTO_DIR, f"{pid}.img")


@app.get("/api/body/photos")
def list_photos(x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        return [dict(r) for r in c.execute(
            "SELECT id, day, note, mime FROM body_photos WHERE owner=? ORDER BY day DESC, id DESC", (user_from(x_remote_user_id),))]


@app.post("/api/body/photos")
def add_photo(p: PhotoIn, x_remote_user_id: str | None = Header(None)):
    check_day(p.day)
    m = re.match(r"data:(image/(?:jpeg|png|webp));base64,(.*)$", p.data, re.S)
    mime, b64 = (m.group(1), m.group(2)) if m else ("image/jpeg", p.data)
    try:
        raw = base64.b64decode(b64, validate=False)
    except Exception:
        raise HTTPException(400, "Kein gültiges Bild")
    if not raw or len(raw) > MAX_PHOTO:
        raise HTTPException(400, "Bild leer oder zu groß (max. 8 MB)")
    with db.conn() as c:
        pid = c.execute("INSERT INTO body_photos(owner,day,note,mime) VALUES(?,?,?,?)",
                        (user_from(x_remote_user_id), p.day, p.note.strip()[:200], mime)).lastrowid
    os.makedirs(PHOTO_DIR, exist_ok=True)
    with open(photo_path(pid), "wb") as f:
        f.write(raw)
    return {"id": pid}


@app.get("/api/body/photos/{pid}/file")
def photo_file(pid: int, x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        r = c.execute("SELECT mime FROM body_photos WHERE id=? AND owner=?", (pid, user_from(x_remote_user_id))).fetchone()
    if not r or not os.path.exists(photo_path(pid)):
        raise HTTPException(404, "Foto nicht gefunden")
    with open(photo_path(pid), "rb") as f:
        return Response(f.read(), media_type=r["mime"], headers={"Cache-Control": "private, max-age=86400"})


@app.delete("/api/body/photos/{pid}")
def del_photo(pid: int, x_remote_user_id: str | None = Header(None)):
    with db.conn() as c:
        n = c.execute("DELETE FROM body_photos WHERE id=? AND owner=?", (pid, user_from(x_remote_user_id))).rowcount
    if n and os.path.exists(photo_path(pid)):
        os.remove(photo_path(pid))
    return {"ok": True}
