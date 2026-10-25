# Changelog

Alle nennenswerten Änderungen am Add-on. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## 1.6.1

### Behoben
- **Windows-Look mit Taskleiste:** Ist in HA 95 die Taskleiste aktiv, bekam das Panel nur die Standardhöhe eines Rahmens (ca. 150 px) und das Tagebuch war abgeschnitten. Ist der Rahmen so niedrig, passt die App ihn jetzt an die Fensterhöhe an.

## 1.6.0

### Neu
- **Barcode-Scanner beim Öffnen:** Einstellungen → Darstellung: „Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten“. Zusammen mit einer Homescreen-Verknüpfung der Companion-App auf das Panel „Ernährung“ öffnet sich so sofort die Kamera zum Scannen. Die Option gilt pro Gerät (im Browser gespeichert), nicht für Dein ganzes Konto.

## 1.5.2

### Behoben
- **Weitere Einstellungen in der Sicherung:** Export, Sicherungen und Import enthalten jetzt auch die Erinnerung, den Zeitplan-Hinweis, die Optik (Standard/Windows 95), die Mealie-Adresse und die Tage mit ausgeblendeten leeren Mahlzeiten (Tagessummen-Import). Der Mealie-Token wird weiterhin nicht exportiert; nach dem Einspielen auf einer frischen Installation musst Du ihn neu eintragen. Fortschrittsfotos liegen als Dateien im Add-on und sind nicht Teil der JSON-Sicherung.

## 1.5.1

### Behoben
- **Trigger in der Sicherung:** Export, automatische Sicherungen und Import enthalten jetzt die Trigger (Aktionen und Mahlzeiten-Regeln). Bisher fehlten sie in der Sicherung, und das Einspielen löschte die vorhandenen Trigger. Der Verlauf der Trigger gehört weiterhin nicht dazu. Ältere Sicherungen lassen sich weiter einspielen (ohne Trigger).

## 1.5.0

### Neu
- **Rezept-Import aus Mealie:** Unter Einstellungen → Mealie (sichtbar mit der Zusatzfunktion „Rezepte“) trägst Du Adresse und API-Token Deines Mealie-Servers ein (Heimnetz oder Add-on, z. B. `http://mealie:9000`). Danach zeigt „Rezepte“ den Button „Aus Mealie …“ mit durchsuchbarer Rezeptliste; das gewählte Rezept öffnet sich wie beim Web-Import als Entwurf im Editor (Zutaten in Gramm und Deinen Lebensmitteln zugeordnet, bei „Weitere Datenquellen“ fehlende aus Online-Datenbanken, Portionen, Zubereitung, Nährwerte zum Vergleich, Quelle = Original-Link). Das Add-on liest nur und verändert in Mealie nichts. Der Token wird nicht exportiert und nie zurückgegeben.

## 1.4.0

### Neu
- **Waage als Sensor** (Zusatzfunktion „Waage (Sensor)“): Das Körpergewicht wird automatisch aus einem Home-Assistant-Sensor übernommen, z. B. von einer smarten Waage. Einheit automatisch (aus dem Sensor) oder kg, g, lb, st mit Umrechnung. Das Add-on prüft jede Minute, übernimmt einen neuen Wert, sobald er sich eine Minute nicht mehr ändert, und speichert ihn für den Tag der Messung. Unplausible Werte (außerhalb 20 bis 500 kg), „unavailable“ und Messungen älter als 30 Tage werden ignoriert. Karte „Waage“ in den Einstellungen mit „Speichern und jetzt lesen“; die Einstellung ist Teil von Export und Import.

## 1.3.1

### Behoben
- **Rezept-Import mit Online-Datenbanken:** Zutaten ohne Grammangabe („1 Blumenkohl“, „1 Limette (Saft davon)“, „1,5 Bund Koriander“, Zimtstange, Kardamomkapsel …) bekommen ein typisches Stückgewicht und werden nachgeschlagen. Treffer müssen die Zutat selbst sein (kein „Madras Curry Sauce“ für Currypulver) und werden nach Nähe zum Namen sortiert. USDA wird nur noch gefragt, wenn Open Food Facts nichts Passendes liefert (schont das Tageslimit des Demo-Schlüssels).

## 1.3.0

### Neu
- **Statistik: Kalorien und Gewicht in einem Diagramm.** Balken für die Kalorien (linke Achse), Gewichtswerte und geglätteter Trend als Linie (rechte Achse); der Tooltip zeigt beides je Tag.
- **Statistik: Zeitraum 14 Tage** zusätzlich zu 7, 30, 90, 180 Tagen und 1 Jahr.

## 1.2.0

### Neu
- **Rezept-Import: fehlende Zutaten aus Online-Datenbanken:** Mit der Zusatzfunktion „Weitere Datenquellen“ werden Zutaten, die in Deiner Bibliothek fehlen, bei Open Food Facts und USDA gesucht (Median der passenden Treffer, pro 100 g). Sie erscheinen orange mit Quellenangabe im Editor und lassen sich wie gewohnt per ⇄ tauschen. Ohne Treffer, Internet oder Mengenangabe bleibt die Zutat rot. Ergebnisse kommen aus dem Abfrage-Zwischenspeicher, wenn vorhanden.

