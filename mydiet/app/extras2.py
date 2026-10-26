"""Diary notes, automatic backups, restore preview, external API for HA automations, reminders, time zone."""
import json
import os
import re
import threading
import time
from datetime import date, datetime

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from main import OPTIONS, SUPERVISOR_TOKEN, app, check_day, check_time, publish, user_from
from extras import JsonImport, dump, get_pref, ha_get, set_pref


# --- notes -----------------------------------------------------------------

class NoteIn(BaseModel):
    meal_id: int = 0      # 0 = note for the whole day
    text: str = ""


@app.put("/api/notes/{day}")
def put_note(day: str, n: NoteIn, x_remote_user_id: str | None = Header(None)):
    check_day(day)
    owner = user_from(x_remote_user_id)
    text = n.text.strip()[:2000]
    with db.conn() as c:
        if text:
            c.execute("INSERT OR REPLACE INTO day_notes(owner,day,meal_id,text) VALUES(?,?,?,?)",
                      (owner, day, n.meal_id, text))
        else:
            c.execute("DELETE FROM day_notes WHERE owner=? AND day=? AND meal_id=?", (owner, day, n.meal_id))
    return {"ok": True}


# --- restore preview -------------------------------------------------------

def summarize(d: dict) -> dict:
    days = sorted({e["day"] for e in d.get("entries", [])})
    return {"entries": len(d.get("entries", [])), "foods": len(d.get("foods", [])),
            "saved_meals": len(d.get("saved_meals", [])), "weights": len(d.get("weights", [])),
            "days": len(days), "first": days[0] if days else None, "last": days[-1] if days else None}


@app.post("/api/import/json/preview")
def import_preview(j: JsonImport, x_remote_user_id: str | None = Header(None)):
    """What a restore would replace and what it would bring in."""
    if j.data.get("app") != "MyDietAssistant":
        raise HTTPException(400, "Keine MyDietAssistant-Sicherung")
    return {"current": summarize(dump(user_from(x_remote_user_id))), "backup": summarize(j.data)}


# --- automatic backups -----------------------------------------------------

BACKUP_DIR = "/backup/mydiet" if os.path.isdir("/backup") else os.path.join(os.path.dirname(os.path.abspath(db.DB_PATH)), "backups")
SAFE = re.compile(r"[^A-Za-z0-9_.-]+")


def owners() -> list[str]:
    with db.conn() as c:
        return [r[0] for r in c.execute(
            "SELECT owner FROM entries UNION SELECT owner FROM foods UNION SELECT owner FROM weights UNION SELECT owner FROM meals")]


def backup_prefix(owner: str) -> str:
    return f"mydiet-{SAFE.sub('_', owner)}-"


def list_backup_names(owner: str) -> list[str]:
    if not os.path.isdir(BACKUP_DIR):
        return []
    pre = backup_prefix(owner)
    return sorted((n for n in os.listdir(BACKUP_DIR) if n.startswith(pre) and n.endswith(".json")), reverse=True)


def write_backup(owner: str) -> str:
    os.makedirs(BACKUP_DIR, exist_ok=True)
    name = f"{backup_prefix(owner)}{datetime.now():%Y-%m-%d_%H%M}.json"
    with open(os.path.join(BACKUP_DIR, name), "w", encoding="utf-8") as f:
        json.dump(dump(owner), f, ensure_ascii=False)
    return name


def prune_backups(owner: str):
    limit = time.time() - int(OPTIONS.get("backup_keep_days", 14)) * 86400
    for n in list_backup_names(owner):
        p = os.path.join(BACKUP_DIR, n)
        if os.path.getmtime(p) < limit:
            os.remove(p)


def auto_backup():
    if not OPTIONS.get("auto_backup", True):
        return
    today = date.today().isoformat()
    for o in owners():
        if not any(n[len(backup_prefix(o)):].startswith(today) for n in list_backup_names(o)):
            write_backup(o)
        prune_backups(o)


