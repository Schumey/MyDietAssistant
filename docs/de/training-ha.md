# Training in Home Assistant

[← Übersicht](README.md)

Training legt in Home Assistant Entitäten an, löst Events aus, antwortet Assist und liefert Daten für Automationen. Alles läuft über die App selbst; eine Integration brauchst Du nicht mehr.

**Voraussetzung:** Training unter *Einstellungen → Bereiche* (siehe [Training](training.md)) und die App-Option `publish_sensors` (Standard: an).

## Entitäten

Je Benutzer, `<name>` ist der Anzeigename in Kleinbuchstaben, alles außer `a-z` und `0-9` wird zu `_` (wie bei den [Sensoren](sensors.md) der Ernährung).

| Entität | Inhalt |
|---|---|
| `sensor.hafs_<name>_training_state` | `none`, `active` (Workout läuft) oder `done` (heute trainiert, bis Mitternacht); Attribute `duration_min`, `volume_kg`, `sets`, `kcal_estimate`, `routine`, `finished_at` |
| `binary_sensor.hafs_<name>_workout_active` | `on`, solange ein Workout läuft |
| `sensor.hafs_<name>_workouts_today`, `_workouts_week` | Anzahl Workouts heute und in dieser Woche |
| `sensor.hafs_<name>_volume_week` | Volumen der Woche in kg |
| `sensor.hafs_<name>_last_workout` | Zeitpunkt des letzten Workouts; Attribute wie oben |
| `sensor.hafs_<name>_next_routine` | nächster Trainingstag; Attribute `program`, `exercises` |
| `sensor.hafs_<name>_phase` | `bulk`, `maintain` oder `cut`; Attribut `source` (`manual`, `goal_mode`, `last_known`) |

Mit der App-Option `exercise_sensors` kommen pro Übung der letzten 90 Tage (höchstens 40, die zuletzt trainierten zuerst) zwei Sensoren dazu: `sensor.hafs_<name>_ex_<übung>_weight` (höchstes Arbeitsgewicht des letzten Workouts mit der Übung, kg) und `..._volume` (Volumen dieses Workouts, kg; Aufwärmsätze nur, wenn sie in den Statistiken mitzählen). Den Verlauf hält die Langzeitstatistik von Home Assistant, z. B. für Grafana.

