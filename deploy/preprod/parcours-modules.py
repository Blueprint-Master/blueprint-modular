"""Parcours métier des 14 modules non couverts par les suites installées, sur la build standalone.

Usage : python parcours-modules.py /chemin/de/l/application/installee

Environnement : DATABASE_URL (base JETABLE de préprod), MODULAR_QA_EMAIL, MODULAR_QA_PASSWORD,
MODULAR_TEST_CHROMIUM (facultatif : sinon le Chromium de Playwright), NEXTAUTH_SECRET (généré si absent).

Pour chaque module : action métier principale (API réelle, worker réel ou navigateur), relecture,
redémarrage du serveur standalone, relecture après redémarrage. Une ligne par module :
  PARCOURS OK: <slug> — <ce qui a été fait> [persistance: oui|non applicable]
  PARCOURS ÉCHEC: <slug> — <raison>
Le script continue après un échec et sort en code 1 si au moins un parcours a échoué.

Le démarrage du serveur et la connexion next-auth reprennent ceux de scripts/verify-modules-install.py
(recopiés : ce fichier vit dans l'outillage, pas dans le dépôt). Aucune donnée n'est supprimée : les
enregistrements créés portent un marqueur aléatoire et restent dans la base jetable.
Aucun appel réseau externe : SMTP et HTTPS sont reçus par des relais locaux montés ici.
"""
from contextlib import contextmanager
from datetime import date, timedelta
from email import message_from_bytes, policy
from hashlib import sha256
import hmac
from http.cookiejar import CookieJar
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import socket
import socketserver
import ssl
import subprocess
import sys
import tempfile
import threading
import time
import traceback
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, quote
from urllib.request import build_opener, HTTPCookieProcessor, ProxyHandler, Request
from uuid import uuid4

APP = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None
MARK = "parcours-" + secrets.token_hex(5)          # marqueur unique de ce run
TMP = Path(tempfile.mkdtemp(prefix="parcours-modules-"))


class Echec(Exception):
    """Écart métier constaté : la raison est imprimée telle quelle."""


def check(condition, message):
    if not condition:
        raise Echec(message)


def free_port():
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


# ---------------------------------------------------------------------------------------------
# HTTP (urllib, sans proxy — même client que verify-modules-install.py, mais sans assertion de
# statut : chaque parcours décide des codes attendus, refus métier compris).
# ---------------------------------------------------------------------------------------------
class Reply:
    def __init__(self, status, headers, body):
        self.status, self.headers, self.body = status, headers, body

    def json(self):
        return json.loads(self.body or b"null")

    def text(self):
        return self.body.decode("utf-8", "replace")


class Client:
    def __init__(self, origin):
        self.origin = origin
        self.jar = CookieJar()
        self.http = build_opener(ProxyHandler({}), HTTPCookieProcessor(self.jar))

    def call(self, method, path, payload=None, form=None):
        headers, data = {}, None
        if payload is not None:
            data, headers["Content-Type"] = json.dumps(payload).encode(), "application/json"
        elif form is not None:
            data, headers["Content-Type"] = urlencode(form).encode(), "application/x-www-form-urlencoded"
        request = Request(self.origin + path, data=data, headers=headers, method=method)
        try:
            with self.http.open(request, timeout=60) as response:
                return Reply(response.status, response.headers, response.read())
        except HTTPError as error:
            return Reply(error.code, error.headers, error.read())

    def expect(self, method, path, statuses, payload=None, what=None):
        statuses = (statuses,) if isinstance(statuses, int) else statuses
        reply = self.call(method, path, payload)
        check(reply.status in statuses, f"{what or method + ' ' + path} : HTTP {reply.status} "
              f"(attendu {'/'.join(map(str, statuses))}) — {reply.text()[:200]}")
        return reply

    def login(self, email, password):
        """Connexion next-auth credentials, comme verify-modules-install.py."""
        self.jar.clear()
        csrf = self.expect("GET", "/api/auth/csrf", 200).json()["csrfToken"]
        self.call("POST", "/api/auth/callback/credentials", form={
            "csrfToken": csrf, "email": email, "password": password,
            "callbackUrl": self.origin + "/modules", "json": "true"})
        session = self.expect("GET", "/api/auth/session", 200).json() or {}
        check((session.get("user") or {}).get("email") == email, f"connexion refusée pour {email}")

    def ensure_session(self, email, password):
        session = self.call("GET", "/api/auth/session").json() or {}
        if (session.get("user") or {}).get("email") != email:
            self.login(email, password)


# ---------------------------------------------------------------------------------------------
# Données de recette : compte QA (créé s'il manque), un administrateur dédié (le compte QA est USER,
# or l'écriture asset-manager est réservée OWNER/ADMIN) et une organisation (réservations et
# tableau blanc exigent l'appartenance). Même technique que scripts/module_team_fixture.py.
# ---------------------------------------------------------------------------------------------
FIXTURE = r"""
const { randomBytes, scryptSync } = require("node:crypto");
const db = new (require("@prisma/client").PrismaClient)();
function hash(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });
  return ["scrypt:32768:8:3", salt.toString("hex"), key.toString("hex")].join(":");
}
(async () => {
  let qa = await db.user.findUnique({ where: { email: process.env.QA_EMAIL } });
  const qaCreated = !qa;
  if (!qa) qa = await db.user.create({ data: { email: process.env.QA_EMAIL,
    credential: { create: { passwordHash: hash(process.env.QA_PASSWORD) } } } });
  const admin = await db.user.create({ data: { email: process.env.ADMIN_EMAIL, name: "Administrateur de parcours",
    role: "ADMIN", credential: { create: { passwordHash: hash(process.env.ADMIN_PASSWORD) } } } });
  const org = await db.organization.create({ data: { name: "Parcours modules " + process.env.ORG_SLUG,
    slug: process.env.ORG_SLUG, members: { create: [{ userId: qa.id, role: "owner" }] } } });
  console.log(JSON.stringify({ qaRole: qa.role, qaCreated, admin: admin.id, organization: org.id }));
})().finally(() => db.$disconnect());
"""


def seed_fixture(env):
    out = subprocess.run(["node", "-e", FIXTURE], cwd=APP, env=env, capture_output=True, text=True, timeout=180)
    if out.returncode != 0:
        raise RuntimeError("données de recette : " + (out.stderr or out.stdout)[-600:])
    return json.loads(out.stdout.strip().splitlines()[-1])


