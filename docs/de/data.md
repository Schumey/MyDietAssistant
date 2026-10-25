# Daten, Import und Sicherung

[← Übersicht](README.md)

Alle Funktionen hier betreffen nur Dein Benutzerkonto, auch Export und Import.

## Wo liegen die Daten?

- Datenbank: `/data/mydiet.db` im Add-on-Speicher, enthalten in jedem normalen Home-Assistant-Backup.
- Automatische JSON-Sicherungen: `/backup/mydiet/` (im Samba-Share „backup“ sichtbar).
- Vor einer Migration legt das Add-on eine Kopie `mydiet.db.v<alte Version>.bak` neben der Datenbank ab.
- Fortschrittsfotos liegen als Dateien im Add-on und sind nicht Teil der JSON-Sicherung.

## Eine Sicherung anlegen

**Manuell als Datei:**

1. Öffne *Einstellungen → Daten*.
2. Tippe auf **Sicherung (JSON)**. Der Browser lädt die Datei herunter.

**Automatisch:**

1. Öffne die Add-on-Konfiguration und schalte `auto_backup` ein (Standard). Mit `backup_keep_days` bestimmst Du, wie lange Dateien aufbewahrt werden (Standard 14 Tage).
2. Das Add-on legt täglich eine JSON-Sicherung je Benutzer in `/backup/mydiet/` ab.
3. Unter *Einstellungen → Automatische Sicherung* siehst Du die letzten Sicherungen. **Jetzt sichern** legt sofort eine an.

Die JSON-Sicherung enthält Einträge, Lebensmittel, Mahlzeiten, Gewicht, Trigger (Aktionen und Mahlzeiten-Regeln), Zusatzfunktions-Einstellungen, Erinnerung, Optik, die Mealie-Adresse und mehr. Nicht enthalten sind der Trigger-Verlauf, Fortschrittsfotos und der Mealie-Token.

## Eine Sicherung wiederherstellen

1. Öffne *Einstellungen → Automatische Sicherung* und tippe bei einer Sicherung auf **Wiederherstellen**. Oder tippe unter *Einstellungen → Daten* auf **Sicherung einspielen** und wähle eine JSON-Datei.
2. Die Vorschau **Sicherung wiederherstellen** vergleicht **Jetzt** und **Sicherung** (Einträge, Tage, Lebensmittel, Mahlzeiten, Gewichtswerte, Zeitraum).
3. Prüfe die Zahlen. Mit **Ersetzen** werden alle jetzigen Daten Deines Kontos durch die Sicherung ersetzt, mit **Abbrechen** passiert nichts.
4. Nach dem Einspielen auf einer frischen Installation musst Du den Mealie-Token neu eintragen.

Ältere Sicherungen (ohne Trigger) lassen sich weiter einspielen.

## Aus anderen Apps importieren

### MyFitnessPal

1. Exportiere Deine Daten bei MyFitnessPal als CSV.
2. Öffne *Einstellungen → Daten* und tippe auf **MyFitnessPal-CSV importieren**.
3. Wähle die Datei, korrigiere die Spaltenzuordnung und starte den Import (komplett oder nur Tagessummen + Gewicht).

### Cronometer, FDDB, Yazio, Google Fit und ähnliche Tabellen

1. Öffne *Einstellungen → Daten → Weitere Importe …*.
2. Wähle **CSV aus einer anderen App → Datei wählen** (z. B. `servings.csv`, `biometrics.csv`).
3. Die Spalten werden anhand der Überschriften erkannt. Korrigiere sie in der Vorschau und importiere.

### Apple Health

1. Exportiere in der Health-App: Profil → Gesundheitsdaten exportieren. Du erhältst `export.zip`.
2. Öffne *Einstellungen → Daten → Weitere Importe …* und wähle bei **Apple Health** die Datei (`export.zip` oder `export.xml`).
3. Die Datei wird direkt im Browser gelesen; hochgeladen werden nur die Tageswerte.

### Lebensmittel-Tabelle

Nährwerttabellen wie BLS, CIQUAL oder die Schweizer Nährwertdatenbank: siehe [Lebensmittel](foods.md#tabelle-importieren).

Der Import betrifft nur Dein Konto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.

## Bericht für Berater und Trainer

1. Öffne *Einstellungen → Export für Berater und Trainer*.
2. Wähle **Von** und **Bis**.
3. Hake optional **Einzelne Einträge im Bericht auflisten** an.
4. **Bericht öffnen (Drucken / PDF)** öffnet einen Bericht. Im Druckdialog wählst Du „Als PDF speichern“.
5. **Tagesübersicht (CSV)** lädt eine Tabelle mit den Tageswerten.

Enthalten ist nur der gewählte Zeitraum.

## Tagebuch als CSV

*Einstellungen → Daten → Tagebuch als CSV* lädt alle Einträge als Tabelle.

## Datenbank und Updates

Die Datenbank trägt eine Versionsnummer (`PRAGMA user_version`). Beim Start laufen alle fehlenden Migrationen der Reihe nach. Für große Datenmengen (viele Jahre Tagebuch, importierte Lebensmitteltabellen) gibt es Indizes; die Lebensmittelliste lädt seitenweise und sucht auf dem Server.

Tipp: Lade vor dem Wiederherstellen mit **Sicherung (JSON)** den aktuellen Stand herunter, bevor Du **Ersetzen** wählst. So kannst Du notfalls zurück.
