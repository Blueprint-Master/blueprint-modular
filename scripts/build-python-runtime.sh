#!/usr/bin/env bash
# Build the exact React runtime embedded in the Python wheel and source distribution.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --ignore-scripts --no-audit --no-fund
npm ci --prefix packages/core --ignore-scripts --no-audit --no-fund
npm run build --prefix packages/core
npm ci --prefix bpm/frontend --ignore-scripts --no-audit --no-fund
npm run build --prefix bpm/frontend
