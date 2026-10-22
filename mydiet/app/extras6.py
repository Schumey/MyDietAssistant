"""Export for third parties (dietitian, trainer): day-summary CSV and a printable report (save as PDF from the browser)."""
import csv
import io
from datetime import date, timedelta
from html import escape

from fastapi import Header, HTTPException, Response

import db
from extras import feature_on, get_pref, goal_hit, pref_cache
from main import app, check_day, get_goal, user_from

KG_LB = 2.2046226218
CM_IN = 2.54

T = {
    "de": {"title": "Ernährungsbericht", "period": "Zeitraum", "summary": "Zusammenfassung", "days": "Tage", "logged": "Erfasste Tage",
           "avg": "Ø pro erfasstem Tag", "kcal": "Kalorien", "protein": "Eiweiß", "carbs": "Kohlenhydrate", "fat": "Fett", "goal": "Ziel",
           "on_goal": "Tage im Kalorienziel", "weight": "Gewicht", "change": "Veränderung", "date": "Datum", "note": "Notiz", "meal": "Mahlzeit",
           "food": "Lebensmittel", "amount": "Menge", "daily": "Tagesübersicht", "entries": "Einzelne Einträge", "body": "Körpermaße",
           "none": "Keine Daten im Zeitraum.", "print": "Drucken / als PDF speichern", "made": "Erstellt mit MyDietAssistant am",
           "fiber": "Ballaststoffe", "sugar": "Zucker", "salt": "Salz", "sat_fat": "ges. Fettsäuren", "aim": "Ziel der Person",
           "lose": "Abnehmen", "maintain": "Gewicht halten", "gain": "Zunehmen", "dec": ",", "c_s": "KH", "f_s": "Fett", "p_s": "Eiweiß"},
    "en": {"title": "Nutrition report", "period": "Period", "summary": "Summary", "days": "Days", "logged": "Logged days",
           "avg": "Average per logged day", "kcal": "Calories", "protein": "Protein", "carbs": "Carbohydrates", "fat": "Fat", "goal": "Goal",
           "on_goal": "Days on calorie goal", "weight": "Weight", "change": "Change", "date": "Date", "note": "Note", "meal": "Meal",
           "food": "Food", "amount": "Amount", "daily": "Daily overview", "entries": "Individual entries", "body": "Body measurements",
           "none": "No data in this period.", "print": "Print / save as PDF", "made": "Created with MyDietAssistant on",
           "fiber": "Fiber", "sugar": "Sugar", "salt": "Salt", "sat_fat": "Sat. fat", "aim": "Person's aim",
           "lose": "Lose weight", "maintain": "Maintain weight", "gain": "Gain weight", "dec": ".", "c_s": "Carbs", "f_s": "Fat", "p_s": "Protein"},
}


def period(a_from: str | None, a_to: str | None) -> tuple[date, date]:
    end = date.fromisoformat(a_to) if a_to else date.today()
    start = date.fromisoformat(a_from) if a_from else end - timedelta(days=29)
    if a_from:
        check_day(a_from)
    if a_to:
        check_day(a_to)
    if end < start or (end - start).days > 1830:
        raise HTTPException(400, "ungültiger Zeitraum")
    return start, end


