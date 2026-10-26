# Barcode scanner

[← Overview](README.md)

Only the online search (Open Food Facts, optionally USDA) needs the internet. You can type the barcode, scan it with the camera or read it from a photo.

## Scan a barcode

1. Open the **Diary** and tap **+ Add food** for a meal.
2. Choose one of the options:
   - **Scan barcode** starts the camera. Hold the barcode in view.
   - **Photo of barcode** reads the code from a photo (works without HTTPS too).
   - To type the number, create a **+ New food** and enter it in the barcode field.
3. Wait until the code is recognised.
4. If you already know the food, it is selected right away. Otherwise the add-on looks the code up at Open Food Facts and prepares a new food. Check the values, save and enter the amount.

The barcode is stored with the food, so next time **Scan barcode** finds it directly.

## How the scanner reads

The browser’s own reader (Chrome/Android) is used where available. Otherwise the bundled ZXing library takes over (iPhone, Firefox, Safari). EAN-13, EAN-8, UPC-A and UPC-E are supported.

**The camera needs an HTTPS connection** (Nabu Casa or your own certificate). A photo always works.

## Scanner via a home-screen shortcut (Companion app)

The Companion app has no real widget with a camera. With a shortcut to the panel the scanner still opens with one tap.

1. Install v1.6.0 or newer (see [Installation](installation.md#update)).
2. On your phone open the Companion app, choose **MyDietAssistant** in the sidebar and then *Settings → Appearance*.
3. Turn on **Start the barcode scanner right away when opening on this device**. The option applies to this device only.
4. **Android:** In the Companion app open *Settings → Companion app → Shortcuts* (not under “Widgets”; those only offer action button, image, entity, media player, template and to-do) and create a shortcut. As the target enter the path of the panel: `/hassio/ingress/<add-on identifier>`.
   - For add-ons from a repository the identifier is usually `<prefix>_mydiet` (for example `a0d7b954_mydiet`).
   - The browser’s address bar shows the exact path when you open the **Ernährung** panel.
   - Then long-press the Home Assistant icon and drag the shortcut to the home screen.
5. **iPhone** (untested): In the Shortcuts app create the action “Open URL” with `homeassistant://navigate/hassio/ingress/<add-on identifier>` and add the shortcut to the Home Screen.
6. Tap the shortcut. The app opens the diary, the add dialog appears with the camera running. Grant the camera permission the first time.
7. Hold the barcode in view.

> As long as the option is on, the scanner starts every time you open the panel on this device. **Close** only closes the dialog. To stop this, turn the option off again.

Problems? See [Troubleshooting](troubleshooting.md#the-camera-does-not-start).
