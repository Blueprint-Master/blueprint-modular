"""Compare rendered arithmetic gaps and semantic assessments on the installed app."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import tempfile

from playwright.sync_api import sync_playwright


def panel(locale):
    blocks = []
    for kind in ("indicator", "trend", "comparison"):
        for direction in ("lower_is_better", "higher_is_better"):
            for value in (8, 10, 12):
                block = dict(kind=kind, unit="EUR", context=dict(reference=10, direction=direction, neutralBand=0))
                if kind == "indicator":
                    block.update(label="Coût", value=value)
                else:
                    block.update(title="Coût", data=[dict(x="A", y=10), dict(x="B", y=value)])
                blocks.append(block)
    return dict(title="Coût unitaire", locale=locale, blocks=blocks)


def inspect(page, spec, context, baseline):
    nodes = page.locator("section.indicator, figure")
    assert nodes.count() == len(spec["blocks"])
    inversions = 0
    for index, block in enumerate(spec["blocks"]):
        value = block["value"] if block["kind"] == "indicator" else block["data"][-1]["y"]
        delta = value - block["context"]["reference"]
        oriented = -delta if block["context"]["direction"] == "lower_is_better" else delta
        status, symbol = ("neutral", "•") if not oriented else ("favorable", "▲") if oriented > 0 else ("unfavorable", "▼")
        observation = [item for item in context["observations"] if item["block"] == index][-1]
        assert (observation["difference"], observation["assessment"]) == (delta, status)
        node = nodes.nth(index).locator("[aria-label]")
        label = node.get_attribute("aria-label")
        match = re.search(r"([▲▼•]) ([+−])(\d+)\s*(?:EUR|€)? *vs repère", label)
        assert match and match[1] == symbol, label
        if block["kind"] == "indicator":
            assert match[0] in node.inner_text(), label
        displayed = int(match[3]) * (-1 if match[2] == "−" else 1)
        assert displayed == (oriented if baseline else delta), (label, delta)
        inversions += displayed != delta
    return inversions


def verify(app, chrome, baseline):
    binary = app / "public/artifacts"
    cli = ["node", str(binary / "bpm-artifact.cjs")]
    totals = {"offline": 0, "mounted": 0}
    with tempfile.TemporaryDirectory() as folder, sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=chrome)
        source = Path(folder) / "source.json"
        html = Path(folder) / "artifact.html"
        for locale in ("fr-FR", "en-US", "de-DE"):
            spec = panel(locale)
            source.write_text(json.dumps(spec))
            html.write_bytes(subprocess.check_output([*cli, source]))
            page = browser.new_page(offline=True)
            page.goto(html.as_uri())
            totals["offline"] += inspect(page, spec, json.loads(subprocess.check_output([*cli, "--inspect", html])), baseline)
            page.set_content('<div id="root"></div>')
            page.add_script_tag(path=str(binary / "bpm.min.js"))
            page.evaluate("s => {window.view = BlueprintModular.mount(document.querySelector('#root'), s)}", spec)
            page.locator("section.indicator").first.wait_for()
            totals["mounted"] += inspect(page, spec, page.evaluate("view.context()"), baseline)
            page.close()
        browser.close()
    for name, wrong in totals.items():
        assert wrong == (18 if baseline else 0)
        print(f"{name}: {wrong}/18 inverted signs for nonzero lower-is-better gaps, 36/36 controls and 54/54 assessments correct")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("application", type=Path)
    parser.add_argument("--chrome", required=True)
    parser.add_argument("--baseline", action="store_true")
    args = parser.parse_args()
    verify(args.application.resolve(), args.chrome, args.baseline)
