# Activity

[← Overview](README.md)

Steps and burned calories raise the daily goal of that day.

**Prerequisite:** optional feature “Activity” and at least one Home Assistant sensor for steps or active calories.

## Set up

1. Turn on *Settings → Optional features → Activity*.
2. Make sure your sensors are **daily counters** that reset to 0 at midnight. A counter that rises forever can be converted with the helper “Utility meter” (`utility_meter`, daily cycle).
3. Open the **Activity** card.
4. Choose **Steps sensor** (for example `sensor.phone_steps`) and **Active calories sensor (kcal)** (for example `sensor.phone_active_calories`). One is enough.
5. Set the **Share that raises the daily goal (%)**. Default 50 %; many apps overestimate burned calories.
6. Without a calories sensor the add-on estimates from steps × body weight × factor (default 0.0005 kcal per step and kg). Set the factor under **kcal per step and kg body weight**.
7. Tap **Save**.

The add-on reads the sensors every five minutes and keeps the highest value of the day.

## In the diary

In the diary the **Activity** card shows steps, **Burned** (kcal; “estimated from steps” without a calories sensor) and **Added to goal** (the contribution in kcal and the share applied). Buttons:

- **Log:** set steps and burned calories by hand. Such days are no longer overwritten by the sensors. If you leave the calories empty, they are estimated from the steps.
- **Read from Home Assistant:** reads the sensors immediately (today only).
- **Load history:** fetches steps and calories of the last 30 days from Home Assistant’s history database (the recorder must record the sensors). Days with manual entry stay untouched.
- **Discard manual entry:** hands the day back to the sensors.

## Effect

The statistics and the sensor `kcal_remaining_today` use the raised goal.

Only runs in the Home Assistant add-on (sensors and history). Help: [Troubleshooting](troubleshooting.md).
