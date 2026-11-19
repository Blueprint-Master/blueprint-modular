#!/usr/bin/env bash
# Complète la sortie standalone de Next avec les fichiers servis ou lus à l'exécution.
set -euo pipefail
cd "${REPO_DIR:-$(dirname "$0")/..}"
target=.next/standalone
if [[ -f "$target/blueprint-modular/server.js" ]]; then
  target="$target/blueprint-modular"
fi
[[ -f "$target/server.js" ]] || { echo 'Build standalone introuvable' >&2; exit 1; }
mkdir -p "$target/.next/static" "$target/public" "$target/lib/asset-manager/config"
cp -R .next/static/. "$target/.next/static/"
cp -R public/. "$target/public/"
cp -R lib/asset-manager/config/. "$target/lib/asset-manager/config/"
