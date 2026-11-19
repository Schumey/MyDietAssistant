// Workout logger of the HAFS panel (Today tab): start a workout, log sets, finish it. Works in the browser and in the
// Home Assistant companion app, so a workout no longer needs the Android app. Everything is written through the normal
// `hafs/sync/push` (like the app does), so the app sees the workout at its next sync and Home Assistant its events.

export const SESSION_CSS = `
.sess-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .sess-head .grow { flex: 1; min-width: 0; }
.sess-ex { margin-bottom: 12px; } .sess-ex h3 { margin: 0 0 2px; } .sess-meta { color: var(--muted); font-size: 13.5px; margin: 0 0 8px; }
.sess-sets { list-style: none; margin: 0 0 10px; padding: 0; } .sess-sets li { display: flex; align-items: center; gap: 8px; padding: 4px 0; border-top: 1px solid var(--line); }
.sess-sets li:first-child { border-top: 0; } .sess-sets .n { color: var(--muted); width: 4.5em; } .sess-sets .v { flex: 1; font-weight: 500; }
.sess-in { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; }
.sess-field { display: flex; flex-direction: column; gap: 3px; font-size: 13px; color: var(--muted); }
.sess-num { display: flex; align-items: center; gap: 4px; }
.sess-num input { width: 5em; font: inherit; font-size: 17px; text-align: center; padding: 8px 6px; border-radius: 6px 6px 0 0; border: 0; border-bottom: 2px solid var(--line); background: var(--field); color: var(--ink); }
.sess-num .ib { width: 38px; height: 38px; font-size: 20px; line-height: 1; }
.sess-rest { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; background: var(--accent); color: var(--accent-ink); margin-bottom: 12px; }
.sess-rest b { font-size: 22px; font-variant-numeric: tabular-nums; flex: 1; } .sess-rest .btn { background: rgba(255,255,255,.2); color: inherit; padding: 5px 12px; }
.sess-warm { color: var(--accent); font-weight: 500; font-size: 13.5px; margin: 0 0 6px; } .sess-sets .warm .n { color: var(--accent); }
.sess-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
.sess-pick { display: block; width: 100%; text-align: left; border: 0; border-top: 1px solid var(--line); background: none; color: inherit; font: inherit; padding: 12px 4px; cursor: pointer; }
.sess-pick:hover { background: color-mix(in srgb, var(--accent) 8%, transparent); } .sess-pick small { display: block; color: var(--muted); }
`;

// Local wall-clock stamp without offset, like the app writes `started_at` and `done_at`.
export const localStamp = (d = new Date()) => {
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(d.getFullYear(), 4)}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// The next heavier (dir 1) or lighter (dir -1) weight: along the equipment's steps when it has some, else by `fallback` kg.
export const stepWeight = (weight, steps, dir, fallback = 2.5) => {
  const w = Number.isFinite(weight) ? weight : 0;
  if (Array.isArray(steps) && steps.length) {
    const next = dir > 0 ? steps.find((s) => s > w + 1e-9) : [...steps].reverse().find((s) => s < w - 1e-9);
    if (next != null) return next;
    return dir > 0 ? w : Math.max(0, w);
  }
  return Math.max(0, Math.round((w + dir * fallback) * 10000) / 10000);
};

// "62,5 kg × 8" style summary of one set (`fmt` writes numbers).
export const setLine = (s, kind, fmt) => {
  if (kind === "time") return `${s.duration_s ?? 0} s`;
  if (kind === "cardio") return `${Math.round((s.duration_s ?? 0) / 60)} min`;
  const reps = s.reps != null ? `${s.reps}` : "";
  return s.weight ? `${fmt(s.weight)} kg × ${reps}` : reps ? `${reps} ×` : "";
};

// Weight of a warm-up set: `pct` percent of the working weight, on a weight the equipment offers (else a multiple of 2.5 kg).
export const warmupWeight = (base, pct, steps) => {
  const w = (base * pct) / 100;
  if (Array.isArray(steps) && steps.length) return steps.reduce((best, s) => (Math.abs(s - w) < Math.abs(best - w) - 1e-9 ? s : best), steps[0]);
  return Math.max(0, Math.round(w / 2.5) * 2.5);
};

// Is a warm-up set due? Planned warm-up sets not yet logged (or skipped) of an exercise, with a working weight to take the percentage of.
export const warmupDue = (info, sets, skipped = false) => {
  const w = info.warmup;
  if (skipped || !w || !(w.sets > 0) || !(w.reps > 0) || !(w.pct > 0) || !(info.target_weight > 0)) return false;
  return sets.filter((s) => s.kind === "warmup").length < w.sets;
};

