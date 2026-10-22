# MyDietAssistant

[![Tests](https://github.com/Schumey/MyDietAssistant/actions/workflows/test.yml/badge.svg)](https://github.com/Schumey/MyDietAssistant/actions/workflows/test.yml)

Lokales Ernährungstagebuch im Stil von MyFitnessPal als **Home-Assistant-Add-on**. Kalorien, Makros, Gewicht, Trigger aus Home Assistant und Auswertungen, alles bleibt bei Dir: die Daten liegen in einer SQLite-Datei im Add-on-Speicher und sind im HA-Backup enthalten. Internet brauchen nur die optionalen Online-Datenbanken (Open Food Facts, USDA).

Die Oberfläche läuft per Ingress im HA-Seitenmenü, übernimmt das aktive HA-Theme (bei Themes namens „HA 95/98“ automatisch im Windows-Look, einstellbar), gibt es auf Deutsch und Englisch (metrisch und imperial) und trennt Benutzer anhand ihres HA-Kontos.

## Funktionen

- **Tagebuch** mit frei benennbaren Mahlzeiten (Frühstück, Nachtschicht, PWO …) oder nach Uhrzeiten; Kalorien, Kohlenhydrate, Fett, Eiweiß, Tagesziel und Verbleibend; Mahlzeiten speichern, kopieren, teilen; Wischen zwischen Tagen auf dem Handy
- **Lebensmittel** mit Kategorien, Portionsgrößen, Favoriten, Barcode (Kamera, Foto oder Eingabe, mit Rückfall-Scanner für iPhone und Firefox); Tabellenimport (BLS, CSV, Excel)
- **Ziele:** Abnehmen, Halten oder Zunehmen, Ziele pro Wochentag und Profile, per Trigger umschaltbar
- **Statistik** von 7 Tagen bis 1 Jahr: Kalorien- und Makroverlauf mit Zielinien, **Kalorienbilanz** aus Gewichtstrend und Aufnahme, Prognose zum Zielgewicht
- **Trigger:** Lebensmittel oder Mahlzeiten automatisch eintragen, Mahlzeiten nur an bestimmten Tagen zeigen, abhängig von HA-Zuständen, Kalender oder Uhrzeit
- **HA-Sensoren** für Kalorien, Makros, Rest, Wochenschnitt, Gewicht und Bilanz; Schnittstelle für Automationen (Waage, Sprachassistent)
- **Import/Export:** JSON-Sicherung, CSV, MyFitnessPal, Cronometer, FDDB, Yazio, Apple Health, Google Fit; Bericht und Tabelle für Berater und Trainer
- **Optionale Zusatzfunktionen** (standardmäßig aus): Wochentagsziele, Wasser und Ergänzungen, Rezepte, weitere Nährwerte, Notizen, Körpermaße und Fortschrittsfotos, Online-Datenbanken mit Abgleich, Aktivität, Mahlzeiten-Zeitplan, Haushalt (mehrere Benutzer teilen Einträge, Lebensmittel und Mahlzeiten)
- **Benutzerverwaltung** für Administratoren, automatische Sicherungen, Erinnerung per Benachrichtigung

Details zu Optionen, Sensoren und Bedienung: [mydiet/DOCS.md](mydiet/DOCS.md). Änderungen: [mydiet/CHANGELOG.md](mydiet/CHANGELOG.md). Ideen: [roadmap.md](roadmap.md).

## Installation

1. HA → Einstellungen → Add-ons → Add-on-Store → ⋮ → **Repositories** → `https://github.com/Schumey/MyDietAssistant` hinzufügen. (Bei einem privaten Repository alternativ den Ordner `mydiet` nach `/addons` kopieren.)
2. **MyDietAssistant** installieren und starten, „In Seitenleiste anzeigen“ aktivieren.

Nach Updates: Add-on-Store neu laden und das Add-on aktualisieren (bei lokalen Add-ons neu bauen).

## Daten übernehmen

Einstellungen → Daten: MyFitnessPal-CSV, oder unter „Weitere Importe …“ Cronometer, FDDB, Yazio, Google Fit und Apple Health. Die Spalten werden anhand der Überschriften erkannt und lassen sich vor dem Import korrigieren.

## Entwicklung

```
pip install fastapi httpx pydantic uvicorn pytest
python -m pytest
cd mydiet/app
MYDIET_DB=./dev.db uvicorn main:app --port 8099
```

Danach `http://localhost:8099/` öffnen. Ohne Home Assistant gibt es keine Sensoren, Trigger und Entitätsvorschläge; Mahlzeiten mit Einblend-Regeln werden lokal immer angezeigt.

Struktur: `mydiet/app/main.py` (Kern-API) und `extras*.py` (je ein Funktionsbereich), `db.py` (Schema und Migrationen), `static/` (Oberfläche ohne Build-Schritt), `tests/` (pytest). Hinweise für die Weiterentwicklung stehen in [CLAUDE.md](CLAUDE.md).

Der Barcode-Rückfall nutzt [ZXing](https://github.com/zxing-js/library) (Apache-2.0, Lizenz in `mydiet/app/static/vendor/ZXING-LICENSE.txt`).
