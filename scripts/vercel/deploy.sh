#!/usr/bin/env bash
set -euo pipefail

# Deploys the app to Vercel using token from env file.
# Usage: scripts/vercel/deploy.sh [env-file]

ENV_FILE=${1:-fitcrew-focus/.env.local}
if [ ! -f "$ENV_FILE" ]; then
  echo "Hata: $ENV_FILE bulunamadı." >&2
  exit 1
fi

VERCEL_TOKEN_VAL=$(grep -E '^VERCEL_TOKEN=' "$ENV_FILE" | sed 's/^VERCEL_TOKEN=//')
if [ -z "$VERCEL_TOKEN_VAL" ]; then
  echo "Hata: VERCEL_TOKEN bulunamadı (.env.local)." >&2
  exit 1
fi

# Use existing link in .vercel/project.json
env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel --prod --yes
