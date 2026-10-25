# MyDietAssistant

Ernährungstagebuch pro HA-Benutzer (Ingress). Daten liegen in `/data/mydiet.db` und sind im HA-Backup enthalten.

## Sensoren
Bei aktivierter Option `publish_sensors` werden nach jeder Änderung diese Entitäten gesetzt:
`sensor.mydiet_<name>_{kcal,protein,carbs,fat}_today`.

Weitere Sensoren (gleiches Namensschema):

| Entität | Bedeutung |
|---|---|
| `sensor.mydiet_<name>_kcal_remaining_today` | verbleibende kcal heute (Tagesziel minus Aufnahme) |
| `sensor.mydiet_<name>_kcal_week_avg` | Ø kcal der letzten 7 Tage (nur erfasste Tage) |
| `sensor.mydiet_<name>_weight` | letzter Gewichtswert |
| `sensor.mydiet_<name>_weight_trend` | geglätteter Gewichtstrend |
| `sensor.mydiet_<name>_energy_balance` | geschätzte Kalorienbilanz pro Tag (30 Tage, aus Gewichtstrend und Aufnahme; + Überschuss, − Defizit) |
| `sensor.mydiet_<name>_current_meal` | Name der Mahlzeit, deren Zeitfenster jetzt offen ist, sonst `none` (nur mit der Zusatzfunktion „Mahlzeiten-Zeitplan“; wechselt zur vollen Minute) |

Ein Beispiel für eine Automation, die um die Mittagszeit erinnert, wenn noch nichts eingetragen ist: Auslöser „Zustand“ von `sensor.mydiet_<name>_current_meal` nach `Mittagessen`, Bedingung `sensor.mydiet_<name>_kcal_today` unter 300.

### MQTT Discovery

Mit der Option `mqtt_discovery` legt das Add-on die Sensoren über MQTT Discovery an, statt nur Zustände zu setzen. Die Entitäten haben dann eine eindeutige ID (lassen sich in Home Assistant umbenennen, einem Bereich zuordnen und bleiben nach einem Neustart erhalten) und hängen an einem Gerät „MyDietAssistant <Name>“. Die Entitäts-IDs bleiben dieselben wie oben. Voraussetzung ist die MQTT-Integration (zum Beispiel mit dem Mosquitto-Add-on); das Add-on sendet über den Dienst `mqtt.publish` von Home Assistant und braucht keine eigenen Zugangsdaten. Ist MQTT nicht eingerichtet, werden die Sensoren wie bisher als Zustände gesetzt. Beim Umstellen kann ein alter Zustandssensor bis zum nächsten HA-Neustart neben dem neuen stehen bleiben.

Beispiel für eine Dashboard-Karte (`<name>` anpassen):

```yaml
type: entities
title: Ernährung
entities:
  - entity: sensor.mydiet_<name>_kcal_today
    name: Heute gegessen
  - entity: sensor.mydiet_<name>_kcal_remaining_today
    name: Verbleibend
  - entity: sensor.mydiet_<name>_protein_today
    name: Eiweiß
  - entity: sensor.mydiet_<name>_kcal_week_avg
    name: Ø 7 Tage
  - entity: sensor.mydiet_<name>_weight_trend
    name: Gewichtstrend
  - entity: sensor.mydiet_<name>_energy_balance
    name: Bilanz pro Tag
```

Hinweis: Sie werden über die States-API gesetzt (keine Unique-ID, nach einem HA-Neustart fehlen sie bis zum nächsten Eintrag). Später: MQTT Discovery.

## Optionen

| Option | Bedeutung |
|---|---|
| `publish_sensors` | Sensoren in Home Assistant setzen (siehe oben) |
| `auto_backup` | täglich eine JSON-Sicherung je Benutzer nach `/backup/mydiet/` (im Samba-Share „backup“ sichtbar) |
| `backup_keep_days` | wie lange Sicherungen aufbewahrt werden (Standard 14 Tage) |
| `api_key` | Schlüssel für die Schnittstelle unten; leer = Schnittstelle aus |
| `mqtt_discovery` | Sensoren über MQTT Discovery anlegen (siehe oben); Standard aus |

