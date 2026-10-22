// All URLs are relative so the app works behind HA ingress.
const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e[k] = v;
    else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  e.append(...kids.flat().filter(x => x != null));
  return e;
};
const api = async (path, opts) => {
  const r = await fetch("api/" + path, opts);
  if (!r.ok) {
    let msg = r.status;
    try { msg = (await r.json()).detail || msg; } catch { /* keep status */ }
    throw new Error(msg);
  }
  return r.json();
};
const send = (method, path, body) =>
  api(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const n0 = n => Math.round(n).toLocaleString("de-DE");
const n1 = n => (Math.round(n * 10) / 10).toLocaleString("de-DE", { minimumFractionDigits: 1 });
const iso = d => d.toLocaleDateString("sv");
const parse = s => new Date(s + "T12:00:00");
const num = v => (v === "" || v == null ? null : Number(String(v).replace(",", ".")));

const state = { skin: "auto", features: {}, day: iso(new Date()), tab: "diary", range: 30, wrange: 90, whist: 10 };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const longDate = day => parse(day).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric", year: "numeric" });

// Hover tooltip for charts: elements with a data-tip attribute (SVG hit areas) show their text.
const tip = h("div", { id: "tip", hidden: true });
document.body.append(tip);
function tipHandlers(box) {
  const move = e => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.dataset.tip;
    tip.hidden = false;
    const w = tip.offsetWidth, hh = tip.offsetHeight;
    tip.style.left = Math.max(4, Math.min(e.clientX + 14, innerWidth - w - 4)) + "px";
    tip.style.top = (e.clientY - hh - 12 < 4 ? e.clientY + 18 : e.clientY - hh - 12) + "px";
  };
  box.addEventListener("mousemove", move);
  box.addEventListener("click", move);
  box.addEventListener("mouseleave", () => { tip.hidden = true; });
  return box;
}

// Axis labels on round dates: every day, 5-day marks, 1st/15th, or month starts depending on the span.
function niceTicks(first, last) {
  const n = Math.round((parse(last) - parse(first)) / 864e5) + 1;
  const all = [];
  for (let i = 0; i < n; i++) { const d = parse(first); d.setDate(d.getDate() + i); all.push(d); }
  let pick = () => true;
  let fmt = d => d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" });
  if (n > 100) {
    const every = n > 200 ? 2 : 1;
    pick = d => d.getDate() === 1 && d.getMonth() % every === 0;
    fmt = d => d.toLocaleDateString("de-DE", d.getMonth() === 0 ? { month: "short", year: "2-digit" } : { month: "short" });
  } else if (n > 31) pick = d => d.getDate() === 1 || d.getDate() === 15;
  else if (n > 10) pick = d => [1, 5, 10, 15, 20, 25].includes(d.getDate());
  return all.filter(pick).map(d => ({ day: iso(d), label: fmt(d) }));
}

// Plausibility of calories against macros (per 100 g): 4 kcal/g carbs and protein, 9 kcal/g fat.
function plausibility(f, total = false) {
  const c = f.carbs || 0, p = f.protein || 0, fa = f.fat || 0;
  if (!total && c + p + fa > 100.5) return `Die Makros ergeben ${n0(c + p + fa)} g auf 100 g – mehr als möglich.`;
  if (!c && !p && !fa) return null;
  const calc = 4 * c + 4 * p + 9 * fa;
  // tolerance for fibre (less energy) and alcohol (more energy)
  if (Math.abs(f.kcal - calc) > Math.max(25, calc * 0.2))
    return `Die Makros ergeben rechnerisch ca. ${n0(calc)} kcal, angegeben sind ${n0(f.kcal)} kcal.`;
  return null;
}
const dlg = $("#dlg");
// A dialog is a title (h2) plus a body; the body wrapper lets the Windows look pad the content.
const setDlg = (...kids) => {
  const [first, ...rest] = kids.flat(Infinity).filter(x => x != null && x !== false);
  if (first && first.tagName === "H2") dlg.replaceChildren(first, h("div", { class: "dlg-body" }, ...rest));
  else dlg.replaceChildren(h("div", { class: "dlg-body" }, first, ...rest));
};

// Optik: "auto" switches to the Windows look when the HA theme is called HA 95/98 (see theme.js).
const SKIN_RE = /ha[\s_-]*9[58]|windows|win[\s_-]*9[58]/i;
function applySkin() {
  const name = document.documentElement.dataset.themeName || "";
  const win = state.skin === "win" || (state.skin !== "default" && SKIN_RE.test(name));
  document.documentElement.dataset.skin = win ? "win" : "default";
}
new MutationObserver(applySkin).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-name"] });
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

// ---------------------------------------------------------------- tabs
$("#tabs").addEventListener("click", e => {
  const t = e.target.closest("button");
  if (t) show(t.dataset.tab);
});
function show(tab) {
  state.tab = tab;
  for (const b of document.querySelectorAll("#tabs button")) b.classList.toggle("active", b.dataset.tab === tab);
  for (const s of document.querySelectorAll("main > section")) s.hidden = s.id !== tab;
  ({ diary: renderDiary, foods: renderFoods, meals: renderMeals, weight: renderWeight, stats: renderStats, settings: renderSettings })[tab]();
}

// ---------------------------------------------------------------- categories
const cat = { all: [], hidden: [] };
const loadCats = async () => Object.assign(cat, await api("categories"));
const isVisible = x => !x.category || !cat.hidden.includes(x.category);
const catList = () => h("datalist", { id: "cat-list" }, cat.all.map(c => h("option", { value: c })));

// Toggle chips: a highlighted category is shown, the others are hidden everywhere.
function catChips(onchange) {
  if (!cat.all.length) return null;
  return h("div", { class: "range chips" }, h("span", { class: "muted" }, "Kategorien:"), cat.all.map(c => {
    const b = h("button", { class: cat.hidden.includes(c) ? "" : "active", title: "Ein-/ausblenden", onclick: async () => {
      cat.hidden = cat.hidden.includes(c) ? cat.hidden.filter(x => x !== c) : [...cat.hidden, c];
      await send("PUT", "categories/hidden", { hidden: cat.hidden });
      b.classList.toggle("active", !cat.hidden.includes(c));
      onchange();
    } }, c);
    return b;
  }));
}

// ---------------------------------------------------------------- diary
const timeNow = () => new Date().toTimeString().slice(0, 5);
const entryLabel = e => (e.grams > 0 ? `${e.name}, ${n0(e.grams)} g` : e.name);

async function renderDiary() {
  const [d, trackers] = await Promise.all([api("day/" + state.day), state.features.trackers ? api("trackers?day=" + state.day) : [], loadCats()]);
  state.data = d;
  const times = d.mode === "times";
  const root = $("#diary");
  root.replaceChildren();

  const label = parse(state.day).toLocaleDateString("de-DE",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const picker = h("input", { type: "date", value: state.day, onchange: e => {
    if (e.target.value) { state.day = e.target.value; renderDiary(); }
  } });
  root.append(h("div", { class: "daynav" },
    h("button", { class: "step", onclick: () => shiftDay(-1), "aria-label": "Vortag" }, "‹"),
    h("div", { class: "date" }, label, picker),
    h("button", { class: "step", onclick: () => shiftDay(1), "aria-label": "Folgetag" }, "›")));

  // one card per meal, or a single chronological card in time mode
  const section = (title, items, meal) => {
    const sum = k => items.reduce((a, e) => a + e[k], 0);
    const rows = items.map(e => h("tr", { class: "item" },
      h("td", { onclick: () => editEntry(e, times), title: "Bearbeiten" },
        times ? h("span", { class: "time" }, e.time || "––:––") : null, entryLabel(e)),
      h("td", {}, n0(e.kcal)), h("td", {}, n0(e.carbs)), h("td", {}, n0(e.fat)), h("td", {}, n0(e.protein)),
      h("td", {}, h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", onclick: async () => {
        await api("entries/" + e.id, { method: "DELETE" });
        renderDiary();
      } }, "✕"))));
    return h("div", { class: "card" }, h("table", { class: "diary" },
      h("thead", {}, h("tr", {},
        h("th", { class: "title" }, title),
        h("th", {}, "Kalorien", h("small", {}, "kcal")),
        h("th", {}, "Kohlenhydrate", h("small", {}, "g")),
        h("th", {}, "Fette", h("small", {}, "g")),
        h("th", {}, "Eiweiß", h("small", {}, "g")),
        h("th", {}))),
      h("tbody", {}, rows, h("tr", { class: "foot" },
        h("td", {},
          h("button", { class: "flat", onclick: () => openAdd(meal) }, "+ Nahrungsmittel hinzufügen"),
          items.length ? [
            h("button", { class: "flat", onclick: () => copyDialog(meal, items, times) }, "Speichern / Kopieren")] : null),
        h("td", {}, items.length ? n0(sum("kcal")) : ""), h("td", {}, items.length ? n0(sum("carbs")) : ""),
        h("td", {}, items.length ? n0(sum("fat")) : ""), h("td", {}, items.length ? n0(sum("protein")) : ""),
        h("td", {}, items.length ? h("button", { class: "icon", title: meal ? "Mahlzeit leeren" : "Tag leeren",
          "aria-label": "Mahlzeit leeren", onclick: async () => {
            if (!confirm(meal ? `Alle Einträge von „${meal.name}“ löschen?` : "Alle Einträge dieses Tages löschen?")) return;
            await api(`day/${state.day}/entries` + (meal ? "?meal_id=" + meal.id : ""), { method: "DELETE" });
            renderDiary();
          } }, "✕") : null)))));
  };

  if (times) {
    const sorted = [...d.entries].sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99") || a.id - b.id);
    root.append(section("Einträge", sorted, null));
  } else {
    const showAll = state.showHidden === state.day;
    const hidden = d.meals.filter(m => m.hidden);
    for (const meal of d.meals) {
      if (!meal.hidden || showAll) root.append(section(meal.name, d.entries.filter(e => e.meal_id === meal.id), meal));
    }
    if (hidden.length) root.append(h("div", { class: "hint" }, h("button", { class: "flat", onclick: () => {
      state.showHidden = showAll ? null : state.day; renderDiary();
    } }, showAll ? "Ausgeblendete Mahlzeiten wieder verbergen" : [h("span", { class: "num" }, hidden.length), `leere/ausgeblendete Mahlzeit${hidden.length > 1 ? "en" : ""} anzeigen`])));
  }

  const t = d.totals, g = d.goal;
  const rem = (goal, total) => {
    if (!goal) return h("td", { class: "muted" }, "–");
    const r = goal - total;
    return h("td", { class: r < 0 ? "over" : "under" }, n0(r));
  };
  const goalCell = v => h("td", {}, v ? n0(v) : "–");
  root.append(h("div", { class: "card" },
    h("div", { class: "bar", style: "margin-bottom:12px" },
      h("i", { class: t.kcal > g.kcal ? "over" : "", style: `width:${Math.min(100, t.kcal / (g.kcal || 1) * 100)}%` })),
    h("table", { class: "summary" },
      h("thead", {}, h("tr", {}, h("th"),
        h("th", {}, "Kalorien"), h("th", {}, "Kohlenhydrate"), h("th", {}, "Fette"), h("th", {}, "Eiweiß"))),
      h("tbody", {},
        h("tr", {}, h("th", {}, "Gesamt"), h("td", {}, n0(t.kcal)), h("td", {}, n0(t.carbs)), h("td", {}, n0(t.fat)), h("td", {}, n0(t.protein))),
        h("tr", {}, h("th", {}, "Dein Tagesziel"), goalCell(g.kcal), goalCell(g.carbs), goalCell(g.fat), goalCell(g.protein)),
        h("tr", {}, h("th", {}, "Verbleibend"), rem(g.kcal, t.kcal), rem(g.carbs, t.carbs), rem(g.fat, t.fat), rem(g.protein, t.protein))))));

  if (state.features.trackers && trackers.length) root.append(trackerCard(trackers));
}

