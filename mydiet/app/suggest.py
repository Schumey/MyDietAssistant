"""Meal suggestions: fit saved meals (and combinations found in the diary) to the macros that are still open.
Pure functions without database access, so the solver can be tested on its own.

A candidate is a meal made of items. Every item has base amounts (the stored grams and the macros of exactly that amount)
and is multiplied by a factor u:
  * 'scale' items follow the meal factor s; with a tolerance t they may deviate: u in [s*(1-t), s*(1+t)]
  * 'fixed' items keep u = 1 (or, with a package size, one or two packages)
  * add-ons (nuts ...) are extra items with their own range and step; they only appear when they improve the fit
The meal factor s runs over a grid inside the meal's range; for each s the free factors are fitted by a bounded
least-squares problem (accelerated projected gradient), then amounts are rounded to their steps.
"""
import itertools
import math

KEYS = ("kcal", "protein", "carbs", "fat")
MICROS = ("fiber", "sugar", "salt", "sat_fat")
UNIT = {"kcal": 100.0, "protein": 10.0, "carbs": 10.0, "fat": 10.0}   # a deviation of this size counts as 1
LEVELS = (0.0, 1.0, 3.0, 9.0)                                          # priority 0..3 -> weight
DEFAULT_PRIO = {"kcal": 2, "protein": 2, "carbs": 1, "fat": 1}
DEFAULT_RANGE = (0.6, 1.6)
MAX_ADDONS = 2


def weights(prio: dict, target: dict) -> dict:
    """Weight per macro; a macro without a goal (target None) is ignored."""
    p = {**DEFAULT_PRIO, **(prio or {})}
    return {k: (LEVELS[max(0, min(3, int(p[k])))] if target.get(k) is not None else 0.0) for k in KEYS}


def multipliers(opts: dict) -> tuple[dict, dict]:
    """(over, under) multipliers per macro: overshooting costs more than undershooting; optional hard calorie cap / protein minimum."""
    over = {"kcal": 2.0, "protein": 1.0, "carbs": 1.3, "fat": 1.3}
    under = {k: 1.0 for k in KEYS}
    if opts.get("kcal_cap"):
        over["kcal"] = 400.0
    if opts.get("protein_min"):
        under["protein"] = 6.0
    return over, under


def cost(total: dict, target: dict, w: dict, over: dict, under: dict) -> float:
    c = 0.0
    for k in KEYS:
        if w[k]:
            d = (total[k] - (target.get(k) or 0.0)) / UNIT[k]
            c += w[k] * d * d * (over[k] if d > 0 else under[k])
    return c


def _lin(base: dict, u: float) -> list:
    return [base[k] * u for k in KEYS]


def _fit(const: list, free: list, target: dict, w: dict, over: dict, under: dict, iters: int = 60) -> list:
    """Minimise cost over the free factors. free = [(base 4-vector, lo, hi, start)]; returns the factors."""
    n = len(free)
    x = [min(max(f[3], f[1]), f[2]) for f in free]
    if not n:
        return x
    tgt = [target.get(k) or 0.0 for k in KEYS]
    wk = [w[k] for k in KEYS]
    mu = [max(over[k], under[k]) for k in KEYS]
    big = sum(wk[j] * mu[j] * sum((f[0][j] / UNIT[KEYS[j]]) ** 2 for f in free) for j in range(4))
    lip = 2.0 * big or 1.0
    y, t = list(x), 1.0
    for _ in range(iters):
        tot = [const[j] + sum(free[i][0][j] * y[i] for i in range(n)) for j in range(4)]
        g = []
        for j in range(4):
            d = (tot[j] - tgt[j]) / UNIT[KEYS[j]]
            g.append(2.0 * wk[j] * d * (over[KEYS[j]] if d > 0 else under[KEYS[j]]) / UNIT[KEYS[j]])
        nx = [min(max(y[i] - sum(g[j] * free[i][0][j] for j in range(4)) / lip, free[i][1]), free[i][2]) for i in range(n)]
        t2 = (1 + math.sqrt(1 + 4 * t * t)) / 2
        y = [nx[i] + (t - 1) / t2 * (nx[i] - x[i]) for i in range(n)]
        x, t = nx, t2
    return x


