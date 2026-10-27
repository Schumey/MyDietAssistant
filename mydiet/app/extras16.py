"""v1.16: weekly report as a push notification, and a database health check for administrators."""
import os
import sqlite3
from datetime import date, datetime, timedelta

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
from extras import get_pref, period_report, set_pref
from extras2 import BACKUP_DIR, EXTRA_JOBS, owners
from extras8 import need_admin
from main import SUPERVISOR_TOKEN, app, check_time, user_from

# --- weekly report -------------------------------------------------------------------------------

WEEKLY = {   # title, headline, protein days, logged days, weight change, nothing logged
    "de": ("Wochenbericht", "Ø {} kcal pro Tag (Ziel {})", "Eiweißziel an {}/{} Tagen", "{}/{} Tage erfasst", "Gewicht {} kg", "Diese Woche wurde nichts eingetragen."),
    "en": ("Weekly report", "Ø {} kcal a day (goal {})", "protein goal on {}/{} days", "{}/{} days logged", "weight {} kg", "Nothing was logged this week."),
    "fr": ("Bilan de la semaine", "Ø {} kcal par jour (objectif {})", "objectif de protéines atteint {}/{} jours", "{}/{} jours saisis", "poids {} kg", "Rien n’a été saisi cette semaine."),
    "es": ("Resumen semanal", "Ø {} kcal al día (objetivo {})", "objetivo de proteínas en {}/{} días", "{}/{} días registrados", "peso {} kg", "Esta semana no se registró nada."),
    "nl": ("Weekoverzicht", "Ø {} kcal per dag (doel {})", "eiwitdoel op {}/{} dagen", "{}/{} dagen geregistreerd", "gewicht {} kg", "Deze week is niets ingevoerd."),
    "pt": ("Resumo semanal", "Ø {} kcal por dia (meta {})", "meta de proteína em {}/{} dias", "{}/{} dias registrados", "peso {} kg", "Nada foi registrado nesta semana."),
    "pl": ("Raport tygodniowy", "Ø {} kcal dziennie (cel {})", "cel białka w {}/{} dni", "zapisano {}/{} dni", "waga {} kg", "W tym tygodniu nic nie zapisano."),
    "it": ("Riepilogo settimanale", "Ø {} kcal al giorno (obiettivo {})", "obiettivo proteico in {}/{} giorni", "{}/{} giorni registrati", "peso {} kg", "Questa settimana non è stato registrato nulla."),
}


def weekly_config(owner: str) -> dict:
    c = get_pref(owner, "weekly_report", {}) or {}
    wd = c.get("weekday")
    return {"enabled": bool(c.get("enabled")), "weekday": wd if isinstance(wd, int) and 0 <= wd <= 6 else 6,
            "time": c.get("time") if isinstance(c.get("time"), str) and len(c["time"]) == 5 else "19:00"}


def weekly_text(owner: str, end: date) -> tuple[str, str]:
    """(title, message) for the seven days ending on `end`."""
    t = WEEKLY.get(get_pref(owner, "lang", "auto"), WEEKLY["de"])
    with db.conn() as c:
        r = period_report(c, owner, end - timedelta(days=6), end)
    if not r["logged"]:
        return t[0], t[5]
    parts = [t[1].format(round(r["kcal"]), round(r["goal_kcal"]) or "–")]
    if r["protein_goal_days"]:
        parts.append(t[2].format(r["protein_days"], r["protein_goal_days"]))
    parts.append(t[3].format(r["logged"], r["days"]))
    if r["weight_change"] is not None:
        parts.append(t[4].format(f"{r['weight_change']:+.1f}"))
    return t[0], ", ".join(parts) + "."


class WeeklyIn(BaseModel):
    enabled: bool = False
    weekday: int = 6          # 0 = Monday … 6 = Sunday
    time: str = "19:00"


@app.get("/api/weekly-report")
def get_weekly(x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    title, text = weekly_text(owner, date.today())
    return {**weekly_config(owner), "preview": {"title": title, "text": text}}


@app.put("/api/weekly-report")
def put_weekly(w: WeeklyIn, x_remote_user_id: str | None = Header(None)):
    if not 0 <= w.weekday <= 6:
        raise HTTPException(400, "Wochentag ungültig")
    if not check_time(w.time):
        raise HTTPException(400, "Uhrzeit (HH:MM) erforderlich")
    set_pref(user_from(x_remote_user_id), "weekly_report", {"enabled": w.enabled, "weekday": w.weekday, "time": w.time})
    return {"ok": True}


def send_weekly_reports(now: datetime | None = None):
    """Background job: once a week at the chosen time, through the notification service of the reminder."""
    if not SUPERVISOR_TOKEN:
        return
    now = now or datetime.now()
    today = now.date().isoformat()
    for o in owners():
        cfg = weekly_config(o)
        svc = (get_pref(o, "reminder") or {}).get("notify")
        if not (cfg["enabled"] and svc) or now.weekday() != cfg["weekday"] or now.strftime("%H:%M") < cfg["time"] \
                or get_pref(o, "weekly_sent") == today:
            continue
        set_pref(o, "weekly_sent", today)
        domain, _, name = svc.partition(".")
        try:
            httpx.post(f"http://supervisor/core/api/services/{domain}/{name}", timeout=8,
                       headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                       json=dict(zip(("title", "message"), weekly_text(o, now.date())))).raise_for_status()
        except httpx.HTTPError as e:
            print(f"[weekly] {o}: {e!r}", flush=True)


EXTRA_JOBS.append(send_weekly_reports)


# --- database health (administrators) --------------------------------------------------------

def db_overview() -> dict:
    size = os.path.getsize(db.DB_PATH) if os.path.exists(db.DB_PATH) else 0
    with db.conn() as c:
        tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]
        counts = {t: c.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0] for t in tables}
        free = c.execute("PRAGMA freelist_count").fetchone()[0] * c.execute("PRAGMA page_size").fetchone()[0]
        version = c.execute("PRAGMA user_version").fetchone()[0]
    last = None
    if os.path.isdir(BACKUP_DIR):
        stamps = [os.path.getmtime(os.path.join(BACKUP_DIR, n)) for n in os.listdir(BACKUP_DIR) if n.endswith(".json")]
        last = datetime.fromtimestamp(max(stamps)).strftime("%Y-%m-%d %H:%M") if stamps else None
    return {"size": size, "free": free, "schema": version, "tables": counts, "rows": sum(counts.values()), "last_backup": last}


@app.get("/api/admin/db")
def admin_db(x_remote_user_id: str | None = Header(None)):
    need_admin(user_from(x_remote_user_id))
    return db_overview()


class DbCheckIn(BaseModel):
    vacuum: bool = False


@app.post("/api/admin/db/check")
def admin_db_check(b: DbCheckIn, x_remote_user_id: str | None = Header(None)):
    """Integrity check; with vacuum=true the file is compacted afterwards (only when the check passed)."""
    need_admin(user_from(x_remote_user_id))
    before = os.path.getsize(db.DB_PATH)
    c = sqlite3.connect(db.DB_PATH, isolation_level=None)
    try:
        result = [r[0] for r in c.execute("PRAGMA integrity_check")]
        ok = result == ["ok"]
        if ok and b.vacuum:
            c.execute("VACUUM")
    finally:
        c.close()
    return {"ok": ok, "result": result[:10], "vacuumed": bool(ok and b.vacuum), "size_before": before, "size_after": os.path.getsize(db.DB_PATH)}
