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

Jeder Home-Assistant-Benutzer hat ein eigenes Tagebuch. Die Option `admin_users` (Liste von Benutzer-IDs oder Namen) bestimmt, wer die Benutzerverwaltung unter Einstellungen sieht; leer bedeutet: der erste Benutzer, der das Add-on geöffnet hat. Mit der Zusatzfunktion „Haushalt“ können Benutzer Einträge, Lebensmittel und gespeicherte Mahlzeiten mit anderen teilen, die diese Funktion ebenfalls eingeschaltet haben. Ein Tagebucheintrag erscheint am selben Tag im Tagebuch der anderen (jeder mit eigener Menge). Lebensmittel und Mahlzeiten werden als Kopie in deren Bibliothek gelegt; gleichnamige Einträge dort bleiben unverändert, und spätere Änderungen werden nicht abgeglichen.

## Sprache und Einheiten

Einstellungen → Sprache und Einheiten: Deutsch, English oder automatisch nach Browser; metrisch (kg, cm) oder imperial (lb, in). Gewicht und Körpermaße werden intern immer in kg und cm gespeichert, nur Anzeige und Eingabe wechseln. Die Texte des Add-ons selbst (Optionen in Home Assistant) gibt es ebenfalls auf Deutsch und Englisch. Die Mengen von Lebensmitteln lassen sich getrennt davon auf Unzen (oz) umstellen („Lebensmittelmengen“). Gespeichert wird immer in Gramm, die Nährwerte bleiben „pro 100 g“.

## Weitere Datenquellen

Optional unter Einstellungen → Zusatzfunktionen. Im Formular „Neues Lebensmittel“ kannst Du dann in Open Food Facts und USDA FoodData Central suchen und die Werte vergleichen. Für USDA kann in den Add-on-Optionen ein eigener Schlüssel (`usda_api_key`, kostenlos auf api.data.gov) gesetzt werden; ohne Schlüssel gilt ein gemeinsamer Demo-Schlüssel mit niedrigem Limit.

Auf der Seite „Lebensmittel“ vergleicht „Werte online prüfen“ Deine eigenen Lebensmittel in einem Durchgang mit Open Food Facts (über den Barcode, sonst über den Namen), zeigt Abweichungen bei Kalorien und Makros und übernimmt die Online-Werte erst auf Knopfdruck. USDA lässt sich dazuschalten; ohne eigenen Schlüssel ist dessen Abfragelimit schnell erreicht.

## Zwischenspeicher der Online-Suche

Antworten von Open Food Facts und USDA merkt sich das Add-on lokal: Barcodes 60 Tage, Suchbegriffe 14 Tage. Wiederholte Suchen gehen so nicht erneut ins Internet. Gespeichert werden nur Produktdaten und die Suchschlüssel (Barcode bzw. Suchtext), nichts aus dem Tagebuch. Unter Einstellungen → Zwischenspeicher der Online-Suche lässt er sich leeren.

## Barcode
Nur die Online-Suche braucht Internet (Open Food Facts, optional USDA). Den Barcode kannst Du eintippen, mit der Kamera scannen oder aus einem Foto lesen lassen. Der Browser-eigene Leser (Chrome/Android) wird genutzt, wo es ihn gibt; sonst springt die mitgelieferte ZXing-Bibliothek ein (iPhone, Firefox, Safari). Die Kamera braucht eine HTTPS-Verbindung, ein Foto geht immer.

Der Barcode wird am Lebensmittel gespeichert. Im Hinzufügen-Dialog findet „Barcode scannen“ eigene Lebensmittel direkt; kennt Dein Tagebuch den Code noch nicht, wird er bei Open Food Facts nachgeschlagen und als neues Lebensmittel vorbereitet.

## Aktivität (Zusatzfunktion)

Schritte und verbrannte Kalorien erhöhen das Tagesziel des jeweiligen Tages. Unter Einstellungen → Aktivität wählst Du Sensoren aus Home Assistant (Schritte, aktive Kalorien) und den Anteil, der angerechnet wird (Standard 50 %). Die Sensoren müssen Tageszähler sein, die um Mitternacht auf 0 springen; ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ (`utility_meter`) auf täglich umstellen. Das Add-on liest sie alle fünf Minuten und behält den höchsten Wert des Tages. Ohne Kalorien-Sensor werden die Kalorien aus Schritten × Körpergewicht × Faktor geschätzt (Standard 0,0005 kcal je Schritt und kg). Im Tagebuch lassen sich die Werte jedes Tages auch von Hand eintragen; solche Tage überschreiben die Sensoren nicht mehr. Die Statistik und der Sensor „verbleibende kcal“ rechnen mit dem erhöhten Ziel.

## Mahlzeiten-Zeitplan (Zusatzfunktion)

Jede Mahlzeit bekommt unter Einstellungen → Mahlzeiten ein Zeitfenster (Von–Bis, auch über Mitternacht). Leer gilt ein Standardfenster für Frühstück (5:00–10:30), Mittagessen (11:00–14:30) und Abendessen (17:00–21:00); Snacks haben keines. Das Tagebuch zeigt heute „Jetzt: Mittagessen“ mit einem Knopf zum Hinzufügen und hebt die Mahlzeit hervor, sonst die nächste anstehende. Auf Wunsch schickt das Add-on eine Benachrichtigung, wenn ein Fenster beginnt und die Mahlzeit noch leer ist (nutzt den Benachrichtigungsdienst der Erinnerung).

## Lebensmittel-Tabelle importieren

Seite „Lebensmittel“ → „Tabelle importieren …“ (auch unter Einstellungen → Weitere Importe): CSV, TXT oder Excel (`.xlsx`) mit Nährwerten pro 100 g. Spalten werden anhand der Überschriften erkannt, auch die Kürzel der **BLS** (`ST`, `GCAL`, `GJ`, `ZE`, `ZF`, `ZK`, `ZB`) und die Spalten eines Open-Food-Facts-Exports; in der Vorschau lässt sich die Zuordnung korrigieren. Energie in kJ wird umgerechnet, Natrium in Salz. Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert, alle neuen bekommen die gewählte Kategorie. Die BLS selbst gibt es beim Max Rubner-Institut als Datei (die Nutzungsbedingungen dort gelten für die Daten); das Add-on bringt sie nicht mit.

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
