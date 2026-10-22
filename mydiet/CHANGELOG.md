# Changelog

Alle nennenswerten Änderungen am Add-on. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## 0.16.0

### Neu
- **Mehrere Bedingungen pro Trigger:** Im Trigger-Dialog „+ Weitere Bedingung“ (Zustand oder Kalender, auch „ist NICHT“). Verknüpfung wahlweise UND (alle müssen zutreffen, z. B. Kalender „Nachtschicht“ UND Person zu Hause) oder ODER. Zeitfenster gilt für den ganzen Trigger. Für im Voraus geplante Kalendertage zählen nur Kalender-Bedingungen.
- **Tagesziel-Profile** (Zusatzfunktion „Tagesziele pro Wochentag“): Profile wie „Training“ und „Ruhetag“ mit eigenen kcal/Makros (inkl. Kalorienrechner). Ein Trigger kann mit „Dann: Tagesziel wechseln“ den Tag auf ein Profil schalten, z. B. wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel, Tagebuch und Statistik zeigen es an; der Verlauf bietet „Rückgängig“.
- Sicherung enthält Tagesziel-Profile und deren Zuordnung zu Tagen.

## 0.15.0

### Neu
- **Trigger pausieren:** ⏸ am Trigger, wahlweise heute, 3 Tage, 1 Woche, 30 Tage oder bis zu einem Datum. Der Trigger behält seine Einstellungen und läuft danach von selbst weiter; ▶▶ beendet die Pause früher. (Der Haken „Aktiv“ bleibt für dauerhaftes Abschalten.)
- **Portionsgrößen:** Pro Lebensmittel lassen sich benannte Portionen hinterlegen („1 Scheibe = 40 g“). Beim Hinzufügen und Tauschen gibt es dann die Auswahl „Anzahl × Portion“, die Menge in Gramm folgt automatisch.
- **Weitere Nährwerte** (Zusatzfunktion, Einstellungen → Zusatzfunktionen): Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln, Einträgen, gespeicherten Mahlzeiten und in der Sicherung. Open Food Facts liefert sie beim Barcode-Abruf mit. Tagessumme im Tagebuch, Tagesdurchschnitt in der Statistik.
- `CLAUDE.md` mit Projektüberblick, Konventionen und Release-Ablauf.

### Geändert
- Gespeicherte Mahlzeiten behalten beim Bearbeiten die weiteren Nährwerte.

## 0.14.1

### Neu
- **Tagesziele als Rechner:** Mit „Kalorien aus Makros berechnen“ (Einstellungen → Tagesziele) ändern sich die Kalorien, sobald Eiweiß, Kohlenhydrate oder Fett geändert werden (4/4/9 kcal pro g). Dazu die prozentuale Verteilung. Gilt auch für die Wochentagsziele. Ausgeschaltet zeigt ein Hinweis, wenn die Makros nicht zu den Kalorien passen.

### Behoben
- Statistik: Die Kalorien-Achse (Y) zeigt jetzt runde Werte (z. B. 0, 500, 1.000 …) statt krummer Zwischenwerte.

## 0.14.0

### Neu
- **Notizen** im Tagebuch: Freitext pro Tag und pro Mahlzeit (Hunger, Training, Stimmung); in der Sicherung enthalten.
- **Tastaturbedienung:** ← / → Tag wechseln, T heute, N hinzufügen, / Suche fokussieren.
- **Automatische Sicherung:** täglich eine JSON-Sicherung nach `/backup/mydiet/` mit einstellbarer Aufbewahrung (`auto_backup`, `backup_keep_days`); Liste und „Jetzt sichern“ in den Einstellungen.
- **Wiederherstellung mit Vorschau:** vor dem Einspielen (Datei oder automatische Sicherung) werden jetzt-Zustand und Sicherung gegenübergestellt.
- **Schnittstelle für Automationen** (`api_key`): `POST /api/ext/entry` und `/api/ext/weight`, z. B. per `rest_command` (Beispiele in DOCS.md).
- **Erinnerung:** Benachrichtigung über einen HA-Notify-Dienst, wenn bis zur Uhrzeit nichts eingetragen wurde.
- **Trigger-Fehler** werden dauerhaft im Trigger-Bereich der Einstellungen angezeigt.
- **Zeitzone** wird beim Start aus Home Assistant übernommen.

### Geändert
- Tabellenköpfe im Tagebuch schlanker: keine dicken Farbbalken mehr, nur kleine Beschriftung über einer feinen Linie.
- Neue Add-on-Option `backup`-Zugriff (`map: backup`); nach dem Update das Add-on neu bauen, damit der Zugriff gilt.

## 0.13.0

### Neu
- **Bericht & Zeitraum-Vergleich** (Statistik): Durchschnitt, Eiweißziel- und Kalorienziel-Tage, bester/schwächster Tag und Gewichtsänderung für einen Zeitraum, auf Wunsch neben einem zweiten Zeitraum mit Differenz. Schnellwahl „7 Tage vs. davor“ (Wochenbericht) und „30 Tage vs. davor“, Zeiträume frei wählbar (z. B. Diätphase 1 gegen 2).

## 0.12.1

### Geändert
- Tagesübersicht im Tagebuch: Spalten stehen jetzt exakt unter denen der Mahlzeiten, Reihenfolge Tagesziel, Gesamt, Verbleibend.

## 0.12.0

