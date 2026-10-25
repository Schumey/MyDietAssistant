# Meal suggestions

[← Overview](README.md)

The **Suggest a meal** button works out what is still open today and proposes fitting meals.

**Prerequisite:** optional feature “Meal suggestions” and at least one saved meal (or a few days of history).

## Use a suggestion

1. Turn on *Settings → Optional features → Meal suggestions*.
2. Save a few meals in the diary via **Save / Copy → Save as meal** (see [Diary](diary.md#save-and-copy-meals)). Combinations from your history are used as well (the same ingredients in one meal, at least twice in 180 days).
3. Tap **Suggest a meal** at the bottom of the diary.
4. At the top of the dialog choose the **meal** the entry goes into.
5. Choose the target: **Rest of the day** or **Share for this meal** (the remainder divided by the number of still empty meals).
6. The cards show ingredients in grams, macros and the deviation from the goal. **More suggestions** shows further hits.
7. With **Adjust** you change the amounts by hand (macros and deviation recalculate), then log it.
8. For combinations from the history you can choose **Save as meal**.

The open budget is the day’s goal (including [Activity](activity.md) and weekday goal) minus what you ate. Values without a goal do not count. If the goal is already reached, there is nothing to fill.

## Amounts: scalable or fixed

Edit a saved meal in the **Meals** tab (**✎**). With the feature on, every ingredient has a mode:

1. **Scalable:** follows the meal’s amount factor. **Deviation ±** lets the ingredient deviate from the ratio to the others by that many percent (0 = rigid).
2. **Fixed:** stays as saved. With a package size the suggestion takes one or two **packages**.
3. **Amount factor for suggestions** limits how much the whole meal may shrink or grow (empty = 0.6 to 1.6).

Amounts are rounded to 5 g (small amounts to 1 g).

## Priorities and add-ons

Tap **⚙** (“Priorities and add-ons”) in the suggestion dialog. The dialog **Suggestion settings** opens.

1. Under **Importance** choose a level for **Calories**, **Protein**, **Carbohydrates** and **Fats**: don’t care, normal, important, very important. Too much counts more than too little. Values without a goal are left out.
2. If needed turn on **Never exceed the calorie goal** and **Reach the protein goal if possible**.
3. **Add-ons** are foods that go with every meal (for example nuts). Tap **+ Add-on**, choose the food and the maximum amount. Then set minimum amount, maximum amount and step per add-on. **✕** removes it.
4. Tap **Save**.

A suggestion takes at most two add-ons and only if they hit the remainder better.

## Order of the suggestions

The order is helped by the matching category (meal name), variety compared to today and yesterday, and frequency.

Export, backups and import contain the settings, add-ons and ingredient modes. As always, entries are snapshots.