def _step(grams: float, step: float) -> float:
    return step if step > 0 else (5.0 if grams >= 25 else 1.0)


def _rnd(v: float, step: float) -> float:
    return round(v / step) * step


def _pack_options(cand: dict):
    """Fixed items with a package size can be 1 or 2 packages: all combinations (at most for the first two such items)."""
    idx = [i for i, it in enumerate(cand["items"]) if it["mode"] == "fixed" and it.get("pack_g", 0) > 0 and it["grams"] > 0][:2]
    if not idx:
        yield {}
        return
    for ns in itertools.product((1, 2), repeat=len(idx)):
        yield {i: n * cand["items"][i]["pack_g"] / cand["items"][i]["grams"] for i, n in zip(idx, ns)}


def _build(cand: dict, s: float, packs: dict, addons: list):
    """Constant part and free variables for meal factor s. Returns (const, free, meta) with meta[i] = (kind, index)."""
    const = [0.0] * 4
    free, meta = [], []
    for i, it in enumerate(cand["items"]):
        b = it["base"]
        if it["mode"] == "fixed" or it["grams"] <= 0:
            u = packs.get(i, 1.0)
            for j, v in enumerate(_lin(b, u)):
                const[j] += v
        elif it.get("tol", 0) > 0:
            t = min(it["tol"], 100.0) / 100.0
            free.append(([b[k] for k in KEYS], max(s * (1 - t), 0.05), s * (1 + t), s))
            meta.append(("item", i))
        else:
            for j, v in enumerate(_lin(b, s)):
                const[j] += v
    for a, ad in enumerate(addons):
        ref = ad["max_g"]
        free.append(([ad["per100"][k] * ref / 100.0 for k in KEYS], ad["min_g"] / ref, 1.0, ad["min_g"] / ref))
        meta.append(("addon", a))
    return const, free, meta


def _solve_one(cand, s, packs, addons, target, w, over, under):
    const, free, meta = _build(cand, s, packs, addons)
    x = _fit(const, free, target, w, over, under)
    u_items = {}
    amt_addons = {}
    for (kind, i), v in zip(meta, x):
        if kind == "item":
            u_items[i] = v
        else:
            amt_addons[i] = v * addons[i]["max_g"]
    return u_items, amt_addons


def _finish(cand, s, packs, addons, u_items, amt_addons):
    """Round to steps and assemble the result (items with scaled macros, add-ons) plus exact totals."""
    out, total = [], {k: 0.0 for k in (*KEYS, *MICROS)}
    for i, it in enumerate(cand["items"]):
        if it["mode"] == "fixed" or it["grams"] <= 0:
            u = packs.get(i, 1.0)
            grams = it["grams"] * u
        else:
            u = u_items.get(i, s)
            step = _step(it["grams"], it.get("step_g", 0))
            grams = max(_rnd(it["grams"] * u, step), step)
            u = grams / it["grams"]
        row = {"name": it["name"], "grams": round(grams, 1), "kind": "item", "mode": it["mode"]}
        for k in (*KEYS, *MICROS):
            row[k] = it["base"].get(k, 0.0) * u
            total[k] += row[k]
        out.append(row)
    picked = []
    for a, ad in enumerate(addons):
        g = amt_addons.get(a, 0.0)
        step = _step(ad["max_g"], ad["step_g"])
        g = _rnd(g, step)
        if g >= max(step, ad["min_g"]) or (ad["min_g"] > 0 and g > 0):
            picked.append((a, g))
    picked.sort(key=lambda p: -p[1] * addons[p[0]]["per100"]["kcal"])
    for a, g in picked[:MAX_ADDONS]:
        ad = addons[a]
        row = {"name": ad["name"], "grams": round(g, 1), "kind": "addon", "food_id": ad["food_id"]}
        for k in (*KEYS, *MICROS):
            row[k] = ad["per100"].get(k, 0.0) * g / 100.0
            total[k] += row[k]
        out.append(row)
    return out, total


