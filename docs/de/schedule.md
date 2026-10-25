# Mahlzeiten-Zeitplan

[← Übersicht](README.md)

Jede Mahlzeit bekommt ein Zeitfenster. Das Tagebuch zeigt heute, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch.

**Voraussetzung:** Zusatzfunktion „Mahlzeiten-Zeitplan“.

## Einrichten

1. Schalte *Einstellungen → Zusatzfunktionen → Mahlzeiten-Zeitplan* ein.
2. Öffne die Karte **Mahlzeiten**. Hinter jeder Mahlzeit stehen jetzt zwei Zeitfelder **Von** und **Bis**.
3. Trage die Fenster ein. Fenster über Mitternacht sind möglich (z. B. 22:00–06:00).
4. Leer gelassene Felder verwenden das Standardfenster, das in Klammern danebensteht:

| Mahlzeit | Standardfenster |
|---|---|
| Frühstück | 5:00–10:30 |
| Mittagessen | 11:00–14:30 |
| Abendessen | 17:00–21:00 |
| Snacks | keins |

## Was Du siehst

- Im Tagebuch von heute steht oben **Jetzt: Mittagessen** mit dem Knopf **+ Hinzufügen** und dem Vermerk „schon eingetragen“, falls die Mahlzeit nicht leer ist. Die Mahlzeit ist hervorgehoben.
- Außerhalb eines Fensters steht dort **Als Nächstes: …**.
- Der Sensor `sensor.mydiet_<name>_current_meal` enthält den Namen der offenen Mahlzeit, sonst `none` (siehe [Sensoren](sensors.md)).

## Benachrichtigung

1. Richte zuerst die [Erinnerung](api.md#erinnerung) mit einem Benachrichtigungsdienst ein.
2. Schalte unter *Einstellungen → Mahlzeiten* die Option **Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist** ein.

Das Add-on schickt eine Nachricht, wenn ein Fenster beginnt und die Mahlzeit noch leer ist.
