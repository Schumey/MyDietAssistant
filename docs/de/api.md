# Schnittstelle und Erinnerung

[← Übersicht](README.md)

## Schnittstelle für Automationen

Mit gesetztem `api_key` können Home-Assistant-Automationen (Waage, Sprachassistent, Nachrichten) Einträge und Gewicht senden. Das Add-on ist intern unter `http://local-mydiet:8099` erreichbar.

### Einrichten

1. Öffne *Einstellungen → Add-ons → MyDietAssistant → Konfiguration*.
2. Trage bei `api_key` einen langen, zufälligen Schlüssel ein und speichere. Das Add-on startet neu. Bleibt das Feld leer, ist die Schnittstelle aus.
3. Prüfe den Hostnamen auf der Add-on-Seite unter **Hostname** (meist `local-mydiet`, bei Repository-Add-ons kann er `<Kürzel>-mydiet` lauten).
4. Lies Deine Benutzer-ID unter *Einstellungen → Schnittstelle für Automationen* ab (Feld `user`). Ohne Angabe gilt der lokale Benutzer `default`.
5. Lege die `rest_command`-Einträge in der `configuration.yaml` an:

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

6. Lade die Konfiguration neu (**Entwicklerwerkzeuge → YAML → Alle YAML-Konfigurationen neu laden** bzw. HA neu starten).
7. Teste in **Entwicklerwerkzeuge → Aktionen** mit `rest_command.mydiet_weight` und den Werten `user` und `kg`.

### Felder

`/api/ext/weight`

| Feld | Bedeutung |
|---|---|
| `user` | Benutzer-ID |
| `kg` | Gewicht in kg (20 bis 500) |
| `day` | optional, Datum `JJJJ-MM-TT` (sonst heute) |

`/api/ext/entry` akzeptiert entweder `food` oder `name` mit Werten:

| Feld | Bedeutung |
|---|---|
| `user` | Benutzer-ID |
| `food` | Name eines vorhandenen Lebensmittels, optional mit `grams` |
| `name` + `kcal`, `protein`, `carbs`, `fat` | Schnelleingabe ohne Lebensmittel |
| `day` | optional, Datum `JJJJ-MM-TT` |
| `time` | optional, `HH:MM` |
| `meal` | optional, Name der Mahlzeit |

Der Schlüssel muss im Header `X-MDA-Key` stehen. Ohne gültigen Schlüssel antwortet das Add-on mit einem Fehler.

