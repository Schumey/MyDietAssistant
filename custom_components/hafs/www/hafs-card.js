// HAFS dashboard card: the next training day, this week's numbers and the last workout of the user who looks at the dashboard.
// Plain web component without build step (no dependencies), colors come from the Home Assistant theme.
// Usage:  type: custom:hafs-card   (optional: title: "Training", exercises: false, exercise: "Bankdrücken", months: 6, intake: false)
// With `exercise` (name or id) the card also shows the progress of that exercise (estimated 1RM, else heaviest weight).

const version = new URL(import.meta.url).search;
const { makeT, language, makeFormat, esc, lineChart } = await import(`./hafs-common.js${version}`);

const REFRESH_MS = 5 * 60 * 1000;

class HafsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._data = null;
    this._error = "";
    this._loadedAt = 0;
    this._loading = false;
    for (const prop of ["hass"]) {  // set on the plain element before the class was defined
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
  }

  setConfig(config) {
    this._config = { exercises: true, ...config };
    this._render();
  }

  getCardSize() { return this._config.exercises === false ? 3 : 6; }

  static getStubConfig() { return {}; }

  set hass(hass) {
    this._hass = hass;
    const lang = language(hass?.language);
    if (lang !== this._lang) { this._lang = lang; this._t = makeT(lang); this._f = makeFormat(hass?.locale?.language || hass?.language); this._render(); }
    // Training changes rarely: reload when the card is new, every few minutes, or when a workout sensor changed.
    const marker = this._marker(hass);
    if (!this._loading && (Date.now() - this._loadedAt > REFRESH_MS || marker !== this._seen)) this._load(marker);
  }

  // The state of every HAFS sensor, so that a finished workout refreshes the card without waiting for the timer.
  _marker(hass) {
    return Object.keys(hass?.states || {}).filter((k) => k.startsWith("sensor.hafs_") || k.startsWith("binary_sensor.hafs_"))
      .sort().map((k) => hass.states[k].state).join("|");
  }

  async _load(marker) {
    if (!this._hass) return;
    this._loading = true;
    try {
      const ask = (q, params = {}) => this._hass.connection.sendMessagePromise({ type: "hafs/web/query", q, params });
      this._data = await ask("overview");
      this._intake = null;
      if (this._config.intake !== false) {  // a note from MyDietAssistant; silently absent without it
        try { this._intake = await this._hass.connection.sendMessagePromise({ type: "hafs/intake/hint" }); } catch { /* older server */ }
      }
      this._progress = null;
      if (this._config.exercise) {
        try {
          const want = String(this._config.exercise).trim().toLowerCase();
          const list = (await ask("exercises", { all: true })).exercises;
          const hit = list.find((x) => x.id === this._config.exercise) || list.find((x) => x.name.toLowerCase() === want)
            || list.find((x) => x.name.toLowerCase().includes(want));
          this._progress = hit ? await ask("exercise", { id: hit.id }) : { missing: true };
        } catch (err) {
          this._progress = { failed: err?.message || String(err) };
        }
      }
      this._error = "";
      this._seen = marker;
    } catch (err) {
      this._error = err?.message || err?.code || String(err);
    } finally {
      this._loadedAt = Date.now();
      this._loading = false;
      this._render();
    }
  }

  _rows(list) {
    const t = this._t, f = this._f;
    return list.map((x) => {
      const reps = x.reps_min && x.reps_max ? (x.reps_min === x.reps_max ? x.reps_min : t("reps_range", x.reps_min, x.reps_max)) : x.reps_max || x.reps_min || "";
      const sets = x.sets && reps ? t("sets_short", x.sets, reps) : x.sets ? `${x.sets}×` : reps;
      const weight = x.target_weight != null ? `${f.kg(x.target_weight)} kg` : "";
      return `<li><span class="n">${esc(x.exercise)}</span><span class="s">${esc(sets)}</span><span class="w">${esc(weight)}</span></li>`;
    }).join("");
  }

  // Monday to Sunday of this week; a filled dot marks a day with a finished workout, the ring marks today.
  _weekStrip(days) {
    if (!Array.isArray(days) || !days.length) return "";
    const lang = this._f?.locale || this._hass?.locale?.language || this._hass?.language || "en";
    const name = (iso) => {
      try { return new Intl.DateTimeFormat(lang, { weekday: "short" }).format(new Date(`${iso}T12:00:00`)); } catch { return iso.slice(8); }
    };
    return `<div class="week">${days.map((x) => `<div class="day${x.workouts ? " on" : ""}${x.today ? " today" : ""}">
      <span class="dot">${x.workouts > 1 ? x.workouts : ""}</span><span class="lbl">${esc(name(x.date))}</span></div>`).join("")}</div>`;
  }

  // Progress of the configured exercise over the last `months` months (default 6).
  _progressBlock() {
    const t = this._t, f = this._f, p = this._progress;
    if (!this._config.exercise || !p) return "";
    if (p.missing) return `<p class="muted">${esc(t("card_exercise_missing", this._config.exercise))}</p>`;
    if (p.failed) return `<p class="muted">${esc(t("load_failed", p.failed))}</p>`;
    const sessions = p.sessions || [];
    const metric = sessions.some((x) => x.e1rm > 0) ? "e1rm" : "weight";
    const pick = metric === "e1rm" ? (x) => x.e1rm : (x) => x.best_weight;
    const cut = Date.now() - (Number(this._config.months) || 6) * 30.5 * 86400000;
    const points = sessions.filter((x) => pick(x) > 0 && new Date(x.date).getTime() >= cut).map((x) => ({
      t: new Date(x.date).getTime(), y: pick(x), label: `${f.date(x.date)}: ${f.kg(Math.round(pick(x) * 10) / 10)} kg` }));
    const chart = lineChart(points, { fmtX: (ms) => f.shortMonth(new Date(ms).toISOString()), fmtY: (v) => f.kg(Math.round(v * 10) / 10), ariaLabel: p.exercise?.name || "" })
      || `<p class="muted">${esc(t("no_data"))}</p>`;
    return `<div class="prog"><p class="kicker">${esc(p.exercise?.name || "")} · ${esc(t(metric === "e1rm" ? "metric_e1rm" : "metric_weight"))}</p>${chart}</div>`;
  }

  _render() {
    const t = this._t;
    if (!t) return;
    const f = this._f, d = this._data, c = this._config;
    let body;
    if (this._error && !d) {
      body = `<p class="muted">${esc(t("load_failed", this._error))}</p>`;
    } else if (!d) {
      body = `<p class="muted">…</p>`;
    } else {
      const s = d.status;
      let hero;
      if (s.active) {
        hero = `<p class="kicker">${esc(t("running_since", f.time(d.active_since) || ""))}</p><h2>${esc(s.next ? s.next.routine : t("free_workout"))}</h2>`;
      } else if (s.next) {
        const rows = c.exercises === false ? "" : `<ul>${this._rows(d.next_exercises || []) || (s.next.exercises || []).map((n) => `<li><span class="n">${esc(n)}</span></li>`).join("")}</ul>`;
        hero = `${s.state === "done" ? `<p class="done">✓ ${esc(t("done_line", s.last?.routine || t("free_workout")))}</p>` : ""}<p class="kicker">${esc(t("next_up"))}</p><h2>${esc(s.next.routine)}</h2>${this._intake?.hint ? `<p class="hint">${esc(t("intake_" + this._intake.hint, Math.round(this._intake.kcal ?? 0), Math.round(this._intake.carbs ?? 0)))}</p>` : ""}
          <p class="muted">${esc(t("next_program", s.next.program))}</p>${rows}`;
      } else {
        hero = `<h2>${esc(t("rest_day"))}</h2><p class="muted">${esc(t("no_plan"))}</p>`;
      }
      const last = s.last_workout_at ? f.date(s.last_workout_at) : t("never");
      body = `${hero}${this._weekStrip(d.week_days)}<dl><div><dt>${esc(t("workouts_week"))}</dt><dd>${f.int(s.workouts_week)}</dd></div>
        <div><dt>${esc(t("volume_week"))}</dt><dd>${esc(f.tonnes(s.volume_week_kg))}</dd></div>
        <div><dt>${esc(t("last_workout"))}</dt><dd class="small">${esc(last)}</dd></div></dl>${this._progressBlock()}`;
    }
    this.shadowRoot.innerHTML = `<style>
      :host { display: block; }
      ha-card { padding: 16px; }
      .title { font-size: 14px; color: var(--secondary-text-color); margin: 0 0 8px; }
      .kicker { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--primary-color); }
      h2 { margin: 2px 0 4px; font-size: 22px; font-weight: 500; color: var(--primary-text-color); }
      .done { margin: 0 0 10px; font-size: 14px; color: var(--success-color, #43a047); }
      .muted { margin: 0 0 8px; color: var(--secondary-text-color); font-size: 14px; }
      ul { list-style: none; margin: 8px 0 0; padding: 0; }
      li { display: flex; gap: 12px; padding: 6px 0; border-top: 1px solid var(--divider-color); font-size: 14px; color: var(--primary-text-color); }
      li .n { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      li .s, li .w { color: var(--secondary-text-color); white-space: nowrap; }
      li .w { min-width: 56px; text-align: right; }
      .week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin: 14px 0 0; text-align: center; }
      .day .dot { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin: 0 auto; border-radius: 50%;
        box-sizing: border-box; border: 2px solid var(--divider-color); font-size: 12px; color: var(--text-primary-color, #fff); }
      .day.on .dot { background: var(--primary-color); border-color: var(--primary-color); }
      .day.today .dot { border-color: var(--primary-color); }
      .day .lbl { display: block; margin-top: 2px; font-size: 11px; color: var(--secondary-text-color); }
      .hint { margin: 4px 0 8px; font-size: 13px; color: var(--warning-color, #ff9800); }
      .prog { margin-top: 16px; }
      .chart { width: 100%; height: auto; display: block; }
      .chart .gl { stroke: var(--divider-color); stroke-width: 1; }
      .chart .tick { fill: var(--secondary-text-color); font-size: 11px; }
      .chart .ln { fill: none; stroke: var(--primary-color); stroke-width: 2; }
      .chart .pt { fill: var(--primary-color); }
      dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0 0; }
      dt { font-size: 12px; color: var(--secondary-text-color); }
      dd { margin: 2px 0 0; font-size: 20px; color: var(--primary-text-color); }
      dd.small { font-size: 14px; padding-top: 4px; }
    </style><ha-card>${c.title ? `<p class="title">${esc(c.title)}</p>` : ""}${body}</ha-card>`;
  }
}

if (!customElements.get("hafs-card")) customElements.define("hafs-card", HafsCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((x) => x.type === "hafs-card")) {
  window.customCards.push({ type: "hafs-card", name: "HAFS", description: "Next training day, this week and the progress of one exercise from HAFS", preview: false });
}
