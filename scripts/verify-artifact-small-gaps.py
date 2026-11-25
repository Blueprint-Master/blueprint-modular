"""Read the displayed reference gaps in an installed artifact, offline and mounted."""
import argparse
from decimal import Decimal
import json
from pathlib import Path
import re
import subprocess
import tempfile

from playwright.sync_api import sync_playwright


VALUES = [0.001, -0.001, 1e-100, -1e-100, 0, 1.25, -1.25]
KINDS = ["indicator", "trend", "comparison"]


def spec_for(locale):
    blocks = []
    for kind in KINDS:
        for value in VALUES:
            block = dict(kind=kind, unit="%", context=dict(reference=0, direction="higher_is_better", neutralBand=0))
            if kind == "indicator":
                block.update(label="Taux", value=value)
            else:
                block.update(title="Taux", data=[dict(x="A", y=0), dict(x="B", y=value)])
            blocks.append(block)
    return dict(title="Écarts au repère", locale=locale, blocks=blocks)


def check_reader(payload):
    for index, value in enumerate(VALUES * len(KINDS)):
        observations = [o for o in payload["observations"] if o["block"] == index]
        assert observations[-1]["difference"] == value
        assert observations[-1]["differenceUnit"] == "pt"


def check_render(page, baseline):
    blocks = page.locator("section.indicator, figure")
    expected = VALUES * len(KINDS)
    assert blocks.count() == len(expected)
    erased = 0
    for index, source in enumerate(expected):
        block = blocks.nth(index)
        label = block.locator("[aria-label]").get_attribute("aria-label")
        if index < len(VALUES):
            displayed = block.locator("[aria-label] span").all_text_contents()
            assert any(text in label and "vs repère" in text for text in displayed), (label, displayed)
        match = re.search(r"([+−])([\d,.]+(?:E[+−-]?\d+)?)", label)
        assert match, label
        actual = Decimal(match[2].replace(",", ".").replace("−", "-"))
        if match[1] == "−":
            actual = -actual
        tiny = 0 < abs(source) < 0.005
        assert actual == (0 if baseline and tiny else Decimal(str(source))), (source, label)
        erased += int(source != 0 and actual == 0)
    return erased


def verify(app, chrome, baseline):
    binary = app / "public/artifacts"
    cli = ["node", str(binary / "bpm-artifact.cjs")]
    totals = {"offline": 0, "mounted": 0}
    with tempfile.TemporaryDirectory() as folder, sync_playwright() as pw:
        specfile = Path(folder) / "spec.json"
        report = Path(folder) / "report.html"
        browser = pw.chromium.launch(executable_path=chrome)
        for locale in ("fr-FR", "en-US", "de-DE"):
            spec = spec_for(locale)
            specfile.write_text(json.dumps(spec))
            report.write_bytes(subprocess.check_output([*cli, specfile]))
            check_reader(json.loads(subprocess.check_output([*cli, "--inspect", report])))
            page = browser.new_page(offline=True)
            page.goto(report.as_uri())
            totals["offline"] += check_render(page, baseline)
            page.set_content('<div id="root"></div>')
            page.add_script_tag(path=str(binary / "bpm.min.js"))
            page.evaluate("s => {window.view = BlueprintModular.mount(document.querySelector('#root'),s)}", spec)
            page.locator("section.indicator").first.wait_for()
            totals["mounted"] += check_render(page, baseline)
            check_reader(page.evaluate("view.context()"))
            page.close()
        browser.close()
    for mode, erased in totals.items():
        assert erased == (36 if baseline else 0)
        print(f"{mode}: {erased}/36 nonzero small gaps shown as zero, 27/27 controls preserved")
    print("Both readers: 63/63 exact differences and units each")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("application", type=Path)
    parser.add_argument("--chrome", required=True)
    parser.add_argument("--baseline", action="store_true")
    args = parser.parse_args()
    verify(args.application.resolve(), args.chrome, args.baseline)
