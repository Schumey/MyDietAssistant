// HAFS dashboard card: the next training day, this week's numbers and the last workout of the user who looks at the dashboard.
// Plain web component without build step (no dependencies), colors come from the Home Assistant theme.
// Usage:  type: custom:hafs-card   (optional: title: "Training", exercises: false)

const version = new URL(import.meta.url).search;
const { makeT, language, makeFormat, esc } = await import(`./hafs-common.js${version}`);

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
      this._data = await this._hass.connection.sendMessagePromise({ type: "hafs/web/query", q: "overview", params: {} });
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
        hero = `<p class="kicker">${esc(s.state === "done" ? t("done_today") : t("next_up"))}</p><h2>${esc(s.next.routine)}</h2>
          <p class="muted">${esc(t("next_program", s.next.program))}</p>${rows}`;
      } else {
        hero = `<h2>${esc(t("rest_day"))}</h2><p class="muted">${esc(t("no_plan"))}</p>`;
      }
      const last = s.last_workout_at ? f.date(s.last_workout_at) : t("never");
      body = `${hero}<dl><div><dt>${esc(t("workouts_week"))}</dt><dd>${f.int(s.workouts_week)}</dd></div>
        <div><dt>${esc(t("volume_week"))}</dt><dd>${esc(f.tonnes(s.volume_week_kg))}</dd></div>
        <div><dt>${esc(t("last_workout"))}</dt><dd class="small">${esc(last)}</dd></div></dl>`;
    }
    this.shadowRoot.innerHTML = `<style>
      :host { display: block; }
      ha-card { padding: 16px; }
      .title { font-size: 14px; color: var(--secondary-text-color); margin: 0 0 8px; }
      .kicker { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--primary-color); }
      h2 { margin: 2px 0 4px; font-size: 22px; font-weight: 500; color: var(--primary-text-color); }
      .muted { margin: 0 0 8px; color: var(--secondary-text-color); font-size: 14px; }
      ul { list-style: none; margin: 8px 0 0; padding: 0; }
      li { display: flex; gap: 12px; padding: 6px 0; border-top: 1px solid var(--divider-color); font-size: 14px; color: var(--primary-text-color); }
      li .n { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      li .s, li .w { color: var(--secondary-text-color); white-space: nowrap; }
      li .w { min-width: 56px; text-align: right; }
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
  window.customCards.push({ type: "hafs-card", name: "HAFS", description: "Next training day and this week's numbers from HAFS", preview: false });
}
