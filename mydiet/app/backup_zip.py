"""Backup archive (.zip), shared by export, automatic backups and the admin backup of all users. No app imports.

Layout:
  manifest.json                     {"format": "hafs-backup", "version": 2, "created", "app_version", "scope": "user"|"all",
                                     "users": [{"owner", "name", "dir", "parts": {"nutrition": {...counts}, "training": {...}}}]}
  users/<dir>/nutrition.json        the nutrition export (the JSON export of 1.x, without the other parts)
  users/<dir>/<part>.json           one file per further part (training); the content is the part's data

Merged back, one user is the same dict the JSON export returns, so JSON and ZIP restore through one path.
"""
import io
import json
import re
import zipfile
from datetime import datetime

FORMAT = "hafs-backup"
VERSION = 2
MAX_UNPACKED = 300 * 1024 * 1024     # a restore never inflates more than this (zip bombs)
SAFE = re.compile(r"[^A-Za-z0-9_.-]+")


class BadArchive(ValueError):
    pass


def split(data: dict, part_keys) -> dict:
    """{"nutrition": everything except the extra parts, "<part>": its data}; absent parts stay out."""
    parts = {"nutrition": {k: v for k, v in data.items() if k not in part_keys}}
    for k in part_keys:
        if k in data:
            parts[k] = data[k]
    return parts


def build(users: list[dict], scope: str, app_version: str, part_keys) -> bytes:
    """users: [{"owner", "name", "data": export dict, "summary": {part: counts}}]"""
    buf = io.BytesIO()
    used: set[str] = set()
    manifest_users = []
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for u in users:
            base = SAFE.sub("_", u["owner"]).strip("._") or "user"
            d, n = base, 2
            while d in used:
                d, n = f"{base}_{n}", n + 1
            used.add(d)
            parts = split(u["data"], part_keys)
            for name, content in parts.items():
                z.writestr(f"users/{d}/{name}.json", json.dumps(content, ensure_ascii=False))
            manifest_users.append({"owner": u["owner"], "name": u.get("name") or "", "dir": d,
                                   "parts": {p: (u.get("summary") or {}).get(p, {}) for p in parts}})
        z.writestr("manifest.json", json.dumps({
            "format": FORMAT, "version": VERSION, "created": datetime.now().isoformat(timespec="seconds"),
            "app_version": app_version, "scope": scope, "users": manifest_users}, ensure_ascii=False, indent=1))
    return buf.getvalue()


def _json(z: zipfile.ZipFile, name: str):
    try:
        return json.loads(z.read(name).decode("utf-8"))
    except KeyError:
        raise BadArchive(f"{name} fehlt") from None
    except (ValueError, UnicodeDecodeError):
        raise BadArchive(f"{name} nicht lesbar") from None


def read(blob: bytes, part_keys) -> tuple[dict, dict]:
    """(manifest, {owner: merged export dict}); raises BadArchive."""
    try:
        z = zipfile.ZipFile(io.BytesIO(blob))
    except zipfile.BadZipFile:
        raise BadArchive("Keine ZIP-Datei") from None
    with z:
        if sum(i.file_size for i in z.infolist()) > MAX_UNPACKED:
            raise BadArchive("Archiv zu groß")
        m = _json(z, "manifest.json")
        if not isinstance(m, dict) or m.get("format") != FORMAT or not isinstance(m.get("users"), list):
            raise BadArchive("Keine HAFS-Sicherung")
        if int(m.get("version") or 0) > VERSION:
            raise BadArchive("Die Sicherung ist neuer als diese App")
        out: dict[str, dict] = {}
        for u in m["users"]:
            owner, d = u.get("owner"), u.get("dir")
            if not isinstance(owner, str) or not isinstance(d, str) or SAFE.sub("_", d) != d:
                raise BadArchive("Manifest fehlerhaft")
            data = _json(z, f"users/{d}/nutrition.json")
            if not isinstance(data, dict):
                raise BadArchive("Manifest fehlerhaft")
            for p in part_keys:
                if f"users/{d}/{p}.json" in z.namelist():
                    data[p] = _json(z, f"users/{d}/{p}.json")
            out[owner] = data
        return m, out
