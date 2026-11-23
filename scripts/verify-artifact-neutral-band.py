"""Exercise both artifact readers and both rendered dashboards on a built installation."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import expect, sync_playwright

def run(app, baseline, chrome):
    bundles = app / "public/artifacts"
    # Values, direction and declared tolerance. None means the default 2 %.
    cases = [
        ("wide-high", 105, "higher_is_better", .10, "neutral", "favorable"),
        ("wide-low", 105, "lower_is_better", .10, "neutral", "unfavorable"),
        ("strict-high", 101, "higher_is_better", .005, "favorable", "neutral"),
        ("strict-low", 101, "lower_is_better", 0, "unfavorable", "neutral"),
        ("boundary", 110, "higher_is_better", .10, "neutral", "favorable"),
        ("default-near", 101, "higher_is_better", None, "neutral", "neutral"),
        ("default-far", 97, "lower_is_better", None, "favorable", "favorable"),
    ]
    blocks, wanted, old = [], [], []
    for name, value, direction, band, expected, legacy in cases:
        ctx = {"reference":100, "direction":direction}
        if band is not None:
            ctx["neutralBand"] = band
        blocks.append({"kind":"indicator", "label":name, "value":value, "context":ctx})
        wanted.append(expected)
        old.append(legacy)
    for kind in ("comparison","trend"):
        blocks.append({"kind":kind, "title":kind, "data":[{"x":"A","y":105},{"x":"B","y":115}],
                       "context":{"reference":100,"direction":"higher_is_better","neutralBand":.1}})
        wanted.extend(["neutral","favorable"])
        old.extend(["favorable","favorable"])
    blocks.append({"kind":"indicator","label":"Sans référence","value":100})
    spec = {"title":"Qualification","blocks":blocks}
    observations = {}
    with tempfile.TemporaryDirectory() as tmp, sync_playwright() as pw:
        path = Path(tmp)
        source, html = path / "spec.json", path / "report.html"
        source.write_text(json.dumps(spec))
        cli = ["node", str(bundles / "bpm-artifact.cjs")]
        html.write_bytes(subprocess.check_output([*cli, source]))
        observations["inspect"] = json.loads(subprocess.check_output([*cli,"--inspect",html]))["observations"]
        browser = pw.chromium.launch(executable_path=chrome)
        context = browser.new_context(offline=True)
        page = context.new_page()
        page.goto(html.as_uri())
        def check_screen():
            metrics = page.locator(".bpm-metric")
            expect(metrics).to_have_count(len(cases)+1)
            assert [m.get_attribute("data-judgment") for m in metrics.all()] == [c[4] for c in cases] + [None]
        check_screen()
        page.set_content('<main id="test"></main>')
        page.add_script_tag(path=str(bundles / "bpm.min.js"))
        page.evaluate("spec => {window.view = BlueprintModular.mount(document.querySelector('#test'), spec)}", spec)
        check_screen()
        observations["view.context"] = page.evaluate("view.context().observations")
        browser.close()
    for name, records in observations.items():
        assert len(records) == len(wanted)
        actual = [r["assessment"] for r in records]
        errors = sum(a != b for a,b in zip(actual,wanted))
        print(f"{name}: {errors}/{len(wanted)} incorrect assessments; 7/7 rendered metric judgments correct per rendering.")
        assert actual == (old if baseline else wanted), (name,actual)
    assert observations["inspect"] == observations["view.context"]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("application", type=Path)
    parser.add_argument("--chrome", required=True)
    parser.add_argument("--baseline", action="store_true")
    args = parser.parse_args()
    run(args.application.resolve(),args.baseline,args.chrome)
