# Settings

[← Overview](README.md)

The **Settings** tab consists of cards. Cards for optional features only appear once the feature is on.

| Card | Contents | Page |
|---|---|---|
| Daily goals | aim, calories and macros, target weight | [Goals and statistics](goals-and-stats.md) |
| Language and units | language, units, food amounts | below |
| Optional features | switch optional features on and off | below |
| Appearance | diary view, look, scanner on open | below |
| Meals | meals, time windows, show rules | [Diary](diary.md#manage-meals), [Schedule](schedule.md) |
| Triggers, Trigger history | automatic entries | [Triggers](triggers.md) |
| Reminder | notification | [Interface and reminder](api.md#reminder) |
| Automatic backup | backups, restore | [Data](data.md) |
| Interface for automations | API status | [Interface](api.md) |
| User administration | administrators only | [Household and users](household.md#user-administration) |
| Export for dietitian and trainer, Data | export, import | [Data](data.md) |
| Version | installed version, update check | below |

Every card can be collapsed and expanded: tap the title. The browser remembers which cards are open (at first only the first one is). At the very bottom, *Version* shows the installed version; **Check for updates** tells you whether a newer version is published (you update in Home Assistant under *Settings → Add-ons*).

## Language and units

1. Open *Settings → Language and units*.
2. Choose **Language**: Automatic (browser), Deutsch, English, Français, Español, Nederlands, Italiano, Português or Polski. The Portuguese follows Brazilian spelling.
3. Choose **Units**: Metric (kg, cm) or Imperial (lb, in).
4. Choose **Food amounts**: Grams or Ounces (oz).
5. Tap **Save**. The page reloads.

Weight and body measurements are always stored internally in kg and cm; only display and input change. Food amounts are always stored in grams, the nutrition values stay “per 100 g”. The texts of the add-on options in Home Assistant are available in German and English as well.

## Turn on optional features

Everything that not everyone needs is off by default.

1. Open *Settings → Optional features*.
2. Tick the feature you want. It takes effect immediately; matching tabs and cards appear.
3. To turn it off, untick it. Data is kept.

| Feature | Purpose | Guide |
|---|---|---|
| Daily goals per weekday | training days with more calories, profiles | [Goals](goals-and-stats.md) |
| Water and supplements | counters with a daily goal | [Diary](diary.md#water-and-supplements) |
| Recipes | recipes, import from web and Mealie | [Recipes](recipes.md) |
| More data sources | Open Food Facts and USDA | [Foods](foods.md#online-search-more-data-sources) |
| Activity | steps and calories raise the goal | [Activity](activity.md) |
| Scale (sensor) | weight from an HA sensor | [Weight](weight.md#scale-as-a-sensor) |
| Meal schedule | time window per meal | [Schedule](schedule.md) |
| Meal suggestions | suggestions for open macros | [Suggestions](suggestions.md) |
| Household | share with other users | [Household](household.md) |
| Notes | free text for meals and days | [Diary](diary.md#notes) |
| Body measurements and progress photos | circumferences and photos | [Weight](weight.md#body-measurements-and-progress-photos) |
| More nutrients | fiber, sugar, salt, saturated fat | [Diary](diary.md#more-nutrients) |

## Appearance

1. Open *Settings → Appearance*.
2. **Diary:** “Fixed meals (breakfast, lunch, …)” or “Times (08:47 …, 11:30 …)”. Existing entries are kept.
3. **Look:**
   - *Automatic*: Windows look if the HA theme is named “HA 95” or “HA 98”, otherwise default.
   - *Default (HA theme)*: follows the active Home Assistant theme.
   - *Windows look*: forces the Windows 95 style.
4. **Start the barcode scanner right away when opening on this device:** applies to this device only, see [Barcode scanner](barcode.md#scanner-via-a-home-screen-shortcut-companion-app).

## Keyboard shortcuts

| Key | Effect |
|---|---|
| ← / → | change the day in the diary |
| T | jump to today in the diary |
| N | add food in the diary |
| / | jump to the list’s search field |

In the tab bar (Diary, Foods …) ← / → move between the tabs, Home and End jump to the first and last one. Keyboard focus is clearly visible on every control, dialogs close with Esc, and fields, icon buttons and error messages have names for screen readers.

## Add-on options

Options like `api_key`, `mqtt_discovery` or `admin_users` live in Home Assistant, not in the interface: see [Installation](installation.md#add-on-options).