@app.get("/api/backups")
def backups(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    files = []
    for n in list_backup_names(owner):
        p = os.path.join(BACKUP_DIR, n)
        files.append({"name": n, "size": os.path.getsize(p),
                      "ts": datetime.fromtimestamp(os.path.getmtime(p)).strftime("%Y-%m-%d %H:%M")})
    return {"dir": BACKUP_DIR, "auto": bool(OPTIONS.get("auto_backup", True)),
            "keep_days": int(OPTIONS.get("backup_keep_days", 14)), "files": files}


@app.post("/api/backups")
def backup_now(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    name = write_backup(owner)
    prune_backups(owner)
    return {"name": name}


@app.get("/api/backups/{name}")
def read_backup(name: str, x_remote_user_id: str | None = Header(None)):
    if name not in list_backup_names(user_from(x_remote_user_id)):
        raise HTTPException(404, "Sicherung nicht gefunden")
    with open(os.path.join(BACKUP_DIR, name), encoding="utf-8") as f:
        return json.load(f)


# --- external API (HA automations via rest_command) -------------------------

def check_key(key: str | None):
    want = OPTIONS.get("api_key") or ""
    if not want:
        raise HTTPException(403, "Externe API ist aus: Option api_key im Add-on setzen")
    if key != want:
        raise HTTPException(401, "falscher Schlüssel")


class ExtEntry(BaseModel):
    user: str = "default"
    day: str | None = None
    time: str | None = None
    meal: str | None = None        # meal name; default: first meal
    food: str | None = None        # name of a saved food ...
    grams: float = 0
    name: str | None = None        # ... or a quick entry
    kcal: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0


@app.post("/api/ext/entry")
def ext_entry(e: ExtEntry, x_mda_key: str | None = Header(None)):
    check_key(x_mda_key)
    day = e.day or date.today().isoformat()
    check_day(day)
    t = check_time(e.time)
    with db.conn() as c:
        db.ensure_meals(c, e.user)
        meal = None
        if e.meal:
            meal = c.execute("SELECT id FROM meals WHERE owner=? AND lower(name)=lower(?)", (e.user, e.meal)).fetchone()
        meal = meal or c.execute("SELECT id FROM meals WHERE owner=? AND archived=0 ORDER BY position", (e.user,)).fetchone()
        if e.food:
            f = c.execute("SELECT * FROM foods WHERE owner=? AND lower(name)=lower(?)", (e.user, e.food)).fetchone()
            if not f:
                raise HTTPException(404, f"Lebensmittel „{e.food}“ nicht gefunden")
            g = e.grams or f["serving_g"] or 100
            k = g / 100
            vals = (f["name"], g, f["kcal"] * k, f["protein"] * k, f["carbs"] * k, f["fat"] * k)
        elif e.name:
            vals = (e.name, e.grams, e.kcal, e.protein, e.carbs, e.fat)
        else:
            raise HTTPException(400, "food oder name angeben")
        c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,time) VALUES(?,?,?,?,?,?,?,?,?,?)",
                  (e.user, day, meal["id"], *vals, t))
    publish(e.user, get_pref(e.user, "display", e.user))
    return {"ok": True}


class ExtWeight(BaseModel):
    user: str = "default"
    day: str | None = None
    kg: float


@app.post("/api/ext/weight")
def ext_weight(w: ExtWeight, x_mda_key: str | None = Header(None)):
    check_key(x_mda_key)
    day = w.day or date.today().isoformat()
    check_day(day)
    if not 20 <= w.kg <= 500:
        raise HTTPException(400, "kg außerhalb des gültigen Bereichs")
    with db.conn() as c:
        c.execute("INSERT OR REPLACE INTO weights(owner,day,kg) VALUES(?,?,?)", (w.user, day, w.kg))
    publish(w.user, get_pref(w.user, "display", w.user))
    return {"ok": True}


@app.get("/api/ext/info")
def ext_info(x_remote_user_id: str | None = Header(None)):
    """Shown in the settings: own user id and whether the external API is enabled."""
    return {"user": user_from(x_remote_user_id), "enabled": bool(OPTIONS.get("api_key"))}


