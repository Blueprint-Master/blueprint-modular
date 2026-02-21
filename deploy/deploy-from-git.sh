#!/bin/bash
# Déploiement depuis le repo Git (à exécuter sur le serveur)
# Usage: ./deploy/deploy-from-git.sh
# Prérequis: git installé. Pour la 1ère fois: clone dans REPO_DIR puis lancer ce script.

set -e

REPO_URL="https://github.com/remigit55/blueprint-modular.git"
REPO_DIR="${REPO_DIR:-/home/ubuntu/blueprint-modular}"
WWW_DIR="/var/www/blueprint-modular"

echo "==> Déploiement Blueprint Modular depuis Git"

# Clone ou pull
if [ -d "$REPO_DIR/.git" ]; then
  echo "--> Mise à jour du repo dans $REPO_DIR..."
  cd "$REPO_DIR"
  git pull
else
  echo "--> Clonage du repo dans $REPO_DIR..."
  mkdir -p "$(dirname "$REPO_DIR")"
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

# Copie des fichiers statiques vers /var/www/blueprint-modular
echo "--> Copie des fichiers vers $WWW_DIR..."
sudo mkdir -p "$WWW_DIR"
sudo cp -r frontend/static/* "$WWW_DIR/"
if [ -f "Logo BPM.png" ]; then
  sudo cp "Logo BPM.png" "$WWW_DIR/"
fi
# Fichiers à la racine du site (index, doc.css, etc. sont déjà dans frontend/static)
# Dossiers get-started, api-reference, deploy, knowledge-base sont copiés par le -r ci-dessus

echo "--> Droits (ubuntu:ubuntu)..."
sudo chown -R ubuntu:ubuntu "$WWW_DIR"

echo "✅ Déploiement terminé. Site servi depuis $WWW_DIR"
echo "   Pour mettre à jour Nginx avec la config du repo:"
echo "   sudo cp $REPO_DIR/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular"
echo "   sudo nginx -t && sudo systemctl reload nginx"
