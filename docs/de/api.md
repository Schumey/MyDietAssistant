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

## Erinnerung

Das Add-on schickt einmal pro Tag eine Nachricht, wenn bis zu einer Uhrzeit noch nichts eingetragen ist.

1. Öffne *Einstellungen → Erinnerung*.
2. Schalte **Erinnerung aktiv** ein.
3. Wähle die **Uhrzeit**.
4. Trage den **Benachrichtigungsdienst** ein, zum Beispiel `notify.mobile_app_handy`. Den Namen findest Du unter *Entwicklerwerkzeuge → Aktionen*, wenn Du nach `notify.` suchst.
5. Tippe auf **Speichern** („Gespeichert ✓“).

Der gleiche Benachrichtigungsdienst wird vom [Mahlzeiten-Zeitplan](schedule.md) genutzt. Die Erinnerung läuft nur im Home-Assistant-Add-on.

Weiter mit [Fehlersuche](troubleshooting.md), wenn nichts ankommt.
