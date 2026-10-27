# Changelog (English)

All notable changes to the add-on. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The German [CHANGELOG.md](CHANGELOG.md) is the complete history; this English version covers 1.0.0 and later.

## 1.16.0

### New
- **Weekly report as a notification:** Once a week (weekday and time adjustable) a summary of the last seven days: average calories against the goal, days the protein goal was reached, days logged, weight change. Uses the notification service of the reminder, arrives in the chosen language and has a preview in the settings. Only runs inside the add-on and is untested there.
- **Training day extended:** Sensors `training_day` (`yes`/`no`) and `training_shake` (calculated amounts as text) for automations. A training day can also be detected through activity (threshold for burned calories, needs “Activity”).
- **Database health check:** The user administration shows the size, rows, free space and last backup. “Check” runs an integrity check, “Check and compact” repacks the file (VACUUM). Administrators only.

## 1.15.0

### New
- **Shared library for recipes and saved meals:** When editing, a recipe or meal can be offered to the household. The others see it marked “from <Name>”, may log it (recipes also as a food), add it to the shopping list and make their own copy. Editing, deleting, triggers and the sharing itself stay with the owner. A recipe’s food follows the recipe’s sharing. The flag is kept in export, backup and import.

### Changed
- Database: new column `shared` for recipes and saved meals (migration 7, does not change existing data).

## 1.14.0

### New
- **Shopping list (optional feature):** Adds up the ingredients of chosen recipes (portions) and saved meals (multiple) by name. The list can be copied or sent to a to-do list in Home Assistant (service `todo.add_item`, e.g. the shopping list); the last list used is remembered. “Shopping list” button under the Meals and Recipes tabs. Sending only works inside the add-on and is untested; the calculation is tested.

### Note
- There is no **calendar** for the meal schedule: an add-on cannot create a calendar entity in Home Assistant (that would need a custom integration). For automations there are the `next_meal` and `next_meal_time` sensors (since 1.12).

## 1.13.0

### New
- **Italian:** The interface is now available in Italian (Settings → Language → Italiano), plus the nutrition report, the push texts and the add-on option names in Home Assistant. The translation is machine-made and not checked by native speakers.
- **Training day only on training days:** The “Training day” button appears in the diary only once the shake is entered for the day or a trigger booked it. As long as the training day is not set up, the button stays visible. To always see it, tick “Show the “Training day” button every day” in the training-day settings.
- **Protein for the dinners:** New checkbox “Dinners should reach the protein goal as far as possible” (on by default) in the training-day settings.

### Changed
- **More browser tests:** The training day (saving the settings, the button, the dialog with shake and dinner) and the Italian interface are now covered by the browser test suite.

## 1.12.1

### Fixed
- **Saving the training day:** If a field such as target calories/carbs/fat was left empty, saving the training-day settings failed and showed “[object Object]”. Empty fields are now allowed. Server messages about invalid input are shown as readable text everywhere.

## 1.12.0

### New
- **“Next meal” sensors:** `sensor.mydiet_<name>_next_meal` (name) and `sensor.mydiet_<name>_next_meal_time` (start, `HH:MM`) show the next time window that still begins today, otherwise `none`, so automations can remind you beforehand. Only with the meal schedule; the sensors change on the full minute like `current_meal`.
- **Target weight sensors:** With a target weight set, `sensor.mydiet_<name>_weight_to_goal` (kg still to go, from the smoothed trend) and `sensor.mydiet_<name>_weight_goal_date` (the day the target is reached at the current pace; `reached` if already there, `none` if not in sight or there is less than 14 days of data) are published. The calculation is the same as the “Goal forecast” in the weight chart.
- **Add-on options in French, Spanish and Dutch:** Option names and descriptions appear in Home Assistant in these languages (`translations/fr.yaml`, `es.yaml`, `nl.yaml`). The texts are machine-made; a test checks that every option is translated.

## 1.11.0