// Water & supplements (optional feature): +/- buttons with a daily goal.
function trackerCard(list) {
  const card = h("div", { class: "card" }, h("h2", {}, "Wasser & Ergänzungen"));
  const fmt = v => (Math.round(v * 10) / 10).toLocaleString("de-DE");
  const draw = () => card.replaceChildren(card.firstChild, ...list.map(t => {
    const set = async amount => {
      t.amount = Math.max(0, Math.round(amount * 100) / 100);
      draw();
      await send("PUT", `trackers/${t.id}/log/${state.day}`, { amount: t.amount });
    };
    return h("div", { class: "tracker" },
      h("div", { class: "tracker-head" }, h("span", {}, t.name),
        h("span", { class: t.goal && t.amount > t.goal ? "muted over" : "muted" },
          `${fmt(t.amount)}${t.goal ? " / " + fmt(t.goal) : ""} ${t.unit}`)),
      t.goal ? h("div", { class: "bar" }, h("i", { class: t.amount > t.goal ? "over" : "", style: `width:${Math.min(100, t.amount / t.goal * 100)}%` })) : null,
      h("div", { class: "tracker-btns" },
        h("button", { class: "flat", disabled: t.amount <= 0, onclick: () => set(t.amount - t.step) }, `− ${fmt(t.step)}`),
        h("button", { onclick: () => set(t.amount + t.step) }, `+ ${fmt(t.step)} ${t.unit}`)));
  }));
  draw();
  return card;
}

function shiftDay(n) {
  const d = parse(state.day);
  d.setDate(d.getDate() + n);
  state.day = iso(d);
  renderDiary();
}

// Pick a food and an amount (used to swap a component of an entry or a saved meal).
function foodSwapDialog({ title, grams, confirm, onDone, onCancel }) {
  const search = h("input", { type: "search", placeholder: "Lebensmittel suchen…", oninput: draw });
  const results = h("div", { class: "results" });
  const detail = h("div");
  const body = h("div", {}, search, results,
    h("div", { class: "actions" }, h("button", { class: "flat", onclick: onCancel }, "Zurück")));
  let foods = [];
  function draw() {
    const q = search.value.toLowerCase();
    results.replaceChildren(...foods.filter(isVisible)
      .filter(f => ((f.name || "") + " " + (f.brand || "")).toLowerCase().includes(q)).slice(0, 50)
      .map(f => h("button", { class: "food", onclick: () => choose(f) },
        h("span", {}, f.name, f.brand ? ` (${f.brand})` : ""), h("span", { class: "muted" }, `${n0(f.kcal)} kcal/100 g`))));
  }
  function choose(f) {
    const g = h("input", { type: "number", step: "any", min: "1", value: grams || f.serving_g || 100, oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = (num(g.value) || 0) / 100;
      pv.replaceChildren(h("span", {}, h("b", {}, n0(f.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(f.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(f.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(f.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, f.name), h("label", {}, "Menge (g)"), g, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: () => { detail.replaceChildren(); body.hidden = false; } }, "Zurück"),
        h("button", { onclick: () => { if (num(g.value) > 0) onDone(f, num(g.value)); } }, confirm)));
    body.hidden = true;
    g.select();
  }
  Promise.all([api("foods"), loadCats()]).then(([x]) => { foods = x; draw(); });
  setTimeout(() => search.focus());
  return [h("h2", {}, title), body, detail];
}

const foodItem = (f, grams) => {
  const k = grams / 100;
  return { name: f.name, grams, kcal: f.kcal * k, protein: f.protein * k, carbs: f.carbs * k, fat: f.fat * k };
};

function editEntry(e, times) {
  const quick = !(e.grams > 0);
  const grams = h("input", { type: "number", step: "any", min: "1", value: e.grams || "" });
  const time = h("input", { type: "time", value: e.time || "" });
  const q = {};
  const qfield = (key, label) => {
    q[key] = h("input", { type: key === "name" ? "text" : "number", step: "any", min: "0", value: e[key] ? (key === "name" ? e[key] : Math.round(e[key] * 10) / 10) : (key === "name" ? "" : 0) });
    return h("div", {}, h("label", {}, label), q[key]);
  };
  const msg = h("div", { class: "err" });
  setDlg(
    h("h2", {}, e.name),
    quick ? [qfield("name", "Bezeichnung"),
      h("div", { class: "grid", style: "margin-top:12px" }, qfield("kcal", "kcal"), qfield("carbs", "KH (g)"), qfield("fat", "Fett (g)"), qfield("protein", "Eiweiß (g)"))]
      : [h("label", {}, "Menge (g)"), grams],
    times ? [h("label", {}, "Uhrzeit"), time] : null,
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => swapEntry(e, times, quick ? null : num(grams.value)) }, "Lebensmittel tauschen"),
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        const body = {};
        if (quick) {
          if (!q.name.value.trim() || num(q.kcal.value) == null) { msg.textContent = "Bezeichnung und kcal sind Pflicht."; return; }
          Object.assign(body, { name: q.name.value, kcal: num(q.kcal.value), carbs: num(q.carbs.value) || 0,
            fat: num(q.fat.value) || 0, protein: num(q.protein.value) || 0 });
        } else {
          if (!(num(grams.value) > 0)) return;
          body.grams = num(grams.value);
        }
        if (times) body.time = time.value || null;
        await send("PUT", "entries/" + e.id, body);
        dlg.close(); renderDiary();
      } }, "Speichern")));
  dlg.showModal();
}

// Replace the food of a diary entry (e.g. rice -> pasta) while keeping its amount by default.
function swapEntry(e, times, grams) {
  setDlg(foodSwapDialog({
    title: `„${e.name}“ tauschen`, grams: grams || e.grams || null, confirm: "Tauschen",
    onCancel: () => editEntry(e, times),
    onDone: async (f, g) => {
      await send("PUT", "entries/" + e.id, { food_id: f.id, grams: g });
      dlg.close(); renderDiary();
    },
  }));
  dlg.showModal();
}

// Entry without a food: only a name and calories/macros.
function quickDialog(meal) {
  const times = state.data.mode === "times";
  const f = {};
  const field = (key, label, attrs = {}) => {
    f[key] = h("input", { type: key === "name" ? "text" : "number", step: "any", min: "0", oninput: check, ...attrs });
    return h("div", {}, h("label", {}, label), f[key]);
  };
  const time = h("input", { type: "time", value: timeNow() });
  const warn = h("div", { class: "warn" });
  const msg = h("div", { class: "err" });
  function check() {
    const v = { kcal: num(f.kcal.value) || 0, carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0, protein: num(f.protein.value) || 0 };
    warn.textContent = (v.kcal || v.carbs || v.fat || v.protein) ? plausibilityTotal(v) || "" : "";
  }
  setDlg(h("h2", {}, meal ? `Schnelleingabe in „${meal.name}“` : "Schnelleingabe"),
    h("div", { class: "muted" }, "Ohne Lebensmittel, nur Kalorien und bei Bedarf Makros (z. B. „Restaurant, ca. 800 kcal“)."),
    h("div", { style: "margin-top:12px" }, field("name", "Bezeichnung", { placeholder: "z. B. Restaurant" })),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("kcal", "kcal"), field("carbs", "KH (g)"), field("fat", "Fett (g)"), field("protein", "Eiweiß (g)")),
    times ? [h("label", {}, "Uhrzeit"), time] : null, warn, msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!f.name.value.trim() || num(f.kcal.value) == null) { msg.textContent = "Bezeichnung und kcal sind Pflicht."; return; }
        try {
          await send("POST", "entries/quick", { day: state.day, meal_id: meal ? meal.id : null, time: times ? time.value || null : null,
            name: f.name.value, kcal: num(f.kcal.value), carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0, protein: num(f.protein.value) || 0 });
          dlg.close(); renderDiary();
        } catch (er) { msg.textContent = er.message; }
      } }, "Hinzufügen")));
  dlg.showModal();
  setTimeout(() => f.name.focus());
}

