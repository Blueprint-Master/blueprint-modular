"""Check displayed dates on an installed loopback standalone. Article reads use fixtures."""
import argparse
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

def check(origin, chromium, baseline):
    assert urlsplit(origin).hostname == "127.0.0.1"
    common = dict(content="Texte de recette", excerpt=None, revision=1,
                  createdAt="2026-11-01T12:00:00Z", updatedAt="2026-11-02T12:00:00Z")
    rows = [dict(common, id="absent", title="Numéro témoin", publishedAt=None, archived=True),
            dict(common, id="dated", title="Numéro daté", publishedAt="2026-11-12T12:00:00Z", archived=False)]
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=chromium)
        for locale, missing, archived in [
            ("fr", "Date de publication non renseignée", "Archivé"),
            ("en", "Publication date not specified", "Archived"),
        ]:
            context = browser.new_context(timezone_id="UTC", service_workers="block")
            context.add_cookies([dict(name="bpm-locale", value=locale, url=origin)])
            page = context.new_page()
            def intercept(route):
                path = urlsplit(route.request.url).path
                if path == "/api/newsletter/settings":
                    return route.fulfill(json={"headerImageUrl": None})
                if path == "/api/newsletter/articles":
                    return route.fulfill(json=rows)
                for item in rows:
                    if path == "/api/newsletter/articles/" + item["id"]:
                        return route.fulfill(json=item)
                route.abort()
            page.route("**/api/newsletter/**", intercept)
            page.goto(origin + "/modules/newsletter")
            for item in rows:
                row = page.locator(".newsletter-page tbody tr").filter(has_text=item["title"])
                shown = row.locator("td").nth(1).inner_text()
                if item["archived"]:
                    assert row.locator("td").nth(2).inner_text() == archived
                results.append((locale, "list", item["id"], shown))
            for item in rows:
                page.goto(origin + "/modules/newsletter/" + item["id"])
                page.get_by_role("heading", name=item["title"], exact=True).wait_for()
                header = page.locator(".doc-page-header .doc-description")
                shown = header.evaluate("(p) => Array.from(p.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim()")
                if item["archived"]:
                    assert header.locator("span").inner_text() == archived
                results.append((locale, "detail", item["id"], shown))
            short = "12/11/2026"
            long = {"fr":"12 novembre 2026","en":"12 November 2026"}[locale]
            for lang, surface, item_id, shown in results:
                if lang != locale:
                    continue
                print(lang, surface, item_id, repr(shown), flush=True)
                if item_id == "dated":
                    assert shown == (short if surface == "list" else long), shown
                elif baseline:
                    expected = "01/11/2026" if surface == "list" else {"fr":"1 novembre 2026","en":"1 November 2026"}[locale]
                    assert shown == expected and shown != missing, shown
                else:
                    assert shown == missing, shown
            context.close()
        browser.close()
    assert len(results) == 8
    print("Wrong substituted dates: " + ("4/4" if baseline else "0/4") + "; correct supplied dates: 4/4")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("origin")
    parser.add_argument("chromium")
    parser.add_argument("--baseline", action="store_true")
    args = parser.parse_args()
    check(args.origin, args.chromium, args.baseline)