def _rough(cand, target, w, over, under, smin, smax):
    """Cheap pre-ranking: one common factor, no tolerance, no add-ons."""
    best = None
    for n in range(21):
        s = smin + (smax - smin) * n / 20
        const, _, _ = _build({**cand, "items": [{**it, "tol": 0} for it in cand["items"]]}, s, {}, [])
        c = cost(dict(zip(KEYS, const)), target, w, over, under)
        best = c if best is None or c < best else best
    return best


def best_fit(cand: dict, addons: list, target: dict, prio: dict, opts: dict) -> dict | None:
    """Best amounts for one candidate: {'items', 'totals', 'cost', 's'} or None when the meal cannot be scaled."""
    w = weights(prio, target)
    over, under = multipliers(opts)
    smin, smax = cand.get("min_scale") or DEFAULT_RANGE[0], cand.get("max_scale") or DEFAULT_RANGE[1]
    if smin > smax:
        smin, smax = smax, smin
    scalable = any(it["mode"] == "scale" and it["grams"] > 0 for it in cand["items"])
    if not scalable:
        smin = smax = 1.0
    addons = [a for a in addons if a["max_g"] > 0 and a["max_g"] >= a["min_g"]]
    free_any = addons or any(it.get("tol", 0) > 0 and it["mode"] == "scale" and it["grams"] > 0 for it in cand["items"])
    best = None
    for packs in _pack_options(cand):
        coarse = 61 if not free_any else 9
        grid = [smin + (smax - smin) * n / (coarse - 1) for n in range(coarse)] if smax > smin else [smin]
        scored = []
        for s in grid:
            ui, aa = _solve_one(cand, s, packs, addons, target, w, over, under)
            items, tot = _finish(cand, s, packs, addons, ui, aa)
            scored.append((cost(tot, target, w, over, under), s, items, tot))
        if free_any and smax > smin and len(grid) > 2:   # refine around the best factor
            c0, s0 = min(scored, key=lambda r: r[0])[:2]
            h = (smax - smin) / (coarse - 1)
            for n in range(-4, 5):
                s = s0 + h * n / 4
                if smin <= s <= smax and s != s0:
                    ui, aa = _solve_one(cand, s, packs, addons, target, w, over, under)
                    items, tot = _finish(cand, s, packs, addons, ui, aa)
                    scored.append((cost(tot, target, w, over, under), s, items, tot))
        c, s, items, tot = min(scored, key=lambda r: r[0])
        if best is None or c < best["cost"]:
            best = {"items": items, "totals": tot, "cost": c, "s": s}
    return best


def rank(cands: list, addons: list, target: dict, prio: dict, opts: dict, limit: int = 8, full: int = 14) -> list:
    """Fit all candidates (pre-ranked with the cheap estimate, the best `full` get the full treatment); sorted by cost."""
    w = weights(prio, target)
    over, under = multipliers(opts)
    pre = []
    for cand in cands:
        if not cand["items"]:
            continue
        smin, smax = cand.get("min_scale") or DEFAULT_RANGE[0], cand.get("max_scale") or DEFAULT_RANGE[1]
        pre.append((_rough(cand, target, w, over, under, min(smin, smax), max(smin, smax)), cand))
    pre.sort(key=lambda p: p[0])
    out = []
    for _, cand in pre[:full]:
        r = best_fit(cand, addons, target, prio, opts)
        if r:
            out.append({**r, "cand": cand})
    out.sort(key=lambda r: r["cost"] + r["cand"].get("bias", 0.0))
    return out[:limit]
