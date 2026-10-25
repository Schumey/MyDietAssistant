# Sensoren

[← Übersicht](README.md)

Mit der Add-on-Option `publish_sensors` (Standard: an) setzt das Add-on nach jeder Änderung Sensoren in Home Assistant. `<name>` ist Dein Benutzername in kleingeschriebener Form.

| Entität | Bedeutung |
|---|---|
| `sensor.mydiet_<name>_kcal_today` | heute gegessene Kalorien |
| `sensor.mydiet_<name>_protein_today` | Eiweiß heute |
| `sensor.mydiet_<name>_carbs_today` | Kohlenhydrate heute |
| `sensor.mydiet_<name>_fat_today` | Fett heute |
| `sensor.mydiet_<name>_kcal_remaining_today` | verbleibende kcal heute (Tagesziel minus Aufnahme) |
| `sensor.mydiet_<name>_kcal_week_avg` | Ø kcal der letzten 7 Tage (nur erfasste Tage) |
| `sensor.mydiet_<name>_weight` | letzter Gewichtswert |
| `sensor.mydiet_<name>_weight_trend` | geglätteter Gewichtstrend |
| `sensor.mydiet_<name>_energy_balance` | geschätzte Kalorienbilanz pro Tag (30 Tage, aus Gewichtstrend und Aufnahme; + Überschuss, − Defizit) |
| `sensor.mydiet_<name>_current_meal` | Name der Mahlzeit, deren Zeitfenster jetzt offen ist, sonst `none` (nur mit [Mahlzeiten-Zeitplan](schedule.md); wechselt zur vollen Minute) |

Die Statistik und der Sensor „verbleibende kcal“ rechnen mit dem erhöhten Ziel, wenn die [Aktivität](activity.md) eingeschaltet ist.

## Sensoren prüfen

1. Stelle sicher, dass `publish_sensors` in der Konfiguration des Add-ons an ist.
2. Trage etwas im Tagebuch ein.
3. Öffne in Home Assistant **Entwicklerwerkzeuge → Zustände** und suche nach `mydiet`.

Ohne MQTT Discovery werden die Sensoren über die States-API gesetzt. Sie haben keine eindeutige ID und fehlen nach einem HA-Neustart bis zum nächsten Eintrag. Dafür gibt es MQTT Discovery.

## MQTT Discovery

Mit MQTT Discovery bekommen die Sensoren eine eindeutige ID: Sie lassen sich in Home Assistant umbenennen, einem Bereich zuordnen und bleiben nach einem Neustart erhalten. Sie hängen an einem Gerät „MyDietAssistant <Name>“. Die Entitäts-IDs bleiben dieselben wie oben.

**Voraussetzung:** die MQTT-Integration (zum Beispiel mit dem Mosquitto-Add-on). Das Add-on sendet über den HA-Dienst `mqtt.publish` und braucht keine eigenen Zugangsdaten.

1. Installiere und richte MQTT ein (Mosquitto-Add-on und MQTT-Integration).
2. Öffne die Konfiguration von MyDietAssistant, schalte `mqtt_discovery` ein und speichere.
3. Starte das Add-on neu.
4. Prüfe unter *Einstellungen → Geräte & Dienste → MQTT*, ob das Gerät „MyDietAssistant <Name>“ erscheint.

Ist MQTT nicht eingerichtet, werden die Sensoren wie bisher als Zustände gesetzt. Beim Umstellen kann ein alter Zustandssensor bis zum nächsten HA-Neustart neben dem neuen stehen bleiben.

## Dashboard-Karte

Beispiel für eine Entitätenkarte (`<name>` anpassen):

```yaml
type: entities
title: Ernährung
entities:
  - entity: sensor.mydiet_<name>_kcal_today
    name: Heute gegessen
  - entity: sensor.mydiet_<name>_kcal_remaining_today
    name: Verbleibend
  - entity: sensor.mydiet_<name>_protein_today
    name: Eiweiß
  - entity: sensor.mydiet_<name>_kcal_week_avg
    name: Ø 7 Tage
  - entity: sensor.mydiet_<name>_weight_trend
    name: Gewichtstrend
  - entity: sensor.mydiet_<name>_energy_balance
    name: Bilanz pro Tag
```

So fügst Du die Karte ein: Dashboard bearbeiten → **Karte hinzufügen** → **Manuell** → YAML einfügen → **Speichern**.

## Beispiel: Erinnerung zur Mittagszeit

Mit dem [Mahlzeiten-Zeitplan](schedule.md) kannst Du erinnern, wenn zur Mittagszeit noch nichts eingetragen ist:

1. Lege in Home Assistant eine neue Automation an.
2. **Auslöser:** Zustand von `sensor.mydiet_<name>_current_meal` wechselt zu `Mittagessen`.
3. **Bedingung:** Zahlenwert von `sensor.mydiet_<name>_kcal_today` unter 300.
4. **Aktion:** Benachrichtigung auf dem Handy.

Eine Erinnerung ohne Automation gibt es direkt im Add-on, siehe [Schnittstelle und Erinnerung](api.md#erinnerung).
