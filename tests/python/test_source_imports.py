from contextlib import closing, contextmanager
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import os
import socket
import subprocess
import tempfile
from threading import Thread
import unittest
from urllib.request import urlopen

from bpm import source_imports as sources


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'[{"code":"A","quantity":4}]')

    def log_message(self, *args):
        pass


class SourceImports(unittest.TestCase):
    def test_rest_replay_and_failure_preserve_previous_snapshot(self):
        with tempfile.TemporaryDirectory() as directory, HTTPServer(("127.0.0.1", 0), Handler) as server:
            thread = Thread(target=server.handle_request)
            thread.start()
            with urlopen(f"http://127.0.0.1:{server.server_port}/data") as response:
                rows = sources.read_rest(response)
            thread.join()
            path = Path(directory) / "source.db"
            with closing(sources.open_store(path)) as db:
                self.assertEqual(sources.sync(db, "erp", "code", lambda: rows, expected_revision=0), 1)
                with self.assertRaisesRegex(ValueError, "conflict"):
                    sources.sync(db, "erp", "code", lambda: [], expected_revision=0)
                with self.assertRaisesRegex(ValueError, "duplicate"):
                    sources.sync(db, "erp", "code", lambda: rows * 2, expected_revision=1)
            with closing(sources.open_store(path)) as db:
                self.assertEqual(sources.snapshot(db, "erp")["rows"], [{"code": "A", "quantity": 4}])
                self.assertEqual(sources.sync(db, "erp", "code", list, expected_revision=1), 2)
                self.assertEqual(sources.snapshot(db, "erp")["rows"], [])


@unittest.skipUnless(os.environ.get("MODULAR_IMPORT_PROTOCOLS"), "enable installed connector services")
class SourceProtocols(unittest.TestCase):
    def test_sftp_protocol(self):
        import paramiko
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "extrait.csv"
            path.write_text('code,libellé\nA,"Paris, France"\n', encoding="utf-8-sig")
            local, remote = socket.socketpair()
            with local, remote, subprocess.Popen(["/usr/lib/openssh/sftp-server", "-R"], stdin=remote, stdout=remote) as server:
                remote.close()
                with closing(paramiko.SFTPClient(local)) as sftp:
                    self.assertEqual(sources.read_sftp(sftp, str(path)), [{"code": "A", "libellé": "Paris, France"}])
                server.wait(timeout=10)

    def check_sql(self, db, dialect):
        with closing(db), closing(db.cursor()) as cursor:
            cursor.execute("CREATE TEMPORARY TABLE qa_import_rows (id INT, amount DECIMAL(10,2))")
            cursor.execute("INSERT INTO qa_import_rows VALUES (7,2.50)")
            with closing(sources.open_store(":memory:")) as store:
                sources.sync(store, "ledger", "id", lambda: sources.read_table(db, dialect, "qa_import_rows", ["id", "amount"]), expected_revision=0)
                self.assertEqual(sources.snapshot(store, "ledger")["rows"], [{"id": 7, "amount": "2.50"}])

    def test_postgresql(self):
        import psycopg
        self.check_sql(psycopg.connect(os.environ["MODULAR_IMPORT_POSTGRES"]), "postgresql")

    @unittest.skipUnless(os.environ.get("MODULAR_IMPORT_MYSQL_PORT"), "enable MySQL service")
    def test_mysql(self):
        import pymysql
        self.check_sql(pymysql.connect(host="127.0.0.1", port=int(os.environ["MODULAR_IMPORT_MYSQL_PORT"]),
                       user="modular", password=os.environ["MODULAR_IMPORT_MYSQL_PASSWORD"], database="modules_test"), "mysql")
