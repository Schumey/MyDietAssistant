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

const state = { day: iso(new Date()), tab: "diary", range: 30, wrange: 90 };
const dlg = $("#dlg");
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
  ({ diary: renderDiary, foods: renderFoods, weight: renderWeight, stats: renderStats, settings: renderSettings })[tab]();
}

// ---------------------------------------------------------------- diary
async function renderDiary() {
  const d = await api("day/" + state.day);
  state.data = d;
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

  for (const meal of d.meals) {
    const items = d.entries.filter(e => e.meal_id === meal.id);
    const sum = k => items.reduce((a, e) => a + e[k], 0);
    const rows = items.map(e => h("tr", { class: "item" },
      h("td", { onclick: () => editEntry(e), title: "Menge ändern" }, `${e.name}, ${n0(e.grams)} g`),
      h("td", {}, n0(e.kcal)), h("td", {}, n0(e.carbs)), h("td", {}, n0(e.fat)), h("td", {}, n0(e.protein)),
      h("td", {}, h("button", { class: "icon", title: "Entfernen", "aria-label": "Entfernen", onclick: async () => {
        await api("entries/" + e.id, { method: "DELETE" });
        renderDiary();
      } }, "✕"))));
    root.append(h("div", { class: "card" }, h("table", { class: "diary" },
      h("thead", {}, h("tr", {},
        h("th", { class: "title" }, meal.name),
        h("th", {}, "Kalorien", h("small", {}, "kcal")),
        h("th", {}, "Kohlenhydrate", h("small", {}, "g")),
        h("th", {}, "Fette", h("small", {}, "g")),
        h("th", {}, "Eiweiß", h("small", {}, "g")),
        h("th", {}))),
      h("tbody", {}, rows, h("tr", { class: "foot" },
        h("td", {}, h("button", { class: "flat", onclick: () => openAdd(meal) }, "+ Nahrungsmittel hinzufügen")),
        h("td", {}, items.length ? n0(sum("kcal")) : ""), h("td", {}, items.length ? n0(sum("carbs")) : ""),
        h("td", {}, items.length ? n0(sum("fat")) : ""), h("td", {}, items.length ? n0(sum("protein")) : ""),
        h("td", {}))))));
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
}

function shiftDay(n) {
  const d = parse(state.day);
  d.setDate(d.getDate() + n);
  state.day = iso(d);
  renderDiary();
}

function editEntry(e) {
  const grams = h("input", { type: "number", step: "any", min: "1", value: e.grams });
  dlg.replaceChildren(
    h("h2", {}, e.name),
    h("label", {}, "Menge (g)"), grams,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: () => dlg.close() }, "Abbrechen"),
      h("button", { onclick: async () => {
        if (!(num(grams.value) > 0)) return;
        await send("PUT", "entries/" + e.id, { grams: num(grams.value) });
        dlg.close(); renderDiary();
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
  const form = h("div", {},
    h("div", { class: "grid" },
      h("div", {}, h("label", {}, "Barcode (Open Food Facts)"), f.barcode),
      h("button", { class: "flat", onclick: async () => {
        msg.textContent = "";
        try {
          const p = await api("off/barcode/" + encodeURIComponent(f.barcode.value.trim()));
          f.name.value = p.name; f.brand.value = p.brand;
          for (const k of ["kcal", "protein", "carbs", "fat"]) f[k].value = Math.round(p[k] * 10) / 10;
        } catch (e) { msg.textContent = "Produkt nicht gefunden (" + e.message + ")"; }
      } }, "Suchen")),
    h("div", { style: "margin-top:12px" }, field("name", "Name")),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("brand", "Marke"),
      field("serving_g", "Portion (g)", { type: "number", step: "any", value: 100 })),
    h("div", { class: "grid", style: "margin-top:12px" },
      field("kcal", "kcal / 100 g", { type: "number", step: "any" }),
      field("carbs", "KH / 100 g", { type: "number", step: "any" }),
      field("fat", "Fett / 100 g", { type: "number", step: "any" }),
      field("protein", "Eiweiß / 100 g", { type: "number", step: "any" })),
    msg,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: onCancel }, food ? "Abbrechen" : "Zurück"),
      h("button", { onclick: async () => {
        if (!f.name.value.trim() || num(f.kcal.value) == null) { msg.textContent = "Name und kcal sind Pflicht."; return; }
        const body = {
          name: f.name.value, brand: f.brand.value, kcal: num(f.kcal.value),
          protein: num(f.protein.value) || 0, carbs: num(f.carbs.value) || 0, fat: num(f.fat.value) || 0,
          serving_g: num(f.serving_g.value) || 100 };
        const id = food ? food.id : (await send("POST", "foods", body)).id;
        if (food) await send("PUT", "foods/" + food.id, body);
        onSave(id);
      } }, food ? "Speichern" : "Speichern & wählen")));
  setTimeout(() => f.name.focus());
  return form;
}

