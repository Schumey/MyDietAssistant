# Changelog (English)

All notable changes to the add-on. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The German [CHANGELOG.md](CHANGELOG.md) is the complete history; this English version covers 1.0.0 and later.

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
