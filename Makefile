SHELL := /usr/bin/env bash

.PHONY: setup dev build test format env:vercel:push env:github:push supabase:login vercel:deploy vercel:logs vercel:env:list supabase:api-keys

setup:
	@echo "+ Kurulum: webapp bağımlılıkları yükleniyor"
	cd webapp && npm ci

dev:
	cd webapp && npm run dev

build:
	cd webapp && npm run build

test:
	cd webapp && npm run test

format:
	cd webapp && npm run format

env:vercel:push:
	@./scripts/env/push_vercel_env.sh webapp/.env.local

env:github:push:
	@./scripts/env/push_github_secrets.sh webapp/.env.local

supabase:login:
	@./scripts/env/supabase_login.sh webapp/.env.local

vercel:deploy:
	@./scripts/vercel/deploy.sh webapp/.env.local

vercel:logs:
	@./scripts/vercel/logs.sh webapp/.env.local

vercel:env:list:
	@./scripts/vercel/env_list.sh webapp/.env.local

supabase:api-keys:
	@./scripts/supabase/api_keys.sh webapp/.env.local
