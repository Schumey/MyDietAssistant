import test from "node:test";
import assert from "node:assert/strict";
import * as e from "../../custom_components/hafs/www/hafs-edit.js";

const NOW = "2026-11-11T10:00:00+00:00";
let n = 0;
const id = () => `new${++n}`;
const data = () => ({
  programs: [{ id: "p1", name: "PPL", rhythm: "1,3", origin: "own", updated_at: "x", deleted: 0 }],
  routines: [{ id: "r1", program_id: "p1", name: "Push", position: 0 }, { id: "r2", program_id: "p1", name: "Pull", position: 1 }, { id: "r3", program_id: null, name: "Beine", position: 0 }],
  routine_exercises: [
    { id: "x1", routine_id: "r1", exercise_id: "bench", position: 0, target_sets: 3, reps_min: 6, reps_max: 10, rest_s: 90, superset_group: "A" },
    { id: "x2", routine_id: "r1", exercise_id: "fly", position: 1, target_sets: 3, reps_min: 10, reps_max: 15, rest_s: null, superset_group: "A" },
    { id: "x3", routine_id: "r1", exercise_id: "dip", position: 2, target_sets: 3, reps_min: 8, reps_max: 12, rest_s: null, superset_group: "" },
  ],
  gyms: [{ id: "g1", name: "Studio", zone: "zone.x" }],
  equipment: [{ id: "q1", gym_id: "g1", name: "Bank", type: "barbell", steps: '{"min":20,"max":40,"step":2.5}', out_of_order: 0, photo: "p.png" }],
  links: [{ id: "l1", exercise_id: "bench", equipment_id: "q1" }],
  exercises: [{ id: "bench", name: "Bank", kind: "strength" }, { id: "fly", name: "Fliegende", kind: "strength" }, { id: "dip", name: "Dips", kind: "bodyweight" }, { id: "plank", name: "Plank", kind: "time" }],
});

test("steps: range, list, empty, invalid", () => {
  assert.equal(e.parseSteps("5-100/5"), '{"min":5,"max":100,"step":5}');
  assert.equal(e.parseSteps("20 22,5 25"), "[20,22.5,25]");
  assert.equal(e.parseSteps("  "), "");
  assert.equal(e.parseSteps("abc"), null);
  assert.equal(e.parseSteps("100-5/5"), null);
  assert.equal(e.formatSteps('{"min":5,"max":100,"step":5}'), "5-100/5");
  assert.equal(e.formatSteps("[20,22.5]"), "20 22.5");
  assert.equal(e.formatSteps(""), "");
});

test("superset groups follow the row above", () => {
  assert.deepEqual(e.supersetGroups([false, true, true, false, true]), ["A", "A", "A", "B", "B"]);
  assert.deepEqual(e.supersetGroups([true, false]), ["", ""]);
});

test("routine draft restores supersets; saving replaces the rows and keeps the position", () => {
  const d = data();
  const draft = e.routineDraft(d, "r1");
  assert.deepEqual(draft.rows.map((r) => r.withPrev), [false, true, false]);
  draft.name = " Push A ";
  draft.rows.splice(2, 1);                                  // drop the dips
  const { records } = e.routineRecords(draft, d, NOW, id);
  assert.equal(records.routine[0].name, "Push A");
  assert.equal(records.routine[0].position, 0);
  const old = records.routine_exercise.filter((x) => x.deleted === 1);
  const fresh = records.routine_exercise.filter((x) => x.deleted === 0);
  assert.equal(old.length, 3);
  assert.deepEqual(fresh.map((x) => [x.exercise_id, x.superset_group, x.rest_s]), [["bench", "A", 90], ["fly", "A", null]]);
});

