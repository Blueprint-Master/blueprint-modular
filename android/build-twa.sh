#!/usr/bin/env bash
# Construit l'APK Android (Trusted Web Activity) depuis android/twa-manifest.json.
#
# Bubblewrap génère le projet Gradle à partir de la configuration commitée, puis
# Gradle assemble l'APK de release. Les icônes sont servies depuis CE dépôt par un
# serveur local (127.0.0.1:8765) : l'APK embarque exactement les icônes relues en
# revue, jamais ce que le site en ligne sert au moment du build.
#
# Signature :
#   - si ANDROID_KEYSTORE_B64, ANDROID_KEYSTORE_PASSWORD et ANDROID_KEY_PASSWORD
#     sont posés, l'APK est signé avec la clé de release (alias de twa-manifest.json) ;
#   - sinon l'APK sort NON SIGNÉ (app-release-unsigned-aligned.apk), à signer hors CI
#     avec apksigner. Un APK non signé ne s'installe pas : ce n'est pas un livrable.
#
# Prérequis : JDK 17 (JAVA_HOME), Android SDK (ANDROID_HOME ou ANDROID_SDK_ROOT),
# Node 18+. Sortie : $TWA_OUT_DIR (défaut : android/out).
set -euo pipefail

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
BUBBLEWRAP_VERSION="1.27.0"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
OUT="${TWA_OUT_DIR:-$RACINE/android/out}"
WORK="$(mktemp -d)"

[ -n "${JAVA_HOME:-}" ] || { echo "JAVA_HOME absent (JDK 17 requis)" >&2; exit 1; }
[ -n "$SDK" ] || { echo "ANDROID_HOME / ANDROID_SDK_ROOT absent" >&2; exit 1; }
grep -q 'JAVA_VERSION="17' "$JAVA_HOME/release" || { echo "JAVA_HOME n'est pas un JDK 17 : $JAVA_HOME" >&2; exit 1; }

# Serveur d'icônes local, arrêté à la sortie quoi qu'il arrive.
python3 -m http.server 8765 --bind 127.0.0.1 --directory "$RACINE" >/dev/null 2>&1 &
SERVEUR=$!
trap 'kill "$SERVEUR" 2>/dev/null || true; rm -rf "$WORK"' EXIT
for _ in $(seq 1 50); do
  curl -fsS -o /dev/null "http://127.0.0.1:8765/android/twa-manifest.json" && break
  sleep 0.2
done
curl -fsS -o /dev/null "http://127.0.0.1:8765/android/twa-manifest.json" || { echo "serveur d'icônes injoignable" >&2; exit 1; }

# Configuration Bubblewrap non interactive (sinon il propose d'installer JDK et SDK).
mkdir -p "$HOME/.bubblewrap"
printf '{"jdkPath":"%s","androidSdkPath":"%s"}\n' "$JAVA_HOME" "$SDK" > "$HOME/.bubblewrap/config.json"

cp "$RACINE/android/twa-manifest.json" "$WORK/twa-manifest.json"
cd "$WORK"
npx -y "@bubblewrap/cli@$BUBBLEWRAP_VERSION" update --skipVersionUpgrade --manifest="$WORK/twa-manifest.json"

mkdir -p "$OUT"
if [ -n "${ANDROID_KEYSTORE_B64:-}" ] && [ -n "${ANDROID_KEYSTORE_PASSWORD:-}" ] && [ -n "${ANDROID_KEY_PASSWORD:-}" ]; then
  printf '%s' "$ANDROID_KEYSTORE_B64" | base64 -d > "$WORK/android.keystore"
  BUBBLEWRAP_KEYSTORE_PASSWORD="$ANDROID_KEYSTORE_PASSWORD" BUBBLEWRAP_KEY_PASSWORD="$ANDROID_KEY_PASSWORD" \
    npx -y "@bubblewrap/cli@$BUBBLEWRAP_VERSION" build --manifest="$WORK/twa-manifest.json"
  rm -f "$WORK/android.keystore"
  cp app-release-signed.apk "$OUT/"
  cp app-release-bundle.aab "$OUT/" 2>/dev/null || true
else
  npx -y "@bubblewrap/cli@$BUBBLEWRAP_VERSION" build --skipSigning --manifest="$WORK/twa-manifest.json"
  cp app-release-unsigned-aligned.apk "$OUT/"
fi
ls -l "$OUT"
