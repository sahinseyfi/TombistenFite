#!/usr/bin/env bash
set -euo pipefail

# Syncs variables from an .env file to Vercel Project envs (dev/preview/prod)
# Usage: scripts/env/push_vercel_env.sh [path-to-env]
# Default env file: fitcrew-focus/.env.local

ENV_FILE=${1:-fitcrew-focus/.env.local}

if [ ! -f "$ENV_FILE" ]; then
  echo "Hata: $ENV_FILE bulunamadı. Lütfen fitcrew-focus/.env.local dosyasını oluşturun." >&2
  exit 1
fi

if [ ! -f .vercel/project.json ]; then
  echo "Hata: .vercel/project.json yok. Proje yerel olarak Vercel'e linkli değil." >&2
  exit 1
fi

# Read env file without exporting blindly
declare -A KV
while IFS= read -r line || [ -n "$line" ]; do
  # strip comments and trim
  case "$line" in
    ''|'#'*) continue ;;
  esac
  # allow KEY=VALUE (no export, no quotes expansion)
  key=${line%%=*}
  val=${line#*=}
  key=$(echo "$key" | tr -d ' ') # strip spaces around key
  # keep value as-is
  if [ -n "$key" ]; then
    KV["$key"]="$val"
  fi
done < "$ENV_FILE"

VERCEL_TOKEN_VAL=${KV[VERCEL_TOKEN]:-}
if [ -z "$VERCEL_TOKEN_VAL" ]; then
  echo "Uyarı: VERCEL_TOKEN bulunamadı. CLI kimlik doğrulaması için gerekli olabilir." >&2
fi

update_or_add() {
  local key="$1" val="$2" target_env="$3"
  # Try update first, then add if not exists
  if ! printf '%s' "$val" | env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel env update "$key" "$target_env" >/dev/null 2>&1; then
    printf '%s' "$val" | env VERCEL_TOKEN="$VERCEL_TOKEN_VAL" vercel env add "$key" "$target_env" >/dev/null
  fi
}

for k in "${!KV[@]}"; do
  # Don't sync local-only tokens into runtime by default
  if [ "$k" = "VERCEL_TOKEN" ] || [ "$k" = "SUPABASE_ACCESS_TOKEN" ]; then
    continue
  fi
  v="${KV[$k]}"
  # Skip empty values to avoid overwriting with blanks
  if [ -z "$v" ]; then
    echo "Atlandı: $k değeri boş görünüyor."
    continue
  fi
  for envname in development preview production; do
    update_or_add "$k" "$v" "$envname"
  done
  echo "Vercel: $k anahtarı development/preview/production ortamlarına senkronize edildi."
done

echo "Bitti: Vercel ortam değişkenleri güncellendi."
