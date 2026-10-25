# Household and users

[← Overview](README.md)

Every Home Assistant user has their own diary. The add-on recognises the user through Home Assistant (ingress). Without Home Assistant (local testing) the user is `default`.

## Turn on Household

**Prerequisite:** both sides must turn on the optional feature.

1. Every user opens *Settings → Optional features* and turns on **Household**.
2. Whoever turns “Household” off no longer sees other people’s foods.

## Share an entry with others

For example a dish for the family, each with their own portion.

1. In the diary tap the entry and then **Share …**.
2. Tick the people who eat along.
3. Set the portion: for amounts in grams (or ounces) per person, for quick entries as a multiple (1 = the same).
4. Tap **Log**.

The entry appears on the same day in the others’ diaries, each with their own amount. Only people who also turned on “Household” show up; otherwise it says “Nobody else takes part in the household yet.”

## Copy foods and meals

1. On the *Foods* or *Meals* page tap **⇪** on an item.
2. Choose the people.

The food or meal lands as a copy in the others’ library. Items of the same name there stay unchanged, later changes are not synchronised.

## Shared library

Offer a food to everybody:

1. Open the food for editing (**✎**).
2. Turn on the household sharing option in the form (“Share with the household”) and save.

Everyone else with “Household” sees it marked “from <Name>” in their list and in the add dialog. They may log and edit it. The change applies to everyone immediately; amounts already logged stay snapshots. Deleting, favorites, triggers and the sharing itself stay with the owner.

Recipes and saved meals can only be copied so far.

## User administration

Only administrators see the **User administration** card under *Settings*.

1. Define the administrators in the add-on options: `admin_users` (list of user IDs or names). Empty means: the first user who opened the add-on.
2. The table shows per user entries, days, foods and the last entry.
3. **Export** downloads a user’s data as JSON.
4. **Delete** irrevocably removes all data of a user. To confirm you must type the name.

Export and import under *Settings → Data* always affect only your own account.
