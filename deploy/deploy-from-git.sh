#!/bin/bash
# Déploiement depuis le repo Git (à exécuter sur le serveur)
# Usage: ./deploy/deploy-from-git.sh
# Prérequis: git installé. Pour la 1ère fois: clone dans REPO_DIR puis lancer ce script.
#
# Déploie DEUX racines :
# - Site vitrine (blueprint-modular.com) → /var/www/blueprint-modular
# - Documentation (docs.blueprint-modular.com) → /var/www/blueprint-modular-docs

set -e

REPO_URL="https://github.com/remigit55/blueprint-modular.git"
REPO_DIR="${REPO_DIR:-/home/ubuntu/blueprint-modular}"
STATIC="$REPO_DIR/frontend/static"

VITRINE_DIR="/var/www/blueprint-modular"
DOCS_DIR="/var/www/blueprint-modular-docs"

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

# --- Site vitrine (landing uniquement) ---
echo "--> Vitrine → $VITRINE_DIR"
sudo mkdir -p "$VITRINE_DIR"
sudo cp "$STATIC/index.html" "$VITRINE_DIR/"
sudo cp "$STATIC/landing.css" "$VITRINE_DIR/"
sudo cp "$STATIC/favicon.ico" "$VITRINE_DIR/" 2>/dev/null || true
sudo cp -r "$STATIC/img" "$VITRINE_DIR/" 2>/dev/null || true

# --- Documentation (tout le contenu doc) ---
echo "--> Documentation → $DOCS_DIR"
sudo mkdir -p "$DOCS_DIR"
# Hub doc : index (accueil de la doc) + docs.html (liens existants)
sudo cp "$STATIC/docs.html" "$DOCS_DIR/index.html"
sudo cp "$STATIC/docs.html" "$DOCS_DIR/docs.html"
sudo cp "$STATIC/doc.css" "$DOCS_DIR/"
sudo cp "$STATIC/components.html" "$DOCS_DIR/"
sudo cp "$STATIC/reference.html" "$DOCS_DIR/"
sudo cp "$STATIC/cheat-sheet.html" "$DOCS_DIR/"
sudo cp "$STATIC/favicon.ico" "$DOCS_DIR/" 2>/dev/null || true
sudo cp -r "$STATIC/img" "$DOCS_DIR/" 2>/dev/null || true
sudo cp -r "$STATIC/get-started" "$DOCS_DIR/"
sudo cp -r "$STATIC/api-reference" "$DOCS_DIR/"
sudo cp -r "$STATIC/deploy" "$DOCS_DIR/"
sudo cp -r "$STATIC/knowledge-base" "$DOCS_DIR/"

# Droits
echo "--> Droits (ubuntu:ubuntu)..."
sudo chown -R ubuntu:ubuntu "$VITRINE_DIR"
sudo chown -R ubuntu:ubuntu "$DOCS_DIR"

echo "✅ Déploiement terminé."
echo "   Vitrine:    $VITRINE_DIR (blueprint-modular.com)"
echo "   Documentation: $DOCS_DIR (docs.blueprint-modular.com)"
echo "   Pour Nginx: sudo cp $REPO_DIR/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular"
echo "   Puis:       sudo nginx -t && sudo systemctl reload nginx"
