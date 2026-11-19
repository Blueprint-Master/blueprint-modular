import email
import email.policy
import os
import smtplib
import socketserver
import subprocess
import sys
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from unittest.mock import patch
from bpm import scheduled_exports as exports


def instant(text):
    return int(datetime.fromisoformat(text).timestamp())


class Mailbox(socketserver.StreamRequestHandler):
    def handle(self):
        self.wfile.write(b"220 local SMTP\r\n")
        while True:
            line = self.rfile.readline(65536)
            if not line:
                return
            verb = line.split(b" ", 1)[0].strip().upper()
            if verb == b"DATA":
                self.wfile.write(b"354 data\r\n")
                lines = []
                while True:
                    part = self.rfile.readline(65536)
                    if part == b".\r\n":
                        break
                    if not part:
                        return
                    lines.append(part[1:] if part.startswith(b"..") else part)
                self.server.messages.append(email.message_from_bytes(b"".join(lines), policy=email.policy.default))
            self.wfile.write(b"250 local\r\n")


class Exports(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.path = self.root / "state.db"
        self.db = exports.open_store(self.path)
        self.addCleanup(lambda: self.db.close())
        self.now = instant("2026-11-19T06:59:00+01:00")
        self.recipients = ["sales@example.test", "finance@example.test"]
        self.schedule = exports.add(self.db, "ventes", "csv", "daily", "07:00", "Europe/Paris", self.recipients, self.now)
        self.source = lambda report, fmt: exports.report_file(self.root, report, fmt)

    def state(self):
        return [row[0] for row in self.db.execute("SELECT status FROM delivery ORDER BY recipient")]

    def test_real_smtp_attachment_concurrent_workers_and_restart(self):
        data = 'Date,Montant\r\n2026-11-19,"12,40"\r\n'.encode()
        (self.root / "ventes.csv").write_bytes(data)
        with socketserver.ThreadingTCPServer(("127.0.0.1", 0), Mailbox) as server:
            server.messages = []
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                with patch.dict(os.environ, {"BPM_SMTP_HOST": "127.0.0.1", "BPM_SMTP_FROM": "modular@example.test",
                                             "BPM_SMTP_PORT": str(server.server_address[1]), "BPM_SMTP_MODE": "loopback",
                                             "BPM_SMTP_USER": ""}):
                    relay = exports.smtp_sender()
                    def worker(now):
                        db = exports.open_store(self.path)
                        try:
                            exports.tick(db, self.source, relay, now)
                        finally:
                            db.close()
                    worker(self.now)
                    self.assertEqual(server.messages, [])
                    with ThreadPoolExecutor(max_workers=2) as pool:
                        list(pool.map(worker, [self.now + 60] * 2))
                    worker(self.now + 90)
            finally:
                server.shutdown()
                thread.join()
        self.assertEqual(self.state(), ["sent", "sent"])
        self.assertEqual({str(m["To"]) for m in server.messages}, set(self.recipients))
        for msg in server.messages:
            part, = msg.iter_attachments()
            self.assertEqual((part.get_filename(), part.get_payload(decode=True)), ("ventes.csv", data))
        self.assertEqual(self.db.execute("SELECT count(*),max(artifact) FROM run").fetchone()[:], (1, None))

    def test_cli_generates_a_fresh_report_from_business_data(self):
        (self.root / "provider_fixture.py").write_text(
            "from pathlib import Path\n"
            "def generate(report, fmt):\n"
            "    assert (report, fmt) == ('ventes', 'csv')\n"
            "    total = sum(int(x) for x in Path(__file__).with_name('sales').read_text().splitlines())\n"
            "    return f'Total\\n{total}\\n'.encode()\n"
        )
        (self.root / "sales").write_text("100\n210\n")
        exports.control(self.db, "pause", self.schedule, self.now)
        exports.control(self.db, "send", self.schedule, self.now)
        cmd = [sys.executable, "-m", "bpm.scheduled_exports", "--db", str(self.path)]
        with socketserver.ThreadingTCPServer(("127.0.0.1", 0), Mailbox) as server:
            server.messages = []
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                env = dict(os.environ, PYTHONPATH=str(self.root) + os.pathsep + os.environ.get("PYTHONPATH", ""),
                           BPM_SMTP_HOST="127.0.0.1", BPM_SMTP_FROM="qa@example.test", BPM_SMTP_MODE="loopback",
                           BPM_SMTP_PORT=str(server.server_address[1]), BPM_SMTP_USER="")
                for _ in range(2):
                    subprocess.run(cmd + ["tick", "--provider", "provider_fixture:generate"], env=env, check=True)
            finally:
                server.shutdown()
                thread.join()
        self.assertEqual(len(server.messages), 2)
        for msg in server.messages:
            part, = msg.iter_attachments()
            self.assertEqual(part.get_payload(decode=True), b"Total\n310\n")
        history = subprocess.check_output(cmd + ["history"]).decode()
        self.assertEqual(history.count('"status": "sent"'), 2)

    def test_unknown_smtp_outcome_stays_for_review_and_keeps_snapshot(self):
        payloads = []
        def deliver(run, report, fmt, recipient, attachment):
            payloads.append(attachment)
            if recipient == self.recipients[1]:
                raise smtplib.SMTPServerDisconnected()
        exports.tick(self.db, lambda *_: b"original", deliver, self.now + 60, limit=1)
        self.db.close()
        self.db = exports.open_store(self.path)
        exports.tick(self.db, lambda *_: b"changed", deliver, self.now + 61)
        self.assertEqual(payloads, [b"original", b"original"])
        self.assertEqual(self.state(), ["uncertain", "sent"])
        exports.tick(self.db, self.source, deliver, self.now + 1800)
        self.assertEqual(len(payloads), 2)
        run = self.db.execute("SELECT id FROM run").fetchone()[0]
        exports.main(["--db", str(self.path), "reconcile", run, self.recipients[1], "sent"])
        self.assertEqual(self.state(), ["sent", "sent"])

    def test_pause_manual_resume_delete_and_recover_missing_source(self):
        exports.control(self.db, "pause", self.schedule, self.now)
        exports.tick(self.db, self.source, lambda *_: self.fail(), self.now + 60)
        self.assertEqual(self.state(), [])
        exports.control(self.db, "send", self.schedule, self.now + 61)
        exports.tick(self.db, self.source, lambda *_: self.fail(), self.now + 61)
        self.assertEqual(self.state(), ["pending", "pending"])
        (self.root / "ventes.csv").write_text("ventes\n310\n")
        calls = []
        exports.tick(self.db, self.source, lambda *args: calls.append(args), self.now + 362)
        self.assertEqual(len(calls), 2)
        exports.control(self.db, "resume", self.schedule, self.now + 362)
        exports.control(self.db, "send", self.schedule, self.now + 363)
        exports.control(self.db, "delete", self.schedule, self.now + 364)
        self.assertEqual(sorted(self.state()), ["cancelled", "cancelled", "sent", "sent"])
        exports.tick(self.db, self.source, lambda *_: self.fail(), self.now + 86400 * 8)

    def test_recovered_worker_marks_interrupted_submission_uncertain(self):
        exports.control(self.db, "pause", self.schedule, self.now)
        run = exports.control(self.db, "send", self.schedule, self.now)
        self.db.execute("UPDATE delivery SET status='sending' WHERE run_id=?", (run,))
        exports.tick(self.db, self.source, lambda *_: self.fail(), self.now + 901)
        self.assertEqual(self.state(), ["uncertain", "uncertain"])

    def test_local_clock_dst_and_calendar(self):
        cases = [
            ("2026-03-28T23:00:00+01:00", "daily", "02:30", "2026-03-29T03:30:00+02:00"),
            ("2026-10-25T01:30:00+02:00", "daily", "02:30", "2026-10-25T02:30:00+02:00"),
            ("2026-10-25T02:35:00+02:00", "daily", "02:30", "2026-10-26T02:30:00+01:00"),
            ("2026-12-31T23:59:00+01:00", "monthly", "06:30", "2027-01-01T06:30:00+01:00"),
            ("2026-11-19T07:01:00+01:00", "weekly", "08:00", "2026-11-23T08:00:00+01:00"),
        ]
        for after, freq, hour, expected in cases:
            self.assertEqual(exports.next_due(instant(after), freq, hour, "Europe/Paris"), instant(expected))

    def test_pdf_pass_through_and_invalid_sources(self):
        path = self.root / "qualite.pdf"
        data = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n"
        path.write_bytes(data)
        self.assertEqual(self.source("qualite", "pdf"), data)
        path.write_bytes(b"not a PDF")
        with self.assertRaises(ValueError):
            self.source("qualite", "pdf")
        (self.root / "ventes.csv").write_bytes(b"H1,H2\nA\n")
        with self.assertRaises(ValueError):
            self.source("ventes", "csv")
