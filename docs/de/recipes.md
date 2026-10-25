# Rezepte

[← Übersicht](README.md)

**Voraussetzung:** Zusatzfunktion „Rezepte“ (*Einstellungen → Zusatzfunktionen → Rezepte*). Danach erscheint der Reiter **Rezepte**.

Ein Rezept bündelt Zutaten, teilt sie durch die Portionen und lässt sich wie ein Lebensmittel eintragen.

## Ein Rezept von Hand anlegen

1. Öffne **Rezepte** und lege ein neues Rezept an.
2. Gib Name und Portionen ein.
3. Füge die Zutaten (Lebensmittel mit Gramm) hinzu.
4. Optional: Zubereitung und Quelle ergänzen.
5. Speichern. Die Nährwerte pro Portion werden berechnet.

Zum Eintragen suchst Du das Rezept im Hinzufügen-Dialog wie ein Lebensmittel.

## Rezept von einer Webseite importieren

1. Öffne **Rezepte** und tippe auf **Von Webseite …**.
2. Füge die Adresse der Rezeptseite ein und starte den Abruf.
3. Das Add-on liest die eingebetteten Rezeptdaten (schema.org, wie sie die meisten Kochseiten für Suchmaschinen mitliefern): Name, Portionen, Zutaten, Zubereitung und Quelle.
4. Prüfe den Entwurf im Editor:
   - Zutatenzeilen („200 g Weizenmehl“, „1 1/2 EL Öl“, „2 Eier“) werden in Gramm umgerechnet (Löffel, Tassen, Prisen und Milliliter nach Faustwerten, Stückangaben mit der Portionsgröße des Lebensmittels) und Deinen Lebensmitteln zugeordnet, auch über Wortbestandteile („Weizenmehl“ → „Mehl“).
   - **Rot** markierte Zutaten sind nicht zugeordnet. Mit **⇄** wählst Du ein Lebensmittel; sonst zählen sie mit 0 kcal.
   - **Orange** markierte Zutaten stammen aus einer Online-Datenbank (mit Quelle). Prüfe die Werte. Das gibt es nur mit der Zusatzfunktion „Weitere Datenquellen“: Fehlende Grundnahrungsmittel mit Mengenangabe werden bei Open Food Facts und USDA nachgeschlagen, der Mittelwert der passenden Treffer ergänzt die Nährwerte.
   - Gibt die Seite Nährwerte an, zeigt der Editor sie zum Vergleich mit der berechneten Portion.
5. Speichern. Erst jetzt wird etwas angelegt. Die Quelle bleibt als Link am Rezept, die Zubereitung klappt in der Liste auf.

Grenzen: Abgerufen werden nur öffentliche http(s)-Adressen (Adressen im lokalen Netz sind gesperrt, höchstens 3 MB). Seiten ohne Rezeptdaten oder hinter einem Login lassen sich nicht lesen.

## Rezepte aus Mealie importieren

Für Rezepte in [Mealie](https://mealie.io).

### Einrichten

1. Öffne in Mealie Dein Profil → **API-Tokens** und erzeuge einen Token.
2. Öffne in MyDietAssistant *Einstellungen → Mealie* (die Karte erscheint mit der Zusatzfunktion „Rezepte“).
3. Trage die **Adresse** des Servers ein, z. B. `http://mealie:9000`. Das Heimnetz ist erlaubt; `localhost` und Link-Local-Adressen nicht.
4. Füge den **API-Token** ein und tippe auf **Speichern**. Der Token wird nie wieder angezeigt; ein leeres Feld lässt ihn unverändert. Zum Entfernen die Adresse leeren.

### Importieren

1. Öffne **Rezepte** und tippe auf **Aus Mealie …**.
2. Suche in der Liste das Rezept und wähle es.
3. Das Rezept öffnet sich als Entwurf im Editor. Zuordnung der Zutaten, Online-Ergänzung und Prüfung funktionieren wie beim Web-Import.
4. Speichern.

Das Add-on liest nur (`GET /api/recipes`) und verändert in Mealie nichts. Der Token liegt in der Add-on-Datenbank (und damit in automatischen Sicherungen), ist aber nicht Teil des JSON-Exports. Jeder Benutzer trägt seinen eigenen Token ein.
