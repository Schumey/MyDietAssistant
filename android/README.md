# MyDietAssistant für Android

Eigene App um die bestehende Oberfläche. Sie lädt Home Assistant im WebView, Du meldest Dich dort wie gewohnt an (die App sieht Dein Passwort nicht), holt dann über den Supervisor eine Ingress-Sitzung und zeigt die App im Vollbild ohne HA-Seitenleiste. Geht das nicht (z. B. ohne Administratorrechte), öffnet sie das Panel innerhalb der HA-Oberfläche.

Anleitung für Nutzer: [docs/de/android.md](../docs/de/android.md) ([English](../docs/en/android.md)). Fertige APKs: GitHub-Releases mit Tag `android-v<Version>`.

## Stand

- 0.1.0: Hülle mit Anmeldung, Kamera für den Scanner der Oberfläche, Datei-Auswahl, Downloads.
- 0.2.0: nativer Barcode-Scanner (Google Code Scanner aus den Play-Diensten, keine Kamera-Berechtigung), Homescreen-Widget (Kalorien von heute, Knöpfe „Scannen“ und „Eintragen“).
- Offen: Health Connect (Gewicht, Aktivität), `blob:`-Downloads.

## Aufbau

| Datei | Aufgabe |
|---|---|
| `MainActivity.kt` | WebView, Ingress-Wechsel, Kamera/Datei/Download, Widget-Aktionen (`onNewIntent`, `launchMode="singleTask"`) |
| `Ingress.kt` | JavaScript, das mit dem HA-Token per WebSocket `supervisor/api` die Ingress-Sitzung holt |
| `NativeBridge.kt` | `window.MDAApp` für die Oberfläche: `scanBarcode()` (Antwort über `window.mdaScanResult(code, fehler)`), `summary(json)` für das Widget, `pendingAction()` |
| `Widget.kt` | `AppWidgetProvider`; Zahlen aus `SharedPreferences`, die die Oberfläche über `summary` setzt |
| `SetupActivity.kt`, `Prefs.kt` | Adresse und App-Kennung |

Gegenstück in der Oberfläche (`mydiet/app/static/app.js`): `nativeScan()` vor dem Web-Scanner, `MDAApp.summary(...)` in `renderDiary`, `window.mdaAction` und `pendingAction()` am Ende der Datei. Alte App-Versionen ohne diese Methoden laufen weiter, die Oberfläche prüft jede Methode vor dem Aufruf. Der native Scanner wird nur im Vollbild genutzt (nicht im HA-Panel-Iframe), weil die Antwort an die oberste Seite geht.

## Bauen

Voraussetzung: Android Studio (JDK und SDK 36 liegen dabei). In `android/` eine Datei `local.properties` mit `sdk.dir=<Pfad zum Android SDK>` anlegen (nicht im Repo), `JAVA_HOME` auf das JBR von Android Studio setzen, dann:

```bash
./gradlew assembleRelease
```

Die APK liegt unter `app/build/outputs/apk/release/app-release.apk`. Sie ist mit dem lokalen Debug-Schlüssel signiert (kein Keystore nötig). **Updates lassen sich nur mit demselben Schlüssel darüber installieren**: Releases deshalb immer vom selben Rechner bauen (`~/.android/debug.keystore`), sonst muss die App vorher deinstalliert werden.

## Veröffentlichen

1. `versionCode` und `versionName` in `app/build.gradle.kts` erhöhen.
2. `./gradlew assembleRelease`, APK nach `MyDietAssistant-android-<Version>.apk` kopieren.
3. `gh release create android-v<Version> <apk> --latest=false --title "Android-App <Version>" --notes "…"` (der Tag beginnt nicht mit `v`, damit `build.yml` keine Images baut; `--latest=false`, damit „Latest“ bei der HA-App bleibt).
4. Download-Link in `README.md` und `README.en.md` auf die neue Version setzen.

## Testen

`tools/fakeha.py` ist ein Fake-HA (FastAPI) für den Emulator: Startseite mit `hassTokens`, WebSocket mit `auth` und `supervisor/api`, Ingress-Seite. Mit `MDA_UPSTREAM=http://127.0.0.1:8099` reicht er den Ingress-Pfad an einen lokal laufenden MyDietAssistant durch (echte Oberfläche):

```bash
cd mydiet/app && MYDIET_DB=/tmp/emu.db python -m uvicorn main:app --port 8099
cd android/tools && MDA_UPSTREAM=http://127.0.0.1:8099 python -m uvicorn fakeha:app --host 0.0.0.0 --port 8123
```

In der App als Adresse `http://10.0.2.2:8123` eintragen. Den Scanner und die Widget-Knöpfe kann man per `adb shell am start -n io.github.schumey.mydiet/.MainActivity --es mda_action scan` (oder `add`) auslösen.

## Geprüft / ungeprüft

- Geprüft im Emulator (API 37 mit Play-Diensten) gegen den Fake-HA mit echter Oberfläche: Vollbild, nativer Scanner öffnet und lässt sich abbrechen, Widget zeigt den Stand, „Scannen“/„Eintragen“ bei geschlossener und geöffneter App.
- Am echten HA geprüft (0.1.0, Pixel 7): Anmeldung und Vollbild.
- Ungeprüft: echter Scan eines Barcodes (Emulator-Kamera), Sitzungserneuerung nach 40 Minuten, Datei-Upload und Download am echten HA, Verhalten ohne Play-Dienste.