Das Add-on ist zusätzlich in jedem normalen Home-Assistant-Backup enthalten (Datenbank in `/data`). Die JSON-Sicherung ist unabhängig davon lesbar und lässt sich unter Einstellungen → Automatische Sicherung mit Vorschau wiederherstellen.

## Schnittstelle für Automationen

Mit gesetztem `api_key` können Home-Assistant-Automationen (Waage, Sprachassistent, Nachrichten) eintragen. Das Add-on ist intern unter `http://local-mydiet:8099` erreichbar. Deine Benutzer-ID steht in den Einstellungen (Feld `user`; ohne Angabe wird der lokale Benutzer `default` verwendet).

```yaml
rest_command:
  mydiet_weight:
    url: "http://local-mydiet:8099/api/ext/weight"
    method: POST
    headers:
      X-MDA-Key: "DEIN_SCHLUESSEL"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "kg": {{ kg }}}'
  mydiet_entry:
    url: "http://local-mydiet:8099/api/ext/entry"
    method: POST
    headers:
      X-MDA-Key: "DEIN_SCHLUESSEL"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "food": "{{ food }}", "grams": {{ grams }}, "meal": "{{ meal }}"}'
```

`/api/ext/entry` akzeptiert entweder `food` (Name eines vorhandenen Lebensmittels, optional `grams`) oder `name` mit `kcal`, `protein`, `carbs`, `fat` für eine Schnelleingabe; zusätzlich optional `day`, `time` (HH:MM) und `meal` (Name der Mahlzeit). Ob der Hostname bei Dir `local-mydiet` lautet, siehst Du auf der Add-on-Seite unter „Hostname“.

## Erinnerung

Unter Einstellungen → Erinnerung wählst Du eine Uhrzeit und einen Benachrichtigungsdienst (z. B. `notify.mobile_app_handy`). Ist bis dahin nichts eingetragen, schickt das Add-on einmal pro Tag eine Nachricht.

## Tastatur

Im Tagebuch: ← / → Tag wechseln, T heute, N Nahrungsmittel hinzufügen; / springt ins Suchfeld der Listen.

## Mehrere Benutzer

Jeder Home-Assistant-Benutzer hat ein eigenes Tagebuch. Die Option `admin_users` (Liste von Benutzer-IDs oder Namen) bestimmt, wer die Benutzerverwaltung unter Einstellungen sieht; leer bedeutet: der erste Benutzer, der das Add-on geöffnet hat. Mit der Zusatzfunktion „Haushalt“ können Benutzer Einträge, Lebensmittel und gespeicherte Mahlzeiten mit anderen teilen, die diese Funktion ebenfalls eingeschaltet haben. Ein Tagebucheintrag erscheint am selben Tag im Tagebuch der anderen (jeder mit eigener Menge). Lebensmittel und Mahlzeiten lassen sich als Kopie in die Bibliothek anderer legen (⇪); gleichnamige Einträge dort bleiben unverändert, und spätere Änderungen werden nicht abgeglichen.

**Gemeinsame Bibliothek:** Im Formular eines Lebensmittels bietet „In der gemeinsamen Haushaltsbibliothek anbieten“ das Lebensmittel allen an, die „Haushalt“ eingeschaltet haben. Sie sehen es mit dem Vermerk „von <Name>“ in ihrer Liste und im Hinzufügen-Dialog, dürfen es eintragen und ändern (die Änderung gilt sofort für alle, bereits eingetragene Mengen bleiben Schnappschüsse); Löschen, Favorit, Trigger und das Freigeben selbst bleiben beim Besitzer. Wer „Haushalt“ ausschaltet, sieht keine fremden Lebensmittel mehr.

## Sprache und Einheiten

Einstellungen → Sprache und Einheiten: Deutsch, English, Français, Español oder automatisch nach Browser; metrisch (kg, cm) oder imperial (lb, in). Gewicht und Körpermaße werden intern immer in kg und cm gespeichert, nur Anzeige und Eingabe wechseln. Die Texte des Add-ons selbst (Optionen in Home Assistant) gibt es ebenfalls auf Deutsch und Englisch. Die Mengen von Lebensmitteln lassen sich getrennt davon auf Unzen (oz) umstellen („Lebensmittelmengen“). Gespeichert wird immer in Gramm, die Nährwerte bleiben „pro 100 g“.

