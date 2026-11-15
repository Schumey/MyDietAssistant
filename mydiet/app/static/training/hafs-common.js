// Shared helpers of the HAFS panel: texts, number/date formats and the two chart types.
// No build step, no dependencies. Kept free of Home Assistant specifics so that other surfaces
// (a dashboard card, the MyDietAssistant shell) can reuse it later.

export const STRINGS = {
  de: {
    title: "Training", tab_today: "Heute", tab_history: "Verlauf", tab_stats: "Statistik", tab_plans: "Pläne", tab_settings: "Einstellungen",
    loading: "Lade …", retry: "Erneut versuchen", back: "Zurück", more: "Ältere anzeigen",
    not_loaded: "HAFS ist nicht geladen. Ist die Integration eingerichtet?", load_failed: "Konnte nicht laden: {0}",
    running_since: "Workout läuft seit {0}", next_up: "Als Nächstes", next_program: "aus „{0}“",
    done_today: "Heute trainiert", done_line: "Heute schon trainiert: {0}", rest_day: "Kein Training geplant", no_plan: "Noch kein Trainingsplan. Lege Trainingstage in der App oder hier unter Pläne an.",
    sets_short: "{0}×{1}", reps_range: "{0}–{1}", superset: "Supersatz {0}",
    workouts_week: "Workouts diese Woche", volume_week: "Volumen diese Woche", last_workout: "Letztes Workout", never: "noch keins",
    phase: "Phase", phase_bulk: "Masse", phase_maintain: "Halten", phase_cut: "Diät", phase_none: "unbekannt",
    phase_auto: "Aus MyDietAssistant", phase_manual_label: "Von Hand",
    sets_by_muscle: "Sätze je Muskelgruppe", this_week: "Diese Woche", average: "Ø {0} Wochen", no_sets: "In diesem Zeitraum noch keine Sätze.",
    muscle_hint: "Hauptmuskeln zählen voll, Nebenmuskeln halb, Aufwärmsätze nicht.",
    recent: "Zuletzt", workouts_per_week: "Workouts pro Woche", weeks_n: "{0} Wochen", weeks_n_short: "{0} Wo.",
    workout: "Workout", free_workout: "Freies Workout", unfinished: "nicht beendet", imported: "importiert",
    sets: "Sätze", volume: "Volumen", duration: "Dauer", minutes: "{0} min", gym: "Studio", note: "Notiz", set_note: "Notiz",
    warmup: "Aufwärmen", drop: "Drop", failure: "Versagen", target: "Ziel", empty_history: "Noch keine Workouts.",
    muscles: "Muskelgruppen", exercises: "Übungen", search_exercise: "Übung suchen", no_match: "Nichts gefunden.",
    filter_times: "Wie oft trainiert", filter_last: "Zuletzt gemacht", min_times_any: "beliebig oft", min_times_n: "mindestens {0} Workouts", within_any: "irgendwann", within_months: "in den letzten {0} Monaten", shown_of: "{0} von {1} Übungen", times_n: "{0}×",
    sessions: "Workouts", metric_e1rm: "Geschätztes 1RM", metric_weight: "Gewicht", metric_volume: "Volumen", metric_reps: "Wiederholungen", metric_duration: "Dauer",
    range_3: "3 Monate", range_12: "12 Monate", range_all: "Alles", records: "Rekorde", best_weight: "Schwerstes Gewicht", best_e1rm: "Bestes 1RM",
    best_volume: "Meistes Volumen", best_reps: "Meiste Wiederholungen", suggestion: "Vorschlag fürs nächste Mal", last_sessions: "Letzte Workouts",
    intake_low_kcal: "Heute erst {0} kcal gegessen. Vor dem Training etwas essen?", intake_low_carbs: "Heute erst {1} g Kohlenhydrate. Vor dem Training etwas essen?",
    card_exercise_missing: "Übung „{0}“ nicht gefunden.",
    e1rm_hint: "Epley, nur Sätze mit 1 bis 12 Wiederholungen.", no_data: "Zu wenig Daten für ein Diagramm.",
    program: "Trainingsplan", routines: "Trainingstage", loose_routines: "Trainingstage ohne Plan", weekdays: "Wochentage", rotation: "Rotation",
    gyms: "Studios", equipment: "Geräte", out_of_order: "außer Betrieb", steps: "Stufen", no_gyms: "Noch kein Studio angelegt.",
    settings_phase: "Ernährungsphase", settings_phase_hint: "Bestimmt, wie früh das Gewicht steigt oder sinkt. „Automatisch“ nimmt die Phase aus MyDietAssistant.",
    phase_auto_opt: "Automatisch", hit_fraction: "Gewicht steigern, wenn …", hit_all: "alle Sätze die Obergrenze erreichen", hit_75: "drei Viertel der Sätze sie erreichen", hit_50: "die Hälfte der Sätze sie erreicht",
    cut_drop_set: "Diät: erst einen Satz streichen, dann Gewicht senken", saved: "Gespeichert",
    import_title: "Import", import_hint: "CSV-Export aus GymRun, Strong oder Hevy (das Format wird erkannt). Erst ein Probelauf, dann der Import; Vorhandenes wird übersprungen.",
    import_pick: "CSV wählen", import_dry: "Probelauf", import_run: "Importieren", import_done: "Importiert: {0} Workouts, {1} Sätze.",
    import_too_big: "Die Datei ist größer als 3,5 MB; Home Assistant nimmt sie so nicht an.",
    sum_rows: "Zeilen", sum_sets: "Sätze", sum_workouts: "Workouts", sum_exercises: "Übungen", sum_duplicates: "Doppelte", sum_first: "Erstes", sum_last: "Letztes", sum_warnings: "Hinweise",
    export_title: "Export", export_json: "Alles als JSON herunterladen",
    edit: "Bearbeiten", save: "Speichern", cancel: "Abbrechen", delete: "Löschen", add: "Hinzufügen", remove: "Entfernen", move_up: "Nach oben", move_down: "Nach unten",
    new_program: "Trainingsplan anlegen", new_routine: "Trainingstag anlegen", new_gym: "Studio anlegen", new_equipment: "Gerät hinzufügen",
    edit_program: "Trainingsplan bearbeiten", edit_routine: "Trainingstag bearbeiten", edit_gym: "Studio bearbeiten",
    name: "Name", routine_program: "Trainingsplan", no_program: "Kein Trainingsplan", add_exercise: "Übung hinzufügen", exercise_search: "Übung suchen",
    sets_label: "Sätze", reps_label: "Wiederholungen", reps_from: "von", reps_to: "bis", reps_target: "Ziel-Wiederholungen", use_range: "Bereich statt Ziel", use_target: "Ein Ziel statt Bereich", superset_prev: "Supersatz mit der Übung darüber", no_exercises: "Noch keine Übungen.",
    rhythm: "Wochentage", rhythm_hint: "Leer = Rotation. Sonst genau ein Tag je Trainingstag, der Reihe nach.", add_routine: "Trainingstag hinzufügen", no_free_routines: "Keine freien Trainingstage.",
    equipment_name: "Gerät", equipment_type: "Art", equipment_steps: "Gewichtsstufen", equipment_steps_hint: "z. B. 5-100/5 (von 5 bis 100 in 5er-Schritten) oder 20 22,5 25",
    out_of_order_check: "außer Betrieb", row_gear: "Geräte", row_gear_none: "keine", row_gear_edit: "Geräte bearbeiten", row_gear_close: "Zuklappen", row_gear_hint: "Einer Übung kannst Du mehrere Geräte zuweisen, z. B. Langhantel an der Flachbank oder die Maschine. Beim Training wählst Du in der App, welches Du benutzt; Verlauf und Vorschläge gelten je Gerät. Die Stufen gelten für alle Übungen, die das Gerät benutzen.", gym_zone: "Zone (Studio-Erkennung)", gym_zone_hint: "Eine Zone aus Home Assistant, z. B. zone.cleverfit. Ist Deine Person in der Zone, wählt die App dieses Studio vor.", no_equipment: "Noch keine Geräte.",
    stack_steps: "Stufen des Blocks", stack_steps_hint: "z. B. 7-98/7 (Stufe 7 kg) oder 5 10 15", stack_extra: "Zusatzgewicht (optional, kg)", stack_extra_hint: "Zuschaltbares Gewicht, z. B. 2,5: jede Stufe gibt es dann auch plus 2,5 kg.",
    plate_base: "Grundgewicht (Schlitten oder Hebel, kg)", plates: "Vorhandene Scheiben (kg)", plates_hint: "Eine Seite genügt, z. B. 25 20 15 10 5 2,5 1,25", plate_max: "Höchstes Gewicht (optional, kg)", plate_both: "Scheiben auf beiden Seiten",
    bar_weight: "Stange (kg)", stock_plates: "Scheiben je Seite (kg)", stock_hint: "10x2 = zwei 10er, z. B. 25 20 15 10x2 5x2 2,5; dann nur noch ladbare Gewichte. Leer: die Stufen unten.", stock_summary: "Stange {0} kg, {1} Scheiben",
    plate_summary: "{0} kg + Scheiben", extra_summary: "+ {0} kg zuschaltbar",
    type_machine: "Maschine (allgemein)", type_machine_stack: "Maschine, Gewichtsblock (Stack)", type_machine_plate: "Maschine, Scheiben (Plate-Loaded)", type_cable: "Kabelzug", type_barbell: "Langhantel", type_dumbbell: "Kurzhanteln", type_bodyweight: "Körpergewicht", type_kettlebell: "Kettlebell", type_band: "Band", type_cardio: "Cardio", type_other: "Sonstiges",
    confirm_delete_program: "Trainingsplan „{0}“ löschen? Die Trainingstage bleiben erhalten.", confirm_delete_routine: "Trainingstag „{0}“ löschen?", confirm_delete_gym: "Studio „{0}“ mit allen Geräten löschen?",
    err_name: "Bitte einen Namen eingeben.", err_numbers: "Sätze und Wiederholungen prüfen ({0}): ganze Zahlen, „von“ höchstens „bis“.", err_rhythm: "Ein Wochentag je Trainingstag nötig: Die Zahl der Wochentage und der Trainingstage stimmt nicht.", err_steps: "Gewichtsstufen von „{0}“ nicht lesbar.", err_plates: "Scheiben von „{0}“ prüfen: Grundgewicht, Scheibengrößen (größer als 0) und ein Höchstgewicht über dem Grundgewicht.", err_extra: "Zusatzgewicht von „{0}“ prüfen: eine Zahl größer als 0, zusammen mit Stufen des Blocks.",
    save_failed: "Nicht gespeichert: {0}", saved_edit: "Gespeichert", deleted: "Gelöscht", sync_note: "Die App bekommt die Änderung beim nächsten Abgleich.",
    plans_intro_plan: "Ein Trainingsplan ist die Folge deiner Trainingstage, zum Beispiel „Pull / Legs / Push“, entweder reihum oder mit festen Wochentagen.",
    plans_intro_day: "Ein Trainingstag ist ein einzelner Tag daraus, zum Beispiel „Pull“, mit seinen Übungen, Sätzen und Wiederholungen.",
    weight_label: "Nächstes Gewicht (kg)",
    weight_hint: "Einmalige Vorgabe für das nächste Training; danach rechnet die Progression wieder selbst.",
    rest_label: "Pause",
    rest_global: "wie global",
    rest_off: "keine",
    rest_s: "{0} s",
    rest_row: "Pause {0} s",
    warmup_label: "Aufwärmen",
    warm_sets: "Sätze",
    warm_reps: "Wdh.",
    warm_pct: "% vom Arbeitsgewicht",
    warm_hint: "Leer lassen für keine Aufwärmsätze. Das Gewicht richtet sich nach dem Arbeitsgewicht und folgt der Progression.",
    warmup_row: "Aufwärmen {0}×{1} mit {2} %",
    err_warmup: "Aufwärmsätze von „{0}“ prüfen: Sätze (1 bis 6), Wiederholungen und Prozent (10 bis 95) angeben.",
    err_weight: "Gewicht von „{0}“ prüfen: eine Zahl von 0 bis 1000.",
    err_rest: "Pause von „{0}“ prüfen (0 bis 600 Sekunden).",
    err_gym: "Bitte ein Studio wählen.",
    gear_title: "Geräte und Stufen",
    edit_exercise: "Übung bearbeiten: {0}",
    gear_none: "Noch kein Gerät verknüpft.",
    gear_station: "Station",
    gear_station_hint: "Rack, Bank: nur der Ort, ohne Gewichtsstufen.",
    gear_weights: "Gewichte",
    gear_weights_hint: "Langhantel, Kurzhanteln, Scheiben oder Maschine: Von hier kommen die Gewichtsstufen.",
    gear_linked: "für diese Übung",
    gear_shared: "Die Stufen gelten für alle Übungen, die dieses Gerät benutzen.",
    gear_new: "Neues Gerät",
    gear_gym: "Studio",
    gear_no_gym: "Lege zuerst unter Pläne ein Studio an.",
    type_rack: "Rack",
    type_bench: "Bank",
    today_title: "Seite „Heute“",
    today_hint: "Welche Blöcke gezeigt werden.",
    block_next: "Nächster Trainingstag",
    block_facts: "Kennzahlen",
    block_muscles: "Sätze je Muskelgruppe",
    block_recent: "Letzte Workouts",
    block_review: "Rückblick",
    review_title: "Rückblick", review_none: "Nichts Auffälliges: keine stagnierende Übung, keine vernachlässigte Muskelgruppe.",
    review_stag: "{0}: {1} Workouts in {2} Wochen ohne neue Bestleistung (bisher {3} kg).",
    review_muscle: "{0}: zuletzt {1} Sätze pro Woche, vorher {2}.",
    review_ai: "Zusammenfassung von der KI", review_ai_busy: "Die KI schreibt …",
    review_ai_hint: "Gesendet werden nur Namen von Übungen und Muskelgruppen mit Zahlen, an die in Home Assistant eingerichtete KI.",
    today_empty: "Alle Blöcke sind ausgeblendet. Du kannst sie unter Einstellungen wieder einschalten.",
    rest_title: "Pause zwischen Sätzen",
    rest_hint: "Gilt für alle Übungen. Einzelne Übungen bekommen im Trainingstag eine eigene Pause.",
    rest_default_opt: "{0} Sekunden",
    att_rope: "Seil",
    att_straight: "Gerade Stange",
    att_ez: "EZ-Stange",
    att_lat_bar: "Lat-Stange (breit)",
    att_v_bar: "V-Griff (Dreieck)",
    att_single: "Einzelgriff",
    att_ankle: "Knöchelmanschette",
    att_double: "Doppelgriff",
    new_exercise: "Neue Übung",
    exercise_name: "Name",
    exercise_kind: "Art",
    exercise_equipment: "Geräteart",
    none_opt: "–",
    kind_strength: "Kraft",
    kind_bodyweight: "Körpergewicht",
    kind_time: "Zeit",
    kind_cardio: "Cardio",
    unilateral: "Einseitig (links und rechts getrennt)",
    exercise_notes: "Notizen",
    muscles_primary: "Hauptmuskeln",
    muscles_secondary: "Nebenmuskeln (zählen halb)",
    catalog_fixed: "Katalogübung: Name und Art sind fest. Muskeln, Geräteart und Notizen kannst du ändern.",
    err_dup: "Es gibt schon eine Übung „{0}“.",
    exercises_empty: "Noch keine Übungen.",
    own_tag: "eigene",
    new_exercise_btn: "Neue Übung",
    exercise_settings: "Einstellungen",
    tab_training: "Training",
    tab_exercises: "Übungen",
    workouts_mode: "Workouts",
    filter_muscle: "Muskelgruppe",
    muscle_all: "Alle Muskelgruppen",
    muscle_other: "Ohne Muskelgruppe",
    today: "Heute", yesterday: "Gestern",
  },
  en: {
    title: "Training", tab_today: "Today", tab_history: "History", tab_stats: "Statistics", tab_plans: "Plans", tab_settings: "Settings",
    loading: "Loading …", retry: "Try again", back: "Back", more: "Show older",
    not_loaded: "HAFS is not loaded. Is the integration set up?", load_failed: "Could not load: {0}",
    running_since: "Workout running since {0}", next_up: "Up next", next_program: "from “{0}”",
    done_today: "Trained today", done_line: "Already trained today: {0}", rest_day: "No training planned", no_plan: "No training plan yet. Create training days in the app or here under Plans.",
    sets_short: "{0}×{1}", reps_range: "{0}–{1}", superset: "Superset {0}",
    workouts_week: "Workouts this week", volume_week: "Volume this week", last_workout: "Last workout", never: "none yet",
    phase: "Phase", phase_bulk: "Bulk", phase_maintain: "Maintain", phase_cut: "Cut", phase_none: "unknown",
    phase_auto: "From MyDietAssistant", phase_manual_label: "Set by hand",
    sets_by_muscle: "Sets per muscle group", this_week: "This week", average: "Avg {0} weeks", no_sets: "No sets in this period yet.",
    muscle_hint: "Primary muscles count fully, secondary muscles half, warm-up sets not at all.",
    recent: "Recent", workouts_per_week: "Workouts per week", weeks_n: "{0} weeks", weeks_n_short: "{0} wk",
    workout: "Workout", free_workout: "Free workout", unfinished: "not finished", imported: "imported",
    sets: "Sets", volume: "Volume", duration: "Duration", minutes: "{0} min", gym: "Gym", note: "Note", set_note: "Note",
    warmup: "Warm-up", drop: "Drop", failure: "Failure", target: "Target", empty_history: "No workouts yet.",
    muscles: "Muscle groups", exercises: "Exercises", search_exercise: "Search exercise", no_match: "Nothing found.",
    filter_times: "How often trained", filter_last: "Last done", min_times_any: "any number", min_times_n: "at least {0} workouts", within_any: "any time", within_months: "in the last {0} months", shown_of: "{0} of {1} exercises", times_n: "{0}×",
    sessions: "Workouts", metric_e1rm: "Estimated 1RM", metric_weight: "Weight", metric_volume: "Volume", metric_reps: "Reps", metric_duration: "Duration",
    range_3: "3 months", range_12: "12 months", range_all: "All", records: "Records", best_weight: "Heaviest weight", best_e1rm: "Best 1RM",
    best_volume: "Most volume", best_reps: "Most reps", suggestion: "Suggestion for next time", last_sessions: "Last workouts",
    intake_low_kcal: "Only {0} kcal eaten today. Eat something before training?", intake_low_carbs: "Only {1} g carbs today. Eat something before training?",
    card_exercise_missing: "Exercise \"{0}\" not found.",
    e1rm_hint: "Epley, only sets of 1 to 12 reps.", no_data: "Not enough data for a chart.",
    program: "Training plan", routines: "Training days", loose_routines: "Training days without a plan", weekdays: "Weekdays", rotation: "Rotation",
    gyms: "Gyms", equipment: "Equipment", out_of_order: "out of order", steps: "Steps", no_gyms: "No gym yet.",
    settings_phase: "Nutrition phase", settings_phase_hint: "Decides how early the weight goes up or down. “Automatic” takes the phase from MyDietAssistant.",
    phase_auto_opt: "Automatic", hit_fraction: "Raise the weight when …", hit_all: "all sets reach the upper limit", hit_75: "three quarters of the sets reach it", hit_50: "half of the sets reach it",
    cut_drop_set: "Cut: drop a set first, then lower the weight", saved: "Saved",
    import_title: "Import", import_hint: "CSV export from GymRun, Strong or Hevy (the format is detected). Dry run first, then import; existing data is skipped.",
    import_pick: "Choose CSV", import_dry: "Dry run", import_run: "Import", import_done: "Imported: {0} workouts, {1} sets.",
    import_too_big: "The file is larger than 3.5 MB; Home Assistant will not accept it like this.",
    sum_rows: "Rows", sum_sets: "Sets", sum_workouts: "Workouts", sum_exercises: "Exercises", sum_duplicates: "Duplicates", sum_first: "First", sum_last: "Last", sum_warnings: "Warnings",
    export_title: "Export", export_json: "Download everything as JSON",
    edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete", add: "Add", remove: "Remove", move_up: "Move up", move_down: "Move down",
    new_program: "New training plan", new_routine: "New training day", new_gym: "New gym", new_equipment: "Add equipment",
    edit_program: "Edit training plan", edit_routine: "Edit training day", edit_gym: "Edit gym",
    name: "Name", routine_program: "Training plan", no_program: "No training plan", add_exercise: "Add exercise", exercise_search: "Search exercise",
    sets_label: "Sets", reps_label: "Reps", reps_from: "from", reps_to: "to", reps_target: "Target reps", use_range: "Use a range", use_target: "Use one target", superset_prev: "Superset with the exercise above", no_exercises: "No exercises yet.",
    rhythm: "Weekdays", rhythm_hint: "Empty = rotation. Otherwise exactly one day per training day, in order.", add_routine: "Add training day", no_free_routines: "No free training days.",
    equipment_name: "Equipment", equipment_type: "Type", equipment_steps: "Weight steps", equipment_steps_hint: "e.g. 5-100/5 (5 to 100 in steps of 5) or 20 22.5 25",
    out_of_order_check: "out of order", row_gear: "Equipment", row_gear_none: "none", row_gear_edit: "Edit equipment", row_gear_close: "Close", row_gear_hint: "You can assign several pieces of equipment to an exercise, e.g. a barbell at the bench or the machine. In the app you choose which one you use; history and suggestions are kept per piece. The steps apply to every exercise that uses the equipment.", gym_zone: "Zone (gym detection)", gym_zone_hint: "A Home Assistant zone, e.g. zone.cleverfit. While your person is in the zone, the app preselects this gym.", no_equipment: "No equipment yet.",
    stack_steps: "Stack steps", stack_steps_hint: "e.g. 7-98/7 (7 kg per step) or 5 10 15", stack_extra: "Add-on weight (optional, kg)", stack_extra_hint: "A weight you can switch on, e.g. 2.5: every step then also exists plus 2.5 kg.",
    plate_base: "Base weight (sled or lever, kg)", plates: "Plates you have (kg)", plates_hint: "One side is enough, e.g. 25 20 15 10 5 2.5 1.25", plate_max: "Highest weight (optional, kg)", plate_both: "Plates on both sides",
    bar_weight: "Bar (kg)", stock_plates: "Plates per side (kg)", stock_hint: "10x2 = two 10s, e.g. 25 20 15 10x2 5x2 2.5; then only weights that can be loaded. Empty: the steps below.", stock_summary: "Bar {0} kg, {1} plates",
    plate_summary: "{0} kg + plates", extra_summary: "+ {0} kg add-on",
    type_machine: "Machine (general)", type_machine_stack: "Machine, weight stack", type_machine_plate: "Machine, plate-loaded", type_cable: "Cable", type_barbell: "Barbell", type_dumbbell: "Dumbbells", type_bodyweight: "Bodyweight", type_kettlebell: "Kettlebell", type_band: "Band", type_cardio: "Cardio", type_other: "Other",
    confirm_delete_program: "Delete training plan “{0}”? Its training days are kept.", confirm_delete_routine: "Delete training day “{0}”?", confirm_delete_gym: "Delete gym “{0}” with all its equipment?",
    err_name: "Please enter a name.", err_numbers: "Check sets and reps ({0}): whole numbers, “from” at most “to”.", err_rhythm: "One weekday per training day needed: the number of weekdays and training days differs.", err_steps: "Cannot read the weight steps of “{0}”.", err_plates: "Check the plates of “{0}”: base weight, plate sizes (above 0) and a highest weight above the base weight.", err_extra: "Check the add-on weight of “{0}”: a number above 0, together with the stack steps.",
    save_failed: "Not saved: {0}", saved_edit: "Saved", deleted: "Deleted", sync_note: "The app gets the change at its next sync.",
    plans_intro_plan: "A training plan is the sequence of your training days, for example “Pull / Legs / Push”, either in rotation or on fixed weekdays.",
    plans_intro_day: "A training day is a single day of it, for example “Pull”, with its exercises, sets and reps.",
    weight_label: "Next weight (kg)",
    weight_hint: "A one-time setting for the next workout; after that the progression takes over again.",
    rest_label: "Rest",
    rest_global: "as global",
    rest_off: "none",
    rest_s: "{0} s",
    rest_row: "Rest {0} s",
    warmup_label: "Warm-up",
    warm_sets: "Sets",
    warm_reps: "Reps",
    warm_pct: "% of working weight",
    warm_hint: "Leave empty for no warm-up sets. The weight follows the working weight and so the progression.",
    warmup_row: "Warm-up {0}×{1} at {2} %",
    err_warmup: "Check the warm-up of “{0}”: sets (1 to 6), reps and percent (10 to 95) are needed.",
    err_weight: "Check the weight of “{0}”: a number from 0 to 1000.",
    err_rest: "Check the rest of “{0}” (0 to 600 seconds).",
    err_gym: "Please choose a gym.",
    gear_title: "Equipment and steps",
    edit_exercise: "Edit exercise: {0}",
    gear_none: "No equipment linked yet.",
    gear_station: "Station",
    gear_station_hint: "Rack, bench: only the place, no weight steps.",
    gear_weights: "Weights",
    gear_weights_hint: "Barbell, dumbbells, plates or a machine: the weight steps come from here.",
    gear_linked: "for this exercise",
    gear_shared: "The steps apply to every exercise that uses this equipment.",
    gear_new: "New equipment",
    gear_gym: "Gym",
    gear_no_gym: "Create a gym under Plans first.",
    type_rack: "Rack",
    type_bench: "Bench",
    today_title: "“Today” page",
    today_hint: "Which blocks are shown.",
    block_next: "Next training day",
    block_facts: "Key figures",
    block_muscles: "Sets per muscle group",
    block_recent: "Recent workouts",
    block_review: "Review",
    review_title: "Review", review_none: "Nothing stands out: no stagnating exercise, no neglected muscle group.",
    review_stag: "{0}: {1} workouts in {2} weeks without a new best (so far {3} kg).",
    review_muscle: "{0}: {1} sets per week lately, {2} before.",
    review_ai: "Summary from the AI", review_ai_busy: "The AI is writing …",
    review_ai_hint: "Only names of exercises and muscle groups with numbers are sent, to the AI set up in Home Assistant.",
    today_empty: "All blocks are hidden. You can switch them back on under Settings.",
    rest_title: "Rest between sets",
    rest_hint: "Applies to all exercises. Single exercises can get their own rest in the training day.",
    rest_default_opt: "{0} seconds",
    att_rope: "Rope",
    att_straight: "Straight bar",
    att_ez: "EZ bar",
    att_lat_bar: "Lat bar (wide)",
    att_v_bar: "V-handle",
    att_single: "Single handle",
    att_ankle: "Ankle strap",
    att_double: "Double handle",
    new_exercise: "New exercise",
    exercise_name: "Name",
    exercise_kind: "Type",
    exercise_equipment: "Equipment type",
    none_opt: "–",
    kind_strength: "Strength",
    kind_bodyweight: "Bodyweight",
    kind_time: "Time",
    kind_cardio: "Cardio",
    unilateral: "Unilateral (left and right separately)",
    exercise_notes: "Notes",
    muscles_primary: "Primary muscles",
    muscles_secondary: "Secondary muscles (count half)",
    catalog_fixed: "Catalog exercise: name and type are fixed. You can change muscles, equipment type and notes.",
    err_dup: "There is already an exercise “{0}”.",
    exercises_empty: "No exercises yet.",
    own_tag: "own",
    new_exercise_btn: "New exercise",
    exercise_settings: "Settings",
    tab_training: "Training",
    tab_exercises: "Exercises",
    workouts_mode: "Workouts",
    filter_muscle: "Muscle group",
    muscle_all: "All muscle groups",
    muscle_other: "No muscle group",
    today: "Today", yesterday: "Yesterday",
  },
};

