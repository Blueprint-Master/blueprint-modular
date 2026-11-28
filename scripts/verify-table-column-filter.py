"""Exercise the browser consumer of a tarball built from an installed Modular ZIP."""
import argparse
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def probe(browser, bundle, width, baseline):
    page = browser.new_page(viewport={"width": width, "height": 900}, locale="fr-FR")
    try:
        page.route("**/*", lambda route: route.abort())
        page.set_content('<html lang="fr"><body><div id="root"></div></body></html>')
        page.evaluate("(css) => { const style = document.createElement('style'); style.textContent = css; document.head.append(style); }", bundle.with_suffix(".css").read_text())
        page.add_script_tag(path=str(bundle))
        local = page.locator("#local")
        server = page.locator("#server")
        legacy = page.locator("#legacy")
        rows = "tbody tr.bpm-table-tr"

        def opener(view):
            return view.get_by_role("button", name="Filtrer : Statut", exact=True)

        for view in (local, server, legacy):
            expect(view.locator(rows)).to_have_count(3)
            expect(view.locator("tfoot td").last).to_have_text("60")
        header = legacy.get_by_role("columnheader", name="Article")
        header.click()
        expect(header).to_have_attribute("aria-sort", "ascending")
        expect(legacy.locator(rows).first.locator("td").first).to_have_text("A")
        expect(opener(legacy)).to_have_count(0)

        if baseline:
            expect(opener(local)).to_have_count(0)
            expect(opener(server)).to_have_count(0)
            return {"width": width, "usableFilterButtons": 0, "eligible": 2, "sortControl": True}

        def choose_open(view):
            opener(view).click()
            assert view.get_by_role("columnheader", name="Statut").get_attribute("aria-sort") is None
            view.get_by_role("checkbox", name="Ouvert", exact=True).set_checked(True)
            view.get_by_role("checkbox", name="Clos", exact=True).set_checked(False)
            view.get_by_role("button", name="Appliquer", exact=True).click()

        choose_open(local)
        expect(local.locator(rows)).to_have_count(2)
        assert local.locator("tbody td:nth-child(2)").all_inner_texts() == ["Ouvert", "Ouvert"]
        expect(local.locator("tfoot td").last).to_have_text("40")
        expect(local.locator("caption")).to_be_visible()
        opener(local).click()
        local.get_by_role("button", name="Effacer", exact=True).click()
        expect(local.locator(rows)).to_have_count(3)
        expect(local.locator("tfoot td").last).to_have_text("60")
        choose_open(server)
        expect(page.locator("#filters")).to_have_text('{"status":["Ouvert"]}')
        expect(server.locator(rows)).to_have_count(3)
        expect(server.locator("tfoot td").last).to_have_text("60")
        # A draft left unchanged must preserve the current selection (including
        # one on another column) and must never turn today's values into a whitelist.
        for view in (local, server):
            view.get_by_role("button", name="Filtrer : Article", exact=True).click()
            view.get_by_role("button", name="Appliquer", exact=True).click()
        expect(page.locator("#changes")).to_have_text("1")
        expect(page.locator("#filters")).to_have_text('{"status":["Ouvert"]}')
        page.get_by_role("button", name="Recevoir une ligne").click()
        expect(local.locator(rows)).to_have_count(4)
        expect(local.locator("tfoot td").last).to_have_text("65")
        expect(local.locator("caption")).to_have_count(0)
        return {"width": width, "usableFilterButtons": 2,
                "rowsAfterUnchangedDraftAndNewValue": 4, "unchangedControlledCallbacks": 0, "eligible": 2,
                "localRows": [3, 2, 3], "localTotals": [60, 40, 60],
                "controlledRows": 3, "sortControl": True}
    finally:
        page.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bundle", type=Path)
    parser.add_argument("--chrome", required=True)
    parser.add_argument("--baseline", action="store_true")
    args = parser.parse_args()
    with sync_playwright() as driver:
        chromium = driver.chromium.launch(executable_path=args.chrome)
        try:
            print(json.dumps([probe(chromium, args.bundle, w, args.baseline) for w in (390, 1280)]))
        finally:
            chromium.close()
