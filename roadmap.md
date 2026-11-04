# Roadmap

Ideensammlung für MyDietAssistant. Reihenfolge und Zuschnitt sind Vorschläge, keine Zusagen. Bereits Umgesetztes steht im [Changelog](mydiet/CHANGELOG.md).

Aufwand: **S** = Stunden, **M** = ein bis zwei Abende, **L** = größeres Vorhaben.

## Home Assistant

- **Sprach-Eintrag mit Rückfragen** (M): bei mehrdeutigen Treffern („Apfel“ oder „Apfelsaft“?) nachfragen und Synonyme für Lebensmittel pflegen; nötig sind echte Sätze aus dem Alltag.

## Tagebuch und Statistik

- **Mahlzeit-Vorschläge überarbeiten, besonders für Sporttage** (M): offen ist, was an heutigen Vorschlägen nicht passt (zu wenige kcal/Kohlenhydrate, falsche Verteilung auf die restlichen Mahlzeiten, Aktivität nicht berücksichtigt?); Grundlage sind `suggest.py` und `extras13.py` (Trainingsmodus vorhanden).
- **X zum Löschen in der Companion-App** (S): Darstellung der Löschen-Schaltfläche im Tagebuch bei schmaler Ansicht (HomeAssistantXP-Look) überarbeiten; Zeilenumbruch und Spaltenbreiten prüfen.

## Plattformen

- **Eigene Android-App** (L): Kotlin-App in einem eigenen Ordner `android/`. Verbindung über HA-Login (OAuth, kein neuer Port): Anmeldung bei HA, Ingress-Sitzung über die Supervisor-Schnittstelle holen, Oberfläche im WebView laden (wie die Companion-App). Danach eine JavaScript-Brücke für native Teile: Barcode-Kamera (ML Kit), Homescreen-Widget mit Kalorienstand und Schnelleingabe, Health Connect (Gewicht, Aktivität). Risiken: Ingress-Sitzung verlangt vermutlich Admin-Rechte in HA (Add-on-Panel); Anmeldung und Token-Erneuerung außerhalb des Heimnetzes; Veröffentlichung nur als APK von Hand (kein Play Store). Stand: Schritt 1 (Hülle mit Anmeldung) liegt in `android/`, am echten HA noch ungeprüft (Debug-APK ist auf dem Pixel 7 installiert, Rückmeldung: sieht gut aus; geprüft noch: Admin-Rechte, Sitzungserneuerung, Kamera, Upload, Download; `blob:`-Downloads gehen nicht). Fake-HA zum Testen: `android/tools/fakeha.py`. Weiter: 2) Barcode, 3) Widget, 4) Health Connect.

## Lebensmittel und Eingabe

- **Rezept-Import aus einem Foto** (L): braucht eine Texterkennung (lokal oder über einen Dienst); Text einfügen geht seit 1.18.
- **Weitere Sprachen** (S je Sprache): zum Beispiel Türkisch oder Schwedisch; ein Wörterbuch in `static/app.js` (über 920 Texte), ein Eintrag in `LANGS` (`extras.py`), Bericht-, Wochenbericht- und Push-Texte in `extras6.py`, `extras16.py` und `extras2.py`, `translations/<sprache>.yaml` für die Add-on-Optionen und die Sprachauswahl.
- **Tabellenformate mit echten Dateien prüfen** (S): CIQUAL, Schweizer Datenbank, USDA und Österreichische Tabelle sind erkannt, bisher nur gegen Beispielüberschriften geprüft.

## Technik und Qualität

- **Browser-Tests vertiefen** (M): die Kamera-Abfrage des Barcode-Scanners mit einer simulierten Kamera, weitere Dialoge in der Handy-Ansicht und Windows-Look-Details ergänzen.
- **Wörterbücher prüfen lassen** (S): Muttersprachler für Französisch, Spanisch, Niederländisch, Italienisch, Portugiesisch und Polnisch, bisher maschinell erstellt und nur formal geprüft (gleiche Schlüssel, gleiche Platzhalter).
- **Offline-Start der App** (M): die App selbst ohne Verbindung öffnen können (Service Worker, mit Ingress schwierig); Eintragen ohne Verbindung geht seit 1.19, solange die App offen ist.
- **Barrierefreiheit mit Screenreader prüfen** (S): Namen, Rollen und Tastaturbedienung sind seit 1.19 getestet; offen sind ein Durchgang mit echten Screenreadern und Kontrastmessungen (besonders Windows-95-Look).
