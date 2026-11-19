#!/usr/bin/env bash
# Préproduction Modular : installe l'archive EXACTE d'un commit validé par la CI,
# sur une base dédiée, avec des données de recette isolées.
#
# Périmètre : ne lit le dépôt de production qu'en LECTURE (clone local nu), ne
# touche ni à sa base, ni à son process PM2, ni à son vhost.
#
# Usage (en ubuntu, sudo demandé pour postgres, nginx et certbot) :
#   bash preprod.sh              installation complète (base remise à zéro)
#   bash preprod.sh --certificat certificat seul, une fois le DNS propagé
#
# Rapport sans secret : /var/tmp/modular-preprod/rapport.txt (lisible par tous).
set -euo pipefail
umask 027
export LC_ALL=C.UTF-8

SHA=${PREPROD_SHA:?PREPROD_SHA requis (commit validé par la CI)}
BRANCHE=${PREPROD_BRANCHE:?PREPROD_BRANCHE requis (branche qui porte ce commit)}
DOMAINE=preprod.blueprint-modular.com
IP_SERVEUR=51.83.88.18
PORT=3040
RACINE=/home/ubuntu/modular-preprod
SRC=$RACINE/src.git
# Build HORS de /home/ubuntu : /home/ubuntu/package-lock.json fait choisir à Next ce
# répertoire comme racine, et la sortie standalone est alors imbriquée sous le
# chemin relatif (constaté le 19/11 : « Build standalone introuvable »). La prod
# n'y échappe que parce que son dossier s'appelle exactement blueprint-modular.
APP_BASE=/srv/modular-preprod
APP=$APP_BASE/releases/$SHA
SECRETS=$RACINE/secrets.env
BASE=modular_preprod
PM2_NOM=modular-preprod
PROD_REPO=/home/ubuntu/blueprint-modular
PUBLIC=/var/tmp/modular-preprod
RAPPORT=$PUBLIC/rapport.txt

die() { echo "ÉCHEC : $*" >&2; [ -d "$PUBLIC" ] && echo "ÉCHEC : $*" >> "$RAPPORT"; exit 1; }
etape() { echo; echo "== $* ($(date -u +%H:%M:%SZ))"; echo "- $*" >> "$RAPPORT"; }

[ "$(id -un)" = ubuntu ] || die "à lancer en ubuntu (pas en root, pas en claude-ops)"
sudo -n true 2>/dev/null || die "jeton sudo absent : lancer 'sudo -v' juste avant"
sudo install -d -m 755 -o ubuntu -g ubuntu "$PUBLIC"
mkdir -p "$RACINE/logs"
sudo install -d -m 755 -o ubuntu -g ubuntu "$APP_BASE" "$APP_BASE/releases"
: > "$RAPPORT"; chmod 644 "$RAPPORT"
echo "Préproduction Modular — $(date -u +%d/%m/%Y\ %H:%M:%SZ)" >> "$RAPPORT"

certificat() {
  local resolu
  resolu=$(getent ahostsv4 "$DOMAINE" | awk 'NR==1{print $1}' || true)
  if [ "$resolu" != "$IP_SERVEUR" ]; then
    echo "DNS : $DOMAINE ne résout pas vers $IP_SERVEUR (lu : '${resolu:-rien}')." | tee -a "$RAPPORT"
    echo "Enregistrement à créer : $DOMAINE. A $IP_SERVEUR (TTL 300), puis : bash $0 --certificat" | tee -a "$RAPPORT"
    return 0
  fi
  sudo certbot --nginx -d "$DOMAINE" --non-interactive --redirect --keep-until-expiring \
    || die "certbot a échoué"
  sudo nginx -t && sudo systemctl reload nginx
  [ "${1:-}" = verifier ] || { echo "Certificat posé pour $DOMAINE" | tee -a "$RAPPORT"; return 0; }
  local code
  code=$(curl -sS -o /dev/null -w '%{http_code}' "https://$DOMAINE/api/health" || true)
  echo "HTTPS : https://$DOMAINE/api/health → $code" | tee -a "$RAPPORT"
  [ "$code" = 200 ] || die "HTTPS ne répond pas 200"
}

if [ "${1:-}" = "--certificat" ]; then certificat verifier; exit 0; fi

