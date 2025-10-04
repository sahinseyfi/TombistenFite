#!/usr/bin/env bash
set -euo pipefail

# Deploys the app to Vercel using token from env file.
# Usage: scripts/vercel/deploy.sh [env-file]

ENV_FILE=${1:-webapp/.env.local}
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
# If webapp/.vercel yoksa kökten çalıştır (monorepo ayarı Vercel projesinde tanımlı olmalı)
if [ -f webapp/.vercel/project.json ]; then
  env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel --prod --confirm --cwd webapp
else
  env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel --prod --confirm
fi
