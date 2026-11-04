# MyDietAssistant für Android (Hülle)

Eigene App um die bestehende Oberfläche. Sie lädt Home Assistant im WebView, Du meldest Dich dort wie gewohnt an (die App sieht Dein Passwort nicht), holt dann über den Supervisor eine Ingress-Sitzung und zeigt das Add-on im Vollbild ohne HA-Seitenleiste. Geht das nicht (z. B. ohne Administratorrechte), öffnet sie das Add-on-Panel innerhalb der HA-Oberfläche.

Stand: Schritt 1 der Roadmap (Hülle mit Anmeldung, Kamera für den Barcode-Scanner, Datei-Auswahl, Downloads). Barcode nativ, Widget und Health Connect folgen.

## Bauen

Voraussetzung: Android Studio (JDK und SDK 36 liegen dabei). In `android/` eine Datei `local.properties` mit `sdk.dir=<Pfad zum Android SDK>` anlegen, dann:

```bash
./gradlew assembleDebug
```

Die APK liegt unter `app/build/outputs/apk/debug/app-debug.apk` und wird von Hand installiert (`adb install -r …`).

## Einrichten

Beim ersten Start fragt die App nach der Adresse von Home Assistant (z. B. `http://homeassistant.local:8123`) und der Add-on-Kennung (Standard `eeb2daa3_mydiet`).

## Geprüft / ungeprüft

- Geprüft im Emulator gegen einen Fake-HA (Login-Token, WebSocket, `supervisor/api`, Ingress-Seite): Ablauf bis zur Vollbild-Ansicht funktioniert.
- Ungeprüft gegen ein echtes Home Assistant: echte Anmeldung, Administratorrechte, Sitzungserneuerung nach 40 Minuten, Kamera, Datei-Upload, Download.
