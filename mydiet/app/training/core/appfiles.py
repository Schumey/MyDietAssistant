"""The app package offered for self-update: `hafs-<version>.apk` files in a folder (pure functions)."""

from __future__ import annotations

import hashlib
import os
import re

_NAME = re.compile(r"^hafs-(\d+(?:\.\d+)*)\.apk$")


def version_key(version: str) -> tuple[int, ...]:
    return tuple(int(p) for p in version.split("."))


def latest(folder: str) -> dict | None:
    """The newest `hafs-<version>.apk` in [folder] with size and SHA-256, or None."""
    try:
        names = os.listdir(folder)
    except OSError:
        return None
    best: tuple[tuple[int, ...], str, str] | None = None
    for name in names:
        m = _NAME.match(name)
        if m and (best is None or version_key(m.group(1)) > best[0]):
            best = (version_key(m.group(1)), m.group(1), name)
    if best is None:
        return None
    path = os.path.join(folder, best[2])
    digest = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            digest.update(chunk)
    return {"version": best[1], "name": best[2], "size": os.path.getsize(path), "sha256": digest.hexdigest()}


def resolve(folder: str, name: str) -> str | None:
    """Full path of an offered package; only exact `hafs-<version>.apk` names inside [folder] are served."""
    if not _NAME.match(name):
        return None
    path = os.path.join(folder, name)
    return path if os.path.isfile(path) else None
