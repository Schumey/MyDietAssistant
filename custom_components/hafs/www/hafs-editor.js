// Editor for programs, routines and gyms of the HAFS panel. Installed as methods on the panel element.
// Edits live in a draft; "Save" pushes full records through `hafs/sync/push`, the same way the app does,
// so the app picks them up at its next sync and nothing else writes to the plan tables.

export const EDITOR_CSS = `
.btn.small { padding: 5px 12px; font-size: 13.5px; } .btns { display: inline-flex; gap: 8px; flex-wrap: wrap; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; } .field > span { font-size: 13px; color: var(--muted); }
.field input, .field select, .erow input[type=text] { font: inherit; padding: 9px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); margin: 0; width: 100%; }
.erow { padding: 12px 0; border-top: 1px solid var(--line); } .erow:first-of-type { border-top: 0; }
.etop { display: flex; align-items: center; gap: 8px; } .etop .pname { flex: 1; min-width: 0; font-weight: 600; }
.ib { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--line); background: var(--card); color: var(--ink); font-size: 16px; cursor: pointer; }
.ib:disabled { opacity: .35; cursor: default; } .ib.warn { color: var(--warn); }
.efields { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 8px; color: var(--muted); font-size: 14px; }
.efields input.num { width: 4.2em; font: inherit; padding: 6px 8px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); text-align: center; }
.erow .check { margin-top: 8px; font-size: 14px; }
.eqgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; } .eqgrid .wide { grid-column: 1 / -1; }
.fld { display: flex; flex-direction: column; gap: 3px; font-size: 13px; color: var(--muted); } .fld.wide { grid-column: 1 / -1; } .fld small { color: var(--muted); }
.eqgrid .fld input[type=text], .eqgrid input[type=text], .eqgrid select { font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); width: 100%; margin: 0; }
.picker { margin-top: 12px; border: 1px solid var(--line); border-radius: 10px; padding: 10px; }
.picker .rows { max-height: 280px; overflow-y: auto; }
.pickrow { display: block; width: 100%; text-align: left; border: 0; background: none; color: inherit; font: inherit; padding: 9px 6px; cursor: pointer; border-radius: 6px; }
.pickrow:hover { background: color-mix(in srgb, var(--accent) 8%, transparent); } .pickrow small { margin-left: 8px; }
.formerr { color: var(--warn); margin: 0; } .savebar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.savebar .grow { flex: 1; }
.btn.linkish { border: 0; background: none; color: var(--accent); padding-left: 4px; padding-right: 4px; }
.btn.danger { color: var(--warn); }
@media (max-width: 760px) { .eqgrid { grid-template-columns: 1fr; } }
`;

