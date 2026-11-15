# Training

[← Übersicht](README.md)

HAFS hat zwei Bereiche: **Ernährung** (das Tagebuch, wie Du es kennst) und **Training** (Krafttraining: Pläne, Übungen, Verlauf und Gewichtsvorschläge). Beide laufen in derselben App in Home Assistant und teilen sich Benutzer, Sprache und Darstellung. Workouts zeichnest Du mit der [HAFS-App](android.md) auf dem Handy auf; die Weboberfläche zeigt sie, und hier pflegst Du Pläne, Studios und Geräte.

**Voraussetzung:** unter *Einstellungen → Bereiche* ist **Ernährung und Training** oder **Nur Training** gewählt.

## Training einschalten

1. Öffne HAFS in Home Assistant und gehe auf *Einstellungen*. Die erste Karte heißt **Bereiche**.
2. Wähle **Ernährung und Training**. Wer nur trainieren will, wählt **Nur Training**; dann fehlen die Reiter der Ernährung.
3. Mit beiden Bereichen erscheint in der Reiterleiste links von **Einstellungen** der Umschalter **Ernährung | Training**.

Dieselbe Auswahl steht auch unter *Training → Einstellungen → Bereiche*. Mit **Nur Ernährung** sieht HAFS aus wie vorher, und die HAFS-App bekommt für Dich keine Trainingsdaten.

## Zwischen Ernährung und Training wechseln

- Tippe in der Reiterleiste auf **Training** (Hantel) oder **Ernährung** (Apfel). Die Seite lädt dabei nicht neu.
- Jeder Bereich hat eigene Reiter. Training: **Heute**, **Training**, **Übungen**, **Pläne**, **Einstellungen**.
- HAFS merkt sich auf diesem Gerät den zuletzt benutzten Bereich und Reiter.
- Läuft gerade ein Workout, öffnet sich beim Start Training.

## Die Reiter

| Reiter | Inhalt |
|---|---|
| **Heute** | Nächster Trainingstag mit den vorgeschlagenen Gewichten, Kennzahlen der Woche, Sätze je Muskelgruppe, Rückblick, letzte Workouts |
| **Training** | Alle Workouts nach Monat, mit Sätzen und Gewichten; daneben Sätze je Muskelgruppe über mehrere Wochen |
| **Übungen** | Alle Übungen mit Suche und Filtern; je Übung Verlauf (geschätztes 1RM, Gewicht, Volumen), Rekorde, Vorschlag, Geräte |
| **Pläne** | Trainingspläne und Trainingstage anlegen und bearbeiten, Studios mit ihren Geräten und Gewichtsstufen |
| **Einstellungen** | Bereiche, was **Heute** zeigt, Pause zwischen Sätzen, Ernährungsphase, Regeln für die Steigerung, Import, Export, Übernehmen |

## Ernährungsphase

Die vorgeschlagenen Gewichte hängen davon ab, ob Du gerade abnimmst, hältst oder zunimmst. Unter *Training → Einstellungen → Ernährungsphase* steht standardmäßig **Automatisch**: Dann gilt Dein Ziel aus *Ernährung → Einstellungen* (abnehmen = Diät, halten, zunehmen = Aufbau). Wähle eine Phase von Hand, wenn sie davon abweichen soll.

## Workouts aus anderen Apps importieren

1. Exportiere Deine Workouts als CSV aus GymRun, Strong oder Hevy.
2. Öffne *Training → Einstellungen → Import* und wähle die Datei.
3. Tippe auf **Probelauf**. HAFS zeigt, wie viele Workouts, Sätze und Übungen es gefunden hat.
4. Stimmt alles, tippe auf **Importieren**. Vorhandenes wird übersprungen.

## Umstieg von der HAFS-Integration

Wer HAFS bisher als Integration (`custom_components/hafs`) benutzt hat, übernimmt die Daten so:

1. HAFS in Home Assistant auf Version 2.0 aktualisieren und neu bauen lassen, damit die App den Konfigurationsordner lesen darf.
2. Training einschalten (siehe oben).
3. *Training → Einstellungen → Übernehmen → **Aus der HAFS-Integration übernehmen***. HAFS zeigt je Benutzer, was mitkommt (Workouts, Sätze, Zeitraum) und was in HAFS schon steht und ersetzt wird.
4. Tippe auf **Jetzt übernehmen** und bestätige. Als Administrator übernimmst Du alle Benutzer, sonst nur Dich selbst. Übernommene Benutzer bekommen Training eingeschaltet.
5. Aktualisiere die [HAFS-App](android.md) auf dem Handy und gleiche einmal ab.
6. Entferne danach die Integration in Home Assistant (*Einstellungen → Geräte & Dienste → HAFS → Löschen*). Erst dann legt HAFS die Entitäten an; sonst bekämen sie den Zusatz `_2`.

Die Datenbank der Integration wird dabei nur gelesen. Alternativ lädst Du unter **HAFS-Export (JSON) einspielen** eine Exportdatei hoch (aus dem Export der Integration oder von **Alles als JSON herunterladen**). Das ersetzt nur Deine eigenen Trainingsdaten.

## Sicherung und Export

- **Alles als JSON herunterladen** (*Training → Einstellungen → Export*) lädt Deine Trainingsdaten herunter.
- Die Sicherung von HAFS (*Ernährung → Einstellungen*, und die automatische unter `/backup/mydiet/`) enthält Training mit, sobald es eingeschaltet ist. Beim Wiederherstellen zeigt die Vorschau die Zahl der **Workouts**; eine Sicherung ohne Training (aus Version 1.x) lässt Deine Trainingsdaten unverändert.

## Home Assistant

Entitäten, Events, Assist und Automationen stehen unter [Training in Home Assistant](training-ha.md).
