#!/usr/bin/env bash
# Répétition de la migration de production et de son retour arrière, sur des
# bases JETABLES. À lancer après preprod.sh (réutilise sa build et son rôle).
#
#   1. base A au schéma de la version EN PRODUCTION (HEAD du dépôt de prod) ;
#   2. données : jeu de recette isolé (défaut) ou, avec COPIE_PROD=1, copie de
#      la base de production par pg_dump (lecture seule ; dump effacé à la fin) ;
#   3. sauvegarde par deploy/backup-postgres.sh (la procédure réelle) ;
#   4. migrations de la version candidate ; schéma comparé au schéma cible ;
#   5. retour arrière : restauration de la sauvegarde dans une base B ; schéma
#      comparé au schéma de la version en production, comptes de lignes comparés.
# Les bases A et B sont supprimées à la fin, quel que soit le résultat.
#
# Rapport sans secret : /var/tmp/modular-preprod/migration.txt
set -euo pipefail
umask 077
export LC_ALL=C

RACINE=/home/ubuntu/modular-preprod
SRC=$RACINE/src.git
APP=$RACINE/current
PROD_REPO=/home/ubuntu/blueprint-modular
PUBLIC=/var/tmp/modular-preprod
RAPPORT=$PUBLIC/migration.txt
A=modular_mig_avant
B=modular_mig_restauree
TRAVAIL=$(mktemp -d "$RACINE/mig-XXXXXX")
PRISMA=$APP/node_modules/.bin/prisma

[ "$(id -un)" = ubuntu ] || { echo "à lancer en ubuntu" >&2; exit 1; }
[ -x "$PRISMA" ] || { echo "lancer preprod.sh d'abord" >&2; exit 1; }
sudo -n true 2>/dev/null || { echo "jeton sudo absent : lancer 'sudo -v' avant" >&2; exit 1; }
# shellcheck disable=SC1090
. "$RACINE/secrets.env"
mkdir -p "$PUBLIC"; : > "$RAPPORT"; chmod 644 "$RAPPORT"
r() { echo "$*" | tee -a "$RAPPORT"; }
pg() { ( cd /tmp && sudo -u postgres psql -X -q -v ON_ERROR_STOP=1 "$@" ); }
nettoyer() {
  pg -c "DROP DATABASE IF EXISTS $A WITH (FORCE)" -c "DROP DATABASE IF EXISTS $B WITH (FORCE)" || true
  rm -rf "$TRAVAIL"
}
trap nettoyer EXIT

url() { echo "postgresql://modular_preprod:$PG_PASSWORD@127.0.0.1:5432/$1"; }
export PGHOST=127.0.0.1 PGUSER=modular_preprod PGPASSWORD=$PG_PASSWORD

AVANT=$(git -C "$PROD_REPO" rev-parse HEAD)
APRES=$(cat "$APP/.preprod-sha")
git -C "$SRC" cat-file -e "$AVANT^{commit}" || git -C "$SRC" fetch -q origin "$AVANT"
mkdir -p "$TRAVAIL/avant" "$TRAVAIL/sauvegardes"
git -C "$SRC" archive "$AVANT" prisma | tar -x -C "$TRAVAIL/avant"
r "Répétition de migration — $(date -u +%d/%m/%Y\ %H:%M:%SZ)"
r "Version en production : $AVANT"
r "Version candidate     : $APRES"
NOUVELLES=$(comm -13 <(ls "$TRAVAIL/avant/prisma/migrations" | sort) <(ls "$APP/prisma/migrations" | sort) | grep -v lock || true)
r "Migrations nouvelles  : $(echo "$NOUVELLES" | grep -c . || true)"
DESTRUCTIF=$(for m in $NOUVELLES; do grep -HniE '\bdrop (table|column)\b|\brename (to|column)\b' "$APP/prisma/migrations/$m/migration.sql" || true; done)
r "Instructions destructrices sur l'existant : ${DESTRUCTIF:-aucune (DROP TABLE/COLUMN, RENAME)}"

pg -c "DROP DATABASE IF EXISTS $A WITH (FORCE)" -c "DROP DATABASE IF EXISTS $B WITH (FORCE)" \
   -c "CREATE DATABASE $A OWNER modular_preprod" -c "CREATE DATABASE $B OWNER modular_preprod"

# --- 1-2. Base A : version en production + données
if [ "${COPIE_PROD:-0}" = 1 ]; then
  PROD_URL=$(grep -E '^DATABASE_URL=' "$PROD_REPO/.env" | head -1 | cut -d= -f2- | tr -d '"' | sed 's/?.*//')
  [ -n "$PROD_URL" ] || { r "DATABASE_URL de prod introuvable"; exit 1; }
  pg_dump --format=custom --no-owner --no-acl --dbname="$PROD_URL" --file="$TRAVAIL/prod.dump"
  pg_restore --no-owner --no-privileges --exit-on-error --dbname="$(url $A)" "$TRAVAIL/prod.dump"
  rm -f "$TRAVAIL/prod.dump"
  r "Données : copie de la base de production (pg_dump en lecture, dump effacé)"
  DATABASE_URL=$(url $A) "$PRISMA" migrate status --schema "$TRAVAIL/avant/prisma/schema.prisma" >/dev/null \
    || { r "La copie de prod n'est pas au schéma de $AVANT : arrêt"; exit 1; }