// ---------------------------------------------------------------- add food dialog
async function openAdd(meal) {
  let foods = await api("foods");
  let sel = null;
  const search = h("input", { type: "search", placeholder: "Lebensmittel suchen…", oninput: draw });
  const results = h("div", { class: "results" });
  const detail = h("div");
  const body = h("div");

  function draw() {
    const q = search.value.toLowerCase();
    results.replaceChildren(...foods
      .filter(f => (f.name + " " + f.brand).toLowerCase().includes(q)).slice(0, 50)
      .map(f => h("button", { class: "food", onclick: () => select(f) },
        h("span", {}, f.name, f.brand ? ` (${f.brand})` : ""),
        h("span", { class: "muted" }, `${n0(f.kcal)} kcal/100 g`))));
    if (!results.children.length) results.append(h("div", { class: "muted", style: "padding:8px" }, "Nichts gefunden – lege ein neues Lebensmittel an."));
  }

  function select(f) {
    sel = f;
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
        h("button", { class: "flat", onclick: () => { sel = null; detail.replaceChildren(); body.hidden = false; } }, "Zurück"),
        h("button", { onclick: async () => {
          if (!(num(grams.value) > 0)) return;
          await send("POST", "entries", { day: state.day, meal_id: meal.id, food_id: f.id, grams: num(grams.value) });
          dlg.close(); renderDiary();
        } }, "Hinzufügen")));
    body.hidden = true;
    grams.select();
  }

  function newFood() {
    const form = foodForm({
      onCancel: () => { form.remove(); body.hidden = false; },
      onSave: async id => {
        foods = await api("foods");
        form.remove(); body.hidden = false;
        select(foods.find(x => x.id === id));
      },
    });
    body.hidden = true;
    dlg.append(form);
  }

  body.append(search, results,
    h("div", { class: "actions" },
      h("button", { class: "flat", onclick: newFood }, "+ Neues Lebensmittel"),
      h("button", { class: "flat", onclick: () => dlg.close() }, "Schließen")));
  dlg.replaceChildren(h("h2", {}, "Zu „" + meal.name + "“ hinzufügen"), body, detail);
  draw();
  dlg.showModal();
}

// ---------------------------------------------------------------- charts
function barChart(days, goal) {
  const W = 600, H = 220, L = 40, B = 24, T = 10, R = 8;
  const max = Math.max(goal || 0, ...days.map(d => d.kcal), 100) * 1.1;
  const y = v => T + (H - T - B) * (1 - v / max);
  const bw = (W - L - R) / days.length;
  let s = "";
  for (let i = 0; i <= 4; i++) {
    const v = max / 1.1 * i / 4;
    s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${n0(v)}</text>`;
  }
  const every = Math.ceil(days.length / 8);
  days.forEach((d, i) => {
    const x = L + i * bw;
    if (d.logged) s += `<rect class="bar-k${goal && d.kcal > goal ? " over" : ""}" x="${x + bw * 0.15}" y="${y(d.kcal)}" width="${bw * 0.7}" height="${H - B - y(d.kcal)}" rx="2"/>`;
    if (i % every === 0) s += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${parse(d.day).toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })}</text>`;
  });
  if (goal) s += `<line class="goal-line" x1="${L}" x2="${W - R}" y1="${y(goal)}" y2="${y(goal)}"/>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kalorien pro Tag">${s}</svg>`;
}

