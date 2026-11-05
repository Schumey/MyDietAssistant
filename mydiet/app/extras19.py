"""v1.29: data from the phone's health store (Android app, Health Connect).

The Android app reads weight, steps and active calories on the phone and hands them over here. Rules:
- weight: only days without a weight of their own (a value typed in MyDietAssistant or from the scale wins);
- activity: only with the optional feature "activity", never over a day typed in by hand; stored like sensor values
  (manual = 0), so the Home Assistant sensors may still update today.
"""
from datetime import date, timedelta

from fastapi import Header
from pydantic import BaseModel

import db
from extras import feature_on
from main import app, check_day, publish, user_from

MAX_DAYS = 400   # one import covers at most this far back


class HealthWeight(BaseModel):
    day: str
    kg: float


class HealthActivity(BaseModel):
    day: str
    steps: float = 0
    kcal: float = 0


class HealthImport(BaseModel):
    weights: list[HealthWeight] = []
    activity: list[HealthActivity] = []


@app.post("/api/health/import")
def health_import(data: HealthImport, x_remote_user_id: str | None = Header(None),
                  x_remote_user_display_name: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    today = date.today()
    oldest = (today - timedelta(days=MAX_DAYS)).isoformat()
    newest = today.isoformat()

    def usable(day: str) -> bool:
        try:
            check_day(day)
        except Exception:
            return False
        return oldest <= day <= newest

    out = {"weights": 0, "activity": 0, "skipped": 0, "activity_off": False}
    with db.conn() as c:
        have = {r["day"] for r in c.execute("SELECT day FROM weights WHERE owner=? AND day>=?", (owner, oldest))}
        for w in data.weights:
            if not usable(w.day) or not 20 <= w.kg <= 500 or w.day in have:
                out["skipped"] += 1
                continue
            c.execute("INSERT INTO weights(owner,day,kg) VALUES(?,?,?)", (owner, w.day, round(w.kg, 2)))
            have.add(w.day)
            out["weights"] += 1

        if data.activity and not feature_on(owner, "activity"):
            out["activity_off"] = True
        elif data.activity:
            manual = {r["day"] for r in c.execute(
                "SELECT day FROM activity_days WHERE owner=? AND manual=1 AND day>=?", (owner, oldest))}
            for a in data.activity:
                bad = a.steps < 0 or a.kcal < 0 or a.steps > 200000 or a.kcal > 20000
                if not usable(a.day) or bad or a.day in manual or not (a.steps or a.kcal):
                    out["skipped"] += 1
                    continue
                c.execute("INSERT OR REPLACE INTO activity_days(owner,day,steps,kcal,manual) VALUES(?,?,?,?,0)",
                          (owner, a.day, round(a.steps), round(a.kcal)))
                out["activity"] += 1
    if out["weights"]:
        publish(owner, x_remote_user_display_name or owner)
    return out
