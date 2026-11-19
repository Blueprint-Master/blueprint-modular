import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from bpm import scheduled_exports as exports, webhooks
from bpm.worker_console import command, snapshot


class ConsoleTest(unittest.TestCase):
    def test_worker_and_ui_share_schedules_receipts_and_request_identity(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "exports.sqlite"
            db = exports.open_store(path)
            self.addCleanup(db.close)
            add = dict(action="add", requestId="schedule-request", file="sales.csv", hour="08:00",
                       zone="Europe/Paris", frequency="daily", recipients=["team@example.test"])

            def submit(data):
                conn = exports.open_store(path)
                try:
                    return command(conn, "export-planifie", data, ["sales.csv"], 200)
                finally:
                    conn.close()

            with ThreadPoolExecutor(2) as pool:
                first, again = pool.map(submit, [add, add])
                self.assertEqual(first, again)
                send = dict(action="send", requestId="manual-request", id=first["id"])
                self.assertEqual(list(pool.map(submit, [send, send])), [{"id": "manual-request"}] * 2)
            with self.assertRaises(ValueError):
                submit(dict(add, hour="09:00"))
            with self.assertRaises(ValueError):
                submit(dict(add, requestId="other-request", file="other.csv"))
            deliveries = []
            exports.tick(db, lambda *_: b"amount\n12\n", lambda *args: deliveries.append(args), now=200)
            result = snapshot(db, "export-planifie")
            self.assertEqual((len(result["items"]), len(deliveries), len(result["history"])), (1, 1, 1))
            self.assertEqual(result["history"][0]["status"], "sent")

    def test_history_reports_next_retry_and_outcome_without_payload(self):
        db = webhooks.open_store(":memory:")
        self.addCleanup(db.close)
        webhooks.subscribe(db, "ERP", "order.ready")
        with webhooks.transaction(db):
            webhooks.publish(db, "order-1", "order.ready", {"customer": "private"}, 100)
        webhooks.tick(db, lambda *_: 503, now=100)
        result = snapshot(db, "webhooks")
        self.assertEqual(result["history"][0]["retry"], 160)
        self.assertNotIn("private", str(result))
        command(db, "webhooks", {"action": "pause", "id": "ERP"}, [], 120)
        self.assertIsNone(snapshot(db, "webhooks")["history"][0]["retry"])
        command(db, "webhooks", {"action": "resume", "id": "ERP"}, [], 155)
        webhooks.tick(db, lambda *_: 204, now=160)
        history = snapshot(db, "webhooks")["history"]
        self.assertEqual([(r["http_code"], r["retry"]) for r in history], [(204, None), (503, None)])
