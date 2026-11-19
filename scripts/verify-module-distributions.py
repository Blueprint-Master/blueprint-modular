"""Compare the web ZIP, Python wheel and React tarball delivered to an integrator."""
import argparse
from email.parser import BytesParser
import json
from pathlib import Path
import tarfile
from zipfile import ZipFile


def verify(bundle_path, wheel_path, core_path):
    with ZipFile(bundle_path) as bundle, ZipFile(wheel_path) as wheel, tarfile.open(core_path) as core:
        versions = json.loads(bundle.read("application/lib/generated/versions.json"))
        catalog = json.loads(wheel.read("bpm/manifest.json"))
        assert wheel.read("bpm/manifest.json") == bundle.read("application/bpm/manifest.json")
        assert wheel.read("bpm/integration-reference.md")
        docs = {p.split("/")[1] for p in bundle.namelist() if p.startswith("modules/") and p.endswith("/documentation/page.tsx")}
        assert len(catalog["modules"]) == 32 and set(catalog["modules"]) == docs, docs.symmetric_difference(catalog["modules"])
        assert bundle_path.name == f"blueprint-modules-v{versions['app']}.zip"
        wheel_metadata, = (p for p in wheel.namelist() if p.endswith(".dist-info/METADATA"))
        assert BytesParser().parsebytes(wheel.read(wheel_metadata))["Version"] == versions["python"]
        workers = [p for p in bundle.namelist() if p.startswith("application/bpm/") and p.count("/") == 2 and p.endswith(".py")]
        for worker in workers:
            assert wheel.read(worker.removeprefix("application/")) == bundle.read(worker), worker
        npm = json.load(core.extractfile("package/package.json"))
        assert npm["name"] == "@blueprint-modular/core" and npm["version"] == versions["core"]
        for key, export in npm["exports"].items():
            paths = export.values() if isinstance(export, dict) else [export]
            for path in paths:
                member = core.getmember("package/" + path.removeprefix("./"))
                assert member.isfile() and member.size > 0, (key, path)
        print(f"Matched {len(docs)} modules, {len(workers)} Python sources and {len(npm['exports'])} React exports across release artifacts.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("bundle", "wheel", "core"):
        parser.add_argument(name, type=Path)
    args = parser.parse_args()
    verify(args.bundle, args.wheel, args.core)
