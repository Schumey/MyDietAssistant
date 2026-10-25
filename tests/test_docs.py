"""The docs: German and English pages pair up, and every relative link and #anchor resolves."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
LINK = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")


def slug(heading: str) -> str:
    """GitHub's heading anchor: lower case, markup dropped, spaces to hyphens."""
    s = re.sub(r"[`*_]", "", heading.strip().lower())
    s = re.sub(r"[^\w\- ]", "", s)
    return s.replace(" ", "-")


def anchors(path: Path) -> set[str]:
    out, seen = set(), {}
    in_code = False
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("```"):
            in_code = not in_code
        m = None if in_code else re.match(r"#{1,6}\s+(.*)", line)
        if m:
            s = slug(m.group(1))
            n = seen.get(s, 0)
            seen[s] = n + 1
            out.add(s if n == 0 else f"{s}-{n}")
    return out


def pages(lang: str):
    return sorted((DOCS / lang).glob("*.md"))


def test_german_and_english_pages_pair_up():
    de = {p.name for p in pages("de")}
    en = {p.name for p in pages("en")}
    assert "README.md" in de
    assert de == en


def test_links_and_anchors_resolve():
    problems = []
    for p in pages("de") + pages("en"):
        text = re.sub(r"```.*?```", "", p.read_text(encoding="utf-8"), flags=re.S)
        for target in LINK.findall(text):
            if re.match(r"[a-z]+:", target):
                continue
            file_part, _, frag = target.partition("#")
            dest = (p.parent / file_part).resolve() if file_part else p
            if not dest.exists():
                problems.append(f"{p.relative_to(ROOT)}: missing {target}")
            elif frag and dest.suffix == ".md" and frag not in anchors(dest):
                problems.append(f"{p.relative_to(ROOT)}: no anchor {target}")
    assert not problems, "\n".join(problems)


def test_every_page_is_linked_from_the_index_and_addon_tab():
    addon_tab = (ROOT / "mydiet" / "DOCS.md").read_text(encoding="utf-8")
    for lang in ("de", "en"):
        index = (DOCS / lang / "README.md").read_text(encoding="utf-8")
        for p in pages(lang):
            if p.name != "README.md":
                assert f"({p.name}" in index, f"{lang}/{p.name} missing from the index"
                assert f"docs/{lang}/{p.name}" in addon_tab, f"{lang}/{p.name} missing from mydiet/DOCS.md"