## Weitere Datenquellen

Optional unter Einstellungen → Zusatzfunktionen. Im Formular „Neues Lebensmittel“ kannst Du dann in Open Food Facts und USDA FoodData Central suchen und die Werte vergleichen. Für USDA kann in den Add-on-Optionen ein eigener Schlüssel (`usda_api_key`, kostenlos auf api.data.gov) gesetzt werden; ohne Schlüssel gilt ein gemeinsamer Demo-Schlüssel mit niedrigem Limit.

Auf der Seite „Lebensmittel“ vergleicht „Werte online prüfen“ Deine eigenen Lebensmittel in einem Durchgang mit Open Food Facts (über den Barcode, sonst über den Namen), zeigt Abweichungen bei Kalorien und Makros und übernimmt die Online-Werte erst auf Knopfdruck. USDA lässt sich dazuschalten; ohne eigenen Schlüssel ist dessen Abfragelimit schnell erreicht.

## Zwischenspeicher der Online-Suche

Antworten von Open Food Facts und USDA merkt sich das Add-on lokal: Barcodes 60 Tage, Suchbegriffe 14 Tage. Wiederholte Suchen gehen so nicht erneut ins Internet. Gespeichert werden nur Produktdaten und die Suchschlüssel (Barcode bzw. Suchtext), nichts aus dem Tagebuch. Unter Einstellungen → Zwischenspeicher der Online-Suche lässt er sich leeren.

## Barcode
Nur die Online-Suche braucht Internet (Open Food Facts, optional USDA). Den Barcode kannst Du eintippen, mit der Kamera scannen oder aus einem Foto lesen lassen. Der Browser-eigene Leser (Chrome/Android) wird genutzt, wo es ihn gibt; sonst springt die mitgelieferte ZXing-Bibliothek ein (iPhone, Firefox, Safari). Die Kamera braucht eine HTTPS-Verbindung, ein Foto geht immer.

Der Barcode wird am Lebensmittel gespeichert. Im Hinzufügen-Dialog findet „Barcode scannen“ eigene Lebensmittel direkt; kennt Dein Tagebuch den Code noch nicht, wird er bei Open Food Facts nachgeschlagen und als neues Lebensmittel vorbereitet.

### Scanner per Homescreen-Verknüpfung (Companion-App)
Ein echtes Widget mit Kamera gibt es in der Companion-App nicht. Mit einer Verknüpfung auf das Panel öffnet sich der Scanner trotzdem mit einem Tipp:

1. Update auf v1.6.0 oder neuer installieren (Einstellungen → Add-ons → MyDietAssistant → Aktualisieren).
2. Auf dem Handy die Companion-App öffnen, in der Seitenleiste „Ernährung“ wählen und Einstellungen → Darstellung öffnen.
3. „Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten“ einschalten. Die Option gilt nur für dieses Gerät.
4. **Android:** In der Companion-App Einstellungen → Companion-App → Verknüpfungen (nicht unter „Widgets“, dort gibt es nur Aktionsknopf, Bild, Entität, Mediaplayer, Template und To-do) eine Verknüpfung anlegen. Als Ziel den Pfad des Panels eintragen: `/hassio/ingress/<Add-on-Kennung>`. Die Kennung ist bei Add-ons aus einem Repository meist `<Kürzel>_mydiet` (z. B. `a0d7b954_mydiet`); den genauen Pfad zeigt die Adresszeile des Browsers, wenn Du das Panel „Ernährung“ öffnest. Danach das Home-Assistant-Symbol lange drücken und die Verknüpfung auf den Homescreen ziehen.
5. **iPhone:** Kurzbefehle-App: Aktion „URL öffnen“ mit `homeassistant://navigate/hassio/ingress/<Add-on-Kennung>` (Kennung wie oben) anlegen und „Zum Home-Bildschirm“ hinzufügen. Ungeprüft.
6. Verknüpfung antippen: Die App öffnet das Tagebuch, der Hinzufügen-Dialog erscheint mit laufender Kamera. Beim ersten Mal die Kameraerlaubnis erteilen.
7. Barcode ins Bild halten. Bekannte Lebensmittel werden direkt gewählt, unbekannte bei Open Food Facts nachgeschlagen.

