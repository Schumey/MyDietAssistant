// HAFS panel: training log of the hafs integration, shown in the Home Assistant sidebar.
// Plain web component without build step. Reads through `hafs/web/query`, writes settings through the
// normal `hafs/pref/*` commands. Colors come from the Home Assistant theme, so it follows light and dark.

const version = new URL(import.meta.url).search;
const { makeT, language, makeFormat, esc, lineChart, barChart } = await import(`./hafs-common.js${version}`);
const edit = await import(`./hafs-edit.js${version}`);
const { installEditor, EDITOR_CSS } = await import(`./hafs-editor.js${version}`);

const TABS = ["today", "training", "exercises", "plans", "settings"];
const OLD_TABS = { history: "training", stats: "training" };
const TAB_KEY = "hafs.tab";
const WINDOWS = [4, 12, 26, 52];
const TODAY_BLOCKS = ["next", "facts", "muscles", "review", "recent"];
const REST_DEFAULTS = [0, 45, 60, 90, 120, 150, 180, 240, 300];
const MAX_CSV = 3_500_000;

class HafsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tab = "today";
    try {
      const stored = localStorage.getItem(TAB_KEY);
      if (TABS.includes(stored)) this._tab = stored; else if (OLD_TABS[stored]) this._tab = OLD_TABS[stored];
    } catch { /* storage blocked: start on Today */ }
    this._seq = 0;
    this._cache = {};        // last answer per query, shown while the next one loads
    this._catalog = null;    // muscle labels
    this._history = { list: [], more: false };
    this._detail = null;     // workout id on the history tab
    this._trainMode = "workouts";   // training tab: workouts | muscles
    this._window = 12;
    this._exId = null;
    this._metric = "e1rm";
    this._range = "12";
    this._filter = "";
    this._minTimes = 0;      // exercise list: at least this many workouts with the exercise
    this._within = 0;        // exercise list: done within this many months (0 = any time)
    this._muscleFilter = ""; // exercise list: only this primary muscle group ("" = all)
    try {
      this._muscleFilter = localStorage.getItem("hafs.muscle") || "";
      this._minTimes = Number(localStorage.getItem("hafs.minTimes")) || 0;
      this._within = Number(localStorage.getItem("hafs.within")) || 0;
    } catch { /* storage blocked: no filter */ }
    this._csv = null;
    this._edit = null;       // plan/gym editor state while one is open
    // Home Assistant may have set these on the plain element before the class was defined.
    for (const prop of ["narrow", "hass"]) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (this._menu) this._menu.hass = hass;
    if (first) {
      this._lang = language(hass.language);
      this._t = makeT(this._lang);
      this._f = makeFormat(hass.language);
      this._build();
      this._show();
    }
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
    this.toggleAttribute("narrow", !!narrow);
  }

  // ---- Frame ----------------------------------------------------------------------------

  _build() {
    const t = this._t;
    this.shadowRoot.innerHTML = `<style>${CSS}</style>
      <header class="bar"><span id="menu"></span><h1>${esc(t("title"))}</h1>
        <nav class="tabs" role="tablist">${TABS.map((k) => `<button role="tab" data-tab="${k}">${esc(t("tab_" + k))}</button>`).join("")}</nav></header>
      <main id="main" tabindex="-1"></main>
      <div class="toast" id="toast" role="status" hidden></div>`;
    this._menu = document.createElement("ha-menu-button");
    this._menu.hass = this._hass;
    this._menu.narrow = this._narrow;
    this.shadowRoot.getElementById("menu").append(this._menu);
    this._main = this.shadowRoot.getElementById("main");
    this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
    this.shadowRoot.addEventListener("input", (e) => this._onInput(e));
    this.shadowRoot.addEventListener("change", (e) => this._onChange(e));
  }

  _call(msg) {
    return this._hass.connection.sendMessagePromise(msg);
  }

  _query(q, params = {}) {
    return this._call({ type: "hafs/web/query", q, params });
  }

  async _loadCatalog() {
    if (!this._catalog) {
      try { this._catalog = (await this._call({ type: "hafs/catalog/info" })).muscles || {}; } catch { this._catalog = {}; }
    }
  }

  _muscle(key) {
    const m = this._catalog?.[key];
    return m ? m[this._lang] || m.en : key;
  }

  _toast(text) {
    const el = this.shadowRoot.getElementById("toast");
    el.textContent = text;
    el.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
  }

  _errorHtml(err) {
    const t = this._t;
    const msg = err?.code === "not_found" ? t("not_loaded") : t("load_failed", esc(err?.message || err?.code || err));
    return `<div class="notice"><p>${msg}</p><button class="btn" data-act="reload">${esc(t("retry"))}</button></div>`;
  }

  // Run a loader and draw its result; stale answers (the user moved on) are dropped.
  async _show() {
    const seq = ++this._seq;
    for (const b of this.shadowRoot.querySelectorAll(".tabs button")) {
      const on = b.dataset.tab === this._tab;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    }
    const t = this._t;
    const cached = this._cache[this._tab];
    if (!cached) this._main.innerHTML = `<p class="muted pad">${esc(t("loading"))}</p>`;
    try {
      await this._loadCatalog();
      const html = await this[`_view_${this._tab}`]();
      if (seq === this._seq) this._main.innerHTML = `<div class="page">${html}</div>`;
    } catch (err) {
      if (seq === this._seq) this._main.innerHTML = `<div class="page">${this._errorHtml(err)}</div>`;
    }
  }

  _redraw(html) {
    this._main.innerHTML = `<div class="page">${html}</div>`;
  }

  // ---- Events ---------------------------------------------------------------------------

  _onClick(e) {
    const tab = e.target.closest("[data-tab]");
    if (tab) {
      this._tab = tab.dataset.tab;
      try { localStorage.setItem(TAB_KEY, this._tab); } catch { /* ignore */ }
      this._detail = null;
      this._exId = null;
      this._edit = null;
      this._show();
      return;
    }
    const el = e.target.closest("[data-act]");
    if (!el) return;
    if (el.dataset.act.startsWith("e-")) { this._editClick(el); return; }
    const v = el.dataset.v;
    switch (el.dataset.act) {
      case "reload": this._cache = {}; this._history = { list: [], more: false }; this._show(); break;
      case "open-workout": this._tab = "training"; this._trainMode = "workouts"; this._detail = v; this._show(); break;
      case "close-detail": this._detail = null; this._show(); break;
      case "more-history": this._moreHistory(); break;
      case "train-mode": this._trainMode = v; this._detail = null; this._show(); break;
      case "window": this._window = Number(v); this._show(); break;
      case "open-exercise": this._exId = v; this._metric = "e1rm"; this._show(); break;
      case "close-exercise": this._exId = null; this._show(); break;
      case "metric": this._metric = v; this._show(); break;
      case "range": this._range = v; this._show(); break;
      case "import-dry": this._import(true); break;
      case "import-run": this._import(false); break;
      case "export": this._export(); break;
      case "review-ai": this._reviewAi(); break;
    }
  }

  _onInput(e) {
    if (e.target.dataset.f && this._edit) { this._editInput(e.target); return; }
    if (e.target.id === "filter") {
      this._filter = e.target.value;
      const list = this.shadowRoot.getElementById("exlist");
      if (list) list.innerHTML = this._exerciseRows(this._cache.exercises?.exercises || []);
      const count = this.shadowRoot.getElementById("excount");
      if (count) count.textContent = this._exerciseCount(this._cache.exercises?.exercises || []);
    }
  }

  async _onChange(e) {
    const el = e.target;
    if (el.dataset.f && this._edit) { this._editInput(el, true); return; }
    if (el.dataset.xf) {
      const value = Number(el.value) || 0;
      if (el.dataset.xf === "muscle") this._muscleFilter = el.value;
      else if (el.dataset.xf === "minTimes") this._minTimes = value; else this._within = value;
      try { localStorage.setItem("hafs." + el.dataset.xf, el.dataset.xf === "muscle" ? el.value : String(value)); } catch { /* ignore */ }
      const list = this.shadowRoot.getElementById("exlist");
      if (list) list.innerHTML = this._exerciseRows(this._cache.exercises?.exercises || []);
      const count = this.shadowRoot.getElementById("excount");
      if (count) count.textContent = this._exerciseCount(this._cache.exercises?.exercises || []);
      return;
    }
    if (el.id === "csv") {
      const file = el.files?.[0];
      this._csv = null;
      this.shadowRoot.getElementById("import-out").innerHTML = "";
      if (file) {
        if (file.size > MAX_CSV) { this._toast(this._t("import_too_big")); el.value = ""; }
        else this._csv = await file.text();
      }
      for (const b of this.shadowRoot.querySelectorAll("[data-act^=import]")) b.disabled = !this._csv;
      return;
    }
    let pref = el.dataset.pref;
    let value = el.type === "checkbox" ? (el.checked ? "1" : "0") : el.value;
    if (el.dataset.block) {  // the "Today" blocks are stored as the list of switched-off ones
      pref = "today_hidden";
      value = [...this.shadowRoot.querySelectorAll("[data-block]")].filter((b) => !b.checked).map((b) => b.dataset.block).join(",");
    }
    if (!pref) return;
    try {
      await this._call({ type: "hafs/pref/set", key: pref, value });
      this._cache = {};
      this._toast(this._t("saved"));
    } catch (err) {
      this._toast(this._t("load_failed", err?.message || err?.code));
      this._show();
    }
  }

  // ---- Heute ----------------------------------------------------------------------------

  async _view_today() {
    const t = this._t, f = this._f;
    const [d, hiddenPref] = await Promise.all([this._query("overview"), this._call({ type: "hafs/pref/get", key: "today_hidden" }).catch(() => ({ value: "" }))]);
    this._cache.today = d;
    const hidden = new Set(String(hiddenPref.value || "").split(",").filter(Boolean));
    // The review is a rule based look at the history; older servers do not know it (block stays empty).
    const review = hidden.has("review") ? null : await this._call({ type: "hafs/review" }).catch(() => null);
    const show = (block) => !hidden.has(block);
    const s = d.status;
    let hero;
    if (s.active) {
      hero = `<section class="card hero board"><p class="kicker">${esc(t("running_since", f.time(d.active_since) || ""))}</p><h2 class="big">${esc(s.next ? s.next.routine : t("free_workout"))}</h2></section>`;
    } else if (s.next) {
      const rows = (d.next_exercises || []).map((x) => this._planRow(x)).join("")
        || (s.next.exercises || []).map((n) => `<li class="prow"><span class="pname">${esc(n)}</span></li>`).join("");
      hero = `<section class="card hero board">
        ${s.state === "done" ? `<p class="done-line">✓ ${esc(t("done_line", s.last?.routine || t("free_workout")))}</p>` : ""}
        <p class="kicker">${esc(t("next_up"))}</p>
        <h2 class="big">${esc(s.next.routine)}</h2>
        <p class="muted">${esc(t("next_program", s.next.program))}</p>
        <ul class="plist">${rows}</ul></section>`;
    } else {
      hero = `<section class="card hero"><h2>${esc(t("rest_day"))}</h2><p class="muted">${esc(t("no_plan"))}</p></section>`;
    }
    const phaseLabel = d.phase ? t("phase_" + d.phase) : t("phase_none");
    const phaseSource = d.phase_manual ? t("phase_manual_label") : d.phase ? t("phase_auto") : "";
    const last = s.last_workout_at ? f.date(s.last_workout_at) : t("never");
    const facts = `<dl class="facts">
      <div><dt>${esc(t("workouts_week"))}</dt><dd>${f.int(s.workouts_week)}</dd></div>
      <div><dt>${esc(t("volume_week"))}</dt><dd>${esc(f.tonnes(s.volume_week_kg))}</dd></div>
      <div><dt>${esc(t("phase"))}</dt><dd>${esc(phaseLabel)}</dd>${phaseSource ? `<small>${esc(phaseSource)}</small>` : ""}</div>
      <div><dt>${esc(t("last_workout"))}</dt><dd class="small">${esc(last)}</dd></div></dl>`;
    const recent = d.recent.length
      ? `<ul class="rows">${d.recent.map((w) => this._workoutRow({ ...w, routine: w.routine, exercises: (w.exercises || []).map((e) => e.name) })).join("")}</ul>`
      : `<p class="muted">${esc(t("empty_history"))}</p>`;
    const left = [show("next") ? hero : "", show("facts") ? facts : ""].join("");
    const right = [show("muscles") ? `<section class="card"><h2>${esc(t("sets_by_muscle"))}</h2>${this._muscleBars(d.weeks, 4)}
          <p class="hint">${esc(t("muscle_hint"))}</p></section>` : "",
    show("review") && review ? this._reviewCard(review) : "",
    show("recent") ? `<section class="card"><h2>${esc(t("recent"))}</h2>${recent}</section>` : ""].join("");
    if (!left && !right) return `<p class="muted">${esc(t("today_empty"))}</p>`;
    return `<div class="grid ${left && right ? "two" : "one"}">${left ? `<div class="col">${left}</div>` : ""}${right ? `<div class="col">${right}</div>` : ""}</div>`;
  }

  _reviewCard(r) {
    const t = this._t, f = this._f;
    const lines = [
      ...r.stagnating.map((x) => t("review_stag", x.name, x.sessions, x.weeks, f.kg(x.best))),
      ...r.neglected.map((x) => t("review_muscle", this._muscle(x.muscle), f.num(x.recent), f.num(x.earlier))),
    ];
    const body = lines.length ? `<ul class="rows">${lines.map((l) => `<li><span class="wsub">${esc(l)}</span></li>`).join("")}</ul>` : `<p class="muted">${esc(t("review_none"))}</p>`;
    const ai = lines.length ? `<p><button class="btn" data-act="review-ai"${this._reviewBusy ? " disabled" : ""}>${esc(t(this._reviewBusy ? "review_ai_busy" : "review_ai"))}</button></p>
      <p class="hint">${esc(t("review_ai_hint"))}</p>${this._reviewText ? `<p class="reviewtext">${esc(this._reviewText)}</p>` : ""}` : "";
    return `<section class="card"><h2>${esc(t("review_title"))}</h2>${body}${ai}</section>`;
  }

  async _reviewAi() {
    this._reviewBusy = true;
    this._show();
    try {
      const r = await this._call({ type: "hafs/review", ai: true, language: this._lang });
      this._reviewText = r.text || "";
    } catch (err) {
      this._toast(this._t("load_failed", err?.message || err?.code));
    } finally {
      this._reviewBusy = false;
      this._show();
    }
  }

  _planRow(x) {
    const t = this._t, f = this._f;
    const reps = x.reps_min && x.reps_max ? (x.reps_min === x.reps_max ? x.reps_min : t("reps_range", x.reps_min, x.reps_max)) : x.reps_max || x.reps_min || "";
    const sets = x.sets && reps ? t("sets_short", x.sets, reps) : x.sets ? `${x.sets}×` : reps;
    const extra = [x.warmup ? t("warmup_row", x.warmup.sets, x.warmup.reps, f.kg(x.warmup.pct)) : "", x.rest_s != null ? (x.rest_s === 0 ? `${t("rest_label")}: ${t("rest_off")}` : t("rest_row", x.rest_s)) : ""].filter(Boolean).join(" · ");
    return `<li class="prow">${x.superset ? `<span class="ss" title="${esc(t("superset", x.superset))}">${esc(x.superset)}</span>` : ""}
      <span class="pname">${esc(x.exercise)}${extra ? `<small class="pextra">${esc(extra)}</small>` : ""}</span><span class="pnum">${esc(sets)}</span>
      <span class="pnum w">${x.target_weight != null ? esc(f.kg(x.target_weight)) + " kg" : ""}</span></li>`;
  }

  _muscleBars(weeks, win) {
    const t = this._t, f = this._f;
    const rows = Object.entries(weeks.muscles).map(([key, arr]) => {
      const cur = arr[arr.length - 1] || 0;
      const prev = arr.slice(Math.max(0, arr.length - 1 - win), arr.length - 1);
      const avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
      return { key, cur, avg };
    }).filter((r) => r.cur > 0 || r.avg >= 0.5).sort((a, b) => Math.max(b.cur, b.avg) - Math.max(a.cur, a.avg));
    if (!rows.length) return `<p class="muted">${esc(t("no_sets"))}</p>`;
    const max = Math.max(1, ...rows.map((r) => Math.max(r.cur, r.avg)));
    const pct = (v) => Math.min(100, (v / max) * 100).toFixed(1);
    return `<div class="legend"><span><i class="sw fill"></i>${esc(t("this_week"))}</span><span><i class="sw avg"></i>${esc(t("average", win))}</span></div>`
      + rows.map((r) => `<div class="mrow"><span class="mname">${esc(this._muscle(r.key))}</span>
        <div class="track"><i class="fill" style="width:${pct(r.cur)}%"></i><b class="avg" style="left:${pct(r.avg)}%"></b></div>
        <span class="mnum">${f.num(r.cur)}<small>${esc(f.num(r.avg))}</small></span></div>`).join("");
  }

  _workoutRow(w) {
    const t = this._t, f = this._f;
    const d = new Date(w.started_at);
    const meta = [w.sets ? `${w.sets} ${t("sets")}` : "", w.volume_kg ? f.tonnes(w.volume_kg) : "", w.duration_min ? t("minutes", w.duration_min) : ""].filter(Boolean).join("  ");
    const name = w.routine || t("free_workout");
    return `<li><button class="wrow" data-act="open-workout" data-v="${esc(w.id || w.workout_id)}">
      <span class="wdate"><b>${isNaN(d) ? "" : d.getDate()}</b><small>${isNaN(d) ? "" : esc(d.toLocaleDateString(this._hass.language, { weekday: "short" }))}</small></span>
      <span class="wmain"><span class="wname">${esc(name)}${w.ended_at ? "" : ` <em>${esc(t("unfinished"))}</em>`}</span>
        <span class="wsub">${esc((w.exercises || []).slice(0, 5).join(", "))}</span></span>
      <span class="wmeta">${esc(meta)}</span></button></li>`;
  }

  // ---- Training (Verlauf + Muskelgruppen) -----------------------------------------------

  async _view_training() {
    const t = this._t;
    const seg = `<div class="seg" role="group">${["workouts", "muscles"].map((m) =>
      `<button data-act="train-mode" data-v="${m}" aria-pressed="${this._trainMode === m}">${esc(t(m === "workouts" ? "workouts_mode" : "muscles"))}</button>`).join("")}</div>`;
    if (this._trainMode === "muscles") return seg + (await this._muscleView());
    return seg + (await this._historyView());
  }

  async _historyView() {
    if (this._detail) return this._workoutDetail(this._detail);
    const t = this._t, f = this._f;
    if (!this._history.list.length) {
      const r = await this._query("workouts", { limit: 30 });
      this._history = { list: r.workouts, more: r.more };
    }
    return this._historyHtml();
  }

  _historyHtml() {
    const t = this._t, f = this._f;
    const { list, more } = this._history;
    if (!list.length) return `<p class="muted">${esc(t("empty_history"))}</p>`;
    let html = "", month = "";
    for (const w of list) {
      const m = f.monthYear(w.started_at);
      if (m !== month) { if (month) html += "</ul></section>"; html += `<section class="card"><h2>${esc(m)}</h2><ul class="rows">`; month = m; }
      html += this._workoutRow(w);
    }
    html += "</ul></section>";
    if (more) html += `<p class="center"><button class="btn" data-act="more-history">${esc(t("more"))}</button></p>`;
    return html;
  }

  async _moreHistory() {
    const last = this._history.list[this._history.list.length - 1];
    if (!last) return;
    try {
      const r = await this._query("workouts", { limit: 50, before: last.started_at });
      this._history = { list: [...this._history.list, ...r.workouts], more: r.more };
      this._redraw(this._historyHtml());
    } catch (err) { this._toast(this._t("load_failed", err?.message || err?.code)); }
  }

  async _workoutDetail(id) {
    const t = this._t, f = this._f;
    const w = await this._query("workout", { id });
    const chips = [
      w.gym ? `${t("gym")}: ${w.gym}` : "", w.sets ? `${w.sets} ${t("sets")}` : "", w.volume_kg ? f.tonnes(w.volume_kg) : "",
      w.duration_min ? t("minutes", w.duration_min) : "", w.phase ? t("phase_" + w.phase) : "", w.source ? t("imported") : "",
    ].filter(Boolean).map((c) => `<span class="chip">${esc(c)}</span>`).join("");
    const groups = w.exercises.map((g) => `<section class="card"><h3>${esc(g.name)}${g.equipment ? ` <small class="muted">${esc(g.equipment)}</small>` : ""}</h3>
      <table class="sets"><tbody>${g.sets.map((s, i) => this._setRow(s, i)).join("")}</tbody></table></section>`).join("");
    return `<p><button class="btn ghost" data-act="close-detail">← ${esc(t("back"))}</button></p>
      <h2 class="big">${esc(w.routine || t("free_workout"))}</h2><p class="muted">${esc(f.date(w.started_at))}, ${esc(f.time(w.started_at))}</p>
      <div class="chips">${chips}</div>${w.note ? `<p class="note">${esc(w.note)}</p>` : ""}<div class="grid cards">${groups}</div>`;
  }

  _setRow(s, i) {
    const t = this._t, f = this._f;
    let main;
    if (s.duration_s && !s.reps) main = `${Math.floor(s.duration_s / 60)}:${String(s.duration_s % 60).padStart(2, "0")} min`;
    else if (s.weight) main = `${f.kg(s.weight)} kg × ${s.reps ?? "–"}`;
    else main = `${s.reps ?? "–"}`;
    const kind = s.kind && s.kind !== "work" ? `<span class="badge">${esc(t(s.kind))}</span>` : "";
    const att = s.attachment ? `<span class="badge">${esc(t("att_" + s.attachment) !== "att_" + s.attachment ? t("att_" + s.attachment) : s.attachment)}</span>` : "";
    const target = s.target_weight || s.target_reps ? `<small class="muted">${esc(t("target"))} ${s.target_weight ? f.kg(s.target_weight) + " kg" : ""}${s.target_reps ? " × " + s.target_reps : ""}</small>` : "";
    return `<tr><td class="no">${s.no ?? i + 1}</td><td class="val">${esc(main)}</td><td>${kind}${att}${target}${s.note ? ` <span class="snote">${esc(s.note)}</span>` : ""}</td></tr>`;
  }

  async _muscleView() {
    const t = this._t, f = this._f;
    const d = await this._query("muscles", { weeks: 53 });
    const win = this._window;
    const wins = `<div class="seg" role="group">${WINDOWS.map((w) =>
      `<button data-act="window" data-v="${w}" aria-pressed="${w === win}">${esc(t("weeks_n_short", w))}</button>`).join("")}</div>`;
    const last12 = d.weeks.slice(-12).map((w, i) => ({ label: f.dayMonth(w), short: f.dayMonth(w), value: d.workouts.slice(-12)[i] }));
    return `<div class="grid two">
      <section class="card"><div class="head"><h2>${esc(t("sets_by_muscle"))}</h2>${wins}</div>${this._muscleBars(d, win)}<p class="hint">${esc(t("muscle_hint"))}</p></section>
      <section class="card"><h2>${esc(t("workouts_per_week"))}</h2>${barChart(last12, { ariaLabel: t("workouts_per_week") })}</section></div>`;
  }

  // ---- Übungen --------------------------------------------------------------------------

  async _view_exercises() {
    if (this._edit) return this._editorHtml();
    return this._exId ? this._exerciseDetail() : this._exerciseList();
  }

  async _exerciseList() {
    const t = this._t;
    const d = await this._query("exercises", { all: true });
    this._cache.exercises = d;
    const opt = (v, label, cur) => `<option value="${v}"${Number(cur) === v ? " selected" : ""}>${esc(label)}</option>`;
    const times = [0, 2, 3, 5, 10, 20].map((n) => opt(n, n ? t("min_times_n", n) : t("min_times_any"), this._minTimes)).join("");
    const within = [0, 3, 6, 12, 24].map((n) => opt(n, n ? t("within_months", n) : t("within_any"), this._within)).join("");
    return `<div class="actions"><button class="btn" data-act="e-new-exercise">+ ${esc(t("new_exercise_btn"))}</button></div>
      <section class="card"><input id="filter" class="search" type="search" placeholder="${esc(t("search_exercise"))}" value="${esc(this._filter)}" autocomplete="off">
      <div class="filters one"><label class="fld"><span>${esc(t("filter_muscle"))}</span><select data-xf="muscle"><option value="">${esc(t("muscle_all"))}</option>${
        Object.keys(this._catalog || {}).map((k) => `<option value="${esc(k)}"${k === this._muscleFilter ? " selected" : ""}>${esc(this._muscle(k))}</option>`).join("")}</select></label></div>
      <div class="filters"><label class="fld"><span>${esc(t("filter_times"))}</span><select data-xf="minTimes">${times}</select></label>
        <label class="fld"><span>${esc(t("filter_last"))}</span><select data-xf="within">${within}</select></label></div>
      <p class="hint" id="excount">${esc(this._exerciseCount(d.exercises))}</p>
      <ul class="rows" id="exlist">${this._exerciseRows(d.exercises)}</ul></section>`;
  }

  // Exercises that pass the name search and the two filters (how often, how recently).
  _visibleExercises(list) {
    const q = this._filter.trim().toLowerCase();
    const cut = this._within ? new Date(Date.now() - this._within * 30.44 * 86400000).toISOString().slice(0, 10) : "";
    return list.filter((e) => (!q || e.name.toLowerCase().includes(q)) && e.times >= this._minTimes && (!cut || e.last >= cut)  // untrained: times 0, last ""
      && (!this._muscleFilter || e.muscles.includes(this._muscleFilter)));
  }

  _exerciseCount(list) {
    return this._t("shown_of", this._visibleExercises(list).length, list.length);
  }

  _exerciseRows(list) {
    const t = this._t, f = this._f;
    const rows = this._visibleExercises(list);
    if (!rows.length) return `<li class="muted pad">${esc(t("no_match"))}</li>`;
    const row = (e) => `<li><button class="wrow" data-act="open-exercise" data-v="${esc(e.id)}">
      <span class="wmain"><span class="wname">${esc(e.name)}${e.own ? ` <small class="tag">${esc(t("own_tag"))}</small>` : ""}</span><span class="wsub">${esc(e.muscles.slice(0, 2).map((m) => this._muscle(m)).join(", "))}</span></span>
      <span class="wmeta">${e.times ? `${t("times_n", e.times)}  ${esc(f.dayMonth(e.last))} ${esc(e.last.slice(0, 4))}` : ""}</span></button></li>`;
    // grouped by the first primary muscle group (in the order of the catalog), exercises without one at the end
    const order = Object.keys(this._catalog || {});
    const groups = new Map();
    for (const e of rows) {
      const key = e.muscles[0] && order.includes(e.muscles[0]) ? e.muscles[0] : "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    return [...groups.entries()].sort((a, b) => (a[0] === "" ? 1 : b[0] === "" ? -1 : order.indexOf(a[0]) - order.indexOf(b[0])))
      .map(([key, list]) => `<li class="grouphead">${esc(key ? this._muscle(key) : t("muscle_other"))} <small>${list.length}</small></li>${list.map(row).join("")}`).join("");
  }

  async _exerciseDetail() {
    const t = this._t, f = this._f;
    const [d, gearData] = await Promise.all([this._query("exercise", { id: this._exId }), this._query("plan_edit")]);
    const ex = d.exercise;
    const all = d.sessions;
    const metrics = [];
    if (all.some((s) => s.e1rm > 0)) metrics.push("e1rm");
    if (all.some((s) => s.best_weight > 0)) metrics.push("weight");
    if (all.some((s) => s.volume > 0 || s.total_reps > 0)) metrics.push(all.some((s) => s.volume > 0) ? "volume" : "reps");
    if (all.some((s) => s.total_s > 0)) metrics.push("duration");
    const metric = metrics.includes(this._metric) ? this._metric : metrics[0];
    const cut = this._range === "all" ? 0 : Date.now() - Number(this._range) * 30.5 * 86400000;
    const sessions = all.filter((s) => new Date(s.date).getTime() >= cut);
    const pick = { e1rm: (s) => s.e1rm, weight: (s) => s.best_weight, volume: (s) => s.volume, reps: (s) => s.total_reps, duration: (s) => s.total_s / 60 };
    const unit = { e1rm: " kg", weight: " kg", volume: " kg", reps: "", duration: " min" };
    const points = metric ? sessions.filter((s) => pick[metric](s) > 0).map((s) => ({
      t: new Date(s.date).getTime(), y: pick[metric](s), label: `${f.date(s.date)}: ${f.kg(Math.round(pick[metric](s) * 10) / 10)}${unit[metric]}` })) : [];
    const chart = lineChart(points, { fmtX: (ms) => f.shortMonth(new Date(ms).toISOString()), fmtY: (v) => f.kg(Math.round(v * 10) / 10), ariaLabel: ex.name })
      || `<p class="muted">${esc(t("no_data"))}</p>`;
    const btns = (items, act, current, label) => `<div class="seg" role="group">${items.map((k) =>
      `<button data-act="${act}" data-v="${k}" aria-pressed="${k === current}">${esc(label(k))}</button>`).join("")}</div>`;
    const rec = d.records;
    const recItems = [["best_weight", rec.weight, " kg"], ["best_e1rm", rec.e1rm, " kg"], ["best_volume", rec.volume, " kg"]].filter((r) => r[1] > 0)
      .concat(rec.volume > 0 ? [] : rec.reps > 0 ? [["best_reps", rec.reps, ""]] : []);
    const recHtml = recItems.length ? `<dl class="facts compact">${recItems.map(([k, v, u]) => `<div><dt>${esc(t(k))}</dt><dd>${esc(f.kg(v))}${u}</dd></div>`).join("")}</dl>` : "";
    const tg = d.target;
    const tgHtml = tg ? `<section class="card"><h3>${esc(t("suggestion"))}</h3><p class="sugg"><b>${tg.weight != null ? esc(f.kg(tg.weight)) + " kg" : ""}${tg.reps ? " × " + tg.reps : ""}</b></p>${tg.reason ? `<p class="muted">${esc(tg.reason)}</p>` : ""}</section>` : "";
    const lastRows = all.slice(-8).reverse().map((s) => `<tr><td>${esc(f.date(s.date))}</td><td class="val">${s.top && s.top.weight ? esc(f.kg(s.top.weight)) + " kg × " + s.top.reps : s.top ? s.top.reps : ""}</td><td class="muted">${s.sets} ${esc(t("sets"))}</td></tr>`).join("");
    const gyms = new Map(gearData.gyms.map((g) => [g.id, g.name]));
    const mine = gearData.links.filter((l) => l.exercise_id === ex.id).map((l) => gearData.equipment.find((q) => q.id === l.equipment_id)).filter(Boolean);
    const gearRows = mine.map((q) => {
      let steps = "";
      try { steps = this._stepsText(q.steps ? JSON.parse(q.steps) : null); } catch { /* unreadable steps: show none */ }
      return `<li class="eq">${/^data:image\//.test(q.photo || "") ? `<img class="eqphoto" alt="" src="${esc(q.photo)}">` : ""}<span>${esc(q.name)} <small class="muted">${esc(gyms.get(q.gym_id) || "")}</small></span><small class="muted">${esc(steps || t("type_" + q.type))}</small></li>`;
    }).join("");
    const gearHtml = `<section class="card"><div class="head"><h3>${esc(t("gear_title"))}</h3><button class="btn small" data-act="e-gear" data-v="${esc(ex.id)}">${esc(t("edit"))}</button></div>
      ${gearRows ? `<ul class="rows">${gearRows}</ul>` : `<p class="muted">${esc(t("gear_none"))}</p>`}</section>`;
    return `<p><button class="btn ghost" data-act="close-exercise">← ${esc(t("back"))}</button></p>
      <div class="head"><h2 class="big">${esc(ex.name)}</h2><button class="btn" data-act="e-gear" data-v="${esc(ex.id)}">${esc(t("exercise_settings"))}</button></div>
      <p class="muted">${esc(ex.muscles.map((m) => this._muscle(m)).join(", "))}</p>
      <div class="grid two"><section class="card"><div class="head">${metrics.length > 1 ? btns(metrics, "metric", metric, (k) => t("metric_" + k)) : `<h3>${esc(metric ? t("metric_" + metric) : "")}</h3>`}
        ${btns(["3", "12", "all"], "range", this._range, (k) => t("range_" + k))}</div>${chart}${metric === "e1rm" ? `<p class="hint">${esc(t("e1rm_hint"))}</p>` : ""}</section>
      <div class="col">${gearHtml}${recHtml ? `<section class="card"><h3>${esc(t("records"))}</h3>${recHtml}</section>` : ""}${tgHtml}
        <section class="card"><h3>${esc(t("last_sessions"))}</h3><table class="sets"><tbody>${lastRows}</tbody></table></section></div></div>`;
  }

  // ---- Pläne ----------------------------------------------------------------------------

  _stepsText(s) {
    const t = this._t, f = this._f;
    if (Array.isArray(s)) return s.map((n) => f.kg(n)).join(", ");
    if (!s || typeof s !== "object") return "";
    const grid = Array.isArray(s.plates) && s.limited ? t("stock_summary", f.kg(s.base || 0), s.plates.length * 2)
      : Array.isArray(s.plates) ? t("plate_summary", f.kg(s.base || 0))
      : Array.isArray(s.values) ? s.values.map((n) => f.kg(n)).join(", ") : s.step ? `${f.kg(s.min)}–${f.kg(s.max)} / ${f.kg(s.step)}` : "";
    return s.extra ? `${grid} ${t("extra_summary", f.kg(s.extra))}` : grid;
  }

  async _view_plans() {
    if (this._edit) return this._editorHtml();
    const t = this._t, f = this._f;
    const d = await this._query("plan");
    const btn = (act, label, v = "") => `<button class="btn small" data-act="${act}"${v ? ` data-v="${esc(v)}"` : ""}>${esc(label)}</button>`;
    const routine = (r) => `<div class="routine"><div class="head"><h4>${esc(r.routine)}</h4>${btn("e-edit-routine", t("edit"), r.id)}</div>
      <ul class="plist">${r.exercises.map((x) => this._planRow(x)).join("")}</ul></div>`;
    const programs = d.programs.map((p) => {
      const days = p.weekdays ? p.weekdays.map((n) => new Date(2024, 0, n).toLocaleDateString(this._hass.language, { weekday: "short" })).join(", ") : t("rotation");
      const next = d.next && d.next.program === p.program ? d.next.routine : null;
      return `<section class="card"><div class="head"><h2>${esc(p.program)}</h2><span class="btns">${btn("e-new-routine", t("new_routine"), p.id)}${btn("e-edit-program", t("edit"), p.id)}</span></div>
        <p class="muted">${esc(days)}${next ? ` – ${esc(t("next_up"))}: ${esc(next)}` : ""}</p>
        <div class="grid cards">${p.routines.map(routine).join("")}</div></section>`;
    }).join("");
    const loose = d.loose.length ? `<section class="card"><h2>${esc(t("loose_routines"))}</h2><div class="grid cards">${d.loose.map(routine).join("")}</div></section>` : "";
    const stepsText = (s) => this._stepsText(s);
    const gyms = d.gyms.length ? d.gyms.map((g) => `<section class="card"><div class="head"><h2>${esc(g.name)}</h2>${btn("e-edit-gym", t("edit"), g.id)}</div>
      <ul class="rows">${g.equipment.map((q) => `<li class="eq">${/^data:image\//.test(q.photo || "") ? `<img class="eqphoto" alt="" src="${esc(q.photo)}">` : ""}<span>${esc(q.name)}${q.out_of_order ? ` <em>${esc(t("out_of_order"))}</em>` : ""}</span>
        <small class="muted">${esc(stepsText(q.steps))}</small></li>`).join("") || `<li class="muted pad">${esc(t("no_equipment"))}</li>`}</ul></section>`).join("") : `<p class="muted">${esc(t("no_gyms"))}</p>`;
    return `<section class="card intro"><p>${esc(t("plans_intro_plan"))}</p><p>${esc(t("plans_intro_day"))}</p></section>
      <div class="actions">${btn("e-new-program", t("new_program"))}${btn("e-new-routine", t("new_routine"))}</div>
      ${programs || `<p class="muted">${esc(t("no_plan"))}</p>`}${loose}
      <div class="head"><h2 class="sect">${esc(t("gyms"))}</h2>${btn("e-new-gym", t("new_gym"))}</div><div class="grid cards">${gyms}</div>`;
  }

  // ---- Einstellungen --------------------------------------------------------------------

  async _view_settings() {
    const t = this._t;
    const get = async (key) => { try { return (await this._call({ type: "hafs/pref/get", key })).value || ""; } catch { return ""; } };
    const [phase, hit, drop, hiddenText, restText] = await Promise.all([get("phase"), get("hit_fraction"), get("cut_drop_set_first"), get("today_hidden"), get("rest_default")]);
    const hidden = new Set(hiddenText.split(",").filter(Boolean));
    const rest = restText === "" ? "90" : restText;
    const restList = [...new Set([...REST_DEFAULTS, Number(rest)])].sort((a, b) => a - b);
    const opt = (v, label, cur) => `<option value="${v}"${String(cur) === v ? " selected" : ""}>${esc(label)}</option>`;
    const hitCur = hit === "" ? "1" : String(Number(hit));
    const blocks = TODAY_BLOCKS.map((b) => `<label class="check"><input type="checkbox" data-block="${b}"${hidden.has(b) ? "" : " checked"}> ${esc(t("block_" + b))}</label>`).join("");
    return `<div class="grid two"><div class="col">
      <section class="card"><h2>${esc(t("today_title"))}</h2><p class="hint" style="margin-top:0">${esc(t("today_hint"))}</p>${blocks}</section>
      <section class="card"><h2>${esc(t("rest_title"))}</h2><p class="hint" style="margin-top:0">${esc(t("rest_hint"))}</p>
        <select data-pref="rest_default" aria-label="${esc(t("rest_title"))}">${restList.map((n) => opt(String(n), n === 0 ? t("rest_off") : t("rest_default_opt", n), rest)).join("")}</select></section>
      <section class="card"><h2>${esc(t("settings_phase"))}</h2><p class="hint">${esc(t("settings_phase_hint"))}</p>
        <select data-pref="phase" aria-label="${esc(t("settings_phase"))}">${opt("", t("phase_auto_opt"), phase)}${["bulk", "maintain", "cut"].map((p) => opt(p, t("phase_" + p), phase)).join("")}</select></section>
      <section class="card"><h2>${esc(t("hit_fraction"))}</h2>
        <select data-pref="hit_fraction" aria-label="${esc(t("hit_fraction"))}">${opt("1", t("hit_all"), hitCur)}${opt("0.75", t("hit_75"), hitCur)}${opt("0.5", t("hit_50"), hitCur)}</select>
        <label class="check"><input type="checkbox" data-pref="cut_drop_set_first"${drop === "1" ? " checked" : ""}> ${esc(t("cut_drop_set"))}</label></section></div>
      <div class="col"><section class="card"><h2>${esc(t("import_title"))}</h2><p class="hint">${esc(t("import_hint"))}</p>
        <input id="csv" type="file" accept=".csv,text/csv" aria-label="${esc(t("import_pick"))}">
        <p class="actions"><button class="btn" data-act="import-dry" disabled>${esc(t("import_dry"))}</button>
        <button class="btn primary" data-act="import-run" disabled>${esc(t("import_run"))}</button></p><div id="import-out"></div></section>
      <section class="card"><h2>${esc(t("export_title"))}</h2><p><button class="btn" data-act="export">${esc(t("export_json"))}</button></p></section></div></div>`;
  }

  async _import(dry) {
    const t = this._t;
    const out = this.shadowRoot.getElementById("import-out");
    if (!this._csv) return;
    out.innerHTML = `<p class="muted">${esc(t("loading"))}</p>`;
    try {
      const r = await this._call({ type: "hafs/import/gymrun", csv: this._csv, dry_run: dry });
      const s = r.summary || {};
      const rows = [["sum_rows", s.rows], ["sum_workouts", s.workouts], ["sum_sets", s.sets], ["sum_exercises", s.exercises], ["sum_duplicates", s.duplicates],
        ["sum_first", s.first && this._f.date(s.first)], ["sum_last", s.last && this._f.date(s.last)]].filter((x) => x[1] != null && x[1] !== "");
      const warn = (s.warnings || []).length ? `<p class="muted">${esc(t("sum_warnings"))}: ${esc(s.warnings.slice(0, 5).join("; "))}</p>` : "";
      const done = r.added ? `<p class="ok">${esc(t("import_done", r.added.workouts ?? 0, r.added.sets ?? 0))}</p>` : "";
      out.innerHTML = `${done}<dl class="facts compact">${rows.map(([k, v]) => `<div><dt>${esc(t(k))}</dt><dd class="small">${esc(v)}</dd></div>`).join("")}</dl>${warn}`;
      if (!dry) { this._cache = {}; this._history = { list: [], more: false }; }
    } catch (err) {
      out.innerHTML = `<p class="err">${esc(err?.message || err?.code || err)}</p>`;
    }
  }

  async _export() {
    try {
      const data = await this._call({ type: "hafs/export" });
      const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `hafs-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) { this._toast(this._t("load_failed", err?.message || err?.code)); }
  }
}

const CSS = EDITOR_CSS + `
:host {
  --ink: var(--primary-text-color, #212121); --muted: var(--secondary-text-color, #727272);
  --bg: var(--primary-background-color, #fafafa); --card: var(--ha-card-background, var(--card-background-color, #fff));
  --field: var(--input-fill-color, var(--secondary-background-color, #e5e5e5));
  --line: var(--divider-color, #e0e0e0); --accent: var(--primary-color, #03a9f4);
  --accent-ink: var(--text-primary-color, #fff); --warn: var(--error-color, #db4437); --ok: var(--success-color, #43a047);
  --radius: var(--ha-card-border-radius, 12px); --pill: var(--ha-button-border-radius, 18px);
  display: flex; flex-direction: column; height: calc(100vh - var(--xp-taskbar-height, 0px)); overflow: hidden; background: var(--bg); color: var(--ink);
  font-family: var(--ha-font-family-body, var(--primary-font-family, var(--paper-font-body1_-_font-family, Roboto, Noto, system-ui, sans-serif)));
  font-size: 14px; line-height: 1.4; font-variant-numeric: tabular-nums;
}
* { box-sizing: border-box; }
h1, h2, h3, h4, p, ul, dl, dd { margin: 0; padding: 0; }
/* one app bar with the tabs inside, like MyDietAssistant */
.bar { display: flex; align-items: center; gap: 4px 16px; flex-wrap: wrap; padding: 0 12px; min-height: 56px; flex: none;
  background: var(--app-header-background-color, var(--accent)); color: var(--app-header-text-color, var(--accent-ink)); }
.bar h1 { font-size: 20px; font-weight: 400; margin: 0; }
.tabs { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
.tabs button { flex: none; background: none; border: 0; border-bottom: 3px solid transparent; border-radius: 0; box-shadow: none; color: inherit; opacity: .78;
  padding: 17px 12px 14px; font: inherit; font-size: 15px; font-weight: 500; cursor: pointer; white-space: nowrap; }
.tabs button:hover { opacity: 1; } .tabs button[aria-selected=true] { opacity: 1; border-bottom-color: currentColor; }
.tabs button:focus-visible { outline-color: currentColor; outline-offset: -4px; }
button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
main { outline: none; flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.page { max-width: 960px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.pad { padding: 16px; } .center { text-align: center; } .muted { color: var(--muted); } small { color: var(--muted); font-size: 12.5px; }
.grid { display: grid; gap: 16px; } .grid.one { grid-template-columns: minmax(0, 720px); }
.grouphead { padding: 12px 4px 4px; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); font-weight: 500; }
.rows li.grouphead + li, .rows li.grouphead { border-top: 0; } .filters.one { grid-template-columns: 1fr; margin-bottom: 10px; }
.pextra { display: block; font-weight: 400; margin-top: 1px; } .intro p + p { margin-top: 6px; } .intro { color: var(--muted); }
.grid.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
.grid.cards { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); align-items: start; }
.col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.card { background: var(--card); border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--line)); border-radius: var(--radius); box-shadow: var(--ha-card-box-shadow, none); padding: 16px; min-width: 0; }
.card h2, .card h3 { font-size: 16px; font-weight: 500; margin-bottom: 10px; }
.card h4 { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
h2.big { font-size: 28px; font-weight: 700; line-height: 1.15; letter-spacing: -0.01em; }
h2.sect { font-size: 18px; font-weight: 600; margin-top: 8px; }
.head { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; justify-content: space-between; margin-bottom: 10px; } .head h2, .head h3 { margin: 0; }
.hint { color: var(--muted); font-size: 13px; margin-top: 10px; }
.kicker { color: var(--accent); font-weight: 600; font-size: 14px; margin-bottom: 2px; }
.done-line { margin: 0 0 12px; font-size: 14px; color: var(--success-color, #43a047); font-weight: 500; }
.hero.board { padding: 20px; border-left: 6px solid var(--accent); }
.plist { list-style: none; margin-top: 14px; } .plist.compact { margin-top: 6px; }
.prow { display: flex; align-items: baseline; gap: 10px; padding: 9px 0; border-top: 1px dashed var(--line); }
.prow:first-child { border-top: 0; }
.pname { flex: 1; min-width: 0; font-weight: 500; } .pnum { font-weight: 700; min-width: 3.4em; text-align: right; } .pnum.w { min-width: 5.4em; color: var(--accent); }
.ss { flex: none; width: 20px; height: 20px; border-radius: 4px; background: var(--accent); color: var(--accent-ink); font-size: 12px; font-weight: 700; display: grid; place-items: center; align-self: center; }
.filters { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; } .filters select { margin: 0; }
.fld { display: flex; flex-direction: column; gap: 3px; font-size: 13px; color: var(--muted); }
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.facts > div { background: var(--field); border-radius: var(--radius); padding: 10px 14px; }
.col > .filters { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; } .filters select { margin: 0; }
.fld { display: flex; flex-direction: column; gap: 3px; font-size: 13px; color: var(--muted); }
.facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.facts.compact { gap: 8px; } .facts.compact > div { border: 0; background: none; padding: 4px 0; }
.facts dt { color: var(--muted); font-size: 12px; } .facts dd { font-size: 22px; font-weight: 500; line-height: 1.2; } .facts dd.small { font-size: 16px; font-weight: 500; }
.legend { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 13px; color: var(--muted); margin-bottom: 10px; }
.sw { display: inline-block; width: 14px; height: 8px; border-radius: 2px; margin-right: 6px; vertical-align: middle; } .sw.fill { background: var(--accent); } .sw.avg { width: 3px; height: 14px; background: var(--ink); border-radius: 1px; }
.mrow { display: grid; grid-template-columns: minmax(96px, 34%) 1fr auto; align-items: center; gap: 10px; padding: 5px 0; }
.mname { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.track { position: relative; height: 12px; background: color-mix(in srgb, var(--line) 60%, transparent); border-radius: 6px; }
.track .fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--accent); border-radius: 6px; min-width: 2px; }
.track .avg { position: absolute; top: -3px; bottom: -3px; width: 3px; margin-left: -1.5px; background: var(--ink); border-radius: 1px; }
.mnum { font-weight: 700; text-align: right; min-width: 5.2em; } .mnum small { margin-left: 6px; font-weight: 400; }
.rows { list-style: none; } .rows li + li { border-top: 1px solid var(--line); }
.wrow { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; width: 100%; text-align: left; background: none; border: 0; color: inherit; font: inherit; padding: 10px 4px; cursor: pointer; border-radius: 8px; }
.wrow:hover { background: var(--field); }
.wdate { display: flex; flex-direction: column; align-items: center; width: 40px; line-height: 1.1; } .wdate b { font-size: 20px; }
.wmain { display: flex; flex-direction: column; min-width: 0; } .wname { font-weight: 600; } .wname em { color: var(--warn); font-style: normal; font-weight: 400; font-size: 13px; }
.wsub { color: var(--muted); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wmeta { color: var(--muted); font-size: 13px; text-align: right; white-space: pre; }
#exlist .wrow { grid-template-columns: 1fr auto; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; } .chip { background: color-mix(in srgb, var(--accent) 12%, transparent); border-radius: 999px; padding: 3px 12px; font-size: 13px; }
.note { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; }
table.sets { width: 100%; border-collapse: collapse; } .sets td { padding: 6px 4px; border-top: 1px solid var(--line); vertical-align: baseline; } .sets tr:first-child td { border-top: 0; }
.sets .no { color: var(--muted); width: 2em; } .sets .val { font-weight: 700; white-space: nowrap; }
.badge { font-size: 12px; background: var(--field); border-radius: 4px; padding: 1px 6px; margin-right: 6px; } .snote { color: var(--muted); font-size: 13px; }
.tag { background: color-mix(in srgb, var(--accent) 14%, transparent); border-radius: 10px; padding: 0 7px; font-size: 11px; color: var(--ink); font-weight: 400; }
.seg { display: inline-flex; flex-wrap: wrap; gap: 6px; }
.seg button { background: none; color: var(--muted); border: 1px solid var(--line); border-radius: 16px; font: inherit; font-size: 13px; padding: 4px 12px; cursor: pointer; }
.seg button[aria-pressed=true] { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--ink); border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
.btn { font: inherit; font-weight: 500; padding: 8px 18px; border-radius: var(--pill); border: 0; cursor: pointer;
  background: var(--wa-color-brand-fill-loud, var(--accent)); color: var(--wa-color-brand-on-loud, var(--accent-ink)); box-shadow: var(--ha-button-box-shadow, none); }
.btn.ghost { background: var(--wa-color-brand-fill-quiet, none); color: var(--wa-color-brand-on-quiet, var(--accent)); padding-left: 10px; padding-right: 10px; }
.btn.danger { background: none; color: var(--warn); }
.btn:disabled { opacity: .45; cursor: default; }
.search, select, input[type=file] { width: 100%; font: inherit; padding: 8px 10px; border-radius: 6px 6px 0 0; border: 0; border-bottom: 2px solid var(--line); background: var(--field); color: var(--ink); margin-bottom: 10px; }
.check { display: flex; gap: 8px; align-items: center; margin-top: 12px; } .actions { display: flex; gap: 8px; margin-top: 4px; }
.sugg { font-size: 22px; } .eq { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; } .eqphoto { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; flex: none; } .eq { align-items: center; } .eq span { flex: 1; } .eq em { color: var(--warn); font-style: normal; font-size: 13px; }
.routine { padding-top: 4px; } .routine + .routine { border-top: 1px solid var(--line); padding-top: 14px; }
.card > h2 + p.muted { margin: -6px 0 12px; }
.chart { width: 100%; height: auto; display: block; } .chart .gl { stroke: var(--line); stroke-width: 1; } .chart .tick { fill: var(--muted); font-size: 11px; }
.chart .ln { fill: none; stroke: var(--accent); stroke-width: 2.5; stroke-linejoin: round; } .chart .pt { fill: var(--card); stroke: var(--accent); stroke-width: 2; }
.chart .bar { fill: color-mix(in srgb, var(--ink) 28%, transparent); } .chart .bar.now { fill: var(--accent); } .chart .val { fill: var(--ink); font-size: 11px; font-weight: 600; }
.notice { text-align: center; padding: 32px 16px; } .notice .btn { margin-top: 12px; }
.ok { color: var(--ok); font-weight: 600; } .err { color: var(--warn); }
.toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--ink); color: var(--bg); padding: 10px 16px; border-radius: 8px; max-width: 90vw; z-index: 5; }
@media (max-width: 760px) {
  .grid.two { grid-template-columns: minmax(0, 1fr); } .page { padding: 12px; gap: 12px; }
  h2.big { font-size: 24px; } .wmeta { display: none; } .mrow { grid-template-columns: minmax(84px, 38%) 1fr auto; }
}
`;

installEditor(HafsPanel, { edit, esc });
customElements.define("hafs-panel", HafsPanel);
