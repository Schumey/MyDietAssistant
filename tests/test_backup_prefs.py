"""v1.41: the JSON backup carries all options (step plan, micro goals, ...) but no secrets or job state."""
import extras


def test_options_survive_export_and_import(user):
    a = user()
    ramp = {"start": "2026-11-01", "every_days": 7, "step": {"kcal": 100}, "max_steps": 4, "active": True}
    extras.set_pref(a.uid, "ramp", ramp)
    extras.set_pref(a.uid, "micro_goals", {"fiber": 30})
    extras.set_pref(a.uid, "weekly_report", {"enabled": True, "weekday": 6})
    extras.set_pref(a.uid, "mealie", {"url": "http://mealie.local", "token": "secret"})
    extras.set_pref(a.uid, "reminder_sent", "2026-11-14")
    dump = a.get("/api/export/json").json()
    assert dump["prefs"]["ramp"] == ramp and dump["prefs"]["micro_goals"] == {"fiber": 30}
    assert "mealie" not in dump["prefs"] and "reminder_sent" not in dump["prefs"]
    assert "secret" not in a.get("/api/export/json").text

    b = user()
    assert b.post("/api/import/json", json={"data": dump}).status_code == 200
    assert extras.get_pref(b.uid, "ramp") == ramp
    assert extras.get_pref(b.uid, "weekly_report") == {"enabled": True, "weekday": 6}
    assert extras.get_pref(b.uid, "reminder_sent") is None
    assert extras.get_pref(b.uid, "mealie") == {"url": "http://mealie.local", "token": ""}


def test_import_ignores_skipped_keys_in_a_crafted_backup(user):
    a = user()
    data = {"app": "MyDietAssistant", "version": 1, "prefs": {"display": "Evil", "scale_state": {"x": 1}, "shopping": {"todo": "todo.x"}}}
    assert a.post("/api/import/json", json={"data": data}).status_code == 200
    assert extras.get_pref(a.uid, "display") != "Evil" and extras.get_pref(a.uid, "scale_state") is None
    assert extras.get_pref(a.uid, "shopping") == {"todo": "todo.x"}
