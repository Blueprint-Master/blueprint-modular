"""Exercise the installed Next server against disposable PostgreSQL and an isolated Ollama receiver."""
from datetime import datetime, timezone
from uuid import uuid4
import concurrent.futures
import contextlib
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from playwright.sync_api import expect, sync_playwright
import requests

from module_team_fixture import seed_team, open_task, finish_task, check_audit, clear_team

APP = Path(sys.argv[1]).resolve()
DB = os.environ["MODULAR_TEST_DATABASE_URL"]
EMAIL = f"qa-{secrets.token_hex(8)}@example.test"
PASSWORD = secrets.token_hex(20)
TEXT = "Atelier Saphir"


class Model(BaseHTTPRequestHandler):
    outage = False

    def do_POST(self):
        data = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if self.outage:
            self.send_error(503)
            return
        if self.path == "/api/embeddings":
            answer = {"embedding": [0.5, 0.5]}
        elif self.path == "/api/chat":
            prompt = data["messages"][-1]["content"]
            if "supplier_name" in prompt and TEXT in prompt:
                content = json.dumps({"supplier_name": TEXT, "executive_summary": "Livraison de capteurs."})
            elif '"supplier"' in prompt and TEXT in prompt:
                content = json.dumps({"supplier": TEXT, "summary": "Bon de livraison Saphir."})
            else:
                content = "Réponse de recette Saphir."
            answer = {"message": {"role": "assistant", "content": content}, "done": True}
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.end_headers()
        self.wfile.write(json.dumps(answer).encode())

    def log_message(self, *args):
        pass


def checked(response, status=200):
    assert response.status_code == status, (response.url, response.status_code, response.text[:250])
    return response



def check_assignment_bell(browser, http, origin, *, assigned):
    """Use a fresh device for each account and re-read the persisted receipt."""
    context = browser.new_context(locale="fr-FR")
    try:
        context.add_cookies([{"name": c.name, "value": c.value, "url": origin} for c in http.cookies])
        page = context.new_page()
        page.goto(origin + "/modules/notification")
        bell = page.get_by_role("button", name="Notifications", exact=True)
        # Wait for the authenticated shell and its first GET before opening the panel.
        with page.expect_response(lambda r: "/api/notifications?read=false" in r.url and r.status == 200):
            page.reload()
        bell.click()
        inbox = page.get_by_role("region", name="Boîte de réception · non lues")
        if not assigned:
            expect(inbox.get_by_text("Aucune notification non lue", exact=True)).to_be_visible()
            expect(inbox.get_by_text("Réceptionner un lot", exact=True)).to_have_count(0)
            return
        item = inbox.locator(".notification-item").filter(has_text="Réceptionner un lot")
        expect(item).to_have_count(1)
        item.get_by_role("button", name="Marquer comme lue").click()
        expect(inbox.get_by_text("Aucune notification non lue", exact=True)).to_be_visible()
        read = checked(http.get(origin + "/api/notifications?read=true")).json()["notifications"]
        assert sum(n["message"] == "Réceptionner un lot" and bool(n["readAt"]) for n in read) == 1
        with page.expect_response(lambda r: "/api/notifications?read=false" in r.url and r.status == 200):
            page.reload()
        bell.click()
        expect(inbox.get_by_text("Aucune notification non lue", exact=True)).to_be_visible()
    finally:
        context.close()