### New
- **Enter food by sentence (voice assistant):** New endpoint `POST /api/ext/say` in the external interface (same `api_key`). It understands sentences such as “two apples and 200 g skyr”, “half a banana” or “3 slices of bread”: quantities as numbers or words, grams/kilos/millilitres/litres/tbsp/tsp, portions from the food’s portion sizes, plural and umlauts do not matter. It finds foods and saved meals (“Post-workout shake”). The answer carries a short sentence to read out (“Added: …. Not found: …”), in English on request (`lang`). The meal is the one currently due according to the schedule, otherwise the first one, or given by `meal`; `dry_run` only shows what would be entered. The guide has a ready example for Home Assistant Assist (“I ate two apples”). The Home Assistant side of the example is untested; the endpoint itself is tested. The parser understands German best; a few English words work as well.

## 1.10.0

### New
- **Training day:** New “Training day” button next to “Suggest a meal”. The app works out the amounts of your post-workout shake (a saved meal) so it hits a target (calories, protein, carbs, fat; never more than is left of the daily goal) and then suggests dinners that fit the rest of the day. If the shake is already entered, only the dinners are shown. Set it up under “Priorities and add-ons” → Training day (including the diary meals for shake and dinner). Requires the “Meal suggestions” option.
- **Triggers with calculated amounts:** Optionally, triggers that enter this shake use the calculated amounts instead of the saved ones (today only). Your gym trigger keeps working.

## 1.9.0

### New
- **Categories in the food import:** If the table has a category column (e.g. “Category”, “Food group”, Open Food Facts “categories”), the categories are taken over (the first one if a cell lists several). The category chosen in the dialog now only applies to foods without a category in the file. The column can be corrected in the mapping.
- **Delete data:** Under Settings → Data you can delete diary, foods, saved meals, recipes, weight and body measurements, daily goals and triggers selectively, with item counts and an extra confirmation. Only your own account is affected.
- **Collapsible settings:** Every settings card can be collapsed and expanded; the browser remembers the state (at first only the first card is open).

### Fixed
- **German texts in other languages:** The interface still showed German in a few places in French, Spanish and Dutch. Fixed: placeholders in multi-line fields (e.g. “Preparation”), messages of the recipe and Mealie imports, hints in the food dialog and the online comparison, summaries of the table import, column names in the table import, and the names the add-on creates itself (water, caffeine, creatine, “Recipe”, “(copy)”).
- **Report and notifications:** The nutrition report is now also available in French, Spanish and Dutch (“Automatic” follows the browser), and the reminder and the meal-due notification appear in the chosen language. The push texts could not be checked outside Home Assistant.
- A test now checks that every German server error message has a dictionary entry.

## 1.8.1

### Changed
- **CSV import:** The column separator is now detected dynamically and also supports the pipe `|` (besides `,`, `;` and tab). The character that splits the first lines into a consistent number of columns wins, so commas in free-text columns no longer confuse detection. Applies to the food import and the table import.

## 1.8.0

### Changed
- **Sidebar:** The Home Assistant sidebar entry is now called **MyDietAssistant** in every language (previously “Ernährung”). The change takes effect after updating and rebuilding the add-on.

## 1.7.9

### Added
- **Dutch:** The interface is now also available in Dutch (Settings → Language and units → Nederlands; “Automatic” picks it up from the browser).

## 1.7.8

### Added
- **Meal suggestions:** **Exclude** on a suggestion card keeps that saved meal or history combination out of the suggestions. The **Excluded** list under “Priorities and add-ons” brings it back with **Allow**. The list is part of export and import.

## 1.7.7

### Fixed
- **Old interface after updates:** the interface files (`app.js`, `style.css`) are now revalidated with the server on every load (no more unchecked browser cache), so an update is not hidden behind the old version.
- **Meal suggestions:** in 1.7.6 the “Number from – to” fields were missing in the meal editor for fixed ingredients with a package (a placeholder text was shown instead).

## 1.7.6

