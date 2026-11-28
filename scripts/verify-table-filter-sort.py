"""Exercise the filtered, numerically sorted table and its totals from one installed tarball."""
import argparse
import hashlib
import json
import os
import subprocess
import tarfile
import tempfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def read_table(page, width, stage, expected_order, expected_amount):
    order = "".join(page.locator("tbody tr td:first-child").all_inner_texts())
    amount = page.locator("tfoot td").last.inner_text()
    return dict(width=width, stage=stage, expected=[expected_order, expected_amount],
                actual=[order, amount], ok=(order, amount) == (expected_order, expected_amount))


def exercise(page, width):
    expect(page.locator("tbody tr")).to_have_count(4)
    sort = page.get_by_role("columnheader", name="TTC")
    menu = page.get_by_role("button", name="Filtrer : Statut", exact=True)
    add = page.get_by_role("button", name="Ajouter une pièce", exact=True)
    rows = [read_table(page, width, "initial", "ABCD", "40,20")]
    sort.click()
    expect(sort).to_have_attribute("aria-sort", "ascending")
    rows.append(read_table(page, width, "ascending", "DBCA", "40,20"))
    available = menu.count() == 1
    rows.append(dict(width=width, stage="filter available", actual=available, ok=available))
    if available:
        menu.click()
        page.get_by_role("checkbox", name="Ouvert", exact=True).set_checked(True)
        page.get_by_role("checkbox", name="Clos", exact=True).set_checked(False)
        page.get_by_role("button", name="Appliquer", exact=True).click()
        rows.append(read_table(page, width, "filtered", "BCA", "37,45"))
        add.click()
        rows.append(read_table(page, width, "new matching row", "BECA", "49,65"))
        menu.click()
        page.get_by_role("button", name="Effacer", exact=True).click()
        rows.append(read_table(page, width, "cleared", "DBECA", "52,40"))
        menu.click()
        page.get_by_role("button", name="Appliquer", exact=True).click()
    else:
        add.click()
    add.click()
    rows.append(read_table(page, width, "new category", "DFBECA", "64,20"))
    sort.click()
    expect(sort).to_have_attribute("aria-sort", "descending")
    rows.append(read_table(page, width, "descending", "ACEBFD", "64,20"))
    return rows


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("tarball", type=Path)
parser.add_argument("dependencies", type=Path)
parser.add_argument("chromium", type=Path)
args = parser.parse_args()
records = []
with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    core = root / "node_modules/@blueprint-modular/core"
    core.mkdir(parents=True)
    with tarfile.open(args.tarball) as archive:
        archive.extractall(core, filter="data")
    for file in (core / "package").iterdir():
        file.rename(core / file.name)
    (core / "package").rmdir()
    (root / "entry.jsx").write_bytes(Path(__file__).with_name("table-filter-sort-consumer.jsx").read_bytes())
    (root / "index.html").write_text(
        '<!doctype html><html lang="fr"><meta charset="utf-8"><link rel="stylesheet" href="main.css">'
        '<div id="root"></div><script src="main.js"></script></html>'
    )
    modules = args.dependencies.resolve()
    subprocess.run(
        [str(modules / ".bin/esbuild"), "entry.jsx", "--bundle", "--platform=browser",
         "--loader:.png=dataurl", "--loader:.svg=dataurl", "--loader:.woff2=dataurl",
         "--external:react-plotly.js", "--outfile=main.js", "--metafile=meta.json"],
        env=dict(os.environ, NODE_PATH=str(modules)), cwd=root, check=True,
    )
    meta = json.loads((root / "meta.json").read_bytes())
    imports = {spec["original"]: spec["path"] for spec in meta["inputs"]["entry.jsx"]["imports"]}
    assets = {"@blueprint-modular/core": "dist/index.mjs", "@blueprint-modular/core/style.css": "dist/style.css"}
    for spec, path in assets.items():
        assert imports[spec] == "node_modules/@blueprint-modular/core/" + path
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=str(args.chromium.resolve()))
        for width in (390, 1280):
            page = browser.new_page(viewport={"width": width, "height": 900}, locale="fr-FR")
            page.goto((root / "index.html").as_uri())
            records.extend(exercise(page, width))
            page.close()
        browser.close()

print(json.dumps(dict(sha256=hashlib.sha256(args.tarball.read_bytes()).hexdigest(), artifact=args.tarball.name,
                      imports=list(assets.values()), passed=sum(row["ok"] for row in records),
                      checked=len(records), records=records), ensure_ascii=False, indent=2))
raise SystemExit(0 if len(records) == 16 and all(row["ok"] for row in records) else 1)