# --- 0. Port libre (ou déjà à nous)
if ss -ltnH "sport = :$PORT" | grep -q . && ! pm2 describe "$PM2_NOM" >/dev/null 2>&1; then
  die "le port $PORT est occupé par un autre process"
fi

# --- 1. Source : clone NU local du dépôt de prod (lecture seule), puis fetch de la branche
etape "Source $SHA"
if [ ! -d "$SRC" ]; then git clone -q --bare "$PROD_REPO" "$SRC"; fi
git -C "$SRC" remote set-url origin "$(git -C "$PROD_REPO" remote get-url origin)"
git -C "$SRC" fetch -q origin "+refs/heads/$BRANCHE:refs/heads/$BRANCHE" "+refs/heads/master:refs/heads/master"
git -C "$SRC" cat-file -e "$SHA^{commit}" || die "commit $SHA introuvable"
[ "$(git -C "$SRC" rev-parse "refs/heads/$BRANCHE")" = "$SHA" ] \
  || echo "  note : la branche a avancé depuis $SHA ; on installe $SHA quand même (commit validé)." | tee -a "$RAPPORT"

# --- 2. Arrêt de l'instance précédente et extraction de l'archive exacte
pm2 describe "$PM2_NOM" >/dev/null 2>&1 && pm2 delete "$PM2_NOM" >/dev/null
rm -rf "$APP"; mkdir -p "$APP"
git -C "$SRC" archive --format=tar "$SHA" | tar -x -C "$APP"
[ -s "$APP/package.json" ] || die "archive vide"
echo "$SHA" > "$APP/.preprod-sha"
ln -sfn "$APP" "$RACINE/current"

# --- 3. Secrets (générés une fois, jamais affichés)
if [ ! -s "$SECRETS" ]; then
  { echo "PG_PASSWORD=$(openssl rand -hex 24)"
    echo "NEXTAUTH_SECRET=$(openssl rand -hex 32)"
    echo "QA_PASSWORD=$(openssl rand -hex 12)"; } > "$SECRETS"
fi
chmod 600 "$SECRETS"
# shellcheck disable=SC1090
. "$SECRETS"
[ -n "${PG_PASSWORD:-}" ] && [ -n "${NEXTAUTH_SECRET:-}" ] && [ -n "${QA_PASSWORD:-}" ] || die "secrets incomplets"
QA_EMAIL=recette@preprod.invalid

# --- 4. Base dédiée, recréée vide à chaque installation (données de recette isolées)
etape "Base $BASE (rôle dédié, recréée vide)"
( cd /tmp && sudo -u postgres psql -X -q -v ON_ERROR_STOP=1 -v pw="$PG_PASSWORD" <<'SQL'
SELECT 'CREATE ROLE modular_preprod LOGIN' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname='modular_preprod') \gexec
ALTER ROLE modular_preprod WITH LOGIN NOSUPERUSER NOCREATEROLE NOCREATEDB PASSWORD :'pw';
DROP DATABASE IF EXISTS modular_preprod WITH (FORCE);
CREATE DATABASE modular_preprod OWNER modular_preprod;
SQL
) || die "création de la base"

# --- 4b. Vhost nginx (HTTP d'abord ; certbot ajoute le TLS). Tous les gestes sudo
# sont faits ici, au début, pendant la validité du jeton sudo (15 min).
etape "Vhost nginx $DOMAINE"
sudo tee /etc/nginx/sites-available/modular-preprod >/dev/null <<NGINX
# Préproduction Modular — données de recette, non indexée.
server {
    listen 80;
    server_name $DOMAINE;
    client_max_body_size 100m;
    add_header X-Robots-Tag "noindex, nofollow" always;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300s;
    }
}
NGINX
sudo ln -sfn /etc/nginx/sites-available/modular-preprod /etc/nginx/sites-enabled/modular-preprod
sudo nginx -t || die "nginx -t"
sudo systemctl reload nginx

# --- 4c. Certificat (si le DNS est en place)
etape "Certificat"
certificat

DATABASE_URL="postgresql://$BASE:$PG_PASSWORD@127.0.0.1:5432/$BASE?connection_limit=3"
cat > "$APP/.env" <<ENV
DATABASE_URL="$DATABASE_URL"
NEXTAUTH_URL="https://$DOMAINE"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
PORT_OVERRIDE=$PORT
HOSTNAME=127.0.0.1
AI_MOCK=true
SKIP_AUTH_FOR_TEST=false
NEXT_TELEMETRY_DISABLED=1
ENV
chmod 600 "$APP/.env"