export function installEditor(Panel, { edit, esc }) {
  const P = Panel.prototype;

  P._editClick = async function (el) {
    const act = el.dataset.act, v = el.dataset.v, i = el.dataset.i === undefined ? null : Number(el.dataset.i);
    const ed = this._edit;
    switch (act) {
      case "e-new-program": return this._openEditor("program", null);
      case "e-edit-program": return this._openEditor("program", v);
      case "e-new-routine": return this._openEditor("routine", null, v || null);
      case "e-edit-routine": return this._openEditor("routine", v);
      case "e-new-gym": return this._openEditor("gym", null);
      case "e-edit-gym": return this._openEditor("gym", v);
      case "e-cancel": this._edit = null; return this._show();
      case "e-save": return this._editSave();
      case "e-delete": return this._editDelete();
    }
    if (!ed) return;
    const d = ed.draft;
    const list = ed.kind === "routine" ? d.rows : ed.kind === "program" ? d.routineIds : d.equipment;
    const swap = (a, b) => { [list[a], list[b]] = [list[b], list[a]]; if (ed.kind === "routine") d.rows[0].withPrev = false; };
    switch (act) {
      case "e-toggle-range": edit.toggleRange(d.rows[i]); break;
      case "e-up": if (i > 0) swap(i, i - 1); break;
      case "e-down": if (i < list.length - 1) swap(i, i + 1); break;
      case "e-remove": {
        const [gone] = list.splice(i, 1);
        if (ed.kind === "gym" && gone.raw) d.removed.push(gone);
        if (ed.kind === "routine" && d.rows.length) d.rows[0].withPrev = false;
        break;
      }
      case "e-pick-toggle": ed.pick = !ed.pick; ed.pickFilter = ""; break;
      case "e-add-exercise": {
        const x = ed.data.exercises.find((e) => e.id === v);
        if (x) d.rows.push(edit.newRow(x));
        ed.pick = false;
        break;
      }
      case "e-add-routine": if (v && !d.routineIds.includes(v)) d.routineIds.push(v); break;
      case "e-toggle-day": {
        const n = Number(v);
        d.days = d.days.includes(n) ? d.days.filter((x) => x !== n) : [...d.days, n];
        break;
      }
      case "e-add-equipment": d.equipment.push(edit.newEquipment()); break;
      default: return;
    }
    ed.error = "";
    this._redraw(this._editorHtml());
    if (act === "e-pick-toggle" && ed.pick) this.shadowRoot.getElementById("pick-filter")?.focus();
  };

  P._editInput = function (el, changed = false) {
    const ed = this._edit, f = el.dataset.f;
    if (f === "pickFilter") {
      ed.pickFilter = el.value;
      const list = this.shadowRoot.getElementById("pick-list");
      if (list) list.innerHTML = this._pickRows();
      return;
    }
    const value = el.type === "checkbox" ? el.checked : el.value;
    const holder = el.dataset.i === undefined ? ed.draft : (ed.kind === "routine" ? ed.draft.rows : ed.draft.equipment)[Number(el.dataset.i)];
    if (!holder) return;
    holder[f] = value;
    if (f === "type" && ed.kind === "gym") edit.onTypeChange(holder);
    if (changed && (el.type === "checkbox" || el.tagName === "SELECT")) this._redraw(this._editorHtml());
  };

  P._openEditor = async function (kind, id, programId = null) {
    try {
      const data = await this._query("plan_edit");
      const draft = kind === "routine" ? edit.routineDraft(data, id, programId)
        : kind === "program" ? edit.programDraft(data, id)
        : edit.gymDraft(data, id, (n) => this._f.kg(n).replace(/\./g, "").replace(",", "."));
      this._edit = { kind, id, data, draft, pick: false, pickFilter: "", error: "" };
      this._redraw(this._editorHtml());
      this._main.scrollTo?.(0, 0);
    } catch (err) { this._toast(this._t("load_failed", err?.message || err?.code)); }
  };

  P._push = async function (records) {
    const res = await this._call({ type: "hafs/sync/push", records });
    if (res.rejected?.length) throw new Error(res.rejected.map((r) => r.reason).join("; "));
    if (!res.applied && res.skipped) throw new Error("newer version on the server, reload");
    return res;
  };

  P._editSave = async function () {
    const ed = this._edit, t = this._t;
    const build = { routine: edit.routineRecords, program: edit.programRecords, gym: edit.gymRecords }[ed.kind];
    let r;
    try { r = build(ed.draft, ed.data); } catch (err) { r = { error: "save_failed", detail: err?.message || String(err) }; }
    if (r.error) { ed.error = t(r.error, r.detail ?? ""); this._redraw(this._editorHtml()); return; }
    try {
      await this._push(r.records);
      this._edit = null;
      this._toast(`${t("saved_edit")}. ${t("sync_note")}`);
      this._show();
    } catch (err) { ed.error = t("save_failed", err?.message || err?.code || err); this._redraw(this._editorHtml()); }
  };

  P._editDelete = async function () {
    const ed = this._edit, t = this._t, raw = ed.draft.raw;
    if (!raw || !window.confirm(t("confirm_delete_" + ed.kind, raw.name))) return;
    const make = { routine: edit.routineDelete, program: edit.programDelete, gym: edit.gymDelete }[ed.kind];
    try {
      await this._push(make(raw.id, ed.data));
      this._edit = null;
      this._toast(`${t("deleted")}. ${t("sync_note")}`);
      this._show();
    } catch (err) { ed.error = t("save_failed", err?.message || err?.code || err); this._redraw(this._editorHtml()); }
  };

  // ---- HTML ---------------------------------------------------------------------------------

  P._editorHtml = function () {
    const ed = this._edit, t = this._t;
    const title = t((ed.draft.raw ? "edit_" : "new_") + ed.kind);
    const body = ed.kind === "routine" ? this._routineForm() : ed.kind === "program" ? this._programForm() : this._gymForm();
    return `<p><button class="btn ghost" data-act="e-cancel">← ${esc(t("back"))}</button></p><h2 class="big">${esc(title)}</h2>${body}
      ${ed.error ? `<p class="formerr" role="alert">${esc(ed.error)}</p>` : ""}
      <div class="savebar"><button class="btn primary" data-act="e-save">${esc(t("save"))}</button><button class="btn" data-act="e-cancel">${esc(t("cancel"))}</button>
        <span class="grow"></span>${ed.draft.raw ? `<button class="btn danger" data-act="e-delete">${esc(t("delete"))}</button>` : ""}</div>`;
  };

  const moveButtons = (t, i, n) => `<button class="ib" data-act="e-up" data-i="${i}" aria-label="${esc(t("move_up"))}"${i === 0 ? " disabled" : ""}>↑</button>
    <button class="ib" data-act="e-down" data-i="${i}" aria-label="${esc(t("move_down"))}"${i === n - 1 ? " disabled" : ""}>↓</button>
    <button class="ib warn" data-act="e-remove" data-i="${i}" aria-label="${esc(t("remove"))}">✕</button>`;

  P._routineForm = function () {
    const ed = this._edit, t = this._t, d = ed.draft;
    const groups = edit.supersetGroups(d.rows.map((r) => r.withPrev));
    const programs = [`<option value="">${esc(t("no_program"))}</option>`, ...ed.data.programs.map((p) => `<option value="${esc(p.id)}"${p.id === d.programId ? " selected" : ""}>${esc(p.name)}</option>`)].join("");
    const rows = d.rows.map((r, i) => `<div class="erow"><div class="etop">${groups[i] ? `<span class="ss">${groups[i]}</span>` : ""}<span class="pname">${esc(r.name)}</span>${moveButtons(t, i, d.rows.length)}</div>
      <div class="efields"><label>${esc(t("sets_label"))} <input class="num" inputmode="numeric" data-f="sets" data-i="${i}" value="${esc(r.sets)}"></label>
        ${r.range
          ? `<span>${esc(t("reps_label"))}</span><label>${esc(t("reps_from"))} <input class="num" inputmode="numeric" data-f="repsMin" data-i="${i}" value="${esc(r.repsMin)}"></label>
        <label>${esc(t("reps_to"))} <input class="num" inputmode="numeric" data-f="repsMax" data-i="${i}" value="${esc(r.repsMax)}"></label>`
          : `<label>${esc(t("reps_target"))} <input class="num" inputmode="numeric" data-f="repsMax" data-i="${i}" value="${esc(r.repsMax)}"></label>`}
        <button class="btn small linkish" data-act="e-toggle-range" data-i="${i}">${esc(t(r.range ? "use_target" : "use_range"))}</button></div>
      ${i > 0 ? `<label class="check"><input type="checkbox" data-f="withPrev" data-i="${i}"${r.withPrev ? " checked" : ""}> ${esc(t("superset_prev"))}</label>` : ""}</div>`).join("");
    return `<section class="card"><label class="field"><span>${esc(t("name"))}</span><input type="text" data-f="name" value="${esc(d.name)}" autocomplete="off"></label>
      <label class="field"><span>${esc(t("routine_program"))}</span><select data-f="programId">${programs}</select></label></section>
      <section class="card"><h3>${esc(t("exercises"))}</h3>${rows || `<p class="muted">${esc(t("no_exercises"))}</p>`}
        <p><button class="btn" data-act="e-pick-toggle">${esc(t("add_exercise"))}</button></p>
        ${ed.pick ? `<div class="picker"><input id="pick-filter" class="search" type="search" data-f="pickFilter" placeholder="${esc(t("exercise_search"))}" value="${esc(ed.pickFilter)}" autocomplete="off">
          <div id="pick-list" class="rows">${this._pickRows()}</div></div>` : ""}</section>`;
  };

  P._pickRows = function () {
    const ed = this._edit, t = this._t;
    const used = new Set(ed.draft.rows.map((r) => r.exerciseId));
    const q = ed.pickFilter.trim().toLowerCase();
    const list = ed.data.exercises.filter((e) => !used.has(e.id) && (!q || e.name.toLowerCase().includes(q))).slice(0, 60);
    return list.length ? list.map((e) => `<button class="pickrow" data-act="e-add-exercise" data-v="${esc(e.id)}">${esc(e.name)}<small class="muted">${esc(e.muscles.slice(0, 2).map((m) => this._muscle(m)).join(", "))}</small></button>`).join("")
      : `<p class="muted pad">${esc(t("no_match"))}</p>`;
  };

  P._programForm = function () {
    const ed = this._edit, t = this._t, d = ed.draft;
    const byId = new Map(ed.data.routines.map((r) => [r.id, r]));
    const rows = d.routineIds.map((id, i) => `<div class="erow"><div class="etop"><span class="pname">${esc(byId.get(id)?.name ?? "?")}</span>${moveButtons(t, i, d.routineIds.length)}</div></div>`).join("");
    const free = ed.data.routines.filter((r) => !r.program_id && !d.routineIds.includes(r.id));
    const days = [1, 2, 3, 4, 5, 6, 7].map((n) => `<button data-act="e-toggle-day" data-v="${n}" aria-pressed="${d.days.includes(n)}">${esc(new Date(2024, 0, n).toLocaleDateString(this._hass.language, { weekday: "short" }))}</button>`).join("");
    return `<section class="card"><label class="field"><span>${esc(t("name"))}</span><input type="text" data-f="name" value="${esc(d.name)}" autocomplete="off"></label>
      <p class="muted">${esc(t("rhythm"))}</p><div class="seg" role="group">${days}</div><p class="hint">${esc(t("rhythm_hint"))}</p></section>
      <section class="card"><h3>${esc(t("routines"))}</h3>${rows || `<p class="muted">${esc(t("no_exercises"))}</p>`}
        <p class="muted">${esc(t("add_routine"))}</p>${free.length ? `<div class="btns">${free.map((r) => `<button class="btn small" data-act="e-add-routine" data-v="${esc(r.id)}">+ ${esc(r.name)}</button>`).join("")}</div>` : `<p class="hint">${esc(t("no_free_routines"))}</p>`}</section>`;
  };

  P._gymForm = function () {
    const ed = this._edit, t = this._t, d = ed.draft;
    const type = (q) => {
      const known = edit.EQUIPMENT_TYPES.includes(q.type);
      return (known || !q.type ? "" : `<option value="${esc(q.type)}" selected>${esc(q.type)}</option>`)
        + edit.EQUIPMENT_TYPES.map((k) => `<option value="${k}"${q.type === k ? " selected" : ""}>${esc(t("type_" + k))}</option>`).join("");
    };
    const field = (q, i, f, label, hint, wide = false, mode = "text") => `<label class="fld${wide ? " wide" : ""}"><span>${esc(label)}</span>
      <input type="text" inputmode="${mode}" data-f="${f}" data-i="${i}" value="${esc(q[f])}" placeholder="${esc(hint)}" autocomplete="off"></label>`;
    const fields = (q, i) => {
      if (q.type === "machine_plate") {
        return field(q, i, "base", t("plate_base"), "0", false, "decimal") + field(q, i, "max", t("plate_max"), "", false, "decimal")
          + field(q, i, "plates", t("plates"), t("plates_hint"), true)
          + `<label class="check wide"><input type="checkbox" data-f="both" data-i="${i}"${q.both ? " checked" : ""}> ${esc(t("plate_both"))}</label>`;
      }
      if (q.type === "machine_stack") {
        return field(q, i, "steps", t("stack_steps"), t("stack_steps_hint"), true) + field(q, i, "extra", t("stack_extra"), "2,5", true, "decimal")
          + `<small class="wide muted">${esc(t("stack_extra_hint"))}</small>`;
      }
      return field(q, i, "steps", t("equipment_steps"), t("equipment_steps_hint"), true);
    };
    const rows = d.equipment.map((q, i) => `<div class="erow"><div class="etop"><span class="pname">${esc(q.name || t("equipment_name"))}</span>${moveButtons(t, i, d.equipment.length)}</div>
      <div class="eqgrid"><input type="text" data-f="name" data-i="${i}" value="${esc(q.name)}" placeholder="${esc(t("equipment_name"))}" aria-label="${esc(t("equipment_name"))}" autocomplete="off">
        <select data-f="type" data-i="${i}" aria-label="${esc(t("equipment_type"))}">${type(q)}</select>${fields(q, i)}</div>
      <label class="check"><input type="checkbox" data-f="outOfOrder" data-i="${i}"${q.outOfOrder ? " checked" : ""}> ${esc(t("out_of_order_check"))}</label></div>`).join("");
    return `<section class="card"><label class="field"><span>${esc(t("name"))}</span><input type="text" data-f="name" value="${esc(d.name)}" autocomplete="off"></label></section>
      <section class="card"><h3>${esc(t("equipment"))}</h3>${rows || `<p class="muted">${esc(t("no_equipment"))}</p>`}
        <p><button class="btn" data-act="e-add-equipment">${esc(t("new_equipment"))}</button></p></section>`;
  };
}
