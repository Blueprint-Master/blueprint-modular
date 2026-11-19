"""Start the installed standalone distribution and validate its catalogue and session across a restart."""
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from html.parser import HTMLParser
from http.cookiejar import CookieJar
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import build_opener, HTTPCookieProcessor, ProxyHandler, Request
from uuid import uuid4


class Catalogue(HTMLParser):
    def __init__(self):
        super().__init__()
        self.modules = defaultdict(set)
        self.assets = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        target = attrs.get("href", "")
        if tag == "a" and target.startswith("/modules/"):
            self.modules[target.split("/")[2]].add(target)
        if tag == "link" and attrs.get("rel") == "stylesheet" and target.startswith("/_next/static/"):
            self.assets.add(target)


def main(application):
    with socket.socket() as port_selector:
        port_selector.bind(("127.0.0.1", 0))
        port = port_selector.getsockname()[1]
    origin = f"http://127.0.0.1:{port}"
    http = build_opener(ProxyHandler({}), HTTPCookieProcessor(CookieJar()))

    def read(path, *, data=None, mime=None):
        request = Request(origin + path, data=data, headers={"Content-Type": mime} if mime else {})
        with http.open(request, timeout=30) as response:
            assert response.status == 200 or response.status == 201, (path, response.status)
            assert response.geturl() == origin + path, (path, response.geturl())
            return response.read()

    @contextmanager
    def server():
        env = {**os.environ, "HOSTNAME": "127.0.0.1", "PORT": str(port), "NEXTAUTH_URL": origin,
               "NEXTAUTH_SECRET": secret, "NODE_ENV": "production", "SKIP_AUTH_FOR_TEST": "false"}
        proc = subprocess.Popen(["node", ".next/standalone/server.js"], cwd=application, env=env)
        try:
            for _ in range(100):
                if proc.poll() is not None:
                    raise RuntimeError(f"Standalone exited with {proc.returncode}")
                try:
                    health = json.loads(read("/api/health"))
                    assert health["sourceCommit"] == (application / "BUILD-REVISION").read_text().strip()
                    assert health["applicationVersion"] == json.loads((application / "package.json").read_text())["version"]
                    if health["status"] == "ok":
                        break
                except URLError:
                    time.sleep(0.2)
            else:
                raise RuntimeError("Standalone did not start")
            yield
        finally:
            proc.terminate()
            proc.wait(timeout=15)

    secret = uuid4().hex
    record = "installed-" + uuid4().hex
    with server():
        catalogue = Catalogue()
        catalogue.feed(read("/modules").decode())
        assert len(catalogue.modules) == 32, sorted(catalogue.modules)
        assert catalogue.assets, "Catalogue has no CSS"
        for asset in catalogue.assets:
            assert len(read(asset)) > 0, asset

        def check_module(item):
            slug, paths = item
            assert len(paths) == 2 and f"/modules/{slug}/documentation" in paths, (slug, paths)
            for path in paths:
                html = read(path)
                assert b"<!DOCTYPE html>" in html and b"Internal Server Error" not in html, path
            return slug

        with ThreadPoolExecutor(max_workers=3) as pool:
            for slug in pool.map(check_module, sorted(catalogue.modules.items())):
                print(f"Documentation and entry point OK: {slug}", flush=True)

        csrf = json.loads(read("/api/auth/csrf"))["csrfToken"]
        email = os.environ["MODULAR_QA_EMAIL"]
        form = urlencode({"csrfToken": csrf, "email": email, "password": os.environ["MODULAR_QA_PASSWORD"],
                          "callbackUrl": origin + "/modules", "json": "true"}).encode()
        read("/api/auth/callback/credentials", data=form, mime="application/x-www-form-urlencoded")
        assert json.loads(read("/api/auth/session"))["user"]["email"] == email
        event = json.dumps({"title": record, "startAt": "2026-11-19T08:00:00Z", "endAt": "2026-11-19T09:00:00Z"}).encode()
        event_id = json.loads(read("/api/calendar", data=event, mime="application/json"))["id"]
    with server():
        assert json.loads(read("/api/calendar/" + event_id))["title"] == record
        print("Calendar record and authenticated session survived standalone restart")


if __name__ == "__main__":
    main(Path(sys.argv[1]).resolve())
