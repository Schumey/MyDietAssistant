# Goals and statistics

[← Overview](README.md)

## Daily goal

You set the default daily goal under *Settings → Daily goals*. The steps are in [First steps](first-steps.md#1-set-your-daily-goal).

- **My aim** (lose, maintain, gain) decides when a day is “on target” and how the statistics judge your weight trend.
- **Desired change** is the planned weight change per week.
- The add-on option `default_kcal_goal` only applies until you have saved a goal yourself.

## Goals per weekday

**Prerequisite:** optional feature “Daily goals per weekday”.

1. Turn on *Settings → Optional features → Daily goals per weekday*.
2. Open the **Daily goals per weekday** card.
3. Enter calories and macros for Monday to Sunday, for example more calories on training days.
4. Empty calories mean the default daily goal applies. Empty macros show “–”. With “Calculate calories from macros” the calories follow the macros.
5. Tap **Save**.

## Daily goal profiles

**Prerequisite:** “Daily goals per weekday”.

1. Open the **Daily goal profiles** card and tap **+ Profile**.
2. Name the profile (for example “Training”, “Rest day”) and enter the values.
3. Tap **Save**.
4. Switch the profile by [trigger](triggers.md#switch-the-daily-goal-with-a-trigger), for example when the person is at the gym.

The profile takes precedence over the weekday goal. With [Activity](activity.md) the goal rises further.

## Statistics

The **Statistics** tab shows evaluations for 7, 14, 30, 90, 180 days or 1 year:

- **Calories per day** as bars (left axis) with a goal line, together with weight values and the smoothed trend as a line (right axis); the tooltip shows both per day.
- **Macro history** with goal lines.
- **Calorie balance:** an estimate from weight trend and intake (1 kg ≈ 7700 kcal; + surplus, − deficit), also available as the sensor `energy_balance`.
- The **forecast to your target weight** if a target weight is set.

The statistics use the goal that applies to each day (weekday, profile, activity).

## Report for a dietitian or trainer

See [Data, import and backup](data.md#report-for-a-dietitian-or-trainer).
