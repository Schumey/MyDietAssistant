// UI translation. The interface text in app.js, index.html and the server's error messages is German;
// when the language is English, this layer translates it on the fly:
//  - exact strings are looked up in EN,
//  - keys containing {} are templates (numbers/names filled in by the app) and are matched as patterns,
//  - a MutationObserver translates text nodes and title/placeholder/aria-label attributes as they appear,
//  - confirm/alert/prompt dialogs go through the same lookup.
// Strings without an entry stay German, so a missing entry never breaks the app.
const EN = {
  // tabs, header
  "Ernährung": "Nutrition", "Tagebuch": "Diary", "Lebensmittel": "Foods", "Mahlzeiten": "Meals", "Rezepte": "Recipes",
  "Gewicht": "Weight", "Statistik": "Statistics", "Einstellungen": "Settings", "Lokal": "Local",

  // diary
  "Kategorien:": "Categories:", "Ein-/ausblenden": "Show/hide", "Vortag": "Previous day", "Folgetag": "Next day",
  "Bearbeiten": "Edit", "Entfernen": "Remove", "Kalorien": "Calories", "Kohlenhydrate": "Carbohydrates", "Fette": "Fats", "Eiweiß": "Protein",
  "+ Nahrungsmittel hinzufügen": "+ Add food", "Notiz zur Mahlzeit": "Note for this meal", "Tag": "Day", "Notiz ändern": "Edit note", "Notiz": "Note",
  "Speichern / Kopieren": "Save / Copy", "Mahlzeit leeren": "Clear meal", "Tag leeren": "Clear day",
  "Alle Einträge von „{}“ löschen?": "Delete all entries of “{}”?", "Alle Einträge dieses Tages löschen?": "Delete all entries of this day?",
  "Einträge": "Entries", "Ausgeblendete Mahlzeiten wieder verbergen": "Hide hidden meals again",
  "leere/ausgeblendete Mahlzeit anzeigen": "show empty/hidden meal", "leere/ausgeblendete Mahlzeiten anzeigen": "show empty/hidden meals",
  "Tagesziel ({})": "Daily goal ({})", "Dein Tagesziel": "Your daily goal", "Gesamt": "Total", "Verbleibend": "Remaining",
  "Weitere Nährwerte": "More nutrients", "Notiz zum Tag": "Note for the day", "Ganzen Tag kopieren": "Copy whole day",
  "z. B. Hunger, Training, Stimmung …": "e.g. hunger, training, mood …", "Notiz: {}": "Note: {}",
  "Abbrechen": "Cancel", "Speichern": "Save", "Auf den Tag": "To day", "Mengenfaktor (1 = unverändert)": "Amount factor (1 = unchanged)",
  "Bitte einen Tag wählen.": "Please choose a day.", "Kopieren": "Copy", "Wasser & Ergänzungen": "Water & supplements",
  "Lebensmittel suchen…": "Search foods…", "Zurück": "Back", "g KH": "g carbs", "g Fett": "g fat", "g Eiweiß": "g protein", "Menge (g)": "Amount (g)",
  "Ballaststoffe": "Fiber", "Zucker": "Sugar", "Salz": "Salt", "ges. Fettsäuren": "sat. fat", "Portion wählen …": "Choose portion …", "Portion": "Portion",
  "Bezeichnung": "Description", "KH (g)": "Carbs (g)", "Fett (g)": "Fat (g)", "Eiweiß (g)": "Protein (g)", "Uhrzeit": "Time",
  "Lebensmittel tauschen": "Swap food", "Bezeichnung und kcal sind Pflicht.": "Description and kcal are required.", "„{}“ tauschen": "Swap “{}”",
  "Tauschen": "Swap", "Schnelleingabe in „{}“": "Quick entry in “{}”", "Schnelleingabe": "Quick entry",
  "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“).": "Without a food, just calories and optionally macros (e.g. “Restaurant, about 800 kcal”).",
  "z. B. Restaurant": "e.g. Restaurant", "Hinzufügen": "Add", "Als Mahlzeit speichern": "Save as meal", "Am Tag": "On day",
  "Neue Uhrzeit (leer = Originalzeit)": "New time (empty = original time)", "In Mahlzeit": "Into meal", "Nichts ausgewählt.": "Nothing selected.",
  "Name der Mahlzeit": "Meal name", "z. B. Diät, Bulk (optional)": "e.g. Cut, Bulk (optional)", "Name": "Name", "Kategorie": "Category",
  "Bitte einen Namen angeben.": "Please enter a name.",

  // barcode
  "Dieser Browser kann keine Barcodes lesen (BarcodeDetector fehlt). Bitte die Nummer eintippen.": "This browser cannot read barcodes (BarcodeDetector is missing). Please type the number.",
  "Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.": "No camera access (the page needs HTTPS). Use “Photo” or type the number.",
  "Abgebrochen": "Cancelled", "Scan abbrechen": "Cancel scan", "Halte den Barcode ins Bild.": "Hold the barcode in view.",
  "Kamerazugriff wurde nicht erlaubt.": "Camera access was not allowed.", "Kamera nicht verfügbar: {}": "Camera not available: {}",
  "Auf dem Foto wurde kein Barcode erkannt.": "No barcode was found in the photo.", "z. B. 1 Scheibe": "e.g. 1 slice",
  "Produkt nicht gefunden ({})": "Product not found ({})", "Barcode (Open Food Facts)": "Barcode (Open Food Facts)", "Suchen": "Search",
  "Scannen (Kamera)": "Scan (camera)", "Foto vom Barcode": "Photo of barcode", "Marke": "Brand", "z. B. Diät, Bulk": "e.g. Cut, Bulk",
  "Portion (g)": "Portion (g)", "kcal / 100 g": "kcal / 100 g", "KH / 100 g": "Carbs / 100 g", "Fett / 100 g": "Fat / 100 g", "Eiweiß / 100 g": "Protein / 100 g",
  "Portionsgrößen (optional)": "Portion sizes (optional)", "+ Portion": "+ Portion", "Name und kcal sind Pflicht.": "Name and kcal are required.",
  "Speichern & wählen": "Save & choose", "Suchen…": "Search…", "★ Favoriten": "★ Favorites", "Meine Mahlzeiten": "My meals", "Häufig verwendet": "Frequently used",
  "Beides": "Both", "Hinzufügen-Dialog": "Add dialog", "„Häufig verwendet“ zeigt": "“Frequently used” shows", "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten.": "Applies to the “Foods” tab in the add dialog. The “My meals” tab always lists the frequently used meals.",
  "Alle": "All", "Nichts gefunden – lege ein neues Lebensmittel an.": "Nothing found – create a new food.",
  "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆.": "No favorites yet – mark foods with ☆ on the “Foods” page.",
  "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen.": "No saved meal. Create one in the diary via “Save as meal”.",
  "Portionen": "Portions", "+ Neues Lebensmittel": "+ New food", "Schnelleingabe (nur kcal)": "Quick entry (kcal only)", "Schließen": "Close",
  "Zu „{}“ hinzufügen": "Add to “{}”", "Eintrag hinzufügen": "Add entry", "(Ziel {})": "(goal {})",

  // weight
  "Trend {} kg": "Trend {} kg", "Gewichtsverlauf": "Weight history", "Verlauf": "History", "zu wenig Daten": "not enough data", "nicht absehbar": "not foreseeable",
  "erreicht": "reached",
  "Lebensmittel bearbeiten": "Edit food", "Neues Lebensmittel": "New food", "Favorit entfernen": "Remove favorite", "Als Favorit markieren": "Mark as favorite",
  "Favorit": "Favorite", "Trigger anlegen": "Create trigger", "Löschen": "Delete",
  "„{}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.": "Delete “{}”? Meals already logged are kept.",
  "Nichts gefunden.": "Nothing found.", "Noch keine Lebensmittel angelegt.": "No foods yet.", "Duplikate suchen": "Find duplicates",
  "Doppelte Lebensmittel": "Duplicate foods",
  "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.": "In each group, choose the food to keep. Meals already logged stay unchanged.",
  "Keine Duplikate gefunden.": "No duplicates found.", "Zusammenführen": "Merge", "Durch anderes Lebensmittel tauschen": "Swap for another food",
  "Mahlzeit bearbeiten": "Edit meal", "Komponenten": "Components", "Komponente hinzufügen": "Add component", "+ Komponente": "+ Component",
  "Kopie anlegen": "Create copy", "Mahlzeit „{}“ löschen?": "Delete meal “{}”?",
  "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.": "No meal saved yet – use “Save as meal” in the diary.",
  "Mahlzeiten suchen…": "Search meals…",

  // recipes
  "wie Summe der Zutaten": "same as sum of ingredients", "Gesamt: {} g": "Total: {} g", "pro Portion ({} g)": "per portion ({} g)",
  "Rezept bearbeiten": "Edit recipe", "Neues Rezept": "New recipe", "Gewicht fertig (g, optional)": "Cooked weight (g, optional)", "Zutaten": "Ingredients",
  "Noch keine Zutaten.": "No ingredients yet.", "Zutat hinzufügen": "Add ingredient", "+ Zutat": "+ Ingredient",
  "Ungültige Einheit": "Invalid unit",
  "Speichern und jetzt lesen": "Save and read now",
  "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen.": "The sensor's value is older than 30 days and was not taken over.",
  "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).": "The value is outside 20 to 500 kg (check the unit).",
  "Der Sensor liefert gerade keinen Zahlenwert.": "The sensor does not provide a number right now.",
  "Home Assistant nicht erreichbar.": "Home Assistant is not reachable.",
  "Zuerst einen Sensor wählen.": "Choose a sensor first.",
  "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.": "New value seen, it is taken over once it is stable.",
  "Der aktuelle Wert ist schon übernommen.": "The current value has already been taken over.",
  "Übernommen: {} am {}": "Taken over: {} on {}",
  "Zuletzt übernommen: {} am {}": "Last taken over: {} on {}",
  "z. B. sensor.waage_gewicht": "e.g. sensor.scale_weight",
  "Automatisch (Einheit des Sensors)": "Automatic (the sensor's unit)",
  "Einheit des Sensors": "Sensor unit",
  "Sensor": "Sensor",
  "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg.": "A Home Assistant sensor with body weight, e.g. from a smart scale. The add-on checks every minute; a new value is taken over once it has not changed for a minute and is stored for the day of the measurement (a value from the same day is replaced). Sensible values are 20 to 500 kg.",
  "Waage": "Scale",
  "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung).": "Take body weight from a Home Assistant sensor automatically, e.g. from a smart scale (with unit conversion).",
  "Waage (Sensor)": "Scale (sensor)",
  "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).": "Orange ingredients were missing from your foods and were filled in from online databases (estimates, please check).", "aus Open Food Facts": "from Open Food Facts", "aus USDA": "from USDA",
  "Pro Portion ({} g): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Per portion ({} g): {} kcal · carbs {} g · fat {} g · protein {} g · {} portions",
  "Rezept „{}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.": "Delete recipe “{}”? The matching food is deleted too; meals already logged are kept.",
  "Noch kein Rezept angelegt.": "No recipe yet.", "Rezepte suchen…": "Search recipes…", "+ Neues Rezept": "+ New recipe",
  "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel.": "Every recipe also appears under Foods (per 100 g, with “1 portion”) and can be logged anywhere. Changes to the recipe update that food.",
  "1 Portion": "1 portion", "Rezept nicht gefunden": "Recipe not found",
  "Mindestens eine Zutat nötig.": "At least one ingredient is required.", "Portionen müssen größer als 0 sein.": "Portions must be greater than 0.",
  "Jede Zutat braucht eine Menge in Gramm.": "Every ingredient needs an amount in grams.", "Gewicht nach dem Kochen muss größer als 0 sein.": "Cooked weight must be greater than 0.",

  // weight page
  "z. B. 78,5": "e.g. 78.5", "Gewicht eintragen": "Log weight", "Datum": "Date", "Gewicht ({})": "Weight ({})", "Zielgewicht ({})": "Target weight ({})", "Gewünschte Änderung ({} pro Woche)": "Desired change ({} per week)", "Noch keine Gewichtswerte.": "No weight values yet.",
  "Aktuell": "Current", "Trend": "Trend", "Veränderung": "Change", "Ziel": "Goal", "Prognose Ziel": "Goal forecast",
  "30 Tage": "30 days", "90 Tage": "90 days", "1 Jahr": "1 year", "7 Tage": "7 days", "180 Tage": "180 days",
  "14 Tage": "14 days", "Kalorien und Gewicht": "Calories and weight", "Kalorien (linke Achse)": "Calories (left axis)", "Gewicht und Trend (rechte Achse)": "Weight and trend (right axis)", "Noch keine Gewichtswerte im Zeitraum.": "No weight entries in this period yet.",
  "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).": "Thin line and dots: measurements. Thick line: smoothed trend (daily fluctuations filtered out).",
  "Trend aktuell {}{} {}/Woche.": "Current trend {}{} {}/week.", "Mehr anzeigen": "Show more", "Alle {}": "All {}", "Weniger": "Less",
  "Taille": "Waist", "Brust": "Chest", "Hüfte": "Hips", "Oberarm": "Upper arm", "Oberschenkel": "Thigh", "Körperfett %": "Body fat %",
  "Bild konnte nicht gelesen werden": "Image could not be read", "Eigene Messung, z. B. Wade": "Custom measurement, e.g. calf", "Körpermaße": "Body measurements",
  "Werte, die Du nicht messen willst, einfach leer lassen.": "Leave values you do not want to measure empty.", "Weitere Messung": "Another measurement", "Wert": "Value",
  "Bitte mindestens einen Wert eintragen.": "Please enter at least one value.", "Noch keine Werte für diese Messung.": "No values for this measurement yet.",
  "Notiz (optional), z. B. Vorderansicht": "Note (optional), e.g. front view", "Fortschrittsfotos": "Progress photos",
  "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons.": "The photos stay in the add-on on your Home Assistant. They are not part of the JSON export or the automatic backups, but they are included in the Home Assistant backup of the add-on.",
  "Vergleichen": "Compare", "Foto hinzufügen": "Add photo", "Foto löschen": "Delete photo", "Foto löschen?": "Delete photo?", "Noch keine Fotos.": "No photos yet.",
  "Fotos vergleichen": "Compare photos", "Ungültiger Wert für {}": "Invalid value for {}", "Kein gültiges Bild": "Not a valid image",
  "Bild leer oder zu groß (max. 8 MB)": "Image empty or too large (max. 8 MB)", "Foto nicht gefunden": "Photo not found",

  // stats
  "Abnehmen": "Lose weight", "Halten": "Maintain", "Zunehmen": "Gain weight", "Kalorienbilanz": "Calorie balance",
  "Noch keine Einträge im Zeitraum.": "No entries in this period.", "Ø Aufnahme": "Ø intake", "Gewichtstrend": "Weight trend",
  "Überschuss / Tag": "Surplus / day", "Defizit / Tag": "Deficit / day", "Bilanz / Tag": "Balance / day", "Geschätzter Verbrauch": "Estimated expenditure",
  "Aus {} Gewichtswerten und {} von {} erfassten Tagen (1 {} ≈ {} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.": "Based on {} weight values and {} of {} logged days (1 {} ≈ {} kcal). The more complete diary and weigh-ins, the more accurate.",
  "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum.": "The calculation needs at least two weight values a week apart in the selected period.",
  "Du liegst im Plan.": "You are on track.", "Der Trend liegt über dem Ziel.": "The trend is above the goal.", "Der Trend liegt unter dem Ziel.": "The trend is below the goal.",
  "Ziel: {}": "Goal: {}", "(Gewicht halten)": "(maintain weight)", "({} {}/Woche)": "({} {}/week)", "· Trend aktuell {} {}/Woche. {}": "· current trend {} {}/week. {}",
  "Für dieses Ziel passen ca. {} kcal am Tag (Dein Ziel: {}).": "About {} kcal a day fit this goal (your goal: {}).", "Als Tagesziel übernehmen": "Use as daily goal",
  "Ø Kalorien": "Ø calories", "Erfasste Tage": "Logged days", "Ø Eiweiß": "Ø protein", "Ø Kohlenhydrate": "Ø carbs", "Ø Fett": "Ø fat",
  "Kalorien pro Tag": "Calories per day", "Gestrichelt: Tagesziel je Wochentag": "Dashed: daily goal per weekday", "Gestrichelt: Tagesziel {} kcal": "Dashed: daily goal {} kcal",
  "Nährwertverteilung (Ø)": "Macro split (Ø)", "Eiweiß {} %": "Protein {} %", "Kohlenhydrate {} %": "Carbohydrates {} %", "Fett {} %": "Fat {} %",
  "Weitere Nährwerte (Ø pro Tag)": "More nutrients (Ø per day)", "Ø pro Tag": "Ø per day", "Eingetragen": "Logged", "Ziel erreicht": "Goal reached",
  "Bericht & Zeitraum-Vergleich": "Report & period comparison", "7 Tage vs. davor": "7 days vs. before", "30 Tage vs. davor": "30 days vs. before",
  "Eiweißziel erreicht": "Protein goal reached", "Kalorien im Ziel": "Calories on target", "Gewichtsänderung": "Weight change", "Differenz": "Difference",
  "Bester Tag (A): {} · Schwächster Tag (A): {}": "Best day (A): {} · Weakest day (A): {}", "Tage": "Days", "{} Tage": "{} days", "{} / {} Tage": "{} / {} days", "{} Einträge, {} kcal": "{} entries, {} kcal", "{} / 100 g": "{} / 100 g", "{} kcal · KH {} g · Fett {} g · Eiweiß {} g": "{} kcal · carbs {} g · fat {} g · protein {} g",
  "{} kcal (Ziel {})": "{} kcal (goal {})", "KH {} g · Fett {} g · Eiweiß {} g": "carbs {} g · fat {} g · protein {} g", "zu {}": "to {}",
  "{} kcal · KH {} g · Fett {} g · Eiweiß {} g (pro 100 g)": "{} kcal · carbs {} g · fat {} g · protein {} g (per 100 g)", "Ø": "Ø",

  // triggers
  "Zustand": "State", "Kalender": "Calendar", "(am Starttag)": "(on the start day)", "(am Endtag)": "(on the end day)", "Täglich ab {} Uhr": "Daily from {}",
  "enthält nicht": "does not contain", "· seit mind. {} Min.": "· for at least {} min", "· nur {}–{} Uhr": "· only {}–{}", "ODER": "OR", "UND": "AND",
  "Trigger pausieren": "Pause trigger", "Pause beenden": "End pause", "Heute": "Today", "3 Tage": "3 days", "1 Woche": "1 week", "Oder bis einschließlich": "Or until (inclusive)",
  "Pausieren": "Pause", "Zustand einer Entität (z. B. Person ist im Fitnessstudio)": "State of an entity (e.g. person is at the gym)", "Kalendereintrag": "Calendar event",
  "Uhrzeit (täglich ab einer Zeit)": "Time (daily from a time)", "z. B. person.max": "e.g. person.max", "ist / enthält": "is / contains",
  "ist NICHT / enthält NICHT": "is NOT / does NOT contain", "an jedem Tag des Termins": "on every day of the event",
  "nur am Starttag (z. B. Donnerstag 22 Uhr)": "only on the start day (e.g. Thursday 10 pm)", "nur am Endtag (z. B. Freitag 6 Uhr)": "only on the end day (e.g. Friday 6 am)",
  "Termin zählt": "Event counts", "Entität": "Entity", "Bedingung": "Condition", "z. B. calendar.arbeit": "e.g. calendar.work",
  "Titel enthält, z. B. Nachtschicht": "Title contains, e.g. night shift", "Zustand, z. B. Fitnessstudio (Zonenname) oder on": "State, e.g. gym (zone name) or on",
  "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist.": "Logs once a day as soon as this time is reached.",
  "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält.": "Applies to days with (or without) an event whose title contains this text.",
  "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).": "Applies as soon as the entity has (or does not have) this state.",
  "Auslöser": "Trigger condition", "„{}“ nur an bestimmten Tagen anzeigen": "Show “{}” only on certain days",
  "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt.": "Days with entries are always visible. Without a rule the meal is always shown.",
  "Bitte eine Entität angeben.": "Please enter an entity.", "Gespeicherte Mahlzeiten": "Saved meals", "Tagesziel wechseln": "Switch daily goal", "Tagesziel „{}“": "Daily goal “{}”",
  "Standardportion": "Default portion", "Tage im Voraus eintragen (nur Kalender)": "Log days ahead (calendar only)",
  "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht.": "0 = only on the day itself. With e.g. 7 the entry is planned for the next 7 days as soon as a matching event exists.",
  "Zustand muss schon so lange anliegen (Minuten)": "State must have held for this long (minutes)",
  "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist.": "0 = immediately. E.g. 20: only log once the person has been at the gym for 20 minutes.",
  "Nur zwischen (Uhrzeit, optional)": "Only between (time, optional)",
  "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00).": "Outside this time window the trigger does not log. Spanning midnight is possible (22:00 to 06:00).",
  "Zu Mahlzeit im Tagebuch": "To meal in the diary", "Bei Lebensmitteln optional mit Menge:": "For foods, optionally with an amount:",
  "Alle Bedingungen müssen zutreffen (UND)": "All conditions must apply (AND)", "Mindestens eine muss zutreffen (ODER)": "At least one must apply (OR)", "Verknüpfung": "Combination",
  "Entität, z. B. person.anna": "Entity, e.g. person.anna", "Zustand bzw. Titel enthält (leer = an)": "State or title contains (empty = on)",
  "Bedingung entfernen": "Remove condition", "Trigger bearbeiten": "Edit trigger", "Neuer Trigger": "New trigger", "+ Weitere Bedingung": "+ Another condition", "Dann": "Then",
  "Bitte eine Uhrzeit angeben.": "Please enter a time.", "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen.": "Please choose a food, a meal or a daily goal.",
  "Weitere Bedingung: bitte eine Entität angeben.": "Another condition: please enter an entity.",

  // settings
  "Komplett (alle Einträge mit Mahlzeiten)": "Complete (all entries with meals)", "Nur Tageskalorien und Makros (eine Summe pro Tag)": "Daily calories and macros only (one total per day)",
  "Neue Mahlzeit anlegen": "Create new meal", "Mahlzeiten zuordnen": "Assign meals", "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)": "Hide empty meals on these days (show only the daily total)",
  "MyFitnessPal-Import": "MyFitnessPal import", "Was importieren?": "What to import?", "Gewicht übernehmen": "Import weight", "Vorhandene Einträge an diesen Tagen ersetzen": "Replace existing entries on these days",
  "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Imported: {} days, {} entries, {} weight values.", "Importieren": "Import",
  "Eiweiß {} % · Kohlenhydrate {} % · Fett {} %": "Protein {} % · Carbohydrates {} % · Fat {} %", "· Makros ergeben {} kcal": "· macros add up to {} kcal",
  "Tagesziele": "Daily goals", "Mein Ziel": "My aim",
  "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet.": "Decides when a day counts as “on target” (lose: at most, gain: at least, maintain: ±10 %) and how the statistics rate your weight trend.",
  "Kalorien aus Makros berechnen": "Calculate calories from macros", "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g).": "When protein, carbohydrates or fat change, the calories follow (4/4/9 kcal per g).",
  "Kalorien (kcal)": "Calories (kcal)", "Kohlenhydrate (g)": "Carbohydrates (g)", "Gespeichert ✓": "Saved ✓",
  "Zusatzfunktionen": "Optional features", "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen.": "Optional features, off by default. When enabled they appear in the diary and here in the settings.",
  "Tagesziele pro Wochentag": "Daily goals per weekday", "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger.": "e.g. training days with more calories, rest days with fewer.",
  "Wasser und Nahrungsergänzung": "Water and supplements", "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.": "Quick entry for water, caffeine, creatine etc. with its own daily goal.",
  "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter).": "Bundle ingredients into a recipe, divide by portions and log it like a food (own tab).",
  "Notizen": "Notes", "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten.": "Free text for meals and days (hunger, training, mood). Existing notes are kept when you switch this off.",
  "Körpermaße und Fortschrittsfotos": "Body measurements and progress photos", "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht.": "Circumferences (waist, chest, arm …) with history, and photos with comparison, in the Weight tab.",
  "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit).": "Track and analyze fiber, sugar, salt and saturated fat for foods (Open Food Facts provides them).",
  "Montag": "Monday", "Dienstag": "Tuesday", "Mittwoch": "Wednesday", "Donnerstag": "Thursday", "Freitag": "Friday", "Samstag": "Saturday", "Sonntag": "Sunday",
  "wie Standard": "as default", "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros.": "Empty calories = the default daily goal above applies. Empty macros show “–”. With “Calculate calories from macros” (above) the calories follow the macros.",
  "Tagesziel-Profile": "Daily goal profiles",
  "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel.": "e.g. “Training” and “Rest day”. A trigger (Settings → Triggers → “Then: switch daily goal”) switches the day to a profile, for example when the person is at the gym. The profile takes precedence over the weekday goal.",
  "Profil löschen": "Delete profile", "Profil „{}“ löschen? Trigger dafür werden ebenfalls gelöscht.": "Delete profile “{}”? Triggers for it are deleted as well.",
  "Noch keine Profile.": "No profiles yet.", "Neues Profil": "New profile", "+ Profil": "+ Profile", "Einheit": "Unit", "Schritt": "Step",
  "„{}“ samt Verlauf löschen?": "Delete “{}” including its history?", "Neu, z. B. Magnesium": "New, e.g. magnesium",
  "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch.": "Per row: name, unit, daily goal and step size of the +/− buttons in the diary.",
  "Feste Mahlzeiten (Frühstück, Mittagessen, …)": "Fixed meals (breakfast, lunch, …)", "Uhrzeiten (08:47 …, 11:30 …)": "Times (08:47 …, 11:30 …)",
  "Automatisch (Windows-Look bei HA-95/98-Theme)": "Automatic (Windows look with HA 95/98 theme)", "Standard (HA-Theme)": "Default (HA theme)", "Windows-Look": "Windows look",
  "Darstellung": "Appearance", "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende.": "Existing entries are kept; entries without a time appear at the end in the time view.",
  "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten": "Start the barcode scanner right away when opening on this device",
  "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.": "For a Companion app home screen widget: create a shortcut to this panel there and the camera opens right away.",
  "Optik": "Look", "Nach oben": "Move up", "Nach unten": "Move down", "Nur an bestimmten Tagen anzeigen": "Show only on certain days", "Wieder einblenden": "Show again",
  "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Hide (only visible on days with entries)", "Ausblenden": "Hide", "{} – blende sie stattdessen mit ⊘ aus.": "{} – hide it with ⊘ instead.",
  "Neue Mahlzeit, z. B. Nachtschicht": "New meal, e.g. night shift", "nur an Tagen: {}": "only on days: {}", "Regel bearbeiten": "Edit rule", "Regel löschen": "Delete rule",
  "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "With ⚡ you show a meal only on days when, for example, your calendar has a certain event. With ⊘ you hide it permanently (it stays visible only on days with entries); only an empty meal can be deleted.",
  "Trigger": "Triggers", "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Log foods or meals automatically when Home Assistant reports something (location, calendar, switch …). Can also be created via ⚡ on foods.",
  "Letzter Fehler ({}): {}": "Last error ({}): {}", "Aktiv": "Active", "pausiert bis {}": "paused until {}", "· {} Tage im Voraus": "· {} days ahead", "· zuletzt {}": "· last {}",
  "Pausieren …": "Pause …", "Jetzt testen (trägt heute ein)": "Test now (logs for today)", "Eingetragen.": "Logged.", "Noch keine Trigger.": "No triggers yet.", "Prüfe …": "Checking …",
  "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "No Home Assistant access (SUPERVISOR_TOKEN missing).", "Geprüft {}, nichts zu tun.": "Checked {}, nothing to do.",
  "Jetzt prüfen": "Check now", "Version": "Version", "Installiert: ": "Installed: ", "Nach Updates suchen": "Check for updates", "Keine Verbindung zu GitHub.": "No connection to GitHub.", "Version {} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.": "Version {} is available. In Home Assistant, go to Settings → Add-ons, check for updates and update.", "Du hast die aktuelle Version.": "You have the latest version.", "+ Neuer Trigger": "+ New trigger", "Trigger-Verlauf": "Trigger history",
  "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.": "What triggers logged most recently. “Undo” removes the entries again; the trigger does not log again that day.",
  "Trigger gelöscht": "Trigger deleted", "(gelöscht)": "(deleted)", "Einträge nicht mehr vorhanden": "Entries no longer exist", "Rückgängig": "Undo",
  "Erinnerung": "Reminder", "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde.": "Notification via Home Assistant if nothing has been logged by the chosen time.",
  "Erinnerung aktiv": "Reminder active", "Benachrichtigungsdienst": "Notification service", "Automatische Sicherung": "Automatic backup",
  "Täglich eine JSON-Sicherung in {}, Aufbewahrung {} Tage (Add-on-Option „backup_keep_days“).": "A daily JSON backup in {}, kept for {} days (add-on option “backup_keep_days”).",
  "Aus (Add-on-Option „auto_backup“).": "Off (add-on option “auto_backup”).", "· {} KB": "· {} KB", "Wiederherstellen": "Restore", "Noch keine Sicherung.": "No backup yet.", "Jetzt sichern": "Back up now",
  "Schnittstelle für Automationen": "Interface for automations",
  "Aktiv. Deine Benutzer-ID: {}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.": "Active. Your user ID: {}. Call examples (rest_command) are in the add-on documentation.",
  "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.": "Off. To enable it, set a key “api_key” in the add-on options. Scales, voice assistants or automations can then send entries and weight.",
  "Daten": "Data", "Export/Import betrifft nur dein Benutzerkonto.": "Export/import only affects your user account.", "Sicherung (JSON)": "Backup (JSON)", "Tagebuch als CSV": "Diary as CSV",
  "Datei nicht lesbar:": "File not readable:", "Sicherung einspielen": "Restore backup", "MyFitnessPal-CSV importieren": "Import MyFitnessPal CSV", "Keine gültige Sicherung:": "Not a valid backup:",
  "Sicherung wiederherstellen": "Restore backup", "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt.": "All current data of your account will be replaced by the backup.",
  "Jetzt": "Now", "Sicherung": "Backup", "Gewichtswerte": "Weight values", "Zeitraum": "Period", "Wiederhergestellt.": "Restored.", "Ersetzen": "Replace",
  "Sprache und Einheiten": "Language and units", "Sprache": "Language", "Einheiten": "Units", "Automatisch (Browser)": "Automatic (browser)",
  "Metrisch (kg, cm)": "Metric (kg, cm)", "Imperial (lb, in)": "Imperial (lb, in)",

  // household and admin
  "Teilen …": "Share …", "„{}“ teilen": "Share “{}”",
  "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Portion as a multiple of the entry (1 = same amount). The entry appears in the others' diary on the same day.",
  "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Amount for each person in grams. The entry appears in the others' diary on the same day.",
  "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein.": "Nobody else takes part in the household yet. Every user switches on “Household” under Settings → Optional features.",
  "Bitte mindestens eine Person wählen.": "Please choose at least one person.", "Eingetragen bei {} Person(en).": "Logged for {} person(s).",
  "Haushalt": "Household", "Einträge mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Share entries with other users, each with their own portion (e.g. one dish for the family). Both sides must switch the feature on.",
  "Benutzerverwaltung": "User administration", "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer).": "Only visible to administrators (add-on option “admin_users”; empty = the first user).",
  "Benutzer": "User", "Zuletzt": "Last", "Export": "Export", "Admin": "Admin",
  "Alle Daten von „{}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:": "Permanently delete all data of “{}”? Enter the name to confirm:",
  "Nur für Administratoren": "Administrators only", "Das eigene Konto kann hier nicht gelöscht werden": "Your own account cannot be deleted here",
  "Zur Bestätigung den Namen des Benutzers eingeben": "Enter the user's name to confirm", "Haushaltsfunktion ist nicht aktiviert": "Household feature is not enabled",
  "Dieser Benutzer nimmt nicht am Haushalt teil": "This user does not take part in the household",

  // more imports
  "Weitere Importe": "More imports", "Weitere Importe …": "More imports …",
  "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.": "The import only affects your user account. Existing data is kept unless you explicitly choose “replace”.",
  "CSV aus einer anderen App": "CSV from another app", "Datei wählen": "Choose file",
  "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.": "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) and similar tables. The columns are detected and can be corrected.",
  "Apple Health": "Apple Health",
  "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.": "export.zip or export.xml from the Health app (profile → export health data). The file is read directly in the browser; only the daily values are uploaded.",
  "Messart": "Metric", "Natrium": "Sodium", "Bitte die Spalte mit dem Datum zuordnen.": "Please assign the date column.",
  "{} Einträge, {} Gewichtswerte aus {} Zeilen.": "{} entries, {} weight values from {} rows.", "CSV importieren": "Import CSV", "Erkannt: {}": "Detected: {}",
  "Zuordnung der Spalten": "Column assignment", "– nicht vorhanden –": "– not present –", "Einheit der Gewichtsspalte": "Unit of the weight column", "Stone": "Stone",
  "Lese Datei …": "Reading file …", "Lese Datei … {} %": "Reading file … {} %", "Keine gültige ZIP-Datei.": "Not a valid ZIP file.",
  "Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.": "Very large ZIP file (ZIP64): please unzip it and choose export.xml.",
  "In der ZIP-Datei wurde keine export.xml gefunden.": "No export.xml found in the ZIP file.",
  "Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.": "This browser cannot unzip the file. Please unzip it and choose export.xml.",
  "{} Gewichtswerte, {} Tage mit Ernährungsdaten gefunden.": "Found {} weight values and {} days with nutrition data.",
  "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)": "Import weight (one value per day, existing values are overwritten)",
  "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)": "Import daily nutrition totals (one quick entry per day, only useful if you do not log your meals here otherwise)",
  "Importiert: {} Tage, {} Gewichtswerte.": "Imported: {} days, {} weight values.",
  "Die Datei enthält keine Datenzeilen.": "The file contains no data rows.",

  // export for third parties
  "Export für Berater und Trainer": "Export for dietitian and trainer",
  "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum.": "A report to print or save as PDF (choose “Save as PDF” in the print dialog) and a table of the daily values. Contains only the chosen period.",
  "Von": "From", "Bis": "To", "Einzelne Einträge im Bericht auflisten": "List individual entries in the report",
  "Bericht öffnen (Drucken / PDF)": "Open report (print / PDF)", "Tagesübersicht (CSV)": "Daily overview (CSV)",

  // macro chart
  "Makro-Verlauf": "Macro history", "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage.": "Bars: grams per day. Dashed: daily goal. Solid line: average of the last 7 days.",
  "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen.": "Bars: grams per day. Solid line: average of the last 7 days. You can set a goal for this macro under Settings → Daily goals.",
  "{} g (Ziel {} g)": "{} g (goal {} g)", "Ø 7 Tage {} g": "Ø 7 days {} g", "nicht erfasst": "not logged",

  // data sources
  "Online suchen & vergleichen": "Search online & compare", "Name oder Barcode": "Name or barcode", "Quelle": "Source", "KH": "Carbs", "Fett": "Fat", "Abweichung": "Deviation",
  "Abweichung der kcal von dem Wert im Formular": "Deviation of the kcal from the value in the form", "Übernehmen": "Apply",
  "Mittelwert der gewählten übernehmen": "Apply average of selected", "Suche …": "Searching …", "Alle Werte pro 100 g.": "All values per 100 g.",
  "Die Quellen weichen bei kcal um bis zu {} % voneinander ab – bitte prüfen.": "The sources differ by up to {} % in kcal – please check.",
  "nicht erreichbar": "not reachable", "Weitere Datenquellen": "More data sources",
  "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet).": "Online search in Open Food Facts and USDA, comparing the values with each other and with your own (search terms are sent to these services).",
  "Weitere Datenquellen sind nicht aktiviert": "More data sources are not enabled", "Suchbegriff oder Barcode angeben": "Enter a search term or barcode",
  "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)": "USDA limit reached (set your own api.data.gov key in the add-on options)",

  // server messages (shown in the UI)
  "Open Food Facts nicht erreichbar": "Open Food Facts not reachable", "Mahlzeit enthält noch Einträge": "Meal still contains entries", "Mahlzeit ist leer": "Meal is empty",
  "Mahlzeit braucht mindestens eine Komponente": "Meal needs at least one component", "Keine MyDietAssistant-Sicherung": "Not a MyDietAssistant backup",
  "Das sieht nicht nach einem MyFitnessPal-Export aus.": "This does not look like a MyFitnessPal export.", "Home Assistant nicht erreichbar": "Home Assistant not reachable",
  "Uhrzeit (HH:MM) erforderlich": "Time (HH:MM) required", "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben": "specify exactly one of meal / food / goal profile",
  "weitere Bedingung: Art und Entität erforderlich": "further condition: kind and entity required", "Name und Kalorien erforderlich": "Name and calories required",
  "ungültiger Zeitraum": "invalid period", "Quell- und Zieltag sind gleich": "Source and target day are the same", "Sicherung nicht gefunden": "Backup not found",
  "Externe API ist aus: Option api_key im Add-on setzen": "External API is off: set the api_key option in the add-on", "falscher Schlüssel": "wrong key",
  "Lebensmittel „{}“ nicht gefunden": "Food “{}” not found", "food oder name angeben": "specify food or name", "kg außerhalb des gültigen Bereichs": "kg outside the valid range",
  "Uhrzeit fehlt": "time missing", "Benachrichtigungsdienst wie notify.mobile_app_handy angeben": "specify a notification service such as notify.mobile_app_phone",
  "not found": "not found",

  // v1.0: activity, schedule, sharing libraries, food tables, ounces, lookup cache
  "Aktivität": "Activity", "Aktivität eintragen": "Log activity", "Schritte": "Steps", "Verbrannt": "Burned", "Zum Tagesziel": "Added to goal",
  "aus Schritten geschätzt": "estimated from steps", "Eintragen": "Log", "Aus Home Assistant lesen": "Read from Home Assistant", "Handeingabe verwerfen": "Discard manual entry",
  "Dein Tagesziel (+{} kcal Aktivität)": "Your daily goal (+{} kcal activity)", "Tagesziel ({}) (+{} kcal Aktivität)": "Daily goal ({}) (+{} kcal activity)", "(+{} kcal Aktivität)": "(+{} kcal activity)",
  "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben.": "Values typed in by hand are no longer overwritten by the sensors for this day.",
  "Verbrannte Kalorien (kcal)": "Burned calories (kcal)", "leer = aus Schritten schätzen": "empty = estimate from steps",
  "{} % der verbrannten Kalorien": "{} % of the burned calories",
  "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen.":
    "Home Assistant sensors that count up during the day and reset to 0 at midnight (a counter that only ever grows can be made daily with the “Utility Meter” helper). The add-on reads them every five minutes. Without a calorie sensor, calories are estimated from steps, body weight and the factor below; values can also be typed in by hand.",
  "Sensor für Schritte": "Steps sensor", "Sensor für aktive Kalorien (kcal)": "Active calories sensor (kcal)",
  "Anteil, der das Tagesziel erhöht (%)": "Share that raises the daily goal (%)", "kcal je Schritt und kg Körpergewicht": "kcal per step and kg body weight",
  "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind.":
    "Many apps only credit part of the burned calories (50 % is a cautious value) because activity figures are often overestimated.",
  "z. B. sensor.handy_schritte": "e.g. sensor.phone_steps", "z. B. sensor.handy_aktive_kalorien": "e.g. sensor.phone_active_calories",
  "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages.": "Steps and burned calories (from Home Assistant sensors or by hand) raise the calorie goal of that day.",
  "Mahlzeiten-Zeitplan": "Meal schedule", "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung.": "A time window per meal: the diary shows which meal is due and can send a notification.",
  "Jetzt: {}": "Now: {}", "({} Uhr)": "({})", "Als Nächstes: {} ab {} Uhr": "Next: {} from {}", "schon eingetragen": "already logged", "+ Hinzufügen": "+ Add",
  "Von (leer = Standardfenster)": "From (empty = default window)", "Bis (leer = Standardfenster)": "To (empty = default window)", "Standardfenster": "Default window",
  "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.":
    "Time window per meal. Left empty, a default window applies (breakfast, lunch and dinner); snacks have none. Windows over midnight are possible.",
  "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist": "Notify when a meal is due and still empty", "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten.": "Uses the notification service from “Reminder” below.",
  "Zwischenspeicher der Online-Suche": "Cache of the online search", "Zwischenspeicher leeren": "Clear cache",
  "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch.":
    "The add-on remembers lookups at Open Food Facts and USDA locally (barcodes 60 days, search terms 14 days), so repeated searches no longer go to the internet. Only product data is stored, nothing about your diary.",
  "{} gespeicherte Abfragen ({} KB)": "{} stored lookups ({} KB)",
  "Barcode scannen": "Scan barcode", "Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.": "The barcode reader could not be loaded. Please type the number.",
  "Mehr laden": "Load more", "Tabelle importieren …": "Import table …", "Werte online prüfen": "Check values online", "Prüfen": "Check", "Anhalten": "Stop", "Ignorieren": "Ignore",
  "Prüfe {} von {} …": "Checking {} of {} …", "Nur Lebensmittel mit Barcode ({} von {})": "Only foods with a barcode ({} of {})",
  "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)": "Also query USDA (strict request limit without your own key)",
  "Online-Abfrage nicht möglich: {}": "Online lookup not possible: {}", "Dein Wert: {} kcal · KH {} · Fett {} · Eiweiß {}": "Your value: {} kcal · carbs {} · fat {} · protein {}",
  "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst.":
    "Compares your foods with Open Food Facts (by barcode, otherwise by name) and shows deviations in calories and macros. Nothing is changed until you choose “Apply”. Lookups are cached locally; barcodes or names are sent to the service.",
  "Lebensmittel-Tabelle importieren": "Import food table", "Lebensmittel-Tabelle": "Food table", "Energie (kJ)": "Energy (kJ)", "Kalorien (kcal)": "Calories (kcal)",
  "Bitte die Spalten für Name und Kalorien zuordnen.": "Please assign the columns for name and calories.",
  "{} Lebensmittel erkannt ({} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.": "{} foods recognised ({} rows without a name or calories are skipped). Values are per 100 g.",
  "Kategorie für Lebensmittel ohne Kategorie in der Datei": "Category for the imported foods", "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Existing foods with the same name and brand stay unchanged.",
  "Importiert: {} neu, {} schon vorhanden, {} übersprungen.": "Imported: {} new, {} already there, {} skipped.",
  "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.":
    "A nutrition table (for example BLS, an Open Food Facts export or your own list) as a CSV or Excel file: foods with values per 100 g are added to your library.",
  "Mit dem Haushalt teilen": "Share with the household", "Teilen": "Share", "{} kopiert, {} übersprungen.": "{} copied, {} skipped.",
  "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen.":
    "The chosen people get their own copy in their library. Entries with the same name stay unchanged, later changes are not synchronised.",
  "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.":
    "Share entries, foods and meals with other users, each with their own portion (e.g. one dish for the family). Both sides must switch the feature on.",
  "Lebensmittelmengen": "Food amounts", "Gramm": "Grams", "Unzen (oz)": "Ounces (oz)", "Menge (oz)": "Amount (oz)", "Portion (oz)": "Serving (oz)", "Gewicht fertig (oz, optional)": "Cooked weight (oz, optional)",
  "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Amount for each person in ounces. The entry appears in the others' diary on the same day.",
  "Gesamt: {}": "Total: {}", "pro Portion ({})": "per portion ({})",
  "Pro Portion ({}): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Per portion ({}): {} kcal · carbs {} g · fat {} g · protein {} g · {} portions",
  // v1.1
  "Gemeinsame Haushaltsbibliothek": "Shared household library", "Für den Haushalt freigegeben": "Shared with the household", "geteilt": "shared", "von {}": "from {}",
  "Gehört {}. Änderungen gelten für alle im Haushalt.": "Belongs to {}. Changes apply to everyone in the household.",
  "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)": "Offer in the shared household library (others may use and edit it)",
  "Aus Mealie …": "From Mealie …", "Rezept aus Mealie": "Recipe from Mealie", "In Mealie suchen…": "Search in Mealie…", "Weitere laden": "Load more",
  "{} Portionen": "{} servings", "Mealie": "Mealie", "Adresse": "Address", "API-Token": "API token",
  "Gespeichert (leer lassen = unverändert)": "Saved (leave empty to keep)",
  "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert.": "The recipe is read from your Mealie server and its ingredients are matched against your foods; you check everything before it is saved. Nothing is changed in Mealie.",
  "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren.": "Take over recipes from a Mealie server. Enter the server's address (home network or add-on) and an API token from Mealie (profile → API tokens). The add-on only reads recipes and changes nothing in Mealie. The token stays inside the add-on and is not part of the export. Clear the address to remove it.",
  "Von Webseite …": "From web page …","Rezept von Webseite": "Recipe from web page", "Lade …": "Loading …",
  "Adresse der Rezeptseite": "Address of the recipe page",
  "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.":
    "The add-on fetches the page and looks for recipe data (ingredients, servings, instructions). The ingredients are matched with your foods; you review everything before it is saved.",
  "Zubereitung": "Instructions", "Zubereitung, ein Schritt pro Zeile": "Instructions, one step per line",
  "Angabe der Webseite: {} kcal pro Portion": "Stated by the web page: {} kcal per portion",
  "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "1 ingredient not matched (red): choose a food with ⇄, otherwise it counts with 0 kcal. Please fill in missing amounts.",
  "{} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "{} ingredients not matched (red): choose a food with ⇄, otherwise they count with 0 kcal. Please fill in missing amounts.",
  "Bitte eine Adresse mit http:// oder https:// angeben.": "Please enter an address starting with http:// or https://", "Die Adresse wurde nicht gefunden.": "The address was not found.",
  "Adressen im lokalen Netz sind nicht erlaubt.": "Addresses on the local network are not allowed.", "Die Seite ist zu groß.": "The page is too large.",
  "Zu viele Weiterleitungen.": "Too many redirects.", "Die Seite konnte nicht geladen werden.": "The page could not be loaded.",
  "Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).": "No recipe found on this page (structured recipe data is missing).",
  "Das Rezept enthält keine Zutaten.": "The recipe contains no ingredients.", "Rezepte sind nicht aktiviert": "Recipes are not enabled",
  "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf": "Fetches steps and calories of the last 30 days from the Home Assistant history",
  "Verlauf nachladen": "Load history", "Verlauf nachgeladen: {} Tage.": "History loaded: {} days.",
  "Zeitraum: 1 bis 365 Tage": "Period: 1 to 365 days", "Zuerst einen Sensor für Schritte oder Kalorien wählen": "Choose a steps or calories sensor first",
  "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)": "Home Assistant did not return the history (recorder enabled?)",
  // v1.0 server messages
  "Ungültige Entität": "Invalid entity", "Wert außerhalb des Bereichs": "Value out of range", "Nur im Home-Assistant-Add-on möglich": "Only possible inside the Home Assistant add-on",
  "Leere Datei": "Empty file", "Die Datei konnte nicht gelesen werden.": "The file could not be read.", "Die Excel-Datei enthält kein Tabellenblatt.": "The Excel file contains no worksheet.",
  "Zu viele Zeilen (höchstens 50 000)": "Too many rows (50,000 at most)", "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Assign columns for name and calories (kcal or kJ)",

  "Mahlzeiten-Vorschläge": "Meal suggestions",
  "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben).": "Button in the diary: suggests saved meals and combinations from your history that fit the remaining calories and macros (amounts are adjusted, fixed packages stay).",
  "Mahlzeit vorschlagen": "Suggest a meal",
  "Rest des Tages": "Rest of the day",
  "Anteil für diese Mahlzeit": "Share for this meal",
  "Ziel für diese Mahlzeit: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Target for this meal: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
  "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.": "You have already reached your daily goal – there is nothing to fill up.",
  "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf.": "No suggestions yet: save meals in the diary via “Save / copy”, or eat combinations at least twice, then they show up here.",
  "Weitere Vorschläge": "More suggestions",
  "Beigabe": "Add-on",
  "aus dem Verlauf ({}×)": "from your history ({}×)",
  "Gespeichert": "Saved",
  "Abweichung vom Ziel: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Deviation from target: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
  "Danach am Tag noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Still open for the day afterwards: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
  "Anpassen": "Adjust",
  "Fertig": "Done",
  "Prioritäten und Beigaben": "Priorities and add-ons",
  "Trainingstag": "Training day",
  "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen.": "Choose the shake and its target under “Priorities and add-ons”, then I can work out the amounts.",
  "Der Shake ist für heute schon eingetragen.": "The shake is already entered for today.",
  "Shake": "Shake",
  "Ziel für den Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Target for the shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
  "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel.": "No suggestion can be calculated for the shake: set at least one target in the settings.",
  "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig.": "This reaches your daily goal – nothing is left for a dinner.",
  "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“.": "No suggestions yet: save meals in the diary via “Save / Copy”.",
  "Noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Still open: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
  "Offen nach dem Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Open after the shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
  "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein.": "Your shake after training: the app works out the amounts so it hits the target and then suggests dinners for the rest of the day. The shake has to be saved as a meal.",
  "– kein Shake –": "– no shake –",
  "Was der Shake liefern soll (leer = egal)": "What the shake should deliver (empty = does not matter)",
  "Shake eintragen in": "Enter shake in",
  "erste Mahlzeit": "first meal",
  "Abendessen eintragen in": "Enter dinner in",
  "erste freie Mahlzeit": "first free meal",
  "Trigger tragen den Shake mit den berechneten Mengen ein": "Triggers enter the shake with the calculated amounts",
  "Vorschläge einstellen": "Suggestion settings",
  "Wichtigkeit": "Importance",
  "egal": "don't care",
  "normal": "normal",
  "wichtig": "important",
  "sehr wichtig": "very important",
  "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor.": "The more important a value, the closer the suggestion should hit it. Values without a goal are ignored.",
  "Kalorienziel nie überschreiten": "Never exceed the calorie goal",
  "Eiweißziel möglichst erreichen": "Reach the protein goal if possible",
  "Beigaben": "Add-ons",
  "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite.": "Foods that go with any meal (e.g. nuts). A suggestion only adds them when they fit the remainder better. Fields: minimum, maximum, step.",
  "Mindestmenge": "Minimum amount",
  "Höchstmenge": "Maximum amount",
  "Schrittweite": "Step size",
  "Beigabe hinzufügen": "Add an add-on",
  "+ Beigabe": "+ Add-on",
  "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.": "Scalable: follows the meal's amount factor. Fixed: stays the same.",
  "Skalierbar": "Scalable",
  "Fest": "Fixed",
  "Packung": "Package",
  "Abweichung ±": "Deviation ±",
  "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)": "How far this ingredient may deviate from its ratio to the others (in percent)",
  "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.": "Package size: the suggestion uses as many packages as set under “Number”. Empty = exactly the stored amount.",
  "Mengenfaktor für Vorschläge": "Amount factor for suggestions",
  "von": "from",
  "bis": "to",
  "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6.": "How much the whole meal may be reduced or enlarged in suggestions (1 = amount as saved). Empty = 0.6 to 1.6.",
  "Mahlzeiten-Vorschläge sind nicht aktiviert": "Meal suggestions are not enabled",
  "Vorschlag ist leer": "The suggestion is empty",
  "Ungültige Werte": "Invalid values",
  "Kleinster Faktor ist größer als der größte": "The smallest factor is larger than the largest",

  "Wie viele Packungen ein Vorschlag nehmen darf": "How many packages a suggestion may use (from – to; 0 = may be left out)",
  "Anzahl": "Number",
  "Ausschließen": "Exclude",
  "Ausgeschlossen": "Excluded",
  "Zulassen": "Allow",
  "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück.": "These meals no longer show up in the suggestions. “Allow” brings them back.",

  // default meals
  "Frühstück": "Breakfast", "Mittagessen": "Lunch", "Abendessen": "Dinner", "Snacks": "Snacks",
  "Mahlzeit": "Meal",
  "Menge": "Amount",
  "Die Makros ergeben {} g auf 100 g – mehr als möglich.": "The macros add up to {} g per 100 g – more than possible.",
  "Die Makros ergeben rechnerisch ca. {} kcal, angegeben sind {} kcal.": "The macros add up to about {} kcal, but {} kcal are entered.",
  "{} Lebensmittel durch ausgeblendete Kategorien versteckt.": "{} foods hidden by hidden categories.",
  "{}: Werte übernommen ✓": "{}: values applied ✓",
  "{}: {} kcal · KH {} · Fett {} · Eiweiß {} ({})": "{}: {} kcal · carbs {} · fat {} · protein {} ({})",
  "{} geprüft: {} stimmen überein, {} weichen ab, {} ohne Treffer.": "{} checked: {} match, {} differ, {} without a match.",
  "{} Einträge, {} Gewichtswerte ({} bis {}) aus {} Zeilen.": "{} entries, {} weight values ({} to {}) from {} rows.",
  "{} Tage ({} bis {}), {} Einträge, {} Gewichtswerte": "{} days ({} to {}), {} entries, {} weight values",
  "{} Uhr · {}": "{} · {}",
  "Die Excel-Datei ist zu groß.": "The Excel file is too large.",
  "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).": "Mealie is not set up yet (Settings → Mealie).",
  "Mealie konnte nicht erreicht werden.": "Mealie could not be reached.",
  "Bitte eine Adresse wie http://mealie:9000 angeben.": "Please enter an address like http://mealie:9000.",
  "Nicht gefunden (Adresse oder Rezept prüfen).": "Not found (check the address or the recipe).",
  "Mealie antwortete mit Fehler {}.": "Mealie answered with error {}.",
  "Unter dieser Adresse läuft kein Mealie.": "No Mealie is running at this address.",
  "Ungültiges Rezept.": "Invalid recipe.",
  "Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).": "This address is not allowed (Mealie runs on its own server or add-on).",
  "Mealie ist nicht erreichbar.": "Mealie is not reachable.",
  "Die Seite antwortete mit Fehler {}.": "The page answered with error {}.",
  "Rezept": "Recipe",
  "Wasser": "Water",
  "Koffein": "Caffeine",
  "Kreatin": "Creatine",
  "{} (Kopie)": "{} (copy)",
  "Daten löschen …": "Delete data …",
  "Daten löschen": "Delete data",
  "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an.": "Permanently deletes the chosen data of your account. Other users and the settings stay untouched. Best create a backup (JSON) first.",
  "Einträge, Notizen, Wasser und Aktivität aller Tage": "entries, notes, water and activity of all days",
  "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)": "all foods of the library (diary entries stay)",
  "alle gespeicherten Mahlzeiten": "all saved meals",
  "alle Rezepte samt ihrer Lebensmittel": "all recipes including their foods",
  "Gewicht und Körpermaße": "Weight and body measurements",
  "Gewichtswerte, Körpermaße und Fortschrittsfotos": "weight values, body measurements and progress photos",
  "Tagesziel, Wochentagsziele und Profile": "daily goal, weekday goals and profiles",
  "alle Trigger und Mahlzeiten-Regeln samt Verlauf": "all triggers and meal rules including history",
  "Bitte mindestens einen Bereich wählen.": "Please choose at least one area.",
  "Bitte mindestens einen gültigen Bereich wählen.": "Please choose at least one valid area.",
  "Wirklich unwiderruflich löschen: {}?": "Really delete permanently: {}?",
  "Gelöscht.": "Deleted.",
  "Endgültig löschen": "Delete permanently",
  "Abendessen sollen das Eiweißziel möglichst erreichen": "Dinners should reach the protein goal as far as possible",
  "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)": "Show the “Training day” button every day (otherwise only when the shake is entered or a trigger booked it)",
  "Einkaufsliste": "Shopping list",
  "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt.": "Choose recipes (portions) and saved meals (multiple, 1 = once): the ingredients are added up.",
  "Noch nichts gewählt.": "Nothing chosen yet.",
  "In die Zwischenablage kopieren": "Copy to clipboard",
  "Kopiert ✓": "Copied ✓",
  "An Home Assistant senden": "Send to Home Assistant",
  "Todo-Liste": "To-do list",
  "Keine Todo-Liste in Home Assistant gefunden.": "No to-do list found in Home Assistant.",
  "{} Einträge gesendet.": "{} items sent.",
  "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste).": "Add up the ingredients of recipes and saved meals, copy them or send them to a to-do list in Home Assistant (e.g. the shopping list).",
  "Einkaufsliste nicht aktiviert": "Shopping list is not enabled",
  "Todo-Liste fehlt": "To-do list missing",
  "Keine Einträge": "No items",
  "Home Assistant nicht erreichbar (gesendet: {})": "Home Assistant not reachable (sent: {})",
  "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)": "Offer in the shared household library (others may use and copy it)",
  "Wochenbericht": "Weekly report",
  "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“.": "Once a week a summary of the last seven days as a notification. Uses the notification service from “Reminder”.",
  "Wochenbericht aktiv": "Weekly report active",
  "Wochentag": "Weekday",
  "Vorschau": "Preview",
  "Datenbank": "Database",
  "{} · {} Zeilen in {} Tabellen · frei {} · letzte Sicherung: {}": "{} · {} rows in {} tables · free {} · last backup: {}",
  "Prüfen": "Check",
  "Prüfen und verdichten": "Check and compact",
  "Prüfung läuft …": "Checking …",
  "Verdichtet: {} → {}": "Compacted: {} → {}",
  "Datenbank ist in Ordnung.": "The database is fine.",
  "Datenbank prüfen: {}": "Database check: {}",
  "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)": "Also detect when this many calories were burned (kcal, 0 = off)",
  "Wochentag ungültig": "Invalid weekday",
  "Andere dürfen es auch ändern": "Others may change it as well",
  "Nährwert-Lücken (7 Tage)": "Nutrient gaps (7 days)",
  "Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; {} von {} Tagen erfasst.": "Average of the last 7 days (only days with values) against reference goals; {} of {} days logged.",
  "nicht genug Angaben": "not enough data",
  "Ziele ändern": "Change goals",
  "Ziele für weitere Nährwerte": "Goals for more nutrients",
  "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze.": "Reference values per day in g. Fiber should be reached; for sugar, salt and saturated fat it is an upper limit.",
  "Weitere Nährwerte sind nicht aktiviert": "More nutrients are not enabled",
  "Ziele müssen zwischen 0 und 1000 liegen": "Goals must be between 0 and 1000",
  "Ø {} g (mind. {} g) – im Ziel": "Ø {} g (at least {} g) – on target",
  "Ø {} g (mind. {} g) – {} % unter dem Ziel": "Ø {} g (at least {} g) – {} % below the goal",
  "Ø {} g (höchstens {} g) – im Ziel": "Ø {} g (at most {} g) – on target",
  "Ø {} g (höchstens {} g) – {} % über dem Ziel": "Ø {} g (at most {} g) – {} % above the goal",
  "Aus Text …": "From text …",
  "Rezept aus Text": "Recipe from text",
  "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Paste a recipe as text: first the title, then the ingredients (one per line, with an amount) and the instructions. Headings such as “Ingredients” and “Instructions” help. The ingredients are matched with your foods; you review everything before it is saved.",
  "Rezepttext": "Recipe text",
  "Im Text wurden keine Zutaten gefunden (Zeilen mit Mengen, z. B. „200 g Mehl“).": "No ingredients found in the text (lines with amounts, e.g. “200 g flour”).",
  "Der Text ist zu lang.": "The text is too long.",
  "Offline: 1 Eintrag wartet auf Verbindung.": "Offline: 1 entry is waiting for a connection.",
  "Offline: {} Einträge warten auf Verbindung.": "Offline: {} entries are waiting for a connection.",
  "Hauptmenü": "Main menu",
  "Zeitraum A, von": "Period A, from",
  "Zeitraum A, bis": "Period A, to",
  "Zeitraum B, von": "Period B, from",
  "Zeitraum B, bis": "Period B, to",
};

// Languages: German is the source text; every other language is a dictionary German -> language (EN, FR, ES ...).
const LANGS = { en: EN };   // FR, ES and NL are added below ("more languages")
const LANG_LOCALES = { de: "de-DE", en: "en-US", fr: "fr-FR", es: "es-ES", nl: "nl-NL", it: "it-IT", pt: "pt-BR", pl: "pl-PL" };

// More languages (generated from the German source texts; same keys as EN). Add a language: new dictionary here,
// entry in LANG_LOCALES, in LANGS (extras.py) and in the language selection of the settings.
Object.assign(LANGS, {
  fr: {
    "Ernährung": "Alimentation",
    "Tagebuch": "Journal",
    "Lebensmittel": "Aliments",
    "Mahlzeiten": "Repas",
    "Rezepte": "Recettes",
    "Gewicht": "Poids",
    "Statistik": "Statistiques",
    "Einstellungen": "Paramètres",
    "Lokal": "Local",
    "Kategorien:": "Catégories :",
    "Ein-/ausblenden": "Afficher/masquer",
    "Vortag": "Jour précédent",
    "Folgetag": "Jour suivant",
    "Bearbeiten": "Modifier",
    "Entfernen": "Retirer",
    "Kalorien": "Calories",
    "Kohlenhydrate": "Glucides",
    "Fette": "Lipides",
    "Eiweiß": "Protéines",
    "+ Nahrungsmittel hinzufügen": "+ Ajouter un aliment",
    "Notiz zur Mahlzeit": "Note sur le repas",
    "Tag": "Jour",
    "Notiz ändern": "Modifier la note",
    "Notiz": "Note",
    "Speichern / Kopieren": "Enregistrer / Copier",
    "Mahlzeit leeren": "Vider le repas",
    "Tag leeren": "Vider la journée",
    "Alle Einträge von „{}“ löschen?": "Supprimer toutes les entrées de “{}” ?",
    "Alle Einträge dieses Tages löschen?": "Supprimer toutes les entrées de ce jour ?",
    "Einträge": "Entrées",
    "Ausgeblendete Mahlzeiten wieder verbergen": "Masquer à nouveau les repas masqués",
    "leere/ausgeblendete Mahlzeit anzeigen": "afficher le repas vide/masqué",
    "leere/ausgeblendete Mahlzeiten anzeigen": "afficher les repas vides/masqués",
    "Tagesziel ({})": "Objectif du jour ({})",
    "Dein Tagesziel": "Votre objectif du jour",
    "Gesamt": "Total",
    "Verbleibend": "Restant",
    "Weitere Nährwerte": "Autres nutriments",
    "Notiz zum Tag": "Note de la journée",
    "Ganzen Tag kopieren": "Copier toute la journée",
    "z. B. Hunger, Training, Stimmung …": "p. ex. faim, entraînement, humeur …",
    "Notiz: {}": "Note : {}",
    "Abbrechen": "Annuler",
    "Speichern": "Enregistrer",
    "Auf den Tag": "Au jour",
    "Mengenfaktor (1 = unverändert)": "Facteur de quantité (1 = inchangé)",
    "Bitte einen Tag wählen.": "Veuillez choisir un jour.",
    "Kopieren": "Copier",
    "Wasser & Ergänzungen": "Eau et compléments",
    "Lebensmittel suchen…": "Rechercher des aliments…",
    "Zurück": "Retour",
    "g KH": "g gluc.",
    "g Fett": "g lip.",
    "g Eiweiß": "g prot.",
    "Menge (g)": "Quantité (g)",
    "Ballaststoffe": "Fibres",
    "Zucker": "Sucres",
    "Salz": "Sel",
    "ges. Fettsäuren": "acides gras sat.",
    "Portion wählen …": "Choisir une portion …",
    "Portion": "Portion",
    "Bezeichnung": "Désignation",
    "KH (g)": "Gluc. (g)",
    "Fett (g)": "Lip. (g)",
    "Eiweiß (g)": "Prot. (g)",
    "Uhrzeit": "Heure",
    "Lebensmittel tauschen": "Échanger l’aliment",
    "Bezeichnung und kcal sind Pflicht.": "La désignation et les kcal sont obligatoires.",
    "„{}“ tauschen": "Échanger “{}”",
    "Tauschen": "Échanger",
    "Schnelleingabe in „{}“": "Saisie rapide dans “{}”",
    "Schnelleingabe": "Saisie rapide",
    "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“).": "Sans aliment, seulement les calories et, au besoin, les macros (p. ex. “Restaurant, env. 800 kcal”).",
    "z. B. Restaurant": "p. ex. Restaurant",
    "Hinzufügen": "Ajouter",
    "Als Mahlzeit speichern": "Enregistrer comme repas",
    "Am Tag": "Le jour",
    "Neue Uhrzeit (leer = Originalzeit)": "Nouvelle heure (vide = heure d’origine)",
    "In Mahlzeit": "Dans le repas",
    "Nichts ausgewählt.": "Rien de sélectionné.",
    "Name der Mahlzeit": "Nom du repas",
    "z. B. Diät, Bulk (optional)": "p. ex. Sèche, Prise de masse (facultatif)",
    "Name": "Nom",
    "Kategorie": "Catégorie",
    "Bitte einen Namen angeben.": "Veuillez saisir un nom.",
    "Dieser Browser kann keine Barcodes lesen (BarcodeDetector fehlt). Bitte die Nummer eintippen.": "Ce navigateur ne peut pas lire les codes-barres (BarcodeDetector manquant). Veuillez saisir le numéro.",
    "Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.": "Pas d’accès à la caméra (la page nécessite HTTPS). Utilisez “Photo” ou saisissez le numéro.",
    "Abgebrochen": "Annulé",
    "Scan abbrechen": "Annuler le scan",
    "Halte den Barcode ins Bild.": "Placez le code-barres dans l’image.",
    "Kamerazugriff wurde nicht erlaubt.": "L’accès à la caméra n’a pas été autorisé.",
    "Kamera nicht verfügbar: {}": "Caméra indisponible : {}",
    "Auf dem Foto wurde kein Barcode erkannt.": "Aucun code-barres n’a été reconnu sur la photo.",
    "z. B. 1 Scheibe": "p. ex. 1 tranche",
    "Produkt nicht gefunden ({})": "Produit introuvable ({})",
    "Barcode (Open Food Facts)": "Code-barres (Open Food Facts)",
    "Suchen": "Rechercher",
    "Scannen (Kamera)": "Scanner (caméra)",
    "Foto vom Barcode": "Photo du code-barres",
    "Marke": "Marque",
    "z. B. Diät, Bulk": "p. ex. Sèche, Prise de masse",
    "Portion (g)": "Portion (g)",
    "kcal / 100 g": "kcal / 100 g",
    "KH / 100 g": "Gluc. / 100 g",
    "Fett / 100 g": "Lip. / 100 g",
    "Eiweiß / 100 g": "Prot. / 100 g",
    "Portionsgrößen (optional)": "Tailles de portion (facultatif)",
    "+ Portion": "+ Portion",
    "Name und kcal sind Pflicht.": "Le nom et les kcal sont obligatoires.",
    "Speichern & wählen": "Enregistrer et choisir",
    "Suchen…": "Rechercher…",
    "★ Favoriten": "★ Favoris",
    "Meine Mahlzeiten": "Mes repas",
    "Häufig verwendet": "Souvent utilisés",
    "Beides": "Les deux", "Hinzufügen-Dialog": "Boîte d'ajout", "„Häufig verwendet“ zeigt": "« Souvent utilisés » affiche", "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten.": "S'applique à l'onglet « Aliments » de la boîte d'ajout. L'onglet « Mes repas » affiche toujours les repas souvent utilisés.",
    "Alle": "Tous",
    "Nichts gefunden – lege ein neues Lebensmittel an.": "Rien trouvé – créez un nouvel aliment.",
    "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆.": "Pas encore de favoris – marquez des aliments avec ☆ sur la page “Aliments”.",
    "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen.": "Aucun repas enregistré. Créez-en un dans le journal via “Enregistrer comme repas”.",
    "Portionen": "Portions",
    "+ Neues Lebensmittel": "+ Nouvel aliment",
    "Schnelleingabe (nur kcal)": "Saisie rapide (kcal seulement)",
    "Schließen": "Fermer",
    "Zu „{}“ hinzufügen": "Ajouter à “{}”",
    "Eintrag hinzufügen": "Ajouter une entrée",
    "(Ziel {})": "(objectif {})",
    "Trend {} kg": "Tendance {} kg",
    "Gewichtsverlauf": "Courbe de poids",
    "Verlauf": "Évolution",
    "zu wenig Daten": "pas assez de données",
    "nicht absehbar": "pas prévisible",
    "erreicht": "atteint",
    "Lebensmittel bearbeiten": "Modifier l’aliment",
    "Neues Lebensmittel": "Nouvel aliment",
    "Favorit entfernen": "Retirer des favoris",
    "Als Favorit markieren": "Marquer comme favori",
    "Favorit": "Favori",
    "Trigger anlegen": "Créer un déclencheur",
    "Löschen": "Supprimer",
    "„{}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.": "Supprimer “{}” ? Les repas déjà enregistrés sont conservés.",
    "Nichts gefunden.": "Rien trouvé.",
    "Noch keine Lebensmittel angelegt.": "Aucun aliment pour l’instant.",
    "Duplikate suchen": "Chercher les doublons",
    "Doppelte Lebensmittel": "Aliments en double",
    "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.": "Dans chaque groupe, choisissez l’aliment à conserver. Les repas déjà enregistrés restent inchangés.",
    "Keine Duplikate gefunden.": "Aucun doublon trouvé.",
    "Zusammenführen": "Fusionner",
    "Durch anderes Lebensmittel tauschen": "Remplacer par un autre aliment",
    "Mahlzeit bearbeiten": "Modifier le repas",
    "Komponenten": "Composants",
    "Komponente hinzufügen": "Ajouter un composant",
    "+ Komponente": "+ Composant",
    "Kopie anlegen": "Créer une copie",
    "Mahlzeit „{}“ löschen?": "Supprimer le repas “{}” ?",
    "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.": "Aucun repas enregistré – utilisez “Enregistrer comme repas” dans le journal.",
    "Mahlzeiten suchen…": "Rechercher des repas…",
    "wie Summe der Zutaten": "comme la somme des ingrédients",
    "Gesamt: {} g": "Total : {} g",
    "pro Portion ({} g)": "par portion ({} g)",
    "Rezept bearbeiten": "Modifier la recette",
    "Neues Rezept": "Nouvelle recette",
    "Gewicht fertig (g, optional)": "Poids cuit (g, facultatif)",
    "Zutaten": "Ingrédients",
    "Noch keine Zutaten.": "Pas encore d’ingrédients.",
    "Ungültige Einheit": "Unité non valide",
    "Speichern und jetzt lesen": "Enregistrer et lire maintenant",
    "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen.": "La valeur du capteur date de plus de 30 jours et n’a pas été reprise.",
    "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).": "La valeur est en dehors de 20 à 500 kg (vérifiez l’unité).",
    "Der Sensor liefert gerade keinen Zahlenwert.": "Le capteur ne fournit pas de nombre pour le moment.",
    "Home Assistant nicht erreichbar.": "Home Assistant est injoignable.",
    "Zuerst einen Sensor wählen.": "Choisissez d’abord un capteur.",
    "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.": "Nouvelle valeur vue, elle sera reprise dès qu’elle est stable.",
    "Der aktuelle Wert ist schon übernommen.": "La valeur actuelle a déjà été reprise.",
    "Übernommen: {} am {}": "Repris : {} le {}",
    "Zuletzt übernommen: {} am {}": "Dernière reprise : {} le {}",
    "z. B. sensor.waage_gewicht": "p. ex. sensor.balance_poids",
    "Automatisch (Einheit des Sensors)": "Automatique (unité du capteur)",
    "Einheit des Sensors": "Unité du capteur",
    "Sensor": "Capteur",
    "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg.": "Un capteur Home Assistant avec le poids corporel, p. ex. d’une balance connectée. Le module vérifie chaque minute ; une nouvelle valeur est reprise lorsqu’elle reste inchangée pendant une minute et enregistrée pour le jour de la mesure (une valeur du même jour est remplacée). Des valeurs de 20 à 500 kg sont plausibles.",
    "Waage": "Balance",
    "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung).": "Reprendre automatiquement le poids d’un capteur Home Assistant, p. ex. d’une balance connectée (avec conversion d’unités).",
    "Waage (Sensor)": "Balance (capteur)",
    "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).": "Les ingrédients orange manquaient dans vos aliments et ont été complétés depuis des bases de données en ligne (valeurs indicatives, à vérifier).", "aus Open Food Facts": "d’après Open Food Facts", "aus USDA": "d’après USDA",
    "Zutat hinzufügen": "Ajouter un ingrédient",
    "+ Zutat": "+ Ingrédient",
    "Pro Portion ({} g): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Par portion ({} g) : {} kcal · gluc. {} g · lip. {} g · prot. {} g · {} portions",
    "Rezept „{}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.": "Supprimer la recette “{}” ? L’aliment correspondant est aussi supprimé ; les repas déjà enregistrés sont conservés.",
    "Noch kein Rezept angelegt.": "Pas encore de recette.",
    "Rezepte suchen…": "Rechercher des recettes…",
    "+ Neues Rezept": "+ Nouvelle recette",
    "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel.": "Chaque recette apparaît aussi sous Aliments (pour 100 g, avec “1 portion”) et peut être saisie partout. Les modifications de la recette mettent à jour cet aliment.",
    "1 Portion": "1 portion",
    "Rezept nicht gefunden": "Recette introuvable",
    "Mindestens eine Zutat nötig.": "Au moins un ingrédient est nécessaire.",
    "Portionen müssen größer als 0 sein.": "Les portions doivent être supérieures à 0.",
    "Jede Zutat braucht eine Menge in Gramm.": "Chaque ingrédient a besoin d’une quantité en grammes.",
    "Gewicht nach dem Kochen muss größer als 0 sein.": "Le poids après cuisson doit être supérieur à 0.",
    "z. B. 78,5": "p. ex. 78,5",
    "Gewicht eintragen": "Saisir le poids",
    "Datum": "Date",
    "Gewicht ({})": "Poids ({})",
    "Zielgewicht ({})": "Poids cible ({})",
    "Gewünschte Änderung ({} pro Woche)": "Variation souhaitée ({} par semaine)",
    "Noch keine Gewichtswerte.": "Pas encore de valeurs de poids.",
    "Aktuell": "Actuel",
    "Trend": "Tendance",
    "Veränderung": "Variation",
    "Ziel": "Objectif",
    "Prognose Ziel": "Prévision de l’objectif",
    "30 Tage": "30 jours",
    "90 Tage": "90 jours",
    "1 Jahr": "1 an",
    "7 Tage": "7 jours",
    "180 Tage": "180 jours",
    "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).": "Ligne fine et points : mesures. Ligne épaisse : tendance lissée (variations quotidiennes atténuées).",
    "Trend aktuell {}{} {}/Woche.": "Tendance actuelle {}{} {}/semaine.",
    "Mehr anzeigen": "Afficher plus",
    "Alle {}": "Tous les {}",
    "Weniger": "Moins",
    "Taille": "Tour de taille",
    "Brust": "Poitrine",
    "Hüfte": "Hanches",
    "Oberarm": "Bras",
    "Oberschenkel": "Cuisse",
    "Körperfett %": "Masse grasse %",
    "Bild konnte nicht gelesen werden": "L’image n’a pas pu être lue",
    "Eigene Messung, z. B. Wade": "Mesure personnalisée, p. ex. mollet",
    "Körpermaße": "Mensurations",
    "Werte, die Du nicht messen willst, einfach leer lassen.": "Laissez vides les valeurs que vous ne souhaitez pas mesurer.",
    "Weitere Messung": "Autre mesure",
    "Wert": "Valeur",
    "Bitte mindestens einen Wert eintragen.": "Veuillez saisir au moins une valeur.",
    "Noch keine Werte für diese Messung.": "Pas encore de valeurs pour cette mesure.",
    "Notiz (optional), z. B. Vorderansicht": "Note (facultatif), p. ex. vue de face",
    "Fortschrittsfotos": "Photos de progression",
    "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons.": "Les photos restent dans le module complémentaire sur votre Home Assistant. Elles ne sont ni dans l’export JSON ni dans les sauvegardes automatiques, mais dans la sauvegarde Home Assistant du module.",
    "Vergleichen": "Comparer",
    "Foto hinzufügen": "Ajouter une photo",
    "Foto löschen": "Supprimer la photo",
    "Foto löschen?": "Supprimer la photo ?",
    "Noch keine Fotos.": "Pas encore de photos.",
    "Fotos vergleichen": "Comparer les photos",
    "Ungültiger Wert für {}": "Valeur non valide pour {}",
    "Kein gültiges Bild": "Image non valide",
    "Bild leer oder zu groß (max. 8 MB)": "Image vide ou trop volumineuse (max. 8 Mo)",
    "Foto nicht gefunden": "Photo introuvable",
    "Abnehmen": "Perdre du poids",
    "Halten": "Maintenir",
    "Zunehmen": "Prendre du poids",
    "Kalorienbilanz": "Bilan calorique",
    "Noch keine Einträge im Zeitraum.": "Pas encore d’entrées sur cette période.",
    "Ø Aufnahme": "Ø apport",
    "Gewichtstrend": "Tendance du poids",
    "Überschuss / Tag": "Excédent / jour",
    "Defizit / Tag": "Déficit / jour",
    "Bilanz / Tag": "Bilan / jour",
    "Geschätzter Verbrauch": "Dépense estimée",
    "Aus {} Gewichtswerten und {} von {} erfassten Tagen (1 {} ≈ {} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.": "À partir de {} valeurs de poids et {} jours saisis sur {} (1 {} ≈ {} kcal). Plus le journal et les pesées sont complets, plus c’est précis.",
    "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum.": "Le calcul nécessite au moins deux valeurs de poids espacées d’une semaine sur la période choisie.",
    "Du liegst im Plan.": "Vous êtes dans les clous.",
    "Der Trend liegt über dem Ziel.": "La tendance est au-dessus de l’objectif.",
    "Der Trend liegt unter dem Ziel.": "La tendance est en dessous de l’objectif.",
    "Ziel: {}": "Objectif : {}",
    "(Gewicht halten)": "(maintenir le poids)",
    "({} {}/Woche)": "({} {}/semaine)",
    "· Trend aktuell {} {}/Woche. {}": "· tendance actuelle {} {}/semaine. {}",
    "Für dieses Ziel passen ca. {} kcal am Tag (Dein Ziel: {}).": "Pour cet objectif, environ {} kcal par jour conviennent (votre objectif : {}).",
    "Als Tagesziel übernehmen": "Utiliser comme objectif du jour",
    "Ø Kalorien": "Ø calories",
    "Erfasste Tage": "Jours saisis",
    "Ø Eiweiß": "Ø protéines",
    "Ø Kohlenhydrate": "Ø glucides",
    "Ø Fett": "Ø lipides",
    "Kalorien pro Tag": "Calories par jour",
    "14 Tage": "14 jours", "Kalorien und Gewicht": "Calories et poids", "Kalorien (linke Achse)": "Calories (axe de gauche)", "Gewicht und Trend (rechte Achse)": "Poids et tendance (axe de droite)", "Noch keine Gewichtswerte im Zeitraum.": "Pas encore de pesées sur cette période.",
    "Gestrichelt: Tagesziel je Wochentag": "En pointillés : objectif du jour par jour de la semaine",
    "Gestrichelt: Tagesziel {} kcal": "En pointillés : objectif du jour {} kcal",
    "Nährwertverteilung (Ø)": "Répartition des macros (Ø)",
    "Eiweiß {} %": "Protéines {} %",
    "Kohlenhydrate {} %": "Glucides {} %",
    "Fett {} %": "Lipides {} %",
    "Weitere Nährwerte (Ø pro Tag)": "Autres nutriments (Ø par jour)",
    "Ø pro Tag": "Ø par jour",
    "Eingetragen": "Saisi",
    "Ziel erreicht": "Objectif atteint",
    "Bericht & Zeitraum-Vergleich": "Bilan et comparaison de périodes",
    "7 Tage vs. davor": "7 jours vs. avant",
    "30 Tage vs. davor": "30 jours vs. avant",
    "Eiweißziel erreicht": "Objectif de protéines atteint",
    "Kalorien im Ziel": "Calories dans l’objectif",
    "Gewichtsänderung": "Variation de poids",
    "Differenz": "Différence",
    "Bester Tag (A): {} · Schwächster Tag (A): {}": "Meilleur jour (A) : {} · Jour le plus faible (A) : {}",
    "Tage": "Jours",
    "{} Tage": "{} jours",
    "{} / {} Tage": "{} / {} jours",
    "{} Einträge, {} kcal": "{} entrées, {} kcal",
    "{} / 100 g": "{} / 100 g",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g": "{} kcal · gluc. {} g · lip. {} g · prot. {} g",
    "{} kcal (Ziel {})": "{} kcal (objectif {})",
    "KH {} g · Fett {} g · Eiweiß {} g": "gluc. {} g · lip. {} g · prot. {} g",
    "zu {}": "à {}",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g (pro 100 g)": "{} kcal · gluc. {} g · lip. {} g · prot. {} g (pour 100 g)",
    "Ø": "Ø",
    "Zustand": "État",
    "Kalender": "Calendrier",
    "(am Starttag)": "(le jour de début)",
    "(am Endtag)": "(le jour de fin)",
    "Täglich ab {} Uhr": "Tous les jours à partir de {}",
    "enthält nicht": "ne contient pas",
    "· seit mind. {} Min.": "· depuis au moins {} min",
    "· nur {}–{} Uhr": "· seulement {}–{}",
    "ODER": "OU",
    "UND": "ET",
    "Trigger pausieren": "Mettre le déclencheur en pause",
    "Pause beenden": "Terminer la pause",
    "Heute": "Aujourd’hui",
    "3 Tage": "3 jours",
    "1 Woche": "1 semaine",
    "Oder bis einschließlich": "Ou jusqu’au (inclus)",
    "Pausieren": "Mettre en pause",
    "Zustand einer Entität (z. B. Person ist im Fitnessstudio)": "État d’une entité (p. ex. la personne est à la salle de sport)",
    "Kalendereintrag": "Événement du calendrier",
    "Uhrzeit (täglich ab einer Zeit)": "Heure (tous les jours à partir d’une heure)",
    "z. B. person.max": "p. ex. person.max",
    "ist / enthält": "est / contient",
    "ist NICHT / enthält NICHT": "n’est PAS / ne contient PAS",
    "an jedem Tag des Termins": "chaque jour de l’événement",
    "nur am Starttag (z. B. Donnerstag 22 Uhr)": "seulement le jour de début (p. ex. jeudi 22 h)",
    "nur am Endtag (z. B. Freitag 6 Uhr)": "seulement le jour de fin (p. ex. vendredi 6 h)",
    "Termin zählt": "L’événement compte",
    "Entität": "Entité",
    "Bedingung": "Condition",
    "z. B. calendar.arbeit": "p. ex. calendar.travail",
    "Titel enthält, z. B. Nachtschicht": "Le titre contient, p. ex. garde de nuit",
    "Zustand, z. B. Fitnessstudio (Zonenname) oder on": "État, p. ex. salle de sport (nom de la zone) ou on",
    "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist.": "Saisit une fois par jour dès que cette heure est atteinte.",
    "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält.": "S’applique aux jours avec (ou sans) un événement dont le titre contient ce texte.",
    "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).": "S’applique dès que l’entité a (ou n’a pas) cet état.",
    "Auslöser": "Condition de déclenchement",
    "„{}“ nur an bestimmten Tagen anzeigen": "Afficher “{}” seulement certains jours",
    "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt.": "Les jours avec des entrées restent toujours visibles. Sans règle, le repas est toujours affiché.",
    "Bitte eine Entität angeben.": "Veuillez indiquer une entité.",
    "Gespeicherte Mahlzeiten": "Repas enregistrés",
    "Tagesziel wechseln": "Changer l’objectif du jour",
    "Tagesziel „{}“": "Objectif du jour “{}”",
    "Standardportion": "Portion par défaut",
    "Tage im Voraus eintragen (nur Kalender)": "Saisir des jours à l’avance (calendrier uniquement)",
    "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht.": "0 = seulement le jour même. Avec p. ex. 7, l’entrée est planifiée pour les 7 jours suivants dès qu’un événement correspondant existe.",
    "Zustand muss schon so lange anliegen (Minuten)": "L’état doit durer depuis (minutes)",
    "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist.": "0 = immédiatement. P. ex. 20 : ne saisir que lorsque la personne est à la salle de sport depuis 20 minutes.",
    "Nur zwischen (Uhrzeit, optional)": "Seulement entre (heure, facultatif)",
    "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00).": "En dehors de cette plage horaire, le déclencheur ne saisit rien. Possible au-delà de minuit (22:00 à 06:00).",
    "Zu Mahlzeit im Tagebuch": "Dans le repas du journal",
    "Bei Lebensmitteln optional mit Menge:": "Pour les aliments, avec quantité en option :",
    "Alle Bedingungen müssen zutreffen (UND)": "Toutes les conditions doivent être remplies (ET)",
    "Mindestens eine muss zutreffen (ODER)": "Au moins une doit être remplie (OU)",
    "Verknüpfung": "Combinaison",
    "Entität, z. B. person.anna": "Entité, p. ex. person.anna",
    "Zustand bzw. Titel enthält (leer = an)": "L’état ou le titre contient (vide = on)",
    "Bedingung entfernen": "Retirer la condition",
    "Trigger bearbeiten": "Modifier le déclencheur",
    "Neuer Trigger": "Nouveau déclencheur",
    "+ Weitere Bedingung": "+ Autre condition",
    "Dann": "Alors",
    "Bitte eine Uhrzeit angeben.": "Veuillez indiquer une heure.",
    "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen.": "Veuillez choisir un aliment, un repas ou un objectif du jour.",
    "Weitere Bedingung: bitte eine Entität angeben.": "Autre condition : veuillez indiquer une entité.",
    "Komplett (alle Einträge mit Mahlzeiten)": "Complet (toutes les entrées avec repas)",
    "Nur Tageskalorien und Makros (eine Summe pro Tag)": "Seulement calories et macros du jour (un total par jour)",
    "Neue Mahlzeit anlegen": "Créer un nouveau repas",
    "Mahlzeiten zuordnen": "Attribuer les repas",
    "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)": "Masquer les repas vides ces jours-là (afficher seulement le total du jour)",
    "MyFitnessPal-Import": "Import MyFitnessPal",
    "Was importieren?": "Que faut-il importer ?",
    "Gewicht übernehmen": "Importer le poids",
    "Vorhandene Einträge an diesen Tagen ersetzen": "Remplacer les entrées existantes de ces jours",
    "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Importé : {} jours, {} entrées, {} valeurs de poids.",
    "Importieren": "Importer",
    "Eiweiß {} % · Kohlenhydrate {} % · Fett {} %": "Protéines {} % · Glucides {} % · Lipides {} %",
    "· Makros ergeben {} kcal": "· les macros totalisent {} kcal",
    "Tagesziele": "Objectifs du jour",
    "Mein Ziel": "Mon objectif",
    "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet.": "Détermine quand un jour compte comme “dans l’objectif” (perdre : au plus, prendre : au moins, maintenir : ±10 %) et comment les statistiques évaluent votre tendance de poids.",
    "Kalorien aus Makros berechnen": "Calculer les calories à partir des macros",
    "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g).": "Quand les protéines, glucides ou lipides changent, les calories suivent (4/4/9 kcal par g).",
    "Kalorien (kcal)": "Calories (kcal)",
    "Kohlenhydrate (g)": "Glucides (g)",
    "Gespeichert ✓": "Enregistré ✓",
    "Zusatzfunktionen": "Fonctions optionnelles",
    "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen.": "Fonctions optionnelles, désactivées par défaut. Une fois activées, elles apparaissent dans le journal et ici dans les paramètres.",
    "Tagesziele pro Wochentag": "Objectifs du jour par jour de la semaine",
    "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger.": "p. ex. jours d’entraînement avec plus de calories, jours de repos avec moins.",
    "Wasser und Nahrungsergänzung": "Eau et compléments alimentaires",
    "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.": "Saisie rapide pour l’eau, la caféine, la créatine etc. avec son propre objectif quotidien.",
    "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter).": "Regrouper des ingrédients en recette, diviser par portions et la saisir comme un aliment (onglet dédié).",
    "Notizen": "Notes",
    "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten.": "Texte libre pour les repas et les jours (faim, entraînement, humeur). Les notes existantes sont conservées si vous désactivez la fonction.",
    "Körpermaße und Fortschrittsfotos": "Mensurations et photos de progression",
    "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht.": "Tours (taille, poitrine, bras …) avec évolution, et photos avec comparaison, dans l’onglet Poids.",
    "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit).": "Saisir et analyser les fibres, sucres, sel et acides gras saturés des aliments (Open Food Facts les fournit).",
    "Montag": "Lundi",
    "Dienstag": "Mardi",
    "Mittwoch": "Mercredi",
    "Donnerstag": "Jeudi",
    "Freitag": "Vendredi",
    "Samstag": "Samedi",
    "Sonntag": "Dimanche",
    "wie Standard": "comme par défaut",
    "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros.": "Calories vides = l’objectif du jour par défaut ci-dessus s’applique. Macros vides affichent “–”. Avec “Calculer les calories à partir des macros” (ci-dessus), les calories suivent les macros.",
    "Tagesziel-Profile": "Profils d’objectif du jour",
    "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel.": "p. ex. “Entraînement” et “Jour de repos”. Un déclencheur (Paramètres → Déclencheurs → “Alors : changer l’objectif du jour”) fait passer la journée à un profil, par exemple quand la personne est à la salle de sport. Le profil l’emporte sur l’objectif du jour de la semaine.",
    "Profil löschen": "Supprimer le profil",
    "Profil „{}“ löschen? Trigger dafür werden ebenfalls gelöscht.": "Supprimer le profil “{}” ? Les déclencheurs associés sont aussi supprimés.",
    "Noch keine Profile.": "Pas encore de profils.",
    "Neues Profil": "Nouveau profil",
    "+ Profil": "+ Profil",
    "Einheit": "Unité",
    "Schritt": "Pas",
    "„{}“ samt Verlauf löschen?": "Supprimer “{}” avec son historique ?",
    "Neu, z. B. Magnesium": "Nouveau, p. ex. magnésium",
    "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch.": "Par ligne : nom, unité, objectif quotidien et pas des boutons +/− dans le journal.",
    "Feste Mahlzeiten (Frühstück, Mittagessen, …)": "Repas fixes (petit-déjeuner, déjeuner, …)",
    "Uhrzeiten (08:47 …, 11:30 …)": "Heures (08:47 …, 11:30 …)",
    "Automatisch (Windows-Look bei HA-95/98-Theme)": "Automatique (look Windows avec le thème HA 95/98)",
    "Standard (HA-Theme)": "Par défaut (thème HA)",
    "Windows-Look": "Look Windows",
    "Darstellung": "Apparence",
    "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende.": "Les entrées existantes sont conservées ; sans heure, elles apparaissent à la fin dans la vue horaire.",
    "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten": "Lancer directement le lecteur de codes-barres à l'ouverture sur cet appareil",
    "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.": "Pour un widget d'écran d'accueil de l'application Companion : crée-y un raccourci vers ce panneau, et la caméra s'ouvre aussitôt.",
    "Optik": "Look",
    "Nach oben": "Monter",
    "Nach unten": "Descendre",
    "Nur an bestimmten Tagen anzeigen": "Afficher seulement certains jours",
    "Wieder einblenden": "Afficher à nouveau",
    "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Masquer (visible seulement les jours avec des entrées)",
    "Ausblenden": "Masquer",
    "{} – blende sie stattdessen mit ⊘ aus.": "{} – masquez-le plutôt avec ⊘.",
    "Neue Mahlzeit, z. B. Nachtschicht": "Nouveau repas, p. ex. garde de nuit",
    "nur an Tagen: {}": "seulement les jours : {}",
    "Regel bearbeiten": "Modifier la règle",
    "Regel löschen": "Supprimer la règle",
    "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "Avec ⚡, vous n’affichez un repas que les jours où, par exemple, votre calendrier contient un certain événement. Avec ⊘, vous le masquez en permanence (il reste visible seulement les jours avec des entrées) ; seul un repas vide peut être supprimé.",
    "Trigger": "Déclencheurs",
    "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Saisir automatiquement des aliments ou des repas quand Home Assistant signale quelque chose (lieu, calendrier, interrupteur …). Aussi possible via ⚡ sur les aliments.",
    "Letzter Fehler ({}): {}": "Dernière erreur ({}) : {}",
    "Aktiv": "Actif",
    "pausiert bis {}": "en pause jusqu’au {}",
    "· {} Tage im Voraus": "· {} jours à l’avance",
    "· zuletzt {}": "· dernier {}",
    "Pausieren …": "Mettre en pause …",
    "Jetzt testen (trägt heute ein)": "Tester maintenant (saisit pour aujourd’hui)",
    "Eingetragen.": "Saisi.",
    "Noch keine Trigger.": "Pas encore de déclencheurs.",
    "Prüfe …": "Vérification …",
    "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "Pas d’accès à Home Assistant (SUPERVISOR_TOKEN manquant).",
    "Geprüft {}, nichts zu tun.": "Vérifié {}, rien à faire.",
    "Jetzt prüfen": "Vérifier maintenant",
    "Version": "Version",
    "Installiert: ": "Installée : ",
    "Nach Updates suchen": "Rechercher des mises à jour",
    "Keine Verbindung zu GitHub.": "Pas de connexion à GitHub.",
    "Version {} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.": "La version {} est disponible. Dans Home Assistant : Paramètres → Modules complémentaires, rechercher des mises à jour et mettre à jour.",
    "Du hast die aktuelle Version.": "Vous avez la dernière version.",
    "+ Neuer Trigger": "+ Nouveau déclencheur",
    "Trigger-Verlauf": "Historique des déclencheurs",
    "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.": "Ce que les déclencheurs ont saisi en dernier. “Annuler” retire à nouveau les entrées ; le déclencheur ne saisit pas de nouveau ce jour-là.",
    "Trigger gelöscht": "Déclencheur supprimé",
    "(gelöscht)": "(supprimé)",
    "Einträge nicht mehr vorhanden": "Les entrées n’existent plus",
    "Rückgängig": "Annuler",
    "Erinnerung": "Rappel",
    "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde.": "Notification via Home Assistant si rien n’a été saisi à l’heure choisie.",
    "Erinnerung aktiv": "Rappel actif",
    "Benachrichtigungsdienst": "Service de notification",
    "Automatische Sicherung": "Sauvegarde automatique",
    "Täglich eine JSON-Sicherung in {}, Aufbewahrung {} Tage (Add-on-Option „backup_keep_days“).": "Une sauvegarde JSON par jour dans {}, conservée {} jours (option du module “backup_keep_days”).",
    "Aus (Add-on-Option „auto_backup“).": "Désactivée (option du module “auto_backup”).",
    "· {} KB": "· {} Ko",
    "Wiederherstellen": "Restaurer",
    "Noch keine Sicherung.": "Pas encore de sauvegarde.",
    "Jetzt sichern": "Sauvegarder maintenant",
    "Schnittstelle für Automationen": "Interface pour les automatisations",
    "Aktiv. Deine Benutzer-ID: {}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.": "Actif. Votre identifiant d’utilisateur : {}. Des exemples d’appel (rest_command) figurent dans la documentation du module.",
    "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.": "Désactivée. Pour l’activer, définissez une clé “api_key” dans les options du module. Balance, assistant vocal ou automatisations peuvent alors envoyer des entrées et le poids.",
    "Daten": "Données",
    "Export/Import betrifft nur dein Benutzerkonto.": "L’export/import ne concerne que votre compte utilisateur.",
    "Sicherung (JSON)": "Sauvegarde (JSON)",
    "Tagebuch als CSV": "Journal en CSV",
    "Datei nicht lesbar:": "Fichier illisible :",
    "Sicherung einspielen": "Importer une sauvegarde",
    "MyFitnessPal-CSV importieren": "Importer un CSV MyFitnessPal",
    "Keine gültige Sicherung:": "Sauvegarde non valide :",
    "Sicherung wiederherstellen": "Restaurer la sauvegarde",
    "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt.": "Toutes les données actuelles de votre compte seront remplacées par la sauvegarde.",
    "Jetzt": "Maintenant",
    "Sicherung": "Sauvegarde",
    "Gewichtswerte": "Valeurs de poids",
    "Zeitraum": "Période",
    "Wiederhergestellt.": "Restauré.",
    "Ersetzen": "Remplacer",
    "Sprache und Einheiten": "Langue et unités",
    "Sprache": "Langue",
    "Einheiten": "Unités",
    "Automatisch (Browser)": "Automatique (navigateur)",
    "Metrisch (kg, cm)": "Métrique (kg, cm)",
    "Imperial (lb, in)": "Impérial (lb, in)",
    "Teilen …": "Partager …",
    "„{}“ teilen": "Partager “{}”",
    "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Portion en multiple de l’entrée (1 = même quantité). L’entrée apparaît le même jour dans le journal des autres.",
    "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Quantité pour chaque personne en grammes. L’entrée apparaît le même jour dans le journal des autres.",
    "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein.": "Personne d’autre ne participe encore au foyer. Chaque utilisateur active “Foyer” sous Paramètres → Fonctions optionnelles.",
    "Bitte mindestens eine Person wählen.": "Veuillez choisir au moins une personne.",
    "Eingetragen bei {} Person(en).": "Saisi pour {} personne(s).",
    "Haushalt": "Foyer",
    "Einträge mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Partager des entrées avec d’autres utilisateurs, chacun avec sa portion (p. ex. un plat pour la famille). Les deux côtés doivent activer la fonction.",
    "Benutzerverwaltung": "Gestion des utilisateurs",
    "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer).": "Visible uniquement pour les administrateurs (option du module “admin_users” ; vide = le premier utilisateur).",
    "Benutzer": "Utilisateur",
    "Zuletzt": "Dernier",
    "Export": "Export",
    "Admin": "Admin",
    "Alle Daten von „{}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:": "Supprimer définitivement toutes les données de “{}” ? Saisissez le nom pour confirmer :",
    "Nur für Administratoren": "Réservé aux administrateurs",
    "Das eigene Konto kann hier nicht gelöscht werden": "Votre propre compte ne peut pas être supprimé ici",
    "Zur Bestätigung den Namen des Benutzers eingeben": "Saisissez le nom de l’utilisateur pour confirmer",
    "Haushaltsfunktion ist nicht aktiviert": "La fonction Foyer n’est pas activée",
    "Dieser Benutzer nimmt nicht am Haushalt teil": "Cet utilisateur ne participe pas au foyer",
    "Weitere Importe": "Autres imports",
    "Weitere Importe …": "Autres imports …",
    "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.": "L’import ne concerne que votre compte utilisateur. Les données existantes sont conservées, sauf si vous choisissez expressément “remplacer”.",
    "CSV aus einer anderen App": "CSV d’une autre appli",
    "Datei wählen": "Choisir un fichier",
    "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.": "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) et tableaux similaires. Les colonnes sont reconnues et peuvent être corrigées.",
    "Apple Health": "Apple Santé",
    "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.": "export.zip ou export.xml de l’appli Santé (profil → exporter les données de santé). Le fichier est lu directement dans le navigateur ; seules les valeurs quotidiennes sont envoyées.",
    "Messart": "Type de mesure",
    "Natrium": "Sodium",
    "Bitte die Spalte mit dem Datum zuordnen.": "Veuillez attribuer la colonne de date.",
    "{} Einträge, {} Gewichtswerte aus {} Zeilen.": "{} entrées, {} valeurs de poids sur {} lignes.",
    "CSV importieren": "Importer le CSV",
    "Erkannt: {}": "Reconnu : {}",
    "Zuordnung der Spalten": "Attribution des colonnes",
    "– nicht vorhanden –": "– absent –",
    "Einheit der Gewichtsspalte": "Unité de la colonne de poids",
    "Stone": "Stone",
    "Lese Datei …": "Lecture du fichier …",
    "Lese Datei … {} %": "Lecture du fichier … {} %",
    "Keine gültige ZIP-Datei.": "Fichier ZIP non valide.",
    "Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.": "Fichier ZIP très volumineux (ZIP64) : veuillez le décompresser et choisir export.xml.",
    "In der ZIP-Datei wurde keine export.xml gefunden.": "Aucun export.xml trouvé dans le fichier ZIP.",
    "Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.": "Ce navigateur ne peut pas décompresser le fichier. Veuillez le décompresser et choisir export.xml.",
    "{} Gewichtswerte, {} Tage mit Ernährungsdaten gefunden.": "{} valeurs de poids et {} jours avec données nutritionnelles trouvés.",
    "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)": "Importer le poids (une valeur par jour, les valeurs existantes sont écrasées)",
    "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)": "Importer les totaux nutritionnels quotidiens (une saisie rapide par jour, utile seulement si vous ne tenez pas vos repas ici par ailleurs)",
    "Importiert: {} Tage, {} Gewichtswerte.": "Importé : {} jours, {} valeurs de poids.",
    "Die Datei enthält keine Datenzeilen.": "Le fichier ne contient aucune ligne de données.",
    "Export für Berater und Trainer": "Export pour diététicien et coach",
    "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum.": "Un rapport à imprimer ou à enregistrer en PDF (choisissez “Enregistrer au format PDF” dans la boîte d’impression) et un tableau des valeurs quotidiennes. Ne contient que la période choisie.",
    "Von": "Du",
    "Bis": "Au",
    "Einzelne Einträge im Bericht auflisten": "Lister les entrées individuelles dans le rapport",
    "Bericht öffnen (Drucken / PDF)": "Ouvrir le rapport (impression / PDF)",
    "Tagesübersicht (CSV)": "Aperçu quotidien (CSV)",
    "Makro-Verlauf": "Évolution des macros",
    "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage.": "Barres : grammes par jour. En pointillés : objectif du jour. Ligne continue : moyenne des 7 derniers jours.",
    "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen.": "Barres : grammes par jour. Ligne continue : moyenne des 7 derniers jours. Vous pouvez définir un objectif pour ce macro sous Paramètres → Objectifs du jour.",
    "{} g (Ziel {} g)": "{} g (objectif {} g)",
    "Ø 7 Tage {} g": "Ø 7 jours {} g",
    "nicht erfasst": "non saisi",
    "Online suchen & vergleichen": "Rechercher en ligne et comparer",
    "Name oder Barcode": "Nom ou code-barres",
    "Quelle": "Source",
    "KH": "Gluc.",
    "Fett": "Lip.",
    "Abweichung": "Écart",
    "Abweichung der kcal von dem Wert im Formular": "Écart des kcal par rapport à la valeur du formulaire",
    "Übernehmen": "Appliquer",
    "Mittelwert der gewählten übernehmen": "Appliquer la moyenne de la sélection",
    "Suche …": "Recherche …",
    "Alle Werte pro 100 g.": "Toutes les valeurs pour 100 g.",
    "Die Quellen weichen bei kcal um bis zu {} % voneinander ab – bitte prüfen.": "Les sources diffèrent de jusqu’à {} % en kcal – veuillez vérifier.",
    "nicht erreichbar": "injoignable",
    "Weitere Datenquellen": "Autres sources de données",
    "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet).": "Recherche en ligne dans Open Food Facts et USDA avec comparaison des valeurs entre elles et avec les vôtres (les termes de recherche sont envoyés à ces services).",
    "Weitere Datenquellen sind nicht aktiviert": "Les autres sources de données ne sont pas activées",
    "Suchbegriff oder Barcode angeben": "Indiquez un terme de recherche ou un code-barres",
    "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)": "Limite USDA atteinte (définissez votre propre clé api.data.gov dans les options du module)",
    "Open Food Facts nicht erreichbar": "Open Food Facts injoignable",
    "Mahlzeit enthält noch Einträge": "Le repas contient encore des entrées",
    "Mahlzeit ist leer": "Le repas est vide",
    "Mahlzeit braucht mindestens eine Komponente": "Le repas nécessite au moins un composant",
    "Keine MyDietAssistant-Sicherung": "Pas une sauvegarde MyDietAssistant",
    "Das sieht nicht nach einem MyFitnessPal-Export aus.": "Cela ne ressemble pas à un export MyFitnessPal.",
    "Home Assistant nicht erreichbar": "Home Assistant injoignable",
    "Uhrzeit (HH:MM) erforderlich": "Heure (HH:MM) requise",
    "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben": "indiquez exactement un élément parmi repas / aliment / profil d’objectif",
    "weitere Bedingung: Art und Entität erforderlich": "autre condition : type et entité requis",
    "Name und Kalorien erforderlich": "Nom et calories requis",
    "ungültiger Zeitraum": "période non valide",
    "Quell- und Zieltag sind gleich": "Le jour source et le jour cible sont identiques",
    "Sicherung nicht gefunden": "Sauvegarde introuvable",
    "Externe API ist aus: Option api_key im Add-on setzen": "L’API externe est désactivée : définissez l’option api_key dans le module",
    "falscher Schlüssel": "mauvaise clé",
    "Lebensmittel „{}“ nicht gefunden": "Aliment “{}” introuvable",
    "food oder name angeben": "indiquez food ou name",
    "kg außerhalb des gültigen Bereichs": "kg hors de la plage valide",
    "Uhrzeit fehlt": "heure manquante",
    "Benachrichtigungsdienst wie notify.mobile_app_handy angeben": "Indiquez un service de notification comme notify.mobile_app_telephone",
    "not found": "not found",
    "Aktivität": "Activité",
    "Aktivität eintragen": "Saisir l’activité",
    "Schritte": "Pas",
    "Verbrannt": "Brûlées",
    "Zum Tagesziel": "Ajouté à l’objectif",
    "aus Schritten geschätzt": "estimé à partir des pas",
    "Eintragen": "Saisir",
    "Aus Home Assistant lesen": "Lire depuis Home Assistant",
    "Handeingabe verwerfen": "Annuler la saisie manuelle",
    "Dein Tagesziel (+{} kcal Aktivität)": "Votre objectif du jour (+{} kcal d’activité)",
    "Tagesziel ({}) (+{} kcal Aktivität)": "Objectif du jour ({}) (+{} kcal d’activité)",
    "(+{} kcal Aktivität)": "(+{} kcal d’activité)",
    "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben.": "Les valeurs saisies à la main ne sont plus écrasées par les capteurs pour ce jour.",
    "Verbrannte Kalorien (kcal)": "Calories brûlées (kcal)",
    "leer = aus Schritten schätzen": "vide = estimer à partir des pas",
    "{} % der verbrannten Kalorien": "{} % des calories brûlées",
    "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen.": "Capteurs Home Assistant qui comptent au fil de la journée et repassent à 0 à minuit (un compteur qui ne fait que croître peut être rendu quotidien avec l’assistant “Compteur d’utilité”). Le module les lit toutes les cinq minutes. Sans capteur de calories, les calories sont estimées à partir des pas, du poids corporel et du facteur ci-dessous ; les valeurs peuvent aussi être saisies à la main.",
    "Sensor für Schritte": "Capteur de pas",
    "Sensor für aktive Kalorien (kcal)": "Capteur de calories actives (kcal)",
    "Anteil, der das Tagesziel erhöht (%)": "Part qui augmente l’objectif du jour (%)",
    "kcal je Schritt und kg Körpergewicht": "kcal par pas et par kg de poids corporel",
    "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind.": "Beaucoup d’applis ne comptent qu’une partie des calories brûlées (50 % est une valeur prudente), car les valeurs d’activité sont souvent surestimées.",
    "z. B. sensor.handy_schritte": "p. ex. sensor.telephone_pas",
    "z. B. sensor.handy_aktive_kalorien": "p. ex. sensor.telephone_calories_actives",
    "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages.": "Les pas et les calories brûlées (issus de capteurs Home Assistant ou saisis à la main) augmentent l’objectif calorique du jour concerné.",
    "Mahlzeiten-Zeitplan": "Planning des repas",
    "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung.": "Une plage horaire par repas : le journal indique quel repas est à l’ordre du jour et peut envoyer une notification.",
    "Jetzt: {}": "Maintenant : {}",
    "({} Uhr)": "({} h)",
    "Als Nächstes: {} ab {} Uhr": "Ensuite : {} à partir de {} h",
    "schon eingetragen": "déjà saisi",
    "+ Hinzufügen": "+ Ajouter",
    "Von (leer = Standardfenster)": "De (vide = plage par défaut)",
    "Bis (leer = Standardfenster)": "À (vide = plage par défaut)",
    "Standardfenster": "Plage par défaut",
    "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.": "Plage horaire par repas. Laissée vide, une plage par défaut s’applique (petit-déjeuner, déjeuner et dîner) ; les en-cas n’en ont pas. Les plages au-delà de minuit sont possibles.",
    "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist": "Notifier quand un repas est à l’ordre du jour et encore vide",
    "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten.": "Utilise le service de notification de “Rappel” plus bas.",
    "Zwischenspeicher der Online-Suche": "Cache de la recherche en ligne",
    "Zwischenspeicher leeren": "Vider le cache",
    "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch.": "Le module mémorise localement les requêtes à Open Food Facts et USDA (codes-barres 60 jours, termes de recherche 14 jours), si bien que les recherches répétées ne vont plus sur Internet. Seules des données de produits sont enregistrées, rien sur votre journal.",
    "{} gespeicherte Abfragen ({} KB)": "{} requêtes enregistrées ({} Ko)",
    "Barcode scannen": "Scanner un code-barres",
    "Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.": "Le lecteur de codes-barres n’a pas pu être chargé. Veuillez saisir le numéro.",
    "Mehr laden": "Charger plus",
    "Tabelle importieren …": "Importer un tableau …",
    "Werte online prüfen": "Vérifier les valeurs en ligne",
    "Prüfen": "Vérifier",
    "Anhalten": "Arrêter",
    "Ignorieren": "Ignorer",
    "Prüfe {} von {} …": "Vérification {} sur {} …",
    "Nur Lebensmittel mit Barcode ({} von {})": "Seulement les aliments avec code-barres ({} sur {})",
    "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)": "Interroger aussi USDA (limite de requêtes stricte sans clé personnelle)",
    "Online-Abfrage nicht möglich: {}": "Requête en ligne impossible : {}",
    "Dein Wert: {} kcal · KH {} · Fett {} · Eiweiß {}": "Votre valeur : {} kcal · gluc. {} · lip. {} · prot. {}",
    "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst.": "Compare vos aliments avec Open Food Facts (par code-barres, sinon par nom) et montre les écarts de calories et de macros. Rien n’est modifié avant que vous choisissiez “Appliquer”. Les requêtes sont mises en cache localement ; les codes-barres ou noms sont envoyés au service.",
    "Lebensmittel-Tabelle importieren": "Importer un tableau d’aliments",
    "Lebensmittel-Tabelle": "Tableau d’aliments",
    "Energie (kJ)": "Énergie (kJ)",
    "Bitte die Spalten für Name und Kalorien zuordnen.": "Veuillez attribuer les colonnes du nom et des calories.",
    "{} Lebensmittel erkannt ({} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.": "{} aliments reconnus ({} lignes sans nom ni calories sont ignorées). Valeurs pour 100 g.",
    "Kategorie für Lebensmittel ohne Kategorie in der Datei": "Catégorie des aliments importés",
    "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Les aliments existants avec les mêmes nom et marque restent inchangés.",
    "Importiert: {} neu, {} schon vorhanden, {} übersprungen.": "Importé : {} nouveaux, {} déjà présents, {} ignorés.",
    "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.": "Un tableau nutritionnel (par exemple BLS, export Open Food Facts, CIQUAL ou votre propre liste) au format CSV ou Excel : les aliments avec valeurs pour 100 g sont ajoutés à votre bibliothèque.",
    "Mit dem Haushalt teilen": "Partager avec le foyer",
    "Teilen": "Partager",
    "{} kopiert, {} übersprungen.": "{} copiés, {} ignorés.",
    "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen.": "Les personnes choisies reçoivent leur propre copie dans leur bibliothèque. Les entrées de même nom chez elles restent inchangées, les modifications ultérieures ne sont pas synchronisées.",
    "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Partager des entrées, aliments et repas avec d’autres utilisateurs, chacun avec sa portion (p. ex. un plat pour la famille). Les deux côtés doivent activer la fonction.",
    "Lebensmittelmengen": "Quantités d’aliments",
    "Gramm": "Grammes",
    "Unzen (oz)": "Onces (oz)",
    "Menge (oz)": "Quantité (oz)",
    "Portion (oz)": "Portion (oz)",
    "Gewicht fertig (oz, optional)": "Poids cuit (oz, facultatif)",
    "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Quantité pour chaque personne en onces. L’entrée apparaît le même jour dans le journal des autres.",
    "Gesamt: {}": "Total : {}",
    "pro Portion ({})": "par portion ({})",
    "Pro Portion ({}): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Par portion ({}) : {} kcal · gluc. {} g · lip. {} g · prot. {} g · {} portions",
    "Gemeinsame Haushaltsbibliothek": "Bibliothèque partagée du foyer",
    "Für den Haushalt freigegeben": "Partagé avec le foyer",
    "geteilt": "partagé",
    "von {}": "de {}",
    "Gehört {}. Änderungen gelten für alle im Haushalt.": "Appartient à {}. Les modifications s’appliquent à tout le foyer.",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)": "Proposer dans la bibliothèque partagée du foyer (les autres peuvent l’utiliser et la modifier)",
    "Aus Mealie …": "Depuis Mealie …", "Rezept aus Mealie": "Recette depuis Mealie", "In Mealie suchen…": "Rechercher dans Mealie…", "Weitere laden": "Charger plus",
    "{} Portionen": "{} portions", "Mealie": "Mealie", "Adresse": "Adresse", "API-Token": "Jeton d'API",
    "Gespeichert (leer lassen = unverändert)": "Enregistré (laisser vide = inchangé)",
    "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert.": "La recette est lue depuis ton serveur Mealie et ses ingrédients sont associés à tes aliments ; tu vérifies tout avant l'enregistrement. Rien n'est modifié dans Mealie.",
    "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren.": "Reprendre des recettes d'un serveur Mealie. Indique l'adresse du serveur (réseau local ou add-on) et un jeton d'API de Mealie (profil → jetons d'API). L'add-on ne fait que lire les recettes et ne modifie rien dans Mealie. Le jeton reste dans l'add-on et n'apparaît pas dans l'export. Vide l'adresse pour le retirer.",
    "Von Webseite …": "Depuis une page web …",
    "Rezept von Webseite": "Recette depuis une page web",
    "Lade …": "Chargement …",
    "Adresse der Rezeptseite": "Adresse de la page de recette",
    "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Le module récupère la page et y cherche des données de recette (ingrédients, portions, préparation). Les ingrédients sont associés à vos aliments ; vous vérifiez tout avant l’enregistrement.",
    "Zubereitung": "Préparation",
    "Zubereitung, ein Schritt pro Zeile": "Préparation, une étape par ligne",
    "Angabe der Webseite: {} kcal pro Portion": "Indication de la page web : {} kcal par portion",
    "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "1 ingrédient non associé (rouge) : choisissez un aliment avec ⇄, sinon il compte pour 0 kcal. Veuillez compléter les quantités manquantes.",
    "{} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "{} ingrédients non associés (rouge) : choisissez un aliment avec ⇄, sinon ils comptent pour 0 kcal. Veuillez compléter les quantités manquantes.",
    "Bitte eine Adresse mit http:// oder https:// angeben.": "Veuillez saisir une adresse commençant par http:// ou https://",
    "Die Adresse wurde nicht gefunden.": "L’adresse est introuvable.",
    "Adressen im lokalen Netz sind nicht erlaubt.": "Les adresses du réseau local ne sont pas autorisées.",
    "Die Seite ist zu groß.": "La page est trop volumineuse.",
    "Zu viele Weiterleitungen.": "Trop de redirections.",
    "Die Seite konnte nicht geladen werden.": "La page n’a pas pu être chargée.",
    "Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).": "Aucune recette trouvée sur cette page (données de recette structurées manquantes).",
    "Das Rezept enthält keine Zutaten.": "La recette ne contient aucun ingrédient.",
    "Rezepte sind nicht aktiviert": "Les recettes ne sont pas activées",
    "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf": "Récupère les pas et les calories des 30 derniers jours depuis l’historique de Home Assistant",
    "Verlauf nachladen": "Charger l’historique",
    "Verlauf nachgeladen: {} Tage.": "Historique chargé : {} jours.",
    "Zeitraum: 1 bis 365 Tage": "Période : 1 à 365 jours",
    "Zuerst einen Sensor für Schritte oder Kalorien wählen": "Choisissez d’abord un capteur de pas ou de calories",
    "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)": "Home Assistant n’a pas fourni l’historique (enregistreur activé ?)",
    "Ungültige Entität": "Entité non valide",
    "Wert außerhalb des Bereichs": "Valeur hors plage",
    "Nur im Home-Assistant-Add-on möglich": "Possible uniquement dans le module complémentaire Home Assistant",
    "Leere Datei": "Fichier vide",
    "Die Datei konnte nicht gelesen werden.": "Le fichier n’a pas pu être lu.",
    "Die Excel-Datei enthält kein Tabellenblatt.": "Le fichier Excel ne contient aucune feuille.",
    "Zu viele Zeilen (höchstens 50 000)": "Trop de lignes (50 000 au maximum)",
    "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Attribuez les colonnes du nom et des calories (kcal ou kJ)",
    "Mahlzeiten-Vorschläge": "Suggestions de repas",
    "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben).": "Bouton dans le journal : propose des repas enregistrés et des combinaisons de ton historique qui correspondent aux calories et macros restantes (les quantités sont ajustées, les paquets fixes restent).",
    "Mahlzeit vorschlagen": "Proposer un repas",
    "Rest des Tages": "Reste de la journée",
    "Anteil für diese Mahlzeit": "Part pour ce repas",
    "Ziel für diese Mahlzeit: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Objectif pour ce repas : {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.": "Ton objectif du jour est déjà atteint – il n'y a rien à compléter.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf.": "Pas encore de suggestions : enregistre des repas dans le journal via « Enregistrer / Copier » ou mange des combinaisons au moins deux fois, elles apparaîtront ici.",
    "Weitere Vorschläge": "Autres suggestions",
    "Beigabe": "Accompagnement",
    "aus dem Verlauf ({}×)": "depuis l'historique ({}×)",
    "Gespeichert": "Enregistré",
    "Abweichung vom Ziel: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Écart par rapport à l'objectif : {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Danach am Tag noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Encore ouvert pour la journée ensuite : {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Anpassen": "Ajuster",
    "Fertig": "Terminé",
    "Prioritäten und Beigaben": "Priorités et accompagnements",
    "Trainingstag": "Jour d'entraînement",
    "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen.": "Choisis le shake et son objectif sous « Priorités et accompagnements », puis je peux calculer les quantités.",
    "Der Shake ist für heute schon eingetragen.": "Le shake est déjà enregistré pour aujourd'hui.",
    "Shake": "Shake",
    "Ziel für den Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Objectif pour le shake : {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel.": "Aucune suggestion n'est possible pour le shake : définis au moins un objectif dans les réglages.",
    "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig.": "Ton objectif du jour est ainsi atteint – il ne reste rien pour un dîner.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“.": "Pas encore de suggestions : enregistre des repas dans le journal via « Enregistrer / Copier ».",
    "Noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Encore ouvert : {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Offen nach dem Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Ouvert après le shake : {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein.": "Ton shake après l'entraînement : l'app calcule les quantités pour atteindre l'objectif, puis propose des dîners pour le reste de la journée. Le shake doit être enregistré comme repas.",
    "– kein Shake –": "– aucun shake –",
    "Was der Shake liefern soll (leer = egal)": "Ce que le shake doit apporter (vide = peu importe)",
    "Shake eintragen in": "Enregistrer le shake dans",
    "erste Mahlzeit": "premier repas",
    "Abendessen eintragen in": "Enregistrer le dîner dans",
    "erste freie Mahlzeit": "premier repas libre",
    "Trigger tragen den Shake mit den berechneten Mengen ein": "Les déclencheurs saisissent le shake avec les quantités calculées",
    "Vorschläge einstellen": "Réglages des suggestions",
    "Wichtigkeit": "Importance",
    "egal": "peu importe",
    "normal": "normal",
    "wichtig": "important",
    "sehr wichtig": "très important",
    "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor.": "Plus une valeur est importante, plus la suggestion doit la respecter. Les valeurs sans objectif sont ignorées.",
    "Kalorienziel nie überschreiten": "Ne jamais dépasser l'objectif calorique",
    "Eiweißziel möglichst erreichen": "Atteindre si possible l'objectif en protéines",
    "Beigaben": "Accompagnements",
    "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite.": "Aliments qui vont avec n'importe quel repas (p. ex. noix). Une suggestion ne les ajoute que s'ils conviennent mieux au reste. Champs : minimum, maximum, pas.",
    "Mindestmenge": "Quantité minimale",
    "Höchstmenge": "Quantité maximale",
    "Schrittweite": "Pas",
    "Beigabe hinzufügen": "Ajouter un accompagnement",
    "+ Beigabe": "+ Accompagnement",
    "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.": "Évolutif : suit le facteur de quantité du repas. Fixe : reste identique.",
    "Skalierbar": "Évolutif",
    "Fest": "Fixe",
    "Packung": "Paquet",
    "Abweichung ±": "Écart ±",
    "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)": "De combien cet ingrédient peut s'écarter de sa proportion par rapport aux autres (en pourcentage)",
    "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.": "Taille du paquet : la suggestion prend le nombre de paquets réglé sous « Nombre ». Vide = exactement la quantité enregistrée.",
    "Mengenfaktor für Vorschläge": "Facteur de quantité pour les suggestions",
    "von": "de",
    "bis": "à",
    "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6.": "De combien le repas entier peut être réduit ou agrandi dans les suggestions (1 = quantité enregistrée). Vide = 0,6 à 1,6.",
    "Mahlzeiten-Vorschläge sind nicht aktiviert": "Les suggestions de repas ne sont pas activées",
    "Vorschlag ist leer": "La suggestion est vide",
    "Ungültige Werte": "Valeurs non valides",
    "Kleinster Faktor ist größer als der größte": "Le plus petit facteur est supérieur au plus grand",
    "Wie viele Packungen ein Vorschlag nehmen darf": "Combien de paquets une suggestion peut prendre (de – à ; 0 = peut être omis)",
    "Anzahl": "Nombre",
    "Ausschließen": "Exclure",
    "Ausgeschlossen": "Exclus",
    "Zulassen": "Autoriser",
    "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück.": "Ces repas n'apparaissent plus dans les suggestions. « Autoriser » les ramène.",
    "Frühstück": "Petit-déjeuner",
    "Mittagessen": "Déjeuner",
    "Abendessen": "Dîner",
    "Snacks": "En-cas",
    "Mahlzeit": "Repas",
    "Menge": "Quantité",
    "Die Makros ergeben {} g auf 100 g – mehr als möglich.": "Les macros font {} g pour 100 g – plus que possible.",
    "Die Makros ergeben rechnerisch ca. {} kcal, angegeben sind {} kcal.": "Les macros donnent environ {} kcal, mais {} kcal sont indiquées.",
    "{} Lebensmittel durch ausgeblendete Kategorien versteckt.": "{} aliments masqués par des catégories masquées.",
    "{}: Werte übernommen ✓": "{} : valeurs reprises ✓",
    "{}: {} kcal · KH {} · Fett {} · Eiweiß {} ({})": "{} : {} kcal · gluc. {} · lip. {} · prot. {} ({})",
    "{} geprüft: {} stimmen überein, {} weichen ab, {} ohne Treffer.": "{} vérifiés : {} concordent, {} diffèrent, {} sans résultat.",
    "{} Einträge, {} Gewichtswerte ({} bis {}) aus {} Zeilen.": "{} entrées, {} valeurs de poids ({} à {}) sur {} lignes.",
    "{} Tage ({} bis {}), {} Einträge, {} Gewichtswerte": "{} jours ({} à {}), {} entrées, {} valeurs de poids",
    "{} Uhr · {}": "{} · {}",
    "Die Excel-Datei ist zu groß.": "Le fichier Excel est trop volumineux.",
    "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).": "Mealie n’est pas encore configuré (Réglages → Mealie).",
    "Mealie konnte nicht erreicht werden.": "Mealie est inaccessible.",
    "Bitte eine Adresse wie http://mealie:9000 angeben.": "Indiquez une adresse comme http://mealie:9000.",
    "Nicht gefunden (Adresse oder Rezept prüfen).": "Introuvable (vérifiez l’adresse ou la recette).",
    "Mealie antwortete mit Fehler {}.": "Mealie a répondu par l’erreur {}.",
    "Unter dieser Adresse läuft kein Mealie.": "Aucun Mealie ne fonctionne à cette adresse.",
    "Ungültiges Rezept.": "Recette non valide.",
    "Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).": "Cette adresse n’est pas autorisée (Mealie tourne sur son propre serveur ou module).",
    "Mealie ist nicht erreichbar.": "Mealie est inaccessible.",
    "Die Seite antwortete mit Fehler {}.": "La page a répondu par l’erreur {}.",
    "Rezept": "Recette",
    "Wasser": "Eau",
    "Koffein": "Caféine",
    "Kreatin": "Créatine",
    "{} (Kopie)": "{} (copie)",
    "Daten löschen …": "Supprimer des données …",
    "Daten löschen": "Supprimer des données",
    "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an.": "Supprime définitivement les données choisies de votre compte. Les autres utilisateurs et les réglages restent intacts. Créez d’abord une sauvegarde (JSON).",
    "Einträge, Notizen, Wasser und Aktivität aller Tage": "entrées, notes, eau et activité de tous les jours",
    "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)": "tous les aliments de la bibliothèque (les entrées du journal restent)",
    "alle gespeicherten Mahlzeiten": "tous les repas enregistrés",
    "alle Rezepte samt ihrer Lebensmittel": "toutes les recettes avec leurs aliments",
    "Gewicht und Körpermaße": "Poids et mensurations",
    "Gewichtswerte, Körpermaße und Fortschrittsfotos": "valeurs de poids, mensurations et photos de progression",
    "Tagesziel, Wochentagsziele und Profile": "objectif quotidien, objectifs par jour de la semaine et profils",
    "alle Trigger und Mahlzeiten-Regeln samt Verlauf": "tous les déclencheurs et règles de repas avec l’historique",
    "Bitte mindestens einen Bereich wählen.": "Choisissez au moins un domaine.",
    "Bitte mindestens einen gültigen Bereich wählen.": "Choisissez au moins un domaine valide.",
    "Wirklich unwiderruflich löschen: {}?": "Vraiment supprimer définitivement : {} ?",
    "Gelöscht.": "Supprimé.",
    "Endgültig löschen": "Supprimer définitivement",
    "Abendessen sollen das Eiweißziel möglichst erreichen": "Les dîners doivent atteindre au mieux l’objectif de protéines",
    "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)": "Afficher le bouton « Jour d’entraînement » chaque jour (sinon seulement si le shake est saisi ou enregistré par un déclencheur)",
    "Einkaufsliste": "Liste de courses",
    "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt.": "Choisis des recettes (portions) et des repas enregistrés (multiple, 1 = une fois) : les ingrédients sont additionnés.",
    "Noch nichts gewählt.": "Rien de choisi pour l’instant.",
    "In die Zwischenablage kopieren": "Copier dans le presse-papiers",
    "Kopiert ✓": "Copié ✓",
    "An Home Assistant senden": "Envoyer à Home Assistant",
    "Todo-Liste": "Liste de tâches",
    "Keine Todo-Liste in Home Assistant gefunden.": "Aucune liste de tâches trouvée dans Home Assistant.",
    "{} Einträge gesendet.": "{} éléments envoyés.",
    "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste).": "Additionne les ingrédients des recettes et des repas enregistrés, les copie ou les envoie vers une liste de tâches de Home Assistant (p. ex. la liste de courses).",
    "Einkaufsliste nicht aktiviert": "La liste de courses n’est pas activée",
    "Todo-Liste fehlt": "Liste de tâches manquante",
    "Keine Einträge": "Aucun élément",
    "Home Assistant nicht erreichbar (gesendet: {})": "Home Assistant injoignable (envoyés : {})",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)": "Proposer dans la bibliothèque partagée du foyer (les autres peuvent l’utiliser et le copier)",
    "Wochenbericht": "Bilan hebdomadaire",
    "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“.": "Une fois par semaine, un résumé des sept derniers jours en notification. Utilise le service de notification de « Rappel ».",
    "Wochenbericht aktiv": "Bilan hebdomadaire actif",
    "Wochentag": "Jour de la semaine",
    "Vorschau": "Aperçu",
    "Datenbank": "Base de données",
    "{} · {} Zeilen in {} Tabellen · frei {} · letzte Sicherung: {}": "{} · {} lignes dans {} tables · libre {} · dernière sauvegarde : {}",
    "Prüfen und verdichten": "Vérifier et compacter",
    "Prüfung läuft …": "Vérification en cours …",
    "Verdichtet: {} → {}": "Compactée : {} → {}",
    "Datenbank ist in Ordnung.": "La base de données est en ordre.",
    "Datenbank prüfen: {}": "Vérification de la base : {}",
    "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)": "Détecter aussi à partir de ce nombre de calories brûlées (kcal, 0 = désactivé)",
    "Wochentag ungültig": "Jour de la semaine invalide",
    "Andere dürfen es auch ändern": "Les autres peuvent aussi le modifier",
    "Nährwert-Lücken (7 Tage)": "Lacunes nutritionnelles (7 jours)",
    "Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; {} von {} Tagen erfasst.": "Moyenne des 7 derniers jours (seulement les jours avec valeurs) par rapport aux valeurs de référence ; {} jours sur {} saisis.",
    "nicht genug Angaben": "pas assez de données",
    "Ziele ändern": "Modifier les objectifs",
    "Ziele für weitere Nährwerte": "Objectifs pour les autres nutriments",
    "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze.": "Valeurs de référence par jour en g. Les fibres doivent être atteintes ; pour le sucre, le sel et les acides gras saturés, c’est une limite maximale.",
    "Weitere Nährwerte sind nicht aktiviert": "Les autres nutriments ne sont pas activés",
    "Ziele müssen zwischen 0 und 1000 liegen": "Les objectifs doivent être compris entre 0 et 1000",
    "Ø {} g (mind. {} g) – im Ziel": "Ø {} g (au moins {} g) – dans l’objectif",
    "Ø {} g (mind. {} g) – {} % unter dem Ziel": "Ø {} g (au moins {} g) – {} % sous l’objectif",
    "Ø {} g (höchstens {} g) – im Ziel": "Ø {} g (au plus {} g) – dans l’objectif",
    "Ø {} g (höchstens {} g) – {} % über dem Ziel": "Ø {} g (au plus {} g) – {} % au-dessus de l’objectif",
    "Aus Text …": "Depuis un texte …",
    "Rezept aus Text": "Recette à partir d’un texte",
    "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Colle une recette sous forme de texte : d’abord le titre, puis les ingrédients (un par ligne, avec la quantité) et la préparation. Des titres comme « Ingrédients » et « Préparation » aident. Les ingrédients sont associés à tes aliments ; tu vérifies tout avant l’enregistrement.",
    "Rezepttext": "Texte de la recette",
    "Im Text wurden keine Zutaten gefunden (Zeilen mit Mengen, z. B. „200 g Mehl“).": "Aucun ingrédient trouvé dans le texte (lignes avec quantités, p. ex. « 200 g de farine »).",
    "Der Text ist zu lang.": "Le texte est trop long.",
    "Offline: 1 Eintrag wartet auf Verbindung.": "Hors ligne : 1 entrée attend une connexion.",
    "Offline: {} Einträge warten auf Verbindung.": "Hors ligne : {} entrées attendent une connexion.",
    "Hauptmenü": "Menu principal",
    "Zeitraum A, von": "Période A, du",
    "Zeitraum A, bis": "Période A, au",
    "Zeitraum B, von": "Période B, du",
    "Zeitraum B, bis": "Période B, au",
  },
  es: {
    "Ernährung": "Alimentación",
    "Tagebuch": "Diario",
    "Lebensmittel": "Alimentos",
    "Mahlzeiten": "Comidas",
    "Rezepte": "Recetas",
    "Gewicht": "Peso",
    "Statistik": "Estadísticas",
    "Einstellungen": "Ajustes",
    "Lokal": "Local",
    "Kategorien:": "Categorías:",
    "Ein-/ausblenden": "Mostrar/ocultar",
    "Vortag": "Día anterior",
    "Folgetag": "Día siguiente",
    "Bearbeiten": "Editar",
    "Entfernen": "Quitar",
    "Kalorien": "Calorías",
    "Kohlenhydrate": "Carbohidratos",
    "Fette": "Grasas",
    "Eiweiß": "Proteínas",
    "+ Nahrungsmittel hinzufügen": "+ Añadir alimento",
    "Notiz zur Mahlzeit": "Nota de la comida",
    "Tag": "Día",
    "Notiz ändern": "Editar nota",
    "Notiz": "Nota",
    "Speichern / Kopieren": "Guardar / Copiar",
    "Mahlzeit leeren": "Vaciar comida",
    "Tag leeren": "Vaciar día",
    "Alle Einträge von „{}“ löschen?": "¿Eliminar todas las entradas de “{}”?",
    "Alle Einträge dieses Tages löschen?": "¿Eliminar todas las entradas de este día?",
    "Einträge": "Entradas",
    "Ausgeblendete Mahlzeiten wieder verbergen": "Volver a ocultar las comidas ocultas",
    "leere/ausgeblendete Mahlzeit anzeigen": "mostrar comida vacía/oculta",
    "leere/ausgeblendete Mahlzeiten anzeigen": "mostrar comidas vacías/ocultas",
    "Tagesziel ({})": "Objetivo diario ({})",
    "Dein Tagesziel": "Tu objetivo diario",
    "Gesamt": "Total",
    "Verbleibend": "Restante",
    "Weitere Nährwerte": "Más nutrientes",
    "Notiz zum Tag": "Nota del día",
    "Ganzen Tag kopieren": "Copiar todo el día",
    "z. B. Hunger, Training, Stimmung …": "p. ej. hambre, entrenamiento, ánimo …",
    "Notiz: {}": "Nota: {}",
    "Abbrechen": "Cancelar",
    "Speichern": "Guardar",
    "Auf den Tag": "Al día",
    "Mengenfaktor (1 = unverändert)": "Factor de cantidad (1 = sin cambios)",
    "Bitte einen Tag wählen.": "Elige un día.",
    "Kopieren": "Copiar",
    "Wasser & Ergänzungen": "Agua y suplementos",
    "Lebensmittel suchen…": "Buscar alimentos…",
    "Zurück": "Atrás",
    "g KH": "g carb.",
    "g Fett": "g grasa",
    "g Eiweiß": "g prot.",
    "Menge (g)": "Cantidad (g)",
    "Ballaststoffe": "Fibra",
    "Zucker": "Azúcares",
    "Salz": "Sal",
    "ges. Fettsäuren": "grasas sat.",
    "Portion wählen …": "Elegir porción …",
    "Portion": "Porción",
    "Bezeichnung": "Descripción",
    "KH (g)": "Carb. (g)",
    "Fett (g)": "Grasa (g)",
    "Eiweiß (g)": "Prot. (g)",
    "Uhrzeit": "Hora",
    "Lebensmittel tauschen": "Cambiar alimento",
    "Bezeichnung und kcal sind Pflicht.": "La descripción y las kcal son obligatorias.",
    "„{}“ tauschen": "Cambiar “{}”",
    "Tauschen": "Cambiar",
    "Schnelleingabe in „{}“": "Entrada rápida en “{}”",
    "Schnelleingabe": "Entrada rápida",
    "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“).": "Sin alimento, solo calorías y, si quieres, macros (p. ej. “Restaurante, unas 800 kcal”).",
    "z. B. Restaurant": "p. ej. Restaurante",
    "Hinzufügen": "Añadir",
    "Als Mahlzeit speichern": "Guardar como comida",
    "Am Tag": "El día",
    "Neue Uhrzeit (leer = Originalzeit)": "Nueva hora (vacío = hora original)",
    "In Mahlzeit": "En la comida",
    "Nichts ausgewählt.": "Nada seleccionado.",
    "Name der Mahlzeit": "Nombre de la comida",
    "z. B. Diät, Bulk (optional)": "p. ej. Definición, Volumen (opcional)",
    "Name": "Nombre",
    "Kategorie": "Categoría",
    "Bitte einen Namen angeben.": "Introduce un nombre.",
    "Dieser Browser kann keine Barcodes lesen (BarcodeDetector fehlt). Bitte die Nummer eintippen.": "Este navegador no puede leer códigos de barras (falta BarcodeDetector). Escribe el número.",
    "Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.": "Sin acceso a la cámara (la página necesita HTTPS). Usa “Foto” o escribe el número.",
    "Abgebrochen": "Cancelado",
    "Scan abbrechen": "Cancelar escaneo",
    "Halte den Barcode ins Bild.": "Coloca el código de barras en la imagen.",
    "Kamerazugriff wurde nicht erlaubt.": "No se permitió el acceso a la cámara.",
    "Kamera nicht verfügbar: {}": "Cámara no disponible: {}",
    "Auf dem Foto wurde kein Barcode erkannt.": "No se encontró ningún código de barras en la foto.",
    "z. B. 1 Scheibe": "p. ej. 1 rebanada",
    "Produkt nicht gefunden ({})": "Producto no encontrado ({})",
    "Barcode (Open Food Facts)": "Código de barras (Open Food Facts)",
    "Suchen": "Buscar",
    "Scannen (Kamera)": "Escanear (cámara)",
    "Foto vom Barcode": "Foto del código de barras",
    "Marke": "Marca",
    "z. B. Diät, Bulk": "p. ej. Definición, Volumen",
    "Portion (g)": "Porción (g)",
    "kcal / 100 g": "kcal / 100 g",
    "KH / 100 g": "Carb. / 100 g",
    "Fett / 100 g": "Grasa / 100 g",
    "Eiweiß / 100 g": "Prot. / 100 g",
    "Portionsgrößen (optional)": "Tamaños de porción (opcional)",
    "+ Portion": "+ Porción",
    "Name und kcal sind Pflicht.": "El nombre y las kcal son obligatorios.",
    "Speichern & wählen": "Guardar y elegir",
    "Suchen…": "Buscar…",
    "★ Favoriten": "★ Favoritos",
    "Meine Mahlzeiten": "Mis comidas",
    "Häufig verwendet": "Usados con frecuencia",
    "Beides": "Ambos", "Hinzufügen-Dialog": "Diálogo de añadir", "„Häufig verwendet“ zeigt": "«Usados con frecuencia» muestra", "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten.": "Se aplica a la pestaña «Alimentos» del diálogo de añadir. La pestaña «Mis comidas» siempre muestra las comidas más usadas.",
    "Alle": "Todos",
    "Nichts gefunden – lege ein neues Lebensmittel an.": "No se encontró nada – crea un alimento nuevo.",
    "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆.": "Aún no hay favoritos – marca alimentos con ☆ en la página “Alimentos”.",
    "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen.": "No hay comidas guardadas. Crea una en el diario con “Guardar como comida”.",
    "Portionen": "Porciones",
    "+ Neues Lebensmittel": "+ Nuevo alimento",
    "Schnelleingabe (nur kcal)": "Entrada rápida (solo kcal)",
    "Schließen": "Cerrar",
    "Zu „{}“ hinzufügen": "Añadir a “{}”",
    "Eintrag hinzufügen": "Añadir entrada",
    "(Ziel {})": "(objetivo {})",
    "Trend {} kg": "Tendencia {} kg",
    "Gewichtsverlauf": "Evolución del peso",
    "Verlauf": "Evolución",
    "zu wenig Daten": "datos insuficientes",
    "nicht absehbar": "no previsible",
    "erreicht": "alcanzado",
    "Lebensmittel bearbeiten": "Editar alimento",
    "Neues Lebensmittel": "Nuevo alimento",
    "Favorit entfernen": "Quitar de favoritos",
    "Als Favorit markieren": "Marcar como favorito",
    "Favorit": "Favorito",
    "Trigger anlegen": "Crear disparador",
    "Löschen": "Eliminar",
    "„{}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.": "¿Eliminar “{}”? Las comidas ya registradas se conservan.",
    "Nichts gefunden.": "No se encontró nada.",
    "Noch keine Lebensmittel angelegt.": "Aún no hay alimentos.",
    "Duplikate suchen": "Buscar duplicados",
    "Doppelte Lebensmittel": "Alimentos duplicados",
    "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.": "En cada grupo, elige el alimento que se conserva. Las comidas ya registradas no cambian.",
    "Keine Duplikate gefunden.": "No se encontraron duplicados.",
    "Zusammenführen": "Combinar",
    "Durch anderes Lebensmittel tauschen": "Cambiar por otro alimento",
    "Mahlzeit bearbeiten": "Editar comida",
    "Komponenten": "Componentes",
    "Komponente hinzufügen": "Añadir componente",
    "+ Komponente": "+ Componente",
    "Kopie anlegen": "Crear copia",
    "Mahlzeit „{}“ löschen?": "¿Eliminar la comida “{}”?",
    "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.": "Aún no hay comidas guardadas – usa “Guardar como comida” en el diario.",
    "Mahlzeiten suchen…": "Buscar comidas…",
    "wie Summe der Zutaten": "igual que la suma de los ingredientes",
    "Gesamt: {} g": "Total: {} g",
    "pro Portion ({} g)": "por porción ({} g)",
    "Rezept bearbeiten": "Editar receta",
    "Neues Rezept": "Nueva receta",
    "Gewicht fertig (g, optional)": "Peso cocinado (g, opcional)",
    "Zutaten": "Ingredientes",
    "Noch keine Zutaten.": "Aún no hay ingredientes.",
    "Ungültige Einheit": "Unidad no válida",
    "Speichern und jetzt lesen": "Guardar y leer ahora",
    "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen.": "El valor del sensor tiene más de 30 días y no se tomó.",
    "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).": "El valor está fuera de 20 a 500 kg (revisa la unidad).",
    "Der Sensor liefert gerade keinen Zahlenwert.": "El sensor no proporciona un número en este momento.",
    "Home Assistant nicht erreichbar.": "Home Assistant no está accesible.",
    "Zuerst einen Sensor wählen.": "Primero elige un sensor.",
    "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.": "Valor nuevo detectado, se tomará cuando sea estable.",
    "Der aktuelle Wert ist schon übernommen.": "El valor actual ya se ha tomado.",
    "Übernommen: {} am {}": "Tomado: {} el {}",
    "Zuletzt übernommen: {} am {}": "Último valor tomado: {} el {}",
    "z. B. sensor.waage_gewicht": "p. ej. sensor.bascula_peso",
    "Automatisch (Einheit des Sensors)": "Automática (unidad del sensor)",
    "Einheit des Sensors": "Unidad del sensor",
    "Sensor": "Sensor",
    "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg.": "Un sensor de Home Assistant con el peso corporal, p. ej. de una báscula inteligente. El complemento lo consulta cada minuto; un valor nuevo se toma cuando no cambia durante un minuto y se guarda para el día de la medición (un valor del mismo día se reemplaza). Son razonables valores de 20 a 500 kg.",
    "Waage": "Báscula",
    "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung).": "Tomar el peso corporal automáticamente de un sensor de Home Assistant, p. ej. de una báscula inteligente (con conversión de unidades).",
    "Waage (Sensor)": "Báscula (sensor)",
    "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).": "Los ingredientes naranjas faltaban en tus alimentos y se completaron con bases de datos en línea (valores orientativos, revísalos).", "aus Open Food Facts": "de Open Food Facts", "aus USDA": "de USDA",
    "Zutat hinzufügen": "Añadir ingrediente",
    "+ Zutat": "+ Ingrediente",
    "Pro Portion ({} g): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Por porción ({} g): {} kcal · carb. {} g · grasa {} g · prot. {} g · {} porciones",
    "Rezept „{}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.": "¿Eliminar la receta “{}”? El alimento correspondiente también se elimina; las comidas ya registradas se conservan.",
    "Noch kein Rezept angelegt.": "Aún no hay recetas.",
    "Rezepte suchen…": "Buscar recetas…",
    "+ Neues Rezept": "+ Nueva receta",
    "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel.": "Cada receta aparece también en Alimentos (por 100 g, con “1 porción”) y se puede registrar en cualquier sitio. Los cambios en la receta actualizan ese alimento.",
    "1 Portion": "1 porción",
    "Rezept nicht gefunden": "Receta no encontrada",
    "Mindestens eine Zutat nötig.": "Se necesita al menos un ingrediente.",
    "Portionen müssen größer als 0 sein.": "Las porciones deben ser mayores que 0.",
    "Jede Zutat braucht eine Menge in Gramm.": "Cada ingrediente necesita una cantidad en gramos.",
    "Gewicht nach dem Kochen muss größer als 0 sein.": "El peso cocinado debe ser mayor que 0.",
    "z. B. 78,5": "p. ej. 78,5",
    "Gewicht eintragen": "Registrar peso",
    "Datum": "Fecha",
    "Gewicht ({})": "Peso ({})",
    "Zielgewicht ({})": "Peso objetivo ({})",
    "Gewünschte Änderung ({} pro Woche)": "Cambio deseado ({} por semana)",
    "Noch keine Gewichtswerte.": "Aún no hay valores de peso.",
    "Aktuell": "Actual",
    "Trend": "Tendencia",
    "Veränderung": "Cambio",
    "Ziel": "Objetivo",
    "Prognose Ziel": "Previsión del objetivo",
    "30 Tage": "30 días",
    "90 Tage": "90 días",
    "1 Jahr": "1 año",
    "7 Tage": "7 días",
    "180 Tage": "180 días",
    "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).": "Línea fina y puntos: mediciones. Línea gruesa: tendencia suavizada (sin las oscilaciones diarias).",
    "Trend aktuell {}{} {}/Woche.": "Tendencia actual {}{} {}/semana.",
    "Mehr anzeigen": "Mostrar más",
    "Alle {}": "Todos {}",
    "Weniger": "Menos",
    "Taille": "Cintura",
    "Brust": "Pecho",
    "Hüfte": "Caderas",
    "Oberarm": "Brazo",
    "Oberschenkel": "Muslo",
    "Körperfett %": "Grasa corporal %",
    "Bild konnte nicht gelesen werden": "No se pudo leer la imagen",
    "Eigene Messung, z. B. Wade": "Medida propia, p. ej. pantorrilla",
    "Körpermaße": "Medidas corporales",
    "Werte, die Du nicht messen willst, einfach leer lassen.": "Deja vacíos los valores que no quieras medir.",
    "Weitere Messung": "Otra medida",
    "Wert": "Valor",
    "Bitte mindestens einen Wert eintragen.": "Introduce al menos un valor.",
    "Noch keine Werte für diese Messung.": "Aún no hay valores para esta medida.",
    "Notiz (optional), z. B. Vorderansicht": "Nota (opcional), p. ej. vista frontal",
    "Fortschrittsfotos": "Fotos de progreso",
    "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons.": "Las fotos permanecen en el complemento de tu Home Assistant. No están en la exportación JSON ni en las copias automáticas, pero sí en la copia de seguridad de Home Assistant del complemento.",
    "Vergleichen": "Comparar",
    "Foto hinzufügen": "Añadir foto",
    "Foto löschen": "Eliminar foto",
    "Foto löschen?": "¿Eliminar la foto?",
    "Noch keine Fotos.": "Aún no hay fotos.",
    "Fotos vergleichen": "Comparar fotos",
    "Ungültiger Wert für {}": "Valor no válido para {}",
    "Kein gültiges Bild": "Imagen no válida",
    "Bild leer oder zu groß (max. 8 MB)": "Imagen vacía o demasiado grande (máx. 8 MB)",
    "Foto nicht gefunden": "Foto no encontrada",
    "Abnehmen": "Perder peso",
    "Halten": "Mantener",
    "Zunehmen": "Ganar peso",
    "Kalorienbilanz": "Balance calórico",
    "Noch keine Einträge im Zeitraum.": "Aún no hay entradas en el periodo.",
    "Ø Aufnahme": "Ø ingesta",
    "Gewichtstrend": "Tendencia del peso",
    "Überschuss / Tag": "Superávit / día",
    "Defizit / Tag": "Déficit / día",
    "Bilanz / Tag": "Balance / día",
    "Geschätzter Verbrauch": "Gasto estimado",
    "Aus {} Gewichtswerten und {} von {} erfassten Tagen (1 {} ≈ {} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.": "A partir de {} valores de peso y {} de {} días registrados (1 {} ≈ {} kcal). Cuanto más completos estén el diario y los pesajes, más preciso será.",
    "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum.": "El cálculo necesita al menos dos valores de peso con una semana de diferencia en el periodo elegido.",
    "Du liegst im Plan.": "Vas según lo previsto.",
    "Der Trend liegt über dem Ziel.": "La tendencia está por encima del objetivo.",
    "Der Trend liegt unter dem Ziel.": "La tendencia está por debajo del objetivo.",
    "Ziel: {}": "Objetivo: {}",
    "(Gewicht halten)": "(mantener el peso)",
    "({} {}/Woche)": "({} {}/semana)",
    "· Trend aktuell {} {}/Woche. {}": "· tendencia actual {} {}/semana. {}",
    "Für dieses Ziel passen ca. {} kcal am Tag (Dein Ziel: {}).": "Para este objetivo encajan unas {} kcal al día (tu objetivo: {}).",
    "Als Tagesziel übernehmen": "Usar como objetivo diario",
    "Ø Kalorien": "Ø calorías",
    "Erfasste Tage": "Días registrados",
    "Ø Eiweiß": "Ø proteínas",
    "Ø Kohlenhydrate": "Ø carbohidratos",
    "Ø Fett": "Ø grasas",
    "Kalorien pro Tag": "Calorías por día",
    "14 Tage": "14 días", "Kalorien und Gewicht": "Calorías y peso", "Kalorien (linke Achse)": "Calorías (eje izquierdo)", "Gewicht und Trend (rechte Achse)": "Peso y tendencia (eje derecho)", "Noch keine Gewichtswerte im Zeitraum.": "Aún no hay pesos en este periodo.",
    "Gestrichelt: Tagesziel je Wochentag": "Discontinua: objetivo diario por día de la semana",
    "Gestrichelt: Tagesziel {} kcal": "Discontinua: objetivo diario {} kcal",
    "Nährwertverteilung (Ø)": "Reparto de macros (Ø)",
    "Eiweiß {} %": "Proteínas {} %",
    "Kohlenhydrate {} %": "Carbohidratos {} %",
    "Fett {} %": "Grasas {} %",
    "Weitere Nährwerte (Ø pro Tag)": "Más nutrientes (Ø por día)",
    "Ø pro Tag": "Ø por día",
    "Eingetragen": "Registrado",
    "Ziel erreicht": "Objetivo alcanzado",
    "Bericht & Zeitraum-Vergleich": "Informe y comparación de periodos",
    "7 Tage vs. davor": "7 días vs. antes",
    "30 Tage vs. davor": "30 días vs. antes",
    "Eiweißziel erreicht": "Objetivo de proteínas alcanzado",
    "Kalorien im Ziel": "Calorías dentro del objetivo",
    "Gewichtsänderung": "Cambio de peso",
    "Differenz": "Diferencia",
    "Bester Tag (A): {} · Schwächster Tag (A): {}": "Mejor día (A): {} · Día más flojo (A): {}",
    "Tage": "Días",
    "{} Tage": "{} días",
    "{} / {} Tage": "{} / {} días",
    "{} Einträge, {} kcal": "{} entradas, {} kcal",
    "{} / 100 g": "{} / 100 g",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g": "{} kcal · carb. {} g · grasa {} g · prot. {} g",
    "{} kcal (Ziel {})": "{} kcal (objetivo {})",
    "KH {} g · Fett {} g · Eiweiß {} g": "carb. {} g · grasa {} g · prot. {} g",
    "zu {}": "a {}",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g (pro 100 g)": "{} kcal · carb. {} g · grasa {} g · prot. {} g (por 100 g)",
    "Ø": "Ø",
    "Zustand": "Estado",
    "Kalender": "Calendario",
    "(am Starttag)": "(el día de inicio)",
    "(am Endtag)": "(el día de fin)",
    "Täglich ab {} Uhr": "Cada día desde las {}",
    "enthält nicht": "no contiene",
    "· seit mind. {} Min.": "· desde hace al menos {} min",
    "· nur {}–{} Uhr": "· solo {}–{}",
    "ODER": "O",
    "UND": "Y",
    "Trigger pausieren": "Pausar disparador",
    "Pause beenden": "Terminar pausa",
    "Heute": "Hoy",
    "3 Tage": "3 días",
    "1 Woche": "1 semana",
    "Oder bis einschließlich": "O hasta (inclusive)",
    "Pausieren": "Pausar",
    "Zustand einer Entität (z. B. Person ist im Fitnessstudio)": "Estado de una entidad (p. ej. la persona está en el gimnasio)",
    "Kalendereintrag": "Evento del calendario",
    "Uhrzeit (täglich ab einer Zeit)": "Hora (cada día desde una hora)",
    "z. B. person.max": "p. ej. person.max",
    "ist / enthält": "es / contiene",
    "ist NICHT / enthält NICHT": "NO es / NO contiene",
    "an jedem Tag des Termins": "cada día del evento",
    "nur am Starttag (z. B. Donnerstag 22 Uhr)": "solo el día de inicio (p. ej. jueves 22 h)",
    "nur am Endtag (z. B. Freitag 6 Uhr)": "solo el día de fin (p. ej. viernes 6 h)",
    "Termin zählt": "El evento cuenta",
    "Entität": "Entidad",
    "Bedingung": "Condición",
    "z. B. calendar.arbeit": "p. ej. calendar.trabajo",
    "Titel enthält, z. B. Nachtschicht": "El título contiene, p. ej. turno de noche",
    "Zustand, z. B. Fitnessstudio (Zonenname) oder on": "Estado, p. ej. gimnasio (nombre de la zona) u on",
    "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist.": "Registra una vez al día en cuanto se alcanza esta hora.",
    "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält.": "Se aplica a los días con (o sin) un evento cuyo título contiene este texto.",
    "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).": "Se aplica en cuanto la entidad tiene (o no tiene) este estado.",
    "Auslöser": "Disparador",
    "„{}“ nur an bestimmten Tagen anzeigen": "Mostrar “{}” solo en determinados días",
    "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt.": "Los días con entradas siempre son visibles. Sin regla, la comida se muestra siempre.",
    "Bitte eine Entität angeben.": "Indica una entidad.",
    "Gespeicherte Mahlzeiten": "Comidas guardadas",
    "Tagesziel wechseln": "Cambiar objetivo diario",
    "Tagesziel „{}“": "Objetivo diario “{}”",
    "Standardportion": "Porción predeterminada",
    "Tage im Voraus eintragen (nur Kalender)": "Registrar con días de antelación (solo calendario)",
    "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht.": "0 = solo el mismo día. Con p. ej. 7, la entrada se planifica para los próximos 7 días en cuanto exista un evento que coincida.",
    "Zustand muss schon so lange anliegen (Minuten)": "El estado debe mantenerse durante (minutos)",
    "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist.": "0 = de inmediato. P. ej. 20: registrar solo cuando la persona lleve 20 minutos en el gimnasio.",
    "Nur zwischen (Uhrzeit, optional)": "Solo entre (hora, opcional)",
    "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00).": "Fuera de esta franja el disparador no registra. Posible pasando la medianoche (22:00 a 06:00).",
    "Zu Mahlzeit im Tagebuch": "En la comida del diario",
    "Bei Lebensmitteln optional mit Menge:": "En alimentos, opcionalmente con cantidad:",
    "Alle Bedingungen müssen zutreffen (UND)": "Deben cumplirse todas las condiciones (Y)",
    "Mindestens eine muss zutreffen (ODER)": "Debe cumplirse al menos una (O)",
    "Verknüpfung": "Combinación",
    "Entität, z. B. person.anna": "Entidad, p. ej. person.anna",
    "Zustand bzw. Titel enthält (leer = an)": "El estado o el título contiene (vacío = on)",
    "Bedingung entfernen": "Quitar condición",
    "Trigger bearbeiten": "Editar disparador",
    "Neuer Trigger": "Nuevo disparador",
    "+ Weitere Bedingung": "+ Otra condición",
    "Dann": "Entonces",
    "Bitte eine Uhrzeit angeben.": "Indica una hora.",
    "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen.": "Elige un alimento, una comida o un objetivo diario.",
    "Weitere Bedingung: bitte eine Entität angeben.": "Otra condición: indica una entidad.",
    "Komplett (alle Einträge mit Mahlzeiten)": "Completo (todas las entradas con comidas)",
    "Nur Tageskalorien und Makros (eine Summe pro Tag)": "Solo calorías y macros del día (un total por día)",
    "Neue Mahlzeit anlegen": "Crear comida nueva",
    "Mahlzeiten zuordnen": "Asignar comidas",
    "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)": "Ocultar las comidas vacías en esos días (mostrar solo el total del día)",
    "MyFitnessPal-Import": "Importación de MyFitnessPal",
    "Was importieren?": "¿Qué importar?",
    "Gewicht übernehmen": "Importar peso",
    "Vorhandene Einträge an diesen Tagen ersetzen": "Reemplazar las entradas existentes de esos días",
    "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Importado: {} días, {} entradas, {} valores de peso.",
    "Importieren": "Importar",
    "Eiweiß {} % · Kohlenhydrate {} % · Fett {} %": "Proteínas {} % · Carbohidratos {} % · Grasas {} %",
    "· Makros ergeben {} kcal": "· los macros suman {} kcal",
    "Tagesziele": "Objetivos diarios",
    "Mein Ziel": "Mi meta",
    "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet.": "Determina cuándo un día cuenta como “dentro del objetivo” (perder: como máximo, ganar: como mínimo, mantener: ±10 %) y cómo valoran las estadísticas tu tendencia de peso.",
    "Kalorien aus Makros berechnen": "Calcular calorías a partir de los macros",
    "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g).": "Si cambian las proteínas, los carbohidratos o las grasas, las calorías se ajustan (4/4/9 kcal por g).",
    "Kalorien (kcal)": "Calorías (kcal)",
    "Kohlenhydrate (g)": "Carbohidratos (g)",
    "Gespeichert ✓": "Guardado ✓",
    "Zusatzfunktionen": "Funciones opcionales",
    "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen.": "Funciones opcionales, desactivadas por defecto. Al activarlas aparecen en el diario y aquí en los ajustes.",
    "Tagesziele pro Wochentag": "Objetivos diarios por día de la semana",
    "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger.": "p. ej. días de entrenamiento con más calorías, días de descanso con menos.",
    "Wasser und Nahrungsergänzung": "Agua y suplementos",
    "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.": "Entrada rápida para agua, cafeína, creatina, etc., con su propio objetivo diario.",
    "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter).": "Reunir ingredientes en una receta, dividir por porciones y registrarla como un alimento (pestaña propia).",
    "Notizen": "Notas",
    "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten.": "Texto libre para comidas y días (hambre, entrenamiento, ánimo). Las notas existentes se conservan al desactivarlo.",
    "Körpermaße und Fortschrittsfotos": "Medidas corporales y fotos de progreso",
    "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht.": "Perímetros (cintura, pecho, brazo …) con evolución, y fotos con comparación, en la pestaña Peso.",
    "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit).": "Registrar y analizar fibra, azúcares, sal y grasas saturadas de los alimentos (Open Food Facts los proporciona).",
    "Montag": "Lunes",
    "Dienstag": "Martes",
    "Mittwoch": "Miércoles",
    "Donnerstag": "Jueves",
    "Freitag": "Viernes",
    "Samstag": "Sábado",
    "Sonntag": "Domingo",
    "wie Standard": "como el predeterminado",
    "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros.": "Calorías vacías = se aplica el objetivo diario predeterminado de arriba. Los macros vacíos muestran “–”. Con “Calcular calorías a partir de los macros” (arriba) las calorías siguen a los macros.",
    "Tagesziel-Profile": "Perfiles de objetivo diario",
    "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel.": "p. ej. “Entrenamiento” y “Día de descanso”. Un disparador (Ajustes → Disparadores → “Entonces: cambiar objetivo diario”) pasa el día a un perfil, por ejemplo cuando la persona está en el gimnasio. El perfil tiene prioridad sobre el objetivo del día de la semana.",
    "Profil löschen": "Eliminar perfil",
    "Profil „{}“ löschen? Trigger dafür werden ebenfalls gelöscht.": "¿Eliminar el perfil “{}”? Sus disparadores también se eliminan.",
    "Noch keine Profile.": "Aún no hay perfiles.",
    "Neues Profil": "Nuevo perfil",
    "+ Profil": "+ Perfil",
    "Einheit": "Unidad",
    "Schritt": "Paso",
    "„{}“ samt Verlauf löschen?": "¿Eliminar “{}” con su historial?",
    "Neu, z. B. Magnesium": "Nuevo, p. ej. magnesio",
    "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch.": "Por fila: nombre, unidad, objetivo diario y paso de los botones +/− del diario.",
    "Feste Mahlzeiten (Frühstück, Mittagessen, …)": "Comidas fijas (desayuno, almuerzo, …)",
    "Uhrzeiten (08:47 …, 11:30 …)": "Horas (08:47 …, 11:30 …)",
    "Automatisch (Windows-Look bei HA-95/98-Theme)": "Automático (aspecto Windows con el tema HA 95/98)",
    "Standard (HA-Theme)": "Predeterminado (tema de HA)",
    "Windows-Look": "Aspecto Windows",
    "Darstellung": "Apariencia",
    "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende.": "Las entradas existentes se conservan; las que no tienen hora aparecen al final en la vista por horas.",
    "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten": "Iniciar el lector de códigos de barras al abrir en este dispositivo",
    "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.": "Para un widget de pantalla de inicio de la app Companion: crea allí un acceso directo a este panel y la cámara se abrirá al instante.",
    "Optik": "Aspecto",
    "Nach oben": "Subir",
    "Nach unten": "Bajar",
    "Nur an bestimmten Tagen anzeigen": "Mostrar solo en determinados días",
    "Wieder einblenden": "Volver a mostrar",
    "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Ocultar (solo visible en días con entradas)",
    "Ausblenden": "Ocultar",
    "{} – blende sie stattdessen mit ⊘ aus.": "{} – mejor ocúltala con ⊘.",
    "Neue Mahlzeit, z. B. Nachtschicht": "Comida nueva, p. ej. turno de noche",
    "nur an Tagen: {}": "solo en los días: {}",
    "Regel bearbeiten": "Editar regla",
    "Regel löschen": "Eliminar regla",
    "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "Con ⚡ muestras una comida solo en los días en que, por ejemplo, tu calendario tiene un evento determinado. Con ⊘ la ocultas de forma permanente (solo sigue visible en días con entradas); solo se puede eliminar una comida vacía.",
    "Trigger": "Disparadores",
    "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Registrar alimentos o comidas automáticamente cuando Home Assistant informa de algo (ubicación, calendario, interruptor …). También se pueden crear con ⚡ en los alimentos.",
    "Letzter Fehler ({}): {}": "Último error ({}): {}",
    "Aktiv": "Activo",
    "pausiert bis {}": "en pausa hasta {}",
    "· {} Tage im Voraus": "· {} días de antelación",
    "· zuletzt {}": "· último {}",
    "Pausieren …": "Pausar …",
    "Jetzt testen (trägt heute ein)": "Probar ahora (registra hoy)",
    "Eingetragen.": "Registrado.",
    "Noch keine Trigger.": "Aún no hay disparadores.",
    "Prüfe …": "Comprobando …",
    "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "Sin acceso a Home Assistant (falta SUPERVISOR_TOKEN).",
    "Geprüft {}, nichts zu tun.": "Comprobado {}, nada que hacer.",
    "Jetzt prüfen": "Comprobar ahora",
    "Version": "Versión",
    "Installiert: ": "Instalada: ",
    "Nach Updates suchen": "Buscar actualizaciones",
    "Keine Verbindung zu GitHub.": "Sin conexión con GitHub.",
    "Version {} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.": "La versión {} está disponible. En Home Assistant: Ajustes → Complementos, buscar actualizaciones y actualizar.",
    "Du hast die aktuelle Version.": "Tienes la última versión.",
    "+ Neuer Trigger": "+ Nuevo disparador",
    "Trigger-Verlauf": "Historial de disparadores",
    "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.": "Lo que los disparadores han registrado en último lugar. “Deshacer” vuelve a quitar las entradas; el disparador no vuelve a registrar ese día.",
    "Trigger gelöscht": "Disparador eliminado",
    "(gelöscht)": "(eliminado)",
    "Einträge nicht mehr vorhanden": "Las entradas ya no existen",
    "Rückgängig": "Deshacer",
    "Erinnerung": "Recordatorio",
    "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde.": "Notificación mediante Home Assistant si no se ha registrado nada a la hora elegida.",
    "Erinnerung aktiv": "Recordatorio activo",
    "Benachrichtigungsdienst": "Servicio de notificación",
    "Automatische Sicherung": "Copia de seguridad automática",
    "Täglich eine JSON-Sicherung in {}, Aufbewahrung {} Tage (Add-on-Option „backup_keep_days“).": "Una copia JSON al día en {}, conservada {} días (opción del complemento “backup_keep_days”).",
    "Aus (Add-on-Option „auto_backup“).": "Desactivada (opción del complemento “auto_backup”).",
    "· {} KB": "· {} KB",
    "Wiederherstellen": "Restaurar",
    "Noch keine Sicherung.": "Aún no hay copias de seguridad.",
    "Jetzt sichern": "Hacer copia ahora",
    "Schnittstelle für Automationen": "Interfaz para automatizaciones",
    "Aktiv. Deine Benutzer-ID: {}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.": "Activa. Tu ID de usuario: {}. Hay ejemplos de llamada (rest_command) en la documentación del complemento.",
    "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.": "Desactivada. Para activarla, define una clave “api_key” en las opciones del complemento. Así la báscula, el asistente de voz o las automatizaciones pueden enviar entradas y peso.",
    "Daten": "Datos",
    "Export/Import betrifft nur dein Benutzerkonto.": "La exportación/importación solo afecta a tu cuenta de usuario.",
    "Sicherung (JSON)": "Copia de seguridad (JSON)",
    "Tagebuch als CSV": "Diario como CSV",
    "Datei nicht lesbar:": "Archivo ilegible:",
    "Sicherung einspielen": "Importar copia de seguridad",
    "MyFitnessPal-CSV importieren": "Importar CSV de MyFitnessPal",
    "Keine gültige Sicherung:": "Copia de seguridad no válida:",
    "Sicherung wiederherstellen": "Restaurar copia de seguridad",
    "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt.": "Todos los datos actuales de tu cuenta se sustituirán por la copia de seguridad.",
    "Jetzt": "Ahora",
    "Sicherung": "Copia de seguridad",
    "Gewichtswerte": "Valores de peso",
    "Zeitraum": "Periodo",
    "Wiederhergestellt.": "Restaurado.",
    "Ersetzen": "Reemplazar",
    "Sprache und Einheiten": "Idioma y unidades",
    "Sprache": "Idioma",
    "Einheiten": "Unidades",
    "Automatisch (Browser)": "Automático (navegador)",
    "Metrisch (kg, cm)": "Métrico (kg, cm)",
    "Imperial (lb, in)": "Imperial (lb, in)",
    "Teilen …": "Compartir …",
    "„{}“ teilen": "Compartir “{}”",
    "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Porción como múltiplo de la entrada (1 = misma cantidad). La entrada aparece el mismo día en el diario de los demás.",
    "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Cantidad para cada persona en gramos. La entrada aparece el mismo día en el diario de los demás.",
    "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein.": "Aún no participa nadie más en el hogar. Cada usuario activa “Hogar” en Ajustes → Funciones opcionales.",
    "Bitte mindestens eine Person wählen.": "Elige al menos una persona.",
    "Eingetragen bei {} Person(en).": "Registrado para {} persona(s).",
    "Haushalt": "Hogar",
    "Einträge mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Compartir entradas con otros usuarios, cada uno con su porción (p. ej. un plato para la familia). Ambas partes deben activar la función.",
    "Benutzerverwaltung": "Gestión de usuarios",
    "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer).": "Solo visible para administradores (opción del complemento “admin_users”; vacío = el primer usuario).",
    "Benutzer": "Usuario",
    "Zuletzt": "Último",
    "Export": "Exportar",
    "Admin": "Admin",
    "Alle Daten von „{}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:": "¿Eliminar definitivamente todos los datos de “{}”? Escribe el nombre para confirmar:",
    "Nur für Administratoren": "Solo para administradores",
    "Das eigene Konto kann hier nicht gelöscht werden": "Aquí no se puede eliminar tu propia cuenta",
    "Zur Bestätigung den Namen des Benutzers eingeben": "Escribe el nombre del usuario para confirmar",
    "Haushaltsfunktion ist nicht aktiviert": "La función Hogar no está activada",
    "Dieser Benutzer nimmt nicht am Haushalt teil": "Este usuario no participa en el hogar",
    "Weitere Importe": "Más importaciones",
    "Weitere Importe …": "Más importaciones …",
    "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.": "La importación solo afecta a tu cuenta de usuario. Los datos existentes se conservan, salvo que elijas expresamente “reemplazar”.",
    "CSV aus einer anderen App": "CSV de otra aplicación",
    "Datei wählen": "Elegir archivo",
    "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.": "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) y tablas similares. Las columnas se reconocen y se pueden corregir.",
    "Apple Health": "Apple Salud",
    "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.": "export.zip o export.xml de la app Salud (perfil → exportar datos de salud). El archivo se lee directamente en el navegador; solo se envían los valores diarios.",
    "Messart": "Tipo de medida",
    "Natrium": "Sodio",
    "Bitte die Spalte mit dem Datum zuordnen.": "Asigna la columna de la fecha.",
    "{} Einträge, {} Gewichtswerte aus {} Zeilen.": "{} entradas, {} valores de peso de {} filas.",
    "CSV importieren": "Importar CSV",
    "Erkannt: {}": "Reconocido: {}",
    "Zuordnung der Spalten": "Asignación de columnas",
    "– nicht vorhanden –": "– no disponible –",
    "Einheit der Gewichtsspalte": "Unidad de la columna de peso",
    "Stone": "Stone",
    "Lese Datei …": "Leyendo archivo …",
    "Lese Datei … {} %": "Leyendo archivo … {} %",
    "Keine gültige ZIP-Datei.": "Archivo ZIP no válido.",
    "Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.": "Archivo ZIP muy grande (ZIP64): descomprímelo y elige export.xml.",
    "In der ZIP-Datei wurde keine export.xml gefunden.": "No se encontró export.xml en el archivo ZIP.",
    "Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.": "Este navegador no puede descomprimir el archivo. Descomprímelo y elige export.xml.",
    "{} Gewichtswerte, {} Tage mit Ernährungsdaten gefunden.": "Se encontraron {} valores de peso y {} días con datos de nutrición.",
    "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)": "Importar peso (un valor por día, los valores existentes se sobrescriben)",
    "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)": "Importar los totales diarios de nutrición (una entrada rápida por día, solo útil si no llevas tus comidas aquí de otro modo)",
    "Importiert: {} Tage, {} Gewichtswerte.": "Importado: {} días, {} valores de peso.",
    "Die Datei enthält keine Datenzeilen.": "El archivo no contiene filas de datos.",
    "Export für Berater und Trainer": "Exportación para dietista y entrenador",
    "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum.": "Un informe para imprimir o guardar como PDF (elige “Guardar como PDF” en el cuadro de impresión) y una tabla con los valores diarios. Contiene solo el periodo elegido.",
    "Von": "Desde",
    "Bis": "Hasta",
    "Einzelne Einträge im Bericht auflisten": "Listar las entradas individuales en el informe",
    "Bericht öffnen (Drucken / PDF)": "Abrir informe (imprimir / PDF)",
    "Tagesübersicht (CSV)": "Resumen diario (CSV)",
    "Makro-Verlauf": "Evolución de macros",
    "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage.": "Barras: gramos por día. Discontinua: objetivo diario. Línea continua: media de los últimos 7 días.",
    "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen.": "Barras: gramos por día. Línea continua: media de los últimos 7 días. Puedes fijar un objetivo para este macro en Ajustes → Objetivos diarios.",
    "{} g (Ziel {} g)": "{} g (objetivo {} g)",
    "Ø 7 Tage {} g": "Ø 7 días {} g",
    "nicht erfasst": "no registrado",
    "Online suchen & vergleichen": "Buscar en línea y comparar",
    "Name oder Barcode": "Nombre o código de barras",
    "Quelle": "Fuente",
    "KH": "Carb.",
    "Fett": "Grasa",
    "Abweichung": "Desviación",
    "Abweichung der kcal von dem Wert im Formular": "Desviación de las kcal respecto al valor del formulario",
    "Übernehmen": "Aplicar",
    "Mittelwert der gewählten übernehmen": "Aplicar la media de los seleccionados",
    "Suche …": "Buscando …",
    "Alle Werte pro 100 g.": "Todos los valores por 100 g.",
    "Die Quellen weichen bei kcal um bis zu {} % voneinander ab – bitte prüfen.": "Las fuentes difieren hasta un {} % en kcal – revísalo.",
    "nicht erreichbar": "no disponible",
    "Weitere Datenquellen": "Más fuentes de datos",
    "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet).": "Búsqueda en línea en Open Food Facts y USDA, comparando los valores entre sí y con los tuyos (los términos de búsqueda se envían a esos servicios).",
    "Weitere Datenquellen sind nicht aktiviert": "Las fuentes de datos adicionales no están activadas",
    "Suchbegriff oder Barcode angeben": "Indica un término de búsqueda o un código de barras",
    "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)": "Límite de USDA alcanzado (define tu propia clave de api.data.gov en las opciones del complemento)",
    "Open Food Facts nicht erreichbar": "Open Food Facts no disponible",
    "Mahlzeit enthält noch Einträge": "La comida aún contiene entradas",
    "Mahlzeit ist leer": "La comida está vacía",
    "Mahlzeit braucht mindestens eine Komponente": "La comida necesita al menos un componente",
    "Keine MyDietAssistant-Sicherung": "No es una copia de seguridad de MyDietAssistant",
    "Das sieht nicht nach einem MyFitnessPal-Export aus.": "Esto no parece una exportación de MyFitnessPal.",
    "Home Assistant nicht erreichbar": "Home Assistant no disponible",
    "Uhrzeit (HH:MM) erforderlich": "Se requiere la hora (HH:MM)",
    "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben": "indica exactamente uno de comida / alimento / perfil de objetivo",
    "weitere Bedingung: Art und Entität erforderlich": "otra condición: se requieren tipo y entidad",
    "Name und Kalorien erforderlich": "Se requieren nombre y calorías",
    "ungültiger Zeitraum": "periodo no válido",
    "Quell- und Zieltag sind gleich": "El día de origen y el de destino son el mismo",
    "Sicherung nicht gefunden": "Copia de seguridad no encontrada",
    "Externe API ist aus: Option api_key im Add-on setzen": "La API externa está desactivada: define la opción api_key en el complemento",
    "falscher Schlüssel": "clave incorrecta",
    "Lebensmittel „{}“ nicht gefunden": "Alimento “{}” no encontrado",
    "food oder name angeben": "indica food o name",
    "kg außerhalb des gültigen Bereichs": "kg fuera del rango válido",
    "Uhrzeit fehlt": "falta la hora",
    "Benachrichtigungsdienst wie notify.mobile_app_handy angeben": "Indica un servicio de notificación como notify.mobile_app_telefono",
    "not found": "not found",
    "Aktivität": "Actividad",
    "Aktivität eintragen": "Registrar actividad",
    "Schritte": "Pasos",
    "Verbrannt": "Quemadas",
    "Zum Tagesziel": "Añadido al objetivo",
    "aus Schritten geschätzt": "estimado a partir de los pasos",
    "Eintragen": "Registrar",
    "Aus Home Assistant lesen": "Leer de Home Assistant",
    "Handeingabe verwerfen": "Descartar entrada manual",
    "Dein Tagesziel (+{} kcal Aktivität)": "Tu objetivo diario (+{} kcal de actividad)",
    "Tagesziel ({}) (+{} kcal Aktivität)": "Objetivo diario ({}) (+{} kcal de actividad)",
    "(+{} kcal Aktivität)": "(+{} kcal de actividad)",
    "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben.": "Los valores introducidos a mano ya no se sobrescriben con los sensores para este día.",
    "Verbrannte Kalorien (kcal)": "Calorías quemadas (kcal)",
    "leer = aus Schritten schätzen": "vacío = estimar a partir de los pasos",
    "{} % der verbrannten Kalorien": "{} % de las calorías quemadas",
    "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen.": "Sensores de Home Assistant que cuentan a lo largo del día y vuelven a 0 a medianoche (un contador que solo crece se puede hacer diario con el asistente “Medidor de consumo”). El complemento los lee cada cinco minutos. Sin sensor de calorías, estas se estiman a partir de los pasos, el peso corporal y el factor de abajo; los valores también se pueden introducir a mano.",
    "Sensor für Schritte": "Sensor de pasos",
    "Sensor für aktive Kalorien (kcal)": "Sensor de calorías activas (kcal)",
    "Anteil, der das Tagesziel erhöht (%)": "Porcentaje que aumenta el objetivo diario (%)",
    "kcal je Schritt und kg Körpergewicht": "kcal por paso y kg de peso corporal",
    "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind.": "Muchas apps solo cuentan una parte de las calorías quemadas (50 % es un valor prudente) porque los datos de actividad suelen estar sobrestimados.",
    "z. B. sensor.handy_schritte": "p. ej. sensor.telefono_pasos",
    "z. B. sensor.handy_aktive_kalorien": "p. ej. sensor.telefono_calorias_activas",
    "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages.": "Los pasos y las calorías quemadas (de sensores de Home Assistant o a mano) aumentan el objetivo calórico de ese día.",
    "Mahlzeiten-Zeitplan": "Horario de comidas",
    "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung.": "Una franja horaria por comida: el diario muestra qué comida toca y, si quieres, avisa con una notificación.",
    "Jetzt: {}": "Ahora: {}",
    "({} Uhr)": "({} h)",
    "Als Nächstes: {} ab {} Uhr": "Siguiente: {} desde las {} h",
    "schon eingetragen": "ya registrado",
    "+ Hinzufügen": "+ Añadir",
    "Von (leer = Standardfenster)": "Desde (vacío = franja predeterminada)",
    "Bis (leer = Standardfenster)": "Hasta (vacío = franja predeterminada)",
    "Standardfenster": "Franja predeterminada",
    "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.": "Franja horaria por comida. Si se deja vacía, se aplica una franja predeterminada (desayuno, almuerzo y cena); los snacks no tienen. Son posibles franjas que pasan de medianoche.",
    "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist": "Avisar cuando toca una comida y sigue vacía",
    "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten.": "Usa el servicio de notificación de “Recordatorio” más abajo.",
    "Zwischenspeicher der Online-Suche": "Caché de la búsqueda en línea",
    "Zwischenspeicher leeren": "Vaciar caché",
    "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch.": "El complemento recuerda localmente las consultas a Open Food Facts y USDA (códigos de barras 60 días, términos de búsqueda 14 días), así que las búsquedas repetidas ya no salen a internet. Solo se guardan datos de productos, nada de tu diario.",
    "{} gespeicherte Abfragen ({} KB)": "{} consultas guardadas ({} KB)",
    "Barcode scannen": "Escanear código de barras",
    "Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.": "No se pudo cargar el lector de códigos de barras. Escribe el número.",
    "Mehr laden": "Cargar más",
    "Tabelle importieren …": "Importar tabla …",
    "Werte online prüfen": "Comprobar valores en línea",
    "Prüfen": "Comprobar",
    "Anhalten": "Detener",
    "Ignorieren": "Ignorar",
    "Prüfe {} von {} …": "Comprobando {} de {} …",
    "Nur Lebensmittel mit Barcode ({} von {})": "Solo alimentos con código de barras ({} de {})",
    "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)": "Consultar también USDA (límite estricto de consultas sin clave propia)",
    "Online-Abfrage nicht möglich: {}": "Consulta en línea no posible: {}",
    "Dein Wert: {} kcal · KH {} · Fett {} · Eiweiß {}": "Tu valor: {} kcal · carb. {} · grasa {} · prot. {}",
    "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst.": "Compara tus alimentos con Open Food Facts (por código de barras, si no por nombre) y muestra desviaciones en calorías y macros. No se cambia nada hasta que elijas “Aplicar”. Las consultas se guardan en caché local; los códigos de barras o nombres se envían al servicio.",
    "Lebensmittel-Tabelle importieren": "Importar tabla de alimentos",
    "Lebensmittel-Tabelle": "Tabla de alimentos",
    "Energie (kJ)": "Energía (kJ)",
    "Bitte die Spalten für Name und Kalorien zuordnen.": "Asigna las columnas del nombre y de las calorías.",
    "{} Lebensmittel erkannt ({} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.": "{} alimentos reconocidos ({} filas sin nombre ni calorías se omiten). Los valores son por 100 g.",
    "Kategorie für Lebensmittel ohne Kategorie in der Datei": "Categoría de los alimentos importados",
    "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Los alimentos existentes con el mismo nombre y la misma marca no cambian.",
    "Importiert: {} neu, {} schon vorhanden, {} übersprungen.": "Importado: {} nuevos, {} ya existentes, {} omitidos.",
    "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.": "Una tabla nutricional (por ejemplo BLS, exportación de Open Food Facts, CIQUAL o tu propia lista) en CSV o Excel: los alimentos con valores por 100 g se añaden a tu biblioteca.",
    "Mit dem Haushalt teilen": "Compartir con el hogar",
    "Teilen": "Compartir",
    "{} kopiert, {} übersprungen.": "{} copiados, {} omitidos.",
    "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen.": "Las personas elegidas reciben su propia copia en su biblioteca. Las entradas con el mismo nombre que ya tengan no cambian; los cambios posteriores no se sincronizan.",
    "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Compartir entradas, alimentos y comidas con otros usuarios, cada uno con su porción (p. ej. un plato para la familia). Ambas partes deben activar la función.",
    "Lebensmittelmengen": "Cantidades de alimentos",
    "Gramm": "Gramos",
    "Unzen (oz)": "Onzas (oz)",
    "Menge (oz)": "Cantidad (oz)",
    "Portion (oz)": "Porción (oz)",
    "Gewicht fertig (oz, optional)": "Peso cocinado (oz, opcional)",
    "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Cantidad para cada persona en onzas. La entrada aparece el mismo día en el diario de los demás.",
    "Gesamt: {}": "Total: {}",
    "pro Portion ({})": "por porción ({})",
    "Pro Portion ({}): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Por porción ({}): {} kcal · carb. {} g · grasa {} g · prot. {} g · {} porciones",
    "Gemeinsame Haushaltsbibliothek": "Biblioteca compartida del hogar",
    "Für den Haushalt freigegeben": "Compartido con el hogar",
    "geteilt": "compartido",
    "von {}": "de {}",
    "Gehört {}. Änderungen gelten für alle im Haushalt.": "Pertenece a {}. Los cambios se aplican a todo el hogar.",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)": "Ofrecer en la biblioteca compartida del hogar (los demás pueden usarlo y editarlo)",
    "Aus Mealie …": "Desde Mealie …", "Rezept aus Mealie": "Receta desde Mealie", "In Mealie suchen…": "Buscar en Mealie…", "Weitere laden": "Cargar más",
    "{} Portionen": "{} raciones", "Mealie": "Mealie", "Adresse": "Dirección", "API-Token": "Token de API",
    "Gespeichert (leer lassen = unverändert)": "Guardado (vacío = sin cambios)",
    "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert.": "La receta se lee de tu servidor Mealie y sus ingredientes se asignan a tus alimentos; compruebas todo antes de guardar. No se cambia nada en Mealie.",
    "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren.": "Importa recetas de un servidor Mealie. Indica la dirección del servidor (red local o add-on) y un token de API de Mealie (perfil → tokens de API). El add-on solo lee recetas y no cambia nada en Mealie. El token se queda en el add-on y no aparece en la exportación. Vacía la dirección para quitarlo.",
    "Von Webseite …": "Desde una página web …",
    "Rezept von Webseite": "Receta desde una página web",
    "Lade …": "Cargando …",
    "Adresse der Rezeptseite": "Dirección de la página de la receta",
    "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "El complemento descarga la página y busca datos de receta (ingredientes, porciones, preparación). Los ingredientes se asocian a tus alimentos; revisas todo antes de guardar.",
    "Zubereitung": "Preparación",
    "Zubereitung, ein Schritt pro Zeile": "Preparación, un paso por línea",
    "Angabe der Webseite: {} kcal pro Portion": "Indicado por la página web: {} kcal por porción",
    "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "1 ingrediente sin asociar (rojo): elige un alimento con ⇄; si no, cuenta con 0 kcal. Completa las cantidades que falten.",
    "{} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "{} ingredientes sin asociar (rojo): elige un alimento con ⇄; si no, cuentan con 0 kcal. Completa las cantidades que falten.",
    "Bitte eine Adresse mit http:// oder https:// angeben.": "Introduce una dirección que empiece por http:// o https://",
    "Die Adresse wurde nicht gefunden.": "No se encontró la dirección.",
    "Adressen im lokalen Netz sind nicht erlaubt.": "No se permiten direcciones de la red local.",
    "Die Seite ist zu groß.": "La página es demasiado grande.",
    "Zu viele Weiterleitungen.": "Demasiadas redirecciones.",
    "Die Seite konnte nicht geladen werden.": "No se pudo cargar la página.",
    "Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).": "No se encontró ninguna receta en esta página (faltan datos de receta estructurados).",
    "Das Rezept enthält keine Zutaten.": "La receta no contiene ingredientes.",
    "Rezepte sind nicht aktiviert": "Las recetas no están activadas",
    "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf": "Obtiene los pasos y las calorías de los últimos 30 días del historial de Home Assistant",
    "Verlauf nachladen": "Cargar historial",
    "Verlauf nachgeladen: {} Tage.": "Historial cargado: {} días.",
    "Zeitraum: 1 bis 365 Tage": "Periodo: de 1 a 365 días",
    "Zuerst einen Sensor für Schritte oder Kalorien wählen": "Elige primero un sensor de pasos o de calorías",
    "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)": "Home Assistant no devolvió el historial (¿registrador activo?)",
    "Ungültige Entität": "Entidad no válida",
    "Wert außerhalb des Bereichs": "Valor fuera de rango",
    "Nur im Home-Assistant-Add-on möglich": "Solo es posible dentro del complemento de Home Assistant",
    "Leere Datei": "Archivo vacío",
    "Die Datei konnte nicht gelesen werden.": "No se pudo leer el archivo.",
    "Die Excel-Datei enthält kein Tabellenblatt.": "El archivo de Excel no contiene ninguna hoja.",
    "Zu viele Zeilen (höchstens 50 000)": "Demasiadas filas (50 000 como máximo)",
    "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Asigna las columnas del nombre y de las calorías (kcal o kJ)",
    "Mahlzeiten-Vorschläge": "Sugerencias de comidas",
    "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben).": "Botón en el diario: propone comidas guardadas y combinaciones de tu historial que encajan con las calorías y macros restantes (se ajustan las cantidades, los envases fijos se mantienen).",
    "Mahlzeit vorschlagen": "Sugerir una comida",
    "Rest des Tages": "Resto del día",
    "Anteil für diese Mahlzeit": "Parte para esta comida",
    "Ziel für diese Mahlzeit: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Objetivo para esta comida: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.": "Ya has alcanzado tu objetivo diario: no queda nada que completar.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf.": "Aún no hay sugerencias: guarda comidas en el diario con «Guardar / Copiar» o come combinaciones al menos dos veces y aparecerán aquí.",
    "Weitere Vorschläge": "Más sugerencias",
    "Beigabe": "Complemento",
    "aus dem Verlauf ({}×)": "del historial ({}×)",
    "Gespeichert": "Guardado",
    "Abweichung vom Ziel: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Desviación del objetivo: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Danach am Tag noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Todavía abierto para el día después: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Anpassen": "Ajustar",
    "Fertig": "Listo",
    "Prioritäten und Beigaben": "Prioridades y complementos",
    "Trainingstag": "Día de entrenamiento",
    "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen.": "Elige el batido y su objetivo en «Prioridades y complementos» y entonces puedo calcular las cantidades.",
    "Der Shake ist für heute schon eingetragen.": "El batido ya está registrado para hoy.",
    "Shake": "Batido",
    "Ziel für den Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Objetivo para el batido: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel.": "No se puede calcular una sugerencia para el batido: define al menos un objetivo en los ajustes.",
    "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig.": "Con esto alcanzas tu objetivo del día: no queda nada para una cena.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“.": "Aún no hay sugerencias: guarda comidas en el diario con «Guardar / Copiar».",
    "Noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Todavía abierto: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Offen nach dem Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Abierto tras el batido: {} kcal · KH {} g · Fett {} g · Eiweiß {} g",
    "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein.": "Tu batido después de entrenar: la app calcula las cantidades para alcanzar el objetivo y luego sugiere cenas para el resto del día. El batido debe estar guardado como comida.",
    "– kein Shake –": "– sin batido –",
    "Was der Shake liefern soll (leer = egal)": "Lo que debe aportar el batido (vacío = da igual)",
    "Shake eintragen in": "Registrar el batido en",
    "erste Mahlzeit": "primera comida",
    "Abendessen eintragen in": "Registrar la cena en",
    "erste freie Mahlzeit": "primera comida libre",
    "Trigger tragen den Shake mit den berechneten Mengen ein": "Los disparadores registran el batido con las cantidades calculadas",
    "Vorschläge einstellen": "Ajustes de las sugerencias",
    "Wichtigkeit": "Importancia",
    "egal": "da igual",
    "normal": "normal",
    "wichtig": "importante",
    "sehr wichtig": "muy importante",
    "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor.": "Cuanto más importante es un valor, más debe acercarse la sugerencia. Los valores sin objetivo se ignoran.",
    "Kalorienziel nie überschreiten": "No superar nunca el objetivo calórico",
    "Eiweißziel möglichst erreichen": "Alcanzar si es posible el objetivo de proteínas",
    "Beigaben": "Complementos",
    "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite.": "Alimentos que combinan con cualquier comida (p. ej. frutos secos). Una sugerencia solo los añade si encajan mejor con lo que falta. Campos: mínimo, máximo, paso.",
    "Mindestmenge": "Cantidad mínima",
    "Höchstmenge": "Cantidad máxima",
    "Schrittweite": "Paso",
    "Beigabe hinzufügen": "Añadir un complemento",
    "+ Beigabe": "+ Complemento",
    "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.": "Escalable: sigue el factor de cantidad de la comida. Fijo: se mantiene igual.",
    "Skalierbar": "Escalable",
    "Fest": "Fijo",
    "Packung": "Envase",
    "Abweichung ±": "Desviación ±",
    "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)": "Cuánto puede desviarse este ingrediente de su proporción respecto a los demás (en porcentaje)",
    "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.": "Tamaño del envase: la sugerencia usa tantos envases como se indique en «Número». Vacío = exactamente la cantidad guardada.",
    "Mengenfaktor für Vorschläge": "Factor de cantidad para las sugerencias",
    "von": "de",
    "bis": "a",
    "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6.": "Cuánto puede reducirse o ampliarse la comida entera en las sugerencias (1 = cantidad guardada). Vacío = 0,6 a 1,6.",
    "Mahlzeiten-Vorschläge sind nicht aktiviert": "Las sugerencias de comidas no están activadas",
    "Vorschlag ist leer": "La sugerencia está vacía",
    "Ungültige Werte": "Valores no válidos",
    "Kleinster Faktor ist größer als der größte": "El factor mínimo es mayor que el máximo",
    "Wie viele Packungen ein Vorschlag nehmen darf": "Cuántos envases puede usar una sugerencia (de – a; 0 = puede omitirse)",
    "Anzahl": "Número",
    "Ausschließen": "Excluir",
    "Ausgeschlossen": "Excluidas",
    "Zulassen": "Permitir",
    "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück.": "Estas comidas ya no aparecen en las sugerencias. «Permitir» las devuelve.",
    "Frühstück": "Desayuno",
    "Mittagessen": "Almuerzo",
    "Abendessen": "Cena",
    "Snacks": "Snacks",
    "Mahlzeit": "Comida",
    "Menge": "Cantidad",
    "Die Makros ergeben {} g auf 100 g – mehr als möglich.": "Los macros suman {} g por 100 g – más de lo posible.",
    "Die Makros ergeben rechnerisch ca. {} kcal, angegeben sind {} kcal.": "Los macros suman unas {} kcal, pero se indican {} kcal.",
    "{} Lebensmittel durch ausgeblendete Kategorien versteckt.": "{} alimentos ocultos por categorías ocultas.",
    "{}: Werte übernommen ✓": "{}: valores aplicados ✓",
    "{}: {} kcal · KH {} · Fett {} · Eiweiß {} ({})": "{}: {} kcal · HC {} · grasa {} · prot. {} ({})",
    "{} geprüft: {} stimmen überein, {} weichen ab, {} ohne Treffer.": "{} comprobados: {} coinciden, {} difieren, {} sin resultado.",
    "{} Einträge, {} Gewichtswerte ({} bis {}) aus {} Zeilen.": "{} entradas, {} valores de peso ({} a {}) de {} filas.",
    "{} Tage ({} bis {}), {} Einträge, {} Gewichtswerte": "{} días ({} a {}), {} entradas, {} valores de peso",
    "{} Uhr · {}": "{} · {}",
    "Die Excel-Datei ist zu groß.": "El archivo de Excel es demasiado grande.",
    "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).": "Mealie aún no está configurado (Ajustes → Mealie).",
    "Mealie konnte nicht erreicht werden.": "No se pudo acceder a Mealie.",
    "Bitte eine Adresse wie http://mealie:9000 angeben.": "Indica una dirección como http://mealie:9000.",
    "Nicht gefunden (Adresse oder Rezept prüfen).": "No encontrado (revisa la dirección o la receta).",
    "Mealie antwortete mit Fehler {}.": "Mealie respondió con el error {}.",
    "Unter dieser Adresse läuft kein Mealie.": "No hay ningún Mealie en esta dirección.",
    "Ungültiges Rezept.": "Receta no válida.",
    "Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).": "Esta dirección no está permitida (Mealie se ejecuta en su propio servidor o complemento).",
    "Mealie ist nicht erreichbar.": "Mealie no está accesible.",
    "Die Seite antwortete mit Fehler {}.": "La página respondió con el error {}.",
    "Rezept": "Receta",
    "Wasser": "Agua",
    "Koffein": "Cafeína",
    "Kreatin": "Creatina",
    "{} (Kopie)": "{} (copia)",
    "Daten löschen …": "Eliminar datos …",
    "Daten löschen": "Eliminar datos",
    "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an.": "Elimina de forma permanente los datos elegidos de tu cuenta. Los demás usuarios y los ajustes no se tocan. Lo mejor es crear antes una copia de seguridad (JSON).",
    "Einträge, Notizen, Wasser und Aktivität aller Tage": "entradas, notas, agua y actividad de todos los días",
    "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)": "todos los alimentos de la biblioteca (las entradas del diario se conservan)",
    "alle gespeicherten Mahlzeiten": "todas las comidas guardadas",
    "alle Rezepte samt ihrer Lebensmittel": "todas las recetas con sus alimentos",
    "Gewicht und Körpermaße": "Peso y medidas corporales",
    "Gewichtswerte, Körpermaße und Fortschrittsfotos": "valores de peso, medidas corporales y fotos de progreso",
    "Tagesziel, Wochentagsziele und Profile": "objetivo diario, objetivos por día de la semana y perfiles",
    "alle Trigger und Mahlzeiten-Regeln samt Verlauf": "todos los disparadores y reglas de comidas con su historial",
    "Bitte mindestens einen Bereich wählen.": "Elige al menos un área.",
    "Bitte mindestens einen gültigen Bereich wählen.": "Elige al menos un área válida.",
    "Wirklich unwiderruflich löschen: {}?": "¿Eliminar definitivamente: {}?",
    "Gelöscht.": "Eliminado.",
    "Endgültig löschen": "Eliminar definitivamente",
    "Abendessen sollen das Eiweißziel möglichst erreichen": "Las cenas deben alcanzar en lo posible el objetivo de proteínas",
    "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)": "Mostrar el botón «Día de entrenamiento» todos los días (si no, solo cuando el batido está registrado o lo registró un disparador)",
    "Einkaufsliste": "Lista de la compra",
    "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt.": "Elige recetas (raciones) y comidas guardadas (múltiplo, 1 = una vez): los ingredientes se suman.",
    "Noch nichts gewählt.": "Todavía no has elegido nada.",
    "In die Zwischenablage kopieren": "Copiar al portapapeles",
    "Kopiert ✓": "Copiado ✓",
    "An Home Assistant senden": "Enviar a Home Assistant",
    "Todo-Liste": "Lista de tareas",
    "Keine Todo-Liste in Home Assistant gefunden.": "No se encontró ninguna lista de tareas en Home Assistant.",
    "{} Einträge gesendet.": "{} elementos enviados.",
    "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste).": "Suma los ingredientes de recetas y comidas guardadas, los copia o los envía a una lista de tareas de Home Assistant (p. ej. la lista de la compra).",
    "Einkaufsliste nicht aktiviert": "La lista de la compra no está activada",
    "Todo-Liste fehlt": "Falta la lista de tareas",
    "Keine Einträge": "Sin elementos",
    "Home Assistant nicht erreichbar (gesendet: {})": "Home Assistant no es accesible (enviados: {})",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)": "Ofrecer en la biblioteca compartida del hogar (los demás pueden usarlo y copiarlo)",
    "Wochenbericht": "Resumen semanal",
    "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“.": "Una vez a la semana, un resumen de los últimos siete días como notificación. Usa el servicio de notificación de «Recordatorio».",
    "Wochenbericht aktiv": "Resumen semanal activo",
    "Wochentag": "Día de la semana",
    "Vorschau": "Vista previa",
    "Datenbank": "Base de datos",
    "{} · {} Zeilen in {} Tabellen · frei {} · letzte Sicherung: {}": "{} · {} filas en {} tablas · libre {} · última copia de seguridad: {}",
    "Prüfen und verdichten": "Comprobar y compactar",
    "Prüfung läuft …": "Comprobando …",
    "Verdichtet: {} → {}": "Compactada: {} → {}",
    "Datenbank ist in Ordnung.": "La base de datos está bien.",
    "Datenbank prüfen: {}": "Comprobación de la base de datos: {}",
    "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)": "Detectar también a partir de estas calorías quemadas (kcal, 0 = desactivado)",
    "Wochentag ungültig": "Día de la semana no válido",
    "Andere dürfen es auch ändern": "Los demás también pueden cambiarlo",
    "Nährwert-Lücken (7 Tage)": "Carencias de nutrientes (7 días)",
    "Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; {} von {} Tagen erfasst.": "Media de los últimos 7 días (solo días con valores) frente a valores de referencia; {} de {} días registrados.",
    "nicht genug Angaben": "datos insuficientes",
    "Ziele ändern": "Cambiar objetivos",
    "Ziele für weitere Nährwerte": "Objetivos para más nutrientes",
    "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze.": "Valores de referencia por día en g. La fibra debe alcanzarse; para el azúcar, la sal y las grasas saturadas es un límite superior.",
    "Weitere Nährwerte sind nicht aktiviert": "Más nutrientes no está activado",
    "Ziele müssen zwischen 0 und 1000 liegen": "Los objetivos deben estar entre 0 y 1000",
    "Ø {} g (mind. {} g) – im Ziel": "Ø {} g (al menos {} g) – en el objetivo",
    "Ø {} g (mind. {} g) – {} % unter dem Ziel": "Ø {} g (al menos {} g) – {} % por debajo del objetivo",
    "Ø {} g (höchstens {} g) – im Ziel": "Ø {} g (como máximo {} g) – en el objetivo",
    "Ø {} g (höchstens {} g) – {} % über dem Ziel": "Ø {} g (como máximo {} g) – {} % por encima del objetivo",
    "Aus Text …": "Desde texto …",
    "Rezept aus Text": "Receta desde texto",
    "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Pega una receta como texto: primero el título, luego los ingredientes (uno por línea, con cantidad) y la preparación. Encabezados como «Ingredientes» y «Preparación» ayudan. Los ingredientes se asocian a tus alimentos; revisas todo antes de guardar.",
    "Rezepttext": "Texto de la receta",
    "Im Text wurden keine Zutaten gefunden (Zeilen mit Mengen, z. B. „200 g Mehl“).": "No se encontraron ingredientes en el texto (líneas con cantidades, p. ej. «200 g de harina»).",
    "Der Text ist zu lang.": "El texto es demasiado largo.",
    "Offline: 1 Eintrag wartet auf Verbindung.": "Sin conexión: 1 entrada espera conexión.",
    "Offline: {} Einträge warten auf Verbindung.": "Sin conexión: {} entradas esperan conexión.",
    "Hauptmenü": "Menú principal",
    "Zeitraum A, von": "Periodo A, desde",
    "Zeitraum A, bis": "Periodo A, hasta",
    "Zeitraum B, von": "Periodo B, desde",
    "Zeitraum B, bis": "Periodo B, hasta",
  },
  nl: {
    "Ernährung": "Voeding",
    "Tagebuch": "Dagboek",
    "Lebensmittel": "Voedingsmiddelen",
    "Mahlzeiten": "Maaltijden",
    "Rezepte": "Recepten",
    "Gewicht": "Gewicht",
    "Statistik": "Statistieken",
    "Einstellungen": "Instellingen",
    "Lokal": "Lokaal",
    "Kategorien:": "Categorieën:",
    "Ein-/ausblenden": "Tonen/verbergen",
    "Vortag": "Vorige dag",
    "Folgetag": "Volgende dag",
    "Bearbeiten": "Bewerken",
    "Entfernen": "Verwijderen",
    "Kalorien": "Calorieën",
    "Kohlenhydrate": "Koolhydraten",
    "Fette": "Vetten",
    "Eiweiß": "Eiwit",
    "+ Nahrungsmittel hinzufügen": "+ Voedingsmiddel toevoegen",
    "Notiz zur Mahlzeit": "Notitie bij de maaltijd",
    "Tag": "Dag",
    "Notiz ändern": "Notitie wijzigen",
    "Notiz": "Notitie",
    "Speichern / Kopieren": "Opslaan / kopiëren",
    "Mahlzeit leeren": "Maaltijd leegmaken",
    "Tag leeren": "Dag leegmaken",
    "Alle Einträge von „{}“ löschen?": "Alle items van “{}” verwijderen?",
    "Alle Einträge dieses Tages löschen?": "Alle items van deze dag verwijderen?",
    "Einträge": "Items",
    "Ausgeblendete Mahlzeiten wieder verbergen": "Verborgen maaltijden weer verbergen",
    "leere/ausgeblendete Mahlzeit anzeigen": "lege/verborgen maaltijd tonen",
    "leere/ausgeblendete Mahlzeiten anzeigen": "lege/verborgen maaltijden tonen",
    "Tagesziel ({})": "Dagdoel ({})",
    "Dein Tagesziel": "Jouw dagdoel",
    "Gesamt": "Totaal",
    "Verbleibend": "Resterend",
    "Weitere Nährwerte": "Meer voedingswaarden",
    "Notiz zum Tag": "Notitie bij de dag",
    "Ganzen Tag kopieren": "Hele dag kopiëren",
    "z. B. Hunger, Training, Stimmung …": "bijv. honger, training, stemming …",
    "Notiz: {}": "Notitie: {}",
    "Abbrechen": "Annuleren",
    "Speichern": "Opslaan",
    "Auf den Tag": "Naar dag",
    "Mengenfaktor (1 = unverändert)": "Hoeveelheidsfactor (1 = ongewijzigd)",
    "Bitte einen Tag wählen.": "Kies een dag.",
    "Kopieren": "Kopiëren",
    "Wasser & Ergänzungen": "Water & supplementen",
    "Lebensmittel suchen…": "Voedingsmiddelen zoeken…",
    "Zurück": "Terug",
    "g KH": "g koolh.",
    "g Fett": "g vet",
    "g Eiweiß": "g eiwit",
    "Menge (g)": "Hoeveelheid (g)",
    "Ballaststoffe": "Vezels",
    "Zucker": "Suiker",
    "Salz": "Zout",
    "ges. Fettsäuren": "verz. vetzuren",
    "Portion wählen …": "Portie kiezen …",
    "Portion": "Portie",
    "Bezeichnung": "Omschrijving",
    "KH (g)": "Koolh. (g)",
    "Fett (g)": "Vet (g)",
    "Eiweiß (g)": "Eiwit (g)",
    "Uhrzeit": "Tijdstip",
    "Lebensmittel tauschen": "Voedingsmiddel vervangen",
    "Bezeichnung und kcal sind Pflicht.": "Omschrijving en kcal zijn verplicht.",
    "„{}“ tauschen": "“{}” vervangen",
    "Tauschen": "Vervangen",
    "Schnelleingabe in „{}“": "Snelle invoer in “{}”",
    "Schnelleingabe": "Snelle invoer",
    "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“).": "Zonder voedingsmiddel, alleen calorieën en eventueel macro’s (bijv. “Restaurant, ca. 800 kcal”).",
    "z. B. Restaurant": "bijv. Restaurant",
    "Hinzufügen": "Toevoegen",
    "Als Mahlzeit speichern": "Opslaan als maaltijd",
    "Am Tag": "Op dag",
    "Neue Uhrzeit (leer = Originalzeit)": "Nieuw tijdstip (leeg = oorspronkelijk tijdstip)",
    "In Mahlzeit": "In maaltijd",
    "Nichts ausgewählt.": "Niets geselecteerd.",
    "Name der Mahlzeit": "Naam van de maaltijd",
    "z. B. Diät, Bulk (optional)": "bijv. Cutten, Bulken (optioneel)",
    "Name": "Naam",
    "Kategorie": "Categorie",
    "Bitte einen Namen angeben.": "Geef een naam op.",
    "Dieser Browser kann keine Barcodes lesen (BarcodeDetector fehlt). Bitte die Nummer eintippen.": "Deze browser kan geen barcodes lezen (BarcodeDetector ontbreekt). Typ het nummer in.",
    "Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.": "Geen toegang tot de camera (de pagina heeft HTTPS nodig). Gebruik “Foto” of typ het nummer in.",
    "Abgebrochen": "Afgebroken",
    "Scan abbrechen": "Scan afbreken",
    "Halte den Barcode ins Bild.": "Houd de barcode in beeld.",
    "Kamerazugriff wurde nicht erlaubt.": "Toegang tot de camera is niet toegestaan.",
    "Kamera nicht verfügbar: {}": "Camera niet beschikbaar: {}",
    "Auf dem Foto wurde kein Barcode erkannt.": "Op de foto is geen barcode herkend.",
    "z. B. 1 Scheibe": "bijv. 1 plak",
    "Produkt nicht gefunden ({})": "Product niet gevonden ({})",
    "Barcode (Open Food Facts)": "Barcode (Open Food Facts)",
    "Suchen": "Zoeken",
    "Scannen (Kamera)": "Scannen (camera)",
    "Foto vom Barcode": "Foto van barcode",
    "Marke": "Merk",
    "z. B. Diät, Bulk": "bijv. Cutten, Bulken",
    "Portion (g)": "Portie (g)",
    "kcal / 100 g": "kcal / 100 g",
    "KH / 100 g": "Koolh. / 100 g",
    "Fett / 100 g": "Vet / 100 g",
    "Eiweiß / 100 g": "Eiwit / 100 g",
    "Portionsgrößen (optional)": "Portiegroottes (optioneel)",
    "+ Portion": "+ Portie",
    "Name und kcal sind Pflicht.": "Naam en kcal zijn verplicht.",
    "Speichern & wählen": "Opslaan & kiezen",
    "Suchen…": "Zoeken…",
    "★ Favoriten": "★ Favorieten",
    "Meine Mahlzeiten": "Mijn maaltijden",
    "Häufig verwendet": "Vaak gebruikt",
    "Beides": "Beide", "Hinzufügen-Dialog": "Toevoegvenster", "„Häufig verwendet“ zeigt": "“Vaak gebruikt” toont", "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten.": "Geldt voor het tabblad “Voedingsmiddelen” in het toevoegvenster. Op het tabblad “Mijn maaltijden” staan altijd de vaak gebruikte maaltijden.",
    "Alle": "Alle",
    "Nichts gefunden – lege ein neues Lebensmittel an.": "Niets gevonden – maak een nieuw voedingsmiddel aan.",
    "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆.": "Nog geen favorieten – markeer voedingsmiddelen op de pagina “Voedingsmiddelen” met ☆.",
    "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen.": "Geen opgeslagen maaltijd. Maak er een aan in het dagboek via “Opslaan als maaltijd”.",
    "Portionen": "Porties",
    "+ Neues Lebensmittel": "+ Nieuw voedingsmiddel",
    "Schnelleingabe (nur kcal)": "Snelle invoer (alleen kcal)",
    "Schließen": "Sluiten",
    "Zu „{}“ hinzufügen": "Toevoegen aan “{}”",
    "Eintrag hinzufügen": "Item toevoegen",
    "(Ziel {})": "(doel {})",
    "Trend {} kg": "Trend {} kg",
    "Gewichtsverlauf": "Gewichtsverloop",
    "Verlauf": "Verloop",
    "zu wenig Daten": "te weinig gegevens",
    "nicht absehbar": "niet te voorzien",
    "erreicht": "bereikt",
    "Lebensmittel bearbeiten": "Voedingsmiddel bewerken",
    "Neues Lebensmittel": "Nieuw voedingsmiddel",
    "Favorit entfernen": "Favoriet verwijderen",
    "Als Favorit markieren": "Als favoriet markeren",
    "Favorit": "Favoriet",
    "Trigger anlegen": "Trigger maken",
    "Löschen": "Verwijderen",
    "„{}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.": "“{}” verwijderen? Reeds ingevoerde maaltijden blijven behouden.",
    "Nichts gefunden.": "Niets gevonden.",
    "Noch keine Lebensmittel angelegt.": "Nog geen voedingsmiddelen aangemaakt.",
    "Duplikate suchen": "Dubbele zoeken",
    "Doppelte Lebensmittel": "Dubbele voedingsmiddelen",
    "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.": "Kies per groep het voedingsmiddel dat moet blijven. Reeds ingevoerde maaltijden blijven ongewijzigd.",
    "Keine Duplikate gefunden.": "Geen dubbele gevonden.",
    "Zusammenführen": "Samenvoegen",
    "Durch anderes Lebensmittel tauschen": "Vervangen door een ander voedingsmiddel",
    "Mahlzeit bearbeiten": "Maaltijd bewerken",
    "Komponenten": "Onderdelen",
    "Komponente hinzufügen": "Onderdeel toevoegen",
    "+ Komponente": "+ Onderdeel",
    "Kopie anlegen": "Kopie maken",
    "Mahlzeit „{}“ löschen?": "Maaltijd “{}” verwijderen?",
    "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.": "Nog geen maaltijd opgeslagen – gebruik in het dagboek “Opslaan als maaltijd”.",
    "Mahlzeiten suchen…": "Maaltijden zoeken…",
    "wie Summe der Zutaten": "zoals de som van de ingrediënten",
    "Gesamt: {} g": "Totaal: {} g",
    "pro Portion ({} g)": "per portie ({} g)",
    "Rezept bearbeiten": "Recept bewerken",
    "Neues Rezept": "Nieuw recept",
    "Gewicht fertig (g, optional)": "Gewicht na bereiding (g, optioneel)",
    "Zutaten": "Ingrediënten",
    "Noch keine Zutaten.": "Nog geen ingrediënten.",
    "Zutat hinzufügen": "Ingrediënt toevoegen",
    "+ Zutat": "+ Ingrediënt",
    "Ungültige Einheit": "Ongeldige eenheid",
    "Speichern und jetzt lesen": "Opslaan en nu uitlezen",
    "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen.": "De waarde van de sensor is ouder dan 30 dagen en is niet overgenomen.",
    "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).": "De waarde ligt buiten 20 tot 500 kg (controleer de eenheid).",
    "Der Sensor liefert gerade keinen Zahlenwert.": "De sensor levert nu geen getalswaarde.",
    "Home Assistant nicht erreichbar.": "Home Assistant is niet bereikbaar.",
    "Zuerst einen Sensor wählen.": "Kies eerst een sensor.",
    "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.": "Nieuwe waarde gezien, wordt overgenomen zodra deze stabiel is.",
    "Der aktuelle Wert ist schon übernommen.": "De huidige waarde is al overgenomen.",
    "Übernommen: {} am {}": "Overgenomen: {} op {}",
    "Zuletzt übernommen: {} am {}": "Laatst overgenomen: {} op {}",
    "z. B. sensor.waage_gewicht": "bijv. sensor.weegschaal_gewicht",
    "Automatisch (Einheit des Sensors)": "Automatisch (eenheid van de sensor)",
    "Einheit des Sensors": "Eenheid van de sensor",
    "Sensor": "Sensor",
    "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg.": "Sensor uit Home Assistant met het lichaamsgewicht, bijv. van een slimme weegschaal. De add-on kijkt elke minuut; een nieuwe waarde wordt overgenomen zodra die een minuut lang niet meer verandert en wordt opgeslagen voor de dag van de meting (een waarde van dezelfde dag wordt vervangen). Zinvol zijn waarden van 20 tot 500 kg.",
    "Waage": "Weegschaal",
    "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung).": "Lichaamsgewicht automatisch overnemen van een Home Assistant-sensor, bijv. van een slimme weegschaal (met omrekening van eenheden).",
    "Waage (Sensor)": "Weegschaal (sensor)",
    "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).": "Oranje ingrediënten ontbraken in je voedingsmiddelen en zijn aangevuld uit online databases (richtwaarden, controleer ze).",
    "aus Open Food Facts": "uit Open Food Facts",
    "aus USDA": "uit USDA",
    "Pro Portion ({} g): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Per portie ({} g): {} kcal · koolh. {} g · vet {} g · eiwit {} g · {} porties",
    "Rezept „{}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.": "Recept “{}” verwijderen? Het bijbehorende voedingsmiddel wordt ook verwijderd, reeds ingevoerde maaltijden blijven behouden.",
    "Noch kein Rezept angelegt.": "Nog geen recept aangemaakt.",
    "Rezepte suchen…": "Recepten zoeken…",
    "+ Neues Rezept": "+ Nieuw recept",
    "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel.": "Elk recept verschijnt ook bij Voedingsmiddelen (per 100 g, met “1 portie”) en kan overal worden ingevoerd. Wijzigingen in het recept werken dat voedingsmiddel bij.",
    "1 Portion": "1 portie",
    "Rezept nicht gefunden": "Recept niet gevonden",
    "Mindestens eine Zutat nötig.": "Minstens één ingrediënt nodig.",
    "Portionen müssen größer als 0 sein.": "Porties moeten groter zijn dan 0.",
    "Jede Zutat braucht eine Menge in Gramm.": "Elk ingrediënt heeft een hoeveelheid in gram nodig.",
    "Gewicht nach dem Kochen muss größer als 0 sein.": "Gewicht na het koken moet groter zijn dan 0.",
    "z. B. 78,5": "bijv. 78,5",
    "Gewicht eintragen": "Gewicht invoeren",
    "Datum": "Datum",
    "Gewicht ({})": "Gewicht ({})",
    "Zielgewicht ({})": "Streefgewicht ({})",
    "Gewünschte Änderung ({} pro Woche)": "Gewenste verandering ({} per week)",
    "Noch keine Gewichtswerte.": "Nog geen gewichtswaarden.",
    "Aktuell": "Actueel",
    "Trend": "Trend",
    "Veränderung": "Verandering",
    "Ziel": "Doel",
    "Prognose Ziel": "Prognose doel",
    "30 Tage": "30 dagen",
    "90 Tage": "90 dagen",
    "1 Jahr": "1 jaar",
    "7 Tage": "7 dagen",
    "180 Tage": "180 dagen",
    "14 Tage": "14 dagen",
    "Kalorien und Gewicht": "Calorieën en gewicht",
    "Kalorien (linke Achse)": "Calorieën (linkeras)",
    "Gewicht und Trend (rechte Achse)": "Gewicht en trend (rechteras)",
    "Noch keine Gewichtswerte im Zeitraum.": "Nog geen gewichtswaarden in deze periode.",
    "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).": "Dunne lijn en punten: metingen. Dikke lijn: afgevlakte trend (dagelijkse schommelingen weggefilterd).",
    "Trend aktuell {}{} {}/Woche.": "Trend nu {}{} {}/week.",
    "Mehr anzeigen": "Meer tonen",
    "Alle {}": "Alle {}",
    "Weniger": "Minder",
    "Taille": "Taille",
    "Brust": "Borst",
    "Hüfte": "Heupen",
    "Oberarm": "Bovenarm",
    "Oberschenkel": "Bovenbeen",
    "Körperfett %": "Lichaamsvet %",
    "Bild konnte nicht gelesen werden": "Afbeelding kon niet worden gelezen",
    "Eigene Messung, z. B. Wade": "Eigen meting, bijv. kuit",
    "Körpermaße": "Lichaamsmaten",
    "Werte, die Du nicht messen willst, einfach leer lassen.": "Laat waarden die je niet wilt meten gewoon leeg.",
    "Weitere Messung": "Nog een meting",
    "Wert": "Waarde",
    "Bitte mindestens einen Wert eintragen.": "Voer minstens één waarde in.",
    "Noch keine Werte für diese Messung.": "Nog geen waarden voor deze meting.",
    "Notiz (optional), z. B. Vorderansicht": "Notitie (optioneel), bijv. vooraanzicht",
    "Fortschrittsfotos": "Voortgangsfoto’s",
    "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons.": "De foto’s blijven in de add-on op je Home Assistant. Ze zitten niet in de JSON-export en niet in de automatische back-ups, maar wel in de Home Assistant-back-up van de add-on.",
    "Vergleichen": "Vergelijken",
    "Foto hinzufügen": "Foto toevoegen",
    "Foto löschen": "Foto verwijderen",
    "Foto löschen?": "Foto verwijderen?",
    "Noch keine Fotos.": "Nog geen foto’s.",
    "Fotos vergleichen": "Foto’s vergelijken",
    "Ungültiger Wert für {}": "Ongeldige waarde voor {}",
    "Kein gültiges Bild": "Geen geldige afbeelding",
    "Bild leer oder zu groß (max. 8 MB)": "Afbeelding leeg of te groot (max. 8 MB)",
    "Foto nicht gefunden": "Foto niet gevonden",
    "Abnehmen": "Afvallen",
    "Halten": "Behouden",
    "Zunehmen": "Aankomen",
    "Kalorienbilanz": "Caloriebalans",
    "Noch keine Einträge im Zeitraum.": "Nog geen items in deze periode.",
    "Ø Aufnahme": "Ø inname",
    "Gewichtstrend": "Gewichtstrend",
    "Überschuss / Tag": "Overschot / dag",
    "Defizit / Tag": "Tekort / dag",
    "Bilanz / Tag": "Balans / dag",
    "Geschätzter Verbrauch": "Geschatte verbranding",
    "Aus {} Gewichtswerten und {} von {} erfassten Tagen (1 {} ≈ {} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.": "Gebaseerd op {} gewichtswaarden en {} van {} geregistreerde dagen (1 {} ≈ {} kcal). Hoe completer dagboek en wegen, hoe nauwkeuriger.",
    "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum.": "Voor de berekening zijn minstens twee gewichtswaarden met een week ertussen in de gekozen periode nodig.",
    "Du liegst im Plan.": "Je ligt op schema.",
    "Der Trend liegt über dem Ziel.": "De trend ligt boven het doel.",
    "Der Trend liegt unter dem Ziel.": "De trend ligt onder het doel.",
    "Ziel: {}": "Doel: {}",
    "(Gewicht halten)": "(gewicht behouden)",
    "({} {}/Woche)": "({} {}/week)",
    "· Trend aktuell {} {}/Woche. {}": "· trend nu {} {}/week. {}",
    "Für dieses Ziel passen ca. {} kcal am Tag (Dein Ziel: {}).": "Voor dit doel passen ca. {} kcal per dag (jouw doel: {}).",
    "Als Tagesziel übernehmen": "Als dagdoel overnemen",
    "Ø Kalorien": "Ø calorieën",
    "Erfasste Tage": "Geregistreerde dagen",
    "Ø Eiweiß": "Ø eiwit",
    "Ø Kohlenhydrate": "Ø koolhydraten",
    "Ø Fett": "Ø vet",
    "Kalorien pro Tag": "Calorieën per dag",
    "Gestrichelt: Tagesziel je Wochentag": "Gestippeld: dagdoel per weekdag",
    "Gestrichelt: Tagesziel {} kcal": "Gestippeld: dagdoel {} kcal",
    "Nährwertverteilung (Ø)": "Verdeling voedingswaarden (Ø)",
    "Eiweiß {} %": "Eiwit {} %",
    "Kohlenhydrate {} %": "Koolhydraten {} %",
    "Fett {} %": "Vet {} %",
    "Weitere Nährwerte (Ø pro Tag)": "Meer voedingswaarden (Ø per dag)",
    "Ø pro Tag": "Ø per dag",
    "Eingetragen": "Ingevoerd",
    "Ziel erreicht": "Doel bereikt",
    "Bericht & Zeitraum-Vergleich": "Rapport & periodevergelijking",
    "7 Tage vs. davor": "7 dagen vs. daarvoor",
    "30 Tage vs. davor": "30 dagen vs. daarvoor",
    "Eiweißziel erreicht": "Eiwitdoel bereikt",
    "Kalorien im Ziel": "Calorieën binnen doel",
    "Gewichtsänderung": "Gewichtsverandering",
    "Differenz": "Verschil",
    "Bester Tag (A): {} · Schwächster Tag (A): {}": "Beste dag (A): {} · Zwakste dag (A): {}",
    "Tage": "Dagen",
    "{} Tage": "{} dagen",
    "{} / {} Tage": "{} / {} dagen",
    "{} Einträge, {} kcal": "{} items, {} kcal",
    "{} / 100 g": "{} / 100 g",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g": "{} kcal · koolh. {} g · vet {} g · eiwit {} g",
    "{} kcal (Ziel {})": "{} kcal (doel {})",
    "KH {} g · Fett {} g · Eiweiß {} g": "koolh. {} g · vet {} g · eiwit {} g",
    "zu {}": "naar {}",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g (pro 100 g)": "{} kcal · koolh. {} g · vet {} g · eiwit {} g (per 100 g)",
    "Ø": "Ø",
    "Zustand": "Status",
    "Kalender": "Agenda",
    "(am Starttag)": "(op de startdag)",
    "(am Endtag)": "(op de einddag)",
    "Täglich ab {} Uhr": "Dagelijks vanaf {} uur",
    "enthält nicht": "bevat niet",
    "· seit mind. {} Min.": "· al minstens {} min.",
    "· nur {}–{} Uhr": "· alleen {}–{} uur",
    "ODER": "OF",
    "UND": "EN",
    "Trigger pausieren": "Trigger pauzeren",
    "Pause beenden": "Pauze beëindigen",
    "Heute": "Vandaag",
    "3 Tage": "3 dagen",
    "1 Woche": "1 week",
    "Oder bis einschließlich": "Of tot en met",
    "Pausieren": "Pauzeren",
    "Zustand einer Entität (z. B. Person ist im Fitnessstudio)": "Status van een entiteit (bijv. persoon is in de sportschool)",
    "Kalendereintrag": "Agenda-afspraak",
    "Uhrzeit (täglich ab einer Zeit)": "Tijdstip (dagelijks vanaf een tijdstip)",
    "z. B. person.max": "bijv. person.max",
    "ist / enthält": "is / bevat",
    "ist NICHT / enthält NICHT": "is NIET / bevat NIET",
    "an jedem Tag des Termins": "op elke dag van de afspraak",
    "nur am Starttag (z. B. Donnerstag 22 Uhr)": "alleen op de startdag (bijv. donderdag 22 uur)",
    "nur am Endtag (z. B. Freitag 6 Uhr)": "alleen op de einddag (bijv. vrijdag 6 uur)",
    "Termin zählt": "Afspraak telt",
    "Entität": "Entiteit",
    "Bedingung": "Voorwaarde",
    "z. B. calendar.arbeit": "bijv. calendar.werk",
    "Titel enthält, z. B. Nachtschicht": "Titel bevat, bijv. nachtdienst",
    "Zustand, z. B. Fitnessstudio (Zonenname) oder on": "Status, bijv. sportschool (zonenaam) of on",
    "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist.": "Voert één keer per dag in zodra dit tijdstip is bereikt.",
    "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält.": "Geldt voor dagen met (resp. zonder) afspraak waarvan de titel deze tekst bevat.",
    "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).": "Geldt zodra de entiteit deze status heeft (resp. niet heeft).",
    "Auslöser": "Trigger-voorwaarde",
    "„{}“ nur an bestimmten Tagen anzeigen": "“{}” alleen op bepaalde dagen tonen",
    "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt.": "Dagen met items blijven altijd zichtbaar. Zonder regel wordt de maaltijd altijd getoond.",
    "Bitte eine Entität angeben.": "Geef een entiteit op.",
    "Gespeicherte Mahlzeiten": "Opgeslagen maaltijden",
    "Tagesziel wechseln": "Dagdoel wisselen",
    "Tagesziel „{}“": "Dagdoel “{}”",
    "Standardportion": "Standaardportie",
    "Tage im Voraus eintragen (nur Kalender)": "Dagen vooruit invoeren (alleen agenda)",
    "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht.": "0 = pas op de dag zelf. Met bijv. 7 wordt het item al voor de komende 7 dagen gepland zodra daar een passende afspraak staat.",
    "Zustand muss schon so lange anliegen (Minuten)": "Status moet al zo lang gelden (minuten)",
    "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist.": "0 = meteen. Bijv. 20: pas invoeren als de persoon al 20 minuten in de sportschool is.",
    "Nur zwischen (Uhrzeit, optional)": "Alleen tussen (tijdstip, optioneel)",
    "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00).": "Buiten dit tijdvenster voert de trigger niets in. Over middernacht kan (22:00 tot 06:00).",
    "Zu Mahlzeit im Tagebuch": "Naar maaltijd in het dagboek",
    "Bei Lebensmitteln optional mit Menge:": "Bij voedingsmiddelen optioneel met hoeveelheid:",
    "Alle Bedingungen müssen zutreffen (UND)": "Alle voorwaarden moeten kloppen (EN)",
    "Mindestens eine muss zutreffen (ODER)": "Minstens één moet kloppen (OF)",
    "Verknüpfung": "Koppeling",
    "Entität, z. B. person.anna": "Entiteit, bijv. person.anna",
    "Zustand bzw. Titel enthält (leer = an)": "Status resp. titel bevat (leeg = aan)",
    "Bedingung entfernen": "Voorwaarde verwijderen",
    "Trigger bearbeiten": "Trigger bewerken",
    "Neuer Trigger": "Nieuwe trigger",
    "+ Weitere Bedingung": "+ Nog een voorwaarde",
    "Dann": "Dan",
    "Bitte eine Uhrzeit angeben.": "Geef een tijdstip op.",
    "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen.": "Kies een voedingsmiddel, een maaltijd of een dagdoel.",
    "Weitere Bedingung: bitte eine Entität angeben.": "Nog een voorwaarde: geef een entiteit op.",
    "Komplett (alle Einträge mit Mahlzeiten)": "Volledig (alle items met maaltijden)",
    "Nur Tageskalorien und Makros (eine Summe pro Tag)": "Alleen dagcalorieën en macro’s (één totaal per dag)",
    "Neue Mahlzeit anlegen": "Nieuwe maaltijd maken",
    "Mahlzeiten zuordnen": "Maaltijden toewijzen",
    "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)": "Lege maaltijden op deze dagen verbergen (alleen het dagtotaal tonen)",
    "MyFitnessPal-Import": "MyFitnessPal-import",
    "Was importieren?": "Wat importeren?",
    "Gewicht übernehmen": "Gewicht overnemen",
    "Vorhandene Einträge an diesen Tagen ersetzen": "Bestaande items op deze dagen vervangen",
    "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Geïmporteerd: {} dagen, {} items, {} gewichtswaarden.",
    "Importieren": "Importeren",
    "Eiweiß {} % · Kohlenhydrate {} % · Fett {} %": "Eiwit {} % · Koolhydraten {} % · Vet {} %",
    "· Makros ergeben {} kcal": "· macro’s komen op {} kcal",
    "Tagesziele": "Dagdoelen",
    "Mein Ziel": "Mijn doel",
    "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet.": "Bepaalt wanneer een dag als “binnen doel” telt (afvallen: hooguit, aankomen: minstens, behouden: ±10 %) en hoe de statistieken je gewichtstrend beoordelen.",
    "Kalorien aus Makros berechnen": "Calorieën uit macro’s berekenen",
    "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g).": "Als eiwit, koolhydraten of vet veranderen, passen de calorieën zich aan (4/4/9 kcal per g).",
    "Kalorien (kcal)": "Calorieën (kcal)",
    "Kohlenhydrate (g)": "Koolhydraten (g)",
    "Gespeichert ✓": "Opgeslagen ✓",
    "Zusatzfunktionen": "Extra functies",
    "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen.": "Optionele functies, standaard uit. Als ze zijn ingeschakeld, verschijnen ze in het dagboek en hier in de instellingen.",
    "Tagesziele pro Wochentag": "Dagdoelen per weekdag",
    "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger.": "bijv. trainingsdagen met meer calorieën, rustdagen met minder.",
    "Wasser und Nahrungsergänzung": "Water en supplementen",
    "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.": "Snelle invoer voor water, cafeïne, creatine enz. met een eigen dagdoel.",
    "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter).": "Ingrediënten bundelen tot een recept, delen door het aantal porties en invoeren als een voedingsmiddel (eigen tabblad).",
    "Notizen": "Notities",
    "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten.": "Vrije tekst bij maaltijden en dagen (honger, training, stemming). Bestaande notities blijven behouden als je dit uitschakelt.",
    "Körpermaße und Fortschrittsfotos": "Lichaamsmaten en voortgangsfoto’s",
    "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht.": "Omtrekken (taille, borst, arm …) met verloop en foto’s met vergelijking op het tabblad Gewicht.",
    "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit).": "Vezels, suiker, zout en verzadigd vet bij voedingsmiddelen vastleggen en analyseren (Open Food Facts levert ze mee).",
    "Montag": "Maandag",
    "Dienstag": "Dinsdag",
    "Mittwoch": "Woensdag",
    "Donnerstag": "Donderdag",
    "Freitag": "Vrijdag",
    "Samstag": "Zaterdag",
    "Sonntag": "Zondag",
    "wie Standard": "zoals standaard",
    "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros.": "Lege calorieën = het standaard dagdoel hierboven geldt. Lege macro’s tonen “–”. Met “Calorieën uit macro’s berekenen” (hierboven) volgen de calorieën de macro’s.",
    "Tagesziel-Profile": "Dagdoelprofielen",
    "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel.": "bijv. “Training” en “Rustdag”. Een trigger (Instellingen → Triggers → “Dan: dagdoel wisselen”) zet de dag op een profiel, bijvoorbeeld als de persoon in de sportschool is. Het profiel gaat voor het weekdagdoel.",
    "Profil löschen": "Profiel verwijderen",
    "Profil „{}“ löschen? Trigger dafür werden ebenfalls gelöscht.": "Profiel “{}” verwijderen? Triggers hiervoor worden ook verwijderd.",
    "Noch keine Profile.": "Nog geen profielen.",
    "Neues Profil": "Nieuw profiel",
    "+ Profil": "+ Profiel",
    "Einheit": "Eenheid",
    "Schritt": "Stap",
    "„{}“ samt Verlauf löschen?": "“{}” inclusief verloop verwijderen?",
    "Neu, z. B. Magnesium": "Nieuw, bijv. magnesium",
    "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch.": "Per rij: naam, eenheid, dagdoel en stapgrootte van de +/− knoppen in het dagboek.",
    "Feste Mahlzeiten (Frühstück, Mittagessen, …)": "Vaste maaltijden (ontbijt, lunch, …)",
    "Uhrzeiten (08:47 …, 11:30 …)": "Tijdstippen (08:47 …, 11:30 …)",
    "Automatisch (Windows-Look bei HA-95/98-Theme)": "Automatisch (Windows-look bij HA 95/98-thema)",
    "Standard (HA-Theme)": "Standaard (HA-thema)",
    "Windows-Look": "Windows-look",
    "Darstellung": "Weergave",
    "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende.": "Bestaande items blijven behouden; items zonder tijdstip verschijnen in de tijdweergave aan het eind.",
    "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten": "Op dit apparaat bij het openen meteen de barcodescanner starten",
    "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.": "Voor een startschermwidget van de Companion-app: maak daar een snelkoppeling naar dit paneel, dan opent de camera meteen.",
    "Optik": "Uiterlijk",
    "Nach oben": "Omhoog",
    "Nach unten": "Omlaag",
    "Nur an bestimmten Tagen anzeigen": "Alleen op bepaalde dagen tonen",
    "Wieder einblenden": "Weer tonen",
    "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Verbergen (alleen nog zichtbaar op dagen met items)",
    "Ausblenden": "Verbergen",
    "{} – blende sie stattdessen mit ⊘ aus.": "{} – verberg haar in plaats daarvan met ⊘.",
    "Neue Mahlzeit, z. B. Nachtschicht": "Nieuwe maaltijd, bijv. nachtdienst",
    "nur an Tagen: {}": "alleen op dagen: {}",
    "Regel bearbeiten": "Regel bewerken",
    "Regel löschen": "Regel verwijderen",
    "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "Met ⚡ toon je een maaltijd alleen op dagen waarop je agenda bijvoorbeeld een bepaalde afspraak heeft. Met ⊘ verberg je haar permanent (ze blijft alleen zichtbaar op dagen met items); alleen een lege maaltijd kan worden verwijderd.",
    "Trigger": "Triggers",
    "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Voedingsmiddelen of maaltijden automatisch invoeren wanneer Home Assistant iets meldt (locatie, agenda, schakelaar …). Ook aan te maken via ⚡ bij voedingsmiddelen.",
    "Letzter Fehler ({}): {}": "Laatste fout ({}): {}",
    "Aktiv": "Actief",
    "pausiert bis {}": "gepauzeerd tot {}",
    "· {} Tage im Voraus": "· {} dagen vooruit",
    "· zuletzt {}": "· laatst {}",
    "Pausieren …": "Pauzeren …",
    "Jetzt testen (trägt heute ein)": "Nu testen (voert in voor vandaag)",
    "Eingetragen.": "Ingevoerd.",
    "Noch keine Trigger.": "Nog geen triggers.",
    "Prüfe …": "Controleren …",
    "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "Geen toegang tot Home Assistant (SUPERVISOR_TOKEN ontbreekt).",
    "Geprüft {}, nichts zu tun.": "{} gecontroleerd, niets te doen.",
    "Jetzt prüfen": "Nu controleren",
    "Version": "Versie",
    "Installiert: ": "Geïnstalleerd:",
    "Nach Updates suchen": "Controleren op updates",
    "Keine Verbindung zu GitHub.": "Geen verbinding met GitHub.",
    "Version {} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.": "Versie {} is beschikbaar. Ga in Home Assistant naar Instellingen → Add-ons, controleer op updates en werk bij.",
    "Du hast die aktuelle Version.": "Je hebt de nieuwste versie.",
    "+ Neuer Trigger": "+ Nieuwe trigger",
    "Trigger-Verlauf": "Triggergeschiedenis",
    "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.": "Wat triggers het laatst hebben ingevoerd. “Ongedaan maken” verwijdert de items weer; de trigger voert op die dag niet opnieuw in.",
    "Trigger gelöscht": "Trigger verwijderd",
    "(gelöscht)": "(verwijderd)",
    "Einträge nicht mehr vorhanden": "Items bestaan niet meer",
    "Rückgängig": "Ongedaan maken",
    "Erinnerung": "Herinnering",
    "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde.": "Melding via Home Assistant als er tot het gekozen tijdstip niets is ingevoerd.",
    "Erinnerung aktiv": "Herinnering actief",
    "Benachrichtigungsdienst": "Meldingsdienst",
    "Automatische Sicherung": "Automatische back-up",
    "Täglich eine JSON-Sicherung in {}, Aufbewahrung {} Tage (Add-on-Option „backup_keep_days“).": "Dagelijks een JSON-back-up in {}, bewaard gedurende {} dagen (add-on-optie “backup_keep_days”).",
    "Aus (Add-on-Option „auto_backup“).": "Uit (add-on-optie “auto_backup”).",
    "· {} KB": "· {} KB",
    "Wiederherstellen": "Herstellen",
    "Noch keine Sicherung.": "Nog geen back-up.",
    "Jetzt sichern": "Nu back-uppen",
    "Schnittstelle für Automationen": "Interface voor automatiseringen",
    "Aktiv. Deine Benutzer-ID: {}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.": "Actief. Jouw gebruikers-ID: {}. Voorbeelden van aanroepen (rest_command) staan in de documentatie van de add-on.",
    "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.": "Uit. Stel om in te schakelen in de add-on-opties een sleutel “api_key” in. Daarmee kunnen weegschaal, spraakassistent of automatiseringen items en gewicht sturen.",
    "Daten": "Gegevens",
    "Export/Import betrifft nur dein Benutzerkonto.": "Export/import betreft alleen je gebruikersaccount.",
    "Sicherung (JSON)": "Back-up (JSON)",
    "Tagebuch als CSV": "Dagboek als CSV",
    "Datei nicht lesbar:": "Bestand niet leesbaar:",
    "Sicherung einspielen": "Back-up terugzetten",
    "MyFitnessPal-CSV importieren": "MyFitnessPal-CSV importeren",
    "Keine gültige Sicherung:": "Geen geldige back-up:",
    "Sicherung wiederherstellen": "Back-up herstellen",
    "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt.": "Alle huidige gegevens van je account worden vervangen door de back-up.",
    "Jetzt": "Nu",
    "Sicherung": "Back-up",
    "Gewichtswerte": "Gewichtswaarden",
    "Zeitraum": "Periode",
    "Wiederhergestellt.": "Hersteld.",
    "Ersetzen": "Vervangen",
    "Sprache und Einheiten": "Taal en eenheden",
    "Sprache": "Taal",
    "Einheiten": "Eenheden",
    "Automatisch (Browser)": "Automatisch (browser)",
    "Metrisch (kg, cm)": "Metrisch (kg, cm)",
    "Imperial (lb, in)": "Imperiaal (lb, in)",
    "Teilen …": "Delen …",
    "„{}“ teilen": "“{}” delen",
    "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Portie als veelvoud van het item (1 = evenveel). Het item verschijnt op dezelfde dag in het dagboek van de anderen.",
    "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Hoeveelheid voor elke persoon in gram. Het item verschijnt op dezelfde dag in het dagboek van de anderen.",
    "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein.": "Er doet nog niemand anders mee aan het huishouden. Elke gebruiker schakelt hiervoor onder Instellingen → Extra functies “Huishouden” in.",
    "Bitte mindestens eine Person wählen.": "Kies minstens één persoon.",
    "Eingetragen bei {} Person(en).": "Ingevoerd bij {} persoon/personen.",
    "Haushalt": "Huishouden",
    "Einträge mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Items delen met andere gebruikers, ieder met een eigen portie (bijv. één gerecht voor het gezin). Beide kanten moeten de functie inschakelen.",
    "Benutzerverwaltung": "Gebruikersbeheer",
    "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer).": "Alleen zichtbaar voor beheerders (add-on-optie “admin_users”; leeg = de eerste gebruiker).",
    "Benutzer": "Gebruiker",
    "Zuletzt": "Laatst",
    "Export": "Export",
    "Admin": "Beheerder",
    "Alle Daten von „{}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:": "Alle gegevens van “{}” onherroepelijk verwijderen? Voer ter bevestiging de naam in:",
    "Nur für Administratoren": "Alleen voor beheerders",
    "Das eigene Konto kann hier nicht gelöscht werden": "Het eigen account kan hier niet worden verwijderd",
    "Zur Bestätigung den Namen des Benutzers eingeben": "Voer ter bevestiging de naam van de gebruiker in",
    "Haushaltsfunktion ist nicht aktiviert": "Huishoudfunctie is niet geactiveerd",
    "Dieser Benutzer nimmt nicht am Haushalt teil": "Deze gebruiker doet niet mee aan het huishouden",
    "Weitere Importe": "Meer imports",
    "Weitere Importe …": "Meer imports …",
    "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.": "De import betreft alleen je gebruikersaccount. Bestaande gegevens blijven behouden, tenzij je uitdrukkelijk “vervangen” kiest.",
    "CSV aus einer anderen App": "CSV uit een andere app",
    "Datei wählen": "Bestand kiezen",
    "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.": "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) en vergelijkbare tabellen. De kolommen worden herkend en kunnen worden gecorrigeerd.",
    "Apple Health": "Apple Health",
    "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.": "export.zip of export.xml uit de Gezondheid-app (profiel → exporteer gezondheidsgegevens). Het bestand wordt rechtstreeks in de browser gelezen; alleen de dagwaarden worden geüpload.",
    "Messart": "Soort meting",
    "Natrium": "Natrium",
    "Bitte die Spalte mit dem Datum zuordnen.": "Wijs de kolom met de datum toe.",
    "{} Einträge, {} Gewichtswerte aus {} Zeilen.": "{} items, {} gewichtswaarden uit {} rijen.",
    "CSV importieren": "CSV importeren",
    "Erkannt: {}": "Herkend: {}",
    "Zuordnung der Spalten": "Toewijzing van de kolommen",
    "– nicht vorhanden –": "– niet aanwezig –",
    "Einheit der Gewichtsspalte": "Eenheid van de gewichtskolom",
    "Stone": "Stone",
    "Lese Datei …": "Bestand lezen …",
    "Lese Datei … {} %": "Bestand lezen … {} %",
    "Keine gültige ZIP-Datei.": "Geen geldig ZIP-bestand.",
    "Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.": "Zeer groot ZIP-bestand (ZIP64): pak het uit en kies export.xml.",
    "In der ZIP-Datei wurde keine export.xml gefunden.": "Er is geen export.xml in het ZIP-bestand gevonden.",
    "Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.": "Deze browser kan het ZIP-bestand niet uitpakken. Pak het uit en kies export.xml.",
    "{} Gewichtswerte, {} Tage mit Ernährungsdaten gefunden.": "{} gewichtswaarden, {} dagen met voedingsgegevens gevonden.",
    "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)": "Gewicht overnemen (één waarde per dag, bestaande waarden worden overschreven)",
    "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)": "Dagtotalen van de voeding overnemen (één snelle invoer per dag, alleen zinvol als je je maaltijden verder niet hier bijhoudt)",
    "Importiert: {} Tage, {} Gewichtswerte.": "Geïmporteerd: {} dagen, {} gewichtswaarden.",
    "Die Datei enthält keine Datenzeilen.": "Het bestand bevat geen gegevensrijen.",
    "Export für Berater und Trainer": "Export voor diëtist en trainer",
    "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum.": "Een rapport om af te drukken of als PDF op te slaan (kies in het afdrukvenster “Opslaan als PDF”) en een tabel met de dagwaarden. Bevat alleen de gekozen periode.",
    "Von": "Van",
    "Bis": "Tot",
    "Einzelne Einträge im Bericht auflisten": "Afzonderlijke items in het rapport opsommen",
    "Bericht öffnen (Drucken / PDF)": "Rapport openen (afdrukken / PDF)",
    "Tagesübersicht (CSV)": "Dagoverzicht (CSV)",
    "Makro-Verlauf": "Macroverloop",
    "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage.": "Balken: gram per dag. Gestippeld: dagdoel. Doorgetrokken lijn: Ø van de laatste 7 dagen.",
    "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen.": "Balken: gram per dag. Doorgetrokken lijn: Ø van de laatste 7 dagen. Een doel voor deze macro stel je in onder Instellingen → Dagdoelen.",
    "{} g (Ziel {} g)": "{} g (doel {} g)",
    "Ø 7 Tage {} g": "Ø 7 dagen {} g",
    "nicht erfasst": "niet geregistreerd",
    "Online suchen & vergleichen": "Online zoeken & vergelijken",
    "Name oder Barcode": "Naam of barcode",
    "Quelle": "Bron",
    "KH": "Koolh.",
    "Fett": "Vet",
    "Abweichung": "Afwijking",
    "Abweichung der kcal von dem Wert im Formular": "Afwijking van de kcal ten opzichte van de waarde in het formulier",
    "Übernehmen": "Overnemen",
    "Mittelwert der gewählten übernehmen": "Gemiddelde van de geselecteerde overnemen",
    "Suche …": "Zoeken …",
    "Alle Werte pro 100 g.": "Alle waarden per 100 g.",
    "Die Quellen weichen bei kcal um bis zu {} % voneinander ab – bitte prüfen.": "De bronnen wijken bij kcal tot {} % van elkaar af – controleer ze.",
    "nicht erreichbar": "niet bereikbaar",
    "Weitere Datenquellen": "Meer gegevensbronnen",
    "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet).": "Online zoeken in Open Food Facts en USDA met vergelijking van de waarden onderling en met je eigen waarden (zoektermen worden naar deze diensten gestuurd).",
    "Weitere Datenquellen sind nicht aktiviert": "Meer gegevensbronnen zijn niet geactiveerd",
    "Suchbegriff oder Barcode angeben": "Geef een zoekterm of barcode op",
    "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)": "USDA-limiet bereikt (stel je eigen api.data.gov-sleutel in de add-on-opties in)",
    "Open Food Facts nicht erreichbar": "Open Food Facts niet bereikbaar",
    "Mahlzeit enthält noch Einträge": "Maaltijd bevat nog items",
    "Mahlzeit ist leer": "Maaltijd is leeg",
    "Mahlzeit braucht mindestens eine Komponente": "Maaltijd heeft minstens één onderdeel nodig",
    "Keine MyDietAssistant-Sicherung": "Geen MyDietAssistant-back-up",
    "Das sieht nicht nach einem MyFitnessPal-Export aus.": "Dit lijkt niet op een MyFitnessPal-export.",
    "Home Assistant nicht erreichbar": "Home Assistant niet bereikbaar",
    "Uhrzeit (HH:MM) erforderlich": "Tijdstip (HH:MM) vereist",
    "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben": "geef precies één van maaltijd/voedingsmiddel/doelprofiel op",
    "weitere Bedingung: Art und Entität erforderlich": "nog een voorwaarde: soort en entiteit vereist",
    "Name und Kalorien erforderlich": "Naam en calorieën vereist",
    "ungültiger Zeitraum": "ongeldige periode",
    "Quell- und Zieltag sind gleich": "Bron- en doeldag zijn gelijk",
    "Sicherung nicht gefunden": "Back-up niet gevonden",
    "Externe API ist aus: Option api_key im Add-on setzen": "Externe API is uit: stel de optie api_key in de add-on in",
    "falscher Schlüssel": "verkeerde sleutel",
    "Lebensmittel „{}“ nicht gefunden": "Voedingsmiddel “{}” niet gevonden",
    "food oder name angeben": "geef food of name op",
    "kg außerhalb des gültigen Bereichs": "kg buiten het geldige bereik",
    "Uhrzeit fehlt": "tijdstip ontbreekt",
    "Benachrichtigungsdienst wie notify.mobile_app_handy angeben": "Geef een meldingsdienst op zoals notify.mobile_app_telefoon",
    "not found": "not found",
    "Aktivität": "Activiteit",
    "Aktivität eintragen": "Activiteit invoeren",
    "Schritte": "Stappen",
    "Verbrannt": "Verbrand",
    "Zum Tagesziel": "Naar dagdoel",
    "aus Schritten geschätzt": "geschat uit stappen",
    "Eintragen": "Invoeren",
    "Aus Home Assistant lesen": "Uit Home Assistant lezen",
    "Handeingabe verwerfen": "Handmatige invoer verwerpen",
    "Dein Tagesziel (+{} kcal Aktivität)": "Jouw dagdoel (+{} kcal activiteit)",
    "Tagesziel ({}) (+{} kcal Aktivität)": "Dagdoel ({}) (+{} kcal activiteit)",
    "(+{} kcal Aktivität)": "(+{} kcal activiteit)",
    "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben.": "Handmatig ingevoerde waarden worden voor deze dag niet meer door de sensoren overschreven.",
    "Verbrannte Kalorien (kcal)": "Verbrande calorieën (kcal)",
    "leer = aus Schritten schätzen": "leeg = schatten uit stappen",
    "{} % der verbrannten Kalorien": "{} % van de verbrande calorieën",
    "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen.": "Sensoren uit Home Assistant die overdag oplopen en om middernacht op 0 springen (een teller die alleen maar stijgt, kun je met de helper “Verbruiksmeter” dagelijks maken). De add-on leest ze elke vijf minuten. Zonder calorie-sensor worden calorieën geschat uit stappen, lichaamsgewicht en de factor hieronder; waarden kunnen ook handmatig worden ingevoerd.",
    "Sensor für Schritte": "Sensor voor stappen",
    "Sensor für aktive Kalorien (kcal)": "Sensor voor actieve calorieën (kcal)",
    "Anteil, der das Tagesziel erhöht (%)": "Aandeel dat het dagdoel verhoogt (%)",
    "kcal je Schritt und kg Körpergewicht": "kcal per stap en kg lichaamsgewicht",
    "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind.": "Veel apps rekenen maar een deel van de verbrande calorieën mee (50 % is een voorzichtige waarde), omdat activiteitswaarden vaak te hoog worden geschat.",
    "z. B. sensor.handy_schritte": "bijv. sensor.telefoon_stappen",
    "z. B. sensor.handy_aktive_kalorien": "bijv. sensor.telefoon_actieve_calorieën",
    "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages.": "Stappen en verbrande calorieën (uit Home Assistant-sensoren of handmatig) verhogen het caloriedoel van de betreffende dag.",
    "Mahlzeiten-Zeitplan": "Maaltijdschema",
    "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung.": "Een tijdvenster per maaltijd: het dagboek toont welke maaltijd nu aan de beurt is en herinnert je desgewenst met een melding.",
    "Jetzt: {}": "Nu: {}",
    "({} Uhr)": "({} uur)",
    "Als Nächstes: {} ab {} Uhr": "Hierna: {} vanaf {} uur",
    "schon eingetragen": "al ingevoerd",
    "+ Hinzufügen": "+ Toevoegen",
    "Von (leer = Standardfenster)": "Van (leeg = standaardvenster)",
    "Bis (leer = Standardfenster)": "Tot (leeg = standaardvenster)",
    "Standardfenster": "Standaardvenster",
    "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.": "Tijdvenster: van–tot per maaltijd. Als je het leeg laat, geldt een standaardvenster (ontbijt, lunch en avondeten); snacks hebben er geen. Vensters over middernacht zijn mogelijk.",
    "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist": "Melden als een maaltijd aan de beurt is en nog leeg is",
    "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten.": "Gebruikt de meldingsdienst uit “Herinnering” hieronder.",
    "Zwischenspeicher der Online-Suche": "Cache van het online zoeken",
    "Zwischenspeicher leeren": "Cache leegmaken",
    "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch.": "Opvragen bij Open Food Facts en USDA onthoudt de add-on lokaal (barcodes 60 dagen, zoektermen 14 dagen). Herhaalde zoekopdrachten gaan zo niet meer het internet op. Er worden alleen productgegevens opgeslagen, niets over je dagboek.",
    "{} gespeicherte Abfragen ({} KB)": "{} opgeslagen opvragingen ({} KB)",
    "Barcode scannen": "Barcode scannen",
    "Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.": "De barcodelezer kon niet worden geladen. Typ het nummer in.",
    "Mehr laden": "Meer laden",
    "Tabelle importieren …": "Tabel importeren …",
    "Werte online prüfen": "Waarden online controleren",
    "Prüfen": "Controleren",
    "Anhalten": "Stoppen",
    "Ignorieren": "Negeren",
    "Prüfe {} von {} …": "Controleren: {} van {} …",
    "Nur Lebensmittel mit Barcode ({} von {})": "Alleen voedingsmiddelen met barcode ({} van {})",
    "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)": "Ook USDA bevragen (strikte aanvraaglimiet zonder eigen sleutel)",
    "Online-Abfrage nicht möglich: {}": "Online opvragen niet mogelijk: {}",
    "Dein Wert: {} kcal · KH {} · Fett {} · Eiweiß {}": "Jouw waarde: {} kcal · koolh. {} · vet {} · eiwit {}",
    "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst.": "Vergelijkt je voedingsmiddelen met Open Food Facts (op barcode, anders op naam) en toont afwijkingen in calorieën en macro’s. Er wordt niets gewijzigd voordat je “Overnemen” kiest. Opvragingen worden lokaal in de cache bewaard; daarbij gaan barcodes resp. namen naar de dienst.",
    "Lebensmittel-Tabelle importieren": "Voedingsmiddelentabel importeren",
    "Lebensmittel-Tabelle": "Voedingsmiddelentabel",
    "Energie (kJ)": "Energie (kJ)",
    "Bitte die Spalten für Name und Kalorien zuordnen.": "Wijs de kolommen voor naam en calorieën toe.",
    "{} Lebensmittel erkannt ({} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.": "{} voedingsmiddelen herkend ({} rijen zonder naam of calorieën worden overgeslagen). Waarden gelden per 100 g.",
    "Kategorie für Lebensmittel ohne Kategorie in der Datei": "Categorie voor de geïmporteerde voedingsmiddelen",
    "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Bestaande voedingsmiddelen met dezelfde naam en hetzelfde merk blijven ongewijzigd.",
    "Importiert: {} neu, {} schon vorhanden, {} übersprungen.": "Geïmporteerd: {} nieuw, {} al aanwezig, {} overgeslagen.",
    "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.": "Een voedingswaardetabel (bijvoorbeeld BLS, een Open Food Facts-export of je eigen lijst) als CSV- of Excel-bestand: voedingsmiddelen met waarden per 100 g worden aan je bibliotheek toegevoegd.",
    "Mit dem Haushalt teilen": "Met het huishouden delen",
    "Teilen": "Delen",
    "{} kopiert, {} übersprungen.": "{} gekopieerd, {} overgeslagen.",
    "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen.": "De gekozen personen krijgen een eigen kopie in hun bibliotheek. Items met dezelfde naam bij hen blijven ongewijzigd, latere wijzigingen worden niet gesynchroniseerd.",
    "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Items, voedingsmiddelen en maaltijden delen met andere gebruikers, ieder met een eigen portie (bijv. één gerecht voor het gezin). Beide kanten moeten de functie inschakelen.",
    "Lebensmittelmengen": "Hoeveelheden voedingsmiddelen",
    "Gramm": "Gram",
    "Unzen (oz)": "Ounces (oz)",
    "Menge (oz)": "Hoeveelheid (oz)",
    "Portion (oz)": "Portie (oz)",
    "Gewicht fertig (oz, optional)": "Gewicht na bereiding (oz, optioneel)",
    "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Hoeveelheid voor elke persoon in ounces. Het item verschijnt op dezelfde dag in het dagboek van de anderen.",
    "Gesamt: {}": "Totaal: {}",
    "pro Portion ({})": "per portie ({})",
    "Pro Portion ({}): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Per portie ({}): {} kcal · koolh. {} g · vet {} g · eiwit {} g · {} porties",
    "Gemeinsame Haushaltsbibliothek": "Gedeelde huishoudbibliotheek",
    "Für den Haushalt freigegeben": "Vrijgegeven voor het huishouden",
    "geteilt": "gedeeld",
    "von {}": "van {}",
    "Gehört {}. Änderungen gelten für alle im Haushalt.": "Hoort bij {}. Wijzigingen gelden voor iedereen in het huishouden.",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)": "Aanbieden in de gedeelde huishoudbibliotheek (anderen mogen het gebruiken en wijzigen)",
    "Aus Mealie …": "Uit Mealie …",
    "Rezept aus Mealie": "Recept uit Mealie",
    "In Mealie suchen…": "Zoeken in Mealie…",
    "Weitere laden": "Meer laden",
    "{} Portionen": "{} porties",
    "Mealie": "Mealie",
    "Adresse": "Adres",
    "API-Token": "API-token",
    "Gespeichert (leer lassen = unverändert)": "Opgeslagen (leeg laten = ongewijzigd)",
    "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert.": "Het recept wordt van je Mealie-server gelezen en de ingrediënten worden aan je voedingsmiddelen gekoppeld; jij controleert alles voordat het wordt opgeslagen. In Mealie wordt niets gewijzigd.",
    "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren.": "Recepten overnemen van een Mealie-server. Geef het adres van de server (thuisnetwerk of als add-on) en een API-token uit Mealie (profiel → API-tokens). De add-on leest alleen recepten en wijzigt niets in Mealie. Het token blijft in de add-on opgeslagen en komt niet in de export. Maak het adres leeg om het te verwijderen.",
    "Von Webseite …": "Van webpagina …",
    "Rezept von Webseite": "Recept van webpagina",
    "Lade …": "Laden …",
    "Adresse der Rezeptseite": "Adres van de receptpagina",
    "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "De pagina wordt door de add-on opgehaald en doorzocht op receptgegevens (ingrediënten, porties, bereiding). De ingrediënten worden aan je voedingsmiddelen gekoppeld; jij controleert alles voordat het wordt opgeslagen.",
    "Zubereitung": "Bereiding",
    "Zubereitung, ein Schritt pro Zeile": "Bereiding, één stap per regel",
    "Angabe der Webseite: {} kcal pro Portion": "Opgave van de webpagina: {} kcal per portie",
    "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "1 ingrediënt niet gekoppeld (rood): kies met ⇄ een voedingsmiddel, anders telt het mee met 0 kcal. Vul ontbrekende hoeveelheden aan.",
    "{} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "{} ingrediënten niet gekoppeld (rood): kies met ⇄ een voedingsmiddel, anders tellen ze mee met 0 kcal. Vul ontbrekende hoeveelheden aan.",
    "Bitte eine Adresse mit http:// oder https:// angeben.": "Geef een adres op dat met http:// of https:// begint.",
    "Die Adresse wurde nicht gefunden.": "Het adres is niet gevonden.",
    "Adressen im lokalen Netz sind nicht erlaubt.": "Adressen op het lokale netwerk zijn niet toegestaan.",
    "Die Seite ist zu groß.": "De pagina is te groot.",
    "Zu viele Weiterleitungen.": "Te veel doorverwijzingen.",
    "Die Seite konnte nicht geladen werden.": "De pagina kon niet worden geladen.",
    "Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).": "Op deze pagina is geen recept gevonden (gestructureerde receptgegevens ontbreken).",
    "Das Rezept enthält keine Zutaten.": "Het recept bevat geen ingrediënten.",
    "Rezepte sind nicht aktiviert": "Recepten zijn niet geactiveerd",
    "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf": "Haalt stappen en calorieën van de laatste 30 dagen op uit de Home Assistant-geschiedenis",
    "Verlauf nachladen": "Geschiedenis ophalen",
    "Verlauf nachgeladen: {} Tage.": "Geschiedenis opgehaald: {} dagen.",
    "Zeitraum: 1 bis 365 Tage": "Periode: 1 tot 365 dagen",
    "Zuerst einen Sensor für Schritte oder Kalorien wählen": "Kies eerst een sensor voor stappen of calorieën",
    "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)": "Home Assistant heeft de geschiedenis niet geleverd (recorder actief?)",
    "Ungültige Entität": "Ongeldige entiteit",
    "Wert außerhalb des Bereichs": "Waarde buiten het bereik",
    "Nur im Home-Assistant-Add-on möglich": "Alleen mogelijk in de Home Assistant-add-on",
    "Leere Datei": "Leeg bestand",
    "Die Datei konnte nicht gelesen werden.": "Het bestand kon niet worden gelezen.",
    "Die Excel-Datei enthält kein Tabellenblatt.": "Het Excel-bestand bevat geen werkblad.",
    "Zu viele Zeilen (höchstens 50 000)": "Te veel rijen (maximaal 50.000)",
    "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Wijs kolommen toe voor naam en calorieën (kcal of kJ)",
    "Mahlzeiten-Vorschläge": "Maaltijdsuggesties",
    "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben).": "Knop in het dagboek: stelt opgeslagen maaltijden en combinaties uit je geschiedenis voor die passen bij de resterende calorieën en macro’s (hoeveelheden worden aangepast, vaste verpakkingen blijven).",
    "Mahlzeit vorschlagen": "Maaltijd voorstellen",
    "Rest des Tages": "Rest van de dag",
    "Anteil für diese Mahlzeit": "Aandeel voor deze maaltijd",
    "Ziel für diese Mahlzeit: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Doel voor deze maaltijd: {} kcal · koolh. {} g · vet {} g · eiwit {} g",
    "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.": "Je dagdoel is al bereikt – er valt niets aan te vullen.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf.": "Nog geen suggesties: sla maaltijden op in het dagboek via “Opslaan / kopiëren” of eet combinaties minstens twee keer, dan verschijnen ze hier.",
    "Weitere Vorschläge": "Meer suggesties",
    "Beigabe": "Toevoeging",
    "aus dem Verlauf ({}×)": "uit de geschiedenis ({}×)",
    "Gespeichert": "Opgeslagen",
    "Abweichung vom Ziel: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Afwijking van het doel: {} kcal · koolh. {} g · vet {} g · eiwit {} g",
    "Danach am Tag noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Daarna nog open voor de dag: {} kcal · koolh. {} g · vet {} g · eiwit {} g",
    "Anpassen": "Aanpassen",
    "Fertig": "Klaar",
    "Prioritäten und Beigaben": "Prioriteiten en toevoegingen",
    "Trainingstag": "Trainingsdag",
    "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen.": "Kies de shake en het doel onder “Prioriteiten en toevoegingen”, dan kan ik de hoeveelheden uitrekenen.",
    "Der Shake ist für heute schon eingetragen.": "De shake is voor vandaag al ingevoerd.",
    "Shake": "Shake",
    "Ziel für den Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Doel voor de shake: {} kcal · koolh. {} g · vet {} g · eiwit {} g",
    "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel.": "Voor de shake kan geen suggestie worden berekend: stel in de instellingen minstens één doel in.",
    "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig.": "Hiermee haal je je dagdoel – er blijft niets over voor een avondeten.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“.": "Nog geen suggesties: sla maaltijden op in het dagboek via “Opslaan / Kopiëren”.",
    "Noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Nog open: {} kcal · koolh. {} g · vet {} g · eiwit {} g",
    "Offen nach dem Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Open na de shake: {} kcal · koolh. {} g · vet {} g · eiwit {} g",
    "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein.": "Je shake na de training: de app rekent de hoeveelheden uit zodat het doel wordt gehaald en stelt daarna avondeten voor de rest van de dag voor. De shake moet als maaltijd zijn opgeslagen.",
    "– kein Shake –": "– geen shake –",
    "Was der Shake liefern soll (leer = egal)": "Wat de shake moet leveren (leeg = maakt niet uit)",
    "Shake eintragen in": "Shake invoeren bij",
    "erste Mahlzeit": "eerste maaltijd",
    "Abendessen eintragen in": "Avondeten invoeren bij",
    "erste freie Mahlzeit": "eerste vrije maaltijd",
    "Trigger tragen den Shake mit den berechneten Mengen ein": "Triggers voeren de shake in met de berekende hoeveelheden",
    "Vorschläge einstellen": "Suggesties instellen",
    "Wichtigkeit": "Belang",
    "egal": "maakt niet uit",
    "normal": "normaal",
    "wichtig": "belangrijk",
    "sehr wichtig": "heel belangrijk",
    "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor.": "Hoe belangrijker een waarde, hoe nauwkeuriger de suggestie die moet halen. Waarden zonder doel blijven buiten beschouwing.",
    "Kalorienziel nie überschreiten": "Caloriedoel nooit overschrijden",
    "Eiweißziel möglichst erreichen": "Eiwitdoel zo mogelijk halen",
    "Beigaben": "Toevoegingen",
    "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite.": "Voedingsmiddelen die bij elke maaltijd passen (bijv. noten). Een suggestie neemt ze alleen mee als ze beter bij de resterende ruimte passen. Velden: minimale hoeveelheid, maximale hoeveelheid, stapgrootte.",
    "Mindestmenge": "Minimale hoeveelheid",
    "Höchstmenge": "Maximale hoeveelheid",
    "Schrittweite": "Stapgrootte",
    "Beigabe hinzufügen": "Toevoeging toevoegen",
    "+ Beigabe": "+ Toevoeging",
    "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.": "Schaalbaar: volgt de hoeveelheidsfactor van de maaltijd. Vast: blijft gelijk.",
    "Skalierbar": "Schaalbaar",
    "Fest": "Vast",
    "Packung": "Verpakking",
    "Abweichung ±": "Afwijking ±",
    "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)": "Hoeveel dit ingrediënt mag afwijken van de verhouding tot de andere (in procent)",
    "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.": "Verpakkingsgrootte: de suggestie neemt zoveel verpakkingen als bij “Aantal” is ingesteld. Leeg = precies de opgeslagen hoeveelheid.",
    "Mengenfaktor für Vorschläge": "Hoeveelheidsfactor voor suggesties",
    "von": "van",
    "bis": "tot",
    "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6.": "Hoeveel de hele maaltijd bij suggesties mag worden verkleind of vergroot (1 = hoeveelheid zoals opgeslagen). Leeg = 0,6 tot 1,6.",
    "Mahlzeiten-Vorschläge sind nicht aktiviert": "Maaltijdsuggesties zijn niet geactiveerd",
    "Vorschlag ist leer": "De suggestie is leeg",
    "Ungültige Werte": "Ongeldige waarden",
    "Kleinster Faktor ist größer als der größte": "De kleinste factor is groter dan de grootste",
    "Wie viele Packungen ein Vorschlag nehmen darf": "Hoeveel verpakkingen een suggestie mag gebruiken (van – tot; 0 = mag worden weggelaten)",
    "Anzahl": "Aantal",
    "Ausschließen": "Uitsluiten",
    "Ausgeschlossen": "Uitgesloten",
    "Zulassen": "Toestaan",
    "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück.": "Deze maaltijden verschijnen niet meer in de suggesties. Met “Toestaan” komen ze terug.",
    "Frühstück": "Ontbijt",
    "Mittagessen": "Lunch",
    "Abendessen": "Avondeten",
    "Snacks": "Snacks",
    "Mahlzeit": "Maaltijd",
    "Menge": "Hoeveelheid",
    "Die Makros ergeben {} g auf 100 g – mehr als möglich.": "De macro’s komen uit op {} g per 100 g – meer dan mogelijk.",
    "Die Makros ergeben rechnerisch ca. {} kcal, angegeben sind {} kcal.": "De macro’s komen uit op ca. {} kcal, opgegeven is {} kcal.",
    "{} Lebensmittel durch ausgeblendete Kategorien versteckt.": "{} voedingsmiddelen verborgen door verborgen categorieën.",
    "{}: Werte übernommen ✓": "{}: waarden overgenomen ✓",
    "{}: {} kcal · KH {} · Fett {} · Eiweiß {} ({})": "{}: {} kcal · koolh. {} · vet {} · eiwit {} ({})",
    "{} geprüft: {} stimmen überein, {} weichen ab, {} ohne Treffer.": "{} gecontroleerd: {} komen overeen, {} wijken af, {} zonder treffer.",
    "{} Einträge, {} Gewichtswerte ({} bis {}) aus {} Zeilen.": "{} items, {} gewichtswaarden ({} t/m {}) uit {} rijen.",
    "{} Tage ({} bis {}), {} Einträge, {} Gewichtswerte": "{} dagen ({} t/m {}), {} items, {} gewichtswaarden",
    "{} Uhr · {}": "{} · {}",
    "Die Excel-Datei ist zu groß.": "Het Excel-bestand is te groot.",
    "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).": "Mealie is nog niet ingesteld (Instellingen → Mealie).",
    "Mealie konnte nicht erreicht werden.": "Mealie kon niet worden bereikt.",
    "Bitte eine Adresse wie http://mealie:9000 angeben.": "Geef een adres op zoals http://mealie:9000.",
    "Nicht gefunden (Adresse oder Rezept prüfen).": "Niet gevonden (controleer het adres of het recept).",
    "Mealie antwortete mit Fehler {}.": "Mealie antwoordde met fout {}.",
    "Unter dieser Adresse läuft kein Mealie.": "Op dit adres draait geen Mealie.",
    "Ungültiges Rezept.": "Ongeldig recept.",
    "Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).": "Dit adres is niet toegestaan (Mealie draait op een eigen server of add-on).",
    "Mealie ist nicht erreichbar.": "Mealie is niet bereikbaar.",
    "Die Seite antwortete mit Fehler {}.": "De pagina antwoordde met fout {}.",
    "Rezept": "Recept",
    "Wasser": "Water",
    "Koffein": "Cafeïne",
    "Kreatin": "Creatine",
    "{} (Kopie)": "{} (kopie)",
    "Daten löschen …": "Gegevens verwijderen …",
    "Daten löschen": "Gegevens verwijderen",
    "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an.": "Verwijdert de gekozen gegevens van je account definitief. Andere gebruikers en de instellingen blijven ongemoeid. Maak vooraf het best een back-up (JSON).",
    "Einträge, Notizen, Wasser und Aktivität aller Tage": "items, notities, water en activiteit van alle dagen",
    "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)": "alle voedingsmiddelen van de bibliotheek (dagboekitems blijven)",
    "alle gespeicherten Mahlzeiten": "alle opgeslagen maaltijden",
    "alle Rezepte samt ihrer Lebensmittel": "alle recepten inclusief hun voedingsmiddelen",
    "Gewicht und Körpermaße": "Gewicht en lichaamsmaten",
    "Gewichtswerte, Körpermaße und Fortschrittsfotos": "gewichtswaarden, lichaamsmaten en voortgangsfoto’s",
    "Tagesziel, Wochentagsziele und Profile": "dagdoel, doelen per weekdag en profielen",
    "alle Trigger und Mahlzeiten-Regeln samt Verlauf": "alle triggers en maaltijdregels inclusief verloop",
    "Bitte mindestens einen Bereich wählen.": "Kies minstens één onderdeel.",
    "Bitte mindestens einen gültigen Bereich wählen.": "Kies minstens één geldig onderdeel.",
    "Wirklich unwiderruflich löschen: {}?": "Echt definitief verwijderen: {}?",
    "Gelöscht.": "Verwijderd.",
    "Endgültig löschen": "Definitief verwijderen",
    "Abendessen sollen das Eiweißziel möglichst erreichen": "Avondeten moet het eiwitdoel zo goed mogelijk halen",
    "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)": "Knop “Trainingsdag” elke dag tonen (anders alleen als de shake is ingevoerd of door een trigger is geboekt)",
    "Einkaufsliste": "Boodschappenlijst",
    "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt.": "Kies recepten (porties) en opgeslagen maaltijden (veelvoud, 1 = eenmaal): de ingrediënten worden opgeteld.",
    "Noch nichts gewählt.": "Nog niets gekozen.",
    "In die Zwischenablage kopieren": "Kopiëren naar klembord",
    "Kopiert ✓": "Gekopieerd ✓",
    "An Home Assistant senden": "Naar Home Assistant sturen",
    "Todo-Liste": "Takenlijst",
    "Keine Todo-Liste in Home Assistant gefunden.": "Geen takenlijst gevonden in Home Assistant.",
    "{} Einträge gesendet.": "{} items verstuurd.",
    "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste).": "Telt de ingrediënten van recepten en opgeslagen maaltijden op, kopieert ze of stuurt ze naar een takenlijst in Home Assistant (bijv. de boodschappenlijst).",
    "Einkaufsliste nicht aktiviert": "Boodschappenlijst is niet ingeschakeld",
    "Todo-Liste fehlt": "Takenlijst ontbreekt",
    "Keine Einträge": "Geen items",
    "Home Assistant nicht erreichbar (gesendet: {})": "Home Assistant niet bereikbaar (verstuurd: {})",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)": "Aanbieden in de gedeelde huishoudbibliotheek (anderen mogen het gebruiken en kopiëren)",
    "Wochenbericht": "Weekoverzicht",
    "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“.": "Eén keer per week een samenvatting van de laatste zeven dagen als melding. Gebruikt de meldingsdienst van “Herinnering”.",
    "Wochenbericht aktiv": "Weekoverzicht actief",
    "Wochentag": "Weekdag",
    "Vorschau": "Voorbeeld",
    "Datenbank": "Database",
    "{} · {} Zeilen in {} Tabellen · frei {} · letzte Sicherung: {}": "{} · {} rijen in {} tabellen · vrij {} · laatste back-up: {}",
    "Prüfen und verdichten": "Controleren en comprimeren",
    "Prüfung läuft …": "Controle bezig …",
    "Verdichtet: {} → {}": "Gecomprimeerd: {} → {}",
    "Datenbank ist in Ordnung.": "De database is in orde.",
    "Datenbank prüfen: {}": "Databasecontrole: {}",
    "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)": "Ook herkennen vanaf zoveel verbrande calorieën (kcal, 0 = uit)",
    "Wochentag ungültig": "Ongeldige weekdag",
    "Andere dürfen es auch ändern": "Anderen mogen het ook wijzigen",
    "Nährwert-Lücken (7 Tage)": "Voedingstekorten (7 dagen)",
    "Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; {} von {} Tagen erfasst.": "Gemiddelde van de laatste 7 dagen (alleen dagen met waarden) tegen richtwaarden; {} van {} dagen geregistreerd.",
    "nicht genug Angaben": "te weinig gegevens",
    "Ziele ändern": "Doelen wijzigen",
    "Ziele für weitere Nährwerte": "Doelen voor meer voedingswaarden",
    "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze.": "Richtwaarden per dag in g. Vezels moeten worden gehaald; voor suiker, zout en verzadigd vet is het een bovengrens.",
    "Weitere Nährwerte sind nicht aktiviert": "Meer voedingswaarden is niet ingeschakeld",
    "Ziele müssen zwischen 0 und 1000 liegen": "Doelen moeten tussen 0 en 1000 liggen",
    "Ø {} g (mind. {} g) – im Ziel": "Ø {} g (minstens {} g) – op doel",
    "Ø {} g (mind. {} g) – {} % unter dem Ziel": "Ø {} g (minstens {} g) – {} % onder het doel",
    "Ø {} g (höchstens {} g) – im Ziel": "Ø {} g (hoogstens {} g) – op doel",
    "Ø {} g (höchstens {} g) – {} % über dem Ziel": "Ø {} g (hoogstens {} g) – {} % boven het doel",
    "Aus Text …": "Uit tekst …",
    "Rezept aus Text": "Recept uit tekst",
    "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Plak een recept als tekst: eerst de titel, dan de ingrediënten (één per regel, met hoeveelheid) en de bereiding. Kopjes als “Ingrediënten” en “Bereiding” helpen. De ingrediënten worden gekoppeld aan je voedingsmiddelen; je controleert alles voordat het wordt opgeslagen.",
    "Rezepttext": "Receptentekst",
    "Im Text wurden keine Zutaten gefunden (Zeilen mit Mengen, z. B. „200 g Mehl“).": "Geen ingrediënten gevonden in de tekst (regels met hoeveelheden, bijv. “200 g bloem”).",
    "Der Text ist zu lang.": "De tekst is te lang.",
    "Offline: 1 Eintrag wartet auf Verbindung.": "Offline: 1 item wacht op verbinding.",
    "Offline: {} Einträge warten auf Verbindung.": "Offline: {} items wachten op verbinding.",
    "Hauptmenü": "Hoofdmenu",
    "Zeitraum A, von": "Periode A, van",
    "Zeitraum A, bis": "Periode A, tot",
    "Zeitraum B, von": "Periode B, van",
    "Zeitraum B, bis": "Periode B, tot",
  },
  it: {
    "Ernährung": "Alimentazione",
    "Tagebuch": "Diario",
    "Lebensmittel": "Alimenti",
    "Mahlzeiten": "Pasti",
    "Rezepte": "Ricette",
    "Gewicht": "Peso",
    "Statistik": "Statistiche",
    "Einstellungen": "Impostazioni",
    "Lokal": "Locale",
    "Kategorien:": "Categorie:",
    "Ein-/ausblenden": "Mostra/nascondi",
    "Vortag": "Giorno precedente",
    "Folgetag": "Giorno successivo",
    "Bearbeiten": "Modifica",
    "Entfernen": "Rimuovi",
    "Kalorien": "Calorie",
    "Kohlenhydrate": "Carboidrati",
    "Fette": "Grassi",
    "Eiweiß": "Proteine",
    "+ Nahrungsmittel hinzufügen": "+ Aggiungi alimento",
    "Notiz zur Mahlzeit": "Nota per questo pasto",
    "Tag": "Giorno",
    "Notiz ändern": "Modifica nota",
    "Notiz": "Nota",
    "Speichern / Kopieren": "Salva / Copia",
    "Mahlzeit leeren": "Svuota pasto",
    "Tag leeren": "Svuota giorno",
    "Alle Einträge von „{}“ löschen?": "Eliminare tutte le voci di “{}”?",
    "Alle Einträge dieses Tages löschen?": "Eliminare tutte le voci di questo giorno?",
    "Einträge": "Voci",
    "Ausgeblendete Mahlzeiten wieder verbergen": "Nascondi di nuovo i pasti nascosti",
    "leere/ausgeblendete Mahlzeit anzeigen": "mostra pasto vuoto/nascosto",
    "leere/ausgeblendete Mahlzeiten anzeigen": "mostra pasti vuoti/nascosti",
    "Tagesziel ({})": "Obiettivo giornaliero ({})",
    "Dein Tagesziel": "Il tuo obiettivo giornaliero",
    "Gesamt": "Totale",
    "Verbleibend": "Rimanente",
    "Weitere Nährwerte": "Altri nutrienti",
    "Notiz zum Tag": "Nota del giorno",
    "Ganzen Tag kopieren": "Copia l’intero giorno",
    "z. B. Hunger, Training, Stimmung …": "es. fame, allenamento, umore …",
    "Notiz: {}": "Nota: {}",
    "Abbrechen": "Annulla",
    "Speichern": "Salva",
    "Auf den Tag": "Al giorno",
    "Mengenfaktor (1 = unverändert)": "Fattore quantità (1 = invariato)",
    "Bitte einen Tag wählen.": "Scegli un giorno.",
    "Kopieren": "Copia",
    "Wasser & Ergänzungen": "Acqua e integratori",
    "Lebensmittel suchen…": "Cerca alimenti…",
    "Zurück": "Indietro",
    "g KH": "g carboidrati",
    "g Fett": "g grassi",
    "g Eiweiß": "g proteine",
    "Menge (g)": "Quantità (g)",
    "Ballaststoffe": "Fibre",
    "Zucker": "Zuccheri",
    "Salz": "Sale",
    "ges. Fettsäuren": "grassi sat.",
    "Portion wählen …": "Scegli la porzione …",
    "Portion": "Porzione",
    "Bezeichnung": "Descrizione",
    "KH (g)": "Carboidrati (g)",
    "Fett (g)": "Grassi (g)",
    "Eiweiß (g)": "Proteine (g)",
    "Uhrzeit": "Ora",
    "Lebensmittel tauschen": "Sostituisci alimento",
    "Bezeichnung und kcal sind Pflicht.": "Descrizione e kcal sono obbligatorie.",
    "„{}“ tauschen": "Sostituisci “{}”",
    "Tauschen": "Sostituisci",
    "Schnelleingabe in „{}“": "Inserimento rapido in “{}”",
    "Schnelleingabe": "Inserimento rapido",
    "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“).": "Senza alimento, solo calorie e facoltativamente i macronutrienti (es. “Ristorante, circa 800 kcal”).",
    "z. B. Restaurant": "es. Ristorante",
    "Hinzufügen": "Aggiungi",
    "Als Mahlzeit speichern": "Salva come pasto",
    "Am Tag": "Nel giorno",
    "Neue Uhrzeit (leer = Originalzeit)": "Nuova ora (vuoto = ora originale)",
    "In Mahlzeit": "Nel pasto",
    "Nichts ausgewählt.": "Nessuna selezione.",
    "Name der Mahlzeit": "Nome del pasto",
    "z. B. Diät, Bulk (optional)": "es. Definizione, Massa (facoltativo)",
    "Name": "Nome",
    "Kategorie": "Categoria",
    "Bitte einen Namen angeben.": "Inserisci un nome.",
    "Dieser Browser kann keine Barcodes lesen (BarcodeDetector fehlt). Bitte die Nummer eintippen.": "Questo browser non può leggere i codici a barre (manca BarcodeDetector). Digita il numero.",
    "Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.": "Nessun accesso alla fotocamera (la pagina richiede HTTPS). Usa “Foto” o digita il numero.",
    "Abgebrochen": "Annullato",
    "Scan abbrechen": "Annulla scansione",
    "Halte den Barcode ins Bild.": "Inquadra il codice a barre.",
    "Kamerazugriff wurde nicht erlaubt.": "L’accesso alla fotocamera non è stato consentito.",
    "Kamera nicht verfügbar: {}": "Fotocamera non disponibile: {}",
    "Auf dem Foto wurde kein Barcode erkannt.": "Nella foto non è stato trovato nessun codice a barre.",
    "z. B. 1 Scheibe": "es. 1 fetta",
    "Produkt nicht gefunden ({})": "Prodotto non trovato ({})",
    "Barcode (Open Food Facts)": "Codice a barre (Open Food Facts)",
    "Suchen": "Cerca",
    "Scannen (Kamera)": "Scansiona (fotocamera)",
    "Foto vom Barcode": "Foto del codice a barre",
    "Marke": "Marca",
    "z. B. Diät, Bulk": "es. Definizione, Massa",
    "Portion (g)": "Porzione (g)",
    "kcal / 100 g": "kcal / 100 g",
    "KH / 100 g": "Carboidrati / 100 g",
    "Fett / 100 g": "Grassi / 100 g",
    "Eiweiß / 100 g": "Proteine / 100 g",
    "Portionsgrößen (optional)": "Dimensioni delle porzioni (facoltativo)",
    "+ Portion": "+ Porzione",
    "Name und kcal sind Pflicht.": "Nome e kcal sono obbligatori.",
    "Speichern & wählen": "Salva e scegli",
    "Suchen…": "Cerca…",
    "★ Favoriten": "★ Preferiti",
    "Meine Mahlzeiten": "I miei pasti",
    "Häufig verwendet": "Usati spesso",
    "Beides": "Entrambi", "Hinzufügen-Dialog": "Finestra di aggiunta", "„Häufig verwendet“ zeigt": "«Usati spesso» mostra", "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten.": "Vale per la scheda «Alimenti» nella finestra di aggiunta. La scheda «I miei pasti» mostra sempre i pasti usati spesso.",
    "Alle": "Tutti",
    "Nichts gefunden – lege ein neues Lebensmittel an.": "Nessun risultato – crea un nuovo alimento.",
    "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆.": "Ancora nessun preferito – contrassegna gli alimenti con ☆ nella pagina “Alimenti”.",
    "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen.": "Nessun pasto salvato. Creane uno nel diario con “Salva come pasto”.",
    "Portionen": "Porzioni",
    "+ Neues Lebensmittel": "+ Nuovo alimento",
    "Schnelleingabe (nur kcal)": "Inserimento rapido (solo kcal)",
    "Schließen": "Chiudi",
    "Zu „{}“ hinzufügen": "Aggiungi a “{}”",
    "Eintrag hinzufügen": "Aggiungi voce",
    "(Ziel {})": "(obiettivo {})",
    "Trend {} kg": "Tendenza {} kg",
    "Gewichtsverlauf": "Storico del peso",
    "Verlauf": "Storico",
    "zu wenig Daten": "dati insufficienti",
    "nicht absehbar": "non prevedibile",
    "erreicht": "raggiunto",
    "Lebensmittel bearbeiten": "Modifica alimento",
    "Neues Lebensmittel": "Nuovo alimento",
    "Favorit entfernen": "Rimuovi dai preferiti",
    "Als Favorit markieren": "Segna come preferito",
    "Favorit": "Preferito",
    "Trigger anlegen": "Crea trigger",
    "Löschen": "Elimina",
    "„{}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.": "Eliminare “{}”? I pasti già registrati vengono mantenuti.",
    "Nichts gefunden.": "Nessun risultato.",
    "Noch keine Lebensmittel angelegt.": "Ancora nessun alimento.",
    "Duplikate suchen": "Trova duplicati",
    "Doppelte Lebensmittel": "Alimenti duplicati",
    "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.": "In ogni gruppo scegli l’alimento da mantenere. I pasti già registrati restano invariati.",
    "Keine Duplikate gefunden.": "Nessun duplicato trovato.",
    "Zusammenführen": "Unisci",
    "Durch anderes Lebensmittel tauschen": "Sostituisci con un altro alimento",
    "Mahlzeit bearbeiten": "Modifica pasto",
    "Komponenten": "Componenti",
    "Komponente hinzufügen": "Aggiungi componente",
    "+ Komponente": "+ Componente",
    "Kopie anlegen": "Crea copia",
    "Mahlzeit „{}“ löschen?": "Eliminare il pasto “{}”?",
    "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.": "Nessun pasto salvato – usa “Salva come pasto” nel diario.",
    "Mahlzeiten suchen…": "Cerca pasti…",
    "wie Summe der Zutaten": "uguale alla somma degli ingredienti",
    "Gesamt: {} g": "Totale: {} g",
    "pro Portion ({} g)": "per porzione ({} g)",
    "Rezept bearbeiten": "Modifica ricetta",
    "Neues Rezept": "Nuova ricetta",
    "Gewicht fertig (g, optional)": "Peso da cotto (g, facoltativo)",
    "Zutaten": "Ingredienti",
    "Noch keine Zutaten.": "Ancora nessun ingrediente.",
    "Zutat hinzufügen": "Aggiungi ingrediente",
    "+ Zutat": "+ Ingrediente",
    "Ungültige Einheit": "Unità non valida",
    "Speichern und jetzt lesen": "Salva e leggi ora",
    "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen.": "Il valore del sensore è più vecchio di 30 giorni e non è stato acquisito.",
    "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).": "Il valore è fuori dall’intervallo 20–500 kg (controlla l’unità).",
    "Der Sensor liefert gerade keinen Zahlenwert.": "Al momento il sensore non fornisce un numero.",
    "Home Assistant nicht erreichbar.": "Home Assistant non è raggiungibile.",
    "Zuerst einen Sensor wählen.": "Scegli prima un sensore.",
    "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.": "Nuovo valore rilevato, verrà acquisito quando sarà stabile.",
    "Der aktuelle Wert ist schon übernommen.": "Il valore attuale è già stato acquisito.",
    "Übernommen: {} am {}": "Acquisito: {} il {}",
    "Zuletzt übernommen: {} am {}": "Ultimo acquisito: {} il {}",
    "z. B. sensor.waage_gewicht": "es. sensor.peso_bilancia",
    "Automatisch (Einheit des Sensors)": "Automatica (unità del sensore)",
    "Einheit des Sensors": "Unità del sensore",
    "Sensor": "Sensore",
    "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg.": "Un sensore di Home Assistant con il peso corporeo, ad es. di una bilancia smart. Il componente aggiuntivo controlla ogni minuto; un nuovo valore viene acquisito quando non cambia da un minuto e viene salvato per il giorno della misurazione (un valore dello stesso giorno viene sostituito). Valori sensati: da 20 a 500 kg.",
    "Waage": "Bilancia",
    "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung).": "Acquisisci automaticamente il peso corporeo da un sensore di Home Assistant, ad es. di una bilancia smart (con conversione delle unità).",
    "Waage (Sensor)": "Bilancia (sensore)",
    "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).": "Gli ingredienti in arancione mancavano tra i tuoi alimenti e sono stati integrati da database online (stime, controlla).",
    "aus Open Food Facts": "da Open Food Facts",
    "aus USDA": "da USDA",
    "Pro Portion ({} g): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Per porzione ({} g): {} kcal · carboidrati {} g · grassi {} g · proteine {} g · {} porzioni",
    "Rezept „{}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.": "Eliminare la ricetta “{}”? Viene eliminato anche l’alimento corrispondente; i pasti già registrati vengono mantenuti.",
    "Noch kein Rezept angelegt.": "Ancora nessuna ricetta.",
    "Rezepte suchen…": "Cerca ricette…",
    "+ Neues Rezept": "+ Nuova ricetta",
    "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel.": "Ogni ricetta compare anche sotto Alimenti (per 100 g, con “1 porzione”) e può essere registrata ovunque. Le modifiche alla ricetta aggiornano quell’alimento.",
    "1 Portion": "1 porzione",
    "Rezept nicht gefunden": "Ricetta non trovata",
    "Mindestens eine Zutat nötig.": "È richiesto almeno un ingrediente.",
    "Portionen müssen größer als 0 sein.": "Le porzioni devono essere maggiori di 0.",
    "Jede Zutat braucht eine Menge in Gramm.": "Ogni ingrediente richiede una quantità in grammi.",
    "Gewicht nach dem Kochen muss größer als 0 sein.": "Il peso da cotto deve essere maggiore di 0.",
    "z. B. 78,5": "es. 78,5",
    "Gewicht eintragen": "Registra peso",
    "Datum": "Data",
    "Gewicht ({})": "Peso ({})",
    "Zielgewicht ({})": "Peso obiettivo ({})",
    "Gewünschte Änderung ({} pro Woche)": "Variazione desiderata ({} a settimana)",
    "Noch keine Gewichtswerte.": "Ancora nessun valore di peso.",
    "Aktuell": "Attuale",
    "Trend": "Tendenza",
    "Veränderung": "Variazione",
    "Ziel": "Obiettivo",
    "Prognose Ziel": "Previsione obiettivo",
    "30 Tage": "30 giorni",
    "90 Tage": "90 giorni",
    "1 Jahr": "1 anno",
    "7 Tage": "7 giorni",
    "180 Tage": "180 giorni",
    "14 Tage": "14 giorni",
    "Kalorien und Gewicht": "Calorie e peso",
    "Kalorien (linke Achse)": "Calorie (asse sinistro)",
    "Gewicht und Trend (rechte Achse)": "Peso e tendenza (asse destro)",
    "Noch keine Gewichtswerte im Zeitraum.": "Ancora nessun valore di peso in questo periodo.",
    "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).": "Linea sottile e punti: misurazioni. Linea spessa: tendenza livellata (senza le oscillazioni giornaliere).",
    "Trend aktuell {}{} {}/Woche.": "Tendenza attuale {}{} {}/settimana.",
    "Mehr anzeigen": "Mostra altro",
    "Alle {}": "Tutti {}",
    "Weniger": "Meno",
    "Taille": "Vita",
    "Brust": "Torace",
    "Hüfte": "Fianchi",
    "Oberarm": "Braccio",
    "Oberschenkel": "Coscia",
    "Körperfett %": "Grasso corporeo %",
    "Bild konnte nicht gelesen werden": "Impossibile leggere l’immagine",
    "Eigene Messung, z. B. Wade": "Misura personalizzata, es. polpaccio",
    "Körpermaße": "Misure corporee",
    "Werte, die Du nicht messen willst, einfach leer lassen.": "Lascia vuoti i valori che non vuoi misurare.",
    "Weitere Messung": "Un’altra misura",
    "Wert": "Valore",
    "Bitte mindestens einen Wert eintragen.": "Inserisci almeno un valore.",
    "Noch keine Werte für diese Messung.": "Ancora nessun valore per questa misura.",
    "Notiz (optional), z. B. Vorderansicht": "Nota (facoltativa), es. vista frontale",
    "Fortschrittsfotos": "Foto dei progressi",
    "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons.": "Le foto restano nel componente aggiuntivo sul tuo Home Assistant. Non fanno parte dell’esportazione JSON né dei backup automatici, ma sono incluse nel backup Home Assistant del componente.",
    "Vergleichen": "Confronta",
    "Foto hinzufügen": "Aggiungi foto",
    "Foto löschen": "Elimina foto",
    "Foto löschen?": "Eliminare la foto?",
    "Noch keine Fotos.": "Ancora nessuna foto.",
    "Fotos vergleichen": "Confronta le foto",
    "Ungültiger Wert für {}": "Valore non valido per {}",
    "Kein gültiges Bild": "Immagine non valida",
    "Bild leer oder zu groß (max. 8 MB)": "Immagine vuota o troppo grande (max. 8 MB)",
    "Foto nicht gefunden": "Foto non trovata",
    "Abnehmen": "Perdere peso",
    "Halten": "Mantenere",
    "Zunehmen": "Aumentare peso",
    "Kalorienbilanz": "Bilancio calorico",
    "Noch keine Einträge im Zeitraum.": "Nessuna voce in questo periodo.",
    "Ø Aufnahme": "Ø assunzione",
    "Gewichtstrend": "Tendenza del peso",
    "Überschuss / Tag": "Surplus / giorno",
    "Defizit / Tag": "Deficit / giorno",
    "Bilanz / Tag": "Bilancio / giorno",
    "Geschätzter Verbrauch": "Dispendio stimato",
    "Aus {} Gewichtswerten und {} von {} erfassten Tagen (1 {} ≈ {} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.": "Basato su {} valori di peso e {} di {} giorni registrati (1 {} ≈ {} kcal). Più completi sono il diario e le pesate, più accurato è il risultato.",
    "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum.": "Il calcolo richiede almeno due valori di peso a una settimana di distanza nel periodo selezionato.",
    "Du liegst im Plan.": "Sei in linea con l’obiettivo.",
    "Der Trend liegt über dem Ziel.": "La tendenza è sopra l’obiettivo.",
    "Der Trend liegt unter dem Ziel.": "La tendenza è sotto l’obiettivo.",
    "Ziel: {}": "Obiettivo: {}",
    "(Gewicht halten)": "(mantenere il peso)",
    "({} {}/Woche)": "({} {}/settimana)",
    "· Trend aktuell {} {}/Woche. {}": "· tendenza attuale {} {}/settimana. {}",
    "Für dieses Ziel passen ca. {} kcal am Tag (Dein Ziel: {}).": "Circa {} kcal al giorno sono adatte a questo obiettivo (il tuo obiettivo: {}).",
    "Als Tagesziel übernehmen": "Usa come obiettivo giornaliero",
    "Ø Kalorien": "Ø calorie",
    "Erfasste Tage": "Giorni registrati",
    "Ø Eiweiß": "Ø proteine",
    "Ø Kohlenhydrate": "Ø carboidrati",
    "Ø Fett": "Ø grassi",
    "Kalorien pro Tag": "Calorie al giorno",
    "Gestrichelt: Tagesziel je Wochentag": "Tratteggiato: obiettivo giornaliero per giorno della settimana",
    "Gestrichelt: Tagesziel {} kcal": "Tratteggiato: obiettivo giornaliero {} kcal",
    "Nährwertverteilung (Ø)": "Ripartizione dei macronutrienti (Ø)",
    "Eiweiß {} %": "Proteine {} %",
    "Kohlenhydrate {} %": "Carboidrati {} %",
    "Fett {} %": "Grassi {} %",
    "Weitere Nährwerte (Ø pro Tag)": "Altri nutrienti (Ø al giorno)",
    "Ø pro Tag": "Ø al giorno",
    "Eingetragen": "Registrati",
    "Ziel erreicht": "Obiettivo raggiunto",
    "Bericht & Zeitraum-Vergleich": "Rapporto e confronto dei periodi",
    "7 Tage vs. davor": "7 giorni rispetto a prima",
    "30 Tage vs. davor": "30 giorni rispetto a prima",
    "Eiweißziel erreicht": "Obiettivo proteico raggiunto",
    "Kalorien im Ziel": "Calorie in linea con l’obiettivo",
    "Gewichtsänderung": "Variazione di peso",
    "Differenz": "Differenza",
    "Bester Tag (A): {} · Schwächster Tag (A): {}": "Giorno migliore (A): {} · Giorno più debole (A): {}",
    "Tage": "Giorni",
    "{} Tage": "{} giorni",
    "{} / {} Tage": "{} / {} giorni",
    "{} Einträge, {} kcal": "{} voci, {} kcal",
    "{} / 100 g": "{} / 100 g",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g": "{} kcal · carboidrati {} g · grassi {} g · proteine {} g",
    "{} kcal (Ziel {})": "{} kcal (obiettivo {})",
    "KH {} g · Fett {} g · Eiweiß {} g": "carboidrati {} g · grassi {} g · proteine {} g",
    "zu {}": "a {}",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g (pro 100 g)": "{} kcal · carboidrati {} g · grassi {} g · proteine {} g (per 100 g)",
    "Ø": "Ø",
    "Zustand": "Stato",
    "Kalender": "Calendario",
    "(am Starttag)": "(nel giorno di inizio)",
    "(am Endtag)": "(nel giorno di fine)",
    "Täglich ab {} Uhr": "Ogni giorno dalle {}",
    "enthält nicht": "non contiene",
    "· seit mind. {} Min.": "· per almeno {} min",
    "· nur {}–{} Uhr": "· solo {}–{}",
    "ODER": "OPPURE",
    "UND": "E",
    "Trigger pausieren": "Metti in pausa il trigger",
    "Pause beenden": "Termina pausa",
    "Heute": "Oggi",
    "3 Tage": "3 giorni",
    "1 Woche": "1 settimana",
    "Oder bis einschließlich": "Oppure fino al (incluso)",
    "Pausieren": "Pausa",
    "Zustand einer Entität (z. B. Person ist im Fitnessstudio)": "Stato di un’entità (es. la persona è in palestra)",
    "Kalendereintrag": "Evento del calendario",
    "Uhrzeit (täglich ab einer Zeit)": "Ora (ogni giorno a partire da un’ora)",
    "z. B. person.max": "es. person.max",
    "ist / enthält": "è / contiene",
    "ist NICHT / enthält NICHT": "NON è / NON contiene",
    "an jedem Tag des Termins": "in ogni giorno dell’evento",
    "nur am Starttag (z. B. Donnerstag 22 Uhr)": "solo nel giorno di inizio (es. giovedì alle 22)",
    "nur am Endtag (z. B. Freitag 6 Uhr)": "solo nel giorno di fine (es. venerdì alle 6)",
    "Termin zählt": "L’evento conta",
    "Entität": "Entità",
    "Bedingung": "Condizione",
    "z. B. calendar.arbeit": "es. calendar.lavoro",
    "Titel enthält, z. B. Nachtschicht": "Il titolo contiene, es. turno di notte",
    "Zustand, z. B. Fitnessstudio (Zonenname) oder on": "Stato, es. palestra (nome della zona) oppure on",
    "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist.": "Registra una volta al giorno non appena si raggiunge quest’ora.",
    "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält.": "Vale per i giorni con (o senza) un evento il cui titolo contiene questo testo.",
    "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).": "Vale non appena l’entità ha (o non ha) questo stato.",
    "Auslöser": "Condizione del trigger",
    "„{}“ nur an bestimmten Tagen anzeigen": "Mostra “{}” solo in certi giorni",
    "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt.": "I giorni con voci sono sempre visibili. Senza regola il pasto è sempre mostrato.",
    "Bitte eine Entität angeben.": "Inserisci un’entità.",
    "Gespeicherte Mahlzeiten": "Pasti salvati",
    "Tagesziel wechseln": "Cambia obiettivo giornaliero",
    "Tagesziel „{}“": "Obiettivo giornaliero “{}”",
    "Standardportion": "Porzione predefinita",
    "Tage im Voraus eintragen (nur Kalender)": "Registra in anticipo (solo calendario)",
    "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht.": "0 = solo nel giorno stesso. Con es. 7 la voce viene pianificata per i prossimi 7 giorni non appena esiste un evento corrispondente.",
    "Zustand muss schon so lange anliegen (Minuten)": "Lo stato deve essere durato così a lungo (minuti)",
    "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist.": "0 = subito. Es. 20: registra solo quando la persona è in palestra da 20 minuti.",
    "Nur zwischen (Uhrzeit, optional)": "Solo tra (ora, facoltativo)",
    "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00).": "Fuori da questa fascia oraria il trigger non registra. È possibile superare la mezzanotte (dalle 22:00 alle 06:00).",
    "Zu Mahlzeit im Tagebuch": "Nel pasto del diario",
    "Bei Lebensmitteln optional mit Menge:": "Per gli alimenti, facoltativamente con una quantità:",
    "Alle Bedingungen müssen zutreffen (UND)": "Tutte le condizioni devono essere vere (E)",
    "Mindestens eine muss zutreffen (ODER)": "Ne basta una (OPPURE)",
    "Verknüpfung": "Combinazione",
    "Entität, z. B. person.anna": "Entità, es. person.anna",
    "Zustand bzw. Titel enthält (leer = an)": "Lo stato o il titolo contiene (vuoto = on)",
    "Bedingung entfernen": "Rimuovi condizione",
    "Trigger bearbeiten": "Modifica trigger",
    "Neuer Trigger": "Nuovo trigger",
    "+ Weitere Bedingung": "+ Un’altra condizione",
    "Dann": "Allora",
    "Bitte eine Uhrzeit angeben.": "Inserisci un’ora.",
    "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen.": "Scegli un alimento, un pasto o un obiettivo giornaliero.",
    "Weitere Bedingung: bitte eine Entität angeben.": "Un’altra condizione: inserisci un’entità.",
    "Komplett (alle Einträge mit Mahlzeiten)": "Completo (tutte le voci con i pasti)",
    "Nur Tageskalorien und Makros (eine Summe pro Tag)": "Solo calorie e macronutrienti giornalieri (un totale al giorno)",
    "Neue Mahlzeit anlegen": "Crea nuovo pasto",
    "Mahlzeiten zuordnen": "Assegna pasti",
    "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)": "Nascondi i pasti vuoti in questi giorni (mostra solo il totale giornaliero)",
    "MyFitnessPal-Import": "Importazione da MyFitnessPal",
    "Was importieren?": "Cosa importare?",
    "Gewicht übernehmen": "Importa il peso",
    "Vorhandene Einträge an diesen Tagen ersetzen": "Sostituisci le voci esistenti in questi giorni",
    "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Importati: {} giorni, {} voci, {} valori di peso.",
    "Importieren": "Importa",
    "Eiweiß {} % · Kohlenhydrate {} % · Fett {} %": "Proteine {} % · Carboidrati {} % · Grassi {} %",
    "· Makros ergeben {} kcal": "· i macronutrienti sommano {} kcal",
    "Tagesziele": "Obiettivi giornalieri",
    "Mein Ziel": "Il mio scopo",
    "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet.": "Decide quando un giorno conta come “in linea” (perdere: al massimo, aumentare: almeno, mantenere: ±10 %) e come le statistiche valutano la tendenza del tuo peso.",
    "Kalorien aus Makros berechnen": "Calcola le calorie dai macronutrienti",
    "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g).": "Quando cambiano proteine, carboidrati o grassi, le calorie si adeguano (4/4/9 kcal per g).",
    "Kalorien (kcal)": "Calorie (kcal)",
    "Kohlenhydrate (g)": "Carboidrati (g)",
    "Gespeichert ✓": "Salvato ✓",
    "Zusatzfunktionen": "Funzioni opzionali",
    "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen.": "Funzioni opzionali, disattivate per impostazione predefinita. Quando attive compaiono nel diario e qui nelle impostazioni.",
    "Tagesziele pro Wochentag": "Obiettivi giornalieri per giorno della settimana",
    "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger.": "es. giorni di allenamento con più calorie, giorni di riposo con meno.",
    "Wasser und Nahrungsergänzung": "Acqua e integratori",
    "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.": "Inserimento rapido per acqua, caffeina, creatina ecc. con un proprio obiettivo giornaliero.",
    "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter).": "Riunisci gli ingredienti in una ricetta, dividi per porzioni e registrala come un alimento (scheda propria).",
    "Notizen": "Note",
    "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten.": "Testo libero per pasti e giorni (fame, allenamento, umore). Le note esistenti vengono mantenute se disattivi la funzione.",
    "Körpermaße und Fortschrittsfotos": "Misure corporee e foto dei progressi",
    "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht.": "Circonferenze (vita, torace, braccio …) con storico, e foto con confronto, nella scheda Peso.",
    "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit).": "Monitora e analizza fibre, zuccheri, sale e grassi saturi degli alimenti (li fornisce Open Food Facts).",
    "Montag": "Lunedì",
    "Dienstag": "Martedì",
    "Mittwoch": "Mercoledì",
    "Donnerstag": "Giovedì",
    "Freitag": "Venerdì",
    "Samstag": "Sabato",
    "Sonntag": "Domenica",
    "wie Standard": "come predefinito",
    "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros.": "Calorie vuote = vale l’obiettivo giornaliero predefinito qui sopra. I macronutrienti vuoti mostrano “–”. Con “Calcola le calorie dai macronutrienti” (sopra) le calorie seguono i macronutrienti.",
    "Tagesziel-Profile": "Profili di obiettivo giornaliero",
    "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel.": "es. “Allenamento” e “Giorno di riposo”. Un trigger (Impostazioni → Trigger → “Allora: cambia obiettivo giornaliero”) assegna al giorno un profilo, ad esempio quando la persona è in palestra. Il profilo ha la precedenza sull’obiettivo del giorno della settimana.",
    "Profil löschen": "Elimina profilo",
    "Profil „{}“ löschen? Trigger dafür werden ebenfalls gelöscht.": "Eliminare il profilo “{}”? Vengono eliminati anche i relativi trigger.",
    "Noch keine Profile.": "Ancora nessun profilo.",
    "Neues Profil": "Nuovo profilo",
    "+ Profil": "+ Profilo",
    "Einheit": "Unità",
    "Schritt": "Passo",
    "„{}“ samt Verlauf löschen?": "Eliminare “{}” compreso lo storico?",
    "Neu, z. B. Magnesium": "Nuovo, es. magnesio",
    "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch.": "Per riga: nome, unità, obiettivo giornaliero e passo dei pulsanti +/− nel diario.",
    "Feste Mahlzeiten (Frühstück, Mittagessen, …)": "Pasti fissi (colazione, pranzo, …)",
    "Uhrzeiten (08:47 …, 11:30 …)": "Orari (08:47 …, 11:30 …)",
    "Automatisch (Windows-Look bei HA-95/98-Theme)": "Automatico (aspetto Windows con tema HA 95/98)",
    "Standard (HA-Theme)": "Predefinito (tema HA)",
    "Windows-Look": "Aspetto Windows",
    "Darstellung": "Aspetto",
    "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende.": "Le voci esistenti vengono mantenute; le voci senza ora compaiono alla fine nella vista per orario.",
    "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten": "Avvia subito lo scanner di codici a barre all’apertura su questo dispositivo",
    "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.": "Per un widget della schermata iniziale dell’app Companion: crea lì un collegamento a questo pannello e la fotocamera si apre subito.",
    "Optik": "Aspetto",
    "Nach oben": "Sposta su",
    "Nach unten": "Sposta giù",
    "Nur an bestimmten Tagen anzeigen": "Mostra solo in certi giorni",
    "Wieder einblenden": "Mostra di nuovo",
    "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Nascondi (visibile solo nei giorni con voci)",
    "Ausblenden": "Nascondi",
    "{} – blende sie stattdessen mit ⊘ aus.": "{} – nascondilo invece con ⊘.",
    "Neue Mahlzeit, z. B. Nachtschicht": "Nuovo pasto, es. turno di notte",
    "nur an Tagen: {}": "solo nei giorni: {}",
    "Regel bearbeiten": "Modifica regola",
    "Regel löschen": "Elimina regola",
    "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "Con ⚡ mostri un pasto solo nei giorni in cui, ad esempio, il tuo calendario ha un certo evento. Con ⊘ lo nascondi in modo permanente (resta visibile solo nei giorni con voci); si può eliminare solo un pasto vuoto.",
    "Trigger": "Trigger",
    "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Registra alimenti o pasti automaticamente quando Home Assistant segnala qualcosa (posizione, calendario, interruttore …). Si possono creare anche con ⚡ sugli alimenti.",
    "Letzter Fehler ({}): {}": "Ultimo errore ({}): {}",
    "Aktiv": "Attivo",
    "pausiert bis {}": "in pausa fino al {}",
    "· {} Tage im Voraus": "· {} giorni in anticipo",
    "· zuletzt {}": "· ultimo {}",
    "Pausieren …": "Pausa …",
    "Jetzt testen (trägt heute ein)": "Prova ora (registra per oggi)",
    "Eingetragen.": "Registrato.",
    "Noch keine Trigger.": "Ancora nessun trigger.",
    "Prüfe …": "Controllo in corso …",
    "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "Nessun accesso a Home Assistant (manca SUPERVISOR_TOKEN).",
    "Geprüft {}, nichts zu tun.": "Controllato {}, niente da fare.",
    "Jetzt prüfen": "Controlla ora",
    "Version": "Versione",
    "Installiert: ": "Installata: ",
    "Nach Updates suchen": "Cerca aggiornamenti",
    "Keine Verbindung zu GitHub.": "Nessuna connessione a GitHub.",
    "Version {} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.": "È disponibile la versione {}. In Home Assistant vai su Impostazioni → Componenti aggiuntivi, cerca aggiornamenti e aggiorna.",
    "Du hast die aktuelle Version.": "Hai l’ultima versione.",
    "+ Neuer Trigger": "+ Nuovo trigger",
    "Trigger-Verlauf": "Cronologia dei trigger",
    "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.": "Ciò che i trigger hanno registrato per ultimo. “Annulla” rimuove di nuovo le voci; il trigger in quel giorno non registra più.",
    "Trigger gelöscht": "Trigger eliminato",
    "(gelöscht)": "(eliminato)",
    "Einträge nicht mehr vorhanden": "Le voci non esistono più",
    "Rückgängig": "Annulla",
    "Erinnerung": "Promemoria",
    "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde.": "Notifica tramite Home Assistant se entro l’ora scelta non è stato registrato nulla.",
    "Erinnerung aktiv": "Promemoria attivo",
    "Benachrichtigungsdienst": "Servizio di notifica",
    "Automatische Sicherung": "Backup automatico",
    "Täglich eine JSON-Sicherung in {}, Aufbewahrung {} Tage (Add-on-Option „backup_keep_days“).": "Un backup JSON giornaliero in {}, conservato per {} giorni (opzione del componente “backup_keep_days”).",
    "Aus (Add-on-Option „auto_backup“).": "Disattivato (opzione del componente “auto_backup”).",
    "· {} KB": "· {} KB",
    "Wiederherstellen": "Ripristina",
    "Noch keine Sicherung.": "Ancora nessun backup.",
    "Jetzt sichern": "Esegui backup ora",
    "Schnittstelle für Automationen": "Interfaccia per automazioni",
    "Aktiv. Deine Benutzer-ID: {}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.": "Attiva. Il tuo ID utente: {}. Esempi di chiamata (rest_command) si trovano nella documentazione del componente.",
    "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.": "Disattivata. Per attivarla imposta una chiave “api_key” nelle opzioni del componente. Bilance, assistenti vocali o automazioni possono poi inviare voci e peso.",
    "Daten": "Dati",
    "Export/Import betrifft nur dein Benutzerkonto.": "Esportazione/importazione riguarda solo il tuo account utente.",
    "Sicherung (JSON)": "Backup (JSON)",
    "Tagebuch als CSV": "Diario come CSV",
    "Datei nicht lesbar:": "File non leggibile:",
    "Sicherung einspielen": "Ripristina backup",
    "MyFitnessPal-CSV importieren": "Importa CSV di MyFitnessPal",
    "Keine gültige Sicherung:": "Backup non valido:",
    "Sicherung wiederherstellen": "Ripristina backup",
    "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt.": "Tutti i dati attuali del tuo account verranno sostituiti dal backup.",
    "Jetzt": "Adesso",
    "Sicherung": "Backup",
    "Gewichtswerte": "Valori di peso",
    "Zeitraum": "Periodo",
    "Wiederhergestellt.": "Ripristinato.",
    "Ersetzen": "Sostituisci",
    "Sprache und Einheiten": "Lingua e unità",
    "Sprache": "Lingua",
    "Einheiten": "Unità",
    "Automatisch (Browser)": "Automatica (browser)",
    "Metrisch (kg, cm)": "Metrico (kg, cm)",
    "Imperial (lb, in)": "Imperiale (lb, in)",
    "Teilen …": "Condividi …",
    "„{}“ teilen": "Condividi “{}”",
    "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Porzione come multiplo della voce (1 = stessa quantità). La voce compare nel diario degli altri nello stesso giorno.",
    "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Quantità per ogni persona in grammi. La voce compare nel diario degli altri nello stesso giorno.",
    "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein.": "Nessun altro partecipa ancora alla famiglia. Ogni utente attiva “Famiglia” in Impostazioni → Funzioni opzionali.",
    "Bitte mindestens eine Person wählen.": "Scegli almeno una persona.",
    "Eingetragen bei {} Person(en).": "Registrato per {} persona/e.",
    "Haushalt": "Famiglia",
    "Einträge mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Condividi voci con altri utenti, ciascuno con la propria porzione (es. un piatto per la famiglia). Entrambe le parti devono attivare la funzione.",
    "Benutzerverwaltung": "Gestione utenti",
    "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer).": "Visibile solo agli amministratori (opzione del componente “admin_users”; vuoto = il primo utente).",
    "Benutzer": "Utente",
    "Zuletzt": "Ultimo",
    "Export": "Esporta",
    "Admin": "Admin",
    "Alle Daten von „{}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:": "Eliminare definitivamente tutti i dati di “{}”? Inserisci il nome per confermare:",
    "Nur für Administratoren": "Solo per amministratori",
    "Das eigene Konto kann hier nicht gelöscht werden": "Il tuo account non può essere eliminato qui",
    "Zur Bestätigung den Namen des Benutzers eingeben": "Inserisci il nome dell’utente per confermare",
    "Haushaltsfunktion ist nicht aktiviert": "La funzione Famiglia non è attivata",
    "Dieser Benutzer nimmt nicht am Haushalt teil": "Questo utente non partecipa alla famiglia",
    "Weitere Importe": "Altre importazioni",
    "Weitere Importe …": "Altre importazioni …",
    "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.": "L’importazione riguarda solo il tuo account utente. I dati esistenti vengono mantenuti, a meno che tu non scelga esplicitamente “sostituisci”.",
    "CSV aus einer anderen App": "CSV da un’altra app",
    "Datei wählen": "Scegli file",
    "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.": "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) e tabelle simili. Le colonne vengono riconosciute e possono essere corrette.",
    "Apple Health": "Apple Salute",
    "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.": "export.zip o export.xml dall’app Salute (profilo → esporta dati sanitari). Il file viene letto direttamente nel browser; vengono caricati solo i valori giornalieri.",
    "Messart": "Metrica",
    "Natrium": "Sodio",
    "Bitte die Spalte mit dem Datum zuordnen.": "Assegna la colonna della data.",
    "{} Einträge, {} Gewichtswerte aus {} Zeilen.": "{} voci, {} valori di peso da {} righe.",
    "CSV importieren": "Importa CSV",
    "Erkannt: {}": "Riconosciuto: {}",
    "Zuordnung der Spalten": "Assegnazione delle colonne",
    "– nicht vorhanden –": "– non presente –",
    "Einheit der Gewichtsspalte": "Unità della colonna del peso",
    "Stone": "Stone",
    "Lese Datei …": "Lettura del file …",
    "Lese Datei … {} %": "Lettura del file … {} %",
    "Keine gültige ZIP-Datei.": "Non è un file ZIP valido.",
    "Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.": "File ZIP molto grande (ZIP64): decomprimilo e scegli export.xml.",
    "In der ZIP-Datei wurde keine export.xml gefunden.": "Nessun export.xml trovato nel file ZIP.",
    "Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.": "Questo browser non può decomprimere il file. Decomprimilo e scegli export.xml.",
    "{} Gewichtswerte, {} Tage mit Ernährungsdaten gefunden.": "Trovati {} valori di peso e {} giorni con dati nutrizionali.",
    "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)": "Importa il peso (un valore al giorno, i valori esistenti vengono sovrascritti)",
    "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)": "Importa i totali nutrizionali giornalieri (un inserimento rapido al giorno, utile solo se altrimenti non registri qui i tuoi pasti)",
    "Importiert: {} Tage, {} Gewichtswerte.": "Importati: {} giorni, {} valori di peso.",
    "Die Datei enthält keine Datenzeilen.": "Il file non contiene righe di dati.",
    "Export für Berater und Trainer": "Esportazione per dietista e allenatore",
    "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum.": "Un rapporto da stampare o salvare come PDF (scegli “Salva come PDF” nella finestra di stampa) e una tabella dei valori giornalieri. Contiene solo il periodo scelto.",
    "Von": "Da",
    "Bis": "A",
    "Einzelne Einträge im Bericht auflisten": "Elenca le singole voci nel rapporto",
    "Bericht öffnen (Drucken / PDF)": "Apri rapporto (stampa / PDF)",
    "Tagesübersicht (CSV)": "Panoramica giornaliera (CSV)",
    "Makro-Verlauf": "Storico dei macronutrienti",
    "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage.": "Barre: grammi al giorno. Tratteggiato: obiettivo giornaliero. Linea continua: media degli ultimi 7 giorni.",
    "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen.": "Barre: grammi al giorno. Linea continua: media degli ultimi 7 giorni. Puoi impostare un obiettivo per questo macronutriente in Impostazioni → Obiettivi giornalieri.",
    "{} g (Ziel {} g)": "{} g (obiettivo {} g)",
    "Ø 7 Tage {} g": "Ø 7 giorni {} g",
    "nicht erfasst": "non registrato",
    "Online suchen & vergleichen": "Cerca online e confronta",
    "Name oder Barcode": "Nome o codice a barre",
    "Quelle": "Fonte",
    "KH": "Carboidrati",
    "Fett": "Grassi",
    "Abweichung": "Scostamento",
    "Abweichung der kcal von dem Wert im Formular": "Scostamento delle kcal dal valore nel modulo",
    "Übernehmen": "Applica",
    "Mittelwert der gewählten übernehmen": "Applica la media dei selezionati",
    "Suche …": "Ricerca in corso …",
    "Alle Werte pro 100 g.": "Tutti i valori per 100 g.",
    "Die Quellen weichen bei kcal um bis zu {} % voneinander ab – bitte prüfen.": "Le fonti differiscono fino al {} % nelle kcal – controlla.",
    "nicht erreichbar": "non raggiungibile",
    "Weitere Datenquellen": "Altre fonti di dati",
    "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet).": "Ricerca online in Open Food Facts e USDA, con confronto dei valori tra loro e con i tuoi (i termini di ricerca vengono inviati a questi servizi).",
    "Weitere Datenquellen sind nicht aktiviert": "Altre fonti di dati non sono attivate",
    "Suchbegriff oder Barcode angeben": "Inserisci un termine di ricerca o un codice a barre",
    "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)": "Limite USDA raggiunto (imposta la tua chiave api.data.gov nelle opzioni del componente)",
    "Open Food Facts nicht erreichbar": "Open Food Facts non raggiungibile",
    "Mahlzeit enthält noch Einträge": "Il pasto contiene ancora voci",
    "Mahlzeit ist leer": "Il pasto è vuoto",
    "Mahlzeit braucht mindestens eine Komponente": "Il pasto richiede almeno un componente",
    "Keine MyDietAssistant-Sicherung": "Non è un backup di MyDietAssistant",
    "Das sieht nicht nach einem MyFitnessPal-Export aus.": "Non sembra un’esportazione di MyFitnessPal.",
    "Home Assistant nicht erreichbar": "Home Assistant non raggiungibile",
    "Uhrzeit (HH:MM) erforderlich": "Ora (HH:MM) obbligatoria",
    "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben": "indica esattamente uno tra pasto / alimento / profilo di obiettivo",
    "weitere Bedingung: Art und Entität erforderlich": "ulteriore condizione: tipo ed entità obbligatori",
    "Name und Kalorien erforderlich": "Nome e calorie obbligatori",
    "ungültiger Zeitraum": "periodo non valido",
    "Quell- und Zieltag sind gleich": "Il giorno di origine e quello di destinazione coincidono",
    "Sicherung nicht gefunden": "Backup non trovato",
    "Externe API ist aus: Option api_key im Add-on setzen": "L’API esterna è disattivata: imposta l’opzione api_key nel componente",
    "falscher Schlüssel": "chiave errata",
    "Lebensmittel „{}“ nicht gefunden": "Alimento “{}” non trovato",
    "food oder name angeben": "indica alimento o nome",
    "kg außerhalb des gültigen Bereichs": "kg fuori dall’intervallo valido",
    "Uhrzeit fehlt": "ora mancante",
    "Benachrichtigungsdienst wie notify.mobile_app_handy angeben": "indica un servizio di notifica come notify.mobile_app_telefono",
    "not found": "non trovato",
    "Aktivität": "Attività",
    "Aktivität eintragen": "Registra attività",
    "Schritte": "Passi",
    "Verbrannt": "Bruciate",
    "Zum Tagesziel": "Aggiunte all’obiettivo",
    "aus Schritten geschätzt": "stimato dai passi",
    "Eintragen": "Registra",
    "Aus Home Assistant lesen": "Leggi da Home Assistant",
    "Handeingabe verwerfen": "Scarta inserimento manuale",
    "Dein Tagesziel (+{} kcal Aktivität)": "Il tuo obiettivo giornaliero (+{} kcal attività)",
    "Tagesziel ({}) (+{} kcal Aktivität)": "Obiettivo giornaliero ({}) (+{} kcal attività)",
    "(+{} kcal Aktivität)": "(+{} kcal attività)",
    "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben.": "I valori digitati a mano non vengono più sovrascritti dai sensori per questo giorno.",
    "Verbrannte Kalorien (kcal)": "Calorie bruciate (kcal)",
    "leer = aus Schritten schätzen": "vuoto = stima dai passi",
    "{} % der verbrannten Kalorien": "{} % delle calorie bruciate",
    "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen.": "Sensori di Home Assistant che contano durante il giorno e si azzerano a mezzanotte (un contatore che cresce soltanto può diventare giornaliero con l’helper “Utility Meter”). Il componente li legge ogni cinque minuti. Senza sensore delle calorie, le calorie vengono stimate da passi, peso corporeo e dal fattore qui sotto; i valori si possono anche digitare a mano.",
    "Sensor für Schritte": "Sensore dei passi",
    "Sensor für aktive Kalorien (kcal)": "Sensore delle calorie attive (kcal)",
    "Anteil, der das Tagesziel erhöht (%)": "Quota che aumenta l’obiettivo giornaliero (%)",
    "kcal je Schritt und kg Körpergewicht": "kcal per passo e kg di peso corporeo",
    "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind.": "Molte app accreditano solo una parte delle calorie bruciate (50 % è un valore prudente) perché i dati sull’attività sono spesso sovrastimati.",
    "z. B. sensor.handy_schritte": "es. sensor.telefono_passi",
    "z. B. sensor.handy_aktive_kalorien": "es. sensor.telefono_calorie_attive",
    "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages.": "Passi e calorie bruciate (da sensori di Home Assistant o a mano) aumentano l’obiettivo calorico di quel giorno.",
    "Mahlzeiten-Zeitplan": "Orario dei pasti",
    "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung.": "Una fascia oraria per pasto: il diario mostra quale pasto è in programma e può inviare una notifica.",
    "Jetzt: {}": "Ora: {}",
    "({} Uhr)": "({})",
    "Als Nächstes: {} ab {} Uhr": "Prossimo: {} dalle {}",
    "schon eingetragen": "già registrato",
    "+ Hinzufügen": "+ Aggiungi",
    "Von (leer = Standardfenster)": "Dalle (vuoto = fascia predefinita)",
    "Bis (leer = Standardfenster)": "Alle (vuoto = fascia predefinita)",
    "Standardfenster": "Fascia predefinita",
    "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.": "Fascia oraria per pasto. Se lasciata vuota vale una fascia predefinita (colazione, pranzo e cena); gli spuntini non ne hanno. Sono possibili fasce che superano la mezzanotte.",
    "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist": "Avvisa quando un pasto è in programma e ancora vuoto",
    "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten.": "Usa il servizio di notifica di “Promemoria” qui sotto.",
    "Zwischenspeicher der Online-Suche": "Cache della ricerca online",
    "Zwischenspeicher leeren": "Svuota cache",
    "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch.": "Il componente memorizza localmente le ricerche su Open Food Facts e USDA (codici a barre 60 giorni, termini di ricerca 14 giorni), così le ricerche ripetute non vanno più su internet. Vengono salvati solo i dati dei prodotti, nulla sul tuo diario.",
    "{} gespeicherte Abfragen ({} KB)": "{} ricerche memorizzate ({} KB)",
    "Barcode scannen": "Scansiona codice a barre",
    "Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.": "Impossibile caricare il lettore di codici a barre. Digita il numero.",
    "Mehr laden": "Carica altro",
    "Tabelle importieren …": "Importa tabella …",
    "Werte online prüfen": "Controlla i valori online",
    "Prüfen": "Controlla",
    "Anhalten": "Ferma",
    "Ignorieren": "Ignora",
    "Prüfe {} von {} …": "Controllo {} di {} …",
    "Nur Lebensmittel mit Barcode ({} von {})": "Solo alimenti con codice a barre ({} di {})",
    "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)": "Interroga anche USDA (limite di richieste rigido senza chiave personale)",
    "Online-Abfrage nicht möglich: {}": "Ricerca online non possibile: {}",
    "Dein Wert: {} kcal · KH {} · Fett {} · Eiweiß {}": "Il tuo valore: {} kcal · carboidrati {} · grassi {} · proteine {}",
    "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst.": "Confronta i tuoi alimenti con Open Food Facts (per codice a barre, altrimenti per nome) e mostra gli scostamenti di calorie e macronutrienti. Non cambia nulla finché non scegli “Applica”. Le ricerche vengono messe in cache localmente; codici a barre o nomi vengono inviati al servizio.",
    "Lebensmittel-Tabelle importieren": "Importa tabella alimenti",
    "Lebensmittel-Tabelle": "Tabella alimenti",
    "Energie (kJ)": "Energia (kJ)",
    "Bitte die Spalten für Name und Kalorien zuordnen.": "Assegna le colonne per nome e calorie.",
    "{} Lebensmittel erkannt ({} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.": "{} alimenti riconosciuti ({} righe senza nome o calorie vengono saltate). I valori sono per 100 g.",
    "Kategorie für Lebensmittel ohne Kategorie in der Datei": "Categoria per gli alimenti importati",
    "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Gli alimenti esistenti con lo stesso nome e la stessa marca restano invariati.",
    "Importiert: {} neu, {} schon vorhanden, {} übersprungen.": "Importati: {} nuovi, {} già presenti, {} saltati.",
    "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.": "Una tabella nutrizionale (ad es. BLS, un’esportazione di Open Food Facts o una tua lista) come file CSV o Excel: gli alimenti con valori per 100 g vengono aggiunti alla tua libreria.",
    "Mit dem Haushalt teilen": "Condividi con la famiglia",
    "Teilen": "Condividi",
    "{} kopiert, {} übersprungen.": "{} copiati, {} saltati.",
    "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen.": "Le persone scelte ricevono una propria copia nella loro libreria. Le voci con lo stesso nome restano invariate, le modifiche successive non vengono sincronizzate.",
    "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Condividi voci, alimenti e pasti con altri utenti, ciascuno con la propria porzione (es. un piatto per la famiglia). Entrambe le parti devono attivare la funzione.",
    "Lebensmittelmengen": "Quantità degli alimenti",
    "Gramm": "Grammi",
    "Unzen (oz)": "Once (oz)",
    "Menge (oz)": "Quantità (oz)",
    "Portion (oz)": "Porzione (oz)",
    "Gewicht fertig (oz, optional)": "Peso da cotto (oz, facoltativo)",
    "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Quantità per ogni persona in once. La voce compare nel diario degli altri nello stesso giorno.",
    "Gesamt: {}": "Totale: {}",
    "pro Portion ({})": "per porzione ({})",
    "Pro Portion ({}): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Per porzione ({}): {} kcal · carboidrati {} g · grassi {} g · proteine {} g · {} porzioni",
    "Gemeinsame Haushaltsbibliothek": "Libreria familiare condivisa",
    "Für den Haushalt freigegeben": "Condiviso con la famiglia",
    "geteilt": "condiviso",
    "von {}": "da {}",
    "Gehört {}. Änderungen gelten für alle im Haushalt.": "Appartiene a {}. Le modifiche valgono per tutti in famiglia.",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)": "Offri nella libreria familiare condivisa (gli altri possono usarlo e modificarlo)",
    "Aus Mealie …": "Da Mealie …",
    "Rezept aus Mealie": "Ricetta da Mealie",
    "In Mealie suchen…": "Cerca in Mealie…",
    "Weitere laden": "Carica altro",
    "{} Portionen": "{} porzioni",
    "Mealie": "Mealie",
    "Adresse": "Indirizzo",
    "API-Token": "Token API",
    "Gespeichert (leer lassen = unverändert)": "Salvato (lascia vuoto per mantenerlo)",
    "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert.": "La ricetta viene letta dal tuo server Mealie e i suoi ingredienti vengono abbinati ai tuoi alimenti; controlli tutto prima del salvataggio. In Mealie non viene modificato nulla.",
    "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren.": "Acquisisci ricette da un server Mealie. Inserisci l’indirizzo del server (rete domestica o componente aggiuntivo) e un token API di Mealie (profilo → token API). Il componente legge soltanto le ricette e non modifica nulla in Mealie. Il token resta nel componente e non fa parte dell’esportazione. Svuota l’indirizzo per rimuoverlo.",
    "Von Webseite …": "Da pagina web …",
    "Rezept von Webseite": "Ricetta da pagina web",
    "Lade …": "Caricamento …",
    "Adresse der Rezeptseite": "Indirizzo della pagina della ricetta",
    "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Il componente scarica la pagina e cerca i dati della ricetta (ingredienti, porzioni, preparazione). Gli ingredienti vengono abbinati ai tuoi alimenti; controlli tutto prima del salvataggio.",
    "Zubereitung": "Preparazione",
    "Zubereitung, ein Schritt pro Zeile": "Preparazione, un passaggio per riga",
    "Angabe der Webseite: {} kcal pro Portion": "Indicato dalla pagina web: {} kcal per porzione",
    "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "1 ingrediente non abbinato (rosso): scegli un alimento con ⇄, altrimenti conta 0 kcal. Compila le quantità mancanti.",
    "{} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "{} ingredienti non abbinati (rosso): scegli un alimento con ⇄, altrimenti contano 0 kcal. Compila le quantità mancanti.",
    "Bitte eine Adresse mit http:// oder https:// angeben.": "Inserisci un indirizzo che inizi con http:// o https://",
    "Die Adresse wurde nicht gefunden.": "Indirizzo non trovato.",
    "Adressen im lokalen Netz sind nicht erlaubt.": "Gli indirizzi della rete locale non sono consentiti.",
    "Die Seite ist zu groß.": "La pagina è troppo grande.",
    "Zu viele Weiterleitungen.": "Troppi reindirizzamenti.",
    "Die Seite konnte nicht geladen werden.": "Impossibile caricare la pagina.",
    "Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).": "Nessuna ricetta trovata in questa pagina (mancano i dati strutturati della ricetta).",
    "Das Rezept enthält keine Zutaten.": "La ricetta non contiene ingredienti.",
    "Rezepte sind nicht aktiviert": "Le ricette non sono attivate",
    "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf": "Recupera passi e calorie degli ultimi 30 giorni dallo storico di Home Assistant",
    "Verlauf nachladen": "Carica storico",
    "Verlauf nachgeladen: {} Tage.": "Storico caricato: {} giorni.",
    "Zeitraum: 1 bis 365 Tage": "Periodo: da 1 a 365 giorni",
    "Zuerst einen Sensor für Schritte oder Kalorien wählen": "Scegli prima un sensore di passi o di calorie",
    "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)": "Home Assistant non ha restituito lo storico (recorder attivo?)",
    "Ungültige Entität": "Entità non valida",
    "Wert außerhalb des Bereichs": "Valore fuori intervallo",
    "Nur im Home-Assistant-Add-on möglich": "Possibile solo all’interno del componente aggiuntivo di Home Assistant",
    "Leere Datei": "File vuoto",
    "Die Datei konnte nicht gelesen werden.": "Impossibile leggere il file.",
    "Die Excel-Datei enthält kein Tabellenblatt.": "Il file Excel non contiene fogli di lavoro.",
    "Zu viele Zeilen (höchstens 50 000)": "Troppe righe (50.000 al massimo)",
    "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Assegna le colonne per nome e calorie (kcal o kJ)",
    "Mahlzeiten-Vorschläge": "Suggerimenti di pasti",
    "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben).": "Pulsante nel diario: propone pasti salvati e combinazioni del tuo storico che si adattano alle calorie e ai macronutrienti rimanenti (le quantità vengono adattate, le confezioni fisse restano).",
    "Mahlzeit vorschlagen": "Suggerisci un pasto",
    "Rest des Tages": "Resto della giornata",
    "Anteil für diese Mahlzeit": "Quota per questo pasto",
    "Ziel für diese Mahlzeit: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Obiettivo per questo pasto: {} kcal · carboidrati {} g · grassi {} g · proteine {} g",
    "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.": "Hai già raggiunto il tuo obiettivo giornaliero – non c’è nulla da integrare.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf.": "Ancora nessun suggerimento: salva pasti nel diario con “Salva / Copia”, oppure mangia le combinazioni almeno due volte, e compariranno qui.",
    "Weitere Vorschläge": "Altri suggerimenti",
    "Beigabe": "Componente",
    "aus dem Verlauf ({}×)": "dal tuo storico ({}×)",
    "Gespeichert": "Salvato",
    "Abweichung vom Ziel: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Scostamento dall’obiettivo: {} kcal · carboidrati {} g · grassi {} g · proteine {} g",
    "Danach am Tag noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Ancora aperto per il resto della giornata: {} kcal · carboidrati {} g · grassi {} g · proteine {} g",
    "Anpassen": "Modifica",
    "Fertig": "Fatto",
    "Prioritäten und Beigaben": "Priorità e aggiunte",
    "Trainingstag": "Giorno di allenamento",
    "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen.": "Scegli lo shake e il suo obiettivo in “Priorità e aggiunte”, poi posso calcolare le quantità.",
    "Der Shake ist für heute schon eingetragen.": "Lo shake è già registrato per oggi.",
    "Shake": "Shake",
    "Ziel für den Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Obiettivo per lo shake: {} kcal · carboidrati {} g · grassi {} g · proteine {} g",
    "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel.": "Per lo shake non si può calcolare nessun suggerimento: imposta almeno un obiettivo nelle impostazioni.",
    "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig.": "Con questo raggiungi il tuo obiettivo giornaliero – non resta nulla per una cena.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“.": "Ancora nessun suggerimento: salva pasti nel diario con “Salva / Copia”.",
    "Noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Ancora aperto: {} kcal · carboidrati {} g · grassi {} g · proteine {} g",
    "Offen nach dem Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Aperto dopo lo shake: {} kcal · carboidrati {} g · grassi {} g · proteine {} g",
    "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein.": "Il tuo shake dopo l’allenamento: l’app calcola le quantità in modo che raggiunga l’obiettivo e propone poi cene per il resto della giornata. Lo shake deve essere salvato come pasto.",
    "– kein Shake –": "– nessuno shake –",
    "Was der Shake liefern soll (leer = egal)": "Cosa deve fornire lo shake (vuoto = non importa)",
    "Shake eintragen in": "Registra lo shake in",
    "erste Mahlzeit": "primo pasto",
    "Abendessen eintragen in": "Registra la cena in",
    "erste freie Mahlzeit": "primo pasto libero",
    "Trigger tragen den Shake mit den berechneten Mengen ein": "I trigger registrano lo shake con le quantità calcolate",
    "Vorschläge einstellen": "Impostazioni dei suggerimenti",
    "Wichtigkeit": "Importanza",
    "egal": "non importa",
    "normal": "normale",
    "wichtig": "importante",
    "sehr wichtig": "molto importante",
    "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor.": "Più un valore è importante, più il suggerimento deve avvicinarvisi. I valori senza obiettivo vengono ignorati.",
    "Kalorienziel nie überschreiten": "Non superare mai l’obiettivo calorico",
    "Eiweißziel möglichst erreichen": "Raggiungere se possibile l’obiettivo proteico",
    "Beigaben": "Aggiunte",
    "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite.": "Alimenti che si abbinano a qualsiasi pasto (es. frutta secca). Un suggerimento li aggiunge solo se si adattano meglio al resto. Campi: minimo, massimo, passo.",
    "Mindestmenge": "Quantità minima",
    "Höchstmenge": "Quantità massima",
    "Schrittweite": "Dimensione del passo",
    "Beigabe hinzufügen": "Aggiungi un’aggiunta",
    "+ Beigabe": "+ Aggiunta",
    "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.": "Scalabile: segue il fattore di quantità del pasto. Fisso: resta uguale.",
    "Skalierbar": "Scalabile",
    "Fest": "Fisso",
    "Packung": "Confezione",
    "Abweichung ±": "Scostamento ±",
    "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)": "Quanto questo ingrediente può discostarsi dal rapporto con gli altri (in percentuale)",
    "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.": "Dimensione della confezione: il suggerimento usa tante confezioni quante impostate in “Numero”. Vuoto = esattamente la quantità salvata.",
    "Mengenfaktor für Vorschläge": "Fattore di quantità per i suggerimenti",
    "von": "da",
    "bis": "a",
    "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6.": "Di quanto l’intero pasto può essere ridotto o ingrandito nei suggerimenti (1 = quantità come salvata). Vuoto = da 0,6 a 1,6.",
    "Mahlzeiten-Vorschläge sind nicht aktiviert": "I suggerimenti di pasti non sono attivati",
    "Vorschlag ist leer": "Il suggerimento è vuoto",
    "Ungültige Werte": "Valori non validi",
    "Kleinster Faktor ist größer als der größte": "Il fattore minimo è maggiore di quello massimo",
    "Wie viele Packungen ein Vorschlag nehmen darf": "Quante confezioni può usare un suggerimento (da – a; 0 = può essere omessa)",
    "Anzahl": "Numero",
    "Ausschließen": "Escludi",
    "Ausgeschlossen": "Esclusi",
    "Zulassen": "Consenti",
    "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück.": "Questi pasti non compaiono più nei suggerimenti. Con “Consenti” tornano.",
    "Frühstück": "Colazione",
    "Mittagessen": "Pranzo",
    "Abendessen": "Cena",
    "Snacks": "Spuntini",
    "Mahlzeit": "Pasto",
    "Menge": "Quantità",
    "Die Makros ergeben {} g auf 100 g – mehr als möglich.": "I macronutrienti sommano {} g per 100 g – più del possibile.",
    "Die Makros ergeben rechnerisch ca. {} kcal, angegeben sind {} kcal.": "I macronutrienti sommano circa {} kcal, ma sono inserite {} kcal.",
    "{} Lebensmittel durch ausgeblendete Kategorien versteckt.": "{} alimenti nascosti da categorie nascoste.",
    "{}: Werte übernommen ✓": "{}: valori applicati ✓",
    "{}: {} kcal · KH {} · Fett {} · Eiweiß {} ({})": "{}: {} kcal · carboidrati {} · grassi {} · proteine {} ({})",
    "{} geprüft: {} stimmen überein, {} weichen ab, {} ohne Treffer.": "{} controllati: {} corrispondono, {} differiscono, {} senza corrispondenza.",
    "{} Einträge, {} Gewichtswerte ({} bis {}) aus {} Zeilen.": "{} voci, {} valori di peso ({} – {}) da {} righe.",
    "{} Tage ({} bis {}), {} Einträge, {} Gewichtswerte": "{} giorni ({} – {}), {} voci, {} valori di peso",
    "{} Uhr · {}": "{} · {}",
    "Die Excel-Datei ist zu groß.": "Il file Excel è troppo grande.",
    "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).": "Mealie non è ancora configurato (Impostazioni → Mealie).",
    "Mealie konnte nicht erreicht werden.": "Impossibile raggiungere Mealie.",
    "Bitte eine Adresse wie http://mealie:9000 angeben.": "Inserisci un indirizzo come http://mealie:9000.",
    "Nicht gefunden (Adresse oder Rezept prüfen).": "Non trovato (controlla l’indirizzo o la ricetta).",
    "Mealie antwortete mit Fehler {}.": "Mealie ha risposto con l’errore {}.",
    "Unter dieser Adresse läuft kein Mealie.": "A questo indirizzo non è in esecuzione nessun Mealie.",
    "Ungültiges Rezept.": "Ricetta non valida.",
    "Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).": "Questo indirizzo non è consentito (Mealie gira su un proprio server o componente).",
    "Mealie ist nicht erreichbar.": "Mealie non è raggiungibile.",
    "Die Seite antwortete mit Fehler {}.": "La pagina ha risposto con l’errore {}.",
    "Rezept": "Ricetta",
    "Wasser": "Acqua",
    "Koffein": "Caffeina",
    "Kreatin": "Creatina",
    "{} (Kopie)": "{} (copia)",
    "Daten löschen …": "Elimina dati …",
    "Daten löschen": "Elimina dati",
    "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an.": "Elimina definitivamente i dati scelti del tuo account. Gli altri utenti e le impostazioni restano invariati. Meglio creare prima un backup (JSON).",
    "Einträge, Notizen, Wasser und Aktivität aller Tage": "voci, note, acqua e attività di tutti i giorni",
    "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)": "tutti gli alimenti della libreria (le voci del diario restano)",
    "alle gespeicherten Mahlzeiten": "tutti i pasti salvati",
    "alle Rezepte samt ihrer Lebensmittel": "tutte le ricette compresi i loro alimenti",
    "Gewicht und Körpermaße": "Peso e misure corporee",
    "Gewichtswerte, Körpermaße und Fortschrittsfotos": "valori di peso, misure corporee e foto dei progressi",
    "Tagesziel, Wochentagsziele und Profile": "obiettivo giornaliero, obiettivi per giorno della settimana e profili",
    "alle Trigger und Mahlzeiten-Regeln samt Verlauf": "tutti i trigger e le regole dei pasti compreso lo storico",
    "Bitte mindestens einen Bereich wählen.": "Scegli almeno un’area.",
    "Bitte mindestens einen gültigen Bereich wählen.": "Scegli almeno un’area valida.",
    "Wirklich unwiderruflich löschen: {}?": "Eliminare davvero in modo definitivo: {}?",
    "Gelöscht.": "Eliminato.",
    "Endgültig löschen": "Elimina definitivamente",
    "Abendessen sollen das Eiweißziel möglichst erreichen": "Le cene dovrebbero raggiungere il più possibile l’obiettivo proteico",
    "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)": "Mostra il pulsante “Giorno di allenamento” ogni giorno (altrimenti solo quando lo shake è registrato o un trigger lo ha registrato)",
    "Einkaufsliste": "Lista della spesa",
    "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt.": "Scegli ricette (porzioni) e pasti salvati (multiplo, 1 = una volta): gli ingredienti vengono sommati.",
    "Noch nichts gewählt.": "Ancora nulla di scelto.",
    "In die Zwischenablage kopieren": "Copia negli appunti",
    "Kopiert ✓": "Copiato ✓",
    "An Home Assistant senden": "Invia a Home Assistant",
    "Todo-Liste": "Lista di cose da fare",
    "Keine Todo-Liste in Home Assistant gefunden.": "Nessuna lista di cose da fare trovata in Home Assistant.",
    "{} Einträge gesendet.": "{} voci inviate.",
    "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste).": "Somma gli ingredienti di ricette e pasti salvati, li copia o li invia a una lista di cose da fare in Home Assistant (es. la lista della spesa).",
    "Einkaufsliste nicht aktiviert": "La lista della spesa non è attivata",
    "Todo-Liste fehlt": "Lista di cose da fare mancante",
    "Keine Einträge": "Nessuna voce",
    "Home Assistant nicht erreichbar (gesendet: {})": "Home Assistant non raggiungibile (inviate: {})",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)": "Offri nella libreria familiare condivisa (gli altri possono usarlo e copiarlo)",
    "Wochenbericht": "Riepilogo settimanale",
    "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“.": "Una volta a settimana un riepilogo degli ultimi sette giorni come notifica. Usa il servizio di notifica di “Promemoria”.",
    "Wochenbericht aktiv": "Riepilogo settimanale attivo",
    "Wochentag": "Giorno della settimana",
    "Vorschau": "Anteprima",
    "Datenbank": "Database",
    "{} · {} Zeilen in {} Tabellen · frei {} · letzte Sicherung: {}": "{} · {} righe in {} tabelle · libero {} · ultimo backup: {}",
    "Prüfen und verdichten": "Controlla e compatta",
    "Prüfung läuft …": "Controllo in corso …",
    "Verdichtet: {} → {}": "Compattato: {} → {}",
    "Datenbank ist in Ordnung.": "Il database è a posto.",
    "Datenbank prüfen: {}": "Controllo del database: {}",
    "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)": "Riconosci anche a partire da queste calorie bruciate (kcal, 0 = disattivato)",
    "Wochentag ungültig": "Giorno della settimana non valido",
    "Andere dürfen es auch ändern": "Anche gli altri possono modificarlo",
    "Nährwert-Lücken (7 Tage)": "Carenze di nutrienti (7 giorni)",
    "Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; {} von {} Tagen erfasst.": "Media degli ultimi 7 giorni (solo giorni con valori) rispetto ai valori di riferimento; {} giorni su {} registrati.",
    "nicht genug Angaben": "dati insufficienti",
    "Ziele ändern": "Modifica gli obiettivi",
    "Ziele für weitere Nährwerte": "Obiettivi per altri nutrienti",
    "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze.": "Valori di riferimento al giorno in g. Le fibre vanno raggiunte; per zuccheri, sale e grassi saturi è un limite massimo.",
    "Weitere Nährwerte sind nicht aktiviert": "Altri nutrienti non sono attivati",
    "Ziele müssen zwischen 0 und 1000 liegen": "Gli obiettivi devono essere tra 0 e 1000",
    "Ø {} g (mind. {} g) – im Ziel": "Ø {} g (almeno {} g) – in linea con l’obiettivo",
    "Ø {} g (mind. {} g) – {} % unter dem Ziel": "Ø {} g (almeno {} g) – {} % sotto l’obiettivo",
    "Ø {} g (höchstens {} g) – im Ziel": "Ø {} g (al massimo {} g) – in linea con l’obiettivo",
    "Ø {} g (höchstens {} g) – {} % über dem Ziel": "Ø {} g (al massimo {} g) – {} % sopra l’obiettivo",
    "Aus Text …": "Da testo …",
    "Rezept aus Text": "Ricetta da testo",
    "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Incolla una ricetta come testo: prima il titolo, poi gli ingredienti (uno per riga, con la quantità) e la preparazione. Titoli come “Ingredienti” e “Preparazione” aiutano. Gli ingredienti vengono abbinati ai tuoi alimenti; controlli tutto prima del salvataggio.",
    "Rezepttext": "Testo della ricetta",
    "Im Text wurden keine Zutaten gefunden (Zeilen mit Mengen, z. B. „200 g Mehl“).": "Nel testo non sono stati trovati ingredienti (righe con quantità, es. “200 g di farina”).",
    "Der Text ist zu lang.": "Il testo è troppo lungo.",
    "Offline: 1 Eintrag wartet auf Verbindung.": "Offline: 1 voce attende la connessione.",
    "Offline: {} Einträge warten auf Verbindung.": "Offline: {} voci attendono la connessione.",
    "Hauptmenü": "Menu principale",
    "Zeitraum A, von": "Periodo A, dal",
    "Zeitraum A, bis": "Periodo A, al",
    "Zeitraum B, von": "Periodo B, dal",
    "Zeitraum B, bis": "Periodo B, al",
  },
  pt: {
    "Ernährung": "Alimentação",
    "Tagebuch": "Diário",
    "Lebensmittel": "Alimentos",
    "Mahlzeiten": "Refeições",
    "Rezepte": "Receitas",
    "Gewicht": "Peso",
    "Statistik": "Estatísticas",
    "Einstellungen": "Configurações",
    "Lokal": "Local",
    "Kategorien:": "Categorias:",
    "Ein-/ausblenden": "Mostrar/ocultar",
    "Vortag": "Dia anterior",
    "Folgetag": "Próximo dia",
    "Bearbeiten": "Editar",
    "Entfernen": "Remover",
    "Kalorien": "Calorias",
    "Kohlenhydrate": "Carboidratos",
    "Fette": "Gorduras",
    "Eiweiß": "Proteínas",
    "+ Nahrungsmittel hinzufügen": "+ Adicionar alimento",
    "Notiz zur Mahlzeit": "Nota desta refeição",
    "Tag": "Dia",
    "Notiz ändern": "Editar nota",
    "Notiz": "Nota",
    "Speichern / Kopieren": "Salvar / Copiar",
    "Mahlzeit leeren": "Esvaziar refeição",
    "Tag leeren": "Esvaziar dia",
    "Alle Einträge von „{}“ löschen?": "Excluir todos os registros de “{}”?",
    "Alle Einträge dieses Tages löschen?": "Excluir todos os registros deste dia?",
    "Einträge": "Registros",
    "Ausgeblendete Mahlzeiten wieder verbergen": "Ocultar novamente as refeições ocultas",
    "leere/ausgeblendete Mahlzeit anzeigen": "mostrar refeição vazia/oculta",
    "leere/ausgeblendete Mahlzeiten anzeigen": "mostrar refeições vazias/ocultas",
    "Tagesziel ({})": "Meta diária ({})",
    "Dein Tagesziel": "Sua meta diária",
    "Gesamt": "Total",
    "Verbleibend": "Restante",
    "Weitere Nährwerte": "Mais nutrientes",
    "Notiz zum Tag": "Nota do dia",
    "Ganzen Tag kopieren": "Copiar o dia inteiro",
    "z. B. Hunger, Training, Stimmung …": "ex.: fome, treino, humor …",
    "Notiz: {}": "Nota: {}",
    "Abbrechen": "Cancelar",
    "Speichern": "Salvar",
    "Auf den Tag": "Para o dia",
    "Mengenfaktor (1 = unverändert)": "Fator de quantidade (1 = inalterado)",
    "Bitte einen Tag wählen.": "Escolha um dia.",
    "Kopieren": "Copiar",
    "Wasser & Ergänzungen": "Água e suplementos",
    "Lebensmittel suchen…": "Pesquisar alimentos…",
    "Zurück": "Voltar",
    "g KH": "g de carboidratos",
    "g Fett": "g de gordura",
    "g Eiweiß": "g de proteína",
    "Menge (g)": "Quantidade (g)",
    "Ballaststoffe": "Fibras",
    "Zucker": "Açúcar",
    "Salz": "Sal",
    "ges. Fettsäuren": "gord. sat.",
    "Portion wählen …": "Escolher porção …",
    "Portion": "Porção",
    "Bezeichnung": "Descrição",
    "KH (g)": "Carboidratos (g)",
    "Fett (g)": "Gordura (g)",
    "Eiweiß (g)": "Proteína (g)",
    "Uhrzeit": "Hora",
    "Lebensmittel tauschen": "Trocar alimento",
    "Bezeichnung und kcal sind Pflicht.": "Descrição e kcal são obrigatórias.",
    "„{}“ tauschen": "Trocar “{}”",
    "Tauschen": "Trocar",
    "Schnelleingabe in „{}“": "Registro rápido em “{}”",
    "Schnelleingabe": "Registro rápido",
    "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“).": "Sem alimento, só calorias e, opcionalmente, macros (ex.: “Restaurante, cerca de 800 kcal”).",
    "z. B. Restaurant": "ex.: Restaurante",
    "Hinzufügen": "Adicionar",
    "Als Mahlzeit speichern": "Salvar como refeição",
    "Am Tag": "No dia",
    "Neue Uhrzeit (leer = Originalzeit)": "Nova hora (vazio = hora original)",
    "In Mahlzeit": "Na refeição",
    "Nichts ausgewählt.": "Nada selecionado.",
    "Name der Mahlzeit": "Nome da refeição",
    "z. B. Diät, Bulk (optional)": "ex.: Definição, Volume (opcional)",
    "Name": "Nome",
    "Kategorie": "Categoria",
    "Bitte einen Namen angeben.": "Informe um nome.",
    "Dieser Browser kann keine Barcodes lesen (BarcodeDetector fehlt). Bitte die Nummer eintippen.": "Este navegador não lê códigos de barras (falta o BarcodeDetector). Digite o número.",
    "Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.": "Sem acesso à câmera (a página precisa de HTTPS). Use “Foto” ou digite o número.",
    "Abgebrochen": "Cancelado",
    "Scan abbrechen": "Cancelar leitura",
    "Halte den Barcode ins Bild.": "Mantenha o código de barras à vista.",
    "Kamerazugriff wurde nicht erlaubt.": "O acesso à câmera não foi permitido.",
    "Kamera nicht verfügbar: {}": "Câmera indisponível: {}",
    "Auf dem Foto wurde kein Barcode erkannt.": "Nenhum código de barras foi encontrado na foto.",
    "z. B. 1 Scheibe": "ex.: 1 fatia",
    "Produkt nicht gefunden ({})": "Produto não encontrado ({})",
    "Barcode (Open Food Facts)": "Código de barras (Open Food Facts)",
    "Suchen": "Pesquisar",
    "Scannen (Kamera)": "Ler (câmera)",
    "Foto vom Barcode": "Foto do código de barras",
    "Marke": "Marca",
    "z. B. Diät, Bulk": "ex.: Definição, Volume",
    "Portion (g)": "Porção (g)",
    "kcal / 100 g": "kcal / 100 g",
    "KH / 100 g": "Carboidratos / 100 g",
    "Fett / 100 g": "Gordura / 100 g",
    "Eiweiß / 100 g": "Proteína / 100 g",
    "Portionsgrößen (optional)": "Tamanhos de porção (opcional)",
    "+ Portion": "+ Porção",
    "Name und kcal sind Pflicht.": "Nome e kcal são obrigatórios.",
    "Speichern & wählen": "Salvar e escolher",
    "Suchen…": "Pesquisar…",
    "★ Favoriten": "★ Favoritos",
    "Meine Mahlzeiten": "Minhas refeições",
    "Häufig verwendet": "Usados com frequência",
    "Beides": "Ambos", "Hinzufügen-Dialog": "Diálogo de adicionar", "„Häufig verwendet“ zeigt": "“Usados com frequência” mostra", "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten.": "Aplica-se ao separador “Alimentos” no diálogo de adicionar. O separador “As minhas refeições” mostra sempre as refeições mais usadas.",
    "Alle": "Todos",
    "Nichts gefunden – lege ein neues Lebensmittel an.": "Nada encontrado – crie um novo alimento.",
    "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆.": "Ainda sem favoritos – marque alimentos com ☆ na página “Alimentos”.",
    "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen.": "Nenhuma refeição salva. Crie uma no diário com “Salvar como refeição”.",
    "Portionen": "Porções",
    "+ Neues Lebensmittel": "+ Novo alimento",
    "Schnelleingabe (nur kcal)": "Registro rápido (só kcal)",
    "Schließen": "Fechar",
    "Zu „{}“ hinzufügen": "Adicionar a “{}”",
    "Eintrag hinzufügen": "Adicionar registro",
    "(Ziel {})": "(meta {})",
    "Trend {} kg": "Tendência {} kg",
    "Gewichtsverlauf": "Histórico de peso",
    "Verlauf": "Histórico",
    "zu wenig Daten": "dados insuficientes",
    "nicht absehbar": "não previsível",
    "erreicht": "atingida",
    "Lebensmittel bearbeiten": "Editar alimento",
    "Neues Lebensmittel": "Novo alimento",
    "Favorit entfernen": "Remover dos favoritos",
    "Als Favorit markieren": "Marcar como favorito",
    "Favorit": "Favorito",
    "Trigger anlegen": "Criar gatilho",
    "Löschen": "Excluir",
    "„{}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.": "Excluir “{}”? As refeições já registradas são mantidas.",
    "Nichts gefunden.": "Nada encontrado.",
    "Noch keine Lebensmittel angelegt.": "Ainda sem alimentos.",
    "Duplikate suchen": "Encontrar duplicados",
    "Doppelte Lebensmittel": "Alimentos duplicados",
    "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.": "Em cada grupo, escolha o alimento a manter. As refeições já registradas permanecem inalteradas.",
    "Keine Duplikate gefunden.": "Nenhum duplicado encontrado.",
    "Zusammenführen": "Mesclar",
    "Durch anderes Lebensmittel tauschen": "Trocar por outro alimento",
    "Mahlzeit bearbeiten": "Editar refeição",
    "Komponenten": "Componentes",
    "Komponente hinzufügen": "Adicionar componente",
    "+ Komponente": "+ Componente",
    "Kopie anlegen": "Criar cópia",
    "Mahlzeit „{}“ löschen?": "Excluir a refeição “{}”?",
    "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.": "Nenhuma refeição salva ainda – use “Salvar como refeição” no diário.",
    "Mahlzeiten suchen…": "Pesquisar refeições…",
    "wie Summe der Zutaten": "igual à soma dos ingredientes",
    "Gesamt: {} g": "Total: {} g",
    "pro Portion ({} g)": "por porção ({} g)",
    "Rezept bearbeiten": "Editar receita",
    "Neues Rezept": "Nova receita",
    "Gewicht fertig (g, optional)": "Peso cozido (g, opcional)",
    "Zutaten": "Ingredientes",
    "Noch keine Zutaten.": "Ainda sem ingredientes.",
    "Zutat hinzufügen": "Adicionar ingrediente",
    "+ Zutat": "+ Ingrediente",
    "Ungültige Einheit": "Unidade inválida",
    "Speichern und jetzt lesen": "Salvar e ler agora",
    "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen.": "O valor do sensor tem mais de 30 dias e não foi aproveitado.",
    "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).": "O valor está fora de 20 a 500 kg (verifique a unidade).",
    "Der Sensor liefert gerade keinen Zahlenwert.": "No momento o sensor não fornece um número.",
    "Home Assistant nicht erreichbar.": "O Home Assistant não está acessível.",
    "Zuerst einen Sensor wählen.": "Escolha primeiro um sensor.",
    "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.": "Novo valor detectado; será aproveitado quando estiver estável.",
    "Der aktuelle Wert ist schon übernommen.": "O valor atual já foi aproveitado.",
    "Übernommen: {} am {}": "Aproveitado: {} em {}",
    "Zuletzt übernommen: {} am {}": "Último aproveitado: {} em {}",
    "z. B. sensor.waage_gewicht": "ex.: sensor.peso_balanca",
    "Automatisch (Einheit des Sensors)": "Automática (unidade do sensor)",
    "Einheit des Sensors": "Unidade do sensor",
    "Sensor": "Sensor",
    "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg.": "Um sensor do Home Assistant com o peso corporal, por exemplo de uma balança inteligente. O complemento verifica a cada minuto; um novo valor é aproveitado quando não muda há um minuto e é salvo no dia da medição (um valor do mesmo dia é substituído). Valores razoáveis: 20 a 500 kg.",
    "Waage": "Balança",
    "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung).": "Aproveitar automaticamente o peso corporal de um sensor do Home Assistant, por exemplo de uma balança inteligente (com conversão de unidades).",
    "Waage (Sensor)": "Balança (sensor)",
    "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).": "Os ingredientes em laranja não estavam nos seus alimentos e foram completados com bancos de dados online (estimativas, confira).",
    "aus Open Food Facts": "do Open Food Facts",
    "aus USDA": "do USDA",
    "Pro Portion ({} g): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Por porção ({} g): {} kcal · carboidratos {} g · gordura {} g · proteína {} g · {} porções",
    "Rezept „{}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.": "Excluir a receita “{}”? O alimento correspondente também é excluído; as refeições já registradas são mantidas.",
    "Noch kein Rezept angelegt.": "Ainda sem receitas.",
    "Rezepte suchen…": "Pesquisar receitas…",
    "+ Neues Rezept": "+ Nova receita",
    "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel.": "Cada receita também aparece em Alimentos (por 100 g, com “1 porção”) e pode ser registrada em qualquer lugar. Alterações na receita atualizam esse alimento.",
    "1 Portion": "1 porção",
    "Rezept nicht gefunden": "Receita não encontrada",
    "Mindestens eine Zutat nötig.": "É necessário pelo menos um ingrediente.",
    "Portionen müssen größer als 0 sein.": "As porções devem ser maiores que 0.",
    "Jede Zutat braucht eine Menge in Gramm.": "Cada ingrediente precisa de uma quantidade em gramas.",
    "Gewicht nach dem Kochen muss größer als 0 sein.": "O peso cozido deve ser maior que 0.",
    "z. B. 78,5": "ex.: 78,5",
    "Gewicht eintragen": "Registrar peso",
    "Datum": "Data",
    "Gewicht ({})": "Peso ({})",
    "Zielgewicht ({})": "Peso-alvo ({})",
    "Gewünschte Änderung ({} pro Woche)": "Mudança desejada ({} por semana)",
    "Noch keine Gewichtswerte.": "Ainda sem valores de peso.",
    "Aktuell": "Atual",
    "Trend": "Tendência",
    "Veränderung": "Mudança",
    "Ziel": "Meta",
    "Prognose Ziel": "Previsão da meta",
    "30 Tage": "30 dias",
    "90 Tage": "90 dias",
    "1 Jahr": "1 ano",
    "7 Tage": "7 dias",
    "180 Tage": "180 dias",
    "14 Tage": "14 dias",
    "Kalorien und Gewicht": "Calorias e peso",
    "Kalorien (linke Achse)": "Calorias (eixo esquerdo)",
    "Gewicht und Trend (rechte Achse)": "Peso e tendência (eixo direito)",
    "Noch keine Gewichtswerte im Zeitraum.": "Ainda sem registros de peso neste período.",
    "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).": "Linha fina e pontos: medições. Linha grossa: tendência suavizada (sem as oscilações diárias).",
    "Trend aktuell {}{} {}/Woche.": "Tendência atual {}{} {}/semana.",
    "Mehr anzeigen": "Mostrar mais",
    "Alle {}": "Todos {}",
    "Weniger": "Menos",
    "Taille": "Cintura",
    "Brust": "Peito",
    "Hüfte": "Quadril",
    "Oberarm": "Braço",
    "Oberschenkel": "Coxa",
    "Körperfett %": "Gordura corporal %",
    "Bild konnte nicht gelesen werden": "Não foi possível ler a imagem",
    "Eigene Messung, z. B. Wade": "Medida personalizada, ex.: panturrilha",
    "Körpermaße": "Medidas corporais",
    "Werte, die Du nicht messen willst, einfach leer lassen.": "Deixe vazios os valores que você não quer medir.",
    "Weitere Messung": "Outra medida",
    "Wert": "Valor",
    "Bitte mindestens einen Wert eintragen.": "Informe pelo menos um valor.",
    "Noch keine Werte für diese Messung.": "Ainda sem valores para esta medida.",
    "Notiz (optional), z. B. Vorderansicht": "Nota (opcional), ex.: vista frontal",
    "Fortschrittsfotos": "Fotos de progresso",
    "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons.": "As fotos ficam no complemento do seu Home Assistant. Elas não fazem parte da exportação JSON nem dos backups automáticos, mas estão incluídas no backup do Home Assistant do complemento.",
    "Vergleichen": "Comparar",
    "Foto hinzufügen": "Adicionar foto",
    "Foto löschen": "Excluir foto",
    "Foto löschen?": "Excluir a foto?",
    "Noch keine Fotos.": "Ainda sem fotos.",
    "Fotos vergleichen": "Comparar fotos",
    "Ungültiger Wert für {}": "Valor inválido para {}",
    "Kein gültiges Bild": "Imagem inválida",
    "Bild leer oder zu groß (max. 8 MB)": "Imagem vazia ou grande demais (máx. 8 MB)",
    "Foto nicht gefunden": "Foto não encontrada",
    "Abnehmen": "Perder peso",
    "Halten": "Manter",
    "Zunehmen": "Ganhar peso",
    "Kalorienbilanz": "Balanço calórico",
    "Noch keine Einträge im Zeitraum.": "Nenhum registro neste período.",
    "Ø Aufnahme": "Ø ingestão",
    "Gewichtstrend": "Tendência do peso",
    "Überschuss / Tag": "Superávit / dia",
    "Defizit / Tag": "Déficit / dia",
    "Bilanz / Tag": "Balanço / dia",
    "Geschätzter Verbrauch": "Gasto estimado",
    "Aus {} Gewichtswerten und {} von {} erfassten Tagen (1 {} ≈ {} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.": "Com base em {} valores de peso e {} de {} dias registrados (1 {} ≈ {} kcal). Quanto mais completos o diário e as pesagens, mais preciso.",
    "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum.": "O cálculo precisa de pelo menos dois valores de peso com uma semana de intervalo no período selecionado.",
    "Du liegst im Plan.": "Você está no caminho certo.",
    "Der Trend liegt über dem Ziel.": "A tendência está acima da meta.",
    "Der Trend liegt unter dem Ziel.": "A tendência está abaixo da meta.",
    "Ziel: {}": "Meta: {}",
    "(Gewicht halten)": "(manter o peso)",
    "({} {}/Woche)": "({} {}/semana)",
    "· Trend aktuell {} {}/Woche. {}": "· tendência atual {} {}/semana. {}",
    "Für dieses Ziel passen ca. {} kcal am Tag (Dein Ziel: {}).": "Cerca de {} kcal por dia combinam com esta meta (sua meta: {}).",
    "Als Tagesziel übernehmen": "Usar como meta diária",
    "Ø Kalorien": "Ø calorias",
    "Erfasste Tage": "Dias registrados",
    "Ø Eiweiß": "Ø proteína",
    "Ø Kohlenhydrate": "Ø carboidratos",
    "Ø Fett": "Ø gordura",
    "Kalorien pro Tag": "Calorias por dia",
    "Gestrichelt: Tagesziel je Wochentag": "Tracejado: meta diária por dia da semana",
    "Gestrichelt: Tagesziel {} kcal": "Tracejado: meta diária {} kcal",
    "Nährwertverteilung (Ø)": "Distribuição de macros (Ø)",
    "Eiweiß {} %": "Proteína {} %",
    "Kohlenhydrate {} %": "Carboidratos {} %",
    "Fett {} %": "Gordura {} %",
    "Weitere Nährwerte (Ø pro Tag)": "Mais nutrientes (Ø por dia)",
    "Ø pro Tag": "Ø por dia",
    "Eingetragen": "Registrado",
    "Ziel erreicht": "Meta atingida",
    "Bericht & Zeitraum-Vergleich": "Relatório e comparação de períodos",
    "7 Tage vs. davor": "7 dias vs. antes",
    "30 Tage vs. davor": "30 dias vs. antes",
    "Eiweißziel erreicht": "Meta de proteína atingida",
    "Kalorien im Ziel": "Calorias dentro da meta",
    "Gewichtsänderung": "Mudança de peso",
    "Differenz": "Diferença",
    "Bester Tag (A): {} · Schwächster Tag (A): {}": "Melhor dia (A): {} · Dia mais fraco (A): {}",
    "Tage": "Dias",
    "{} Tage": "{} dias",
    "{} / {} Tage": "{} / {} dias",
    "{} Einträge, {} kcal": "{} registros, {} kcal",
    "{} / 100 g": "{} / 100 g",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g": "{} kcal · carboidratos {} g · gordura {} g · proteína {} g",
    "{} kcal (Ziel {})": "{} kcal (meta {})",
    "KH {} g · Fett {} g · Eiweiß {} g": "carboidratos {} g · gordura {} g · proteína {} g",
    "zu {}": "a {}",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g (pro 100 g)": "{} kcal · carboidratos {} g · gordura {} g · proteína {} g (por 100 g)",
    "Ø": "Ø",
    "Zustand": "Estado",
    "Kalender": "Calendário",
    "(am Starttag)": "(no dia de início)",
    "(am Endtag)": "(no dia de término)",
    "Täglich ab {} Uhr": "Diariamente a partir das {}",
    "enthält nicht": "não contém",
    "· seit mind. {} Min.": "· por pelo menos {} min",
    "· nur {}–{} Uhr": "· somente {}–{}",
    "ODER": "OU",
    "UND": "E",
    "Trigger pausieren": "Pausar gatilho",
    "Pause beenden": "Encerrar pausa",
    "Heute": "Hoje",
    "3 Tage": "3 dias",
    "1 Woche": "1 semana",
    "Oder bis einschließlich": "Ou até (inclusive)",
    "Pausieren": "Pausar",
    "Zustand einer Entität (z. B. Person ist im Fitnessstudio)": "Estado de uma entidade (ex.: a pessoa está na academia)",
    "Kalendereintrag": "Evento do calendário",
    "Uhrzeit (täglich ab einer Zeit)": "Hora (diariamente a partir de uma hora)",
    "z. B. person.max": "ex.: person.max",
    "ist / enthält": "é / contém",
    "ist NICHT / enthält NICHT": "NÃO é / NÃO contém",
    "an jedem Tag des Termins": "em todos os dias do evento",
    "nur am Starttag (z. B. Donnerstag 22 Uhr)": "somente no dia de início (ex.: quinta-feira às 22 h)",
    "nur am Endtag (z. B. Freitag 6 Uhr)": "somente no dia de término (ex.: sexta-feira às 6 h)",
    "Termin zählt": "O evento conta",
    "Entität": "Entidade",
    "Bedingung": "Condição",
    "z. B. calendar.arbeit": "ex.: calendar.trabalho",
    "Titel enthält, z. B. Nachtschicht": "O título contém, ex.: plantão noturno",
    "Zustand, z. B. Fitnessstudio (Zonenname) oder on": "Estado, ex.: academia (nome da zona) ou on",
    "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist.": "Registra uma vez por dia assim que esta hora é atingida.",
    "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält.": "Vale para dias com (ou sem) um evento cujo título contém este texto.",
    "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).": "Vale assim que a entidade tem (ou não tem) este estado.",
    "Auslöser": "Condição do gatilho",
    "„{}“ nur an bestimmten Tagen anzeigen": "Mostrar “{}” somente em certos dias",
    "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt.": "Dias com registros ficam sempre visíveis. Sem regra, a refeição é sempre exibida.",
    "Bitte eine Entität angeben.": "Informe uma entidade.",
    "Gespeicherte Mahlzeiten": "Refeições salvas",
    "Tagesziel wechseln": "Trocar meta diária",
    "Tagesziel „{}“": "Meta diária “{}”",
    "Standardportion": "Porção padrão",
    "Tage im Voraus eintragen (nur Kalender)": "Registrar com antecedência (só calendário)",
    "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht.": "0 = somente no próprio dia. Com, por exemplo, 7, o registro é planejado para os próximos 7 dias assim que existir um evento correspondente.",
    "Zustand muss schon so lange anliegen (Minuten)": "O estado deve ter durado este tempo (minutos)",
    "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist.": "0 = imediatamente. Ex.: 20: só registra quando a pessoa está na academia há 20 minutos.",
    "Nur zwischen (Uhrzeit, optional)": "Somente entre (hora, opcional)",
    "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00).": "Fora desta janela de tempo o gatilho não registra. É possível atravessar a meia-noite (22:00 a 06:00).",
    "Zu Mahlzeit im Tagebuch": "Para a refeição do diário",
    "Bei Lebensmitteln optional mit Menge:": "Para alimentos, opcionalmente com uma quantidade:",
    "Alle Bedingungen müssen zutreffen (UND)": "Todas as condições devem valer (E)",
    "Mindestens eine muss zutreffen (ODER)": "Pelo menos uma deve valer (OU)",
    "Verknüpfung": "Combinação",
    "Entität, z. B. person.anna": "Entidade, ex.: person.ana",
    "Zustand bzw. Titel enthält (leer = an)": "O estado ou o título contém (vazio = on)",
    "Bedingung entfernen": "Remover condição",
    "Trigger bearbeiten": "Editar gatilho",
    "Neuer Trigger": "Novo gatilho",
    "+ Weitere Bedingung": "+ Outra condição",
    "Dann": "Então",
    "Bitte eine Uhrzeit angeben.": "Informe uma hora.",
    "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen.": "Escolha um alimento, uma refeição ou uma meta diária.",
    "Weitere Bedingung: bitte eine Entität angeben.": "Outra condição: informe uma entidade.",
    "Komplett (alle Einträge mit Mahlzeiten)": "Completo (todos os registros com refeições)",
    "Nur Tageskalorien und Makros (eine Summe pro Tag)": "Somente calorias e macros diários (um total por dia)",
    "Neue Mahlzeit anlegen": "Criar nova refeição",
    "Mahlzeiten zuordnen": "Atribuir refeições",
    "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)": "Ocultar refeições vazias nestes dias (mostrar só o total diário)",
    "MyFitnessPal-Import": "Importação do MyFitnessPal",
    "Was importieren?": "O que importar?",
    "Gewicht übernehmen": "Importar peso",
    "Vorhandene Einträge an diesen Tagen ersetzen": "Substituir registros existentes nestes dias",
    "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Importados: {} dias, {} registros, {} valores de peso.",
    "Importieren": "Importar",
    "Eiweiß {} % · Kohlenhydrate {} % · Fett {} %": "Proteína {} % · Carboidratos {} % · Gordura {} %",
    "· Makros ergeben {} kcal": "· os macros somam {} kcal",
    "Tagesziele": "Metas diárias",
    "Mein Ziel": "Meu objetivo",
    "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet.": "Define quando um dia conta como “dentro da meta” (perder: no máximo, ganhar: no mínimo, manter: ±10 %) e como as estatísticas avaliam sua tendência de peso.",
    "Kalorien aus Makros berechnen": "Calcular calorias a partir dos macros",
    "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g).": "Quando proteína, carboidratos ou gordura mudam, as calorias acompanham (4/4/9 kcal por g).",
    "Kalorien (kcal)": "Calorias (kcal)",
    "Kohlenhydrate (g)": "Carboidratos (g)",
    "Gespeichert ✓": "Salvo ✓",
    "Zusatzfunktionen": "Funções opcionais",
    "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen.": "Funções opcionais, desligadas por padrão. Quando ativadas, aparecem no diário e aqui nas configurações.",
    "Tagesziele pro Wochentag": "Metas diárias por dia da semana",
    "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger.": "ex.: dias de treino com mais calorias, dias de descanso com menos.",
    "Wasser und Nahrungsergänzung": "Água e suplementos",
    "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.": "Registro rápido de água, cafeína, creatina etc. com meta diária própria.",
    "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter).": "Reúna ingredientes numa receita, divida por porções e registre como um alimento (aba própria).",
    "Notizen": "Notas",
    "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten.": "Texto livre para refeições e dias (fome, treino, humor). As notas existentes são mantidas se você desligar a função.",
    "Körpermaße und Fortschrittsfotos": "Medidas corporais e fotos de progresso",
    "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht.": "Circunferências (cintura, peito, braço …) com histórico, e fotos com comparação, na aba Peso.",
    "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit).": "Acompanhe e analise fibras, açúcar, sal e gordura saturada dos alimentos (o Open Food Facts os fornece).",
    "Montag": "Segunda-feira",
    "Dienstag": "Terça-feira",
    "Mittwoch": "Quarta-feira",
    "Donnerstag": "Quinta-feira",
    "Freitag": "Sexta-feira",
    "Samstag": "Sábado",
    "Sonntag": "Domingo",
    "wie Standard": "como padrão",
    "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros.": "Calorias vazias = vale a meta diária padrão acima. Macros vazios mostram “–”. Com “Calcular calorias a partir dos macros” (acima) as calorias acompanham os macros.",
    "Tagesziel-Profile": "Perfis de meta diária",
    "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel.": "ex.: “Treino” e “Dia de descanso”. Um gatilho (Configurações → Gatilhos → “Então: trocar meta diária”) muda o dia para um perfil, por exemplo quando a pessoa está na academia. O perfil tem prioridade sobre a meta do dia da semana.",
    "Profil löschen": "Excluir perfil",
    "Profil „{}“ löschen? Trigger dafür werden ebenfalls gelöscht.": "Excluir o perfil “{}”? Os gatilhos dele também são excluídos.",
    "Noch keine Profile.": "Ainda sem perfis.",
    "Neues Profil": "Novo perfil",
    "+ Profil": "+ Perfil",
    "Einheit": "Unidade",
    "Schritt": "Passo",
    "„{}“ samt Verlauf löschen?": "Excluir “{}” com o histórico?",
    "Neu, z. B. Magnesium": "Novo, ex.: magnésio",
    "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch.": "Por linha: nome, unidade, meta diária e tamanho do passo dos botões +/− no diário.",
    "Feste Mahlzeiten (Frühstück, Mittagessen, …)": "Refeições fixas (café da manhã, almoço, …)",
    "Uhrzeiten (08:47 …, 11:30 …)": "Horários (08:47 …, 11:30 …)",
    "Automatisch (Windows-Look bei HA-95/98-Theme)": "Automático (aparência Windows com tema HA 95/98)",
    "Standard (HA-Theme)": "Padrão (tema do HA)",
    "Windows-Look": "Aparência Windows",
    "Darstellung": "Aparência",
    "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende.": "Os registros existentes são mantidos; registros sem hora aparecem no fim na visão por horário.",
    "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten": "Iniciar o leitor de códigos de barras ao abrir neste dispositivo",
    "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.": "Para um widget na tela inicial do app Companion: crie ali um atalho para este painel e a câmera abre na hora.",
    "Optik": "Aparência",
    "Nach oben": "Mover para cima",
    "Nach unten": "Mover para baixo",
    "Nur an bestimmten Tagen anzeigen": "Mostrar somente em certos dias",
    "Wieder einblenden": "Mostrar novamente",
    "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Ocultar (visível só em dias com registros)",
    "Ausblenden": "Ocultar",
    "{} – blende sie stattdessen mit ⊘ aus.": "{} – oculte-a com ⊘ em vez disso.",
    "Neue Mahlzeit, z. B. Nachtschicht": "Nova refeição, ex.: plantão noturno",
    "nur an Tagen: {}": "somente nos dias: {}",
    "Regel bearbeiten": "Editar regra",
    "Regel löschen": "Excluir regra",
    "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "Com ⚡ você mostra uma refeição somente nos dias em que, por exemplo, seu calendário tem certo evento. Com ⊘ você a oculta permanentemente (ela fica visível só em dias com registros); só uma refeição vazia pode ser excluída.",
    "Trigger": "Gatilhos",
    "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Registre alimentos ou refeições automaticamente quando o Home Assistant informar algo (local, calendário, interruptor …). Também podem ser criados com ⚡ nos alimentos.",
    "Letzter Fehler ({}): {}": "Último erro ({}): {}",
    "Aktiv": "Ativo",
    "pausiert bis {}": "em pausa até {}",
    "· {} Tage im Voraus": "· {} dias de antecedência",
    "· zuletzt {}": "· último {}",
    "Pausieren …": "Pausar …",
    "Jetzt testen (trägt heute ein)": "Testar agora (registra para hoje)",
    "Eingetragen.": "Registrado.",
    "Noch keine Trigger.": "Ainda sem gatilhos.",
    "Prüfe …": "Verificando …",
    "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "Sem acesso ao Home Assistant (falta o SUPERVISOR_TOKEN).",
    "Geprüft {}, nichts zu tun.": "Verificado {}, nada a fazer.",
    "Jetzt prüfen": "Verificar agora",
    "Version": "Versão",
    "Installiert: ": "Instalada: ",
    "Nach Updates suchen": "Procurar atualizações",
    "Keine Verbindung zu GitHub.": "Sem conexão com o GitHub.",
    "Version {} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.": "A versão {} está disponível. No Home Assistant, vá em Configurações → Complementos, procure atualizações e atualize.",
    "Du hast die aktuelle Version.": "Você tem a versão mais recente.",
    "+ Neuer Trigger": "+ Novo gatilho",
    "Trigger-Verlauf": "Histórico de gatilhos",
    "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.": "O que os gatilhos registraram por último. “Desfazer” remove os registros de novo; o gatilho não registra mais naquele dia.",
    "Trigger gelöscht": "Gatilho excluído",
    "(gelöscht)": "(excluído)",
    "Einträge nicht mehr vorhanden": "Os registros não existem mais",
    "Rückgängig": "Desfazer",
    "Erinnerung": "Lembrete",
    "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde.": "Notificação pelo Home Assistant se nada tiver sido registrado até a hora escolhida.",
    "Erinnerung aktiv": "Lembrete ativo",
    "Benachrichtigungsdienst": "Serviço de notificação",
    "Automatische Sicherung": "Backup automático",
    "Täglich eine JSON-Sicherung in {}, Aufbewahrung {} Tage (Add-on-Option „backup_keep_days“).": "Um backup JSON diário em {}, mantido por {} dias (opção do complemento “backup_keep_days”).",
    "Aus (Add-on-Option „auto_backup“).": "Desligado (opção do complemento “auto_backup”).",
    "· {} KB": "· {} KB",
    "Wiederherstellen": "Restaurar",
    "Noch keine Sicherung.": "Ainda sem backup.",
    "Jetzt sichern": "Fazer backup agora",
    "Schnittstelle für Automationen": "Interface para automações",
    "Aktiv. Deine Benutzer-ID: {}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.": "Ativa. Seu ID de usuário: {}. Exemplos de chamada (rest_command) estão na documentação do complemento.",
    "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.": "Desligada. Para ativá-la, defina uma chave “api_key” nas opções do complemento. Balanças, assistentes de voz ou automações podem então enviar registros e peso.",
    "Daten": "Dados",
    "Export/Import betrifft nur dein Benutzerkonto.": "Exportar/importar afeta apenas a sua conta de usuário.",
    "Sicherung (JSON)": "Backup (JSON)",
    "Tagebuch als CSV": "Diário como CSV",
    "Datei nicht lesbar:": "Arquivo ilegível:",
    "Sicherung einspielen": "Restaurar backup",
    "MyFitnessPal-CSV importieren": "Importar CSV do MyFitnessPal",
    "Keine gültige Sicherung:": "Não é um backup válido:",
    "Sicherung wiederherstellen": "Restaurar backup",
    "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt.": "Todos os dados atuais da sua conta serão substituídos pelo backup.",
    "Jetzt": "Agora",
    "Sicherung": "Backup",
    "Gewichtswerte": "Valores de peso",
    "Zeitraum": "Período",
    "Wiederhergestellt.": "Restaurado.",
    "Ersetzen": "Substituir",
    "Sprache und Einheiten": "Idioma e unidades",
    "Sprache": "Idioma",
    "Einheiten": "Unidades",
    "Automatisch (Browser)": "Automático (navegador)",
    "Metrisch (kg, cm)": "Métrico (kg, cm)",
    "Imperial (lb, in)": "Imperial (lb, in)",
    "Teilen …": "Compartilhar …",
    "„{}“ teilen": "Compartilhar “{}”",
    "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Porção como múltiplo do registro (1 = mesma quantidade). O registro aparece no diário dos outros no mesmo dia.",
    "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Quantidade para cada pessoa em gramas. O registro aparece no diário dos outros no mesmo dia.",
    "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein.": "Ninguém mais participa da família ainda. Cada usuário ativa “Família” em Configurações → Funções opcionais.",
    "Bitte mindestens eine Person wählen.": "Escolha pelo menos uma pessoa.",
    "Eingetragen bei {} Person(en).": "Registrado para {} pessoa(s).",
    "Haushalt": "Família",
    "Einträge mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Compartilhe registros com outros usuários, cada um com a própria porção (ex.: um prato para a família). Os dois lados precisam ativar a função.",
    "Benutzerverwaltung": "Gerenciamento de usuários",
    "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer).": "Visível apenas para administradores (opção do complemento “admin_users”; vazio = o primeiro usuário).",
    "Benutzer": "Usuário",
    "Zuletzt": "Último",
    "Export": "Exportar",
    "Admin": "Admin",
    "Alle Daten von „{}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:": "Excluir permanentemente todos os dados de “{}”? Digite o nome para confirmar:",
    "Nur für Administratoren": "Somente para administradores",
    "Das eigene Konto kann hier nicht gelöscht werden": "Sua própria conta não pode ser excluída aqui",
    "Zur Bestätigung den Namen des Benutzers eingeben": "Digite o nome do usuário para confirmar",
    "Haushaltsfunktion ist nicht aktiviert": "A função Família não está ativada",
    "Dieser Benutzer nimmt nicht am Haushalt teil": "Este usuário não participa da família",
    "Weitere Importe": "Mais importações",
    "Weitere Importe …": "Mais importações …",
    "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.": "A importação afeta apenas a sua conta de usuário. Os dados existentes são mantidos, a menos que você escolha explicitamente “substituir”.",
    "CSV aus einer anderen App": "CSV de outro app",
    "Datei wählen": "Escolher arquivo",
    "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.": "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) e tabelas semelhantes. As colunas são detectadas e podem ser corrigidas.",
    "Apple Health": "Apple Saúde",
    "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.": "export.zip ou export.xml do app Saúde (perfil → exportar dados de saúde). O arquivo é lido diretamente no navegador; só os valores diários são enviados.",
    "Messart": "Métrica",
    "Natrium": "Sódio",
    "Bitte die Spalte mit dem Datum zuordnen.": "Atribua a coluna da data.",
    "{} Einträge, {} Gewichtswerte aus {} Zeilen.": "{} registros, {} valores de peso de {} linhas.",
    "CSV importieren": "Importar CSV",
    "Erkannt: {}": "Detectado: {}",
    "Zuordnung der Spalten": "Atribuição das colunas",
    "– nicht vorhanden –": "– não presente –",
    "Einheit der Gewichtsspalte": "Unidade da coluna de peso",
    "Stone": "Stone",
    "Lese Datei …": "Lendo arquivo …",
    "Lese Datei … {} %": "Lendo arquivo … {} %",
    "Keine gültige ZIP-Datei.": "Não é um arquivo ZIP válido.",
    "Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.": "Arquivo ZIP muito grande (ZIP64): descompacte-o e escolha export.xml.",
    "In der ZIP-Datei wurde keine export.xml gefunden.": "Nenhum export.xml encontrado no arquivo ZIP.",
    "Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.": "Este navegador não consegue descompactar o arquivo. Descompacte-o e escolha export.xml.",
    "{} Gewichtswerte, {} Tage mit Ernährungsdaten gefunden.": "Encontrados {} valores de peso e {} dias com dados nutricionais.",
    "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)": "Importar peso (um valor por dia, os valores existentes são sobrescritos)",
    "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)": "Importar totais nutricionais diários (um registro rápido por dia, útil só se você não registra suas refeições aqui de outro modo)",
    "Importiert: {} Tage, {} Gewichtswerte.": "Importados: {} dias, {} valores de peso.",
    "Die Datei enthält keine Datenzeilen.": "O arquivo não contém linhas de dados.",
    "Export für Berater und Trainer": "Exportação para nutricionista e treinador",
    "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum.": "Um relatório para imprimir ou salvar como PDF (escolha “Salvar como PDF” na janela de impressão) e uma tabela dos valores diários. Contém apenas o período escolhido.",
    "Von": "De",
    "Bis": "Até",
    "Einzelne Einträge im Bericht auflisten": "Listar os registros individuais no relatório",
    "Bericht öffnen (Drucken / PDF)": "Abrir relatório (imprimir / PDF)",
    "Tagesübersicht (CSV)": "Visão diária (CSV)",
    "Makro-Verlauf": "Histórico de macros",
    "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage.": "Barras: gramas por dia. Tracejado: meta diária. Linha contínua: média dos últimos 7 dias.",
    "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen.": "Barras: gramas por dia. Linha contínua: média dos últimos 7 dias. Você pode definir uma meta para este macro em Configurações → Metas diárias.",
    "{} g (Ziel {} g)": "{} g (meta {} g)",
    "Ø 7 Tage {} g": "Ø 7 dias {} g",
    "nicht erfasst": "não registrado",
    "Online suchen & vergleichen": "Pesquisar online e comparar",
    "Name oder Barcode": "Nome ou código de barras",
    "Quelle": "Fonte",
    "KH": "Carboidratos",
    "Fett": "Gordura",
    "Abweichung": "Desvio",
    "Abweichung der kcal von dem Wert im Formular": "Desvio das kcal em relação ao valor do formulário",
    "Übernehmen": "Aplicar",
    "Mittelwert der gewählten übernehmen": "Aplicar a média dos selecionados",
    "Suche …": "Pesquisando …",
    "Alle Werte pro 100 g.": "Todos os valores por 100 g.",
    "Die Quellen weichen bei kcal um bis zu {} % voneinander ab – bitte prüfen.": "As fontes diferem em até {} % nas kcal – confira.",
    "nicht erreichbar": "inacessível",
    "Weitere Datenquellen": "Mais fontes de dados",
    "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet).": "Pesquisa online no Open Food Facts e no USDA, comparando os valores entre si e com os seus (os termos de pesquisa são enviados a esses serviços).",
    "Weitere Datenquellen sind nicht aktiviert": "Mais fontes de dados não estão ativadas",
    "Suchbegriff oder Barcode angeben": "Informe um termo de pesquisa ou código de barras",
    "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)": "Limite do USDA atingido (defina sua própria chave api.data.gov nas opções do complemento)",
    "Open Food Facts nicht erreichbar": "Open Food Facts inacessível",
    "Mahlzeit enthält noch Einträge": "A refeição ainda contém registros",
    "Mahlzeit ist leer": "A refeição está vazia",
    "Mahlzeit braucht mindestens eine Komponente": "A refeição precisa de pelo menos um componente",
    "Keine MyDietAssistant-Sicherung": "Não é um backup do MyDietAssistant",
    "Das sieht nicht nach einem MyFitnessPal-Export aus.": "Isto não parece uma exportação do MyFitnessPal.",
    "Home Assistant nicht erreichbar": "Home Assistant inacessível",
    "Uhrzeit (HH:MM) erforderlich": "Hora (HH:MM) obrigatória",
    "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben": "indique exatamente um entre refeição / alimento / perfil de meta",
    "weitere Bedingung: Art und Entität erforderlich": "outra condição: tipo e entidade obrigatórios",
    "Name und Kalorien erforderlich": "Nome e calorias obrigatórios",
    "ungültiger Zeitraum": "período inválido",
    "Quell- und Zieltag sind gleich": "O dia de origem e o de destino são o mesmo",
    "Sicherung nicht gefunden": "Backup não encontrado",
    "Externe API ist aus: Option api_key im Add-on setzen": "A API externa está desligada: defina a opção api_key no complemento",
    "falscher Schlüssel": "chave errada",
    "Lebensmittel „{}“ nicht gefunden": "Alimento “{}” não encontrado",
    "food oder name angeben": "indique alimento ou nome",
    "kg außerhalb des gültigen Bereichs": "kg fora do intervalo válido",
    "Uhrzeit fehlt": "hora ausente",
    "Benachrichtigungsdienst wie notify.mobile_app_handy angeben": "indique um serviço de notificação como notify.mobile_app_telefone",
    "not found": "não encontrado",
    "Aktivität": "Atividade",
    "Aktivität eintragen": "Registrar atividade",
    "Schritte": "Passos",
    "Verbrannt": "Queimadas",
    "Zum Tagesziel": "Somadas à meta",
    "aus Schritten geschätzt": "estimado a partir dos passos",
    "Eintragen": "Registrar",
    "Aus Home Assistant lesen": "Ler do Home Assistant",
    "Handeingabe verwerfen": "Descartar registro manual",
    "Dein Tagesziel (+{} kcal Aktivität)": "Sua meta diária (+{} kcal de atividade)",
    "Tagesziel ({}) (+{} kcal Aktivität)": "Meta diária ({}) (+{} kcal de atividade)",
    "(+{} kcal Aktivität)": "(+{} kcal de atividade)",
    "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben.": "Valores digitados à mão não são mais sobrescritos pelos sensores neste dia.",
    "Verbrannte Kalorien (kcal)": "Calorias queimadas (kcal)",
    "leer = aus Schritten schätzen": "vazio = estimar a partir dos passos",
    "{} % der verbrannten Kalorien": "{} % das calorias queimadas",
    "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen.": "Sensores do Home Assistant que contam ao longo do dia e zeram à meia-noite (um contador que só cresce pode virar diário com o auxiliar “Utility Meter”). O complemento os lê a cada cinco minutos. Sem sensor de calorias, as calorias são estimadas a partir dos passos, do peso corporal e do fator abaixo; os valores também podem ser digitados à mão.",
    "Sensor für Schritte": "Sensor de passos",
    "Sensor für aktive Kalorien (kcal)": "Sensor de calorias ativas (kcal)",
    "Anteil, der das Tagesziel erhöht (%)": "Parcela que aumenta a meta diária (%)",
    "kcal je Schritt und kg Körpergewicht": "kcal por passo e kg de peso corporal",
    "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind.": "Muitos apps só creditam parte das calorias queimadas (50 % é um valor prudente), porque os números de atividade costumam ser superestimados.",
    "z. B. sensor.handy_schritte": "ex.: sensor.telefone_passos",
    "z. B. sensor.handy_aktive_kalorien": "ex.: sensor.telefone_calorias_ativas",
    "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages.": "Passos e calorias queimadas (de sensores do Home Assistant ou à mão) aumentam a meta calórica daquele dia.",
    "Mahlzeiten-Zeitplan": "Horário das refeições",
    "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung.": "Uma janela de tempo por refeição: o diário mostra qual refeição está na hora e pode enviar uma notificação.",
    "Jetzt: {}": "Agora: {}",
    "({} Uhr)": "({})",
    "Als Nächstes: {} ab {} Uhr": "Próxima: {} a partir das {}",
    "schon eingetragen": "já registrado",
    "+ Hinzufügen": "+ Adicionar",
    "Von (leer = Standardfenster)": "De (vazio = janela padrão)",
    "Bis (leer = Standardfenster)": "Até (vazio = janela padrão)",
    "Standardfenster": "Janela padrão",
    "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.": "Janela de tempo por refeição. Se vazia, vale uma janela padrão (café da manhã, almoço e jantar); lanches não têm. São possíveis janelas que passam da meia-noite.",
    "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist": "Avisar quando uma refeição está na hora e ainda vazia",
    "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten.": "Usa o serviço de notificação de “Lembrete” abaixo.",
    "Zwischenspeicher der Online-Suche": "Cache da pesquisa online",
    "Zwischenspeicher leeren": "Limpar cache",
    "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch.": "O complemento memoriza localmente as consultas ao Open Food Facts e ao USDA (códigos de barras 60 dias, termos de pesquisa 14 dias), para que pesquisas repetidas não vão mais à internet. Só dados de produtos são guardados, nada sobre o seu diário.",
    "{} gespeicherte Abfragen ({} KB)": "{} consultas guardadas ({} KB)",
    "Barcode scannen": "Ler código de barras",
    "Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.": "Não foi possível carregar o leitor de códigos de barras. Digite o número.",
    "Mehr laden": "Carregar mais",
    "Tabelle importieren …": "Importar tabela …",
    "Werte online prüfen": "Verificar valores online",
    "Prüfen": "Verificar",
    "Anhalten": "Parar",
    "Ignorieren": "Ignorar",
    "Prüfe {} von {} …": "Verificando {} de {} …",
    "Nur Lebensmittel mit Barcode ({} von {})": "Somente alimentos com código de barras ({} de {})",
    "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)": "Consultar também o USDA (limite de pedidos rígido sem chave própria)",
    "Online-Abfrage nicht möglich: {}": "Consulta online não possível: {}",
    "Dein Wert: {} kcal · KH {} · Fett {} · Eiweiß {}": "Seu valor: {} kcal · carboidratos {} · gordura {} · proteína {}",
    "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst.": "Compara seus alimentos com o Open Food Facts (por código de barras, senão por nome) e mostra desvios em calorias e macros. Nada é alterado até você escolher “Aplicar”. As consultas ficam em cache local; códigos de barras ou nomes são enviados ao serviço.",
    "Lebensmittel-Tabelle importieren": "Importar tabela de alimentos",
    "Lebensmittel-Tabelle": "Tabela de alimentos",
    "Energie (kJ)": "Energia (kJ)",
    "Bitte die Spalten für Name und Kalorien zuordnen.": "Atribua as colunas de nome e calorias.",
    "{} Lebensmittel erkannt ({} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.": "{} alimentos reconhecidos ({} linhas sem nome ou calorias são ignoradas). Os valores são por 100 g.",
    "Kategorie für Lebensmittel ohne Kategorie in der Datei": "Categoria dos alimentos importados",
    "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Alimentos existentes com o mesmo nome e a mesma marca permanecem inalterados.",
    "Importiert: {} neu, {} schon vorhanden, {} übersprungen.": "Importados: {} novos, {} já existentes, {} ignorados.",
    "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.": "Uma tabela nutricional (por exemplo BLS, uma exportação do Open Food Facts ou sua própria lista) como arquivo CSV ou Excel: os alimentos com valores por 100 g são adicionados à sua biblioteca.",
    "Mit dem Haushalt teilen": "Compartilhar com a família",
    "Teilen": "Compartilhar",
    "{} kopiert, {} übersprungen.": "{} copiados, {} ignorados.",
    "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen.": "As pessoas escolhidas recebem uma cópia própria na biblioteca delas. Registros com o mesmo nome permanecem inalterados, alterações posteriores não são sincronizadas.",
    "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Compartilhe registros, alimentos e refeições com outros usuários, cada um com a própria porção (ex.: um prato para a família). Os dois lados precisam ativar a função.",
    "Lebensmittelmengen": "Quantidades dos alimentos",
    "Gramm": "Gramas",
    "Unzen (oz)": "Onças (oz)",
    "Menge (oz)": "Quantidade (oz)",
    "Portion (oz)": "Porção (oz)",
    "Gewicht fertig (oz, optional)": "Peso cozido (oz, opcional)",
    "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Quantidade para cada pessoa em onças. O registro aparece no diário dos outros no mesmo dia.",
    "Gesamt: {}": "Total: {}",
    "pro Portion ({})": "por porção ({})",
    "Pro Portion ({}): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Por porção ({}): {} kcal · carboidratos {} g · gordura {} g · proteína {} g · {} porções",
    "Gemeinsame Haushaltsbibliothek": "Biblioteca familiar compartilhada",
    "Für den Haushalt freigegeben": "Compartilhado com a família",
    "geteilt": "compartilhado",
    "von {}": "de {}",
    "Gehört {}. Änderungen gelten für alle im Haushalt.": "Pertence a {}. As alterações valem para todos da família.",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)": "Oferecer na biblioteca familiar compartilhada (os outros podem usar e editar)",
    "Aus Mealie …": "Do Mealie …",
    "Rezept aus Mealie": "Receita do Mealie",
    "In Mealie suchen…": "Pesquisar no Mealie…",
    "Weitere laden": "Carregar mais",
    "{} Portionen": "{} porções",
    "Mealie": "Mealie",
    "Adresse": "Endereço",
    "API-Token": "Token de API",
    "Gespeichert (leer lassen = unverändert)": "Salvo (deixe vazio para manter)",
    "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert.": "A receita é lida do seu servidor Mealie e os ingredientes são comparados com os seus alimentos; você confere tudo antes de salvar. Nada é alterado no Mealie.",
    "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren.": "Importe receitas de um servidor Mealie. Informe o endereço do servidor (rede doméstica ou complemento) e um token de API do Mealie (perfil → tokens de API). O complemento só lê receitas e não altera nada no Mealie. O token fica dentro do complemento e não faz parte da exportação. Apague o endereço para removê-lo.",
    "Von Webseite …": "De uma página da web …",
    "Rezept von Webseite": "Receita de uma página da web",
    "Lade …": "Carregando …",
    "Adresse der Rezeptseite": "Endereço da página da receita",
    "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "O complemento busca a página e procura dados da receita (ingredientes, porções, modo de preparo). Os ingredientes são comparados com os seus alimentos; você confere tudo antes de salvar.",
    "Zubereitung": "Modo de preparo",
    "Zubereitung, ein Schritt pro Zeile": "Modo de preparo, um passo por linha",
    "Angabe der Webseite: {} kcal pro Portion": "Informado pela página: {} kcal por porção",
    "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "1 ingrediente não associado (vermelho): escolha um alimento com ⇄, senão conta com 0 kcal. Preencha as quantidades que faltam.",
    "{} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "{} ingredientes não associados (vermelho): escolha um alimento com ⇄, senão contam com 0 kcal. Preencha as quantidades que faltam.",
    "Bitte eine Adresse mit http:// oder https:// angeben.": "Informe um endereço começando com http:// ou https://",
    "Die Adresse wurde nicht gefunden.": "O endereço não foi encontrado.",
    "Adressen im lokalen Netz sind nicht erlaubt.": "Endereços da rede local não são permitidos.",
    "Die Seite ist zu groß.": "A página é grande demais.",
    "Zu viele Weiterleitungen.": "Redirecionamentos demais.",
    "Die Seite konnte nicht geladen werden.": "Não foi possível carregar a página.",
    "Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).": "Nenhuma receita encontrada nesta página (faltam dados estruturados da receita).",
    "Das Rezept enthält keine Zutaten.": "A receita não contém ingredientes.",
    "Rezepte sind nicht aktiviert": "As receitas não estão ativadas",
    "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf": "Busca passos e calorias dos últimos 30 dias no histórico do Home Assistant",
    "Verlauf nachladen": "Carregar histórico",
    "Verlauf nachgeladen: {} Tage.": "Histórico carregado: {} dias.",
    "Zeitraum: 1 bis 365 Tage": "Período: 1 a 365 dias",
    "Zuerst einen Sensor für Schritte oder Kalorien wählen": "Escolha primeiro um sensor de passos ou calorias",
    "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)": "O Home Assistant não devolveu o histórico (recorder ativado?)",
    "Ungültige Entität": "Entidade inválida",
    "Wert außerhalb des Bereichs": "Valor fora do intervalo",
    "Nur im Home-Assistant-Add-on möglich": "Só é possível dentro do complemento do Home Assistant",
    "Leere Datei": "Arquivo vazio",
    "Die Datei konnte nicht gelesen werden.": "Não foi possível ler o arquivo.",
    "Die Excel-Datei enthält kein Tabellenblatt.": "O arquivo Excel não contém planilha.",
    "Zu viele Zeilen (höchstens 50 000)": "Linhas demais (50.000 no máximo)",
    "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Atribua colunas para nome e calorias (kcal ou kJ)",
    "Mahlzeiten-Vorschläge": "Sugestões de refeições",
    "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben).": "Botão no diário: sugere refeições salvas e combinações do seu histórico que se encaixam nas calorias e macros restantes (as quantidades são ajustadas, embalagens fixas permanecem).",
    "Mahlzeit vorschlagen": "Sugerir uma refeição",
    "Rest des Tages": "Resto do dia",
    "Anteil für diese Mahlzeit": "Parte para esta refeição",
    "Ziel für diese Mahlzeit: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Meta para esta refeição: {} kcal · carboidratos {} g · gordura {} g · proteína {} g",
    "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.": "Você já atingiu sua meta diária – não há nada a completar.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf.": "Ainda sem sugestões: salve refeições no diário com “Salvar / Copiar”, ou coma combinações pelo menos duas vezes, e elas aparecerão aqui.",
    "Weitere Vorschläge": "Mais sugestões",
    "Beigabe": "Complemento",
    "aus dem Verlauf ({}×)": "do seu histórico ({}×)",
    "Gespeichert": "Salvo",
    "Abweichung vom Ziel: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Desvio da meta: {} kcal · carboidratos {} g · gordura {} g · proteína {} g",
    "Danach am Tag noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Ainda em aberto para o resto do dia: {} kcal · carboidratos {} g · gordura {} g · proteína {} g",
    "Anpassen": "Ajustar",
    "Fertig": "Pronto",
    "Prioritäten und Beigaben": "Prioridades e complementos",
    "Trainingstag": "Dia de treino",
    "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen.": "Escolha o shake e a meta dele em “Prioridades e complementos”, então posso calcular as quantidades.",
    "Der Shake ist für heute schon eingetragen.": "O shake já está registrado para hoje.",
    "Shake": "Shake",
    "Ziel für den Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Meta para o shake: {} kcal · carboidratos {} g · gordura {} g · proteína {} g",
    "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel.": "Não é possível calcular uma sugestão para o shake: defina pelo menos uma meta nas configurações.",
    "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig.": "Com isso você atinge sua meta diária – não sobra nada para um jantar.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“.": "Ainda sem sugestões: salve refeições no diário com “Salvar / Copiar”.",
    "Noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Ainda em aberto: {} kcal · carboidratos {} g · gordura {} g · proteína {} g",
    "Offen nach dem Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Em aberto após o shake: {} kcal · carboidratos {} g · gordura {} g · proteína {} g",
    "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein.": "Seu shake depois do treino: o app calcula as quantidades para atingir a meta e depois sugere jantares para o resto do dia. O shake precisa estar salvo como refeição.",
    "– kein Shake –": "– sem shake –",
    "Was der Shake liefern soll (leer = egal)": "O que o shake deve fornecer (vazio = tanto faz)",
    "Shake eintragen in": "Registrar o shake em",
    "erste Mahlzeit": "primeira refeição",
    "Abendessen eintragen in": "Registrar o jantar em",
    "erste freie Mahlzeit": "primeira refeição livre",
    "Trigger tragen den Shake mit den berechneten Mengen ein": "Gatilhos registram o shake com as quantidades calculadas",
    "Vorschläge einstellen": "Configurações das sugestões",
    "Wichtigkeit": "Importância",
    "egal": "tanto faz",
    "normal": "normal",
    "wichtig": "importante",
    "sehr wichtig": "muito importante",
    "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor.": "Quanto mais importante um valor, mais perto a sugestão deve chegar dele. Valores sem meta são ignorados.",
    "Kalorienziel nie überschreiten": "Nunca ultrapassar a meta de calorias",
    "Eiweißziel möglichst erreichen": "Atingir a meta de proteína, se possível",
    "Beigaben": "Complementos",
    "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite.": "Alimentos que combinam com qualquer refeição (ex.: castanhas). Uma sugestão só os adiciona quando se encaixam melhor no restante. Campos: mínimo, máximo, passo.",
    "Mindestmenge": "Quantidade mínima",
    "Höchstmenge": "Quantidade máxima",
    "Schrittweite": "Tamanho do passo",
    "Beigabe hinzufügen": "Adicionar um complemento",
    "+ Beigabe": "+ Complemento",
    "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.": "Escalável: segue o fator de quantidade da refeição. Fixo: permanece igual.",
    "Skalierbar": "Escalável",
    "Fest": "Fixo",
    "Packung": "Embalagem",
    "Abweichung ±": "Desvio ±",
    "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)": "Quanto este ingrediente pode se desviar da proporção com os outros (em porcentagem)",
    "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.": "Tamanho da embalagem: a sugestão usa tantas embalagens quantas definidas em “Número”. Vazio = exatamente a quantidade salva.",
    "Mengenfaktor für Vorschläge": "Fator de quantidade para sugestões",
    "von": "de",
    "bis": "a",
    "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6.": "Quanto a refeição inteira pode ser reduzida ou ampliada nas sugestões (1 = quantidade como salva). Vazio = 0,6 a 1,6.",
    "Mahlzeiten-Vorschläge sind nicht aktiviert": "As sugestões de refeições não estão ativadas",
    "Vorschlag ist leer": "A sugestão está vazia",
    "Ungültige Werte": "Valores inválidos",
    "Kleinster Faktor ist größer als der größte": "O menor fator é maior que o maior",
    "Wie viele Packungen ein Vorschlag nehmen darf": "Quantas embalagens uma sugestão pode usar (de – a; 0 = pode ser omitida)",
    "Anzahl": "Número",
    "Ausschließen": "Excluir",
    "Ausgeschlossen": "Excluídos",
    "Zulassen": "Permitir",
    "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück.": "Estas refeições não aparecem mais nas sugestões. “Permitir” as traz de volta.",
    "Frühstück": "Café da manhã",
    "Mittagessen": "Almoço",
    "Abendessen": "Jantar",
    "Snacks": "Lanches",
    "Mahlzeit": "Refeição",
    "Menge": "Quantidade",
    "Die Makros ergeben {} g auf 100 g – mehr als möglich.": "Os macros somam {} g por 100 g – mais do que o possível.",
    "Die Makros ergeben rechnerisch ca. {} kcal, angegeben sind {} kcal.": "Os macros somam cerca de {} kcal, mas {} kcal estão informadas.",
    "{} Lebensmittel durch ausgeblendete Kategorien versteckt.": "{} alimentos ocultos por categorias ocultas.",
    "{}: Werte übernommen ✓": "{}: valores aplicados ✓",
    "{}: {} kcal · KH {} · Fett {} · Eiweiß {} ({})": "{}: {} kcal · carboidratos {} · gordura {} · proteína {} ({})",
    "{} geprüft: {} stimmen überein, {} weichen ab, {} ohne Treffer.": "{} verificados: {} coincidem, {} diferem, {} sem correspondência.",
    "{} Einträge, {} Gewichtswerte ({} bis {}) aus {} Zeilen.": "{} registros, {} valores de peso ({} a {}) de {} linhas.",
    "{} Tage ({} bis {}), {} Einträge, {} Gewichtswerte": "{} dias ({} a {}), {} registros, {} valores de peso",
    "{} Uhr · {}": "{} · {}",
    "Die Excel-Datei ist zu groß.": "O arquivo Excel é grande demais.",
    "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).": "O Mealie ainda não está configurado (Configurações → Mealie).",
    "Mealie konnte nicht erreicht werden.": "Não foi possível acessar o Mealie.",
    "Bitte eine Adresse wie http://mealie:9000 angeben.": "Informe um endereço como http://mealie:9000.",
    "Nicht gefunden (Adresse oder Rezept prüfen).": "Não encontrado (verifique o endereço ou a receita).",
    "Mealie antwortete mit Fehler {}.": "O Mealie respondeu com o erro {}.",
    "Unter dieser Adresse läuft kein Mealie.": "Nenhum Mealie está em execução neste endereço.",
    "Ungültiges Rezept.": "Receita inválida.",
    "Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).": "Este endereço não é permitido (o Mealie roda em servidor ou complemento próprio).",
    "Mealie ist nicht erreichbar.": "O Mealie não está acessível.",
    "Die Seite antwortete mit Fehler {}.": "A página respondeu com o erro {}.",
    "Rezept": "Receita",
    "Wasser": "Água",
    "Koffein": "Cafeína",
    "Kreatin": "Creatina",
    "{} (Kopie)": "{} (cópia)",
    "Daten löschen …": "Excluir dados …",
    "Daten löschen": "Excluir dados",
    "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an.": "Exclui permanentemente os dados escolhidos da sua conta. Outros usuários e as configurações permanecem intactos. O melhor é criar antes um backup (JSON).",
    "Einträge, Notizen, Wasser und Aktivität aller Tage": "registros, notas, água e atividade de todos os dias",
    "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)": "todos os alimentos da biblioteca (os registros do diário permanecem)",
    "alle gespeicherten Mahlzeiten": "todas as refeições salvas",
    "alle Rezepte samt ihrer Lebensmittel": "todas as receitas, incluindo seus alimentos",
    "Gewicht und Körpermaße": "Peso e medidas corporais",
    "Gewichtswerte, Körpermaße und Fortschrittsfotos": "valores de peso, medidas corporais e fotos de progresso",
    "Tagesziel, Wochentagsziele und Profile": "meta diária, metas por dia da semana e perfis",
    "alle Trigger und Mahlzeiten-Regeln samt Verlauf": "todos os gatilhos e regras de refeições, incluindo o histórico",
    "Bitte mindestens einen Bereich wählen.": "Escolha pelo menos uma área.",
    "Bitte mindestens einen gültigen Bereich wählen.": "Escolha pelo menos uma área válida.",
    "Wirklich unwiderruflich löschen: {}?": "Excluir mesmo permanentemente: {}?",
    "Gelöscht.": "Excluído.",
    "Endgültig löschen": "Excluir permanentemente",
    "Abendessen sollen das Eiweißziel möglichst erreichen": "Os jantares devem atingir a meta de proteína o máximo possível",
    "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)": "Mostrar o botão “Dia de treino” todos os dias (senão só quando o shake está registrado ou um gatilho o registrou)",
    "Einkaufsliste": "Lista de compras",
    "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt.": "Escolha receitas (porções) e refeições salvas (múltiplo, 1 = uma vez): os ingredientes são somados.",
    "Noch nichts gewählt.": "Nada escolhido ainda.",
    "In die Zwischenablage kopieren": "Copiar para a área de transferência",
    "Kopiert ✓": "Copiado ✓",
    "An Home Assistant senden": "Enviar ao Home Assistant",
    "Todo-Liste": "Lista de tarefas",
    "Keine Todo-Liste in Home Assistant gefunden.": "Nenhuma lista de tarefas encontrada no Home Assistant.",
    "{} Einträge gesendet.": "{} itens enviados.",
    "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste).": "Soma os ingredientes de receitas e refeições salvas, copia-os ou envia-os a uma lista de tarefas do Home Assistant (ex.: a lista de compras).",
    "Einkaufsliste nicht aktiviert": "A lista de compras não está ativada",
    "Todo-Liste fehlt": "Falta a lista de tarefas",
    "Keine Einträge": "Sem itens",
    "Home Assistant nicht erreichbar (gesendet: {})": "Home Assistant inacessível (enviados: {})",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)": "Oferecer na biblioteca familiar compartilhada (os outros podem usar e copiar)",
    "Wochenbericht": "Resumo semanal",
    "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“.": "Uma vez por semana, um resumo dos últimos sete dias como notificação. Usa o serviço de notificação de “Lembrete”.",
    "Wochenbericht aktiv": "Resumo semanal ativo",
    "Wochentag": "Dia da semana",
    "Vorschau": "Prévia",
    "Datenbank": "Banco de dados",
    "{} · {} Zeilen in {} Tabellen · frei {} · letzte Sicherung: {}": "{} · {} linhas em {} tabelas · livre {} · último backup: {}",
    "Prüfen und verdichten": "Verificar e compactar",
    "Prüfung läuft …": "Verificando …",
    "Verdichtet: {} → {}": "Compactado: {} → {}",
    "Datenbank ist in Ordnung.": "O banco de dados está bem.",
    "Datenbank prüfen: {}": "Verificação do banco de dados: {}",
    "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)": "Reconhecer também a partir desta quantidade de calorias queimadas (kcal, 0 = desligado)",
    "Wochentag ungültig": "Dia da semana inválido",
    "Andere dürfen es auch ändern": "Os outros também podem alterá-lo",
    "Nährwert-Lücken (7 Tage)": "Lacunas de nutrientes (7 dias)",
    "Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; {} von {} Tagen erfasst.": "Média dos últimos 7 dias (só dias com valores) em relação a valores de referência; {} de {} dias registrados.",
    "nicht genug Angaben": "dados insuficientes",
    "Ziele ändern": "Alterar metas",
    "Ziele für weitere Nährwerte": "Metas para mais nutrientes",
    "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze.": "Valores de referência por dia em g. As fibras devem ser atingidas; para açúcar, sal e gordura saturada é um limite máximo.",
    "Weitere Nährwerte sind nicht aktiviert": "Mais nutrientes não está ativado",
    "Ziele müssen zwischen 0 und 1000 liegen": "As metas devem estar entre 0 e 1000",
    "Ø {} g (mind. {} g) – im Ziel": "Ø {} g (no mínimo {} g) – dentro da meta",
    "Ø {} g (mind. {} g) – {} % unter dem Ziel": "Ø {} g (no mínimo {} g) – {} % abaixo da meta",
    "Ø {} g (höchstens {} g) – im Ziel": "Ø {} g (no máximo {} g) – dentro da meta",
    "Ø {} g (höchstens {} g) – {} % über dem Ziel": "Ø {} g (no máximo {} g) – {} % acima da meta",
    "Aus Text …": "De texto …",
    "Rezept aus Text": "Receita de texto",
    "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Cole uma receita como texto: primeiro o título, depois os ingredientes (um por linha, com quantidade) e o modo de preparo. Títulos como “Ingredientes” e “Modo de preparo” ajudam. Os ingredientes são comparados com os seus alimentos; você confere tudo antes de salvar.",
    "Rezepttext": "Texto da receita",
    "Im Text wurden keine Zutaten gefunden (Zeilen mit Mengen, z. B. „200 g Mehl“).": "Nenhum ingrediente encontrado no texto (linhas com quantidades, ex.: “200 g de farinha”).",
    "Der Text ist zu lang.": "O texto é grande demais.",
    "Offline: 1 Eintrag wartet auf Verbindung.": "Offline: 1 registro aguarda conexão.",
    "Offline: {} Einträge warten auf Verbindung.": "Offline: {} registros aguardam conexão.",
    "Hauptmenü": "Menu principal",
    "Zeitraum A, von": "Período A, de",
    "Zeitraum A, bis": "Período A, até",
    "Zeitraum B, von": "Período B, de",
    "Zeitraum B, bis": "Período B, até",
  },
  pl: {
    "Ernährung": "Odżywianie",
    "Tagebuch": "Dziennik",
    "Lebensmittel": "Produkty",
    "Mahlzeiten": "Posiłki",
    "Rezepte": "Przepisy",
    "Gewicht": "Waga",
    "Statistik": "Statystyki",
    "Einstellungen": "Ustawienia",
    "Lokal": "Lokalnie",
    "Kategorien:": "Kategorie:",
    "Ein-/ausblenden": "Pokaż/ukryj",
    "Vortag": "Poprzedni dzień",
    "Folgetag": "Następny dzień",
    "Bearbeiten": "Edytuj",
    "Entfernen": "Usuń",
    "Kalorien": "Kalorie",
    "Kohlenhydrate": "Węglowodany",
    "Fette": "Tłuszcze",
    "Eiweiß": "Białko",
    "+ Nahrungsmittel hinzufügen": "+ Dodaj produkt",
    "Notiz zur Mahlzeit": "Notatka do tego posiłku",
    "Tag": "Dzień",
    "Notiz ändern": "Edytuj notatkę",
    "Notiz": "Notatka",
    "Speichern / Kopieren": "Zapisz / Kopiuj",
    "Mahlzeit leeren": "Wyczyść posiłek",
    "Tag leeren": "Wyczyść dzień",
    "Alle Einträge von „{}“ löschen?": "Usunąć wszystkie wpisy z „{}”?",
    "Alle Einträge dieses Tages löschen?": "Usunąć wszystkie wpisy tego dnia?",
    "Einträge": "Wpisy",
    "Ausgeblendete Mahlzeiten wieder verbergen": "Ukryj ponownie ukryte posiłki",
    "leere/ausgeblendete Mahlzeit anzeigen": "pokaż pusty/ukryty posiłek",
    "leere/ausgeblendete Mahlzeiten anzeigen": "pokaż puste/ukryte posiłki",
    "Tagesziel ({})": "Dzienny cel ({})",
    "Dein Tagesziel": "Twój dzienny cel",
    "Gesamt": "Razem",
    "Verbleibend": "Pozostało",
    "Weitere Nährwerte": "Więcej składników odżywczych",
    "Notiz zum Tag": "Notatka do dnia",
    "Ganzen Tag kopieren": "Kopiuj cały dzień",
    "z. B. Hunger, Training, Stimmung …": "np. głód, trening, nastrój …",
    "Notiz: {}": "Notatka: {}",
    "Abbrechen": "Anuluj",
    "Speichern": "Zapisz",
    "Auf den Tag": "Na dzień",
    "Mengenfaktor (1 = unverändert)": "Współczynnik ilości (1 = bez zmian)",
    "Bitte einen Tag wählen.": "Wybierz dzień.",
    "Kopieren": "Kopiuj",
    "Wasser & Ergänzungen": "Woda i suplementy",
    "Lebensmittel suchen…": "Szukaj produktów…",
    "Zurück": "Wstecz",
    "g KH": "g węglowodanów",
    "g Fett": "g tłuszczu",
    "g Eiweiß": "g białka",
    "Menge (g)": "Ilość (g)",
    "Ballaststoffe": "Błonnik",
    "Zucker": "Cukier",
    "Salz": "Sól",
    "ges. Fettsäuren": "tł. nas.",
    "Portion wählen …": "Wybierz porcję …",
    "Portion": "Porcja",
    "Bezeichnung": "Opis",
    "KH (g)": "Węglowodany (g)",
    "Fett (g)": "Tłuszcz (g)",
    "Eiweiß (g)": "Białko (g)",
    "Uhrzeit": "Godzina",
    "Lebensmittel tauschen": "Zamień produkt",
    "Bezeichnung und kcal sind Pflicht.": "Opis i kcal są wymagane.",
    "„{}“ tauschen": "Zamień „{}”",
    "Tauschen": "Zamień",
    "Schnelleingabe in „{}“": "Szybki wpis w „{}”",
    "Schnelleingabe": "Szybki wpis",
    "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“).": "Bez produktu, tylko kalorie i opcjonalnie makroskładniki (np. „Restauracja, ok. 800 kcal”).",
    "z. B. Restaurant": "np. Restauracja",
    "Hinzufügen": "Dodaj",
    "Als Mahlzeit speichern": "Zapisz jako posiłek",
    "Am Tag": "W dniu",
    "Neue Uhrzeit (leer = Originalzeit)": "Nowa godzina (puste = pierwotna godzina)",
    "In Mahlzeit": "Do posiłku",
    "Nichts ausgewählt.": "Nic nie wybrano.",
    "Name der Mahlzeit": "Nazwa posiłku",
    "z. B. Diät, Bulk (optional)": "np. Redukcja, Masa (opcjonalnie)",
    "Name": "Nazwa",
    "Kategorie": "Kategoria",
    "Bitte einen Namen angeben.": "Wpisz nazwę.",
    "Dieser Browser kann keine Barcodes lesen (BarcodeDetector fehlt). Bitte die Nummer eintippen.": "Ta przeglądarka nie odczytuje kodów kreskowych (brak BarcodeDetector). Wpisz numer.",
    "Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.": "Brak dostępu do aparatu (strona wymaga HTTPS). Użyj „Zdjęcia” lub wpisz numer.",
    "Abgebrochen": "Anulowano",
    "Scan abbrechen": "Anuluj skanowanie",
    "Halte den Barcode ins Bild.": "Trzymaj kod kreskowy w kadrze.",
    "Kamerazugriff wurde nicht erlaubt.": "Dostęp do aparatu nie został zezwolony.",
    "Kamera nicht verfügbar: {}": "Aparat niedostępny: {}",
    "Auf dem Foto wurde kein Barcode erkannt.": "Na zdjęciu nie znaleziono kodu kreskowego.",
    "z. B. 1 Scheibe": "np. 1 kromka",
    "Produkt nicht gefunden ({})": "Nie znaleziono produktu ({})",
    "Barcode (Open Food Facts)": "Kod kreskowy (Open Food Facts)",
    "Suchen": "Szukaj",
    "Scannen (Kamera)": "Skanuj (aparat)",
    "Foto vom Barcode": "Zdjęcie kodu kreskowego",
    "Marke": "Marka",
    "z. B. Diät, Bulk": "np. Redukcja, Masa",
    "Portion (g)": "Porcja (g)",
    "kcal / 100 g": "kcal / 100 g",
    "KH / 100 g": "Węglowodany / 100 g",
    "Fett / 100 g": "Tłuszcz / 100 g",
    "Eiweiß / 100 g": "Białko / 100 g",
    "Portionsgrößen (optional)": "Wielkości porcji (opcjonalnie)",
    "+ Portion": "+ Porcja",
    "Name und kcal sind Pflicht.": "Nazwa i kcal są wymagane.",
    "Speichern & wählen": "Zapisz i wybierz",
    "Suchen…": "Szukaj…",
    "★ Favoriten": "★ Ulubione",
    "Meine Mahlzeiten": "Moje posiłki",
    "Häufig verwendet": "Często używane",
    "Beides": "Oba", "Hinzufügen-Dialog": "Okno dodawania", "„Häufig verwendet“ zeigt": "„Często używane” pokazuje", "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten.": "Dotyczy karty „Produkty” w oknie dodawania. Karta „Moje posiłki” zawsze pokazuje często używane posiłki.",
    "Alle": "Wszystkie",
    "Nichts gefunden – lege ein neues Lebensmittel an.": "Nic nie znaleziono – utwórz nowy produkt.",
    "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆.": "Brak ulubionych – oznacz produkty ☆ na stronie „Produkty”.",
    "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen.": "Brak zapisanych posiłków. Utwórz go w dzienniku przez „Zapisz jako posiłek”.",
    "Portionen": "Porcje",
    "+ Neues Lebensmittel": "+ Nowy produkt",
    "Schnelleingabe (nur kcal)": "Szybki wpis (tylko kcal)",
    "Schließen": "Zamknij",
    "Zu „{}“ hinzufügen": "Dodaj do „{}”",
    "Eintrag hinzufügen": "Dodaj wpis",
    "(Ziel {})": "(cel {})",
    "Trend {} kg": "Trend {} kg",
    "Gewichtsverlauf": "Historia wagi",
    "Verlauf": "Historia",
    "zu wenig Daten": "za mało danych",
    "nicht absehbar": "nie do przewidzenia",
    "erreicht": "osiągnięty",
    "Lebensmittel bearbeiten": "Edytuj produkt",
    "Neues Lebensmittel": "Nowy produkt",
    "Favorit entfernen": "Usuń z ulubionych",
    "Als Favorit markieren": "Oznacz jako ulubiony",
    "Favorit": "Ulubiony",
    "Trigger anlegen": "Utwórz wyzwalacz",
    "Löschen": "Usuń",
    "„{}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.": "Usunąć „{}”? Już zapisane posiłki zostają.",
    "Nichts gefunden.": "Nic nie znaleziono.",
    "Noch keine Lebensmittel angelegt.": "Brak produktów.",
    "Duplikate suchen": "Znajdź duplikaty",
    "Doppelte Lebensmittel": "Zduplikowane produkty",
    "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.": "W każdej grupie wybierz produkt do zachowania. Już zapisane posiłki pozostają bez zmian.",
    "Keine Duplikate gefunden.": "Nie znaleziono duplikatów.",
    "Zusammenführen": "Połącz",
    "Durch anderes Lebensmittel tauschen": "Zamień na inny produkt",
    "Mahlzeit bearbeiten": "Edytuj posiłek",
    "Komponenten": "Składniki",
    "Komponente hinzufügen": "Dodaj składnik",
    "+ Komponente": "+ Składnik",
    "Kopie anlegen": "Utwórz kopię",
    "Mahlzeit „{}“ löschen?": "Usunąć posiłek „{}”?",
    "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.": "Nie zapisano jeszcze posiłku – użyj „Zapisz jako posiłek” w dzienniku.",
    "Mahlzeiten suchen…": "Szukaj posiłków…",
    "wie Summe der Zutaten": "tak jak suma składników",
    "Gesamt: {} g": "Razem: {} g",
    "pro Portion ({} g)": "na porcję ({} g)",
    "Rezept bearbeiten": "Edytuj przepis",
    "Neues Rezept": "Nowy przepis",
    "Gewicht fertig (g, optional)": "Waga po ugotowaniu (g, opcjonalnie)",
    "Zutaten": "Składniki",
    "Noch keine Zutaten.": "Brak składników.",
    "Zutat hinzufügen": "Dodaj składnik",
    "+ Zutat": "+ Składnik",
    "Ungültige Einheit": "Nieprawidłowa jednostka",
    "Speichern und jetzt lesen": "Zapisz i odczytaj teraz",
    "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen.": "Wartość czujnika jest starsza niż 30 dni i nie została przejęta.",
    "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).": "Wartość jest poza zakresem 20–500 kg (sprawdź jednostkę).",
    "Der Sensor liefert gerade keinen Zahlenwert.": "Czujnik nie podaje teraz liczby.",
    "Home Assistant nicht erreichbar.": "Home Assistant jest niedostępny.",
    "Zuerst einen Sensor wählen.": "Najpierw wybierz czujnik.",
    "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.": "Zauważono nową wartość, zostanie przejęta, gdy się ustabilizuje.",
    "Der aktuelle Wert ist schon übernommen.": "Bieżąca wartość została już przejęta.",
    "Übernommen: {} am {}": "Przejęto: {} dnia {}",
    "Zuletzt übernommen: {} am {}": "Ostatnio przejęto: {} dnia {}",
    "z. B. sensor.waage_gewicht": "np. sensor.waga",
    "Automatisch (Einheit des Sensors)": "Automatyczna (jednostka czujnika)",
    "Einheit des Sensors": "Jednostka czujnika",
    "Sensor": "Czujnik",
    "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg.": "Czujnik Home Assistant z masą ciała, np. z inteligentnej wagi. Dodatek sprawdza go co minutę; nowa wartość jest przejmowana, gdy nie zmienia się od minuty, i zapisywana na dzień pomiaru (wartość z tego samego dnia jest zastępowana). Sensowne wartości to 20–500 kg.",
    "Waage": "Waga",
    "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung).": "Automatycznie przejmuj masę ciała z czujnika Home Assistant, np. z inteligentnej wagi (z przeliczaniem jednostek).",
    "Waage (Sensor)": "Waga (czujnik)",
    "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).": "Pomarańczowych składników brakowało w Twoich produktach – uzupełniono je z baz online (wartości szacunkowe, sprawdź je).",
    "aus Open Food Facts": "z Open Food Facts",
    "aus USDA": "z USDA",
    "Pro Portion ({} g): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Na porcję ({} g): {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g · {} porcji",
    "Rezept „{}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.": "Usunąć przepis „{}”? Odpowiadający mu produkt też zostanie usunięty; już zapisane posiłki zostają.",
    "Noch kein Rezept angelegt.": "Brak przepisów.",
    "Rezepte suchen…": "Szukaj przepisów…",
    "+ Neues Rezept": "+ Nowy przepis",
    "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel.": "Każdy przepis pojawia się też w Produktach (na 100 g, z „1 porcją”) i można go zapisać wszędzie. Zmiany w przepisie aktualizują ten produkt.",
    "1 Portion": "1 porcja",
    "Rezept nicht gefunden": "Nie znaleziono przepisu",
    "Mindestens eine Zutat nötig.": "Wymagany jest co najmniej jeden składnik.",
    "Portionen müssen größer als 0 sein.": "Liczba porcji musi być większa niż 0.",
    "Jede Zutat braucht eine Menge in Gramm.": "Każdy składnik wymaga ilości w gramach.",
    "Gewicht nach dem Kochen muss größer als 0 sein.": "Waga po ugotowaniu musi być większa niż 0.",
    "z. B. 78,5": "np. 78,5",
    "Gewicht eintragen": "Zapisz wagę",
    "Datum": "Data",
    "Gewicht ({})": "Waga ({})",
    "Zielgewicht ({})": "Waga docelowa ({})",
    "Gewünschte Änderung ({} pro Woche)": "Pożądana zmiana ({} tygodniowo)",
    "Noch keine Gewichtswerte.": "Brak wartości wagi.",
    "Aktuell": "Bieżąca",
    "Trend": "Trend",
    "Veränderung": "Zmiana",
    "Ziel": "Cel",
    "Prognose Ziel": "Prognoza celu",
    "30 Tage": "30 dni",
    "90 Tage": "90 dni",
    "1 Jahr": "1 rok",
    "7 Tage": "7 dni",
    "180 Tage": "180 dni",
    "14 Tage": "14 dni",
    "Kalorien und Gewicht": "Kalorie i waga",
    "Kalorien (linke Achse)": "Kalorie (lewa oś)",
    "Gewicht und Trend (rechte Achse)": "Waga i trend (prawa oś)",
    "Noch keine Gewichtswerte im Zeitraum.": "Brak pomiarów wagi w tym okresie.",
    "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).": "Cienka linia i punkty: pomiary. Gruba linia: wygładzony trend (bez dziennych wahań).",
    "Trend aktuell {}{} {}/Woche.": "Bieżący trend {}{} {}/tydzień.",
    "Mehr anzeigen": "Pokaż więcej",
    "Alle {}": "Wszystkie {}",
    "Weniger": "Mniej",
    "Taille": "Talia",
    "Brust": "Klatka piersiowa",
    "Hüfte": "Biodra",
    "Oberarm": "Ramię",
    "Oberschenkel": "Udo",
    "Körperfett %": "Tkanka tłuszczowa %",
    "Bild konnte nicht gelesen werden": "Nie można odczytać obrazu",
    "Eigene Messung, z. B. Wade": "Własny pomiar, np. łydka",
    "Körpermaße": "Pomiary ciała",
    "Werte, die Du nicht messen willst, einfach leer lassen.": "Zostaw puste wartości, których nie chcesz mierzyć.",
    "Weitere Messung": "Inny pomiar",
    "Wert": "Wartość",
    "Bitte mindestens einen Wert eintragen.": "Wpisz co najmniej jedną wartość.",
    "Noch keine Werte für diese Messung.": "Brak wartości dla tego pomiaru.",
    "Notiz (optional), z. B. Vorderansicht": "Notatka (opcjonalnie), np. widok z przodu",
    "Fortschrittsfotos": "Zdjęcia postępów",
    "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons.": "Zdjęcia pozostają w dodatku na Twoim Home Assistant. Nie wchodzą do eksportu JSON ani do automatycznych kopii zapasowych, ale są zawarte w kopii zapasowej dodatku w Home Assistant.",
    "Vergleichen": "Porównaj",
    "Foto hinzufügen": "Dodaj zdjęcie",
    "Foto löschen": "Usuń zdjęcie",
    "Foto löschen?": "Usunąć zdjęcie?",
    "Noch keine Fotos.": "Brak zdjęć.",
    "Fotos vergleichen": "Porównaj zdjęcia",
    "Ungültiger Wert für {}": "Nieprawidłowa wartość dla {}",
    "Kein gültiges Bild": "Nieprawidłowy obraz",
    "Bild leer oder zu groß (max. 8 MB)": "Obraz pusty lub zbyt duży (maks. 8 MB)",
    "Foto nicht gefunden": "Nie znaleziono zdjęcia",
    "Abnehmen": "Redukcja wagi",
    "Halten": "Utrzymanie",
    "Zunehmen": "Przyrost wagi",
    "Kalorienbilanz": "Bilans kalorii",
    "Noch keine Einträge im Zeitraum.": "Brak wpisów w tym okresie.",
    "Ø Aufnahme": "Ø spożycie",
    "Gewichtstrend": "Trend wagi",
    "Überschuss / Tag": "Nadwyżka / dzień",
    "Defizit / Tag": "Deficyt / dzień",
    "Bilanz / Tag": "Bilans / dzień",
    "Geschätzter Verbrauch": "Szacowane zapotrzebowanie",
    "Aus {} Gewichtswerten und {} von {} erfassten Tagen (1 {} ≈ {} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.": "Na podstawie {} wartości wagi i {} z {} zapisanych dni (1 {} ≈ {} kcal). Im pełniejszy dziennik i ważenia, tym dokładniejszy wynik.",
    "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum.": "Obliczenie wymaga co najmniej dwóch wartości wagi w odstępie tygodnia w wybranym okresie.",
    "Du liegst im Plan.": "Jesteś na dobrej drodze.",
    "Der Trend liegt über dem Ziel.": "Trend jest powyżej celu.",
    "Der Trend liegt unter dem Ziel.": "Trend jest poniżej celu.",
    "Ziel: {}": "Cel: {}",
    "(Gewicht halten)": "(utrzymanie wagi)",
    "({} {}/Woche)": "({} {}/tydzień)",
    "· Trend aktuell {} {}/Woche. {}": "· bieżący trend {} {}/tydzień. {}",
    "Für dieses Ziel passen ca. {} kcal am Tag (Dein Ziel: {}).": "Ok. {} kcal dziennie pasuje do tego celu (Twój cel: {}).",
    "Als Tagesziel übernehmen": "Użyj jako dziennego celu",
    "Ø Kalorien": "Ø kalorie",
    "Erfasste Tage": "Zapisane dni",
    "Ø Eiweiß": "Ø białko",
    "Ø Kohlenhydrate": "Ø węglowodany",
    "Ø Fett": "Ø tłuszcz",
    "Kalorien pro Tag": "Kalorie na dzień",
    "Gestrichelt: Tagesziel je Wochentag": "Linia przerywana: dzienny cel dla dnia tygodnia",
    "Gestrichelt: Tagesziel {} kcal": "Linia przerywana: dzienny cel {} kcal",
    "Nährwertverteilung (Ø)": "Podział makroskładników (Ø)",
    "Eiweiß {} %": "Białko {} %",
    "Kohlenhydrate {} %": "Węglowodany {} %",
    "Fett {} %": "Tłuszcz {} %",
    "Weitere Nährwerte (Ø pro Tag)": "Więcej składników odżywczych (Ø na dzień)",
    "Ø pro Tag": "Ø na dzień",
    "Eingetragen": "Zapisano",
    "Ziel erreicht": "Cel osiągnięty",
    "Bericht & Zeitraum-Vergleich": "Raport i porównanie okresów",
    "7 Tage vs. davor": "7 dni vs. wcześniej",
    "30 Tage vs. davor": "30 dni vs. wcześniej",
    "Eiweißziel erreicht": "Cel białka osiągnięty",
    "Kalorien im Ziel": "Kalorie w celu",
    "Gewichtsänderung": "Zmiana wagi",
    "Differenz": "Różnica",
    "Bester Tag (A): {} · Schwächster Tag (A): {}": "Najlepszy dzień (A): {} · Najsłabszy dzień (A): {}",
    "Tage": "Dni",
    "{} Tage": "{} dni",
    "{} / {} Tage": "{} / {} dni",
    "{} Einträge, {} kcal": "{} wpisów, {} kcal",
    "{} / 100 g": "{} / 100 g",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g": "{} kcal · węglowodany {} g · tłuszcz {} g · białko {} g",
    "{} kcal (Ziel {})": "{} kcal (cel {})",
    "KH {} g · Fett {} g · Eiweiß {} g": "węglowodany {} g · tłuszcz {} g · białko {} g",
    "zu {}": "do {}",
    "{} kcal · KH {} g · Fett {} g · Eiweiß {} g (pro 100 g)": "{} kcal · węglowodany {} g · tłuszcz {} g · białko {} g (na 100 g)",
    "Ø": "Ø",
    "Zustand": "Stan",
    "Kalender": "Kalendarz",
    "(am Starttag)": "(w dniu rozpoczęcia)",
    "(am Endtag)": "(w dniu zakończenia)",
    "Täglich ab {} Uhr": "Codziennie od {}",
    "enthält nicht": "nie zawiera",
    "· seit mind. {} Min.": "· co najmniej {} min",
    "· nur {}–{} Uhr": "· tylko {}–{}",
    "ODER": "LUB",
    "UND": "I",
    "Trigger pausieren": "Wstrzymaj wyzwalacz",
    "Pause beenden": "Zakończ wstrzymanie",
    "Heute": "Dziś",
    "3 Tage": "3 dni",
    "1 Woche": "1 tydzień",
    "Oder bis einschließlich": "Albo do (włącznie)",
    "Pausieren": "Wstrzymaj",
    "Zustand einer Entität (z. B. Person ist im Fitnessstudio)": "Stan encji (np. osoba jest na siłowni)",
    "Kalendereintrag": "Wydarzenie w kalendarzu",
    "Uhrzeit (täglich ab einer Zeit)": "Godzina (codziennie od godziny)",
    "z. B. person.max": "np. person.max",
    "ist / enthält": "jest / zawiera",
    "ist NICHT / enthält NICHT": "NIE jest / NIE zawiera",
    "an jedem Tag des Termins": "w każdym dniu wydarzenia",
    "nur am Starttag (z. B. Donnerstag 22 Uhr)": "tylko w dniu rozpoczęcia (np. czwartek, 22:00)",
    "nur am Endtag (z. B. Freitag 6 Uhr)": "tylko w dniu zakończenia (np. piątek, 6:00)",
    "Termin zählt": "Wydarzenie się liczy",
    "Entität": "Encja",
    "Bedingung": "Warunek",
    "z. B. calendar.arbeit": "np. calendar.praca",
    "Titel enthält, z. B. Nachtschicht": "Tytuł zawiera, np. nocna zmiana",
    "Zustand, z. B. Fitnessstudio (Zonenname) oder on": "Stan, np. siłownia (nazwa strefy) lub on",
    "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist.": "Zapisuje raz dziennie, gdy tylko nadejdzie ta godzina.",
    "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält.": "Dotyczy dni z wydarzeniem (lub bez), którego tytuł zawiera ten tekst.",
    "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).": "Dotyczy, gdy tylko encja ma (lub nie ma) ten stan.",
    "Auslöser": "Warunek wyzwalacza",
    "„{}“ nur an bestimmten Tagen anzeigen": "Pokaż „{}” tylko w niektóre dni",
    "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt.": "Dni z wpisami są zawsze widoczne. Bez reguły posiłek jest zawsze widoczny.",
    "Bitte eine Entität angeben.": "Wpisz encję.",
    "Gespeicherte Mahlzeiten": "Zapisane posiłki",
    "Tagesziel wechseln": "Zmień dzienny cel",
    "Tagesziel „{}“": "Dzienny cel „{}”",
    "Standardportion": "Domyślna porcja",
    "Tage im Voraus eintragen (nur Kalender)": "Zapisuj z wyprzedzeniem (tylko kalendarz)",
    "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht.": "0 = tylko w danym dniu. Przy np. 7 wpis jest planowany na kolejne 7 dni, gdy tylko istnieje pasujące wydarzenie.",
    "Zustand muss schon so lange anliegen (Minuten)": "Stan musi trwać tak długo (minuty)",
    "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist.": "0 = natychmiast. Np. 20: zapisuj dopiero, gdy osoba jest na siłowni od 20 minut.",
    "Nur zwischen (Uhrzeit, optional)": "Tylko między (godzina, opcjonalnie)",
    "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00).": "Poza tym oknem czasowym wyzwalacz nie zapisuje. Możliwe jest przekroczenie północy (22:00 do 06:00).",
    "Zu Mahlzeit im Tagebuch": "Do posiłku w dzienniku",
    "Bei Lebensmitteln optional mit Menge:": "Dla produktów, opcjonalnie z ilością:",
    "Alle Bedingungen müssen zutreffen (UND)": "Wszystkie warunki muszą być spełnione (I)",
    "Mindestens eine muss zutreffen (ODER)": "Co najmniej jeden musi być spełniony (LUB)",
    "Verknüpfung": "Połączenie",
    "Entität, z. B. person.anna": "Encja, np. person.anna",
    "Zustand bzw. Titel enthält (leer = an)": "Stan lub tytuł zawiera (puste = on)",
    "Bedingung entfernen": "Usuń warunek",
    "Trigger bearbeiten": "Edytuj wyzwalacz",
    "Neuer Trigger": "Nowy wyzwalacz",
    "+ Weitere Bedingung": "+ Kolejny warunek",
    "Dann": "Wtedy",
    "Bitte eine Uhrzeit angeben.": "Wpisz godzinę.",
    "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen.": "Wybierz produkt, posiłek lub dzienny cel.",
    "Weitere Bedingung: bitte eine Entität angeben.": "Kolejny warunek: wpisz encję.",
    "Komplett (alle Einträge mit Mahlzeiten)": "Kompletny (wszystkie wpisy z posiłkami)",
    "Nur Tageskalorien und Makros (eine Summe pro Tag)": "Tylko dzienne kalorie i makroskładniki (jedna suma na dzień)",
    "Neue Mahlzeit anlegen": "Utwórz nowy posiłek",
    "Mahlzeiten zuordnen": "Przypisz posiłki",
    "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)": "Ukryj puste posiłki w te dni (pokaż tylko sumę dnia)",
    "MyFitnessPal-Import": "Import z MyFitnessPal",
    "Was importieren?": "Co zaimportować?",
    "Gewicht übernehmen": "Importuj wagę",
    "Vorhandene Einträge an diesen Tagen ersetzen": "Zastąp istniejące wpisy w te dni",
    "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Zaimportowano: {} dni, {} wpisów, {} wartości wagi.",
    "Importieren": "Importuj",
    "Eiweiß {} % · Kohlenhydrate {} % · Fett {} %": "Białko {} % · Węglowodany {} % · Tłuszcz {} %",
    "· Makros ergeben {} kcal": "· makroskładniki dają {} kcal",
    "Tagesziele": "Dzienne cele",
    "Mein Ziel": "Mój cel",
    "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet.": "Decyduje, kiedy dzień liczy się jako „w celu” (redukcja: najwyżej, przyrost: co najmniej, utrzymanie: ±10 %) i jak statystyki oceniają trend Twojej wagi.",
    "Kalorien aus Makros berechnen": "Oblicz kalorie z makroskładników",
    "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g).": "Gdy zmieniają się białko, węglowodany lub tłuszcz, kalorie idą za nimi (4/4/9 kcal na g).",
    "Kalorien (kcal)": "Kalorie (kcal)",
    "Kohlenhydrate (g)": "Węglowodany (g)",
    "Gespeichert ✓": "Zapisano ✓",
    "Zusatzfunktionen": "Funkcje opcjonalne",
    "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen.": "Funkcje opcjonalne, domyślnie wyłączone. Po włączeniu pojawiają się w dzienniku i tutaj w ustawieniach.",
    "Tagesziele pro Wochentag": "Dzienne cele według dnia tygodnia",
    "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger.": "np. dni treningowe z większą liczbą kalorii, dni odpoczynku z mniejszą.",
    "Wasser und Nahrungsergänzung": "Woda i suplementy",
    "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel.": "Szybki wpis dla wody, kofeiny, kreatyny itp. z własnym dziennym celem.",
    "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter).": "Połącz składniki w przepis, podziel na porcje i zapisuj jak produkt (osobna karta).",
    "Notizen": "Notatki",
    "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten.": "Dowolny tekst do posiłków i dni (głód, trening, nastrój). Istniejące notatki zostają po wyłączeniu funkcji.",
    "Körpermaße und Fortschrittsfotos": "Pomiary ciała i zdjęcia postępów",
    "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht.": "Obwody (talia, klatka piersiowa, ramię …) z historią oraz zdjęcia z porównaniem, na karcie Waga.",
    "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit).": "Śledź i analizuj błonnik, cukier, sól i tłuszcze nasycone w produktach (dostarcza je Open Food Facts).",
    "Montag": "Poniedziałek",
    "Dienstag": "Wtorek",
    "Mittwoch": "Środa",
    "Donnerstag": "Czwartek",
    "Freitag": "Piątek",
    "Samstag": "Sobota",
    "Sonntag": "Niedziela",
    "wie Standard": "jak domyślnie",
    "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros.": "Puste kalorie = obowiązuje domyślny dzienny cel powyżej. Puste makroskładniki pokazują „–”. Przy „Oblicz kalorie z makroskładników” (powyżej) kalorie idą za makroskładnikami.",
    "Tagesziel-Profile": "Profile dziennego celu",
    "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel.": "np. „Trening” i „Dzień odpoczynku”. Wyzwalacz (Ustawienia → Wyzwalacze → „Wtedy: zmień dzienny cel”) przełącza dzień na profil, np. gdy osoba jest na siłowni. Profil ma pierwszeństwo przed celem dla dnia tygodnia.",
    "Profil löschen": "Usuń profil",
    "Profil „{}“ löschen? Trigger dafür werden ebenfalls gelöscht.": "Usunąć profil „{}”? Powiązane wyzwalacze też zostaną usunięte.",
    "Noch keine Profile.": "Brak profili.",
    "Neues Profil": "Nowy profil",
    "+ Profil": "+ Profil",
    "Einheit": "Jednostka",
    "Schritt": "Krok",
    "„{}“ samt Verlauf löschen?": "Usunąć „{}” wraz z historią?",
    "Neu, z. B. Magnesium": "Nowy, np. magnez",
    "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch.": "W wierszu: nazwa, jednostka, dzienny cel i wielkość kroku przycisków +/− w dzienniku.",
    "Feste Mahlzeiten (Frühstück, Mittagessen, …)": "Stałe posiłki (śniadanie, obiad, …)",
    "Uhrzeiten (08:47 …, 11:30 …)": "Godziny (08:47 …, 11:30 …)",
    "Automatisch (Windows-Look bei HA-95/98-Theme)": "Automatyczny (wygląd Windows z motywem HA 95/98)",
    "Standard (HA-Theme)": "Domyślny (motyw HA)",
    "Windows-Look": "Wygląd Windows",
    "Darstellung": "Wygląd",
    "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende.": "Istniejące wpisy zostają; wpisy bez godziny pojawiają się na końcu w widoku godzin.",
    "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten": "Uruchom skaner kodów kreskowych od razu po otwarciu na tym urządzeniu",
    "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.": "Dla widżetu na ekranie głównym aplikacji Companion: utwórz tam skrót do tego panelu, a aparat otworzy się od razu.",
    "Optik": "Wygląd",
    "Nach oben": "Przesuń w górę",
    "Nach unten": "Przesuń w dół",
    "Nur an bestimmten Tagen anzeigen": "Pokaż tylko w niektóre dni",
    "Wieder einblenden": "Pokaż ponownie",
    "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Ukryj (widoczny tylko w dni z wpisami)",
    "Ausblenden": "Ukryj",
    "{} – blende sie stattdessen mit ⊘ aus.": "{} – ukryj go zamiast tego przez ⊘.",
    "Neue Mahlzeit, z. B. Nachtschicht": "Nowy posiłek, np. nocna zmiana",
    "nur an Tagen: {}": "tylko w dni: {}",
    "Regel bearbeiten": "Edytuj regułę",
    "Regel löschen": "Usuń regułę",
    "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "Przez ⚡ pokazujesz posiłek tylko w dni, w które np. Twój kalendarz ma określone wydarzenie. Przez ⊘ ukrywasz go na stałe (pozostaje widoczny tylko w dni z wpisami); usunąć można tylko pusty posiłek.",
    "Trigger": "Wyzwalacze",
    "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Zapisuj produkty lub posiłki automatycznie, gdy Home Assistant coś zgłosi (lokalizacja, kalendarz, przełącznik …). Można je tworzyć też przez ⚡ przy produktach.",
    "Letzter Fehler ({}): {}": "Ostatni błąd ({}): {}",
    "Aktiv": "Aktywny",
    "pausiert bis {}": "wstrzymany do {}",
    "· {} Tage im Voraus": "· {} dni z wyprzedzeniem",
    "· zuletzt {}": "· ostatnio {}",
    "Pausieren …": "Wstrzymaj …",
    "Jetzt testen (trägt heute ein)": "Przetestuj teraz (zapisuje na dziś)",
    "Eingetragen.": "Zapisano.",
    "Noch keine Trigger.": "Brak wyzwalaczy.",
    "Prüfe …": "Sprawdzanie …",
    "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "Brak dostępu do Home Assistant (brak SUPERVISOR_TOKEN).",
    "Geprüft {}, nichts zu tun.": "Sprawdzono {}, nic do zrobienia.",
    "Jetzt prüfen": "Sprawdź teraz",
    "Version": "Wersja",
    "Installiert: ": "Zainstalowana: ",
    "Nach Updates suchen": "Sprawdź aktualizacje",
    "Keine Verbindung zu GitHub.": "Brak połączenia z GitHubem.",
    "Version {} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.": "Dostępna jest wersja {}. W Home Assistant przejdź do Ustawienia → Dodatki, sprawdź aktualizacje i zaktualizuj.",
    "Du hast die aktuelle Version.": "Masz najnowszą wersję.",
    "+ Neuer Trigger": "+ Nowy wyzwalacz",
    "Trigger-Verlauf": "Historia wyzwalaczy",
    "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein.": "Co ostatnio zapisały wyzwalacze. „Cofnij” ponownie usuwa wpisy; wyzwalacz nie zapisuje już w tym dniu.",
    "Trigger gelöscht": "Wyzwalacz usunięty",
    "(gelöscht)": "(usunięto)",
    "Einträge nicht mehr vorhanden": "Wpisy już nie istnieją",
    "Rückgängig": "Cofnij",
    "Erinnerung": "Przypomnienie",
    "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde.": "Powiadomienie przez Home Assistant, jeśli do wybranej godziny nic nie zapisano.",
    "Erinnerung aktiv": "Przypomnienie aktywne",
    "Benachrichtigungsdienst": "Usługa powiadomień",
    "Automatische Sicherung": "Automatyczna kopia zapasowa",
    "Täglich eine JSON-Sicherung in {}, Aufbewahrung {} Tage (Add-on-Option „backup_keep_days“).": "Codzienna kopia JSON w {}, przechowywana {} dni (opcja dodatku „backup_keep_days”).",
    "Aus (Add-on-Option „auto_backup“).": "Wyłączona (opcja dodatku „auto_backup”).",
    "· {} KB": "· {} KB",
    "Wiederherstellen": "Przywróć",
    "Noch keine Sicherung.": "Brak kopii zapasowej.",
    "Jetzt sichern": "Utwórz kopię teraz",
    "Schnittstelle für Automationen": "Interfejs dla automatyzacji",
    "Aktiv. Deine Benutzer-ID: {}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.": "Aktywny. Twój identyfikator użytkownika: {}. Przykłady wywołań (rest_command) są w dokumentacji dodatku.",
    "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.": "Wyłączony. Aby go włączyć, ustaw klucz „api_key” w opcjach dodatku. Wagi, asystenci głosowi lub automatyzacje mogą wtedy wysyłać wpisy i wagę.",
    "Daten": "Dane",
    "Export/Import betrifft nur dein Benutzerkonto.": "Eksport/import dotyczy tylko Twojego konta.",
    "Sicherung (JSON)": "Kopia zapasowa (JSON)",
    "Tagebuch als CSV": "Dziennik jako CSV",
    "Datei nicht lesbar:": "Nie można odczytać pliku:",
    "Sicherung einspielen": "Przywróć kopię zapasową",
    "MyFitnessPal-CSV importieren": "Importuj CSV z MyFitnessPal",
    "Keine gültige Sicherung:": "Nieprawidłowa kopia zapasowa:",
    "Sicherung wiederherstellen": "Przywróć kopię zapasową",
    "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt.": "Wszystkie bieżące dane Twojego konta zostaną zastąpione kopią zapasową.",
    "Jetzt": "Teraz",
    "Sicherung": "Kopia zapasowa",
    "Gewichtswerte": "Wartości wagi",
    "Zeitraum": "Okres",
    "Wiederhergestellt.": "Przywrócono.",
    "Ersetzen": "Zastąp",
    "Sprache und Einheiten": "Język i jednostki",
    "Sprache": "Język",
    "Einheiten": "Jednostki",
    "Automatisch (Browser)": "Automatycznie (przeglądarka)",
    "Metrisch (kg, cm)": "Metryczne (kg, cm)",
    "Imperial (lb, in)": "Imperialne (lb, in)",
    "Teilen …": "Udostępnij …",
    "„{}“ teilen": "Udostępnij „{}”",
    "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Porcja jako wielokrotność wpisu (1 = ta sama ilość). Wpis pojawia się w dzienniku innych tego samego dnia.",
    "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Ilość dla każdej osoby w gramach. Wpis pojawia się w dzienniku innych tego samego dnia.",
    "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein.": "Nikt inny jeszcze nie uczestniczy w gospodarstwie. Każdy użytkownik włącza „Gospodarstwo” w Ustawienia → Funkcje opcjonalne.",
    "Bitte mindestens eine Person wählen.": "Wybierz co najmniej jedną osobę.",
    "Eingetragen bei {} Person(en).": "Zapisano dla {} os.",
    "Haushalt": "Gospodarstwo",
    "Einträge mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Udostępniaj wpisy innym użytkownikom, każdy z własną porcją (np. jedno danie dla rodziny). Obie strony muszą włączyć funkcję.",
    "Benutzerverwaltung": "Zarządzanie użytkownikami",
    "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer).": "Widoczne tylko dla administratorów (opcja dodatku „admin_users”; puste = pierwszy użytkownik).",
    "Benutzer": "Użytkownik",
    "Zuletzt": "Ostatni",
    "Export": "Eksportuj",
    "Admin": "Admin",
    "Alle Daten von „{}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:": "Trwale usunąć wszystkie dane „{}”? Wpisz nazwę, aby potwierdzić:",
    "Nur für Administratoren": "Tylko dla administratorów",
    "Das eigene Konto kann hier nicht gelöscht werden": "Własnego konta nie można tu usunąć",
    "Zur Bestätigung den Namen des Benutzers eingeben": "Wpisz nazwę użytkownika, aby potwierdzić",
    "Haushaltsfunktion ist nicht aktiviert": "Funkcja Gospodarstwo nie jest włączona",
    "Dieser Benutzer nimmt nicht am Haushalt teil": "Ten użytkownik nie uczestniczy w gospodarstwie",
    "Weitere Importe": "Więcej importów",
    "Weitere Importe …": "Więcej importów …",
    "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“.": "Import dotyczy tylko Twojego konta. Istniejące dane zostają, chyba że wyraźnie wybierzesz „zastąp”.",
    "CSV aus einer anderen App": "CSV z innej aplikacji",
    "Datei wählen": "Wybierz plik",
    "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.": "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) i podobne tabele. Kolumny są wykrywane i można je poprawić.",
    "Apple Health": "Apple Zdrowie",
    "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.": "export.zip lub export.xml z aplikacji Zdrowie (profil → eksportuj dane zdrowotne). Plik jest odczytywany bezpośrednio w przeglądarce; przesyłane są tylko wartości dzienne.",
    "Messart": "Metryka",
    "Natrium": "Sód",
    "Bitte die Spalte mit dem Datum zuordnen.": "Przypisz kolumnę z datą.",
    "{} Einträge, {} Gewichtswerte aus {} Zeilen.": "{} wpisów, {} wartości wagi z {} wierszy.",
    "CSV importieren": "Importuj CSV",
    "Erkannt: {}": "Wykryto: {}",
    "Zuordnung der Spalten": "Przypisanie kolumn",
    "– nicht vorhanden –": "– brak –",
    "Einheit der Gewichtsspalte": "Jednostka kolumny wagi",
    "Stone": "Stone",
    "Lese Datei …": "Odczytywanie pliku …",
    "Lese Datei … {} %": "Odczytywanie pliku … {} %",
    "Keine gültige ZIP-Datei.": "To nie jest prawidłowy plik ZIP.",
    "Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.": "Bardzo duży plik ZIP (ZIP64): rozpakuj go i wybierz export.xml.",
    "In der ZIP-Datei wurde keine export.xml gefunden.": "W pliku ZIP nie znaleziono export.xml.",
    "Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.": "Ta przeglądarka nie potrafi rozpakować pliku. Rozpakuj go i wybierz export.xml.",
    "{} Gewichtswerte, {} Tage mit Ernährungsdaten gefunden.": "Znaleziono {} wartości wagi i {} dni z danymi żywieniowymi.",
    "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)": "Importuj wagę (jedna wartość na dzień, istniejące wartości są nadpisywane)",
    "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)": "Importuj dzienne sumy żywieniowe (jeden szybki wpis na dzień, przydatne tylko, jeśli posiłków nie zapisujesz tu w inny sposób)",
    "Importiert: {} Tage, {} Gewichtswerte.": "Zaimportowano: {} dni, {} wartości wagi.",
    "Die Datei enthält keine Datenzeilen.": "Plik nie zawiera wierszy z danymi.",
    "Export für Berater und Trainer": "Eksport dla dietetyka i trenera",
    "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum.": "Raport do wydrukowania lub zapisania jako PDF (wybierz „Zapisz jako PDF” w oknie drukowania) oraz tabela wartości dziennych. Zawiera tylko wybrany okres.",
    "Von": "Od",
    "Bis": "Do",
    "Einzelne Einträge im Bericht auflisten": "Wypisz pojedyncze wpisy w raporcie",
    "Bericht öffnen (Drucken / PDF)": "Otwórz raport (druk / PDF)",
    "Tagesübersicht (CSV)": "Przegląd dzienny (CSV)",
    "Makro-Verlauf": "Historia makroskładników",
    "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage.": "Słupki: gramy na dzień. Linia przerywana: dzienny cel. Linia ciągła: średnia z ostatnich 7 dni.",
    "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen.": "Słupki: gramy na dzień. Linia ciągła: średnia z ostatnich 7 dni. Cel dla tego makroskładnika ustawisz w Ustawienia → Dzienne cele.",
    "{} g (Ziel {} g)": "{} g (cel {} g)",
    "Ø 7 Tage {} g": "Ø 7 dni {} g",
    "nicht erfasst": "nie zapisano",
    "Online suchen & vergleichen": "Szukaj online i porównaj",
    "Name oder Barcode": "Nazwa lub kod kreskowy",
    "Quelle": "Źródło",
    "KH": "Węglowodany",
    "Fett": "Tłuszcz",
    "Abweichung": "Odchylenie",
    "Abweichung der kcal von dem Wert im Formular": "Odchylenie kcal od wartości w formularzu",
    "Übernehmen": "Zastosuj",
    "Mittelwert der gewählten übernehmen": "Zastosuj średnią z zaznaczonych",
    "Suche …": "Szukanie …",
    "Alle Werte pro 100 g.": "Wszystkie wartości na 100 g.",
    "Die Quellen weichen bei kcal um bis zu {} % voneinander ab – bitte prüfen.": "Źródła różnią się nawet o {} % w kcal – sprawdź.",
    "nicht erreichbar": "niedostępne",
    "Weitere Datenquellen": "Więcej źródeł danych",
    "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet).": "Wyszukiwanie online w Open Food Facts i USDA z porównaniem wartości między sobą i z Twoimi (wyszukiwane hasła są wysyłane do tych usług).",
    "Weitere Datenquellen sind nicht aktiviert": "Więcej źródeł danych nie jest włączonych",
    "Suchbegriff oder Barcode angeben": "Wpisz hasło lub kod kreskowy",
    "USDA-Limit erreicht (eigenen api.data.gov-Schlüssel in den Add-on-Optionen setzen)": "Osiągnięto limit USDA (ustaw własny klucz api.data.gov w opcjach dodatku)",
    "Open Food Facts nicht erreichbar": "Open Food Facts niedostępny",
    "Mahlzeit enthält noch Einträge": "Posiłek nadal zawiera wpisy",
    "Mahlzeit ist leer": "Posiłek jest pusty",
    "Mahlzeit braucht mindestens eine Komponente": "Posiłek wymaga co najmniej jednego składnika",
    "Keine MyDietAssistant-Sicherung": "To nie jest kopia zapasowa MyDietAssistant",
    "Das sieht nicht nach einem MyFitnessPal-Export aus.": "To nie wygląda na eksport z MyFitnessPal.",
    "Home Assistant nicht erreichbar": "Home Assistant niedostępny",
    "Uhrzeit (HH:MM) erforderlich": "Wymagana godzina (GG:MM)",
    "genau eines von Mahlzeit/Lebensmittel/Zielprofil angeben": "podaj dokładnie jedno z: posiłek / produkt / profil celu",
    "weitere Bedingung: Art und Entität erforderlich": "kolejny warunek: wymagany rodzaj i encja",
    "Name und Kalorien erforderlich": "Wymagane nazwa i kalorie",
    "ungültiger Zeitraum": "nieprawidłowy okres",
    "Quell- und Zieltag sind gleich": "Dzień źródłowy i docelowy są takie same",
    "Sicherung nicht gefunden": "Nie znaleziono kopii zapasowej",
    "Externe API ist aus: Option api_key im Add-on setzen": "Zewnętrzne API jest wyłączone: ustaw opcję api_key w dodatku",
    "falscher Schlüssel": "zły klucz",
    "Lebensmittel „{}“ nicht gefunden": "Nie znaleziono produktu „{}”",
    "food oder name angeben": "podaj produkt lub nazwę",
    "kg außerhalb des gültigen Bereichs": "kg poza dozwolonym zakresem",
    "Uhrzeit fehlt": "brak godziny",
    "Benachrichtigungsdienst wie notify.mobile_app_handy angeben": "podaj usługę powiadomień, np. notify.mobile_app_telefon",
    "not found": "nie znaleziono",
    "Aktivität": "Aktywność",
    "Aktivität eintragen": "Zapisz aktywność",
    "Schritte": "Kroki",
    "Verbrannt": "Spalone",
    "Zum Tagesziel": "Dodane do celu",
    "aus Schritten geschätzt": "oszacowane z kroków",
    "Eintragen": "Zapisz",
    "Aus Home Assistant lesen": "Odczytaj z Home Assistant",
    "Handeingabe verwerfen": "Odrzuć wpis ręczny",
    "Dein Tagesziel (+{} kcal Aktivität)": "Twój dzienny cel (+{} kcal aktywności)",
    "Tagesziel ({}) (+{} kcal Aktivität)": "Dzienny cel ({}) (+{} kcal aktywności)",
    "(+{} kcal Aktivität)": "(+{} kcal aktywności)",
    "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben.": "Wartości wpisane ręcznie nie są już nadpisywane przez czujniki w tym dniu.",
    "Verbrannte Kalorien (kcal)": "Spalone kalorie (kcal)",
    "leer = aus Schritten schätzen": "puste = oszacuj z kroków",
    "{} % der verbrannten Kalorien": "{} % spalonych kalorii",
    "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen.": "Czujniki Home Assistant, które liczą w ciągu dnia i zerują się o północy (licznik, który tylko rośnie, można zamienić na dzienny pomocnikiem „Utility Meter”). Dodatek odczytuje je co pięć minut. Bez czujnika kalorii kalorie są szacowane z kroków, masy ciała i współczynnika poniżej; wartości można też wpisać ręcznie.",
    "Sensor für Schritte": "Czujnik kroków",
    "Sensor für aktive Kalorien (kcal)": "Czujnik kalorii aktywnych (kcal)",
    "Anteil, der das Tagesziel erhöht (%)": "Udział podnoszący dzienny cel (%)",
    "kcal je Schritt und kg Körpergewicht": "kcal na krok i kg masy ciała",
    "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind.": "Wiele aplikacji zalicza tylko część spalonych kalorii (50 % to ostrożna wartość), bo dane o aktywności bywają zawyżone.",
    "z. B. sensor.handy_schritte": "np. sensor.telefon_kroki",
    "z. B. sensor.handy_aktive_kalorien": "np. sensor.telefon_kalorie_aktywne",
    "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages.": "Kroki i spalone kalorie (z czujników Home Assistant lub ręcznie) podnoszą kaloryczny cel tego dnia.",
    "Mahlzeiten-Zeitplan": "Harmonogram posiłków",
    "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung.": "Okno czasowe dla każdego posiłku: dziennik pokazuje, który posiłek jest na czasie, i może wysłać powiadomienie.",
    "Jetzt: {}": "Teraz: {}",
    "({} Uhr)": "({})",
    "Als Nächstes: {} ab {} Uhr": "Następny: {} od {}",
    "schon eingetragen": "już zapisano",
    "+ Hinzufügen": "+ Dodaj",
    "Von (leer = Standardfenster)": "Od (puste = okno domyślne)",
    "Bis (leer = Standardfenster)": "Do (puste = okno domyślne)",
    "Standardfenster": "Okno domyślne",
    "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.": "Okno czasowe dla posiłku. Gdy puste, obowiązuje okno domyślne (śniadanie, obiad i kolacja); przekąski go nie mają. Możliwe są okna przez północ.",
    "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist": "Powiadom, gdy posiłek jest na czasie, a nadal pusty",
    "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten.": "Używa usługi powiadomień z „Przypomnienia” poniżej.",
    "Zwischenspeicher der Online-Suche": "Pamięć podręczna wyszukiwania online",
    "Zwischenspeicher leeren": "Wyczyść pamięć podręczną",
    "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch.": "Dodatek lokalnie zapamiętuje zapytania do Open Food Facts i USDA (kody kreskowe 60 dni, hasła 14 dni), więc powtórne wyszukiwania nie idą już do internetu. Przechowywane są tylko dane produktów, nic o Twoim dzienniku.",
    "{} gespeicherte Abfragen ({} KB)": "{} zapamiętanych zapytań ({} KB)",
    "Barcode scannen": "Skanuj kod kreskowy",
    "Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.": "Nie udało się załadować czytnika kodów kreskowych. Wpisz numer.",
    "Mehr laden": "Załaduj więcej",
    "Tabelle importieren …": "Importuj tabelę …",
    "Werte online prüfen": "Sprawdź wartości online",
    "Prüfen": "Sprawdź",
    "Anhalten": "Zatrzymaj",
    "Ignorieren": "Ignoruj",
    "Prüfe {} von {} …": "Sprawdzanie {} z {} …",
    "Nur Lebensmittel mit Barcode ({} von {})": "Tylko produkty z kodem kreskowym ({} z {})",
    "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)": "Pytaj też USDA (surowy limit zapytań bez własnego klucza)",
    "Online-Abfrage nicht möglich: {}": "Zapytanie online niemożliwe: {}",
    "Dein Wert: {} kcal · KH {} · Fett {} · Eiweiß {}": "Twoja wartość: {} kcal · węglowodany {} · tłuszcz {} · białko {}",
    "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst.": "Porównuje Twoje produkty z Open Food Facts (po kodzie kreskowym, w przeciwnym razie po nazwie) i pokazuje odchylenia kalorii i makroskładników. Nic się nie zmienia, dopóki nie wybierzesz „Zastosuj”. Zapytania są buforowane lokalnie; kody kreskowe lub nazwy są wysyłane do usługi.",
    "Lebensmittel-Tabelle importieren": "Importuj tabelę produktów",
    "Lebensmittel-Tabelle": "Tabela produktów",
    "Energie (kJ)": "Energia (kJ)",
    "Bitte die Spalten für Name und Kalorien zuordnen.": "Przypisz kolumny z nazwą i kaloriami.",
    "{} Lebensmittel erkannt ({} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.": "Rozpoznano {} produktów ({} wierszy bez nazwy lub kalorii pominięto). Wartości są na 100 g.",
    "Kategorie für Lebensmittel ohne Kategorie in der Datei": "Kategoria zaimportowanych produktów",
    "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Istniejące produkty o tej samej nazwie i marce pozostają bez zmian.",
    "Importiert: {} neu, {} schon vorhanden, {} übersprungen.": "Zaimportowano: {} nowych, {} już było, {} pominięto.",
    "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.": "Tabela wartości odżywczych (np. BLS, eksport z Open Food Facts lub własna lista) jako plik CSV lub Excel: produkty z wartościami na 100 g trafiają do Twojej biblioteki.",
    "Mit dem Haushalt teilen": "Udostępnij gospodarstwu",
    "Teilen": "Udostępnij",
    "{} kopiert, {} übersprungen.": "Skopiowano {}, pominięto {}.",
    "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen.": "Wybrane osoby dostają własną kopię w swojej bibliotece. Wpisy o tej samej nazwie pozostają bez zmian, późniejsze zmiany nie są synchronizowane.",
    "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten.": "Udostępniaj wpisy, produkty i posiłki innym użytkownikom, każdy z własną porcją (np. jedno danie dla rodziny). Obie strony muszą włączyć funkcję.",
    "Lebensmittelmengen": "Ilości produktów",
    "Gramm": "Gramy",
    "Unzen (oz)": "Uncje (oz)",
    "Menge (oz)": "Ilość (oz)",
    "Portion (oz)": "Porcja (oz)",
    "Gewicht fertig (oz, optional)": "Waga po ugotowaniu (oz, opcjonalnie)",
    "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen.": "Ilość dla każdej osoby w uncjach. Wpis pojawia się w dzienniku innych tego samego dnia.",
    "Gesamt: {}": "Razem: {}",
    "pro Portion ({})": "na porcję ({})",
    "Pro Portion ({}): {} kcal · KH {} g · Fett {} g · Eiweiß {} g · {} Portionen": "Na porcję ({}): {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g · {} porcji",
    "Gemeinsame Haushaltsbibliothek": "Wspólna biblioteka gospodarstwa",
    "Für den Haushalt freigegeben": "Udostępnione gospodarstwu",
    "geteilt": "udostępnione",
    "von {}": "od {}",
    "Gehört {}. Änderungen gelten für alle im Haushalt.": "Należy do {}. Zmiany obowiązują wszystkich w gospodarstwie.",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)": "Oferuj we wspólnej bibliotece gospodarstwa (inni mogą go używać i edytować)",
    "Aus Mealie …": "Z Mealie …",
    "Rezept aus Mealie": "Przepis z Mealie",
    "In Mealie suchen…": "Szukaj w Mealie…",
    "Weitere laden": "Załaduj więcej",
    "{} Portionen": "{} porcji",
    "Mealie": "Mealie",
    "Adresse": "Adres",
    "API-Token": "Token API",
    "Gespeichert (leer lassen = unverändert)": "Zapisano (zostaw puste, aby zachować)",
    "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert.": "Przepis jest odczytywany z Twojego serwera Mealie, a jego składniki są dopasowywane do Twoich produktów; wszystko sprawdzasz przed zapisem. W Mealie nic się nie zmienia.",
    "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren.": "Przejmuj przepisy z serwera Mealie. Podaj adres serwera (sieć domowa lub dodatek) i token API z Mealie (profil → tokeny API). Dodatek tylko odczytuje przepisy i niczego nie zmienia w Mealie. Token pozostaje w dodatku i nie wchodzi do eksportu. Wyczyść adres, aby go usunąć.",
    "Von Webseite …": "Ze strony internetowej …",
    "Rezept von Webseite": "Przepis ze strony internetowej",
    "Lade …": "Ładowanie …",
    "Adresse der Rezeptseite": "Adres strony z przepisem",
    "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Dodatek pobiera stronę i szuka danych przepisu (składniki, porcje, sposób przygotowania). Składniki są dopasowywane do Twoich produktów; wszystko sprawdzasz przed zapisem.",
    "Zubereitung": "Sposób przygotowania",
    "Zubereitung, ein Schritt pro Zeile": "Sposób przygotowania, jeden krok w wierszu",
    "Angabe der Webseite: {} kcal pro Portion": "Podane na stronie: {} kcal na porcję",
    "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "1 składnik nie dopasowany (czerwony): wybierz produkt przez ⇄, w przeciwnym razie liczy się jako 0 kcal. Uzupełnij brakujące ilości.",
    "{} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.": "{} składników nie dopasowanych (czerwone): wybierz produkt przez ⇄, w przeciwnym razie liczą się jako 0 kcal. Uzupełnij brakujące ilości.",
    "Bitte eine Adresse mit http:// oder https:// angeben.": "Wpisz adres zaczynający się od http:// lub https://",
    "Die Adresse wurde nicht gefunden.": "Nie znaleziono adresu.",
    "Adressen im lokalen Netz sind nicht erlaubt.": "Adresy w sieci lokalnej są niedozwolone.",
    "Die Seite ist zu groß.": "Strona jest zbyt duża.",
    "Zu viele Weiterleitungen.": "Zbyt wiele przekierowań.",
    "Die Seite konnte nicht geladen werden.": "Nie udało się załadować strony.",
    "Auf dieser Seite wurde kein Rezept gefunden (es fehlen strukturierte Rezeptdaten).": "Na tej stronie nie znaleziono przepisu (brak uporządkowanych danych przepisu).",
    "Das Rezept enthält keine Zutaten.": "Przepis nie zawiera składników.",
    "Rezepte sind nicht aktiviert": "Przepisy nie są włączone",
    "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf": "Pobiera kroki i kalorie z ostatnich 30 dni z historii Home Assistant",
    "Verlauf nachladen": "Załaduj historię",
    "Verlauf nachgeladen: {} Tage.": "Załadowano historię: {} dni.",
    "Zeitraum: 1 bis 365 Tage": "Okres: od 1 do 365 dni",
    "Zuerst einen Sensor für Schritte oder Kalorien wählen": "Najpierw wybierz czujnik kroków lub kalorii",
    "Home Assistant hat den Verlauf nicht geliefert (Recorder aktiv?)": "Home Assistant nie zwrócił historii (czy recorder jest włączony?)",
    "Ungültige Entität": "Nieprawidłowa encja",
    "Wert außerhalb des Bereichs": "Wartość poza zakresem",
    "Nur im Home-Assistant-Add-on möglich": "Możliwe tylko wewnątrz dodatku Home Assistant",
    "Leere Datei": "Pusty plik",
    "Die Datei konnte nicht gelesen werden.": "Nie można odczytać pliku.",
    "Die Excel-Datei enthält kein Tabellenblatt.": "Plik Excel nie zawiera arkusza.",
    "Zu viele Zeilen (höchstens 50 000)": "Zbyt wiele wierszy (maks. 50 000)",
    "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Przypisz kolumny z nazwą i kaloriami (kcal lub kJ)",
    "Mahlzeiten-Vorschläge": "Propozycje posiłków",
    "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben).": "Przycisk w dzienniku: proponuje zapisane posiłki i kombinacje z Twojej historii, które pasują do pozostałych kalorii i makroskładników (ilości są dopasowywane, stałe opakowania zostają).",
    "Mahlzeit vorschlagen": "Zaproponuj posiłek",
    "Rest des Tages": "Reszta dnia",
    "Anteil für diese Mahlzeit": "Część na ten posiłek",
    "Ziel für diese Mahlzeit: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Cel na ten posiłek: {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g",
    "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.": "Dzienny cel już osiągnięty – nie ma czego uzupełniać.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf.": "Brak propozycji: zapisz posiłki w dzienniku przez „Zapisz / Kopiuj” albo zjedz kombinacje co najmniej dwa razy, a pojawią się tutaj.",
    "Weitere Vorschläge": "Więcej propozycji",
    "Beigabe": "Dodatek",
    "aus dem Verlauf ({}×)": "z Twojej historii ({}×)",
    "Gespeichert": "Zapisano",
    "Abweichung vom Ziel: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Odchylenie od celu: {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g",
    "Danach am Tag noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Jeszcze otwarte na resztę dnia: {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g",
    "Anpassen": "Dostosuj",
    "Fertig": "Gotowe",
    "Prioritäten und Beigaben": "Priorytety i dodatki",
    "Trainingstag": "Dzień treningowy",
    "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen.": "Wybierz shake i jego cel w „Priorytetach i dodatkach”, wtedy obliczę ilości.",
    "Der Shake ist für heute schon eingetragen.": "Shake jest już zapisany na dziś.",
    "Shake": "Shake",
    "Ziel für den Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Cel dla shake’a: {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g",
    "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel.": "Nie można obliczyć propozycji dla shake’a: ustaw w ustawieniach co najmniej jeden cel.",
    "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig.": "Tym osiągasz dzienny cel – nic nie zostaje na kolację.",
    "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“.": "Brak propozycji: zapisz posiłki w dzienniku przez „Zapisz / Kopiuj”.",
    "Noch offen: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Jeszcze otwarte: {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g",
    "Offen nach dem Shake: {} kcal · KH {} g · Fett {} g · Eiweiß {} g": "Otwarte po shake’u: {} kcal · węglowodany {} g · tłuszcz {} g · białko {} g",
    "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein.": "Twój shake po treningu: aplikacja oblicza ilości tak, by trafić w cel, a potem proponuje kolacje na resztę dnia. Shake musi być zapisany jako posiłek.",
    "– kein Shake –": "– bez shake’a –",
    "Was der Shake liefern soll (leer = egal)": "Co shake ma dostarczyć (puste = obojętne)",
    "Shake eintragen in": "Zapisz shake w",
    "erste Mahlzeit": "pierwszym posiłku",
    "Abendessen eintragen in": "Zapisz kolację w",
    "erste freie Mahlzeit": "pierwszym wolnym posiłku",
    "Trigger tragen den Shake mit den berechneten Mengen ein": "Wyzwalacze zapisują shake z obliczonymi ilościami",
    "Vorschläge einstellen": "Ustawienia propozycji",
    "Wichtigkeit": "Ważność",
    "egal": "obojętne",
    "normal": "normalne",
    "wichtig": "ważne",
    "sehr wichtig": "bardzo ważne",
    "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor.": "Im ważniejsza wartość, tym dokładniej propozycja ma ją trafić. Wartości bez celu są pomijane.",
    "Kalorienziel nie überschreiten": "Nigdy nie przekraczaj celu kalorii",
    "Eiweißziel möglichst erreichen": "Osiągnij cel białka, jeśli to możliwe",
    "Beigaben": "Dodatki",
    "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite.": "Produkty pasujące do każdego posiłku (np. orzechy). Propozycja dodaje je tylko wtedy, gdy lepiej pasują do reszty. Pola: minimum, maksimum, krok.",
    "Mindestmenge": "Ilość minimalna",
    "Höchstmenge": "Ilość maksymalna",
    "Schrittweite": "Wielkość kroku",
    "Beigabe hinzufügen": "Dodaj dodatek",
    "+ Beigabe": "+ Dodatek",
    "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.": "Skalowalny: podąża za współczynnikiem ilości posiłku. Stały: pozostaje bez zmian.",
    "Skalierbar": "Skalowalny",
    "Fest": "Stały",
    "Packung": "Opakowanie",
    "Abweichung ±": "Odchylenie ±",
    "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)": "O ile ten składnik może odbiegać od proporcji względem pozostałych (w procentach)",
    "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.": "Wielkość opakowania: propozycja używa tylu opakowań, ile ustawiono w „Liczba”. Puste = dokładnie zapisana ilość.",
    "Mengenfaktor für Vorschläge": "Współczynnik ilości dla propozycji",
    "von": "od",
    "bis": "do",
    "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6.": "O ile cały posiłek może być zmniejszony lub powiększony w propozycjach (1 = ilość jak zapisano). Puste = od 0,6 do 1,6.",
    "Mahlzeiten-Vorschläge sind nicht aktiviert": "Propozycje posiłków nie są włączone",
    "Vorschlag ist leer": "Propozycja jest pusta",
    "Ungültige Werte": "Nieprawidłowe wartości",
    "Kleinster Faktor ist größer als der größte": "Najmniejszy współczynnik jest większy od największego",
    "Wie viele Packungen ein Vorschlag nehmen darf": "Ile opakowań może użyć propozycja (od – do; 0 = można pominąć)",
    "Anzahl": "Liczba",
    "Ausschließen": "Wyklucz",
    "Ausgeschlossen": "Wykluczone",
    "Zulassen": "Zezwól",
    "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück.": "Te posiłki nie pojawiają się już w propozycjach. „Zezwól” przywraca je.",
    "Frühstück": "Śniadanie",
    "Mittagessen": "Obiad",
    "Abendessen": "Kolacja",
    "Snacks": "Przekąski",
    "Mahlzeit": "Posiłek",
    "Menge": "Ilość",
    "Die Makros ergeben {} g auf 100 g – mehr als möglich.": "Makroskładniki sumują się do {} g na 100 g – więcej niż możliwe.",
    "Die Makros ergeben rechnerisch ca. {} kcal, angegeben sind {} kcal.": "Makroskładniki dają ok. {} kcal, a wpisano {} kcal.",
    "{} Lebensmittel durch ausgeblendete Kategorien versteckt.": "{} produktów ukrytych przez ukryte kategorie.",
    "{}: Werte übernommen ✓": "{}: wartości zastosowane ✓",
    "{}: {} kcal · KH {} · Fett {} · Eiweiß {} ({})": "{}: {} kcal · węglowodany {} · tłuszcz {} · białko {} ({})",
    "{} geprüft: {} stimmen überein, {} weichen ab, {} ohne Treffer.": "Sprawdzono {}: {} zgodnych, {} różnych, {} bez dopasowania.",
    "{} Einträge, {} Gewichtswerte ({} bis {}) aus {} Zeilen.": "{} wpisów, {} wartości wagi ({} do {}) z {} wierszy.",
    "{} Tage ({} bis {}), {} Einträge, {} Gewichtswerte": "{} dni ({} do {}), {} wpisów, {} wartości wagi",
    "{} Uhr · {}": "{} · {}",
    "Die Excel-Datei ist zu groß.": "Plik Excel jest zbyt duży.",
    "Mealie ist noch nicht eingerichtet (Einstellungen → Mealie).": "Mealie nie jest jeszcze skonfigurowane (Ustawienia → Mealie).",
    "Mealie konnte nicht erreicht werden.": "Nie udało się połączyć z Mealie.",
    "Bitte eine Adresse wie http://mealie:9000 angeben.": "Wpisz adres taki jak http://mealie:9000.",
    "Nicht gefunden (Adresse oder Rezept prüfen).": "Nie znaleziono (sprawdź adres lub przepis).",
    "Mealie antwortete mit Fehler {}.": "Mealie odpowiedziało błędem {}.",
    "Unter dieser Adresse läuft kein Mealie.": "Pod tym adresem nie działa żadne Mealie.",
    "Ungültiges Rezept.": "Nieprawidłowy przepis.",
    "Diese Adresse ist nicht erlaubt (Mealie läuft auf einem eigenen Server oder Add-on).": "Ten adres jest niedozwolony (Mealie działa na własnym serwerze lub jako dodatek).",
    "Mealie ist nicht erreichbar.": "Mealie jest niedostępne.",
    "Die Seite antwortete mit Fehler {}.": "Strona odpowiedziała błędem {}.",
    "Rezept": "Przepis",
    "Wasser": "Woda",
    "Koffein": "Kofeina",
    "Kreatin": "Kreatyna",
    "{} (Kopie)": "{} (kopia)",
    "Daten löschen …": "Usuń dane …",
    "Daten löschen": "Usuń dane",
    "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an.": "Trwale usuwa wybrane dane Twojego konta. Inni użytkownicy i ustawienia pozostają nietknięte. Najlepiej najpierw utworzyć kopię zapasową (JSON).",
    "Einträge, Notizen, Wasser und Aktivität aller Tage": "wpisy, notatki, woda i aktywność ze wszystkich dni",
    "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)": "wszystkie produkty z biblioteki (wpisy w dzienniku zostają)",
    "alle gespeicherten Mahlzeiten": "wszystkie zapisane posiłki",
    "alle Rezepte samt ihrer Lebensmittel": "wszystkie przepisy wraz z ich produktami",
    "Gewicht und Körpermaße": "Waga i pomiary ciała",
    "Gewichtswerte, Körpermaße und Fortschrittsfotos": "wartości wagi, pomiary ciała i zdjęcia postępów",
    "Tagesziel, Wochentagsziele und Profile": "dzienny cel, cele dla dni tygodnia i profile",
    "alle Trigger und Mahlzeiten-Regeln samt Verlauf": "wszystkie wyzwalacze i reguły posiłków wraz z historią",
    "Bitte mindestens einen Bereich wählen.": "Wybierz co najmniej jeden obszar.",
    "Bitte mindestens einen gültigen Bereich wählen.": "Wybierz co najmniej jeden prawidłowy obszar.",
    "Wirklich unwiderruflich löschen: {}?": "Naprawdę usunąć trwale: {}?",
    "Gelöscht.": "Usunięto.",
    "Endgültig löschen": "Usuń trwale",
    "Abendessen sollen das Eiweißziel möglichst erreichen": "Kolacje powinny jak najlepiej osiągać cel białka",
    "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)": "Pokazuj przycisk „Dzień treningowy” codziennie (w przeciwnym razie tylko gdy shake jest zapisany lub zapisał go wyzwalacz)",
    "Einkaufsliste": "Lista zakupów",
    "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt.": "Wybierz przepisy (porcje) i zapisane posiłki (wielokrotność, 1 = raz): składniki zostaną zsumowane.",
    "Noch nichts gewählt.": "Nic jeszcze nie wybrano.",
    "In die Zwischenablage kopieren": "Kopiuj do schowka",
    "Kopiert ✓": "Skopiowano ✓",
    "An Home Assistant senden": "Wyślij do Home Assistant",
    "Todo-Liste": "Lista zadań",
    "Keine Todo-Liste in Home Assistant gefunden.": "Nie znaleziono listy zadań w Home Assistant.",
    "{} Einträge gesendet.": "Wysłano {} pozycji.",
    "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste).": "Sumuje składniki przepisów i zapisanych posiłków, kopiuje je lub wysyła na listę zadań w Home Assistant (np. listę zakupów).",
    "Einkaufsliste nicht aktiviert": "Lista zakupów nie jest włączona",
    "Todo-Liste fehlt": "Brak listy zadań",
    "Keine Einträge": "Brak pozycji",
    "Home Assistant nicht erreichbar (gesendet: {})": "Home Assistant niedostępny (wysłano: {})",
    "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)": "Oferuj we wspólnej bibliotece gospodarstwa (inni mogą go używać i kopiować)",
    "Wochenbericht": "Raport tygodniowy",
    "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“.": "Raz w tygodniu podsumowanie ostatnich siedmiu dni jako powiadomienie. Używa usługi powiadomień z „Przypomnienia”.",
    "Wochenbericht aktiv": "Raport tygodniowy aktywny",
    "Wochentag": "Dzień tygodnia",
    "Vorschau": "Podgląd",
    "Datenbank": "Baza danych",
    "{} · {} Zeilen in {} Tabellen · frei {} · letzte Sicherung: {}": "{} · {} wierszy w {} tabelach · wolne {} · ostatnia kopia: {}",
    "Prüfen und verdichten": "Sprawdź i skompaktuj",
    "Prüfung läuft …": "Sprawdzanie …",
    "Verdichtet: {} → {}": "Skompaktowano: {} → {}",
    "Datenbank ist in Ordnung.": "Baza danych jest w porządku.",
    "Datenbank prüfen: {}": "Sprawdzenie bazy danych: {}",
    "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)": "Rozpoznawaj też od tylu spalonych kalorii (kcal, 0 = wyłączone)",
    "Wochentag ungültig": "Nieprawidłowy dzień tygodnia",
    "Andere dürfen es auch ändern": "Inni też mogą go zmieniać",
    "Nährwert-Lücken (7 Tage)": "Braki składników odżywczych (7 dni)",
    "Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; {} von {} Tagen erfasst.": "Średnia z ostatnich 7 dni (tylko dni z wartościami) względem wartości referencyjnych; zapisano {} z {} dni.",
    "nicht genug Angaben": "za mało danych",
    "Ziele ändern": "Zmień cele",
    "Ziele für weitere Nährwerte": "Cele dla większej liczby składników",
    "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze.": "Wartości referencyjne na dzień w g. Błonnik należy osiągnąć; dla cukru, soli i tłuszczów nasyconych to górna granica.",
    "Weitere Nährwerte sind nicht aktiviert": "Więcej składników odżywczych nie jest włączone",
    "Ziele müssen zwischen 0 und 1000 liegen": "Cele muszą mieścić się między 0 a 1000",
    "Ø {} g (mind. {} g) – im Ziel": "Ø {} g (co najmniej {} g) – w celu",
    "Ø {} g (mind. {} g) – {} % unter dem Ziel": "Ø {} g (co najmniej {} g) – {} % poniżej celu",
    "Ø {} g (höchstens {} g) – im Ziel": "Ø {} g (najwyżej {} g) – w celu",
    "Ø {} g (höchstens {} g) – {} % über dem Ziel": "Ø {} g (najwyżej {} g) – {} % powyżej celu",
    "Aus Text …": "Z tekstu …",
    "Rezept aus Text": "Przepis z tekstu",
    "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird.": "Wklej przepis jako tekst: najpierw tytuł, potem składniki (jeden w wierszu, z ilością) i sposób przygotowania. Nagłówki takie jak „Składniki” i „Sposób przygotowania” pomagają. Składniki są dopasowywane do Twoich produktów; wszystko sprawdzasz przed zapisem.",
    "Rezepttext": "Tekst przepisu",
    "Im Text wurden keine Zutaten gefunden (Zeilen mit Mengen, z. B. „200 g Mehl“).": "W tekście nie znaleziono składników (wiersze z ilościami, np. „200 g mąki”).",
    "Der Text ist zu lang.": "Tekst jest zbyt długi.",
    "Offline: 1 Eintrag wartet auf Verbindung.": "Offline: 1 wpis czeka na połączenie.",
    "Offline: {} Einträge warten auf Verbindung.": "Offline: {} wpisów czeka na połączenie.",
    "Hauptmenü": "Menu główne",
    "Zeitraum A, von": "Okres A, od",
    "Zeitraum A, bis": "Okres A, do",
    "Zeitraum B, von": "Okres B, od",
    "Zeitraum B, bis": "Okres B, do",
  },
});

const I18N = (() => {
  let exact = new Map(), pats = [];
  const compile = dict => {
    exact = new Map(); pats = [];
    for (const [k, v] of Object.entries(dict)) {
      if (!k.includes("{}")) { exact.set(k, v); continue; }
      const parts = k.split("{}").map(p => p.replace(/[.*+?^$()|[\]\\]/g, "\\$&"));
      const weight = k.replace(/\{\}/g, "").length;
      // very short templates ("Alle {}") only match a single token so they cannot swallow whole sentences
      pats.push({ re: new RegExp("^" + parts.join(weight < 8 ? "(\\S+(?: \\S+){0,2})" : "([\\s\\S]*?)") + "$"), to: v, weight });
    }
    pats.sort((a, b) => b.weight - a.weight);
  };

  const api = { lang: "de", locale: "de-DE", units: "metric", mass: "g" };
  const find = s => {
    if (exact.has(s)) return exact.get(s);
    const q = /^„([\s\S]*)“$/.exec(s);          // quoted names, e.g. a meal name
    if (q) { const inner = find(q[1]); if (inner != null) return "“" + inner + "”"; }
    for (const p of pats) {
      const m = p.re.exec(s);
      if (m) { let i = 1; return p.to.replace(/\{\}/g, () => { const c = m[i++]; return find(c) ?? c; }); }
    }
    return null;
  };
  // translate one string; keeps leading/trailing blanks, tries line by line as a fallback
  api.tr = s => {
    if (api.lang === "de" || typeof s !== "string" || !s) return s;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    if (!m[2]) return s;
    let r = find(m[2]);
    if (r == null && m[2].includes("\n")) r = m[2].split("\n").map(l => (l.trim() ? api.tr(l) : l)).join("\n");
    return r == null ? s : m[1] + r + m[3];
  };

  const ATTRS = ["placeholder", "title", "aria-label", "alt", "data-tip"];
  const SKIP = new Set(["TEXTAREA"]);
  const fixText = n => { const t = api.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; };
  const fixAttr = (el, a) => { const v = el.getAttribute(a); if (v) { const t = api.tr(v); if (t !== v) el.setAttribute(a, t); } };
  const walk = node => {
    if (node.nodeType === 3) return fixText(node);
    if (node.nodeType !== 1 || node.tagName === "SCRIPT" || node.tagName === "STYLE") return;
    for (const a of ATTRS) fixAttr(node, a);
    if (!SKIP.has(node.tagName)) node.childNodes.forEach(walk);   // a textarea's own text is the user's input, but its placeholder is ours
  };
  let obs = null;
  api.setLang = (lang, units, mass) => {
    if (lang === "auto" || !lang) lang = (navigator.language || "de").toLowerCase().slice(0, 2);
    api.lang = LANGS[lang] ? lang : "de";
    api.locale = LANG_LOCALES[api.lang];
    if (api.lang !== "de") compile(LANGS[api.lang]);
    if (units) api.units = units;
    if (mass) api.mass = mass;
    document.documentElement.lang = api.lang;
    if (api.lang !== "de" && !obs) {
      obs = new MutationObserver(muts => {
        for (const m of muts) {
          if (m.type === "childList") m.addedNodes.forEach(walk);
          else if (m.type === "characterData") fixText(m.target);
          else if (m.type === "attributes") fixAttr(m.target, m.attributeName);
        }
      });
      obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
      document.title = api.tr(document.title);
    }
    if (api.lang !== "de") walk(document.body);
  };
  for (const fn of ["confirm", "alert", "prompt"]) {
    const orig = window[fn].bind(window);
    window[fn] = (msg, ...rest) => orig(api.tr(String(msg)), ...rest);
  }
  return api;
})();

// ---------------------------------------------------------------- app
// All URLs are relative so the app works behind HA ingress.
const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e[k] = v;
    else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  e.append(...kids.flat().filter(x => x != null));
  if ((tag === "h2" || tag === "summary") && typeof kids[0] === "string") e.dataset.src = kids[0];   // the German title, whatever the display language
  return e;
};
// Offline queue: diary entries and weights typed while there is no connection (e.g. in a shop with bad reception) wait in the
// browser and are sent once the connection is back. Only these few safe requests are queued; everything else fails as usual.
const QUEUE_KEY = "mda_offline_queue";
const queueable = (method, path) => (method === "POST" && (path === "entries" || path === "entries/quick")) || (method === "PUT" && /^weights\/\d{4}-\d{2}-\d{2}$/.test(path));
const readQueue = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; } };
const writeQueue = q => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch { /* storage unavailable: nothing is kept */ } showQueue(); };
function showQueue() {
  const n = readQueue().length;
  let bar = document.getElementById("offline-bar");
  if (!n) { if (bar) bar.remove(); return; }
  if (!bar) { bar = h("div", { id: "offline-bar", class: "offline-bar", role: "status" }); document.body.prepend(bar); }
  bar.textContent = n === 1 ? "Offline: 1 Eintrag wartet auf Verbindung." : `Offline: ${n} Einträge warten auf Verbindung.`;
}
let flushing = false;
async function flushQueue() {
  if (flushing) return;
  flushing = true;
  try {
    let q = readQueue(), sent = 0;
    while (q.length) {
      let r;
      try { r = await fetch("api/" + q[0].path, { method: q[0].method, headers: { "Content-Type": "application/json" }, body: q[0].body }); }
      catch { break; }                                             // still offline: keep the rest
      q = readQueue().slice(1);                                    // sent, or refused by the server (a retry would not help): drop it
      writeQueue(q);
      if (r.ok) sent++;
    }
    if (sent && state.tab === "diary" && !document.querySelector("dialog[open]")) renderDiary();
  } finally { flushing = false; }
}
window.addEventListener("online", flushQueue);
setInterval(() => { if (readQueue().length) flushQueue(); }, 30000);

const api = async (path, opts) => {
  let r;
  try { r = await fetch("api/" + path, opts); }
  catch (e) {
    const method = (opts && opts.method) || "GET";
    if (e instanceof TypeError && queueable(method, path) && opts.body) {      // no connection: keep it for later
      writeQueue([...readQueue(), { method, path, body: opts.body, at: Date.now() }]);
      return { queued: true };
    }
    throw e;
  }
  if (!r.ok) {
    let msg = r.status;
    try { const d = (await r.json()).detail; msg = Array.isArray(d) ? d.map(x => (x.loc || []).slice(1).join(".") + ": " + x.msg).join("; ") : d || msg; } catch { /* keep status */ }
    throw new Error(msg);
  }
  return r.json();
};
const send = (method, path, body) =>
  api(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// Is a calorie total "too much" for the chosen goal (lose: above, maintain: more than 10 % above, gain: never)?
const goalOver = (kcal, goal) => !goal ? false : state.goalMode === "gain" ? false : state.goalMode === "maintain" ? kcal > goal * 1.1 : kcal > goal;
// Weights are stored in kg and body measurements in cm; imperial users see (and type) lb and inches.
const KG_LB = 2.2046226218, CM_IN = 2.54;
const imperial = () => I18N.units === "imperial";
const wUnit = () => (imperial() ? "lb" : "kg");
const wConv = kg => (imperial() ? kg * KG_LB : kg);
const wIn = v => (imperial() ? v / KG_LB : v);
// Food amounts are stored in grams; with the setting "Unzen" they are shown and typed in oz.
const OZ = 28.349523125;
const ozMode = () => I18N.mass === "oz";
const mUnit = () => (ozMode() ? "oz" : "g");
const gShow = g => (ozMode() ? Math.round(g / OZ * 100) / 100 : Math.round(g * 10) / 10);   // grams -> value for an amount field
const gRead = v => { const x = num(v); return x == null ? null : ozMode() ? x * OZ : x; };     // amount field -> grams
const gText = g => (ozMode() ? n1(g / OZ) : n0(g)) + " " + mUnit();
const gMin = () => (ozMode() ? "0.05" : "1");
const amtLabel = () => (ozMode() ? "Menge (oz)" : "Menge (g)");
const n0 = n => Math.round(n).toLocaleString(I18N.locale);
const n1 = n => (Math.round(n * 10) / 10).toLocaleString(I18N.locale, { minimumFractionDigits: 1 });
const iso = d => d.toLocaleDateString("sv");
const parse = s => new Date(s + "T12:00:00");
const num = v => (v === "" || v == null ? null : Number(String(v).replace(",", ".")));

const state = { skin: "auto", goalMode: "lose", goalRate: 0.5, features: {}, day: iso(new Date()), tab: "diary", range: 30, wrange: 90, whist: 10 };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const longDate = day => parse(day).toLocaleDateString(I18N.locale, { weekday: "short", day: "numeric", month: "numeric", year: "numeric" });

// Hover tooltip for charts: elements with a data-tip attribute (SVG hit areas) show their text.
const tip = h("div", { id: "tip", hidden: true });
document.body.append(tip);
function tipHandlers(box) {
  const move = e => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.dataset.tip;
    tip.hidden = false;
    const w = tip.offsetWidth, hh = tip.offsetHeight;
    tip.style.left = Math.max(4, Math.min(e.clientX + 14, innerWidth - w - 4)) + "px";
    tip.style.top = (e.clientY - hh - 12 < 4 ? e.clientY + 18 : e.clientY - hh - 12) + "px";
  };
  box.addEventListener("mousemove", move);
  box.addEventListener("click", move);
  box.addEventListener("mouseleave", () => { tip.hidden = true; });
  return box;
}

// Axis labels on round dates: every day, 5-day marks, 1st/15th, or month starts depending on the span.
function niceTicks(first, last) {
  const n = Math.round((parse(last) - parse(first)) / 864e5) + 1;
  const all = [];
  for (let i = 0; i < n; i++) { const d = parse(first); d.setDate(d.getDate() + i); all.push(d); }
  let pick = () => true;
  let fmt = d => d.toLocaleDateString(I18N.locale, { day: "numeric", month: "numeric" });
  if (n > 100) {
    const every = n > 200 ? 2 : 1;
    pick = d => d.getDate() === 1 && d.getMonth() % every === 0;
    fmt = d => d.toLocaleDateString(I18N.locale, d.getMonth() === 0 ? { month: "short", year: "2-digit" } : { month: "short" });
  } else if (n > 31) pick = d => d.getDate() === 1 || d.getDate() === 15;
  else if (n > 10) pick = d => [1, 5, 10, 15, 20, 25].includes(d.getDate());
  return all.filter(pick).map(d => ({ day: iso(d), label: fmt(d) }));
}

// Plausibility of calories against macros (per 100 g): 4 kcal/g carbs and protein, 9 kcal/g fat.
function plausibility(f, total = false) {
  const c = f.carbs || 0, p = f.protein || 0, fa = f.fat || 0;
  if (!total && c + p + fa > 100.5) return `Die Makros ergeben ${n0(c + p + fa)} g auf 100 g – mehr als möglich.`;
  if (!c && !p && !fa) return null;
  const calc = 4 * c + 4 * p + 9 * fa;
  // tolerance for fibre (less energy) and alcohol (more energy)
  if (Math.abs(f.kcal - calc) > Math.max(25, calc * 0.2))
    return `Die Makros ergeben rechnerisch ca. ${n0(calc)} kcal, angegeben sind ${n0(f.kcal)} kcal.`;
  return null;
}
const dlg = $("#dlg");
// A dialog is a title (h2) plus a body; the body wrapper lets the Windows look pad the content.
const setDlg = (...kids) => {
  const [first, ...rest] = kids.flat(Infinity).filter(x => x != null && x !== false);
  if (first && first.tagName === "H2") dlg.replaceChildren(first, h("div", { class: "dlg-body" }, ...rest));
  else dlg.replaceChildren(h("div", { class: "dlg-body" }, first, ...rest));
};

// Optik: "auto" switches to the Windows look when the HA theme is called HA 95/98 (see theme.js).
const SKIN_RE = /ha[\s_-]*9[58]|windows|win[\s_-]*9[58]/i;
function applySkin() {
  const name = document.documentElement.dataset.themeName || "";
  const win = state.skin === "win" || (state.skin !== "default" && SKIN_RE.test(name));
  document.documentElement.dataset.skin = win ? "win" : "default";
  applyTone();
}
// Light or dark HA theme, from the resolved card colour: the Windows look needs it for fields, ink and bevels.
function applyTone() {
  const probe = h("div", { style: "position:absolute;visibility:hidden;background:var(--card-background-color,#fff)" });
  document.body.append(probe);
  const m = /\d+(\.\d+)?/g, rgb = (getComputedStyle(probe).backgroundColor.match(m) || [255, 255, 255]).map(Number);
  probe.remove();
  const dark = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) < 128;
  const tone = dark ? "dark" : "light";
  if (document.documentElement.dataset.tone !== tone) document.documentElement.dataset.tone = tone;
}
setInterval(applyTone, 2000);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTone);
new MutationObserver(applySkin).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-name"] });

// ---------------------------------------------------------------- tabs
$("#tabs").addEventListener("click", e => {
  const t = e.target.closest("button");
  if (t) show(t.dataset.tab);
});
function show(tab) {
  state.tab = tab;
  for (const b of document.querySelectorAll("#tabs button")) {
    b.classList.toggle("active", b.dataset.tab === tab);
    b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false");
    b.tabIndex = b.dataset.tab === tab ? 0 : -1;
  }
  for (const s of document.querySelectorAll("main > section")) s.hidden = s.id !== tab;
  return ({ diary: renderDiary, foods: renderFoods, meals: renderMeals, weight: renderWeight, stats: renderStats, settings: renderSettings, recipes: renderRecipes })[tab]();
}

// ---------------------------------------------------------------- accessibility
// The interface is built from plain elements, so names and roles are added in one place: fields without a label get one from their
// placeholder, title or the label next to them, icon buttons take their title, errors are announced, the dialog is named by its heading.
let a11yTimer = 0;
function a11yPass() {
  a11yTimer = 0;
  for (const el of document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([aria-label]), select:not([aria-label]), textarea:not([aria-label]), input[type=checkbox]:not([aria-label]), input[type=radio]:not([aria-label])")) {
    if ((el.labels && el.labels.length) || el.closest("label")) continue;
    let name = el.getAttribute("title") || el.getAttribute("placeholder");
    if (!name) { const prev = el.previousElementSibling; if (prev && prev.tagName === "LABEL") name = prev.textContent; }
    if (!name && el.parentElement) { const lab = el.parentElement.querySelector(":scope > .grow, :scope > label"); if (lab && lab !== el) name = lab.textContent; }
    if (name && name.trim()) el.setAttribute("aria-label", name.trim().slice(0, 120));
  }
  for (const b of document.querySelectorAll("button:not([aria-label])")) {
    if (b.title && (!b.textContent.trim() || b.classList.contains("icon"))) b.setAttribute("aria-label", b.title);
  }
  for (const e of document.querySelectorAll(".err:not([role])")) e.setAttribute("role", "alert");
  const h2 = dlg.querySelector("h2");
  if (h2) { h2.id = "dlg-title"; dlg.setAttribute("aria-labelledby", "dlg-title"); } else dlg.removeAttribute("aria-labelledby");
}
new MutationObserver(() => { if (!a11yTimer) a11yTimer = requestAnimationFrame(a11yPass); }).observe(document.body, { childList: true, subtree: true });
// Arrow keys move between the tabs (tablist pattern).
$("#tabs").addEventListener("keydown", e => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
  const tabs = [...document.querySelectorAll("#tabs button:not([hidden])")];
  const i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  const next = e.key === "Home" ? tabs[0] : e.key === "End" ? tabs[tabs.length - 1] : tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
  e.preventDefault(); next.focus(); next.click();
});

// ---------------------------------------------------------------- categories
const cat = { all: [], hidden: [] };
const loadCats = async () => Object.assign(cat, await api("categories"));
const isVisible = x => !x.category || !cat.hidden.includes(x.category);
const catList = () => h("datalist", { id: "cat-list" }, cat.all.map(c => h("option", { value: c })));

// Toggle chips: a highlighted category is shown, the others are hidden everywhere.
function catChips(onchange) {
  if (!cat.all.length) return null;
  return h("div", { class: "range chips" }, h("span", { class: "muted" }, "Kategorien:"), cat.all.map(c => {
    const b = h("button", { class: cat.hidden.includes(c) ? "" : "active", title: "Ein-/ausblenden", onclick: async () => {
      cat.hidden = cat.hidden.includes(c) ? cat.hidden.filter(x => x !== c) : [...cat.hidden, c];
      await send("PUT", "categories/hidden", { hidden: cat.hidden });
      b.classList.toggle("active", !cat.hidden.includes(c));
      onchange();
    } }, c);
    return b;
  }));
}

// ---------------------------------------------------------------- diary
const timeNow = () => new Date().toTimeString().slice(0, 5);
const entryLabel = e => (e.grams > 0 ? `${e.name}, ${gText(e.grams)}` : e.name);

async function renderDiary() {
  const isToday = state.day === iso(new Date());
  const [d, trackers, sched, act, , train] = await Promise.all([api("day/" + state.day), state.features.trackers ? api("trackers?day=" + state.day) : [],
    state.features.schedule && isToday ? api("schedule").catch(() => null) : null,
    state.features.activity ? api("activity?day=" + state.day).catch(() => null) : null, loadCats(),
    state.features.suggest ? api("suggest/training/status?day=" + state.day).catch(() => ({ show: true })) : null]);
  state.data = d;
  const times = d.mode === "times";
  const root = $("#diary");
  root.replaceChildren();

  const label = parse(state.day).toLocaleDateString(I18N.locale,
    { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const picker = h("input", { type: "date", value: state.day, "aria-label": "Datum", onchange: e => {
    if (e.target.value) { state.day = e.target.value; renderDiary(); }
  } });
  root.append(h("div", { class: "daynav" },
    h("button", { class: "step", onclick: () => shiftDay(-1), "aria-label": "Vortag" }, "‹"),
    h("div", { class: "date" }, label, picker),
    h("button", { class: "step", onclick: () => shiftDay(1), "aria-label": "Folgetag" }, "›")));

  // meal schedule (optional): which meal is due now
  if (sched && !times) {
    const info = id => sched.meals.find(x => x.id === id);
    const cur = d.meals.find(m => m.id === sched.current), nxt = d.meals.find(m => m.id === sched.next);
    if (cur) root.append(h("div", { class: "card now-banner" },
      h("div", { class: "grow" }, h("b", {}, `Jetzt: ${cur.name}`), " ", h("span", { class: "muted" }, `(${info(cur.id).window.join("–")} Uhr)`),
        info(cur.id).logged ? h("span", { class: "tag" }, "schon eingetragen") : null),
      h("button", { onclick: () => openAdd(cur) }, "+ Hinzufügen")));
    else if (nxt) root.append(h("div", { class: "card now-banner" }, h("div", { class: "muted" }, `Als Nächstes: ${nxt.name} ab ${info(nxt.id).window[0]} Uhr`)));
  }

  // one card per meal, or a single chronological card in time mode
  const section = (title, items, meal) => {
    const sum = k => items.reduce((a, e) => a + e[k], 0);
    const rows = items.map(e => h("tr", { class: "item" },
      h("td", { onclick: () => editEntry(e, times), title: "Bearbeiten" },
        times ? h("span", { class: "time" }, e.time || "––:––") : null, entryLabel(e)),
      h("td", {}, n0(e.kcal)), h("td", {}, n0(e.carbs)), h("td", {}, n0(e.fat)), h("td", {}, n0(e.protein)),
      h("td", {}, h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", onclick: async () => {
        await api("entries/" + e.id, { method: "DELETE" });
        renderDiary();
      } }, "✕"))));
    const note = d.notes[meal ? meal.id : 0];
    return h("div", { class: "card" + (meal && sched && meal.id === sched.current ? " now" : "") }, h("table", { class: "diary" },
      h("thead", {}, h("tr", {},
        h("th", { class: "title" }, title),
        h("th", {}, "Kalorien", h("small", {}, "kcal")),
        h("th", {}, "Kohlenhydrate", h("small", {}, "g")),
        h("th", {}, "Fette", h("small", {}, "g")),
        h("th", {}, "Eiweiß", h("small", {}, "g")),
        h("th", {}))),
      h("tbody", {}, rows, h("tr", { class: "foot" },
        h("td", {},
          h("button", { class: "flat", onclick: () => openAdd(meal) }, "+ Nahrungsmittel hinzufügen"),
          state.features.notes ? h("button", { class: "flat", title: "Notiz zur Mahlzeit", onclick: () => noteDialog(meal ? meal.id : 0, meal ? meal.name : "Tag") },
            d.notes[meal ? meal.id : 0] ? "Notiz ändern" : "Notiz") : null,
          items.length ? [
            h("button", { class: "flat", onclick: () => copyDialog(meal, items, times) }, "Speichern / Kopieren")] : null),
        h("td", {}, items.length ? n0(sum("kcal")) : ""), h("td", {}, items.length ? n0(sum("carbs")) : ""),
        h("td", {}, items.length ? n0(sum("fat")) : ""), h("td", {}, items.length ? n0(sum("protein")) : ""),
        h("td", {}, items.length ? h("button", { class: "icon", title: meal ? "Mahlzeit leeren" : "Tag leeren",
          "aria-label": "Mahlzeit leeren", onclick: async () => {
            if (!confirm(meal ? `Alle Einträge von „${meal.name}“ löschen?` : "Alle Einträge dieses Tages löschen?")) return;
            await api(`day/${state.day}/entries` + (meal ? "?meal_id=" + meal.id : ""), { method: "DELETE" });
            renderDiary();
          } }, "✕") : null)))), note && state.features.notes ? h("div", { class: "note", onclick: () => noteDialog(meal ? meal.id : 0, meal ? meal.name : "Tag") }, note) : null);
  };

  if (times) {
    const sorted = [...d.entries].sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99") || a.id - b.id);
    root.append(section("Einträge", sorted, null));
  } else {
    const showAll = state.showHidden === state.day;
    const hidden = d.meals.filter(m => m.hidden);
    for (const meal of d.meals) {
      if (!meal.hidden || showAll) root.append(section(meal.name, d.entries.filter(e => e.meal_id === meal.id), meal));
    }
    if (hidden.length) root.append(h("div", { class: "hint" }, h("button", { class: "flat", onclick: () => {
      state.showHidden = showAll ? null : state.day; renderDiary();
    } }, showAll ? "Ausgeblendete Mahlzeiten wieder verbergen" : [h("span", { class: "num" }, hidden.length), `leere/ausgeblendete Mahlzeit${hidden.length > 1 ? "en" : ""} anzeigen`])));
  }

  const t = d.totals, g = d.goal;
  const rem = (goal, total) => {
    if (!goal) return h("td", { class: "muted" }, "–");
    const r = goal - total;
    if (state.goalMode === "gain") return h("td", { class: r <= 0 ? "under" : "" }, n0(r));
    if (state.goalMode === "maintain") return h("td", { class: Math.abs(r) > goal * 0.1 ? "over" : "under" }, n0(r));
    return h("td", { class: r < 0 ? "over" : "under" }, n0(r));
  };
  const goalCell = v => h("td", {}, v ? n0(v) : "–");
  root.append(h("div", { class: "card" },
    h("div", { class: "bar", style: "margin-bottom:12px" },
      h("i", { class: goalOver(t.kcal, g.kcal) ? "over" : "", style: `width:${Math.min(100, t.kcal / (g.kcal || 1) * 100)}%` })),
    h("table", { class: "summary" },
      h("thead", {}, h("tr", {}, h("th"),
        h("th", {}, "Kalorien"), h("th", {}, "Kohlenhydrate"), h("th", {}, "Fette"), h("th", {}, "Eiweiß"), h("th"))),
      h("tbody", {},
        h("tr", {}, h("th", {}, (d.profile ? `Tagesziel (${d.profile})` : "Dein Tagesziel") + (g.activity_bonus ? ` (+${n0(g.activity_bonus)} kcal Aktivität)` : "")), goalCell(g.kcal), goalCell(g.carbs), goalCell(g.fat), goalCell(g.protein), h("td")),
        h("tr", {}, h("th", {}, "Gesamt"), h("td", {}, n0(t.kcal)), h("td", {}, n0(t.carbs)), h("td", {}, n0(t.fat)), h("td", {}, n0(t.protein)), h("td")),
        h("tr", {}, h("th", {}, "Verbleibend"), rem(g.kcal, t.kcal), rem(g.carbs, t.carbs), rem(g.fat, t.fat), rem(g.protein, t.protein), h("td"))))));

  if (act) root.append(activityCard(act));
  if (state.features.micros) root.append(h("div", { class: "card micros" }, h("h2", {}, "Weitere Nährwerte"),
    h("div", { class: "stat-tiles" }, MICROS.map(([k, label, u]) => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", {}, `${n1(t[k] || 0)} ${u}`))))));
  root.append(h("div", { class: "hint" },
    !state.features.notes ? null : d.notes[0] ? h("div", { class: "note", onclick: () => noteDialog(0, "Tag") }, d.notes[0])
      : h("button", { class: "flat", onclick: () => noteDialog(0, "Tag") }, "Notiz zum Tag"),
    state.features.suggest ? h("button", { class: "flat", onclick: () => suggestDialog() }, "Mahlzeit vorschlagen") : null,
    state.features.suggest && train && train.show ? h("button", { class: "flat", onclick: () => suggestDialog({ training: true }) }, "Trainingstag") : null,
    d.entries.length ? h("button", { class: "flat", onclick: () => dayCopyDialog() }, "Ganzen Tag kopieren") : null));
  if (state.features.trackers && trackers.length) root.append(trackerCard(trackers));
}

// ---------------------------------------------------------------- meal suggestions (optional)
// Macro line in the usual order; null = no goal for that macro; signed = show + for positive values (deviations).
const sugText = (t, signed) => {
  const f = (v, big) => (v == null ? "–" : (signed && v > 0 ? "+" : "") + (big ? n0(v) : n1(v)));
  return `${f(t.kcal, true)} kcal · KH ${f(t.carbs)} g · Fett ${f(t.fat)} g · Eiweiß ${f(t.protein)} g`;
};
const SUG_MACROS = ["kcal", "protein", "carbs", "fat"];

function suggestDialog(opts = {}) {
  const data = state.data, times = data.mode === "times";
  const meals = data.meals.filter(m => !m.hidden).length ? data.meals.filter(m => !m.hidden) : data.meals;
  let mealId = opts.meal ?? (meals.find(m => !data.entries.some(e => e.meal_id === m.id)) || meals[0] || {}).id;
  let scope = opts.scope || null, shown = 3, seq = 0;
  const body = h("div");
  const mealSel = times ? null : h("select", { onchange: () => { mealId = Number(mealSel.value); shown = 3; load(); } },
    meals.map(m => h("option", { value: m.id, selected: m.id === mealId }, m.name)));
  const scopeSel = h("select", { onchange: () => { scope = scopeSel.value; shown = 3; send("PUT", "suggest/config", { scope }).catch(() => {}); load(); } },
    h("option", { value: "day" }, "Rest des Tages"), h("option", { value: "next" }, "Anteil für diese Mahlzeit"));

  async function load() {
    const my = ++seq;
    body.replaceChildren(h("div", { class: "muted" }, "Lade …"));
    let r;
    try { r = await api(opts.training ? `suggest/training?day=${state.day}` : `suggest?day=${state.day}` + (mealId ? "&meal_id=" + mealId : "") + (scope ? "&scope=" + scope : "")); }
    catch (e) { if (my === seq) body.replaceChildren(h("div", { class: "err" }, e.message)); return; }
    if (my !== seq) return;
    if (opts.training) { drawTraining(r); return; }
    scope = r.scope; scopeSel.value = scope;
    draw(r);
  }

  // Training day: first the shake with fitted amounts, then dinners for what is left of the day.
  function drawTraining(r) {
    if (!r.configured) {
      body.replaceChildren(h("div", { class: "muted" }, "Wähle unter „Prioritäten und Beigaben“ den Shake und sein Ziel, dann kann ich die Mengen ausrechnen."));
      return;
    }
    const parts = [];
    if (r.eaten) parts.push(h("div", { class: "muted" }, "Der Shake ist für heute schon eingetragen."));
    else if (r.shake) {
      parts.push(h("h3", {}, "Shake"), h("div", { class: "muted" }, `Ziel für den Shake: ${sugText(r.shake.target)}`),
        sugCard(r.shake, { target: r.shake.target, remaining: r.remaining, scope: "next" }, { meal: r.shake_meal_id, keepOpen: true }));
    } else parts.push(h("div", { class: "muted" }, "Für den Shake lässt sich kein Vorschlag berechnen: Wähle in den Einstellungen mindestens ein Ziel."));
    parts.push(h("h3", {}, "Abendessen"));
    if (r.reached) parts.push(h("div", { class: "muted" }, "Dein Tagesziel ist damit erreicht – es bleibt nichts für ein Abendessen übrig."));
    else if (!r.items.length) parts.push(h("div", { class: "muted" }, "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“."));
    else {
      parts.push(h("div", { class: "muted" }, (r.eaten || !r.shake ? `Noch offen: ${sugText(r.after)}` : `Offen nach dem Shake: ${sugText(r.after)}`)),
        ...r.items.slice(0, shown).map(p => sugCard(p, { target: r.after, remaining: r.after, scope: "day" }, { meal: r.dinner_meal_id })));
      if (r.items.length > shown) parts.push(h("button", { class: "flat", onclick: () => { shown += 3; drawTraining(r); } }, "Weitere Vorschläge"));
    }
    body.replaceChildren(...parts);
  }

  function draw(r) {
    const head = h("div", { class: "muted" }, `Ziel für diese Mahlzeit: ${sugText(r.target)}`);
    if (r.reached) { body.replaceChildren(h("div", { class: "muted" }, "Dein Tagesziel ist schon erreicht – es gibt nichts aufzufüllen.")); return; }
    if (!r.items.length) {
      body.replaceChildren(head, h("div", { class: "muted", style: "margin-top:12px" },
        "Noch keine Vorschläge: Speichere Mahlzeiten im Tagebuch über „Speichern / Kopieren“ oder iss Kombinationen mindestens zweimal, dann tauchen sie hier auf."));
      return;
    }
    const more = r.items.length > shown ? h("button", { class: "flat", onclick: () => { shown += 3; draw(r); } }, "Weitere Vorschläge") : null;
    body.replaceChildren(...[head, ...r.items.slice(0, shown).map(p => sugCard(p, r)), more].filter(Boolean));
  }

  // One suggestion: items, macros, deviation; "Anpassen" turns the amounts into fields.
  function sugCard(p0, r, o = {}) {
    const p = JSON.parse(JSON.stringify(p0));
    let editing = false;
    const box = h("div", { class: "card sug" });
    const total = k => p.items.reduce((a, i) => a + (i[k] || 0), 0);
    const drawCard = () => {
      const t = Object.fromEntries(SUG_MACROS.map(k => [k, total(k)]));
      const diff = Object.fromEntries(SUG_MACROS.map(k => [k, r.target[k] == null ? null : t[k] - r.target[k]]));
      const left = Object.fromEntries(SUG_MACROS.map(k => [k, r.remaining[k] == null ? null : r.remaining[k] - t[k]]));
      const rows = p.items.map(i => {
        if (!editing || !(i.grams > 0)) return h("div", { class: "sug-item" }, entryLabel(i), i.kind === "addon" ? tag("Beigabe") : null);
        const g = h("input", { type: "number", step: "any", min: gMin(), value: gShow(i.grams), onchange: () => {
          const ng = gRead(g.value);
          if (!(ng > 0)) { g.value = gShow(i.grams); return; }
          const k = ng / i.grams;
          for (const key of [...SUG_MACROS, "fiber", "sugar", "salt", "sat_fat"]) i[key] = (i[key] || 0) * k;
          i.grams = ng; drawCard();
        } });
        return h("div", { class: "sug-item" }, h("span", { class: "grow" }, i.name, i.kind === "addon" ? tag("Beigabe") : null), g, mUnit());
      });
      const keep = p.source === "history" ? h("button", { class: "flat", onclick: async e => {
        e.target.disabled = true;
        try {
          await send("POST", "suggest/keep", { name: p.name, items: p.items.filter(i => i.kind !== "addon").map(i => ({ ...i, mode: "scale", tol: 15 })) });
          e.target.textContent = "Gespeichert";
        } catch (err) { e.target.disabled = false; alert(err.message); }
      } }, "Als Mahlzeit speichern") : null;
      box.replaceChildren(...[
        h("div", { class: "sug-title" }, p.name, p.source === "history" ? tag(`aus dem Verlauf (${p.count}×)`) : null),
        h("div", { class: "sug-items" }, rows),
        h("div", { class: "muted" }, sugText(t)),
        h("div", { class: "muted" }, `Abweichung vom Ziel: ${sugText(diff, true)}`),
        r.scope === "next" ? h("div", { class: "muted" }, `Danach am Tag noch offen: ${sugText(left)}`) : null,
        h("div", { class: "actions", style: "justify-content:flex-start" },
          h("button", { onclick: async e => {
            e.target.disabled = true;
            const now = new Date();
            const time = times && state.day === iso(now) ? now.toTimeString().slice(0, 5) : null;
            try {
              await send("POST", "suggest/add", { day: state.day, meal_id: times ? null : (o.meal || mealId), time, saved_meal_id: p.saved_meal_id,
                items: p.items.map(i => ({ name: i.name, grams: i.grams, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat,
                  fiber: i.fiber || 0, sugar: i.sugar || 0, salt: i.salt || 0, sat_fat: i.sat_fat || 0 })) });
              if (o.keepOpen) { await renderDiary(); load(); } else { dlg.close(); renderDiary(); }
            } catch (err) { e.target.disabled = false; alert(err.message); }
          } }, "Eintragen"),
          h("button", { class: "flat", onclick: () => { editing = !editing; drawCard(); } }, editing ? "Fertig" : "Anpassen"),
          keep,
          h("button", { class: "flat", onclick: async e => {
            e.target.disabled = true;
            try { await send("POST", "suggest/exclude", { key: p.key, name: p.name, on: true }); load(); }
            catch (err) { e.target.disabled = false; alert(err.message); }
          } }, "Ausschließen"))].filter(Boolean));
    };
    drawCard();
    return box;
  }

  setDlg(h("h2", {}, opts.training ? "Trainingstag" : "Mahlzeit vorschlagen"),
    opts.training ? null : h("div", { class: "sug-controls" }, mealSel, scopeSel),
    h("button", { class: "sug-settings", onclick: () => suggestSettings(() => suggestDialog(opts.training ? opts : { meal: mealId, scope })) }, "Prioritäten und Beigaben"),
    body,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  if (!dlg.open) dlg.showModal();
  if (scope) scopeSel.value = scope;
  load();
}

// Priorities per macro, hard limits and the add-on foods (nuts ...) the suggestions may put next to a meal.
async function suggestSettings(back) {
  const cfg = await api("suggest/config");
  const savedMeals = (await api("saved-meals")).filter(m => m.mine !== false);
  const tr = JSON.parse(JSON.stringify(cfg.training));
  const dayMeals = state.data.mode === "times" ? [] : state.data.meals;
  const prio = { ...cfg.prio }, addons = cfg.addons.map(a => ({ ...a })), excluded = cfg.excluded.map(e => ({ ...e }));
  let cap = cfg.kcal_cap, pmin = cfg.protein_min;
  const levels = ["egal", "normal", "wichtig", "sehr wichtig"];
  const msg = h("div", { class: "err" });
  const show = () => {
    const field = (a, key, title) => h("input", { type: "number", step: "any", min: "0", style: "width:64px;flex:none", title,
      value: gShow(a[key]), onchange: e => { a[key] = gRead(e.target.value) || 0; } });
    const addonRows = addons.map((a, i) => h("div", {}, h("div", { class: "grow" }, a.name),
      field(a, "min_g", "Mindestmenge"), "–", field(a, "max_g", "Höchstmenge"), mUnit(), field(a, "step_g", "Schrittweite"),
      h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", onclick: () => { addons.splice(i, 1); show(); } }, "✕")));
    setDlg(h("h2", {}, "Vorschläge einstellen"),
      h("label", {}, "Wichtigkeit"),
      h("div", { class: "list" }, SUG_KEYS.map(([k, label]) => h("div", {}, h("div", { class: "grow" }, label),
        h("select", { style: "width:auto;flex:none", onchange: e => { prio[k] = Number(e.target.value); } }, levels.map((l, i) => h("option", { value: i, selected: prio[k] === i }, l)))))),
      h("div", { class: "muted" }, "Je wichtiger ein Wert, desto genauer soll der Vorschlag ihn treffen. Werte ohne Ziel bleiben außen vor."),
      h("label", { class: "pick" }, h("input", { type: "checkbox", checked: cap, onchange: e => { cap = e.target.checked; } }), h("span", {}, "Kalorienziel nie überschreiten")),
      h("label", { class: "pick" }, h("input", { type: "checkbox", checked: pmin, onchange: e => { pmin = e.target.checked; } }), h("span", {}, "Eiweißziel möglichst erreichen")),
      h("label", { style: "margin-top:12px" }, "Beigaben"),
      h("div", { class: "muted" }, "Lebensmittel, die zu jeder Mahlzeit passen (z. B. Nüsse). Ein Vorschlag nimmt sie nur dazu, wenn sie besser zum offenen Rest passen. Felder: Mindestmenge, Höchstmenge, Schrittweite."),
      h("div", { class: "list" }, addonRows),
      h("button", { class: "flat", onclick: () => setDlg(foodSwapDialog({
        title: "Beigabe hinzufügen", grams: 30, confirm: "Hinzufügen", onCancel: show,
        onDone: (f, g) => { addons.push({ food_id: f.id, name: f.name, min_g: 0, max_g: g, step_g: 5 }); show(); } })) }, "+ Beigabe"),
      h("label", { style: "margin-top:12px" }, "Trainingstag"),
      h("div", { class: "muted" }, "Dein Shake nach dem Training: Die App rechnet die Mengen so aus, dass er das Ziel trifft, und schlägt danach Abendessen für den Rest des Tages vor. Der Shake muss als Mahlzeit gespeichert sein."),
      h("select", { onchange: e => { tr.saved_meal_id = Number(e.target.value) || null; } },
        h("option", { value: "" }, "– kein Shake –"), savedMeals.map(m => h("option", { value: m.id, selected: m.id === tr.saved_meal_id }, m.name))),
      h("div", { class: "muted" }, "Was der Shake liefern soll (leer = egal)"),
      h("div", { class: "list" }, SUG_KEYS.map(([k, label]) => h("div", {}, h("div", { class: "grow" }, label),
        h("input", { type: "number", step: "any", min: "0", style: "width:80px;flex:none", placeholder: "egal", value: tr.target[k] || "",
          onchange: e => { tr.target[k] = Number(e.target.value) || null; } }), h("span", { class: "muted" }, k === "kcal" ? "kcal" : "g")))),
      dayMeals.length ? [h("label", {}, "Shake eintragen in"),
        h("select", { onchange: e => { tr.shake_meal_id = Number(e.target.value) || null; } },
          h("option", { value: "" }, "erste Mahlzeit"), dayMeals.map(m => h("option", { value: m.id, selected: m.id === tr.shake_meal_id }, m.name))),
        h("label", {}, "Abendessen eintragen in"),
        h("select", { onchange: e => { tr.dinner_meal_id = Number(e.target.value) || null; } },
          h("option", { value: "" }, "erste freie Mahlzeit"), dayMeals.map(m => h("option", { value: m.id, selected: m.id === tr.dinner_meal_id }, m.name)))] : null,
      h("label", { class: "pick" }, h("input", { type: "checkbox", checked: tr.auto, onchange: e => { tr.auto = e.target.checked; } }),
        h("span", {}, "Trigger tragen den Shake mit den berechneten Mengen ein")),
      h("label", { class: "pick" }, h("input", { type: "checkbox", checked: tr.dinner_protein, onchange: e => { tr.dinner_protein = e.target.checked; } }),
        h("span", {}, "Abendessen sollen das Eiweißziel möglichst erreichen")),
      state.features.activity ? [h("label", {}, "Auch erkennen, wenn so viele Kalorien verbrannt wurden (kcal, 0 = aus)"),
        h("input", { type: "number", step: "10", min: "0", placeholder: "0", value: tr.activity_kcal || "", onchange: e => { tr.activity_kcal = Number(e.target.value) || 0; } })] : null,
      h("label", { class: "pick" }, h("input", { type: "checkbox", checked: tr.always, onchange: e => { tr.always = e.target.checked; } }),
        h("span", {}, "Knopf „Trainingstag“ an jedem Tag zeigen (sonst nur, wenn der Shake eingetragen oder per Trigger gebucht wurde)")),
      excluded.length ? [h("label", { style: "margin-top:12px" }, "Ausgeschlossen"),
        h("div", { class: "muted" }, "Diese Mahlzeiten tauchen in den Vorschlägen nicht mehr auf. Mit „Zulassen“ kommen sie zurück."),
        h("div", { class: "list" }, excluded.map((e, i) => h("div", {}, h("div", { class: "grow" }, e.name || e.key),
          h("button", { class: "flat", onclick: async () => {
            try { await send("POST", "suggest/exclude", { key: e.key, on: false }); excluded.splice(i, 1); show(); }
            catch (err) { msg.textContent = err.message; }
          } }, "Zulassen"))))] : null,
      msg,
      h("div", { class: "actions" }, h("button", { class: "flat", onclick: back }, "Abbrechen"),
        h("button", { onclick: async () => {
          try {
            await send("PUT", "suggest/config", { prio, kcal_cap: cap, protein_min: pmin });
            await send("PUT", "suggest/training", tr);
            await send("PUT", "suggest/addons", { addons: addons.map(a => ({ food_id: a.food_id, min_g: a.min_g, max_g: a.max_g, step_g: a.step_g })) });
            back();
          } catch (e) { msg.textContent = e.message; }
        } }, "Speichern")));
  };
  show();
}

const SUG_KEYS = [["kcal", "Kalorien"], ["protein", "Eiweiß"], ["carbs", "Kohlenhydrate"], ["fat", "Fette"]];

// Per-ingredient settings in the meal editor: follows the meal factor (with an allowed deviation in %) or stays fixed (optional package size).
function sugOpts(it, redraw) {
  const fixed = it.mode === "fixed";
  const mode = h("select", { title: "Skalierbar: folgt dem Mengenfaktor der Mahlzeit. Fest: bleibt gleich.", onchange: () => { it.mode = mode.value; redraw(); } },
    h("option", { value: "scale", selected: !fixed }, "Skalierbar"), h("option", { value: "fixed", selected: fixed }, "Fest"));
  const tol = h("input", { type: "number", step: "1", min: "0", max: "100", value: it.tol || "", placeholder: "0",
    title: "Wie weit diese Zutat vom Verhältnis zu den anderen abweichen darf (in Prozent)", onchange: () => { it.tol = num(tol.value) || 0; } });
  const pack = h("input", { type: "number", step: "any", min: "0", value: it.pack_g ? gShow(it.pack_g) : "", placeholder: "–",
    title: "Packungsgröße: der Vorschlag nimmt so viele Packungen, wie bei „Anzahl“ eingestellt ist. Leer = genau die gespeicherte Menge.", onchange: () => { it.pack_g = gRead(pack.value) || 0; } });
  const range = h("span", { class: "sug-range-packs", title: "Wie viele Packungen ein Vorschlag nehmen darf" },
    h("input", { type: "number", step: "1", min: "0", max: "6", value: it.pack_min ?? 1, onchange: e => { it.pack_min = Math.max(0, Math.round(num(e.target.value) || 0)); if (it.pack_min > (it.pack_max ?? 2)) it.pack_max = it.pack_min; redraw(); } }),
    "–", h("input", { type: "number", step: "1", min: "1", max: "6", value: it.pack_max ?? 2, onchange: e => { it.pack_max = Math.max(1, Math.round(num(e.target.value) || 1)); if ((it.pack_min ?? 1) > it.pack_max) it.pack_min = it.pack_max; redraw(); } }));
  return h("div", { class: "sug-opts" }, mode, fixed ? ["Packung", pack, mUnit(), ...(it.pack_g > 0 ? ["Anzahl", range] : [])] : ["Abweichung ±", tol, "%"]);
}

// Steps and burned calories of the day (optional feature): a share of them raises the day's calorie goal.
function activityCard(a) {
  const hasSensor = !!(a.config.steps_entity || a.config.kcal_entity);
  const tile = (label, value, hint) => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", {}, value), hint ? h("span", { class: "muted" }, hint) : null);
  return h("div", { class: "card" }, h("h2", {}, "Aktivität"),
    h("div", { class: "stat-tiles" },
      tile("Schritte", n0(a.steps)),
      tile("Verbrannt", `${n0(a.kcal)} kcal`, a.estimated ? "aus Schritten geschätzt" : ""),
      tile("Zum Tagesziel", `+${n0(a.bonus)} kcal`, `${n0(a.config.share)} % der verbrannten Kalorien`)),
    h("div", { class: "actions", style: "justify-content:flex-start" },
      h("button", { class: "flat", onclick: () => activityDialog(a) }, "Eintragen"),
      hasSensor && state.day === iso(new Date()) ? h("button", { class: "flat", onclick: async () => {
        try { await send("POST", "activity/sync", {}); } catch (e) { alert(e.message); }
        renderDiary();
      } }, "Aus Home Assistant lesen") : null,
      hasSensor ? h("button", { class: "flat", title: "Holt Schritte und Kalorien der letzten 30 Tage aus dem Home-Assistant-Verlauf", onclick: async () => {
        try { const r = await send("POST", "activity/backfill?days=30", {}); alert(`Verlauf nachgeladen: ${r.days} Tage.`); } catch (e) { alert(e.message); }
        renderDiary();
      } }, "Verlauf nachladen") : null,
      a.manual ? h("button", { class: "flat", onclick: async () => { await api("activity/" + state.day, { method: "DELETE" }); renderDiary(); } }, "Handeingabe verwerfen") : null));
}

function activityDialog(a) {
  const steps = h("input", { type: "number", step: "1", min: "0", value: a.steps || "" });
  const kcal = h("input", { type: "number", step: "1", min: "0", value: a.estimated ? "" : a.kcal || "", placeholder: "leer = aus Schritten schätzen" });
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "Aktivität eintragen"),
    h("div", { class: "muted" }, "Von Hand eingetragene Werte werden für diesen Tag nicht mehr von den Sensoren überschrieben."),
    h("label", {}, "Schritte"), steps, h("label", {}, "Verbrannte Kalorien (kcal)"), kcal, msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        try { await send("PUT", "activity/" + state.day, { steps: num(steps.value) || 0, kcal: num(kcal.value) || 0 }); dlg.close(); renderDiary(); }
        catch (e) { msg.textContent = e.message; }
      } }, "Speichern")));
  dlg.showModal();
}

// Free-text note for a meal or (meal_id 0) the whole day: hunger, training, mood ...
function noteDialog(mealId, title) {
  const text = h("textarea", { rows: 4, maxlength: 2000, placeholder: "z. B. Hunger, Training, Stimmung …", style: "width:100%" });
  text.value = state.data.notes[mealId] || "";
  setDlg(h("h2", {}, `Notiz: ${title}`), text,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        await send("PUT", "notes/" + state.day, { meal_id: mealId, text: text.value });
        dlg.close(); renderDiary();
      } }, "Speichern")));
  dlg.showModal();
  text.focus();
}

// Copy every entry of the shown day to another day (meals and times are kept).
function dayCopyDialog() {
  const next = new Date(parse(state.day)); next.setDate(next.getDate() + 1);
  const to = h("input", { type: "date", value: iso(next) });
  const factor = h("input", { type: "number", step: "any", min: "0.1", value: "1", style: "width:80px;flex:none" });
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "Ganzen Tag kopieren"),
    h("div", { class: "muted" }, `${state.data.entries.length} Einträge, ${n0(state.data.totals.kcal)} kcal`),
    h("label", {}, "Auf den Tag"), to,
    h("label", {}, "Mengenfaktor (1 = unverändert)"), factor, msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!to.value) { msg.textContent = "Bitte einen Tag wählen."; return; }
        try {
          await send("POST", `day/${state.day}/copy`, { to_day: to.value, factor: num(factor.value) || 1 });
          dlg.close(); state.day = to.value; renderDiary();
        } catch (e) { msg.textContent = e.message; }
      } }, "Kopieren")));
  dlg.showModal();
}

// Water & supplements (optional feature): +/- buttons with a daily goal.
function trackerCard(list) {
  const card = h("div", { class: "card" }, h("h2", {}, "Wasser & Ergänzungen"));
  const fmt = v => (Math.round(v * 10) / 10).toLocaleString(I18N.locale);
  const draw = () => card.replaceChildren(card.firstChild, ...list.map(t => {
    const set = async amount => {
      t.amount = Math.max(0, Math.round(amount * 100) / 100);
      draw();
      await send("PUT", `trackers/${t.id}/log/${state.day}`, { amount: t.amount });
    };
    return h("div", { class: "tracker" },
      h("div", { class: "tracker-head" }, h("span", {}, t.name),
        h("span", { class: t.goal && t.amount > t.goal ? "muted over" : "muted" },
          `${fmt(t.amount)}${t.goal ? " / " + fmt(t.goal) : ""} ${t.unit}`)),
      t.goal ? h("div", { class: "bar" }, h("i", { class: t.amount > t.goal ? "over" : "", style: `width:${Math.min(100, t.amount / t.goal * 100)}%` })) : null,
      h("div", { class: "tracker-btns" },
        h("button", { class: "flat", disabled: t.amount <= 0, onclick: () => set(t.amount - t.step) }, `− ${fmt(t.step)}`),
        h("button", { onclick: () => set(t.amount + t.step) }, `+ ${fmt(t.step)} ${t.unit}`)));
  }));
  draw();
  return card;
}

function shiftDay(n) {
  const d = parse(state.day);
  d.setDate(d.getDate() + n);
  state.day = iso(d);
  renderDiary();
}

// The first 200 foods are loaded up front; a longer library is searched on the server once two letters are typed.
function remoteFoods(input, onHits) {
  let timer = null;
  return () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) return onHits(null);
    timer = setTimeout(async () => {
      try { const r = await api("foods?limit=50&q=" + encodeURIComponent(q)); if (input.value.trim() === q) onHits(r); }
      catch { /* the local list stays */ }
    }, 250);
  };
}

// Pick a food and an amount (used to swap a component of an entry or a saved meal).
function foodSwapDialog({ title, grams, confirm, onDone, onCancel }) {
  const search = h("input", { type: "search", placeholder: "Lebensmittel suchen…", oninput: () => { draw(); more(); } });
  const results = h("div", { class: "results" });
  const detail = h("div");
  const body = h("div", {}, search, results,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: onCancel }, "Zurück")));
  let foods = [], remote = null;
  const more = remoteFoods(search, r => { remote = r; draw(); });
  function draw() {
    const q = search.value.toLowerCase();
    const base = remote && search.value.trim().length >= 2 ? remote : foods.filter(f => ((f.name || "") + " " + (f.brand || "")).toLowerCase().includes(q));
    results.replaceChildren(...base.filter(isVisible).slice(0, 50)
      .map(f => h("button", { class: "food", onclick: () => choose(f) },
        h("span", {}, f.name, f.brand ? ` (${f.brand})` : ""), h("span", { class: "muted" }, `${n0(f.kcal)} kcal/100 g`))));
  }
  function choose(f) {
    const g = h("input", { type: "number", step: "any", min: gMin(), value: gShow(grams || f.serving_g || 100), oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = (gRead(g.value) || 0) / 100;
      pv.replaceChildren(h("span", {}, h("b", {}, n0(f.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(f.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(f.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(f.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, f.name), portionPicker(f, g) || "", h("label", {}, amtLabel()), g, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: () => { detail.replaceChildren(); body.hidden = false; } }, "Zurück"),
        h("button", { onclick: () => { if (gRead(g.value) > 0) onDone(f, gRead(g.value)); } }, confirm)));
    body.hidden = true;
    g.select();
  }
  Promise.all([api("foods"), loadCats()]).then(([x]) => { foods = x; draw(); });
  setTimeout(() => search.focus());
  return [h("h2", {}, title), body, detail];
}

const MICROS = [["fiber", "Ballaststoffe", "g"], ["sugar", "Zucker", "g"], ["salt", "Salz", "g"], ["sat_fat", "ges. Fettsäuren", "g"]];

const foodItem = (f, grams) => {
  const k = grams / 100;
  return { name: f.name, grams, kcal: f.kcal * k, protein: f.protein * k, carbs: f.carbs * k, fat: f.fat * k,
    fiber: (f.fiber || 0) * k, sugar: (f.sugar || 0) * k, salt: (f.salt || 0) * k, sat_fat: (f.sat_fat || 0) * k };
};

// "1 Scheibe = 30 g": choose a named portion and a count, the amount field follows. Null without portions.
function portionPicker(f, gramsInput) {
  if (!f.portions || !f.portions.length) return null;
  const pick = h("select", {}, h("option", { value: "" }, "Portion wählen …"),
    f.portions.map((p, i) => h("option", { value: i }, `${p.name} (${gText(p.grams)})`)));
  const count = h("input", { type: "number", step: "any", min: "0.1", value: "1", style: "width:70px;flex:none" });
  const apply = () => {
    if (pick.value === "") return;
    gramsInput.value = gShow(f.portions[Number(pick.value)].grams * (num(count.value) || 1));
    gramsInput.dispatchEvent(new Event("input"));
  };
  pick.onchange = apply;
  count.oninput = apply;
  return h("div", { class: "portion-pick" }, h("label", {}, "Portion"), h("div", { style: "display:flex;gap:8px" }, count, "×", pick));
}

function editEntry(e, times) {
  const quick = !(e.grams > 0);
  const grams = h("input", { type: "number", step: "any", min: gMin(), value: e.grams ? gShow(e.grams) : "" });
  const time = h("input", { type: "time", value: e.time || "" });
  const q = {};
  const qfield = (key, label) => {
    q[key] = h("input", { type: key === "name" ? "text" : "number", step: "any", min: "0", value: e[key] ? (key === "name" ? e[key] : Math.round(e[key] * 10) / 10) : (key === "name" ? "" : 0) });
    return h("div", {}, h("label", {}, label), q[key]);
  };
  const msg = h("div", { class: "err" });
  setDlg(
    h("h2", {}, e.name),
    quick ? [qfield("name", "Bezeichnung"),
      h("div", { class: "grid", style: "margin-top:12px" }, qfield("kcal", "kcal"), qfield("carbs", "KH (g)"), qfield("fat", "Fett (g)"), qfield("protein", "Eiweiß (g)"))]
      : [h("label", {}, amtLabel()), grams],
    times ? [h("label", {}, "Uhrzeit"), time] : null,
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => swapEntry(e, times, quick ? null : gRead(grams.value)) }, "Lebensmittel tauschen"),
      state.features.household ? h("button", { class: "flat", onclick: () => shareDialog(e) }, "Teilen …") : null,
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        const body = {};
        if (quick) {
          if (!q.name.value.trim() || num(q.kcal.value) == null) { msg.textContent = "Bezeichnung und kcal sind Pflicht."; return; }
          Object.assign(body, { name: q.name.value, kcal: num(q.kcal.value), carbs: num(q.carbs.value) || 0,
            fat: num(q.fat.value) || 0, protein: num(q.protein.value) || 0 });
        } else {
          if (!(gRead(grams.value) > 0)) return;
          body.grams = gRead(grams.value);
        }
        if (times) body.time = time.value || null;
        await send("PUT", "entries/" + e.id, body);
        dlg.close(); renderDiary();
      } }, "Speichern")));
  dlg.showModal();
}

// Replace the food of a diary entry (e.g. rice -> pasta) while keeping its amount by default.
function swapEntry(e, times, grams) {
  setDlg(foodSwapDialog({
    title: `„${e.name}“ tauschen`, grams: grams || e.grams || null, confirm: "Tauschen",
    onCancel: () => editEntry(e, times),
    onDone: async (f, g) => {
      await send("PUT", "entries/" + e.id, { food_id: f.id, grams: g });
      dlg.close(); renderDiary();
    },
  }));
  dlg.showModal();
}

// Entry without a food: only a name and calories/macros.
function quickDialog(meal) {
  const times = state.data.mode === "times";
  const f = {};
  const field = (key, label, attrs = {}) => {
    f[key] = h("input", { type: key === "name" ? "text" : "number", step: "any", min: "0", oninput: check, ...attrs });
    return h("div", {}, h("label", {}, label), f[key]);
  };
  const time = h("input", { type: "time", value: timeNow() });
  const warn = h("div", { class: "warn" });
  const msg = h("div", { class: "err" });
  function check() {
    const v = { kcal: num(f.kcal.value) || 0, carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0, protein: num(f.protein.value) || 0 };
    warn.textContent = (v.kcal || v.carbs || v.fat || v.protein) ? plausibilityTotal(v) || "" : "";
  }
  setDlg(h("h2", {}, meal ? `Schnelleingabe in „${meal.name}“` : "Schnelleingabe"),
    h("div", { class: "muted" }, "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“)."),
    h("div", { style: "margin-top:12px" }, field("name", "Bezeichnung", { placeholder: "z. B. Restaurant" })),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("kcal", "kcal"), field("carbs", "KH (g)"), field("fat", "Fett (g)"), field("protein", "Eiweiß (g)")),
    times ? [h("label", {}, "Uhrzeit"), time] : null, warn, msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!f.name.value.trim() || num(f.kcal.value) == null) { msg.textContent = "Bezeichnung und kcal sind Pflicht."; return; }
        try {
          await send("POST", "entries/quick", { day: state.day, meal_id: meal ? meal.id : null, time: times ? time.value || null : null,
            name: f.name.value, kcal: num(f.kcal.value), carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0, protein: num(f.protein.value) || 0 });
          dlg.close(); renderDiary();
        } catch (er) { msg.textContent = er.message; }
      } }, "Hinzufügen")));
  dlg.showModal();
  setTimeout(() => f.name.focus());
}

// Same check for absolute amounts (not per 100 g): only the kcal/macro relation, no 100 g limit.
const plausibilityTotal = v => plausibility(v, true);

// Copy entries of a diary meal to another meal and/or day.
const modeTabs = (active, meal, items, times) => h("div", { class: "range" },
  h("button", { class: active === "copy" ? "active" : "", onclick: () => copyDialog(meal, items, times) }, "Kopieren"),
  h("button", { class: active === "save" ? "active" : "", onclick: () => saveMealDialog(meal, items, times) }, "Als Mahlzeit speichern"));

function copyDialog(meal, items, times) {
  const meals = state.data.meals.filter(m => !m.archived || (meal && m.id === meal.id));
  const day = h("input", { type: "date", value: state.day });
  const target = h("select", {}, meals.map(m => h("option", { value: m.id, selected: meal && m.id === meal.id }, m.name)));
  const time = h("input", { type: "time" });
  const picks = items.map(e => [e, h("input", { type: "checkbox", checked: true })]);
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, meal ? `„${meal.name}“` : "Einträge"), modeTabs("copy", meal, items, times),
    h("label", {}, "Am Tag"), day,
    times ? [h("label", {}, "Neue Uhrzeit (leer = Originalzeit)"), time] : [h("label", {}, "In Mahlzeit"), target],
    h("div", { class: "list" }, picks.map(([e, box]) =>
      h("label", { class: "pick" }, box, `${times && e.time ? e.time + " " : ""}${entryLabel(e)} · ${n0(e.kcal)} kcal`))),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        const ids = picks.filter(([, b]) => b.checked).map(([e]) => e.id);
        if (!ids.length || !day.value) { msg.textContent = "Nichts ausgewählt."; return; }
        try {
          await send("POST", "entries/copy", { ids, day: day.value, meal_id: times ? null : Number(target.value),
            time: times ? time.value || null : null });
          dlg.close(); state.day = day.value; renderDiary();
        } catch (e) { msg.textContent = e.message; }
      } }, "Kopieren")));
  dlg.showModal();
}

// Save the entries of a diary meal (or, in time mode, a selection of the day) as a reusable meal.
function saveMealDialog(meal, items, times) {
  const name = h("input", { value: meal ? meal.name : "", placeholder: "Name der Mahlzeit" });
  const category = h("input", { list: "cat-list", placeholder: "z. B. Diät, Bulk (optional)" });
  const picks = times ? items.map(e => [e, h("input", { type: "checkbox", checked: true })]) : [];
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, meal ? `„${meal.name}“` : "Einträge"), modeTabs("save", meal, items, times),
    h("label", {}, "Name"), name, h("label", {}, "Kategorie"), category, catList(),
    times ? h("div", { class: "list" }, picks.map(([e, box]) =>
      h("label", { class: "pick" }, box, `${e.time || ""} ${entryLabel(e)} · ${n0(e.kcal)} kcal`))) : null,
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!name.value.trim()) { msg.textContent = "Bitte einen Namen angeben."; return; }
        const ids = picks.filter(([, b]) => b.checked).map(([e]) => e.id);
        if (times && !ids.length) { msg.textContent = "Nichts ausgewählt."; return; }
        try {
          await send("POST", "saved-meals", { day: state.day, meal_id: meal ? meal.id : null,
            entry_ids: times ? ids : null, name: name.value, category: category.value });
          dlg.close();
        } catch (e) { msg.textContent = e.message; }
      } }, "Speichern")));
  dlg.showModal();
}


// ---------------------------------------------------------------- barcode scanner
// The browser's BarcodeDetector where there is one (Chrome, Android), otherwise the bundled ZXing library (iPhone, Firefox, Safari).
// Two ways in: live camera (needs HTTPS) or a photo.
const SCAN_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];
let zxingLoading = null;
const loadZXing = () => zxingLoading || (zxingLoading = new Promise((resolve, reject) => {
  const el = h("script", { src: "static/vendor/zxing.min.js" });
  el.onload = () => resolve(window.ZXing);
  el.onerror = () => { zxingLoading = null; reject(new Error("Der Barcode-Leser konnte nicht geladen werden. Bitte die Nummer eintippen.")); };
  document.head.append(el);
}));

// An async function that reads a barcode from a <video>, canvas or ImageBitmap: the text, or null when none is visible.
async function barcodeReader() {
  if ("BarcodeDetector" in window) {
    const det = new BarcodeDetector({ formats: SCAN_FORMATS });
    return async src => { const r = await det.detect(src); return r.length ? r[0].rawValue : null; };
  }
  const Z = await loadZXing();
  const reader = new Z.MultiFormatReader();
  const F = Z.BarcodeFormat;
  reader.setHints(new Map([[Z.DecodeHintType.POSSIBLE_FORMATS, [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E]], [Z.DecodeHintType.TRY_HARDER, true]]));
  const cv = document.createElement("canvas"), ctx = cv.getContext("2d", { willReadFrequently: true });
  return async src => {
    const w = src.videoWidth || src.width, ht = src.videoHeight || src.height;
    if (!w || !ht) return null;
    const k = Math.min(1, 1280 / Math.max(w, ht));
    cv.width = Math.round(w * k); cv.height = Math.round(ht * k);
    ctx.drawImage(src, 0, 0, cv.width, cv.height);
    try { return reader.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(cv)))).getText(); }
    catch { return null; }   // nothing readable in this frame
  };
}

// Resolves with the barcode text, rejects with a readable Error. `box` receives the video preview and a cancel button.
async function scanBarcode(box) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("Kein Kamerazugriff (die Seite braucht HTTPS). Nutze „Foto“ oder tippe die Nummer ein.");
  const read = await barcodeReader();
  return new Promise((resolve, reject) => {
    const video = h("video", { class: "scan-video", autoplay: true, playsinline: true, muted: true });
    let stream = null, timer = null, done = false, busy = false;
    const stop = () => { done = true; clearInterval(timer); if (stream) stream.getTracks().forEach(t => t.stop()); box.replaceChildren(); dlg.removeEventListener("close", stop); };
    const cancel = h("button", { class: "flat", onclick: () => { stop(); reject(new Error("Abgebrochen")); } }, "Scan abbrechen");
    dlg.addEventListener("close", stop);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(st => {
      if (done) { st.getTracks().forEach(t => t.stop()); return; }
      stream = st; video.muted = true; video.srcObject = st;   // the muted attribute alone does not allow autoplay in the Companion app's WebView
      box.replaceChildren(video, h("div", { class: "muted" }, "Halte den Barcode ins Bild."), cancel);
      video.play().catch(() => { /* the user can tap the preview to start it */ });
      timer = setInterval(async () => {
        if (done || busy || video.readyState < 2) return;
        busy = true;
        try { const v = await read(video); if (v && !done) { stop(); resolve(v); } } catch { /* keep trying */ } finally { busy = false; }
      }, 300);
    }).catch(e => { stop(); reject(new Error(e.name === "NotAllowedError" ? "Kamerazugriff wurde nicht erlaubt." : "Kamera nicht verfügbar: " + (e.message || e.name))); });
  });
}

// Barcode from a photo (works without HTTPS, e.g. through the phone's camera app).
async function scanPhoto(file) {
  const read = await barcodeReader();
  const v = await read(await createImageBitmap(file));
  if (!v) throw new Error("Auf dem Foto wurde kein Barcode erkannt.");
  return v;
}

// Read (no argument) or set the "start the scanner when the app opens" flag of this device.
function scanOnOpen(on) {
  try {
    if (on === undefined) return localStorage.getItem("mda.scanOnOpen") === "1";
    if (on) localStorage.setItem("mda.scanOnOpen", "1"); else localStorage.removeItem("mda.scanOnOpen");
  } catch { /* storage blocked */ }
  return !!on;
}

// ---------------------------------------------------------------- food form (shared)
// Create (food == null) or edit a food; onSave receives the food id.
function foodForm({ food = null, prefill = {}, onSave, onCancel }) {
  const f = { barcode: h("input", { inputmode: "numeric", placeholder: "Barcode", value: food ? food.barcode || "" : "" }) };
  const field = (key, label, attrs = {}) => {
    f[key] = h("input", { id: "nf-" + key, ...attrs, value: food ? food[key] : attrs.value });
    return h("div", {}, h("label", { for: "nf-" + key }, label), f[key]);
  };
  const msg = h("div", { class: "err" });
  const warn = h("div", { class: "warn" });
  const portions = ((food && food.portions) || []).map(p => ({ ...p }));
  const pbox = h("div", { class: "list" });
  const drawPortions = () => pbox.replaceChildren(...portions.map((p, i) => h("div", {},
    h("input", { value: p.name, placeholder: "z. B. 1 Scheibe", oninput: e => { p.name = e.target.value; } }),
    h("input", { type: "number", step: "any", min: "0", value: p.grams ? gShow(p.grams) : "", placeholder: mUnit(), style: "max-width:90px", oninput: e => { p.grams = gRead(e.target.value) || 0; } }), mUnit(),
    h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", onclick: () => { portions.splice(i, 1); drawPortions(); } }, "✕"))));
  drawPortions();
  const scanBox = h("div", { class: "scan-box" });
  const photoIn = h("input", { type: "file", accept: "image/*", capture: "environment", hidden: true, onchange: async () => {
    msg.textContent = "";
    try { f.barcode.value = await scanPhoto(photoIn.files[0]); await lookup(); } catch (e) { msg.textContent = e.message; }
    photoIn.value = "";
  } });
  async function lookup() {
    msg.textContent = "";
    try {
      const p = await api("off/barcode/" + encodeURIComponent(f.barcode.value.trim()));
      f.name.value = p.name; f.brand.value = p.brand;
      for (const k of ["kcal", "protein", "carbs", "fat"]) f[k].value = Math.round(p[k] * 10) / 10;
      for (const [k] of MICROS) if (f[k]) f[k].value = Math.round((p[k] || 0) * 100) / 100;
      check();
    } catch (e) { msg.textContent = "Produkt nicht gefunden (" + e.message + ")"; }
  }

  // Online search in several databases with a comparison of the sources among each other and with the form (optional feature)
  const SRC = { off: "Open Food Facts", usda: "USDA FoodData Central" };
  function lookupPanel() {
    const q = h("input", { type: "search", placeholder: "Name oder Barcode", onkeydown: e => { if (e.key === "Enter") run(); } });
    const use = Object.fromEntries(Object.keys(SRC).map(k => [k, h("input", { type: "checkbox", checked: true })]));
    const out = h("div", {});
    const own = () => num(f.kcal.value);
    const setField = (k, v) => { if (f[k]) f[k].value = Math.round(v * 100) / 100; };
    const apply = items => {
      const avg = k => items.reduce((a, i) => a + (i[k] || 0), 0) / items.length;
      f.name.value = items[0].name; f.brand.value = items[0].brand || "";
      if (/^\d{6,}$/.test(items[0].code || "") && !f.barcode.value.trim()) f.barcode.value = items[0].code;
      for (const k of ["kcal", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sat_fat"]) setField(k, avg(k));
      check();
    };
    async function run() {
      const text = q.value.trim();
      if (!text) return;
      out.replaceChildren(h("div", { class: "muted" }, "Suche …"));
      const params = new URLSearchParams(/^\d{6,}$/.test(text) ? { barcode: text } : { q: text });
      params.set("sources", Object.keys(SRC).filter(k => use[k].checked).join(","));
      let res;
      try { res = await api("lookup?" + params); } catch (e) { out.replaceChildren(h("div", { class: "err" }, e.message)); return; }
      const rows = res.results.map(r => ({ r, box: h("input", { type: "checkbox" }) }));
      // compare the best match (first hit) of each source with the others
      const kc = Object.keys(SRC).map(k => res.results.find(r => r.source === k)).filter(Boolean).map(r => r.kcal);
      const spread = kc.length > 1 ? (Math.max(...kc) - Math.min(...kc)) / (kc.reduce((a, b) => a + b, 0) / kc.length) * 100 : 0;
      const dev = r => { const o = own(); if (!o || !r.kcal) return h("td", {}); const d = (r.kcal - o) / o * 100;
        return h("td", { class: (Math.abs(d) > 15 ? "over" : "muted") + " lk-dev" }, `${d > 0 ? "+" : ""}${n0(d)} %`); };
      out.replaceChildren(...[
        Object.entries(res.errors || {}).map(([s, m]) => h("div", { class: "muted" }, `${SRC[s] || s}: ${m}`)),
        rows.length ? h("div", { class: "lk-wrap" }, h("table", { class: "lk" },
          h("thead", {}, h("tr", {}, h("th"), h("th", {}, "Quelle"), h("th", {}, "Name"), h("th", {}, "kcal"), h("th", {}, "KH"), h("th", {}, "Fett"),
            h("th", {}, "Eiweiß"), h("th", { title: "Abweichung der kcal von dem Wert im Formular" }, "Abweichung"), h("th"))),
          h("tbody", {}, rows.map(({ r, box }) => h("tr", {}, h("td", {}, box), h("td", { class: "lk-src" }, SRC[r.source] || r.source),
            h("td", { class: "lk-name" }, r.name, r.brand ? h("div", { class: "muted" }, r.brand) : null, h("div", { class: "muted lk-srcline" }, SRC[r.source] || r.source)),
            h("td", { "data-l": "kcal" }, n0(r.kcal)), h("td", { "data-l": "KH" }, n1(r.carbs)), h("td", { "data-l": "Fett" }, n1(r.fat)), h("td", { "data-l": "Eiweiß" }, n1(r.protein)), dev(r),
            h("td", {}, h("button", { class: "flat", onclick: () => apply([r]) }, "Übernehmen"))))))) : h("div", { class: "muted" }, "Nichts gefunden."),
        rows.length ? h("div", { class: "muted" }, "Alle Werte pro 100 g.") : null,
        spread > 15 ? h("div", { class: "warn" }, `Die Quellen weichen bei kcal um bis zu ${n0(spread)} % voneinander ab – bitte prüfen.`) : null,
        rows.length > 1 ? h("div", { class: "actions", style: "justify-content:flex-start" }, h("button", { class: "flat", onclick: () => {
          const sel = rows.filter(x => x.box.checked).map(x => x.r);
          if (sel.length) apply(sel);
        } }, "Mittelwert der gewählten übernehmen")) : null].flat().filter(x => x != null));
    }
    return h("div", { class: "lookup" }, h("label", {}, "Online suchen & vergleichen"),
      h("div", { class: "grid", style: "grid-template-columns:minmax(0,1fr) auto" }, q, h("button", { class: "flat", onclick: run }, "Suchen")),
      h("div", { class: "range" }, Object.entries(SRC).map(([k, l]) => h("label", { class: "pick" }, use[k], l))), out);
  }
  const foreign = !!(food && food.mine === false);
  const sharedBox = h("input", { type: "checkbox", checked: !!(food && food.shared) });
  const shareRow = !state.features.household ? null : foreign
    ? h("div", { class: "muted", style: "margin-top:12px" }, `Gehört ${food.owner_name}. Änderungen gelten für alle im Haushalt.`)
    : h("label", { class: "pick", style: "margin-top:12px" }, sharedBox, "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und ändern)");
  const check = () => {
    const v = { kcal: num(f.kcal.value), carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0, protein: num(f.protein.value) || 0 };
    warn.textContent = v.kcal == null ? "" : plausibility(v) || "";
  };
  const form = h("div", {},
    h("div", { class: "grid" },
      h("div", {}, h("label", {}, "Barcode (Open Food Facts)"), f.barcode),
      h("button", { class: "flat", onclick: lookup }, "Suchen")),
    h("div", { class: "actions", style: "justify-content:flex-start;margin-top:4px" },
      h("button", { class: "flat", onclick: async () => {
        msg.textContent = "";
        try { f.barcode.value = await scanBarcode(scanBox); await lookup(); } catch (e) { if (e.message !== "Abgebrochen") msg.textContent = e.message; }
      } }, "Scannen (Kamera)"),
      h("button", { class: "flat", onclick: () => photoIn.click() }, "Foto vom Barcode"), photoIn),
    scanBox,
    state.features.sources ? lookupPanel() : null,
    h("div", { style: "margin-top:12px" }, field("name", "Name")),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("brand", "Marke"),
      field("category", "Kategorie", { list: "cat-list", placeholder: "z. B. Diät, Bulk" }),
      field("serving_g", ozMode() ? "Portion (oz)" : "Portion (g)", { type: "number", step: "any", value: 100 })),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("kcal", "kcal / 100 g", { type: "number", step: "any" }),
      field("carbs", "KH / 100 g", { type: "number", step: "any" }),
      field("fat", "Fett / 100 g", { type: "number", step: "any" }),
      field("protein", "Eiweiß / 100 g", { type: "number", step: "any" })),
    state.features.micros ? h("div", { class: "grid", style: "margin-top:12px" },
      MICROS.map(([k, label]) => field(k, `${label} / 100 g`, { type: "number", step: "any", value: 0 }))) : null,
    h("div", { style: "margin-top:12px" }, h("label", {}, "Portionsgrößen (optional)"), pbox,
      h("button", { class: "flat", onclick: () => { portions.push({ name: "", grams: 0 }); drawPortions(); } }, "+ Portion")),
    shareRow, warn, msg, catList(),
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: onCancel }, food ? "Abbrechen" : "Zurück"),
      h("button", { onclick: async () => {
        if (!f.name.value.trim() || num(f.kcal.value) == null) { msg.textContent = "Name und kcal sind Pflicht."; return; }
        const body = {
          name: f.name.value, brand: f.brand.value, kcal: num(f.kcal.value),
          protein: num(f.protein.value) || 0, carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0,
          ...Object.fromEntries(MICROS.map(([k]) => [k, f[k] ? num(f[k].value) || 0 : (food ? food[k] || 0 : 0)])),
          portions: portions.filter(p => p.name.trim() && p.grams > 0),
          serving_g: gRead(f.serving_g.value) || 100, category: f.category.value, barcode: f.barcode.value.trim() };
        if (state.features.household && !foreign) body.shared = sharedBox.checked;
        const id = food ? food.id : (await send("POST", "foods", body)).id;
        if (food) await send("PUT", "foods/" + food.id, body);
        onSave(id);
      } }, food ? "Speichern" : "Speichern & wählen")));
  for (const k of ["kcal", "carbs", "fat", "protein"]) f[k].addEventListener("input", check);
  f.serving_g.value = gShow(food ? food.serving_g : 100);
  check();
  setTimeout(() => f.name.focus());
  if (prefill.barcode) { f.barcode.value = prefill.barcode; lookup(); }
  return form;
}

// ---------------------------------------------------------------- add dialog (foods + saved meals)
async function openAdd(meal, { scan = false } = {}) {
  const times = state.data.mode === "times";
  let [foods, saved, sugg] = await Promise.all([api("foods"), api("saved-meals"),
    api("suggestions" + (meal ? "?meal_id=" + meal.id : "")), loadCats()]);
  let tab = "foods", remote = null, favs = null;
  const time = h("input", { type: "time", value: timeNow() });
  const search = h("input", { type: "search", placeholder: "Suchen…", oninput: () => { draw(); more(); } });
  const more = remoteFoods(search, r => { remote = r; draw(); });
  const results = h("div", { class: "results" });
  const detail = h("div");
  const body = h("div");
  const chips = h("div");
  const sug = h("div", { class: "results suggest" });
  const tabs = h("div", { class: "range" },
    ["foods", "Lebensmittel", "fav", "★ Favoriten", "saved", "Meine Mahlzeiten"].flatMap((v, i, a) => i % 2 ? [] : [
      h("button", { class: v === tab ? "active" : "", "data-t": v, onclick: () => {
        tab = v; draw();
        if (v === "fav" && !favs) api("foods?favorite=1&limit=200").then(x => { favs = x; draw(); });
      } }, a[i + 1])]));

  function drawChips() {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
  }

  function draw() {
    for (const b of tabs.children) b.classList.toggle("active", b.dataset.t === tab);
    const q = search.value.toLowerCase();
    const list = tab === "foods" ? foods : tab === "fav" ? (favs || foods.filter(f => f.favorite)) : saved;
    const fm = state.frequent;
    const savedFreq = sugg.saved.filter(isVisible).map(x => ({ x, saved: true }));
    const entryFreq = sugg.items.map(x => ({ x, saved: false }));
    const frequent = tab === "foods" ? (fm === "meals" ? savedFreq : fm === "both" ? [...savedFreq, ...entryFreq] : entryFreq)
      : tab === "saved" ? savedFreq : [];
    sug.replaceChildren(...(!q && frequent.length ? [h("div", { class: "muted sect" }, "Häufig verwendet"),
      ...frequent.map(({ x, saved: isSaved }) => h("button", { class: "food", onclick: () => (isSaved ? selectSaved(x) : selectEntry(x)) },
        h("span", {}, x.name), h("span", { class: "muted" }, `${n0(x.kcal)} kcal${x.grams ? " · " + gText(x.grams) : ""}`))),
      h("div", { class: "muted sect" }, "Alle")] : []));
    const hits = remote && tab === "foods" && search.value.trim().length >= 2;
    const rows = (hits ? remote : list.filter(x => ((x.name || "") + " " + (x.brand || "")).toLowerCase().includes(q))).filter(isVisible).slice(0, 50);
    results.replaceChildren(...rows.map(x => h("button", { class: "food", onclick: () => (tab !== "saved" ? select(x) : selectSaved(x)) },
      h("span", {}, x.favorite ? "★ " : "", x.name, x.brand ? ` (${x.brand})` : "", x.category ? h("span", { class: "tag" }, x.category) : null),
      h("span", { class: "muted" }, tab !== "saved" ? `${n0(x.kcal)} kcal/100 g` : `${n0(x.kcal)} kcal`))));
    if (!rows.length) results.append(h("div", { class: "muted", style: "padding:8px" },
      tab === "foods" ? "Nichts gefunden – lege ein neues Lebensmittel an."
        : tab === "fav" ? "Noch keine Favoriten – markiere Lebensmittel auf der Seite „Lebensmittel“ mit ☆."
        : "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen."));
    drawChips();
  }

  const target = () => ({ day: state.day, meal_id: meal ? meal.id : null, time: times ? time.value || null : null });
  const back = () => { detail.replaceChildren(); body.hidden = false; };

  function select(f) {
    const grams = h("input", { type: "number", step: "any", min: gMin(), value: gShow(f.serving_g || 100), oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = (gRead(grams.value) || 0) / 100;
      pv.replaceChildren(
        h("span", {}, h("b", {}, n0(f.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(f.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(f.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(f.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, f.name), portionPicker(f, grams) || "", h("label", {}, amtLabel()), grams, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: back }, "Zurück"),
        h("button", { onclick: async () => {
          if (!(gRead(grams.value) > 0)) return;
          await send("POST", "entries", { ...target(), food_id: f.id, grams: gRead(grams.value) });
          dlg.close(); renderDiary();
        } }, "Hinzufügen")));
    body.hidden = true;
    grams.select();
  }

  // a frequently used diary entry: re-add it with the last amount (scaled from the stored snapshot)
  function selectEntry(it) {
    const grams = h("input", { type: "number", step: "any", min: gMin(), value: gShow(it.grams), oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = (gRead(grams.value) || 0) / it.grams;
      pv.replaceChildren(
        h("span", {}, h("b", {}, n0(it.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(it.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(it.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(it.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, it.name), h("label", {}, amtLabel()), grams, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: back }, "Zurück"),
        h("button", { onclick: async () => {
          if (!(gRead(grams.value) > 0)) return;
          const { day, meal_id, time: t } = target();
          await send("POST", "entries/copy", { ids: [it.entry_id], day, meal_id, time: t, factor: gRead(grams.value) / it.grams });
          dlg.close(); renderDiary();
        } }, "Hinzufügen")));
    body.hidden = true;
    grams.select();
  }

  function selectSaved(s) {
    const factor = h("input", { type: "number", step: "any", min: "0.1", value: 1, oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = num(factor.value) || 0;
      pv.replaceChildren(
        h("span", {}, h("b", {}, n0(s.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(s.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(s.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(s.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, s.name),
      h("div", { class: "muted" }, s.items.map(i => entryLabel(i)).join(" · ")),
      h("label", {}, "Portionen"), factor, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: back }, "Zurück"),
        h("button", { onclick: async () => {
          if (!(num(factor.value) > 0)) return;
          const { day, meal_id, time: t } = target();
          await send("POST", `saved-meals/${s.id}/add`, { day, meal_id, time: t, factor: num(factor.value) });
          dlg.close(); renderDiary();
        } }, "Hinzufügen")));
    body.hidden = true;
    factor.select();
  }

  function newFood(prefill = {}) {
    const form = foodForm({
      prefill,
      onCancel: () => { form.remove(); body.hidden = false; },
      onSave: async id => {
        foods = await api("foods");
        await loadCats();
        form.remove(); body.hidden = false;
        select(foods.find(x => x.id === id));
      },
    });
    body.hidden = true;
    (dlg.querySelector(".dlg-body") || dlg).append(form);
  }

  // scan a barcode: an own food with this barcode is picked straight away, otherwise a new food is looked up
  const scanBox = h("div", { class: "scan-box" });
  const photoIn = h("input", { type: "file", accept: "image/*", capture: "environment", hidden: true, onchange: async () => {
    scanBox.replaceChildren();
    try { await found(await scanPhoto(photoIn.files[0])); } catch (e) { scanBox.replaceChildren(h("div", { class: "err" }, e.message)); }
    photoIn.value = "";
  } });
  async function found(code) {
    const own = await api("foods?barcode=" + encodeURIComponent(code));
    if (own.length) select(own[0]); else newFood({ barcode: code });
  }
  const startScan = async () => {
    scanBox.replaceChildren();
    try { await found(await scanBarcode(scanBox)); } catch (e) { if (e.message !== "Abgebrochen") scanBox.replaceChildren(h("div", { class: "err" }, e.message)); }
  };
  body.append(tabs, search, scanBox, chips, sug, results,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => newFood() }, "+ Neues Lebensmittel"),
      h("button", { class: "flat", onclick: startScan }, "Barcode scannen"),
      h("button", { class: "flat", onclick: () => photoIn.click() }, "Foto vom Barcode"), photoIn,
      h("button", { class: "flat", onclick: () => quickDialog(meal) }, "Schnelleingabe (nur kcal)"),
      h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  setDlg(h("h2", {}, meal ? "Zu „" + meal.name + "“ hinzufügen" : "Eintrag hinzufügen"),
    times ? h("div", { style: "margin-bottom:8px" }, h("label", {}, "Uhrzeit"), time) : null, body, detail);
  draw();
  dlg.showModal();
  if (scan) startScan();
}

// ---------------------------------------------------------------- charts
// Daily grams of one macro as bars, the goal as a dashed line and the 7-day average of logged days as a solid line.
function macroChart(days, key, cls) {
  const W = 600, H = 200, L = 40, B = 24, T = 10, R = 8;
  const goals = days.map(d => d["goal_" + key] || 0);
  const avg = days.map((d, i) => {
    const w = days.slice(Math.max(0, i - 6), i + 1).filter(x => x.logged);
    return w.length ? w.reduce((a, x) => a + x[key], 0) / w.length : null;
  });
  const top = Math.max(...goals, ...days.map(d => d[key]), 10);
  const step = [5, 10, 20, 25, 50, 100, 200, 500].find(st => top / st <= 6) || 1000;
  const max = Math.ceil(top / step) * step * 1.04;
  const y = v => T + (H - T - B) * (1 - v / max);
  const bw = (W - L - R) / days.length;
  let s = "";
  for (let v = 0; v <= max / 1.04 + 1e-6; v += step) {
    s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${n0(v)}</text>`;
  }
  const ticks = new Map(niceTicks(days[0].day, days[days.length - 1].day).map(t => [t.day, t.label]));
  days.forEach((d, i) => {
    const x = L + i * bw;
    if (d.logged) s += `<rect class="bar-m ${cls}" x="${x + bw * 0.15}" y="${y(d[key])}" width="${bw * 0.7}" height="${H - B - y(d[key])}" rx="2"/>`;
    if (ticks.has(d.day)) s += `<line class="grid-line" x1="${x + bw / 2}" x2="${x + bw / 2}" y1="${H - B}" y2="${H - B + 4}"/><text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${ticks.get(d.day)}</text>`;
  });
  if (goals.some(g => g > 0)) s += `<polyline class="goal-line" points="${goals.map((g, i) => `${L + i * bw},${y(g)} ${L + (i + 1) * bw},${y(g)}`).join(" ")}"/>`;
  const pts = avg.map((v, i) => (v == null ? null : `${L + (i + 0.5) * bw},${y(v)}`)).filter(Boolean);
  if (pts.length > 1) s += `<polyline class="avg-line" points="${pts.join(" ")}"/>`;
  days.forEach((d, i) => {
    const text = d.logged ? `${longDate(d.day)}\n${n0(d[key])} g${goals[i] ? ` (Ziel ${n0(goals[i])} g)` : ""}` + (avg[i] != null ? `\nØ 7 Tage ${n0(avg[i])} g` : "")
      : `${longDate(d.day)}\nnicht erfasst`;
    s += `<rect class="hit" x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" data-tip="${esc(text)}"/>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Makro-Verlauf">${s}</svg>`;
}

const MACRO_VIEWS = [["protein", "Eiweiß", "bar-protein"], ["carbs", "Kohlenhydrate", "bar-carbs"], ["fat", "Fett", "bar-fat"]];
function macroCard(days) {
  const [key, label, cls] = MACRO_VIEWS.find(m => m[0] === state.macroKey) || MACRO_VIEWS[0];
  const chart = h("div");
  chart.innerHTML = macroChart(days, key, cls);
  tipHandlers(chart);
  const hasGoal = days.some(d => d["goal_" + key] > 0);
  return h("div", { class: "card" }, h("h2", {}, "Makro-Verlauf"),
    rangeButtons(MACRO_VIEWS.map(m => [m[0], m[1]]), key, v => { state.macroKey = v; renderStats(); }),
    chart,
    h("div", { class: "muted" }, hasGoal ? "Balken: Gramm pro Tag. Gestrichelt: Tagesziel. Durchgezogene Linie: Ø der letzten 7 Tage."
      : "Balken: Gramm pro Tag. Durchgezogene Linie: Ø der letzten 7 Tage. Ein Ziel für dieses Makro lässt sich unter Einstellungen → Tagesziele setzen."));
}

function barChart(days, goal) {
  const W = 600, H = 220, L = 40, B = 24, T = 10, R = 8;
  const goals = days.map(d => d.goal_kcal ?? goal);
  // y axis on round values (100, 250, 500 … kcal), top tick above the highest bar or goal
  const top = Math.max(...goals, ...days.map(d => d.kcal), 100);
  const step = [50, 100, 200, 250, 500, 1000, 2000, 5000].find(st => top / st <= 6) || 10000;
  const max = Math.ceil(top / step) * step * 1.04;
  const y = v => T + (H - T - B) * (1 - v / max);
  const bw = (W - L - R) / days.length;
  let s = "";
  for (let v = 0; v <= max / 1.04 + 1e-6; v += step) {
    s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${n0(v)}</text>`;
  }
  const ticks = new Map(niceTicks(days[0].day, days[days.length - 1].day).map(t => [t.day, t.label]));
  const stepped = goals.some(g => g !== goals[0]);
  days.forEach((d, i) => {
    const x = L + i * bw, g = goals[i];
    if (d.logged) s += `<rect class="bar-k${goalOver(d.kcal, g) ? " over" : ""}" x="${x + bw * 0.15}" y="${y(d.kcal)}" width="${bw * 0.7}" height="${H - B - y(d.kcal)}" rx="2"/>`;
    if (ticks.has(d.day)) s += `<line class="grid-line" x1="${x + bw / 2}" x2="${x + bw / 2}" y1="${H - B}" y2="${H - B + 4}"/><text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${ticks.get(d.day)}</text>`;
  });
  if (stepped) s += `<polyline class="goal-line" points="${goals.map((g, i) => `${L + i * bw},${y(g)} ${L + (i + 1) * bw},${y(g)}`).join(" ")}"/>`;
  else if (goal) s += `<line class="goal-line" x1="${L}" x2="${W - R}" y1="${y(goal)}" y2="${y(goal)}"/>`;
  // invisible hit areas, one column per day, carry the tooltip text
  days.forEach((d, i) => {
    const text = d.logged
      ? `${longDate(d.day)}\n${n0(d.kcal)} kcal${goals[i] ? ` (Ziel ${n0(goals[i])})` : ""}\nKH ${n0(d.carbs)} g · Fett ${n0(d.fat)} g · Eiweiß ${n0(d.protein)} g`
      : `${longDate(d.day)}\nnicht erfasst`;
    s += `<rect class="hit" x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" data-tip="${esc(text)}"/>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kalorien pro Tag">${s}</svg>`;
}

// Weight curve: raw values (faint) and a smoothed trend line (thick), like Happy Scale.
function lineChart(points, target, unit = "kg") {
  const isWeight = unit === "kg" || unit === "lb";
  const W = 600, H = 220, L = 44, B = 24, T = 10, R = 16;
  const vals = points.flatMap(p => [p.kg, p.trend]).concat(target ? [target] : []);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max((hi - lo) * 0.1, 0.5);
  lo -= pad; hi += pad;
  // y ticks on even weights: step 1, 2, 5, 10 … kg
  const step = [0.5, 1, 2, 5, 10, 20, 50].find(st => (hi - lo) / st <= 6) || 100;
  const ticks = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(v);
  if (ticks.length < 2) { lo = Math.floor(lo); hi = Math.ceil(hi); }
  const T0 = parse(points[0].day).getTime(), T1 = parse(points[points.length - 1].day).getTime();
  const x = t => L + (T1 === T0 ? (W - L - R) / 2 : (t - T0) / (T1 - T0) * (W - L - R));
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const px = p => x(parse(p.day).getTime());
  let s = "";
  for (const v of ticks) s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${step < 1 ? n1(v) : n0(v)}</text>`;
  if (target) s += `<line class="goal-line" x1="${L}" x2="${W - R}" y1="${y(target)}" y2="${y(target)}"/>`;
  s += `<polyline class="line raw" points="${points.map(p => `${px(p)},${y(p.kg)}`).join(" ")}"/>`;
  if (points.length <= 90) s += points.map(p => `<circle class="dot" cx="${px(p)}" cy="${y(p.kg)}" r="2.5"/>`).join("");
  s += `<polyline class="line" points="${points.map(p => `${px(p)},${y(p.trend)}`).join(" ")}"/>`;
  // x ticks on round dates (month starts, 1st/15th, 5-day marks …)
  for (const t of niceTicks(points[0].day, points[points.length - 1].day)) {
    const tx = x(parse(t.day).getTime());
    s += `<line class="grid-line" x1="${tx}" x2="${tx}" y1="${H - B}" y2="${H - B + 4}"/><text x="${tx}" y="${H - 6}" text-anchor="middle">${t.label}</text>`;
  }
  // hit areas: a column around each measurement (up to the midpoint to its neighbours)
  points.forEach((p, i) => {
    const cx = px(p);
    const a = i ? (px(points[i - 1]) + cx) / 2 : L, b = i < points.length - 1 ? (cx + px(points[i + 1])) / 2 : W - R;
    const text = `${longDate(p.day)}\n${n1(p.kg)} ${unit}` + (isWeight ? `\nTrend ${n1(p.trend)} ${unit}` : "");
    s += `<rect class="hit" x="${a}" y="${T}" width="${Math.max(b - a, 1)}" height="${H - T - B}" data-tip="${esc(text)}"/>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${isWeight ? "Gewichtsverlauf" : "Verlauf"}">${s}</svg>`;
}

// Calories (bars, left axis) and weight (raw dots + smoothed trend, right axis) over the same days.
function comboChart(days, weights) {
  const W = 600, H = 220, L = 40, B = 24, T = 10, R = 44;
  const first = days[0].day;
  const pts = withTrend(weights).filter(p => p.day >= first).map(p => ({ ...p, v: wConv(p.kg), t: wConv(p.trend) }));
  const top = Math.max(...days.map(d => d.kcal), 100);
  const step = [50, 100, 200, 250, 500, 1000, 2000, 5000].find(st => top / st <= 6) || 10000;
  const max = Math.ceil(top / step) * step;
  const y = v => T + (H - T - B) * (1 - v / max);
  const bw = (W - L - R) / days.length;
  let s = "";
  for (let v = 0; v <= max + 1e-6; v += step) s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${n0(v)}</text>`;
  const ticks = new Map(niceTicks(days[0].day, days[days.length - 1].day).map(t => [t.day, t.label]));
  days.forEach((d, i) => {
    const x = L + i * bw;
    if (d.logged) s += `<rect class="bar-k soft" x="${x + bw * 0.15}" y="${y(d.kcal)}" width="${bw * 0.7}" height="${H - B - y(d.kcal)}" rx="2"/>`;
    if (ticks.has(d.day)) s += `<line class="grid-line" x1="${x + bw / 2}" x2="${x + bw / 2}" y1="${H - B}" y2="${H - B + 4}"/><text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${ticks.get(d.day)}</text>`;
  });
  if (pts.length) {
    let lo = Math.min(...pts.flatMap(p => [p.v, p.t])), hi = Math.max(...pts.flatMap(p => [p.v, p.t]));
    const pad = Math.max((hi - lo) * 0.15, 0.5);
    lo -= pad; hi += pad;
    const wstep = [0.5, 1, 2, 5, 10, 20, 50].find(st => (hi - lo) / st <= 5) || 100;
    const yw = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
    const px = p => L + (days.findIndex(d => d.day === p.day) + 0.5) * bw;
    const on = pts.filter(p => days.some(d => d.day === p.day));
    for (let v = Math.ceil(lo / wstep) * wstep; v <= hi + 1e-9; v += wstep) s += `<text class="w-axis" x="${W - R + 6}" y="${yw(v) + 4}">${wstep < 1 ? n1(v) : n0(v)}</text>`;
    if (on.length > 1) s += `<polyline class="line weight raw" points="${on.map(p => `${px(p)},${yw(p.v)}`).join(" ")}"/>`;
    s += on.map(p => `<circle class="dot weight" cx="${px(p)}" cy="${yw(p.v)}" r="2.5"/>`).join("");
    if (on.length > 1) s += `<polyline class="line weight" points="${on.map(p => `${px(p)},${yw(p.t)}`).join(" ")}"/>`;
    s += `<text class="w-axis" x="${W - R + 6}" y="${T - 1}">${wUnit()}</text>`;
  }
  const byDay = new Map(pts.map(p => [p.day, p]));
  days.forEach((d, i) => {
    const p = byDay.get(d.day);
    const text = `${longDate(d.day)}\n${d.logged ? n0(d.kcal) + " kcal" : "nicht erfasst"}` + (p ? `\n${n1(p.v)} ${wUnit()} · Trend ${n1(p.t)} ${wUnit()}` : "");
    s += `<rect class="hit" x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" data-tip="${esc(text)}"/>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kalorien und Gewicht">${s}</svg>`;
}

// Exponentially smoothed trend (10 % per day, gap-aware) so daily fluctuations fade out.
function withTrend(all) {
  let tr = null, prev = null;
  return all.map(p => {
    const t = parse(p.day).getTime();
    tr = tr == null ? p.kg : tr + (1 - Math.pow(0.9, Math.max(1, (t - prev) / 864e5))) * (p.kg - tr);
    prev = t;
    return { ...p, trend: tr };
  });
}

// Expected date for the target weight from the trend of the last four weeks.
function forecast(pts, target) {
  if (!target || pts.length < 2) return null;
  const last = pts[pts.length - 1], lt = parse(last.day).getTime();
  const ref = pts.find(p => lt - parse(p.day).getTime() <= 28 * 864e5);
  const span = (lt - parse(ref.day).getTime()) / 864e5;
  if (span < 14) return { text: "zu wenig Daten" };
  const slope = (last.trend - ref.trend) / span;       // kg per day
  const diff = target - last.trend;
  if (Math.abs(diff) < 0.2) return { text: "erreicht" };
  if (slope === 0 || Math.sign(slope) !== Math.sign(diff) || Math.abs(slope) < 0.004) return { text: "nicht absehbar", perWeek: slope * 7 };
  const d = diff / slope;
  if (d > 730) return { text: "nicht absehbar", perWeek: slope * 7 };
  const when = new Date(lt + d * 864e5);
  return { text: when.toLocaleDateString(I18N.locale, { day: "numeric", month: "short", year: "numeric" }), perWeek: slope * 7 };
}

function rangeButtons(options, current, onpick) {
  return h("div", { class: "range" }, options.map(([v, label]) =>
    h("button", { class: v === current ? "active" : "", onclick: () => onpick(v) }, label)));
}

// ---------------------------------------------------------------- foods page
const tag = c => (c ? h("span", { class: "tag" }, c) : null);

async function renderFoods() {
  const PAGE = 200;
  let [foods] = await Promise.all([api("foods?limit=" + PAGE), loadCats()]);
  let more = foods.length === PAGE, query = "", timer = null;
  const root = $("#foods");
  root.replaceChildren();
  const list = h("div", { class: "list" });
  const chips = h("div");

  const openForm = food => {
    const form = foodForm({
      food,
      onCancel: () => dlg.close(),
      onSave: () => { dlg.close(); renderFoods(); },
    });
    setDlg(h("h2", {}, food ? "Lebensmittel bearbeiten" : "Neues Lebensmittel"), form);
    dlg.showModal();
  };

  // the library can hold thousands of foods (e.g. after a BLS import): search and paging happen on the server
  const load = async append => {
    const rows = await api(`foods?limit=${PAGE}&offset=${append ? foods.length : 0}&q=${encodeURIComponent(query)}`);
    foods = append ? foods.concat(rows) : rows;
    more = rows.length === PAGE;
    draw();
  };

  const draw = () => {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
    const shown = foods.filter(isVisible);
    const hiddenN = foods.length - shown.length;
    list.replaceChildren(...(shown.length ? shown.map(f => h("div", {},
      h("div", { class: "grow" }, h("div", {}, f.name, f.brand ? ` (${f.brand})` : "", tag(f.category),
        f.mine === false ? h("span", { class: "shared-tag", title: "Gemeinsame Haushaltsbibliothek" }, `von ${f.owner_name}`) : f.shared ? h("span", { class: "shared-tag", title: "Für den Haushalt freigegeben" }, "geteilt") : null,
        plausibility(f) ? h("span", { class: "warn-mark", title: plausibility(f) }, "⚠") : null),
        h("div", { class: "muted" }, `${n0(f.kcal)} kcal · KH ${n1(f.carbs)} g · Fett ${n1(f.fat)} g · Eiweiß ${n1(f.protein)} g (pro 100 g)`, f.barcode ? ` · ${f.barcode}` : "")),
      f.mine === false ? null : h("button", { class: "icon fav" + (f.favorite ? " on" : ""), title: f.favorite ? "Favorit entfernen" : "Als Favorit markieren", "aria-label": "Favorit", onclick: async () => {
        f.favorite = f.favorite ? 0 : 1;
        await send("PUT", `foods/${f.id}/favorite`, { favorite: !!f.favorite });
        draw();
      } }, f.favorite ? "★" : "☆"),
      f.mine === false ? null : h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", onclick: () => triggerDialog({ item: "f:" + f.id }) }, "⚡"),
      state.features.household && f.mine !== false ? h("button", { class: "icon", title: "Mit dem Haushalt teilen", "aria-label": "Teilen", onclick: () => shareLibrary("foods", f) }, "⇪") : null,
      h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => openForm(f) }, "✎"),
      f.mine === false ? null : h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`„${f.name}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.`)) return;
        await api("foods/" + f.id, { method: "DELETE" }); renderFoods();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, query ? "Nichts gefunden." : "Noch keine Lebensmittel angelegt.")]),
      ...(hiddenN ? [h("div", { class: "muted", style: "padding:8px 0" }, `${hiddenN} Lebensmittel durch ausgeblendete Kategorien versteckt.`)] : []),
      ...(more ? [h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => load(true) }, "Mehr laden"))] : []));
  };

  const search = h("input", { type: "search", placeholder: "Lebensmittel suchen…", oninput: () => {
    clearTimeout(timer);
    timer = setTimeout(() => { query = search.value.trim(); load(false); }, 250);
  } });
  root.append(h("div", { class: "card" }, search,
    h("div", { class: "actions", style: "justify-content:flex-start;flex-wrap:wrap" },
      h("button", { onclick: () => openForm(null) }, "+ Neues Lebensmittel"),
      h("button", { class: "flat", onclick: () => dupDialog(renderFoods) }, "Duplikate suchen"),
      state.features.sources ? h("button", { class: "flat", onclick: foodCheckDialog }, "Werte online prüfen") : null,
      h("button", { class: "flat", onclick: () => pickFile(".csv,.txt,.xlsx,text/csv", foodImportDialog) }, "Tabelle importieren …")),
    chips, list));
  draw();
}

// Foods with identical name and brand: pick the one to keep, the others are deleted (triggers move to it).
async function dupDialog(onChange) {
  const groups = await api("foods/duplicates");
  const msg = h("div", { class: "muted" });
  setDlg(h("h2", {}, "Doppelte Lebensmittel"),
    groups.length ? h("div", { class: "muted" }, "Wähle je Gruppe das Lebensmittel, das bleiben soll. Bereits eingetragene Mahlzeiten bleiben unverändert.")
      : h("div", { class: "muted" }, "Keine Duplikate gefunden."),
    groups.map((g, gi) => {
      const radios = g.map((f, i) => [f, h("input", { type: "radio", name: "dup" + gi, checked: i === 0 })]);
      return h("div", { class: "card", style: "margin:12px 0 0" },
        h("b", {}, g[0].name + (g[0].brand ? ` (${g[0].brand})` : "")),
        radios.map(([f, r]) => h("label", { class: "pick" }, r,
          `${n0(f.kcal)} kcal · KH ${n1(f.carbs)} · Fett ${n1(f.fat)} · Eiweiß ${n1(f.protein)}${f.favorite ? " · ★" : ""}`)),
        h("div", { class: "actions", style: "margin-top:8px" }, h("button", { onclick: async () => {
          const keep = radios.find(([, r]) => r.checked)[0];
          await send("POST", "foods/merge", { keep_id: keep.id, merge_ids: g.map(f => f.id) });
          onChange(); dupDialog(onChange);
        } }, "Zusammenführen")));
    }), msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  if (!dlg.open) dlg.showModal();
}

// Compare the own foods with Open Food Facts (by barcode where there is one, else by name) and offer to take over the online values.
async function foodCheckDialog() {
  const foods = (await api("foods?limit=1000")).filter(f => f.mine !== false);
  const coded = foods.filter(f => f.barcode).length;
  const onlyCoded = h("input", { type: "checkbox", checked: coded > 0 });
  const usda = h("input", { type: "checkbox" });
  const prog = h("div", { class: "muted" }), out = h("div", { class: "list" }), msg = h("div", { class: "err" });
  let running = false, stopFlag = false;
  const go = h("button", { onclick: run }, "Prüfen");
  const stopBtn = h("button", { class: "flat", onclick: () => { stopFlag = true; } }, "Anhalten");
  stopBtn.hidden = true;
  const take = async (f, m, row) => {
    const keep = k => (m[k] ? m[k] : f[k] || 0);
    await send("PUT", "foods/" + f.id, { name: f.name, brand: f.brand, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat,
      fiber: keep("fiber"), sugar: keep("sugar"), salt: keep("salt"), sat_fat: keep("sat_fat"), serving_g: f.serving_g, category: f.category,
      barcode: f.barcode || (/^\d{6,}$/.test(m.code || "") ? m.code : "") });
    row.replaceChildren(h("div", { class: "grow muted" }, `${f.name}: Werte übernommen ✓`));
  };
  async function run() {
    if (running) return;
    running = true; stopFlag = false; go.disabled = true; stopBtn.hidden = false; out.replaceChildren(); msg.textContent = "";
    const todo = foods.filter(f => !onlyCoded.checked || f.barcode);
    const sources = usda.checked ? "off,usda" : "off";
    let diff = 0, none = 0, ok = 0, i = 0;
    for (const f of todo) {
      if (stopFlag) break;
      prog.textContent = `Prüfe ${++i} von ${todo.length} …`;
      let r;
      try { r = await api(`foods/${f.id}/check?sources=${sources}`); } catch (e) { msg.textContent = e.message; break; }
      if (r.level === "error") { msg.textContent = `Online-Abfrage nicht möglich: ${r.error}`; break; }
      if (r.level === "ok") ok++;
      else if (r.level === "none") none++;
      else {
        diff++;
        const m = r.match, row = h("div", {});
        row.append(h("div", { class: "grow" }, h("b", {}, f.name + (f.brand ? ` (${f.brand})` : "")),
          h("div", { class: "muted" }, `Dein Wert: ${n0(f.kcal)} kcal · KH ${n1(f.carbs)} · Fett ${n1(f.fat)} · Eiweiß ${n1(f.protein)}`),
          h("div", { class: "muted" }, `${m.source === "usda" ? "USDA" : "Open Food Facts"}: ${n0(m.kcal)} kcal · KH ${n1(m.carbs)} · Fett ${n1(m.fat)} · Eiweiß ${n1(m.protein)} (${m.name})`)),
          h("button", { class: "flat", onclick: () => take(f, m, row).catch(e => { msg.textContent = e.message; }) }, "Übernehmen"),
          h("button", { class: "icon", title: "Ignorieren", "aria-label": "Ignorieren", onclick: () => row.remove() }, "✕"));
        out.append(row);
      }
    }
    prog.textContent = `${i} geprüft: ${ok} stimmen überein, ${diff} weichen ab, ${none} ohne Treffer.`;
    running = false; go.disabled = false; stopBtn.hidden = true;
  }
  setDlg(h("h2", {}, "Werte online prüfen"),
    h("div", { class: "muted" }, "Vergleicht Deine Lebensmittel mit Open Food Facts (Barcode, sonst Name) und zeigt Abweichungen bei Kalorien und Makros. Es wird nichts geändert, bevor Du „Übernehmen“ wählst. Abfragen werden lokal zwischengespeichert; dabei gehen Barcodes bzw. Namen an den Dienst."),
    h("label", { class: "pick" }, onlyCoded, `Nur Lebensmittel mit Barcode (${coded} von ${foods.length})`),
    h("label", { class: "pick" }, usda, "Auch USDA abfragen (strenges Abfragelimit ohne eigenen Schlüssel)"),
    h("div", { class: "actions", style: "justify-content:flex-start" }, go, stopBtn), prog, msg, out,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => { stopFlag = true; dlg.close(); renderFoods(); } }, "Schließen")));
  dlg.showModal();
}

// Food table (BLS, Open Food Facts export, own list as CSV or Excel): the server guesses the columns, the user can correct them.
const FOOD_FIELDS = [["name", "Name"], ["brand", "Marke"], ["barcode", "Barcode"], ["kcal", "Kalorien (kcal)"], ["kj", "Energie (kJ)"], ["protein", "Eiweiß"],
  ["carbs", "Kohlenhydrate"], ["fat", "Fett"], ["fiber", "Ballaststoffe"], ["sugar", "Zucker"], ["salt", "Salz"], ["sodium", "Natrium"], ["sat_fat", "ges. Fettsäuren"], ["category", "Kategorie"]];

async function foodImportDialog(file) {
  const post = async (path, qs = "") => {
    const r = await fetch("api/" + path + qs, { method: "POST", body: file });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || r.status);
    return j;
  };
  let p;
  try { p = await post("import/foods/preview"); } catch (e) { alert(e.message); return; }
  const selects = {};
  const mapping = () => Object.fromEntries(FOOD_FIELDS.map(([k]) => [k, selects[k].value === "" ? null : Number(selects[k].value)]));
  const info = h("div", { class: "muted" }), sample = h("div", { class: "lk-wrap" }), msg = h("div", { class: "err" });
  const category = h("input", { value: p.preset || file.name.replace(/\.[^.]+$/, ""), maxlength: 60 });
  const redraw = q => {
    info.textContent = q.items ? `${q.items} Lebensmittel erkannt (${q.skipped} Zeilen ohne Name oder Kalorien werden übersprungen). Werte gelten pro 100 g.` : "Bitte die Spalten für Name und Kalorien zuordnen.";
    sample.replaceChildren(q.sample.length ? h("table", { class: "lk" }, h("thead", {}, h("tr", {}, ["Name", "kcal", "KH", "Fett", "Eiweiß"].map(x => h("th", {}, x)))),
      h("tbody", {}, q.sample.map(r => h("tr", {}, h("td", {}, r.name), h("td", {}, n0(r.kcal)), h("td", {}, n1(r.carbs)), h("td", {}, n1(r.fat)), h("td", {}, n1(r.protein)))))) : "");
  };
  for (const [k] of FOOD_FIELDS) {
    selects[k] = h("select", { onchange: async () => {
      try { p = { ...p, ...(await post("import/foods/preview", "?mapping=" + encodeURIComponent(JSON.stringify(mapping())))) }; redraw(p); } catch (e) { msg.textContent = e.message; }
    } }, h("option", { value: "" }, "– nicht vorhanden –"), p.headers.map((hd, i) => h("option", { value: i }, hd)));
    if (p.mapping[k] != null) selects[k].value = p.mapping[k];
  }
  setDlg(h("h2", {}, "Lebensmittel-Tabelle importieren"),
    p.preset ? h("div", {}, `Erkannt: ${p.preset}`) : null, info,
    h("details", {}, h("summary", {}, "Zuordnung der Spalten"), h("div", { class: "grid" }, FOOD_FIELDS.map(([k, label]) => h("div", {}, h("label", {}, label), selects[k])))),
    sample, h("label", {}, "Kategorie für Lebensmittel ohne Kategorie in der Datei"), category,
    h("div", { class: "muted" }, "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert."), msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        try {
          const r = await post("import/foods", `?category=${encodeURIComponent(category.value)}&mapping=${encodeURIComponent(JSON.stringify(mapping()))}`);
          dlg.close();
          alert(`Importiert: ${r.added} neu, ${r.duplicates} schon vorhanden, ${r.skipped} übersprungen.`);
          loadCats().then(() => { if (state.tab === "foods") renderFoods(); });
        } catch (e) { msg.textContent = e.message; }
      } }, "Importieren")));
  redraw(p);
  dlg.showModal();
}

// Copy a food or saved meal into other household members' libraries.
async function shareLibrary(kind, item) {
  const users = await api("household/users");
  const rows = users.map(u => ({ u, on: h("input", { type: "checkbox" }) }));
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, `„${item.name}“ teilen`),
    h("div", { class: "muted" }, "Die gewählten Personen bekommen eine eigene Kopie in ihrer Bibliothek. Gleichnamige Einträge bei ihnen bleiben unverändert, spätere Änderungen werden nicht abgeglichen."),
    rows.length ? h("div", { class: "list" }, rows.map(r => h("div", {}, h("label", { class: "pick grow" }, r.on, r.u.name))))
      : h("div", { class: "muted", style: "padding:8px 0" }, "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein."),
    msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { disabled: !rows.length, onclick: async () => {
        const ids = rows.filter(r => r.on.checked).map(r => r.u.id);
        if (!ids.length) { msg.textContent = "Bitte mindestens eine Person wählen."; return; }
        try { const r = await send("POST", kind + "/share", { ids: [item.id], users: ids }); dlg.close(); alert(`${r.copied} kopiert, ${r.skipped} übersprungen.`); }
        catch (e) { msg.textContent = e.message; }
      } }, "Teilen")));
  dlg.showModal();
}

// ---------------------------------------------------------------- saved meals page
const sharedFrom = o => h("span", { class: "shared-tag", title: "Gemeinsame Haushaltsbibliothek" }, `von ${o.owner_name}`);
const sharedMark = o => (o.shared ? h("span", { class: "shared-tag", title: "Für den Haushalt freigegeben" }, "geteilt") : null);
const shareBox = (draft, obj) => {
  if (!state.features.household || (obj && obj.mine === false)) return null;
  const edit = h("input", { type: "checkbox", checked: draft.shared === 2, disabled: !draft.shared, onchange: e => { draft.shared = e.target.checked ? 2 : 1; } });
  const offer = h("input", { type: "checkbox", checked: !!draft.shared, onchange: e => {
    draft.shared = e.target.checked ? (edit.checked ? 2 : 1) : 0; edit.disabled = !e.target.checked; if (!e.target.checked) edit.checked = false;
  } });
  return [h("label", { class: "pick", style: "margin-top:12px" }, offer, "In der gemeinsamen Haushaltsbibliothek anbieten (andere dürfen es nutzen und kopieren)"), h("label", { class: "pick" }, edit, "Andere dürfen es auch ändern")];
};
const canEdit = o => o.mine !== false || o.shared === 2;

async function renderMeals() {
  const [saved] = await Promise.all([api("saved-meals"), loadCats()]);
  const root = $("#meals");
  root.replaceChildren();
  const list = h("div", { class: "list" });
  const chips = h("div");

  // Edit name/category and the components of a saved meal: change amounts, swap or remove foods, add new ones.
  const editSaved = (s, draft = { name: s.name, category: s.category, items: s.items.map(i => ({ ...i })), min_scale: s.min_scale || 0, max_scale: s.max_scale || 0, shared: s.shared || 0 }) => {
    const name = h("input", { value: draft.name, oninput: () => { draft.name = name.value; } });
    const category = h("input", { list: "cat-list", value: draft.category, oninput: () => { draft.category = category.value; } });
    const msg = h("div", { class: "err" });
    const total = h("div", { class: "preview" });
    const sum = k => draft.items.reduce((a, i) => a + i[k], 0);
    const drawTotal = () => total.replaceChildren(h("span", {}, h("b", {}, n0(sum("kcal"))), " kcal"), h("span", {}, h("b", {}, n0(sum("carbs"))), " g KH"),
      h("span", {}, h("b", {}, n0(sum("fat"))), " g Fett"), h("span", {}, h("b", {}, n0(sum("protein"))), " g Eiweiß"));
    drawTotal();
    const swap = (idx, title) => {
      setDlg(foodSwapDialog({
        title, grams: idx == null ? null : draft.items[idx].grams, confirm: idx == null ? "Hinzufügen" : "Tauschen",
        onCancel: () => editSaved(s, draft),
        onDone: (f, g) => {
          if (idx == null) draft.items.push(foodItem(f, g));
          else { const { mode, tol, pack_g, step_g, pack_min, pack_max } = draft.items[idx]; draft.items[idx] = { ...foodItem(f, g), mode, tol, pack_g, step_g, pack_min, pack_max }; }
          editSaved(s, draft);
        },
      }));
    };
    const rows = draft.items.map((it, idx) => {
      const g = it.grams > 0 ? h("input", { type: "number", step: "any", min: gMin(), style: "width:80px;flex:none", value: gShow(it.grams), onchange: () => {
        const ng = gRead(g.value);
        if (!(ng > 0)) { g.value = gShow(it.grams); return; }
        const k = ng / it.grams;
        for (const key of ["kcal", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sat_fat"]) it[key] = (it[key] || 0) * k;
        it.grams = ng;
        drawTotal();
        kc.textContent = `${n0(it.kcal)} kcal`;
      } }) : null;
      const kc = h("span", { class: "muted" }, `${n0(it.kcal)} kcal`);
      return h("div", {}, h("div", { class: "grow" }, it.name, " ", kc, state.features.suggest && g ? sugOpts(it, () => editSaved(s, draft)) : null), g, g ? mUnit() : null,
        h("button", { class: "icon edit", title: "Durch anderes Lebensmittel tauschen", "aria-label": "Tauschen", onclick: () => swap(idx, `„${it.name}“ tauschen`) }, "⇄"),
        h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", disabled: draft.items.length < 2, onclick: () => {
          draft.items.splice(idx, 1); editSaved(s, draft);
        } }, "✕"));
    });
    setDlg(h("h2", {}, "Mahlzeit bearbeiten"),
      h("label", {}, "Name"), name, h("label", {}, "Kategorie"), category, catList(),
      h("label", { style: "margin-top:12px" }, "Komponenten"),
      h("div", { class: "list" }, rows),
      h("button", { class: "flat", onclick: () => swap(null, "Komponente hinzufügen") }, "+ Komponente"),
      total,
      state.features.suggest ? [h("label", { style: "margin-top:12px" }, "Mengenfaktor für Vorschläge"),
        h("div", { class: "sug-range", title: "Wie stark die ganze Mahlzeit bei Vorschlägen verkleinert oder vergrößert werden darf (1 = Menge wie gespeichert). Leer = 0,6 bis 1,6." },
          "von", h("input", { type: "number", step: "0.05", min: "0.1", placeholder: "0.6", value: draft.min_scale || "", onchange: e => { draft.min_scale = num(e.target.value) || 0; } }),
          "bis", h("input", { type: "number", step: "0.05", min: "0.1", placeholder: "1.6", value: draft.max_scale || "", onchange: e => { draft.max_scale = num(e.target.value) || 0; } }))] : null,
      shareBox(draft, s),
      msg,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
        h("button", { onclick: async () => {
          if (!draft.name.trim()) { msg.textContent = "Bitte einen Namen angeben."; return; }
          try {
            await send("PUT", "saved-meals/" + s.id, { name: draft.name, category: draft.category, min_scale: draft.min_scale || 0, max_scale: draft.max_scale || 0,
              shared: state.features.household && s.mine !== false ? draft.shared || 0 : undefined,
              items: draft.items.map(i => ({
                name: i.name, grams: i.grams, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat,
                fiber: i.fiber || 0, sugar: i.sugar || 0, salt: i.salt || 0, sat_fat: i.sat_fat || 0,
                mode: i.mode || "scale", tol: i.tol || 0, pack_g: i.pack_g || 0, step_g: i.step_g || 0, pack_min: i.pack_min ?? 1, pack_max: i.pack_max ?? 2 })) });
            dlg.close(); renderMeals();
          } catch (e) { msg.textContent = e.message; }
        } }, "Speichern")));
    dlg.showModal();
  };

  const draw = () => {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
    const q = search.value.toLowerCase();
    const shown = saved.filter(isVisible).filter(s => s.name.toLowerCase().includes(q));
    list.replaceChildren(...(shown.length ? shown.map(s => h("div", {},
      h("div", { class: "grow" }, h("div", {}, s.name, s.mine === false ? sharedFrom(s) : [tag(s.category), sharedMark(s)]),
        h("div", { class: "muted" }, `${n0(s.kcal)} kcal · KH ${n1(s.carbs)} g · Fett ${n1(s.fat)} g · Eiweiß ${n1(s.protein)} g`),
        h("div", { class: "muted" }, s.items.map(entryLabel).join(" · "))),
      s.mine === false ? null : h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", onclick: () => triggerDialog({ item: "s:" + s.id }) }, "⚡"),
      state.features.household && s.mine !== false ? h("button", { class: "icon", title: "Mit dem Haushalt teilen", "aria-label": "Teilen", onclick: () => shareLibrary("saved-meals", s) }, "⇪") : null,
      !canEdit(s) ? null : h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => editSaved(s) }, "✎"),
      h("button", { class: "icon", title: "Kopie anlegen", "aria-label": "Kopieren", onclick: async () => {
        const { id } = await send("POST", `saved-meals/${s.id}/copy`);
        await renderMeals();
        const copy = (await api("saved-meals")).find(x => x.id === id);
        if (copy) editSaved(copy);
      } }, "⧉"),
      s.mine === false ? null : h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`Mahlzeit „${s.name}“ löschen?`)) return;
        await api("saved-meals/" + s.id, { method: "DELETE" }); renderMeals();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, saved.length ? "Nichts gefunden." : "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.")]));
  };

  const search = h("input", { type: "search", placeholder: "Mahlzeiten suchen…", oninput: draw });
  root.append(h("div", { class: "card" }, search, chips, list));
  if (state.features.shopping) root.append(h("div", { class: "hint" }, h("button", { class: "flat", onclick: shoppingDialog }, "Einkaufsliste")));
  draw();
}

// ---------------------------------------------------------------- shopping list (optional)
// Adds up the ingredients of chosen recipes (portions) and saved meals (multiple of the saved amounts); copy it or send it to a Home Assistant to-do list.
const shopLine = i => {
  const g = Number(i.grams) || 0;
  if (g <= 0) return i.name;
  return `${i.name} – ${g >= 1000 ? (Math.round(g / 10) / 100).toLocaleString(I18N.locale) + " kg" : Math.round(g) + " g"}`;
};

async function shoppingDialog() {
  const [recipes, meals, todos] = await Promise.all([state.features.recipes ? api("recipes") : [], api("saved-meals"),
    api("shopping/todos").catch(() => ({ entities: [], last: "" }))]);
  const rAmt = {}, mAmt = {};
  let items = [], seq = 0;
  const out = h("div", { class: "list" });
  const msg = h("div", { class: "err" });
  const text = () => items.map(shopLine).join("\n");

  async function recalc() {
    const my = ++seq;
    const body = { recipes: Object.entries(rAmt).map(([id, amount]) => ({ id: Number(id), amount })), meals: Object.entries(mAmt).map(([id, amount]) => ({ id: Number(id), amount })) };
    try { items = (await send("POST", "shopping/list", body)).items; } catch (e) { if (my === seq) msg.textContent = e.message; return; }
    if (my !== seq) return;
    msg.textContent = "";
    out.replaceChildren(...(items.length ? items.map(i => h("div", {}, shopLine(i))) : [h("div", { class: "muted" }, "Noch nichts gewählt.")]));
  }
  const pick = (store, id, name, hint) => {
    const f = h("input", { type: "number", step: "any", min: "0", placeholder: "0", style: "width:72px;flex:none", title: hint,
      oninput: () => { const v = num(f.value); if (v > 0) store[id] = v; else delete store[id]; recalc(); } });
    return h("div", {}, h("div", { class: "grow" }, name), f);
  };
  const send2 = h("select", {}, todos.entities.map(e => h("option", { value: e.id, selected: e.id === todos.last }, e.name || e.id)));
  const copy = h("button", { class: "flat", onclick: async e => {
    const t = text();
    try { await navigator.clipboard.writeText(t); }
    catch { const ta = h("textarea", {}); ta.value = t; document.body.append(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    e.target.textContent = "Kopiert ✓";
  } }, "In die Zwischenablage kopieren");
  const sendBtn = h("button", { onclick: async e => {
    if (!items.length) return;
    e.target.disabled = true;
    try { const r = await send("POST", "shopping/send", { entity: send2.value, items }); msg.textContent = ""; e.target.textContent = `${r.sent} Einträge gesendet.`; }
    catch (err) { msg.textContent = err.message; }
    e.target.disabled = false;
  } }, "An Home Assistant senden");
  setDlg(h("h2", {}, "Einkaufsliste"),
    h("div", { class: "muted" }, "Wähle Rezepte (Portionen) und gespeicherte Mahlzeiten (Vielfaches, 1 = einmal): Die Zutaten werden zusammengezählt."),
    recipes.length ? [h("label", {}, "Rezepte"), h("div", { class: "list" }, recipes.map(r => pick(rAmt, r.id, r.name, "Portionen")))] : null,
    meals.length ? [h("label", {}, "Mahlzeiten"), h("div", { class: "list" }, meals.map(m => pick(mAmt, m.id, m.name, "Vielfaches")))] : null,
    h("label", {}, "Einkaufsliste"), out,
    todos.entities.length ? [h("label", {}, "Todo-Liste"), send2] : h("div", { class: "muted" }, "Keine Todo-Liste in Home Assistant gefunden."),
    msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen"), copy, todos.entities.length ? sendBtn : null));
  if (!dlg.open) dlg.showModal();
  recalc();
}


// ---------------------------------------------------------------- recipes page (optional)
async function renderRecipes() {
  const [recipes, mealieCfg] = await Promise.all([api("recipes"), api("mealie").catch(() => null), loadCats()]);
  const root = $("#recipes");
  root.replaceChildren();
  const list = h("div", { class: "list" });
  const chips = h("div");

  const editRecipe = (r, draft = r ? { name: r.name, category: r.category, portions: r.portions, cooked_g: r.cooked_g, source: r.source || "", instructions: r.instructions || "", shared: r.shared || 0, items: r.items.map(i => ({ ...i })) }
    : { name: "", category: "", portions: 2, cooked_g: null, source: "", instructions: "", items: [] }) => {
    const name = h("input", { value: draft.name, oninput: () => { draft.name = name.value; } });
    const category = h("input", { list: "cat-list", value: draft.category, oninput: () => { draft.category = category.value; } });
    const portions = h("input", { type: "number", step: "any", min: "0.1", value: draft.portions, oninput: () => { draft.portions = num(portions.value); drawTotal(); } });
    const cooked = h("input", { type: "number", step: "any", min: gMin(), placeholder: "wie Summe der Zutaten", value: draft.cooked_g ? gShow(draft.cooked_g) : "",
      oninput: () => { draft.cooked_g = gRead(cooked.value); drawTotal(); } });
    const msg = h("div", { class: "err" });
    const total = h("div", { class: "preview" });
    const instr = h("textarea", { rows: 5, placeholder: "Zubereitung, ein Schritt pro Zeile", oninput: () => { draft.instructions = instr.value; } });
    instr.value = draft.instructions || "";
    const source = h("input", { type: "url", placeholder: "https://…", value: draft.source || "", oninput: () => { draft.source = source.value; } });
    const open = draft.items.filter(i => i.matched === false);
    const sum = k => draft.items.reduce((a, i) => a + (i[k] || 0), 0);
    function drawTotal() {
      const p = draft.portions > 0 ? draft.portions : 1;
      const g = draft.cooked_g > 0 ? draft.cooked_g : sum("grams");
      total.replaceChildren(h("div", { class: "muted" }, `Gesamt: ${gText(g)}`),
        h("span", {}, h("b", {}, n0(sum("kcal") / p)), " kcal"), h("span", {}, h("b", {}, n0(sum("carbs") / p)), " g KH"),
        h("span", {}, h("b", {}, n0(sum("fat") / p)), " g Fett"), h("span", {}, h("b", {}, n0(sum("protein") / p)), " g Eiweiß"),
        h("div", { class: "muted" }, `pro Portion (${gText(g / p)})`),
        draft.nutrition && draft.nutrition.kcal ? h("div", { class: "muted" }, `Angabe der Webseite: ${n0(draft.nutrition.kcal)} kcal pro Portion`) : null);
    }
    drawTotal();
    const swap = (idx, title) => setDlg(foodSwapDialog({
      title, grams: idx == null || !draft.items[idx].grams ? null : draft.items[idx].grams, confirm: idx == null ? "Hinzufügen" : "Tauschen",
      onCancel: () => editRecipe(r, draft),
      onDone: (f, g) => { if (idx == null) draft.items.push(foodItem(f, g)); else draft.items[idx] = foodItem(f, g); editRecipe(r, draft); },
    }));
    const rows = draft.items.map((it, idx) => {
      const kc = h("span", { class: "muted" }, `${n0(it.kcal)} kcal`);
      const g = h("input", { type: "number", step: "any", min: gMin(), style: "width:80px;flex:none", value: gShow(it.grams), onchange: () => {
        const ng = gRead(g.value);
        if (!(ng > 0)) { g.value = gShow(it.grams); return; }
        const k = ng / it.grams;
        for (const key of ["kcal", "protein", "carbs", "fat", "fiber", "sugar", "salt", "sat_fat"]) it[key] = (it[key] || 0) * k;
        it.grams = ng; kc.textContent = `${n0(it.kcal)} kcal`; drawTotal();
      } });
      return h("div", { class: it.matched === false ? "unmatched" : it.source ? "guess" : "" }, h("div", { class: "grow" }, it.name, " ", kc,
        it.text && it.text !== it.name ? h("div", { class: "muted" }, it.text) : null,
        it.source ? h("div", { class: "muted" }, `aus ${it.source === "usda" ? "USDA" : "Open Food Facts"}`) : null), g, mUnit(),
        h("button", { class: "icon edit", title: "Durch anderes Lebensmittel tauschen", "aria-label": "Tauschen", onclick: () => swap(idx, `„${it.name}“ tauschen`) }, "⇄"),
        h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", onclick: () => { draft.items.splice(idx, 1); editRecipe(r, draft); } }, "✕"));
    });
    setDlg(h("h2", {}, r ? "Rezept bearbeiten" : "Neues Rezept"),
      h("label", {}, "Name"), name, h("label", {}, "Kategorie"), category, catList(),
      h("div", { class: "grid" }, h("div", {}, h("label", {}, "Portionen"), portions), h("div", {}, h("label", {}, ozMode() ? "Gewicht fertig (oz, optional)" : "Gewicht fertig (g, optional)"), cooked)),
      h("label", { style: "margin-top:12px" }, "Zutaten"),
      open.length ? h("div", { class: "warn-note" }, open.length === 1
        ? "1 Zutat nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählt sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen."
        : `${open.length} Zutaten nicht zugeordnet (rot): mit ⇄ ein Lebensmittel wählen, sonst zählen sie mit 0 kcal. Mengen ohne Angabe bitte ergänzen.`) : null,
      draft.items.some(i => i.source) ? h("div", { class: "warn-note" }, "Orange Zutaten fehlten in Deinen Lebensmitteln und wurden aus Online-Datenbanken ergänzt (Richtwerte, bitte prüfen).") : null,
      h("div", { class: "list" }, rows.length ? rows : [h("div", { class: "muted" }, "Noch keine Zutaten.")]),
      h("button", { class: "flat", onclick: () => swap(null, "Zutat hinzufügen") }, "+ Zutat"),
      total, h("label", {}, "Zubereitung"), instr, h("label", {}, "Quelle"), source, shareBox(draft, r), msg,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
        h("button", { onclick: async () => {
          const body = { name: draft.name, category: draft.category, portions: draft.portions || 0, cooked_g: draft.cooked_g || null,
            source: draft.source || "", instructions: draft.instructions || "",
            items: draft.items.map(i => ({ name: i.name, grams: i.grams, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat,
              fiber: i.fiber || 0, sugar: i.sugar || 0, salt: i.salt || 0, sat_fat: i.sat_fat || 0 })) };
          if (state.features.household && (!r || r.mine !== false)) body.shared = draft.shared || 0;
          try { await send(r ? "PUT" : "POST", "recipes" + (r ? "/" + r.id : ""), body); dlg.close(); renderRecipes(); }
          catch (e) { msg.textContent = e.message; }
        } }, "Speichern")));
    if (!dlg.open) dlg.showModal();
  };

  // Read a recipe from a web page: the server returns a draft with ingredients matched against the library, which opens in the editor.
  const importDialog = () => {
    const url = h("input", { type: "url", placeholder: "https://www.beispiel.de/rezept", autofocus: true });
    const msg = h("div", { class: "err" });
    const go = h("button", { onclick: async () => {
      msg.textContent = ""; go.disabled = true; go.textContent = "Lade …";
      try { editRecipe(null, await send("POST", "recipes/import-url", { url: url.value })); }
      catch (e) { msg.textContent = e.message; go.disabled = false; go.textContent = "Importieren"; }
    } }, "Importieren");
    setDlg(h("h2", {}, "Rezept von Webseite"),
      h("div", { class: "muted" }, "Die Seite wird vom Add-on abgerufen und nach Rezeptdaten durchsucht (Zutaten, Portionen, Zubereitung). Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird."),
      h("label", {}, "Adresse der Rezeptseite"), url, msg,
      h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"), go));
    dlg.showModal();
  };

  // Pasted recipe text (title, ingredients, steps) becomes a draft in the editor.
  const textDialog = () => {
    const text = h("textarea", { rows: 12, autofocus: true });
    const msg = h("div", { class: "err" });
    const go = h("button", { onclick: async () => {
      msg.textContent = ""; go.disabled = true; go.textContent = "Lade …";
      try { editRecipe(null, await send("POST", "recipes/import-text", { text: text.value })); }
      catch (e) { msg.textContent = e.message; go.disabled = false; go.textContent = "Importieren"; }
    } }, "Importieren");
    setDlg(h("h2", {}, "Rezept aus Text"),
      h("div", { class: "muted" }, "Füge ein Rezept als Text ein: erst der Titel, dann die Zutaten (eine pro Zeile, mit Menge) und die Zubereitung. Überschriften wie „Zutaten“ und „Zubereitung“ helfen. Die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird."),
      h("label", {}, "Rezepttext"), text, msg,
      h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"), go));
    dlg.showModal();
  };

  // Pick a recipe from the user's Mealie server (searchable list); the chosen one opens in the editor as a draft.
  const mealieDialog = () => {
    const q = h("input", { type: "search", placeholder: "In Mealie suchen…", autofocus: true });
    const msg = h("div", { class: "err" });
    const list = h("div", { class: "list" });
    const more = h("button", { class: "flat", style: "display:none" }, "Weitere laden");
    let page = 1, timer = null, seq = 0;
    const pick = async (it, btn) => {
      msg.textContent = ""; btn.disabled = true;
      try { editRecipe(null, await send("POST", "mealie/import", { slug: it.slug })); }
      catch (e) { msg.textContent = e.message; btn.disabled = false; }
    };
    const load = async (append) => {
      const my = ++seq;
      msg.textContent = "";
      try {
        const res = await api(`mealie/recipes?q=${encodeURIComponent(q.value.trim())}&page=${page}`);
        if (my !== seq) return;
        const rows = res.items.map(it => { const b = h("button", { class: "flat", onclick: () => pick(it, b) }, "Übernehmen");
          return h("div", {}, h("div", { class: "grow" }, it.name, it.servings ? h("div", { class: "muted" }, `${n1(it.servings)} Portionen`) : null), b); });
        if (append) list.append(...rows); else list.replaceChildren(...(rows.length ? rows : [h("div", { class: "muted" }, "Nichts gefunden.")]));
        more.style.display = res.page * res.per_page < res.total ? "" : "none";
      } catch (e) { if (my === seq) msg.textContent = e.message; }
    };
    q.oninput = () => { clearTimeout(timer); timer = setTimeout(() => { page = 1; load(false); }, 300); };
    more.onclick = () => { page++; load(true); };
    setDlg(h("h2", {}, "Rezept aus Mealie"),
      h("div", { class: "muted" }, "Das Rezept wird aus Deinem Mealie-Server gelesen, die Zutaten werden Deinen Lebensmitteln zugeordnet; Du prüfst alles, bevor es gespeichert wird. In Mealie wird nichts verändert."),
      q, msg, list, more,
      h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
    dlg.showModal();
    load(false);
  };

  const draw = () => {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
    const q = search.value.toLowerCase();
    const shown = recipes.filter(isVisible).filter(r => r.name.toLowerCase().includes(q));
    list.replaceChildren(...(shown.length ? shown.map(r => h("div", {},
      h("div", { class: "grow" }, h("div", {}, r.name, r.mine === false ? sharedFrom(r) : [tag(r.category), sharedMark(r)]),
        h("div", { class: "muted" }, `Pro Portion (${gText(r.portion_g)}): ${n0(r.portion.kcal)} kcal · KH ${n1(r.portion.carbs)} g · Fett ${n1(r.portion.fat)} g · Eiweiß ${n1(r.portion.protein)} g · ${n1(r.portions)} Portionen`),
        h("div", { class: "muted" }, r.items.map(i => `${i.name} ${gText(i.grams)}`).join(" · ")),
        r.instructions ? h("details", {}, h("summary", { class: "muted" }, "Zubereitung"), h("ol", { class: "steps" }, ...r.instructions.split("\n").filter(x => x.trim()).map(x => h("li", {}, x)))) : null,
        /^https?:\/\//.test(r.source || "") ? h("div", { class: "muted" }, h("a", { href: r.source, target: "_blank", rel: "noopener noreferrer" }, new URL(r.source).hostname.replace(/^www\./, ""))) : null),
      h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", disabled: !r.food_id, onclick: () => triggerDialog({ item: "f:" + r.food_id }) }, "⚡"),
      !canEdit(r) ? null : h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => editRecipe(r) }, "✎"),
      h("button", { class: "icon", title: "Kopie anlegen", "aria-label": "Kopieren", onclick: async () => {
        const { id } = await send("POST", `recipes/${r.id}/copy`);
        await renderRecipes();
        const copy = (await api("recipes")).find(x => x.id === id);
        if (copy) editRecipe(copy);
      } }, "⧉"),
      r.mine === false ? null : h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`Rezept „${r.name}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.`)) return;
        await api("recipes/" + r.id, { method: "DELETE" }); renderRecipes();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, recipes.length ? "Nichts gefunden." : "Noch kein Rezept angelegt.")]));
  };

  const search = h("input", { type: "search", placeholder: "Rezepte suchen…", oninput: draw });
  root.append(h("div", { class: "card" },
    h("div", { class: "grid", style: `grid-template-columns:1fr auto auto auto${mealieCfg?.token_set ? " auto" : ""}` }, search, h("button", { onclick: () => editRecipe(null) }, "+ Neues Rezept"),
      h("button", { class: "flat", onclick: importDialog }, "Von Webseite …"),
      h("button", { class: "flat", onclick: textDialog }, "Aus Text …"),
      mealieCfg?.token_set ? h("button", { class: "flat", onclick: mealieDialog }, "Aus Mealie …") : null),
    h("div", { class: "muted", style: "margin-top:8px" }, "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel."),
    chips, list));
  if (state.features.shopping) root.append(h("div", { class: "hint" }, h("button", { class: "flat", onclick: shoppingDialog }, "Einkaufsliste")));
  draw();
}

// Show the Rezepte tab only when the feature is on.
function applyTabs() {
  const t = document.querySelector('#tabs [data-tab="recipes"]');
  if (t) t.hidden = !state.features.recipes;
  if (!state.features.recipes && state.tab === "recipes") show("settings");
}

// ---------------------------------------------------------------- weight
async function renderWeight() {
  const [all, goal] = await Promise.all([api("weights"), api("goal")]);
  const root = $("#weight");
  root.replaceChildren();

  const day = h("input", { type: "date", value: iso(new Date()) });
  const kg = h("input", { type: "number", step: "0.1", min: Math.round(wConv(20)), max: Math.round(wConv(500)), placeholder: "z. B. 78,5" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Gewicht eintragen"),
    h("div", { class: "grid" },
      h("div", {}, h("label", {}, "Datum"), day),
      h("div", {}, h("label", {}, `Gewicht (${wUnit()})`), kg),
      h("button", { onclick: async () => {
        if (!(num(kg.value) > 0) || !day.value) return;
        await send("PUT", "weights/" + day.value, { kg: Math.round(wIn(num(kg.value)) * 100) / 100 });
        renderWeight();
      } }, "Speichern"))));

  if (!all.length) {
    root.append(h("div", { class: "card muted" }, "Noch keine Gewichtswerte."));
    if (state.features.body) await bodyCards(root);
    return;
  }
  const trended = withTrend(all);
  const since = state.wrange ? iso(new Date(Date.now() - state.wrange * 864e5)) : "";
  const pts = trended.filter(p => p.day >= since);
  const shown = pts.length ? pts : trended.slice(-1);
  const last = all[all.length - 1];
  const fc = forecast(trended, goal.target_weight);
  const delta = shown.length > 1 ? last.kg - shown[0].kg : null;
  const tile = (label, value) => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", {}, value));

  const chart = h("div");
  chart.innerHTML = lineChart(shown.map(p => ({ ...p, kg: wConv(p.kg), trend: wConv(p.trend) })), goal.target_weight ? wConv(goal.target_weight) : null, wUnit());
  tipHandlers(chart);
  root.append(
    h("div", { class: "stat-tiles" },
      tile("Aktuell", n1(wConv(last.kg)) + " " + wUnit()),
      tile("Trend", n1(wConv(trended[trended.length - 1].trend)) + " " + wUnit()),
      tile("Veränderung", delta == null ? "–" : (delta > 0 ? "+" : "") + n1(wConv(delta)) + " " + wUnit()),
      tile("Ziel", goal.target_weight ? n1(wConv(goal.target_weight)) + " " + wUnit() : "–"),
      goal.target_weight ? tile("Prognose Ziel", fc ? fc.text : "–") : null),
    h("div", { class: "card" },
      rangeButtons([[30, "30 Tage"], [90, "90 Tage"], [365, "1 Jahr"], [0, "Alle"]], state.wrange,
        v => { state.wrange = v; renderWeight(); }),
      chart,
      h("div", { class: "muted" }, "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet).",
        fc && fc.perWeek != null ? h("span", {}, ` Trend aktuell ${fc.perWeek > 0 ? "+" : ""}${n1(wConv(fc.perWeek))} ${wUnit()}/Woche.`) : null)),
    h("div", { class: "card" }, h("h2", {}, "Verlauf"),
      h("div", { class: "list" }, [...all].reverse().slice(0, state.whist).map(p => h("div", {},
        h("span", { class: "grow" }, parse(p.day).toLocaleDateString(I18N.locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" })),
        h("b", {}, n1(wConv(p.kg)) + " " + wUnit()),
        h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
          await api("weights/" + p.day, { method: "DELETE" }); renderWeight();
        } }, "✕")))),
      all.length > 10 ? h("div", { class: "actions", style: "justify-content:flex-start" },
        all.length > state.whist ? [
          h("button", { class: "flat", onclick: () => { state.whist += 20; renderWeight(); } }, "Mehr anzeigen"),
          h("button", { class: "flat", onclick: () => { state.whist = all.length; renderWeight(); } }, `Alle ${all.length}`)] : null,
        state.whist > 10 ? h("button", { class: "flat", onclick: () => { state.whist = 10; renderWeight(); } }, "Weniger") : null) : null));
  if (state.features.body) await bodyCards(root);
}

// ---------------------------------------------------------------- body measurements and photos (optional)
const BODY_NAMES = ["Taille", "Brust", "Hüfte", "Oberarm", "Oberschenkel", "Körperfett %"];
const bodyUnit = name => (name.includes("%") ? "%" : imperial() ? "in" : "cm");
const lenConv = (v, name) => (name.includes("%") || !imperial() ? v : v / CM_IN);   // stored value -> shown
const lenIn = (v, name) => (name.includes("%") || !imperial() ? v : v * CM_IN);     // typed value -> stored

// Scale a picked image down (long side 1280 px) and return it as a JPEG data URL.
function resizeImage(file, max = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      resolve(cv.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Bild konnte nicht gelesen werden")); };
    img.src = url;
  });
}

async function bodyCards(root) {
  const [rows, photos] = await Promise.all([api("body"), api("body/photos")]);
  const names = [...new Set([...BODY_NAMES, ...rows.map(r => r.name)])];
  const day = h("input", { type: "date", value: iso(new Date()) });
  const inputs = names.map(n => [n, h("input", { type: "number", step: "0.1", min: "0", placeholder: bodyUnit(n) })]);
  const extraName = h("input", { placeholder: "Eigene Messung, z. B. Wade" });
  const extraVal = h("input", { type: "number", step: "0.1", min: "0", placeholder: imperial() ? "in" : "cm" });
  const msg = h("div", { class: "err" });
  const pick = state.bodyPick && names.includes(state.bodyPick) ? state.bodyPick : (rows[0] ? rows[rows.length - 1].name : names[0]);
  const sel = h("select", { onchange: () => { state.bodyPick = sel.value; renderWeight(); } }, names.map(n => h("option", { value: n }, n)));
  sel.value = pick;

  const series = rows.filter(r => r.name === pick);
  const chart = h("div");
  if (series.length) { chart.innerHTML = lineChart(series.map(r => ({ day: r.day, kg: lenConv(r.value, r.name), trend: lenConv(r.value, r.name) })), null, bodyUnit(pick)); tipHandlers(chart); }
  const first = series[0], last = series[series.length - 1];

  root.append(h("div", { class: "card" }, h("h2", {}, "Körpermaße"),
    h("div", { class: "muted" }, "Werte, die Du nicht messen willst, einfach leer lassen."),
    h("label", {}, "Datum"), day,
    h("div", { class: "grid body-grid" }, inputs.map(([n, i]) => h("div", {}, h("label", {}, n), i))),
    h("div", { class: "grid" }, h("div", {}, h("label", {}, "Weitere Messung"), extraName), h("div", {}, h("label", {}, "Wert"), extraVal)),
    msg,
    h("div", { class: "actions" }, h("button", { onclick: async () => {
      const values = {};
      for (const [n, i] of inputs) if (num(i.value) > 0) values[n] = Math.round(lenIn(num(i.value), n) * 100) / 100;
      if (extraName.value.trim() && num(extraVal.value) > 0) values[extraName.value.trim()] = Math.round(lenIn(num(extraVal.value), "x") * 100) / 100;
      if (!Object.keys(values).length) { msg.textContent = "Bitte mindestens einen Wert eintragen."; return; }
      try { await send("PUT", "body/" + day.value, { values }); renderWeight(); } catch (e) { msg.textContent = e.message; }
    } }, "Speichern"))));

  if (rows.length) root.append(h("div", { class: "card" },
    h("div", { class: "grid", style: "grid-template-columns:1fr auto" }, sel,
      series.length > 1 ? h("b", { style: "align-self:center" }, `${last.value > first.value ? "+" : ""}${n1(lenConv(last.value - first.value, pick))} ${bodyUnit(pick)}`) : h("span")),
    series.length ? chart : h("div", { class: "muted" }, "Noch keine Werte für diese Messung."),
    h("div", { class: "list" }, [...series].reverse().slice(0, 8).map(r => h("div", {},
      h("span", { class: "grow" }, longDate(r.day)), h("b", {}, `${n1(lenConv(r.value, pick))} ${bodyUnit(pick)}`),
      h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        await api(`body/values/${r.day}/${encodeURIComponent(r.name)}`, { method: "DELETE" }); renderWeight();
      } }, "✕"))))));

  // photos: stored only on this device's add-on, not part of the JSON export
  const file = h("input", { type: "file", accept: "image/*", hidden: true, onchange: async () => {
    if (!file.files[0]) return;
    try {
      const data = await resizeImage(file.files[0]);
      await send("POST", "body/photos", { day: pday.value, note: pnote.value, data });
      renderWeight();
    } catch (e) { pmsg.textContent = e.message; }
  } });
  const pday = h("input", { type: "date", value: iso(new Date()) });
  const pnote = h("input", { placeholder: "Notiz (optional), z. B. Vorderansicht" });
  const pmsg = h("div", { class: "err" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Fortschrittsfotos"),
    h("div", { class: "muted" }, "Die Fotos bleiben im Add-on auf Deinem Home Assistant. Sie sind nicht im JSON-Export und nicht in den automatischen Sicherungen, aber in der Home-Assistant-Sicherung des Add-ons."),
    h("div", { class: "grid" }, h("div", {}, h("label", {}, "Datum"), pday), h("div", {}, h("label", {}, "Notiz"), pnote)),
    pmsg, file,
    h("div", { class: "actions" },
      photos.length > 1 ? h("button", { class: "flat", onclick: () => photoCompare(photos) }, "Vergleichen") : null,
      h("button", { onclick: () => file.click() }, "Foto hinzufügen")),
    photos.length ? h("div", { class: "photo-grid" }, photos.map(p => h("figure", {},
      h("img", { src: `api/body/photos/${p.id}/file`, loading: "lazy", alt: p.note || p.day, onclick: () => photoView(p) }),
      h("figcaption", {}, longDate(p.day), p.note ? h("div", { class: "muted" }, p.note) : null,
        h("button", { class: "icon", title: "Foto löschen", "aria-label": "Löschen", onclick: async () => {
          if (!confirm("Foto löschen?")) return;
          await api("body/photos/" + p.id, { method: "DELETE" }); renderWeight();
        } }, "✕"))))) : h("div", { class: "muted", style: "padding:8px 0" }, "Noch keine Fotos.")));
}

function photoView(p) {
  setDlg(h("h2", {}, longDate(p.day)), h("img", { class: "photo-big", src: `api/body/photos/${p.id}/file`, alt: p.note || p.day }),
    p.note ? h("div", { class: "muted" }, p.note) : null,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  dlg.showModal();
}

// Two photos side by side, e.g. start and now.
function photoCompare(photos) {
  const opts = () => photos.map(p => h("option", { value: p.id }, longDate(p.day) + (p.note ? " – " + p.note : "")));
  const a = h("select", {}, opts()), b = h("select", {}, opts());
  a.value = photos[photos.length - 1].id; b.value = photos[0].id;
  const imgA = h("img", { class: "photo-big" }), imgB = h("img", { class: "photo-big" });
  const draw = () => { imgA.src = `api/body/photos/${a.value}/file`; imgB.src = `api/body/photos/${b.value}/file`; };
  a.onchange = b.onchange = draw; draw();
  setDlg(h("h2", {}, "Fotos vergleichen"),
    h("div", { class: "grid" }, h("div", {}, a, imgA), h("div", {}, b, imgB)),
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  dlg.showModal();
}

// ---------------------------------------------------------------- stats
// Energy balance from weight trend (7700 kcal per kg) and logged intake.
const GOAL_MODES = [["lose", "Abnehmen"], ["maintain", "Halten"], ["gain", "Zunehmen"]];
function balanceCard(b, goal) {
  const tile = (label, value, cls = "") => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", { class: cls }, value));
  if (!b) return h("div", { class: "card" }, h("h2", {}, "Kalorienbilanz"), h("div", { class: "muted" }, "Noch keine Einträge im Zeitraum."));
  const ok = b.balance != null;
  const sign = v => (v > 0 ? "+" : "") + n0(v);
  return h("div", { class: "card" }, h("h2", {}, "Kalorienbilanz"),
    h("div", { class: "stat-tiles" },
      tile("Ø Aufnahme", n0(b.intake) + " kcal"),
      tile("Gewichtstrend", ok ? (b.kg_per_week > 0 ? "+" : "") + n1(wConv(b.kg_per_week)) + " " + wUnit() + "/Woche" : "–"),
      tile(ok ? (b.balance > 0 ? "Überschuss / Tag" : "Defizit / Tag") : "Bilanz / Tag",
        ok ? sign(b.balance) + " kcal" : "–", ok ? (b.balance > 0 ? "over" : "under") : ""),
      tile("Geschätzter Verbrauch", ok ? n0(b.tdee) + " kcal" : "–")),
    ok ? goalAdvice(b, goal) : null,
    h("div", { class: "muted" }, ok
      ? `Aus ${b.weights} Gewichtswerten und ${b.logged_days} von ${b.range_days} erfassten Tagen (1 ${wUnit()} ≈ ${imperial() ? 3500 : 7700} kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.`
      : "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum."));
}

// Compares the weight trend with the chosen aim (lose / maintain / gain) and suggests a calorie goal.
function goalAdvice(b, goal) {
  const mode = state.goalMode, rate = mode === "maintain" ? 0 : state.goalRate;
  const want = mode === "lose" ? -rate : mode === "gain" ? rate : 0;
  const label = GOAL_MODES.find(m => m[0] === mode)[1];
  const diff = b.kg_per_week - want;
  const tol = mode === "maintain" ? 0.15 : 0.15;
  const verdict = Math.abs(diff) <= tol ? "Du liegst im Plan." : diff > 0 ? "Der Trend liegt über dem Ziel." : "Der Trend liegt unter dem Ziel.";
  const sugg = Math.max(1200, Math.round((b.tdee + want * 1100) / 10) * 10);   // never suggest crash diets
  const sign = v => (v > 0 ? "+" : "") + n1(v);
  return h("div", { class: "advice" },
    h("div", {}, h("b", {}, `Ziel: ${label}`), mode === "maintain" ? " (Gewicht halten)" : ` (${sign(wConv(want))} ${wUnit()}/Woche)`, ` · Trend aktuell ${sign(wConv(b.kg_per_week))} ${wUnit()}/Woche. ${verdict}`),
    Math.abs(sugg - (goal.kcal || 0)) >= 50 ? h("div", { class: "actions", style: "justify-content:flex-start;align-items:center" },
      h("span", {}, `Für dieses Ziel passen ca. ${n0(sugg)} kcal am Tag (Dein Ziel: ${goal.kcal ? n0(goal.kcal) : "–"}).`),
      h("button", { class: "flat", onclick: async () => {
        await send("PUT", "goal", { kcal: sugg, carbs: goal.carbs || 0, fat: goal.fat || 0, protein: goal.protein || 0, target_weight: goal.target_weight });
        renderStats();
      } }, "Als Tagesziel übernehmen")) : null);
}

// Nutrient gaps (optional "More nutrients"): average of the last 7 days against everyday reference goals.
async function microGapsCard() {
  let r;
  try { r = await api("micros/gaps"); } catch { return null; }
  if (!r.logged) return null;
  const label = Object.fromEntries(MICROS.map(([k, name]) => [k, name]));
  const line = i => {
    const name = label[i.key];
    if (i.status === "unknown") return h("div", { class: "muted" }, h("b", {}, name), " ", "nicht genug Angaben");
    const text = i.kind === "min"
      ? (i.status === "ok" ? `Ø ${n1(i.avg)} g (mind. ${n1(i.goal)} g) – im Ziel` : `Ø ${n1(i.avg)} g (mind. ${n1(i.goal)} g) – ${Math.abs(i.delta_pct)} % unter dem Ziel`)
      : (i.status === "ok" ? `Ø ${n1(i.avg)} g (höchstens ${n1(i.goal)} g) – im Ziel` : `Ø ${n1(i.avg)} g (höchstens ${n1(i.goal)} g) – ${i.delta_pct} % über dem Ziel`);
    return h("div", { class: i.status === "ok" ? "" : "over" }, h("b", {}, name), " ", text);
  };
  const edit = async () => {
    const g = { ...r.goals };
    const fields = MICROS.map(([k, name]) => [k, h("input", { type: "number", step: "0.1", min: "0.1", value: g[k], onchange: e => { g[k] = Number(e.target.value) || g[k]; } }), name]);
    const msg = h("div", { class: "err" });
    setDlg(h("h2", {}, "Ziele für weitere Nährwerte"),
      h("div", { class: "muted" }, "Richtwerte pro Tag in g. Ballaststoffe sollen erreicht werden, bei Zucker, Salz und gesättigten Fettsäuren ist es eine Obergrenze."),
      ...fields.flatMap(([, input, name]) => [h("label", {}, name), input]), msg,
      h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
        h("button", { onclick: async () => {
          try { await send("PUT", "micros/goals", g); dlg.close(); renderStats(); } catch (e) { msg.textContent = e.message; }
        } }, "Speichern")));
    dlg.showModal();
  };
  return h("div", { class: "card" }, h("h2", {}, "Nährwert-Lücken (7 Tage)"),
    h("div", { class: "muted" }, `Durchschnitt der letzten 7 Tage (nur Tage mit Angaben) gegen Richtwerte; ${r.logged} von ${r.days} Tagen erfasst.`),
    h("div", { class: "list" }, r.items.map(line)),
    h("div", { class: "actions", style: "justify-content:flex-start" }, h("button", { class: "flat", onclick: edit }, "Ziele ändern")));
}

async function renderStats() {
  const [{ days, goal, balance }, weights, trk] = await Promise.all([api("stats?days=" + state.range), api("weights?days=" + state.range),
    state.features.trackers ? api("trackers/stats?days=" + state.range) : []]);
  const root = $("#stats");
  root.replaceChildren();
  const logged = days.filter(d => d.logged);
  const avg = k => logged.length ? logged.reduce((a, d) => a + d[k], 0) / logged.length : 0;
  const tile = (label, value) => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", {}, value));

  const kc = { p: avg("protein") * 4, c: avg("carbs") * 4, f: avg("fat") * 9 };
  const total = kc.p + kc.c + kc.f || 1;
  const pct = v => Math.round(v / total * 100);

  const chart = h("div");
  chart.innerHTML = barChart(days, goal.kcal);
  tipHandlers(chart);
  const combo = h("div");
  combo.innerHTML = comboChart(days, weights);
  tipHandlers(combo);
  root.append(
    rangeButtons([[7, "7 Tage"], [14, "14 Tage"], [30, "30 Tage"], [90, "90 Tage"], [180, "180 Tage"], [365, "1 Jahr"]], state.range, v => { state.range = v; renderStats(); }),
    h("div", { class: "stat-tiles" },
      tile("Ø Kalorien", logged.length ? n0(avg("kcal")) + " kcal" : "–"),
      tile("Erfasste Tage", `${logged.length} / ${days.length}`),
      tile("Ø Eiweiß", n0(avg("protein")) + " g"),
      tile("Ø Kohlenhydrate", n0(avg("carbs")) + " g"),
      tile("Ø Fett", n0(avg("fat")) + " g"),
      tile("Gewicht", weights.length > 1
        ? ((d => (d > 0 ? "+" : "") + n1(wConv(d)) + " " + wUnit())(weights[weights.length - 1].kg - weights[0].kg)) : "–")),
    h("div", { class: "card" }, h("h2", {}, "Kalorien pro Tag"), chart,
      goal.kcal ? h("div", { class: "muted" }, days.some(d => d.goal_kcal !== goal.kcal) ? "Gestrichelt: Tagesziel je Wochentag" : `Gestrichelt: Tagesziel ${n0(goal.kcal)} kcal`) : null),
    h("div", { class: "card" }, h("h2", {}, "Kalorien und Gewicht"),
      weights.some(w => w.day >= days[0].day) ? [combo, h("div", { class: "legend" },
        h("span", { style: "--c:var(--primary-color)" }, "Kalorien (linke Achse)"), h("span", { style: "--c:var(--info-color)" }, "Gewicht und Trend (rechte Achse)"))]
        : h("div", { class: "muted" }, "Noch keine Gewichtswerte im Zeitraum.")),
    balanceCard(balance, goal),
    macroCard(days),
    h("div", { class: "card" }, h("h2", {}, "Nährwertverteilung (Ø)"),
      h("div", { class: "macro-split" },
        h("i", { style: `width:${pct(kc.p)}%` }), h("i", { style: `width:${pct(kc.c)}%` }), h("i", { style: `width:${pct(kc.f)}%` })),
      h("div", { class: "legend" },
        h("span", { style: "--c:var(--info-color)" }, `Eiweiß ${logged.length ? pct(kc.p) : 0} %`),
        h("span", { style: "--c:var(--warning-color)" }, `Kohlenhydrate ${logged.length ? pct(kc.c) : 0} %`),
        h("span", { style: "--c:var(--error-color)" }, `Fett ${logged.length ? pct(kc.f) : 0} %`))));
  if (state.features.micros && logged.length) root.append(h("div", { class: "card" }, h("h2", {}, "Weitere Nährwerte (Ø pro Tag)"),
    h("div", { class: "stat-tiles" }, MICROS.map(([k, label, u]) => tile(label, `${n1(avg(k))} ${u}`)))));
  if (state.features.micros) { const gc = await microGapsCard(); if (gc) root.append(gc); }
  root.append(compareCard());
  if (trk.some(t => t.logged)) {
    const fmt = v => (Math.round(v * 10) / 10).toLocaleString(I18N.locale);
    root.append(h("div", { class: "card" }, h("h2", {}, "Wasser & Ergänzungen"),
      h("table", { class: "summary" },
        h("thead", {}, h("tr", {}, h("th"), h("th", {}, "Ø pro Tag"), h("th", {}, "Eingetragen"), h("th", {}, "Ziel erreicht"))),
        h("tbody", {}, trk.filter(t => t.logged).map(t => h("tr", {}, h("th", {}, t.name),
          h("td", {}, `${fmt(t.avg)} ${t.unit}`), h("td", {}, `${t.logged} / ${t.days} Tage`),
          h("td", {}, t.goal ? `${t.reached} / ${t.days} Tage` : "–")))))));
  }
}

// Report for one period, or two periods side by side with the difference (week report, diet phase 1 vs 2, ...).
function compareCard() {
  const span = n => { const t = new Date(); const f = new Date(); f.setDate(t.getDate() - n + 1); return [iso(f), iso(t)]; };
  const before = (f, n) => { const e = parse(f); e.setDate(e.getDate() - 1); const s = new Date(e); s.setDate(e.getDate() - n + 1); return [iso(s), iso(e)]; };
  const preset = n => { const [f, t] = span(n); const [bf, bt] = before(f, n); return { a_from: f, a_to: t, b_from: bf, b_to: bt }; };
  state.cmp = state.cmp || preset(7);
  const body = h("div");
  const NAMES = { a_from: "Zeitraum A, von", a_to: "Zeitraum A, bis", b_from: "Zeitraum B, von", b_to: "Zeitraum B, bis" };
  const field = (key) => h("input", { type: "date", value: state.cmp[key], "aria-label": NAMES[key], onchange: e => { if (e.target.value) { state.cmp[key] = e.target.value; load(); } } });
  const inputsNew = () => h("div", { class: "cmp-range" }, ...[["A", "a_from", "a_to"], ["B", "b_from", "b_to"]].flatMap(([l, f, t]) =>
    [h("span", { class: "muted" }, l), field(f), "–", field(t)]));
  const wrap = h("div", { class: "card" }, h("h2", {}, "Bericht & Zeitraum-Vergleich"),
    h("div", { class: "range" },
      h("button", { onclick: () => { state.cmp = preset(7); card(); } }, "7 Tage vs. davor"),
      h("button", { onclick: () => { state.cmp = preset(30); card(); } }, "30 Tage vs. davor")),
    h("div", { class: "cmp-inputs" }), body);
  const card = () => {
    wrap.querySelector(".cmp-inputs").replaceChildren(inputsNew());
    load();
  };
  const load = async () => {
    const q = new URLSearchParams(state.cmp);
    let r;
    try { r = await api("report?" + q); } catch (e) { body.textContent = e.message; return; }
    const [A, B] = r;
    const fmtD = d => parse(d).toLocaleDateString(I18N.locale, { day: "numeric", month: "short" });
    const rows = [
      ["Ø Kalorien", p => n0(p.kcal) + " kcal", p => p.kcal, true],
      ["Ø Eiweiß", p => n0(p.protein) + " g", p => p.protein, false],
      ["Ø Kohlenhydrate", p => n0(p.carbs) + " g", p => p.carbs, true],
      ["Ø Fett", p => n0(p.fat) + " g", p => p.fat, true],
      ["Eiweißziel erreicht", p => p.protein_goal_days ? `${p.protein_days} / ${p.protein_goal_days} Tage` : "–", p => p.protein_goal_days ? p.protein_days / p.protein_goal_days * 100 : null, false, "pp"],
      ["Kalorien im Ziel", p => p.kcal_goal_days ? `${p.kcal_days} / ${p.kcal_goal_days} Tage` : "–", p => p.kcal_goal_days ? p.kcal_days / p.kcal_goal_days * 100 : null, false, "pp"],
      ["Erfasste Tage", p => `${p.logged} / ${p.days}`, p => p.logged, false],
      ["Gewichtsänderung", p => p.weight_change == null ? "–" : (p.weight_change > 0 ? "+" : "") + n1(wConv(p.weight_change)) + " " + wUnit(), p => p.weight_change, true, "kg"],
    ];
    const diff = (row, a, b) => {
      const x = row[2](a), y = row[2](b);
      if (x == null || y == null) return "";
      const d = x - y;
      return (d > 0 ? "+" : "") + (row[4] === "kg" ? n1(wConv(d)) + " " + wUnit() : row[4] === "pp" ? n0(d) + " %-Pkt." : n0(d));
    };
    const day = (p, k) => p[k] ? `${fmtD(p[k].day)} (${n0(p[k].kcal)} / ${n0(p[k].goal)} kcal)` : "–";
    body.replaceChildren(
      h("table", { class: "summary cmp" },
        h("thead", {}, h("tr", {}, h("th"), h("th", {}, `${fmtD(A.from)} – ${fmtD(A.to)}`), B ? h("th", {}, `${fmtD(B.from)} – ${fmtD(B.to)}`) : null, B ? h("th", {}, "Differenz") : null)),
        h("tbody", {}, rows.map(row => h("tr", {}, h("th", {}, row[0]), h("td", {}, row[1](A)),
          B ? h("td", {}, row[1](B)) : null, B ? h("td", {}, diff(row, A, B)) : null)))),
      h("div", { class: "muted", style: "margin-top:8px" }, `Bester Tag (A): ${day(A, "best")} · Schwächster Tag (A): ${day(A, "worst")}`));
  };
  queueMicrotask(card);
  return wrap;
}

// ---------------------------------------------------------------- triggers
const KIND = { state: "Zustand", calendar: "Kalender", time: "Uhrzeit" };
const PART = { start: " (am Starttag)", end: " (am Endtag)" };
const condBase = t => (t.kind === "time" ? `Täglich ab ${t.match} Uhr`
  : `${KIND[t.kind]} ${t.entity} ${t.negate ? (t.kind === "calendar" ? "enthält nicht" : "≠") : (t.kind === "calendar" ? "enthält" : "=")} ${t.match || "(an)"}${t.kind === "calendar" ? PART[t.part] || "" : ""}`)
  + (t.hold_min ? ` · seit mind. ${t.hold_min} Min.` : "")
  + (t.win_from || t.win_to ? ` · nur ${t.win_from || "00:00"}–${t.win_to || "24:00"} Uhr` : "");

const condText = t => condBase(t) + ((t.extra || []).length ? ` ${t.combine === "or" ? "ODER" : "UND"} `
  + t.extra.map(x => `${x.entity} ${x.negate ? "≠" : "="} ${x.match || "(an)"}`).join(t.combine === "or" ? " ODER " : " UND ") : "");

const paused = t => t.paused_until && t.paused_until >= iso(new Date());

// Pause a trigger for a while (it keeps its settings and resumes by itself).
function pauseDialog(t) {
  const set = async until => { await send("PUT", `triggers/${t.id}/pause`, { until }); dlg.close(); renderSettings(); };
  const ahead = n => { const d = new Date(); d.setDate(d.getDate() + n - 1); return iso(d); };
  const until = h("input", { type: "date", value: ahead(7) });
  setDlg(h("h2", {}, "Trigger pausieren"), h("div", { class: "muted" }, condText(t)),
    paused(t) ? h("div", { class: "actions", style: "justify-content:flex-start" }, h("button", { onclick: () => set("") }, "Pause beenden")) : null,
    h("div", { class: "range" },
      [[1, "Heute"], [3, "3 Tage"], [7, "1 Woche"], [30, "30 Tage"]].map(([n, l]) => h("button", { onclick: () => set(ahead(n)) }, l))),
    h("label", {}, "Oder bis einschließlich"), until,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: () => until.value && set(until.value) }, "Pausieren")));
  dlg.showModal();
}

// Shared form part: trigger kind (state / calendar), entity with suggestions, condition text.
function triggerFields(ents, allowTime = false) {
  const kind = h("select", { onchange: sync },
    h("option", { value: "state" }, "Zustand einer Entität (z. B. Person ist im Fitnessstudio)"),
    h("option", { value: "calendar" }, "Kalendereintrag"),
    allowTime ? h("option", { value: "time" }, "Uhrzeit (täglich ab einer Zeit)") : null);
  const entity = h("input", { list: "ent-list", placeholder: "z. B. person.max" });
  const entList = h("datalist", { id: "ent-list" });
  const negate = h("select", {},
    h("option", { value: "0" }, "ist / enthält"), h("option", { value: "1" }, "ist NICHT / enthält NICHT"));
  const match = h("input");
  const part = h("select", {},
    h("option", { value: "any" }, "an jedem Tag des Termins"),
    h("option", { value: "start" }, "nur am Starttag (z. B. Donnerstag 22 Uhr)"),
    h("option", { value: "end" }, "nur am Endtag (z. B. Freitag 6 Uhr)"));
  const partRow = h("div", {}, h("label", {}, "Termin zählt"), part);
  const entRow = h("div", {}, h("label", {}, "Entität"), entity, entList);
  const condLabel = h("label", {}, "Bedingung");
  const hint = h("div", { class: "muted" });
  function sync() {
    const cal = kind.value === "calendar", tm = kind.value === "time";
    entRow.hidden = tm; negate.hidden = tm; condLabel.textContent = tm ? "Uhrzeit" : "Bedingung";
    match.type = tm ? "time" : "text";
    entList.replaceChildren(...ents.filter(e => cal ? e.id.startsWith("calendar.") : !e.id.startsWith("calendar."))
      .map(e => h("option", { value: e.id }, e.name || e.state)));
    entity.placeholder = cal ? "z. B. calendar.arbeit" : "z. B. person.max";
    match.placeholder = cal ? "Titel enthält, z. B. Nachtschicht" : "Zustand, z. B. Fitnessstudio (Zonenname) oder on";
    partRow.hidden = !cal;
    hint.textContent = tm ? "Trägt einmal pro Tag ein, sobald diese Uhrzeit erreicht ist."
      : cal ? "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält."
      : "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).";
  }
  sync();
  return { kind, entity, match, negate, part, nodes: [h("label", {}, "Auslöser"), kind, entRow,
    condLabel, negate, match, partRow, hint] };
}

// Show a diary meal only on days where a rule applies (e.g. calendar has "Nachtschicht").
async function mealRuleDialog(meal, rule = null) {
  const ents = await api("ha/entities").catch(() => []);
  const tf = triggerFields(ents);
  if (rule) {
    tf.kind.value = rule.kind; tf.kind.dispatchEvent(new Event("change"));
    tf.entity.value = rule.entity; tf.match.value = rule.match; tf.negate.value = rule.negate ? "1" : "0"; tf.part.value = rule.part || "any";
  }
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, `„${meal.name}“ nur an bestimmten Tagen anzeigen`), tf.nodes,
    h("div", { class: "muted", style: "margin-top:8px" }, "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt."),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!tf.entity.value.trim()) { msg.textContent = "Bitte eine Entität angeben."; return; }
        try {
          await send(rule ? "PUT" : "POST", "meal-triggers" + (rule ? "/" + rule.id : ""),
            { meal_id: meal.id, kind: tf.kind.value, entity: tf.entity.value, match: tf.match.value,
              negate: tf.negate.value === "1", part: tf.kind.value === "calendar" ? tf.part.value : "any" });
          dlg.close(); renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Speichern")));
  dlg.showModal();
}

// Create a trigger: when an HA entity reaches a state / a calendar event is on today,
// an item (saved meal or food) is added to the diary.
async function triggerDialog(preset = {}, onDone = () => {}) {
  const [day, saved, foods, ents, profiles] = await Promise.all([
    api("day/" + state.day), api("saved-meals"), api("foods"), api("ha/entities").catch(() => []),
    state.features.weekday_goals ? api("goal-profiles") : []]);
  const times = day.mode === "times";
  const tf = triggerFields(ents, true);
  const { kind, entity, match } = tf;
  const item = h("select", {},
    h("optgroup", { label: "Gespeicherte Mahlzeiten" }, saved.map(s => h("option", { value: "s:" + s.id }, s.name))),
    h("optgroup", { label: "Lebensmittel" }, foods.map(f => h("option", { value: "f:" + f.id }, f.name))),
    profiles.length ? h("optgroup", { label: "Tagesziel wechseln" }, profiles.map(p => h("option", { value: "p:" + p.id }, `Tagesziel „${p.name}“`))) : null);
  const ed = preset.edit;
  if (preset.item) item.value = preset.item;
  const meal = h("select", {}, day.meals.map(m => h("option", { value: m.id }, m.name)));
  const grams = h("input", { type: "number", step: "any", min: "1", placeholder: "Standardportion" });
  const ahead = h("input", { type: "number", step: "1", min: "0", max: "60", value: "0" });
  const aheadRow = h("div", {}, h("label", {}, "Tage im Voraus eintragen (nur Kalender)"), ahead,
    h("div", { class: "muted" }, "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht."));
  const hold = h("input", { type: "number", step: "1", min: "0", max: "1440", value: "0" });
  const holdRow = h("div", {}, h("label", {}, "Zustand muss schon so lange anliegen (Minuten)"), hold,
    h("div", { class: "muted" }, "0 = sofort. Z. B. 20: erst eintragen, wenn die Person seit 20 Minuten im Fitnessstudio ist."));
  const winFrom = h("input", { type: "time" }), winTo = h("input", { type: "time" });
  const winRow = h("div", {}, h("label", {}, "Nur zwischen (Uhrzeit, optional)"),
    h("div", { class: "grid" }, winFrom, winTo),
    h("div", { class: "muted" }, "Außerhalb dieses Zeitfensters trägt der Trigger nicht ein. Über Mitternacht möglich (22:00 bis 06:00)."));
  const msg = h("div", { class: "err" });
  const mealRow = h("div", {}, h("label", {}, "Zu Mahlzeit im Tagebuch"), meal);
  const gramsRow = h("div", {}, h("div", { class: "muted" }, "Bei Lebensmitteln optional mit Menge:"), grams);
  const syncItem = () => { const prof = item.value.startsWith("p:"); mealRow.hidden = prof; gramsRow.hidden = prof; };
  item.addEventListener("change", syncItem);
  // further conditions, combined with the main one by AND / OR
  const extras = ((preset.edit && preset.edit.extra) || []).map(x => ({ ...x }));
  const combine = h("select", {}, h("option", { value: "and" }, "Alle Bedingungen müssen zutreffen (UND)"),
    h("option", { value: "or" }, "Mindestens eine muss zutreffen (ODER)"));
  const allEnts = h("datalist", { id: "ent-all" }, ents.map(e => h("option", { value: e.id }, e.name || e.state)));
  const exBox = h("div", {});
  const combineRow = h("div", {}, h("label", {}, "Verknüpfung"), combine);
  const drawExtras = () => {
    exBox.replaceChildren(...extras.map((x, i) => {
      const k = h("select", { onchange: () => { x.kind = k.value; } }, h("option", { value: "state" }, "Zustand"), h("option", { value: "calendar" }, "Kalender"));
      k.value = x.kind;
      const n = h("select", { onchange: () => { x.negate = n.value === "1"; } }, h("option", { value: "0" }, "ist / enthält"), h("option", { value: "1" }, "ist NICHT / enthält NICHT"));
      n.value = x.negate ? "1" : "0";
      return h("div", { class: "extra-cond" },
        h("div", { class: "grid" }, k, n),
        h("input", { list: "ent-all", placeholder: "Entität, z. B. person.anna", value: x.entity, oninput: e => { x.entity = e.target.value; } }),
        h("input", { placeholder: "Zustand bzw. Titel enthält (leer = an)", value: x.match || "", oninput: e => { x.match = e.target.value; } }),
        h("button", { class: "flat", onclick: () => { extras.splice(i, 1); drawExtras(); } }, "Bedingung entfernen"));
    }));
    combineRow.hidden = !extras.length;
  };
  drawExtras();
  const syncAhead = () => { aheadRow.hidden = kind.value !== "calendar"; holdRow.hidden = kind.value !== "state"; };
  kind.addEventListener("change", syncAhead);
  syncAhead();
  if (ed) {
    kind.value = ed.kind; kind.dispatchEvent(new Event("change"));
    entity.value = ed.entity; match.value = ed.match; tf.negate.value = ed.negate ? "1" : "0"; tf.part.value = ed.part || "any";
    item.value = (ed.saved_meal_id ? "s:" + ed.saved_meal_id : ed.profile_id ? "p:" + ed.profile_id : "f:" + ed.food_id);
    combine.value = ed.combine || "and";
    if (ed.meal_id) meal.value = ed.meal_id; grams.value = ed.grams ?? ""; ahead.value = ed.days_ahead || 0;
    hold.value = ed.hold_min || 0; winFrom.value = ed.win_from || ""; winTo.value = ed.win_to || "";
  }

  syncItem();
  setDlg(h("h2", {}, ed ? "Trigger bearbeiten" : "Neuer Trigger"),
    tf.nodes,
    exBox, h("button", { class: "flat", onclick: () => { extras.push({ kind: "state", entity: "", match: "", negate: false }); drawExtras(); } }, "+ Weitere Bedingung"), combineRow, allEnts,
    h("label", {}, "Dann"), item,
    gramsRow, aheadRow, holdRow, winRow,
    times ? null : mealRow,
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (kind.value === "time" ? !match.value : !entity.value.trim()) { msg.textContent = kind.value === "time" ? "Bitte eine Uhrzeit angeben." : "Bitte eine Entität angeben."; return; }
        const [t, id] = item.value.split(":");
        if (!id) { msg.textContent = "Bitte ein Lebensmittel, eine Mahlzeit oder ein Tagesziel wählen."; return; }
        if (extras.some(x => !x.entity.trim())) { msg.textContent = "Weitere Bedingung: bitte eine Entität angeben."; return; }
        try {
          await send(ed ? "PUT" : "POST", "triggers" + (ed ? "/" + ed.id : ""), { kind: kind.value, entity: entity.value, match: match.value,
            enabled: ed ? !!ed.enabled : true,
            meal_id: t === "p" ? null : Number(meal.value || day.meals[0].id),
            saved_meal_id: t === "s" ? Number(id) : null, food_id: t === "f" ? Number(id) : null, profile_id: t === "p" ? Number(id) : null,
            extra: extras.map(x => ({ kind: x.kind, entity: x.entity.trim(), match: x.match || "", negate: !!x.negate })), combine: combine.value,
            grams: t === "f" ? num(grams.value) : null, negate: tf.negate.value === "1",
            days_ahead: kind.value === "calendar" ? Number(ahead.value) || 0 : 0,
            part: kind.value === "calendar" ? tf.part.value : "any",
            hold_min: kind.value === "state" ? Number(hold.value) || 0 : 0, win_from: winFrom.value, win_to: winTo.value });
          dlg.close(); onDone(); if (state.tab === "settings") renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Speichern")));
  dlg.showModal();
}

// ---------------------------------------------------------------- MyFitnessPal import
function pickFile(accept, cb) {
  const i = h("input", { type: "file", accept });
  i.onchange = () => i.files[0] && cb(i.files[0]);
  i.click();
}


// ---------------------------------------------------------------- more imports
// Which app do you come from? CSV tables are matched by their column headers, Apple Health is read in the browser.
function importMenu() {
  setDlg(h("h2", {}, "Weitere Importe"),
    h("div", { class: "muted" }, "Der Import betrifft nur Dein Benutzerkonto. Vorhandene Daten bleiben erhalten, außer Du wählst ausdrücklich „ersetzen“."),
    h("div", { class: "list" },
      h("div", {}, h("div", { class: "grow" }, h("b", {}, "CSV aus einer anderen App"), h("div", { class: "muted" }, "Cronometer (servings.csv, biometrics.csv), FDDB, Yazio, Google Fit (Takeout) und ähnliche Tabellen. Die Spalten werden erkannt und lassen sich korrigieren.")),
        h("button", { onclick: () => pickFile(".csv,.txt,text/csv", tableDialog) }, "Datei wählen")),
      h("div", {}, h("div", { class: "grow" }, h("b", {}, "Lebensmittel-Tabelle"), h("div", { class: "muted" }, "Eine Nährwerttabelle (zum Beispiel BLS, Open-Food-Facts-Export oder eigene Liste) als CSV oder Excel-Datei: Lebensmittel mit Werten pro 100 g werden in Deine Bibliothek aufgenommen.")),
        h("button", { onclick: () => pickFile(".csv,.txt,.xlsx,text/csv", foodImportDialog) }, "Datei wählen")),
      h("div", {}, h("div", { class: "grow" }, h("b", {}, "Apple Health"), h("div", { class: "muted" }, "export.zip oder export.xml aus der Health-App (Profil → Gesundheitsdaten exportieren). Gelesen wird direkt im Browser, nichts wird hochgeladen außer den Tageswerten.")),
        h("button", { onclick: () => pickFile(".zip,.xml,application/zip,text/xml", healthDialog) }, "Datei wählen"))),
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  dlg.showModal();
}

const TABLE_FIELDS = [["date", "Datum"], ["time", "Uhrzeit"], ["meal", "Mahlzeit"], ["name", "Lebensmittel"], ["amount", "Menge"], ["kcal", "Kalorien"],
  ["protein", "Eiweiß"], ["carbs", "Kohlenhydrate"], ["fat", "Fett"], ["fiber", "Ballaststoffe"], ["sugar", "Zucker"], ["sat_fat", "ges. Fettsäuren"],
  ["salt", "Salz"], ["sodium", "Natrium"], ["weight", "Gewicht"], ["metric", "Messart"], ["unit", "Einheit"]];

async function tableDialog(file) {
  const text = await file.text();
  let p;
  try { p = await send("POST", "import/table/preview", { text }); } catch (e) { alert(e.message); return; }
  const selects = {};
  const info = h("div", { class: "muted" });
  const sample = h("div", { class: "lk-wrap" });
  const mapping = () => Object.fromEntries(TABLE_FIELDS.map(([k]) => [k, selects[k].value === "" ? null : Number(selects[k].value)]));
  const redraw = (q) => {
    info.textContent = q.mapping.date == null ? "Bitte die Spalte mit dem Datum zuordnen."
      : q.from ? `${q.items} Einträge, ${q.weights} Gewichtswerte (${q.from} bis ${q.to}) aus ${q.count} Zeilen.`
        : `${q.items} Einträge, ${q.weights} Gewichtswerte aus ${q.count} Zeilen.`;
    sample.replaceChildren(h("table", { class: "lk" }, h("thead", {}, h("tr", {}, q.headers.map(x => h("th", {}, x)))),
      h("tbody", {}, q.rows.map(r => h("tr", {}, q.headers.map((_, i) => h("td", {}, r[i] || "")))))));
  };
  for (const [k, label] of TABLE_FIELDS) {
    selects[k] = h("select", { onchange: async () => { p = await send("POST", "import/table/preview", { text, mapping: mapping() }); redraw(p); weightUnitRow.hidden = selects.weight.value === "" || selects.unit.value !== ""; } },
      h("option", { value: "" }, "– nicht vorhanden –"), p.headers.map((hd, i) => h("option", { value: i }, hd)));
    if (p.mapping[k] != null) selects[k].value = p.mapping[k];
  }
  const wUnitSel = h("select", {}, h("option", { value: "kg" }, "kg"), h("option", { value: "lb" }, "lb"), h("option", { value: "st" }, "Stone"));
  const weightUnitRow = h("div", {}, h("label", {}, "Einheit der Gewichtsspalte"), wUnitSel);
  weightUnitRow.hidden = selects.weight.value === "" || selects.unit.value !== "";
  const weights = h("input", { type: "checkbox", checked: true });
  const replace = h("input", { type: "checkbox" });
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "CSV importieren"),
    p.preset ? h("div", {}, `Erkannt: ${p.preset}`) : null, info,
    h("details", {}, h("summary", {}, "Zuordnung der Spalten"),
      h("div", { class: "grid" }, TABLE_FIELDS.map(([k, label]) => h("div", {}, h("label", {}, label), selects[k])))),
    sample, weightUnitRow,
    h("label", { class: "pick" }, weights, "Gewicht übernehmen"),
    h("label", { class: "pick" }, replace, "Vorhandene Einträge an diesen Tagen ersetzen"),
    msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        try {
          const r = await send("POST", "import/table", { text, mapping: mapping(), replace: replace.checked, weights: weights.checked, weight_unit: wUnitSel.value });
          dlg.close();
          alert(`Importiert: ${r.days} Tage, ${r.entries} Einträge, ${r.weights} Gewichtswerte.`);
          renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Importieren")));
  redraw(p);
  dlg.showModal();
}

// Apple Health: stream export.xml (directly or out of export.zip) and keep only body weight and daily nutrition totals.
async function healthStream(file, onProgress) {
  if (!/\.zip$/i.test(file.name)) return { stream: file.stream(), size: file.size };
  const tail = new DataView(await file.slice(Math.max(0, file.size - 65557)).arrayBuffer());
  let e = tail.byteLength - 22;
  while (e >= 0 && tail.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error("Keine gültige ZIP-Datei.");
  const cdSize = tail.getUint32(e + 12, true), cdOff = tail.getUint32(e + 16, true);
  if (cdOff === 0xFFFFFFFF) throw new Error("Sehr große ZIP-Datei (ZIP64): bitte entpacken und die export.xml wählen.");
  const cd = new DataView(await file.slice(cdOff, cdOff + cdSize).arrayBuffer());
  let best = null;
  for (let o = 0; o + 46 <= cd.byteLength && cd.getUint32(o, true) === 0x02014b50;) {
    const nameLen = cd.getUint16(o + 28, true), extra = cd.getUint16(o + 30, true), comment = cd.getUint16(o + 32, true);
    const name = new TextDecoder().decode(new Uint8Array(cd.buffer, o + 46, nameLen));
    if (/export\.xml$/i.test(name) && !/cda/i.test(name)) best = { method: cd.getUint16(o + 10, true), comp: cd.getUint32(o + 20, true), size: cd.getUint32(o + 24, true), off: cd.getUint32(o + 42, true) };
    o += 46 + nameLen + extra + comment;
  }
  if (!best) throw new Error("In der ZIP-Datei wurde keine export.xml gefunden.");
  const lh = new DataView(await file.slice(best.off, best.off + 30).arrayBuffer());
  const start = best.off + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
  const raw = file.slice(start, start + best.comp).stream();
  if (best.method === 0) return { stream: raw, size: best.size };
  if (best.method !== 8 || typeof DecompressionStream === "undefined") throw new Error("Dieser Browser kann die ZIP-Datei nicht entpacken. Bitte entpacken und die export.xml wählen.");
  return { stream: raw.pipeThrough(new DecompressionStream("deflate-raw")), size: best.size };
}

async function readHealth(file, onProgress) {
  const { stream, size } = await healthStream(file);
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  const weights = {}, wTime = {}, nutr = {};
  const attr = (s, n) => { const m = new RegExp("\\b" + n + '="([^"]*)"').exec(s); return m ? m[1] : ""; };
  const KEYS = { HKQuantityTypeIdentifierDietaryEnergyConsumed: "kcal", HKQuantityTypeIdentifierDietaryProtein: "protein",
    HKQuantityTypeIdentifierDietaryCarbohydrates: "carbs", HKQuantityTypeIdentifierDietaryFatTotal: "fat" };
  let buf = "", done = 0;
  const take = rec => {
    const type = attr(rec, "type");
    const val = parseFloat(attr(rec, "value")), when = attr(rec, "startDate"), day = when.slice(0, 10);
    if (!(val >= 0) || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    if (type === "HKQuantityTypeIdentifierBodyMass") {
      const u = attr(rec, "unit"), kg = u === "lb" ? val * 0.45359237 : u === "g" ? val / 1000 : val;
      if (!wTime[day] || when > wTime[day]) { weights[day] = Math.round(kg * 100) / 100; wTime[day] = when; }
    } else if (KEYS[type]) {
      const u = attr(rec, "unit"), v = KEYS[type] === "kcal" && /kj/i.test(u) ? val / 4.184 : val;
      (nutr[day] ||= { kcal: 0, protein: 0, carbs: 0, fat: 0 })[KEYS[type]] += v;
    }
  };
  for (;;) {
    const { value, done: end } = await reader.read();
    if (value) { buf += value; done += value.length; }
    let last = 0;
    for (const m of buf.matchAll(/<Record\b[^>]*>/g)) { take(m[0]); last = m.index + m[0].length; }
    buf = buf.slice(last > 0 ? last : Math.max(0, buf.length - 2000));
    onProgress(Math.min(1, done / (size || done || 1)));
    if (end) break;
  }
  return { weights, nutrition: Object.fromEntries(Object.entries(nutr).map(([d, t]) => [d, Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Math.round(v * 10) / 10]))])) };
}

async function healthDialog(file) {
  const prog = h("div", { class: "muted" }, "Lese Datei …");
  setDlg(h("h2", {}, "Apple Health"), prog, h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen")));
  dlg.showModal();
  let data;
  try { data = await readHealth(file, f => { prog.textContent = `Lese Datei … ${Math.round(f * 100)} %`; }); }
  catch (e) { prog.textContent = e.message; return; }
  const nw = Object.keys(data.weights).length, nn = Object.values(data.nutrition).filter(t => t.kcal > 0).length;
  const weights = h("input", { type: "checkbox", checked: nw > 0, disabled: !nw });
  const nutr = h("input", { type: "checkbox", checked: false, disabled: !nn });
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "Apple Health"),
    h("div", { class: "muted" }, `${nw} Gewichtswerte, ${nn} Tage mit Ernährungsdaten gefunden.`),
    h("label", { class: "pick" }, weights, "Gewicht übernehmen (ein Wert pro Tag, vorhandene Werte werden überschrieben)"),
    h("label", { class: "pick" }, nutr, "Tagessummen der Ernährung übernehmen (eine Schnelleingabe pro Tag, nur sinnvoll, wenn Du Deine Mahlzeiten sonst nicht hier führst)"),
    msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { disabled: !nw && !nn, onclick: async () => {
        try {
          const r = await send("POST", "import/records", { source: "Apple Health", replace: true,
            weights: weights.checked ? data.weights : {}, nutrition: nutr.checked ? data.nutrition : {} });
          dlg.close();
          alert(`Importiert: ${r.entries} Tage, ${r.weights} Gewichtswerte.`);
          renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Importieren")));
}

async function mfpDialog(file) {
  const csv = await file.text();
  let p;
  try { p = await send("POST", "import/mfp/preview", { csv }); }
  catch (e) { alert(e.message); return; }
  const mode = h("select", {},
    h("option", { value: "full" }, "Komplett (alle Einträge mit Mahlzeiten)"),
    h("option", { value: "totals" }, "Nur Tageskalorien und Makros (eine Summe pro Tag)"));
  const weights = h("input", { type: "checkbox", checked: p.weights > 0, disabled: !p.weights });
  const replace = h("input", { type: "checkbox", checked: true });
  const maps = p.meals.map(n => {
    const s = h("select", {}, h("option", { value: "" }, "Neue Mahlzeit anlegen"),
      p.own_meals.map(m => h("option", { value: m.id }, m.name)));
    if (p.guess[n]) s.value = p.guess[n];
    return [n, s];
  });
  const mapBox = h("div", {}, h("h3", { style: "margin-top:12px" }, "Mahlzeiten zuordnen"),
    maps.map(([n, s]) => h("div", { class: "maprow" }, h("span", {}, n), "→", s)));
  const hide = h("input", { type: "checkbox", checked: true });
  const hideRow = h("label", { class: "pick" }, hide, "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)");
  hideRow.hidden = true;
  mode.onchange = () => { mapBox.hidden = mode.value === "totals"; hideRow.hidden = mode.value !== "totals"; };
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "MyFitnessPal-Import"),
    h("div", { class: "muted" }, `${p.days} Tage (${p.from} bis ${p.to}), ${p.items} Einträge, ${p.weights} Gewichtswerte`),
    h("label", {}, "Was importieren?"), mode, mapBox, hideRow,
    h("label", { class: "pick" }, weights, "Gewicht übernehmen"),
    h("label", { class: "pick" }, replace, "Vorhandene Einträge an diesen Tagen ersetzen"),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        try {
          const r = await send("POST", "import/mfp", { csv, mode: mode.value, weights: weights.checked,
            replace: replace.checked, hide_empty: mode.value === "totals" && hide.checked, meal_map: Object.fromEntries(maps.map(([n, s]) => [n, s.value ? Number(s.value) : null])) });
          dlg.close();
          alert(`Importiert: ${r.days} Tage, ${r.entries} Einträge, ${r.weights} Gewichtswerte.`);
          renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Importieren")));
  dlg.showModal();
}

// ---------------------------------------------------------------- settings
// Goal calculator: with "auto" on, calories follow the macros (4 kcal/g carbs and protein, 9 kcal/g fat).
const calcAuto = {
  get: () => { try { return localStorage.getItem("mda-calc") !== "0"; } catch { return true; } },
  set: v => { try { localStorage.setItem("mda-calc", v ? "1" : "0"); } catch { /* ignore */ } },
};
const macroKcal = f => 4 * (num(f.protein.value) || 0) + 4 * (num(f.carbs.value) || 0) + 9 * (num(f.fat.value) || 0);

// Wire the inputs of one goal row; boxes are the shared "auto" checkboxes. Returns a refresh function.
function wireCalc(f, boxes, info) {
  const refresh = (apply = true) => {
    const auto = calcAuto.get(), mk = macroKcal(f);
    f.kcal.readOnly = auto && mk > 0;
    if (apply === true && auto && mk > 0) f.kcal.value = Math.round(mk);
    if (info) {
      const k = num(f.kcal.value) || 0;
      info.textContent = mk > 0 && k > 0
        ? `Eiweiß ${Math.round(num(f.protein.value) * 4 / (mk || 1) * 100)} % · Kohlenhydrate ${Math.round(num(f.carbs.value) * 4 / (mk || 1) * 100)} % · Fett ${Math.round(num(f.fat.value) * 9 / (mk || 1) * 100)} %`
          + (!auto && Math.abs(mk - k) > Math.max(30, k * 0.03) ? ` · Makros ergeben ${n0(mk)} kcal` : "") : "";
    }
  };
  for (const k of ["protein", "carbs", "fat"]) f[k].addEventListener("input", () => refresh());
  f.kcal.addEventListener("input", () => refresh(false));
  boxes.push(() => refresh());
  return refresh;
}

async function renderSettings() {
  const [goal, day, triggers, rules, runs, tstat, bk, rem, ext, wk] = await Promise.all([api("goal"), api("day/" + state.day), api("triggers"), api("meal-triggers"), api("trigger-runs?limit=15"),
    api("triggers/status"), api("backups"), api("reminder"), api("ext/info"), api("weekly-report")]);
  const root = $("#settings");
  root.replaceChildren();

  const gf = {};
  const gfield = (key, label, step = "1") => {
    gf[key] = h("input", { type: "number", step, min: "0", value: key === "target_weight" && goal[key] != null ? Math.round(wConv(goal[key]) * 10) / 10 : goal[key] ?? "" });
    return h("div", {}, h("label", {}, label), gf[key]);
  };
  const saved = h("span", { class: "muted" });
  const refreshers = [];
  const info = h("div", { class: "muted" });
  const autoBox = h("input", { type: "checkbox", checked: calcAuto.get(), onchange: () => { calcAuto.set(autoBox.checked); refreshers.forEach(r => r()); } });
  setTimeout(() => wireCalc(gf, refreshers, info)(false), 0);
  const aim = h("select", {}, GOAL_MODES.map(([v, l]) => h("option", { value: v }, l)));
  aim.value = state.goalMode;
  const rate = h("input", { type: "number", step: "0.05", min: "0", max: "5", value: Math.round(wConv(state.goalRate) * 100) / 100 });
  const rateRow = h("div", {}, h("label", {}, `Gewünschte Änderung (${wUnit()} pro Woche)`), rate);
  const syncMode = () => { rateRow.hidden = aim.value === "maintain"; };
  aim.addEventListener("change", syncMode); syncMode();
  root.append(h("div", { class: "card" }, h("h2", {}, "Tagesziele"),
    h("div", { class: "grid" }, h("div", {}, h("label", {}, "Mein Ziel"), aim), rateRow),
    h("div", { class: "muted", style: "margin-bottom:8px" }, "Bestimmt, wann ein Tag als „im Ziel“ gilt (Abnehmen: höchstens, Zunehmen: mindestens, Halten: ±10 %), und wie die Statistik Deinen Gewichtstrend bewertet."),
    h("label", { class: "pick" }, autoBox, h("span", {}, "Kalorien aus Makros berechnen", h("div", { class: "muted" }, "Ändern sich Eiweiß, Kohlenhydrate oder Fett, passen sich die Kalorien an (4/4/9 kcal pro g)."))),
    h("div", { class: "grid" },
      gfield("kcal", "Kalorien (kcal)"), gfield("carbs", "Kohlenhydrate (g)"),
      gfield("fat", "Fett (g)"), gfield("protein", "Eiweiß (g)"), gfield("target_weight", `Zielgewicht (${wUnit()})`, "0.1")),
    info,
    h("div", { class: "actions" }, saved, h("button", { onclick: async () => {
      await send("PUT", "goal", { kcal: num(gf.kcal.value) || 0, carbs: num(gf.carbs.value) || 0,
        fat: num(gf.fat.value) || 0, protein: num(gf.protein.value) || 0,
        target_weight: num(gf.target_weight.value) == null ? null : Math.round(wIn(num(gf.target_weight.value)) * 100) / 100 });
      const rateKg = Math.round(wIn(num(rate.value) ?? 0.5) * 100) / 100;
      await send("PUT", "settings", { goal_mode: aim.value, goal_rate: rateKg });
      state.goalMode = aim.value; state.goalRate = rateKg;
      saved.textContent = "Gespeichert ✓";
    } }, "Speichern"))));

  const langSel = h("select", {}, h("option", { value: "auto" }, "Automatisch (Browser)"), h("option", { value: "de" }, "Deutsch"), h("option", { value: "en" }, "English"),
    h("option", { value: "fr" }, "Français"), h("option", { value: "es" }, "Español"), h("option", { value: "nl" }, "Nederlands"), h("option", { value: "it" }, "Italiano"), h("option", { value: "pt" }, "Português"), h("option", { value: "pl" }, "Polski"));
  const unitSel = h("select", {}, h("option", { value: "metric" }, "Metrisch (kg, cm)"), h("option", { value: "imperial" }, "Imperial (lb, in)"));
  const massSel = h("select", {}, h("option", { value: "g" }, "Gramm"), h("option", { value: "oz" }, "Unzen (oz)"));
  langSel.value = state.langPref || "auto"; unitSel.value = I18N.units; massSel.value = I18N.mass;
  const savePref = async () => { await send("PUT", "settings", { lang: langSel.value, units: unitSel.value, mass: massSel.value }); location.reload(); };
  root.append(h("div", { class: "card" }, h("h2", {}, "Sprache und Einheiten"),
    h("div", { class: "grid" }, h("div", {}, h("label", {}, "Sprache"), langSel), h("div", {}, h("label", {}, "Einheiten"), unitSel), h("div", {}, h("label", {}, "Lebensmittelmengen"), massSel)),
    h("div", { class: "actions" }, h("button", { onclick: savePref }, "Speichern"))));

  const freqSel = h("select", {}, h("option", { value: "foods" }, "Lebensmittel"), h("option", { value: "meals" }, "Gespeicherte Mahlzeiten"), h("option", { value: "both" }, "Beides"));
  freqSel.value = state.frequent;
  const freqSaved = h("span", { class: "muted" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Hinzufügen-Dialog"),
    h("label", {}, "„Häufig verwendet“ zeigt"), freqSel,
    h("div", { class: "muted", style: "margin-bottom:8px" }, "Gilt für den Reiter „Lebensmittel“ im Dialog zum Hinzufügen. Im Reiter „Meine Mahlzeiten“ stehen immer die häufig verwendeten Mahlzeiten."),
    h("div", { class: "actions" }, freqSaved, h("button", { onclick: async () => {
      await send("PUT", "settings", { frequent: freqSel.value });
      state.frequent = freqSel.value; freqSaved.textContent = "Gespeichert ✓";
    } }, "Speichern"))));

  // optional features
  const feat = (key, label, hint) => {
    const box = h("input", { type: "checkbox", checked: !!state.features[key], onchange: async () => {
      state.features[key] = box.checked;
      await send("PUT", "settings", { features: { [key]: box.checked } });
      applyTabs();
      renderSettings();
    } });
    return h("div", {}, h("label", { class: "pick" }, box, h("span", {}, label, h("div", { class: "muted" }, hint))));
  };
  root.append(h("div", { class: "card" }, h("h2", {}, "Zusatzfunktionen"),
    h("div", { class: "muted" }, "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen."),
    h("div", { class: "list" },
      feat("weekday_goals", "Tagesziele pro Wochentag", "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger."),
      feat("trackers", "Wasser und Nahrungsergänzung", "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel."),
      feat("recipes", "Rezepte", "Zutaten zu einem Rezept bündeln, durch Portionen teilen und wie ein Lebensmittel eintragen (eigener Reiter)."),
      feat("sources", "Weitere Datenquellen", "Online-Suche in Open Food Facts und USDA mit Abgleich der Werte untereinander und mit Deinen eigenen (Suchbegriffe werden an diese Dienste gesendet)."),
      feat("activity", "Aktivität", "Schritte und verbrannte Kalorien (aus Home-Assistant-Sensoren oder von Hand) erhöhen das Tagesziel des jeweiligen Tages."),
      feat("scale", "Waage (Sensor)", "Körpergewicht automatisch aus einem Home-Assistant-Sensor übernehmen, z. B. von einer smarten Waage (mit Einheitenumrechnung)."),
      feat("schedule", "Mahlzeiten-Zeitplan", "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung."),
      feat("suggest", "Mahlzeiten-Vorschläge", "Button im Tagebuch: schlägt gespeicherte Mahlzeiten und Kombinationen aus Deinem Verlauf vor, die zu den offenen Kalorien und Makros passen (Mengen werden angepasst, feste Packungen bleiben)."),
      feat("shopping", "Einkaufsliste", "Zutaten von Rezepten und gespeicherten Mahlzeiten zusammenzählen, kopieren oder an eine Todo-Liste in Home Assistant schicken (z. B. die Einkaufsliste)."),
      feat("household", "Haushalt", "Einträge, Lebensmittel und Mahlzeiten mit anderen Benutzern teilen, jeder mit eigener Portion (z. B. ein Gericht für die Familie). Beide Seiten müssen die Funktion einschalten."),
      feat("notes", "Notizen", "Freitext zu Mahlzeiten und Tagen (Hunger, Training, Stimmung). Vorhandene Notizen bleiben beim Ausschalten erhalten."),
      feat("body", "Körpermaße und Fortschrittsfotos", "Umfänge (Taille, Brust, Arm …) mit Verlauf und Fotos mit Vergleich im Reiter Gewicht."),
      feat("micros", "Weitere Nährwerte", "Ballaststoffe, Zucker, Salz und gesättigte Fettsäuren bei Lebensmitteln erfassen und auswerten (Open Food Facts liefert sie mit)."))));

  if (state.features.weekday_goals) {
    const wd = await api("goal-weekdays");
    const names = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    const wf = names.map((n, i) => {
      const w = wd[i] || {};
      const inp = key => h("input", { type: "number", min: "0", step: "1", placeholder: key === "kcal" ? "wie Standard" : "–", value: w[key] || "" });
      return { i, n, kcal: inp("kcal"), carbs: inp("carbs"), fat: inp("fat"), protein: inp("protein") };
    });
    const wsaved = h("span", { class: "muted" });
    wf.forEach(r => wireCalc(r, refreshers, null)(false));
    root.append(h("div", { class: "card" }, h("h2", {}, "Tagesziele pro Wochentag"),
      h("div", { class: "muted" }, "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“. Mit „Kalorien aus Makros berechnen“ (oben) folgen die Kalorien den Makros."),
      h("div", { class: "wd-grid" },
        h("span"), h("label", {}, "kcal"), h("label", {}, "KH (g)"), h("label", {}, "Fett (g)"), h("label", {}, "Eiweiß (g)"),
        wf.flatMap(r => [h("b", {}, r.n), r.kcal, r.carbs, r.fat, r.protein])),
      h("div", { class: "actions" }, wsaved, h("button", { onclick: async () => {
        for (const r of wf) {
          if (num(r.kcal.value) > 0) await send("PUT", "goal-weekdays/" + r.i, { kcal: num(r.kcal.value),
            carbs: num(r.carbs.value) || 0, fat: num(r.fat.value) || 0, protein: num(r.protein.value) || 0 });
          else await api("goal-weekdays/" + r.i, { method: "DELETE" });
        }
        wsaved.textContent = "Gespeichert ✓";
      } }, "Speichern"))));
  }

  if (state.features.weekday_goals) {
    const profiles = await api("goal-profiles");
    const rowsP = profiles.map(p => {
      const inp = k => h("input", { type: "number", min: "0", step: "1", value: p[k] || "" });
      const r = { p, name: h("input", { value: p.name }), kcal: inp("kcal"), carbs: inp("carbs"), fat: inp("fat"), protein: inp("protein") };
      wireCalc(r, refreshers, null)(false);
      return r;
    });
    const psaved = h("span", { class: "muted" });
    root.append(h("div", { class: "card" }, h("h2", {}, "Tagesziel-Profile"),
      h("div", { class: "muted" }, "z. B. „Training“ und „Ruhetag“. Ein Trigger (Einstellungen → Trigger → „Dann: Tagesziel wechseln“) schaltet den Tag auf ein Profil, etwa wenn die Person im Fitnessstudio ist. Das Profil geht vor dem Wochentagsziel."),
      rowsP.length ? h("div", { class: "prof-grid" },
        h("span"), h("label", {}, "kcal"), h("label", {}, "KH (g)"), h("label", {}, "Fett (g)"), h("label", {}, "Eiweiß (g)"), h("span"),
        rowsP.flatMap(r => [r.name, r.kcal, r.carbs, r.fat, r.protein,
          h("button", { class: "icon", title: "Profil löschen", "aria-label": "Löschen", onclick: async () => {
            if (!confirm(`Profil „${r.p.name}“ löschen? Trigger dafür werden ebenfalls gelöscht.`)) return;
            await api("goal-profiles/" + r.p.id, { method: "DELETE" }); renderSettings();
          } }, "✕")])) : h("div", { class: "muted", style: "padding:8px 0" }, "Noch keine Profile."),
      h("div", { class: "actions" }, psaved,
        h("button", { class: "flat", onclick: async () => {
          await send("POST", "goal-profiles", { name: "Neues Profil", kcal: num(gf.kcal.value) || 2000, carbs: num(gf.carbs.value) || 0,
            fat: num(gf.fat.value) || 0, protein: num(gf.protein.value) || 0 });
          renderSettings();
        } }, "+ Profil"),
        rowsP.length ? h("button", { onclick: async () => {
          for (const r of rowsP) if (num(r.kcal.value) > 0 && r.name.value.trim()) await send("PUT", "goal-profiles/" + r.p.id, {
            name: r.name.value, kcal: num(r.kcal.value), carbs: num(r.carbs.value) || 0, fat: num(r.fat.value) || 0, protein: num(r.protein.value) || 0 });
          psaved.textContent = "Gespeichert ✓";
        } }, "Speichern") : null)));
  }

  if (state.features.trackers) {
    const trackers = await api("trackers?day=" + state.day);
    const rowsT = trackers.map(t => {
      const f = {
        name: h("input", { value: t.name, placeholder: "Name" }), unit: h("input", { value: t.unit, placeholder: "Einheit", style: "max-width:70px" }),
        goal: h("input", { type: "number", step: "any", min: "0", value: t.goal ?? "", placeholder: "Ziel", style: "max-width:90px" }),
        step: h("input", { type: "number", step: "any", min: "0", value: t.step, placeholder: "Schritt", style: "max-width:80px" }) };
      const save = async () => {
        if (!f.name.value.trim() || !(num(f.step.value) > 0)) return;
        await send("PUT", "trackers/" + t.id, { name: f.name.value, unit: f.unit.value, goal: num(f.goal.value) || null, step: num(f.step.value) });
      };
      for (const k of Object.keys(f)) f[k].onchange = save;
      return h("div", {}, f.name, f.unit, f.goal, f.step,
        h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
          if (!confirm(`„${t.name}“ samt Verlauf löschen?`)) return;
          await api("trackers/" + t.id, { method: "DELETE" }); renderSettings();
        } }, "✕"));
    });
    const nf = { name: h("input", { placeholder: "Neu, z. B. Magnesium" }), unit: h("input", { placeholder: "Einheit", style: "max-width:70px" }),
      goal: h("input", { type: "number", step: "any", min: "0", placeholder: "Ziel", style: "max-width:90px" }),
      step: h("input", { type: "number", step: "any", min: "0", placeholder: "Schritt", value: 1, style: "max-width:80px" }) };
    root.append(h("div", { class: "card" }, h("h2", {}, "Wasser & Ergänzungen"),
      h("div", { class: "muted" }, "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch."),
      h("div", { class: "list" }, rowsT, h("div", {}, nf.name, nf.unit, nf.goal, nf.step,
        h("button", { onclick: async () => {
          if (!nf.name.value.trim() || !(num(nf.step.value) > 0)) return;
          await send("POST", "trackers", { name: nf.name.value, unit: nf.unit.value, goal: num(nf.goal.value) || null, step: num(nf.step.value) });
          renderSettings();
        } }, "+")))));
  }

  if (state.features.activity) {
    const cfg = (await api("activity?day=" + iso(new Date()))).config;
    const ents = await api("ha/entities").catch(() => []);
    const sensors = h("datalist", { id: "sensor-list" }, ents.filter(e => e.id.startsWith("sensor.")).map(e => h("option", { value: e.id }, e.name || e.id)));
    const steps = h("input", { list: "sensor-list", placeholder: "z. B. sensor.handy_schritte", value: cfg.steps_entity });
    const kc = h("input", { list: "sensor-list", placeholder: "z. B. sensor.handy_aktive_kalorien", value: cfg.kcal_entity });
    const share = h("input", { type: "number", min: "0", max: "100", step: "5", value: cfg.share });
    const stride = h("input", { type: "number", min: "0.0001", max: "0.002", step: "0.0001", value: cfg.stride_kcal });
    const asaved = h("span", { class: "muted" });
    root.append(h("div", { class: "card" }, h("h2", {}, "Aktivität"),
      h("div", { class: "muted" }, "Sensoren aus Home Assistant, die über den Tag hochzählen und um Mitternacht auf 0 springen (ein dauerhaft steigender Zähler lässt sich mit dem Helfer „Verbrauchszähler“ auf täglich umstellen). Das Add-on liest sie alle fünf Minuten. Ohne Kalorien-Sensor werden Kalorien aus Schritten, Körpergewicht und dem Faktor unten geschätzt; Werte lassen sich auch von Hand eintragen."),
      h("div", { class: "grid" }, h("div", {}, h("label", {}, "Sensor für Schritte"), steps), h("div", {}, h("label", {}, "Sensor für aktive Kalorien (kcal)"), kc)),
      h("div", { class: "grid" }, h("div", {}, h("label", {}, "Anteil, der das Tagesziel erhöht (%)"), share), h("div", {}, h("label", {}, "kcal je Schritt und kg Körpergewicht"), stride)),
      h("div", { class: "muted" }, "Viele Apps rechnen nur einen Teil der verbrannten Kalorien an (50 % ist ein vorsichtiger Wert), weil Aktivitätswerte oft zu hoch geschätzt sind."), sensors,
      h("div", { class: "actions" }, asaved, h("button", { onclick: async () => {
        try { await send("PUT", "activity/config", { steps_entity: steps.value.trim(), kcal_entity: kc.value.trim(), share: num(share.value) ?? 50, stride_kcal: num(stride.value) || 0.0005 }); asaved.className = "muted"; asaved.textContent = "Gespeichert ✓"; }
        catch (e) { asaved.className = "err"; asaved.textContent = e.message; }
      } }, "Speichern"))));
  }

  if (state.features.scale) {
    const sc = await api("scale");
    const ents = await api("ha/entities").catch(() => []);
    const sensors = h("datalist", { id: "scale-list" }, ents.filter(e => e.id.startsWith("sensor.")).map(e => h("option", { value: e.id }, e.name || e.id)));
    const ent = h("input", { list: "scale-list", placeholder: "z. B. sensor.waage_gewicht", value: sc.config.entity });
    const unit = h("select", {}, h("option", { value: "auto" }, "Automatisch (Einheit des Sensors)"), ["kg", "g", "lb", "st"].map(u => h("option", { value: u }, u)));
    unit.value = sc.config.unit;
    const wTxt = kg => `${n1(wConv(kg))} ${wUnit()}`;
    const ssaved = h("span", { class: "muted" });
    const say = (text, cls = "muted") => { ssaved.className = cls; ssaved.textContent = text; };
    const verdict = { saved: r => `Übernommen: ${wTxt(r.last.kg)} am ${longDate(r.last.day)}`, up_to_date: () => "Der aktuelle Wert ist schon übernommen.",
      waiting: () => "Neuer Wert gesehen, wird übernommen, sobald er stabil ist.", no_sensor: () => "Zuerst einen Sensor wählen.",
      unreachable: () => "Home Assistant nicht erreichbar.", unavailable: () => "Der Sensor liefert gerade keinen Zahlenwert.",
      out_of_range: () => "Der Wert liegt außerhalb von 20 bis 500 kg (Einheit prüfen).", too_old: () => "Der Wert im Sensor ist älter als 30 Tage und wurde nicht übernommen." };
    root.append(h("div", { class: "card" }, h("h2", {}, "Waage"),
      h("div", { class: "muted" }, "Sensor aus Home Assistant mit dem Körpergewicht, z. B. von einer smarten Waage. Das Add-on schaut jede Minute nach; ein neuer Wert wird übernommen, sobald er sich eine Minute nicht mehr ändert, und für den Tag der Messung gespeichert (ein Wert vom selben Tag wird ersetzt). Sinnvoll sind Werte von 20 bis 500 kg."),
      h("div", { class: "grid" }, h("div", {}, h("label", {}, "Sensor"), ent), h("div", {}, h("label", {}, "Einheit des Sensors"), unit)),
      sensors,
      sc.last ? h("div", { class: "muted" }, `Zuletzt übernommen: ${wTxt(sc.last.kg)} am ${longDate(sc.last.day)}`) : null,
      h("div", { class: "actions" }, ssaved,
        h("button", { class: "flat", onclick: async () => {
          try { await send("PUT", "scale", { entity: ent.value.trim(), unit: unit.value }); const r = await send("POST", "scale/read", {}); say(verdict[r.status](r), r.status === "saved" ? "muted" : "warn-note"); }
          catch (e) { say(e.message, "err"); }
        } }, "Speichern und jetzt lesen"),
        h("button", { onclick: async () => {
          try { await send("PUT", "scale", { entity: ent.value.trim(), unit: unit.value }); say("Gespeichert ✓"); }
          catch (e) { say(e.message, "err"); }
        } }, "Speichern"))));
  }

  if (state.features.recipes) {
    const ml = await api("mealie").catch(() => null);
    if (ml) {
      const murl = h("input", { type: "url", placeholder: "http://mealie:9000", value: ml.url });
      const mtok = h("input", { type: "password", autocomplete: "off", placeholder: ml.token_set ? "Gespeichert (leer lassen = unverändert)" : "API-Token" });
      const msaved = h("span", { class: "muted" });
      root.append(h("div", { class: "card" }, h("h2", {}, "Mealie"),
        h("div", { class: "muted" }, "Rezepte aus einem Mealie-Server übernehmen. Adresse des Servers (im Heimnetz oder als Add-on) und ein API-Token aus Mealie (Profil → API-Tokens). Das Add-on liest nur Rezepte und verändert in Mealie nichts. Der Token bleibt im Add-on gespeichert und erscheint nicht im Export. Zum Entfernen die Adresse leeren."),
        h("div", { class: "grid" }, h("div", {}, h("label", {}, "Adresse"), murl), h("div", {}, h("label", {}, "API-Token"), mtok)),
        h("div", { class: "actions" }, msaved, h("button", { onclick: async () => {
          try {
            const r = await send("PUT", "mealie", { url: murl.value.trim(), token: mtok.value.trim() || null });
            murl.value = r.url; mtok.value = ""; msaved.className = "muted"; msaved.textContent = "Gespeichert ✓";
          } catch (e) { msaved.className = "err"; msaved.textContent = e.message; }
        } }, "Speichern"))));
    }
  }

  const cache = await api("lookup/cache").catch(() => ({ entries: 0, bytes: 0 }));
  if (state.features.sources || cache.entries) root.append(h("div", { class: "card" }, h("h2", {}, "Zwischenspeicher der Online-Suche"),
    h("div", { class: "muted" }, "Abfragen bei Open Food Facts und USDA merkt sich das Add-on lokal (Barcodes 60 Tage, Suchbegriffe 14 Tage). Wiederholte Suchen gehen so nicht mehr ins Internet. Es werden nur Produktdaten gespeichert, keine Angaben zu Deinem Tagebuch."),
    h("div", {}, `${n0(cache.entries)} gespeicherte Abfragen (${n0(Math.max(1, cache.bytes / 1024))} KB)`),
    h("div", { class: "actions", style: "justify-content:flex-start" }, h("button", { class: "flat", disabled: !cache.entries, onclick: async () => {
      await api("lookup/cache", { method: "DELETE" }); renderSettings();
    } }, "Zwischenspeicher leeren"))));

  // diary layout
  const mode = h("select", { onchange: async () => { await send("PUT", "settings", { diary_mode: mode.value }); renderSettings(); } },
    h("option", { value: "meals" }, "Feste Mahlzeiten (Frühstück, Mittagessen, …)"),
    h("option", { value: "times" }, "Uhrzeiten (08:47 …, 11:30 …)"));
  mode.value = day.mode;
  const skin = h("select", { onchange: async () => {
    await send("PUT", "settings", { skin: skin.value }); state.skin = skin.value; applySkin();
  } },
    h("option", { value: "auto" }, "Automatisch (Windows-Look bei HA-95/98-Theme)"),
    h("option", { value: "default" }, "Standard (HA-Theme)"),
    h("option", { value: "win" }, "Windows-Look"));
  skin.value = state.skin;
  const scanOpen = h("input", { type: "checkbox", checked: scanOnOpen(), onchange: () => scanOnOpen(scanOpen.checked) });
  root.append(h("div", { class: "card" }, h("h2", {}, "Darstellung"),
    h("label", {}, "Tagebuch"), mode,
    h("div", { class: "muted", style: "margin-top:8px" },
      "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende."),
    h("label", { style: "margin-top:12px" }, "Optik"), skin,
    h("label", { class: "pick", style: "margin-top:12px" }, scanOpen, "Auf diesem Gerät beim Öffnen direkt den Barcode-Scanner starten"),
    h("div", { class: "muted" }, "Für ein Homescreen-Widget der Companion-App: Lege dort eine Verknüpfung auf dieses Panel an, dann öffnet sich die Kamera sofort.")));

  // meals
  const meals = day.meals;
  const sched = state.features.schedule ? await api("schedule").catch(() => null) : null;
  const mealMsg = h("div", { class: "err" });
  const mealList = h("div", { class: "list" }, meals.map((m, i) => {
    const name = h("input", { value: m.name, "aria-label": "Name der Mahlzeit", onchange: async () => {
      if (name.value.trim()) await send("PUT", "meals/" + m.id, { name: name.value });
    } });
    const move = async dir => {
      const ids = meals.map(x => x.id);
      [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
      await send("PUT", "meals/order", { ids });
      renderSettings();
    };
    const slot = sched ? (sched.meals.find(x => x.id === m.id) || {}) : null;
    const from = h("input", { type: "time", value: m.from_time || "", title: "Von (leer = Standardfenster)", style: "width:auto;flex:none" });
    const to = h("input", { type: "time", value: m.to_time || "", title: "Bis (leer = Standardfenster)", style: "width:auto;flex:none" });
    const saveWindow = async () => { await send("PUT", "meals/" + m.id, { name: name.value || m.name, from_time: from.value, to_time: to.value }); };
    from.onchange = to.onchange = saveWindow;
    return h("div", { class: m.archived ? "archived" : "" }, name,
      sched ? [from, "–", to, !m.from_time && slot && slot.window ? h("span", { class: "muted", title: "Standardfenster" }, `(${slot.window.join("–")})`) : null] : null,
      h("button", { class: "icon", disabled: i === 0, title: "Nach oben", onclick: () => move(-1) }, "↑"),
      h("button", { class: "icon", disabled: i === meals.length - 1, title: "Nach unten", onclick: () => move(1) }, "↓"),
      h("button", { class: "icon", title: "Nur an bestimmten Tagen anzeigen", onclick: () => mealRuleDialog(m) }, "⚡"),
      h("button", { class: "icon", title: m.archived ? "Wieder einblenden" : "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)",
        "aria-label": m.archived ? "Wieder einblenden" : "Ausblenden", onclick: async () => {
          await send("PUT", `meals/${m.id}/archived`, { archived: !m.archived }); renderSettings();
        } }, m.archived ? "◉" : "⊘"),
      h("button", { class: "icon", title: "Löschen", onclick: async () => {
        try { await api("meals/" + m.id, { method: "DELETE" }); renderSettings(); }
        catch (e) { mealMsg.textContent = e.message + " – blende sie stattdessen mit ⊘ aus."; }
      } }, "✕"));
  }));
  const newMeal = h("input", { placeholder: "Neue Mahlzeit, z. B. Nachtschicht" });
  const ruleList = rules.length ? h("div", { class: "list" }, rules.map(r => h("div", {},
    h("div", { class: "grow" }, h("b", {}, r.meal), ` nur an Tagen: ${condText(r)}`),
    h("button", { class: "icon edit", title: "Regel bearbeiten", "aria-label": "Regel bearbeiten", onclick: () => mealRuleDialog({ id: r.meal_id, name: r.meal }, r) }, "✎"),
    h("button", { class: "icon", title: "Regel löschen", onclick: async () => {
      await api("meal-triggers/" + r.id, { method: "DELETE" }); renderSettings();
    } }, "✕")))) : null;
  root.append(h("div", { class: "card" }, h("h2", {}, "Mahlzeiten"),
    h("div", { class: "muted" }, "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit."),
    sched ? h("div", { class: "muted" }, "Zeitfenster: Von–Bis pro Mahlzeit. Leer gelassen gilt ein Standardfenster (Frühstück, Mittag- und Abendessen), Snacks haben keines. Fenster über Mitternacht sind möglich.") : null,
    mealList, ruleList, mealMsg,
    sched ? h("label", { class: "pick" }, h("input", { type: "checkbox", checked: !!sched.nudge, onchange: async e => { await send("PUT", "schedule/nudge", { nudge: e.target.checked }); } }),
      h("span", {}, "Benachrichtigen, wenn eine Mahlzeit ansteht und noch leer ist", h("div", { class: "muted" }, "Nutzt den Benachrichtigungsdienst aus „Erinnerung“ weiter unten."))) : null,
    h("div", { class: "actions" }, newMeal, h("button", { onclick: async () => {
      if (!newMeal.value.trim()) return;
      await send("POST", "meals", { name: newMeal.value });
      renderSettings();
    } }, "Hinzufügen"))));

  // triggers
  const trigMsg = h("div", { class: "err" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Trigger"),
    h("div", { class: "muted" }, "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar."),
    tstat.error ? h("div", { class: "err" }, `Letzter Fehler (${tstat.error.ts}): ${tstat.error.msg}`) : null,
    h("div", { class: "list" }, triggers.length ? triggers.map(t => {
      const on = h("input", { type: "checkbox", checked: t.enabled, title: "Aktiv", onchange: async () => {
        await send("PUT", "triggers/" + t.id, { kind: t.kind, entity: t.entity, match: t.match, meal_id: t.meal_id || null,
          saved_meal_id: t.saved_meal_id, food_id: t.food_id, profile_id: t.profile_id, extra: t.extra || [], combine: t.combine || "and",
          grams: t.grams, enabled: on.checked,
          negate: !!t.negate, days_ahead: t.days_ahead || 0, part: t.part || "any",
          hold_min: t.hold_min || 0, win_from: t.win_from || "", win_to: t.win_to || "" });
      } });
      return h("div", {}, on,
        h("div", { class: "grow" },
          h("div", {}, condText(t), paused(t) ? h("span", { class: "tag" }, `pausiert bis ${parse(t.paused_until).toLocaleDateString(I18N.locale)}`) : null),
          h("div", { class: "muted" }, `→ ${t.item || "(gelöscht)"}`,
            day.mode === "meals" && t.meal ? h("span", {}, ` zu ${t.meal}`) : null,
            t.days_ahead ? h("span", {}, ` · ${t.days_ahead} Tage im Voraus`) : null,
            t.last_run ? h("span", {}, ` · zuletzt ${parse(t.last_run).toLocaleDateString(I18N.locale)}`) : null)),
        h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => triggerDialog({ edit: t }) }, "✎"),
        h("button", { class: "icon", title: paused(t) ? "Pause beenden" : "Pausieren …", "aria-label": "Pausieren", onclick: () => pauseDialog(t) }, paused(t) ? "▶▶" : "⏸"),
        h("button", { class: "icon", title: "Jetzt testen (trägt heute ein)", onclick: async () => {
          try { await send("POST", `triggers/${t.id}/run`, {}); trigMsg.textContent = ""; alert("Eingetragen."); }
          catch (e) { trigMsg.textContent = e.message; }
        } }, "▶"),
        h("button", { class: "icon", title: "Löschen", onclick: async () => {
          await api("triggers/" + t.id, { method: "DELETE" }); renderSettings();
        } }, "✕"));
    }) : [h("div", { class: "muted", style: "padding:8px 0" }, "Noch keine Trigger.")]),
    trigMsg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: async () => {
        trigMsg.className = "muted";
        trigMsg.textContent = "Prüfe …";
        try {
          const r = await send("POST", "triggers/poll", {});
          trigMsg.textContent = (r.token ? "" : "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt). ")
            + (r.log.length ? r.log.slice(-6).join(" · ") : `Geprüft ${r.last}, nichts zu tun.`);
        } catch (e) { trigMsg.className = "err"; trigMsg.textContent = e.message; }
      } }, "Jetzt prüfen"),
      h("button", { onclick: () => triggerDialog({}) }, "+ Neuer Trigger"))));

  // what triggers entered, with undo
  if (runs.length) root.append(h("details", { class: "card" }, h("summary", {}, "Trigger-Verlauf"),
    h("div", { class: "muted" }, "Was Trigger zuletzt eingetragen haben. „Rückgängig“ entfernt die Einträge wieder; der Trigger trägt an diesem Tag nicht erneut ein."),
    h("div", { class: "list" }, runs.map(r => h("div", {},
      h("div", { class: "grow" }, h("div", {}, `${r.label || "(gelöscht)"}`, h("span", { class: "tag" }, parse(r.day).toLocaleDateString(I18N.locale))),
        h("div", { class: "muted" }, `${r.ts.slice(11)} Uhr · ${r.kind ? condText(r) : "Trigger gelöscht"}`)),
      r.undone ? h("span", { class: "muted" }, "rückgängig")
        : h("button", { class: "flat", disabled: !r.entries, title: r.entries ? "" : "Einträge nicht mehr vorhanden", onclick: async () => {
          await send("POST", `trigger-runs/${r.id}/undo`, {}); renderSettings();
        } }, "Rückgängig"))))));

  // reminder
  const remOn = h("input", { type: "checkbox", checked: rem.enabled });
  const remTime = h("input", { type: "time", value: rem.time, style: "width:auto" });
  const remSvc = h("input", { placeholder: "notify.mobile_app_handy", value: rem.notify });
  const remMsg = h("div", { class: "muted" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Erinnerung"),
    h("div", { class: "muted" }, "Benachrichtigung über Home Assistant, wenn bis zur gewählten Uhrzeit nichts eingetragen wurde."),
    h("label", { class: "pick" }, remOn, "Erinnerung aktiv"),
    h("label", {}, "Uhrzeit"), remTime, h("label", {}, "Benachrichtigungsdienst"), remSvc, remMsg,
    h("div", { class: "actions" }, h("button", { onclick: async () => {
      try { await send("PUT", "reminder", { enabled: remOn.checked, time: remTime.value, notify: remSvc.value.trim() }); remMsg.className = "muted"; remMsg.textContent = "Gespeichert ✓"; }
      catch (e) { remMsg.className = "err"; remMsg.textContent = e.message; }
    } }, "Speichern"))));

  // weekly report
  const wkOn = h("input", { type: "checkbox", checked: wk.enabled });
  const wkDay = h("select", { style: "width:auto" }, ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"].map((d, i) => h("option", { value: i, selected: i === wk.weekday }, d)));
  const wkTime = h("input", { type: "time", value: wk.time, style: "width:auto" });
  const wkMsg = h("div", { class: "muted" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Wochenbericht"),
    h("div", { class: "muted" }, "Einmal pro Woche eine Zusammenfassung der letzten sieben Tage per Benachrichtigung. Nutzt den Benachrichtigungsdienst aus „Erinnerung“."),
    h("label", { class: "pick" }, wkOn, "Wochenbericht aktiv"),
    h("label", {}, "Wochentag"), wkDay, h("label", {}, "Uhrzeit"), wkTime,
    h("label", {}, "Vorschau"), h("div", { class: "muted" }, `${wk.preview.title}: ${wk.preview.text}`), wkMsg,
    h("div", { class: "actions" }, h("button", { onclick: async () => {
      try { await send("PUT", "weekly-report", { enabled: wkOn.checked, weekday: Number(wkDay.value), time: wkTime.value }); wkMsg.className = "muted"; wkMsg.textContent = "Gespeichert ✓"; }
      catch (e) { wkMsg.className = "err"; wkMsg.textContent = e.message; }
    } }, "Speichern"))));

  // automatic backups
  root.append(h("details", { class: "card" }, h("summary", {}, "Automatische Sicherung"),
    h("div", { class: "muted" }, bk.auto
      ? `Täglich eine JSON-Sicherung in ${bk.dir}, Aufbewahrung ${bk.keep_days} Tage (Add-on-Option „backup_keep_days“).`
      : "Aus (Add-on-Option „auto_backup“)."),
    h("div", { class: "list" }, bk.files.length ? bk.files.slice(0, 10).map(f => h("div", {},
      h("div", { class: "grow" }, f.ts, h("span", { class: "muted" }, ` · ${Math.max(1, Math.round(f.size / 1024))} KB`)),
      h("button", { class: "flat", onclick: async () => restoreDialog(await api("backups/" + encodeURIComponent(f.name))) }, "Wiederherstellen")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, "Noch keine Sicherung.")]),
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: async () => { await send("POST", "backups", {}); renderSettings(); } }, "Jetzt sichern"))));

  // external API hint
  root.append(h("div", { class: "card" }, h("h2", {}, "Schnittstelle für Automationen"),
    h("div", { class: "muted" }, ext.enabled
      ? `Aktiv. Deine Benutzer-ID: ${ext.user}. Aufrufbeispiele (rest_command) stehen in der Dokumentation des Add-ons.`
      : "Aus. Zum Einschalten in den Add-on-Optionen einen Schlüssel „api_key“ setzen. Damit können Waage, Sprachassistent oder Automationen Einträge und Gewicht senden.")));

  if (state.admin) await adminCard(root);

  // export for a dietitian or trainer
  const exFrom = h("input", { type: "date", value: iso(new Date(Date.now() - 29 * 864e5)) });
  const exTo = h("input", { type: "date", value: iso(new Date()) });
  const exEntries = h("input", { type: "checkbox" });
  const exQuery = () => `a_from=${exFrom.value}&a_to=${exTo.value}`;
  root.append(h("div", { class: "card" }, h("h2", {}, "Export für Berater und Trainer"),
    h("div", { class: "muted" }, "Ein Bericht zum Ausdrucken oder als PDF (im Druckdialog „Als PDF speichern“ wählen) und eine Tabelle mit den Tageswerten. Enthält nur den gewählten Zeitraum."),
    h("div", { class: "grid" }, h("div", {}, h("label", {}, "Von"), exFrom), h("div", {}, h("label", {}, "Bis"), exTo)),
    h("label", { class: "pick" }, exEntries, "Einzelne Einträge im Bericht auflisten"),
    h("div", { class: "actions", style: "justify-content:flex-start" },
      h("button", { onclick: () => window.open(`api/export/report?${exQuery()}&entries=${exEntries.checked}`, "_blank") }, "Bericht öffnen (Drucken / PDF)"),
      h("button", { class: "flat", onclick: () => { location.href = `api/export/summary.csv?${exQuery()}`; } }, "Tagesübersicht (CSV)"))));

  // data
  root.append(h("div", { class: "card" }, h("h2", {}, "Daten"),
    h("div", { class: "muted" }, "Export/Import betrifft nur dein Benutzerkonto."),
    h("div", { class: "actions", style: "justify-content:flex-start" },
      h("button", { class: "flat", onclick: () => { location.href = "api/export/json"; } }, "Sicherung (JSON)"),
      h("button", { class: "flat", onclick: () => { location.href = "api/export/csv"; } }, "Tagebuch als CSV"),
      h("button", { class: "flat", onclick: () => pickFile(".json,application/json", async f => {
        try { restoreDialog(JSON.parse(await f.text())); }
        catch (e) { alert("Datei nicht lesbar: " + e.message); }
      }) }, "Sicherung einspielen"),
      h("button", { onclick: () => pickFile(".csv,text/csv", mfpDialog) }, "MyFitnessPal-CSV importieren"),
      h("button", { onclick: importMenu }, "Weitere Importe …"),
      h("button", { class: "flat danger", onclick: deleteDataDialog }, "Daten löschen …"))));

  // installed version and update check
  const verOut = h("span", { class: "muted" }, "…");
  const verBtn = h("button", { class: "flat", onclick: async () => {
    verOut.className = "muted"; verOut.textContent = "Prüfe …";
    try {
      const v = await api("version?check=1");
      if (v.error) { verOut.className = "err"; verOut.textContent = "Keine Verbindung zu GitHub."; }
      else if (v.update) { verOut.className = "warn"; verOut.textContent = `Version ${v.latest} ist verfügbar. In Home Assistant unter Einstellungen → Add-ons „Nach Updates suchen“ und aktualisieren.`; }
      else { verOut.className = "muted"; verOut.textContent = "Du hast die aktuelle Version."; }
    } catch (e) { verOut.className = "err"; verOut.textContent = e.message; }
  } }, "Nach Updates suchen");
  root.append(h("div", { class: "card" }, h("h2", {}, "Version"),
    h("div", { class: "ver-row" }, h("span", {}, "Installiert: ", h("b", {}, "…")), verBtn), verOut));
  api("version").then(v => { root.querySelector(".ver-row b").textContent = v.version || "?"; verOut.textContent = ""; }).catch(() => { verOut.textContent = ""; });
  foldCards(root);
}

// Every settings card folds up; which ones are open is remembered per device (the first one is open until chosen otherwise).
function foldCards(root) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("mda-settings-open") || "{}"); } catch { /* private mode: no memory */ }
  const remember = (title, open) => {
    saved[title] = open;
    try { localStorage.setItem("mda-settings-open", JSON.stringify(saved)); } catch { /* private mode */ }
  };
  [...root.children].forEach((card, i) => {
    let det = card;
    if (card.tagName !== "DETAILS") {
      const head = card.firstElementChild;
      if (!head || head.tagName !== "H2") return;
      det = h("details", { class: card.className });
      det.append(h("summary", {}, head.dataset.src || head.textContent), ...[...card.children].slice(1));
      card.replaceWith(det);
    }
    const sum = det.querySelector("summary");
    const title = sum.dataset.src || sum.textContent;
    det.open = title in saved ? !!saved[title] : i === 0;
    det.addEventListener("toggle", () => remember(title, det.open));
  });
}

// Delete parts of the own data, behind a second confirmation.
async function deleteDataDialog() {
  const counts = await api("data/counts");
  const PARTS = [["diary", "Tagebuch", "Einträge, Notizen, Wasser und Aktivität aller Tage"], ["foods", "Lebensmittel", "alle Lebensmittel der Bibliothek (Tagebucheinträge bleiben)"],
    ["saved_meals", "Gespeicherte Mahlzeiten", "alle gespeicherten Mahlzeiten"], ["recipes", "Rezepte", "alle Rezepte samt ihrer Lebensmittel"],
    ["weights", "Gewicht und Körpermaße", "Gewichtswerte, Körpermaße und Fortschrittsfotos"], ["goals", "Tagesziele", "Tagesziel, Wochentagsziele und Profile"],
    ["triggers", "Trigger", "alle Trigger und Mahlzeiten-Regeln samt Verlauf"]];
  const rows = PARTS.map(([k, label, hint]) => ({ k, label, on: h("input", { type: "checkbox", disabled: !counts[k] }), hint, n: counts[k] }));
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "Daten löschen"),
    h("div", { class: "muted" }, "Löscht die gewählten Daten Deines Kontos unwiderruflich. Andere Benutzer und die Einstellungen bleiben unberührt. Lege vorher am besten eine Sicherung (JSON) an."),
    h("div", { class: "list" }, rows.map(r => h("div", {}, h("label", { class: "pick grow" }, r.on, h("span", {}, r.label, ` (${n0(r.n)})`, h("div", { class: "muted" }, r.hint)))))),
    msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { class: "danger", onclick: async () => {
        const chosen = rows.filter(r => r.on.checked);
        if (!chosen.length) { msg.textContent = "Bitte mindestens einen Bereich wählen."; return; }
        if (!confirm(`Wirklich unwiderruflich löschen: ${chosen.map(r => r.label).join(", ")}?`)) return;
        try { await send("POST", "data/delete", { parts: chosen.map(r => r.k) }); dlg.close(); alert("Gelöscht."); await loadCats(); show("diary"); }
        catch (e) { msg.textContent = e.message; }
      } }, "Endgültig löschen")));
  dlg.showModal();
}


// Household meal: put this entry into other people's diaries, each with their own portion.
async function shareDialog(e) {
  const users = await api("household/users");
  const quick = !(e.grams > 0);
  const msg = h("div", { class: "err" });
  const rows = users.map(u => ({ u, on: h("input", { type: "checkbox" }), amt: h("input", { type: "number", step: "any", min: "0.1", value: quick ? 1 : gShow(e.grams), min: "0.05", style: "width:90px;flex:none" }) }));
  setDlg(h("h2", {}, `„${e.name}“ teilen`),
    h("div", { class: "muted" }, quick ? "Portion als Vielfaches des Eintrags (1 = gleich viel). Der Eintrag erscheint am selben Tag im Tagebuch der anderen."
      : ozMode() ? "Menge für jede Person in Unzen. Der Eintrag erscheint am selben Tag im Tagebuch der anderen." : "Menge für jede Person in Gramm. Der Eintrag erscheint am selben Tag im Tagebuch der anderen."),
    rows.length ? h("div", { class: "list" }, rows.map(r => h("div", {}, h("label", { class: "pick grow" }, r.on, r.u.name), r.amt, quick ? "×" : mUnit())))
      : h("div", { class: "muted", style: "padding:8px 0" }, "Noch niemand sonst nimmt am Haushalt teil. Jeder Benutzer schaltet dafür unter Einstellungen → Zusatzfunktionen „Haushalt“ ein."),
    msg,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { disabled: !rows.length, onclick: async () => {
        const targets = rows.filter(r => r.on.checked && num(r.amt.value) > 0).map(r => ({ user: r.u.id, factor: quick ? num(r.amt.value) : gRead(r.amt.value) / e.grams }));
        if (!targets.length) { msg.textContent = "Bitte mindestens eine Person wählen."; return; }
        try { const r = await send("POST", `entries/${e.id}/share`, { targets }); dlg.close(); alert(`Eingetragen bei ${r.shared} Person(en).`); }
        catch (err) { msg.textContent = err.message; }
      } }, "Eintragen")));
  dlg.showModal();
}

// Admin view: who uses the add-on, export or delete a user's data.
async function adminCard(root) {
  const users = await api("admin/users");
  const fmt = s => (s ? parse(s.slice(0, 10)).toLocaleDateString(I18N.locale) : "–");
  const dbo = await api("admin/db").catch(() => null);
  const size = b => (b >= 1048576 ? `${(b / 1048576).toLocaleString(I18N.locale, { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
  const dbMsg = h("div", { class: "muted" });
  const dbCheck = async vacuum => {
    dbMsg.className = "muted"; dbMsg.textContent = "Prüfung läuft …";
    try {
      const r = await send("POST", "admin/db/check", { vacuum });
      dbMsg.className = r.ok ? "muted" : "err";
      dbMsg.textContent = r.ok ? (r.vacuumed ? `Verdichtet: ${size(r.size_before)} → ${size(r.size_after)}` : "Datenbank ist in Ordnung.") : `Datenbank prüfen: ${r.result.join("; ")}`;
    } catch (e) { dbMsg.className = "err"; dbMsg.textContent = e.message; }
  };
  root.append(h("div", { class: "card" }, h("h2", {}, "Benutzerverwaltung"),
    h("div", { class: "muted" }, "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer)."),
    dbo ? [h("label", {}, "Datenbank"),
      h("div", { class: "muted" }, `${size(dbo.size)} · ${dbo.rows} Zeilen in ${Object.keys(dbo.tables).length} Tabellen · frei ${size(dbo.free)} · letzte Sicherung: ${dbo.last_backup || "–"}`),
      h("div", { class: "actions", style: "justify-content:flex-start" },
        h("button", { class: "flat", onclick: () => dbCheck(false) }, "Prüfen"), h("button", { class: "flat", onclick: () => dbCheck(true) }, "Prüfen und verdichten")),
      dbMsg] : null,
    h("div", { class: "lk-wrap" }, h("table", { class: "lk" },
      h("thead", {}, h("tr", {}, ["Benutzer", "Einträge", "Tage", "Lebensmittel", "Zuletzt", ""].map(x => h("th", {}, x)))),
      h("tbody", {}, users.map(u => h("tr", {},
        h("td", {}, u.name || u.id, u.admin ? h("span", { class: "tag" }, "Admin") : null, u.name ? h("div", { class: "muted" }, u.id) : null),
        h("td", {}, String(u.entries)), h("td", {}, String(u.days)), h("td", {}, String(u.foods)), h("td", {}, fmt(u.last_entry || u.last_seen)),
        h("td", {}, h("button", { class: "flat", onclick: () => { location.href = `api/admin/users/${encodeURIComponent(u.id)}/export`; } }, "Export"),
          h("button", { class: "flat danger", onclick: async () => {
            const shown = u.name || u.id;
            const typed = prompt(`Alle Daten von „${shown}“ unwiderruflich löschen? Zur Bestätigung den Namen eingeben:`);
            if (typed == null) return;
            try { await api(`admin/users/${encodeURIComponent(u.id)}?confirm=${encodeURIComponent(typed)}`, { method: "DELETE" }); renderSettings(); }
            catch (err) { alert(err.message); }
          } }, "Löschen")))))))));
}

// Restore a backup: show what would be replaced first.
async function restoreDialog(data) {
  let p;
  try { p = await send("POST", "import/json/preview", { data }); }
  catch (e) { alert("Keine gültige Sicherung: " + e.message); return; }
  const range = s => s.first ? `${parse(s.first).toLocaleDateString(I18N.locale)} – ${parse(s.last).toLocaleDateString(I18N.locale)}` : "–";
  const row = (label, k) => h("tr", {}, h("th", {}, label), h("td", {}, String(p.current[k])), h("td", {}, String(p.backup[k])));
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "Sicherung wiederherstellen"),
    h("div", { class: "muted" }, "Alle jetzigen Daten deines Kontos werden durch die Sicherung ersetzt."),
    h("table", { class: "summary cmp" }, h("thead", {}, h("tr", {}, h("th"), h("th", {}, "Jetzt"), h("th", {}, "Sicherung"))),
      h("tbody", {}, row("Einträge", "entries"), row("Tage", "days"), row("Lebensmittel", "foods"), row("Mahlzeiten", "saved_meals"), row("Gewichtswerte", "weights"),
        h("tr", {}, h("th", {}, "Zeitraum"), h("td", {}, range(p.current)), h("td", {}, range(p.backup))))),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        try { await send("POST", "import/json", { data }); dlg.close(); alert("Wiederhergestellt."); show("diary"); }
        catch (e) { msg.textContent = e.message; }
      } }, "Ersetzen")));
  dlg.showModal();
}

// Touch: swipe left/right in the diary changes the day (tapping an entry edits it).
(() => {
  let x0 = 0, y0 = 0, t0 = 0, track = false;
  const diary = $("#diary");
  diary.addEventListener("touchstart", e => {
    track = e.touches.length === 1 && !e.target.closest("input, select, textarea, button, .hit, svg");
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
  }, { passive: true });
  diary.addEventListener("touchend", e => {
    if (!track || state.tab !== "diary" || dlg.open) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 50 && Date.now() - t0 < 600) shiftDay(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

// Keyboard: ← → change day, T today, N add (first meal), / focus search
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey || dlg.open) return;
  const el = document.activeElement;
  if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.closest("#tabs"))) return;   // the tab bar has its own arrow keys
  const diary = state.tab === "diary";
  if (diary && e.key === "ArrowLeft") { e.preventDefault(); shiftDay(-1); }
  else if (diary && e.key === "ArrowRight") { e.preventDefault(); shiftDay(1); }
  else if (diary && e.key.toLowerCase() === "t") { state.day = iso(new Date()); renderDiary(); }
  else if (diary && e.key.toLowerCase() === "n") { e.preventDefault(); openAdd(state.data.mode === "times" ? null : state.data.meals.find(m => !m.hidden && !m.archived) || state.data.meals[0]); }
  else if (e.key === "/") { const s = document.querySelector(`#${state.tab} input[type=search]`); if (s) { e.preventDefault(); s.focus(); } }
});

api("me").then(m => { $("#who").textContent = m.name; state.admin = !!m.admin; });
(async () => {
  try {
    const st = await api("settings");
    state.skin = st.skin;
    state.features = st.features || {};
    state.langPref = st.lang || "auto";
    I18N.setLang(st.lang, st.units, st.mass);
    state.goalMode = st.goal_mode || "lose";
    state.goalRate = st.goal_rate ?? 0.5;
    state.frequent = st.frequent || "foods";
  } catch { /* keep auto */ }
  applySkin();
  applyTabs();
  await show("diary");
  // per device (a phone shortcut to the panel), so it lives in the browser and not in the user's settings
  if (scanOnOpen()) openAdd(state.data.mode === "times" ? null : state.data.meals.find(m => !m.hidden && !m.archived) || state.data.meals[0], { scan: true });
})();