# ---------------------------------------------------------------------------------------------
# Relais locaux pour les workers Python livrés (bpm.scheduled_exports, bpm.webhooks).
# ---------------------------------------------------------------------------------------------
class SmtpRelay(socketserver.ThreadingTCPServer):
    """Relais SMTP minimal en clair sur 127.0.0.1 (mode loopback du worker) : garde les messages reçus."""
    allow_reuse_address = True
    daemon_threads = True

    def __init__(self):
        self.messages = []
        super().__init__(("127.0.0.1", 0), SmtpSession)


class SmtpSession(socketserver.StreamRequestHandler):
    def handle(self):
        def say(line):
            self.wfile.write(line.encode() + b"\r\n")
            self.wfile.flush()
        say("220 relais-parcours ESMTP")
        envelope = {"from": None, "to": []}
        while True:
            line = self.rfile.readline()
            if not line:
                return
            verb = line.decode("ascii", "replace").strip()
            upper = verb.upper()
            if upper.startswith(("EHLO", "HELO")):
                say("250 relais-parcours")
            elif upper.startswith("MAIL FROM:"):
                envelope = {"from": verb[10:].strip(), "to": []}
                say("250 OK")
            elif upper.startswith("RCPT TO:"):
                envelope["to"].append(verb[8:].strip().strip("<>"))
                say("250 OK")
            elif upper == "DATA":
                say("354 fin par <CRLF>.<CRLF>")
                lines = []
                while True:
                    chunk = self.rfile.readline()
                    if not chunk or chunk in (b".\r\n", b".\n"):
                        break
                    lines.append(chunk[1:] if chunk.startswith(b"..") else chunk)
                self.server.messages.append({**envelope, "data": b"".join(lines)})
                say("250 accepté")
            elif upper == "RSET":
                envelope = {"from": None, "to": []}
                say("250 OK")
            elif upper == "NOOP":
                say("250 OK")
            elif upper == "QUIT":
                say("221 au revoir")
                return
            else:
                say("502 non géré")


class HookReceiver(BaseHTTPRequestHandler):
    received = []

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        HookReceiver.received.append({"path": self.path, "headers": dict(self.headers), "body": body})
        self.send_response(200)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, *args):
        pass


def https_receiver():
    """Récepteur HTTPS local à certificat auto-signé (localhost). Le worker lui fait confiance par SSL_CERT_FILE."""
    if not shutil.which("openssl"):
        raise Echec("openssl absent : impossible de monter le récepteur HTTPS local du worker webhooks")
    cert, key = TMP / "hook-cert.pem", TMP / "hook-key.pem"
    made = subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
                           "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost",
                           "-keyout", str(key), "-out", str(cert)], capture_output=True, text=True)
    check(made.returncode == 0, "certificat de test : " + made.stderr[-300:])
    server = ThreadingHTTPServer(("127.0.0.1", 0), HookReceiver)
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(cert, key)
    server.socket = context.wrap_socket(server.socket, server_side=True)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, cert


def worker(module, *args, env=None, stdin=None):
    """Lance un worker Python LIVRÉ dans l'installation (APP/bpm), dans un processus neuf à chaque appel."""
    check((APP / "bpm" / (module + ".py")).is_file(), f"worker bpm.{module} absent de l'installation ({APP / 'bpm'})")
    run = subprocess.run([sys.executable, "-m", "bpm." + module, *args], cwd=TMP, input=stdin,
                         env={**os.environ, **(env or {}), "PYTHONPATH": str(APP)},
                         capture_output=True, text=True, timeout=120)
    check(run.returncode == 0, f"bpm.{module} {args[2] if len(args) > 2 else ''} : code {run.returncode} — "
          f"{(run.stderr or run.stdout).strip()[-300:]}")
    return run.stdout


def rows(output):
    return [json.loads(line) for line in output.splitlines() if line.strip()]


# ---------------------------------------------------------------------------------------------
# Parcours. avant() s'exécute sur le premier serveur, apres() sur le serveur redémarré.
# ---------------------------------------------------------------------------------------------
class Parcours:
    slug = ""
    persistance = "oui"

    def __init__(self, ctx):
        self.ctx = ctx
        self.done = []

    def avant(self):
        pass

    def apres(self):
        pass


class AssetManager(Parcours):
    slug = "asset-manager"

    def avant(self):
        qa, admin = self.ctx["qa"], self.ctx["admin"]
        self.ctx["admin_login"]()
        config = qa.expect("GET", "/api/asset-manager/config/it", 200,
                           what="configuration du domaine « it » (lib/asset-manager/config livré ?)").json()
        check(any(t["id"] == "laptop" for t in config["asset_types"]), "type d'actif « laptop » absent de la config it")
        body = {"domainId": "it", "assetTypeId": "laptop", "label": "Portable " + MARK, "serialNumber": MARK,
                "brand": "Recette", "attributes": [{"key": "ram_go", "valueNumber": 16},
                                                   {"key": "hostname", "valueText": MARK}]}
        if self.ctx["qa_role"] not in ("ADMIN", "OWNER"):
            qa.expect("POST", "/api/asset-manager/assets", 403, body, what="création d'actif par un USER (refus attendu)")
            self.done.append("refus 403 pour un USER")
        asset = admin.expect("POST", "/api/asset-manager/assets", 200, body, what="création d'actif (ADMIN)").json()
        check(asset["reference"] and asset["statusId"] == config["statuses"][0]["id"],
              f"référence ou statut initial inattendu : {asset.get('reference')} / {asset.get('statusId')}")
        changed = admin.expect("PUT", f"/api/asset-manager/assets/{asset['id']}", 200, {
            "statusId": "in_maintenance", "lifecycleStage": "maintenance", "notes": "Passage atelier " + MARK,
            "expectedUpdatedAt": asset["updatedAt"]}, what="mise en maintenance").json()
        check(changed["statusId"] == "in_maintenance", "statut non appliqué")
        admin.expect("PUT", f"/api/asset-manager/assets/{asset['id']}", 409,
                     {"notes": "édition concurrente", "expectedUpdatedAt": asset["updatedAt"]},
                     what="édition sur version périmée (conflit attendu)")
        found = qa.expect("GET", f"/api/asset-manager/assets?domainId=it&search={MARK}", 200).json()
        check([a["id"] for a in found] == [asset["id"]], f"recherche par n° de série : {len(found)} résultat(s)")
        self.asset = asset
        self.done.append(f"actif {asset['reference']} créé (ADMIN), passé en maintenance, conflit 409 sur version "
                         "périmée, retrouvé par recherche")

    def apres(self):
        admin = self.ctx["admin"]
        self.ctx["admin_login"]()
        got = admin.expect("GET", f"/api/asset-manager/assets/{self.asset['id']}", 200).json()
        attrs = {a["key"]: a for a in got["attributes"]}
        check(got["statusId"] == "in_maintenance" and got["lifecycleStage"] == "maintenance"
              and got["reference"] == self.asset["reference"], "statut/cycle de vie perdus après redémarrage")
        check(attrs.get("ram_go", {}).get("valueNumber") == 16 and attrs.get("hostname", {}).get("valueText") == MARK,
              "attributes perdus après redémarrage")
        audit = admin.expect("GET", f"/api/asset-manager/audit-log?resourceType=asset&resourceId={self.asset['id']}",
                             200).json()
        check([e["action"] for e in audit] == ["update", "create"], f"journal d'audit : {[e['action'] for e in audit]}")
        self.done.append("relu après redémarrage avec ses attributs et son journal d'audit (create, update)")