## 1.1.2

### Behoben
- **Barcode-Scan in der Home-Assistant-Companion-App:** Die Kameravorschau blieb auf einem Play-Symbol stehen, weil die Android-WebView Autoplay blockierte. Die Vorschau wird jetzt ausdrücklich gestartet.

## 1.1.1

### Neu
- **README und Changelog auf Englisch** (`README.en.md`, `CHANGELOG.en.md`), aus den deutschen Dateien verlinkt.
- **Screenshots** im README (Standard-Theme von Home Assistant, deutsch und englisch), erzeugt aus Beispieldaten mit `docs/make_screenshots.py`.

## 1.1.0

### Neu
- **Rezepte von Webseiten importieren** (Zusatzfunktion „Rezepte“): „Von Webseite …“ liest Name, Portionen, Zutaten, Zubereitung und Quelle aus den Rezeptdaten (schema.org) einer Kochseite. Die Zutatenzeilen werden in Gramm umgerechnet (g, kg, ml, EL, TL, Prise, Tasse, Stückangaben, Brüche und Bereiche) und Deinen Lebensmitteln zugeordnet, auch über Wortbestandteile („Weizenmehl“ → „Mehl“). Nicht zugeordnete Zutaten stehen rot im Editor, die Nährwertangabe der Seite dient als Vergleich. Rezepte haben jetzt ein Feld „Zubereitung“ und „Quelle“ (Link). Abgerufen werden nur öffentliche Adressen.
- **Gemeinsame Haushaltsbibliothek:** Ein Lebensmittel lässt sich für alle im Haushalt freigeben; sie sehen es mit „von <Name>“, tragen es ein und ändern es, die Änderung gilt sofort für alle. Löschen, Favorit und Freigabe bleiben beim Besitzer.
- **Sensor „aktuelle Mahlzeit“** (`sensor.mydiet_<name>_current_meal`) aus dem Mahlzeiten-Zeitplan; wechselt zur vollen Minute, `none` außerhalb aller Fenster.
- **Aktivität aus dem Verlauf nachladen:** „Verlauf nachladen“ im Tagebuch holt Schritte und Kalorien der letzten 30 Tage aus der Home-Assistant-Verlaufsdatenbank (Tage mit Handeingabe bleiben unberührt).
- **MQTT Discovery** (Add-on-Option `mqtt_discovery`): Sensoren mit eindeutiger ID an einem Gerät, bleiben nach einem HA-Neustart erhalten und lassen sich in Home Assistant verwalten. Gesendet wird über den Dienst `mqtt.publish`, ohne eigene Zugangsdaten; ohne MQTT-Integration gibt es weiter normale Zustände.
- **Französisch und Spanisch** als Oberflächensprachen (Einstellungen → Sprache). Der Mechanismus nimmt weitere Wörterbücher auf.
- **Weitere Datenquellen für den Tabellen-Import:** Die Spalten der französischen CIQUAL und der Schweizer Nährwertdatenbank werden erkannt.
- **my.home-assistant.io-Knopf** im README zum Hinzufügen des Repositories mit einem Klick.

### Technik
- **Browser-Tests** mit Playwright (`tests/e2e`): Start, Lebensmittel anlegen, Tagebuch, Rezept-Import-Dialog, Sprachwechsel; laufen in GitHub Actions.
- **Add-on-Linter** (`lint.yml`) prüft die Konfiguration bei jedem Push.
- **Fertige Images:** `build.yml` baut amd64 und aarch64 und legt sie in die GitHub Container Registry (bei Versions-Tags oder von Hand); aktiviert wird das durch die Zeile `image:` in der `config.yaml` (siehe README).
- Migration 3: Spalten `recipes.source`, `recipes.instructions`, `foods.shared`; Export und Import tragen sie mit.
- Die Tests prüfen jetzt, dass Französisch und Spanisch jeden englischen Schlüssel samt Platzhaltern abdecken.

### Geändert
- Die Online-Prüfung eigener Lebensmittel berücksichtigt nur noch die eigenen, nicht die freigegebenen anderer.

## 1.0.0

Erste veröffentlichte Version. Außer den neuen Funktionen unten steht jetzt eine automatische Test-Suite hinter dem Add-on (siehe „Technik“).

