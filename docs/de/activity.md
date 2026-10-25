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
7. Tippe auf **Speichern**.

Das Add-on liest die Sensoren alle fünf Minuten und behält den höchsten Wert des Tages.

## Im Tagebuch

Im Tagebuch zeigt die Karte **Aktivität** Schritte, **Verbrannt** (kcal; „aus Schritten geschätzt“ ohne Kalorien-Sensor) und **Zum Tagesziel** (der Beitrag in kcal und der angerechnete Anteil). Knöpfe:

- **Eintragen:** Schritte und verbrannte Kalorien von Hand setzen. Solche Tage überschreiben die Sensoren nicht mehr. Lässt Du die Kalorien leer, werden sie aus den Schritten geschätzt.
- **Aus Home Assistant lesen:** liest die Sensoren sofort (nur heute).
- **Verlauf nachladen:** holt die Schritte und Kalorien der letzten 30 Tage aus der Verlaufsdatenbank von Home Assistant (der Recorder muss die Sensoren aufzeichnen). Tage mit Handeingabe bleiben unberührt.
- **Handeingabe verwerfen:** gibt den Tag wieder an die Sensoren zurück.

## Wirkung

Die Statistik und der Sensor `kcal_remaining_today` rechnen mit dem erhöhten Ziel.

Läuft nur im Home-Assistant-Add-on (Sensoren und Verlauf). Hilfe: [Fehlersuche](troubleshooting.md).
