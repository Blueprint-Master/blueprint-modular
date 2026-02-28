"""
BPM — Client Ollama.
Gère la détection, l'installation et les appels à Ollama.
"""
from __future__ import annotations

import json
import os
import platform
import shutil
import subprocess
import sys
import urllib.request
from typing import Any, Iterator, Optional


OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("BPM_DEFAULT_MODEL", "llama3.2")


# --- Détection ---

def is_installed() -> bool:
    return shutil.which("ollama") is not None


def is_running() -> bool:
    try:
        urllib.request.urlopen(f"{OLLAMA_HOST}/api/tags", timeout=2)
        return True
    except Exception:
        return False


def list_models() -> list[str]:
    try:
        with urllib.request.urlopen(f"{OLLAMA_HOST}/api/tags", timeout=5) as r:
            data = json.loads(r.read())
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        return []


def has_model(model: str) -> bool:
    models = list_models()
    return any(m.startswith(model.split(":")[0]) for m in models)


# --- Installation ---

def install() -> bool:
    """Installe Ollama selon l'OS. Retourne True si succès."""
    system = platform.system()
    print(f"[BPM] Installation d'Ollama sur {system}...")
    try:
        if system == "Darwin":  # macOS
            subprocess.run(["brew", "install", "ollama"], check=True)
        elif system == "Linux":
            subprocess.run(
                "curl -fsSL https://ollama.com/install.sh | sh",
                shell=True, check=True
            )
        elif system == "Windows":
            print("[BPM] Téléchargement de l'installateur Windows...")
            url = "https://ollama.com/download/OllamaSetup.exe"
            dest = os.path.join(os.environ.get("TEMP", "."), "OllamaSetup.exe")
            urllib.request.urlretrieve(url, dest)
            subprocess.run([dest, "/S"], check=True)
        else:
            print(f"[BPM] OS non supporté : {system}", file=sys.stderr)
            return False
        print("[BPM] Ollama installé.")
        return True
    except Exception as e:
        print(f"[BPM] Échec installation Ollama : {e}", file=sys.stderr)
        return False


def start() -> bool:
    """Démarre le service Ollama en arrière-plan."""
    try:
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        import time
        time.sleep(2)
        return is_running()
    except Exception:
        return False


def pull_model(model: str = DEFAULT_MODEL) -> bool:
    """Télécharge un modèle Ollama."""
    print(f"[BPM] Téléchargement du modèle {model}...")
    try:
        subprocess.run(["ollama", "pull", model], check=True)
        print(f"[BPM] Modèle {model} prêt.")
        return True
    except Exception as e:
        print(f"[BPM] Échec pull {model} : {e}", file=sys.stderr)
        return False


def ensure_ready(model: str = DEFAULT_MODEL) -> bool:
    """Vérifie et prépare Ollama (installe, démarre, pull si nécessaire)."""
    if not is_installed():
        if not install():
            return False
    if not is_running():
        if not start():
            print("[BPM] Impossible de démarrer Ollama.", file=sys.stderr)
            return False
    if not has_model(model):
        if not pull_model(model):
            return False
    return True


# --- Appels ---

def chat(
    messages: list[dict[str, str]],
    model: str = DEFAULT_MODEL,
    stream: bool = False,
) -> str:
    """Envoie des messages à Ollama et retourne la réponse."""
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "stream": False,
    }).encode()
    req = urllib.request.Request(
        f"{OLLAMA_HOST}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read())
        return data["message"]["content"]


def generate(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Génère une réponse à partir d'un prompt simple."""
    return chat([{"role": "user", "content": prompt}], model=model)