def collect(owner: str, start: date, end: date) -> dict:
    s, e = start.isoformat(), end.isoformat()
    with db.conn() as c:
        rows = {r["day"]: dict(r) for r in c.execute(
            "SELECT day, SUM(kcal) kcal, SUM(protein) protein, SUM(carbs) carbs, SUM(fat) fat, SUM(fiber) fiber, SUM(sugar) sugar,"
            " SUM(salt) salt, SUM(sat_fat) sat_fat FROM entries WHERE owner=? AND day BETWEEN ? AND ? GROUP BY day", (owner, s, e))}
        weights = {r["day"]: r["kg"] for r in c.execute("SELECT day, kg FROM weights WHERE owner=? AND day BETWEEN ? AND ?", (owner, s, e))}
        notes = {r["day"]: r["text"] for r in c.execute("SELECT day, text FROM day_notes WHERE owner=? AND meal_id=0 AND day BETWEEN ? AND ?", (owner, s, e))} \
            if feature_on(owner, "notes") else {}
        body = [dict(r) for r in c.execute("SELECT day, name, value FROM body_measures WHERE owner=? AND day BETWEEN ? AND ? ORDER BY day, name", (owner, s, e))] \
            if feature_on(owner, "body") else []
        entries = [dict(r) for r in c.execute(
            "SELECT e.day, e.time, m.name meal, e.name, e.grams, e.kcal, e.protein, e.carbs, e.fat FROM entries e LEFT JOIN meals m ON m.id=e.meal_id"
            " WHERE e.owner=? AND e.day BETWEEN ? AND ? ORDER BY e.day, e.time, e.id", (owner, s, e))]
        days = []
        with pref_cache():
            for i in range((end - start).days + 1):
                d = (start + timedelta(days=i)).isoformat()
                g = get_goal(c, owner, d)
                days.append({"day": d, "logged": d in rows, **{k: (rows[d][k] if d in rows else 0) for k in ("kcal", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sat_fat")},
                             "goal_kcal": g["kcal"], "goal_protein": g["protein"], "weight": weights.get(d), "note": notes.get(d, "")})
    return {"days": days, "body": body, "entries": entries}


@app.get("/api/export/summary.csv")
def export_summary(a_from: str | None = None, a_to: str | None = None, x_remote_user_id: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    start, end = period(a_from, a_to)
    data = collect(owner, start, end)
    micros = feature_on(owner, "micros")
    out = io.StringIO()
    wr = csv.writer(out)
    wr.writerow(["Date", "Calories", "Goal calories", "Protein", "Carbs", "Fat", "Goal protein", "Weight (kg)"]
                + (["Fiber", "Sugar", "Salt", "Saturated fat"] if micros else []) + (["Note"] if any(d["note"] for d in data["days"]) else []))
    notes = any(d["note"] for d in data["days"])
    for d in data["days"]:
        r = lambda k: round(d[k], 1) if d["logged"] else ""
        wr.writerow([d["day"], r("kcal"), d["goal_kcal"] or "", r("protein"), r("carbs"), r("fat"), d["goal_protein"] or "",
                     d["weight"] if d["weight"] is not None else ""]
                    + ([r("fiber"), r("sugar"), r("salt"), r("sat_fat")] if micros else []) + ([d["note"]] if notes else []))
    return Response("﻿" + out.getvalue(), media_type="text/csv; charset=utf-8", headers={
        "Content-Disposition": f'attachment; filename="mydiet-summary-{start}-{end}.csv"'})


def fmt(v: float, dec: str, digits: int = 0) -> str:
    s = f"{v:,.{digits}f}"
    return s.translate(str.maketrans(",.", ".,")) if dec == "," else s


@app.get("/api/export/report", response_class=Response)
def export_report(a_from: str | None = None, a_to: str | None = None, entries: bool = False,
                  x_remote_user_id: str | None = Header(None), x_remote_user_display_name: str | None = Header(None)):
    owner = user_from(x_remote_user_id)
    start, end = period(a_from, a_to)
    lang = get_pref(owner, "lang", "auto")
    lang = "en" if lang == "en" else "de"
    imperial = get_pref(owner, "units", "metric") == "imperial"
    t = T[lang]
    dec = t["dec"]
    data = collect(owner, start, end)
    logged = [d for d in data["days"] if d["logged"]]
    mode = get_pref(owner, "goal_mode", "lose")
    wu = "lb" if imperial else "kg"
    wc = (lambda kg: kg * KG_LB) if imperial else (lambda kg: kg)
    n = lambda v, dg=0: fmt(v, dec, dg)
    esc = escape
    avg = lambda k: sum(d[k] for d in logged) / len(logged) if logged else 0
    with_goal = [d for d in logged if d["goal_kcal"]]
    ws = [d for d in data["days"] if d["weight"] is not None]
    name = x_remote_user_display_name or get_pref(owner, "display", "") or ""

    def dated(s: str) -> str:
        y, m, d = s.split("-")
        return f"{d}.{m}.{y}" if lang == "de" else f"{m}/{d}/{y}"

    tiles = [(t["logged"], f"{len(logged)} / {len(data['days'])}"), (t["kcal"] + " Ø", f"{n(avg('kcal'))} kcal"),
             (t["protein"] + " Ø", f"{n(avg('protein'))} g"), (t["carbs"] + " Ø", f"{n(avg('carbs'))} g"), (t["fat"] + " Ø", f"{n(avg('fat'))} g")]
    if with_goal:
        tiles.append((t["on_goal"], f"{sum(1 for d in with_goal if goal_hit(mode, d['kcal'], d['goal_kcal']))} / {len(with_goal)}"))
    if len(ws) > 1:
        ch = wc(ws[-1]["weight"] - ws[0]["weight"])
        tiles.append((t["weight"], f"{n(wc(ws[0]['weight']), 1)} → {n(wc(ws[-1]['weight']), 1)} {wu} ({'+' if ch > 0 else ''}{n(ch, 1)})"))
    tiles.append((t["aim"], t[mode]))

    # calorie bars with the goal as a line
    top = max([d["kcal"] for d in logged] + [d["goal_kcal"] for d in data["days"]] + [1])
    W, H = 720, 150
    bw = W / max(len(data["days"]), 1)
    bars = "".join(f'<rect x="{i * bw + bw * .1:.1f}" y="{H - d["kcal"] / top * H:.1f}" width="{bw * .8:.1f}" height="{d["kcal"] / top * H:.1f}" fill="#4a90c2"/>'
                   for i, d in enumerate(data["days"]) if d["logged"])
    goal_line = "".join(f'<line x1="{i * bw:.1f}" x2="{(i + 1) * bw:.1f}" y1="{H - d["goal_kcal"] / top * H:.1f}" y2="{H - d["goal_kcal"] / top * H:.1f}" stroke="#e08a00" stroke-width="2" stroke-dasharray="5 3"/>'
                        for i, d in enumerate(data["days"]) if d["goal_kcal"])
    chart = f'<svg viewBox="0 0 {W} {H}" width="100%" height="{H}" role="img">{bars}{goal_line}</svg>'

    rows = "".join(
        f'<tr><td>{dated(d["day"])}</td><td class="r">{n(d["kcal"]) if d["logged"] else "–"}</td><td class="r">{n(d["goal_kcal"]) if d["goal_kcal"] else "–"}</td>'
        f'<td class="r">{n(d["carbs"]) if d["logged"] else "–"}</td><td class="r">{n(d["fat"]) if d["logged"] else "–"}</td>'
        f'<td class="r">{n(d["protein"]) if d["logged"] else "–"}</td><td class="r">{n(wc(d["weight"]), 1) if d["weight"] is not None else ""}</td>'
        f'<td>{esc(d["note"])}</td></tr>' for d in data["days"])
    entry_html = ""
    if entries and data["entries"]:
        cur, parts = None, []
        for e in data["entries"]:
            if e["day"] != cur:
                cur = e["day"]
                parts.append(f'<tr class="day"><td colspan="7">{dated(cur)}</td></tr>')
            parts.append(f'<tr><td>{esc(e["time"] or "")}</td><td>{esc(e["meal"] or "")}</td><td>{esc(e["name"])}</td>'
                         f'<td class="r">{n(e["grams"]) + " g" if e["grams"] else ""}</td><td class="r">{n(e["kcal"])}</td>'
                         f'<td class="r">{n(e["carbs"], 1)}/{n(e["fat"], 1)}/{n(e["protein"], 1)}</td><td></td></tr>')
        entry_html = (f'<h2>{t["entries"]}</h2><table><thead><tr><th></th><th>{t["meal"]}</th><th>{t["food"]}</th><th class="r">{t["amount"]}</th>'
                      f'<th class="r">kcal</th><th class="r">{t["c_s"]}/{t["f_s"]}/{t["p_s"]} (g)</th><th></th></tr></thead><tbody>{"".join(parts)}</tbody></table>')
    body_html = ""
    if data["body"]:
        names = sorted({b["name"] for b in data["body"]})
        byday: dict = {}
        for b in data["body"]:
            byday.setdefault(b["day"], {})[b["name"]] = b["value"]
        lu = "in" if imperial else "cm"
        conv = lambda nm, v: v if "%" in nm else (v / CM_IN if imperial else v)
        head = "".join(f"<th class='r'>{esc(nm)} ({'%' if '%' in nm else lu})</th>" for nm in names)
        trs = "".join(f"<tr><td>{dated(d)}</td>" + "".join(f"<td class='r'>{n(conv(nm, v[nm]), 1) if nm in v else ''}</td>" for nm in names) + "</tr>"
                      for d, v in sorted(byday.items()))
        body_html = f'<h2>{t["body"]}</h2><table><thead><tr><th>{t["date"]}</th>{head}</tr></thead><tbody>{trs}</tbody></table>'

    page = f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t["title"]} {start} – {end}</title>
<style>
body{{font:13px/1.4 system-ui,Segoe UI,Roboto,sans-serif;color:#111;margin:24px auto;max-width:820px;padding:0 16px}}
h1{{font-size:22px;margin:0 0 2px}} h2{{font-size:15px;margin:22px 0 6px;border-bottom:1px solid #999;padding-bottom:2px}}
.sub{{color:#555;margin-bottom:12px}} .tiles{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}}
.tile{{border:1px solid #bbb;border-radius:6px;padding:6px 8px}} .tile span{{display:block;color:#555;font-size:11px}} .tile b{{font-size:15px}}
table{{width:100%;border-collapse:collapse;font-size:12px}} th,td{{padding:3px 6px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}}
th{{background:#f0f0f0}} .r{{text-align:right;font-variant-numeric:tabular-nums}} tr.day td{{background:#f7f7f7;font-weight:600}}
button{{padding:6px 14px;font-size:14px;cursor:pointer}} .foot{{margin-top:18px;color:#777;font-size:11px}}
@media print{{button{{display:none}} body{{margin:0;max-width:none}} tr{{break-inside:avoid}} h2{{break-after:avoid}}}}
</style></head><body>
<p><button onclick="print()">{t["print"]}</button></p>
<h1>{t["title"]}{(" – " + esc(name)) if name else ""}</h1>
<div class="sub">{t["period"]}: {dated(start.isoformat())} – {dated(end.isoformat())}</div>
<h2>{t["summary"]}</h2>
{'<div class="tiles">' + "".join(f'<div class="tile"><span>{esc(a)}</span><b>{esc(b)}</b></div>' for a, b in tiles) + '</div>' if logged else f'<p>{t["none"]}</p>'}
<p>{chart}</p>
<h2>{t["daily"]}</h2>
<table><thead><tr><th>{t["date"]}</th><th class="r">kcal</th><th class="r">{t["goal"]}</th><th class="r">{t["c_s"]} (g)</th><th class="r">{t["f_s"]} (g)</th><th class="r">{t["p_s"]} (g)</th><th class="r">{t["weight"]} ({wu})</th><th>{t["note"]}</th></tr></thead><tbody>{rows}</tbody></table>
{body_html}{entry_html}
<div class="foot">{t["made"]} {dated(date.today().isoformat())}</div>
</body></html>"""
    return Response(page, media_type="text/html; charset=utf-8")
