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
  "Optik": "Look", "Nach oben": "Move up", "Nach unten": "Move down", "Nur an bestimmten Tagen anzeigen": "Show only on certain days", "Wieder einblenden": "Show again",
  "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)": "Hide (only visible on days with entries)", "Ausblenden": "Hide", "{} – blende sie stattdessen mit ⊘ aus.": "{} – hide it with ⊘ instead.",
  "Neue Mahlzeit, z. B. Nachtschicht": "New meal, e.g. night shift", "nur an Tagen: {}": "only on days: {}", "Regel bearbeiten": "Edit rule", "Regel löschen": "Delete rule",
  "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit.": "With ⚡ you show a meal only on days when, for example, your calendar has a certain event. With ⊘ you hide it permanently (it stays visible only on days with entries); only an empty meal can be deleted.",
  "Trigger": "Triggers", "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar.": "Log foods or meals automatically when Home Assistant reports something (location, calendar, switch …). Can also be created via ⚡ on foods.",
  "Letzter Fehler ({}): {}": "Last error ({}): {}", "Aktiv": "Active", "pausiert bis {}": "paused until {}", "· {} Tage im Voraus": "· {} days ahead", "· zuletzt {}": "· last {}",
  "Pausieren …": "Pause …", "Jetzt testen (trägt heute ein)": "Test now (logs for today)", "Eingetragen.": "Logged.", "Noch keine Trigger.": "No triggers yet.", "Prüfe …": "Checking …",
  "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt).": "No Home Assistant access (SUPERVISOR_TOKEN missing).", "Geprüft {}, nichts zu tun.": "Checked {}, nothing to do.",
  "Jetzt prüfen": "Check now", "+ Neuer Trigger": "+ New trigger", "Trigger-Verlauf": "Trigger history",
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
  "Kategorie für die importierten Lebensmittel": "Category for the imported foods", "Vorhandene Lebensmittel mit gleichem Namen und gleicher Marke bleiben unverändert.": "Existing foods with the same name and brand stay unchanged.",
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
  // v1.0 server messages
  "Ungültige Entität": "Invalid entity", "Wert außerhalb des Bereichs": "Value out of range", "Nur im Home-Assistant-Add-on möglich": "Only possible inside the Home Assistant add-on",
  "Leere Datei": "Empty file", "Die Datei konnte nicht gelesen werden.": "The file could not be read.", "Die Excel-Datei enthält kein Tabellenblatt.": "The Excel file contains no worksheet.",
  "Zu viele Zeilen (höchstens 50 000)": "Too many rows (50,000 at most)", "Spalten für Name und Kalorien (kcal oder kJ) zuordnen": "Assign columns for name and calories (kcal or kJ)",

  // default meals
  "Frühstück": "Breakfast", "Mittagessen": "Lunch", "Abendessen": "Dinner", "Snacks": "Snacks",
};

