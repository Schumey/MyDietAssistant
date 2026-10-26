# Roadmap

Ideensammlung für MyDietAssistant. Reihenfolge und Zuschnitt sind Vorschläge, keine Zusagen. Bereits Umgesetztes steht im [Changelog](mydiet/CHANGELOG.md).

Aufwand: **S** = Stunden, **M** = ein bis zwei Abende, **L** = größeres Vorhaben.

## Home Assistant

- **Sprach-Eintrag mit Rückfragen** (M): bei mehrdeutigen Treffern („Apfel“ oder „Apfelsaft“?) nachfragen und Synonyme für Lebensmittel pflegen; nötig sind echte Sätze aus dem Alltag.
- **Wochenbericht per Benachrichtigung** (S): der Ernährungsbericht als kurze Zusammenfassung sonntagabends über den Benachrichtigungsdienst der Erinnerung (Hintergrundjob über `extras2.EXTRA_JOBS`).
- **Trainingstag erweitern** (S): berechnete Shake-Mengen als Sensor für Automationen oder als Hinweis in der Benachrichtigung; Trainingstag zusätzlich über die Aktivität erkennen (Schritte, verbrannte Kalorien).

## Lebensmittel und Eingabe

- **Rezept-Import aus Text und Foto** (L): Rezepte aus eingefügtem Text oder einem Foto lesen, wenn die Seite keine Rezeptdaten mitliefert.
- **Mikronährstoff-Lücken** (M): Wochenübersicht über Ballaststoffe, Eiweiß, Salz und Zucker gegen Ziele, mit einer Zeile wie „Ballaststoffe diese Woche 30 % unter Ziel“.
- **Gemeinsam bearbeiten** (M): geteilte Rezepte und Mahlzeiten (seit 1.15 nur nutzen und kopieren) optional von allen im Haushalt änderbar machen, wie bei Lebensmitteln.
- **Weitere Sprachen** (S je Sprache): zum Beispiel Portugiesisch oder Polnisch; ein Wörterbuch in `static/app.js` (über 870 Texte), ein Eintrag in `LANGS` (`extras.py`), Berichts- und Push-Texte in `extras6.py` und `extras2.py`, `translations/<sprache>.yaml` für die Add-on-Optionen und die Sprachauswahl.
- **Weitere Datenquellen** (M): zum Beispiel die Österreichische Nährwerttabelle oder USDA-Dateiexporte über den Tabellen-Import (Spaltenkürzel ergänzen). CIQUAL und die Schweizer Datenbank sind seit 1.1 erkannt, bisher nur gegen Beispielzeilen geprüft.

## Technik und Qualität

- **Mehr Browser-Tests** (M): Barcode-Dialog, Handy-Ansicht und Windows-Look ergänzen (Haushaltsansicht, Trainingstag, Einkaufsliste und Italienisch sind seit 1.13–1.15 abgedeckt).
- **Wörterbücher prüfen lassen** (S): Muttersprachler für Französisch, Spanisch, Niederländisch und Italienisch, bisher maschinell erstellt und nur formal geprüft (gleiche Schlüssel, gleiche Platzhalter).
- **Datenbank-Gesundheitscheck** (S): in der Benutzerverwaltung Größe, Anzahl der Einträge und letzte Sicherung zeigen, dazu `VACUUM` und Integritätsprüfung per Knopf.
- **Offline-Eingabe** (M): Einträge ohne Verbindung zwischenspeichern und nachsenden, nützlich unterwegs mit schlechtem Empfang.
- **Barrierefreiheit prüfen** (S–M): Tastaturbedienung der Dialoge, Fokusreihenfolge, Kontraste im Windows-95-Look.
