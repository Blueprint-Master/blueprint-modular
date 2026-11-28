"""Observe the order and total of four numeric representations on the installed tarball."""
import argparse
import json
import os
import subprocess
import tarfile
import tempfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("tarball", type=Path)
parser.add_argument("node_modules", type=Path)
parser.add_argument("chromium", type=Path)
parser.add_argument("--baseline", action="store_true", help="Require the old incorrect orders")
args = parser.parse_args()

with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    core = root / "node_modules/@blueprint-modular/core"
    core.mkdir(parents=True)
    with tarfile.open(args.tarball) as archive:
        archive.extractall(core, filter="data")
    for file in (core / "package").iterdir():
        file.rename(core / file.name)
    (root / "entry.jsx").write_bytes(Path(__file__).with_name("table-decimal-sort-consumer.jsx").read_bytes())
    (root / "index.html").write_text(
        '<!doctype html><html lang="fr"><link rel="stylesheet" href="main.css">'
        '<div id="root"></div><script src="main.js"></script></html>'
    )
    modules = args.node_modules.resolve()
    subprocess.run(
        [str(modules / ".bin/esbuild"), "entry.jsx", "--bundle", "--platform=browser",
         "--loader:.png=dataurl", "--loader:.svg=dataurl", "--loader:.woff2=dataurl",
         "--external:react-plotly.js", "--outfile=main.js", "--metafile=meta.json"],
        cwd=root, env=dict(os.environ, NODE_PATH=str(modules)), check=True,
    )
    inputs = json.loads((root / "meta.json").read_bytes())["inputs"]
    for asset in ["dist/index.mjs", "dist/style.css"]:
        assert f"node_modules/@blueprint-modular/core/{asset}" in inputs

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=str(args.chromium.resolve()))
        for width in [390, 1280]:
            for kind in ["decimal", "percentage", "number", "point"]:
                page = browser.new_page(viewport={"width": width, "height": 800}, locale="fr-FR")
                page.goto((root / "index.html").as_uri() + "?type=" + kind)
                rows = page.locator("tbody tr td:first-child")
                expect(rows).to_have_text(list("ABCD"))
                expect(page.locator("tfoot td").last).to_have_text("40,20")
                wrong = args.baseline and kind in {"decimal", "percentage"}
                for direction, expected, historical in [("ascending", "DBCA", "DABC"), ("descending", "ACBD", "ABCD")]:
                    header = page.get_by_role("columnheader", name="Montant")
                    header.click()
                    expect(header).to_have_attribute("aria-sort", direction)
                    order = "".join(rows.all_inner_texts())
                    print(json.dumps(dict(width=width, kind=kind, direction=direction, order=order,
                                          accurate=order == expected)), flush=True)
                    assert order == (historical if wrong else expected)
                page.close()
        browser.close()
