# MyDietAssistant

Ernährungstagebuch pro HA-Benutzer (Ingress). Daten liegen in `/data/mydiet.db` und sind im HA-Backup enthalten.

## Sensoren
Bei aktivierter Option `publish_sensors` werden nach jeder Änderung diese Entitäten gesetzt:
`sensor.mydiet_<name>_{kcal,protein,carbs,fat}_today`.

Hinweis: Sie werden über die States-API gesetzt (keine Unique-ID, nach einem HA-Neustart fehlen sie bis zum nächsten Eintrag). Später: MQTT Discovery.

## Open Food Facts
Die Barcode-Suche ist die einzige Funktion, die Internet braucht.