Hinweis: Solange die Option an ist, startet der Scanner bei jedem Öffnen des Panels auf diesem Gerät. Schließen schließt nur den Dialog. Die Kamera braucht HTTPS (Nabu Casa oder eigenes Zertifikat).

## Aktivität (Zusatzfunktion)

Schritte und verbrannte Kalorien erhöhen das Tagesziel des jeweiligen Tages. Unter Einstellungen → Aktivität wählst Du Sensoren aus Home Assistant (Schritte, aktive Kalorien) und den Anteil, der angerechnet wird (Standard 50 %). Die Sensoren müssen Tageszähler sein, die um Mitternacht auf 0 springen; ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ (`utility_meter`) auf täglich umstellen. Das Add-on liest sie alle fünf Minuten und behält den höchsten Wert des Tages. „Verlauf nachladen“ im Tagebuch holt die letzten 30 Tage aus der Verlaufsdatenbank von Home Assistant (der Recorder muss die Sensoren aufzeichnen); Tage mit Handeingabe bleiben unberührt. Ohne Kalorien-Sensor werden die Kalorien aus Schritten × Körpergewicht × Faktor geschätzt (Standard 0,0005 kcal je Schritt und kg). Im Tagebuch lassen sich die Werte jedes Tages auch von Hand eintragen; solche Tage überschreiben die Sensoren nicht mehr. Die Statistik und der Sensor „verbleibende kcal“ rechnen mit dem erhöhten Ziel.

## Waage (Zusatzfunktion)

Unter Einstellungen → Zusatzfunktionen „Waage (Sensor)“ einschalten, dann in der Karte „Waage“ einen Home-Assistant-Sensor mit dem Körpergewicht wählen (z. B. `sensor.waage_gewicht` einer smarten Waage). Die Einheit steht auf „Automatisch“ (das Add-on liest `unit_of_measurement` des Sensors, ohne Angabe kg) oder lässt sich auf kg, g, lb oder st festlegen; gespeichert wird intern in kg. Das Add-on schaut jede Minute nach: Ein neuer Wert (anderer Zeitstempel `last_updated`) wird übernommen, sobald er sich eine weitere Minute nicht geändert hat, damit eine Waage, die noch einpendelt, keine Zwischenwerte hinterlässt. Gespeichert wird für den lokalen Tag der Messung; ein Gewicht vom selben Tag wird ersetzt. Werte außerhalb von 20 bis 500 kg, „unavailable“/„unknown“ und Messungen, die älter als 30 Tage sind, werden ignoriert. „Speichern und jetzt lesen“ übernimmt den aktuellen Wert sofort. Läuft nur im Home-Assistant-Add-on; der Sensor muss bei jeder Messung seinen Zeitstempel (`last_updated`) erneuern, was Waagen-Integrationen normalerweise tun.

## Mahlzeiten-Zeitplan (Zusatzfunktion)

Jede Mahlzeit bekommt unter Einstellungen → Mahlzeiten ein Zeitfenster (Von–Bis, auch über Mitternacht). Leer gilt ein Standardfenster für Frühstück (5:00–10:30), Mittagessen (11:00–14:30) und Abendessen (17:00–21:00); Snacks haben keines. Das Tagebuch zeigt heute „Jetzt: Mittagessen“ mit einem Knopf zum Hinzufügen und hebt die Mahlzeit hervor, sonst die nächste anstehende. Auf Wunsch schickt das Add-on eine Benachrichtigung, wenn ein Fenster beginnt und die Mahlzeit noch leer ist (nutzt den Benachrichtigungsdienst der Erinnerung).

## Mahlzeiten-Vorschläge (Zusatzfunktion)

