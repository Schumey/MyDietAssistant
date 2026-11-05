# Installation

[← Übersicht](README.md)

> **Begriffe:** Seit Home Assistant 2026.2 heißen Add-ons **Apps**. MyDietAssistant ist eine solche App. Der **Marketplace** (seit 2026.11, Nachfolger von HACS) ist etwas anderes: Er installiert Integrationen, Dashboard-Karten, Themes und Vorlagen, aber keine Apps. MyDietAssistant findest Du deshalb nicht im Marketplace, sondern im App-Store.

## Voraussetzungen

- Home Assistant OS (oder Supervised) mit App-Store. Reine Container- oder Core-Installationen kennen keine Apps.
- Optional: die MQTT-Integration (nur für [MQTT Discovery](sensors.md#mqtt-discovery)) und ein Smartphone mit der Companion-App oder der [Android-App](android.md).

## App installieren

1. Am einfachsten tippst Du auf den Knopf „Repository hinzufügen“ in der [README](../../README.md). Er öffnet Deine Home-Assistant-Instanz und trägt das Repository ein.
2. Von Hand: Öffne in Home Assistant **Einstellungen → Apps → App installieren**, tippe oben rechts auf **⋮ → Repositories** und füge `https://github.com/Schumey/MyDietAssistant` hinzu.
3. Lade die Seite neu. Ganz unten erscheint **MyDietAssistant**. Öffne es und tippe auf **Installieren**.
4. Wenn die Installation fertig ist, tippe auf **Starten**.
5. Schalte **In Seitenleiste anzeigen** ein (und bei Bedarf **Beim Hochfahren starten** und **Watchdog**).
6. In der Seitenleiste erscheint der Eintrag **MyDietAssistant**. Öffne ihn: Du siehst das Tagebuch von heute.

Das erste Mal baut Home Assistant das Image selbst. Das kann einige Minuten dauern.

> Bei einem privaten Repository kopierst Du stattdessen den Ordner `mydiet` in das Verzeichnis `/addons` (Samba-Freigabe „addons“) und installierst die App unter **Lokale Apps**.

## App-Optionen

Die Optionen findest Du unter **Einstellungen → Apps → MyDietAssistant → Konfiguration**. Nach dem Speichern startet die App neu.

| Option | Bedeutung | Standard |
|---|---|---|
| `default_kcal_goal` | Kalorienziel, solange Du noch keins eingestellt hast | 2000 |
| `publish_sensors` | Sensoren in Home Assistant setzen, siehe [Sensoren](sensors.md) | an |
| `mqtt_discovery` | Sensoren über MQTT Discovery anlegen (eindeutige IDs) | aus |
| `auto_backup` | täglich eine JSON-Sicherung je Benutzer nach `/backup/mydiet/` | an |
| `backup_keep_days` | wie viele Tage Sicherungen aufbewahrt werden (1 bis 365) | 14 |
| `api_key` | Schlüssel für die [Schnittstelle](api.md); leer = Schnittstelle aus | leer |
| `usda_api_key` | eigener Schlüssel für USDA FoodData Central (kostenlos auf api.data.gov) | leer |
| `admin_users` | Liste von Benutzer-IDs oder Namen mit Zugriff auf die [Benutzerverwaltung](household.md#benutzerverwaltung); leer = der erste Benutzer, der die App geöffnet hat | leer |

Die Beschriftungen der Optionen gibt es in allen Sprachen der Oberfläche.

## Aktualisieren

1. Neue Versionen erscheinen unter **Einstellungen → Updates**. Wenn dort noch nichts steht: **Einstellungen → Apps → App installieren → ⋮ → Nach Updates suchen**.
2. Öffne **MyDietAssistant** und tippe auf **Aktualisieren**. Mit **Automatisch aktualisieren** auf der App-Seite geht das ohne Dein Zutun.
3. Die Änderungen der Version stehen im [CHANGELOG](../../mydiet/CHANGELOG.md). Lade die Seite danach einmal neu (in der Companion-App: App neu öffnen), falls der Browser eine alte Version zwischengespeichert hat.

Beim Start führt die App alle fehlenden Datenbank-Migrationen aus. Vorher legt sie eine Kopie `mydiet.db.v<alte Version>.bak` neben der Datenbank in `/data` ab. Änderungen an den Optionen oder an `config.yaml` (zum Beispiel neue Optionen) greifen erst nach einem Neubau; das Update erledigt das.

Die [Android-App](android.md) wird getrennt aktualisiert (neue APK); für Änderungen an der Oberfläche reicht das Update der App in Home Assistant.

## Wo liegen die Daten?

- Datenbank: `/data/mydiet.db` im Speicher der App. Sie ist in jedem normalen Home-Assistant-Backup enthalten.
- Automatische JSON-Sicherungen: `/backup/mydiet/`, im Samba-Share „backup“ sichtbar.
- Fortschrittsfotos liegen als Dateien in der App und sind nicht Teil der JSON-Sicherung.

Mehr dazu unter [Daten, Import und Sicherung](data.md).

## Fertige Images (für Entwickler)

Standardmäßig baut Home Assistant die App bei der Installation selbst. Der Workflow `.github/workflows/build.yml` kann stattdessen fertige Images (amd64, aarch64) in die GitHub Container Registry legen:

1. `mydiet/config.yaml`: Version erhöhen und committen.
2. `git tag v<Version>` und `git push --tags` (die Version muss der in `config.yaml` entsprechen). Alternativ von Hand unter GitHub → Actions → „Build images“.
3. Nach dem Lauf die Pakete `mydiet-amd64` und `mydiet-aarch64` unter GitHub → Packages auf **öffentlich** stellen.
4. In `mydiet/config.yaml` die Zeile `image: ghcr.io/schumey/mydiet-{arch}` ergänzen.

Die Zeile erst setzen, wenn die Images der jeweiligen Version existieren, sonst scheitert die Installation.

Weiter mit den [Ersten Schritten](first-steps.md).
