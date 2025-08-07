# SakuMari Kana Flashcard App - Development Makefile

# Configuration constants
DOCKER_COMPOSE_FILE := docker/docker-compose.yml
DOCKER_COMPOSE_CMD := docker compose -f $(DOCKER_COMPOSE_FILE)
K8S_NAMESPACE := sakumari

# Reusable functions
define k8s_logs
	kubectl logs -n $(K8S_NAMESPACE) deployment/$(1) -f
endef

define k8s_restart
	kubectl rollout restart deployment/$(1) -n $(K8S_NAMESPACE)
endef

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
# KUBERNETES DEPLOYMENTS
# =============================================================================

k8s-deploy: ## Deploy to Kubernetes using Kustomize
	cd k8s && kubectl apply -k .

k8s-status: ## Show Kubernetes deployment status
	kubectl get all -n $(K8S_NAMESPACE)

k8s-logs: ## Show logs for service (usage: make k8s-logs SERVICE=sakumari-app)
	$(call k8s_logs,$(or $(SERVICE),sakumari-app))

k8s-restart: ## Restart deployment (usage: make k8s-restart SERVICE=sakumari-app)
	$(call k8s_restart,$(or $(SERVICE),sakumari-app))

k8s-db-setup: ## Setup database in Kubernetes (requires: kubectl port-forward -n sakumari svc/postgres-service 5432:5432)
	pnpm run prisma:generate && pnpm run prisma:migrate:deploy && pnpm run db:seed

k8s-clean: ## Delete Kubernetes namespace and all resources (WARNING: destroys all data)
	kubectl delete namespace $(K8S_NAMESPACE)

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
        k8s-deploy k8s-status k8s-logs k8s-restart k8s-db-setup k8s-clean \
        dev build install lint format test-unit test-db test-e2e test-e2e-setup test-e2e-clean test-all