Einstellungen → Zusatzfunktionen → „Mahlzeiten-Vorschläge“ blendet im Tagebuch den Button „Mahlzeit vorschlagen“ ein. Er rechnet das offene Tagesbudget aus (Ziel des Tages inkl. Aktivität und Wochentagsziel minus Gegessenes; Werte ohne Ziel zählen nicht) und sucht unter Deinen gespeicherten Mahlzeiten und den wiederkehrenden Kombinationen aus Deinem Verlauf (gleiche Zutaten in einer Mahlzeit, mindestens zweimal in 180 Tagen) die besten Treffer. Oben im Dialog wählst Du die Mahlzeit, in die eingetragen wird, und ob der **Rest des Tages** oder nur der **Anteil für diese Mahlzeit** (Rest geteilt durch die Zahl der noch leeren Mahlzeiten) das Ziel ist.

**Mengen.** In Mahlzeiten → Bearbeiten (nur mit eingeschalteter Funktion) bekommt jede Zutat einen Modus: *Skalierbar* folgt dem Mengenfaktor der Mahlzeit; „Abweichung ±“ erlaubt der Zutat, vom Verhältnis zu den anderen um so viele Prozent abzuweichen (0 = starr). *Fest* bleibt, wie gespeichert, oder nimmt mit „Packung“ eine oder zwei Packungen. „Mengenfaktor für Vorschläge“ begrenzt, wie stark die ganze Mahlzeit schrumpfen oder wachsen darf (leer = 0,6 bis 1,6). Mengen werden auf 5 g (kleine Mengen 1 g) gerundet.

**Prioritäten** (Zahnrad im Dialog): Wichtigkeit je Kalorien, Eiweiß, Kohlenhydrate und Fett sowie „Kalorienziel nie überschreiten“ und „Eiweißziel möglichst erreichen“. Zu viel zählt stärker als zu wenig. **Beigaben** sind Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse) mit Mindest-/Höchstmenge und Schrittweite; ein Vorschlag nimmt höchstens zwei davon dazu und nur, wenn sie den Rest besser treffen. Bei der Reihenfolge helfen die passende Kategorie (Name der Mahlzeit), Abwechslung gegenüber heute und gestern und die Häufigkeit.

„Anpassen“ erlaubt, die Mengen vor dem Eintragen von Hand zu ändern (Makros und Abweichung rechnen mit). Die Einträge sind wie immer Schnappschüsse. Export, Sicherungen und Import enthalten die Einstellungen, Beigaben und Zutaten-Modi.

## Lebensmittel-Tabelle importieren

Seite „Lebensmittel“ → „Tabelle importieren …“ (auch unter Einstellungen → Weitere Importe): CSV, TXT oder Excel (`.xlsx`) mit Nährwerten pro 100 g. Spalten werden anhand der Überschriften erkannt, auch die Kürzel der **BLS** (`ST`, `GCAL`, `GJ`, `ZE`, `ZF`, `ZK`, `ZB`) und die Spalten eines Open-Food-Facts-Exports, der französischen **CIQUAL** (`alim_nom_fr`, „Protéines“, „Glucides“, „Lipides“ …) und der **Schweizer Nährwertdatenbank** (Energie in kcal, Protein, Kohlenhydrate verfügbar, Fett total, Nahrungsfasern …); in der Vorschau lässt sich die Zuordnung korrigieren. Energie in kJ wird umgerechnet, Natrium in Salz. Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert, alle neuen bekommen die gewählte Kategorie. Die BLS selbst gibt es beim Max Rubner-Institut als Datei (die Nutzungsbedingungen dort gelten für die Daten); das Add-on bringt sie nicht mit.

## Rezepte von Webseiten importieren

