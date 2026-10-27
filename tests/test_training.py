"""Training day (v1.10): shake amounts fitted to a target, dinners for what is left, trigger entering the fitted shake."""
from datetime import date

from conftest import add_food, meal_ids
from test_suggest import save_meal, setup_user

DAY = "2026-03-10"


def shake_setup(user, **training):
    c = setup_user(user)
    whey = add_food(c, "Whey", 400, 80, 8, 6)
    milk = add_food(c, "Milch", 47, 3.4, 4.8, 1.5)
    banana = add_food(c, "Banane", 90, 1, 20, 0.3)
    shake = save_meal(c, "Shake", [(whey, 30), (milk, 300), (banana, 100)])
    rice = add_food(c, "Reis", 350, 7, 78, 1)
    chicken = add_food(c, "Hähnchen", 110, 23, 0, 1.5)
    save_meal(c, "Reis mit Hähnchen", [(rice, 80), (chicken, 150)])
    quark = add_food(c, "Magerquark", 67, 12, 4, 0.3)
    save_meal(c, "Quark", [(quark, 250)])
    mids = meal_ids(c, DAY)
    body = {"saved_meal_id": shake, "target": {"protein": 40, "carbs": 50}, "shake_meal_id": mids[0], "dinner_meal_id": mids[-1], **training}
    assert c.put("/api/suggest/training", json=body).status_code == 200
    return c, shake, mids


def test_not_configured_until_a_shake_is_chosen(user):
    c = setup_user(user)
    assert c.get(f"/api/suggest/training?day={DAY}").json() == {"configured": False}


def test_config_is_kept_next_to_the_other_suggestion_settings(user):
    c, shake, mids = shake_setup(user)
    c.put("/api/suggest/config", json={"kcal_cap": True})
    t = c.get("/api/suggest/config").json()["training"]
    assert t["saved_meal_id"] == shake and t["target"]["protein"] == 40 and t["target"]["kcal"] is None and t["dinner_meal_id"] == mids[-1]


def test_unknown_shake_or_meal_is_rejected(user):
    c = setup_user(user)
    assert c.put("/api/suggest/training", json={"saved_meal_id": 99999}).status_code == 404
    assert c.put("/api/suggest/training", json={"dinner_meal_id": 99999}).status_code == 404


def test_shake_is_fitted_and_dinners_fit_the_rest(user):
    c, shake, _ = shake_setup(user)
    r = c.get(f"/api/suggest/training?day={DAY}").json()
    assert r["configured"] and not r["eaten"]
    s = r["shake"]
    assert abs(s["totals"]["protein"] - 40) < 10 and abs(s["totals"]["carbs"] - 50) < 15
    # the dinners are planned for the day's rest after the shake, and the shake itself is not offered as a dinner
    assert r["after"]["protein"] == round(150 - s["totals"]["protein"], 1)
    assert r["items"] and all(p["saved_meal_id"] != shake for p in r["items"])
    assert r["items"][0]["totals"]["protein"] > 0


def test_target_is_capped_by_what_is_left_of_the_day(user):
    c, shake, _ = shake_setup(user, target={"protein": 400})
    r = c.get(f"/api/suggest/training?day={DAY}").json()
    assert r["shake"]["target"]["protein"] == 150      # the day's protein goal


def test_eaten_shake_is_not_proposed_again(user):
    c, shake, mids = shake_setup(user)
    assert c.post(f"/api/saved-meals/{shake}/add", json={"day": DAY, "meal_id": mids[0]}).status_code == 200
    r = c.get(f"/api/suggest/training?day={DAY}").json()
    assert r["eaten"] and r["shake"] is None and r["items"]
    assert r["after"] == r["remaining"]


def test_feature_must_be_on(user):
    c = user()
    assert c.get(f"/api/suggest/training?day={DAY}").status_code == 403


def test_trigger_enters_fitted_amounts_only_when_switched_on(user):
    c, shake, mids = shake_setup(user)
    today = date.today().isoformat()
    tid = c.post("/api/triggers", json={"kind": "time", "match": "12:00", "saved_meal_id": shake, "meal_id": mids[0]}).json()["id"]
    base_protein = 30 * 0.8 + 300 * 0.034 + 100 * 0.01

    def entered():
        return sum(e["protein"] for e in c.get(f"/api/day/{today}").json()["entries"])

    c.put("/api/suggest/training", json={"saved_meal_id": shake, "target": {"protein": 20}, "shake_meal_id": mids[0], "auto": False})
    assert c.post(f"/api/triggers/{tid}/run").status_code == 200
    assert abs(entered() - base_protein) < 0.5                  # unchanged: fixed amounts
    c.delete(f"/api/day/{today}/entries")

    c.put("/api/suggest/training", json={"saved_meal_id": shake, "target": {"protein": 20}, "shake_meal_id": mids[0], "auto": True})
    assert c.post(f"/api/triggers/{tid}/run").status_code == 200
    assert entered() < base_protein - 5                         # fitted down to about 20 g protein


