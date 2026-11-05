"""v1.31: MyFitnessPal file export (Nährwerte-/Messwerte-Übersicht, one row per day and meal)."""

NUT = ("Datum,Mahlzeit,Kalorien,Fett (g),Gesättigte Fettsäuren,Mehrfach ungesättigte Fettsäuren,"
       "Einfach ungesättigte Fettsäuren,Transfettsäuren,Cholesterin,Natrium (mg),Kalium,Kohlenhydrate (g),"
       "Ballaststoffe,Zucker,Eiweiß (g),Vitamin A,Vitamin C,Kalzium,Eisen,export_headers.note\n"
       "2026-09-19,Abendessen,1124.7,19.3,4.0,0.0,0.0,0.0,217.8,385.0,80.8,116.7,2.1,18.1,117.4,15.4,0.0,2.8,10.0,\n"
       "2026-09-19,Frühstück,800.2,25.0,6.8,0.1,0.2,0.0,440.2,437.3,258.9,56.9,5.3,15.6,86.5,31.6,0.2,8.0,20.5,\n")
WEIGHT = "Datum,Gewicht\n2026-09-19,88.0\n2026-09-20,87.5\n"


def test_summary_preview_and_import(user):
    c = user()
    p = c.post("/api/import/mfp/preview", json={"csv": NUT, "weights_csv": WEIGHT}).json()
    assert p["days"] == 1 and p["items"] == 2 and p["weights"] == 2
    r = c.post("/api/import/mfp", json={"csv": NUT, "weights_csv": WEIGHT, "mode": "full"}).json()
    assert r["days"] == 1 and r["entries"] == 2 and r["weights"] == 2
    d = c.get("/api/day/2026-09-19").json()
    assert round(d["totals"]["kcal"]) == 1925
    assert round(d["totals"]["protein"], 1) == 203.9 and round(d["totals"]["carbs"], 1) == 173.6
    assert c.get("/api/weights").json()


def test_summary_english_headers(user):
    c = user()
    csv = "Date,Meal,Calories,Fat (g),Carbohydrates (g),Protein (g)\n2026-09-19,Lunch,500,10,50,30\n"
    p = c.post("/api/import/mfp/preview", json={"csv": csv}).json()
    assert p["items"] == 1 and p["days"] == 1


def test_not_mfp(user):
    c = user()
    assert c.post("/api/import/mfp/preview", json={"csv": "a,b\n1,2\n"}).status_code == 400
