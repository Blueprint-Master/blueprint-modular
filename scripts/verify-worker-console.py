"""Run against an installed standalone and a disposable, migrated MODULAR_TEST_DATABASE_URL."""
from contextlib import contextmanager
from http.server import ThreadingHTTPServer
import json
import os
from pathlib import Path
import secrets
import socket
from socketserver import ThreadingTCPServer
import ssl
import subprocess
import sys
import tempfile
import threading
import time
from unittest.mock import patch

from playwright.sync_api import expect, sync_playwright

APP = Path(sys.argv[1]).resolve()
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP))
sys.path.insert(0, str(ROOT / "tests/python"))
from test_webhooks import Receiver
from test_scheduled_exports import Mailbox
from bpm import scheduled_exports as exports, webhooks


@contextmanager
def serve(server):
    with server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            yield server
        finally:
            server.shutdown()
            thread.join()


@contextmanager
def app_server(env, request, origin):
    server = subprocess.Popen(["node", ".next/standalone/server.js"], cwd=APP, env=env)
    try:
        for _ in range(160):
            if server.poll() is not None:
                raise RuntimeError("Standalone stopped")
            try:
                if request.get(origin + "/api/health", timeout=1000).ok:
                    break
            except Exception:
                pass
            time.sleep(0.1)
        else:
            raise RuntimeError("Standalone did not start")
        yield
    finally:
        server.terminate()
        server.wait(timeout=15)