class Commentaires(Parcours):
    slug = "commentaires"

    def avant(self):
        qa = self.ctx["qa"]
        self.article = MARK + "-fil"
        qa.expect("POST", "/api/wiki", 200, {"title": "Fil " + MARK, "slug": self.article,
                                             "content": "Article support du fil de commentaires."})
        base = f"/api/wiki/{self.article}/comments"
        request_id = str(uuid4())
        first = {"content": "Décision " + MARK, "kind": "décision", "requestId": request_id}
        comment = qa.expect("POST", base, 201, first, what="commentaire").json()
        replay = qa.expect("POST", base, 200, first, what="rejeu du même commentaire (idempotence)").json()
        check(replay["id"] == comment["id"], "le rejeu a créé un doublon")
        reply = qa.expect("POST", base, 200, {"content": "Réponse " + MARK, "parentId": comment["id"]}).json()
        qa.expect("PATCH", base, 204, {"id": comment["id"], "revision": 0, "resolved": True}, what="résolution")
        qa.expect("PATCH", base, 409, {"id": comment["id"], "revision": 0, "resolved": False},
                  what="résolution sur révision périmée (conflit attendu)")
        self.ids = (comment["id"], reply["id"])
        self.done.append("commentaire « décision » créé sur un article wiki (rejeu idempotent), réponse en fil, "
                         "résolu, conflit 409 sur révision périmée")

    def apres(self):
        thread = self.ctx["qa"].expect("GET", f"/api/wiki/{self.article}/comments", 200).json()
        by_id = {c["id"]: c for c in thread}
        root, reply = by_id.get(self.ids[0]), by_id.get(self.ids[1])
        check(len(thread) == 2 and root and reply, f"fil relu : {len(thread)} commentaire(s)")
        check(root["resolved"] is True and root["revision"] == 1 and root["kind"] == "décision",
              "état du commentaire perdu après redémarrage")
        check(reply["parentId"] == root["id"], "réponse détachée de son parent")
        self.done.append("fil relu après redémarrage (résolu, révision 1, réponse rattachée) — la page du module "
                         "est une démo statique : la persistance réelle passe par les commentaires du wiki")


class ExportPlanifie(Parcours):
    slug = "export-planifie"

    def avant(self):
        # Worker livré : python -m bpm.scheduled_exports (SQLite), envoi par un relais SMTP local en mode loopback.
        self.db = str(TMP / "exports.sqlite")
        self.report = "ventes-" + MARK.split("-")[1]
        reports = TMP / "rapports"
        reports.mkdir(exist_ok=True)
        (reports / (self.report + ".csv")).write_text("client;montant\n" + MARK + ";1250\n", encoding="utf-8")
        self.recipient = MARK + "@example.test"
        schedule = worker("scheduled_exports", "--db", self.db, "add", self.report, "csv", "daily", "08:00",
                          self.recipient).strip()
        check(re.fullmatch(r"[0-9a-f]{32}", schedule), f"identifiant de planification inattendu : {schedule!r}")
        run_id = worker("scheduled_exports", "--db", self.db, "send", schedule).strip()
        relay = SmtpRelay()
        threading.Thread(target=relay.serve_forever, daemon=True).start()
        try:
            worker("scheduled_exports", "--db", self.db, "tick", "--reports", str(reports), env={
                "BPM_SMTP_HOST": "127.0.0.1", "BPM_SMTP_PORT": str(relay.server_address[1]),
                "BPM_SMTP_FROM": "exports@example.test", "BPM_SMTP_MODE": "loopback"})
        finally:
            relay.shutdown()
            relay.server_close()
        check(len(relay.messages) == 1, f"{len(relay.messages)} message(s) reçu(s) par le relais SMTP local")
        mail = message_from_bytes(relay.messages[0]["data"], policy=policy.default)
        files = [part for part in mail.iter_attachments() if part.get_filename() == self.report + ".csv"]
        check(relay.messages[0]["to"] == [self.recipient] and files and MARK in files[0].get_content(),
              "e-mail reçu sans le bon destinataire ou sans la pièce jointe CSV")
        self.schedule, self.run_id = schedule, run_id
        self.done.append("worker bpm.scheduled_exports : planification quotidienne créée, envoi manuel, rapport CSV "
                         "livré au relais SMTP local avec sa pièce jointe")
        self.browser_check()

    def browser_check(self):
        page, writes = self.ctx["page"]()
        try:
            page.goto(self.ctx["origin"] + "/modules/export-planifie/simulateur", wait_until="networkidle")
            writes.clear()
            report = page.locator(".bpm-selectbox-container").filter(
                has=page.locator("label", has_text=re.compile(r"^\s*Rapport\s*$")))
            report.locator(".bpm-selectbox").click()
            page.locator('.bpm-selectbox-dropdown [role="option"][data-value="qualite"]').click()
            email = "ui-" + self.recipient
            page.get_by_label("Destinataires (séparés par des virgules)").fill(email)
            page.get_by_role("button", name="Planifier l'export", exact=True).click()
            page.get_by_text(email, exact=True).first.wait_for(timeout=10000)
            check(not writes, f"le simulateur a écrit côté serveur : {writes}")
            page.reload(wait_until="networkidle")
            page.get_by_role("button", name="Planifier l'export", exact=True).wait_for()
            check(page.get_by_text(email, exact=True).count() == 0, "planification du simulateur retrouvée après rechargement")
        finally:
            self.ctx["close"](page)
        self.done.append("simulateur web : planification ajoutée au tableau sans aucun appel serveur et perdue au "
                         "rechargement (la page n'est pas reliée au worker)")

    def apres(self):
        history = rows(worker("scheduled_exports", "--db", self.db, "history"))
        mine = [r for r in history if r["run_id"] == self.run_id and r["recipient"] == self.recipient]
        check(len(mine) == 1 and mine[0]["status"] == "sent" and mine[0]["kind"] == "manual",
              f"historique relu : {mine}")
        worker("scheduled_exports", "--db", self.db, "pause", self.schedule)
        listed = {r["id"]: r for r in rows(worker("scheduled_exports", "--db", self.db, "list"))}
        check(listed.get(self.schedule, {}).get("active") == 0, "suspension non conservée")
        self.done.append("relu par un nouveau processus : livraison « sent » à l'historique, suspension conservée "
                         "(persistance = fichier SQLite du worker, pas la base de l'application)")


