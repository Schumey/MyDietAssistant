# Roadmap

Ideensammlung für MyDietAssistant. Reihenfolge und Zuschnitt sind Vorschläge, keine Zusagen. Bereits Umgesetztes steht im [Changelog](mydiet/CHANGELOG.md).

Aufwand: **S** = Stunden, **M** = ein bis zwei Abende, **L** = größeres Vorhaben.

## Home Assistant

- **Sprach-Eintrag mit Rückfragen** (M): bei mehrdeutigen Treffern („Apfel“ oder „Apfelsaft“?) nachfragen und Synonyme für Lebensmittel pflegen; nötig sind echte Sätze aus dem Alltag.

## Lebensmittel und Eingabe

- **Rezept-Import aus Text und Foto** (L): Rezepte aus eingefügtem Text oder einem Foto lesen, wenn die Seite keine Rezeptdaten mitliefert.
- **Weitere Sprachen** (S je Sprache): zum Beispiel Italienisch; ein Wörterbuch in `static/app.js` und ein Eintrag in `LANGS` (`extras.py`) genügen.
- **Weitere Datenquellen** (M): zum Beispiel die Österreichische Nährwerttabelle oder USDA-Dateiexporte über den Tabellen-Import (Spaltenkürzel ergänzen). CIQUAL und die Schweizer Datenbank sind seit 1.1 erkannt, bisher nur gegen Beispielzeilen geprüft.

## Technik und Qualität

- **Mehr Browser-Tests** (M): Barcode-Dialog, Haushaltsansicht mit zwei Benutzern, Handy-Ansicht und Windows-Look ergänzen.
- **Mehrere Wörterbücher prüfen lassen** (S): Muttersprachler für die Übersetzungen, bisher maschinell erstellt und nur formal geprüft.
