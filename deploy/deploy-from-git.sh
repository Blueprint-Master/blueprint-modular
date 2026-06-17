#!/bin/bash
# Déploiement depuis le repo Git (à exécuter sur le serveur)
# Usage: ./deploy/deploy-from-git.sh
# Prérequis: git installé. Pour la 1ère fois: clone dans REPO_DIR puis lancer ce script.
#
# Déploie l'app Next.js (PM2) qui sert TOUT le site public sur localhost:3000 :
# - Vitrine (/), documentation (/docs, /docs/components/*), composants (/components),
#   modules (/modules/*), MCP (/mcp), pages légales — proxifiées par nginx
#   (app./blueprint-modular.com et www → http://localhost:3000).
# Le site n'est plus servi depuis /var/www : le déploiement statique vitrine/docs
# a été retiré (aucun root /var/www/blueprint-modular(-docs) côté nginx).

set -e
set -o pipefail

REPO_URL="https://github.com/remigit55/blueprint-modular.git"
REPO_DIR="${REPO_DIR:-/home/ubuntu/blueprint-modular}"
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

# Version courante (affichée dans le récapitulatif final).
GIT_REV=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_DATE=$(git log -1 --format=%ci 2>/dev/null | cut -d' ' -f1 || echo "unknown")

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

  # Charge l'environnement du repo (DATABASE_URL, etc.) AVANT prisma migrate/seed.
  # Sinon, si le shell de déploiement a des variables d'un autre projet exportées
  # (ex. DATABASE_URL=…/blueprint_maker, PORT=3001 du Maker), Prisma privilégie
  # l'env du process sur le .env → migrate/seed ciblent la mauvaise base. On force
  # donc l'env du .env Modular pour toute la suite du déploiement.
  set -a
  . "$REPO_DIR/.env"
  set +a

  mkdir -p public/img
  if [ -f "Logo-BPM-nom.jpg" ]; then cp -f Logo-BPM-nom.jpg public/img/logo-bpm-nom.jpg; fi
  if [ -f "Logo BPM.png" ]; then cp -f "Logo BPM.png" public/img/logo-bpm-nom.png; cp -f "Logo BPM.png" public/img/logo-bpm.png; fi

  npm install
  # Build du paquet @blueprint-modular/core AVANT le build de l'app.
  # L'app consomme core via le lien local (file:packages/core) → son dist/ doit
  # être frais. Le déploiement ne reconstruisait pas core et s'appuyait sur un dist
  # périmé : tout NOUVEAU sous-chemin exporté (ex. ./connectors) manquait → build
  # de l'app en échec (« export X doesn't exist / module has no exports »).
  # On reconstruit donc core depuis ses sources (mêmes étapes que le gate CI).
  echo "    Build du paquet @blueprint-modular/core (dist consommé par l'app)..."
  ( cd packages/core && npm install && npm run build )
  echo "    Génération du bundle blueprint-modules (zip pour devs sans accès Git)..."
  node scripts/build-modules-bundle.cjs 2>/dev/null || true
  # Constat (2026-06) : le zip est généré dans frontend/static/downloads/ mais n'est
  # consommé par personne — l'app Next ne le sert ni depuis public/ ni via une route,
  # et son unique copie vivait dans $DOCS_DIR/downloads (/var/www, mort, retiré ici).
  # On conserve la génération (artefact attendu) ; sa diffusion sera traitée à part.
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
    # Le build standalone crée déjà .next/standalone/blueprint-modular/public/
    # (ex. llms.txt). Un « cp -r public DEST/public » copierait alors le dossier
    # public DANS ce dossier existant → DEST/public/public/ (assets servis en 404).
    # On copie donc le CONTENU de public/ (dotfiles inclus) dans le public/ existant
    # pour que les assets atterrissent bien à la racine servie.
    mkdir -p .next/standalone/blueprint-modular/public
    cp -r public/. .next/standalone/blueprint-modular/public/
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

echo "OK — Déploiement terminé."
echo "   Version déployée: $GIT_REV ($GIT_DATE)"
echo "   App Next.js (PM2: $APP_PM2_NAME) sert tout le site public sur localhost:3000 :"
echo "     vitrine (/), docs (/docs), composants, modules, MCP — via nginx"
echo "     (app./blueprint-modular.com et www → http://localhost:3000)."
echo "   Pour Nginx: sudo cp $REPO_DIR/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular"
echo "   Puis:       sudo nginx -t && sudo systemctl reload nginx"