test("new routine in a program goes last; validation", () => {
  const d = data();
  const draft = e.routineDraft(d, null, "p1");
  draft.name = "Arme";
  draft.rows.push(e.newRow(d.exercises[3]));
  const { records } = e.routineRecords(draft, d, NOW, id);
  assert.equal(records.routine[0].position, 2);
  assert.equal(records.routine[0].program_id, "p1");
  assert.deepEqual([records.routine_exercise[0].target_sets, records.routine_exercise[0].reps_min], [1, null]);
  assert.equal(e.routineRecords({ ...draft, name: " " }, d).error, "err_name");
  draft.rows[0].range = true; draft.rows[0].repsMin = 12; draft.rows[0].repsMax = 8;
  assert.equal(e.routineRecords(draft, d).error, "err_numbers");
});

test("program: order, removal and rhythm check", () => {
  const d = data();
  const draft = e.programDraft(d, "p1");
  assert.deepEqual(draft.days, [1, 3]);
  draft.routineIds = ["r2", "r1", "r3"];                    // rhythm now has 2 days for 3 routines
  assert.equal(e.programRecords(draft, d).error, "err_rhythm");
  draft.days = [1, 3, 5];
  const { records } = e.programRecords(draft, d, NOW, id);
  assert.equal(records.program[0].rhythm, "1,3,5");
  assert.deepEqual(records.routine.map((r) => [r.id, r.position, r.program_id]), [["r2", 0, "p1"], ["r1", 1, "p1"], ["r3", 2, "p1"]]);
  draft.routineIds = ["r1"]; draft.days = [];
  const out = e.programRecords(draft, d, NOW, id).records;
  assert.deepEqual(out.routine.map((r) => [r.id, r.program_id]), [["r1", "p1"], ["r2", null]]);
});

test("deleting a program frees its routines; deleting a routine removes its rows", () => {
  const d = data();
  const p = e.programDelete("p1", d, NOW);
  assert.equal(p.program[0].deleted, 1);
  assert.deepEqual(p.routine.map((r) => r.program_id), [null, null]);
  const r = e.routineDelete("r1", d, NOW);
  assert.equal(r.routine[0].deleted, 1);
  assert.equal(r.routine_exercise.length, 3);
});

test("gym: keeps unknown columns, parses steps, tombstones removed equipment and its links", () => {
  const d = data();
  const draft = e.gymDraft(d, "g1");
  assert.equal(draft.equipment[0].steps, "20-40/2.5");
  draft.equipment[0].steps = "20 25";
  const extra = e.newEquipment(); extra.name = "Latzug"; extra.steps = "5-100/5";
  draft.equipment.push(extra);
  let { records } = e.gymRecords(draft, d, NOW, id);
  assert.equal(records.gym[0].zone, "zone.x");
  assert.equal(records.equipment[0].photo, "p.png");
  assert.equal(records.equipment[0].steps, "[20,25]");
  assert.equal(records.equipment[1].gym_id, "g1");
  draft.removed.push(draft.equipment.shift());
  records = e.gymRecords(draft, d, NOW, id).records;
  assert.equal(records.equipment.filter((q) => q.deleted === 1)[0].id, "q1");
  assert.equal(records.exercise_equipment[0].deleted, 1);
  extra.steps = "x";
  assert.equal(e.gymRecords(draft, d).error, "err_steps");
  const del = e.gymDelete("g1", d, NOW);
  assert.deepEqual([del.gym.length, del.equipment.length, del.exercise_equipment.length], [1, 1, 1]);
});

test("stack machine: steps plus add-on weight round-trip", () => {
  const q = { ...e.newEquipment(), name: "Latzug", type: "machine_stack", steps: "7-98/7", extra: "2,5" };
  const built = e.buildSteps(q);
  assert.deepEqual(JSON.parse(built.steps), { min: 7, max: 98, step: 7, extra: 2.5 });
  const back = e.decodeSteps(built.steps);
  assert.deepEqual([back.steps, back.extra], ["7-98/7", "2.5"]);
  assert.deepEqual(JSON.parse(e.buildSteps({ ...q, steps: "5 10 15" }).steps), { values: [5, 10, 15], extra: 2.5 });
  assert.equal(e.buildSteps({ ...q, extra: "" }).steps, '{"min":7,"max":98,"step":7}');
  assert.equal(e.buildSteps({ ...q, extra: "x" }).error, "err_extra");
  assert.equal(e.buildSteps({ ...q, steps: "" }).error, "err_extra");     // add-on without steps makes no sense
});

