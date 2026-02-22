#!/usr/bin/env bash
# Health check pour Blueprint Modular (Next.js)
# Usage: ./health-check.sh [base_url]
set -e
BASE="${1:-http://localhost:3000}"
echo "Health check: $BASE/api/health"
curl -sf "$BASE/api/health" | head -c 200
echo ""
echo "OK"
