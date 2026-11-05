# Ziele und Statistik

[← Übersicht](README.md)

## Tagesziel

Das Standard-Tagesziel stellst Du unter *Einstellungen → Tagesziele* ein. Die Schritte stehen unter [Erste Schritte](first-steps.md#1-tagesziel-festlegen).

- **Mein Ziel** (Abnehmen, Halten, Zunehmen) bestimmt, wann ein Tag „im Ziel“ ist, und wie die Statistik Deinen Gewichtstrend bewertet.
- **Gewünschte Änderung** gibt die geplante Gewichtsänderung pro Woche an.
- Die Add-on-Option `default_kcal_goal` gilt nur, bis Du selbst ein Ziel gespeichert hast.

## Ziele pro Wochentag

**Voraussetzung:** Zusatzfunktion „Tagesziele pro Wochentag“.

1. Schalte *Einstellungen → Zusatzfunktionen → Tagesziele pro Wochentag* ein.
2. Öffne die Karte **Tagesziele pro Wochentag**.
3. Trage für Montag bis Sonntag Kalorien und Makros ein, z. B. Trainingstage mit mehr Kalorien.
4. Leere Kalorien bedeuten: Es gilt das Standard-Tagesziel. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ folgen die Kalorien den Makros.
5. Tippe auf **Speichern**.

## Tagesziel-Profile

**Voraussetzung:** „Tagesziele pro Wochentag“.

1. Öffne die Karte **Tagesziel-Profile** und tippe auf **+ Profil**.
2. Benenne das Profil (z. B. „Training“, „Ruhetag“) und trage die Werte ein.
3. Tippe auf **Speichern**.
4. Schalte das Profil per [Trigger](triggers.md#tagesziel-per-trigger-umschalten) um, etwa wenn die Person im Fitnessstudio ist.

Das Profil geht vor dem Wochentagsziel. Mit [Aktivität](activity.md) erhöht sich das Ziel zusätzlich.

## Stufenplan (Reverse-Diät)

**Voraussetzung:** Zusatzfunktion „Stufenplan (Reverse-Diät)“.

Das Tagesziel steigt oder sinkt in festen Schritten, z. B. nach einer Diät +100 kcal pro Woche, bis Dein Erhaltungsbedarf erreicht ist (Reverse-Diät), oder -5 g Kohlenhydrate pro Woche bei einer schrittweisen Absenkung.

1. Schalte *Einstellungen → Zusatzfunktionen → Stufenplan (Reverse-Diät)* ein.
2. Öffne die Karte **Stufenplan**.
3. Wähle das **Startdatum** und den **Abstand (Tage)** zwischen zwei Stufen.
4. Trage die Schritte ein: **Schritt Kalorien (kcal)**, Protein, Kohlenhydrate und Fett. Positive Werte erhöhen das Ziel, negative senken es. Leere Felder bleiben unverändert.
5. Mit **Anzahl Schritte** begrenzt Du den Plan; bei 0 läuft er unbegrenzt weiter.
6. Tippe auf **Plan speichern**. Die **Vorschau** zeigt, ab wann welches Ziel gilt.

Bis zum Ende des ersten Abstands gilt Dein normales Ziel (Stufe 0), danach steigt es mit jedem Abstand um einen Schritt. Der Plan baut auf dem Standard-Tagesziel, dem Wochentagsziel oder Profil auf und wirkt zusätzlich zur [Aktivität](activity.md). Makros ohne Ziel bleiben ohne Ziel, nichts sinkt unter 0. **Plan beenden** setzt das Ziel zurück. Wenn Du das Standard-Tagesziel änderst, verschiebt sich der ganze Plan mit.

## Statistik

Der Reiter **Statistik** zeigt Auswertungen für einen Zeitraum, den Du mit dem Schieberegler **Zeitraum** einstellst. Er rastet auf 7, 14, 21, 30, 45, 60, 90, 120, 180, 270 Tagen, 1 Jahr, 1,5 und 2 Jahren ein; ganz rechts steht **Alles** (seit dem ersten Tagebucheintrag). Der Regler zeigt nur Stufen, die kürzer sind als Dein bisheriger Verlauf: Wer seit zwei Monaten erfasst, sieht also keine Jahre. Ein Tipp auf eine Beschriftung springt direkt dorthin. Solange Du weniger als 30 Tage erfasst hast, ist **Alles** voreingestellt. Ab einem Jahr zeigt „Kalorien pro Tag“ einen Balken je Woche (Durchschnitt der erfassten Tage).

Die Statistik enthält:

- **Kalorien pro Tag** als Balken (linke Achse) mit Zielinie, zusammen mit Gewichtswerten und geglättetem Trend als Linie (rechte Achse); der Tooltip zeigt beides je Tag.
- **Makro-Verlauf** mit Zielinien.
- **Kalorienbilanz:** Schätzung aus Gewichtstrend und Aufnahme (1 kg ≈ 7700 kcal; + Überschuss, − Defizit), auch als Sensor `energy_balance`.
- Die **Prognose zum Zielgewicht**, wenn ein Zielgewicht gesetzt ist.

Die Statistik rechnet mit dem jeweils gültigen Tagesziel (Wochentag, Profil, Aktivität).

**Tag unvollständig:** Hast Du einen Tag nicht vollständig eingetragen, setze im Tagebuch unter dem Datum den Haken **Tag unvollständig (zählt nicht in der Statistik)**. Der Tag bleibt im Tagebuch, zählt aber nicht mehr in Durchschnitten, Energiebilanz, Berichten, Wochenbericht und Nährstofflücken; in den Diagrammen erscheint er als „unvollständig“. Die Sensoren für heute bleiben unverändert. Haken entfernen macht es rückgängig.

## Bericht für Berater und Trainer

Siehe [Daten, Import und Sicherung](data.md#bericht-für-berater-und-trainer).