### Neu
- **Ganzen Tag kopieren:** Im Tagebuch unter der Tagessumme; alle Einträge samt Mahlzeit und Uhrzeit auf einen anderen Tag, optional mit Mengenfaktor.
- **Gespeicherte Mahlzeit kopieren** (⧉ in der Mahlzeitenliste): legt „… (Kopie)“ an und öffnet sie gleich zum Bearbeiten – ideal für Varianten mit getauschten Komponenten.
- **Wasser & Ergänzungen in der Statistik:** Ø pro Tag, eingetragene Tage und Tage mit erreichtem Ziel für den gewählten Zeitraum (nur mit aktivierter Zusatzfunktion).

## 0.11.0

### Neu
- **Uhrzeit-Trigger:** trägt täglich zu einer festen Zeit ein („täglich 07:30 Vitamine“), ganz ohne HA-Entität.
- **Zeitfenster und Haltedauer für Trigger:** Trigger können auf eine Tageszeit beschränkt werden (auch über Mitternacht). Zustands-Trigger tragen optional erst ein, wenn der Zustand seit X Minuten anliegt (z. B. seit 20 Minuten im Fitnessstudio).
- **Trigger-Verlauf** (Einstellungen): Liste, wann welcher Trigger was eingetragen hat, mit „Rückgängig“. Der Trigger trägt an diesem Tag nicht erneut ein.
- **Favoriten:** Lebensmittel mit ☆ markieren, eigener Reiter „★ Favoriten“ im Hinzufügen-Dialog.
- **Duplikate zusammenführen** (Lebensmittel → Duplikate suchen): gleiche Namen erkennen, eines behalten, Trigger werden umgehängt.
- **Mehr Sensoren:** `kcal_remaining_today`, `kcal_week_avg`, `weight_trend` und `energy_balance` (siehe DOCS.md, dort auch eine fertige Dashboard-Karte).

## 0.10.0

### Neu
- **Mouse-over in den Diagrammen:** Beim Überfahren (bzw. Antippen) eines Balkens oder Messpunkts erscheinen Datum und genaue Werte (kcal, Ziel, Makros bzw. Gewicht und Trend).
- **Zusatzfunktionen** (Einstellungen → Zusatzfunktionen), standardmäßig aus und einzeln aktivierbar:
  - *Tagesziele pro Wochentag* (kcal und Makros je Wochentag; Tagebuch und Statistik nutzen das Ziel des jeweiligen Tages).
  - *Wasser und Nahrungsergänzung* (Wasser, Koffein, Kreatin vorbelegt; eigene Einträge mit Einheit, Tagesziel und Schrittweite; +/− Knöpfe im Tagebuch).
- **Mahlzeiten bearbeiten:** Gespeicherte Mahlzeiten lassen sich komponentenweise ändern (Menge, Lebensmittel tauschen ⇄, Komponente entfernen oder hinzufügen). Im Tagebuch gibt es beim Bearbeiten eines Eintrags „Lebensmittel tauschen“.
- **Schnelleingabe:** Eintrag nur mit Name, kcal und optional Makros (Hinzufügen-Dialog), nachträglich bearbeitbar.
- **Plausibilitätsprüfung:** Warnhinweis, wenn kcal nicht zu den Makros passen (Lebensmittel-Formular, ⚠ in der Liste, Schnelleingabe). Speichern bleibt möglich.
- **Gewichtstrend:** geglättete Trendlinie (Tagesschwankungen ausgeblendet), Trend-Kachel und **Prognose** für das Zielgewicht.

### Geändert
- Statistik: Achsenbeschriftung auf runden Daten (5er-Schritte, 1./15., Monatsanfänge) statt gleichmäßig verteilter Tage.
- Sicherung (JSON) enthält Wochentagsziele, Tracker und Zusatzfunktionen.

## 0.9.2

### Behoben
- Windows-Look: gleichmäßige Abstände zwischen den Reitern.

## 0.9.1

### Behoben
- Windows-Look: Rot/Grün bei „Verbleibend“ wurde überdeckt; feststehende Leiste mit grauem Streifen unter den Reitern, damit Inhalt nicht darunter hervorschaut.
- Einstellungen → Darstellung: Hinweistext stand unter „Optik“ statt unter „Tagebuch“.

## 0.9.0

### Neu
- **Kalender-Trigger mit Termin-Zeitraum:** Eintrag wahlweise an jedem Tag des Termins, nur am Starttag oder nur am Endtag (z. B. Nachtschicht Do 22 Uhr bis Fr 6 Uhr nur am Freitag). Gilt auch für die Einblend-Regeln von Mahlzeiten.
- Windows-Look: Benutzer-Icon in der Titelleiste, Fortschrittsbalken als Ladebalken aus Blöcken, rote/grüne Schrift bei den verbleibenden Werten, türkiser Desktop-Hintergrund.

### Behoben
- Windows-Look: doppelter Rahmen um den Reiterbereich entfernt.

## 0.8.1

### Behoben
- Trigger und HA-Sensoren funktionierten nicht (401 Unauthorized): Das Supervisor-Token kam im Add-on nicht an. Es wird jetzt auch aus dem Container-Environment gelesen.

## 0.8.0

### Neu
- **Windows-Look:** Fenster mit Titelleiste, klassische Reiter, erhabene/eingesunkene Rahmen, Dialoge als Fenster. Farben kommen weiter aus dem HA-Theme (Fensterfläche = Kartenfarbe, Titelleiste = Primärfarbe).
- Wird automatisch aktiviert, wenn das gewählte HA-Theme „HA 95“/„HA 98“ (oder „Windows …“) heißt. Unter Einstellungen → Darstellung → Optik lässt es sich auch fest ein- oder ausschalten.

### Behoben
- „Häufig verwendet“ im Hinzufügen-Dialog war nicht wie die übrige Liste formatiert.

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
