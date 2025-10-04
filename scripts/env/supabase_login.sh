#!/usr/bin/env bash
set -euo pipefail

# Logs into Supabase CLI using SUPABASE_ACCESS_TOKEN from env file.
# Usage: scripts/env/supabase_login.sh [path-to-env]
# Default env file: webapp/.env.local

ENV_FILE=${1:-webapp/.env.local}

if [ ! -f "$ENV_FILE" ]; then
  echo "Hata: $ENV_FILE bulunamadı. Lütfen webapp/.env.local dosyasını oluşturun." >&2
  exit 1
fi

SUPABASE_TOKEN=""
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|'#'*) continue ;;
  esac
  key=${line%%=*}
  val=${line#*=}
  key=$(echo "$key" | tr -d ' ')
  if [ "$key" = "SUPABASE_ACCESS_TOKEN" ]; then
    SUPABASE_TOKEN="$val"
    break
  fi
done < "$ENV_FILE"

if [ -z "$SUPABASE_TOKEN" ]; then
  echo "Hata: SUPABASE_ACCESS_TOKEN bulunamadı." >&2
  exit 1
fi

# Use --token flag; the value is not printed, and we don't echo it anywhere
supabase login --no-browser --yes --token "$SUPABASE_TOKEN" >/dev/null
echo "Supabase CLI: Oturum açıldı."

