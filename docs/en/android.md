# HAFS app (Android)

[← Overview](README.md)

The HAFS app is the phone app for both areas. **Training** runs natively and offline: record workouts, rest timer, notification with set entry, plans, history. **Nutrition** shows the diary from Home Assistant full screen, with the system's scanner. On top come two home screen widgets. Your data lives in Home Assistant; the app syncs training and keeps it on the phone for when you are out.

It replaces the former Android app "MyDietAssistant" and the HAFS app 0.5. In the browser and in the Companion app nutrition keeps working without the app.

## Requirements

- Android 8 or newer.
- HAFS is installed and started in Home Assistant (see [Installation](installation.md)).
- Home Assistant 2026.11 or newer. With it the app gets the sign-in for HAFS also for users without administrator rights, as long as HAFS is not limited to administrators in Home Assistant.
- For training *Settings → Areas* set to **Nutrition and training** or **Training only** (see [Training](training.md)).
- For the system scanner the Google Play services (on almost every phone). Without them nutrition uses the interface's scanner.

## Install the app

The app is not in the Play Store but an APK file `hafs-<version>.apk` on the [releases page](https://github.com/Schumey/MyDietAssistant/releases) (versions `app-v…`).

1. Download the newest file `hafs-<version>.apk` on your phone.
2. Tap the file. The first time Android asks whether the browser may install apps: allow it under **Settings → Install unknown apps**.
3. Tap **Install**. Play Protect may warn about an unknown app; choose **Install anyway**.

If you had the HAFS app 0.5 already, simply update: data and sign-in stay. You can uninstall the former app "MyDietAssistant" afterwards; the two apps do not get in each other's way.

## Set up

1. Create a long-lived access token in Home Assistant: *Profile → Security → Long-lived access tokens → Create token*. Copy it.
2. Open **HAFS**. On **Connect to Home Assistant** enter the **Address** (for example `http://homeassistant.local:8123` or your address from outside) and the **Long-lived access token**.
3. Tap **Connect**. The app fetches your training data.

The app finds HAFS in Home Assistant by itself (slug `eeb2daa3_mydiet` or `local_mydiet`). If it says HAFS was not found, check that the app is running in Home Assistant and that Home Assistant is up to date.

## Nutrition and training

The switch **Nutrition | Training** at the top of the bar changes between the areas; the app remembers the last one.

- **Training** has the tabs **Training**, **History**, **Statistics** and **Settings** at the bottom. The cloud button syncs; without a connection you keep recording, syncing happens later.
- **Nutrition** is the interface from Home Assistant full screen, as described in the [overview](README.md). The back key goes back there. File uploads (backup, photos, tables) open Android's file picker.

## Scan a barcode

In nutrition tap **Scan** in the add dialog as usual. Google's scanner opens (note "Scanned by Google"). It needs no camera permission and reads EAN-13, EAN-8, UPC-A and UPC-E. What happens next is described under [Barcode scanner](barcode.md).

## Widgets

1. Long-press a free spot on the home screen and tap **Widgets**.
2. Look for **HAFS** and drag one of the two widgets onto the home screen:
   - **HAFS**: the next training day with exercises and weights.
   - **HAFS Ernährung**: "Nutrition today" with the calories left and "x of y kcal". The left button opens the barcode scanner, **+** the dialog to add food; a tap on the numbers opens nutrition.

The nutrition widget takes the numbers when the app shows today's diary. After midnight it says **Open nutrition to refresh** until you opened it once.

## Health Connect

- **Write workouts to Health Connect:** in training switch on **Write workouts to Health Connect** under *Settings → Health Connect*. Finished workouts end up there as strength training with calories.
- **Take over weight, steps, calories:** in nutrition under *Settings → Android app → Import from Health Connect (30 days)*. Android asks once for permission to read. Same rules as before: weight only for days without a value of their own, steps and calories only with the optional feature "Activity" (see [Activity](activity.md)).

## Updates

The app looks for a new version at most once a day when it starts, in nutrition also by hand under *Settings → Android app → Look for app updates*. The packages live in Home Assistant in the folder `/share/hafs/app` (files `hafs-<version>.apk`); put a new version there and all phones offer it.

1. Tap **Download and install**. The first time Android opens **Install unknown apps** for HAFS; allow it and tap again.
2. Confirm the installation. Data and sign-in stay.

## Known limits

- Inside the app nutrition runs on Android only. In the Windows version **Open in the browser** opens the page in Home Assistant.
- The APK is signed with a key of its own and is not in the Play Store. Install updates only through the app or from the releases page.
