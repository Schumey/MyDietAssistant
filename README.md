# MyDietAssistant

Lokales Ernährungstagebuch im Stil von MyFitnessPal als **Home-Assistant-Add-on**. Die Daten bleiben in deinem HA (SQLite im Add-on-Speicher); einzige Internetfunktion ist die optionale Barcode-Suche über Open Food Facts.

Die Oberfläche läuft per Ingress im HA-Seitenmenü, übernimmt das aktive HA-Theme (bei Themes namens „HA 95/98“ automatisch im Windows-Look, einstellbar) und trennt Benutzer anhand ihres HA-Kontos.

## Funktionen

- **Tagebuch** mit frei benennbaren Mahlzeiten (Frühstück, Nachtschicht, PWO …) oder alternativ nach Uhrzeiten; Spalten Kalorien / Kohlenhydrate / Fette / Eiweiß, Gesamt, Tagesziel, Verbleibend
- Mahlzeiten **speichern, kopieren, leeren**; „Häufig verwendet“-Vorschläge beim Hinzufügen
- **Lebensmittel** und **Mahlzeiten** mit Kategorien (z. B. Diät / Bulk), die sich ein- und ausblenden lassen
- **Gewicht** mit Verlauf und Zielgewicht, **Statistik** (7 Tage bis 1 Jahr) inkl. **Kalorienbilanz** aus Gewichtstrend und Aufnahme
- **Trigger:** Lebensmittel/Mahlzeiten automatisch eintragen oder Tagebuch-Mahlzeiten nur an bestimmten Tagen einblenden, abhängig von HA-Zuständen (z. B. Ort) oder Kalenderterminen
- **Import/Export:** JSON-Sicherung, CSV-Export, MyFitnessPal-CSV-Import
- **HA-Sensoren** für Kalorien/Makros des Tages und das aktuelle Gewicht

Details zu Sensoren und Bedienung: [mydiet/DOCS.md](mydiet/DOCS.md). Änderungen: [mydiet/CHANGELOG.md](mydiet/CHANGELOG.md). Geplantes und Ideen: [roadmap.md](roadmap.md).

## Installation

1. HA → Einstellungen → Add-ons → Add-on-Store → ⋮ → **Repositories** → `https://github.com/Schumey/MyDietAssistant` hinzufügen (bei privatem Repo alternativ den Ordner `mydiet` nach `/addons` bzw. `/local_apps` kopieren).
2. **MyDietAssistant** installieren und starten, „In Seitenleiste anzeigen“ aktivieren.

Nach Updates: Add-on-Store neu laden und das Add-on aktualisieren (bzw. bei lokalen Add-ons neu bauen).

## MyFitnessPal-Daten übernehmen

In MyFitnessPal den Datenexport anfordern und die CSV (Spalten `Date, Meal, Food, Calories, …`) unter **Einstellungen → Daten → MyFitnessPal-CSV importieren** einlesen. Wahlweise alle Einträge mit Mahlzeiten oder nur die Tageswerte (Kalorien/Makros) plus Gewicht.

## Entwicklung

```
cd mydiet/app
pip install fastapi uvicorn httpx
MYDIET_DB=./dev.db uvicorn main:app --port 8099
```

Danach `http://localhost:8099/` öffnen. Ohne Home Assistant gibt es keine Sensoren, Trigger und Entitätsvorschläge; Mahlzeiten mit Einblend-Regeln werden lokal immer angezeigt.

Struktur: `mydiet/app/main.py` (Kern-API), `extras.py` (Import/Export, Mahlzeiten, Trigger), `db.py` (SQLite-Schema), `static/` (Oberfläche ohne Build-Schritt).
