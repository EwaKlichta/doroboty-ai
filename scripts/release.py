"""Prepare or restore a verified static release. Python 3.9+, standard library only."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import tempfile
import zipfile

REPO = Path(__file__).resolve().parents[1]
OUTPUT = REPO / "artifacts" / "releases"


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def prepare():
    dist = REPO / "dist"
    if not (dist / "index.html").is_file():
        raise ValueError("Run npm run build first")
    files = {p.relative_to(dist).as_posix(): p.read_bytes() for p in sorted(dist.rglob("*")) if p.is_file() and p.name != "release.json"}
    hashes = {name: digest(raw) for name, raw in files.items()}
    release_id = digest(json.dumps(hashes, sort_keys=True).encode())
    manifest = json.dumps({"id": release_id, "files": hashes}, indent=2).encode()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    archive = OUTPUT / f"{release_id}.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as package:
        for name, raw in files.items():
            package.writestr(name, raw)
        package.writestr("release.json", manifest)
    (dist / "release.json").write_bytes(manifest)
    print(json.dumps({"id": release_id, "archive": str(archive), "files": len(files)}))


def restore(archive):
    # Extract only entries covered by the manifest, into a fresh isolated folder.
    with zipfile.ZipFile(archive) as package:
        if len(package.namelist()) != len(set(package.namelist())):
            raise ValueError("Duplicate archive entries")
        manifest = json.loads(package.read("release.json"))
        hashes = manifest["files"]
        if digest(json.dumps(hashes, sort_keys=True).encode()) != manifest["id"]:
            raise ValueError("Invalid release identity")
        if set(package.namelist()) != set(hashes) | {"release.json"}:
            raise ValueError("Unexpected archive contents")
        files = {}
        for name, expected in hashes.items():
            path = PurePosixPath(name)
            if path.is_absolute() or ".." in path.parts or "\\" in name or ":" in name:
                raise ValueError("Unsafe archive path")
            raw = package.read(name)
            if digest(raw) != expected:
                raise ValueError("Release file checksum mismatch")
            files[name] = raw
        OUTPUT.mkdir(parents=True, exist_ok=True)
        target = Path(tempfile.mkdtemp(prefix="restored-", dir=OUTPUT))
        for name, raw in files.items():
            dest = target / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(raw)
        (target / "release.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        print(json.dumps({"id": manifest["id"], "restored": str(target), "files": len(files)}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["prepare", "restore"])
    parser.add_argument("archive", nargs="?")
    args = parser.parse_args()
    if args.action == "prepare":
        prepare()
    elif args.archive:
        restore(Path(args.archive))
    else:
        parser.error("restore requires an archive path")