### Neu
- **Aktivität** (Zusatzfunktion): Schritte und verbrannte Kalorien aus Home-Assistant-Sensoren oder von Hand erhöhen das Tagesziel des jeweiligen Tages um einen einstellbaren Anteil (Standard 50 %). Ohne Kalorien-Sensor werden die Kalorien aus Schritten und Körpergewicht geschätzt. Das Tagebuch zeigt Schritte, Verbrauch und den Zuschlag; Statistik und Sensor „verbleibende kcal“ rechnen mit dem erhöhten Ziel. Die Sensoren werden alle fünf Minuten gelesen (nur im echten Home Assistant, dort noch ungeprüft).
- **Mahlzeiten-Zeitplan** (Zusatzfunktion): Zeitfenster pro Mahlzeit (Standardfenster für Frühstück, Mittag- und Abendessen), im Tagebuch „Jetzt: Mittagessen“ mit Hinzufügen-Knopf und hervorgehobener Mahlzeit; auf Wunsch eine Benachrichtigung, wenn ein Fenster beginnt und die Mahlzeit noch leer ist.
- **Zwischenspeicher für Online-Abfragen:** Barcodes (60 Tage) und Suchbegriffe (14 Tage) bei Open Food Facts und USDA werden lokal gespeichert; wiederholte Suchen gehen nicht mehr ins Internet. Einsehbar und leerbar unter Einstellungen.
- **Barcode am Lebensmittel:** Das Feld wird gespeichert und exportiert. Im Hinzufügen-Dialog gibt es „Barcode scannen“ und „Foto vom Barcode“: eigene Lebensmittel mit dem Code werden direkt gewählt, unbekannte Codes bei Open Food Facts nachgeschlagen.
- **Barcode-Leser für iPhone, Firefox und Safari:** Wo der Browser keine eigene Erkennung hat, wird die mitgelieferte ZXing-Bibliothek (Apache-2.0) bei Bedarf nachgeladen.
- **Werte online prüfen** (Lebensmittel, mit „Weitere Datenquellen“): Alle eigenen Lebensmittel in einem Durchgang mit Open Food Facts (Barcode, sonst Name) vergleichen, Abweichungen ansehen und Werte einzeln übernehmen. Optional auch USDA.
- **Lebensmittel-Tabelle importieren:** CSV, TXT oder Excel mit Nährwerten pro 100 g, erkennt unter anderem die BLS-Kürzel und Open-Food-Facts-Spalten, rechnet kJ in kcal und Natrium in Salz um, überspringt vorhandene Lebensmittel und setzt eine Kategorie.
- **Lebensmittel und Mahlzeiten teilen** (Zusatzfunktion „Haushalt“): ⇪ bei einem Lebensmittel oder einer gespeicherten Mahlzeit legt eine Kopie in der Bibliothek anderer Haushaltsmitglieder ab. Gleichnamige Einträge bleiben unverändert, spätere Änderungen werden nicht abgeglichen.
- **Mengen in Unzen:** Einstellung „Lebensmittelmengen“ (Gramm oder oz) für Einträge, Portionen, Rezepte, gespeicherte Mahlzeiten und Teilen. Gespeichert wird weiter in Gramm.
- **Symbol und Logo** für die Add-on-Seite, `url` in der Add-on-Konfiguration.

### Technik
- **Automatische Tests** (`tests/`, pytest, 70 Tests) und **GitHub Actions**: Tagebuch, Ziele, Import/Export mit Rundreise, Tabellen-Importe, Trigger-Bedingungen (Zeitfenster, Haltedauer, Start-/Endtag), Migrationen alter Datenbanken, neue Funktionen und Prüfungen der Oberfläche (referenzierte Dateien, Reihenfolge der Übersetzung, doppelte Schlüssel, Version in `config.yaml` gleich Changelog).
- **Datenbank-Migrationen mit Versionsnummer** statt einzelner Spaltenprüfungen; vor einer Migration entsteht eine Kopie `mydiet.db.v<n>.bak`.
- **Indizes** für Lebensmittel, Einträge, Mahlzeiten und Gewicht. Die Lebensmittelliste lädt seitenweise („Mehr laden“) und sucht auf dem Server; Hinzufügen-Dialog und Tauschen-Dialog suchen ab zwei Buchstaben ebenfalls dort, so bleibt auch eine Bibliothek mit Tausenden Lebensmitteln flott. Die Jahresstatistik (und Bericht und Export), die für jeden Tag das Ziel berechnet, liest Einstellungen jetzt einmal statt je Tag aus der Datenbank: ein Jahr dauert statt fast zwei Sekunden etwa eine Viertelsekunde.

### Behoben
- Im Mengen-Dialog eines Lebensmittels ohne Portionsgrößen stand das Wort „null“ über dem Mengenfeld.

## 0.26.1

### Behoben
- Tagebuch und Einstellungen blieben nach einem Update leer. Ursache: Browser und HA-App hatten eine ältere `index.html` zwischengespeichert, die das neue Skript `i18n.js` (seit 0.21.0) nicht kannte; das Programm brach beim Start ab, nur die Reiter blieben sichtbar. Die Übersetzung steckt jetzt direkt in `app.js`, und die Startseite wird mit `Cache-Control: no-cache` ausgeliefert, damit so etwas bei künftigen Updates nicht mehr passiert.

## 0.26.0

### Neu
- **Benutzerverwaltung** (Einstellungen, nur für Administratoren): Liste aller Benutzer mit Einträgen, Tagen, Lebensmitteln und letzter Aktivität, Export der Daten eines Benutzers als JSON und endgültiges Löschen seiner Daten (mit Eingabe des Namens zur Bestätigung; das eigene Konto ist ausgenommen). Administratoren sind die Benutzer aus der neuen Add-on-Option `admin_users` (IDs oder Namen); ist sie leer, gilt der erste Benutzer, der das Add-on geöffnet hat. Das Add-on merkt sich Benutzer ab diesem Update, sobald sie es öffnen.
- **Haushalt** als Zusatzfunktion: Im Dialog eines Tagebucheintrags „Teilen …“ trägt den Eintrag am selben Tag in die Tagebücher anderer Benutzer ein, jeder mit eigener Menge (z. B. ein Gericht für die Familie, Menge in Gramm oder als Vielfaches). Der Eintrag heißt dort „Name (von Absender)“. Teilen ist nur zwischen Benutzern möglich, die beide „Haushalt“ eingeschaltet haben.

