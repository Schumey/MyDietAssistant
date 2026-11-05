# Pantry

[← Overview](README.md)

The pantry remembers how much of a food you have at home. Every matching diary entry reduces the stock. When it drops to the threshold you set, you get a notification and/or the food is added to a to-do list in Home Assistant, for example in **Bring!**.

**Requirement:** the optional feature “Pantry”. Notification and to-do list only work inside the Home Assistant add-on.

## Add a pantry item

1. Switch on *Settings → Optional features → Pantry*.
2. Open the **Foods** tab, tap **Pantry**, then **+ New pantry item**.
3. Enter the **Name** (e.g. “Skyr”) and the **Stock now** in grams.
4. **Alert at (g)** is the threshold: when the stock is that low or lower, you are alerted. With 0 the alert only comes when nothing is left.
5. Optional: **Pack size (g)**. The item then gets a **+ pack** button that raises the stock by one pack after shopping. The size is also part of the to-do item (“Skyr – 500 g”).

## How the stock goes down

Every diary entry whose name contains one of the **words** (capitalisation ignored) subtracts its grams from the stock. If the words field is empty, the name is used. Separate several words with a comma, e.g. `skyr, quark`.

- Only entries logged **after** the stock was set count. Older ones are ignored.
- Editing or deleting an entry corrects the stock by itself.
- Quick entries without grams do not count.
- Watch out for words that are too general: “milk” also matches “milk chocolate”.
- When you have bought or counted something, change **Stock now** with ✎ or tap **+ pack**.

## Notification and to-do list

Under **When a food runs low** in the pantry window:

1. **Notification:** enter a service such as `notify.mobile_app_pixel` (the suggestions list the services of your Home Assistant). Empty = no notification.
2. **To-do list:** choose a list such as `todo.bring`. **Bring!** and other shopping-list apps show up in Home Assistant as a to-do list once their integration is set up; the built-in shopping list works the same way. Empty = no item.
3. Tap **Save alert**.

Every food is reported **once** when it reaches the threshold (checked about every minute). Only when the stock is above the threshold again, e.g. after **+ pack**, can it be reported again.

## For automations

The sensor `sensor.mydiet_<name>_pantry_low` names the foods at or below their threshold (e.g. `Skyr, Rice`), otherwise `none`. You can use it to drive other apps. See [Sensors](sensors.md).

The pantry is part of the JSON backup (with the stock at the time of the export).
