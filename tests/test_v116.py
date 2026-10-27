"""v1.16: weekly report notification and database health check."""
from datetime import date, datetime, timedelta

import pytest

import extras16
from conftest import add_food, meal_ids


def log_week(c, kcal_per_day=2000, days=5):
    f = add_food(c, "Reis", kcal_per_day / 10, 7, 78, 1)    # 100 g = kcal_per_day / 10 kcal -> use 1000 g
    mid = meal_ids(c, date.today().isoformat())[0]
    for i in range(days):
        c.post("/api/entries", json={"day": (date.today() - timedelta(days=i)).isoformat(), "meal_id": mid, "food_id": f, "grams": 1000})


def test_text_summarises_the_last_seven_days_in_the_users_language(user):
    c = user("Anna")
    c.put("/api/goal", json={"kcal": 2100, "protein": 20})
    log_week(c)
    c.put("/api/weights/" + (date.today() - timedelta(days=6)).isoformat(), json={"kg": 80})
    c.put("/api/weights/" + date.today().isoformat(), json={"kg": 79.2})
    title, text = extras16.weekly_text(c.uid, date.today())
    assert title == "Wochenbericht" and "Ø 2.000" in text.replace("2000", "2.000") and "(Ziel 2100)" in text
    assert "5/7 Tage erfasst" in text and "Eiweißziel an 5/5 Tagen" in text and "Gewicht -0.8 kg" in text
    c.put("/api/settings", json={"lang": "en"})
    assert extras16.weekly_text(c.uid, date.today())[0] == "Weekly report"
    assert extras16.weekly_text(user().uid, date.today())[1] == "Diese Woche wurde nichts eingetragen."


def test_settings_roundtrip_and_validation(user):
    c = user("Anna")
    assert c.get("/api/weekly-report").json()["enabled"] is False and c.get("/api/weekly-report").json()["weekday"] == 6
    assert c.put("/api/weekly-report", json={"enabled": True, "weekday": 5, "time": "18:30"}).status_code == 200
    got = c.get("/api/weekly-report").json()
    assert (got["enabled"], got["weekday"], got["time"]) == (True, 5, "18:30") and got["preview"]["title"]
    assert c.put("/api/weekly-report", json={"enabled": True, "weekday": 9, "time": "18:30"}).status_code == 400
    assert c.put("/api/weekly-report", json={"enabled": True, "weekday": 1, "time": "abc"}).status_code == 400


def test_job_sends_once_on_the_chosen_weekday_after_the_time(user, monkeypatch):
    c = user("Anna")
    c.put("/api/reminder", json={"enabled": False, "time": "20:00", "notify": "notify.phone"})
    c.put("/api/weekly-report", json={"enabled": True, "weekday": 6, "time": "19:00"})
    log_week(c)
    sent = []
    monkeypatch.setattr(extras16, "SUPERVISOR_TOKEN", "x")
    monkeypatch.setattr(extras16.httpx, "post", lambda url, **kw: sent.append((url, kw["json"])) or type("R", (), {"raise_for_status": lambda s: None})())
    monkeypatch.setattr(extras16, "owners", lambda: [c.uid])
    sunday = datetime(2026, 5, 3, 20, 0)                    # a Sunday
    extras16.send_weekly_reports(sunday.replace(hour=18))
    extras16.send_weekly_reports(sunday - timedelta(days=1))
    assert sent == []                                       # too early / wrong day
    extras16.send_weekly_reports(sunday)
    extras16.send_weekly_reports(sunday + timedelta(minutes=5))
    assert len(sent) == 1 and sent[0][0].endswith("/services/notify/phone") and sent[0][1]["title"] == "Wochenbericht"


def test_database_health_is_for_administrators_and_checks_integrity(user, monkeypatch):
    import extras8
    admin, other = user("Admin"), user("Other")
    monkeypatch.setitem(extras8.OPTIONS, "admin_users", [admin.uid])
    assert other.get("/api/admin/db").status_code == 403
    ov = admin.get("/api/admin/db").json()
    assert ov["size"] > 0 and ov["tables"]["entries"] >= 0 and ov["schema"] >= 7 and ov["rows"] == sum(ov["tables"].values())
    r = admin.post("/api/admin/db/check", json={"vacuum": True}).json()
    assert r["ok"] and r["result"] == ["ok"] and r["vacuumed"] and r["size_after"] > 0
    assert admin.post("/api/admin/db/check", json={}).json()["vacuumed"] is False
    assert other.post("/api/admin/db/check", json={}).status_code == 403


def test_frequent_setting_roundtrip_and_validation(user):
    c = user("Anna")
    assert c.get("/api/settings").json()["frequent"] == "foods"
    assert c.put("/api/settings", json={"frequent": "both"}).status_code == 200
    assert c.get("/api/settings").json()["frequent"] == "both"
    assert c.put("/api/settings", json={"frequent": "x"}).status_code == 400
