# Android app

[← Overview](README.md)

The Android app is a slim shell around the same interface you know from Home Assistant. It opens MyDietAssistant full screen without the HA sidebar, scans barcodes with the system scanner and adds a home screen widget. Your data stays in the app in Home Assistant; the Android app only stores the address and the calorie numbers for the widget.

You don't need it: in the Companion app or the browser everything works the same. The app is more convenient if you scan often or want to see your numbers without opening anything.

## Requirements

- Android 8 or newer.
- MyDietAssistant is installed in Home Assistant (see [Installation](installation.md)).
- For full screen mode, an HA account with administrator rights. Without them the app opens MyDietAssistant inside the HA interface (with sidebar); the scanner then uses the camera in the browser.
- For the system scanner, Google Play services (present on almost every phone). Without them the app uses the interface's own scanner.

## Install the app

The app is not in the Play Store; it is an APK file on GitHub.

1. On your phone, open the [releases page](https://github.com/Schumey/MyDietAssistant/releases?q=android&expanded=true) and download the newest file `MyDietAssistant-android-<version>.apk`.
2. Tap the downloaded file. The first time, Android asks whether the browser may install apps: allow it under **Settings → Install unknown apps**.
3. Tap **Install**. Play Protect may warn about an unknown app; choose **Install anyway**.

Updates work the same way: download the new APK and install it over the old one. Your settings are kept.

## Set up

1. Open **MyDietAssistant**. On first start the app asks for the **Home Assistant address**, for example `http://homeassistant.local:8123` or your address from outside (Nabu Casa, Tailscale, your own domain).
2. The **App identifier** is `eeb2daa3_mydiet`. Only change it if you installed MyDietAssistant from a different repository (the identifier is in the address bar of the app page in HA).
3. Tap **Connect** and log in to Home Assistant as usual. The app never sees your password; the login runs on the HA login page.
4. The diary then opens full screen.

Change the address: when Home Assistant cannot be reached, the app shows **Change server**. Alternatively clear the app data in the Android settings.

## Scan a barcode

Tap **Scan barcode** in the interface as usual. In the app, Google's scanner opens (note “Scanned by Google”). The app needs no camera permission for it, and it reads EAN-13, EAN-8, UPC-A and UPC-E. Tap the **X** to cancel. What happens next is described under [Barcode scanner](barcode.md).

## Widget

1. Long-press an empty spot on the home screen and tap **Widgets**.
2. Search for **MyDietAssistant** and drag the widget onto the home screen (4 × 1).
3. The widget shows today's calories against your goal, how much is left and when the numbers were last updated.
4. **Scan** opens the app straight into the barcode scanner, **Add** opens the add dialog for the first meal. Tapping the numbers opens the app.

The widget has no connection of its own to Home Assistant. It takes the numbers whenever the app shows today's diary. After midnight it says **Open the app for today's numbers** until you open the app once. Entries you make on another device only show up after the next time you open the app.

## Health Connect (weight, steps, calories)

From app version 0.3.0, MyDietAssistant takes values from Health Connect, Android's health store. Data from scales, watches and fitness apps (Samsung Health, Fitbit, Withings, Google Fit …) ends up there.

1. Open *Settings → Android app*. The card only exists in the app.
2. Tap **Import from Health Connect (30 days)**.
3. The first time, Android asks what MyDietAssistant may access. Choose **Allow all** and **Allow**. The app only reads weight, steps and active calories and writes nothing into Health Connect.
4. Below the button you then see how many values were imported.
5. Turn on **Import automatically when the app opens (last 7 days)** so this happens by itself every time you open the app.

Rules:
- **Weight** is only taken for days on which MyDietAssistant has no value yet. A value you typed or one from the scale in Home Assistant wins. With several measurements on one day, the last one counts.
- **Steps and active calories** need the optional feature “Activity” (*Settings → Optional features*), see [Activity](activity.md). Days you entered by hand stay unchanged.
- Health Connect only hands new apps the data of the last 30 days before access was granted.

Revoke access in the Android settings under *Health Connect → App permissions → MyDietAssistant*.

## Print the report

*Settings → Export for dietitian and trainer → Open report (print / PDF)* opens the report in the app. **Print / save as PDF** opens Android's print dialog; choose a printer or **Save as PDF** there. The back button takes you back into the app.

## Known limits

- The APK is not in the Play Store and is signed with a developer key. Only install updates from this repository's releases page.
