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

db-setup: ## Setup database using automated script (recommended)
	./scripts/setup-database.sh

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
# KUBERNETES DEPLOYMENTS
# =============================================================================

k8s-deploy: ## Deploy to Kubernetes using Kustomize
	cd k8s && kubectl apply -k .

k8s-status: ## Show Kubernetes deployment status
	kubectl get all -n sakumari

k8s-pods: ## Show pod status and watch for changes
	kubectl get pods -n sakumari -w

k8s-logs: ## Show application logs in Kubernetes
	kubectl logs -n sakumari deployment/sakumari-app -f

k8s-logs-db: ## Show database logs in Kubernetes
	kubectl logs -n sakumari deployment/postgres -f

k8s-logs-tunnel: ## Show Cloudflare tunnel logs
	kubectl logs -n sakumari deployment/cloudflare-tunnel -f

k8s-secrets: ## Show generated secrets (with hash suffixes)
	kubectl get secrets -n sakumari

k8s-port-forward: ## Port forward to database for setup
	kubectl port-forward -n sakumari svc/postgres-service 5432:5432

k8s-db-setup: ## Setup database in Kubernetes (run from project root, requires k8s-port-forward first)
	pnpm prisma migrate deploy && pnpm db:seed

k8s-restart-app: ## Restart application deployment
	kubectl rollout restart deployment/sakumari-app -n sakumari

k8s-restart-db: ## Restart database deployment
	kubectl rollout restart deployment/postgres -n sakumari

k8s-describe: ## Describe all pods for troubleshooting
	kubectl describe pods -n sakumari

k8s-events: ## Show recent events in namespace
	kubectl get events -n sakumari --sort-by=.metadata.creationTimestamp

k8s-clean: ## Delete Kubernetes namespace and all resources (WARNING: destroys all data)
	kubectl delete namespace sakumari

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

.PHONY: postgres db-admin db-tools db-setup db-reset dev-up prod-up tunnel-up \
        logs logs-app status down clean k8s-deploy k8s-status k8s-pods k8s-logs \
        k8s-logs-db k8s-logs-tunnel k8s-secrets k8s-port-forward k8s-db-setup \
        k8s-restart-app k8s-restart-db k8s-describe k8s-events k8s-clean \
        dev build install lint format test-unit test-db test-e2e test-all