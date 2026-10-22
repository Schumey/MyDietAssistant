# Roadmap

Ideensammlung für MyDietAssistant. Reihenfolge und Zuschnitt sind Vorschläge, keine Zusagen. Bereits Umgesetztes steht im [Changelog](mydiet/CHANGELOG.md).

Aufwand: **S** = Stunden, **M** = ein bis zwei Abende, **L** = größeres Vorhaben.

## Als Nächstes (hoher Nutzen im Alltag)

- **Wochen- und Tagesziele pro Wochentag** (M): z. B. Trainingstage mit mehr Kalorien/Kohlenhydraten, Ruhetage weniger. Optional automatisch über einen Kalender-/Zustands-Trigger (Fitnessstudio-Tag).
- **Wasser und Nahrungsergänzung** (S): Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.
- **Rezepte mit Portionen** (M): Zutaten zu einem Rezept bündeln, Gesamtmakros durch Portionen teilen, als Lebensmittel nutzen. Ergänzt die bestehenden gespeicherten Mahlzeiten.
- **Schnelleingabe nur mit Kalorien/Makros** (S): Eintrag ohne Lebensmittel („Restaurant, ca. 800 kcal“), analog zu MyFitnessPal.
- **Mikronährstoffe** (M): Ballaststoffe, Zucker, Salz, gesättigte Fette als optionale Spalten (Open Food Facts liefert sie bereits).

## Trigger und Home Assistant

- **Zeitfenster für Zustands-Trigger** (S): Eintrag erst nach X Minuten im Zustand (Fitnessstudio) oder nur zwischen bestimmten Uhrzeiten.
- **Uhrzeit-Trigger** (S): Fester Eintrag zu einer Zeit („täglich 07:30 Vitamine“), ohne HA-Entität.
- **Trigger-Verlauf** (S): Liste, wann welcher Trigger was eingetragen hat, mit Rückgängig-Button.
- **Mehrere Bedingungen** (M): UND/ODER-Verknüpfung, z. B. Kalender „Nachtschicht“ UND Person zu Hause.
- **HA-Dienste und Ereignisse** (M): Aktionen `mydiet.add_entry` und `mydiet.log_weight` für Automationen, damit Waage, Sprachassistent oder Nachrichten-Bot eintragen können.
- **Mehr Sensoren** (S): Wochenschnitt, Kalorienbilanz, Gewichtstrend und verbleibende Kalorien als Sensoren für Dashboards. Dazu eine fertige Dashboard-Karte als Beispiel.
- **Erinnerungen** (M): Benachrichtigung, wenn bis zu einer Uhrzeit nichts eingetragen wurde.

## Auswertung

- **Gewichtstrend glätten** (S): Gleitender Durchschnitt über das Gewicht (wie Happy Scale), Tagesschwankungen ausblenden.
- **Zielprognose** (S): Voraussichtliches Datum für das Zielgewicht aus Trend und Kalorienbilanz.
- **Wochenbericht** (M): Durchschnitt, Eiweiß-Ziel getroffen an wie vielen Tagen, bester/schlechtester Tag, als Karte und optional als HA-Benachrichtigung.
- **Körpermaße und Fotos** (M): Umfänge (Taille, Brust, Arm) neben dem Gewicht, optional Fortschrittsfotos nur lokal.
- **Bilanz je Kategorie** (S): Statistik getrennt nach Diät-/Bulk-Phasen anhand der Kategorien.
- **Zeitraum-Vergleich** (M): Zwei Zeiträume nebeneinander (z. B. Diätphase 1 gegen 2).

## Lebensmittel und Eingabe

