# =============================================================================
# SakuMari Kana Flashcard App - Makefile
# =============================================================================

# Variables
COMPOSE := docker compose
DOCKER_EXEC := $(COMPOSE) exec app pnpm exec prisma
PULL_POLICY_BUILD := PULL_POLICY=build
PULL_POLICY_PROD := PULL_POLICY=always

# Docker compose helper function
define docker-up
	$(if $(1),$(1),) $(COMPOSE) $(if $(2),--profile $(2),) up -d
endef

# =============================================================================
# ESSENTIAL WORKFLOWS (Non-redundant with package.json)
# =============================================================================

# Multi-step workflows that add value beyond simple pnpm scripts
test-unit: ## Run all unit and database tests
	pnpm test:run && pnpm test:db:setup && pnpm test:db && pnpm test:db:clean

test-e2e-full: ## Complete E2E workflow with setup
	pnpm test:e2e:setup && pnpm test:e2e:build && pnpm test:e2e

test-all: ## Run all tests and checks (full CI workflow)
	pnpm lint && pnpm format && $(MAKE) test-unit && $(MAKE) test-e2e-full

db-setup: ## Setup database (generate + migrate + seed)
	pnpm prisma:generate && pnpm prisma:migrate && pnpm db:seed

# Docker workflows (value-added orchestration)
docker-dev: ## Start app with database (build from source)
	$(call docker-up,$(PULL_POLICY_BUILD))

docker-prod: ## Start app with database (pull from registry)
	$(call docker-up,$(PULL_POLICY_PROD))

docker-dev-tunnel: ## Start app with tunnel (build from source)
	$(call docker-up,$(PULL_POLICY_BUILD),tunnel)

docker-prod-tunnel: ## Start app with tunnel (pull from registry)
	$(call docker-up,$(PULL_POLICY_PROD),tunnel)

docker-db-setup: ## Setup database in Docker container
	$(DOCKER_EXEC) generate
	$(DOCKER_EXEC) migrate deploy
	$(DOCKER_EXEC) db seed

docker-clean: ## Stop and remove all containers, volumes, and images
	$(COMPOSE) down -v --remove-orphans --rmi all

# =============================================================================
# DEVELOPMENT ALIASES (Optional - for discoverability)
# =============================================================================

# Keep only the most commonly used commands as aliases
dev: ## Start development server
	pnpm dev

build: ## Build production application
	pnpm build

lint: ## Run linter
	pnpm lint

format: ## Format code
	pnpm format

# Docker core services
docker-up: ## Start database, pgAdmin, and Portainer only
	$(COMPOSE) up -d

docker-down: ## Stop all services
	$(COMPOSE) down

docker-build: ## Build Docker image
	docker build -t sakanbeer88/sakumari:latest .

# =============================================================================
# BACKWARD COMPATIBILITY
# =============================================================================

pre-ci: test-all ## Run pre-commit checks (full test suite)
setup-db: db-setup ## Setup database (alias)

.PHONY: test-unit test-e2e-full test-all db-setup 
.PHONY: docker-dev docker-prod docker-dev-tunnel docker-prod-tunnel docker-db-setup docker-clean
.PHONY: dev build lint format docker-up docker-down docker-build
.PHONY: pre-ci setup-db