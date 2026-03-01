#!/bin/bash
# Test BPM run sur le VPS — à lancer sur le VPS (ssh ubuntu@IP puis bash ce script)
# Ou copier-coller les commandes ci-dessous après connexion SSH.

set -e
cd ~/blueprint-modular
echo "==> Mise à jour blueprint-modular..."
pipx upgrade blueprint-modular
echo "==> Démarrage bpm run app.py --port 9999 en arrière-plan..."
nohup bpm run app.py --port 9999 > /tmp/bpm-run.log 2>&1 &
BPM_PID=$!
echo "    PID: $BPM_PID"
echo "==> Attente 3 s..."
sleep 3
echo "==> Test GET /api/nodes"
curl -s http://127.0.0.1:9999/api/nodes | head -c 500
echo ""
echo ""
echo "==> Pour arrêter le serveur: kill $BPM_PID"
echo "==> Logs: cat /tmp/bpm-run.log"