class KeepScreenOn(Parcours):
    slug = "keep-screen-on"
    persistance = "non applicable"
    # Chromium headless n'a pas d'écran : l'API Wake Lock est remplacée par une doublure qui journalise
    # les appels. On prouve donc que la page demande puis libère le verrou ; pas l'effet sur un écran réel.
    STUB = """(() => {
      const log = window.__wakeLog = [];
      const wakeLock = { request: async (type) => {
        log.push("request:" + type);
        const sentinel = new EventTarget();
        sentinel.type = type; sentinel.released = false;
        sentinel.release = async () => { if (!sentinel.released) { sentinel.released = true; log.push("release");
          sentinel.dispatchEvent(new Event("release")); } };
        return sentinel; } };
      Object.defineProperty(Navigator.prototype, "wakeLock", { configurable: true, get: () => wakeLock });
    })();"""

    def avant(self):
        page, writes = self.ctx["page"]()
        try:
            page.add_init_script(self.STUB)
            page.goto(self.ctx["origin"] + "/modules/keep-screen-on", wait_until="networkidle")
            writes.clear()
            page.get_by_role("button", name="5 min", exact=True).click()
            page.get_by_text(re.compile(r"Écran allumé — reste [45]:\d\d")).wait_for(timeout=10000)
            check(page.evaluate("window.__wakeLog") == ["request:screen"], "verrou d'écran non demandé")
            page.get_by_role("button", name="Éteint", exact=True).click()
            page.get_by_text("Écran non maintenu", exact=True).wait_for(timeout=10000)
            check(page.evaluate("window.__wakeLog") == ["request:screen", "release"], "verrou non libéré")
            check(not writes, f"écriture serveur inattendue : {writes}")
        finally:
            self.ctx["close"](page)
        self.done.append("navigateur : « 5 min » demande le verrou d'écran et affiche le compte à rebours, « Éteint » "
                         "le libère (API Wake Lock doublée, Chromium headless sans écran) — état volatile, "
                         "aucune persistance serveur")


class Monitor(Parcours):
    slug = "monitor"
    persistance = "non applicable"
    KEY = "bpm-monitor-session-v1"

    def avant(self):
        page, writes = self.ctx["page"]()
        try:
            page.goto(self.ctx["origin"] + "/modules/monitor", wait_until="networkidle")
            writes.clear()
            page.get_by_role("button", name="✎ Éditer", exact=True).click()
            page.locator('textarea[rows="10"]').fill("Script de recette " + MARK)
            page.get_by_role("button", name="✓ Valider", exact=True).click()
            page.get_by_text("Script de recette " + MARK).wait_for(timeout=10000)
            page.get_by_role("button", name="Suivante →", exact=True).click()
            page.wait_for_function("k => { try { return JSON.parse(localStorage.getItem(k)).cur === 1 } "
                                   "catch { return false } }", arg=self.KEY, timeout=10000)
            check(not writes, f"écriture serveur inattendue : {writes}")
        finally:
            self.ctx["close"](page)
        self.done.append("navigateur : script de la diapositive 1 édité, passage à la diapositive 2")

    def apres(self):
        page, _ = self.ctx["page"]()
        try:
            page.goto(self.ctx["origin"] + "/modules/monitor", wait_until="networkidle")
            stored = json.loads(page.evaluate("k => localStorage.getItem(k)", self.KEY))
            check(stored["cur"] == 1 and stored["pres"]["slides"][0]["script"] == "Script de recette " + MARK,
                  "session du prompteur perdue")
            page.get_by_role("button", name="← Précédente", exact=True).click()
            page.get_by_text("Script de recette " + MARK).wait_for(timeout=10000)
        finally:
            self.ctx["close"](page)
        self.done.append("après redémarrage du serveur, script et position retrouvés depuis le localStorage du "
                         "navigateur — aucune persistance serveur ; Q&R, traduction et résumé IA dépendent du "
                         "backend Prompteur externe (PROMPTEUR_API_URL), non exercé")


class Newsletter(Parcours):
    slug = "newsletter"

    def avant(self):
        qa = self.ctx["qa"]
        draft = {"title": "Lettre " + MARK, "content": "<p>Édito de recette.</p>", "excerpt": "Résumé " + MARK,
                 "publishedAt": "2026-12-01T08:00:00Z", "requestId": str(uuid4())}
        article = qa.expect("POST", "/api/newsletter/articles", 201, draft, what="création d'article").json()
        again = qa.expect("POST", "/api/newsletter/articles", 200, draft, what="rejeu (idempotence)").json()
        check(again["id"] == article["id"], "le rejeu a créé un doublon")
        qa.expect("POST", "/api/newsletter/articles", 409, {**draft, "title": "Autre"},
                  what="clé de création réutilisée pour un autre contenu (conflit attendu)")
        path = f"/api/newsletter/articles/{article['id']}"
        edited = qa.expect("PUT", path, 200, {"revision": 0, "title": "Lettre " + MARK + " v2"}).json()
        check(edited["revision"] == 1, "révision non incrémentée")
        qa.expect("PUT", path, 409, {"revision": 0, "title": "écrasement"}, what="édition périmée (conflit attendu)")
        archived = qa.expect("PATCH", path + "/archive", 200, {"revision": 1, "archived": True}).json()
        check(archived["archived"] is True, "archivage non appliqué")
        listed = qa.expect("GET", "/api/newsletter/articles?archived=true", 200).json()
        check(article["id"] in [a["id"] for a in listed], "article absent de la liste des archives")
        self.id = article["id"]
        self.done.append("article créé (rejeu idempotent, clé réutilisée refusée), retitré, conflit 409 sur "
                         "révision périmée, archivé")

    def apres(self):
        got = self.ctx["qa"].expect("GET", f"/api/newsletter/articles/{self.id}", 200).json()
        check(got["archived"] is True and got["revision"] == 2 and got["title"] == "Lettre " + MARK + " v2"
              and got["publishedAt"].startswith("2026-12-01T08:00:00"), f"article relu : {got}")
        self.done.append("relu après redémarrage (archivé, révision 2) — CONSTAT : le module ne fait que la "
                         "rédaction ; aucune diffusion ni liste d'abonnés n'existe dans le code")


