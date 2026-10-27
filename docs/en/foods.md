# Foods

[← Overview](README.md)

The **Foods** page is your library. All nutrition values are **per 100 g**. Amounts are always logged in grams (or ounces, see [Settings](settings.md#language-and-units)).

## Create a food

1. Open **Foods** and tap **+ New food** (or **+ New food** in the diary’s add dialog).
2. Enter the name, optionally brand, category and barcode.
3. Enter calories, carbohydrates, fat and protein per 100 g.
4. Optional: a serving size so that you can pick “1 slice” instead of grams later.
5. Save.

The form warns about implausible values (for example more than 100 g of nutrients per 100 g, or calories that do not match the macros).

## Search, edit, favorites

- Search with the **Search foods…** field. Long lists load in pages (**Load more**); the search runs on the server.
- **✎** edits a food, **✕** deletes it. Amounts already logged in the diary stay unchanged (snapshots).
- **☆** makes it a favorite (**★**). Favorites appear in the add dialog under **★ Favorites**.
- **⚡** creates a [trigger](triggers.md) for the food.
- Categories (for example diet, bulk) can be shown or hidden with a chip.

## Merge duplicate foods

1. Tap **Find duplicates**.
2. Review the groups found.
3. Tap **Merge** to combine them into one food.

If nothing is found you see “No duplicates found.”

## Online search (More data sources)

**Prerequisite:** optional feature “More data sources” (*Settings → Optional features*). Search terms are sent to Open Food Facts and USDA FoodData Central; everything else stays local.

1. Turn on *Settings → Optional features → More data sources*.
2. Optional: set your own `usda_api_key` in the add-on options (free at api.data.gov). Without a key a shared demo key with a low limit applies.
3. In the **New food** form start with the search. The results of both sources can be compared.
4. Take over the matching values and save.

The add-on caches answers locally: barcodes for 60 days, search terms for 14 days. Only product data and search keys are stored, nothing from your diary. To clear it: *Settings → Cache of the online search → Clear cache*.

## Check your own foods online

**Prerequisite:** “More data sources”.

1. Open **Foods** and tap **Check values online**.
2. The add-on compares your foods with Open Food Facts (by barcode, otherwise by name) and shows differences in calories and macros.
3. Take over online values only for the foods where you want to. Nothing changes without a button press.
4. USDA can be added; without your own key its limit is reached quickly.

## Import a table

If you have a nutrition table (BLS, CIQUAL, Swiss food composition database, Open Food Facts export or your own list):

1. Open **Foods** and tap **Import table …** (also under *Settings → Data → More imports …*).
2. Choose a CSV, TXT or Excel file (`.xlsx`) with nutrition values per 100 g.
3. Columns are recognised by their headings. This includes the abbreviations of the **BLS** (`ST`, `GCAL`, `GJ`, `ZE`, `ZF`, `ZK`, `ZB`) and the columns of **CIQUAL** (`alim_nom_fr`, “Protéines”, “Glucides”, “Lipides” …) and the **Swiss food composition database**. Typical headings of USDA tables (“Total lipid (fat)”, “Carbohydrate, by difference”, “Fatty acids, total saturated” …) and of the Austrian nutrition table (“Fett gesamt”, “Verfügbare Kohlenhydrate” …) are recognised too; if something is missing, the assignment can be corrected in the dialog.
4. Check the mapping in the preview and correct it if needed.
5. If the table has a category column (e.g. “Category”, “Food group”, Open Food Facts “categories”), it is taken over; with several categories in one cell the first one counts. For foods without a category in the file (or if no column was recognised) you choose the category yourself. Then start the import.

Energy in kJ is converted, sodium is converted to salt. Foods with the same name and brand stay unchanged. The BLS itself is available as a file from the Max Rubner-Institut (its terms of use apply to the data); the add-on does not ship it.

## Share foods

With the optional feature “Household” you can share foods with other users, see [Household and users](household.md).