// Same check for absolute amounts (not per 100 g): only the kcal/macro relation, no 100 g limit.
const plausibilityTotal = v => plausibility(v, true);

// Copy entries of a diary meal to another meal and/or day.
const modeTabs = (active, meal, items, times) => h("div", { class: "range" },
  h("button", { class: active === "copy" ? "active" : "", onclick: () => copyDialog(meal, items, times) }, "Kopieren"),
  h("button", { class: active === "save" ? "active" : "", onclick: () => saveMealDialog(meal, items, times) }, "Als Mahlzeit speichern"));

function copyDialog(meal, items, times) {
  const meals = state.data.meals.filter(m => !m.archived || (meal && m.id === meal.id));
  const day = h("input", { type: "date", value: state.day });
  const target = h("select", {}, meals.map(m => h("option", { value: m.id, selected: meal && m.id === meal.id }, m.name)));
  const time = h("input", { type: "time" });
  const picks = items.map(e => [e, h("input", { type: "checkbox", checked: true })]);
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, meal ? `„${meal.name}“` : "Einträge"), modeTabs("copy", meal, items, times),
    h("label", {}, "Am Tag"), day,
    times ? [h("label", {}, "Neue Uhrzeit (leer = Originalzeit)"), time] : [h("label", {}, "In Mahlzeit"), target],
    h("div", { class: "list" }, picks.map(([e, box]) =>
      h("label", { class: "pick" }, box, `${times && e.time ? e.time + " " : ""}${entryLabel(e)} · ${n0(e.kcal)} kcal`))),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        const ids = picks.filter(([, b]) => b.checked).map(([e]) => e.id);
        if (!ids.length || !day.value) { msg.textContent = "Nichts ausgewählt."; return; }
        try {
          await send("POST", "entries/copy", { ids, day: day.value, meal_id: times ? null : Number(target.value),
            time: times ? time.value || null : null });
          dlg.close(); state.day = day.value; renderDiary();
        } catch (e) { msg.textContent = e.message; }
      } }, "Kopieren")));
  dlg.showModal();
}

// Save the entries of a diary meal (or, in time mode, a selection of the day) as a reusable meal.
function saveMealDialog(meal, items, times) {
  const name = h("input", { value: meal ? meal.name : "", placeholder: "Name der Mahlzeit" });
  const category = h("input", { list: "cat-list", placeholder: "z. B. Diät, Bulk (optional)" });
  const picks = times ? items.map(e => [e, h("input", { type: "checkbox", checked: true })]) : [];
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, meal ? `„${meal.name}“` : "Einträge"), modeTabs("save", meal, items, times),
    h("label", {}, "Name"), name, h("label", {}, "Kategorie"), category, catList(),
    times ? h("div", { class: "list" }, picks.map(([e, box]) =>
      h("label", { class: "pick" }, box, `${e.time || ""} ${entryLabel(e)} · ${n0(e.kcal)} kcal`))) : null,
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!name.value.trim()) { msg.textContent = "Bitte einen Namen angeben."; return; }
        const ids = picks.filter(([, b]) => b.checked).map(([e]) => e.id);
        if (times && !ids.length) { msg.textContent = "Nichts ausgewählt."; return; }
        try {
          await send("POST", "saved-meals", { day: state.day, meal_id: meal ? meal.id : null,
            entry_ids: times ? ids : null, name: name.value, category: category.value });
          dlg.close();
        } catch (e) { msg.textContent = e.message; }
      } }, "Speichern")));
  dlg.showModal();
}

// ---------------------------------------------------------------- food form (shared)
// Create (food == null) or edit a food; onSave receives the food id.
function foodForm({ food = null, onSave, onCancel }) {
  const f = { barcode: h("input", { inputmode: "numeric", placeholder: "Barcode" }) };
  const field = (key, label, attrs = {}) => {
    f[key] = h("input", { id: "nf-" + key, ...attrs, value: food ? food[key] : attrs.value });
    return h("div", {}, h("label", { for: "nf-" + key }, label), f[key]);
  };
  const msg = h("div", { class: "err" });
  const warn = h("div", { class: "warn" });
  const check = () => {
    const v = { kcal: num(f.kcal.value), carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0, protein: num(f.protein.value) || 0 };
    warn.textContent = v.kcal == null ? "" : plausibility(v) || "";
  };
  const form = h("div", {},
    h("div", { class: "grid" },
      h("div", {}, h("label", {}, "Barcode (Open Food Facts)"), f.barcode),
      h("button", { class: "flat", onclick: async () => {
        msg.textContent = "";
        try {
          const p = await api("off/barcode/" + encodeURIComponent(f.barcode.value.trim()));
          f.name.value = p.name; f.brand.value = p.brand;
          for (const k of ["kcal", "protein", "carbs", "fat"]) f[k].value = Math.round(p[k] * 10) / 10;
          check();
        } catch (e) { msg.textContent = "Produkt nicht gefunden (" + e.message + ")"; }
      } }, "Suchen")),
    h("div", { style: "margin-top:12px" }, field("name", "Name")),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("brand", "Marke"),
      field("category", "Kategorie", { list: "cat-list", placeholder: "z. B. Diät, Bulk" }),
      field("serving_g", "Portion (g)", { type: "number", step: "any", value: 100 })),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("kcal", "kcal / 100 g", { type: "number", step: "any" }),
      field("carbs", "KH / 100 g", { type: "number", step: "any" }),
      field("fat", "Fett / 100 g", { type: "number", step: "any" }),
      field("protein", "Eiweiß / 100 g", { type: "number", step: "any" })),
    warn, msg, catList(),
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: onCancel }, food ? "Abbrechen" : "Zurück"),
      h("button", { onclick: async () => {
        if (!f.name.value.trim() || num(f.kcal.value) == null) { msg.textContent = "Name und kcal sind Pflicht."; return; }
        const body = {
          name: f.name.value, brand: f.brand.value, kcal: num(f.kcal.value),
          protein: num(f.protein.value) || 0, carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0,
          serving_g: num(f.serving_g.value) || 100, category: f.category.value };
        const id = food ? food.id : (await send("POST", "foods", body)).id;
        if (food) await send("PUT", "foods/" + food.id, body);
        onSave(id);
      } }, food ? "Speichern" : "Speichern & wählen")));
  for (const k of ["kcal", "carbs", "fat", "protein"]) f[k].addEventListener("input", check);
  check();
  setTimeout(() => f.name.focus());
  return form;
}