- **Barcode-Scan per Kamera** (M): Im Browser/der HA-App scannen statt Nummer tippen (Open Food Facts ist angebunden).
- **Lebensmittel-Duplikate zusammenführen** (S): Gleiche Namen erkennen und mergen, Einträge umhängen.
- **Zuletzt verwendet / Favoriten** (S): Pro Lebensmittel Stern, eigener Tab im Hinzufügen-Dialog.
- **Mehrere Portionsgrößen** (M): „1 Scheibe = 30 g“, „1 Dose = 330 ml“ pro Lebensmittel hinterlegen.
- **Einheiten und Sprache** (M): Anzeige in oz/lb sowie englische Oberfläche.
- **Mehrere Datenquellen** (L): Weitere Nährwertdatenbanken neben Open Food Facts (z. B. BLS), optional abschaltbar, da sie online abfragen.

## Import und Export

- **Weitere Importe** (M): Cronometer, FDDB, Yazio, Apple Health/Google Fit (Gewicht).
- **Automatische Sicherung** (S): Täglicher JSON-Export in den HA-Backup-Ordner, mit Aufbewahrungsdauer.
- **Wiederherstellung mit Vorschau** (S): Import zeigt vorher, was ersetzt oder ergänzt wird.
- **Export für Dritte** (S): PDF/CSV-Bericht für Ernährungsberatung oder Trainer.

## Mehrere Benutzer

- **Geteilte Lebensmittel und Mahlzeiten** (M): Gemeinsame Bibliothek im Haushalt, persönliche Einträge bleiben getrennt.
- **Haushaltsmahlzeiten** (M): Ein Gericht für mehrere Personen mit jeweils eigener Portion eintragen.
- **Admin-Ansicht** (S): Benutzer auflisten, Daten eines Benutzers exportieren/löschen.

## Oberfläche

- **Weitere Looks** (M): Zusätzliche Skins neben dem Windows-Look (z. B. Mac-OS-9-Stil), Theme-Erkennung dafür erweiterbar machen.
- **Dunkles/helles Theme sauber** (S): Kontrast der Windows-Skins bei hellen und dunklen Themes prüfen und angleichen.
- **Mobile Bedienung** (M): Größere Touch-Flächen, Wischen zwischen Tagen, Eintrag per Langdruck bearbeiten.
- **Tastaturbedienung** (S): Kürzel für Tag vor/zurück, „Hinzufügen“, Suche fokussieren.
- **Tagebuch-Notizen** (S): Freitext pro Tag und pro Mahlzeit (Hunger, Training, Stimmung).
- **Diagramme verbessern** (M): Tooltips, Makro-Verlauf, Ziellinien, auf Wunsch zusätzliche Zeiträume.

## Technik und Qualität

- **Automatische Tests** (M): API-Tests für Import, Trigger-Logik (Start-/Endtag, Zeitzonen) und Energiebilanz; CI auf GitHub.
- **Datenbank-Migrationen strukturieren** (S): Versionsnummer in der Datenbank statt Spaltenprüfungen.
- **Zeitzone** (S): Zeitzone des Add-ons explizit aus HA lesen, damit Kalendergrenzen sicher stimmen.
- **Fehleranzeige für Trigger** (S): Fehler der HA-Verbindung dauerhaft in den Einstellungen anzeigen statt nur bei „Jetzt prüfen“.
- **Veröffentlichung** (M): Öffentliches Repository oder Add-on-Repository mit Icon/Logo, Übersetzungen und Release-Notes für die HA-Add-on-Seite.
- **Performance bei großen Datenmengen** (S): Indizes und Paginierung, wenn viele Jahre MyFitnessPal-Daten importiert sind.

## Ungeklärt / zu entscheiden

- Soll es eine **Kalorienberechnung aus Aktivitäten** geben (Schritte, Training aus HA-Sensoren), oder bleibt die Bilanz rein aus Gewicht und Aufnahme?
- **Mahlzeiten-Zeitplan** statt fester Mahlzeiten: Vorschlag, welche Mahlzeit jetzt ansteht?
- **Datenschutz bei Open Food Facts**: Barcode-Abfragen nur auf Knopfdruck (Ist-Zustand) oder lokaler Cache der Treffer?
