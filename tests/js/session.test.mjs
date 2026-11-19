import test from "node:test";
import assert from "node:assert/strict";
import { localStamp, stepWeight, setLine, startDraft, warmupWeight, warmupFor, warmupDue, moveToDay, restSeconds, clock, supersetNext } from "../../mydiet/app/static/training/hafs-session.js";

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

test("warm-up weight lands on a weight the machine offers", () => {
  assert.equal(warmupWeight(100, 50, [7, 14, 35, 49, 56, 98]), 49);
  assert.equal(warmupWeight(60, 50, null), 30);
  assert.equal(warmupWeight(62.5, 50, null), 32.5);      // 31.25 -> nearest 2.5 kg
});

test("warm-up sets are due until the planned number is logged or skipped", () => {
  const info = { warmup: { sets: 2, reps: 5, pct: 50 }, target_weight: 80 };
  assert.equal(warmupDue(info, []), true);
  assert.equal(warmupDue(info, [{ kind: "warmup" }]), true);
  assert.equal(warmupDue(info, [{ kind: "warmup" }, { kind: "warmup" }]), false);
  assert.equal(warmupDue(info, [{ kind: "work" }]), true);
  assert.equal(warmupDue(info, [], true), false);
  assert.equal(warmupDue({ ...info, target_weight: null }, []), false);   // no working weight to take a percentage of
  assert.equal(warmupDue({ target_weight: 80 }, []), false);
});

test("rest: own value (0 = none), else the default", () => {
  assert.equal(restSeconds({ rest_s: 120 }, 90), 120);
  assert.equal(restSeconds({ rest_s: 0 }, 90), 0);
  assert.equal(restSeconds({ rest_s: null }, 60), 60);
  assert.equal(restSeconds({}, undefined), 90);
  assert.equal(clock(75), "1:15");
  assert.equal(clock(5), "0:05");
});

test("superset: partner without rest, rest after the round, finished exercises drop out", () => {
  const ex = [{ exercise_id: "a", superset: "A", sets: 2 }, { exercise_id: "b", superset: "A", sets: 2 }, { exercise_id: "c", sets: 3 }];
  const done = { a: 0, b: 0, c: 0 }, d = (id) => done[id];
  assert.deepEqual(supersetNext(ex, d, "c"), { go: null, rest: true });          // not in a superset
  done.a = 1;
  assert.deepEqual(supersetNext(ex, d, "a"), { go: "b", rest: false });
  done.b = 1;
  assert.deepEqual(supersetNext(ex, d, "b"), { go: "a", rest: true });          // round over: rest, then again with a
  done.a = 2;
  assert.deepEqual(supersetNext(ex, d, "a"), { go: "b", rest: false });
  done.b = 2;
  assert.deepEqual(supersetNext(ex, d, "b"), { go: null, rest: true });         // everything done
});

test("warm-up: a fixed weight goes to the nearest stack position and needs no working weight", () => {
  assert.equal(warmupWeight(100, 50, [10, 20, 30, 40], 25), 20);              // tie -> the lighter one
  assert.equal(warmupWeight(null, null, null, 20), 20);
  const info = { warmup: { sets: 1, reps: 8, pct: null, weight: 22 }, target_weight: null, steps: [20, 22, 23.1], warm_steps: [20, 25, 30] };
  assert.equal(warmupFor(info), 20);                                           // the stack only (no add-on weights)
  assert.equal(warmupDue(info, []), true);
  assert.equal(warmupDue(info, [{ kind: "warmup" }]), false);
  const pct = { warmup: { sets: 1, reps: 8, pct: 50, weight: null }, target_weight: 100, steps: [49, 51], warm_steps: [45, 55] };
  assert.equal(warmupFor(pct), 45);                                            // percent: warm_steps first
  assert.equal(warmupFor({ ...pct, warm_steps: null }), 49);
});

test("a workout moves to another day and keeps its times", () => {
  assert.equal(moveToDay("2026-11-09T10:15:00", "2026-11-02"), "2026-11-02T10:15:00");
  assert.equal(moveToDay(null, "2026-11-02"), null);
});
