# Weight and body measurements

[← Overview](README.md)

Weight and body measurements are always stored internally in kg and cm. The display follows your unit choice (see [Settings](settings.md#language-and-units)).

## Log weight

1. Open the **Weight** tab.
2. Choose the **Date** and enter the value, for example `78.5`.
3. Save. A value on the same day is replaced.

The page shows the **History**, the smoothed **Trend**, the **Change** and, if you set a target weight, the **Goal forecast**. You set the target weight under *Settings → Daily goals*.

## Scale as a sensor

**Prerequisite:** optional feature “Scale (sensor)” and an HA sensor with body weight (for example from a smart scale).

1. Turn on *Settings → Optional features → Scale (sensor)*.
2. Open the **Scale** card.
3. Choose the entity under **Sensor**, for example `sensor.scale_weight`.
4. Leave **Sensor unit** on “Automatic” (the add-on reads `unit_of_measurement`, kg if missing) or choose kg, g, lb or st.
5. Tap **Save and read now** to take over the current value immediately, or **Save**.

How the takeover works:

- The add-on checks every minute. A new value (different `last_updated` timestamp) is taken over once it has not changed for another minute, so a scale that is still settling leaves no intermediate values.
- It is stored for the local day of the measurement; a weight on the same day is replaced.
- Values outside 20 to 500 kg, “unavailable”/“unknown” and measurements older than 30 days are ignored.
- The sensor must renew its timestamp with every measurement, which scale integrations normally do.

Only runs in the Home Assistant add-on. If something fails see [Troubleshooting](troubleshooting.md#the-scale-does-not-take-over-values).

## Body measurements and progress photos

**Prerequisite:** optional feature “Body measurements and progress photos”.

1. Turn on *Settings → Optional features → Body measurements and progress photos*.
2. Open **Weight**. The measurements (Waist, Chest, Hips, Upper arm, Thigh, Body fat %) and your own measurements, for example “Calf”, appear there.
3. Enter values with a date; the history is shown as a chart.
4. Add photos in the same area and compare them.

Progress photos are stored as files in the add-on and are not part of the JSON backup.

## Weight from other sources

- MyFitnessPal, Cronometer, Google Fit, Apple Health: see [Data, import and backup](data.md#import-from-other-apps).
- By automation: [interface](api.md).