// ---------------------------------------------------------------- add dialog (foods + saved meals)
async function openAdd(meal) {
  const times = state.data.mode === "times";
  let [foods, saved, sugg] = await Promise.all([api("foods"), api("saved-meals"),
    api("suggestions" + (meal ? "?meal_id=" + meal.id : "")), loadCats()]);
  let tab = "foods";
  const time = h("input", { type: "time", value: timeNow() });
  const search = h("input", { type: "search", placeholder: "Suchen…", oninput: draw });
  const results = h("div", { class: "results" });
  const detail = h("div");
  const body = h("div");
  const chips = h("div");
  const sug = h("div", { class: "results suggest" });
  const tabs = h("div", { class: "range" },
    ["foods", "Lebensmittel", "saved", "Meine Mahlzeiten"].flatMap((v, i, a) => i % 2 ? [] : [
      h("button", { class: v === tab ? "active" : "", "data-t": v, onclick: () => { tab = v; draw(); } }, a[i + 1])]));

  function drawChips() {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
  }

  function draw() {
    for (const b of tabs.children) b.classList.toggle("active", b.dataset.t === tab);
    const q = search.value.toLowerCase();
    const list = tab === "foods" ? foods : saved;
    const frequent = (tab === "foods" ? sugg.items : sugg.saved.filter(isVisible));
    sug.replaceChildren(...(!q && frequent.length ? [h("div", { class: "muted sect" }, "Häufig verwendet"),
      ...frequent.map(x => h("button", { class: "food", onclick: () => (tab === "foods" ? selectEntry(x) : selectSaved(x)) },
        h("span", {}, x.name), h("span", { class: "muted" }, `${n0(x.kcal)} kcal${x.grams ? " · " + n0(x.grams) + " g" : ""}`))),
      h("div", { class: "muted sect" }, "Alle")] : []));
    const rows = list.filter(isVisible).filter(x => ((x.name || "") + " " + (x.brand || "")).toLowerCase().includes(q)).slice(0, 50);
    results.replaceChildren(...rows.map(x => h("button", { class: "food", onclick: () => (tab === "foods" ? select(x) : selectSaved(x)) },
      h("span", {}, x.name, x.brand ? ` (${x.brand})` : "", x.category ? h("span", { class: "tag" }, x.category) : null),
      h("span", { class: "muted" }, tab === "foods" ? `${n0(x.kcal)} kcal/100 g` : `${n0(x.kcal)} kcal`))));
    if (!rows.length) results.append(h("div", { class: "muted", style: "padding:8px" },
      tab === "foods" ? "Nichts gefunden – lege ein neues Lebensmittel an."
        : "Keine gespeicherte Mahlzeit. Im Tagebuch über „Als Mahlzeit speichern“ anlegen."));
    drawChips();
  }

  const target = () => ({ day: state.day, meal_id: meal ? meal.id : null, time: times ? time.value || null : null });
  const back = () => { detail.replaceChildren(); body.hidden = false; };

  function select(f) {
    const grams = h("input", { type: "number", step: "any", min: "1", value: f.serving_g || 100, oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = (num(grams.value) || 0) / 100;
      pv.replaceChildren(
        h("span", {}, h("b", {}, n0(f.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(f.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(f.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(f.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, f.name), h("label", {}, "Menge (g)"), grams, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: back }, "Zurück"),
        h("button", { onclick: async () => {
          if (!(num(grams.value) > 0)) return;
          await send("POST", "entries", { ...target(), food_id: f.id, grams: num(grams.value) });
          dlg.close(); renderDiary();
        } }, "Hinzufügen")));
    body.hidden = true;
    grams.select();
  }

  // a frequently used diary entry: re-add it with the last amount (scaled from the stored snapshot)
  function selectEntry(it) {
    const grams = h("input", { type: "number", step: "any", min: "1", value: it.grams, oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = (num(grams.value) || 0) / it.grams;
      pv.replaceChildren(
        h("span", {}, h("b", {}, n0(it.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(it.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(it.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(it.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, it.name), h("label", {}, "Menge (g)"), grams, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: back }, "Zurück"),
        h("button", { onclick: async () => {
          if (!(num(grams.value) > 0)) return;
          const { day, meal_id, time: t } = target();
          await send("POST", "entries/copy", { ids: [it.entry_id], day, meal_id, time: t, factor: num(grams.value) / it.grams });
          dlg.close(); renderDiary();
        } }, "Hinzufügen")));
    body.hidden = true;
    grams.select();
  }

  function selectSaved(s) {
    const factor = h("input", { type: "number", step: "any", min: "0.1", value: 1, oninput: preview });
    const pv = h("div", { class: "preview" });
    function preview() {
      const k = num(factor.value) || 0;
      pv.replaceChildren(
        h("span", {}, h("b", {}, n0(s.kcal * k)), " kcal"), h("span", {}, h("b", {}, n0(s.carbs * k)), " g KH"),
        h("span", {}, h("b", {}, n0(s.fat * k)), " g Fett"), h("span", {}, h("b", {}, n0(s.protein * k)), " g Eiweiß"));
    }
    preview();
    detail.replaceChildren(h("h3", {}, s.name),
      h("div", { class: "muted" }, s.items.map(i => entryLabel(i)).join(" · ")),
      h("label", {}, "Portionen"), factor, pv,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: back }, "Zurück"),
        h("button", { onclick: async () => {
          if (!(num(factor.value) > 0)) return;
          const { day, meal_id, time: t } = target();
          await send("POST", `saved-meals/${s.id}/add`, { day, meal_id, time: t, factor: num(factor.value) });
          dlg.close(); renderDiary();
        } }, "Hinzufügen")));
    body.hidden = true;
    factor.select();
  }

  function newFood() {
    const form = foodForm({
      onCancel: () => { form.remove(); body.hidden = false; },
      onSave: async id => {
        foods = await api("foods");
        await loadCats();
        form.remove(); body.hidden = false;
        select(foods.find(x => x.id === id));
      },
    });
    body.hidden = true;
    (dlg.querySelector(".dlg-body") || dlg).append(form);
  }

  body.append(tabs, search, chips, sug, results,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: newFood }, "+ Neues Lebensmittel"),
      h("button", { class: "flat", onclick: () => quickDialog(meal) }, "Schnelleingabe (nur kcal)"),
      h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  setDlg(h("h2", {}, meal ? "Zu „" + meal.name + "“ hinzufügen" : "Eintrag hinzufügen"),
    times ? h("div", { style: "margin-bottom:8px" }, h("label", {}, "Uhrzeit"), time) : null, body, detail);
  draw();
  dlg.showModal();
}

// ---------------------------------------------------------------- charts
function barChart(days, goal) {
  const W = 600, H = 220, L = 40, B = 24, T = 10, R = 8;
  const goals = days.map(d => d.goal_kcal ?? goal);
  const max = Math.max(...goals, ...days.map(d => d.kcal), 100) * 1.1;
  const y = v => T + (H - T - B) * (1 - v / max);
  const bw = (W - L - R) / days.length;
  let s = "";
  for (let i = 0; i <= 4; i++) {
    const v = max / 1.1 * i / 4;
    s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${n0(v)}</text>`;
  }
  const ticks = new Map(niceTicks(days[0].day, days[days.length - 1].day).map(t => [t.day, t.label]));
  const stepped = goals.some(g => g !== goals[0]);
  days.forEach((d, i) => {
    const x = L + i * bw, g = goals[i];
    if (d.logged) s += `<rect class="bar-k${g && d.kcal > g ? " over" : ""}" x="${x + bw * 0.15}" y="${y(d.kcal)}" width="${bw * 0.7}" height="${H - B - y(d.kcal)}" rx="2"/>`;
    if (ticks.has(d.day)) s += `<line class="grid-line" x1="${x + bw / 2}" x2="${x + bw / 2}" y1="${H - B}" y2="${H - B + 4}"/><text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${ticks.get(d.day)}</text>`;
  });
  if (stepped) s += `<polyline class="goal-line" points="${goals.map((g, i) => `${L + i * bw},${y(g)} ${L + (i + 1) * bw},${y(g)}`).join(" ")}"/>`;
  else if (goal) s += `<line class="goal-line" x1="${L}" x2="${W - R}" y1="${y(goal)}" y2="${y(goal)}"/>`;
  // invisible hit areas, one column per day, carry the tooltip text
  days.forEach((d, i) => {
    const text = d.logged
      ? `${longDate(d.day)}\n${n0(d.kcal)} kcal${goals[i] ? ` (Ziel ${n0(goals[i])})` : ""}\nKH ${n0(d.carbs)} g · Fett ${n0(d.fat)} g · Eiweiß ${n0(d.protein)} g`
      : `${longDate(d.day)}\nnicht erfasst`;
    s += `<rect class="hit" x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" data-tip="${esc(text)}"/>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kalorien pro Tag">${s}</svg>`;
}

// Weight curve: raw values (faint) and a smoothed trend line (thick), like Happy Scale.
function lineChart(points, target) {
  const W = 600, H = 220, L = 44, B = 24, T = 10, R = 16;
  const vals = points.flatMap(p => [p.kg, p.trend]).concat(target ? [target] : []);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max((hi - lo) * 0.1, 0.5);
  lo -= pad; hi += pad;
  // y ticks on even weights: step 1, 2, 5, 10 … kg
  const step = [1, 2, 5, 10, 20, 50].find(st => (hi - lo) / st <= 6) || 100;
  const ticks = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
  if (ticks.length < 2) { lo = Math.floor(lo); hi = Math.ceil(hi); }
  const T0 = parse(points[0].day).getTime(), T1 = parse(points[points.length - 1].day).getTime();
  const x = t => L + (T1 === T0 ? (W - L - R) / 2 : (t - T0) / (T1 - T0) * (W - L - R));
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const px = p => x(parse(p.day).getTime());
  let s = "";
  for (const v of ticks) s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${n0(v)}</text>`;
  if (target) s += `<line class="goal-line" x1="${L}" x2="${W - R}" y1="${y(target)}" y2="${y(target)}"/>`;
  s += `<polyline class="line raw" points="${points.map(p => `${px(p)},${y(p.kg)}`).join(" ")}"/>`;
  if (points.length <= 90) s += points.map(p => `<circle class="dot" cx="${px(p)}" cy="${y(p.kg)}" r="2.5"/>`).join("");
  s += `<polyline class="line" points="${points.map(p => `${px(p)},${y(p.trend)}`).join(" ")}"/>`;
  // x ticks on round dates (month starts, 1st/15th, 5-day marks …)
  for (const t of niceTicks(points[0].day, points[points.length - 1].day)) {
    const tx = x(parse(t.day).getTime());
    s += `<line class="grid-line" x1="${tx}" x2="${tx}" y1="${H - B}" y2="${H - B + 4}"/><text x="${tx}" y="${H - 6}" text-anchor="middle">${t.label}</text>`;
  }
  // hit areas: a column around each measurement (up to the midpoint to its neighbours)
  points.forEach((p, i) => {
    const cx = px(p);
    const a = i ? (px(points[i - 1]) + cx) / 2 : L, b = i < points.length - 1 ? (cx + px(points[i + 1])) / 2 : W - R;
    const text = `${longDate(p.day)}\n${n1(p.kg)} kg\nTrend ${n1(p.trend)} kg`;
    s += `<rect class="hit" x="${a}" y="${T}" width="${Math.max(b - a, 1)}" height="${H - T - B}" data-tip="${esc(text)}"/>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gewichtsverlauf">${s}</svg>`;
}

// Exponentially smoothed trend (10 % per day, gap-aware) so daily fluctuations fade out.
function withTrend(all) {
  let tr = null, prev = null;
  return all.map(p => {
    const t = parse(p.day).getTime();
    tr = tr == null ? p.kg : tr + (1 - Math.pow(0.9, Math.max(1, (t - prev) / 864e5))) * (p.kg - tr);
    prev = t;
    return { ...p, trend: tr };
  });
}

// Expected date for the target weight from the trend of the last four weeks.
function forecast(pts, target) {
  if (!target || pts.length < 2) return null;
  const last = pts[pts.length - 1], lt = parse(last.day).getTime();
  const ref = pts.find(p => lt - parse(p.day).getTime() <= 28 * 864e5);
  const span = (lt - parse(ref.day).getTime()) / 864e5;
  if (span < 14) return { text: "zu wenig Daten" };
  const slope = (last.trend - ref.trend) / span;       // kg per day
  const diff = target - last.trend;
  if (Math.abs(diff) < 0.2) return { text: "erreicht" };
  if (slope === 0 || Math.sign(slope) !== Math.sign(diff) || Math.abs(slope) < 0.004) return { text: "nicht absehbar", perWeek: slope * 7 };
  const d = diff / slope;
  if (d > 730) return { text: "nicht absehbar", perWeek: slope * 7 };
  const when = new Date(lt + d * 864e5);
  return { text: when.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" }), perWeek: slope * 7 };
}

function rangeButtons(options, current, onpick) {
  return h("div", { class: "range" }, options.map(([v, label]) =>
    h("button", { class: v === current ? "active" : "", onclick: () => onpick(v) }, label)));
}

// ---------------------------------------------------------------- foods page
const tag = c => (c ? h("span", { class: "tag" }, c) : null);

async function renderFoods() {
  const [foods] = await Promise.all([api("foods"), loadCats()]);
  const root = $("#foods");
  root.replaceChildren();
  const list = h("div", { class: "list" });
  const chips = h("div");

  const openForm = food => {
    const form = foodForm({
      food,
      onCancel: () => dlg.close(),
      onSave: () => { dlg.close(); renderFoods(); },
    });
    setDlg(h("h2", {}, food ? "Lebensmittel bearbeiten" : "Neues Lebensmittel"), form);
    dlg.showModal();
  };

  const draw = () => {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
    const q = search.value.toLowerCase();
    const shown = foods.filter(isVisible).filter(f => (f.name + " " + f.brand).toLowerCase().includes(q));
    const hiddenN = foods.length - foods.filter(isVisible).length;
    list.replaceChildren(...(shown.length ? shown.map(f => h("div", {},
      h("div", { class: "grow" }, h("div", {}, f.name, f.brand ? ` (${f.brand})` : "", tag(f.category),
        plausibility(f) ? h("span", { class: "warn-mark", title: plausibility(f) }, "⚠") : null),
        h("div", { class: "muted" }, `${n0(f.kcal)} kcal · KH ${n1(f.carbs)} g · Fett ${n1(f.fat)} g · Eiweiß ${n1(f.protein)} g (pro 100 g)`)),
      h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", onclick: () => triggerDialog({ item: "f:" + f.id }) }, "⚡"),
      h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => openForm(f) }, "✎"),
      h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`„${f.name}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.`)) return;
        await api("foods/" + f.id, { method: "DELETE" }); renderFoods();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, foods.length ? "Nichts gefunden." : "Noch keine Lebensmittel angelegt.")]),
      ...(hiddenN ? [h("div", { class: "muted", style: "padding:8px 0" }, `${hiddenN} Lebensmittel durch ausgeblendete Kategorien versteckt.`)] : []));
  };

  const search = h("input", { type: "search", placeholder: "Lebensmittel suchen…", oninput: draw });
  root.append(h("div", { class: "card" },
    h("div", { class: "grid", style: "grid-template-columns:1fr auto" }, search,
      h("button", { onclick: () => openForm(null) }, "+ Neues Lebensmittel")),
    chips, list));
  draw();
}

// ---------------------------------------------------------------- saved meals page
async function renderMeals() {
  const [saved] = await Promise.all([api("saved-meals"), loadCats()]);
  const root = $("#meals");
  root.replaceChildren();
  const list = h("div", { class: "list" });
  const chips = h("div");

  // Edit name/category and the components of a saved meal: change amounts, swap or remove foods, add new ones.
  const editSaved = (s, draft = { name: s.name, category: s.category, items: s.items.map(i => ({ ...i })) }) => {
    const name = h("input", { value: draft.name, oninput: () => { draft.name = name.value; } });
    const category = h("input", { list: "cat-list", value: draft.category, oninput: () => { draft.category = category.value; } });
    const msg = h("div", { class: "err" });
    const total = h("div", { class: "preview" });
    const sum = k => draft.items.reduce((a, i) => a + i[k], 0);
    const drawTotal = () => total.replaceChildren(h("span", {}, h("b", {}, n0(sum("kcal"))), " kcal"), h("span", {}, h("b", {}, n0(sum("carbs"))), " g KH"),
      h("span", {}, h("b", {}, n0(sum("fat"))), " g Fett"), h("span", {}, h("b", {}, n0(sum("protein"))), " g Eiweiß"));
    drawTotal();
    const swap = (idx, title) => {
      setDlg(foodSwapDialog({
        title, grams: idx == null ? null : draft.items[idx].grams, confirm: idx == null ? "Hinzufügen" : "Tauschen",
        onCancel: () => editSaved(s, draft),
        onDone: (f, g) => {
          if (idx == null) draft.items.push(foodItem(f, g)); else draft.items[idx] = foodItem(f, g);
          editSaved(s, draft);
        },
      }));
    };
    const rows = draft.items.map((it, idx) => {
      const g = it.grams > 0 ? h("input", { type: "number", step: "any", min: "1", style: "width:80px;flex:none", value: Math.round(it.grams * 10) / 10, onchange: () => {
        const ng = num(g.value);
        if (!(ng > 0)) { g.value = Math.round(it.grams * 10) / 10; return; }
        const k = ng / it.grams;
        for (const key of ["kcal", "protein", "carbs", "fat"]) it[key] *= k;
        it.grams = ng;
        drawTotal();
        kc.textContent = `${n0(it.kcal)} kcal`;
      } }) : null;
      const kc = h("span", { class: "muted" }, `${n0(it.kcal)} kcal`);
      return h("div", {}, h("div", { class: "grow" }, it.name, " ", kc), g, g ? "g" : null,
        h("button", { class: "icon edit", title: "Durch anderes Lebensmittel tauschen", "aria-label": "Tauschen", onclick: () => swap(idx, `„${it.name}“ tauschen`) }, "⇄"),
        h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", disabled: draft.items.length < 2, onclick: () => {
          draft.items.splice(idx, 1); editSaved(s, draft);
        } }, "✕"));
    });
    setDlg(h("h2", {}, "Mahlzeit bearbeiten"),
      h("label", {}, "Name"), name, h("label", {}, "Kategorie"), category, catList(),
      h("label", { style: "margin-top:12px" }, "Komponenten"),
      h("div", { class: "list" }, rows),
      h("button", { class: "flat", onclick: () => swap(null, "Komponente hinzufügen") }, "+ Komponente"),
      total, msg,
      h("div", { class: "actions" },
        h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
        h("button", { onclick: async () => {
          if (!draft.name.trim()) { msg.textContent = "Bitte einen Namen angeben."; return; }
          try {
            await send("PUT", "saved-meals/" + s.id, { name: draft.name, category: draft.category, items: draft.items.map(i => ({
              name: i.name, grams: i.grams, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat })) });
            dlg.close(); renderMeals();
          } catch (e) { msg.textContent = e.message; }
        } }, "Speichern")));
    dlg.showModal();
  };

  const draw = () => {
    chips.replaceChildren(...[catChips(draw)].filter(Boolean));
    const q = search.value.toLowerCase();
    const shown = saved.filter(isVisible).filter(s => s.name.toLowerCase().includes(q));
    list.replaceChildren(...(shown.length ? shown.map(s => h("div", {},
      h("div", { class: "grow" }, h("div", {}, s.name, tag(s.category)),
        h("div", { class: "muted" }, `${n0(s.kcal)} kcal · KH ${n1(s.carbs)} g · Fett ${n1(s.fat)} g · Eiweiß ${n1(s.protein)} g`),
        h("div", { class: "muted" }, s.items.map(entryLabel).join(" · "))),
      h("button", { class: "icon", title: "Trigger anlegen", "aria-label": "Trigger anlegen", onclick: () => triggerDialog({ item: "s:" + s.id }) }, "⚡"),
      h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => editSaved(s) }, "✎"),
      h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`Mahlzeit „${s.name}“ löschen?`)) return;
        await api("saved-meals/" + s.id, { method: "DELETE" }); renderMeals();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, saved.length ? "Nichts gefunden." : "Noch keine Mahlzeit gespeichert – im Tagebuch über „Als Mahlzeit speichern“.")]));
  };

  const search = h("input", { type: "search", placeholder: "Mahlzeiten suchen…", oninput: draw });
  root.append(h("div", { class: "card" }, search, chips, list));
  draw();
}

