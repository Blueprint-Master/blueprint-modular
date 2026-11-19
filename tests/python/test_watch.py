from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Barrier, Thread
import unittest

from bpm import watch


class WatchTest(unittest.TestCase):
    def setUp(self):
        self.state = {"code": 200, "body": b"", "etag": '"1"', "tags": [], "barrier": None}
        state = self.state

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                tag = self.headers.get("If-None-Match")
                state["tags"].append(tag)
                if state["barrier"]:
                    state["barrier"].wait(timeout=4)
                if state["code"] != 200:
                    self.send_error(state["code"])
                    return
                self.send_response(304 if tag == state["etag"] else 200)
                self.send_header("ETag", state["etag"])
                self.end_headers()
                if tag != state["etag"]:
                    self.wfile.write(state["body"])

            def log_message(self, *args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        tmp = TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.path = Path(tmp.name) / "watch.sqlite"
        self.db = watch.open_store(self.path)
        self.addCleanup(self.db.close)
        self.url = f"http://127.0.0.1:{server.server_port}/sample"

    def test_feed_identity_errors_and_recovery(self):
        watch.register(self.db, "supplier", "feed", self.url)
        self.state["body"] = b"<rss><channel><item><guid>ABC</guid><title>New</title><link>/abc</link></item></channel></rss>"
        self.assertEqual(watch.collect(self.db, "supplier")["added"], 1)
        self.assertEqual(watch.collect(self.db, "supplier"), {"status": "ok", "added": 0})
        self.assertEqual(self.state["tags"], [None, '"1"'])
        self.state.update(code=503, etag='"2"')
        self.assertEqual(watch.collect(self.db, "supplier")["status"], "error")
        self.state.update(code=200, body=b"<not-a-feed/>")
        self.assertEqual(watch.collect(self.db, "supplier")["status"], "error")
        self.state["body"] = b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>XYZ</id><title>Restored</title><link href="/xyz"/></entry></feed>'
        with closing(watch.open_store(self.path)) as db:
            self.assertEqual(watch.collect(db, "supplier")["added"], 1)
            self.assertEqual(self.state["tags"][-1], '"1"')
            self.assertIsNone(db.execute("SELECT last_error FROM watch_sources").fetchone()[0])
            items = list(db.execute("SELECT title,url FROM watch_items ORDER BY key"))
            self.assertEqual([row[0] for row in items], ["New", "Restored"])
            self.assertTrue(items[-1]["url"].endswith("/xyz"))

    def test_threshold_crossing_and_concurrent_collection(self):
        watch.register(self.db, "stock", "json", self.url, threshold=10)
        self.state.update(body=b'{"value":10}', barrier=Barrier(2))
        def poll(_):
            with closing(watch.open_store(self.path)) as db:
                return watch.collect(db, "stock")["status"]
        with ThreadPoolExecutor(max_workers=2) as workers:
            self.assertCountEqual(workers.map(poll, range(2)), ["ok", "superseded"])
        self.state["barrier"] = None
        for version, value in enumerate([12, 8, 14], start=2):
            self.state.update(etag=str(version), body=json.dumps({"value": value}).encode())
            self.assertEqual(watch.collect(self.db, "stock")["added"], 1)
        self.assertEqual([row[0] for row in self.db.execute("SELECT value FROM watch_alerts ORDER BY id")], ["10", "14"])
        with self.assertRaises(ValueError):
            watch.register(self.db, "stock", "page", self.url)

    def test_page_versions_ignore_script_and_whitespace(self):
        watch.register(self.db, "terms", "page", self.url)
        for version, content, added in [(1,"<h1>Sale terms</h1>",1),(2,"<script>version2</script><h1> Sale   terms</h1>",0),
                                        (3,"<h1>Sale terms revised</h1>",1)]:
            self.state.update(etag=str(version), body=content.encode())
            self.assertEqual(watch.collect(self.db, "terms")["added"], added)
