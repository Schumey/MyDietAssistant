# Haushalt und Benutzer

[← Übersicht](README.md)

Jeder Home-Assistant-Benutzer hat ein eigenes Tagebuch. Das Add-on erkennt ihn über Home Assistant (Ingress). Ohne Home Assistant (lokaler Test) gilt der Benutzer `default`.

## Haushalt einschalten

**Voraussetzung:** Beide Seiten müssen die Zusatzfunktion einschalten.

1. Jeder Benutzer öffnet *Einstellungen → Zusatzfunktionen* und schaltet **Haushalt** ein.
2. Wer „Haushalt“ ausschaltet, sieht keine fremden Lebensmittel mehr.

## Einen Eintrag mit anderen teilen

Z. B. ein Gericht für die Familie, jeder mit eigener Portion.

1. Tippe im Tagebuch den Eintrag an und dann auf **Teilen …**.
2. Hake die Personen an, die mitessen.
3. Gib die Portion an: bei Mengen in Gramm (oder Unzen) pro Person, bei Schnelleingaben als Vielfaches (1 = gleich viel).
4. Tippe auf **Eintragen**.

Der Eintrag erscheint am selben Tag im Tagebuch der anderen, jeder mit eigener Menge. Es erscheint nur, wer ebenfalls „Haushalt“ eingeschaltet hat; sonst steht „Noch niemand sonst nimmt am Haushalt teil.“

## Lebensmittel und Mahlzeiten kopieren

1. Tippe auf der Seite *Lebensmittel* oder *Mahlzeiten* bei einem Eintrag auf **⇪**.
2. Wähle die Personen.

Das Lebensmittel oder die Mahlzeit landet als Kopie in der Bibliothek der anderen. Gleichnamige Einträge dort bleiben unverändert, spätere Änderungen werden nicht abgeglichen.

## Gemeinsame Bibliothek

Ein Lebensmittel für alle anbieten:

1. Öffne das Lebensmittel zum Bearbeiten (**✎**).
2. Schalte **In der gemeinsamen Haushaltsbibliothek anbieten** ein und speichere.

Alle anderen mit „Haushalt“ sehen es mit dem Vermerk „von <Name>“ in ihrer Liste und im Hinzufügen-Dialog. Sie dürfen es eintragen und ändern. Die Änderung gilt sofort für alle, bereits eingetragene Mengen bleiben Schnappschüsse. Löschen, Favorit, Trigger und das Freigeben selbst bleiben beim Besitzer.

### Rezepte und gespeicherte Mahlzeiten

Auch Rezepte und gespeicherte Mahlzeiten lassen sich für den Haushalt anbieten:

1. Öffne das Rezept oder die Mahlzeit zum Bearbeiten (**✎**).
2. Schalte **In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)** ein, auf Wunsch zusätzlich **Andere dürfen es auch ändern**, und speichere.

Die anderen sehen das Rezept im Reiter **Rezepte** und die Mahlzeit im Reiter **Mahlzeiten**, jeweils mit „von <Name>“. Sie dürfen es eintragen (Rezepte erscheinen auch als Lebensmittel mit „1 Portion“), in die [Einkaufsliste](shopping.md) aufnehmen und mit **⧉** als eigene Kopie anlegen. Ändern, Löschen, Trigger und das Freigeben bleiben zunächst beim Besitzer. Mit dem zweiten Häkchen **Andere dürfen es auch ändern** dürfen auch die anderen Mitglieder es bearbeiten (Name, Zutaten, Mengen, bei Rezepten auch Portionen und Zubereitung); Löschen, Trigger und die Freigabe selbst bleiben trotzdem beim Besitzer. Beide Seiten müssen „Haushalt“ eingeschaltet haben. Wer das Anbieten zurücknimmt, nimmt auch das zugehörige Lebensmittel eines Rezepts aus der gemeinsamen Bibliothek. Bereits angelegte Kopien und eingetragene Mengen bleiben.

## Benutzerverwaltung

Nur Administratoren sehen die Karte **Benutzerverwaltung** unter *Einstellungen*.

1. Lege die Administratoren in den Add-on-Optionen fest: `admin_users` (Liste von Benutzer-IDs oder Namen). Leer bedeutet: der erste Benutzer, der das Add-on geöffnet hat.
2. Die Tabelle zeigt je Benutzer Einträge, Tage, Lebensmittel und den letzten Eintrag.
3. **Export** lädt die Daten eines Benutzers als JSON herunter.
4. **Löschen** entfernt alle Daten eines Benutzers unwiderruflich. Zur Bestätigung musst Du den Namen eintippen.
5. Unter **Datenbank** stehen Größe, Zeilen, freier Platz und die letzte Sicherung. **Prüfen** führt eine Integritätsprüfung durch, **Prüfen und verdichten** packt die Datei danach neu zusammen (spart Platz nach großen Löschungen). Mach vorher am besten eine Sicherung.
5. Unter **Datenbank** stehen Größe, Zeilen, freier Platz und die letzte Sicherung. **Prüfen** führt eine Integritätsprüfung durch, **Prüfen und verdichten** packt die Datei danach neu zusammen (spart Platz nach großen Löschungen). Mach vorher am besten eine Sicherung.

Export und Import in *Einstellungen → Daten* betreffen immer nur das eigene Konto.
