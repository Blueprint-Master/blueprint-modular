import http.server
import json
import os
from pathlib import Path
import ssl
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from bpm import webhooks


class Receiver(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_POST(self):
        body = self.rfile.read(int(self.headers["Content-Length"]))
        self.server.receipts.append((dict(self.headers), body))
        self.send_response(self.server.response_code)
        self.end_headers()


class Webhooks(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.path = self.root / "events.sqlite"
        self.db = webhooks.open_store(self.path)
        self.addCleanup(self.db.close)
        webhooks.subscribe(self.db, "ERP", "commande.creee")

    def publish(self, id="commande-42"):
        with webhooks.transaction(self.db):
            webhooks.publish(self.db, id, "commande.creee", {"total": 310}, 100)

    def test_tls_receipt_after_503_and_process_restart(self):
        key, cert = self.root / "key.pem", self.root / "cert.pem"
        subprocess.run(["openssl", "req", "-newkey", "rsa:2048", "-x509", "-nodes", "-days", "1",
                        "-subj", "/CN=localhost", "-addext", "subjectAltName=IP:127.0.0.1",
                        "-keyout", str(key), "-out", str(cert)], check=True, capture_output=True)
        secret = "test-fixture-key-used-only-on-loopback"
        with http.server.ThreadingHTTPServer(("127.0.0.1", 0), Receiver) as server:
            server.receipts = []
            server.response_code = 503
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain(cert, key)
            server.socket = context.wrap_socket(server.socket, server_side=True)
            server.daemon_threads = True
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            env = dict(os.environ, SSL_CERT_FILE=str(cert), BPM_HOOK_ERP_SECRET=secret,
                       BPM_HOOK_ERP_URL=f"https://127.0.0.1:{server.server_port}/orders")
            cmd = [sys.executable, "-m", "bpm.webhooks", "--db", str(self.path)]
            try:
                subprocess.run(cmd + ["publish", "commande-42", "commande.creee"], input=b'{"total":310}', env=env, check=True)
                subprocess.run(cmd + ["tick"], env=env, check=True)
                subprocess.run(cmd + ["tick"], env=env, check=True)
                self.assertEqual(len(server.receipts), 1)
                self.db.execute("UPDATE dispatch SET due=0")
                server.response_code = 204
                def run(_):
                    subprocess.run(cmd + ["tick"], env=env, check=True)
                with ThreadPoolExecutor(max_workers=2) as pool:
                    list(pool.map(run, range(2)))
            finally:
                server.shutdown()
                thread.join()
        self.assertEqual(len(server.receipts), 2)
        for headers, payload in server.receipts:
            self.assertEqual(headers["Idempotency-Key"], "commande-42")
            self.assertEqual(json.loads(payload), {"id": "commande-42", "type": "commande.creee", "data": {"total": 310}})
            self.assertTrue(webhooks.verify([secret.encode()], headers["X-Webhook-Timestamp"], payload,
                                            headers["X-Webhook-Signature"], int(time.time())))
        self.assertEqual([r[0] for r in self.db.execute("SELECT http_code FROM attempt ORDER BY rowid")], [503, 204])
        self.assertEqual(self.db.execute("SELECT status FROM dispatch").fetchone()[0], "sent")

    def test_event_transaction_and_republication(self):
        with self.assertRaises(RuntimeError), webhooks.transaction(self.db):
            webhooks.publish(self.db, "commande-42", "commande.creee", {}, 100)
            raise RuntimeError("producer rolled back")
        self.assertEqual(self.db.execute("SELECT count(*) FROM publication").fetchone()[0], 0)
        self.publish()
        self.publish()
        with self.assertRaises(ValueError), webhooks.transaction(self.db):
            webhooks.publish(self.db, "commande-42", "commande.creee", {"total": 500}, 100)
        self.assertEqual(self.db.execute("SELECT count(*) FROM dispatch").fetchone()[0], 1)

    def test_backoff_alert_pause_resume_and_removal(self):
        self.publish()
        times = [100, 160, 460, 2260, 9460]
        for now in times:
            webhooks.tick(self.db, lambda *_: 503, now)
        self.assertEqual(self.db.execute("SELECT reason FROM hook_alert").fetchone()[0], "five_failures")
        self.assertEqual(self.db.execute("SELECT due FROM dispatch").fetchone()[0], times[-1] + 43200)
        webhooks.tick(self.db, lambda *_: self.fail(), 100 + 72 * 3600)
        self.assertEqual(self.db.execute("SELECT paused FROM hook").fetchone()[0], 1)
        webhooks.change(self.db, "ERP", "resume")
        webhooks.tick(self.db, lambda *_: 200, 100 + 72 * 3600 + 1)
        webhooks.change(self.db, "ERP", "pause")
        self.publish("commande-43")
        webhooks.tick(self.db, lambda *_: self.fail(), 200)
        webhooks.change(self.db, "ERP", "delete")
        self.assertEqual(self.db.execute("SELECT status FROM dispatch WHERE event_id='commande-43'").fetchone()[0], "cancelled")

    def test_interrupted_worker_leaves_receipt_and_stable_id(self):
        self.publish()
        with self.assertRaises(KeyboardInterrupt):
            def interrupt(*_):
                raise KeyboardInterrupt
            webhooks.tick(self.db, interrupt, 100)
        webhooks.tick(self.db, lambda *_: self.fail(), 110)
        ids = []
        def accept(_, event_id, body, at):
            ids.append(event_id)
            return 200
        webhooks.tick(self.db, accept, 221)
        self.assertEqual(ids, ["commande-42"])
        self.assertEqual([r[0] for r in self.db.execute("SELECT outcome FROM attempt ORDER BY rowid")], ["interrupted", "accepted"])

    def test_two_active_keys_during_rotation_and_time_window(self):
        sig = webhooks.digest(b"previous", "1000", b"{}")
        self.assertTrue(webhooks.verify([b"current", b"previous"], "1000", b"{}", sig, 1299))
        self.assertFalse(webhooks.verify([b"current", b"previous"], "1000", b"{}", sig, 1301))
