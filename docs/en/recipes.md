# Recipes

[← Overview](README.md)

**Prerequisite:** optional feature “Recipes” (*Settings → Optional features → Recipes*). Afterwards the **Recipes** tab appears.

A recipe bundles ingredients, divides them by the number of portions and can be logged like a food.

## Create a recipe by hand

1. Open **Recipes** and create a new recipe.
2. Enter name and portions.
3. Add the ingredients (foods with grams).
4. Optional: add preparation steps and a source.
5. Save. The nutrition values per portion are calculated.

To log it, search for the recipe in the add dialog like a food.

## Import a recipe from a web page

1. Open **Recipes** and tap **From web page …**.
2. Paste the address of the recipe page and start the fetch.
3. The add-on reads the embedded recipe data (schema.org, as most cooking sites provide it for search engines): name, portions, ingredients, preparation and source.
4. Check the draft in the editor:
   - Ingredient lines (“200 g flour”, “1 1/2 tbsp oil”, “2 eggs”) are converted to grams (spoons, cups, pinches and millilitres by rule of thumb, counts via the food’s serving size) and matched to your foods, also by word parts (“wheat flour” → “flour”).
   - Ingredients marked **red** are not matched. Choose a food with **⇄**; otherwise they count with 0 kcal.
   - Ingredients marked **orange** come from an online database (with source). Check the values. This only works with the optional feature “More data sources”: missing basic foods with an amount are looked up at Open Food Facts and USDA, and the mean of the matching hits fills in the nutrition values.
   - If the page lists nutrition values, the editor shows them for comparison with the calculated portion.
5. Save. Only now is anything created. The source stays as a link on the recipe, the preparation unfolds in the list.

Limits: only public http(s) addresses are fetched (addresses in the local network are blocked, at most 3 MB). Pages without recipe data or behind a login cannot be read.

## Import a recipe from text

If you have a recipe as text (from a message, a document or typed by hand), you do not need a web page.

1. Open the **Recipes** tab and tap **From text …**.
2. Paste the text under **Recipe text**. Best is the title at the top, then optionally “Serves 4”, then the headings **Ingredients** (one ingredient per line with an amount, e.g. “200 g flour”) and **Instructions** (one step per line). Without headings, lines that start with an amount count as ingredients and long sentences as instructions.
3. Tap **Import**. The ingredients are matched with your foods, unmatched ones show in red, as with the import from a web page. Review everything in the editor and tap **Save**.

Reading a recipe from a photo is not possible: the add-on would need text recognition, which is not available locally. If you have the photo’s text (for example through your phone’s text recognition), paste it here.

## Import recipes from Mealie

For recipes you keep in [Mealie](https://mealie.io).

### Set up

1. In Mealie open your profile → **API tokens** and create a token.
2. In MyDietAssistant open *Settings → Mealie* (the card appears with the optional feature “Recipes”).
3. Enter the server **Address**, for example `http://mealie:9000`. The home network is allowed; `localhost` and link-local addresses are not.
4. Paste the **API token** and tap **Save**. The token is never shown again; an empty field leaves it unchanged. To remove it, clear the address.

### Import

1. Open **Recipes** and tap **From Mealie …**.
2. Search the list for the recipe and choose it.
3. The recipe opens as a draft in the editor. Ingredient matching, online completion and checking work as with the web import.
4. Save.

The add-on only reads (`GET /api/recipes`) and changes nothing in Mealie. The token is stored in the add-on database (and therefore in automatic backups) but is not part of the JSON export. Each user enters their own token.
