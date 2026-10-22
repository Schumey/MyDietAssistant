// The add-on runs in an ingress iframe on the same origin as Home Assistant, so the
// active HA theme can be read from the parent document and mirrored here:
//  - every custom property the theme sets on <html> (plus HA's resolved defaults),
//  - @font-face rules, because web fonts loaded by the parent are not available in the iframe.
(() => {
  // Resolved from computed style so HA's built-in defaults are picked up even without a theme.
  const VARS = [
    "--primary-color", "--accent-color", "--primary-background-color",
    "--secondary-background-color", "--card-background-color", "--primary-text-color",
    "--secondary-text-color", "--disabled-text-color", "--text-primary-color",
    "--divider-color", "--error-color", "--warning-color", "--success-color", "--info-color",
    "--app-header-background-color", "--app-header-text-color",
    "--ha-card-background", "--ha-card-border-radius", "--ha-card-box-shadow",
    "--ha-card-border-width", "--ha-card-border-color",
    "--ha-font-family-body", "--ha-font-family-heading", "--primary-font-family",
    "--paper-font-common-base_-_font-family", "--paper-font-body1_-_font-family",
    "--mdc-typography-font-family", "--mdc-typography-body1-font-family",
    "--ha-button-border-radius", "--ha-button-height", "--ha-button-box-shadow",
    "--ha-control-border-radius", "--ha-dialog-border-radius",
    "--ha-border-radius-sm", "--ha-border-radius-md", "--ha-border-radius-lg", "--ha-border-radius-pill",
    "--wa-color-brand-fill-loud", "--wa-color-brand-on-loud",
    "--wa-color-brand-fill-quiet", "--wa-color-brand-on-quiet",
    "--input-fill-color", "--input-ink-color", "--input-idle-line-color", "--input-hover-line-color",
  ];
  const root = document.documentElement;
  const applied = new Set();

  function syncVars(p) {
    const doc = p.document.documentElement;
    const cs = p.getComputedStyle(doc);
    const next = new Map();
    // inline custom properties set by the theme (raw values; they may reference other vars,
    // which are copied too, so they resolve here as well)
    for (const name of doc.style) if (name.startsWith("--")) next.set(name, doc.style.getPropertyValue(name));
    for (const v of VARS) {
      const val = cs.getPropertyValue(v).trim();
      if (val) next.set(v, val);
    }
    for (const [k, v] of next) { root.style.setProperty(k, v); applied.add(k); }
    for (const k of [...applied]) if (!next.has(k)) { root.style.removeProperty(k); applied.delete(k); }
    // name of the selected HA theme, so the app can switch to a matching look (e.g. Windows 95/98)
    const hass = p.document.querySelector("home-assistant")?.hass;
    const themeName = hass?.selectedTheme?.theme || hass?.themes?.theme || "";
    if (root.dataset.themeName !== themeName) root.dataset.themeName = themeName;
    const bg = cs.getPropertyValue("--primary-background-color").trim();
    if (bg) root.style.colorScheme = isDark(bg) ? "dark" : "light";
  }

  function isDark(color) {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = "#000"; c.fillStyle = color;
    const m = c.fillStyle.match(/^#(..)(..)(..)$/);
    if (!m) return false;
    const [r, g, b] = m.slice(1).map(x => parseInt(x, 16));
    return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
  }

  const fontStyle = Object.assign(document.createElement("style"), { id: "ha-fonts" });
  document.head.append(fontStyle);
  let fontCss = "";

  function fontRules(sheet, out) {
    let rules;
    try { rules = sheet.cssRules; } catch { return; } // cross-origin sheet
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) {
        const base = sheet.href || sheet.ownerNode?.baseURI || window.parent.location.href;
        out.push(r.cssText.replace(/url\((["']?)(?!data:|https?:|blob:)([^"')]+)\1\)/g,
          (_, q, u) => `url("${new URL(u, base).href}")`));
      } else if (r.cssRules) fontRules(r, out);
    }
  }

  function syncFonts(p) {
    const out = [];
    for (const s of p.document.styleSheets) fontRules(s, out);
    for (const s of p.document.adoptedStyleSheets || []) fontRules(s, out);
    const css = [...new Set(out)].join("\n");
    if (css !== fontCss) { fontCss = css; fontStyle.textContent = css; }
  }

  function sync() {
    try {
      const p = window.parent;
      if (!p || p === window) return;
      syncVars(p);
      syncFonts(p);
    } catch (e) { /* cross-origin (not in ingress): stay with CSS fallbacks */ }
  }

  sync();
  try {
    const p = window.parent;
    if (p && p !== window) {
      new MutationObserver(sync).observe(p.document.documentElement,
        { attributes: true, attributeFilter: ["style", "class"] });
      new MutationObserver(sync).observe(p.document.body, { attributes: true });
    }
  } catch (e) { /* ignore */ }
  setInterval(sync, 3000); // themes applied via stylesheet swaps don't trigger the observers
})();
