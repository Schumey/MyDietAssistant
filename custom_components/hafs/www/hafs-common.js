// Shared helpers of the HAFS panel: texts, number/date formats and the two chart types.
// No build step, no dependencies. Kept free of Home Assistant specifics so that other surfaces
// (a dashboard card, the MyDietAssistant shell) can reuse it later.

export const STRINGS = {
  de: {
    title: "HAFS", tab_today: "Heute", tab_history: "Verlauf", tab_stats: "Statistik", tab_plans: "Pläne", tab_settings: "Einstellungen",
    loading: "Lade …", retry: "Erneut versuchen", back: "Zurück", more: "Ältere anzeigen",
    not_loaded: "HAFS ist nicht geladen. Ist die Integration eingerichtet?", load_failed: "Konnte nicht laden: {0}",
    running_since: "Workout läuft seit {0}", next_up: "Als Nächstes", next_program: "aus „{0}“",
    done_today: "Heute trainiert", rest_day: "Kein Training geplant", no_plan: "Noch kein Programm. Lege Routinen in der App an.",
    sets_short: "{0}×{1}", reps_range: "{0}–{1}", superset: "Supersatz {0}",
    workouts_week: "Workouts diese Woche", volume_week: "Volumen diese Woche", last_workout: "Letztes Workout", never: "noch keins",
    phase: "Phase", phase_bulk: "Masse", phase_maintain: "Halten", phase_cut: "Diät", phase_none: "unbekannt",
    phase_auto: "Aus MyDietAssistant", phase_manual_label: "Von Hand",
    sets_by_muscle: "Sätze je Muskelgruppe", this_week: "Diese Woche", average: "Ø {0} Wochen", no_sets: "In diesem Zeitraum noch keine Sätze.",
    muscle_hint: "Hauptmuskeln zählen voll, Nebenmuskeln halb, Aufwärmsätze nicht.",
    recent: "Zuletzt", workouts_per_week: "Workouts pro Woche", weeks_n: "{0} Wochen", weeks_n_short: "{0} Wo.",
    workout: "Workout", free_workout: "Freies Workout", unfinished: "nicht beendet", imported: "aus GymRun",
    sets: "Sätze", volume: "Volumen", duration: "Dauer", minutes: "{0} min", gym: "Studio", note: "Notiz", set_note: "Notiz",
    warmup: "Aufwärmen", drop: "Drop", failure: "Versagen", target: "Ziel", empty_history: "Noch keine Workouts.",
    muscles: "Muskelgruppen", exercises: "Übungen", search_exercise: "Übung suchen", no_match: "Nichts gefunden.",
    filter_times: "Wie oft trainiert", filter_last: "Zuletzt gemacht", min_times_any: "beliebig oft", min_times_n: "mindestens {0} Workouts", within_any: "irgendwann", within_months: "in den letzten {0} Monaten", shown_of: "{0} von {1} Übungen", times_n: "{0}×",
    sessions: "Workouts", metric_e1rm: "Geschätztes 1RM", metric_weight: "Gewicht", metric_volume: "Volumen", metric_reps: "Wiederholungen", metric_duration: "Dauer",
    range_3: "3 Monate", range_12: "12 Monate", range_all: "Alles", records: "Rekorde", best_weight: "Schwerstes Gewicht", best_e1rm: "Bestes 1RM",
    best_volume: "Meistes Volumen", best_reps: "Meiste Wiederholungen", suggestion: "Vorschlag fürs nächste Mal", last_sessions: "Letzte Workouts",
    e1rm_hint: "Epley, nur Sätze mit 1 bis 12 Wiederholungen.", no_data: "Zu wenig Daten für ein Diagramm.",
    program: "Programm", routines: "Routinen", loose_routines: "Routinen ohne Programm", weekdays: "Wochentage", rotation: "Rotation",
    gyms: "Studios", equipment: "Geräte", out_of_order: "außer Betrieb", steps: "Stufen", no_gyms: "Noch kein Studio angelegt.",
    settings_phase: "Ernährungsphase", settings_phase_hint: "Bestimmt, wie früh das Gewicht steigt oder sinkt. „Automatisch“ nimmt die Phase aus MyDietAssistant.",
    phase_auto_opt: "Automatisch", hit_fraction: "Gewicht steigern, wenn …", hit_all: "alle Sätze die Obergrenze erreichen", hit_75: "drei Viertel der Sätze sie erreichen", hit_50: "die Hälfte der Sätze sie erreicht",
    cut_drop_set: "Diät: erst einen Satz streichen, dann Gewicht senken", saved: "Gespeichert",
    import_title: "GymRun-Import", import_hint: "CSV-Export aus GymRun. Erst ein Probelauf, dann der Import; Vorhandenes wird übersprungen.",
    import_pick: "CSV wählen", import_dry: "Probelauf", import_run: "Importieren", import_done: "Importiert: {0} Workouts, {1} Sätze.",
    import_too_big: "Die Datei ist größer als 3,5 MB; Home Assistant nimmt sie so nicht an.",
    sum_rows: "Zeilen", sum_sets: "Sätze", sum_workouts: "Workouts", sum_exercises: "Übungen", sum_duplicates: "Doppelte", sum_first: "Erstes", sum_last: "Letztes", sum_warnings: "Hinweise",
    export_title: "Export", export_json: "Alles als JSON herunterladen",
    edit: "Bearbeiten", save: "Speichern", cancel: "Abbrechen", delete: "Löschen", add: "Hinzufügen", remove: "Entfernen", move_up: "Nach oben", move_down: "Nach unten",
    new_program: "Programm anlegen", new_routine: "Routine anlegen", new_gym: "Studio anlegen", new_equipment: "Gerät hinzufügen",
    edit_program: "Programm bearbeiten", edit_routine: "Routine bearbeiten", edit_gym: "Studio bearbeiten",
    name: "Name", routine_program: "Programm", no_program: "Kein Programm", add_exercise: "Übung hinzufügen", exercise_search: "Übung suchen",
    sets_label: "Sätze", reps_label: "Wiederholungen", reps_from: "von", reps_to: "bis", reps_target: "Ziel-Wiederholungen", use_range: "Bereich statt Ziel", use_target: "Ein Ziel statt Bereich", superset_prev: "Supersatz mit der Übung darüber", no_exercises: "Noch keine Übungen.",
    rhythm: "Wochentage", rhythm_hint: "Leer = Rotation. Sonst genau ein Tag je Routine, der Reihe nach.", add_routine: "Routine hinzufügen", no_free_routines: "Keine freien Routinen.",
    equipment_name: "Gerät", equipment_type: "Art", equipment_steps: "Gewichtsstufen", equipment_steps_hint: "z. B. 5-100/5 (von 5 bis 100 in 5er-Schritten) oder 20 22,5 25",
    out_of_order_check: "außer Betrieb", no_equipment: "Noch keine Geräte.",
    stack_steps: "Stufen des Blocks", stack_steps_hint: "z. B. 7-98/7 (Stufe 7 kg) oder 5 10 15", stack_extra: "Zusatzgewicht (optional, kg)", stack_extra_hint: "Zuschaltbares Gewicht, z. B. 2,5: jede Stufe gibt es dann auch plus 2,5 kg.",
    plate_base: "Grundgewicht (Schlitten oder Hebel, kg)", plates: "Vorhandene Scheiben (kg)", plates_hint: "Eine Seite genügt, z. B. 25 20 15 10 5 2,5 1,25", plate_max: "Höchstes Gewicht (optional, kg)", plate_both: "Scheiben auf beiden Seiten",
    plate_summary: "{0} kg + Scheiben", extra_summary: "+ {0} kg zuschaltbar",
    type_machine: "Maschine (allgemein)", type_machine_stack: "Maschine, Gewichtsblock (Stack)", type_machine_plate: "Maschine, Scheiben (Plate-Loaded)", type_cable: "Kabelzug", type_barbell: "Langhantel", type_dumbbell: "Kurzhanteln", type_bodyweight: "Körpergewicht", type_kettlebell: "Kettlebell", type_band: "Band", type_cardio: "Cardio", type_other: "Sonstiges",
    confirm_delete_program: "Programm „{0}“ löschen? Die Routinen bleiben erhalten.", confirm_delete_routine: "Routine „{0}“ löschen?", confirm_delete_gym: "Studio „{0}“ mit allen Geräten löschen?",
    err_name: "Bitte einen Namen eingeben.", err_numbers: "Sätze und Wiederholungen prüfen ({0}): ganze Zahlen, „von“ höchstens „bis“.", err_rhythm: "Ein Tag je Routine nötig: Zahl der Wochentage und der Routinen stimmt nicht.", err_steps: "Gewichtsstufen von „{0}“ nicht lesbar.", err_plates: "Scheiben von „{0}“ prüfen: Grundgewicht, Scheibengrößen (größer als 0) und ein Höchstgewicht über dem Grundgewicht.", err_extra: "Zusatzgewicht von „{0}“ prüfen: eine Zahl größer als 0, zusammen mit Stufen des Blocks.",
    save_failed: "Nicht gespeichert: {0}", saved_edit: "Gespeichert", deleted: "Gelöscht", sync_note: "Die App bekommt die Änderung beim nächsten Abgleich.",
    today: "Heute", yesterday: "Gestern",
  },
  en: {
    title: "HAFS", tab_today: "Today", tab_history: "History", tab_stats: "Statistics", tab_plans: "Plans", tab_settings: "Settings",
    loading: "Loading …", retry: "Try again", back: "Back", more: "Show older",
    not_loaded: "HAFS is not loaded. Is the integration set up?", load_failed: "Could not load: {0}",
    running_since: "Workout running since {0}", next_up: "Up next", next_program: "from “{0}”",
    done_today: "Trained today", rest_day: "No training planned", no_plan: "No program yet. Create routines in the app.",
    sets_short: "{0}×{1}", reps_range: "{0}–{1}", superset: "Superset {0}",
    workouts_week: "Workouts this week", volume_week: "Volume this week", last_workout: "Last workout", never: "none yet",
    phase: "Phase", phase_bulk: "Bulk", phase_maintain: "Maintain", phase_cut: "Cut", phase_none: "unknown",
    phase_auto: "From MyDietAssistant", phase_manual_label: "Set by hand",
    sets_by_muscle: "Sets per muscle group", this_week: "This week", average: "Avg {0} weeks", no_sets: "No sets in this period yet.",
    muscle_hint: "Primary muscles count fully, secondary muscles half, warm-up sets not at all.",
    recent: "Recent", workouts_per_week: "Workouts per week", weeks_n: "{0} weeks", weeks_n_short: "{0} wk",
    workout: "Workout", free_workout: "Free workout", unfinished: "not finished", imported: "from GymRun",
    sets: "Sets", volume: "Volume", duration: "Duration", minutes: "{0} min", gym: "Gym", note: "Note", set_note: "Note",
    warmup: "Warm-up", drop: "Drop", failure: "Failure", target: "Target", empty_history: "No workouts yet.",
    muscles: "Muscle groups", exercises: "Exercises", search_exercise: "Search exercise", no_match: "Nothing found.",
    filter_times: "How often trained", filter_last: "Last done", min_times_any: "any number", min_times_n: "at least {0} workouts", within_any: "any time", within_months: "in the last {0} months", shown_of: "{0} of {1} exercises", times_n: "{0}×",
    sessions: "Workouts", metric_e1rm: "Estimated 1RM", metric_weight: "Weight", metric_volume: "Volume", metric_reps: "Reps", metric_duration: "Duration",
    range_3: "3 months", range_12: "12 months", range_all: "All", records: "Records", best_weight: "Heaviest weight", best_e1rm: "Best 1RM",
    best_volume: "Most volume", best_reps: "Most reps", suggestion: "Suggestion for next time", last_sessions: "Last workouts",
    e1rm_hint: "Epley, only sets of 1 to 12 reps.", no_data: "Not enough data for a chart.",
    program: "Program", routines: "Routines", loose_routines: "Routines without a program", weekdays: "Weekdays", rotation: "Rotation",
    gyms: "Gyms", equipment: "Equipment", out_of_order: "out of order", steps: "Steps", no_gyms: "No gym yet.",
    settings_phase: "Nutrition phase", settings_phase_hint: "Decides how early the weight goes up or down. “Automatic” takes the phase from MyDietAssistant.",
    phase_auto_opt: "Automatic", hit_fraction: "Raise the weight when …", hit_all: "all sets reach the upper limit", hit_75: "three quarters of the sets reach it", hit_50: "half of the sets reach it",
    cut_drop_set: "Cut: drop a set first, then lower the weight", saved: "Saved",
    import_title: "GymRun import", import_hint: "CSV export from GymRun. Dry run first, then import; existing data is skipped.",
    import_pick: "Choose CSV", import_dry: "Dry run", import_run: "Import", import_done: "Imported: {0} workouts, {1} sets.",
    import_too_big: "The file is larger than 3.5 MB; Home Assistant will not accept it like this.",
    sum_rows: "Rows", sum_sets: "Sets", sum_workouts: "Workouts", sum_exercises: "Exercises", sum_duplicates: "Duplicates", sum_first: "First", sum_last: "Last", sum_warnings: "Warnings",
    export_title: "Export", export_json: "Download everything as JSON",
    edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete", add: "Add", remove: "Remove", move_up: "Move up", move_down: "Move down",
    new_program: "New program", new_routine: "New routine", new_gym: "New gym", new_equipment: "Add equipment",
    edit_program: "Edit program", edit_routine: "Edit routine", edit_gym: "Edit gym",
    name: "Name", routine_program: "Program", no_program: "No program", add_exercise: "Add exercise", exercise_search: "Search exercise",
    sets_label: "Sets", reps_label: "Reps", reps_from: "from", reps_to: "to", reps_target: "Target reps", use_range: "Use a range", use_target: "Use one target", superset_prev: "Superset with the exercise above", no_exercises: "No exercises yet.",
    rhythm: "Weekdays", rhythm_hint: "Empty = rotation. Otherwise exactly one day per routine, in order.", add_routine: "Add routine", no_free_routines: "No free routines.",
    equipment_name: "Equipment", equipment_type: "Type", equipment_steps: "Weight steps", equipment_steps_hint: "e.g. 5-100/5 (5 to 100 in steps of 5) or 20 22.5 25",
    out_of_order_check: "out of order", no_equipment: "No equipment yet.",
    stack_steps: "Stack steps", stack_steps_hint: "e.g. 7-98/7 (7 kg per step) or 5 10 15", stack_extra: "Add-on weight (optional, kg)", stack_extra_hint: "A weight you can switch on, e.g. 2.5: every step then also exists plus 2.5 kg.",
    plate_base: "Base weight (sled or lever, kg)", plates: "Plates you have (kg)", plates_hint: "One side is enough, e.g. 25 20 15 10 5 2.5 1.25", plate_max: "Highest weight (optional, kg)", plate_both: "Plates on both sides",
    plate_summary: "{0} kg + plates", extra_summary: "+ {0} kg add-on",
    type_machine: "Machine (general)", type_machine_stack: "Machine, weight stack", type_machine_plate: "Machine, plate-loaded", type_cable: "Cable", type_barbell: "Barbell", type_dumbbell: "Dumbbells", type_bodyweight: "Bodyweight", type_kettlebell: "Kettlebell", type_band: "Band", type_cardio: "Cardio", type_other: "Other",
    confirm_delete_program: "Delete program “{0}”? Its routines are kept.", confirm_delete_routine: "Delete routine “{0}”?", confirm_delete_gym: "Delete gym “{0}” with all its equipment?",
    err_name: "Please enter a name.", err_numbers: "Check sets and reps ({0}): whole numbers, “from” at most “to”.", err_rhythm: "One day per routine needed: the number of weekdays and routines differs.", err_steps: "Cannot read the weight steps of “{0}”.", err_plates: "Check the plates of “{0}”: base weight, plate sizes (above 0) and a highest weight above the base weight.", err_extra: "Check the add-on weight of “{0}”: a number above 0, together with the stack steps.",
    save_failed: "Not saved: {0}", saved_edit: "Saved", deleted: "Deleted", sync_note: "The app gets the change at its next sync.",
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
