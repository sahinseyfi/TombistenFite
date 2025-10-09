#!/usr/bin/env bash
set -euo pipefail

# Shows Vercel logs for the linked project.
# Usage: scripts/vercel/logs.sh [env-file]

ENV_FILE=${1:-fitcrew-focus/.env.local}
VERCEL_TOKEN_VAL=$(grep -E '^VERCEL_TOKEN=' "$ENV_FILE" | sed 's/^VERCEL_TOKEN=//') || true
if [ -z "${VERCEL_TOKEN_VAL:-}" ]; then
  echo "Uyarı: VERCEL_TOKEN bulunamadı; oturum açık değilse komut çalışmayabilir." >&2
fi

env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel logs --since 1h || true
