#!/usr/bin/env bash
# Qualify an extracted standalone on loopback PostgreSQL. Use a trusted synthetic fixture.
set -euo pipefail
if [[ $# != 3 ]]; then
  echo "usage: $0 INSTALLED_APPLICATION EXPECTED_SHA SYNTHETIC_DUMP_OR_--worker-fixture" >&2
  exit 2
fi
app=$(realpath "$1")
revision=$2
source_fixture=$3
scripts=$(cd "$(dirname "$0")" && pwd)
python=${MODULAR_QA_PYTHON:-python3}
: "${MODULAR_TEST_CHROMIUM:?Set the executable path of the qualification browser}"
[[ "$revision" =~ ^[0-9a-f]{40}$ && "$(cat "$app/BUILD-REVISION")" == "$revision" ]]
[[ -f "$app/.next/standalone/server.js" ]]
if [[ "$source_fixture" != --worker-fixture ]]; then
  source_fixture=$(realpath "$source_fixture")
  pg_restore --list "$source_fixture" >/dev/null
fi

work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
unset PGSERVICE PGSERVICEFILE PGOPTIONS PGHOSTADDR PGSSLMODE DATABASE_URL MODULAR_TEST_DATABASE_URL
export PGHOST=127.0.0.1 PGUSER=fixture PGDATABASE=postgres PGCONNECT_TIMEOUT=5
PGPORT=$("$python" -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1]); s.close()')
PGPASSWORD=$(openssl rand -hex 32)
export PGPORT PGPASSWORD
if [[ ${GITHUB_ACTIONS:-false} == true ]]; then echo "::add-mask::$PGPASSWORD"; fi
(umask 077 && echo "$PGPASSWORD" > "$work/pw")
initdb -D "$work/cluster" -U "$PGUSER" --pwfile="$work/pw" -A scram-sha-256 --encoding=UTF8 --no-locale >/dev/null
rm "$work/pw"
pg_ctl -D "$work/cluster" -l "$work/postgres.log" -o "-h 127.0.0.1 -p $PGPORT -c unix_socket_directories=''" -w start
trap 'pg_ctl -D "$work/cluster" -m fast -w stop >/dev/null; rm -rf -- "$work"' EXIT

judges=(verify-modules-install verify-installed-analysis verify-worker-console)
if [[ "$source_fixture" == --worker-fixture ]]; then
  createdb template_identity
  psql -Xq -d template_identity -v ON_ERROR_STOP=1 -f "$scripts/../tests/fixtures/worker-console-identity.sql"
  source_fixture="$work/identity.dump"
  pg_dump --schema-only --no-owner --no-acl -Fc -d template_identity -f "$source_fixture"
  judges=(verify-worker-console)
fi
export MODULAR_EXPECTED_SHA="$revision" NEXT_TELEMETRY_DISABLED=1
echo "Application $revision"
sha256sum "$source_fixture"
result=0
for i in "${!judges[@]}"; do
  judge=${judges[$i]}
  db=recipe_$i
  createdb "$db"
  pg_restore --exit-on-error --no-owner --no-acl --dbname="$db" "$source_fixture"
  export DATABASE_URL="postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$db"
  export MODULAR_TEST_DATABASE_URL="$DATABASE_URL"
  if [[ "$judge" == verify-modules-install ]]; then
    MODULAR_QA_EMAIL="qualification-$(openssl rand -hex 8)@example.test"
    MODULAR_QA_PASSWORD=$(openssl rand -hex 24)
    export MODULAR_QA_EMAIL MODULAR_QA_PASSWORD
    if ! node "$scripts/seed-module-install-fixture.cjs" "$app"; then
      echo "FAIL $judge (identity seed)" >&2
      result=1
      continue
    fi
  fi
  if "$python" "$scripts/$judge.py" "$app"; then
    echo "PASS $judge"
  else
    echo "FAIL $judge" >&2
    result=1
  fi
done
exit "$result"
