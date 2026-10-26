# Sensors

[← Overview](README.md)

With the add-on option `publish_sensors` (default: on) the add-on sets sensors in Home Assistant after every change. `<name>` is your user name in lower case.

| Entity | Meaning |
|---|---|
| `sensor.mydiet_<name>_kcal_today` | calories eaten today |
| `sensor.mydiet_<name>_protein_today` | protein today |
| `sensor.mydiet_<name>_carbs_today` | carbohydrates today |
| `sensor.mydiet_<name>_fat_today` | fat today |
| `sensor.mydiet_<name>_kcal_remaining_today` | calories remaining today (daily goal minus intake) |
| `sensor.mydiet_<name>_kcal_week_avg` | average kcal of the last 7 days (logged days only) |
| `sensor.mydiet_<name>_weight` | latest weight value |
| `sensor.mydiet_<name>_weight_trend` | smoothed weight trend |
| `sensor.mydiet_<name>_energy_balance` | estimated calorie balance per day (30 days, from weight trend and intake; + surplus, − deficit) |
| `sensor.mydiet_<name>_current_meal` | name of the meal whose time window is open now, otherwise `none` (only with the [meal schedule](schedule.md); changes on the full minute) |
| `sensor.mydiet_<name>_next_meal` | name of the next meal whose time window still begins today, otherwise `none` (only with the meal schedule) |
| `sensor.mydiet_<name>_next_meal_time` | start of that window (`HH:MM`), otherwise `none` |
| `sensor.mydiet_<name>_weight_to_goal` | kg still to go to the target weight (only with a target weight set) |
| `sensor.mydiet_<name>_weight_goal_date` | the day the target weight is reached at the current pace; `reached` or `none` (not in sight, less than 14 days of data) |

The statistics and the “calories remaining” sensor use the raised goal when [Activity](activity.md) is on.

## Check the sensors

1. Make sure `publish_sensors` is on in the add-on configuration.
2. Log something in the diary.
3. In Home Assistant open **Developer tools → States** and search for `mydiet`.

Without MQTT discovery the sensors are set via the states API. They have no unique ID and are missing after a Home Assistant restart until the next entry. MQTT discovery solves that.

## MQTT discovery

With MQTT discovery the sensors get a unique ID: you can rename them in Home Assistant, assign them to an area, and they survive a restart. They belong to a device “MyDietAssistant <Name>”. The entity IDs stay the same as above.

**Prerequisite:** the MQTT integration (for example with the Mosquitto add-on). The add-on publishes through the HA service `mqtt.publish` and needs no credentials of its own.

1. Install and set up MQTT (Mosquitto add-on and MQTT integration).
2. Open the MyDietAssistant configuration, turn on `mqtt_discovery` and save.
3. Restart the add-on.
4. Check under *Settings → Devices & services → MQTT* that the device “MyDietAssistant <Name>” appears.

If MQTT is not set up, the sensors are set as states as before. When switching, an old state sensor can stay next to the new one until the next HA restart.

## Dashboard card

Example of an entities card (adjust `<name>`):

```yaml
type: entities
title: Nutrition
entities:
  - entity: sensor.mydiet_<name>_kcal_today
    name: Eaten today
  - entity: sensor.mydiet_<name>_kcal_remaining_today
    name: Remaining
  - entity: sensor.mydiet_<name>_protein_today
    name: Protein
  - entity: sensor.mydiet_<name>_kcal_week_avg
    name: 7-day average
  - entity: sensor.mydiet_<name>_weight_trend
    name: Weight trend
  - entity: sensor.mydiet_<name>_energy_balance
    name: Balance per day
```

To add the card: edit the dashboard → **Add card** → **Manual** → paste the YAML → **Save**.

## Example: lunchtime reminder

With the [meal schedule](schedule.md) you can remind yourself when nothing has been logged at lunchtime:

1. Create a new automation in Home Assistant.
2. **Trigger:** state of `sensor.mydiet_<name>_current_meal` changes to `Mittagessen` (the meal name as you named it).
3. **Condition:** numeric value of `sensor.mydiet_<name>_kcal_today` below 300.
4. **Action:** a notification to your phone.

A reminder without an automation is built into the add-on, see [Interface and reminder](api.md#reminder).
