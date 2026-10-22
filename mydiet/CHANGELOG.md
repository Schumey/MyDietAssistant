# Changelog

Alle nennenswerten Änderungen am Add-on. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## 0.7.1

### Behoben
- Leerzeichen zwischen Zahl und Text im Knopf „n leere/ausgeblendete Mahlzeit(en) anzeigen“.
- Die Trigger-Prüfung läuft jetzt in einem eigenen Hintergrund-Thread statt über einen Startup-Hook, der je nach FastAPI-Version nicht mehr ausgeführt wird.

### Neu
- **Diagnose für Trigger:** Einstellungen → Trigger → „Jetzt prüfen“ führt die Prüfung sofort aus und zeigt Ergebnis bzw. Fehler an; dieselben Meldungen stehen im Add-on-Protokoll.

## 0.7.0

### Neu
- **Trigger bearbeiten:** Trigger und Einblend-Regeln lassen sich per ✎ ändern.
- **Mahlzeiten ausblenden (⊘):** Mahlzeiten erscheinen dann nur noch an Tagen mit Einträgen und werden nicht mehr als Kopierziel angeboten – z. B. für „MyFitnessPal (Tagessumme)“ aus dem Import. Die durch einen Tageswerte-Import angelegte Mahlzeit wird automatisch ausgeblendet.

### Geändert
- Das ✕ zum Leeren einer Mahlzeit sitzt wieder in der Summenzeile (bei den Makros der Mahlzeit) statt in der Titelzeile.

## 0.6.0

### Neu
- **Tage im Voraus:** Kalender-Trigger tragen ihr Lebensmittel bzw. ihre Mahlzeit auf Wunsch schon für die nächsten N Tage ein (Einstellung pro Trigger, 0–60), sobald dort ein passender Termin steht. Jeder Tag wird nur einmal befüllt; Einträge für künftige Tage haben keine Uhrzeit.

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