export const language = (code) => ((code || "en").toLowerCase().startsWith("de") ? "de" : "en");

export const makeT = (lang) => {
  const dict = STRINGS[lang] || STRINGS.en;
  return (key, ...args) => {
    let s = dict[key] ?? STRINGS.en[key] ?? key;
    args.forEach((a, i) => { s = s.split(`{${i}}`).join(a); });
    return s;
  };
};

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ---- Formats ------------------------------------------------------------------------------

export const makeFormat = (locale) => {
  const loc = !locale || locale === "en" ? "en-GB" : locale;
  const nf = (max) => new Intl.NumberFormat(loc, { maximumFractionDigits: max });
  const n0 = nf(0), n1 = nf(1);
  const parse = (s) => (s ? new Date(s) : null);
  return {
    int: (v) => n0.format(v ?? 0),
    num: (v) => n1.format(v ?? 0),
    // Weights are kg: whole numbers stay whole, halves and quarters show their decimals.
    kg: (v) => (v == null ? "–" : new Intl.NumberFormat(loc, { maximumFractionDigits: 2 }).format(v)),
    date: (s) => { const d = parse(s); return d && !isNaN(d) ? d.toLocaleDateString(loc, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : ""; },
    dayMonth: (s) => { const d = parse(s); return d && !isNaN(d) ? d.toLocaleDateString(loc, { day: "numeric", month: "short" }) : ""; },
    monthYear: (s) => { const d = parse(s); return d && !isNaN(d) ? d.toLocaleDateString(loc, { month: "long", year: "numeric" }) : ""; },
    shortMonth: (s) => { const d = parse(s); return d && !isNaN(d) ? d.toLocaleDateString(loc, { month: "short", year: "2-digit" }) : ""; },
    time: (s) => { const d = parse(s); return d && !isNaN(d) ? d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" }) : ""; },
    tonnes: (kg) => (kg >= 10000 ? `${n1.format(kg / 1000)} t` : `${n0.format(kg)} kg`),
  };
};

// ---- Charts (inline SVG, colors come from CSS classes of the panel) -------------------------

const niceStep = (range, ticks) => {
  const raw = range / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
};

// points: [{t: ms, y, label}]; returns "" when there is nothing sensible to draw.
export const lineChart = (points, { fmtX, fmtY, ariaLabel }) => {
  if (points.length < 2) return "";
  const W = 640, H = 240, L = 46, R = 14, T = 14, B = 28;
  let lo = Math.min(...points.map((p) => p.y)), hi = Math.max(...points.map((p) => p.y));
  if (lo === hi) { lo -= 1; hi += 1; }
  const step = niceStep(hi - lo, 4);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const t0 = points[0].t, t1 = points[points.length - 1].t || t0 + 1;
  const x = (t) => L + ((t - t0) / (t1 - t0 || 1)) * (W - L - R);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  let grid = "";
  for (let v = lo; v <= hi + step / 2; v += step) {
    grid += `<line class="gl"x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="tick" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${esc(fmtY(v))}</text>`;
  }
  let xt = "";
  for (let i = 0; i < 4; i++) {
    const t = t0 + ((t1 - t0) * i) / 3;
    xt += `<text class="tick" x="${x(t)}" y="${H - 8}" text-anchor="${i === 0 ? "start" : i === 3 ? "end" : "middle"}">${esc(fmtX(t))}</text>`;
  }
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.y).toFixed(1)}`).join("");
  const dots = points.length <= 80 ? points.map((p) => `<circle class="pt" cx="${x(p.t).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="3.2"><title>${esc(p.label)}</title></circle>`).join("") : "";
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${grid}${xt}<path class="ln" d="${path}"/>${dots}</svg>`;
};

// values: [{label, value}]; the last bar is the running period and gets the accent.
export const barChart = (values, { ariaLabel }) => {
  const W = 640, H = 150, T = 18, B = 22, gap = 6;
  const max = Math.max(1, ...values.map((v) => v.value));
  const bw = (W - gap * (values.length - 1)) / values.length;
  const bars = values.map((v, i) => {
    const h = (v.value / max) * (H - T - B);
    const x = i * (bw + gap), cls = i === values.length - 1 ? "bar now" : "bar";
    return `<rect class="${cls}" x="${x.toFixed(1)}" y="${(H - B - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(h, v.value ? 2 : 0).toFixed(1)}" rx="3"><title>${esc(v.label)}: ${v.value}</title></rect>`
      + (v.value ? `<text class="val" x="${(x + bw / 2).toFixed(1)}" y="${(H - B - h - 4).toFixed(1)}" text-anchor="middle">${v.value}</text>` : "")
      + (i % 2 === (values.length - 1) % 2 ? `<text class="tick" x="${(x + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(v.short)}</text>` : "");
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}">${bars}</svg>`;
};