function lineChart(points, target) {
  const W = 600, H = 220, L = 44, B = 24, T = 10, R = 12;
  const vals = points.map(p => p.kg).concat(target ? [target] : []);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max((hi - lo) * 0.15, 0.5);
  lo -= pad; hi += pad;
  const t0 = parse(points[0].day).getTime(), t1 = parse(points[points.length - 1].day).getTime();
  const x = d => L + (t1 === t0 ? (W - L - R) / 2 : (parse(d).getTime() - t0) / (t1 - t0) * (W - L - R));
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  let s = "";
  for (let i = 0; i <= 4; i++) {
    const v = lo + (hi - lo) * i / 4;
    s += `<line class="grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${n1(v)}</text>`;
  }
  if (target) s += `<line class="goal-line" x1="${L}" x2="${W - R}" y1="${y(target)}" y2="${y(target)}"/>`;
  s += `<polyline class="line" points="${points.map(p => `${x(p.day)},${y(p.kg)}`).join(" ")}"/>`;
  if (points.length <= 60) s += points.map(p => `<circle class="dot" cx="${x(p.day)}" cy="${y(p.kg)}" r="3"/>`).join("");
  const fmt = d => parse(d).toLocaleDateString("de-DE", { day: "numeric", month: "numeric" });
  s += `<text x="${L}" y="${H - 6}">${fmt(points[0].day)}</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${fmt(points[points.length - 1].day)}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gewichtsverlauf">${s}</svg>`;
}

function rangeButtons(options, current, onpick) {
  return h("div", { class: "range" }, options.map(([v, label]) =>
    h("button", { class: v === current ? "active" : "", onclick: () => onpick(v) }, label)));
}

// ---------------------------------------------------------------- foods page
async function renderFoods() {
  const foods = await api("foods");
  const root = $("#foods");
  root.replaceChildren();
  const list = h("div", { class: "list" });

  const openForm = food => {
    const form = foodForm({
      food,
      onCancel: () => dlg.close(),
      onSave: () => { dlg.close(); renderFoods(); },
    });
    dlg.replaceChildren(h("h2", {}, food ? "Lebensmittel bearbeiten" : "Neues Lebensmittel"), form);
    dlg.showModal();
  };

  const draw = () => {
    const q = search.value.toLowerCase();
    const shown = foods.filter(f => (f.name + " " + f.brand).toLowerCase().includes(q));
    list.replaceChildren(...(shown.length ? shown.map(f => h("div", {},
      h("div", { class: "grow" }, h("div", {}, f.name, f.brand ? ` (${f.brand})` : ""),
        h("div", { class: "muted" }, `${n0(f.kcal)} kcal · KH ${n1(f.carbs)} g · Fett ${n1(f.fat)} g · Eiweiß ${n1(f.protein)} g (pro 100 g)`)),
      h("button", { class: "icon edit", title: "Bearbeiten", "aria-label": "Bearbeiten", onclick: () => openForm(f) }, "✎"),
      h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
        if (!confirm(`„${f.name}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.`)) return;
        await api("foods/" + f.id, { method: "DELETE" }); renderFoods();
      } }, "✕")))
      : [h("div", { class: "muted", style: "padding:8px 0" }, foods.length ? "Nichts gefunden." : "Noch keine Lebensmittel angelegt.")]));
  };

  const search = h("input", { type: "search", placeholder: "Lebensmittel suchen…", oninput: draw });
  root.append(h("div", { class: "card" },
    h("div", { class: "grid", style: "grid-template-columns:1fr auto" }, search,
      h("button", { onclick: () => openForm(null) }, "+ Neues Lebensmittel")),
    list));
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
  const since = state.wrange ? iso(new Date(Date.now() - state.wrange * 864e5)) : "";
  const pts = all.filter(p => p.day >= since);
  const shown = pts.length ? pts : all.slice(-1);
  const last = all[all.length - 1];
  const delta = shown.length > 1 ? last.kg - shown[0].kg : null;
  const tile = (label, value) => h("div", { class: "tile" }, h("span", { class: "muted" }, label), h("b", {}, value));

  const chart = h("div");
  chart.innerHTML = lineChart(shown, goal.target_weight);
  root.append(
    h("div", { class: "stat-tiles" },
      tile("Aktuell", n1(last.kg) + " kg"),
      tile("Veränderung", delta == null ? "–" : (delta > 0 ? "+" : "") + n1(delta) + " kg"),
      tile("Ziel", goal.target_weight ? n1(goal.target_weight) + " kg" : "–")),
    h("div", { class: "card" },
      rangeButtons([[30, "30 Tage"], [90, "90 Tage"], [365, "1 Jahr"], [0, "Alle"]], state.wrange,
        v => { state.wrange = v; renderWeight(); }),
      chart),
    h("div", { class: "card" }, h("h2", {}, "Verlauf"),
      h("div", { class: "list" }, [...all].reverse().slice(0, 60).map(p => h("div", {},
        h("span", { class: "grow" }, parse(p.day).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" })),
        h("b", {}, n1(p.kg) + " kg"),
        h("button", { class: "icon", title: "Löschen", "aria-label": "Löschen", onclick: async () => {
          await api("weights/" + p.day, { method: "DELETE" }); renderWeight();
        } }, "✕"))))));
}