Wenn Du das Gewicht von einer smarten Waage übernehmen willst, ist die [Waage als Sensor](weight.md#waage-als-sensor) einfacher als eine Automation.

### Essen per Satz eintragen (Sprachassistent)

`/api/ext/say` nimmt einen ganzen Satz statt eines genauen Lebensmittelnamens. So kannst Du mit Home Assistant Assist oder einer Automation sagen, was Du gegessen hast.

**Beispiele für `text`:** „zwei Äpfel und 200 g Skyr“, „eine halbe Banane“, „3 Scheiben Brot, ein Glas Milch“, „Post-Workout-Shake“.

- Mengen als Zahl oder Wort (ein, zwei, … zwölf, halbe, anderthalb), Einheiten `g`, `kg`, `ml`, `l`, `EL`, `TL`.
- Ohne Gramm-Angabe gilt eine Portion: bei „3 Scheiben Brot“ die Portion „Scheibe“ des Lebensmittels (anlegbar im Lebensmittel unter „Portionen“), sonst die Portionsgröße des Lebensmittels, sonst 100 g.
- Es werden Lebensmittel und gespeicherte Mahlzeiten gefunden. Mehrzahl, Umlaute und Groß-/Kleinschreibung spielen keine Rolle. „Äpfel“ findet „Apfel“.
- Was nicht gefunden wird, steht in `unmatched`, der Rest wird trotzdem eingetragen.

| Feld | Bedeutung |
|---|---|
| `user` | Benutzer-ID |
| `text` | der Satz |
| `meal` | optional, Name der Mahlzeit (sonst die laut Zeitplan fällige, sonst die erste) |
| `day`, `time` | optional, wie bei `/api/ext/entry` |
| `lang` | optional, `de` (Standard) oder `en` für den Antwortsatz |
| `dry_run` | optional, `true` zeigt nur, was eingetragen würde |

Die Antwort enthält `ok`, `added`, `unmatched` und `message`, einen kurzen Satz zum Vorlesen.

**Mit Assist („Ich habe zwei Äpfel gegessen“)**

1. Lege in der `configuration.yaml` den Befehl an (ersetze den Schlüssel):

```yaml
rest_command:
  mydiet_say:
    url: "http://local-mydiet:8099/api/ext/say"
    method: POST
    headers:
      X-MDA-Key: "DEIN_SCHLUESSEL"
      Content-Type: application/json
    payload: '{"user": "{{ user }}", "text": {{ text | tojson }}}'

intent_script:
  MydietLog:
    action:
      - action: rest_command.mydiet_say
        data:
          user: "default"
          text: "{{ food_text }}"
        response_variable: mda
      - stop: ""
        response_variable: mda
    speech:
      text: "{{ action_response.content.message }}"
```

2. Lege die Datei `config/custom_sentences/de/mydiet.yaml` an:

```yaml
language: "de"
intents:
  MydietLog:
    data:
      - sentences:
          - "trag[e] {food_text} ein"
          - "ich habe {food_text} (gegessen|getrunken)"
          - "füg[e] {food_text} zum Ernährungstagebuch hinzu"
lists:
  food_text:
    wildcard: true
```

3. Lade die Konfiguration neu, trage bei `user` Deine Benutzer-ID ein und sage zu Assist: „Ich habe zwei Äpfel und 200 Gramm Skyr gegessen“.

Zum Testen: **Entwicklerwerkzeuge → Aktionen**, `rest_command.mydiet_say` mit `user` und `text`. Für einen Probelauf ohne Eintragen rufst Du den Endpunkt direkt mit `"dry_run": true` auf. Die Assist-Sätze und die Weitergabe der Antwort hängen von Deiner Home-Assistant-Version ab (Platzhalter mit `wildcard` brauchen eine aktuelle Version).

## Erinnerung

Das Add-on schickt einmal pro Tag eine Nachricht, wenn bis zu einer Uhrzeit noch nichts eingetragen ist.

1. Öffne *Einstellungen → Erinnerung*.
2. Schalte **Erinnerung aktiv** ein.
3. Wähle die **Uhrzeit**.
4. Trage den **Benachrichtigungsdienst** ein, zum Beispiel `notify.mobile_app_handy`. Den Namen findest Du unter *Entwicklerwerkzeuge → Aktionen*, wenn Du nach `notify.` suchst.
5. Tippe auf **Speichern** („Gespeichert ✓“).

Der gleiche Benachrichtigungsdienst wird vom [Mahlzeiten-Zeitplan](schedule.md) genutzt. Die Erinnerung läuft nur im Home-Assistant-Add-on.

## Wochenbericht

Einmal pro Woche schickt das Add-on eine Zusammenfassung der letzten sieben Tage, zum Beispiel „Ø 2.012 kcal pro Tag (Ziel 2100), Eiweißziel an 5/7 Tagen, 7/7 Tage erfasst, Gewicht -0.4 kg.“

1. Richte zuerst die **Erinnerung** ein (der Benachrichtigungsdienst wird mitbenutzt).
2. Öffne *Einstellungen → Wochenbericht*, schalte **Wochenbericht aktiv** ein und wähle **Wochentag** und **Uhrzeit**. Unter **Vorschau** siehst Du den Text, den die Nachricht heute hätte.
3. Tippe auf **Speichern**.

Der Wochenbericht erscheint in der gewählten Sprache und läuft nur im Home-Assistant-Add-on.

Weiter mit [Fehlersuche](troubleshooting.md), wenn nichts ankommt.
