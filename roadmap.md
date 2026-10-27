# Roadmap

Ideensammlung für MyDietAssistant. Reihenfolge und Zuschnitt sind Vorschläge, keine Zusagen. Bereits Umgesetztes steht im [Changelog](mydiet/CHANGELOG.md).

Aufwand: **S** = Stunden, **M** = ein bis zwei Abende, **L** = größeres Vorhaben.

## Home Assistant

- **Sprach-Eintrag mit Rückfragen** (M): bei mehrdeutigen Treffern („Apfel“ oder „Apfelsaft“?) nachfragen und Synonyme für Lebensmittel pflegen; nötig sind echte Sätze aus dem Alltag.

## Lebensmittel und Eingabe

- **Rezept-Import aus einem Foto** (L): braucht eine Texterkennung (lokal oder über einen Dienst); Text einfügen geht seit 1.18.
- **Weitere Sprachen** (S je Sprache): zum Beispiel Portugiesisch oder Polnisch; ein Wörterbuch in `static/app.js` (über 870 Texte), ein Eintrag in `LANGS` (`extras.py`), Berichts- und Push-Texte in `extras6.py` und `extras2.py`, `translations/<sprache>.yaml` für die Add-on-Optionen und die Sprachauswahl.
- **Tabellenformate mit echten Dateien prüfen** (S): CIQUAL, Schweizer Datenbank, USDA und Österreichische Tabelle sind erkannt, bisher nur gegen Beispielüberschriften geprüft.

## Technik und Qualität

- **Browser-Tests vertiefen** (M): die Kamera-Abfrage des Barcode-Scanners mit einer simulierten Kamera, weitere Dialoge in der Handy-Ansicht und Windows-Look-Details ergänzen.
- **Wörterbücher prüfen lassen** (S): Muttersprachler für Französisch, Spanisch, Niederländisch und Italienisch, bisher maschinell erstellt und nur formal geprüft (gleiche Schlüssel, gleiche Platzhalter).
- **Offline-Start der App** (M): die App selbst ohne Verbindung öffnen können (Service Worker, mit Ingress schwierig); Eintragen ohne Verbindung geht seit 1.19, solange die App offen ist.
- **Barrierefreiheit mit Screenreader prüfen** (S): Namen, Rollen und Tastaturbedienung sind seit 1.19 getestet; offen sind ein Durchgang mit echten Screenreadern und Kontrastmessungen (besonders Windows-95-Look).
