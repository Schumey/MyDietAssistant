"""v1.25: days marked incomplete stay in the diary but are left out of statistics, reports and backups round-trip."""
from datetime import date, timedelta


def _quick(c, day, kcal):
    assert c.post("/api/entries/quick", json={"day": day, "name": "x", "kcal": kcal}).status_code == 200


def test_incomplete_day_excluded(user):
    c = user()
    t, y = date.today(), date.today() - timedelta(days=1)
    _quick(c, t.isoformat(), 2000)
    _quick(c, y.isoformat(), 300)
    assert c.get(f"/api/day/{y}").json()["incomplete"] is False
    assert c.put(f"/api/day/{y}/incomplete", json={"incomplete": True}).json()["incomplete"] is True
    d = c.get(f"/api/day/{y}").json()
    assert d["incomplete"] is True and d["totals"]["kcal"] == 300      # still in the diary
    days = {x["day"]: x for x in c.get("/api/stats?days=3").json()["days"]}
    assert days[y.isoformat()]["logged"] is False and days[y.isoformat()]["incomplete"] is True
    assert days[t.isoformat()]["logged"] is True
    r = c.get(f"/api/report?a_from={y}&a_to={t}").json()[0]
    assert r["logged"] == 1 and r["kcal"] == 2000 and r["incomplete"] == 1
    # round trip through export/import keeps the flag; unmarking removes it
    dump = c.get("/api/export/json").json()
    assert dump["incomplete_days"] == [y.isoformat()]
    c.put(f"/api/day/{y}/incomplete", json={"incomplete": False})
    assert c.get(f"/api/day/{y}").json()["incomplete"] is False
    assert c.post("/api/import/json", json={"data": dump}).status_code == 200
    assert c.get(f"/api/day/{y}").json()["incomplete"] is True
