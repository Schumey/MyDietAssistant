# Einkaufsliste

[← Übersicht](README.md)

Die Einkaufsliste zählt die Zutaten von Rezepten und gespeicherten Mahlzeiten zusammen. Du kannst sie kopieren oder an eine Todo-Liste in Home Assistant schicken, zum Beispiel an die Einkaufsliste im Handy.

**Voraussetzung:** Zusatzfunktion „Einkaufsliste“. Rezepte tauchen auf, wenn auch die Zusatzfunktion „Rezepte“ an ist.

## Einkaufsliste erstellen

1. Schalte *Einstellungen → Zusatzfunktionen → Einkaufsliste* ein.
2. Öffne den Reiter **Mahlzeiten** (oder **Rezepte**) und tippe unten auf **Einkaufsliste**.
3. Trage bei den Rezepten die gewünschten **Portionen** ein und bei den Mahlzeiten ein **Vielfaches** (1 = einmal die gespeicherte Menge). Felder mit 0 oder ohne Zahl zählen nicht.
4. Unter **Einkaufsliste** erscheinen die Zutaten, nach Namen zusammengezählt und alphabetisch sortiert. Gleiche Namen (ohne Rücksicht auf Groß- und Kleinschreibung) werden addiert, zum Beispiel „Tomaten“ aus zwei Rezepten.
5. Tippe auf **In die Zwischenablage kopieren**, um die Liste als Text einzufügen.

## An Home Assistant senden

1. Wähle unter **Todo-Liste** die Liste, zum Beispiel `todo.shopping_list`. Es erscheinen alle Todo-Entitäten Deines Home Assistant. Die zuletzt benutzte ist vorausgewählt.
2. Tippe auf **An Home Assistant senden**. Jede Zutat wird ein Eintrag, zum Beispiel „Skyr – 450 g“. Größere Mengen stehen in kg.

Erscheint „Keine Todo-Liste in Home Assistant gefunden.“, hat Dein Home Assistant noch keine Todo-Liste. Lege unter *Einstellungen → Geräte & Dienste → Integration hinzufügen* die **Einkaufsliste** (Shopping List) an.

Das Senden funktioniert nur im Home-Assistant-Add-on. Ein Kalender für den Mahlzeiten-Zeitplan ist nicht möglich: Ein Add-on kann keine Kalender-Entität anlegen. Eine Automation kann aber über die [Sensoren](sensors.md) zur nächsten Mahlzeit (`next_meal`, `next_meal_time`) Termine oder Benachrichtigungen auslösen.
