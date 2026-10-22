# Roadmap

Ideensammlung für MyDietAssistant. Reihenfolge und Zuschnitt sind Vorschläge, keine Zusagen. Bereits Umgesetztes steht im [Changelog](mydiet/CHANGELOG.md).

Aufwand: **S** = Stunden, **M** = ein bis zwei Abende, **L** = größeres Vorhaben.

## Home Assistant

- **Sensor für die aktuelle Mahlzeit** (S): `sensor.mydiet_<name>_current_meal` aus dem Mahlzeiten-Zeitplan, damit Automationen darauf reagieren können.
- **Aktivität aus der Verlaufsdatenbank nachladen** (M): Schritte und Kalorien vergangener Tage aus der HA-Historie holen, statt nur ab dem Einschalten zu sammeln.
- **MQTT Discovery** (M): Sensoren mit eindeutiger ID, damit sie nach einem HA-Neustart nicht fehlen und sich Entitäten verwalten lassen.

## Lebensmittel und Eingabe

- **Live geteilte Bibliothek im Haushalt** (M): Statt Kopien eine gemeinsame Bibliothek, in der Änderungen sofort für alle gelten (die Kopie-Variante gibt es seit 1.0).
- **Weitere Sprachen** (S je Sprache): Der Übersetzungsmechanismus (Anfang von `static/app.js`) nimmt zusätzliche Wörterbücher auf.
- **Weitere Datenquellen** (M): zum Beispiel Swiss Food Composition Database oder CIQUAL als Dateiimport über die Lebensmittel-Tabelle (Spaltenkürzel ergänzen).

## Technik und Qualität

- **Browser-Tests** (M): Ende-zu-Ende-Tests der Oberfläche (Playwright) zusätzlich zu den API-Tests.
- **Add-on-Linter in CI** (S): Prüfung der Add-on-Konfiguration über den Linter der Home-Assistant-Community.
- **Veröffentlichung als Add-on-Repository mit fertigen Images** (M): Container-Images über GitHub Actions bauen, damit die Installation nicht lokal baut.