def test_empty_target_fields_are_accepted(user):
    c, shake, mids = shake_setup(user)
    body = {"saved_meal_id": shake, "target": {"kcal": None, "protein": 40, "carbs": None, "fat": None}, "shake_meal_id": None, "dinner_meal_id": None, "auto": True}
    assert c.put("/api/suggest/training", json=body).status_code == 200
    t = c.get("/api/suggest/config").json()["training"]
    assert t["target"] == {"kcal": None, "protein": 40.0, "carbs": None, "fat": None} and t["auto"]


def test_button_shows_only_on_training_days(user):
    c, shake, mids = shake_setup(user)
    status = lambda: c.get(f"/api/suggest/training/status?day={DAY}").json()
    assert status() == {"configured": True, "show": False}
    c.post(f"/api/saved-meals/{shake}/add", json={"day": DAY, "meal_id": mids[0]})
    assert status()["show"]                                        # shake is in the diary
    c.delete(f"/api/day/{DAY}/entries")
    assert not status()["show"]
    c.put("/api/suggest/training", json={"saved_meal_id": shake, "target": {"protein": 40}, "always": True})
    assert status()["show"]
    assert user().get(f"/api/suggest/training/status?day={DAY}").json() == {"configured": False, "show": False}   # feature off


def test_not_configured_keeps_the_button_so_setup_can_be_found(user):
    assert setup_user(user).get(f"/api/suggest/training/status?day={DAY}").json() == {"configured": False, "show": True}


def test_trigger_run_marks_a_training_day(user):
    from datetime import date
    c, shake, mids = shake_setup(user)
    today = date.today().isoformat()
    tid = c.post("/api/triggers", json={"kind": "time", "match": "12:00", "saved_meal_id": shake, "meal_id": mids[0]}).json()["id"]
    assert not c.get(f"/api/suggest/training/status?day={today}").json()["show"]
    c.post(f"/api/triggers/{tid}/run")
    assert c.get(f"/api/suggest/training/status?day={today}").json()["show"]


def test_dinners_aim_for_the_protein_goal_when_asked(user):
    c, shake, mids = shake_setup(user)
    r = c.get(f"/api/suggest/training?day={DAY}").json()
    c.put("/api/suggest/training", json={"saved_meal_id": shake, "target": {"protein": 40}, "dinner_protein": False})
    off = c.get(f"/api/suggest/training?day={DAY}").json()
    assert r["items"] and off["items"]
    assert r["items"][0]["totals"]["protein"] >= off["items"][0]["totals"]["protein"]


def test_activity_can_mark_a_training_day(user):
    from datetime import date
    c, shake, mids = shake_setup(user)
    c.put("/api/settings", json={"features": {"activity": True}})
    today = date.today().isoformat()
    status = lambda: c.get(f"/api/suggest/training/status?day={today}").json()["show"]
    c.put("/api/suggest/training", json={"saved_meal_id": shake, "target": {"protein": 40}, "activity_kcal": 400})
    c.put(f"/api/activity/{today}", json={"steps": 3000, "kcal": 250})
    assert not status()
    c.put(f"/api/activity/{today}", json={"steps": 9000, "kcal": 550})
    assert status()
    assert c.get("/api/suggest/config").json()["training"]["activity_kcal"] == 400


def test_training_sensors(user):
    import extras13
    from datetime import date
    c, shake, mids = shake_setup(user)
    out = {k: v for k, v, _ in extras13.training_sensor(c.uid)}
    assert out["training_day"] == "no" and "Whey" in out["training_shake"] and out["training_shake"] != "none"
    c.post(f"/api/saved-meals/{shake}/add", json={"day": date.today().isoformat(), "meal_id": mids[0]})
    out = {k: v for k, v, _ in extras13.training_sensor(c.uid)}
    assert out == {"training_day": "yes", "training_shake": "none"}
    assert extras13.training_sensor(user().uid) == []
