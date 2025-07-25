# SakuMari Kana Flashcard App - Development Makefile

.DEFAULT_GOAL := help
.PHONY: help

# =============================================================================
# HELP
# =============================================================================

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "%-20s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# =============================================================================
# DATABASE (Standalone for local development)
# =============================================================================

postgres: ## Start PostgreSQL database only
	docker compose up -d db

db-admin: ## Start PostgreSQL with pgAdmin
	docker compose up -d db pgadmin

db-tools: ## Start PostgreSQL with pgAdmin and Portainer
	docker compose up -d db pgadmin portainer

db-setup: ## Setup database (generate + migrate + seed)
	pnpm prisma:generate && pnpm prisma:migrate && pnpm db:seed

db-setup-docker: ## Setup database inside Docker container (for full stack deployment)
	docker compose exec app sh -c "pnpm prisma:generate && pnpm prisma:migrate && pnpm db:seed"

db-reset: ## Reset database with fresh data
	pnpm prisma:reset --force && pnpm db:seed

# =============================================================================
# DOCKER DEPLOYMENTS
# =============================================================================

dev-up: ## Start app stack with build policy (excludes tunnel)
	PULL_POLICY=build docker compose up -d db pgadmin portainer app

prod-up: ## Start app stack with always pull policy (excludes tunnel)
	PULL_POLICY=always docker compose up -d db pgadmin portainer app

tunnel-up: ## Start production stack with Cloudflare tunnel
	PULL_POLICY=always docker compose --profile tunnel up -d

logs: ## Show logs for all services
	docker compose logs -f

logs-app: ## Show app logs only
	docker compose logs -f app

status: ## Show service status
	docker compose ps

down: ## Stop all services
	docker compose down

clean: ## Stop and remove all containers, volumes, images
	docker compose down --volumes --rmi all --remove-orphans

# =============================================================================
# DEVELOPMENT
# =============================================================================

dev: ## Start local development server
	pnpm dev

build: ## Build application for production
	pnpm build

install: ## Install dependencies
	pnpm install

# =============================================================================
# QUALITY & TESTING
# =============================================================================

lint: ## Run ESLint
	pnpm lint

format: ## Format code with Prettier
	pnpm format

test-unit: ## Run unit tests
	pnpm test:run

test-db: ## Run database tests
	pnpm test:db:setup && pnpm test:db

test-e2e: ## Run E2E tests (full workflow)
	pnpm test:e2e:setup && pnpm test:e2e:build && pnpm test:e2e

test-all: lint format test-unit test-db test-e2e ## Run all tests and quality checks

# =============================================================================
# PHONY DECLARATIONS
# =============================================================================

.PHONY: postgres db-admin db-tools db-setup db-setup-docker db-reset dev-up prod-up tunnel-up \
        logs logs-app status down clean dev build install lint format \
        test-unit test-db test-e2e test-all