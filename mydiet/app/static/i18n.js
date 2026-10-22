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
  "Importiert: {} Tage, {} Einträge, {} Gewichtswerte.": "Imported: {} days, {} entries, {} weight values.",
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

  const api = { lang: "de", locale: "de-DE", units: "metric" };
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
  api.setLang = (lang, units) => {
    if (lang === "auto" || !lang) lang = (navigator.language || "de").toLowerCase().startsWith("en") ? "en" : "de";
    api.lang = lang === "en" ? "en" : "de";
    api.locale = api.lang === "en" ? "en-US" : "de-DE";
    if (units) api.units = units;
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
