# HAFS-App (Android)

[← Übersicht](README.md)

Die HAFS-App ist die App fürs Handy für beide Bereiche. **Training** läuft nativ und offline: Workouts aufzeichnen, Pausen-Timer, Benachrichtigung mit Satz-Eingabe, Pläne, Verlauf. **Ernährung** zeigt das Tagebuch aus Home Assistant im Vollbild, mit dem Scanner des Systems. Dazu kommen zwei Widgets für den Startbildschirm. Deine Daten liegen in Home Assistant; die App gleicht das Training ab und hält es für unterwegs auf dem Handy.

Sie ersetzt die frühere Android-App „MyDietAssistant“ und die bisherige HAFS-App 0.5. Im Browser und in der Companion-App funktioniert Ernährung weiterhin ohne die App.

## Voraussetzungen

- Android 8 oder neuer.
- HAFS ist in Home Assistant installiert und gestartet (siehe [Installation](installation.md)).
- Home Assistant 2026.11 oder neuer. Damit holt die App die Anmeldung für HAFS auch für Benutzer ohne Administratorrechte, solange HAFS in Home Assistant nicht nur für Administratoren freigegeben ist.
- Für Training unter *Einstellungen → Bereiche* **Ernährung und Training** oder **Nur Training** (siehe [Training](training.md)).
- Für den System-Scanner die Google-Play-Dienste (auf fast allen Handys vorhanden). Ohne sie nimmt die Ernährung den Scanner der Oberfläche.

## App installieren

Die App gibt es nicht im Play Store, sondern als APK-Datei `hafs-<Version>.apk` auf der [Releases-Seite](https://github.com/Schumey/HAFS/releases) (Versionen `app-v…`).

1. Lade auf dem Handy die neueste Datei `hafs-<Version>.apk` herunter.
2. Tippe auf die Datei. Android fragt beim ersten Mal, ob der Browser Apps installieren darf: erlaube es unter **Einstellungen → Unbekannte Apps installieren**.
3. Tippe auf **Installieren**. Play Protect warnt eventuell vor einer unbekannten App; wähle **Trotzdem installieren**.

Hattest Du schon die HAFS-App 0.5, aktualisierst Du einfach: Daten und Anmeldung bleiben. Die frühere App „MyDietAssistant“ kannst Du danach deinstallieren; beide Apps stören sich nicht.

## Einrichten

1. Lege in Home Assistant einen langlebigen Zugriffstoken an: *Profil → Sicherheit → Langlebige Zugriffstoken → Token erstellen*. Kopiere ihn.
2. Öffne **HAFS**. Auf **Mit Home Assistant verbinden** trägst Du die **Adresse** ein (zum Beispiel `http://homeassistant.local:8123` oder Deine Adresse von unterwegs) und den **Langlebigen Zugriffstoken**.
3. Tippe auf **Verbinden**. Die App holt Deine Trainingsdaten.

Die App findet HAFS in Home Assistant selbst (Kennung `eeb2daa3_mydiet`, `b9221a9a_mydiet` oder `local_mydiet`). Meldet sie, HAFS sei nicht gefunden, prüfe, ob die App in Home Assistant läuft und Home Assistant aktuell ist.

## Ernährung und Training

Oben in der Leiste wechselt der Umschalter **Ernährung | Training** zwischen den Bereichen; die App merkt sich den letzten.

- **Training** hat unten die Reiter **Training**, **Verlauf**, **Statistik** und **Einstellungen**. Der Knopf mit der Wolke gleicht ab; ohne Verbindung zeichnest Du weiter auf, abgeglichen wird später.
- **Ernährung** ist die Oberfläche aus Home Assistant im Vollbild, wie in der [Übersicht](README.md) beschrieben. Die Zurück-Taste blättert dort zurück. Datei-Uploads (Sicherung, Fotos, Tabellen) öffnen die Dateiauswahl von Android.

## Barcode scannen

Tippe in der Ernährung im Hinzufügen-Dialog wie gewohnt auf **Scannen**. Es öffnet sich der Scanner von Google (Hinweis „Scanned by Google“). Er braucht keine Kamera-Berechtigung und erkennt EAN-13, EAN-8, UPC-A und UPC-E. Was danach passiert, steht unter [Barcode-Scanner](barcode.md).

## Widgets

1. Halte auf dem Startbildschirm eine freie Stelle gedrückt und tippe auf **Widgets**.
2. Suche **HAFS** und ziehe eines der beiden Widgets auf den Startbildschirm:
   - **HAFS**: der nächste Trainingstag mit Übungen und Gewichten.
   - **HAFS Ernährung**: „Ernährung heute“ mit den übrigen Kalorien und „x von y kcal“. Der linke Knopf öffnet den Barcode-Scanner, **+** den Dialog zum Eintragen; ein Tipp auf die Zahlen öffnet die Ernährung.

Das Ernährungs-Widget übernimmt die Zahlen, wenn die App das heutige Tagebuch zeigt. Nach Mitternacht steht dort **Zum Aktualisieren die Ernährung öffnen**, bis Du sie einmal geöffnet hast.

## Health Connect

- **Workouts nach Health Connect schreiben:** in Training unter *Einstellungen → Health Connect* **Workouts in Health Connect eintragen** einschalten. Fertige Workouts landen dort als Krafttraining mit Kalorien.
- **Gewicht, Schritte, Kalorien übernehmen:** in Ernährung *Einstellungen → Android-App → Aus Health Connect übernehmen (30 Tage)*. Android fragt einmal nach der Erlaubnis zum Lesen. Regeln wie bisher: Gewicht nur für Tage ohne eigenen Wert, Schritte und Kalorien nur mit der Zusatzfunktion „Aktivität“ (siehe [Aktivität](activity.md)).

## Updates

Die App sucht beim Start höchstens einmal am Tag nach einer neuen Version, in Ernährung auch von Hand unter *Einstellungen → Android-App → Nach App-Updates suchen*. Die Pakete liegen in Home Assistant im Ordner `/share/hafs/app` (Dateien `hafs-<Version>.apk`); lege eine neue Version dort ab, und alle Handys bieten sie an. Zusätzlich schaut die App auf die [Releases](https://github.com/Schumey/HAFS/releases) bei GitHub (`app-v<Version>`): So kommen Updates auch, wenn Home Assistant unterwegs nicht erreichbar ist. Die neuere Version gewinnt, bei gleicher Version Home Assistant. Zu GitHub gehen nur die Anfrage nach der Release-Liste und der Download, ohne Zugangsdaten; die Prüfsumme wird immer kontrolliert.

1. Tippe auf **Herunterladen und installieren**. Beim ersten Mal öffnet Android **Unbekannte Apps installieren** für HAFS; erlaube es und tippe noch einmal.
2. Bestätige die Installation. Daten und Anmeldung bleiben erhalten.

## Bekannte Grenzen

- Ernährung läuft in der App nur unter Android. In der Windows-Version öffnet **Im Browser öffnen** die Seite in Home Assistant.
- Die APK ist mit einem eigenen Schlüssel signiert und nicht im Play Store. Installiere Updates nur über die App oder von der Releases-Seite.
