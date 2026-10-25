# Trigger

[← Übersicht](README.md)

Ein Trigger trägt ein Lebensmittel oder eine gespeicherte Mahlzeit **einmal pro Tag** automatisch ein, wenn Home Assistant etwas meldet. Er kann auch das Tagesziel auf ein Profil umschalten. Das Add-on prüft jede Minute.

> Trigger brauchen Home Assistant. Ohne `SUPERVISOR_TOKEN` (z. B. beim lokalen Testen) sind sie inaktiv.

## Auslöser

| Auslöser | Wann er zutrifft |
|---|---|
| Zustand einer Entität | sobald die Entität diesen Zustand hat (oder nicht hat), z. B. `person.max` = `Fitnessstudio` |
| Kalendereintrag | an Tagen mit (oder ohne) Termin, dessen Titel einen Text enthält |
| Uhrzeit | täglich, sobald diese Uhrzeit erreicht ist |

## Einen Trigger anlegen

Beispiel: Wenn Max im Fitnessstudio ist, wird der Proteinshake eingetragen.

1. Öffne *Einstellungen → Trigger* und tippe auf **+ Neuer Trigger**. Alternativ tippst Du bei einem Lebensmittel oder einer gespeicherten Mahlzeit auf **⚡**.
2. Wähle bei **Auslöser** „Zustand einer Entität“.
3. Trage bei **Entität** `person.max` ein (die Vorschlagsliste kommt aus Home Assistant).
4. Wähle bei **Bedingung** „ist / enthält“ und schreibe den Zustand, z. B. den Zonennamen `Fitnessstudio` oder `on`.
5. Wähle unter **Dann** das Lebensmittel (oder die gespeicherte Mahlzeit). Bei Lebensmitteln kannst Du eine Menge angeben, sonst gilt die Standardportion.
6. Wähle die **Mahlzeit im Tagebuch**, zu der eingetragen wird.
7. Tippe auf **Speichern**.
8. Teste mit **▶** („Jetzt testen, trägt heute ein“) oder **Jetzt prüfen**.

### Weitere Optionen

- **Zustand muss schon so lange anliegen (Minuten):** z. B. 20, damit erst eingetragen wird, wenn die Person seit 20 Minuten im Fitnessstudio ist. Gerechnet wird mit dem HA-Zeitstempel `last_changed`.
- **Nur zwischen (Uhrzeit):** Zeitfenster, auch über Mitternacht (22:00 bis 06:00).
- **Kalender, Termin zählt:** an jedem Tag des Termins, nur am Starttag oder nur am Endtag.
- **Tage im Voraus eintragen (nur Kalender):** bei 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein Termin steht.
- **+ Weitere Bedingung:** mehrere Bedingungen kombinieren, **UND** (alle) oder **ODER** (mindestens eine). Jede kann negiert werden („ist NICHT“).

## Trigger verwalten

- Der Haken schaltet einen Trigger aus und an.
- **✎** bearbeitet, **⏸** pausiert (mit Enddatum), **✕** löscht.
- **Trigger-Verlauf** zeigt, was zuletzt eingetragen wurde. **Rückgängig** entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.

## Tagesziel per Trigger umschalten

**Voraussetzung:** Zusatzfunktion „Tagesziele pro Wochentag“ mit mindestens einem Profil (siehe [Ziele und Statistik](goals-and-stats.md#tagesziel-profile)).

1. Lege ein Profil an, z. B. „Training“.
2. Lege einen Trigger an und wähle unter **Dann** den Eintrag „Tagesziel „Training““.
3. Am Tag des Auslösers gilt das Profil. Es geht vor dem Wochentagsziel.

## Mahlzeiten nur an bestimmten Tagen zeigen

Mit dem gleichen Auslöser-Formular blendest Du eine Mahlzeit nur an passenden Tagen ein, z. B. „Nachtschicht“ nur, wenn der Kalender einen Termin „Nachtschicht“ enthält.

1. Öffne *Einstellungen → Mahlzeiten*.
2. Tippe bei der Mahlzeit auf **⚡**.
3. Wähle Auslöser, Entität (z. B. `calendar.arbeit`) und den Titeltext.
4. Speichern. Ohne Regel wird die Mahlzeit immer angezeigt, Tage mit Einträgen bleiben immer sichtbar.

Lokal ohne Home Assistant werden solche Mahlzeiten immer angezeigt.

## Häufige Probleme

Siehe [Fehlersuche](troubleshooting.md#ein-trigger-trägt-nicht-ein).
