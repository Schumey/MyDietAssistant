# Diary

[← Overview](README.md)

The diary shows one day with its meals, the totals for calories and macros, the daily goal and **Remaining**.

## Choose a day

- Use the arrows **‹** and **›** next to the date.
- On a phone, swipe left or right.
- On a computer: ← / → change the day, **T** jumps to today.

## Log a food

1. For the meal you want, tap **+ Add food** (on a computer: **N**).
2. Choose the tab:
   - **Foods**: all your foods. **Frequently used** is at the top.
   - **★ Favorites**: foods you marked with ☆ on the *Foods* page.
   - **My meals**: saved meals.
3. Search in the **Search…** field or tap a result. With the optional feature “More data sources” online results appear too.
4. Enter the amount. The preview shows the values. Tap **Add**.
5. If the food does not exist yet, tap **+ New food** or **Scan barcode** (see [Barcode scanner](barcode.md)).

One-tap logging: under **Frequently used** you re-log a recently eaten food with its last amount.

## Make a quick entry

When you only know the calories (restaurant, estimate):

1. For the meal tap **+ Add food** and then **Quick entry (kcal only)**.
2. Enter a **Description** (for example “Restaurant”) and **kcal**, optionally **Carbs (g)**, **Fat (g)** and **Protein (g)**. Description and kcal are required.
3. Tap **Add**.

Quick entries have no amount in grams (internally 0 g). If calories and macros do not match, a hint appears.

## Change, swap or delete an entry

1. Tap the entry.
2. Change the amount (for quick entries the description and values) and tap **Save**.
3. **Swap food** replaces the food (for example rice with pasta) and keeps the amount.
4. The **✕** at the end of the row deletes the entry.

Entries are **snapshots**: the name and nutrition values are copied when you log. If the food changes later, past days stay as they were.

## Manage meals

You set up the diary’s meals under *Settings → Meals*:

1. New meal: type a name into **New meal, e.g. night shift** and tap **Add**.
2. Rename: change the name in the list.
3. Reorder: with **↑** and **↓**.
4. Hide: **⊘**. The meal stays visible only on days where it has entries. **◉** shows it again.
5. Delete: **✕**, only possible for empty meals.
6. Show only on certain days: **⚡**, for example “Night shift” only on days with a calendar event of that name (see [Triggers](triggers.md#show-meals-only-on-certain-days)).

### Times instead of meals

Under *Settings → Appearance → Diary* you can choose **Times** instead of fixed meals. Existing entries stay; entries without a time sit at the end of the time view.

## Save and copy meals

### Save a meal as a template

1. Log the ingredients of a meal.
2. Under the meal tap **Save / Copy** (the button appears once the meal has entries) and choose **Save as meal** at the top of the dialog.
3. Give it a **Meal name** and optionally a **Category** (for example diet, bulk). Tap **Save**.

When logging, pick the template under **My meals**, enter a factor under **Portions** (1 = as saved) and tap **Add**. These templates are snapshots too.

Manage them in the **Meals** tab: edit (**✎**), add or swap components (**⇄**), make a copy (**⧉**), set a category, delete, share (**⇪**, see [Household](household.md)) or create a trigger (**⚡**).

### Copy entries

1. Under the meal tap **Save / Copy**. The **Copy** tab is preselected.
2. Choose the target date under **On day** and the target meal under **Into meal** (in the times view optionally a new time).
3. Untick entries that should not be copied.
4. Tap **Copy**. The diary jumps to the target day.

### Clear

The **✕** in a meal’s total row removes (after a confirmation) all entries of that meal; in the times view all entries of the day.

## Notes

With the optional feature “Notes” (*Settings → Optional features*) you can store free text for every meal and every day (hunger, training, mood): for a meal the **Note** button (then **Edit note**), for the whole day **Note for the day** at the bottom of the diary. Existing notes are kept when you turn the feature off.

## Water and supplements

With the optional feature “Water and supplements” the diary gets counters with **+** and **–**. Configure them under *Settings → Water & supplements*:

1. For each row enter name, unit, daily goal and the step of the buttons (defaults: water in ml, caffeine, creatine).
2. Fill in the last row for a new counter (for example “Magnesium”) and tap **+**.
3. **✕** deletes a counter including its history.

## More nutrients

With “More nutrients” you also record fiber, sugar, salt and saturated fat for foods; they are evaluated in the diary and the statistics. Open Food Facts provides them during the online search.

### Nutrient gaps

In the **Statistics** tab the card **Nutrient gaps (7 days)** shows how your last seven days fit reference values. Example: “Fiber: Ø 22.0 g (at least 30.0 g) – 27 % below the goal”. Only days with values for the nutrient count; if they are missing on more than half of the days, “not enough data” is shown.

- Fiber should be reached (default at least 30 g).
- Sugar (at most 50 g), salt (at most 6 g) and saturated fat (at most 20 g) are upper limits.
- Use **Change goals** to set your own values. A deviation of up to 5 % counts as on target.

## Keyboard shortcuts

| Key | Effect |
|---|---|
| ← / → | change day |
| T | today |
| N | add food |
| / | jump to the list’s search field |