Unter „Rezepte“ (Zusatzfunktion) ruft „Von Webseite …“ eine Rezeptseite ab und liest die darin eingebetteten Rezeptdaten (schema.org, wie sie die meisten Kochseiten für Suchmaschinen mitliefern): Name, Portionen, Zutaten, Zubereitung und Quelle. Die Zutatenzeilen („200 g Weizenmehl“, „1 1/2 EL Öl“, „2 Eier“) werden in Gramm umgerechnet (Löffel, Tassen, Prisen und Milliliter nach Faustwerten, Stückangaben mit der Portionsgröße des Lebensmittels) und Deinen Lebensmitteln zugeordnet, auch über Wortbestandteile („Weizenmehl“ → „Mehl“). Ist die Zusatzfunktion „Weitere Datenquellen“ an, werden fehlende Grundnahrungsmittel (mit Mengenangabe) bei Open Food Facts und USDA nachgeschlagen: Der Mittelwert der passenden Treffer ergänzt die Nährwerte, die Zeile steht orange mit der Quelle im Editor und sollte geprüft werden. Nicht zugeordnete Zutaten stehen rot im Editor; mit ⇄ wählst Du ein Lebensmittel, sonst zählen sie mit 0 kcal. Gibt die Seite Nährwerte an, zeigt der Editor sie zum Vergleich mit der berechneten Portion. Gespeichert wird erst nach Deiner Prüfung; die Quelle bleibt als Link am Rezept, die Zubereitung klappt in der Liste auf. Abgerufen werden nur öffentliche http(s)-Adressen (Adressen im lokalen Netz sind gesperrt, höchstens 3 MB). Seiten ohne Rezeptdaten oder hinter einem Login lassen sich nicht lesen.

## Rezepte aus Mealie importieren

Wer Rezepte in [Mealie](https://mealie.io) pflegt, trägt unter Einstellungen → Mealie (mit der Zusatzfunktion „Rezepte“) die Adresse des Servers (`http://mealie:9000`, im Heimnetz erlaubt; nicht `localhost` oder Link-Local-Adressen) und einen API-Token ein (in Mealie: Profil → API-Tokens). Unter „Rezepte“ erscheint dann „Aus Mealie …“: eine durchsuchbare Liste, aus der ein Rezept als Entwurf in den Editor übernommen wird. Zuordnung der Zutaten, Online-Ergänzung und Prüfung wie beim Web-Import. Es werden nur Rezepte gelesen (`GET /api/recipes`), in Mealie wird nichts verändert. Der Token liegt in der Add-on-Datenbank (und damit in automatischen Sicherungen), ist aber nicht Teil des JSON-Exports und wird von der Oberfläche nie angezeigt. Nur für Mealie-Konten mit Leserechten nötig; ein eigener Token pro Benutzer.

## Datenbank und Updates

Die Datenbank trägt eine Versionsnummer (`PRAGMA user_version`); beim Start laufen alle fehlenden Migrationen der Reihe nach. Vor einer Migration einer bestehenden Datenbank legt das Add-on eine Kopie `mydiet.db.v<alte Version>.bak` neben der Datenbank in `/data` ab. Für größere Mengen (viele Jahre Tagebuch, importierte Lebensmitteltabellen) gibt es Indizes; die Lebensmittelliste lädt seitenweise und sucht auf dem Server.

## Neu in 0.3

- **Import/Export** (Einstellungen → Daten): JSON-Sicherung, CSV-Export, MyFitnessPal-CSV-Import (komplett oder nur Tagessummen + Gewicht).
- **Mahlzeiten speichern** im Tagebuch, wiederverwendbar über „Meine Mahlzeiten“.
- **Kategorien** für Lebensmittel und Mahlzeiten (z. B. Diät/Bulk), per Chip ein-/ausblendbar.
- **Kalorienbilanz** (Statistik): aus Gewichtstrend und Aufnahme (1 kg ≈ 7700 kcal).
- **Trigger**: Zustand einer HA-Entität oder Kalendertermin trägt ein Lebensmittel/eine Mahlzeit einmal pro Tag ein (Prüfung jede Minute).
- **Tagebuch-Ansicht** umschaltbar auf Uhrzeiten statt fester Mahlzeiten.

## Neu in 0.4

- Eigene Seite **Mahlzeiten**, Mahlzeiten **kopieren** und **leeren**, **Häufig verwendet** im Hinzufügen-Dialog.
- **Einblend-Regeln** für Tagebuch-Mahlzeiten (Einstellungen → Mahlzeiten → ⚡), z. B. „Nachtschicht“ nur an Tagen mit gleichnamigem Kalendertermin.
- Details siehe CHANGELOG.
