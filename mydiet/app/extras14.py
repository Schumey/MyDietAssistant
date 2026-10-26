"""v1.10: enter food from a sentence ("zwei Äpfel und 200 g Skyr") through the external API, for voice assistants.
Uses the same key as the other /api/ext endpoints (option api_key). Parsing and name matching live in voice.py."""
from datetime import date, datetime

from fastapi import Header, HTTPException
from pydantic import BaseModel

import db
import voice
from extras import add_saved_to_diary, get_pref
from extras2 import check_key
from main import app, check_day, check_time, food_scope, publish


class ExtSay(BaseModel):
    user: str = "default"
    text: str
    day: str | None = None
    time: str | None = None
    meal: str | None = None       # meal name; default: the meal due now, else the first one
    lang: str = "de"              # language of the answer: de | en
    dry_run: bool = False         # only report what would be entered


MESSAGES = {
    "de": {"added": "Eingetragen: {}.", "missing": "Nicht gefunden: {}.", "nothing": "Ich konnte nichts eintragen.", "to": "in {}"},
    "en": {"added": "Added: {}.", "missing": "Not found: {}.", "nothing": "I could not add anything.", "to": "to {}"},
}


def pick_meal(c, owner: str, name: str | None):
    db.ensure_meals(c, owner)
    if name:
        m = c.execute("SELECT id, name FROM meals WHERE owner=? AND lower(name)=lower(?)", (owner, name.strip())).fetchone()
        if m:
            return m
    try:
        import extras9
        cur = extras9.schedule(owner)["current"]
    except Exception:   # the schedule is a convenience only
        cur = None
    if cur:
        m = c.execute("SELECT id, name FROM meals WHERE id=? AND owner=?", (cur, owner)).fetchone()
        if m:
            return m
    return c.execute("SELECT id, name FROM meals WHERE owner=? AND archived=0 ORDER BY position", (owner,)).fetchone()


def resolve(foods: list, meals: list, portions: dict, part: dict):
    """Best food or saved meal for one spoken part: ('food'|'meal', row, grams_or_factor) or None."""
    words = part["words"]
    if not words:
        return None
    variants = [(" ".join(words), None)]
    if part["explicit"] and part["grams"] is None and len(words) > 1:
        variants.append((" ".join(words[1:]), words[0]))     # "2 Scheiben Brot": portion word + food
    top = None
    for name, unit in variants:
        for kind, rows in (("food", foods), ("meal", meals)):
            hit = voice.best(name, [r["name"] for r in rows])
            if hit:
                s = hit[1] + (1 if kind == "meal" else 0)
                if top is None or s > top[0]:
                    top = (s, kind, rows[hit[0]], unit)
    if not top:
        return None
    _, kind, row, unit = top
    if kind == "meal":
        return "meal", row, 1.0 if part["grams"] is not None else part["qty"]
    if part["grams"] is not None:
        return "food", row, part["grams"]
    ps = portions.get(row["id"], [])
    hit = voice.best(unit, [p["name"] for p in ps]) if unit and ps else None
    each = ps[hit[0]]["grams"] if hit else (row["serving_g"] or 100)
    return "food", row, part["qty"] * each


def fmt_g(g: float) -> str:
    return f"{g:.0f}" if abs(g - round(g)) < 0.05 else f"{g:.1f}".replace(".", ",")


@app.post("/api/ext/say")
def ext_say(b: ExtSay, x_mda_key: str | None = Header(None)):
    """Enter what a sentence names. Always answers 200 with `ok`, `added`, `unmatched` and a short `message` to speak back."""
    check_key(x_mda_key)
    day = b.day or date.today().isoformat()
    check_day(day)
    stamp = check_time(b.time) or (datetime.now().strftime("%H:%M") if day == date.today().isoformat() else None)
    msg = MESSAGES.get(b.lang, MESSAGES["de"])
    parts = voice.split_parts(b.text)[:20]
    if not parts:
        raise HTTPException(400, "text angeben")
    added, missing = [], []
    with db.conn() as c:
        scope, sp = food_scope(c, b.user)
        foods = [dict(r) for r in c.execute(f"SELECT * FROM foods WHERE {scope}", sp)]
        ids = [f["id"] for f in foods]
        portions = {}
        for r in c.execute(f"SELECT food_id, name, grams FROM food_portions WHERE food_id IN ({','.join('?' * len(ids))}) ORDER BY id", ids) if ids else []:
            portions.setdefault(r["food_id"], []).append({"name": r["name"], "grams": r["grams"]})
        meals = [{"id": r["id"], "name": r["name"]} for r in c.execute("SELECT id, name FROM saved_meals WHERE owner=?", (b.user,))]
        meal = pick_meal(c, b.user, b.meal)
        i = 0
        while i < len(parts):
            part = voice.parse_part(parts[i])
            hit = resolve(foods, meals, portions, part)
            if not hit and i + 1 < len(parts):     # a name that contains "und": try the two parts as one
                nxt = voice.parse_part(parts[i + 1])
                joined = {**part, "words": part["words"] + ["und"] + nxt["words"]}
                hit = resolve(foods, meals, portions, joined)
                i += 1 if hit else 0
            i += 1
            if not hit:
                missing.append(" ".join(part["words"]) or parts[i - 1])
                continue
            kind, row, amount = hit
            if kind == "meal":
                if not b.dry_run:
                    add_saved_to_diary(c, b.user, row["id"], day, meal["id"], amount, time=stamp)
                label = row["name"] if amount == 1 else f"{fmt_g(amount)}× {row['name']}"
                added.append({"name": row["name"], "label": label, "saved_meal": True})
                continue
            k = amount / 100
            if not b.dry_run:
                c.execute("INSERT INTO entries(owner,day,meal_id,name,grams,kcal,protein,carbs,fat,fiber,sugar,salt,sat_fat,time)"
                          " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                          (b.user, day, meal["id"], row["name"], amount, row["kcal"] * k, row["protein"] * k, row["carbs"] * k,
                           row["fat"] * k, *(row[m] * k for m in db.MICROS), stamp))
            added.append({"name": row["name"], "label": f"{fmt_g(amount)} g {row['name']}", "grams": round(amount, 1),
                          "kcal": round(row["kcal"] * k, 1), "saved_meal": False})
    if added and not b.dry_run:
        publish(b.user, get_pref(b.user, "display", b.user))
    text = []
    if added:
        text.append(msg["added"].format(", ".join(a["label"] for a in added)))
    if missing:
        text.append(msg["missing"].format(", ".join(missing)))
    return {"ok": bool(added), "added": added, "unmatched": missing, "meal": meal["name"] if meal else None,
            "dry_run": b.dry_run, "message": " ".join(text) or msg["nothing"]}