// ---------------------------------------------------------------- weight
async function renderWeight() {
  const [all, goal] = await Promise.all([api("weights"), api("goal")]);
  const root = $("#weight");
  root.replaceChildren();

  const day = h("input", { type: "date", value: iso(new Date()) });
  const kg = h("input", { type: "number", step: "0.1", min: "20", max: "500", placeholder: "z. B. 78,5" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Gewicht eintragen"),
    h("div", { class: "grid" },
      h("div", {}, h("label", {}, "Datum"), day),
      h("div", {}, h("label", {}, "Gewicht (kg)"), kg),
      h("button", { onclick: async () => {
        if (!(num(kg.value) > 0) || !day.value) return;
        await send("PUT", "weights/" + day.value, { kg: num(kg.value) });
        renderWeight();
      } }, "Speichern"))));

  if (!all.length) {
    root.append(h("div", { class: "card muted" }, "Noch keine Gewichtswerte."));
    return;
  }
  const trended = withTrend(all);
  const since = state.wrange ? iso(new Date(Date.now() - state.wrange * 864e5)) : "";
  const pts = trended.filter(p => p.day >= since);
  const shown = pts.length ? pts : trended.slice(-1);
  const last = all[all.length - 1];
  const fc = forecast(trended, goal.target_weight);
  const delta = shown.length > 1 ? last.kg - shown[0].kg : null;
  const tile = (label, value) => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", {}, value));

  const chart = h("div");
  chart.innerHTML = lineChart(shown, goal.target_weight);
  tipHandlers(chart);
  root.append(
    h("div", { class: "stat-tiles" },
      tile("Aktuell", n1(last.kg) + " kg"),
      tile("Trend", n1(trended[trended.length - 1].trend) + " kg"),
      tile("Veränderung", delta == null ? "–" : (delta > 0 ? "+" : "") + n1(delta) + " kg"),
      tile("Ziel", goal.target_weight ? n1(goal.target_weight) + " kg" : "–"),
      goal.target_weight ? tile("Prognose Ziel", fc ? fc.text : "–") : null),
    h("div", { class: "card" },
      rangeButtons([[30, "30 Tage"], [90, "90 Tage"], [365, "1 Jahr"], [0, "Alle"]], state.wrange,
        v => { state.wrange = v; renderWeight(); }),
      chart,
      h("div", { class: "muted" }, "Dünne Linie und Punkte: Messwerte. Dicke Linie: geglätteter Trend (Tagesschwankungen ausgeblendet)."
        + (fc && fc.perWeek != null ? ` Trend aktuell ${fc.perWeek > 0 ? "+" : ""}${n1(fc.perWeek)} kg/Woche.` : ""))),
    h("div", { class: "card" }, h("h2", {}, "Verlauf"),
      h("div", { class: "list" }, [...all].reverse().slice(0, state.whist).map(p => h("div", {},
        h("span", { class: "grow" }, parse(p.day).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" })),
        h("b", {}, n1(p.kg) + " kg"),
        h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
          await api("weights/" + p.day, { method: "DELETE" }); renderWeight();
        } }, "✕")))),
      all.length > 10 ? h("div", { class: "actions", style: "justify-content:flex-start" },
        all.length > state.whist ? [
          h("button", { class: "flat", onclick: () => { state.whist += 20; renderWeight(); } }, "Mehr anzeigen"),
          h("button", { class: "flat", onclick: () => { state.whist = all.length; renderWeight(); } }, `Alle ${all.length}`)] : null,
        state.whist > 10 ? h("button", { class: "flat", onclick: () => { state.whist = 10; renderWeight(); } }, "Weniger") : null) : null));
}