### Changed
- **Meal suggestions:** the number of packages of a fixed ingredient is now an adjustable range (“Number from – to”, 0 to 6), e.g. 0–1 (the ingredient may be left out) or 1–3. Replaces the “1 or 2 / only 1 package” choice from 1.7.1; existing settings stay valid. New database column (migration 6).

## 1.7.5

### Changed
- **Dialogs:** dialogs no longer close when you click outside them, only via their buttons (or Esc).

## 1.7.4

### Fixed
- **Online comparison:** the word “null” appeared below the results.

## 1.7.3

### Added
- **Settings:** at the bottom, “Version” shows the installed version; “Check for updates” checks whether a newer one is published. New endpoint `/api/version`.

### Changed
- **Settings:** Trigger history and Automatic backup are collapsed by default.

### Fixed
- **Mobile:** in the online comparison, the checkboxes and titles are aligned.

## 1.7.2

### Fixed
- **Mobile:** the daily goal row (also with activity calories) now wraps instead of overlapping the numbers. The online comparison in the “New food” dialog fits narrow screens without sideways scrolling.

## 1.7.1

### Changed
- **Meal suggestions:** fixed ingredients with a package size can now be limited to “only 1 package” (instead of 1 or 2). The entry to priorities and add-ons is a clearly visible button instead of the gear icon. New database column (migration 5), included in export, backup, import, sharing and copying.

## 1.7.0

### Added
- **Meal suggestions** (optional feature “Mahlzeiten-Vorschläge”): the “Suggest a meal” button at the bottom of the diary works out what is still open today (daily goal including activity and weekday goal, minus what you ate) and proposes fitting meals. Either for the rest of the day or just for the selected meal’s share (the rest divided by the meals that are still empty). Cards show the ingredients in grams, the macros and the deviation from the target, and can be adjusted by hand before they are entered.
- **Candidates:** saved meals and combinations found in your diary (same ingredients in one meal, at least twice in the last 180 days, with average amounts). Combinations from the history can be saved as a meal.
- **Ingredient modes in saved meals:** every ingredient is *scalable* (follows the meal’s amount factor, with an allowed deviation in percent, 0 = strictly in ratio) or *fixed* (e.g. a 200 g package of cottage cheese; with a package size the suggestion uses one or two packages). Plus an amount-factor range per meal (default 0.6 to 1.6).
- **Priorities:** importance for calories, protein, carbs and fat (don’t care to very important), “never exceed the calorie goal” and “reach the protein goal if possible” (gear icon in the suggestion dialog).
- **Add-ons:** foods that go with any meal (e.g. walnuts) with minimum/maximum amount and step. A suggestion only adds them when they fit the remainder better (at most two).
- Light ranking hints: matching category, variety (things eaten today or yesterday move back), familiarity.
- Export, backups, import, sharing and copying meals include the new settings; database migration 4 (new columns, add-ons table).

## 1.6.2

### Changed
- Removed the frame height workaround from 1.6.1; the cause was in the HA 95 theme and is fixed there.

## 1.6.1

### Fixed
- **Windows look with taskbar:** With the HA 95 taskbar active, the panel only got the default iframe height (about 150 px) and the diary was cut off. If the frame is that small, the app now sizes it to the window height.

## 1.6.0

### New
- **Barcode scanner on open:** Settings → Look: "Start the barcode scanner right away when opening on this device". Together with a Companion app home screen shortcut to the "Ernährung" panel, the camera opens immediately for scanning. The option is per device (stored in the browser), not for your whole account.

## 1.5.2

### Fixed
- **More settings in the backup:** export, backups and import now also include the reminder, the schedule nudge, the look (default/Windows 95), the Mealie address and the days with hidden empty meals (daily-totals import). The Mealie token is still not exported; after restoring on a fresh install you have to enter it again. Progress photos are files inside the add-on and are not part of the JSON backup.

## 1.5.1

### Fixed
- **Triggers in backups:** export, automatic backups and import now include triggers (actions and meal rules). Previously they were missing from the backup, and restoring deleted the existing triggers. The trigger history is still not included. Older backups can still be restored (without triggers).

