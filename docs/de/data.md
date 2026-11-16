# Daten, Import und Sicherung

[← Übersicht](README.md)

Alle Funktionen hier betreffen nur Dein Benutzerkonto, auch Export und Import.

## Wo liegen die Daten?

- Datenbank: `/data/mydiet.db` im Add-on-Speicher, enthalten in jedem normalen Home-Assistant-Backup.
- Automatische Sicherungen (ZIP): `/backup/mydiet/` (im Samba-Share „backup“ sichtbar).
- Vor einer Migration legt das Add-on eine Kopie `mydiet.db.v<alte Version>.bak` neben der Datenbank ab.
- Fortschrittsfotos liegen als Dateien im Add-on und sind nicht Teil der Sicherung (aber des Home-Assistant-Backups).

## Eine Sicherung anlegen

**Manuell als Datei:**

1. Öffne *Einstellungen → Daten*.
2. Tippe auf **Sicherung (ZIP)**. Der Browser lädt ein Archiv mit Deinen Daten herunter: Ernährung und, wenn eingeschaltet, Training. Eine einzelne JSON-Datei gibt es weiter über **Sicherung (JSON)**.
3. **Für Admins:** Unter *Einstellungen → Benutzerverwaltung* sichert **Alle Benutzer sichern (ZIP)** die Daten aller Benutzer in einem Archiv.

**Automatisch:**

1. Öffne die Add-on-Konfiguration und schalte `auto_backup` ein (Standard). Mit `backup_keep_days` bestimmst Du, wie lange Dateien aufbewahrt werden (Standard 14 Tage).
2. Das Add-on legt täglich eine Sicherung (ZIP) je Benutzer in `/backup/mydiet/` ab. Sie enthält Ernährung und Training.
3. Unter *Einstellungen → Automatische Sicherung* siehst Du die letzten Sicherungen. **Jetzt sichern** legt sofort eine an.

Die Sicherung enthält Einträge, Lebensmittel, Mahlzeiten, Gewicht, Trigger (Aktionen und Mahlzeiten-Regeln), alle Einstellungen (Zusatzfunktionen, Stufenplan, Mikronährstoff-Ziele, Wochenbericht, Erinnerung, Optik und mehr) und die Mealie-Adresse. Dazu kommen die Trainingsdaten (Pläne, Workouts, Übungen, Studios, Einstellungen). Nicht enthalten sind der Trigger-Verlauf, Fortschrittsfotos, der Mealie-Token und der Anzeigename.

## Daten löschen

Unter *Einstellungen → Daten* öffnet **Daten löschen …** eine Auswahl: **Tagebuch**, **Lebensmittel**, **Gespeicherte Mahlzeiten**, **Rezepte**, **Gewicht und Körpermaße**, **Tagesziele** und **Trigger**. Hinter jedem Bereich steht, wie viele Einträge er enthält.

1. Lege vorher eine Sicherung an (siehe oben).
2. Hake die Bereiche an, die weg sollen, und tippe auf **Endgültig löschen**.
3. Bestätige die Rückfrage. Erst dann wird gelöscht, unwiderruflich.

Nur Dein Konto ist betroffen; andere Benutzer und Deine Einstellungen bleiben unberührt. Beim Löschen der Lebensmittel bleiben Tagebucheinträge erhalten (sie sind Schnappschüsse); beim Löschen der Rezepte verschwinden auch die Lebensmittel, die für sie angelegt wurden.

## Eine Sicherung wiederherstellen

1. Öffne *Einstellungen → Automatische Sicherung* und tippe bei einer Sicherung auf **Wiederherstellen**. Oder tippe unter *Einstellungen → Daten* auf **Sicherung einspielen** und wähle eine ZIP- oder JSON-Datei. Ein Archiv mit mehreren Benutzern öffnet Deinen eigenen Teil.
2. Die Vorschau **Sicherung wiederherstellen** vergleicht **Jetzt** und **Sicherung** (Einträge, Tage, Lebensmittel, Mahlzeiten, Gewichtswerte, Workouts, Zeitraum).
3. Enthält die Sicherung Training, wählst Du unter **Was soll wiederhergestellt werden?** **Ernährung**, **Training** oder beides. Der abgewählte Teil bleibt unverändert.
4. Prüfe die Zahlen. Mit **Ersetzen** werden die gewählten Daten Deines Kontos durch die Sicherung ersetzt, mit **Abbrechen** passiert nichts.
5. Nach dem Einspielen auf einer frischen Installation musst Du den Mealie-Token neu eintragen.

Ältere Sicherungen (JSON, ohne Trigger oder ohne Training) lassen sich weiter einspielen.

**Als Admin alle Benutzer wiederherstellen:** *Einstellungen → Benutzerverwaltung → Alle Benutzer wiederherstellen (ZIP)* und ein Archiv mit **Alle Benutzer sichern (ZIP)** wählen. Die Vorschau zeigt je Benutzer, was jetzt da ist und was die Sicherung enthält (Einträge, Lebensmittel, Workouts). **Alle ersetzen** stellt jeden Benutzer unter seiner eigenen Kennung wieder her. Ein Archiv aus einer anderen Installation passt nur, wenn die Benutzerkennungen gleich sind.

## Aus anderen Apps importieren

### MyFitnessPal

1. Exportiere Deine Daten bei MyFitnessPal (CSV oder die ZIP-Datei des Dateiexports).
2. Öffne *Einstellungen → Daten* und tippe auf **MyFitnessPal-CSV importieren**.
3. Wähle die Datei (bei der ZIP-Datei: unverändert, ohne Entpacken; sie enthält nur Summen je Mahlzeit, Training wird nicht übernommen), korrigiere die Spaltenzuordnung und starte den Import (komplett oder nur Tagessummen + Gewicht).

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

Tipp: Lade vor dem Wiederherstellen mit **Sicherung (ZIP)** den aktuellen Stand herunter, bevor Du **Ersetzen** wählst. So kannst Du notfalls zurück.
