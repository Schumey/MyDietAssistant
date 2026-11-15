// Pure helpers of the plan and gym editor: input parsing and the records that `hafs/sync/push` needs.
// No DOM, no Home Assistant; tested with `node --test tests/js`.
//
// Every record is pushed in full (spread from the record the server sent), because the server needs all
// required columns and must not lose the ones this editor does not show.

export const EQUIPMENT_TYPES = ["machine_stack", "machine_plate", "machine", "cable", "barbell", "dumbbell", "rack", "bench", "bodyweight", "kettlebell", "band", "cardio", "other"];

// A station is only a place (rack, bench): it has no weights, the weight steps come from the equipment that holds the weights
// (barbell, dumbbells, a machine). An exercise can link to both, e.g. bench press = bench + barbell.
export const STATION_TYPES = ["rack", "bench"];
export const isStation = (type) => STATION_TYPES.includes(type);

// Same format as the server and the app (UTC, seconds, +00:00), so that string comparison of `updated_at` works.
export const stamp = (d = new Date()) => d.toISOString().replace(/\.\d+Z$/, "+00:00");

// `crypto.randomUUID` exists only on secure origins (https, localhost); Home Assistant is often reached over plain http.
export const uuidFrom = (c) => {
  if (typeof c.randomUUID === "function") return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
export const newId = () => uuidFrom(globalThis.crypto);

// "5-100/5" (5 to 100 in steps of 5) or a list "20 22,5 25"; "" = unknown; null = invalid. Same as `parseStepsInput` of the app.
export const parseSteps = (input) => {
  const text = String(input ?? "").trim().replaceAll(",", ".").replaceAll("–", "-");
  if (!text) return "";
  const range = /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*[/x×]\s*(\d+(?:\.\d+)?)$/i.exec(text);
  if (range) {
    const [lo, hi, step] = [Number(range[1]), Number(range[2]), Number(range[3])];
    if (step <= 0 || hi < lo || (hi - lo) / step > 2000) return null;
    return JSON.stringify({ min: lo, max: hi, step });
  }
  const parts = text.split(/[\s;]+/).filter(Boolean);
  const numbers = parts.map(Number);
  if (!numbers.length || numbers.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return JSON.stringify(numbers);
};

// The stored JSON back into the input form ("5-100/5" or "20 22.5 25").
export const formatSteps = (json, fmt = (n) => String(n)) => {
  if (!json) return "";
  let spec;
  try { spec = JSON.parse(json); } catch { return ""; }
  if (Array.isArray(spec)) return spec.map(fmt).join(" ");
  if (spec && Array.isArray(spec.values)) return spec.values.map(fmt).join(" ");
  if (spec && typeof spec === "object" && spec.step) return `${fmt(spec.min)}-${fmt(spec.max)}/${fmt(spec.step)}`;
  return "";
};

// ---- Machines: stack-loaded (pin positions plus an optional add-on weight) and plate-loaded (sled plus plates) ----

export const DEFAULT_PLATES = "25 20 15 10 5 2.5 1.25";
const num = (text) => {
  const t = String(text ?? "").trim().replace(",", ".");
  return t === "" ? null : Number(t);
};
// Plate stock per side: "25 20 10x2" -> [25, 20, 10, 10] (null when invalid or empty); and back, equal plates collapsed.
export const parseStock = (text) => {
  const out = [];
  for (const tok of String(text ?? "").trim().replaceAll(",", ".").split(/[\s;]+/).filter(Boolean)) {
    const m = /^(.+?)[x×](\d+)$/i.exec(tok);
    const v = Number(m ? m[1] : tok), n = m ? Number(m[2]) : 1;
    if (!Number.isFinite(v) || v <= 0 || v > 100 || n < 1 || n > 20) return null;
    for (let i = 0; i < n; i++) out.push(v);
  }
  return out.length && out.length <= 60 ? out : null;
};
export const formatStock = (plates, fmt = (n) => String(n)) => {
  const counts = new Map();
  for (const p of plates) counts.set(p, (counts.get(p) || 0) + 1);
  return [...counts.keys()].sort((a, b) => b - a).map((p) => (counts.get(p) > 1 ? `${fmt(p)}x${counts.get(p)}` : fmt(p))).join(" ");
};
const emptyMachine = () => ({ steps: "", base: "", plates: "", max: "", both: true, extra: "" });

// The fields of an equipment record as the editor shows them (the stored `steps` JSON is the single source).
export const decodeSteps = (json, fmt = (n) => String(n)) => {
  const out = { ...emptyMachine(), steps: formatSteps(json, fmt) };
  let spec;
  try { spec = json ? JSON.parse(json) : null; } catch { spec = null; }
  if (spec && !Array.isArray(spec) && typeof spec === "object") {
    if (Array.isArray(spec.plates)) {
      out.base = spec.base ? fmt(spec.base) : "";
      out.plates = spec.limited ? formatStock(spec.plates, fmt) : spec.plates.map(fmt).join(" ");
      out.max = spec.max ? fmt(spec.max) : "";
      out.both = spec.sides !== 1;
    }
    if (spec.extra) out.extra = fmt(spec.extra);
  }
  return out;
};

// Input of one equipment row -> {steps} (the `steps` JSON text, "" = unknown) or {error}. `base` is the plate machine's sled weight.
export const buildSteps = (q) => {
  // Barbell with a plate stock: bar plus the plates there are per side; left empty, the plain steps below apply.
  if (q.type === "barbell" && (String(q.plates ?? "").trim() || String(q.base ?? "").trim())) {
    const base = num(q.base) ?? 0, plates = parseStock(q.plates);
    if (!Number.isFinite(base) || base < 0 || !plates) return { error: "err_plates" };
    return { steps: JSON.stringify({ base, plates, sides: 2, limited: true }), base };
  }
  if (q.type === "machine_plate") {
    const base = num(q.base) ?? 0;
    const plates = String(q.plates ?? "").trim().replaceAll(",", ".").split(/[\s;]+/).filter(Boolean).map(Number);
    const max = num(q.max);
    if (!Number.isFinite(base) || base < 0 || !plates.length || plates.some((p) => !Number.isFinite(p) || p <= 0)
        || (max != null && (!Number.isFinite(max) || max <= base))) return { error: "err_plates" };
    const spec = { base, plates, sides: q.both === false ? 1 : 2 };
    if (max != null) spec.max = max;
    return { steps: JSON.stringify(spec), base };
  }
  const steps = parseSteps(q.steps);
  if (steps === null) return { error: "err_steps" };
  if (q.type === "machine_stack") {
    const extra = num(q.extra);
    if (extra != null && (!Number.isFinite(extra) || extra <= 0)) return { error: "err_extra" };
    if (extra) {
      if (!steps) return { error: "err_extra" };
      const spec = JSON.parse(steps);
      return { steps: JSON.stringify(Array.isArray(spec) ? { values: spec, extra } : { ...spec, extra }) };
    }
  }
  return { steps };
};

// Called when the type changes: a plate machine starts with the usual plates.
export const onTypeChange = (q) => { if (q.type === "machine_plate" && !String(q.plates).trim()) q.plates = DEFAULT_PLATES; };

// Group letters for rows; a row flagged `withPrev` joins the group of the row above (the first row cannot).
export const supersetGroups = (withPrev) => {
  const out = withPrev.map(() => "");
  let next = 0;
  for (let i = 1; i < withPrev.length; i++) {
    if (!withPrev[i]) continue;
    if (!out[i - 1]) out[i - 1] = String.fromCharCode(65 + (next++ % 26));
    out[i] = out[i - 1];
  }
  return out;
};

const toInt = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

// ---- Routine ------------------------------------------------------------------------------

// Draft of a routine for the editor; `data` is the answer of the `plan_edit` query.
export const routineDraft = (data, id, programId = null) => {
  const raw = id ? data.routines.find((r) => r.id === id) : null;
  const names = new Map(data.exercises.map((e) => [e.id, e.name]));
  const kinds = new Map(data.exercises.map((e) => [e.id, e.kind]));
  const rows = data.routine_exercises.filter((x) => x.routine_id === id).sort((a, b) => a.position - b.position)
    .map((x, i, all) => {
      const weight = data.target_weights?.[x.exercise_id];
      return {
        exerciseId: x.exercise_id, name: names.get(x.exercise_id) || "?", kind: kinds.get(x.exercise_id) || "strength",
        sets: x.target_sets ?? "", repsMin: x.reps_min ?? "", repsMax: x.reps_max ?? "",
        rest: x.rest_s ?? null, range: x.reps_min != null && x.reps_max != null && x.reps_min !== x.reps_max, withPrev: i > 0 && !!x.superset_group && all[i - 1].superset_group === x.superset_group,
        weight: weight == null ? "" : String(weight), weightOrig: weight ?? null,
        warmSets: x.warmup_sets ?? "", warmReps: x.warmup_reps ?? "", warmPct: x.warmup_pct ?? "",
      };
    });
  return { raw, name: raw?.name ?? "", programId: raw ? raw.program_id || "" : programId || "", rows };
};

export const newRow = (exercise) => {
  const reps = exercise.kind === "strength" || exercise.kind === "bodyweight";
  return { exerciseId: exercise.id, name: exercise.name, kind: exercise.kind, sets: reps ? 3 : 1, repsMin: "", repsMax: reps ? 10 : "", range: false, rest: null, withPrev: false,
    weight: "", weightOrig: null, warmSets: "", warmReps: "", warmPct: "" };
};

// Whether an exercise has weights (the weight and warm-up fields only make sense then).
export const hasWeight = (row) => row.kind === "strength" || row.kind === "bodyweight" || !row.kind;

export const REST_CHOICES = [0, 45, 60, 90, 120, 150, 180, 240, 300];

// Returns {error: key} or {records, weights}. Like the app, all old rows of the routine are replaced by new ones.
// `weights` = [{exercise_id, weight}] for rows whose weight field was changed: the caller sets them as the next weight
// (`hafs/target/set`); a one-time suggestion, the progression takes over after the next workout.
export const routineRecords = (draft, data, now = stamp(), makeId = newId) => {
  const name = draft.name.trim();
  if (!name) return { error: "err_name" };
  const rows = draft.rows.map((r) => (r.range ? r : { ...r, repsMin: r.repsMax }));      // target reps: min = max
  for (const r of rows) {
    const [s, lo, hi] = [toInt(r.sets), toInt(r.repsMin), toInt(r.repsMax)];
    if (Number.isNaN(s) || Number.isNaN(lo) || Number.isNaN(hi) || (s != null && (s < 1 || s > 20)) || (lo != null && lo < 1) || (hi != null && hi > 500) || (lo != null && hi != null && lo > hi)) {
      return { error: "err_numbers", detail: r.name };
    }
  }
  const warm = rows.map((r) => {
    if (!hasWeight(r)) return { sets: null, reps: null, pct: null };
    const [sets, reps] = [toInt(r.warmSets), toInt(r.warmReps)];
    const pct = r.warmPct === "" || r.warmPct == null ? null : num(r.warmPct);
    return { sets, reps, pct };
  });
  for (const [i, w] of warm.entries()) {
    const none = (w.sets == null || w.sets === 0) && w.reps == null && w.pct == null;
    if (none) { warm[i] = { sets: null, reps: null, pct: null }; continue; }
    if (Number.isNaN(w.sets) || Number.isNaN(w.reps) || !(w.sets >= 1 && w.sets <= 6) || !(w.reps >= 1 && w.reps <= 50) || !Number.isFinite(w.pct) || w.pct < 10 || w.pct > 95) {
      return { error: "err_warmup", detail: rows[i].name };
    }
  }
  const weights = [];
  for (const r of rows) {
    if (!hasWeight(r) || r.weight === "" || r.weight == null) continue;
    const w = num(r.weight);
    if (!Number.isFinite(w) || w < 0 || w > 1000) return { error: "err_weight", detail: r.name };
    if (w !== r.weightOrig) weights.push({ exercise_id: r.exerciseId, weight: w });
  }
  for (const r of rows) {
    if (r.rest != null && !(Number.isInteger(Number(r.rest)) && r.rest >= 0 && r.rest <= 600)) return { error: "err_rest", detail: r.name };
  }
  const id = draft.raw?.id || makeId();
  const programId = draft.programId || null;
  const siblings = data.routines.filter((r) => (r.program_id || null) === programId && r.id !== id);
  const keepsPlace = draft.raw && (draft.raw.program_id || null) === programId;
  const position = keepsPlace ? draft.raw.position : siblings.length ? Math.max(...siblings.map((r) => r.position)) + 1 : 0;
  const routine = [{ ...draft.raw, id, updated_at: now, deleted: 0, program_id: programId, name, position }];
  const groups = supersetGroups(rows.map((r) => r.withPrev));
  const old = data.routine_exercises.filter((x) => x.routine_id === id).map((x) => ({ ...x, deleted: 1, updated_at: now }));
  const fresh = rows.map((r, i) => ({
    id: makeId(), updated_at: now, deleted: 0, routine_id: id, exercise_id: r.exerciseId, position: i,
    target_sets: toInt(r.sets), reps_min: toInt(r.repsMin), reps_max: toInt(r.repsMax), rest_s: r.rest ?? null, superset_group: groups[i],
    warmup_sets: warm[i].sets, warmup_reps: warm[i].reps, warmup_pct: warm[i].pct,
  }));
  return { records: { routine, routine_exercise: [...old, ...fresh] }, weights };
};

export const routineDelete = (id, data, now = stamp()) => ({
  routine: data.routines.filter((r) => r.id === id).map((r) => ({ ...r, deleted: 1, updated_at: now })),
  routine_exercise: data.routine_exercises.filter((x) => x.routine_id === id).map((x) => ({ ...x, deleted: 1, updated_at: now })),
});

// ---- Program ------------------------------------------------------------------------------

export const programDraft = (data, id) => {
  const raw = id ? data.programs.find((p) => p.id === id) : null;
  const days = raw?.rhythm ? raw.rhythm.split(",").map(Number).filter((n) => n >= 1 && n <= 7) : [];
  const routineIds = raw ? data.routines.filter((r) => r.program_id === raw.id).sort((a, b) => a.position - b.position).map((r) => r.id) : [];
  return { raw, name: raw?.name ?? "", days, routineIds };
};

export const programRecords = (draft, data, now = stamp(), makeId = newId) => {
  const name = draft.name.trim();
  if (!name) return { error: "err_name" };
  const days = [...new Set(draft.days)].sort((a, b) => a - b);
  if (days.length && days.length !== draft.routineIds.length) return { error: "err_rhythm" };
  const id = draft.raw?.id || makeId();
  const program = [{ origin: "own", ...draft.raw, id, updated_at: now, deleted: 0, name, rhythm: days.join(",") }];
  const byId = new Map(data.routines.map((r) => [r.id, r]));
  const routine = draft.routineIds.map((rid, i) => ({ ...byId.get(rid), program_id: id, position: i, updated_at: now }));
  const kept = new Set(draft.routineIds);
  for (const r of data.routines) if (r.program_id === id && !kept.has(r.id)) routine.push({ ...r, program_id: null, updated_at: now });
  return { records: { program, routine } };
};

export const programDelete = (id, data, now = stamp()) => ({
  program: data.programs.filter((p) => p.id === id).map((p) => ({ ...p, deleted: 1, updated_at: now })),
  routine: data.routines.filter((r) => r.program_id === id).map((r) => ({ ...r, program_id: null, updated_at: now })),
});

// ---- Gym ----------------------------------------------------------------------------------

export const gymDraft = (data, id, fmt) => {
  const raw = id ? data.gyms.find((g) => g.id === id) : null;
  const equipment = raw ? data.equipment.filter((q) => q.gym_id === raw.id).map((q) => ({
    raw: q, name: q.name, type: q.type, ...decodeSteps(q.steps, fmt), outOfOrder: !!q.out_of_order })) : [];
  return { raw, name: raw?.name ?? "", zone: raw?.zone ?? "", equipment, removed: [] };
};

export const newEquipment = () => ({ raw: null, name: "", type: "machine_stack", ...emptyMachine(), outOfOrder: false });

export const gymRecords = (draft, data, now = stamp(), makeId = newId) => {
  const name = draft.name.trim();
  if (!name) return { error: "err_name" };
  const id = draft.raw?.id || makeId();
  const equipment = [];
  for (const q of draft.equipment) {
    if (!q.name.trim()) return { error: "err_name" };
    const built = buildSteps(q);
    if (built.error) return { error: built.error, detail: q.name };
    const rec = { ...q.raw, id: q.raw?.id || makeId(), gym_id: id, name: q.name.trim(), type: q.type, steps: built.steps, out_of_order: q.outOfOrder ? 1 : 0, updated_at: now, deleted: 0 };
    if (built.base != null) rec.base_weight = built.base;
    equipment.push(rec);
  }
  const gone = draft.removed.map((q) => q.raw).filter(Boolean);
  const records = { gym: [{ ...draft.raw, id, updated_at: now, deleted: 0, name, zone: (draft.zone || "").trim() }], equipment: [...equipment, ...gone.map((q) => ({ ...q, deleted: 1, updated_at: now }))] };
  const goneIds = new Set(gone.map((q) => q.id));
  const links = data.links.filter((l) => goneIds.has(l.equipment_id)).map((l) => ({ ...l, deleted: 1, updated_at: now }));
  if (links.length) records.exercise_equipment = links;
  return { records };
};

export const gymDelete = (id, data, now = stamp()) => {
  const equipment = data.equipment.filter((q) => q.gym_id === id);
  const ids = new Set(equipment.map((q) => q.id));
  return {
    gym: data.gyms.filter((g) => g.id === id).map((g) => ({ ...g, deleted: 1, updated_at: now })),
    equipment: equipment.map((q) => ({ ...q, deleted: 1, updated_at: now })),
    exercise_equipment: data.links.filter((l) => ids.has(l.equipment_id)).map((l) => ({ ...l, deleted: 1, updated_at: now })),
  };
};

// ---- Exercise: equipment links and weight steps ---------------------------------------------

// Draft for one exercise (existing or new): master data, the next weight and every piece of equipment of every gym with a flag
// whether the exercise is linked to it. Linked pieces can be edited in place (their weight steps are shared by all exercises
// that use them). Name and kind of catalog exercises are fixed (`meta.own` false); muscles, equipment type and notes can change.
export const EXERCISE_KINDS = ["strength", "bodyweight", "time", "cardio"];
export const EXERCISE_EQUIPMENT = ["machine", "cable", "barbell", "dumbbell", "bodyweight", "kettlebell", "band", "cardio", "other"];
const words = (text) => String(text ?? "").split(/\s+/).filter(Boolean);

export const exerciseDraft = (data, id, fmt) => {
  const raw = (id && data.exercises.find((e) => e.id === id)) || null;
  const linked = new Set(raw ? data.links.filter((l) => l.exercise_id === raw.id).map((l) => l.equipment_id) : []);
  const gyms = new Map(data.gyms.map((g) => [g.id, g.name]));
  const equipment = data.equipment.map((q) => ({
    raw: q, gymId: q.gym_id, gymName: gyms.get(q.gym_id) || "", name: q.name, type: q.type, ...decodeSteps(q.steps, fmt),
    outOfOrder: !!q.out_of_order, linked: linked.has(q.id),
  })).sort((a, b) => a.gymName.localeCompare(b.gymName) || a.name.localeCompare(b.name));
  const weight = raw ? data.target_weights?.[raw.id] : null;
  return {
    id: raw ? raw.id : newId(), isNew: !raw, raw, name: raw?.name ?? "", equipment,
    meta: {
      name: raw?.name ?? "", kind: raw?.kind ?? "strength", primary: words(raw?.muscles_primary), secondary: words(raw?.muscles_secondary),
      equipmentType: raw?.equipment_type ?? "", unilateral: !!raw?.unilateral, notes: raw?.notes ?? "", own: !raw || !raw.catalog_key,
    },
    weight: weight == null ? "" : String(weight), weightOrig: weight ?? null,
  };
};

// Toggle a muscle in the primary or secondary list; a muscle is never both.
export const toggleMuscle = (meta, list, key) => {
  const other = list === "primary" ? "secondary" : "primary";
  meta[list] = meta[list].includes(key) ? meta[list].filter((k) => k !== key) : [...meta[list], key];
  meta[other] = meta[other].filter((k) => !meta[list].includes(k));
};

export const newGear = (gymId, gymName) => ({ raw: null, gymId, gymName, name: "", type: "barbell", ...emptyMachine(), outOfOrder: false, linked: true });

// Returns {error, detail} or {records, weights}: the exercise itself (new or changed), new/changed equipment and the links of this
// exercise (added, or tombstoned when unchecked). `weights` = [{exercise_id, weight}] for the next-weight field when it changed.
export const exerciseRecords = (draft, data, now = stamp(), makeId = newId) => {
  const exerciseId = draft.id;
  const meta = draft.meta;
  const records = {};
  const hasWeights = meta.kind === "strength" || meta.kind === "bodyweight";
  // the exercise record
  const name = meta.name.trim();
  if (meta.own) {
    if (!name) return { error: "err_name" };
    if (data.exercises.some((e) => e.id !== exerciseId && e.name.trim().toLowerCase() === name.toLowerCase())) return { error: "err_dup", detail: name };
  }
  const primary = [...new Set(meta.primary)];
  const secondary = [...new Set(meta.secondary)].filter((k) => !primary.includes(k));
  const fields = {
    name: meta.own ? name : draft.raw.name, kind: meta.own ? meta.kind : draft.raw.kind,
    muscles_primary: primary.join(" "), muscles_secondary: secondary.join(" "),
    equipment_type: meta.equipmentType, unilateral: meta.unilateral ? 1 : 0, notes: meta.notes.trim(),
  };
  const before = draft.raw ? { muscles_primary: "", muscles_secondary: "", equipment_type: "", unilateral: 0, notes: "", ...draft.raw } : null;
  if (!before || Object.entries(fields).some(([k, v]) => before[k] !== v)) {
    records.exercise = [{ catalog_key: "", ...draft.raw, id: exerciseId, updated_at: now, deleted: 0, ...fields }];
  }
  // equipment and links
  const equipment = [], links = [];
  const mine = new Map(data.links.filter((l) => l.exercise_id === exerciseId).map((l) => [l.equipment_id, l]));
  for (const q of draft.equipment) {
    if (!q.raw && !q.linked) continue;
    const id = q.raw?.id || makeId();
    if (q.linked) {
      if (!q.name.trim()) return { error: "err_name" };
      if (!q.gymId) return { error: "err_gym" };
      const built = buildSteps(q);
      if (built.error) return { error: built.error, detail: q.name };
      const steps = isStation(q.type) ? "" : built.steps;
      const same = q.raw && q.raw.name === q.name.trim() && q.raw.type === q.type && q.raw.steps === steps && (built.base == null || (q.raw.base_weight ?? 0) === built.base);
      if (!same) {
        const rec = { ...q.raw, id, gym_id: q.gymId, name: q.name.trim(), type: q.type, steps, out_of_order: q.outOfOrder ? 1 : 0, updated_at: now, deleted: 0 };
        if (built.base != null && !isStation(q.type)) rec.base_weight = built.base;
        equipment.push(rec);
      }
    }
    const link = mine.get(id);
    if (q.linked && !link) links.push({ id: makeId(), exercise_id: exerciseId, equipment_id: id, updated_at: now, deleted: 0 });
    if (!q.linked && link) links.push({ ...link, deleted: 1, updated_at: now });
  }
  if (equipment.length) records.equipment = equipment;
  if (links.length) records.exercise_equipment = links;
  // the next weight (a suggestion of the progression, set through its own command)
  const weights = [];
  if (hasWeights && draft.weight !== "" && draft.weight != null) {
    const w = num(draft.weight);
    if (!Number.isFinite(w) || w < 0 || w > 1000) return { error: "err_weight", detail: name || draft.name };
    if (w !== draft.weightOrig) weights.push({ exercise_id: exerciseId, weight: w });
  }
  return { records, weights };
};

// Names of the equipment linked to an exercise (for the summary line of a routine row).
export const linkedGearNames = (data, exerciseId) => {
  const ids = new Set(data.links.filter((l) => l.exercise_id === exerciseId).map((l) => l.equipment_id));
  return data.equipment.filter((q) => ids.has(q.id)).map((q) => q.name).sort((a, b) => a.localeCompare(b));
};

// The equipment and links of the rows whose "Equipment" section was opened in the routine editor, as one records object
// (pieces shared by several rows are written once). `error`/`detail` when a piece is invalid.
export const rowGearRecords = (rows, data, now = stamp(), makeId = newId) => {
  const out = { equipment: [], exercise_equipment: [] };
  const seen = { equipment: new Set(), exercise_equipment: new Set() };
  for (const row of rows) {
    if (!row.gear) continue;
    const r = exerciseRecords(row.gear, data, now, makeId);
    if (r.error) return { error: r.error, detail: r.detail };
    for (const table of Object.keys(out)) {
      for (const rec of r.records[table] || []) {
        if (seen[table].has(rec.id)) continue;
        seen[table].add(rec.id);
        out[table].push(rec);
      }
    }
  }
  return { records: Object.fromEntries(Object.entries(out).filter(([, v]) => v.length)) };
};

// Switch a row between one target and a range; the range starts four below the target.
export const toggleRange = (row) => {
  row.range = !row.range;
  if (row.range && (row.repsMin === "" || Number(row.repsMin) === Number(row.repsMax))) {
    const hi = Number(row.repsMax);
    row.repsMin = Number.isInteger(hi) && hi > 0 ? Math.max(1, hi - 4) : "";
  }
};
