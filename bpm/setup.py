"""
BPM — Commande bpm setup.
Installe et configure Ollama + modèle par défaut.
"""
from __future__ import annotations
from bpm import ollama as _ollama


def run_setup(model: str = _ollama.DEFAULT_MODEL) -> None:
    print("=" * 50)
    print("  BPM Setup")
    print("=" * 50)

    # 1. Ollama installé ?
    if _ollama.is_installed():
        print("✅ Ollama : installé")
    else:
        print("⏳ Ollama : installation en cours...")
        if not _ollama.install():
            print("❌ Échec. Installez Ollama manuellement : https://ollama.com")
            return
        print("✅ Ollama : installé")

    # 2. Ollama tourne ?
    if _ollama.is_running():
        print("✅ Ollama : service actif")
    else:
        print("⏳ Ollama : démarrage...")
        if not _ollama.start():
            print("❌ Impossible de démarrer Ollama.")
            return
        print("✅ Ollama : service actif")

    # 3. Modèle disponible ?
    if _ollama.has_model(model):
        print(f"✅ Modèle {model} : disponible")
    else:
        print(f"⏳ Modèle {model} : téléchargement...")
        if not _ollama.pull_model(model):
            print(f"❌ Impossible de télécharger {model}.")
            return
        print(f"✅ Modèle {model} : prêt")

    print("=" * 50)
    print("✅ BPM est prêt avec l'IA locale.")
    print(f"   Modèle par défaut : {model}")
    print("   Dans votre app : bpm.chat() ou bpm.ask()")
    print("=" * 50)