test("plate-loaded machine: base weight, plates, both sides", () => {
  const q = e.newEquipment();
  q.type = "machine_plate"; q.name = "Beinpresse"; q.base = "100"; q.max = "300";
  e.onTypeChange(q);
  assert.equal(q.plates, e.DEFAULT_PLATES);
  const built = e.buildSteps(q);
  assert.deepEqual(JSON.parse(built.steps), { base: 100, plates: [25, 20, 15, 10, 5, 2.5, 1.25], sides: 2, max: 300 });
  assert.equal(built.base, 100);
  const back = e.decodeSteps(built.steps);
  assert.deepEqual([back.base, back.plates, back.max, back.both], ["100", "25 20 15 10 5 2.5 1.25", "300", true]);
  assert.equal(e.buildSteps({ ...q, max: "50" }).error, "err_plates");
  assert.equal(e.buildSteps({ ...q, plates: "0 5" }).error, "err_plates");
  assert.equal(JSON.parse(e.buildSteps({ ...q, both: false, max: "" }).steps).sides, 1);
});

test("gym records keep the machine type and set base_weight for plate machines", () => {
  const d = data();
  const draft = e.gymDraft(d, "g1");
  const m = e.newEquipment(); m.name = "Beinpresse"; m.type = "machine_plate"; m.base = "80"; e.onTypeChange(m);
  draft.equipment.push(m);
  const { records } = e.gymRecords(draft, d, NOW, id);
  const rec = records.equipment.find((x) => x.name === "Beinpresse");
  assert.equal(rec.type, "machine_plate");
  assert.equal(rec.base_weight, 80);
  assert.equal(JSON.parse(rec.steps).plates[0], 25);
  m.plates = "-1";
  assert.equal(e.gymRecords(draft, d).error, "err_plates");
});

test("target reps: one number means min = max; a range survives a round trip", () => {
  const d = data();
  const draft = e.routineDraft(d, "r1");
  assert.deepEqual(draft.rows.map((r) => r.range), [true, true, true]);   // loaded ranges stay ranges
  draft.rows[0].range = false; draft.rows[0].repsMax = "8";               // switch the first row to a target of 8
  const fresh = e.routineRecords(draft, d, NOW, id).records.routine_exercise.filter((x) => !x.deleted);
  assert.deepEqual([fresh[0].reps_min, fresh[0].reps_max, fresh[1].reps_min, fresh[1].reps_max], [8, 8, 10, 15]);
  const again = e.routineDraft({ ...d, routine_exercises: fresh.map((x) => ({ ...x, routine_id: "r1" })) }, "r1");
  assert.deepEqual(again.rows.map((r) => r.range), [false, true, true]);
  const row = e.newRow(d.exercises[0]);
  assert.deepEqual([row.range, row.repsMax], [false, 10]);                // new rows start with a target
  e.toggleRange(row);
  assert.deepEqual([row.range, row.repsMin, row.repsMax], [true, 6, 10]);
  e.toggleRange(row);
  assert.equal(row.range, false);
});

test("ids also work without crypto.randomUUID (plain http origins)", () => {
  const insecure = { getRandomValues: (a) => { a.fill(255); return a; } };     // no randomUUID, like a non-secure page
  const uuid = e.uuidFrom(insecure);
  assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(e.uuidFrom(globalThis.crypto), e.uuidFrom(globalThis.crypto));
  assert.match(e.newId(), /^[0-9a-f-]{36}$/);
});
