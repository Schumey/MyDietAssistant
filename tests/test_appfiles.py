import hashlib

from core import appfiles


def test_latest_picks_highest_numeric_version(tmp_path):
    assert appfiles.latest(str(tmp_path)) is None
    assert appfiles.latest(str(tmp_path / "missing")) is None
    (tmp_path / "hafs-0.9.0.apk").write_bytes(b"old")
    (tmp_path / "hafs-0.10.0.apk").write_bytes(b"newer")   # 0.10 > 0.9 numerically
    (tmp_path / "notes.txt").write_text("x")
    (tmp_path / "hafs-1.0.0.apk.part").write_bytes(b"incomplete")
    info = appfiles.latest(str(tmp_path))
    assert info == {"version": "0.10.0", "name": "hafs-0.10.0.apk", "size": 5, "sha256": hashlib.sha256(b"newer").hexdigest()}


def test_resolve_only_serves_package_names(tmp_path):
    (tmp_path / "hafs-0.1.0.apk").write_bytes(b"x")
    (tmp_path / "secret.txt").write_text("s")
    assert appfiles.resolve(str(tmp_path), "hafs-0.1.0.apk") == str(tmp_path / "hafs-0.1.0.apk")
    assert appfiles.resolve(str(tmp_path), "hafs-0.2.0.apk") is None      # not there
    assert appfiles.resolve(str(tmp_path), "secret.txt") is None
    assert appfiles.resolve(str(tmp_path), "../hafs-0.1.0.apk") is None
    assert appfiles.resolve(str(tmp_path), "hafs-0.1.0.apk/../../x") is None
