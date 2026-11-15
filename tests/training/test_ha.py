"""Training and Home Assistant: entities, events, zone, AI, external API, app packages (HA replaced by fakes)."""
import json

import httpx
import pytest

T0 = "2026-11-10T10:00:00+00:00"


@pytest.fixture
def ha(monkeypatch, app_module):
    """Fake Home Assistant: records POSTs, answers GETs from `ha.get`."""
    import training.ha as tha

    class Fake:
        posts: list = []
        states: list = []
        services: list = []
        ai_answer: dict = {}

    fake = Fake()
    fake.posts = []

    def post(path, body, timeout=5):
        fake.posts.append((path, body))

    def get(path, **params):
        return {"states": fake.states, "services": fake.services}[path]

    class InlineThread:   # run the "background" work at once
        def __init__(self, target, args=(), daemon=None):
            self.target, self.args = target, args

        def start(self):
            self.target(*self.args)

    class Resp:
        def __init__(self, data):
            self.data, self.content = data, b"x"

        def raise_for_status(self):
            pass

        def json(self):
            return self.data

    monkeypatch.setattr(app_module, "SUPERVISOR_TOKEN", "x")
    monkeypatch.setattr(tha, "_post", post)
    monkeypatch.setattr(tha, "_get", get)
    monkeypatch.setattr(tha, "_sent", {})
    monkeypatch.setattr(tha, "_discovered", set())
    monkeypatch.setattr(tha.threading, "Thread", InlineThread)
    monkeypatch.setattr(tha.httpx, "post", lambda url, **kw: (fake.posts.append((url, kw.get("json"))), Resp({"service_response": {"data": fake.ai_answer}}))[1])
    fake.module = tha
    return fake


@pytest.fixture
def anna(user):
    return user("Anna", feature=("training",))


def call(c, type_, **kw):
    r = c.post("/api/training/call", json={"type": type_, **kw})
    assert r.status_code == 200, r.text
    return r.json()


def push_workout(c, ended=True, day="2026-11-10"):
    """One workout with two sets; ids are global in the database, so they carry the user id."""
    ex = next(r["id"] for r in call(c, "hafs/sync/pull", limit=10000)["records"]["exercise"] if r["catalog_key"] == "bench_press_barbell")
    wid = f"w-{c.uid}"
    w = {"id": wid, "started_at": f"{day}T18:00:00", "routine_name": "Push", "updated_at": T0}
    if ended:
        w["ended_at"] = f"{day}T19:00:00"
    sets = [{"id": f"s{i}-{c.uid}", "workout_id": wid, "exercise_id": ex, "set_no": i, "weight": 60.0, "reps": 8, "kind": "work",
             "done_at": f"{day}T18:0{i}:00", "updated_at": T0} for i in (1, 2)]
    return call(c, "hafs/sync/push", records={"workout": [w], "workout_set": sets})


def states(fake):
    return {p.split("/", 1)[1]: b for p, b in fake.posts if p.startswith("states/")}


def test_entities_as_states_with_mda_names(ha, anna):
    assert ha.module.publish(anna.uid) is True
    s = states(ha)
    assert set(s) == {f"sensor.hafs_anna_{k}" for k in ("training_state", "workouts_today", "workouts_week", "volume_week",
                                                         "last_workout", "next_routine", "phase")} | {"binary_sensor.hafs_anna_workout_active"}
    assert s["sensor.hafs_anna_training_state"]["state"] == "none"
    assert s["sensor.hafs_anna_training_state"]["attributes"]["options"] == ["none", "active", "done"]
    assert s["binary_sensor.hafs_anna_workout_active"]["state"] == "off"
    assert s["sensor.hafs_anna_volume_week"]["attributes"]["unit_of_measurement"] == "kg"
    ha.posts.clear()
    assert ha.module.publish(anna.uid) is False and ha.posts == []      # unchanged: nothing sent


def test_nothing_without_the_feature_or_ha(ha, user, app_module, monkeypatch):
    off = user("Bert")
    assert ha.module.publish(off.uid) is False
    monkeypatch.setattr(app_module, "SUPERVISOR_TOKEN", None)
    on = user("Carla", feature=("training",))
    assert ha.module.publish(on.uid) is False and ha.posts == []