Ohne weitere Einstellung sind das einfache Zustände: Sie haben keine eindeutige ID und fehlen nach einem Neustart von Home Assistant, bis HAFS sie wieder sendet (spätestens nach 30 Minuten). Mit der App-Option `mqtt_discovery` werden es richtige MQTT-Entitäten mit eindeutiger ID und einem Gerät **HAFS <Name>**; dafür muss die MQTT-Integration eingerichtet sein (siehe [Sensoren](sensors.md#mqtt-discovery)).

Kamen die Entitäten bisher von der HAFS-Integration, entferne die Integration, bevor Training sie anlegt (siehe [Umstieg](training.md#umstieg-von-der-hafs-integration)).

## Events

| Event | Wann | Daten |
|---|---|---|
| `hafs_workout_started` | ein Workout beginnt | `user_id`, `workout_id`, `started_at`, `routine` |
| `hafs_workout_finished` | ein Workout endet | `user_id`, `workout_id`, `duration_min`, `volume_kg`, `sets`, `kcal_estimate`, `routine` |
| `hafs_record` | neuer Bestwert in einem Workout | `user_id`, Übung und Wert |

Beispiel: Licht im Fitnessraum aus, wenn das Workout endet.

```yaml
triggers:
  - trigger: event
    event_type: hafs_workout_finished
actions:
  - action: light.turn_off
    target:
      entity_id: light.fitnessraum
```

Die Ernährung wertet ein Workout selbst aus: An einem Tag mit Workout gilt der Tag für den Shake-Vorschlag als Trainingstag (siehe [Mahlzeiten-Vorschläge](suggestions.md)).

## Studio erkennen

Trägst Du bei einem Studio (*Training → Pläne → Studio bearbeiten*) eine Zone ein, wählt die HAFS-App beim Start eines Workouts das Studio, in dessen Zone Deine Person gerade ist. Dafür muss Deine Person in Home Assistant mit Deinem Benutzer verknüpft sein.

Der Blueprint `blueprints/automation/hafs/gym_arrival.yaml` schickt beim Betreten der Zone eine Benachrichtigung mit dem heutigen Trainingstag. Importiere ihn in Home Assistant und wähle Person, Zone und die Sensoren `next_routine` und `training_state`.

## Schnittstelle für Automationen

Die Endpunkte nutzen den Schlüssel der [Schnittstelle](api.md) (App-Option `api_key`, Kopfzeile `X-MDA-Key`) und `user` (Benutzer-ID, Standard `default`) im Body. Sie antworten mit JSON, das Du mit `response_variable` weiterverwendest.

| Endpunkt (POST) | Antwort |
|---|---|
| `/api/ext/training/status` | Zustand wie die Entitäten in einer Antwort |
| `/api/ext/training/plan` | Pläne, Trainingstage und der nächste Trainingstag |
| `/api/ext/training/workouts` | letzte Workouts (`days`, `limit`) |
| `/api/ext/training/review` | Rückblick: stagnierende Übungen, vernachlässigte Muskelgruppen; mit `"ai": true` eine Zusammenfassung der KI |
| `/api/ext/training/suggest` | Planentwurf der KI (`days`, `minutes`, `goal`, `notes`); gespeichert wird nichts |
| `/api/ext/training/say` | Satz zum Vorlesen: `{"intent": "next"}` oder `{"intent": "last"}` |

Beispiel: monatlicher Rückblick als Benachrichtigung.

```yaml
rest_command:
  hafs_review:
    url: "http://local-mydiet:8099/api/ext/training/review"
    method: POST
    headers:
      X-MDA-Key: "DEIN_SCHLUESSEL"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "ai": true, "language": "de"}'
```

```yaml
actions:
  - action: rest_command.hafs_review
    data:
      user: "DEINE_BENUTZER_ID"
    response_variable: review
  - action: notify.mobile_app_handy
    data:
      title: Trainingsrückblick
      message: "{{ review.content.text or 'Nichts Auffälliges.' }}"
```

Die KI ist die in Home Assistant eingerichtete (Aktion `ai_task.generate_data`). Gesendet werden nur Namen von Übungen und Muskelgruppen mit Zahlen.

## Assist

„Was trainiere ich heute?“ und „Wann habe ich zuletzt trainiert?“:

1. Kopiere den Ordner `custom_sentences` aus dem Repository nach `config/custom_sentences` (Dateien `de/hafs.yaml`, `en/hafs.yaml`).
2. Lege in der `configuration.yaml` an (ersetze Schlüssel und Benutzer-ID):

```yaml
rest_command:
  hafs_say:
    url: "http://local-mydiet:8099/api/ext/training/say"
    method: POST
    headers:
      X-MDA-Key: "DEIN_SCHLUESSEL"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "intent": "{{ intent }}", "language": "de"}'

intent_script:
  HafsNextWorkout:
    action:
      - action: rest_command.hafs_say
        data: {user: "DEINE_BENUTZER_ID", intent: next}
        response_variable: hafs
      - stop: ""
        response_variable: hafs
    speech:
      text: "{{ action_response.content.message }}"
  HafsLastWorkout:
    action:
      - action: rest_command.hafs_say
        data: {user: "DEINE_BENUTZER_ID", intent: last}
        response_variable: hafs
      - stop: ""
        response_variable: hafs
    speech:
      text: "{{ action_response.content.message }}"
```

3. Lade die Konfiguration neu und frage Assist: „Was trainiere ich heute?“

## Dashboard

Eine eigene Karte gibt es nicht mehr. Die Entitäten passen in die üblichen Karten, zum Beispiel:

```yaml
type: entities
title: Training
entities:
  - entity: sensor.hafs_anna_next_routine
  - entity: sensor.hafs_anna_workouts_week
  - entity: sensor.hafs_anna_volume_week
  - entity: sensor.hafs_anna_last_workout
```
