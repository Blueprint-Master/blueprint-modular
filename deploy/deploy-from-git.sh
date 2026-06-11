#!/bin/bash
# Déploiement depuis le repo Git (à exécuter sur le serveur)
# Usage: ./deploy/deploy-from-git.sh
# Prérequis: git installé. Pour la 1ère fois: clone dans REPO_DIR puis lancer ce script.
#
# Déploie :
# - Site vitrine (blueprint-modular.com) → /var/www/blueprint-modular
# - Documentation (docs.blueprint-modular.com) → /var/www/blueprint-modular-docs
# - App Next.js (Wiki, modules, sandbox) → app.blueprint-modular.com via PM2

set -e
set -o pipefail

REPO_URL="https://github.com/remigit55/blueprint-modular.git"
REPO_DIR="${REPO_DIR:-/home/ubuntu/blueprint-modular}"
STATIC="$REPO_DIR/frontend/static"

VITRINE_DIR="/var/www/blueprint-modular"
DOCS_DIR="/var/www/blueprint-modular-docs"
APP_PM2_NAME="blueprint-app"

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

# --- Nettoyage puis déploiement (évite anciennes versions / fichiers obsolètes) ---
sudo mkdir -p "$VITRINE_DIR" "$DOCS_DIR"
echo "--> Nettoyage des répertoires cibles..."
sudo find "$VITRINE_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
sudo find "$DOCS_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true

# --- Site vitrine (landing + page Modules) ---
echo "--> Vitrine → $VITRINE_DIR"
sudo cp -f "$STATIC/index.html" "$VITRINE_DIR/"
sudo cp -f "$STATIC/landing.css" "$VITRINE_DIR/"
sudo cp -f "$STATIC/doc.css" "$VITRINE_DIR/"
sudo cp -f "$STATIC/modules.html" "$VITRINE_DIR/"
sudo cp -f "$STATIC/favicon.ico" "$VITRINE_DIR/" 2>/dev/null || true
sudo cp -f "$STATIC/manifest.json" "$VITRINE_DIR/" 2>/dev/null || true
sudo cp -f "$STATIC/doc.js" "$VITRINE_DIR/" 2>/dev/null || true
sudo cp -rf "$STATIC/img" "$VITRINE_DIR/" 2>/dev/null || true
sudo cp -rf "$STATIC/js" "$VITRINE_DIR/" 2>/dev/null || true
sudo cp -rf "$STATIC/modules" "$VITRINE_DIR/"
sudo cp -f "$REPO_DIR/public/llms.txt" "$VITRINE_DIR/" 2>/dev/null || true
sudo cp -f "$REPO_DIR/public/llms-core.txt" "$VITRINE_DIR/" 2>/dev/null || true

# --- Documentation (tout le contenu doc) ---
echo "--> Documentation → $DOCS_DIR"
# Hub doc : index (accueil de la doc) + docs.html (liens existants)
sudo cp -f "$STATIC/docs.html" "$DOCS_DIR/index.html"
sudo cp -f "$STATIC/docs.html" "$DOCS_DIR/docs.html"
sudo cp -f "$STATIC/doc.css" "$DOCS_DIR/"
sudo cp -f "$STATIC/doc.js" "$DOCS_DIR/"
sudo cp -f "$STATIC/components.html" "$DOCS_DIR/"
sudo cp -f "$STATIC/reference.html" "$DOCS_DIR/"
sudo cp -f "$STATIC/cheat-sheet.html" "$DOCS_DIR/"
sudo cp -f "$STATIC/modules.html" "$DOCS_DIR/"
sudo cp -f "$STATIC/versions.html" "$DOCS_DIR/"
sudo cp -f "$STATIC/favicon.ico" "$DOCS_DIR/" 2>/dev/null || true
sudo cp -rf "$STATIC/img" "$DOCS_DIR/" 2>/dev/null || true
sudo cp -rf "$STATIC/js" "$DOCS_DIR/" 2>/dev/null || true
sudo cp -rf "$STATIC/i18n" "$DOCS_DIR/" 2>/dev/null || true
sudo cp -rf "$STATIC/modules" "$DOCS_DIR/"
sudo cp -rf "$STATIC/get-started" "$DOCS_DIR/"
sudo cp -rf "$STATIC/api-reference" "$DOCS_DIR/"
sudo cp -rf "$STATIC/deploy" "$DOCS_DIR/"
sudo cp -rf "$STATIC/knowledge-base" "$DOCS_DIR/"
if [ -d "$STATIC/downloads" ]; then
  sudo cp -rf "$STATIC/downloads" "$DOCS_DIR/"