def test_push_fires_events_and_updates_entities(ha, anna):
    from datetime import datetime, timedelta, timezone
    start = (datetime.now(timezone.utc) - timedelta(minutes=10)).replace(microsecond=0, tzinfo=None)   # stored as UTC
    ex = next(r["id"] for r in call(anna, "hafs/sync/pull", limit=10000)["records"]["exercise"] if r["catalog_key"] == "bench_press_barbell")
    call(anna, "hafs/sync/push", records={
        "workout": [{"id": f"w-{anna.uid}", "started_at": start.isoformat(), "routine_name": "Push", "updated_at": T0}],
        "workout_set": [{"id": f"s-{anna.uid}", "workout_id": f"w-{anna.uid}", "exercise_id": ex, "set_no": 1, "weight": 60.0,
                         "reps": 8, "kind": "work", "done_at": start.isoformat(), "updated_at": T0}]})
    events = [p for p, _ in ha.posts if p.startswith("events/")]
    assert events == ["events/hafs_workout_started"]
    assert states(ha)["binary_sensor.hafs_anna_workout_active"]["state"] == "on"
    assert states(ha)["sensor.hafs_anna_training_state"]["state"] == "active"
    ha.posts.clear()
    w = {"id": f"w-{anna.uid}", "started_at": start.isoformat(), "ended_at": (start + timedelta(minutes=5)).isoformat(), "routine_name": "Push",
         "updated_at": "2026-11-10T11:00:00+00:00"}
    call(anna, "hafs/sync/push", records={"workout": [w]})
    finished = [b for p, b in ha.posts if p == "events/hafs_workout_finished"]
    assert finished and finished[0]["user_id"] == anna.uid and "volume_kg" in finished[0]


def test_settings_change_republishes(ha, anna):
    ha.module.publish(anna.uid)
    ha.posts.clear()
    call(anna, "hafs/pref/set", key="phase", value="bulk")
    assert states(ha)["sensor.hafs_anna_phase"]["state"] == "bulk"
    assert states(ha)["sensor.hafs_anna_phase"]["attributes"]["source"] == "manual"


def test_mqtt_discovery(ha, anna, app_module, monkeypatch):
    monkeypatch.setitem(app_module.OPTIONS, "mqtt_discovery", True)
    ha.module.publish(anna.uid)
    cfgs = {b["topic"]: json.loads(b["payload"]) for p, b in ha.posts if p == "services/mqtt/publish" and b["topic"].endswith("/config")}
    assert "homeassistant/binary_sensor/hafs_anna_workout_active/config" in cfgs
    cfg = cfgs["homeassistant/sensor/hafs_anna_training_state/config"]
    assert cfg["unique_id"] == "hafs_anna_training_state" and cfg["default_entity_id"] == "sensor.hafs_anna_training_state"
    assert cfg["json_attributes_topic"] == "hafs/anna/training_state/attributes"
    assert not states(ha)


def test_mqtt_missing_falls_back_to_states(ha, anna, app_module, monkeypatch):
    monkeypatch.setitem(app_module.OPTIONS, "mqtt_discovery", True)
    record = ha.posts

    def post(path, body, timeout=5):
        if path.startswith("services/mqtt"):
            raise httpx.HTTPError("no mqtt")
        record.append((path, body))
    monkeypatch.setattr(ha.module, "_post", post)
    ha.module.publish(anna.uid)
    assert "sensor.hafs_anna_training_state" in states(ha)


def test_zone_finds_the_gym(ha, anna):
    stamp = T0
    call(anna, "hafs/sync/push", records={"gym": [{"id": "g1", "name": "CleverFit", "zone": "zone.studio", "updated_at": stamp}]})
    ha.states = [{"entity_id": "zone.studio", "state": "1", "attributes": {"friendly_name": "Studio"}},
                 {"entity_id": "person.anna", "state": "Studio", "attributes": {"user_id": anna.uid}}]
    assert call(anna, "hafs/gym/current") == {"zone": "zone.studio", "gym_id": "g1", "gym": "CleverFit"}
    assert call(anna, "hafs/zones") == {"zones": [{"entity_id": "zone.studio", "name": "Studio"}]}
    ha.states[1]["state"] = "not_home"
    assert call(anna, "hafs/gym/current")["zone"] is None