## 0.25.0

### Neu
- **Weitere Importe** (Einstellungen → Daten → „Weitere Importe …“):
  - **CSV aus anderen Apps** (Cronometer `servings.csv` und `biometrics.csv`, FDDB, Yazio, Google-Fit-Takeout und ähnliche Tabellen): Trennzeichen, Datumsformat (TT.MM.JJJJ, MM/TT/JJJJ, ISO), Dezimalkomma und Mengenangaben („80 g“, „2 oz“) werden erkannt. Die Spalten werden anhand der Überschriften (deutsch und englisch) zugeordnet und lassen sich in der Vorschau korrigieren. Mahlzeiten wie Breakfast/Lunch/Dinner landen in Frühstück/Mittagessen/Abendessen. Gewichte in kg, lb oder Stone.
  - **Apple Health** (`export.zip` oder `export.xml`): wird direkt im Browser gelesen (auch sehr große Dateien), übernommen werden Körpergewicht und auf Wunsch die Tagessummen der Ernährung. Hochgeladen werden nur die Tageswerte.

### Hinweis
- Die Spaltenerkennung ist für Cronometer, FDDB-ähnliche deutsche Tabellen und Google Fit mit Beispieldateien geprüft. Bei Yazio und echten FDDB-Exporten konnte ich kein Original ansehen; falls die Zuordnung nicht passt, lässt sie sich in der Vorschau korrigieren.

## 0.24.0

### Neu
- **Export für Berater und Trainer** (Einstellungen → Export für Berater und Trainer): Zeitraum wählen und
  - einen **Bericht** öffnen, der sich drucken oder über den Druckdialog als PDF speichern lässt: Zusammenfassung (Ø Kalorien und Makros, Tage im Ziel, Gewichtsverlauf, Ziel der Person), Balkendiagramm mit Ziellinie, Tagesübersicht mit Gewicht und Notizen, auf Wunsch alle einzelnen Einträge sowie Körpermaße. Sprache und Einheiten folgen Deinen Einstellungen.
  - eine **Tagesübersicht als CSV** (Kalorien, Ziel, Makros, Gewicht, Notiz, auf Wunsch weitere Nährwerte).

## 0.23.0

### Neu
- **Makro-Verlauf** in der Statistik: Eiweiß, Kohlenhydrate oder Fett als Balken pro Tag, dazu das Tagesziel als gestrichelte Linie (folgt Wochentagszielen und Zielprofilen) und der gleitende 7-Tage-Durchschnitt.
- **Mobile Bedienung:** größere Touch-Flächen (Knöpfe, Eingabefelder, Listen), 16-px-Schrift in Feldern, damit das Handy nicht hineinzoomt, und im Tagebuch **Wischen nach links/rechts** wechselt den Tag.

### Geändert
- **Windows-Look bei dunklen Themes:** Eingabefelder, Tabellenzeilen und Schrift waren auf dunklen HA-Themes kaum lesbar (weiße Felder mit heller Schrift). Der Look erkennt jetzt helle und dunkle Themes und passt Felder, Schriftfarbe, Rot/Grün und die Kanten der Bedienelemente an.
- Die Statistik liefert die Tagesziele aller Makros je Tag.

## 0.22.0

### Neu
- **Weitere Datenquellen** als Zusatzfunktion (Einstellungen → Zusatzfunktionen → „Weitere Datenquellen“, standardmäßig aus, da Suchbegriffe ins Internet gehen): Im Formular für Lebensmittel erscheint „Online suchen & vergleichen“.
  - Suche nach Name oder Barcode in **Open Food Facts** und **USDA FoodData Central** (englische Namen, viele Grundnahrungsmittel).
  - **Abgleich:** Alle Treffer pro 100 g nebeneinander, mit Abweichung der kcal zu den Werten im Formular (über 15 % rot) und Warnhinweis, wenn die Quellen untereinander stark abweichen.
  - „Übernehmen“ füllt das Formular, „Mittelwert der gewählten übernehmen“ mittelt mehrere Treffer.
- Neue Add-on-Option `usda_api_key` (optional, Schlüssel von api.data.gov); ohne Schlüssel gilt der gemeinsame DEMO_KEY mit niedrigem Limit.

### Geändert
- Anfragen an Open Food Facts senden jetzt einen eigenen User-Agent, wie von Open Food Facts gewünscht.

## 0.21.0

### Neu
- **Englische Oberfläche** und **imperiale Einheiten**: Einstellungen → Sprache und Einheiten (Deutsch / English / automatisch, metrisch / imperial). Gewicht erscheint dann in lb, Körpermaße in Zoll, Zahlen und Datumsformate passend zur Sprache. Gespeichert wird weiterhin in kg und cm, nichts muss umgerechnet werden. Fehlermeldungen des Servers werden mitübersetzt.
- Übersetzungen der Add-on-Optionen in Home Assistant (Deutsch und Englisch).

