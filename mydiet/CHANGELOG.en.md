# Changelog (English)

All notable changes to the add-on. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The German [CHANGELOG.md](CHANGELOG.md) is the complete history; this English version covers 1.0.0 and later.

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
