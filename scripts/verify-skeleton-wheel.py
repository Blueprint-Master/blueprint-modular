"""Exercise the installed wheel's six loading layouts in Chromium."""
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
from urllib.request import urlopen
from playwright.sync_api import expect, sync_playwright


def check(chromium=None):
    with tempfile.TemporaryDirectory() as work:
        app = Path(work, "app.py")
        app.write_text("""import bpm
bpm.skeleton_dashboard(metrics=2, rows=3)
bpm.skeleton_list(rows=2, columns=3)
bpm.skeleton_article()
bpm.skeleton_form(fields=4)
bpm.skeleton_detail()
bpm.skeleton_chart()
""", encoding="utf-8")
        with socket.socket() as port_probe:
            port_probe.bind(("127.0.0.1", 0))
            port = port_probe.getsockname()[1]
        url = f"http://127.0.0.1:{port}"
        server = subprocess.Popen([shutil.which("bpm"), "run", str(app), "--port", str(port)], cwd=work)
        try:
            for _ in range(100):
                if server.poll() is not None:
                    raise RuntimeError("The installed server exited during startup")
                try:
                    with urlopen(url + "/api/nodes", timeout=1):
                        break
                except OSError:
                    time.sleep(.1)
            with sync_playwright() as pw:
                browser = pw.chromium.launch(**(chromium or {}))
                page = browser.new_page(viewport={"width": 375, "height": 812}, reduced_motion="reduce")
                page.goto(url, wait_until="domcontentloaded")
                layouts = page.locator(".bpm-skeleton-container")
                expect(layouts).to_have_count(6, timeout=15000)
                for layout in layouts.all():
                    expect(layout).to_have_attribute("role", "status")
                    sizes = layout.locator(".bpm-skeleton").evaluate_all(
                        "(els) => els.map(e => [e.offsetWidth, e.offsetHeight, getComputedStyle(e).animationName])"
                    )
                    assert sizes and all(w > 0 and h > 0 and a == "none" for w, h, a in sizes)
                browser.close()
        finally:
            server.terminate()
            server.wait(timeout=10)


if __name__ == "__main__":
    check()