// ---------------------------------------------------------------- stats
// Energy balance from weight trend (7700 kcal per kg) and logged intake.
function balanceCard(b) {
  const tile = (label, value, cls = "") => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", { class: cls }, value));
  if (!b) return h("div", { class: "card" }, h("h2", {}, "Kalorienbilanz"), h("div", { class: "muted" }, "Noch keine Einträge im Zeitraum."));
  const ok = b.balance != null;
  const sign = v => (v > 0 ? "+" : "") + n0(v);
  return h("div", { class: "card" }, h("h2", {}, "Kalorienbilanz"),
    h("div", { class: "stat-tiles" },
      tile("Ø Aufnahme", n0(b.intake) + " kcal"),
      tile("Gewichtstrend", ok ? (b.kg_per_week > 0 ? "+" : "") + n1(b.kg_per_week) + " kg/Woche" : "–"),
      tile(ok ? (b.balance > 0 ? "Überschuss / Tag" : "Defizit / Tag") : "Bilanz / Tag",
        ok ? sign(b.balance) + " kcal" : "–", ok ? (b.balance > 0 ? "over" : "under") : ""),
      tile("Geschätzter Verbrauch", ok ? n0(b.tdee) + " kcal" : "–")),
    h("div", { class: "muted" }, ok
      ? `Aus ${b.weights} Gewichtswerten und ${b.logged_days} von ${b.range_days} erfassten Tagen (1 kg ≈ 7700 kcal). Je vollständiger Tagebuch und Wiegen, desto genauer.`
      : "Für die Berechnung braucht es mindestens zwei Gewichtswerte im Abstand von einer Woche im gewählten Zeitraum."));
}

async function renderStats() {
  const [{ days, goal, balance }, weights] = await Promise.all([api("stats?days=" + state.range), api("weights?days=" + state.range)]);
  const root = $("#stats");
  root.replaceChildren();
  const logged = days.filter(d => d.logged);
  const avg = k => logged.length ? logged.reduce((a, d) => a + d[k], 0) / logged.length : 0;
  const tile = (label, value) => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", {}, value));

  const kc = { p: avg("protein") * 4, c: avg("carbs") * 4, f: avg("fat") * 9 };
  const total = kc.p + kc.c + kc.f || 1;
  const pct = v => Math.round(v / total * 100);

  const chart = h("div");
  chart.innerHTML = barChart(days, goal.kcal);
  tipHandlers(chart);
  root.append(
    rangeButtons([[7, "7 Tage"], [30, "30 Tage"], [90, "90 Tage"], [180, "180 Tage"], [365, "1 Jahr"]], state.range, v => { state.range = v; renderStats(); }),
    h("div", { class: "stat-tiles" },
      tile("Ø Kalorien", logged.length ? n0(avg("kcal")) + " kcal" : "–"),
      tile("Erfasste Tage", `${logged.length} / ${days.length}`),
      tile("Ø Eiweiß", n0(avg("protein")) + " g"),
      tile("Ø Kohlenhydrate", n0(avg("carbs")) + " g"),
      tile("Ø Fett", n0(avg("fat")) + " g"),
      tile("Gewicht", weights.length > 1
        ? ((d => (d > 0 ? "+" : "") + n1(d) + " kg")(weights[weights.length - 1].kg - weights[0].kg)) : "–")),
    h("div", { class: "card" }, h("h2", {}, "Kalorien pro Tag"), chart,
      goal.kcal ? h("div", { class: "muted" }, days.some(d => d.goal_kcal !== goal.kcal) ? "Gestrichelt: Tagesziel je Wochentag" : `Gestrichelt: Tagesziel ${n0(goal.kcal)} kcal`) : null),
    balanceCard(balance),
    h("div", { class: "card" }, h("h2", {}, "Nährwertverteilung (Ø)"),
      h("div", { class: "macro-split" },
        h("i", { style: `width:${pct(kc.p)}%` }), h("i", { style: `width:${pct(kc.c)}%` }), h("i", { style: `width:${pct(kc.f)}%` })),
      h("div", { class: "legend" },
        h("span", { style: "--c:var(--info-color)" }, `Eiweiß ${logged.length ? pct(kc.p) : 0} %`),
        h("span", { style: "--c:var(--warning-color)" }, `Kohlenhydrate ${logged.length ? pct(kc.c) : 0} %`),
        h("span", { style: "--c:var(--error-color)" }, `Fett ${logged.length ? pct(kc.f) : 0} %`))));
}

// ---------------------------------------------------------------- triggers
const KIND = { state: "Zustand", calendar: "Kalender" };
const PART = { start: " (am Starttag)", end: " (am Endtag)" };
const condText = t => `${KIND[t.kind]} ${t.entity} ${t.negate ? (t.kind === "calendar" ? "enthält nicht" : "≠") : (t.kind === "calendar" ? "enthält" : "=")} ${t.match || "(an)"}${t.kind === "calendar" ? PART[t.part] || "" : ""}`;

// Shared form part: trigger kind (state / calendar), entity with suggestions, condition text.
function triggerFields(ents) {
  const kind = h("select", { onchange: sync },
    h("option", { value: "state" }, "Zustand einer Entität (z. B. Person ist im Fitnessstudio)"),
    h("option", { value: "calendar" }, "Kalendereintrag"));
  const entity = h("input", { list: "ent-list", placeholder: "z. B. person.max" });
  const entList = h("datalist", { id: "ent-list" });
  const negate = h("select", {},
    h("option", { value: "0" }, "ist / enthält"), h("option", { value: "1" }, "ist NICHT / enthält NICHT"));
  const match = h("input");
  const part = h("select", {},
    h("option", { value: "any" }, "an jedem Tag des Termins"),
    h("option", { value: "start" }, "nur am Starttag (z. B. Donnerstag 22 Uhr)"),
    h("option", { value: "end" }, "nur am Endtag (z. B. Freitag 6 Uhr)"));
  const partRow = h("div", {}, h("label", {}, "Termin zählt"), part);
  const hint = h("div", { class: "muted" });
  function sync() {
    const cal = kind.value === "calendar";
    entList.replaceChildren(...ents.filter(e => cal ? e.id.startsWith("calendar.") : !e.id.startsWith("calendar."))
      .map(e => h("option", { value: e.id }, e.name || e.state)));
    entity.placeholder = cal ? "z. B. calendar.arbeit" : "z. B. person.max";
    match.placeholder = cal ? "Titel enthält, z. B. Nachtschicht" : "Zustand, z. B. Fitnessstudio (Zonenname) oder on";
    partRow.hidden = !cal;
    hint.textContent = cal ? "Gilt für Tage mit (bzw. ohne) Termin, dessen Titel diesen Text enthält."
      : "Gilt, sobald die Entität diesen Zustand hat (bzw. nicht hat).";
  }
  sync();
  return { kind, entity, match, negate, part, nodes: [h("label", {}, "Auslöser"), kind, h("label", {}, "Entität"), entity, entList,
    h("label", {}, "Bedingung"), negate, match, partRow, hint] };
}

// Show a diary meal only on days where a rule applies (e.g. calendar has "Nachtschicht").
async function mealRuleDialog(meal, rule = null) {
  const ents = await api("ha/entities").catch(() => []);
  const tf = triggerFields(ents);
  if (rule) {
    tf.kind.value = rule.kind; tf.kind.dispatchEvent(new Event("change"));
    tf.entity.value = rule.entity; tf.match.value = rule.match; tf.negate.value = rule.negate ? "1" : "0"; tf.part.value = rule.part || "any";
  }
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, `„${meal.name}“ nur an bestimmten Tagen anzeigen`), tf.nodes,
    h("div", { class: "muted", style: "margin-top:8px" }, "Tage mit Einträgen bleiben immer sichtbar. Ohne Regel wird die Mahlzeit immer angezeigt."),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!tf.entity.value.trim()) { msg.textContent = "Bitte eine Entität angeben."; return; }
        try {
          await send(rule ? "PUT" : "POST", "meal-triggers" + (rule ? "/" + rule.id : ""),
            { meal_id: meal.id, kind: tf.kind.value, entity: tf.entity.value, match: tf.match.value,
              negate: tf.negate.value === "1", part: tf.kind.value === "calendar" ? tf.part.value : "any" });
          dlg.close(); renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Speichern")));
  dlg.showModal();
}

