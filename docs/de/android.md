# Android-App

[← Übersicht](README.md)

Die Android-App ist eine schlanke Hülle um dieselbe Oberfläche, die Du aus Home Assistant kennst. Sie öffnet MyDietAssistant im Vollbild ohne HA-Seitenleiste, scannt Barcodes mit dem Scanner des Systems und bringt ein Widget für den Startbildschirm mit. Deine Daten bleiben in der App in Home Assistant; die Android-App speichert nur die Adresse und den Kalorienstand für das Widget.

Du brauchst sie nicht: In der Companion-App oder im Browser funktioniert alles genauso. Die App ist bequemer, wenn Du oft scannst oder den Stand ohne Öffnen sehen willst.

## Voraussetzungen

- Android 8 oder neuer.
- MyDietAssistant ist in Home Assistant installiert (siehe [Installation](installation.md)).
- Für den Vollbild-Modus ein HA-Konto mit Administratorrechten. Ohne diese Rechte öffnet die App MyDietAssistant innerhalb der HA-Oberfläche (mit Seitenleiste); der Scanner läuft dann über die Kamera im Browser.
- Für den System-Scanner die Google-Play-Dienste (auf fast allen Handys vorhanden). Ohne sie nimmt die App den Scanner der Oberfläche.

## App installieren

Die App gibt es nicht im Play Store, sondern als APK-Datei auf GitHub.

1. Öffne auf dem Handy die [Releases-Seite](https://github.com/Schumey/MyDietAssistant/releases?q=android&expanded=true) und lade die neueste Datei `MyDietAssistant-android-<Version>.apk` herunter.
2. Tippe auf die heruntergeladene Datei. Android fragt beim ersten Mal, ob der Browser Apps installieren darf: erlaube es unter **Einstellungen → Unbekannte Apps installieren**.
3. Tippe auf **Installieren**. Play Protect warnt eventuell vor einer unbekannten App; wähle **Trotzdem installieren**.

Updates installierst Du genauso: neue APK laden und darüber installieren. Deine Einstellungen bleiben erhalten.

## Einrichten

1. Öffne **MyDietAssistant**. Beim ersten Start fragt die App nach der **Adresse von Home Assistant**, zum Beispiel `http://homeassistant.local:8123` oder Deine Adresse von unterwegs (Nabu Casa, Tailscale, eigene Domain).
2. Die **App-Kennung** ist `eeb2daa3_mydiet`. Ändere sie nur, wenn Du MyDietAssistant aus einem anderen Repository installiert hast (die Kennung steht in HA in der Adresszeile der App-Seite).
3. Tippe auf **Verbinden** und melde Dich wie gewohnt bei Home Assistant an. Die App sieht Dein Passwort nicht, die Anmeldung läuft über die HA-Anmeldeseite.
4. Danach erscheint das Tagebuch im Vollbild.

Adresse ändern: Wenn Home Assistant nicht erreichbar ist, zeigt die App **Server ändern**. Alternativ die App-Daten in den Android-Einstellungen löschen.

## Barcode scannen

Tippe in der Oberfläche wie gewohnt auf **Barcode scannen**. In der App öffnet sich der Scanner von Google (Hinweis „Scanned by Google“). Er braucht keine Kamera-Berechtigung für die App und erkennt EAN-13, EAN-8, UPC-A und UPC-E. Mit dem **X** brichst Du ab. Was danach passiert, steht unter [Barcode-Scanner](barcode.md).

## Widget

1. Halte auf dem Startbildschirm eine freie Stelle gedrückt und tippe auf **Widgets**.
2. Suche **MyDietAssistant** und ziehe das Widget auf den Startbildschirm (4 × 1).
3. Das Widget zeigt die Kalorien von heute gegen Dein Ziel, wie viel noch übrig ist und wann der Stand zuletzt aktualisiert wurde.
4. **Scannen** öffnet die App direkt mit dem Barcode-Scanner, **Eintragen** mit dem Dialog zum Eintragen für die erste Mahlzeit. Ein Tipp auf die Zahlen öffnet die App.

Das Widget hat keine eigene Verbindung zu Home Assistant. Es übernimmt die Zahlen jedes Mal, wenn die App das heutige Tagebuch zeigt. Nach Mitternacht steht dort **Öffne die App für den Stand von heute**, bis Du die App einmal geöffnet hast. Einträge, die Du an einem anderen Gerät machst, sieht das Widget erst nach dem nächsten Öffnen.

## Bekannte Grenzen

- Downloads, die die Oberfläche selbst erzeugt (zum Beispiel manche Exporte), startet die App noch nicht; nutze dafür den Browser.
- Gesundheitsdaten (Health Connect) übernimmt die App noch nicht. Gewicht von einer Waage geht über einen HA-Sensor, siehe [Gewicht und Körpermaße](weight.md).
- Die APK ist nicht im Play Store und mit einem Entwicklerschlüssel signiert. Installiere Updates deshalb nur von der Releases-Seite dieses Repositorys.