else
  DATABASE_URL=$(url $A) "$PRISMA" migrate deploy --schema "$TRAVAIL/avant/prisma/schema.prisma" >/dev/null
  psql -X -q -v ON_ERROR_STOP=1 -d $A <<'SQL'
INSERT INTO "User"(id,email,name,"updatedAt") SELECT 'u'||g,'recette'||g||'@preprod.invalid','Recette '||g,now() FROM generate_series(1,50) g;
INSERT INTO "WikiArticle"(id,title,content,slug,"authorId","isPublished","updatedAt")
  SELECT 'w'||g,'Article '||g,repeat('Contenu de recette. ',40),'recette-'||g,'u'||(1+g%50),g%2=0,now() FROM generate_series(1,200) g;
INSERT INTO "CalendarEvent"(id,user_id,title,start_at,end_at,updated_at)
  SELECT 'c'||g,'u'||(1+g%50),'Réunion '||g,now()+g*interval '1 hour',now()+g*interval '1 hour'+interval '30 min',now() FROM generate_series(1,300) g;
INSERT INTO "Notification"(id,user_id,message) SELECT 'n'||g,'u'||(1+g%50),'Notification '||g FROM generate_series(1,500) g;
SQL
  r "Données : jeu de recette isolé (50 utilisateurs, 200 articles, 300 événements, 500 notifications)"
fi

comptes() {
  psql -X -At -d "$1" -c "SELECT string_agg(format('SELECT %L, count(*) FROM %I.%I', n.nspname||'.'||c.relname, n.nspname, c.relname), ' UNION ALL ') FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname='public' AND c.relname <> '_prisma_migrations'" \
    | psql -X -At -F' ' -d "$1" | sort
}
comptes $A > "$TRAVAIL/comptes-avant.txt"
r "Tables avant migration : $(wc -l < "$TRAVAIL/comptes-avant.txt"), lignes : $(awk '{s+=$2} END{print s+0}' "$TRAVAIL/comptes-avant.txt")"

# --- 3. Sauvegarde (procédure réelle)
DUMP=$(PGDATABASE=$A bash "$APP/deploy/backup-postgres.sh" backup "$TRAVAIL/sauvegardes")
r "Sauvegarde : $(du -h "$DUMP" | cut -f1) (deploy/backup-postgres.sh, dump décodé avant publication)"

# --- 4. Migration candidate
T0=$(date +%s)
DATABASE_URL=$(url $A) "$PRISMA" migrate deploy --schema "$APP/prisma/schema.prisma" > "$TRAVAIL/migrate.log" 2>&1 \
  || { r "MIGRATION ROUGE"; tail -20 "$TRAVAIL/migrate.log" | tee -a "$RAPPORT"; exit 1; }
r "Migration : VERTE en $(( $(date +%s) - T0 )) s"
if DATABASE_URL=$(url $A) "$PRISMA" migrate diff --from-url "$(url $A)" --to-schema-datamodel "$APP/prisma/schema.prisma" --exit-code >/dev/null; then
  r "Schéma migré = schéma de la version candidate : OUI"
else r "Schéma migré = schéma de la version candidate : NON (écart)"; fi
comptes $A > "$TRAVAIL/comptes-apres.txt"
PERDUES=$(join "$TRAVAIL/comptes-avant.txt" "$TRAVAIL/comptes-apres.txt" | awk '$2!=$3' || true)
if [ -z "$PERDUES" ]; then r "Lignes existantes conservées par la migration : OUI (toutes les tables, au compte près)"; else r "Lignes existantes conservées par la migration : NON"; echo "$PERDUES" | tee -a "$RAPPORT"; fi

# --- 5. Retour arrière
PGDATABASE=$B bash "$APP/deploy/backup-postgres.sh" restore "$DUMP"
if DATABASE_URL=$(url $B) "$PRISMA" migrate diff --from-url "$(url $B)" --to-schema-datamodel "$TRAVAIL/avant/prisma/schema.prisma" --exit-code >/dev/null; then
  r "Retour arrière : schéma restauré = schéma de la version en production : OUI"
else r "Retour arrière : schéma restauré = schéma de la version en production : NON"; fi
comptes $B > "$TRAVAIL/comptes-restauree.txt"
if cmp -s "$TRAVAIL/comptes-avant.txt" "$TRAVAIL/comptes-restauree.txt"; then
  r "Retour arrière : comptes de lignes identiques à l'état d'avant : OUI"
else r "Retour arrière : comptes de lignes identiques : NON"; diff "$TRAVAIL/comptes-avant.txt" "$TRAVAIL/comptes-restauree.txt" | head -20 | tee -a "$RAPPORT"; fi
DATABASE_URL=$(url $B) "$PRISMA" migrate status --schema "$TRAVAIL/avant/prisma/schema.prisma" >/dev/null \
  && r "Retour arrière : historique de migrations = version en production : OUI" \
  || r "Retour arrière : historique de migrations = version en production : NON"
r "Limite : le retour arrière restaure la sauvegarde ; ce qui est écrit APRÈS la migration est perdu."
r "Bases jetables supprimées en sortie."
