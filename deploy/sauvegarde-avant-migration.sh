#!/usr/bin/env bash
# Sauvegarde de la base de production AVANT `prisma migrate deploy`.
# deploy-from-git.sh migre sans sauvegarde : un retour arrière exige donc ce
# dump. Il est décodé intégralement avant d'être publié (un dump illisible ne
# doit jamais ressembler à une sauvegarde). Échec => le déploiement n'a pas lieu.
# Retour arrière : base vide séparée, puis
#   pg_restore --single-transaction --exit-on-error --no-owner --no-privileges -d <base> <dump>
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
url=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d "\"'")
[ -n "$url" ] || { echo "DATABASE_URL absent du .env" >&2; exit 1; }
read -r PGHOST PGPORT PGUSER PGDATABASE < <(node -e 'const u=new URL(process.argv[1]);console.log(u.hostname,u.port||5432,decodeURIComponent(u.username),decodeURIComponent(u.pathname.slice(1)))' "$url")
PGPASSWORD=$(node -e 'process.stdout.write(decodeURIComponent(new URL(process.argv[1]).password))' "$url")
export PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD
dir="$HOME/backups/modular"
mkdir -p "$dir"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
partiel="$dir/.avant-migration-$stamp.dump"
trap 'rm -f -- "$partiel"' EXIT
pg_dump --format=custom --no-owner --no-acl --file="$partiel"
pg_restore --list "$partiel" > /dev/null
final="$dir/avant-migration-$stamp-$(git rev-parse --short HEAD).dump"
mv -- "$partiel" "$final"
find "$dir" -maxdepth 1 -name 'avant-migration-*.dump' -mtime +30 -delete
echo "Sauvegarde avant migration : $final ($(du -h "$final" | cut -f1))"