def run():
    receiver = ThreadingHTTPServer(("127.0.0.1", 0), Model)
    threading.Thread(target=receiver.serve_forever, daemon=True).start()
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    origin = f"http://127.0.0.1:{port}"
    env = dict(os.environ, DATABASE_URL=DB, NEXTAUTH_SECRET=secrets.token_hex(32), NEXTAUTH_URL=origin,
               HOSTNAME="127.0.0.1", PORT=str(port), AI_SERVER_URL=f"http://127.0.0.1:{receiver.server_port}",
               AI_PROVIDER="ollama", AI_MOCK="false", AI_MAX_RETRIES="0", ANTHROPIC_API_KEY="",
               MODULAR_QA_EMAIL=EMAIL, MODULAR_QA_PASSWORD=PASSWORD)
    env["NO_PROXY"] = "127.0.0.1,localhost"
    seed = Path(__file__).with_name("seed-module-install-fixture.cjs").resolve()
    subprocess.run(["node", str(seed), str(APP)], cwd=APP, env=env, check=True)
    http = requests.Session()
    http.trust_env = False

    @contextlib.contextmanager
    def server():
        process = subprocess.Popen(["node", ".next/standalone/server.js"], cwd=APP, env=env)
        try:
            for attempt in range(100):
                if process.poll() is not None:
                    raise RuntimeError("Standalone exited before startup")
                try:
                    if http.get(origin + "/api/health", timeout=1).ok:
                        break
                except (requests.ConnectionError, requests.Timeout):
                    pass
                time.sleep(0.1)
            else:
                raise RuntimeError("Standalone did not become ready")
            yield
        finally:
            process.terminate()
            process.wait(timeout=20)

    def login(email=EMAIL):
        http.cookies.clear()
        csrf = checked(http.get(origin + "/api/auth/csrf")).json()["csrfToken"]
        checked(http.post(origin + "/api/auth/callback/credentials", data={
            "csrfToken": csrf, "email": email, "password": PASSWORD, "callbackUrl": origin, "json": "true",
        }))
        assert checked(http.get(origin + "/api/auth/session")).json()["user"]["email"] == email

    team = seed_team(APP, env, EMAIL)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=os.environ.get("MODULAR_TEST_CHROMIUM"), args=json.loads(os.environ.get("MODULAR_TEST_CHROMIUM_ARGS", '["--no-sandbox"]')))
            page = browser.new_page()
            page.set_content("<h1>Atelier Saphir</h1><p>Bon de livraison des capteurs.</p>")
            pdf = page.pdf()
            with server():
                checked(http.get(origin + "/api/contracts"), 401)
                login()
                task_id = open_task(http, origin, team)
                def upload_contract(_):
                    with requests.Session() as request:
                        request.trust_env = False
                        return request.post(origin + "/api/contracts", cookies=http.cookies.get_dict(),
                                            files={"file": ("saphir.txt", TEXT + " livre des capteurs.", "text/plain")})
                with concurrent.futures.ThreadPoolExecutor(2) as pool:
                    results = list(pool.map(upload_contract, range(2)))
                assert sorted(r.status_code for r in results) == [200, 409], [(r.status_code,r.text[:160]) for r in results]
                contract = next(r.json() for r in results if r.ok)
                assert contract["status"] == "done" and contract["extractedData"]["supplier_name"] == TEXT
                doc = checked(http.post(origin + "/api/documents", files={"file": ("bordereau.pdf", pdf, "application/pdf")})).json()
                assert doc["analysisStatus"] == "done" and doc["supplier"] == TEXT, doc["analysisStatus"]
                today = datetime.now(timezone.utc).date().isoformat()
                query = {"id": str(uuid4()), "source": "documents", "since": today, "through": today}
                reports_url = origin + "/api/reports"
                report = checked(http.post(reports_url, json=query), 201).json()
                assert report["rows"] == [{"status": "done", "count": 1}], report
                assert checked(http.post(reports_url, json=query)).json() == report
                checked(http.post(reports_url, json={**query, "source": "contracts"}), 409)
                checked(http.post(reports_url, json={**query, "since": "2026-02-30"}), 400)
                dashboard_url = origin + "/api/dashboards/personal"
                widget = {"reportId": report["id"], "display": "total"}
                first = {"revision": 0, "widgets": [widget]}
                def save_layout(_):
                    with requests.Session() as channel:
                        channel.trust_env = False
                        return channel.put(dashboard_url, cookies=http.cookies.get_dict(), json=first).status_code
                with concurrent.futures.ThreadPoolExecutor(2) as pool:
                    assert sorted(pool.map(save_layout, range(2))) == [200, 409]
                checked(http.put(dashboard_url, json={"revision": 1, "widgets": [widget, widget]}), 400)
                contract_url = origin + "/api/contracts/" + contract["id"]
                messages_url = origin + "/api/ai/conversations/"
                stream = checked(http.post(origin + "/api/ai/chat", json={"message": "Question de recette"})).text
                events = [json.loads(line[6:]) for line in stream.splitlines() if line.startswith("data: ")]
                conversation = next(event["discussion_id"] for event in events if event["type"] == "done")
                turns = messages_url + conversation + "/messages"
                Model.outage = True
                checked(http.post(turns, json={"message": "En panne"}), 502)
                assert checked(http.post(contract_url + "/reanalyze")).json()["status"] == "error"
                assert len(checked(http.get(turns)).json()) == 1
            with server():
                http.cookies.clear()
                login()
                check_assignment_bell(browser, http, origin, assigned=False)
                login(team["email"])
                check_assignment_bell(browser, http, origin, assigned=True)
                print("Installed bell: assignee saw task, other account excluded, read receipt survived reload.", flush=True)
                finish_task(http, origin, team, task_id)
                login()
                Model.outage = False
                assert checked(http.post(contract_url + "/reanalyze")).json()["status"] == "done"
                assert checked(http.get(origin + "/api/documents/" + doc["id"])).json()["summary"] == "Bon de livraison Saphir."
                assert checked(http.post(turns, json={"message": "Seconde question"})).json()["aiResponse"] == "Réponse de recette Saphir."
                assert len(checked(http.get(turns)).json()) == 2
                page.context.add_cookies([{"name": c.name, "value": c.value, "url": origin} for c in http.cookies])
                errors = []
                page.on("pageerror", lambda exc: errors.append(str(exc)))
                page.goto(origin + "/modules/contracts/" + contract["id"])
                page.get_by_text("Livraison de capteurs.", exact=True).first.wait_for()
                assert not errors, errors
                checked(http.delete(contract_url))
                checked(http.delete(origin + "/api/documents/" + doc["id"]), 204)
                snapshot = checked(http.get(reports_url + "/" + report["id"])).json()
                assert snapshot == report
                csv = checked(http.get(reports_url + "/" + report["id"], params={"format": "csv"}))
                assert csv.content.decode("utf-8-sig").splitlines() == ["status;count", '"done";1']
                assert checked(http.get(dashboard_url)).json() == {"revision": 1, "widgets": [widget]}
                page.goto(origin + "/modules/tableaux-de-bord/espace")
                page.get_by_role("button", name="Retirer").click()
                page.get_by_role("button", name="Ajouter", exact=True).wait_for()
                assert checked(http.get(dashboard_url)).json() == {"revision": 2, "widgets": []}
                page.goto(origin + "/modules/rapports/espace")
                page.get_by_text("done · 1", exact=True).wait_for()
                page.get_by_role("button", name="Générer le rapport").click()
                page.get_by_text("Aucun enregistrement sur cette période.", exact=True).wait_for()
                assert len(checked(http.get(reports_url)).json()) == 2
                page.goto(origin + "/modules/taches/equipe")
                page.get_by_text("Réceptionner un lot", exact=True).first.wait_for()
                check_audit(http, origin, team, task_id)
                page.goto(origin + "/modules/audit-log/equipe")
                page.get_by_text("Réceptionner un lot", exact=True).first.wait_for()
                checked(http.delete(messages_url + conversation), 204)
            browser.close()
    finally:
        clear_team(APP, env, team)
        receiver.shutdown()
        receiver.server_close()
        subprocess.run(["node", "-e", "const db=new(require('@prisma/client').PrismaClient)();db.user.delete({where:{email:process.env.MODULAR_QA_EMAIL}}).finally(()=>db.$disconnect())"], cwd=APP, env=env, check=True)
    print("Contracts, Documents, AI, Reports, Dashboards, Team Tasks and Audit passed on the installed server across restart.")


if __name__ == "__main__":
    run()
