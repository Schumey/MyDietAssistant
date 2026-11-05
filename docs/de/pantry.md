# Vorrat

[← Übersicht](README.md)

Der Vorrat merkt sich, wie viel Du von einem Lebensmittel zu Hause hast. Jeder passende Tagebucheintrag verringert den Bestand. Fällt er auf die Schwelle, die Du festlegst, bekommst Du eine Benachrichtigung und/oder das Lebensmittel landet auf einer Todo-Liste in Home Assistant, zum Beispiel in **Bring!**.

**Voraussetzung:** Zusatzfunktion „Vorrat“. Benachrichtigung und Todo-Liste funktionieren nur im Home-Assistant-Add-on.

## Vorrat anlegen

1. Schalte *Einstellungen → Zusatzfunktionen → Vorrat* ein.
2. Öffne den Reiter **Lebensmittel** und tippe auf **Vorrat**, dann auf **+ Neuer Vorrat**.
3. Trage den **Namen** ein (z. B. „Skyr“) und den **Bestand jetzt** in Gramm.
4. Bei **Melden ab (g)** legst Du die Schwelle fest: Ist der Bestand so klein oder kleiner, wirst Du gemeldet. Mit 0 kommt die Meldung erst, wenn nichts mehr da ist.
5. Optional: **Packungsgröße (g)**. Dann erscheint beim Vorrat die Schaltfläche **+ Packung**, die den Bestand nach dem Einkauf mit einem Tipp um eine Packung erhöht. Die Größe steht auch im Todo-Eintrag („Skyr – 500 g“).

## So wird der Bestand verringert

Jeder Tagebucheintrag, dessen Name eines der **Suchwörter** enthält (Groß- und Kleinschreibung egal), zieht seine Gramm vom Bestand ab. Ist das Feld Suchwörter leer, gilt der Name. Mit Komma trennst Du mehrere Wörter, z. B. `skyr, quark`.

- Es zählen nur Einträge, die **nach** dem Festlegen des Bestands erfasst wurden. Älteres bleibt unberücksichtigt.
- Ändern oder Löschen eines Eintrags korrigiert den Bestand von selbst.
- Schnelleingaben ohne Gramm zählen nicht.
- Achte auf zu allgemeine Suchwörter: „Milch“ passt auch auf „Milchschokolade“.
- Hast Du etwas gekauft oder gezählt, ändere den **Bestand jetzt** über ✎ oder tippe **+ Packung**.

## Benachrichtigung und Todo-Liste

Unter **Wenn ein Vorrat knapp wird** im Vorrats-Fenster:

1. **Benachrichtigung:** Trage einen Dienst wie `notify.mobile_app_pixel` ein (die Vorschlagsliste zeigt die Dienste Deines Home Assistant). Leer = keine Benachrichtigung.
2. **Todo-Liste:** Wähle eine Liste wie `todo.bring`. **Bring!** und andere Einkaufslisten-Apps erscheinen in Home Assistant als Todo-Liste, sobald ihre Integration eingerichtet ist; die eingebaute Einkaufsliste geht genauso. Leer = kein Eintrag.
3. Tippe auf **Meldung speichern**.

Jedes Lebensmittel wird **einmal** gemeldet, wenn es die Schwelle erreicht (Prüfung etwa jede Minute). Erst wenn der Bestand wieder über der Schwelle liegt, z. B. nach **+ Packung**, kann es erneut gemeldet werden.

## Für Automationen

Der Sensor `sensor.mydiet_<name>_pantry_low` nennt die Lebensmittel, die an oder unter ihrer Schwelle sind (z. B. `Skyr, Reis`), sonst `none`. Damit lassen sich auch andere Apps ansteuern. Siehe [Sensoren](sensors.md).

Der Vorrat ist in der JSON-Sicherung enthalten (mit dem Bestand zum Zeitpunkt des Exports).
