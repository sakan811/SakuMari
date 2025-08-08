# SakuMari Kana Flashcard App - Development Makefile

# Configuration constants
DOCKER_COMPOSE_FILE := docker/docker-compose.yml
DOCKER_COMPOSE_CMD := docker compose -f $(DOCKER_COMPOSE_FILE)

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
	$(DOCKER_COMPOSE_CMD) up -d db

db-admin: ## Start PostgreSQL with DBGate
	$(DOCKER_COMPOSE_CMD) up -d db dbgate

db-setup: ## Setup database using automated script (recommended)
	chmod +x scripts/setup-database.sh && ./scripts/setup-database.sh

db-reset: ## Reset database with fresh data
	pnpm run prisma:reset && pnpm run db:seed

# =============================================================================
# DOCKER DEPLOYMENTS
# =============================================================================

dev-up: ## Start app stack for development (builds app locally)
	$(DOCKER_COMPOSE_CMD) up -d db dbgate app --build

logs: ## Show logs for all services
	$(DOCKER_COMPOSE_CMD) logs -f

logs-app: ## Show app logs only
	$(DOCKER_COMPOSE_CMD) logs -f app

status: ## Show service status
	$(DOCKER_COMPOSE_CMD) ps

down: ## Stop all services
	$(DOCKER_COMPOSE_CMD) down

clean: ## Stop and remove all containers, volumes, images
	$(DOCKER_COMPOSE_CMD) down --volumes --rmi all --remove-orphans


# =============================================================================
# DEVELOPMENT
# =============================================================================

dev: ## Start local development server
	pnpm run dev

build: ## Build application for production
	pnpm run build

install: ## Install dependencies
	pnpm install

# =============================================================================
# QUALITY & TESTING
# =============================================================================

lint: ## Run ESLint
	pnpm run lint

format: ## Format code with Prettier
	pnpm run format

test-unit: ## Run unit tests
	pnpm run test:run

test-db: ## Run database tests
	pnpm run test:db:setup && pnpm run test:db

test-e2e: ## Run E2E tests (simplified: database + Playwright webServer)
	pnpm run test:e2e:setup && pnpm run test:e2e:build && pnpm run test:e2e

test-e2e-setup: ## Setup E2E testing environment (database only)
	pnpm run test:e2e:setup

test-e2e-clean: ## Clean up E2E testing environment
	$(DOCKER_COMPOSE_CMD) down --volumes

test-all: lint format test-unit test-db test-e2e ## Run all tests and quality checks

# =============================================================================
# PHONY DECLARATIONS
# =============================================================================

.PHONY: postgres db-admin db-setup db-reset dev-up logs logs-app status down clean \
        dev build install lint format test-unit test-db test-e2e test-e2e-setup test-e2e-clean test-all