fi

# Droits (lecture par le serveur web www-data/nginx)
echo "--> Droits (ubuntu:ubuntu)..."
sudo chown -R ubuntu:ubuntu "$VITRINE_DIR"
sudo chown -R ubuntu:ubuntu "$DOCS_DIR"
if [ -d "$VITRINE_DIR/img" ]; then
  sudo chmod 755 "$VITRINE_DIR/img"
  sudo chmod 644 "$VITRINE_DIR/img"/* 2>/dev/null || true
fi
if [ -d "$DOCS_DIR/img" ]; then
  sudo chmod 755 "$DOCS_DIR/img"
  sudo chmod 644 "$DOCS_DIR/img"/* 2>/dev/null || true
fi

# Fichier de version (pour vérifier que la bonne version est en ligne)
GIT_REV=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_DATE=$(git log -1 --format=%ci 2>/dev/null | cut -d' ' -f1 || echo "unknown")
echo "${GIT_REV} ${GIT_DATE}" | sudo tee "$VITRINE_DIR/version.txt" >/dev/null
echo "${GIT_REV} ${GIT_DATE}" | sudo tee "$DOCS_DIR/version.txt" >/dev/null
sudo chown ubuntu:ubuntu "$VITRINE_DIR/version.txt" "$DOCS_DIR/version.txt" 2>/dev/null || true

# --- App Next.js (Wiki, modules, sandbox) → PM2 pour app.blueprint-modular.com ---
# Flux FAIL-CLOSED : par defaut, un deploiement n'est declare reussi (exit 0) que
# si l'app Next.js est reconstruite, redemarree et repond sainement. Tout cas ou
# le build est saute ou echoue produit un exit != 0, SAUF opt-in explicite
# BPM_STATIC_ONLY=1 (deploiement vitrine/docs assume, sans rebuild de l'app).
if [ "${BPM_STATIC_ONLY:-0}" = "1" ]; then
  echo "ATTENTION — app Next.js volontairement non reconstruite (BPM_STATIC_ONLY=1)."
  echo "            Seuls la vitrine et la documentation ont ete deployes."
else
  # Garde-fou structure : sans ces fichiers, l'app ne peut pas etre construite.
  if [ ! -f "$REPO_DIR/package.json" ] || [ ! -f "$REPO_DIR/next.config.mjs" ]; then
    echo "ERREUR — package.json ou next.config.mjs introuvable dans $REPO_DIR." >&2
    echo "         Impossible de reconstruire l'app Next.js : deploiement avorte." >&2
    echo "         Pour un deploiement vitrine/docs seulement : BPM_STATIC_ONLY=1 $0" >&2
    exit 1
  fi
  # Garde-fou config : sans .env, le build/runtime de l'app est inutilisable.
  if [ ! -f "$REPO_DIR/.env" ]; then
    echo "ERREUR — .env manquant dans $REPO_DIR." >&2
    echo "         Copiez deploy/app-env.example vers .env puis renseignez DATABASE_URL et NEXTAUTH_*." >&2
    echo "         Pour un deploiement vitrine/docs assume (sans rebuild de l'app) : BPM_STATIC_ONLY=1 $0" >&2
    exit 1
  fi

  echo "--> Build et démarrage de l'app Next.js..."
  cd "$REPO_DIR"
  mkdir -p public/img
  if [ -f "Logo-BPM-nom.jpg" ]; then cp -f Logo-BPM-nom.jpg public/img/logo-bpm-nom.jpg; fi
  if [ -f "Logo BPM.png" ]; then cp -f "Logo BPM.png" public/img/logo-bpm-nom.png; cp -f "Logo BPM.png" public/img/logo-bpm.png; fi

  npm install
  echo "    Génération du bundle blueprint-modules (zip pour devs sans accès Git)..."
  node scripts/build-modules-bundle.cjs 2>/dev/null || true
  if [ -d "$STATIC/downloads" ]; then
    sudo cp -rf "$STATIC/downloads" "$DOCS_DIR/"
    sudo chown -R ubuntu:ubuntu "$DOCS_DIR/downloads" 2>/dev/null || true
  fi
  npx prisma generate
  npx prisma migrate deploy
  # Seed non critique : ne doit pas faire echouer le deploiement.
  node prisma/seed-wiki-procedures.cjs || true
  rm -rf .next
  npm run build
  # En mode standalone, Next.js génère dans .next/standalone/blueprint-modular/
  # Il faut copier static et public dans le bon endroit
  if [ -d ".next/standalone/blueprint-modular" ]; then
    mkdir -p .next/standalone/blueprint-modular/.next
    # Obligatoire en mode standalone : CSS et assets (sans ça, le CSS n'est pas servi)
    cp -r .next/static .next/standalone/blueprint-modular/.next/static
    cp -r .next/server .next/standalone/blueprint-modular/.next/
    cp -r public .next/standalone/blueprint-modular/public
    # Config domaines Gestion de parc (getDomainConfig lit depuis process.cwd()/lib/asset-manager/config)
    mkdir -p .next/standalone/blueprint-modular/lib
    cp -r lib/asset-manager .next/standalone/blueprint-modular/lib/
  else
    # Fallback pour ancienne structure (si standalone n'est pas activé)
    mkdir -p .next/standalone/.next
    cp -r .next/static .next/standalone/.next/static
    cp -r .next/server .next/standalone/.next/
    cp -r public .next/standalone/public
    mkdir -p .next/standalone/lib
    cp -r lib/asset-manager .next/standalone/lib/
  fi
  chmod +x deploy/run-app.sh
  if command -v pm2 >/dev/null 2>&1; then
    if pm2 describe "$APP_PM2_NAME" >/dev/null 2>&1; then
      pm2 restart "$APP_PM2_NAME" --update-env
    else
      pm2 start deploy/run-app.sh --name "$APP_PM2_NAME" --interpreter bash
      pm2 save
    fi
    echo "    App Next.js: pm2 → $APP_PM2_NAME (app.blueprint-modular.com)"
  else
    echo "ERREUR — PM2 non installé : l'app Next.js ne peut pas être démarrée." >&2
    echo "         Installez PM2 (npm i -g pm2) puis relancez le déploiement." >&2
    exit 1
  fi

  # --- Gate de santé : un deploiement "vert" implique une app qui repond. ---
  # On interroge la route de sante app/api/health/route.ts, qui renvoie HTTP 200
  # {status:"ok"} quand l'app est saine, sans dependance DB ni auth -> ideal.
  # 15 tentatives espacees de 2 s (~30 s) pour laisser demarrer le process standalone.
  HEALTH_URL="http://127.0.0.1:3000/api/health"
  echo "--> Contrôle de santé de l'app ($HEALTH_URL)..."
  HEALTH_OK=0
  for i in $(seq 1 15); do
    CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$HEALTH_URL" || echo "000")
    if [ "$CODE" = "200" ]; then
      HEALTH_OK=1
      echo "    App saine (HTTP 200) après $i tentative(s)."
      break
    fi
    echo "    Tentative $i/15 : HTTP $CODE — nouvelle tentative dans 2 s..."
    sleep 2
  done
  if [ "$HEALTH_OK" -ne 1 ]; then
    echo "ERREUR — l'app Next.js ne répond pas sainement sur $HEALTH_URL après 15 tentatives." >&2
    echo "         Déploiement considéré comme échoué. Diagnostiquez : pm2 logs $APP_PM2_NAME" >&2
    exit 1
  fi
fi

echo "✅ Déploiement terminé."
echo "   Version déployée: $GIT_REV ($GIT_DATE)"
echo "   Vitrine:    $VITRINE_DIR (blueprint-modular.com)"
echo "   Documentation: $DOCS_DIR (docs.blueprint-modular.com)"
echo "   App (Wiki, modules): app.blueprint-modular.com (PM2: $APP_PM2_NAME)"
echo "   Pour Nginx: sudo cp $REPO_DIR/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular"
echo "   Puis:       sudo nginx -t && sudo systemctl reload nginx"