const I18N = (() => {
  const exact = new Map(), pats = [];
  for (const [k, v] of Object.entries(EN)) {
    if (!k.includes("{}")) { exact.set(k, v); continue; }
    const parts = k.split("{}").map(p => p.replace(/[.*+?^$()|[\]\\]/g, "\\$&"));
    const weight = k.replace(/\{\}/g, "").length;
    // very short templates ("Alle {}") only match a single token so they cannot swallow whole sentences
    pats.push({ re: new RegExp("^" + parts.join(weight < 8 ? "(\\S+(?: \\S+){0,2})" : "([\\s\\S]*?)") + "$"), to: v, weight });
  }
  pats.sort((a, b) => b.weight - a.weight);

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
    if (api.lang !== "en" || typeof s !== "string" || !s) return s;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    if (!m[2]) return s;
    let r = find(m[2]);
    if (r == null && m[2].includes("\n")) r = m[2].split("\n").map(l => (l.trim() ? api.tr(l) : l)).join("\n");
    return r == null ? s : m[1] + r + m[3];
  };

  const ATTRS = ["placeholder", "title", "aria-label", "alt", "data-tip"];
  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA"]);
  const fixText = n => { const t = api.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; };
  const fixAttr = (el, a) => { const v = el.getAttribute(a); if (v) { const t = api.tr(v); if (t !== v) el.setAttribute(a, t); } };
  const walk = node => {
    if (node.nodeType === 3) return fixText(node);
    if (node.nodeType !== 1 || SKIP.has(node.tagName)) return;
    for (const a of ATTRS) fixAttr(node, a);
    node.childNodes.forEach(walk);
  };
  let obs = null;
  api.setLang = (lang, units, mass) => {
    if (lang === "auto" || !lang) lang = (navigator.language || "de").toLowerCase().startsWith("en") ? "en" : "de";
    api.lang = lang === "en" ? "en" : "de";
    api.locale = api.lang === "en" ? "en-US" : "de-DE";
    if (units) api.units = units;
    if (mass) api.mass = mass;
    document.documentElement.lang = api.lang;
    if (api.lang === "en" && !obs) {
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
    if (api.lang === "en") walk(document.body);
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
  return e;
};
const api = async (path, opts) => {
  const r = await fetch("api/" + path, opts);
  if (!r.ok) {
    let msg = r.status;
    try { msg = (await r.json()).detail || msg; } catch { /* keep status */ }
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
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

// ---------------------------------------------------------------- tabs
$("#tabs").addEventListener("click", e => {
  const t = e.target.closest("button");
  if (t) show(t.dataset.tab);
});
function show(tab) {
  state.tab = tab;
  for (const b of document.querySelectorAll("#tabs button")) b.classList.toggle("active", b.dataset.tab === tab);
  for (const s of document.querySelectorAll("main > section")) s.hidden = s.id !== tab;
  ({ diary: renderDiary, foods: renderFoods, meals: renderMeals, weight: renderWeight, stats: renderStats, settings: renderSettings, recipes: renderRecipes })[tab]();
}

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
  const [d, trackers, sched, act] = await Promise.all([api("day/" + state.day), state.features.trackers ? api("trackers?day=" + state.day) : [],
    state.features.schedule && isToday ? api("schedule").catch(() => null) : null,
    state.features.activity ? api("activity?day=" + state.day).catch(() => null) : null, loadCats()]);
  state.data = d;
  const times = d.mode === "times";
  const root = $("#diary");
  root.replaceChildren();

  const label = parse(state.day).toLocaleDateString(I18N.locale,
    { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const picker = h("input", { type: "date", value: state.day, onchange: e => {
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
    d.entries.length ? h("button", { class: "flat", onclick: () => dayCopyDialog() }, "Ganzen Tag kopieren") : null));
  if (state.features.trackers && trackers.length) root.append(trackerCard(trackers));
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
      stream = st; video.srcObject = st;
      box.replaceChildren(video, h("div", { class: "muted" }, "Halte den Barcode ins Bild."), cancel);
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
        return h("td", { class: Math.abs(d) > 15 ? "over" : "muted" }, `${d > 0 ? "+" : ""}${n0(d)} %`); };
      out.replaceChildren(
        Object.entries(res.errors || {}).map(([s, m]) => h("div", { class: "muted" }, `${SRC[s] || s}: ${m}`)),
        rows.length ? h("div", { class: "lk-wrap" }, h("table", { class: "lk" },
          h("thead", {}, h("tr", {}, h("th"), h("th", {}, "Quelle"), h("th", {}, "Name"), h("th", {}, "kcal"), h("th", {}, "KH"), h("th", {}, "Fett"),
            h("th", {}, "Eiweiß"), h("th", { title: "Abweichung der kcal von dem Wert im Formular" }, "Abweichung"), h("th"))),
          h("tbody", {}, rows.map(({ r, box }) => h("tr", {}, h("td", {}, box), h("td", {}, SRC[r.source] || r.source),
            h("td", {}, r.name, r.brand ? h("div", { class: "muted" }, r.brand) : null),
            h("td", {}, n0(r.kcal)), h("td", {}, n1(r.carbs)), h("td", {}, n1(r.fat)), h("td", {}, n1(r.protein)), dev(r),
            h("td", {}, h("button", { class: "flat", onclick: () => apply([r]) }, "Übernehmen"))))))) : h("div", { class: "muted" }, "Nichts gefunden."),
        rows.length ? h("div", { class: "muted" }, "Alle Werte pro 100 g.") : null,
        spread > 15 ? h("div", { class: "warn" }, `Die Quellen weichen bei kcal um bis zu ${n0(spread)} % voneinander ab – bitte prüfen.`) : null,
        rows.length > 1 ? h("div", { class: "actions", style: "justify-content:flex-start" }, h("button", { class: "flat", onclick: () => {
          const sel = rows.filter(x => x.box.checked).map(x => x.r);
          if (sel.length) apply(sel);
        } }, "Mittelwert der gewählten übernehmen")) : null);
    }
    return h("div", { class: "lookup" }, h("label", {}, "Online suchen & vergleichen"),
      h("div", { class: "grid", style: "grid-template-columns:1fr auto" }, q, h("button", { class: "flat", onclick: run }, "Suchen")),
      h("div", { class: "range" }, Object.entries(SRC).map(([k, l]) => h("label", { class: "pick" }, use[k], l))), out);
  }
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
    warn, msg, catList(),
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
async function openAdd(meal) {
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
    const frequent = tab === "foods" ? sugg.items : tab === "saved" ? sugg.saved.filter(isVisible) : [];
    sug.replaceChildren(...(!q && frequent.length ? [h("div", { class: "muted sect" }, "Häufig verwendet"),
      ...frequent.map(x => h("button", { class: "food", onclick: () => (tab === "foods" ? selectEntry(x) : selectSaved(x)) },
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
  body.append(tabs, search, scanBox, chips, sug, results,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => newFood() }, "+ Neues Lebensmittel"),
      h("button", { class: "flat", onclick: async () => {
        scanBox.replaceChildren();
        try { await found(await scanBarcode(scanBox)); } catch (e) { if (e.message !== "Abgebrochen") scanBox.replaceChildren(h("div", { class: "err" }, e.message)); }
      } }, "Barcode scannen"),
      h("button", { class: "flat", onclick: () => photoIn.click() }, "Foto vom Barcode"), photoIn,
      h("button", { class: "flat", onclick: () => quickDialog(meal) }, "Schnelleingabe (nur kcal)"),
      h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  setDlg(h("h2", {}, meal ? "Zu „" + meal.name + "“ hinzufügen" : "Eintrag hinzufügen"),
    times ? h("div", { style: "margin-bottom:8px" }, h("label", {}, "Uhrzeit"), time) : null, body, detail);
  draw();
  dlg.showModal();
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
        plausibility(f) ? h("span", { class: "warn-mark", title: plausibility(f) }, "⚠") : null),
        h("div", { class: "muted" }, `${n0(f.kcal)} kcal · KH ${n1(f.carbs)} g · Fett ${n1(f.fat)} g · Eiweiß ${n1(f.protein)} g (pro 100 g)`, f.barcode ? ` · ${f.barcode}` : "")),
      h("button", { class: "icon fav" + (f.favorite ? " on" : ""), title: f.favorite ? "Favorit entfernen" : "Als Favorit markieren", "aria-label": "Favorit", onclick: async () => {
        f.favorite = f.favorite ? 0 : 1;
        await send("PUT", `foods/${f.id}/favorite`, { favorite: !!f.favorite });
        draw();
      } }, f.favorite ? "★" : "☆"),
      h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", onclick: () => triggerDialog({ item: "f:" + f.id }) }, "⚡"),
      state.features.household ? h("button", { class: "icon", title: "Mit dem Haushalt teilen", "aria-label": "Teilen", onclick: () => shareLibrary("foods", f) }, "⇪") : null,
      h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => openForm(f) }, "✎"),
      h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
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
  const foods = await api("foods?limit=1000");
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
  ["carbs", "Kohlenhydrate"], ["fat", "Fett"], ["fiber", "Ballaststoffe"], ["sugar", "Zucker"], ["salt", "Salz"], ["sodium", "Natrium"], ["sat_fat", "ges. Fettsäuren"]];

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
    sample, h("label", {}, "Kategorie für die importierten Lebensmittel"), category,
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
async function renderMeals() {
  const [saved] = await Promise.all([api("saved-meals"), loadCats()]);
  const root = $("#meals");
  root.replaceChildren();
  const list = h("div", { class: "list" });
  const chips = h("div");

  // Edit name/category and the components of a saved meal: change amounts, swap or remove foods, add new ones.
  const editSaved = (s, draft = { name: s.name, category: s.category, items: s.items.map(i => ({ ...i })) }) => {
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
          if (idx == null) draft.items.push(foodItem(f, g)); else draft.items[idx] = foodItem(f, g);
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
      return h("div", {}, h("div", { class: "grow" }, it.name, " ", kc), g, g ? mUnit() : null,
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
      total, msg,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
        h("button", { onclick: async () => {
          if (!draft.name.trim()) { msg.textContent = "Bitte einen Namen angeben."; return; }
          try {
            await send("PUT", "saved-meals/" + s.id, { name: draft.name, category: draft.category, items: draft.items.map(i => ({
              name: i.name, grams: i.grams, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat,
              fiber: i.fiber || 0, sugar: i.sugar || 0, salt: i.salt || 0, sat_fat: i.sat_fat || 0 })) });
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
      h("div", { class: "grow" }, h("div", {}, s.name, tag(s.category)),
        h("div", { class: "muted" }, `${n0(s.kcal)} kcal · KH ${n1(s.carbs)} g · Fett ${n1(s.fat)} g · Eiweiß ${n1(s.protein)} g`),
        h("div", { class: "muted" }, s.items.map(entryLabel).join(" · "))),
      h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", onclick: () => triggerDialog({ item: "s:" + s.id }) }, "⚡"),
      state.features.household ? h("button", { class: "icon", title: "Mit dem Haushalt teilen", "aria-label": "Teilen", onclick: () => shareLibrary("saved-meals", s) }, "⇪") : null,
      h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => editSaved(s) }, "✎"),
      h("button", { class: "icon", title: "Kopie anlegen", "aria-label": "Kopieren", onclick: async () => {
        const { id } = await send("POST", `saved-meals/${s.id}/copy`);
        await renderMeals();
        const copy = (await api("saved-meals")).find(x => x.id === id);
        if (copy) editSaved(copy);
      } }, "⧉"),
      h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`Mahlzeit „${s.name}“ löschen?`)) return;
        await api("saved-meals/" + s.id, { method: "DELETE" }); renderMeals();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, saved.length ? "Nichts gefunden." : "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.")]));
  };

  const search = h("input", { type: "search", placeholder: "Mahlzeiten suchen…", oninput: draw });
  root.append(h("div", { class: "card" }, search, chips, list));
  draw();
}


// ---------------------------------------------------------------- recipes page (optional)
async function renderRecipes() {
  const [recipes] = await Promise.all([api("recipes"), loadCats()]);
  const root = $("#recipes");
  root.replaceChildren();
  const list = h("div", { class: "list" });
  const chips = h("div");

  const editRecipe = (r, draft = r ? { name: r.name, category: r.category, portions: r.portions, cooked_g: r.cooked_g, items: r.items.map(i => ({ ...i })) }
    : { name: "", category: "", portions: 2, cooked_g: null, items: [] }) => {
    const name = h("input", { value: draft.name, oninput: () => { draft.name = name.value; } });
    const category = h("input", { list: "cat-list", value: draft.category, oninput: () => { draft.category = category.value; } });
    const portions = h("input", { type: "number", step: "any", min: "0.1", value: draft.portions, oninput: () => { draft.portions = num(portions.value); drawTotal(); } });
    const cooked = h("input", { type: "number", step: "any", min: gMin(), placeholder: "wie Summe der Zutaten", value: draft.cooked_g ? gShow(draft.cooked_g) : "",
      oninput: () => { draft.cooked_g = gRead(cooked.value); drawTotal(); } });
    const msg = h("div", { class: "err" });
    const total = h("div", { class: "preview" });
    const sum = k => draft.items.reduce((a, i) => a + (i[k] || 0), 0);
    function drawTotal() {
      const p = draft.portions > 0 ? draft.portions : 1;
      const g = draft.cooked_g > 0 ? draft.cooked_g : sum("grams");
      total.replaceChildren(h("div", { class: "muted" }, `Gesamt: ${gText(g)}`),
        h("span", {}, h("b", {}, n0(sum("kcal") / p)), " kcal"), h("span", {}, h("b", {}, n0(sum("carbs") / p)), " g KH"),
        h("span", {}, h("b", {}, n0(sum("fat") / p)), " g Fett"), h("span", {}, h("b", {}, n0(sum("protein") / p)), " g Eiweiß"),
        h("div", { class: "muted" }, `pro Portion (${gText(g / p)})`));
    }
    drawTotal();
    const swap = (idx, title) => setDlg(foodSwapDialog({
      title, grams: idx == null ? null : draft.items[idx].grams, confirm: idx == null ? "Hinzufügen" : "Tauschen",
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
      return h("div", {}, h("div", { class: "grow" }, it.name, " ", kc), g, mUnit(),
        h("button", { class: "icon edit", title: "Durch anderes Lebensmittel tauschen", "aria-label": "Tauschen", onclick: () => swap(idx, `„${it.name}“ tauschen`) }, "⇄"),
        h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", onclick: () => { draft.items.splice(idx, 1); editRecipe(r, draft); } }, "✕"));
    });
    setDlg(h("h2", {}, r ? "Rezept bearbeiten" : "Neues Rezept"),
      h("label", {}, "Name"), name, h("label", {}, "Kategorie"), category, catList(),
      h("div", { class: "grid" }, h("div", {}, h("label", {}, "Portionen"), portions), h("div", {}, h("label", {}, ozMode() ? "Gewicht fertig (oz, optional)" : "Gewicht fertig (g, optional)"), cooked)),
      h("label", { style: "margin-top:12px" }, "Zutaten"),
      h("div", { class: "list" }, rows.length ? rows : [h("div", { class: "muted" }, "Noch keine Zutaten.")]),
      h("button", { class: "flat", onclick: () => swap(null, "Zutat hinzufügen") }, "+ Zutat"),
      total, msg,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
        h("button", { onclick: async () => {
          const body = { name: draft.name, category: draft.category, portions: draft.portions || 0, cooked_g: draft.cooked_g || null,
            items: draft.items.map(i => ({ name: i.name, grams: i.grams, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat,
              fiber: i.fiber || 0, sugar: i.sugar || 0, salt: i.salt || 0, sat_fat: i.sat_fat || 0 })) };
          try { await send(r ? "PUT" : "POST", "recipes" + (r ? "/" + r.id : ""), body); dlg.close(); renderRecipes(); }
          catch (e) { msg.textContent = e.message; }
        } }, "Speichern")));
    if (!dlg.open) dlg.showModal();
  };

  const draw = () => {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
    const q = search.value.toLowerCase();
    const shown = recipes.filter(isVisible).filter(r => r.name.toLowerCase().includes(q));
    list.replaceChildren(...(shown.length ? shown.map(r => h("div", {},
      h("div", { class: "grow" }, h("div", {}, r.name, tag(r.category)),
        h("div", { class: "muted" }, `Pro Portion (${gText(r.portion_g)}): ${n0(r.portion.kcal)} kcal · KH ${n1(r.portion.carbs)} g · Fett ${n1(r.portion.fat)} g · Eiweiß ${n1(r.portion.protein)} g · ${n1(r.portions)} Portionen`),
        h("div", { class: "muted" }, r.items.map(i => `${i.name} ${gText(i.grams)}`).join(" · "))),
      h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", disabled: !r.food_id, onclick: () => triggerDialog({ item: "f:" + r.food_id }) }, "⚡"),
      h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => editRecipe(r) }, "✎"),
      h("button", { class: "icon", title: "Kopie anlegen", "aria-label": "Kopieren", onclick: async () => {
        const { id } = await send("POST", `recipes/${r.id}/copy`);
        await renderRecipes();
        const copy = (await api("recipes")).find(x => x.id === id);
        if (copy) editRecipe(copy);
      } }, "⧉"),
      h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`Rezept „${r.name}“ löschen? Das zugehörige Lebensmittel wird ebenfalls gelöscht, bereits eingetragene Mahlzeiten bleiben erhalten.`)) return;
        await api("recipes/" + r.id, { method: "DELETE" }); renderRecipes();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, recipes.length ? "Nichts gefunden." : "Noch kein Rezept angelegt.")]));
  };

  const search = h("input", { type: "search", placeholder: "Rezepte suchen…", oninput: draw });
  root.append(h("div", { class: "card" },
    h("div", { class: "grid", style: "grid-template-columns:1fr auto" }, search, h("button", { onclick: () => editRecipe(null) }, "+ Neues Rezept")),
    h("div", { class: "muted", style: "margin-top:8px" }, "Jedes Rezept erscheint auch unter Lebensmittel (pro 100 g, mit „1 Portion“) und lässt sich überall eintragen. Änderungen am Rezept aktualisieren dieses Lebensmittel."),
    chips, list));
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
  root.append(
    rangeButtons([[7, "7 Tage"], [30, "30 Tage"], [90, "90 Tage"], [180, "180 Tage"], [365, "1 Jahr"]], state.range, v => { state.range = v; renderStats(); }),
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
  const field = (key) => h("input", { type: "date", value: state.cmp[key], onchange: e => { if (e.target.value) { state.cmp[key] = e.target.value; load(); } } });
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
      : `${q.items} Einträge, ${q.weights} Gewichtswerte${q.from ? ` (${q.from} bis ${q.to})` : ""} aus ${q.count} Zeilen.`;
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
  const [goal, day, triggers, rules, runs, tstat, bk, rem, ext] = await Promise.all([api("goal"), api("day/" + state.day), api("triggers"), api("meal-triggers"), api("trigger-runs?limit=15"),
    api("triggers/status"), api("backups"), api("reminder"), api("ext/info")]);
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

  const langSel = h("select", {}, h("option", { value: "auto" }, "Automatisch (Browser)"), h("option", { value: "de" }, "Deutsch"), h("option", { value: "en" }, "English"));
  const unitSel = h("select", {}, h("option", { value: "metric" }, "Metrisch (kg, cm)"), h("option", { value: "imperial" }, "Imperial (lb, in)"));
  const massSel = h("select", {}, h("option", { value: "g" }, "Gramm"), h("option", { value: "oz" }, "Unzen (oz)"));
  langSel.value = state.langPref || "auto"; unitSel.value = I18N.units; massSel.value = I18N.mass;
  const savePref = async () => { await send("PUT", "settings", { lang: langSel.value, units: unitSel.value, mass: massSel.value }); location.reload(); };
  root.append(h("div", { class: "card" }, h("h2", {}, "Sprache und Einheiten"),
    h("div", { class: "grid" }, h("div", {}, h("label", {}, "Sprache"), langSel), h("div", {}, h("label", {}, "Einheiten"), unitSel), h("div", {}, h("label", {}, "Lebensmittelmengen"), massSel)),
    h("div", { class: "actions" }, h("button", { onclick: savePref }, "Speichern"))));

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
      feat("schedule", "Mahlzeiten-Zeitplan", "Zeitfenster pro Mahlzeit: das Tagebuch zeigt, welche Mahlzeit gerade ansteht, und erinnert auf Wunsch per Benachrichtigung."),
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
  root.append(h("div", { class: "card" }, h("h2", {}, "Darstellung"),
    h("label", {}, "Tagebuch"), mode,
    h("div", { class: "muted", style: "margin-top:8px" },
      "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende."),
    h("label", { style: "margin-top:12px" }, "Optik"), skin));

  // meals
  const meals = day.meals;
  const sched = state.features.schedule ? await api("schedule").catch(() => null) : null;
  const mealMsg = h("div", { class: "err" });
  const mealList = h("div", { class: "list" }, meals.map((m, i) => {
    const name = h("input", { value: m.name, onchange: async () => {
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
  if (runs.length) root.append(h("div", { class: "card" }, h("h2", {}, "Trigger-Verlauf"),
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

  // automatic backups
  root.append(h("div", { class: "card" }, h("h2", {}, "Automatische Sicherung"),
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
      h("button", { onclick: importMenu }, "Weitere Importe …"))));
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
  root.append(h("div", { class: "card" }, h("h2", {}, "Benutzerverwaltung"),
    h("div", { class: "muted" }, "Nur für Administratoren sichtbar (Add-on-Option „admin_users“; leer = der erste Benutzer)."),
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
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
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
  } catch { /* keep auto */ }
  applySkin();
  applyTabs();
  show("diary");
})();
