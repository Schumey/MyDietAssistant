"""Spoken or typed food lists ("zwei Äpfel und 200 g Skyr") -> parts, and name matching.
Pure functions without database access. German first, a few English words work as well."""
import re

NUMBERS = {
    "ein": 1, "eine": 1, "einen": 1, "einem": 1, "einer": 1, "eines": 1, "eins": 1, "zwei": 2, "drei": 3, "vier": 4, "fünf": 5, "sechs": 6,
    "sieben": 7, "acht": 8, "neun": 9, "zehn": 10, "elf": 11, "zwölf": 12, "halbe": 0.5, "halber": 0.5, "halben": 0.5, "halbes": 0.5,
    "anderthalb": 1.5, "eineinhalb": 1.5, "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
    "eight": 8, "nine": 9, "ten": 10, "half": 0.5,
}
GRAM_UNITS = {"g": 1, "gr": 1, "gramm": 1, "gram": 1, "grams": 1, "kg": 1000, "kilo": 1000, "kilogramm": 1000, "kilogram": 1000,
              "ml": 1, "milliliter": 1, "l": 1000, "liter": 1000, "el": 15, "esslöffel": 15, "tl": 5, "teelöffel": 5}
FILLER = {"von", "vom", "der", "die", "das", "dem", "den", "etwas", "noch", "bitte", "ca", "circa", "ungefähr", "of", "the", "some"}
SPLIT = re.compile(r"\s*(?:,|;|\+|\bund\b|\bsowie\b|\bplus\b|\band\b)\s*")
NUM = re.compile(r"^\d+(?:[.,]\d+)?$")
FRAC = re.compile(r"^(\d+)/(\d+)$")


def fold(text: str) -> str:
    return (text.lower().replace("ä", "a").replace("ö", "o").replace("ü", "u").replace("ß", "ss"))


def stem(token: str) -> str:
    for suf in ("en", "er", "e", "n", "s"):
        if len(token) > 3 and token.endswith(suf):
            return token[:-len(suf)]
    return token


def stems(text: str) -> list:
    return [stem(t) for t in re.sub(r"[^a-z0-9]+", " ", fold(text)).split()]


def number(token: str):
    if NUM.match(token):
        return float(token.replace(",", "."))
    m = FRAC.match(token)
    if m and int(m.group(2)):
        return int(m.group(1)) / int(m.group(2))
    return NUMBERS.get(token)


def split_parts(text: str) -> list:
    text = re.sub(r"(\d)([a-zäöüß])", r"\1 \2", text.lower().replace("½", " 0.5 ").strip())
    return [p.strip(" .!?") for p in SPLIT.split(text) if p.strip(" .!?")]


def parse_part(part: str) -> dict:
    """{'qty', 'grams', 'words', 'explicit'}: quantity (default 1), grams when a weight/volume unit was spoken, the name words."""
    toks = part.split()
    qty, i = 1.0, 0
    if toks and number(toks[0]) is not None:
        qty, i = number(toks[0]), 1
        if i < len(toks) and (number(toks[i]) or 1) < 1:   # "1 1/2", "ein halbes"
            qty = qty + number(toks[i]) if toks[0][0].isdigit() else number(toks[i])   # "ein halbes Brot" is half a loaf
            i += 1
    rest, grams = toks[i:], None
    if i and rest and rest[0] in GRAM_UNITS:
        grams, rest = qty * GRAM_UNITS[rest[0]], rest[1:]
    while rest and rest[0] in FILLER:
        rest = rest[1:]
    return {"qty": qty, "grams": grams, "words": rest, "explicit": bool(i)}


def score(query: str, candidate: str) -> int:
    """How well a spoken name fits a stored name (0 = not at all)."""
    q, c = stems(query), stems(candidate)
    if not q or not c:
        return 0
    if q == c:
        return 100
    if set(q) <= set(c):
        return max(55 - 3 * (len(c) - len(q)), 40)
    if set(c) <= set(q):
        return 35
    return 0


def best(query: str, names: list):
    """(index, score) of the best fitting name, or None."""
    top = None
    for i, n in enumerate(names):
        s = score(query, n)
        if s and (top is None or s > top[1] or (s == top[1] and len(n) < len(names[top[0]]))):
            top = (i, s)
    return top if top and top[1] >= 35 else None
