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

Jeder Home-Assistant-Benutzer hat ein eigenes Tagebuch. Die Option `admin_users` (Liste von Benutzer-IDs oder Namen) bestimmt, wer die Benutzerverwaltung unter Einstellungen sieht; leer bedeutet: der erste Benutzer, der das Add-on geöffnet hat. Mit der Zusatzfunktion „Haushalt“ können Benutzer Einträge mit anderen teilen, die diese Funktion ebenfalls eingeschaltet haben.

## Sprache und Einheiten

Einstellungen → Sprache und Einheiten: Deutsch, English oder automatisch nach Browser; metrisch (kg, cm) oder imperial (lb, in). Gewicht und Körpermaße werden intern immer in kg und cm gespeichert, nur Anzeige und Eingabe wechseln. Die Texte des Add-ons selbst (Optionen in Home Assistant) gibt es ebenfalls auf Deutsch und Englisch. Mengen von Lebensmitteln bleiben in Gramm.

## Weitere Datenquellen

Optional unter Einstellungen → Zusatzfunktionen. Im Formular „Neues Lebensmittel“ kannst Du dann in Open Food Facts und USDA FoodData Central suchen und die Werte vergleichen. Für USDA kann in den Add-on-Optionen ein eigener Schlüssel (`usda_api_key`, kostenlos auf api.data.gov) gesetzt werden; ohne Schlüssel gilt ein gemeinsamer Demo-Schlüssel mit niedrigem Limit.

## Open Food Facts
Die Barcode-Suche ist die einzige Funktion, die Internet braucht. Den Barcode kannst Du eintippen, mit der Kamera scannen oder aus einem Foto lesen lassen (benötigt die Barcode-Erkennung des Browsers, z. B. Chrome/Android).

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
