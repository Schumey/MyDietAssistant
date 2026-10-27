# Einstellungen

[← Übersicht](README.md)

Der Reiter **Einstellungen** besteht aus Karten. Karten für Zusatzfunktionen erscheinen erst, wenn die Funktion eingeschaltet ist.

| Karte | Inhalt | Seite |
|---|---|---|
| Tagesziele | Ziel, Kalorien und Makros, Zielgewicht | [Ziele und Statistik](goals-and-stats.md) |
| Sprache und Einheiten | Sprache, Einheiten, Lebensmittelmengen | unten |
| Hinzufügen-Dialog | „Häufig verwendet“: Lebensmittel, Mahlzeiten oder beides | unten |
| Zusatzfunktionen | optionale Funktionen ein-/ausschalten | unten |
| Darstellung | Tagebuch-Ansicht, Optik, Scanner beim Öffnen | unten |
| Mahlzeiten | Mahlzeiten, Zeitfenster, Einblend-Regeln | [Tagebuch](diary.md#mahlzeiten-verwalten), [Zeitplan](schedule.md) |
| Trigger, Trigger-Verlauf | automatische Einträge | [Trigger](triggers.md) |
| Erinnerung | Benachrichtigung | [Schnittstelle und Erinnerung](api.md#erinnerung) |
| Automatische Sicherung | Sicherungen, Wiederherstellen | [Daten](data.md) |
| Schnittstelle für Automationen | Status der API | [Schnittstelle](api.md) |
| Benutzerverwaltung | nur Administratoren | [Haushalt und Benutzer](household.md#benutzerverwaltung) |
| Export für Berater und Trainer, Daten | Export, Import | [Daten](data.md) |
| Version | installierte Version, Update-Prüfung | unten |

Jede Karte lässt sich ein- und ausklappen: Tippe auf den Titel. Welche Karten offen sind, merkt sich der Browser (zu Beginn ist nur die erste offen). Ganz unten zeigt *Version* die installierte Version; **Nach Updates suchen** meldet, ob eine neuere Version veröffentlicht ist (aktualisieren musst Du in Home Assistant unter *Einstellungen → Add-ons*).

## Sprache und Einheiten

1. Öffne *Einstellungen → Sprache und Einheiten*.
2. Wähle **Sprache**: Automatisch (Browser), Deutsch, English, Français, Español, Nederlands, Italiano, Português oder Polski. Das Portugiesische folgt der brasilianischen Schreibweise.
3. Wähle **Einheiten**: Metrisch (kg, cm) oder Imperial (lb, in).
4. Wähle **Lebensmittelmengen**: Gramm oder Unzen (oz).
5. Tippe auf **Speichern**. Die Seite lädt neu.

Gewicht und Körpermaße werden intern immer in kg und cm gespeichert, nur Anzeige und Eingabe wechseln. Lebensmittelmengen werden immer in Gramm gespeichert, die Nährwerte bleiben „pro 100 g“. Die Texte der Add-on-Optionen in Home Assistant gibt es ebenfalls auf Deutsch und Englisch.

## Hinzufügen-Dialog

1. Öffne *Einstellungen → Hinzufügen-Dialog*.
2. Wähle bei **„Häufig verwendet“ zeigt**: Lebensmittel, Gespeicherte Mahlzeiten oder Beides.
3. Tippe auf **Speichern**.

Die Auswahl gilt für den Reiter *Lebensmittel* im Dialog zum Hinzufügen. Im Reiter *Meine Mahlzeiten* stehen immer die häufig verwendeten Mahlzeiten.

## Zusatzfunktionen einschalten

Alles, was nicht jeder braucht, ist standardmäßig aus.

1. Öffne *Einstellungen → Zusatzfunktionen*.
2. Hake die gewünschte Funktion an. Sie wirkt sofort; passende Reiter und Karten erscheinen.
3. Zum Ausschalten den Haken entfernen. Daten bleiben erhalten.

| Funktion | Wofür | Anleitung |
|---|---|---|
| Tagesziele pro Wochentag | Trainingstage mit mehr Kalorien, Profile | [Ziele](goals-and-stats.md) |
| Wasser und Nahrungsergänzung | Zähler mit Tagesziel | [Tagebuch](diary.md#wasser-und-nahrungsergänzung) |
| Rezepte | Rezepte, Import aus Web und Mealie | [Rezepte](recipes.md) |
| Weitere Datenquellen | Open Food Facts und USDA | [Lebensmittel](foods.md#online-suche-weitere-datenquellen) |
| Aktivität | Schritte und Kalorien erhöhen das Ziel | [Aktivität](activity.md) |
| Waage (Sensor) | Gewicht aus einem HA-Sensor | [Gewicht](weight.md#waage-als-sensor) |
| Mahlzeiten-Zeitplan | Zeitfenster pro Mahlzeit | [Zeitplan](schedule.md) |
| Mahlzeiten-Vorschläge | Vorschläge für offene Makros | [Vorschläge](suggestions.md) |
| Haushalt | mit anderen Benutzern teilen | [Haushalt](household.md) |
| Notizen | Freitext zu Mahlzeiten und Tagen | [Tagebuch](diary.md#notizen) |
| Körpermaße und Fortschrittsfotos | Umfänge und Fotos | [Gewicht](weight.md#körpermaße-und-fortschrittsfotos) |
| Weitere Nährwerte | Ballaststoffe, Zucker, Salz, gesättigte Fettsäuren | [Tagebuch](diary.md#weitere-nährwerte) |

## Darstellung

1. Öffne *Einstellungen → Darstellung*.
2. **Tagebuch:** „Feste Mahlzeiten (Frühstück, Mittagessen, …)“ oder „Uhrzeiten (08:47 …, 11:30 …)“. Bestehende Einträge bleiben erhalten.
3. **Optik:**
   - *Automatisch*: Windows-Look, wenn das HA-Theme „HA 95“ oder „HA 98“ heißt, sonst Standard.
   - *Standard (HA-Theme)*: übernimmt das aktive Theme von Home Assistant.
   - *Windows-Look*: erzwingt den Windows-95-Stil.
4. **Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten:** gilt nur für dieses Gerät, siehe [Barcode-Scanner](barcode.md#scanner-per-homescreen-verknüpfung-companion-app).

## Tastenkürzel

| Taste | Wirkung |
|---|---|
| ← / → | im Tagebuch den Tag wechseln |
| T | im Tagebuch zu heute springen |
| N | im Tagebuch Nahrungsmittel hinzufügen |
| / | ins Suchfeld der Liste springen |

## Add-on-Optionen

Optionen wie `api_key`, `mqtt_discovery` oder `admin_users` stehen in Home Assistant, nicht in der Oberfläche: siehe [Installation](installation.md#add-on-optionen).
