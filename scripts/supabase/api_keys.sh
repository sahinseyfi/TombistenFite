#!/usr/bin/env bash
set -euo pipefail

# Prints Supabase project API keys (anon/service_role) without storing them.
# Usage: scripts/supabase/api_keys.sh [env-file] [project-ref]

ENV_FILE=${1:-webapp/.env.local}
PROJECT_REF=${2:-}

if [ ! -f "$ENV_FILE" ]; then
  echo "Hata: $ENV_FILE bulunamadı." >&2
  exit 1
fi

if ! supabase --version >/dev/null 2>&1; then
  echo "Hata: Supabase CLI bulunamadı." >&2
  exit 1
fi

if [ -z "$PROJECT_REF" ]; then
  # Try to infer ref from 'supabase projects list'
  plist=$(supabase projects list -o json || true)
  PROJECT_REF=$(printf %s "$plist" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed -E 's/.*"([^"]+)"/\1/')
fi

if [ -z "$PROJECT_REF" ]; then
  echo "Hata: Proje ref bulunamadı. Elle parametre olarak geçin: scripts/supabase/api_keys.sh webapp/.env.local <project-ref>" >&2
  exit 1
fi

supabase projects api-keys --project-ref "$PROJECT_REF" -o pretty

