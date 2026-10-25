# Gewicht und Körpermaße

[← Übersicht](README.md)

Gewicht und Körpermaße werden intern immer in kg und cm gespeichert. Die Anzeige folgt Deiner Einheitenwahl (siehe [Einstellungen](settings.md#sprache-und-einheiten)).

## Gewicht eintragen

1. Öffne den Reiter **Gewicht**.
2. Wähle bei **Datum** den Tag und trage den Wert ein, z. B. `78,5`.
3. Speichere. Ein Wert vom selben Tag wird ersetzt.

Die Seite zeigt den **Verlauf**, den geglätteten **Trend**, die **Veränderung** und, wenn Du ein Zielgewicht gesetzt hast, die **Prognose Ziel**. Das Zielgewicht stellst Du unter *Einstellungen → Tagesziele* ein.

## Waage als Sensor

**Voraussetzung:** Zusatzfunktion „Waage (Sensor)“ und ein HA-Sensor mit dem Körpergewicht (z. B. einer smarten Waage).

1. Schalte *Einstellungen → Zusatzfunktionen → Waage (Sensor)* ein.
2. Öffne die Karte **Waage**.
3. Wähle bei **Sensor** die Entität, z. B. `sensor.waage_gewicht`.
4. Lass **Einheit des Sensors** auf „Automatisch“ (das Add-on liest `unit_of_measurement`, ohne Angabe kg) oder wähle kg, g, lb oder st.
5. Tippe auf **Speichern und jetzt lesen**, um den aktuellen Wert sofort zu übernehmen, oder auf **Speichern**.

So arbeitet die Übernahme:

- Das Add-on schaut jede Minute nach. Ein neuer Wert (anderer Zeitstempel `last_updated`) wird übernommen, sobald er sich eine weitere Minute nicht geändert hat. So hinterlässt eine Waage, die noch einpendelt, keine Zwischenwerte.
- Gespeichert wird für den lokalen Tag der Messung; ein Gewicht vom selben Tag wird ersetzt.
- Werte außerhalb von 20 bis 500 kg, „unavailable“/„unknown“ und Messungen, die älter als 30 Tage sind, werden ignoriert.
- Der Sensor muss bei jeder Messung seinen Zeitstempel erneuern, was Waagen-Integrationen normalerweise tun.

Läuft nur im Home-Assistant-Add-on. Bei Problemen siehe [Fehlersuche](troubleshooting.md#die-waage-übernimmt-nichts).

## Körpermaße und Fortschrittsfotos

**Voraussetzung:** Zusatzfunktion „Körpermaße und Fortschrittsfotos“.

1. Schalte *Einstellungen → Zusatzfunktionen → Körpermaße und Fortschrittsfotos* ein.
2. Öffne **Gewicht**. Dort erscheinen die Maße (Taille, Brust, Hüfte, Oberarm, Oberschenkel, Körperfett %) und eigene Messungen, z. B. „Wade“.
3. Trage Werte mit Datum ein; der Verlauf wird als Diagramm gezeigt.
4. Fotos fügst Du im selben Bereich hinzu und kannst sie vergleichen.

Fortschrittsfotos liegen als Dateien im Add-on und sind nicht Teil der JSON-Sicherung.

## Gewicht aus anderen Quellen

- MyFitnessPal, Cronometer, Google Fit, Apple Health: siehe [Daten, Import und Sicherung](data.md#aus-anderen-apps-importieren).
- Per Automation: [Schnittstelle](api.md).