// Rest after a set in seconds: the exercise's own (0 = none), else the global default.
export const restSeconds = (info, fallback) => (info.rest_s != null ? info.rest_s : fallback ?? 90);

export const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.max(0, sec) % 60).padStart(2, "0")}`;

// What the input of the next set starts with: this workout's last set of the exercise, else the suggestion, else last time.
export const startDraft = (info, done) => {
  const prev = done.length ? done[done.length - 1] : null;
  const last = info.last?.[done.length] || info.last?.[info.last.length - 1] || null;
  const weight = prev ? prev.weight : info.target_weight ?? last?.weight ?? null;
  const reps = prev ? prev.reps : info.target_reps ?? info.reps_max ?? info.reps_min ?? last?.reps ?? null;
  const secs = prev ? prev.duration_s : last?.duration_s ?? null;
  return { weight, reps, secs };
};

export function installSession(Panel, { edit, esc }) {
  const P = Panel.prototype;
  const num = (text) => { const n = Number(String(text ?? "").trim().replace(",", ".")); return String(text ?? "").trim() && Number.isFinite(n) ? n : null; };

  P._sessPush = async function (records) {
    const r = await this._call({ type: "hafs/sync/push", records });
    if (r.rejected?.length) throw new Error(r.rejected[0].reason || "rejected");
    this._cache = {};
    return r;
  };

  P._sessDraw = function () { this._redraw(this._sessHtml()); };

  P._sessFail = function (err) { this._toast(this._t("sess_error", err?.message || err?.code || err)); };

  // Today's start buttons: open the picker (or the running workout)
  P._sessionButtons = function (running, routineId) {
    const t = this._t;
    if (running) return `<p><button class="btn" data-act="s-open">${esc(t("sess_continue"))}</button></p>`;
    return `<p class="actions">${routineId ? `<button class="btn" data-act="s-start" data-v="${esc(routineId)}">${esc(t("sess_start"))}</button>` : ""}
      <button class="btn${routineId ? " ghost" : ""}" data-act="s-pick">${esc(t(routineId ? "sess_other" : "sess_start"))}</button></p>`;
  };

  P._sessClick = async function (el) {
    const act = el.dataset.act, v = el.dataset.v, i = el.dataset.i === undefined ? null : Number(el.dataset.i);
    const S = this._sess;
    try {
      switch (act) {
        case "s-open": return await this._sessOpen("");
        case "s-pick": return await this._sessOpen(null);
        case "s-start": return await this._sessOpen(v);
        case "s-free": return await this._sessBegin(null);
        case "s-begin": return await this._sessBegin(v);
        case "s-leave": this._sessRestStop(); this._sess = null; return this._show();
        case "s-add": if (S) { S.adding = !S.adding; S.filter = ""; this._sessDraw(); } return;
        case "s-pick-ex": return await this._sessAddExercise(v);
        case "s-step": if (S) return this._sessStep(i, Number(el.dataset.d));
        case "s-save-set": return await this._sessSaveSet(i);
        case "s-skip-warm": if (S) { S.skipWarm.add(S.exercises[i].exercise_id); delete S.drafts[i]; this._sessDraw(); } return;
        case "s-rest-more": if (S?.rest) { S.rest.end += 30000; this._sessRestTick(); } return;
        case "s-rest-stop": this._sessRestStop(); return this._sessDraw();
        case "s-del-set": return await this._sessDeleteSet(v);
        case "s-finish": return await this._sessFinish();
        case "s-discard": return await this._sessDiscard();
      }
    } catch (err) {
      this._sessFail(err);
    }
  };

  P._sessInput = function (el) {
    const S = this._sess;
    if (!S) return;
    if (el.dataset.sf === "filter") {
      S.filter = el.value;
      const box = this.shadowRoot.getElementById("sess-exlist");
      if (box) box.innerHTML = this._sessExerciseRows();
      return;
    }
    const d = S.drafts[el.dataset.i];
    if (d) d[el.dataset.sf] = el.value;
  };

  // Open the logger: continue a running workout (routineId ""), or show the picker (null), or start a routine at once.
  P._sessOpen = async function (routineId) {
    const data = await this._query("session", routineId ? { routine_id: routineId } : {});
    if (data.active) return this._sessEnter(data);
    if (routineId) return this._sessBegin(routineId, data);
    this._sess = { screen: "pick", data };
    this._tab = "today";
    this._sessDraw();
  };

  P._sessBegin = async function (routineId, loaded = null) {
    const data = loaded || await this._query("session", routineId ? { routine_id: routineId } : {});
    if (data.active) return this._sessEnter(data);
    const routine = routineId ? data.routines.find((r) => r.id === routineId) : null;
    const rec = { id: edit.newId(), updated_at: edit.stamp(), deleted: 0, started_at: localStamp(), routine_id: routine ? routine.id : null,
      routine_name: routine ? routine.name : "", note: "", source: "" };
    try { const g = await this._call({ type: "hafs/gym/current" }); if (g?.gym_id) rec.gym_id = g.gym_id; } catch { /* no gym known */ }
    await this._sessPush({ workout: [rec] });
    this._sessEnter({ ...data, active: { id: rec.id, routine_id: rec.routine_id, routine: rec.routine_name, started_at: rec.started_at, sets: [] } });
  };

  P._sessEnter = function (data) {
    const a = data.active, plan = data.plan || { exercises: [] };
    this._sess = { screen: "run", data, workout: { id: a.id, started_at: a.started_at, routine_id: a.routine_id, routine_name: a.routine },
      exercises: plan.exercises.map((x) => ({ ...x })), sets: a.sets.map((s) => ({ ...s })), drafts: {}, adding: false, filter: "", busy: false, skipWarm: new Set(), rest: null };
    this._tab = "today";
    this._sessDraw();
  };

  P._sessInfoAt = function (i) { return this._sess.exercises[i]; };

  P._sessDoneOf = function (exerciseId) { return this._sess.sets.filter((s) => s.exercise_id === exerciseId && s.kind !== "warmup"); };

  P._sessAllOf = function (exerciseId) { return this._sess.sets.filter((s) => s.exercise_id === exerciseId); };

  P._sessDraft = function (i) {
    const S = this._sess, info = S.exercises[i], fmt = this._stepFmt();
    if (!S.drafts[i]) {
      if (warmupDue(info, this._sessAllOf(info.exercise_id), S.skipWarm.has(info.exercise_id))) {
        // the next set is a warm-up: a percentage of the working weight
        const w = info.warmup;
        S.drafts[i] = { warm: true, weight: fmt(warmupWeight(info.target_weight, w.pct, info.steps)), reps: String(w.reps), secs: "" };
        return S.drafts[i];
      }
      const d = startDraft(info, this._sessDoneOf(info.exercise_id));
      S.drafts[i] = { weight: d.weight != null ? fmt(d.weight) : "", reps: d.reps != null ? String(d.reps) : "",
        secs: d.secs != null ? String(info.kind === "cardio" ? Math.round(d.secs / 60) : d.secs) : "" };
    }
    return S.drafts[i];
  };

  P._sessStep = function (i, dir) {
    const info = this._sessInfoAt(i), d = this._sessDraft(i);
    d.weight = this._stepFmt()(stepWeight(num(d.weight), info.steps, dir));
    this._sessDraw();
  };

  P._sessSaveSet = async function (i) {
    const S = this._sess, info = S.exercises[i], d = this._sessDraft(i);
    const weight = num(d.weight), reps = num(d.reps), secs = num(d.secs);
    const timed = info.kind === "time" || info.kind === "cardio";
    if (timed ? !secs : !reps) { this._toast(this._t("err_numbers", info.name)); return; }
    const now = new Date();
    const rec = { id: edit.newId(), updated_at: edit.stamp(now), deleted: 0, workout_id: S.workout.id, exercise_id: info.exercise_id,
      equipment_id: info.equipment_id || null, set_no: this._sessAllOf(info.exercise_id).length + 1, kind: d.warm ? "warmup" : "work", note: "", attachment: "",
      weight: timed ? null : weight, reps: timed ? null : Math.round(reps),
      duration_s: timed ? Math.round(info.kind === "cardio" ? secs * 60 : secs) : null,
      target_weight: info.target_weight ?? null, target_reps: info.target_reps ?? null, done_at: localStamp(now) };
    S.busy = true;
    try { await this._sessPush({ workout_set: [rec] }); } finally { S.busy = false; }
    S.sets.push({ id: rec.id, exercise_id: rec.exercise_id, set_no: rec.set_no, weight: rec.weight, reps: rec.reps, duration_s: rec.duration_s,
      kind: rec.kind, done_at: rec.done_at });
    delete S.drafts[i];
    this._sessDraft(i);   // the next set starts with the one just logged
    this._sessRestStart(restSeconds(info, S.data.rest_default));
    this._sessDraw();
  };

  P._sessDeleteSet = async function (id) {
    const S = this._sess, s = S.sets.find((x) => x.id === id);
    if (!s) return;
    await this._sessPush({ workout_set: [{ id, workout_id: S.workout.id, exercise_id: s.exercise_id, done_at: s.done_at, deleted: 1, updated_at: edit.stamp() }] });
    S.sets = S.sets.filter((x) => x.id !== id);
    S.drafts = {};
    this._sessDraw();
  };

  P._sessAddExercise = async function (exerciseId) {
    const S = this._sess;
    if (!S.exercises.some((x) => x.exercise_id === exerciseId)) {
      const r = await this._query("session", { exercise_id: exerciseId });
      if (r.picked) S.exercises.push({ ...r.picked });
    }
    S.adding = false;
    this._sessDraw();
  };

  P._sessWorkoutRecord = function (extra) {
    const w = this._sess.workout;
    return { id: w.id, updated_at: edit.stamp(), deleted: 0, started_at: w.started_at, routine_id: w.routine_id || null, routine_name: w.routine_name || "", ...extra };
  };

  P._sessFinish = async function () {
    await this._sessPush({ workout: [this._sessWorkoutRecord({ ended_at: localStamp() })] });
    this._sessRestStop();
    this._sess = null;
    this._toast(this._t("sess_finished"));
    this._show();
  };

  P._sessDiscard = async function () {
    if (!globalThis.confirm(this._t("sess_discard_ask"))) return;
    const S = this._sess, now = edit.stamp();
    await this._sessPush({
      workout_set: S.sets.map((s) => ({ id: s.id, workout_id: S.workout.id, exercise_id: s.exercise_id, done_at: s.done_at, deleted: 1, updated_at: now })),
      workout: [this._sessWorkoutRecord({ deleted: 1 })],
    });
    this._sessRestStop();
    this._sess = null;
    this._toast(this._t("sess_discarded"));
    this._show();
  };

  // Rest timer: a bar on top counts down after each set; at zero the device vibrates and beeps once (where allowed).
  P._sessRestStart = function (seconds) {
    const S = this._sess;
    this._sessRestStop();
    if (!S || !(seconds > 0)) return;
    S.rest = { end: Date.now() + seconds * 1000 };
    this._restTimer = setInterval(() => this._sessRestTick(), 500);
  };

  P._sessRestStop = function () {
    clearInterval(this._restTimer);
    this._restTimer = null;
    if (this._sess) this._sess.rest = null;
  };

  P._sessRestTick = function () {
    const S = this._sess;
    if (!S?.rest) { clearInterval(this._restTimer); return; }
    const left = Math.ceil((S.rest.end - Date.now()) / 1000);
    if (left <= 0) {
      this._sessRestStop();
      this._toast(this._t("sess_rest_over"));
      try { navigator.vibrate?.([200, 100, 200]); } catch { /* not supported */ }
      try {
        const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)(), osc = ctx.createOscillator();
        osc.connect(ctx.destination); osc.frequency.value = 880; osc.start(); osc.stop(ctx.currentTime + 0.25);
      } catch { /* no sound allowed */ }
      if (this._sess === S && S.screen === "run") this._sessDraw();
      return;
    }
    const el = this.shadowRoot.getElementById("sess-rest-t");
    if (el) el.textContent = clock(left);
  };

  P._sessExerciseRows = function () {
    const S = this._sess, q = (S.filter || "").trim().toLowerCase();
    const have = new Set(S.exercises.map((x) => x.exercise_id));
    const rows = S.data.exercises.filter((x) => !have.has(x.id) && (!q || x.name.toLowerCase().includes(q))).slice(0, 60);
    return rows.map((x) => `<button class="pickrow" data-act="s-pick-ex" data-v="${esc(x.id)}">${esc(x.name)}</button>`).join("");
  };

  P._sessHtml = function () {
    const S = this._sess, t = this._t, f = this._f;
    if (S.screen === "pick") {
      const groups = new Map();
      for (const r of S.data.routines) (groups.get(r.program) || groups.set(r.program, []).get(r.program)).push(r);
      const list = [...groups].map(([program, rs]) => `<section class="card"><h2>${esc(program || t("loose_routines"))}</h2>
        ${rs.map((r) => `<button class="sess-pick" data-act="s-begin" data-v="${esc(r.id)}">${esc(r.name)}${r.id === S.data.next_routine_id ? `<small>${esc(t("next_up"))}</small>` : ""}</button>`).join("")}</section>`).join("");
      return `<div class="sess-head"><button class="btn ghost" data-act="s-leave">← ${esc(t("sess_back"))}</button><h2 class="grow">${esc(t("sess_pick_title"))}</h2></div>
        <p class="muted">${esc(t(S.data.routines.length ? "sess_pick_hint" : "sess_no_routines"))}</p>${list}
        <section class="card"><button class="sess-pick" data-act="s-free">${esc(t("free_workout"))}</button></section>`;
    }
    const fmt = this._stepFmt();
    const cards = S.exercises.map((x, i) => {
      const all = this._sessAllOf(x.exercise_id), d = this._sessDraft(i);
      let work = 0;
      const reps = x.reps_min && x.reps_max ? (x.reps_min === x.reps_max ? `${x.reps_min}` : `${x.reps_min}–${x.reps_max}`) : x.reps_max || x.reps_min || "";
      const target = [x.sets && reps ? `${x.sets} × ${reps}` : x.sets ? `${x.sets} ×` : reps, x.target_weight != null ? `${fmt(x.target_weight)} kg` : ""].filter(Boolean).join(" · ");
      const last = (x.last || []).map((s) => setLine(s, x.kind, fmt)).filter(Boolean).join(", ");
      const timed = x.kind === "time" || x.kind === "cardio";
      const field = (key, label, extra = "") => `<label class="sess-field">${esc(label)}<span class="sess-num">${extra}
        <input data-sf="${key}" data-i="${i}" inputmode="decimal" value="${esc(d[key])}"></span></label>`;
      const weight = `<label class="sess-field">${esc(t("sess_weight"))}<span class="sess-num">
        <button class="ib" data-act="s-step" data-i="${i}" data-d="-1" aria-label="${esc(t("sess_less"))}">−</button>
        <input data-sf="weight" data-i="${i}" inputmode="decimal" value="${esc(d.weight)}">
        <button class="ib" data-act="s-step" data-i="${i}" data-d="1" aria-label="${esc(t("sess_more"))}">+</button></span></label>`;
      const inputs = timed ? field("secs", t(x.kind === "cardio" ? "sess_mins" : "sess_secs")) : weight + field("reps", t("sess_reps"));
      return `<section class="card sess-ex"><h3>${esc(x.name)}</h3>
        <p class="sess-meta">${[target ? t("sess_target", target) : "", last ? t("sess_last", last) : ""].filter(Boolean).map(esc).join(" · ")}</p>
        ${all.length ? `<ul class="sess-sets">${all.map((s) => `<li class="${s.kind === "warmup" ? "warm" : ""}"><span class="n">${esc(s.kind === "warmup" ? t("sess_warmup") : t("sess_set_n", ++work))}</span><span class="v">${esc(setLine(s, x.kind, fmt))}</span>
          <button class="ib warn" data-act="s-del-set" data-v="${esc(s.id)}" aria-label="${esc(t("sess_remove_set"))}">×</button></li>`).join("")}</ul>` : ""}
        ${d.warm ? `<p class="sess-warm">${esc(t("sess_warm_next", f.int(x.warmup.pct)))} <button class="btn small linkish" data-act="s-skip-warm" data-i="${i}">${esc(t("sess_skip_warm"))}</button></p>` : ""}
        <div class="sess-in">${inputs}<button class="btn" data-act="s-save-set" data-i="${i}"${S.busy ? " disabled" : ""}>${esc(t(d.warm ? "sess_save_warm" : "sess_save_set"))}</button></div></section>`;
    }).join("");
    const adder = S.adding ? `<div class="picker"><input class="search" data-sf="filter" placeholder="${esc(t("exercise_search"))}" value="${esc(S.filter)}" autocomplete="off">
      <div class="rows" id="sess-exlist">${this._sessExerciseRows()}</div></div>` : "";
    return `<div class="sess-head"><button class="btn ghost" data-act="s-leave">← ${esc(t("sess_back"))}</button>
      <div class="grow"><p class="kicker">${esc(t("sess_running", f.time(S.workout.started_at) || ""))}</p><h2 class="big">${esc(S.workout.routine_name || t("free_workout"))}</h2></div></div>
      ${S.rest ? `<div class="sess-rest" role="timer"><span>${esc(t("sess_rest"))}</span><b id="sess-rest-t">${clock(Math.max(0, Math.ceil((S.rest.end - Date.now()) / 1000)))}</b>
        <button class="btn" data-act="s-rest-more">${esc(t("sess_rest_more"))}</button><button class="btn" data-act="s-rest-stop">${esc(t("sess_rest_skip"))}</button></div>` : ""}
      ${cards || `<p class="muted">${esc(t("sess_empty"))}</p>`}
      <div class="actions"><button class="btn ghost" data-act="s-add">${esc(t("sess_add_ex"))}</button></div>${adder}
      <div class="sess-bar"><button class="btn" data-act="s-finish">${esc(t("sess_finish"))}</button><button class="btn danger" data-act="s-discard">${esc(t("sess_discard"))}</button></div>`;
  };
}
