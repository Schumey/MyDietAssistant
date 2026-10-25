# MyDietAssistant (MDA)

Home-Assistant-Add-on: lokales Ernährungstagebuch (Kalorien, Makros, Gewicht) mit HA-Sensoren und Triggern. Oberfläche und Dokumentation sind **deutsch** (Du-Form), Code und Kommentare englisch.

## Aufbau

- `mydiet/` ist das Add-on (`config.yaml`, `CHANGELOG.md`, `DOCS.md`, `Dockerfile`).
- `mydiet/app/main.py`: FastAPI, Tagebuch, Lebensmittel, Gewicht, Statistik, HA-Sensoren (`publish`). Importiert am Ende `extras` bis `extras13` (Sternimport). `GOAL_HOOKS` erlaubt Modulen, das Tagesziel anzupassen (Aktivität).
- `mydiet/app/extras.py`: Einstellungen/Zusatzfunktionen, Wochentagsziele, Tracker, gespeicherte Mahlzeiten, Export/Import, Trigger, Bericht, Kopieren.
- `mydiet/app/extras2.py`: Notizen, automatische Sicherung, Wiederherstellungs-Vorschau, externe API (`/api/ext/*`), Erinnerung, Zeitzone, Hintergrundschleife.
- `mydiet/app/extras3.py` (Körpermaße, Fotos), `extras4.py` (Rezepte), `extras5.py` (Datenquellen OFF/USDA): je eine Zusatzfunktion, ebenfalls per Sternimport am Ende von `main.py`.
- `mydiet/app/extras6.py` (Export/Bericht), `extras7.py` (Tabellen-Import, Apple-Health-Datensätze), `extras8.py` (Benutzer, Admin, Haushalt; hier liegt auch `/api/me`).
- `mydiet/app/recipe_import.py`: Rezept-Import von Webseiten (Abruf mit Prüfung auf öffentliche Adressen, schema.org-Parser, Zutatenzeilen → Gramm, Zuordnung zu Lebensmitteln); Endpunkt `/api/recipes/import-url` in `extras4.py`. `mydiet/app/mealie.py` + `extras12.py`: Rezept-Import aus einem Mealie-Server (Adresse/Token in Pref `mealie`, Endpunkte `/api/mealie*`; Heimnetz erlaubt, Entwurf über `recipe_import.draft_from_node`).
- `mydiet/app/suggest.py` (reiner Rechner für Mahlzeiten-Vorschläge: Mengenfaktor-Raster + beschränkte Kleinste-Quadrate-Anpassung, Zutaten-Modi, Beigaben) und `extras13.py` (Endpunkte `/api/suggest*`, Kandidaten aus gespeicherten Mahlzeiten und Verlauf, Beigaben-Tabelle `suggest_addons`, Pref `suggest`).
- `mydiet/app/extras9.py` (Aktivität, Mahlzeiten-Zeitplan, Cache-Verwaltung; Hintergrundjobs über `extras2.EXTRA_JOBS`), `extras10.py` (Lebensmittel/Mahlzeiten teilen, Lebensmittel-Tabelle importieren, Online-Abgleich eigener Lebensmittel).
- `mydiet/app/static/app.js` beginnt mit der englischen Übersetzung (`EN`, `I18N`; bewusst in dieselbe Datei, weil ein zwischengespeichertes `index.html` neue Skript-Tags nicht kennt und die App sonst leer bleibt). Die Oberfläche ist deutsch geschrieben; `EN` mappt deutsche Texte (mit `{}` für Eingesetztes) auf englische; Französisch und Spanisch stehen als generierte Wörterbücher in `Object.assign(LANGS, …)` direkt darunter (gleiche Schlüssel wie `EN`, gleiche `{}`-Zahl; ein Test prüft das). Neue Sprache: Wörterbuch dort, `LANG_LOCALES`, `LANGS` in `extras.py`, Auswahl in den Einstellungen. Ein MutationObserver übersetzt DOM-Texte und Attribute. **Neue sichtbare Texte in `EN` und in `fr`/`es` eintragen** (sonst fällt der Test durch); Sätze nicht aus mehreren Textknoten zusammensetzen, sondern als eine Zeichenkette (Template) schreiben. Zahlen/Datum über `I18N.locale`, Gewicht über `wConv`/`wUnit` (intern kg/cm).
- Sensoren: `main.publish` setzt Zustände oder (Option `mqtt_discovery`) MQTT Discovery über den HA-Dienst `mqtt.publish`; Module hängen Sensoren über `SENSOR_HOOKS` an (z. B. `current_meal` in `extras9.py`).
- `mydiet/app/db.py`: SQLite-Schema (`CREATE TABLE IF NOT EXISTS`) plus nummerierte Migrationen (`MIGRATIONS`, Stand in `PRAGMA user_version`). Neue Spalte/Index: **neue Migrationsfunktion ans Ende anhängen**, alte nie ändern. Außerdem der Zwischenspeicher für Online-Abfragen (`cache_get/put`).
- `tests/`: pytest-Suite (siehe „Lokal testen“), läuft in GitHub Actions (`.github/workflows/test.yml`); `tests/e2e/` sind Playwright-Browser-Tests (übersprungen, wenn Playwright fehlt). `lint.yml` prüft das Add-on mit dem HA-Linter, `build.yml` baut Images bei Versions-Tags (siehe README, „Fertige Images“; `image:` in `config.yaml` erst setzen, wenn die Images existieren).
- `mydiet/app/static/vendor/zxing.min.js`: ZXing (Apache-2.0) als Barcode-Rückfall, wird nur bei Bedarf nachgeladen.
- `mydiet/app/static/`: `app.js` (Vanilla-JS-SPA, Helfer `h()`, `api()`, `send()`, Dialoge über `setDlg`/`dlg.showModal()`), `style.css`, `index.html`.
- `README.en.md` und `mydiet/CHANGELOG.en.md`: englische Fassungen; bei jedem Release mitpflegen. Screenshots unter `docs/screenshots/{de,en}` erzeugt `python docs/make_screenshots.py` (Playwright, Beispieldaten, nach größeren UI-Änderungen neu erzeugen).
- `docs/de/` und `docs/en/`: die Anleitungen, eine Seite je Thema mit Schritt-für-Schritt-Anleitung, in beiden Sprachen mit gleichen Dateinamen (Einstieg: `README.md`). `mydiet/DOCS.md` ist nur der Tab im HA-Add-on und verlinkt (absolute GitHub-Links) dorthin. Beschriftungen in den Anleitungen so schreiben, wie sie in der Oberfläche stehen (englisch: wie in `EN`). `tests/test_docs.py` prüft Dateipaare, Links und Anker.
- `roadmap.md`: Ideenliste. Erledigtes wird dort **gelöscht** und steht im Changelog.

