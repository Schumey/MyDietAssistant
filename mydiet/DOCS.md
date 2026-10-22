# MyDietAssistant

Ernährungstagebuch pro HA-Benutzer (Ingress). Daten liegen in `/data/mydiet.db` und sind im HA-Backup enthalten.

## Sensoren
Bei aktivierter Option `publish_sensors` werden nach jeder Änderung diese Entitäten gesetzt:
`sensor.mydiet_<name>_{kcal,protein,carbs,fat}_today`.

Weitere Sensoren (gleiches Namensschema):

| Entität | Bedeutung |
|---|---|
| `sensor.mydiet_<name>_kcal_remaining_today` | verbleibende kcal heute (Tagesziel minus Aufnahme) |
| `sensor.mydiet_<name>_kcal_week_avg` | Ø kcal der letzten 7 Tage (nur erfasste Tage) |
| `sensor.mydiet_<name>_weight` | letzter Gewichtswert |
| `sensor.mydiet_<name>_weight_trend` | geglätteter Gewichtstrend |
| `sensor.mydiet_<name>_energy_balance` | geschätzte Kalorienbilanz pro Tag (30 Tage, aus Gewichtstrend und Aufnahme; + Überschuss, − Defizit) |

Beispiel für eine Dashboard-Karte (`<name>` anpassen):

```yaml
type: entities
title: Ernährung
entities:
  - entity: sensor.mydiet_<name>_kcal_today
    name: Heute gegessen
  - entity: sensor.mydiet_<name>_kcal_remaining_today
    name: Verbleibend
  - entity: sensor.mydiet_<name>_protein_today
    name: Eiweiß
  - entity: sensor.mydiet_<name>_kcal_week_avg
    name: Ø 7 Tage
  - entity: sensor.mydiet_<name>_weight_trend
    name: Gewichtstrend
  - entity: sensor.mydiet_<name>_energy_balance
    name: Bilanz pro Tag
```

Hinweis: Sie werden über die States-API gesetzt (keine Unique-ID, nach einem HA-Neustart fehlen sie bis zum nächsten Eintrag). Später: MQTT Discovery.

## Open Food Facts
Die Barcode-Suche ist die einzige Funktion, die Internet braucht.

## Neu in 0.3

- **Import/Export** (Einstellungen → Daten): JSON-Sicherung, CSV-Export, MyFitnessPal-CSV-Import (komplett oder nur Tagessummen + Gewicht).
- **Mahlzeiten speichern** im Tagebuch, wiederverwendbar über „Meine Mahlzeiten“.
- **Kategorien** für Lebensmittel und Mahlzeiten (z. B. Diät/Bulk), per Chip ein-/ausblendbar.
- **Kalorienbilanz** (Statistik): aus Gewichtstrend und Aufnahme (1 kg ≈ 7700 kcal).
- **Trigger**: Zustand einer HA-Entität oder Kalendertermin trägt ein Lebensmittel/eine Mahlzeit einmal pro Tag ein (Prüfung jede Minute).
- **Tagebuch-Ansicht** umschaltbar auf Uhrzeiten statt fester Mahlzeiten.

## Neu in 0.4

- Eigene Seite **Mahlzeiten**, Mahlzeiten **kopieren** und **leeren**, **Häufig verwendet** im Hinzufügen-Dialog.
- **Einblend-Regeln** für Tagebuch-Mahlzeiten (Einstellungen → Mahlzeiten → ⚡), z. B. „Nachtschicht“ nur an Tagen mit gleichnamigem Kalendertermin.
- Details siehe CHANGELOG.
