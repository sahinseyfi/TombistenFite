#!/usr/bin/env bash
set -euo pipefail

# Lists Vercel env vars for the linked project
# Usage: scripts/vercel/env_list.sh [env-file]

ENV_FILE=${1:-webapp/.env.local}
VERCEL_TOKEN_VAL=$(grep -E '^VERCEL_TOKEN=' "$ENV_FILE" | sed 's/^VERCEL_TOKEN=//') || true
if [ -f webapp/.vercel/project.json ]; then
  env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel env list --cwd webapp || true
else
  env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel env list || true
fi
