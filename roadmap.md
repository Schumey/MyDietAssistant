# Roadmap

Ideensammlung für MyDietAssistant. Reihenfolge und Zuschnitt sind Vorschläge, keine Zusagen. Bereits Umgesetztes steht im [Changelog](mydiet/CHANGELOG.md).

Aufwand: **S** = Stunden, **M** = ein bis zwei Abende, **L** = größeres Vorhaben.

## Als Nächstes (hoher Nutzen im Alltag)


## Trigger und Home Assistant


## Auswertung


## Lebensmittel und Eingabe

- **Barcode-Scan ohne Browser-Unterstützung** (S): Für iPhone/Firefox eine mitgelieferte Scan-Bibliothek (ZXing) als Rückfall, da dort `BarcodeDetector` fehlt.
- **Nahrungsmengen in oz** (M): Mengenfelder und Anzeige in Unzen für Lebensmittel (Gewicht lb und Maße in sind schon umschaltbar). Weitere Sprachen: der Übersetzungsmechanismus (`static/i18n.js`) nimmt zusätzliche Wörterbücher auf.
- **Mehrere Datenquellen** (L): Weitere Nährwertdatenbanken neben Open Food Facts (z. B. BLS), optional abschaltbar, da sie online abfragen.

## Import und Export

- **Weitere Importe** (M): Cronometer, FDDB, Yazio, Apple Health/Google Fit (Gewicht).
- **Export für Dritte** (S): PDF/CSV-Bericht für Ernährungsberatung oder Trainer.

## Mehrere Benutzer

- **Geteilte Lebensmittel und Mahlzeiten** (M): Gemeinsame Bibliothek im Haushalt, persönliche Einträge bleiben getrennt.
- **Haushaltsmahlzeiten** (M): Ein Gericht für mehrere Personen mit jeweils eigener Portion eintragen.
- **Admin-Ansicht** (S): Benutzer auflisten, Daten eines Benutzers exportieren/löschen.

## Oberfläche

- **Weitere Looks** (M): Zusätzliche Skins neben dem Windows-Look (z. B. Mac-OS-9-Stil), Theme-Erkennung dafür erweiterbar machen.
- **Dunkles/helles Theme sauber** (S): Kontrast der Windows-Skins bei hellen und dunklen Themes prüfen und angleichen.
- **Mobile Bedienung** (M): Größere Touch-Flächen, Wischen zwischen Tagen, Eintrag per Langdruck bearbeiten.
- **Diagramme verbessern** (M): Makro-Verlauf, Ziellinien für Makros, auf Wunsch zusätzliche Zeiträume. (Mouse-over mit genauen Werten gibt es bereits.)

## Technik und Qualität

- **Automatische Tests** (M): API-Tests für Import, Trigger-Logik (Start-/Endtag, Zeitzonen) und Energiebilanz; CI auf GitHub.
- **Datenbank-Migrationen strukturieren** (S): Versionsnummer in der Datenbank statt Spaltenprüfungen.
- **Veröffentlichung** (M): Öffentliches Repository oder Add-on-Repository mit Icon/Logo, Übersetzungen und Release-Notes für die HA-Add-on-Seite.
- **Performance bei großen Datenmengen** (S): Indizes und Paginierung, wenn viele Jahre MyFitnessPal-Daten importiert sind.

## Ungeklärt / zu entscheiden

- Soll es eine **Kalorienberechnung aus Aktivitäten** geben (Schritte, Training aus HA-Sensoren), oder bleibt die Bilanz rein aus Gewicht und Aufnahme?
- **Mahlzeiten-Zeitplan** statt fester Mahlzeiten: Vorschlag, welche Mahlzeit jetzt ansteht?
- **Datenschutz bei Open Food Facts**: Barcode-Abfragen nur auf Knopfdruck (Ist-Zustand) oder lokaler Cache der Treffer?
