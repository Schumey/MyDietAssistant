# Triggers

[← Overview](README.md)

A trigger logs a food or a saved meal automatically, **once per day**, when Home Assistant reports something. It can also switch the daily goal to a profile. The add-on checks every minute.

> Triggers need Home Assistant. Without `SUPERVISOR_TOKEN` (for example when testing locally) they are inactive.

## Trigger conditions

| Condition | When it applies |
|---|---|
| State of an entity | as soon as the entity has (or does not have) that state, for example `person.max` = `Gym` |
| Calendar event | on days with (or without) an event whose title contains a text |
| Time | daily, as soon as this time is reached |

## Create a trigger

Example: when Max is at the gym, the protein shake is logged.

1. Open *Settings → Triggers* and tap **+ New trigger**. Alternatively tap **⚡** on a food or a saved meal.
2. Under **Trigger condition** choose “State of an entity”.
3. Enter `person.max` under **Entity** (the suggestion list comes from Home Assistant).
4. Under **Condition** choose “is / contains” and write the state, for example the zone name `Gym` or `on`.
5. Under **Then** choose the food (or the saved meal). For foods you can enter an amount, otherwise the default portion applies.
6. Choose the **To meal in the diary** the entry goes to.
7. Tap **Save**.
8. Test with **▶** (“Test now, logs for today”) or **Check now**.

### More options

- **State must have held for this long (minutes):** for example 20, so it only logs once the person has been at the gym for 20 minutes. The HA timestamp `last_changed` is used.
- **Only between (time, optional):** a time window, also across midnight (22:00 to 06:00).
- **Calendar, Event counts:** on every day of the event, only on its start day or only on its end day.
- **Log days ahead (calendar only):** with 7 the entry is planned for the next 7 days as soon as a matching event is there.
- **+ Another condition:** combine several conditions with **AND** (all) or **OR** (at least one). Each can be negated (“is NOT”).

## Manage triggers

- The checkbox switches a trigger off and on.
- **✎** edits, **⏸** pauses (with an end date), **✕** deletes.
- **Trigger history** shows what was logged last. **Undo** removes the entries again; the trigger does not log again on that day.

## Switch the daily goal with a trigger

**Prerequisite:** the optional feature “Daily goals per weekday” with at least one profile (see [Goals and statistics](goals-and-stats.md#daily-goal-profiles)).

1. Create a profile, for example “Training”.
2. Create a trigger and choose the entry “Daily goal “Training”” under **Then**.
3. On the day the condition applies, the profile is used. It takes precedence over the weekday goal.

## Show meals only on certain days

With the same form you show a meal only on matching days, for example “Night shift” only if the calendar contains an event “Night shift”.

1. Open *Settings → Meals*.
2. Tap **⚡** on the meal.
3. Choose the condition, entity (for example `calendar.work`) and the title text.
4. Save. Without a rule the meal is always shown; days with entries always stay visible.

Locally without Home Assistant such meals are always shown.

## Common problems

See [Troubleshooting](troubleshooting.md#a-trigger-does-not-log).
