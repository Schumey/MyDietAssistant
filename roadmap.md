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

- **Mehr Browser-Tests** (M): Barcode-Dialog, Handy-Ansicht und Windows-Look ergänzen (Haushaltsansicht, Trainingstag, Einkaufsliste und Italienisch sind seit 1.13–1.15 abgedeckt).
- **Wörterbücher prüfen lassen** (S): Muttersprachler für Französisch, Spanisch, Niederländisch und Italienisch, bisher maschinell erstellt und nur formal geprüft (gleiche Schlüssel, gleiche Platzhalter).
- **Offline-Eingabe** (M): Einträge ohne Verbindung zwischenspeichern und nachsenden, nützlich unterwegs mit schlechtem Empfang.
- **Barrierefreiheit prüfen** (S–M): Tastaturbedienung der Dialoge, Fokusreihenfolge, Kontraste im Windows-95-Look.