## Konventionen

- **Einträge sind Schnappschüsse** (Name, Gramm, kcal, Makros, optionale Nährwerte); kein `food_id`. Schnelleingaben haben `grams = 0`. Gespeicherte Mahlzeiten speichern ebenfalls Schnappschüsse.
- **Neue Funktionen als Option**, wenn sie nicht jeder braucht: Pref `features` (`FEATURES` in `extras.py`), Prüfung mit `feature_on(owner, name)`, Schalter in Einstellungen → Zusatzfunktionen (`feat(...)` in `app.js`), Frontend-Zustand `state.features`. Standard: aus.
- Benutzer = `X-Remote-User-Id` (HA-Ingress), sonst `default`. Alle Abfragen filtern nach `owner`.
- Relative URLs im Frontend (Ingress). Keine externen Ressourcen laden.
- Der Windows-95-Look (`html[data-skin="win"]`) in `style.css` muss bei neuer Oberfläche mitgepflegt werden.
- Neue Spalten oder Tabellen: Schema in `db.py` (`SCHEMA`, nur für frische Datenbanken) **und** eine neue Migrationsfunktion am Ende von `db.MIGRATIONS` (Spalten per `_add`, Indizes `IF NOT EXISTS`); Export (`dump`) und Import (`import_json`) in `extras.py` erweitern, wenn Nutzerdaten betroffen sind.
- Tabellenspalten im Tagebuch und in der Tagesübersicht teilen sich dieselben Breiten (`.diary`, `table.summary`); beim Ändern beide anfassen.

