<p align="center"><img src="mydiet/logo.png" alt="HAFS" width="250"></p>

# HAFS – HomeAssistant Fitness Suite

**English** · [Deutsch](README.md)

[![Tests](https://github.com/Schumey/HAFS/actions/workflows/test.yml/badge.svg)](https://github.com/Schumey/HAFS/actions/workflows/test.yml)
[![App lint](https://github.com/Schumey/HAFS/actions/workflows/lint.yml/badge.svg)](https://github.com/Schumey/HAFS/actions/workflows/lint.yml)

**Nutrition and strength training in Home Assistant.** Track calories, macros and weight like in MyFitnessPal, record workouts like in GymRun or Strong, without a cloud account: everything lives in SQLite files on your Home Assistant device and is part of the normal HA backup. Home Assistant adds sensors, triggers and automations. The HAFS phone app records training offline and shows nutrition full screen.

Up to version 1.x HAFS was called **MyDietAssistant**; training was an integration of its own. Both are now one app with the switch **Nutrition | Training**.

[![Open your Home Assistant instance and add this app repository.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2FSchumey%2FHAFS)

<p align="center"><img src="docs/screenshots/en/diary.png" alt="Diary with meals, entries and daily goal" width="640"></p>

## At a glance

| | |
|---|---|
| **What** | Home Assistant app (formerly “add-on”) with a web interface in the HA sidebar |
| **Where the data lives** | only locally: `/data/mydiet.db`, plus daily JSON backups |
| **Who** | every HA account has its own diary; households can share entries and foods |
| **How** | browser, Companion app or the [Android app](#android-app) |
| **Languages** | German, English, French, Spanish, Dutch, Italian, Portuguese, Polish; metric and imperial |
| **Internet** | only for the optional online databases (Open Food Facts, USDA) and recipe import |

## Features

**Daily logging**
- Diary with freely named meals (breakfast, night shift, PWO …) or by time of day, calorie budget on top, swipe between days and tabs on phones
- Foods with categories, serving sizes and favourites; barcode by camera, photo or typing; online search in Open Food Facts and USDA
- Save, copy and share meals; create recipes or import them from websites and Mealie
- Quick entry with kcal only, voice entry through Home Assistant (“two apples and 200 g skyr”)

**Goals and analysis**
- Lose, maintain or gain; goals per weekday and profiles, switchable by triggers
- Statistics from 7 days to 2 years: calories and macros with goal lines, **energy balance** from weight trend and intake, forecast to your goal weight
- Mark days as incomplete so they don't distort the statistics

**Home Assistant**
- Sensors for calories, macros, remaining, weekly average, weight and balance (also via MQTT discovery)
- Triggers: add or show foods and meals automatically, depending on states, calendars or time
- Interface for automations (scale, voice assistant), reminder by notification, shopping list to an HA to-do list

**Optional** (off by default, turn on in the settings): weekday goals, water and supplements, recipes, more nutrients, notes, body measurements and progress photos, online sync, activity, scale, meal schedule, meal suggestions, shopping list, pantry, household

**Data:** import from MyFitnessPal, Cronometer, FDDB, Yazio, Apple Health and Google Fit; export as JSON and CSV; report for coaches and trainers; automatic backups.

<p align="center">
  <img src="docs/screenshots/en/foods.png" alt="Food library" width="49%">
  <img src="docs/screenshots/en/stats.png" alt="Statistics and energy balance" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/en/recipe-import.png" alt="Recipe import from a website" width="49%">
  <img src="docs/screenshots/en/weight.png" alt="Weight history" width="49%">
</p>

## Training

Under *Settings → Areas*, **Training** adds a second area: training plans and days, gyms with equipment and weight steps, history per exercise with estimated 1RM, sets per muscle group and weight suggestions that follow your nutrition phase (cut, maintain, bulk). Import from GymRun, Strong and Hevy; entities, events and Assist for Home Assistant. Guides: [Training](docs/en/training.md), [Training in Home Assistant](docs/en/training-ha.md).

<p align="center">
  <img src="docs/screenshots/en/training.png" alt="Training: next training day, figures, sets per muscle group" width="49%">
  <img src="docs/screenshots/en/training-plans.png" alt="Training plans and gyms" width="49%">
</p>

The pictures show the default Home Assistant theme with sample data. The interface follows your HA theme; for retro themes like “HA 95/98” there is a matching Windows look.

## Installation

HAFS is an **app** (called “add-on” until HA 2026.1) and needs Home Assistant OS or Supervised. You won't find it in the **Marketplace** (since HA 2026.11, the successor of HACS): the Marketplace installs integrations, cards and themes, but no apps.

1. Add the repository: with the button above or by hand under **Settings → Apps → Install app → ⋮ → Repositories** → `https://github.com/Schumey/HAFS`.
2. Install and start **HAFS** and turn on **Show in sidebar**.
3. Open it, set your goal, get going. [First steps](docs/en/first-steps.md) walks you through the setup.

Updates show up under **Settings → Updates**. In detail: [Installation](docs/en/installation.md).

## Android app

<p align="center"><img src="docs/screenshots/en/diary-mobile.png" alt="Nutrition in the HAFS app: diary with tabs at the bottom" width="260"></p>

The web interface also runs in the Companion app. The HAFS app adds:

- **Training** natively and offline: record workouts, rest timer, notification with set entry, sync with Home Assistant
- Switch **Nutrition | Training**; nutrition full screen without the HA sidebar

- Sign-in with a long-lived access token, also without administrator rights (Home Assistant 2026.11 or newer)
- **System barcode scanner** (fast, no HTTPS and no camera permission needed)
- **Home screen widgets**: next training day and "Nutrition today" with buttons to scan and add

- **Health Connect:** take over weight, steps and active calories from the phone
- **Updates** right inside the app

**[Download the APK](https://github.com/Schumey/HAFS/releases)** (files `hafs-<version>.apk`, Android 8 or newer) · [guide](docs/en/android.md)

The app is not in the Play Store, so Android asks during installation whether to allow apps from this source. Afterwards the app finds new versions itself.

## Documentation

Step-by-step guides for every topic: **[docs/en](docs/en/README.md)** ([Deutsch](docs/de/README.md)). Common problems: [Troubleshooting](docs/en/troubleshooting.md). Changes: [CHANGELOG](mydiet/CHANGELOG.en.md). Ideas and plans: [roadmap.md](roadmap.md) (German).

## Bring your data

Under *Settings → Data* you import a MyFitnessPal CSV, and under “More imports …” also Cronometer, FDDB, Yazio, Google Fit and Apple Health. Columns are recognised by their headers and can be corrected before the import. More: [Data, import and backup](docs/en/data.md).

## Development

```
pip install fastapi httpx pydantic uvicorn pytest
python -m pytest
cd mydiet/app
MYDIET_DB=./dev.db uvicorn main:app --port 8099
```

Then open `http://localhost:8099/`. Without Home Assistant there are no sensors, triggers or entity suggestions. Browser tests (Playwright) run as well once `pip install playwright && python -m playwright install chromium` is done.

| Folder | Content |
|---|---|
| `mydiet/` | the Home Assistant app: `app/main.py` (core API), `app/extras*.py` (one feature area each), `app/db.py` (schema and migrations), `app/static/` (interface without a build step) |
| `app/` | the HAFS phone app (Flutter): training native and offline, nutrition as the web interface in the app's look |
| `docs/` | guides (de/en) and screenshots |
| `tests/` | pytest suite, `tests/e2e` with Playwright |

The HAFS phone app (Flutter) lives in `app/`, its APK is on [Releases](https://github.com/Schumey/HAFS/releases) (versions `app-v…`). Prebuilt container images for the HA app are described under [Installation → Prebuilt images](docs/en/installation.md#prebuilt-images-for-developers).

## License

MIT, see [LICENSE](LICENSE). The bundled barcode fallback [ZXing](https://github.com/zxing-js/library) is licensed under Apache-2.0 (`mydiet/app/static/vendor/ZXING-LICENSE.txt`).