// Create a trigger: when an HA entity reaches a state / a calendar event is on today,
// an item (saved meal or food) is added to the diary.
async function triggerDialog(preset = {}, onDone = () => {}) {
  const [day, saved, foods, ents] = await Promise.all([
    api("day/" + state.day), api("saved-meals"), api("foods"), api("ha/entities").catch(() => [])]);
  const times = day.mode === "times";
  const tf = triggerFields(ents);
  const { kind, entity, match } = tf;
  const item = h("select", {},
    h("optgroup", { label: "Gespeicherte Mahlzeiten" }, saved.map(s => h("option", { value: "s:" + s.id }, s.name))),
    h("optgroup", { label: "Lebensmittel" }, foods.map(f => h("option", { value: "f:" + f.id }, f.name))));
  const ed = preset.edit;
  if (preset.item) item.value = preset.item;
  const meal = h("select", {}, day.meals.map(m => h("option", { value: m.id }, m.name)));
  const grams = h("input", { type: "number", step: "any", min: "1", placeholder: "Standardportion" });
  const ahead = h("input", { type: "number", step: "1", min: "0", max: "60", value: "0" });
  const aheadRow = h("div", {}, h("label", {}, "Tage im Voraus eintragen (nur Kalender)"), ahead,
    h("div", { class: "muted" }, "0 = erst am Tag selbst. Mit z. B. 7 wird der Eintrag schon für die nächsten 7 Tage geplant, sobald dort ein passender Termin steht."));
  const msg = h("div", { class: "err" });
  const syncAhead = () => { aheadRow.hidden = kind.value !== "calendar"; };
  kind.addEventListener("change", syncAhead);
  syncAhead();
  if (ed) {
    kind.value = ed.kind; kind.dispatchEvent(new Event("change"));
    entity.value = ed.entity; match.value = ed.match; tf.negate.value = ed.negate ? "1" : "0"; tf.part.value = ed.part || "any";
    item.value = (ed.saved_meal_id ? "s:" + ed.saved_meal_id : "f:" + ed.food_id);
    meal.value = ed.meal_id; grams.value = ed.grams ?? ""; ahead.value = ed.days_ahead || 0;
  }

  setDlg(h("h2", {}, ed ? "Trigger bearbeiten" : "Neuer Trigger"),
    tf.nodes,
    h("label", {}, "Hinzufügen"), item,
    h("div", { class: "muted" }, "Bei Lebensmitteln optional mit Menge:"), grams, aheadRow,
    times ? null : [h("label", {}, "Zu Mahlzeit im Tagebuch"), meal],
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!entity.value.trim()) { msg.textContent = "Bitte eine Entität angeben."; return; }
        const [t, id] = item.value.split(":");
        if (!id) { msg.textContent = "Bitte ein Lebensmittel oder eine Mahlzeit wählen."; return; }
        try {
          await send(ed ? "PUT" : "POST", "triggers" + (ed ? "/" + ed.id : ""), { kind: kind.value, entity: entity.value, match: match.value,
            enabled: ed ? !!ed.enabled : true,
            meal_id: Number(meal.value || day.meals[0].id),
            saved_meal_id: t === "s" ? Number(id) : null, food_id: t === "f" ? Number(id) : null,
            grams: t === "f" ? num(grams.value) : null, negate: tf.negate.value === "1",
            days_ahead: kind.value === "calendar" ? Number(ahead.value) || 0 : 0,
            part: kind.value === "calendar" ? tf.part.value : "any" });
          dlg.close(); onDone(); if (state.tab === "settings") renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Speichern")));
  dlg.showModal();
}

// ---------------------------------------------------------------- MyFitnessPal import
function pickFile(accept, cb) {
  const i = h("input", { type: "file", accept });
  i.onchange = () => i.files[0] && cb(i.files[0]);
  i.click();
}

async function mfpDialog(file) {
  const csv = await file.text();
  let p;
  try { p = await send("POST", "import/mfp/preview", { csv }); }
  catch (e) { alert(e.message); return; }
  const mode = h("select", {},
    h("option", { value: "full" }, "Komplett (alle Einträge mit Mahlzeiten)"),
    h("option", { value: "totals" }, "Nur Tageskalorien und Makros (eine Summe pro Tag)"));
  const weights = h("input", { type: "checkbox", checked: p.weights > 0, disabled: !p.weights });
  const replace = h("input", { type: "checkbox", checked: true });
  const maps = p.meals.map(n => {
    const s = h("select", {}, h("option", { value: "" }, "Neue Mahlzeit anlegen"),
      p.own_meals.map(m => h("option", { value: m.id }, m.name)));
    if (p.guess[n]) s.value = p.guess[n];
    return [n, s];
  });
  const mapBox = h("div", {}, h("h3", { style: "margin-top:12px" }, "Mahlzeiten zuordnen"),
    maps.map(([n, s]) => h("div", { class: "maprow" }, h("span", {}, n), "→", s)));
  const hide = h("input", { type: "checkbox", checked: true });
  const hideRow = h("label", { class: "pick" }, hide, "Leere Mahlzeiten an diesen Tagen ausblenden (nur die Tagessumme anzeigen)");
  hideRow.hidden = true;
  mode.onchange = () => { mapBox.hidden = mode.value === "totals"; hideRow.hidden = mode.value !== "totals"; };
  const msg = h("div", { class: "err" });
  setDlg(h("h2", {}, "MyFitnessPal-Import"),
    h("div", { class: "muted" }, `${p.days} Tage (${p.from} bis ${p.to}), ${p.items} Einträge, ${p.weights} Gewichtswerte`),
    h("label", {}, "Was importieren?"), mode, mapBox, hideRow,
    h("label", { class: "pick" }, weights, "Gewicht übernehmen"),
    h("label", { class: "pick" }, replace, "Vorhandene Einträge an diesen Tagen ersetzen"),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        try {
          const r = await send("POST", "import/mfp", { csv, mode: mode.value, weights: weights.checked,
            replace: replace.checked, hide_empty: mode.value === "totals" && hide.checked, meal_map: Object.fromEntries(maps.map(([n, s]) => [n, s.value ? Number(s.value) : null])) });
          dlg.close();
          alert(`Importiert: ${r.days} Tage, ${r.entries} Einträge, ${r.weights} Gewichtswerte.`);
          renderSettings();
        } catch (e) { msg.textContent = e.message; }
      } }, "Importieren")));
  dlg.showModal();
}