## 1.5.0

### New
- **Recipe import from Mealie:** under Settings → Mealie (shown with the "Recipes" feature) you enter the address and API token of your Mealie server (home network or add-on, e.g. `http://mealie:9000`). "Recipes" then shows a "From Mealie …" button with a searchable recipe list; the chosen recipe opens as a draft in the editor just like the web import (ingredients converted to grams and matched to your foods, missing ones from the online databases with "More data sources", servings, preparation, nutrition for comparison, source = original link). The add-on only reads and changes nothing in Mealie. The token is not exported and never returned.

## 1.4.0

### New
- **Scale as a sensor** (feature "Scale (sensor)"): body weight is taken over automatically from a Home Assistant sensor, e.g. a smart scale. Unit automatic (from the sensor) or kg, g, lb, st with conversion. The add-on checks every minute, takes a new value over once it has not changed for a minute, and stores it for the day of the measurement. Implausible values (outside 20 to 500 kg), "unavailable" and measurements older than 30 days are ignored. A "Scale" card in the settings has "Save and read now"; the setting is part of export and import.

## 1.3.1

### Fixed
- **Recipe import with online databases:** ingredients without a gram amount ("1 cauliflower", "1 lime (juice)", "1.5 bunch coriander", cinnamon stick, cardamom pod …) get a typical piece weight and are looked up. Hits must be the ingredient itself (no "Madras curry sauce" for curry powder) and are ordered by closeness to the name. USDA is only asked when Open Food Facts has nothing fitting (saves the demo key's daily limit).

## 1.3.0

### New
- **Statistics: calories and weight in one chart.** Bars for calories (left axis), weight values and smoothed trend as a line (right axis); the tooltip shows both per day.
- **Statistics: 14-day range** in addition to 7, 30, 90, 180 days and 1 year.

## 1.2.0

### New
- **Recipe import: missing ingredients from online databases:** with the "More data sources" feature on, ingredients missing from your library are looked up in Open Food Facts and USDA (median of the matching hits, per 100 g). They show in orange with the source in the editor and can be swapped with ⇄ as usual. Without a hit, internet access or an amount the ingredient stays red. Results come from the lookup cache when available.

## 1.1.2

### Fixed
- **Barcode scanning in the Home Assistant Companion app:** the camera preview stuck on a play icon because the Android WebView blocked autoplay. The preview is now started explicitly.

## 1.1.1

### New
- **English README and changelog** (`README.en.md`, `CHANGELOG.en.md`), linked from the German files.
- **Screenshots** in the README (Home Assistant default theme, German and English), generated from demo data.

## 1.1.0

### New
- **Import recipes from web pages** (optional feature "Recipes"): "From web page …" reads name, portions, ingredients, instructions and source from the recipe data (schema.org) of a cooking site. Ingredient lines are converted to grams (g, kg, ml, tbsp, tsp, pinch, cup, piece counts, fractions and ranges) and matched to your foods, including by word parts ("wheat flour" → "flour"). Unmatched ingredients are shown in red in the editor; the nutrition value given by the page serves as a comparison. Recipes now have "Instructions" and "Source" (link) fields. Only public addresses are fetched.
- **Shared household library:** A food can be shared with everyone in the household. They see it as "from <name>", log it and edit it, and a change applies to everybody immediately. Deleting, favorite and sharing stay with the owner.
- **"Current meal" sensor** (`sensor.mydiet_<name>_current_meal`) from the meal schedule; changes on the full minute, `none` outside all windows.
- **Load activity from history:** "Load history" in the diary fetches steps and calories of the last 30 days from the Home Assistant history database (days with manual input stay untouched).
- **MQTT discovery** (add-on option `mqtt_discovery`): sensors with a unique ID on one device, kept after a Home Assistant restart and manageable in Home Assistant. Sent through the `mqtt.publish` service without separate credentials; without the MQTT integration, normal states are used as before.
- **French and Spanish** as interface languages (Settings → Language). The mechanism accepts further dictionaries.
- **More sources for the table import:** the columns of the French CIQUAL and the Swiss nutrient database are recognized.
- **my.home-assistant.io button** in the README to add the repository with one click.

### Technical
- **Browser tests** with Playwright (`tests/e2e`): start-up, creating a food, diary, recipe import dialog, language switch; run in GitHub Actions.
- **Add-on linter** (`lint.yml`) checks the configuration on every push.
- **Prebuilt images:** `build.yml` builds amd64 and aarch64 and publishes them to the GitHub Container Registry (on version tags or manually); enabled by the `image:` line in `config.yaml` (see README).
- Migration 3: columns `recipes.source`, `recipes.instructions`, `foods.shared`; export and import carry them.
- The tests now check that French and Spanish cover every English key including placeholders.

### Changed
- The online check of your own foods now only considers your own, not those shared by others.

### Fixed
- Add-on configuration: new `map` syntax, default `ingress_port` removed (the linter rejected both).

## 1.0.0

First published version. Besides the new features below, an automated test suite now backs the add-on (see "Technical").

### New
- **Activity** (optional feature): steps and burned calories from Home Assistant sensors, or entered by hand, raise that day's goal by an adjustable share (default 50 %). Without a calorie sensor, calories are estimated from steps and body weight. The diary shows steps, expenditure and the bonus; statistics and the "remaining kcal" sensor use the raised goal. Sensors are read every five minutes (real Home Assistant only, not yet verified there).
- **Meal schedule** (optional feature): time windows per meal (default windows for breakfast, lunch and dinner); the diary shows "Now: Lunch" with an add button and the highlighted meal; optionally a notification when a window starts and the meal is still empty.
- **Cache for online lookups:** barcodes (60 days) and search terms (14 days) from Open Food Facts and USDA are stored locally; repeated searches no longer go online. Viewable and clearable in Settings.
- **Barcode on foods:** the field is stored and exported. The add dialog has "Scan barcode" and "Barcode photo": your own foods with the code are chosen directly, unknown codes are looked up at Open Food Facts.
- **Barcode reader for iPhone, Firefox and Safari:** where the browser has no detection of its own, the bundled ZXing library (Apache-2.0) is loaded on demand.
- **Check values online** (foods, with "More data sources"): compare all your own foods with Open Food Facts in one pass (barcode, otherwise name), review differences and apply values one by one. Optionally USDA as well.
- **Import a food table:** CSV, TXT or Excel with nutrients per 100 g; recognizes BLS codes and Open Food Facts columns among others, converts kJ to kcal and sodium to salt, skips existing foods and sets a category.
- **Share foods and meals** (optional feature "Household"): ⇪ on a food or saved meal puts a copy into other household members' libraries. Entries with the same name stay unchanged; later changes are not synchronized.
- **Amounts in ounces:** setting "Food amounts" (grams or oz) for entries, portions, recipes, saved meals and sharing. Storage stays in grams.
- **Icon and logo** for the add-on page, `url` in the add-on configuration.

### Technical
- **Automated tests** (`tests/`, pytest, 70 tests) and **GitHub Actions**: diary, goals, import/export round trip, table imports, trigger conditions (time windows, hold duration, start/end day), migrations of old databases, new features and front-end checks.
- **Versioned database migrations** instead of single column checks; before a migration a copy `mydiet.db.v<n>.bak` is made.
- **Indexes** for foods, entries, meals and weight. The food list loads page by page and searches on the server, so a library with thousands of foods stays fast. The yearly statistics read settings once instead of per day: a year takes about a quarter of a second instead of almost two.

### Fixed
- The quantity dialog of a food without portion sizes showed the word "zero" above the amount field.

## Earlier versions

0.1.0 to 0.26.1 (diary, foods, goals, statistics, triggers, sensors, import/export, optional features, user administration, household, English interface) are listed in the German [CHANGELOG.md](CHANGELOG.md).