def verify(tmp):
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    origin = f"http://127.0.0.1:{port}"
    env = dict(os.environ, DATABASE_URL=os.environ["MODULAR_TEST_DATABASE_URL"],
               NEXTAUTH_URL=origin, NEXTAUTH_SECRET=secrets.token_hex(32), HOSTNAME="127.0.0.1", PORT=str(port),
               MODULAR_QA_EMAIL=f"worker-{secrets.token_hex(8)}@example.test", MODULAR_QA_PASSWORD=secrets.token_hex(24),
               BPM_WEBHOOKS_DB=str(tmp / "hooks.db"), BPM_EXPORTS_DB=str(tmp / "exports.db"), BPM_EXPORT_REPORTS="sales.csv")
    hooks = webhooks.open_store(env["BPM_WEBHOOKS_DB"])
    schedules = exports.open_store(env["BPM_EXPORTS_DB"])
    webhooks.subscribe(hooks, "ERP", "order.ready")
    with webhooks.transaction(hooks):
        webhooks.publish(hooks, "order-42", "order.ready", {}, 100)
    key, cert = tmp / "key.pem", tmp / "cert.pem"
    subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=localhost",
                    "-addext", "subjectAltName=IP:127.0.0.1", "-keyout", str(key), "-out", str(cert)], capture_output=True, check=True)
    receiver = ThreadingHTTPServer(("127.0.0.1", 0), Receiver)
    tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    tls.load_cert_chain(cert, key)
    receiver.socket = tls.wrap_socket(receiver.socket, server_side=True)
    receiver.receipts = []
    receiver.response_code = 503
    subprocess.run(["node", str(ROOT / "scripts/seed-module-install-fixture.cjs"), str(APP)], env=env, cwd=APP, check=True)
    def fixture_user(operation):
        subprocess.run(["node", "-e", "const db=new(require('@prisma/client').PrismaClient)();db.user." +
                        operation + ".finally(()=>db.$disconnect())"], env=env, cwd=APP, check=True)
    try:
        with serve(receiver), serve(ThreadingTCPServer(("127.0.0.1", 0), Mailbox)) as smtp, sync_playwright() as pw:
            smtp.messages = []
            worker_env = dict(BPM_HOOK_ERP_URL=f"https://127.0.0.1:{receiver.server_port}/receive",
                              BPM_HOOK_ERP_SECRET=secrets.token_hex(32), SSL_CERT_FILE=str(cert),
                              BPM_SMTP_FROM="qa@example.test", BPM_SMTP_HOST="127.0.0.1", BPM_SMTP_MODE="loopback",
                              BPM_SMTP_USER="", BPM_SMTP_PORT=str(smtp.server_address[1]))
            browser = pw.chromium.launch(executable_path=os.environ.get("MODULAR_TEST_CHROMIUM"),
                args=json.loads(os.environ.get("MODULAR_TEST_CHROMIUM_ARGS", '["--no-sandbox"]')))
            page = browser.new_page(locale="fr-FR", viewport={"width": 390, "height": 844})
            request = page.context.request
            def operations(module):
                page.goto(origin + "/modules/" + module)
                page.get_by_role("tab", name="Opérations").click()
            with app_server(env, request, origin), patch.dict(os.environ, worker_env):
                api = origin + "/api/module-workers/"
                assert request.get(api+"webhooks").status == 401
                csrf = request.get(origin+"/api/auth/csrf").json()["csrfToken"]
                request.post(origin+"/api/auth/callback/credentials", form={"csrfToken": csrf, "email": env["MODULAR_QA_EMAIL"],
                             "password": env["MODULAR_QA_PASSWORD"], "callbackUrl": origin, "json": "true"})
                assert request.get(api+"webhooks").status == 403
                assert request.post(api+"export-planifie", data={"action": "send"}).status == 403
                fixture_user("update({where:{email:process.env.MODULAR_QA_EMAIL},data:{role:'ADMIN'}})")
                webhooks.tick(hooks, now=100)
                operations("webhooks")
                expect(page.get_by_role("cell", name="503", exact=True)).to_be_visible()
                page.get_by_role("button", name="Suspendre", exact=True).click()
                page.get_by_role("button", name="Reprendre", exact=True).click()
                expect(page.get_by_role("button", name="Suspendre", exact=True)).to_be_visible()
                receiver.response_code = 204
                webhooks.tick(hooks, now=160)
                page.get_by_role("button", name="Actualiser").click()
                expect(page.get_by_role("cell", name="204", exact=True)).to_be_visible()
                assert len(receiver.receipts) == 2
                assert len({headers["Idempotency-Key"] for headers, _ in receiver.receipts}) == 1

                operations("export-planifie")
                page.get_by_label("Destinataires", exact=False).fill("finance@example.test")
                page.get_by_role("button", name="Planifier", exact=True).click()
                expect(page.get_by_text("Planification enregistrée.", exact=True)).to_be_visible()
                expected = b"sales,total\nNovember,310\n"
                (tmp / "sales.csv").write_bytes(expected)
                due, = schedules.execute("SELECT due FROM schedule").fetchone()
                # Advance only the worker clock to the actual due time saved by the browser.
                for _ in range(2):
                    exports.tick(schedules, lambda r, f: exports.report_file(tmp, r, f), exports.smtp_sender(), now=due)
                assert len(smtp.messages) == 1
                message, = smtp.messages
                attachment, = message.iter_attachments()
                assert str(message["To"]) == "finance@example.test" and attachment.get_payload(decode=True) == expected
            with app_server(env, request, origin):
                operations("export-planifie")
                expect(page.get_by_role("cell", name="Accepté par le relais SMTP")).to_be_visible()
                expect(page.get_by_role("cell", name="finance@example.test", exact=True)).to_have_count(2)
                page.get_by_role("button", name="Envoyer maintenant").click()
                expect(page.get_by_role("cell", name="En attente", exact=True)).to_be_visible()
                assert schedules.execute("SELECT count(*) FROM run").fetchone()[0] == 2
            browser.close()
    finally:
        hooks.close()
        schedules.close()
        fixture_user("delete({where:{email:process.env.MODULAR_QA_EMAIL}})")


with tempfile.TemporaryDirectory() as directory:
    verify(Path(directory))
print("Worker screens: 401/403, HTTPS 503 → 204, scheduled SMTP attachment, restart and manual queue passed")