### Hinweis
- Namen und Texte, die Du selbst vergeben hast (Lebensmittel, Notizen, Trigger-Titel), bleiben unverändert. Die vier Standard-Mahlzeiten (Frühstück, Mittagessen, Abendessen, Snacks) erscheinen auf Englisch als Breakfast, Lunch, Dinner, Snacks. Mengen in Lebensmitteln bleiben in Gramm.

## 0.20.0

### Neu
- **Barcode-Scan per Kamera** im Formular „Neues Lebensmittel“: „Scannen (Kamera)“ liest EAN/UPC live, „Foto vom Barcode“ liest ihn aus einem Foto (funktioniert auch ohne HTTPS). Danach wird das Produkt automatisch bei Open Food Facts gesucht. Voraussetzung ist die Barcode-Erkennung des Browsers (Chrome, Android, HA-App auf Android); wo sie fehlt, kommt ein Hinweis und die Nummer lässt sich weiter eintippen.

## 0.19.0

### Neu
- **Rezepte** als Zusatzfunktion (Einstellungen → Zusatzfunktionen → „Rezepte“, standardmäßig aus), eigener Reiter „Rezepte“:
  - Zutaten aus Deinen Lebensmitteln mit Mengen, Anzahl der Portionen und optional dem Gewicht nach dem Kochen (dann stimmen die Werte pro 100 g).
  - Anzeige pro Portion und gesamt, Zutaten tauschen oder in der Menge ändern, Kopie anlegen.
  - Jedes Rezept legt automatisch ein Lebensmittel an (pro 100 g, mit der Portion „1 Portion“) und hält es aktuell. So lässt es sich im Tagebuch, in Mahlzeiten und per Trigger wie jedes andere Lebensmittel nutzen.
- Rezepte sind im JSON-Export und in der Wiederherstellung enthalten.

## 0.18.0

### Neu
- **Mein Ziel: Abnehmen, Halten oder Zunehmen** (Einstellungen → Tagesziele), dazu die gewünschte Änderung in kg pro Woche. Das Ziel bestimmt:
  - wann ein Tag „im Ziel“ ist (Abnehmen: höchstens so viele kcal, Zunehmen: mindestens, Halten: ±10 %) in Bericht und Vergleich,
  - die Färbung in Tagebuch und Diagramm (beim Zunehmen ist „drüber“ nicht mehr rot),
  - eine Auswertung in der Kalorienbilanz: Trend gegen Ziel und ein passender Kalorienwert (geschätzter Verbrauch ± Ziel, mindestens 1200 kcal) zum Übernehmen als Tagesziel.
- Das Ziel ist im JSON-Export enthalten.

## 0.17.0

### Neu
- **Körpermaße und Fortschrittsfotos** als Zusatzfunktion (Einstellungen → Zusatzfunktionen, standardmäßig aus), im Reiter Gewicht:
  - Taille, Brust, Hüfte, Oberarm, Oberschenkel und Körperfett in %, dazu eigene Messungen (z. B. Wade), mit Verlaufsdiagramm und Veränderung.
  - Fotos hochladen (werden vorher auf 1280 px verkleinert), Galerie und Vergleich zweier Fotos nebeneinander. Die Fotos liegen im Add-on-Datenordner, nicht im JSON-Export und nicht in den automatischen Sicherungen; die Home-Assistant-Sicherung des Add-ons enthält sie.
- Körpermaße sind im JSON-Export und in der Wiederherstellung enthalten.

### Geändert
- Gewichtsdiagramm: bei sehr kleinen Schwankungen Achsenschritte von 0,5 kg.

## 0.16.2

### Geändert
- Notizen sind jetzt eine Zusatzfunktion (Einstellungen → Zusatzfunktionen → „Notizen“, standardmäßig aus). Vorhandene Notizen bleiben gespeichert, auch wenn die Funktion aus ist, und erscheinen wieder, sobald Du sie einschaltest. Wenn Du bisher Notizen genutzt hast, schalte die Option einmal ein.

## 0.16.1

### Behoben
- Tagebuch und Einstellungen blieben leer, sobald eine Mahlzeit nur an bestimmten Tagen angezeigt werden sollte (Mahlzeiten-Regel mit Zustand, z. B. „Sport“ nur im Fitnessstudio). Seit 0.11.0 fehlten diesen Regeln Zeitfenster und Haltedauer, die Abfrage brach mit einem Fehler ab. Betroffen waren nur Zustands-Regeln für heute; die Daten sind unverändert.

## 0.16.0

### Neu
- **Mehrere Bedingungen pro Trigger:** Im Trigger-Dialog „+ Weitere Bedingung“ (Zustand oder Kalender, auch „ist NICHT“). Verknüpfung wahlweise UND (alle müssen zutreffen, z. B. Kalender „Nachtschicht“ UND Person zu Hause) oder ODER. Zeitfenster gilt für den ganzen Trigger. Für im Voraus geplante Kalendertage zählen nur Kalender-Bedingungen.
- **Tagesziel-Profile** (Zusatzfunktion „Tagesziele pro Wochentag“): Profile wie „Training“ und „Ruhetag“ mit eigenen kcal/Makros (inkl. Kalorienrechner). Ein Trigger kann mit „Dann: Tagesziel wechseln“ den Tag auf ein Profil schalten, z. B. wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel, Tagebuch und Statistik zeigen es an; der Verlauf bietet „Rückgängig“.
- Sicherung enthält Tagesziel-Profile und deren Zuordnung zu Tagen.