# --- reminder --------------------------------------------------------------

class ReminderIn(BaseModel):
    enabled: bool = False
    time: str = "20:00"
    notify: str = ""     # e.g. notify.mobile_app_pixel


@app.get("/api/reminder")
def get_reminder(x_remote_user_id: str | None = Header(None)):
    return get_pref(user_from(x_remote_user_id), "reminder", {"enabled": False, "time": "20:00", "notify": ""})


@app.put("/api/reminder")
def put_reminder(r: ReminderIn, x_remote_user_id: str | None = Header(None)):
    if not check_time(r.time):
        raise HTTPException(400, "Uhrzeit fehlt")
    if r.enabled and not re.fullmatch(r"notify\.[a-z0-9_]+", r.notify):
        raise HTTPException(400, "Benachrichtigungsdienst wie notify.mobile_app_handy angeben")
    set_pref(user_from(x_remote_user_id), "reminder", r.model_dump())
    return {"ok": True}


NOTIFY = {   # push texts follow the interface language of the person (German when it is "auto")
    "de": ("Ernährungstagebuch", "Heute ist noch nichts eingetragen (Erinnerung {} Uhr).", "{} steht an ({}–{} Uhr)."),
    "en": ("Food diary", "Nothing logged yet today (reminder {}).", "{} is due ({}–{})."),
    "fr": ("Journal alimentaire", "Rien n’est encore saisi aujourd’hui (rappel {}).", "{} est à l’ordre du jour ({}–{})."),
    "es": ("Diario de alimentos", "Hoy todavía no hay nada registrado (recordatorio {}).", "Toca {} ({}–{})."),
    "nl": ("Voedingsdagboek", "Vandaag is nog niets ingevoerd (herinnering {}).", "{} staat gepland ({}–{})."),
}


def notify_text(owner: str, kind: int, *args) -> tuple[str, str]:
    """(title, message) of a push notification; kind 1 = diary reminder, 2 = meal nudge."""
    t = NOTIFY.get(get_pref(owner, "lang", "auto"), NOTIFY["de"])
    return t[0], t[kind].format(*args)


def send_reminders():
    if not SUPERVISOR_TOKEN:
        return
    now = datetime.now()
    today = now.date().isoformat()
    for o in owners():
        r = get_pref(o, "reminder")
        if not r or not r.get("enabled") or now.strftime("%H:%M") < r["time"] or get_pref(o, "reminder_sent") == today:
            continue
        with db.conn() as c:
            n = c.execute("SELECT COUNT(*) FROM entries WHERE owner=? AND day=?", (o, today)).fetchone()[0]
        set_pref(o, "reminder_sent", today)
        if n:
            continue
        domain, _, svc = r["notify"].partition(".")
        try:
            httpx.post(f"http://supervisor/core/api/services/{domain}/{svc}", timeout=8,
                       headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                       json=dict(zip(("title", "message"), notify_text(o, 1, r["time"])))
                       ).raise_for_status()
        except httpx.HTTPError as e:
            print(f"[reminder] {o}: {e!r}", flush=True)


# --- time zone from HA + background loop -------------------------------------

tz_state = {"zone": None}


def sync_timezone():
    if tz_state["zone"] or not SUPERVISOR_TOKEN or not hasattr(time, "tzset"):
        return
    zone = ha_get("config").get("time_zone")
    if zone:
        os.environ["TZ"] = zone
        time.tzset()
        tz_state["zone"] = zone
        print(f"[tz] Zeitzone aus Home Assistant: {zone}", flush=True)


EXTRA_JOBS = []   # later modules (extras9) add background jobs here


def maintenance_loop():
    time.sleep(8)
    while True:
        for job in (sync_timezone, auto_backup, send_reminders, *EXTRA_JOBS):
            try:
                job()
            except Exception as e:
                print(f"[maintenance] {job.__name__}: {e!r}", flush=True)
        time.sleep(60)


threading.Thread(target=maintenance_loop, daemon=True, name="maintenance").start()
