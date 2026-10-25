# MyDietAssistant

Ernährungstagebuch pro HA-Benutzer (Ingress). Daten liegen in `/data/mydiet.db` und sind im HA-Backup enthalten.
*Food diary per Home Assistant user (ingress). Data lives in `/data/mydiet.db` and is part of the HA backup.*

Die ausführliche Anleitung mit Schritt-für-Schritt-Beschreibungen steht in einzelnen Seiten auf GitHub, auf Deutsch und Englisch. Die Links funktionieren auch in diesem Tab.
*The full step-by-step guide is split into separate pages on GitHub, in German and English.*

**[Deutsche Dokumentation](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/README.md)** · **[English documentation](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/README.md)**

## Schnellstart / Quick start

1. Add-on starten und **In Seitenleiste anzeigen** einschalten, dann **Ernährung** öffnen. / Start the add-on, turn on **Show in sidebar**, then open **Ernährung** (Nutrition).
2. Einstellungen → Tagesziele festlegen. / Set your goals under Settings → Daily goals.
3. Im Tagebuch **+ Nahrungsmittel hinzufügen**. / In the diary tap **+ Add food**.

Details: [Erste Schritte](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/first-steps.md) · [First steps](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/first-steps.md)

## Optionen / Options

| Option | Bedeutung / Meaning |
|---|---|
| `default_kcal_goal` | Kalorienziel, bis Du eins einstellst / calorie goal until you set one |
| `publish_sensors` | Sensoren in Home Assistant setzen / publish sensors |
| `mqtt_discovery` | Sensoren über MQTT Discovery anlegen / create sensors via MQTT discovery |
| `auto_backup` | täglich JSON-Sicherung nach `/backup/mydiet/` / daily JSON backup |
| `backup_keep_days` | Aufbewahrung in Tagen (Standard 14) / retention in days |
| `api_key` | Schlüssel für die Schnittstelle; leer = aus / key for the interface; empty = off |
| `usda_api_key` | eigener USDA-Schlüssel (optional) / your own USDA key (optional) |
| `admin_users` | Administratoren der Benutzerverwaltung / administrators |

Erklärungen / Details: [Installation](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/installation.md#add-on-optionen) · [Installation (EN)](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/installation.md#add-on-options)

## Anleitungen

| Thema | Deutsch | English |
|---|---|---|
| Installation | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/installation.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/installation.md) |
| Erste Schritte / First steps | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/first-steps.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/first-steps.md) |
| Tagebuch / Diary | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/diary.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/diary.md) |
| Lebensmittel / Foods | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/foods.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/foods.md) |
| Barcode-Scanner | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/barcode.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/barcode.md) |
| Rezepte / Recipes | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/recipes.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/recipes.md) |
| Gewicht / Weight | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/weight.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/weight.md) |
| Ziele und Statistik / Goals and statistics | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/goals-and-stats.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/goals-and-stats.md) |
| Aktivität / Activity | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/activity.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/activity.md) |
| Mahlzeiten-Zeitplan / Meal schedule | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/schedule.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/schedule.md) |
| Mahlzeiten-Vorschläge / Meal suggestions | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/suggestions.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/suggestions.md) |
| Haushalt und Benutzer / Household and users | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/household.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/household.md) |
| Sensoren / Sensors (MQTT) | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/sensors.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/sensors.md) |
| Trigger / Triggers | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/triggers.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/triggers.md) |
| Schnittstelle und Erinnerung / Interface and reminder | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/api.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/api.md) |
| Daten, Import, Sicherung / Data, import, backup | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/data.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/data.md) |
| Einstellungen / Settings | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/settings.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/settings.md) |
| Fehlersuche / Troubleshooting | [Seite](https://github.com/Schumey/MyDietAssistant/blob/main/docs/de/troubleshooting.md) | [page](https://github.com/Schumey/MyDietAssistant/blob/main/docs/en/troubleshooting.md) |

Änderungen je Version / Changes per version: [CHANGELOG](https://github.com/Schumey/MyDietAssistant/blob/main/mydiet/CHANGELOG.md) · [CHANGELOG (EN)](https://github.com/Schumey/MyDietAssistant/blob/main/mydiet/CHANGELOG.en.md)