## 0.15.0

### Neu
- **Trigger pausieren:** ⏸ am Trigger, wahlweise heute, 3 Tage, 1 Woche, 30 Tage oder bis zu einem Datum. Der Trigger behält seine Einstellungen und läuft danach von selbst weiter; ▶▶ beendet die Pause früher. (Der Haken „Aktiv“ bleibt für dauerhaftes Abschalten.)
- **Portionsgrößen:** Pro Lebensmittel lassen sich benannte Portionen hinterlegen („1 Scheibe = 40 g“). Beim Hinzufügen und Tauschen gibt es dann die Auswahl „Anzahl × Portion“, die Menge in Gramm folgt automatisch.
- **Weitere Nährwerte** (Zusatzfunktion, Einstellungen → Zusatzfunktionen): Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln, Einträgen, gespeicherten Mahlzeiten und in der Sicherung. Open Food Facts liefert sie beim Barcode-Abruf mit. Tagessumme im Tagebuch, Tagesdurchschnitt in der Statistik.
- `CLAUDE.md` mit Projektüberblick, Konventionen und Release-Ablauf.

### Geändert
- Gespeicherte Mahlzeiten behalten beim Bearbeiten die weiteren Nährwerte.

## 0.14.1

### Neu
- **Tagesziele als Rechner:** Mit „Kalorien aus Makros berechnen“ (Einstellungen → Tagesziele) ändern sich die Kalorien, sobald Eiweiß, Kohlenhydrate oder Fett geändert werden (4/4/9 kcal pro g). Dazu die prozentuale Verteilung. Gilt auch für die Wochentagsziele. Ausgeschaltet zeigt ein Hinweis, wenn die Makros nicht zu den Kalorien passen.

### Behoben
- Statistik: Die Kalorien-Achse (Y) zeigt jetzt runde Werte (z. B. 0, 500, 1.000 …) statt krummer Zwischenwerte.

## 0.14.0

### Neu
- **Notizen** im Tagebuch: Freitext pro Tag und pro Mahlzeit (Hunger, Training, Stimmung); in der Sicherung enthalten.
- **Tastaturbedienung:** ← / → Tag wechseln, T heute, N hinzufügen, / Suche fokussieren.
- **Automatische Sicherung:** täglich eine JSON-Sicherung nach `/backup/mydiet/` mit einstellbarer Aufbewahrung (`auto_backup`, `backup_keep_days`); Liste und „Jetzt sichern“ in den Einstellungen.
- **Wiederherstellung mit Vorschau:** vor dem Einspielen (Datei oder automatische Sicherung) werden jetzt-Zustand und Sicherung gegenübergestellt.
- **Schnittstelle für Automationen** (`api_key`): `POST /api/ext/entry` und `/api/ext/weight`, z. B. per `rest_command` (Beispiele in DOCS.md).
- **Erinnerung:** Benachrichtigung über einen HA-Notify-Dienst, wenn bis zur Uhrzeit nichts eingetragen wurde.
- **Trigger-Fehler** werden dauerhaft im Trigger-Bereich der Einstellungen angezeigt.
- **Zeitzone** wird beim Start aus Home Assistant übernommen.

### Geändert
- Tabellenköpfe im Tagebuch schlanker: keine dicken Farbbalken mehr, nur kleine Beschriftung über einer feinen Linie.
- Neue Add-on-Option `backup`-Zugriff (`map: backup`); nach dem Update das Add-on neu bauen, damit der Zugriff gilt.

## 0.13.0

### Neu
- **Bericht & Zeitraum-Vergleich** (Statistik): Durchschnitt, Eiweißziel- und Kalorienziel-Tage, bester/schwächster Tag und Gewichtsänderung für einen Zeitraum, auf Wunsch neben einem zweiten Zeitraum mit Differenz. Schnellwahl „7 Tage vs. davor“ (Wochenbericht) und „30 Tage vs. davor“, Zeiträume frei wählbar (z. B. Diätphase 1 gegen 2).

## 0.12.1

### Geändert
- Tagesübersicht im Tagebuch: Spalten stehen jetzt exakt unter denen der Mahlzeiten, Reihenfolge Tagesziel, Gesamt, Verbleibend.

## 0.12.0

### Neu
- **Ganzen Tag kopieren:** Im Tagebuch unter der Tagessumme; alle Einträge samt Mahlzeit und Uhrzeit auf einen anderen Tag, optional mit Mengenfaktor.
- **Gespeicherte Mahlzeit kopieren** (⧉ in der Mahlzeitenliste): legt „… (Kopie)“ an und öffnet sie gleich zum Bearbeiten – ideal für Varianten mit getauschten Komponenten.
- **Wasser & Ergänzungen in der Statistik:** Ø pro Tag, eingetragene Tage und Tage mit erreichtem Ziel für den gewählten Zeitraum (nur mit aktivierter Zusatzfunktion).

## 0.11.0

