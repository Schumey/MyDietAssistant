# Changelog

Alle nennenswerten Änderungen am Add-on. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## 0.5.0

### Neu
- **NICHT-Bedingung** für Trigger und Einblend-Regeln, z. B. „calendar.schichtplan enthält nicht Frühschicht“ oder „Zustand ≠ Fitnessstudio“.

### Geändert
- „Als Mahlzeit speichern“ und „Kopieren“ sind ein gemeinsamer Button **Speichern / Kopieren** mit zwei Reitern im Dialog.
- „Mahlzeit leeren“ ist jetzt ein ✕ am rechten Rand der Mahlzeiten-Kopfzeile, analog zum Löschen einzelner Einträge.

## 0.4.0

### Neu
- **Mahlzeiten-Seite:** gespeicherte Mahlzeiten haben einen eigenen Reiter (Suchen, Bearbeiten, Kategorie, Trigger, Löschen).
- **Mahlzeiten kopieren:** Einträge einer Tagebuch-Mahlzeit lassen sich in eine andere Mahlzeit oder auf einen anderen Tag kopieren (mit Auswahl einzelner Einträge).
- **Mahlzeit leeren:** alle Einträge einer Tagebuch-Mahlzeit (bzw. des Tages im Zeitmodus) mit einem Klick löschen.
- **Häufig verwendet:** der Hinzufügen-Dialog schlägt oft genutzte Lebensmittel und Mahlzeiten vor, passend zur jeweiligen Tagebuch-Mahlzeit.
- **Mahlzeiten per Trigger einblenden:** eine Tagebuch-Mahlzeit (z. B. „Nachtschicht“) erscheint nur an Tagen, an denen ein Kalendertermin bzw. ein HA-Zustand zutrifft. Tage mit Einträgen bleiben immer sichtbar; ausgeblendete Mahlzeiten lassen sich per Klick einblenden.
- **MFP-Import (nur Tageswerte):** Nachfrage, ob die leeren Mahlzeiten an den importierten Tagen ausgeblendet werden sollen.
- **Statistik:** zusätzlich 180 Tage und 1 Jahr.

### Geändert
- Gewichtsdiagramm: gerade Gewichtswerte auf der Y-Achse, Zwischendaten auf der X-Achse.
- Gewichtsverlauf zeigt nur noch die letzten 10 Einträge, erweiterbar.

### Behoben
- In Dialogen erschien auf der Karte der Text „null“.

## 0.3.0

### Neu
- **Import/Export:** JSON-Sicherung (Wiederherstellung), CSV-Export und MyFitnessPal-CSV-Import (komplett oder nur Tageskalorien/Makros plus Gewicht).
- **Mahlzeiten speichern** aus dem Tagebuch und wieder hinzufügen (mit Portionsfaktor).
- **Kategorien** für Lebensmittel und Mahlzeiten (z. B. Diät/Bulk), ein-/ausblendbar.
- **Kalorienbilanz** aus Gewichtstrend und Aufnahme (Defizit/Überschuss, geschätzter Verbrauch).
- **Trigger:** HA-Zustand oder Kalendertermin trägt ein Lebensmittel/eine Mahlzeit einmal pro Tag ins Tagebuch ein.
- **Zeitansicht:** Tagebuch alternativ nach Uhrzeiten statt nach festen Mahlzeiten.

## 0.2.0

### Geändert
- Optik folgt dem aktiven HA-Theme deutlich genauer (Schriften, Buttons, Eingabefelder, Radien).

## 0.1.0

- Erste Version: Add-on mit Ingress-UI (FastAPI + SQLite), Mehrbenutzerbetrieb über HA-Benutzer, Ernährungstagebuch mit eigenen Mahlzeiten, Lebensmittel (inkl. Open-Food-Facts-Barcodesuche), Gewicht, Statistik, Tagesziele und HA-Sensoren.
