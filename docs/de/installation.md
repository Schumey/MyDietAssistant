# Installation

[← Übersicht](README.md)

## Voraussetzungen

- Home Assistant mit Add-on-Store (Home Assistant OS oder Supervised). Reine Container- oder Core-Installationen kennen keine Add-ons.
- Optional: die MQTT-Integration (nur für [MQTT Discovery](sensors.md#mqtt-discovery)) und ein Smartphone mit der Companion-App.

## Add-on installieren

1. Öffne in Home Assistant **Einstellungen → Add-ons → Add-on-Store**.
2. Tippe oben rechts auf **⋮ → Repositories** und füge `https://github.com/Schumey/MyDietAssistant` hinzu. Einfacher geht es mit dem Knopf „Repository hinzufügen“ in der [README](../../README.md).
3. Lade die Seite neu. Ganz unten erscheint **MyDietAssistant**. Öffne es und tippe auf **Installieren**.
4. Wenn die Installation fertig ist, tippe auf **Starten**.
5. Schalte **In Seitenleiste anzeigen** ein (und bei Bedarf **Beim Hochfahren starten** und **Watchdog**).
6. In der Seitenleiste erscheint der Eintrag **MyDietAssistant**. Öffne ihn: Du siehst das Tagebuch von heute.

Das erste Mal baut Home Assistant das Image selbst. Das kann einige Minuten dauern.

> Bei einem privaten Repository kopierst Du stattdessen den Ordner `mydiet` in das Verzeichnis `/addons` (Samba-Freigabe „addons“) und installierst das Add-on unter **Lokale Add-ons**.

## Add-on-Optionen

Die Optionen findest Du unter **Einstellungen → Add-ons → MyDietAssistant → Konfiguration**. Nach dem Speichern startet das Add-on neu.

| Option | Bedeutung | Standard |
|---|---|---|
| `default_kcal_goal` | Kalorienziel, solange Du noch keins eingestellt hast | 2000 |
| `publish_sensors` | Sensoren in Home Assistant setzen, siehe [Sensoren](sensors.md) | an |
| `mqtt_discovery` | Sensoren über MQTT Discovery anlegen (eindeutige IDs) | aus |
| `auto_backup` | täglich eine JSON-Sicherung je Benutzer nach `/backup/mydiet/` | an |
| `backup_keep_days` | wie viele Tage Sicherungen aufbewahrt werden (1 bis 365) | 14 |
| `api_key` | Schlüssel für die [Schnittstelle](api.md); leer = Schnittstelle aus | leer |
| `usda_api_key` | eigener Schlüssel für USDA FoodData Central (kostenlos auf api.data.gov) | leer |
| `admin_users` | Liste von Benutzer-IDs oder Namen mit Zugriff auf die [Benutzerverwaltung](household.md#benutzerverwaltung); leer = der erste Benutzer, der das Add-on geöffnet hat | leer |

Die Beschriftungen der Optionen gibt es auf Deutsch und Englisch.

## Aktualisieren

1. Öffne **Einstellungen → Add-ons → Add-on-Store**, tippe auf **⋮ → Nach Updates suchen**.
2. Öffne **MyDietAssistant** und tippe auf **Aktualisieren**.
3. Die Änderungen der Version stehen im [CHANGELOG](../../mydiet/CHANGELOG.md). Lade die Seite danach einmal neu (in der Companion-App: App neu öffnen), falls der Browser eine alte Version zwischengespeichert hat.

Beim Start führt das Add-on alle fehlenden Datenbank-Migrationen aus. Vorher legt es eine Kopie `mydiet.db.v<alte Version>.bak` neben der Datenbank in `/data` ab. Änderungen an den Optionen oder an `config.yaml` (zum Beispiel neue Optionen) greifen erst nach einem Neubau; das Add-on-Update erledigt das.

## Wo liegen die Daten?

- Datenbank: `/data/mydiet.db` im Add-on-Speicher. Sie ist in jedem normalen Home-Assistant-Backup enthalten.
- Automatische JSON-Sicherungen: `/backup/mydiet/`, im Samba-Share „backup“ sichtbar.
- Fortschrittsfotos liegen als Dateien im Add-on und sind nicht Teil der JSON-Sicherung.

Mehr dazu unter [Daten, Import und Sicherung](data.md).

## Fertige Images (für Entwickler)

Standardmäßig baut Home Assistant das Add-on bei der Installation selbst. Der Workflow `.github/workflows/build.yml` kann stattdessen fertige Images (amd64, aarch64) in die GitHub Container Registry legen:

1. `mydiet/config.yaml`: Version erhöhen und committen.
2. `git tag v<Version>` und `git push --tags` (die Version muss der in `config.yaml` entsprechen). Alternativ von Hand unter GitHub → Actions → „Build images“.
3. Nach dem Lauf die Pakete `mydiet-amd64` und `mydiet-aarch64` unter GitHub → Packages auf **öffentlich** stellen.
4. In `mydiet/config.yaml` die Zeile `image: ghcr.io/schumey/mydiet-{arch}` ergänzen.

Die Zeile erst setzen, wenn die Images der jeweiligen Version existieren, sonst scheitert die Installation.

Weiter mit den [Ersten Schritten](first-steps.md).
