"""
BPM — Serveur de rendu moderne.
Sert le frontend React embarqué (bpm/static/) ou proxifie vers BPM_SERVER_URL.
Expose /api/nodes et /api/action.
"""
from __future__ import annotations

import json
import mimetypes
import os
import runpy
import sys
import threading
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import bpm

# Dossier du build React embarqué
STATIC_DIR = Path(__file__).parent / "static"
SERVER_URL = os.environ.get("BPM_SERVER_URL", "").rstrip("/")


def _run_script(script_path: str) -> list[dict]:
    """Exécute le script utilisateur et retourne les nœuds."""
    bpm.reset_current_nodes()
    script_dir = os.path.abspath(os.path.dirname(script_path))
    if script_dir not in sys.path:
        sys.path.insert(0, script_dir)
    old_cwd = os.getcwd()
    try:
        os.chdir(script_dir)
        runpy.run_path(script_path, run_name="__main__")
        return bpm.get_current_nodes()
    finally:
        os.chdir(old_cwd)
        if script_dir in sys.path:
            sys.path.remove(script_dir)


def _apply_action(action: str, payload: dict) -> None:
    """Applique une action utilisateur dans le session_state."""
    if action == "button_click":
        key = payload.get("key", "")
        bpm.session_state[f"_clicked_{key}"] = True
    elif action == "input_change":
        key = payload.get("key", "")
        bpm.session_state[f"_input_{key}"] = payload.get("value", "")
    elif action == "toggle_change":
        key = payload.get("key", "")
        bpm.session_state[f"_toggle_{key}"] = payload.get("value", False)
    elif action == "select_change":
        key = payload.get("key", "")
        bpm.session_state[f"_select_{key}"] = payload.get("value", "")


def _serve_static(path: str) -> tuple[int, str, bytes]:
    """Sert un fichier statique depuis bpm/static/."""
    # Normalise le chemin
    if path == "/" or path == "":
        path = "/index.html"
    file_path = STATIC_DIR / path.lstrip("/")
    if not file_path.exists() or not file_path.is_file():
        # SPA fallback : index.html pour les routes React
        file_path = STATIC_DIR / "index.html"
    if not file_path.exists():
        return 404, "text/plain", b"Frontend not found. Run: bpm build"
    mime, _ = mimetypes.guess_type(str(file_path))
    return 200, mime or "application/octet-stream", file_path.read_bytes()


def _proxy_request(method: str, path: str, body: bytes | None = None) -> tuple[int, str, bytes]:
    """Proxifie la requête vers BPM_SERVER_URL."""
    url = f"{SERVER_URL}{path}"
    req = urllib.request.Request(url, data=body, method=method)
    if body:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            ct = r.headers.get("Content-Type", "application/json")
            return r.status, ct, r.read()
    except Exception as e:
        return 502, "application/json", json.dumps({"error": str(e)}).encode()


class BPMHandler(BaseHTTPRequestHandler):
    script_path: str = ""

    def _send(self, status: int, content_type: str, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Si BPM_SERVER_URL est défini, on proxifie tout sauf /api
        if SERVER_URL and not path.startswith("/api"):
            status, ct, body = _proxy_request("GET", self.path)
            self._send(status, ct, body)
            return

        # API : nœuds
        if path == "/api/nodes":
            try:
                nodes = _run_script(self.script_path)
                # Extraire le titre de la page depuis page_config
                title = "BPM App"
                for n in nodes:
                    if n["type"] == "page_config":
                        title = n["props"].get("page_title", title)
                # Nettoyer les clics consommés
                for k in [k for k in bpm.session_state if k.startswith("_clicked_")]:
                    del bpm.session_state[k]
                body = json.dumps(
                    {"nodes": nodes, "title": title},
                    default=str,
                    ensure_ascii=False
                ).encode()
                self._send(200, "application/json", body)
            except Exception as e:
                err = json.dumps({"error": repr(e)}).encode()
                self._send(500, "application/json", err)
            return

        # Fichiers statiques (frontend embarqué)
        status, ct, body = _serve_static(path)
        self._send(status, ct, body)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"

        # Si BPM_SERVER_URL, proxifie
        if SERVER_URL and not path.startswith("/api"):
            status, ct, body = _proxy_request("POST", self.path, raw)
            self._send(status, ct, body)
            return

        if path == "/api/action":
            try:
                data = json.loads(raw)
                _apply_action(data.get("action", ""), data.get("payload", {}))
                self._send(200, "application/json", b'{"ok":true}')
            except Exception as e:
                self._send(500, "application/json", json.dumps({"error": str(e)}).encode())
            return

        self._send(404, "application/json", b'{"error":"not found"}')

    def log_message(self, format, *args):
        # Filtre le polling /api/nodes pour ne pas spammer le terminal
        if "/api/nodes" not in (args[0] if args else ""):
            print(f"[BPM] {args[0]}")


def run(script_path: str, port: int = 8501, host: str = "127.0.0.1") -> None:
    """Lance le serveur BPM avec le nouveau frontend React."""
    script_path = os.path.abspath(script_path)
    if not os.path.isfile(script_path):
        print(f"❌ Fichier introuvable : {script_path}", file=sys.stderr)
        sys.exit(1)

    # Vérifie que le frontend est buildé
    if not SERVER_URL and not (STATIC_DIR / "index.html").exists():
        print("⚠️  Frontend non buildé. Lance : cd bpm/frontend && npm run build")
        print("   Fallback sur le rendu HTML basique.")
        # Fallback vers l'ancien serveur
        from bpm.cli import run as legacy_run
        legacy_run(script_path, port=port, host=host)
        return

    BPMHandler.script_path = script_path

    server = ThreadingHTTPServer((host, port), BPMHandler)
    url = f"http://{host}:{port}"

    mode = f"proxy → {SERVER_URL}" if SERVER_URL else "frontend embarqué"
    print(f"\n⚡ BPM — {mode}")
    print(f"   App    : {url}")
    print(f"   Script : {script_path}")
    print(f"   Arrêt  : Ctrl+C\n")

    # Ouvre le navigateur après 1 seconde
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[BPM] Arrêt.")
        server.shutdown()
