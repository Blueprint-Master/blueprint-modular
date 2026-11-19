"""Package a committed version of Modular. Local settings and uploads never enter the archive."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
# Git pathspecs. Only files in these runtime surfaces can be distributed.
SOURCES = [
    "app", "components", "contexts", "hooks", "lib", "types", "public", "prisma",
    "packages/core/src", "packages/core/package*.json", "packages/core/tsconfig.json",
    "packages/core/vite.config.ts", "packages/core/postcss.config.mjs",
    "packages/core/LICENSE", "packages/core/NOTICE", "packages/core/USAGE.md",
    "packages/core/OBJECTS.md", "bpm", "pyproject.toml", "README.md", "LICENSE", "NOTICE",
    "package.json", "package-lock.json", "next.config.mjs", "next-env.d.ts", "middleware.ts",
    "tailwind.config.ts", "postcss.config.mjs", "tsconfig.json", ".env.example",
    "deploy/prompteur", "deploy/prompteur-api-requirements.txt", "deploy/copy-standalone-assets.sh", "deploy/backup-postgres.sh",
    "scripts/generate-versions.mjs", "scripts/generate-changelog.mjs",
    "scripts/generate-component-examples.mjs", "scripts/build-python-runtime.sh",
    "docs/DATABASE.md", "docs/modules-bundle.md",
]


def destinations(name):
    yield "application/" + name
    if name.startswith("app/(app)/modules/"):
        yield name.removeprefix("app/(app)/")
    elif name.startswith(("components/bpm/", "lib/", "prisma/")) or name in ("LICENSE", "NOTICE"):
        yield name
    elif name == "app/globals.css":
        yield "globals-bpm-reference.css"
    elif name == "docs/modules-bundle.md":
        yield "README-BUNDLE.md"


def build(destination):
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    pkg = subprocess.check_output(["git", "show", f"{commit}:package.json"], cwd=ROOT)
    version = json.loads(pkg)["version"]
    destination.mkdir(parents=True, exist_ok=True)
    filename = f"blueprint-modules-v{version}.zip"
    with tempfile.TemporaryDirectory(dir=destination) as staging:
        candidate = Path(staging) / filename
        with ZipFile(candidate, "w", compression=ZIP_DEFLATED) as archive:
            with subprocess.Popen(["git", "archive", "--format=tar", commit, "--", *SOURCES],
                                  cwd=ROOT, stdout=subprocess.PIPE) as git:
                with tarfile.open(fileobj=git.stdout, mode="r|") as sources:
                    for member in sources:
                        if member.isdir():
                            continue
                        if not member.isfile():
                            raise ValueError(f"Unsupported archive member: {member.name}")
                        data = sources.extractfile(member).read()
                        date = datetime.fromtimestamp(member.mtime, timezone.utc).timetuple()[:6]
                        for target in destinations(member.name):
                            info = ZipInfo(target, date)
                            info.external_attr = (0o100000 | member.mode) << 16
                            archive.writestr(info, data, compress_type=ZIP_DEFLATED)
                if git.wait():
                    raise RuntimeError("git archive failed")
            archive.comment = f"Blueprint Modular {version} ({commit})".encode()
        latest = Path(staging) / "blueprint-modules-latest.zip"
        shutil.copyfile(candidate, latest)
        os.replace(candidate, destination / filename)
        os.replace(latest, destination / latest.name)
    print(f"{destination / filename} ({commit})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "frontend/static/downloads")
    build(parser.parse_args().output)
