# Meal schedule

[← Overview](README.md)

Every meal gets a time window. The diary shows today which meal is due and optionally reminds you.

**Prerequisite:** optional feature “Meal schedule”.

## Set up

1. Turn on *Settings → Optional features → Meal schedule*.
2. Open the **Meals** card. Behind every meal there are now two time fields **From** and **To**.
3. Enter the windows. Windows across midnight are possible (for example 22:00–06:00).
4. Fields left empty use the default window shown in brackets next to them:

| Meal | Default window |
|---|---|
| Breakfast | 5:00–10:30 |
| Lunch | 11:00–14:30 |
| Dinner | 17:00–21:00 |
| Snacks | none |

## What you see

- In today’s diary the top shows **Now: Lunch** with the button **+ Add** and the note “already logged” if the meal is not empty. The meal is highlighted.
- Outside a window it shows **Next: …**.
- The sensor `sensor.mydiet_<name>_current_meal` holds the name of the open meal, otherwise `none` (see [Sensors](sensors.md)).

## Notification

1. First set up the [reminder](api.md#reminder) with a notification service.
2. Under *Settings → Meals* turn on **Notify when a meal is due and still empty**.

The add-on sends a message when a window starts and the meal is still empty.
