# Aktivität

[← Übersicht](README.md)

Schritte und verbrannte Kalorien erhöhen das Tagesziel des jeweiligen Tages.

**Voraussetzung:** Zusatzfunktion „Aktivität“ und mindestens ein Home-Assistant-Sensor mit Schritten oder aktiven Kalorien.

## Einrichten

1. Schalte *Einstellungen → Zusatzfunktionen → Aktivität* ein.
2. Prüfe, dass Deine Sensoren **Tageszähler** sind, die um Mitternacht auf 0 springen. Ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ (`utility_meter`, Zyklus täglich) umstellen.
3. Öffne die Karte **Aktivität**.
4. Wähle **Sensor für Schritte** (z. B. `sensor.handy_schritte`) und **Sensor für aktive Kalorien (kcal)** (z. B. `sensor.handy_aktive_kalorien`). Mindestens einer genügt.
5. Lege den **Anteil, der das Tagesziel erhöht (%)** fest. Standard 50 %; viele Apps schätzen verbrannte Kalorien zu hoch.
6. Ohne Kalorien-Sensor schätzt das Add-on aus Schritten × Körpergewicht × Faktor (Standard 0,0005 kcal je Schritt und kg). Den Faktor stellst Du unter **kcal je Schritt und kg Körpergewicht** ein.
7. Liefert Dein Kalorien-Sensor die **gesamten** verbrannten Kalorien (inklusive Grundumsatz, z. B. „Kalorien gesamt“ aus Health Connect), trage unter **Grundumsatz abziehen (kcal pro Tag, 0 = aus)** Deinen Grundumsatz ein (zeigt meist Deine Uhr oder Fitness-App). Dann zählt nur der Teil darüber als Aktivität. Der Grundumsatz wird jeden Tag in voller Höhe abgezogen, auch heute, weil der Gesamtwert in Health Connect schon um Mitternacht mit dem ganzen Grundumsatz startet. Hast Du eine Entität für den Grundumsatz (z. B. von einer Körperanalyse-Waage über Health Connect), wähle sie unter **Sensor für den Grundumsatz (optional)**: Dann gilt für jeden Tag der damals gemessene Wert, **Verlauf nachladen** holt auch ihn, und die Zahl dient nur als Ersatz, bis der Sensor einen Wert geliefert hat. Bei aktiven Kalorien bleiben beide Felder leer.
8. Tippe auf **Speichern**.

Das Add-on liest die Sensoren alle fünf Minuten und behält den höchsten Wert des Tages.

## Im Tagebuch

Im Tagebuch zeigt die Karte **Aktivität** Schritte, **Verbrannt** (kcal; „aus Schritten geschätzt“ ohne Kalorien-Sensor) und **Zum Tagesziel** (der Beitrag in kcal und der angerechnete Anteil). Knöpfe:

- **Eintragen:** Schritte und verbrannte Kalorien von Hand setzen. Solche Tage überschreiben die Sensoren nicht mehr. Lässt Du die Kalorien leer, werden sie aus den Schritten geschätzt.
- **Aus Home Assistant lesen:** liest die Sensoren sofort (nur heute).
- **Verlauf nachladen:** holt die Schritte und Kalorien der letzten 30 Tage aus der Verlaufsdatenbank von Home Assistant (der Recorder muss die Sensoren aufzeichnen). Der Recorder hebt den genauen Verlauf meist nur 10 Tage auf; ältere Tage kommen aus den Langzeitstatistiken, die Home Assistant für Sensoren mit `state_class` (z. B. die Health-Connect-Sensoren der Companion-App) dauerhaft führt. Tage mit Handeingabe bleiben unberührt.
- **Handeingabe verwerfen:** gibt den Tag wieder an die Sensoren zurück.

## Wirkung

Die Statistik und der Sensor `kcal_remaining_today` rechnen mit dem erhöhten Ziel.

### Netto-Kalorien

In der Statistik erscheint mit der Zusatzfunktion „Aktivität“ oben ein Umschalter **Brutto-Kalorien / Netto-Kalorien**. Bei *Netto-Kalorien* zeigen Kacheln und Diagramm die Aufnahme abzüglich der verbrannten Kalorien (vollständig, nicht nur der angerechnete Anteil) und vergleichen sie mit dem Tagesziel ohne Aktivitätszuschlag, wie in MyFitnessPal (Netto = Aufnahme − (Gesamtverbrauch − Grundumsatz), wenn ein Grundumsatz eingetragen ist). Die Auswahl bleibt im Browser gespeichert.

Läuft nur im Home-Assistant-Add-on (Sensoren und Verlauf). Hilfe: [Fehlersuche](troubleshooting.md).
