// The add-on runs in an ingress iframe on the same origin as Home Assistant, so the
// active HA theme's CSS variables can be read from the parent document and mirrored here.
(() => {
  const VARS = [
    "--primary-color", "--accent-color", "--primary-background-color",
    "--secondary-background-color", "--card-background-color", "--primary-text-color",
    "--secondary-text-color", "--disabled-text-color", "--text-primary-color",
    "--divider-color", "--error-color", "--warning-color", "--success-color", "--info-color",
    "--app-header-background-color", "--app-header-text-color",
    "--ha-card-border-radius", "--ha-card-box-shadow", "--ha-card-border-width",
    "--ha-card-border-color", "--ha-font-family-body", "--paper-font-body1_-_font-family",
    "--mdc-typography-body1-font-family",
  ];
  const root = document.documentElement;

  function sync() {
    try {
      const p = window.parent;
      if (!p || p === window) return;
      const cs = p.getComputedStyle(p.document.documentElement);
      for (const v of VARS) {
        const val = cs.getPropertyValue(v).trim();
        if (val) root.style.setProperty(v, val);
        else root.style.removeProperty(v);
      }
      const bg = cs.getPropertyValue("--primary-background-color").trim();
      if (bg) root.style.colorScheme = isDark(bg) ? "dark" : "light";
    } catch (e) { /* cross-origin (not in ingress): stay with CSS fallbacks */ }
  }

  function isDark(color) {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = "#000"; c.fillStyle = color;
    const m = c.fillStyle.match(/^#(..)(..)(..)$/);
    if (!m) return false;
    const [r, g, b] = m.slice(1).map(x => parseInt(x, 16));
    return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
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
