"""Compare packaged HTML, the one-script runtime and a connected host in Chromium."""
import json
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

directory = Path(sys.argv[1]).resolve()
spec = json.loads((directory / "spec.json").read_text())
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=os.environ.get("BPM_CHROMIUM"), args=["--no-sandbox"])
    for width in (390, 1280):
        ctx = browser.new_context(viewport={"width": width, "height": 850}, offline=True)
        page = ctx.new_page()
        errors, remote = [], []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("request", lambda req: remote.append(req.url) if req.url.startswith(("http:", "https:")) else None)
        page.goto((directory / "static.html").as_uri())
        expected = page.locator("main").inner_text()
        assert "-1,2 pt" in expected and "Clôturé" in expected
        assert page.locator(".bpm-metric").count() == 3
        assert page.locator(".bpm-line-chart path").count() == 1
        geometry = page.locator(".bpm-line-chart path").get_attribute("d")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.set_content('<meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div>')
        page.add_script_tag(path=str(directory / "bpm.min.js"))
        page.evaluate("s => {window.view = BlueprintModular.mount(document.querySelector('#app'),s)}",spec)
        expect(page.locator(".bpm-badge")).to_have_text("Clôturé")
        assert page.locator("main").inner_text() == expected
        assert page.locator(".bpm-line-chart path").get_attribute("d") == geometry
        summary = page.evaluate("view.context().observations")
        assert summary[1]["difference"] == -1.2 and summary[1]["assessment"] == "unfavorable"
        page.goto((directory / "plot.html").as_uri())
        expect(page.locator(".barlayer .point path")).to_have_count(2)
        assert not errors and not remote, (errors, remote)
        print(f"Offline HTML, one-script runtime and Plotly passed at {width}px.", flush=True)
        ctx.close()

    ctx = browser.new_context()
    page = ctx.new_page()
    # Same-origin HTTP fixture exercises the host adapter through real fetch().
    page.route("https://artifact.test/**", lambda r: r.fulfill(
        content_type="application/json", body=json.dumps(spec)
    ) if r.request.url.endswith("/data") else r.fulfill(content_type="text/html", body='<div id="app"></div>'))
    page.goto("https://artifact.test/")
    page.add_script_tag(path=str(directory / "bpm.min.js"))
    page.evaluate("s => {window.view=BlueprintModular.mount(document.querySelector('#app'),{title:'Initial',blocks:[{kind:'paragraph',text:'…'}]})}", spec)
    assert page.evaluate("view.refresh(async () => (await fetch('/data')).json())")
    expect(page.locator(".bpm-badge")).to_have_text("Clôturé")
    assert page.locator("main").inner_text() == expected
    assert page.evaluate("view.context().observations") == summary
    assert page.evaluate("""async () => {
      let resolve;
      const old = view.refresh(() => new Promise(r => { resolve = r; }));
      const spec = view.context().spec;
      view.update({...spec, title:'Révision'});
      resolve(spec);
      return !(await old) && view.context().spec.title === 'Révision';
    }""")
    browser.close()
    print("Connected HTTP fixture, semantic parity and overlapping updates passed.")
