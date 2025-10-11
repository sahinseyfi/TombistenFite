SHELL := /usr/bin/env bash
APP_DIR := fitcrew-focus
PNPM := pnpm

.PHONY: setup dev build start lint typecheck format test env:vercel:push env:github:push supabase:login vercel:deploy vercel:logs vercel:env:list supabase:api-keys

setup:
	@echo "+ Kurulum: $(APP_DIR) bağımlılıkları yükleniyor"
	cd $(APP_DIR) && $(PNPM) install

dev:
	cd $(APP_DIR) && $(PNPM) dev

build:
	cd $(APP_DIR) && $(PNPM) build

start:
	cd $(APP_DIR) && $(PNPM) start

lint:
	cd $(APP_DIR) && $(PNPM) lint

typecheck:
	cd $(APP_DIR) && $(PNPM) typecheck

format:
	cd $(APP_DIR) && $(PNPM) format

test:
	cd $(APP_DIR) && $(PNPM) test

smoke:
	cd $(APP_DIR) && $(PNPM) smoke:api

env:vercel:push:
	@./scripts/env/push_vercel_env.sh $(APP_DIR)/.env.local

env:github:push:
	@./scripts/env/push_github_secrets.sh $(APP_DIR)/.env.local

supabase:login:
	@./scripts/env/supabase_login.sh $(APP_DIR)/.env.local

vercel:deploy:
	@./scripts/vercel/deploy.sh $(APP_DIR)/.env.local

vercel:logs:
	@./scripts/vercel/logs.sh $(APP_DIR)/.env.local

vercel:env:list:
	@./scripts/vercel/env_list.sh $(APP_DIR)/.env.local

supabase:api-keys:
	@./scripts/supabase/api_keys.sh $(APP_DIR)/.env.local
