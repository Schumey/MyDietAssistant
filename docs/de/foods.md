# Lebensmittel

[← Übersicht](README.md)

Die Seite **Lebensmittel** ist Deine Bibliothek. Alle Nährwerte gelten **pro 100 g**. Eingetragen wird immer in Gramm (oder Unzen, siehe [Einstellungen](settings.md#sprache-und-einheiten)).

## Ein Lebensmittel anlegen

1. Öffne **Lebensmittel** und tippe auf **+ Neues Lebensmittel** (oder im Hinzufügen-Dialog des Tagebuchs auf **+ Neues Lebensmittel**).
2. Trage den Namen ein, optional Marke, Kategorie und Barcode.
3. Trage Kalorien, Kohlenhydrate, Fett und Eiweiß pro 100 g ein.
4. Optional: eine Portionsgröße, damit Du später „1 Scheibe“ statt Gramm wählen kannst.
5. Speichern.

Das Formular weist auf unplausible Werte hin (zum Beispiel mehr als 100 g Nährstoffe pro 100 g oder Kalorien, die nicht zu den Makros passen).

## Suchen, bearbeiten, Favoriten

- Suche mit dem Feld **Lebensmittel suchen…**. Lange Listen laden seitenweise (**Mehr laden**), die Suche läuft auf dem Server.
- **✎** bearbeitet ein Lebensmittel, **✕** löscht es. Bereits eingetragene Mengen im Tagebuch bleiben unverändert (Schnappschüsse).
- **☆** macht es zum Favoriten (**★**). Favoriten stehen im Hinzufügen-Dialog im Reiter **★ Favoriten**.
- **⚡** legt einen [Trigger](triggers.md) für das Lebensmittel an.
- Kategorien (z. B. Diät, Bulk) lassen sich per Chip ein- und ausblenden.

## Doppelte Lebensmittel zusammenführen

1. Tippe auf **Duplikate suchen**.
2. Prüfe die gefundenen Gruppen.
3. Tippe auf **Zusammenführen**, um sie zu einem Lebensmittel zu vereinen.

Ohne Treffer erscheint „Keine Duplikate gefunden.“

## Online-Suche (Weitere Datenquellen)

**Voraussetzung:** Zusatzfunktion „Weitere Datenquellen“ (*Einstellungen → Zusatzfunktionen*). Die Suchbegriffe werden an Open Food Facts und USDA FoodData Central gesendet; sonst bleibt alles lokal.

1. Schalte *Einstellungen → Zusatzfunktionen → Weitere Datenquellen* ein.
2. Optional: Lege in den Add-on-Optionen einen eigenen `usda_api_key` an (kostenlos auf api.data.gov). Ohne Schlüssel gilt ein gemeinsamer Demo-Schlüssel mit niedrigem Limit.
3. Beginne im Formular **Neues Lebensmittel** mit der Suche. Die Treffer beider Quellen lassen sich vergleichen.
4. Übernimm die passenden Werte und speichere.

Antworten merkt sich das Add-on lokal: Barcodes 60 Tage, Suchbegriffe 14 Tage. Gespeichert werden nur Produktdaten und Suchschlüssel, nichts aus dem Tagebuch. Leeren: *Einstellungen → Zwischenspeicher der Online-Suche → Zwischenspeicher leeren*.

## Eigene Lebensmittel online prüfen

**Voraussetzung:** „Weitere Datenquellen“.

1. Öffne **Lebensmittel** und tippe auf **Werte online prüfen**.
2. Das Add-on gleicht Deine Lebensmittel mit Open Food Facts ab (über den Barcode, sonst über den Namen) und zeigt Abweichungen bei Kalorien und Makros.
3. Übernimm Online-Werte nur für die Lebensmittel, bei denen Du es willst. Es ändert sich nichts ohne Knopfdruck.
4. USDA lässt sich zuschalten; ohne eigenen Schlüssel ist dessen Limit schnell erreicht.

## Tabelle importieren

Wenn Du eine Nährwerttabelle hast (BLS, CIQUAL, Schweizer Nährwertdatenbank, Open-Food-Facts-Export oder eigene Liste):

1. Öffne **Lebensmittel** und tippe auf **Tabelle importieren …** (auch unter *Einstellungen → Daten → Weitere Importe …*).
2. Wähle eine CSV-, TXT- oder Excel-Datei (`.xlsx`) mit Nährwerten pro 100 g.
3. Die Spalten werden anhand der Überschriften erkannt. Erkannt werden auch die Kürzel der **BLS** (`ST`, `GCAL`, `GJ`, `ZE`, `ZF`, `ZK`, `ZB`) und die Spalten der **CIQUAL** (`alim_nom_fr`, „Protéines“, „Glucides“, „Lipides“ …) sowie der **Schweizer Nährwertdatenbank**.
4. Prüfe in der Vorschau die Zuordnung und korrigiere sie bei Bedarf.
5. Enthält die Tabelle eine Kategorie-Spalte (z. B. „Kategorie“, „Warengruppe“, Open Food Facts „categories“), wird sie übernommen; bei mehreren Kategorien in einer Zelle gilt die erste. Für Lebensmittel ohne Kategorie in der Datei (oder wenn keine Spalte erkannt wurde) wählst Du die Kategorie selbst. Starte dann den Import.

Energie in kJ wird umgerechnet, Natrium in Salz. Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert. Die BLS selbst gibt es beim Max Rubner-Institut als Datei (dort gelten die Nutzungsbedingungen); das Add-on bringt sie nicht mit.

## Lebensmittel teilen

Mit der Zusatzfunktion „Haushalt“ kannst Du Lebensmittel mit anderen Benutzern teilen, siehe [Haushalt und Benutzer](household.md).