class Notification(Parcours):
    slug = "notification"

    def avant(self):
        qa = self.ctx["qa"]
        anonymous = Client(self.ctx["origin"])
        anonymous.expect("GET", "/api/notifications", 401, what="boîte sans session (refus attendu)")
        item = qa.expect("POST", "/api/notifications", 201,
                         {"message": "Alerte " + MARK, "type": "warning", "title": "Parcours"}).json()
        unread = qa.expect("GET", "/api/notifications?read=false", 200).json()["notifications"]
        check(item["id"] in [n["id"] for n in unread], "notification absente des non lues")
        qa.expect("PATCH", f"/api/notifications/{item['id']}/read", 200)
        qa.expect("PATCH", f"/api/notifications/{item['id']}/read", 200, what="seconde lecture (idempotente)")
        qa.expect("PATCH", f"/api/notifications/inconnue-{MARK}/read", 404)
        read = {n["id"]: n for n in qa.expect("GET", "/api/notifications?read=true", 200).json()["notifications"]}
        check(read.get(item["id"], {}).get("readAt"), "lecture non enregistrée")
        self.id, self.read_at = item["id"], read[item["id"]]["readAt"]
        self.done.append("notification créée dans la boîte persistante (401 sans session), lue deux fois "
                         "(première lecture seule retenue)")

    def apres(self):
        qa = self.ctx["qa"]
        read = {n["id"]: n for n in qa.expect("GET", "/api/notifications?read=true", 200).json()["notifications"]}
        check(read.get(self.id, {}).get("readAt") == self.read_at and read[self.id]["message"] == "Alerte " + MARK,
              "lecture ou message perdus après redémarrage")
        unread = qa.expect("GET", "/api/notifications?read=false", 200).json()["notifications"]
        check(self.id not in [n["id"] for n in unread], "notification redevenue non lue")
        # Aucun constat sur la cloche ici : ce parcours ne l'observe pas. L'affichage de la
        # boîte serveur dans la cloche est prouvé par le test Chromium de Modular #277.
        self.done.append("relue après redémarrage avec sa date de première lecture (boîte serveur ; "
                         "l'affichage dans la cloche n'est pas observé par ce parcours)")


class Reservations(Parcours):
    slug = "reservation-creneaux"

    def avant(self):
        qa, org = self.ctx["qa"], self.ctx["organization"]
        orgs = qa.expect("GET", "/api/reservations", 200).json()
        check(org in [o["id"] for o in orgs], "organisation de recette absente de la liste")
        day = date.today() + timedelta(days=3)
        while day.weekday() >= 5:
            day += timedelta(days=1)
        self.day = day.isoformat()
        booking = {"organizationId": org, "day": self.day, "room": "colette", "startHour": 10, "duration": 2,
                   "title": "Revue " + MARK}
        self.id = qa.expect("POST", "/api/reservations", 201, booking, what="réservation").json()["id"]
        qa.expect("POST", "/api/reservations", 409, {**booking, "startHour": 11, "duration": 1, "title": "Chevauche"},
                  what="créneau chevauchant (refus attendu)")
        qa.expect("POST", "/api/reservations", 403, {**booking, "organizationId": "hors-" + MARK},
                  what="organisation sans appartenance (refus attendu)")
        self.done.append(f"salle colette réservée le {self.day} 10h-12h, chevauchement 11h refusé (409), "
                         "organisation étrangère refusée (403)")

    def apres(self):
        qa, org = self.ctx["qa"], self.ctx["organization"]
        slots = qa.expect("GET", f"/api/reservations?organizationId={org}&day={self.day}", 200).json()
        mine = [s for s in slots if s["id"] == self.id]
        check(len(mine) == 1 and mine[0]["title"] == "Revue " + MARK and mine[0]["startHour"] == 10
              and mine[0]["duration"] == 2, f"réservation relue : {slots}")
        qa.expect("POST", "/api/reservations", 409, {"organizationId": org, "day": self.day, "room": "colette",
                                                      "startHour": 11, "duration": 1, "title": "Chevauche"},
                  what="chevauchement après redémarrage (refus attendu)")
        self.done.append("relue après redémarrage, le créneau occupé reste refusé")


class Skeleton(Parcours):
    slug = "skeleton"
    persistance = "non applicable"

    def avant(self):
        page, writes = self.ctx["page"]()
        try:
            page.goto(self.ctx["origin"] + "/modules/skeleton/simulateur", wait_until="networkidle")
            busy = page.locator('.bpm-skeleton-container[role="status"][aria-busy="true"]')
            busy.wait_for()
            lines = busy.locator("div.flex.gap-4.py-2")
            check(lines.count() == 5 and lines.first.evaluate("e => e.children.length") == 3,
                  f"assemblage tableau de bord : {lines.count()} lignes")
            writes.clear()
            page.locator(".doc-page .bpm-selectbox").first.click()
            page.locator('.bpm-selectbox-dropdown [role="option"][data-value="list"]').click()
            page.wait_for_function("() => document.querySelector('.bpm-skeleton-container div.flex.gap-4.py-2')"
                                   "?.children.length === 4", timeout=10000)
            check(busy.locator("div.flex.gap-4.py-2").count() == 5, "assemblage liste : nombre de lignes inattendu")
            check(not writes, f"écriture serveur inattendue : {writes}")
        finally:
            self.ctx["close"](page)
        self.done.append("navigateur : squelette « tableau de bord » (5 lignes × 3) puis « liste » (5 lignes × 4) "
                         "rendus en état aria-busy — composant d'affichage, aucune persistance serveur")