// ---------------------------------------------------------------- settings
async function renderSettings() {
  const [goal, day, triggers, rules] = await Promise.all([api("goal"), api("day/" + state.day), api("triggers"), api("meal-triggers")]);
  const root = $("#settings");
  root.replaceChildren();

  const gf = {};
  const gfield = (key, label, step = "1") => {
    gf[key] = h("input", { type: "number", step, min: "0", value: goal[key] ?? "" });
    return h("div", {}, h("label", {}, label), gf[key]);
  };
  const saved = h("span", { class: "muted" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Tagesziele"),
    h("div", { class: "grid" },
      gfield("kcal", "Kalorien (kcal)"), gfield("carbs", "Kohlenhydrate (g)"),
      gfield("fat", "Fett (g)"), gfield("protein", "Eiweiß (g)"), gfield("target_weight", "Zielgewicht (kg)", "0.1")),
    h("div", { class: "actions" }, saved, h("button", { onclick: async () => {
      await send("PUT", "goal", { kcal: num(gf.kcal.value) || 0, carbs: num(gf.carbs.value) || 0,
        fat: num(gf.fat.value) || 0, protein: num(gf.protein.value) || 0, target_weight: num(gf.target_weight.value) });
      saved.textContent = "Gespeichert ✓";
    } }, "Speichern"))));

  // optional features
  const feat = (key, label, hint) => {
    const box = h("input", { type: "checkbox", checked: !!state.features[key], onchange: async () => {
      state.features[key] = box.checked;
      await send("PUT", "settings", { features: { [key]: box.checked } });
      renderSettings();
    } });
    return h("div", {}, h("label", { class: "pick" }, box, h("span", {}, label, h("div", { class: "muted" }, hint))));
  };
  root.append(h("div", { class: "card" }, h("h2", {}, "Zusatzfunktionen"),
    h("div", { class: "muted" }, "Optionale Funktionen, standardmäßig aus. Eingeschaltet erscheinen sie im Tagebuch und hier in den Einstellungen."),
    h("div", { class: "list" },
      feat("weekday_goals", "Tagesziele pro Wochentag", "z. B. Trainingstage mit mehr Kalorien, Ruhetage mit weniger."),
      feat("trackers", "Wasser und Nahrungsergänzung", "Schnell-Eintrag für Wasser, Koffein, Kreatin usw. mit eigenem Tagesziel."))));

  if (state.features.weekday_goals) {
    const wd = await api("goal-weekdays");
    const names = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    const wf = names.map((n, i) => {
      const w = wd[i] || {};
      const inp = key => h("input", { type: "number", min: "0", step: "1", placeholder: key === "kcal" ? "wie Standard" : "–", value: w[key] || "" });
      return { i, n, kcal: inp("kcal"), carbs: inp("carbs"), fat: inp("fat"), protein: inp("protein") };
    });
    const wsaved = h("span", { class: "muted" });
    root.append(h("div", { class: "card" }, h("h2", {}, "Tagesziele pro Wochentag"),
      h("div", { class: "muted" }, "Leere Kalorien = es gilt das Standard-Tagesziel oben. Leere Makros zeigen „–“."),
      h("div", { class: "wd-grid" },
        h("span"), h("label", {}, "kcal"), h("label", {}, "KH (g)"), h("label", {}, "Fett (g)"), h("label", {}, "Eiweiß (g)"),
        wf.flatMap(r => [h("b", {}, r.n), r.kcal, r.carbs, r.fat, r.protein])),
      h("div", { class: "actions" }, wsaved, h("button", { onclick: async () => {
        for (const r of wf) {
          if (num(r.kcal.value) > 0) await send("PUT", "goal-weekdays/" + r.i, { kcal: num(r.kcal.value),
            carbs: num(r.carbs.value) || 0, fat: num(r.fat.value) || 0, protein: num(r.protein.value) || 0 });
          else await api("goal-weekdays/" + r.i, { method: "DELETE" });
        }
        wsaved.textContent = "Gespeichert ✓";
      } }, "Speichern"))));
  }

  if (state.features.trackers) {
    const trackers = await api("trackers?day=" + state.day);
    const rowsT = trackers.map(t => {
      const f = {
        name: h("input", { value: t.name, placeholder: "Name" }), unit: h("input", { value: t.unit, placeholder: "Einheit", style: "max-width:70px" }),
        goal: h("input", { type: "number", step: "any", min: "0", value: t.goal ?? "", placeholder: "Ziel", style: "max-width:90px" }),
        step: h("input", { type: "number", step: "any", min: "0", value: t.step, placeholder: "Schritt", style: "max-width:80px" }) };
      const save = async () => {
        if (!f.name.value.trim() || !(num(f.step.value) > 0)) return;
        await send("PUT", "trackers/" + t.id, { name: f.name.value, unit: f.unit.value, goal: num(f.goal.value) || null, step: num(f.step.value) });
      };
      for (const k of Object.keys(f)) f[k].onchange = save;
      return h("div", {}, f.name, f.unit, f.goal, f.step,
        h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
          if (!confirm(`„${t.name}“ samt Verlauf löschen?`)) return;
          await api("trackers/" + t.id, { method: "DELETE" }); renderSettings();
        } }, "✕"));
    });
    const nf = { name: h("input", { placeholder: "Neu, z. B. Magnesium" }), unit: h("input", { placeholder: "Einheit", style: "max-width:70px" }),
      goal: h("input", { type: "number", step: "any", min: "0", placeholder: "Ziel", style: "max-width:90px" }),
      step: h("input", { type: "number", step: "any", min: "0", placeholder: "Schritt", value: 1, style: "max-width:80px" }) };
    root.append(h("div", { class: "card" }, h("h2", {}, "Wasser & Ergänzungen"),
      h("div", { class: "muted" }, "Pro Zeile: Name, Einheit, Tagesziel und Schrittweite der +/− Knöpfe im Tagebuch."),
      h("div", { class: "list" }, rowsT, h("div", {}, nf.name, nf.unit, nf.goal, nf.step,
        h("button", { onclick: async () => {
          if (!nf.name.value.trim() || !(num(nf.step.value) > 0)) return;
          await send("POST", "trackers", { name: nf.name.value, unit: nf.unit.value, goal: num(nf.goal.value) || null, step: num(nf.step.value) });
          renderSettings();
        } }, "+")))));
  }

  // diary layout
  const mode = h("select", { onchange: async () => { await send("PUT", "settings", { diary_mode: mode.value }); renderSettings(); } },
    h("option", { value: "meals" }, "Feste Mahlzeiten (Frühstück, Mittagessen, …)"),
    h("option", { value: "times" }, "Uhrzeiten (08:47 …, 11:30 …)"));
  mode.value = day.mode;
  const skin = h("select", { onchange: async () => {
    await send("PUT", "settings", { skin: skin.value }); state.skin = skin.value; applySkin();
  } },
    h("option", { value: "auto" }, "Automatisch (Windows-Look bei HA-95/98-Theme)"),
    h("option", { value: "default" }, "Standard (HA-Theme)"),
    h("option", { value: "win" }, "Windows-Look"));
  skin.value = state.skin;
  root.append(h("div", { class: "card" }, h("h2", {}, "Darstellung"),
    h("label", {}, "Tagebuch"), mode,
    h("div", { class: "muted", style: "margin-top:8px" },
      "Bestehende Einträge bleiben erhalten; ohne Uhrzeit erscheinen sie in der Zeitansicht am Ende."),
    h("label", { style: "margin-top:12px" }, "Optik"), skin));

  // meals
  const meals = day.meals;
  const mealMsg = h("div", { class: "err" });
  const mealList = h("div", { class: "list" }, meals.map((m, i) => {
    const name = h("input", { value: m.name, onchange: async () => {
      if (name.value.trim()) await send("PUT", "meals/" + m.id, { name: name.value });
    } });
    const move = async dir => {
      const ids = meals.map(x => x.id);
      [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
      await send("PUT", "meals/order", { ids });
      renderSettings();
    };
    return h("div", { class: m.archived ? "archived" : "" }, name,
      h("button", { class: "icon", disabled: i === 0, title: "Nach oben", onclick: () => move(-1) }, "↑"),
      h("button", { class: "icon", disabled: i === meals.length - 1, title: "Nach unten", onclick: () => move(1) }, "↓"),
      h("button", { class: "icon", title: "Nur an bestimmten Tagen anzeigen", onclick: () => mealRuleDialog(m) }, "⚡"),
      h("button", { class: "icon", title: m.archived ? "Wieder einblenden" : "Ausblenden (nur noch an Tagen mit Einträgen sichtbar)",
        "aria-label": m.archived ? "Wieder einblenden" : "Ausblenden", onclick: async () => {
          await send("PUT", `meals/${m.id}/archived`, { archived: !m.archived }); renderSettings();
        } }, m.archived ? "◉" : "⊘"),
      h("button", { class: "icon", title: "Löschen", onclick: async () => {
        try { await api("meals/" + m.id, { method: "DELETE" }); renderSettings(); }
        catch (e) { mealMsg.textContent = e.message + " – blende sie stattdessen mit ⊘ aus."; }
      } }, "✕"));
  }));
  const newMeal = h("input", { placeholder: "Neue Mahlzeit, z. B. Nachtschicht" });
  const ruleList = rules.length ? h("div", { class: "list" }, rules.map(r => h("div", {},
    h("div", { class: "grow" }, h("b", {}, r.meal), ` nur an Tagen: ${condText(r)}`),
    h("button", { class: "icon edit", title: "Regel bearbeiten", "aria-label": "Regel bearbeiten", onclick: () => mealRuleDialog({ id: r.meal_id, name: r.meal }, r) }, "✎"),
    h("button", { class: "icon", title: "Regel löschen", onclick: async () => {
      await api("meal-triggers/" + r.id, { method: "DELETE" }); renderSettings();
    } }, "✕")))) : null;
  root.append(h("div", { class: "card" }, h("h2", {}, "Mahlzeiten"),
    h("div", { class: "muted" }, "Mit ⚡ blendest du eine Mahlzeit nur an Tagen ein, an denen z. B. dein Kalender einen bestimmten Termin hat. Mit ⊘ blendest du sie dauerhaft aus (sichtbar bleibt sie nur an Tagen mit Einträgen), gelöscht werden kann nur eine leere Mahlzeit."),
    mealList, ruleList, mealMsg,
    h("div", { class: "actions" }, newMeal, h("button", { onclick: async () => {
      if (!newMeal.value.trim()) return;
      await send("POST", "meals", { name: newMeal.value });
      renderSettings();
    } }, "Hinzufügen"))));

  // triggers
  const trigMsg = h("div", { class: "err" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Trigger"),
    h("div", { class: "muted" }, "Lebensmittel oder Mahlzeiten automatisch eintragen, wenn Home Assistant etwas meldet (Ort, Kalender, Schalter …). Auch über ⚡ bei Lebensmitteln anlegbar."),
    h("div", { class: "list" }, triggers.length ? triggers.map(t => {
      const on = h("input", { type: "checkbox", checked: t.enabled, title: "Aktiv", onchange: async () => {
        await send("PUT", "triggers/" + t.id, { kind: t.kind, entity: t.entity, match: t.match, meal_id: t.meal_id,
          saved_meal_id: t.saved_meal_id, food_id: t.food_id, grams: t.grams, enabled: on.checked,
          negate: !!t.negate, days_ahead: t.days_ahead || 0, part: t.part || "any" });
      } });
      return h("div", {}, on,
        h("div", { class: "grow" },
          h("div", {}, condText(t)),
          h("div", { class: "muted" }, `→ ${t.item || "(gelöscht)"}${day.mode === "meals" && t.meal ? " zu " + t.meal : ""}`
            + (t.days_ahead ? ` · ${t.days_ahead} Tage im Voraus` : "")
            + (t.last_run ? ` · zuletzt ${parse(t.last_run).toLocaleDateString("de-DE")}` : ""))),
        h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => triggerDialog({ edit: t }) }, "✎"),
        h("button", { class: "icon", title: "Jetzt testen (trägt heute ein)", onclick: async () => {
          try { await send("POST", `triggers/${t.id}/run`, {}); trigMsg.textContent = ""; alert("Eingetragen."); }
          catch (e) { trigMsg.textContent = e.message; }
        } }, "▶"),
        h("button", { class: "icon", title: "Löschen", onclick: async () => {
          await api("triggers/" + t.id, { method: "DELETE" }); renderSettings();
        } }, "✕"));
    }) : [h("div", { class: "muted", style: "padding:8px 0" }, "Noch keine Trigger.")]),
    trigMsg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: async () => {
        trigMsg.className = "muted";
        trigMsg.textContent = "Prüfe …";
        try {
          const r = await send("POST", "triggers/poll", {});
          trigMsg.textContent = (r.token ? "" : "Kein Home-Assistant-Zugriff (SUPERVISOR_TOKEN fehlt). ")
            + (r.log.length ? r.log.slice(-6).join(" · ") : `Geprüft ${r.last}, nichts zu tun.`);
        } catch (e) { trigMsg.className = "err"; trigMsg.textContent = e.message; }
      } }, "Jetzt prüfen"),
      h("button", { onclick: () => triggerDialog({}) }, "+ Neuer Trigger"))));

  // data
  root.append(h("div", { class: "card" }, h("h2", {}, "Daten"),
    h("div", { class: "muted" }, "Export/Import betrifft nur dein Benutzerkonto."),
    h("div", { class: "actions", style: "justify-content:flex-start" },
      h("button", { class: "flat", onclick: () => { location.href = "api/export/json"; } }, "Sicherung (JSON)"),
      h("button", { class: "flat", onclick: () => { location.href = "api/export/csv"; } }, "Tagebuch als CSV"),
      h("button", { class: "flat", onclick: () => pickFile(".json,application/json", async f => {
        if (!confirm("Sicherung einspielen? Alle bisherigen Daten werden dabei ersetzt.")) return;
        try { await send("POST", "import/json", { data: JSON.parse(await f.text()) }); alert("Wiederhergestellt."); show("diary"); }
        catch (e) { alert("Import fehlgeschlagen: " + e.message); }
      }) }, "Sicherung einspielen"),
      h("button", { onclick: () => pickFile(".csv,text/csv", mfpDialog) }, "MyFitnessPal-CSV importieren"))));
}

api("me").then(m => { $("#who").textContent = m.name; });
(async () => {
  try {
    const st = await api("settings");
    state.skin = st.skin;
    state.features = st.features || {};
  } catch { /* keep auto */ }
  applySkin();
  show("diary");
})();