def test_ai_review_and_plan(ha, anna, monkeypatch):
    import training.api as tapi
    push_workout(anna)
    r = anna.post("/api/training/call", json={"type": "hafs/plan/suggest", "days": 2})
    assert r.status_code == 400 and "ai_task" in r.json()["message"]          # HA has no AI task
    ha.services = [{"domain": "ai_task", "services": {"generate_data": {}}}]
    ex = next(r["id"] for r in call(anna, "hafs/sync/pull", limit=10000)["records"]["exercise"] if r["catalog_key"] == "bench_press_barbell")
    ha.ai_answer = {"plan": json.dumps({"days": [{"name": "Ganzkörper", "exercises": [{"id": ex, "sets": 3}]}]})}
    out = call(anna, "hafs/plan/suggest", days=2)
    assert out["days"][0]["exercises"][0]["id"] == ex
    sent = [b for u, b in ha.posts if isinstance(u, str) and u.endswith("generate_data?return_response")]
    assert sent and sent[0]["task_name"] == "HAFS training plan"
    monkeypatch.setattr(tapi.store, "review", lambda *a, **k: {"stagnating": [{"name": "Bankdrücken"}], "neglected": [], "instructions": "x"})
    ha.ai_answer = {"summary": "Mehr Beine."}
    assert call(anna, "hafs/review", ai=True)["text"] == "Mehr Beine."


def test_background_job_recomputes_on_a_new_day(ha, anna, monkeypatch):
    import training.api as tapi
    seen = []
    monkeypatch.setattr(tapi.store, "recompute_targets", lambda owner, today=None: seen.append(owner) or {})
    monkeypatch.setitem(ha.module._day, "date", None)
    ha.module.job()
    assert anna.uid in seen and any(p == "states/sensor.hafs_anna_training_state" for p, _ in ha.posts)
    seen.clear()
    ha.module.job()
    assert seen == []


# ---- external API ----------------------------------------------------------------------------

@pytest.fixture
def key(monkeypatch, app_module):
    monkeypatch.setitem(app_module.OPTIONS, "api_key", "geheim")
    return {"X-MDA-Key": "geheim"}


def test_ext_training_endpoints(anna, key):
    push_workout(anna)
    body = {"user": anna.uid}
    st = anna.post("/api/ext/training/status", json=body, headers=key)
    assert st.status_code == 200 and st.json()["state"] in ("none", "done") and "phase" in st.json()
    assert anna.post("/api/ext/training/plan", json=body, headers=key).json()["user_id"] == anna.uid
    w = anna.post("/api/ext/training/workouts", json={**body, "days": 3650}, headers=key).json()
    assert [x["routine"] for x in w["workouts"]] == ["Push"] or w["workouts"]
    rv = anna.post("/api/ext/training/review", json=body, headers=key).json()
    assert rv["text"] is None and "stagnating" in rv
    say = anna.post("/api/ext/training/say", json={**body, "intent": "last", "language": "de"}, headers=key).json()
    assert say["message"]
    assert anna.post("/api/ext/training/suggest", json={**body, "days": 2}, headers=key).status_code == 400


def test_ext_training_needs_key_and_feature(user, key):
    off = user("Dora")
    assert off.post("/api/ext/training/status", json={"user": off.uid}, headers={"X-MDA-Key": "falsch"}).status_code == 401
    assert off.post("/api/ext/training/status", json={"user": off.uid}, headers=key).status_code == 403
    say = off.post("/api/ext/training/say", json={"user": off.uid, "intent": "next", "language": "en"}, headers=key)
    assert say.status_code == 200 and say.json()["message"]


def test_app_packages(anna, tmp_path, monkeypatch):
    import training.ext as ext
    monkeypatch.setattr(ext, "APP_DIR", str(tmp_path))
    assert anna.get("/api/training/app").status_code == 404
    (tmp_path / "hafs-0.6.0.apk").write_bytes(b"apk")
    info = anna.get("/api/training/app").json()
    assert info["version"] == "0.6.0" and info["size"] == 3
    f = anna.get("/api/training/app/hafs-0.6.0.apk")
    assert f.status_code == 200 and f.content == b"apk"
    assert anna.get("/api/training/app/secret.txt").status_code == 404


def test_workout_makes_a_nutrition_training_day(anna):
    import extras13
    from datetime import date
    today = date.today().isoformat()
    assert extras13.trained_on(anna.uid, today) is False
    push_workout(anna, day=today)
    assert extras13.trained_on(anna.uid, today) is True