class TableauBlanc(Parcours):
    slug = "tableau-blanc"

    def avant(self):
        qa, org = self.ctx["qa"], self.ctx["organization"]
        self.board = f"/api/whiteboards/{org}/retro-{MARK.split('-')[1]}"
        check(qa.expect("GET", self.board, 200).json() == [], "tableau neuf non vide")
        self.note = str(uuid4())
        note = {"id": self.note, "content": "Post-it " + MARK, "column": "bien"}
        qa.expect("POST", self.board, 201, note, what="post-it")
        qa.expect("POST", self.board, 200, note, what="rejeu du post-it (idempotence)")
        qa.expect("POST", self.board, 409, {**note, "content": "autre"}, what="même id, autre contenu (conflit attendu)")
        qa.expect("PATCH", self.board, 204, {"id": self.note, "revision": 0, "column": "action",
                                             "content": "Post-it " + MARK + " → action"}, what="déplacement")
        qa.expect("PATCH", self.board, 409, {"id": self.note, "revision": 0, "column": "ameliorer"},
                  what="déplacement sur révision périmée (conflit attendu)")
        qa.expect("GET", f"/api/whiteboards/hors-{MARK}/retro", 403, what="tableau d'une autre organisation")
        self.done.append("post-it créé (rejeu idempotent), déplacé de « bien » vers « action », conflit 409 "
                         "sur révision périmée, 403 hors organisation")

    def apres(self):
        notes = self.ctx["qa"].expect("GET", self.board, 200).json()
        check(len(notes) == 1 and notes[0]["id"] == self.note and notes[0]["column"] == "action"
              and notes[0]["revision"] == 1 and notes[0]["content"] == "Post-it " + MARK + " → action",
              f"tableau relu : {notes}")
        self.done.append("relu après redémarrage (colonne action, révision 1)")


class Templates(Parcours):
    slug = "templates"
    persistance = "non applicable"

    def avant(self):
        qa = self.ctx["qa"]
        models = qa.expect("GET", "/api/templates?locale=fr", 200).json()
        check(sorted(m["id"] for m in models) == ["email", "fiche", "rapport"], f"modèles : {models}")
        sheet = qa.call("POST", "/api/templates", {"model": "fiche", "name": "Fiche " + MARK, "locale": "fr",
                                                    "fields": {"projet": MARK + " <b>", "chef": "Équipe recette",
                                                               "date_limite": "15/12/2026"}})
        check(sheet.status == 200 and sheet.headers.get("Content-Type", "").startswith("text/html")
              and "Fiche " + MARK in sheet.text() and MARK + " &lt;b&gt;" in sheet.text(),
              f"fiche projet : HTTP {sheet.status} ou contenu non échappé")
        mail = qa.call("POST", "/api/templates", {"model": "email", "name": "Courriel " + MARK, "locale": "fr",
                                                   "fields": {"destinataire": "client@example.test",
                                                              "objet": "Objet " + MARK, "corps": "Bonjour."}})
        eml = message_from_bytes(mail.body, policy=policy.default)
        check(mail.status == 200 and eml["X-Unsent"] == "1" and eml["Subject"] == "Objet " + MARK
              and eml["To"] == "client@example.test", f"brouillon e-mail : HTTP {mail.status}")
        bad = qa.expect("POST", "/api/templates", 400, {"model": "fiche", "name": "x", "locale": "fr", "fields": {
            "projet": "p", "chef": "c", "date_limite": "31/02/2026"}}, what="date impossible (refus attendu)").json()
        check("fields.date_limite" in bad["fields"], f"champ fautif non désigné : {bad}")
        self.done.append("fiche projet HTML générée (champs échappés), brouillon .eml non envoyé (X-Unsent), date "
                         "impossible refusée — génération à la volée, rien n'est stocké ; CONSTAT : la route "
                         "/api/templates ne demande pas de session")


class Webhooks(Parcours):
    slug = "webhooks"

    def avant(self):
        # Worker livré : python -m bpm.webhooks (SQLite) ; livraison HTTPS signée vers un récepteur local.
        self.db = str(TMP / "events.sqlite")
        self.name = "ERP_" + MARK.split("-")[1].upper()
        self.event_id = "commande-" + MARK
        self.secret = secrets.token_hex(24)
        worker("webhooks", "--db", self.db, "subscribe", self.name, "commande.creee")
        worker("webhooks", "--db", self.db, "publish", self.event_id, "commande.creee",
               stdin=json.dumps({"numero": MARK, "montant": 1250}))
        server, cert = https_receiver()
        self.hook_env = {f"BPM_HOOK_{self.name}_URL": f"https://localhost:{server.server_address[1]}/hook",
                         f"BPM_HOOK_{self.name}_SECRET": self.secret, "SSL_CERT_FILE": str(cert)}
        try:
            HookReceiver.received.clear()
            worker("webhooks", "--db", self.db, "tick", env=self.hook_env)
            got = list(HookReceiver.received)
        finally:
            server.shutdown()
            server.server_close()
        check(len(got) == 1, f"{len(got)} livraison(s) reçue(s) par le récepteur HTTPS local")
        headers = {k.lower(): v for k, v in got[0]["headers"].items()}
        body, stamp = got[0]["body"], headers.get("x-webhook-timestamp", "")
        expected = hmac.new(self.secret.encode(), stamp.encode() + b"." + body, sha256).hexdigest()
        check(hmac.compare_digest(expected, headers.get("x-webhook-signature", "")), "signature HMAC invalide")
        check(headers.get("idempotency-key") == self.event_id and json.loads(body)["data"]["numero"] == MARK,
              "clé d'idempotence ou charge utile inattendues")
        self.done.append("worker bpm.webhooks : abonnement, publication, livraison HTTPS signée (HMAC vérifié, "
                         "Idempotency-Key) vers un récepteur local")
        self.browser_check()

    def browser_check(self):
        page, writes = self.ctx["page"]()
        try:
            page.goto(self.ctx["origin"] + "/modules/webhooks/simulateur", wait_until="networkidle")
            writes.clear()
            page.locator(".doc-page .bpm-selectbox").first.click()
            page.locator('.bpm-selectbox-dropdown [role="option"][data-value="facture.payee"]').click()
            url_field = page.get_by_label("URL de destination (https obligatoire)")
            url_field.fill("http://" + MARK + ".example.test/hook")
            page.get_by_role("button", name="Créer le webhook", exact=True).click()
            page.get_by_text("L'URL doit commencer par https://", exact=False).wait_for(timeout=10000)
            url = "https://" + MARK + ".example.test/hook"
            url_field.fill(url)
            page.get_by_role("button", name="Créer le webhook", exact=True).click()
            page.get_by_text(url, exact=True).first.wait_for(timeout=10000)
            check(not writes, f"le simulateur a écrit côté serveur : {writes}")
            page.reload(wait_until="networkidle")
            page.get_by_role("button", name="Créer le webhook", exact=True).wait_for()
            check(page.get_by_text(url, exact=True).count() == 0, "webhook du simulateur retrouvé après rechargement")
        finally:
            self.ctx["close"](page)
        self.done.append("simulateur web : http refusé, webhook https ajouté sans aucun appel serveur et perdu au "
                         "rechargement (la page n'est pas reliée au worker ; « Tester » simule un code HTTP)")

    def apres(self):
        before = rows(worker("webhooks", "--db", self.db, "history"))
        mine = [a for a in before if a["event_id"] == self.event_id]
        check(len(mine) == 1 and mine[0]["outcome"] == "accepted" and mine[0]["http_code"] == 200,
              f"historique relu : {mine}")
        worker("webhooks", "--db", self.db, "tick", env=self.hook_env)   # rien d'échu : aucune relivraison
        check(len(rows(worker("webhooks", "--db", self.db, "history"))) == len(before), "événement relivré")
        listed = [h["name"] for h in rows(worker("webhooks", "--db", self.db, "list"))]
        check(self.name in listed, "abonnement perdu")
        self.done.append("relu par un nouveau processus : tentative « accepted » 200 à l'historique, pas de "
                         "relivraison, abonnement conservé (persistance = fichier SQLite du worker)")


