import test from "node:test";
import assert from "node:assert/strict";
import { localStamp, stepWeight, setLine, startDraft } from "../../mydiet/app/static/training/hafs-session.js";

test("local stamp has no offset", () => {
  assert.equal(localStamp(new Date(2026, 10, 19, 7, 5, 9)), "2026-11-19T07:05:09");
});

test("weight steps follow the machine's steps, else 2.5 kg", () => {
  const steps = [7, 8.1, 9.3, 14];
  assert.equal(stepWeight(7, steps, 1), 8.1);
  assert.equal(stepWeight(9.3, steps, -1), 8.1);
  assert.equal(stepWeight(8, steps, 1), 8.1);          // between two steps: the next one
  assert.equal(stepWeight(14, steps, 1), 14);          // top of the machine stays
  assert.equal(stepWeight(7, steps, -1), 7);
  assert.equal(stepWeight(20, null, 1), 22.5);
  assert.equal(stepWeight(1, [], -1), 0);
  assert.equal(stepWeight(NaN, null, 1), 2.5);
});

test("set lines per kind", () => {
  const fmt = (n) => String(n);
  assert.equal(setLine({ weight: 62.5, reps: 8 }, "strength", fmt), "62.5 kg × 8");
  assert.equal(setLine({ weight: 0, reps: 12 }, "bodyweight", fmt), "12 ×");
  assert.equal(setLine({ duration_s: 45 }, "time", fmt), "45 s");
  assert.equal(setLine({ duration_s: 1200 }, "cardio", fmt), "20 min");
});

test("next set starts with the last set, else the suggestion, else last time", () => {
  const info = { target_weight: 60, target_reps: null, reps_min: 6, reps_max: 10, last: [{ weight: 55, reps: 9 }] };
  assert.deepEqual(startDraft(info, []), { weight: 60, reps: 10, secs: null });
  assert.deepEqual(startDraft(info, [{ weight: 62.5, reps: 8, duration_s: null }]), { weight: 62.5, reps: 8, secs: null });
  assert.deepEqual(startDraft({ last: [{ weight: 55, reps: 9 }] }, []), { weight: 55, reps: 9, secs: null });
});