### Neu
- **Uhrzeit-Trigger:** trägt täglich zu einer festen Zeit ein („täglich 07:30 Vitamine“), ganz ohne HA-Entität.
- **Zeitfenster und Haltedauer für Trigger:** Trigger können auf eine Tageszeit beschränkt werden (auch über Mitternacht). Zustands-Trigger tragen optional erst ein, wenn der Zustand seit X Minuten anliegt (z. B. seit 20 Minuten im Fitnessstudio).
- **Trigger-Verlauf** (Einstellungen): Liste, wann welcher Trigger was eingetragen hat, mit „Rückgängig“. Der Trigger trägt an diesem Tag nicht erneut ein.
- **Favoriten:** Lebensmittel mit ☆ markieren, eigener Reiter „★ Favoriten“ im Hinzufügen-Dialog.
- **Duplikate zusammenführen** (Lebensmittel → Duplikate suchen): gleiche Namen erkennen, eines behalten, Trigger werden umgehängt.
- **Mehr Sensoren:** `kcal_remaining_today`, `kcal_week_avg`, `weight_trend` und `energy_balance` (siehe DOCS.md, dort auch eine fertige Dashboard-Karte).

## 0.10.0

### Neu
- **Mouse-over in den Diagrammen:** Beim Überfahren (bzw. Antippen) eines Balkens oder Messpunkts erscheinen Datum und genaue Werte (kcal, Ziel, Makros bzw. Gewicht und Trend).
- **Zusatzfunktionen** (Einstellungen → Zusatzfunktionen), standardmäßig aus und einzeln aktivierbar:
  - *Tagesziele pro Wochentag* (kcal und Makros je Wochentag; Tagebuch und Statistik nutzen das Ziel des jeweiligen Tages).
  - *Wasser und Nahrungsergänzung* (Wasser, Koffein, Kreatin vorbelegt; eigene Einträge mit Einheit, Tagesziel und Schrittweite; +/− Knöpfe im Tagebuch).
- **Mahlzeiten bearbeiten:** Gespeicherte Mahlzeiten lassen sich komponentenweise ändern (Menge, Lebensmittel tauschen ⇄, Komponente entfernen oder hinzufügen). Im Tagebuch gibt es beim Bearbeiten eines Eintrags „Lebensmittel tauschen“.
- **Schnelleingabe:** Eintrag nur mit Name, kcal und optional Makros (Hinzufügen-Dialog), nachträglich bearbeitbar.
- **Plausibilitätsprüfung:** Warnhinweis, wenn kcal nicht zu den Makros passen (Lebensmittel-Formular, ⚠ in der Liste, Schnelleingabe). Speichern bleibt möglich.
- **Gewichtstrend:** geglättete Trendlinie (Tagesschwankungen ausgeblendet), Trend-Kachel und **Prognose** für das Zielgewicht.

### Geändert
- Statistik: Achsenbeschriftung auf runden Daten (5er-Schritte, 1./15., Monatsanfänge) statt gleichmäßig verteilter Tage.
- Sicherung (JSON) enthält Wochentagsziele, Tracker und Zusatzfunktionen.

## 0.9.2

### Behoben
- Windows-Look: gleichmäßige Abstände zwischen den Reitern.

## 0.9.1

### Behoben
- Windows-Look: Rot/Grün bei „Verbleibend“ wurde überdeckt; feststehende Leiste mit grauem Streifen unter den Reitern, damit Inhalt nicht darunter hervorschaut.
- Einstellungen → Darstellung: Hinweistext stand unter „Optik“ statt unter „Tagebuch“.

## 0.9.0

### Neu
- **Kalender-Trigger mit Termin-Zeitraum:** Eintrag wahlweise an jedem Tag des Termins, nur am Starttag oder nur am Endtag (z. B. Nachtschicht Do 22 Uhr bis Fr 6 Uhr nur am Freitag). Gilt auch für die Einblend-Regeln von Mahlzeiten.
- Windows-Look: Benutzer-Icon in der Titelleiste, Fortschrittsbalken als Ladebalken aus Blöcken, rote/grüne Schrift bei den verbleibenden Werten, türkiser Desktop-Hintergrund.

### Behoben
- Windows-Look: doppelter Rahmen um den Reiterbereich entfernt.

## 0.8.1

### Behoben
- Trigger und HA-Sensoren funktionierten nicht (401 Unauthorized): Das Supervisor-Token kam im Add-on nicht an. Es wird jetzt auch aus dem Container-Environment gelesen.

## 0.8.0

### Neu
- **Windows-Look:** Fenster mit Titelleiste, klassische Reiter, erhabene/eingesunkene Rahmen, Dialoge als Fenster. Farben kommen weiter aus dem HA-Theme (Fensterfläche = Kartenfarbe, Titelleiste = Primärfarbe).
- Wird automatisch aktiviert, wenn das gewählte HA-Theme „HA 95“/„HA 98“ (oder „Windows …“) heißt. Unter Einstellungen → Darstellung → Optik lässt es sich auch fest ein- oder ausschalten.

### Behoben
- „Häufig verwendet“ im Hinzufügen-Dialog war nicht wie die übrige Liste formatiert.

## 0.7.1

### Behoben
- Leerzeichen zwischen Zahl und Text im Knopf „n leere/ausgeblendete Mahlzeit(en) anzeigen“.
- Die Trigger-Prüfung läuft jetzt in einem eigenen Hintergrund-Thread statt über einen Startup-Hook, der je nach FastAPI-Version nicht mehr ausgeführt wird.