class Wiki(Parcours):
    slug = "wiki"

    def avant(self):
        qa = self.ctx["qa"]
        self.slug_article = MARK + "-procedure"
        first = "Procédure initiale " + MARK
        qa.expect("POST", "/api/wiki", 200, {"title": "Procédure " + MARK, "slug": self.slug_article,
                                             "content": first, "isPublished": True, "tags": ["parcours"]})
        qa.expect("POST", "/api/wiki", 409, {"title": "Doublon", "slug": self.slug_article},
                  what="slug déjà pris (refus attendu)")
        article = qa.expect("GET", f"/api/wiki/{self.slug_article}", 200).json()
        check(article["revision"] == 0 and article["canEdit"] is True, "article relu sans droit d'édition")
        qa.expect("PUT", f"/api/wiki/{self.slug_article}", 200, {"revision": 0, "content": "Procédure révisée " + MARK,
                                                                "changeNote": "parcours"}, what="révision")
        qa.expect("PUT", f"/api/wiki/{self.slug_article}", 409, {"revision": 0, "content": "écrasement"},
                  what="édition sur révision périmée (conflit attendu)")
        found = qa.expect("GET", "/api/wiki?search=" + quote(MARK), 200).json()
        check(self.slug_article in [a["slug"] for a in found], "article introuvable par recherche")
        self.first = first
        self.done.append("article publié, slug en doublon refusé (409), révisé, conflit 409 sur révision "
                         "périmée, retrouvé par recherche plein texte")

    def apres(self):
        qa = self.ctx["qa"]
        article = qa.expect("GET", f"/api/wiki/{self.slug_article}", 200).json()
        check(article["content"] == "Procédure révisée " + MARK and article["revision"] == 1, "révision perdue")
        revisions = qa.expect("GET", f"/api/wiki/{self.slug_article}/revisions", 200).json()
        check(len(revisions) == 1 and revisions[0]["content"] == self.first and revisions[0]["changeNote"] == "parcours",
              f"historique des révisions : {len(revisions)}")
        self.done.append("relu après redémarrage avec sa version précédente dans l'historique (génération et "
                         "recherche sémantique IA non exercées)")


class Workflow(Parcours):
    slug = "workflow"

    def avant(self):
        qa = self.ctx["qa"]
        self.path = f"/api/workflow/entity/{MARK}-demande"
        start = qa.expect("GET", self.path, 200).json()
        check(start["status"] == "brouillon" and start["revision"] == 0, f"état initial : {start}")
        qa.expect("POST", self.path + "/transition", 409, {"revision": 0, "to": "archivé"},
                  what="saut brouillon → archivé (refus attendu)")
        moved = qa.expect("POST", self.path + "/transition", 200, {"revision": 0, "to": "validé"}).json()
        check(moved["status"] == "validé" and moved["revision"] == 1, f"transition : {moved}")
        qa.expect("POST", self.path + "/transition", 409, {"revision": 0, "to": "validé"},
                  what="double validation concurrente (conflit attendu)")
        self.done.append("demande validée (brouillon → validé), saut vers archivé et double validation refusés (409)")

    def apres(self):
        qa = self.ctx["qa"]
        state = qa.expect("GET", self.path, 200).json()
        check(state["status"] == "validé" and state["revision"] == 1 and len(state["history"]) == 1,
              f"état relu : {state}")
        done = qa.expect("POST", self.path + "/transition", 200, {"revision": 1, "to": "archivé"}).json()
        check(done["status"] == "archivé" and [h["to"] for h in done["history"]] == ["validé", "archivé"],
              f"archivage : {done}")
        self.done.append("relu après redémarrage (validé, historique d'audit), puis archivé")


PARCOURS = [AssetManager, Commentaires, ExportPlanifie, KeepScreenOn, Monitor, Newsletter, Notification,
            Reservations, Skeleton, TableauBlanc, Templates, Webhooks, Wiki, Workflow]


