# SakuMari Kana Flashcard App - Development Makefile

# Load configuration constants
DOCKER_COMPOSE_FILE := docker/docker-compose.yml
K8S_NAMESPACE := sakumari

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
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d db

db-admin: ## Start PostgreSQL with DBGate
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d db dbgate

db-setup: ## Setup database using automated script (recommended)
	chmod +x scripts/setup-database.sh && ./scripts/setup-database.sh

db-reset: ## Reset database with fresh data
	pnpm run prisma:reset && pnpm run db:seed

# =============================================================================
# DOCKER DEPLOYMENTS
# =============================================================================

dev-up: ## Start app stack for development (builds app locally)
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d db dbgate app --build

logs: ## Show logs for all services
	docker compose -f $(DOCKER_COMPOSE_FILE) logs -f

logs-app: ## Show app logs only
	docker compose -f $(DOCKER_COMPOSE_FILE) logs -f app

status: ## Show service status
	docker compose -f $(DOCKER_COMPOSE_FILE) ps

down: ## Stop all services
	docker compose -f $(DOCKER_COMPOSE_FILE) down

clean: ## Stop and remove all containers, volumes, images
	docker compose -f $(DOCKER_COMPOSE_FILE) down --volumes --rmi all --remove-orphans

# =============================================================================
# KUBERNETES DEPLOYMENTS
# =============================================================================

k8s-deploy: ## Deploy to Kubernetes using Kustomize
	cd k8s && kubectl apply -k .

k8s-dashboard-deploy: ## Deploy Kubernetes Dashboard separately
	cd k8s && kubectl apply -k . -f dashboard-kustomization.yaml

k8s-dashboard-token: ## Get bearer token for dashboard access
	kubectl -n kubernetes-dashboard create token admin-user

k8s-dashboard-port-forward: ## Port forward to dashboard (access at https://localhost:8443)
	kubectl port-forward -n kubernetes-dashboard svc/kubernetes-dashboard 8443:443

k8s-status: ## Show Kubernetes deployment status
	kubectl get all -n $(K8S_NAMESPACE)

k8s-pods: ## Show pod status and watch for changes
	kubectl get pods -n $(K8S_NAMESPACE) -w

k8s-logs: ## Show application logs in Kubernetes
	kubectl logs -n $(K8S_NAMESPACE) deployment/sakumari-app -f

k8s-logs-db: ## Show database logs in Kubernetes
	kubectl logs -n $(K8S_NAMESPACE) deployment/postgres -f

k8s-logs-tunnel: ## Show Cloudflare tunnel logs
	kubectl logs -n $(K8S_NAMESPACE) deployment/cloudflare-tunnel -f

k8s-secrets: ## Show generated secrets (with hash suffixes)
	kubectl get secrets -n $(K8S_NAMESPACE)

k8s-port-forward: ## Port forward to database for setup
	kubectl port-forward -n $(K8S_NAMESPACE) svc/postgres-service 5432:5432

k8s-db-setup: ## Setup database in Kubernetes (run from project root, requires k8s-port-forward first)
	pnpm run prisma:generate && npx prisma migrate deploy && pnpm run db:seed

k8s-restart-app: ## Restart application deployment
	kubectl rollout restart deployment/sakumari-app -n $(K8S_NAMESPACE)

k8s-restart-db: ## Restart database deployment
	kubectl rollout restart deployment/postgres -n $(K8S_NAMESPACE)

k8s-describe: ## Describe all pods for troubleshooting
	kubectl describe pods -n $(K8S_NAMESPACE)

k8s-events: ## Show recent events in namespace
	kubectl get events -n $(K8S_NAMESPACE) --sort-by=.metadata.creationTimestamp

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
	docker compose -f $(DOCKER_COMPOSE_FILE) down --volumes

test-all: lint format test-unit test-db test-e2e ## Run all tests and quality checks

# =============================================================================
# PHONY DECLARATIONS
# =============================================================================

.PHONY: postgres db-admin db-setup db-reset dev-up \
        logs logs-app status down clean k8s-deploy k8s-dashboard-deploy k8s-dashboard-token \
        k8s-dashboard-port-forward k8s-status k8s-pods k8s-logs k8s-logs-db k8s-logs-tunnel \
        k8s-secrets k8s-port-forward k8s-db-setup k8s-restart-app k8s-restart-db \
        k8s-describe k8s-events k8s-clean \
        dev build install lint format test-unit test-db test-e2e test-e2e-setup test-e2e-clean test-all