// ---------------------------------------------------------------- stats
async function renderStats() {
  const [{ days, goal }, weights] = await Promise.all([api("stats?days=" + state.range), api("weights?days=" + state.range)]);
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
  root.append(
    rangeButtons([[7, "7 Tage"], [30, "30 Tage"], [90, "90 Tage"]], state.range, v => { state.range = v; renderStats(); }),
    h("div", { class: "stat-tiles" },
      tile("Ø Kalorien", logged.length ? n0(avg("kcal")) + " kcal" : "–"),
      tile("Erfasste Tage", `${logged.length} / ${days.length}`),
      tile("Ø Eiweiß", n0(avg("protein")) + " g"),
      tile("Ø Kohlenhydrate", n0(avg("carbs")) + " g"),
      tile("Ø Fett", n0(avg("fat")) + " g"),
      tile("Gewicht", weights.length > 1
        ? ((d => (d > 0 ? "+" : "") + n1(d) + " kg")(weights[weights.length - 1].kg - weights[0].kg)) : "–")),
    h("div", { class: "card" }, h("h2", {}, "Kalorien pro Tag"), chart,
      goal.kcal ? h("div", { class: "muted" }, `Gestrichelt: Tagesziel ${n0(goal.kcal)} kcal`) : null),
    h("div", { class: "card" }, h("h2", {}, "Nährwertverteilung (Ø)"),
      h("div", { class: "macro-split" },
        h("i", { style: `width:${pct(kc.p)}%` }), h("i", { style: `width:${pct(kc.c)}%` }), h("i", { style: `width:${pct(kc.f)}%` })),
      h("div", { class: "legend" },
        h("span", { style: "--c:var(--info-color)" }, `Eiweiß ${logged.length ? pct(kc.p) : 0} %`),
        h("span", { style: "--c:var(--warning-color)" }, `Kohlenhydrate ${logged.length ? pct(kc.c) : 0} %`),
        h("span", { style: "--c:var(--error-color)" }, `Fett ${logged.length ? pct(kc.f) : 0} %`))));
}

// ---------------------------------------------------------------- settings
async function renderSettings() {
  const [goal, day] = await Promise.all([api("goal"), api("day/" + state.day)]);
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
    return h("div", {}, name,
      h("button", { class: "icon", disabled: i === 0, title: "Nach oben", onclick: () => move(-1) }, "↑"),
      h("button", { class: "icon", disabled: i === meals.length - 1, title: "Nach unten", onclick: () => move(1) }, "↓"),
      h("button", { class: "icon", title: "Löschen", onclick: async () => {
        try { await api("meals/" + m.id, { method: "DELETE" }); renderSettings(); }
        catch (e) { mealMsg.textContent = e.message; }
      } }, "✕"));
  }));
  const newMeal = h("input", { placeholder: "Neue Mahlzeit, z. B. Nachtschicht" });
  root.append(h("div", { class: "card" }, h("h2", {}, "Mahlzeiten"), mealList, mealMsg,
    h("div", { class: "actions" }, newMeal, h("button", { onclick: async () => {
      if (!newMeal.value.trim()) return;
      await send("POST", "meals", { name: newMeal.value });
      renderSettings();
    } }, "Hinzufügen"))));

}

api("me").then(m => { $("#who").textContent = m.name; });
show("diary");
