# Shopping list

[← Overview](README.md)

The shopping list adds up the ingredients of recipes and saved meals. You can copy it or send it to a to-do list in Home Assistant, for example the shopping list on your phone.

**Requirement:** the optional feature “Shopping list”. Recipes show up when the “Recipes” feature is on as well.

## Create a shopping list

1. Switch on *Settings → Optional features → Shopping list*.
2. Open the **Meals** tab (or **Recipes**) and tap **Shopping list** at the bottom.
3. For recipes enter the **portions** you want, for meals a **multiple** (1 = the saved amounts once). Fields with 0 or no number do not count.
4. Under **Shopping list** the ingredients appear, added up by name and sorted alphabetically. The same names (capitalisation ignored) are added together, for example “tomatoes” from two recipes.
5. Tap **Copy to clipboard** to paste the list as text.

## Send it to Home Assistant

1. Under **To-do list** choose the list, for example `todo.shopping_list`. All to-do entities of your Home Assistant are offered. The one used last is preselected.
2. Tap **Send to Home Assistant**. Every ingredient becomes an item, for example “Skyr – 450 g”. Larger amounts are given in kg.

If “No to-do list found in Home Assistant.” appears, your Home Assistant has no to-do list yet. Add the **Shopping List** integration under *Settings → Devices & services → Add integration*.

Sending only works inside the Home Assistant add-on. A calendar for the meal schedule is not possible: an add-on cannot create a calendar entity. An automation can, however, use the [sensors](sensors.md) for the next meal (`next_meal`, `next_meal_time`) to create events or notifications.
