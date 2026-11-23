"""Verify chart numbers on an installed Modular archive, in both renderers and readers."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile

from playwright.sync_api import expect, sync_playwright


POINTS = [
    ("small-positive", 0.00042),
    ("small-negative", -0.00037),
    ("quote-A", 1.2344),
    ("quote-B", 1.23449),
    ("trace", 0.0000001),
    ("zero", 0),
    ("ordinary", 12.5),
    ("grouped", 1234.5),
]
EXACT = ["0.00042", "-0.00037", "1.2344", "1.23449", "0.0000001", "0", "12.5", "1234.5"]
LEGACY = ["0", "-0", "1.234", "1.234", "0", "0", "12.5", "1234.5"]


def localize(values, locale):
    decimal, group = {"en-US": (".", ","), "fr-FR": (",", "\u202f"), "de-DE": (",", ".")}[locale]
    return [v.replace(".", decimal).replace("1234", "1" + group + "234") if v == "1234.5"
            else v.replace(".", decimal) for v in values]


def verify(application, chrome, baseline):
    bundles = application / "public/artifacts"
    cli = ["node", str(bundles / "bpm-artifact.cjs")]
    data = [{"x": name, "y": value} for name, value in POINTS]
    numeric = [value for _, value in POINTS] * 2
    errors = {"offline": 0, "mounted": 0}
    rows = 0
    with tempfile.TemporaryDirectory() as work, sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chrome)
        for locale in ("fr-FR", "en-US", "de-DE"):
            spec = {"title": "Mesures", "locale": locale, "blocks": [
                {"kind": k, "title": k, "data": data, "context": {"reference": 1, "direction": "higher_is_better"}}
                for k in ("trend", "comparison")
            ]}
            source, output = Path(work) / "spec.json", Path(work) / "report.html"
            source.write_text(json.dumps(spec))
            output.write_bytes(subprocess.check_output([*cli, source]))
            inspected = json.loads(subprocess.check_output([*cli, "--inspect", output]))
            assert [o["value"] for o in inspected["observations"]] == numeric
            page = browser.new_page(offline=True)
            page.goto(output.as_uri())
            for mode in errors:
                if mode == "mounted":
                    page.set_content('<main id="target"></main>')
                    page.add_script_tag(path=str(bundles / "bpm.min.js"))
                    page.evaluate("s => {window.view = BlueprintModular.mount(document.querySelector('#target'), s)}", spec)
                values = page.locator("figure dd")
                expect(values).to_have_count(len(numeric))
                assert page.locator("figure dt").all_text_contents() == [k for k, _ in POINTS] * 2
                actual = values.all_text_contents()
                exact = localize(EXACT, locale) * 2
                errors[mode] += sum(a != b for a, b in zip(actual, exact))
                assert actual == (localize(LEGACY, locale) * 2 if baseline else exact), (mode, locale, actual)
            assert page.evaluate("view.context().observations.map(o => o.value)") == numeric
            rows += len(numeric)
            page.close()
        browser.close()
    for mode, count in errors.items():
        print(f"{mode}: {count}/{rows} labels differ from the source quantity")
        assert count == (30 if baseline else 0)
    print(f"Both readers returned {rows}/{rows} exact observations.")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("application", type=Path)
    p.add_argument("--chrome", required=True)
    p.add_argument("--baseline", action="store_true")
    args = p.parse_args()
    verify(args.application.resolve(), args.chrome, args.baseline)
