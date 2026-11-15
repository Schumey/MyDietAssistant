# Training in Home Assistant

[← Overview](README.md)

Training creates entities in Home Assistant, fires events, answers Assist and provides data for automations. Everything runs through the app itself; you no longer need an integration.

**Requirement:** the optional feature **Training** (see [Training](training.md)) and the app option `publish_sensors` (default: on).

## Entities

Per user, `<name>` is the display name in lower case, everything but `a-z` and `0-9` becomes `_` (as with the nutrition [sensors](sensors.md)).

| Entity | Content |
|---|---|
| `sensor.hafs_<name>_training_state` | `none`, `active` (workout running) or `done` (trained today, until midnight); attributes `duration_min`, `volume_kg`, `sets`, `kcal_estimate`, `routine`, `finished_at` |
| `binary_sensor.hafs_<name>_workout_active` | `on` while a workout is running |
| `sensor.hafs_<name>_workouts_today`, `_workouts_week` | number of workouts today and this week |
| `sensor.hafs_<name>_volume_week` | volume of the week in kg |
| `sensor.hafs_<name>_last_workout` | time of the last workout; attributes as above |
| `sensor.hafs_<name>_next_routine` | next training day; attributes `program`, `exercises` |
| `sensor.hafs_<name>_phase` | `bulk`, `maintain` or `cut`; attribute `source` (`manual`, `goal_mode`, `last_known`) |

Without further settings these are plain states: they have no unique ID and are missing after a restart of Home Assistant until HAFS sends them again (after 30 minutes at the latest). With the app option `mqtt_discovery` they become real MQTT entities with a unique ID and a device **HAFS <name>**; the MQTT integration must be set up for that (see [Sensors](sensors.md#mqtt-discovery)).

If the entities came from the HAFS integration so far, remove the integration before training creates them (see [Moving over](training.md#moving-over-from-the-hafs-integration)).

## Events

| Event | When | Data |
|---|---|---|
| `hafs_workout_started` | a workout begins | `user_id`, `workout_id`, `started_at`, `routine` |
| `hafs_workout_finished` | a workout ends | `user_id`, `workout_id`, `duration_min`, `volume_kg`, `sets`, `kcal_estimate`, `routine` |
| `hafs_record` | new best in a workout | `user_id`, exercise and value |

Example: lights off in the gym room when the workout ends.

```yaml
triggers:
  - trigger: event
    event_type: hafs_workout_finished
actions:
  - action: light.turn_off
    target:
      entity_id: light.gym_room
```

Nutrition uses a workout itself: on a day with a workout, the day counts as a training day for the shake suggestion (see [Meal suggestions](suggestions.md)).

## Detect the gym

If you enter a zone for a gym (*Training → Plans → edit the gym*), the HAFS app picks the gym whose zone your person is in when you start a workout. Your person must be linked to your user in Home Assistant for that.

The blueprint `blueprints/automation/hafs/gym_arrival.yaml` sends a notification with today's training day when you enter the zone. Import it into Home Assistant and choose person, zone and the sensors `next_routine` and `training_state`.

## Interface for automations

The endpoints use the key of the [interface](api.md) (app option `api_key`, header `X-MDA-Key`) and `user` (user ID, default `default`) in the body. They answer with JSON that you use further with `response_variable`.

| Endpoint (POST) | Answer |
|---|---|
| `/api/ext/training/status` | state like the entities in one answer |
| `/api/ext/training/plan` | plans, training days and the next training day |
| `/api/ext/training/workouts` | recent workouts (`days`, `limit`) |
| `/api/ext/training/review` | review: stagnating exercises, neglected muscle groups; with `"ai": true` a summary from the AI |
| `/api/ext/training/suggest` | plan draft from the AI (`days`, `minutes`, `goal`, `notes`); nothing is saved |
| `/api/ext/training/say` | a sentence to speak: `{"intent": "next"}` or `{"intent": "last"}` |

Example: a monthly review as a notification.

```yaml
rest_command:
  hafs_review:
    url: "http://local-mydiet:8099/api/ext/training/review"
    method: POST
    headers:
      X-MDA-Key: "YOUR_KEY"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "ai": true, "language": "en"}'
```

```yaml
actions:
  - action: rest_command.hafs_review
    data:
      user: "YOUR_USER_ID"
    response_variable: review
  - action: notify.mobile_app_phone
    data:
      title: Training review
      message: "{{ review.content.text or 'Nothing stands out.' }}"
```

The AI is the one set up in Home Assistant (action `ai_task.generate_data`). Only names of exercises and muscle groups with numbers are sent.

## Assist

"What do I train today?" and "When did I last train?":

1. Copy the folder `custom_sentences` from the repository to `config/custom_sentences` (files `de/hafs.yaml`, `en/hafs.yaml`).
2. Add to `configuration.yaml` (replace key and user ID):

```yaml
rest_command:
  hafs_say:
    url: "http://local-mydiet:8099/api/ext/training/say"
    method: POST
    headers:
      X-MDA-Key: "YOUR_KEY"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "intent": "{{ intent }}", "language": "en"}'

intent_script:
  HafsNextWorkout:
    action:
      - action: rest_command.hafs_say
        data: {user: "YOUR_USER_ID", intent: next}
        response_variable: hafs
      - stop: ""
        response_variable: hafs
    speech:
      text: "{{ action_response.content.message }}"
  HafsLastWorkout:
    action:
      - action: rest_command.hafs_say
        data: {user: "YOUR_USER_ID", intent: last}
        response_variable: hafs
      - stop: ""
        response_variable: hafs
    speech:
      text: "{{ action_response.content.message }}"
```

3. Reload the configuration and ask Assist: "What do I train today?"

## Dashboard

There is no card of its own any more. The entities fit the usual cards, for example:

```yaml
type: entities
title: Training
entities:
  - entity: sensor.hafs_anna_next_routine
  - entity: sensor.hafs_anna_workouts_week
  - entity: sensor.hafs_anna_volume_week
  - entity: sensor.hafs_anna_last_workout
```
