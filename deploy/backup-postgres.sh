#!/usr/bin/env bash
# Use the PostgreSQL client of the same major version as the server.
set -euo pipefail
umask 077
: "${PGDATABASE:?Set PGDATABASE to the database name, and configure the libpq connection first.}"
[[ "$PGDATABASE" =~ ^[A-Za-z0-9_][A-Za-z0-9_-]*$ ]] || { echo 'PGDATABASE must be a database name.' >&2; exit 2; }
[[ $# == 2 ]] || { echo 'Usage: backup-postgres.sh backup DIRECTORY | restore DUMP' >&2; exit 2; }
case "$1" in
  backup)
    directory="$2/$PGDATABASE"
    mkdir -p -- "$directory"
    stamp=$(date -u +%Y%m%dT%H%M%SZ)
    partial=$(mktemp "$directory/.blueprint-$stamp-XXXXXX")
    trap 'rm -f -- "$partial"' EXIT
    pg_dump --format=custom --no-owner --no-acl --file="$partial"
    # Decode the complete dump before making it available for restoration.
    pg_restore --file=/dev/null "$partial"
    filename=${partial##*/}
    archive="$directory/${filename#.}.dump"
    ln -- "$partial" "$archive"
    find "$directory" -maxdepth 1 -type f -name 'blueprint-????????T??????Z-??????.dump' -mmin +43200 -delete
    echo "$archive"
    ;;
  restore)
    [[ -f "$2" ]] || { echo 'Archive not found.' >&2; exit 2; }
    existing=$(psql -XAt --set=ON_ERROR_STOP=1 -c "SELECT EXISTS (
      SELECT FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname <> 'information_schema' AND n.nspname !~ '^pg_'
    )")
    [[ "$existing" == f ]] || { echo 'Restore requires a separate, empty database.' >&2; exit 1; }
    pg_restore --single-transaction --exit-on-error --no-owner --no-privileges --dbname="$PGDATABASE" "$2"
    ;;
  *) echo 'Expected backup or restore.' >&2; exit 2 ;;
esac