## Lokal testen

```bash
pip install fastapi httpx pydantic uvicorn pytest
python -m pytest            # gesamte Suite (Backend, Migrationen, Import, Trigger, Frontend-Konsistenz)
cd mydiet/app
MYDIET_DB=/tmp/t.db python -m uvicorn main:app --port 8099
```

- Backend: neue Funktionen bekommen Tests in `tests/` (Fixture `user(...)` liefert einen frischen HA-Benutzer, `app_module` die App; Internet und HA werden mit `monkeypatch` ersetzt). `MYDIET_DB` zeigt in den Tests auf eine temporäre Datei.
- Browser-Tests: `pip install playwright && python -m playwright install chromium`, dann läuft `python -m pytest` auch `tests/e2e`.
- Frontend: `node --check mydiet/app/static/app.js`, dann im Browser gegen den lokalen Server prüfen. Ohne `SUPERVISOR_TOKEN` sind HA-Funktionen (Trigger, Sensoren, Erinnerung) inaktiv; die lassen sich nur im echten HA testen und müssen im Bericht als ungeprüft benannt werden.
- Vor dem Neustart des Testservers den alten beenden (auf Windows bleiben uvicorn-Prozesse stehen und liefern sonst alten Code).

## Release-Ablauf (nach jedem Stapel)

1. `mydiet/config.yaml`: Version erhöhen.
2. `mydiet/CHANGELOG.md`: neuer Abschnitt oben (Neu / Geändert / Behoben).
3. `roadmap.md`: Erledigtes entfernen, Neues ergänzen. `docs/de` und `docs/en` (je Seite beide Sprachen) bei neuen Optionen, Sensoren, Schnittstellen oder Bedienschritten; `mydiet/DOCS.md` nur, wenn sich Optionen oder Seiten ändern. `python -m pytest` muss grün sein.
4. Commit (englische Betreffzeile, `v<Version>: ...`), `git push` nach `Schumey/MyDietAssistant`, Branch `main`.
4a. Für fertige Images (nur wenn `image:` aktiv ist): `git tag v<Version>` und `git push --tags`, danach die Actions abwarten.
5. **Nicht mehr per Samba einspielen:** Der Nutzer installiert das Add-on aus der App-Version (Repository/Images); nichts nach `\\homeassistant\addons\mydiet` kopieren.
6. Dem Nutzer sagen, dass er in HA „Nach Updates suchen“ anstoßen und das Add-on aktualisieren muss. Änderungen an `config.yaml` (Optionen, `map`) greifen nur nach einem Neubau.

## Stolperfallen

- Große Bash-Heredocs brechen auf diesem Windows-Setup ab: Skripte mit dem Write-Werkzeug als Datei anlegen und ausführen. Auch Python-Heredocs mit Backslashes (`
`, Regex) verlieren oder verfälschen sie: für solche Änderungen das Edit-Werkzeug nehmen.
- Bei Textersetzungen in `app.js` prüfen, welche Stelle getroffen wurde: `editSaved` und `editRecipe` sehen sich sehr ähnlich.
- Datenbank in HA: `/data/mydiet.db`; automatische Sicherungen: `/backup/mydiet/`.
- Trigger-Logik (`condition_met`, Haltedauer über HA `last_changed`, Zeitfenster über Mitternacht) hängt an HA-Zeitstempeln; Zeitzone wird beim Start aus HA gelesen.
