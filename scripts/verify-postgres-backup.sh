#!/usr/bin/env bash
# Execute only inside the disposable PostgreSQL 16 CI service.
set -euo pipefail
[[ "${PGDATABASE:-}" == "modular_test" && "${PGUSER:-}" == "modular" ]]
script=${1:?Path to backup-postgres.sh}
testdir=$(mktemp -d)
trap 'rm -rf -- "$testdir"' EXIT
psql -X --set=ON_ERROR_STOP=1 <<'SQL'
BEGIN;
INSERT INTO "User" (id,email,"updatedAt") VALUES ('restore-operator','restore@example.test',now());
INSERT INTO "Asset" (id,domain_id,asset_type_id,reference,label,status_id,created_by_id,updated_at)
VALUES ('restore-asset','it','laptop','RESTORE-QA','Portable restauration','in_stock','restore-operator',now());
INSERT INTO "AssetAttribute" (id,asset_id,key,value_number) VALUES ('restore-ram','restore-asset','ram_go',32);
INSERT INTO "AuditLog" (id,domain_id,user_id,action,resource_type,resource_id,after_state)
VALUES ('restore-audit','it','restore-operator','create','asset','restore-asset','{"label":"Portable restauration"}');
COMMIT;
SQL
mkdir -p "$testdir/$PGDATABASE"
expired="$testdir/$PGDATABASE/blueprint-20250101T000000Z-AAAAAA.dump"
other="$testdir/$PGDATABASE/foreign.dump"
touch -d '32 days ago' "$expired" "$other"
archive=$(bash "$script" backup "$testdir")
[[ -s "$archive" && ! -e "$expired" && -f "$other" ]]
[[ $(stat -c %a "$archive") == 600 ]]
createdb modular_restore_qa
export PGDATABASE=modular_restore_qa
# A truncated archive must never leave a partially populated target.
head -c "$(( $(wc -c < "$archive") / 2 ))" "$archive" > "$testdir/broken.dump"
if bash "$script" restore "$testdir/broken.dump"; then exit 1; fi
[[ $(psql -XAtc "SELECT count(*) FROM pg_tables WHERE schemaname='public'") == 0 ]]
bash "$script" restore "$archive"
if bash "$script" restore "$archive"; then exit 1; fi
restored=$(psql -XAt --set=ON_ERROR_STOP=1 <<'SQL'
SELECT a.label, v.value_number, u.email, j.action, j.after_state::json->>'label'
FROM "Asset" a
JOIN "AssetAttribute" v ON v.asset_id=a.id AND v.key='ram_go'
JOIN "AuditLog" j ON j.resource_id=a.id
JOIN "User" u ON u.id=j.user_id
WHERE a.id='restore-asset';
SQL
)
[[ "$restored" == 'Portable restauration|32|restore@example.test|create|Portable restauration' ]]
echo 'Standalone database backup restored asset, attribute, actor and audit receipt.'