### Neu
- **Diagnose für Trigger:** Einstellungen → Trigger → „Jetzt prüfen“ führt die Prüfung sofort aus und zeigt Ergebnis bzw. Fehler an; dieselben Meldungen stehen im Add-on-Protokoll.

## 0.7.0

### Neu
- **Trigger bearbeiten:** Trigger und Einblend-Regeln lassen sich per ✎ ändern.
- **Mahlzeiten ausblenden (⊘):** Mahlzeiten erscheinen dann nur noch an Tagen mit Einträgen und werden nicht mehr als Kopierziel angeboten – z. B. für „MyFitnessPal (Tagessumme)“ aus dem Import. Die durch einen Tageswerte-Import angelegte Mahlzeit wird automatisch ausgeblendet.

### Geändert
- Das ✕ zum Leeren einer Mahlzeit sitzt wieder in der Summenzeile (bei den Makros der Mahlzeit) statt in der Titelzeile.

## 0.6.0

### Neu
- **Tage im Voraus:** Kalender-Trigger tragen ihr Lebensmittel bzw. ihre Mahlzeit auf Wunsch schon für die nächsten N Tage ein (Einstellung pro Trigger, 0–60), sobald dort ein passender Termin steht. Jeder Tag wird nur einmal befüllt; Einträge für künftige Tage haben keine Uhrzeit.

## 0.5.0

### Neu
- **NICHT-Bedingung** für Trigger und Einblend-Regeln, z. B. „calendar.schichtplan enthält nicht Frühschicht“ oder „Zustand ≠ Fitnessstudio“.

### Geändert
- „Als Mahlzeit speichern“ und „Kopieren“ sind ein gemeinsamer Button **Speichern / Kopieren** mit zwei Reitern im Dialog.
- „Mahlzeit leeren“ ist jetzt ein ✕ am rechten Rand der Mahlzeiten-Kopfzeile, analog zum Löschen einzelner Einträge.

## 0.4.0

### Neu
- **Mahlzeiten-Seite:** gespeicherte Mahlzeiten haben einen eigenen Reiter (Suchen, Bearbeiten, Kategorie, Trigger, Löschen).
- **Mahlzeiten kopieren:** Einträge einer Tagebuch-Mahlzeit lassen sich in eine andere Mahlzeit oder auf einen anderen Tag kopieren (mit Auswahl einzelner Einträge).
- **Mahlzeit leeren:** alle Einträge einer Tagebuch-Mahlzeit (bzw. des Tages im Zeitmodus) mit einem Klick löschen.
- **Häufig verwendet:** der Hinzufügen-Dialog schlägt oft genutzte Lebensmittel und Mahlzeiten vor, passend zur jeweiligen Tagebuch-Mahlzeit.
- **Mahlzeiten per Trigger einblenden:** eine Tagebuch-Mahlzeit (z. B. „Nachtschicht“) erscheint nur an Tagen, an denen ein Kalendertermin bzw. ein HA-Zustand zutrifft. Tage mit Einträgen bleiben immer sichtbar; ausgeblendete Mahlzeiten lassen sich per Klick einblenden.
- **MFP-Import (nur Tageswerte):** Nachfrage, ob die leeren Mahlzeiten an den importierten Tagen ausgeblendet werden sollen.
- **Statistik:** zusätzlich 180 Tage und 1 Jahr.

### Geändert
- Gewichtsdiagramm: gerade Gewichtswerte auf der Y-Achse, Zwischendaten auf der X-Achse.
- Gewichtsverlauf zeigt nur noch die letzten 10 Einträge, erweiterbar.

### Behoben
- In Dialogen erschien auf der Karte der Text „null“.

## 0.3.0

### Neu
- **Import/Export:** JSON-Sicherung (Wiederherstellung), CSV-Export und MyFitnessPal-CSV-Import (komplett oder nur Tageskalorien/Makros plus Gewicht).
- **Mahlzeiten speichern** aus dem Tagebuch und wieder hinzufügen (mit Portionsfaktor).
- **Kategorien** für Lebensmittel und Mahlzeiten (z. B. Diät/Bulk), ein-/ausblendbar.
- **Kalorienbilanz** aus Gewichtstrend und Aufnahme (Defizit/Überschuss, geschätzter Verbrauch).
- **Trigger:** HA-Zustand oder Kalendertermin trägt ein Lebensmittel/eine Mahlzeit einmal pro Tag ins Tagebuch ein.
- **Zeitansicht:** Tagebuch alternativ nach Uhrzeiten statt nach festen Mahlzeiten.

## 0.2.0

### Geändert
- Optik folgt dem aktiven HA-Theme deutlich genauer (Schriften, Buttons, Eingabefelder, Radien).

## 0.1.0

- Erste Version: Add-on mit Ingress-UI (FastAPI + SQLite), Mehrbenutzerbetrieb über HA-Benutzer, Ernährungstagebuch mit eigenen Mahlzeiten, Lebensmittel (inkl. Open-Food-Facts-Barcodesuche), Gewicht, Statistik, Tagesziele und HA-Sensoren.
