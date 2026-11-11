// Pure helpers of the plan and gym editor: input parsing and the records that `hafs/sync/push` needs.
// No DOM, no Home Assistant; tested with `node --test tests/js`.
//
// Every record is pushed in full (spread from the record the server sent), because the server needs all
// required columns and must not lose the ones this editor does not show.

export const EQUIPMENT_TYPES = ["machine", "cable", "barbell", "dumbbell", "bodyweight", "kettlebell", "band", "cardio", "other"];

// Same format as the server and the app (UTC, seconds, +00:00), so that string comparison of `updated_at` works.
export const stamp = (d = new Date()) => d.toISOString().replace(/\.\d+Z$/, "+00:00");

export const newId = () => globalThis.crypto.randomUUID();

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
  if (spec && typeof spec === "object" && spec.step) return `${fmt(spec.min)}-${fmt(spec.max)}/${fmt(spec.step)}`;
  return "";
};

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
  const rows = data.routine_exercises.filter((x) => x.routine_id === id).sort((a, b) => a.position - b.position)
    .map((x, i, all) => ({
      exerciseId: x.exercise_id, name: names.get(x.exercise_id) || "?", sets: x.target_sets ?? "", repsMin: x.reps_min ?? "", repsMax: x.reps_max ?? "",
      rest: x.rest_s ?? null, withPrev: i > 0 && !!x.superset_group && all[i - 1].superset_group === x.superset_group,
    }));
  return { raw, name: raw?.name ?? "", programId: raw ? raw.program_id || "" : programId || "", rows };
};

export const newRow = (exercise) => {
  const reps = exercise.kind === "strength" || exercise.kind === "bodyweight";
  return { exerciseId: exercise.id, name: exercise.name, sets: reps ? 3 : 1, repsMin: reps ? 8 : "", repsMax: reps ? 12 : "", rest: null, withPrev: false };
};

// Returns {error: key} or {records}. Like the app, all old rows of the routine are replaced by new ones.
export const routineRecords = (draft, data, now = stamp(), makeId = newId) => {
  const name = draft.name.trim();
  if (!name) return { error: "err_name" };
  for (const r of draft.rows) {
    const [s, lo, hi] = [toInt(r.sets), toInt(r.repsMin), toInt(r.repsMax)];
    if (Number.isNaN(s) || Number.isNaN(lo) || Number.isNaN(hi) || (s != null && (s < 1 || s > 20)) || (lo != null && lo < 1) || (hi != null && hi > 500) || (lo != null && hi != null && lo > hi)) {
      return { error: "err_numbers", detail: r.name };
    }
  }
  const id = draft.raw?.id || makeId();
  const programId = draft.programId || null;
  const siblings = data.routines.filter((r) => (r.program_id || null) === programId && r.id !== id);
  const keepsPlace = draft.raw && (draft.raw.program_id || null) === programId;
  const position = keepsPlace ? draft.raw.position : siblings.length ? Math.max(...siblings.map((r) => r.position)) + 1 : 0;
  const routine = [{ ...draft.raw, id, updated_at: now, deleted: 0, program_id: programId, name, position }];
  const groups = supersetGroups(draft.rows.map((r) => r.withPrev));
  const old = data.routine_exercises.filter((x) => x.routine_id === id).map((x) => ({ ...x, deleted: 1, updated_at: now }));
  const fresh = draft.rows.map((r, i) => ({
    id: makeId(), updated_at: now, deleted: 0, routine_id: id, exercise_id: r.exerciseId, position: i,
    target_sets: toInt(r.sets), reps_min: toInt(r.repsMin), reps_max: toInt(r.repsMax), rest_s: r.rest ?? null, superset_group: groups[i],
  }));
  return { records: { routine, routine_exercise: [...old, ...fresh] } };
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
    raw: q, name: q.name, type: q.type, steps: formatSteps(q.steps, fmt), outOfOrder: !!q.out_of_order })) : [];
  return { raw, name: raw?.name ?? "", equipment, removed: [] };
};

export const newEquipment = () => ({ raw: null, name: "", type: "machine", steps: "", outOfOrder: false });

export const gymRecords = (draft, data, now = stamp(), makeId = newId) => {
  const name = draft.name.trim();
  if (!name) return { error: "err_name" };
  const id = draft.raw?.id || makeId();
  const equipment = [];
  for (const q of draft.equipment) {
    if (!q.name.trim()) return { error: "err_name" };
    const steps = parseSteps(q.steps);
    if (steps === null) return { error: "err_steps", detail: q.name };
    equipment.push({ ...q.raw, id: q.raw?.id || makeId(), gym_id: id, name: q.name.trim(), type: q.type, steps, out_of_order: q.outOfOrder ? 1 : 0, updated_at: now, deleted: 0 });
  }
  const gone = draft.removed.map((q) => q.raw).filter(Boolean);
  const records = { gym: [{ ...draft.raw, id, updated_at: now, deleted: 0, name }], equipment: [...equipment, ...gone.map((q) => ({ ...q, deleted: 1, updated_at: now }))] };
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
