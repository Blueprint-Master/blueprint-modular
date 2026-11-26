"""Check that changing the unit of a nonzero reference preserves its assessment."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile

from playwright.sync_api import sync_playwright


def panel():
    blocks = []
    for kind in ("indicator", "trend", "comparison"):
        for direction in ("lower_is_better", "higher_is_better"):
            for percent in (-5, 5, -1, 1):
                for unit, reference in (("EUR", 0.20), ("c€", 20)):
                    value = round(reference * (100 + percent) / 100, 4)
                    block = dict(kind=kind, unit=unit, context=dict(reference=reference, direction=direction))
                    if kind == "indicator":
                        block.update(label="Coût unitaire", value=value)
                    else:
                        block.update(title="Coût unitaire", data=[dict(x="Avant", y=reference), dict(x="Après", y=value)])
                    blocks.append(block)
    return dict(title="Coût unitaire", locale="fr-FR", blocks=blocks)


def check(page, context, baseline):
    nodes = page.locator("section.indicator, figure")
    assert nodes.count() == len(context["spec"]["blocks"]) == 48
    inversions = 0
    for index in range(0, 48, 2):
        assessments = []
        for position in (index, index + 1):
            block = context["spec"]["blocks"][position]
            o = [item for item in context["observations"] if item["block"] == position][-1]
            delta = o["value"] - o["reference"]
            # The contract uses ±2% by default. Witness the historic defect for euros only.
            outside = abs(delta / o["reference"]) > 0.02
            favorable = (delta < 0) == (block["context"]["direction"] == "lower_is_better")
            expected = "favorable" if favorable else "unfavorable"
            if not outside or (baseline and position == index):
                expected = "neutral"
            assert o["assessment"] == expected, (block, o, expected)
            symbol = {"neutral": "•", "favorable": "▲", "unfavorable": "▼"}[expected]
            label = nodes.nth(position).locator("[aria-label]")
            assert symbol in label.get_attribute("aria-label")
            if block["kind"] == "indicator":
                assert symbol in label.inner_text()
            assessments.append(o["assessment"])
        inversions += assessments[0] != assessments[1]
    assert inversions == (12 if baseline else 0)
    return inversions


def verify(application, chrome, baseline):
    binary = application / "public/artifacts"
    cli = ["node", str(binary / "bpm-artifact.cjs")]
    with tempfile.TemporaryDirectory() as folder, sync_playwright() as pw:
        path = Path(folder)
        source, html = path / "spec.json", path / "costs.html"
        spec = panel()
        source.write_text(json.dumps(spec))
        html.write_bytes(subprocess.check_output([*cli, source]))
        browser = pw.chromium.launch(executable_path=chrome)
        page = browser.new_page(offline=True)
        page.goto(html.as_uri())
        offline = check(page, json.loads(subprocess.check_output([*cli, "--inspect", html])), baseline)
        page.set_content('<div id="root"></div>')
        page.add_script_tag(path=str(binary / "bpm.min.js"))
        page.evaluate("s => {window.view = BlueprintModular.mount(document.querySelector('#root'), s)}", spec)
        page.locator("section.indicator").first.wait_for()
        mounted = check(page, page.evaluate("view.context()"), baseline)
        browser.close()
    for name, mismatches in (("offline", offline), ("mounted", mounted)):
        print(f"{name}: {mismatches}/12 judgments change units at ±5%, 12/12 neutral controls at ±1%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("application", type=Path)
    parser.add_argument("--chrome", required=True)
    parser.add_argument("--baseline", action="store_true")
    args = parser.parse_args()
    verify(args.application.resolve(), args.chrome, args.baseline)
