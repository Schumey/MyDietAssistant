# Fehlersuche

[← Übersicht](README.md)

Zuerst: Öffne das **Protokoll** des Add-ons (*Einstellungen → Add-ons → MyDietAssistant → Protokoll*). Die meisten Fehler stehen dort.

## Das Add-on startet nicht oder zeigt eine leere Seite

1. Lade die Seite neu (nach einem Update kann der Browser alte Dateien zwischengespeichert haben).
2. Prüfe das Protokoll auf Fehler.
3. Prüfe, ob **In Seitenleiste anzeigen** eingeschaltet ist.
4. Steht eine Migration im Protokoll? Die Kopie `mydiet.db.v<Version>.bak` liegt neben der Datenbank in `/data`.

## Die Sensoren fehlen

1. Ist `publish_sensors` in der Add-on-Konfiguration an?
2. Hast Du heute schon etwas eingetragen? Ohne MQTT Discovery fehlen die Sensoren nach einem HA-Neustart bis zum nächsten Eintrag.
3. Suche in **Entwicklerwerkzeuge → Zustände** nach `mydiet`. Der Name hängt von Deinem Benutzernamen ab.
4. Für dauerhafte Sensoren [MQTT Discovery](sensors.md#mqtt-discovery) einschalten.

## Ein Trigger trägt nicht ein

1. Tippe in *Einstellungen → Trigger* auf **Jetzt prüfen**. Die Meldung zeigt, was geprüft wurde. „Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt)“ heißt: Das Add-on läuft nicht in Home Assistant.
2. Prüfe Entität und Zustand in **Entwicklerwerkzeuge → Zustände** (Groß-/Kleinschreibung, Zonenname statt `home`).
3. Ein Trigger trägt nur **einmal pro Tag** ein. Der Trigger-Verlauf zeigt, ob er schon lief; **Rückgängig** setzt den Tag nicht zurück.
4. Prüfe Haltedauer und Zeitfenster. Das Fenster 22:00 bis 06:00 geht über Mitternacht.
5. Bei Kalendern: Der Titel muss den Text **enthalten**, und der Kalender braucht Termine für den Tag (bei „Tage im Voraus“ auch für die kommenden).
6. Ist der Trigger pausiert (⏸, „pausiert bis …“)?
7. Beim Testen mit **▶** wird sofort eingetragen und die Bedingung nicht geprüft.

Die Zeitzone liest das Add-on beim Start aus Home Assistant. Hast Du sie geändert, starte das Add-on neu.

## Die Kamera startet nicht

1. Die Kamera braucht HTTPS (Nabu Casa oder eigenes Zertifikat). Über `http://` im Heimnetz geht nur **Foto vom Barcode**.
2. Erteile der Companion-App oder dem Browser die Kameraerlaubnis.
3. Auf iPhone, Firefox und Safari lädt der Scanner beim ersten Mal die ZXing-Bibliothek nach. Gibt es dabei einen Fehler, tippe die Nummer ein.

## Die Waage übernimmt nichts

1. Prüfe die Meldung nach **Speichern und jetzt lesen** (*Einstellungen → Waage*):
   - „Zuerst einen Sensor wählen“: kein Sensor eingetragen.
   - „Der Sensor liefert gerade keinen Zahlenwert“: Zustand `unavailable`/`unknown`.
   - „Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen)“: Stelle die Einheit passend ein.
   - „Der Wert im Sensor ist älter als 30 Tage“.
   - „Neuer Wert gesehen, wird übernommen, sobald er stabil ist“: warte eine Minute.
2. Der Sensor muss bei jeder Messung seinen Zeitstempel (`last_updated`) erneuern.

## Die Aktivität bleibt bei 0

1. Sind die Sensoren Tageszähler, die um Mitternacht auf 0 springen?
2. Tippe im Tagebuch auf **Aus Home Assistant lesen** (nur heute) oder **Verlauf nachladen**.
3. Für den Verlauf muss der Recorder die Sensoren aufzeichnen.

## Die Erinnerung kommt nicht an

1. Ist **Erinnerung aktiv** an und der Dienst richtig geschrieben (z. B. `notify.mobile_app_handy`)?
2. Teste den Dienst in **Entwicklerwerkzeuge → Aktionen**.
3. Die Erinnerung kommt nur, wenn bis zur Uhrzeit noch nichts eingetragen ist, und nur einmal pro Tag.

## Die Schnittstelle antwortet mit einem Fehler

1. Ist `api_key` gesetzt und stimmt er mit dem Header `X-MDA-Key` überein?
2. Stimmt der Hostname? Auf der Add-on-Seite steht er unter **Hostname**.
3. Stimmt `user` mit Deiner Benutzer-ID aus *Einstellungen → Schnittstelle für Automationen* überein?
4. `kg` muss zwischen 20 und 500 liegen.

## Online-Suche liefert nichts

1. Ist die Zusatzfunktion „Weitere Datenquellen“ an und hat das Add-on Internet?
2. Ohne eigenen `usda_api_key` ist das Limit des Demo-Schlüssels schnell erreicht.
3. Leere den Zwischenspeicher (*Einstellungen → Zwischenspeicher der Online-Suche*), wenn alte Antworten stören.

## Der Rezept-Import findet nichts

1. Die Seite braucht eingebettete Rezeptdaten (schema.org). Seiten ohne oder hinter einem Login lassen sich nicht lesen.
2. Adressen im lokalen Netz sind gesperrt, höchstens 3 MB.
3. Mealie: Prüfe Adresse und Token. `localhost` und Link-Local-Adressen sind nicht erlaubt.

## Die Oberfläche ist in der falschen Sprache oder Optik

*Einstellungen → Sprache und Einheiten* bzw. *Darstellung → Optik*.

## Weiterhilfe

Öffne ein Issue auf [GitHub](https://github.com/Schumey/MyDietAssistant/issues) und hänge das Protokoll des Add-ons an (ohne private Daten).
