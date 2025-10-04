#!/usr/bin/env bash
set -euo pipefail

# Pushes secrets from an .env file to GitHub repository secrets using gh CLI.
# Usage: scripts/env/push_github_secrets.sh [path-to-env]
# Default env file: webapp/.env.local

ENV_FILE=${1:-webapp/.env.local}

if [ ! -f "$ENV_FILE" ]; then
  echo "Hata: $ENV_FILE bulunamadı. Lütfen webapp/.env.local dosyasını oluşturun." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Hata: gh CLI oturumu yok. 'gh auth login' ile GitHub hesabınızda oturum açın." >&2
  exit 1
fi

origin_url=$(git config --get remote.origin.url)
if [ -z "$origin_url" ]; then
  echo "Hata: Git remote.origin bulunamadı." >&2
  exit 1
fi

# Extract owner/repo from typical URL formats
repo=$(echo "$origin_url" | sed -E 's#(git@github.com:|https://github.com/)([^/]+/[^.]+)(\.git)?#\2#')
if [ -z "$repo" ]; then
  echo "Hata: Depo adı çözümlenemedi (origin: $origin_url)." >&2
  exit 1
fi

declare -A KV
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|'#'*) continue ;;
  esac
  key=${line%%=*}
  val=${line#*=}
  key=$(echo "$key" | tr -d ' ')
  if [ -n "$key" ]; then
    KV["$key"]="$val"
  fi
done < "$ENV_FILE"

for k in "${!KV[@]}"; do
  v="${KV[$k]}"
  # Skip empty values
  if [ -z "$v" ]; then
    echo "Atlandı: $k değeri boş görünüyor."
    continue
  fi
  # Pipe value via stdin to avoid shell history/args exposure
  if printf '%s' "$v" | gh secret set "$k" --repo "$repo" -b- >/dev/null; then
    echo "GitHub Secrets: $k ayarlandı."
  else
    echo "Uyarı: $k ayarlanamadı." >&2
  fi
done

echo "Bitti: GitHub repo secret'ları güncellendi ($repo)."