# ---------------------------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------------------------
def main():
    if APP is None or not (APP / ".next" / "standalone" / "server.js").is_file():
        sys.exit("usage : parcours-modules.py /chemin/application/installee (avec .next/standalone/server.js)")
    for name in ("DATABASE_URL", "MODULAR_QA_EMAIL", "MODULAR_QA_PASSWORD"):
        if not os.environ.get(name):
            sys.exit(f"variable d'environnement manquante : {name}")
    port = free_port()
    origin = f"http://127.0.0.1:{port}"
    qa_email, qa_password = os.environ["MODULAR_QA_EMAIL"], os.environ["MODULAR_QA_PASSWORD"]
    admin_email, admin_password = f"admin-{MARK}@example.test", secrets.token_hex(20)
    closed = free_port()   # backends IA / Prompteur pointés vers un port fermé : aucun service réel touché
    env = {**os.environ, "HOSTNAME": "127.0.0.1", "PORT": str(port), "NEXTAUTH_URL": origin,
           "NEXTAUTH_SECRET": os.environ.get("NEXTAUTH_SECRET") or secrets.token_hex(32),
           "NODE_ENV": "production", "SKIP_AUTH_FOR_TEST": "false", "AI_MOCK": "false", "ANTHROPIC_API_KEY": "",
           "AI_SERVER_URL": f"http://127.0.0.1:{closed}", "PROMPTEUR_API_URL": f"http://127.0.0.1:{closed}",
           "NO_PROXY": "127.0.0.1,localhost"}
    if env.get("AUTHORIZED_EMAILS"):
        env["AUTHORIZED_EMAILS"] += "," + admin_email
    fixture = seed_fixture({**env, "QA_EMAIL": qa_email, "QA_PASSWORD": qa_password, "ADMIN_EMAIL": admin_email,
                            "ADMIN_PASSWORD": admin_password, "ORG_SLUG": MARK})
    print(f"Marqueur {MARK} — organisation {fixture['organization']}, compte QA {fixture['qaRole']}"
          f"{' (créé)' if fixture['qaCreated'] else ''}, administrateur dédié {admin_email}", flush=True)
    log = (TMP / "serveur.log").open("ab")
    probe = Client(origin)

    @contextmanager
    def server():
        proc = subprocess.Popen(["node", ".next/standalone/server.js"], cwd=APP, env=env, stdout=log, stderr=log)
        try:
            deadline = time.monotonic() + 90
            while True:
                if proc.poll() is not None:
                    raise RuntimeError(f"le serveur standalone s'est arrêté (code {proc.returncode}), journal {log.name}")
                try:
                    reply = probe.call("GET", "/api/health")
                    if reply.status == 200 and reply.json().get("status") == "ok":
                        health = reply.json()
                        revision = APP / "BUILD-REVISION"
                        if revision.is_file():
                            check(health.get("sourceCommit") == revision.read_text().strip(),
                                  "le serveur ne sert pas la révision installée")
                        break
                except (URLError, OSError, ValueError):
                    pass
                if time.monotonic() > deadline:
                    raise RuntimeError(f"le serveur standalone n'a pas démarré en 90 s, journal {log.name}")
                time.sleep(0.3)
            yield
        finally:
            proc.terminate()
            try:
                proc.wait(timeout=20)
            except subprocess.TimeoutExpired:
                proc.kill()

    qa, admin = Client(origin), Client(origin)
    ctx = {"origin": origin, "qa": qa, "admin": admin, "qa_role": fixture["qaRole"],
           "organization": fixture["organization"],
           "admin_login": lambda: admin.ensure_session(admin_email, admin_password)}

    # Navigateur : ouvert une fois, conservé pendant le redémarrage du serveur (même origine, même
    # localStorage). Indisponible => les parcours navigateur échouent en le disant, jamais en vert.
    playwright = browser = context = None
    browser_error = None
    try:
        from playwright.sync_api import sync_playwright
        playwright = sync_playwright().start()
        browser = playwright.chromium.launch(
            executable_path=os.environ.get("MODULAR_TEST_CHROMIUM") or None,
            args=json.loads(os.environ.get("MODULAR_TEST_CHROMIUM_ARGS", '["--no-sandbox"]')))
        context = browser.new_context(viewport={"width": 1440, "height": 900}, locale="fr-FR")
        context.add_cookies([{"name": "bpm-locale", "value": "fr", "url": origin}])
    except Exception as error:  # noqa: BLE001 — rapporté par chaque parcours navigateur
        browser_error = f"navigateur indisponible ({type(error).__name__}: {error})"

    page_errors = {}

    def new_page():
        """Page neuve : journalise les erreurs JavaScript et toute écriture vers /api/ (hors next-auth)."""
        if context is None:
            raise Echec(browser_error)
        page = context.new_page()
        page.set_default_timeout(20000)
        errors, writes = [], []
        page_errors[id(page)] = errors
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.on("request", lambda r: writes.append(r.method + " " + r.url)
                if "/api/" in r.url and "/api/auth/" not in r.url and r.method not in ("GET", "HEAD") else None)
        return page, writes

    def close_page(page):
        errors = page_errors.pop(id(page), [])
        page.close()
        if errors:
            raise Echec("erreur JavaScript dans la page : " + errors[0][:200])
    ctx["page"], ctx["close"] = new_page, close_page

    journeys = [cls(ctx) for cls in PARCOURS]
    verdicts = {}

    def fail(journey, error):
        if journey.slug in verdicts:
            return
        reason = str(error) if isinstance(error, Echec) else f"{type(error).__name__}: {error}"
        if not isinstance(error, Echec):
            traceback.print_exc(file=sys.stderr)
        verdicts[journey.slug] = False
        print(f"PARCOURS ÉCHEC: {journey.slug} — {reason}", flush=True)

    def run_phase(name):
        for journey in journeys:
            if journey.slug in verdicts:
                continue
            try:
                getattr(journey, name)()
            except Exception as error:  # noqa: BLE001 — un parcours en échec n'arrête pas les autres
                fail(journey, error)

    def sessions():
        qa.ensure_session(qa_email, qa_password)
        if context is not None:
            context.add_cookies([{"name": c.name, "value": c.value, "url": origin} for c in qa.jar])

    try:
        for phase in ("avant", "apres"):
            try:
                with server():
                    sessions()
                    run_phase(phase)
            except Exception as error:  # noqa: BLE001 — serveur ou connexion : tous les parcours restants échouent
                for journey in journeys:
                    fail(journey, Echec(f"phase « {phase} » interrompue : {error}"))
    finally:
        for closer in (context, browser):
            try:
                closer and closer.close()
            except Exception:  # noqa: BLE001
                pass
        if playwright:
            playwright.stop()
        log.close()

    for journey in journeys:
        if journey.slug not in verdicts:
            verdicts[journey.slug] = True
            print(f"PARCOURS OK: {journey.slug} — {' ; '.join(journey.done)} [persistance: {journey.persistance}]",
                  flush=True)
    failed = sorted(slug for slug, ok in verdicts.items() if not ok)
    print(f"{len(verdicts) - len(failed)}/{len(verdicts)} parcours OK"
          + (f" — échecs : {', '.join(failed)}" if failed else "") + f" (journal serveur : {log.name})", flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