# --- 5. Build (séquence de la CI modules-install, la même qui est verte sur ce commit)
etape "Build"
cd "$APP"
export DATABASE_URL NEXT_TELEMETRY_DISABLED=1
{
  npm ci --no-audit --no-fund
  npm ci --prefix packages/core --no-audit --no-fund
  npm run build --prefix packages/core
  node scripts/build-modules-bundle.cjs --output public/downloads
  npm run build:standalone
} > "$RACINE/logs/build.log" 2>&1 || { tail -40 "$RACINE/logs/build.log" > "$PUBLIC/build-fin.log"; chmod 644 "$PUBLIC/build-fin.log"; die "build (fin du journal : $PUBLIC/build-fin.log)"; }
[ -s .next/standalone/server.js ] || die "server.js standalone absent"

# --- 6. Migrations
etape "Migrations"
./node_modules/.bin/prisma migrate deploy > "$RACINE/logs/migrate.log" 2>&1 || die "migrate deploy"
./node_modules/.bin/prisma migrate status >> "$RACINE/logs/migrate.log" 2>&1 || die "migrate status"
echo "  $(git -C "$SRC" ls-tree --name-only "$SHA" prisma/migrations/ | grep -c /) migrations appliquées, schéma à jour" >> "$RAPPORT"

# --- 7. Données de recette isolées (compte QA + procédures wiki, comme la prod)
etape "Données de recette"
MODULAR_QA_EMAIL=$QA_EMAIL MODULAR_QA_PASSWORD=$QA_PASSWORD node scripts/seed-module-install-fixture.cjs "$APP" \
  || die "compte de recette"
node prisma/seed-wiki-procedures.cjs > "$RACINE/logs/seed-wiki.log" 2>&1 \
  && echo "  procédures wiki chargées" >> "$RAPPORT" \
  || echo "  procédures wiki : échec (non bloquant, identique à la prod)" >> "$RAPPORT"

# --- 8. Recette des 32 modules (script de la CI, sur la build installée)
etape "Recette 32 modules (scripts/verify-modules-install.py)"
set +e
MODULAR_QA_EMAIL=$QA_EMAIL MODULAR_QA_PASSWORD=$QA_PASSWORD \
  python3 scripts/verify-modules-install.py "$APP" > "$PUBLIC/recette-32-modules.log" 2>&1
RECETTE=$?
set -e
chmod 644 "$PUBLIC/recette-32-modules.log"
OK=$(grep -c '^Documentation and entry point OK:' "$PUBLIC/recette-32-modules.log" || true)
if [ "$RECETTE" = 0 ]; then
  echo "  VERT : $OK/32 modules (documentation + point d'entrée), session, agenda, analyses, survie au redémarrage" >> "$RAPPORT"
else
  echo "  ROUGE (code $RECETTE) : $OK/32 modules passés avant l'arrêt — voir $PUBLIC/recette-32-modules.log" >> "$RAPPORT"
fi

# --- 9. Service PM2
etape "Service PM2 $PM2_NOM sur 127.0.0.1:$PORT"
pm2 start deploy/run-app.sh --name "$PM2_NOM" --interpreter bash --cwd "$APP" >/dev/null
pm2 save >/dev/null
SANTE=""
for _ in $(seq 1 60); do
  SANTE=$(curl -sS "http://127.0.0.1:$PORT/api/health" 2>/dev/null || true)
  echo "$SANTE" | grep -q '"ok"' && break
  sleep 1
done
echo "$SANTE" | grep -q '"ok"' || die "santé locale KO : '$SANTE'"
echo "  /api/health : $SANTE" >> "$RAPPORT"

if [ "$(getent ahostsv4 "$DOMAINE" | awk 'NR==1{print $1}' || true)" = "$IP_SERVEUR" ]; then
  code=$(curl -sS -o /dev/null -w '%{http_code}' "https://$DOMAINE/api/health" || true)
  echo "  HTTPS public /api/health : $code" >> "$RAPPORT"
fi

etape "Terminé"
{
  echo "URL : https://$DOMAINE"
  echo "SHA installé : $(cat "$APP/.preprod-sha")"
  echo "Compte de recette : $QA_EMAIL (mot de passe dans $SECRETS, QA_PASSWORD)"
} >> "$RAPPORT"
cat "$RAPPORT"
