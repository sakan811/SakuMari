# Common commands
PNPM_PRISMA = pnpm exec prisma
DOCKER_COMPOSE = docker compose
DOCKER_DOWN_FLAGS = down -v --remove-orphans --rmi all

# Profile definitions
PROFILE_BUILD = --profile build
PROFILE_PROD = --profile prod
PROFILE_TUNNEL = --profile tunnel
PROFILE_PROD_TUNNEL = $(PROFILE_PROD) $(PROFILE_TUNNEL)

# Generic Docker functions
define docker-profile-up
	$(DOCKER_COMPOSE) $(1) up -d $(2)
endef

define docker-profile-down
	$(DOCKER_COMPOSE) $(1) down
endef

define docker-profile-clean
	$(DOCKER_COMPOSE) $(1) $(DOCKER_DOWN_FLAGS)
endef

define docker-db-setup-exec
	$(DOCKER_COMPOSE) exec $(1) $(PNPM_PRISMA) generate && \
	$(DOCKER_COMPOSE) exec $(1) $(PNPM_PRISMA) migrate deploy && \
	$(DOCKER_COMPOSE) exec $(1) $(PNPM_PRISMA) db seed
endef

# Default target
help: ## Show this help message
	@echo "SakuMari Kana Flashcard App - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'
	@echo ""
	@echo "Usage: make <target> [OPTION=value]"
	@echo "Example: make docker-build IMAGE_NAME=myapp TAG=v1.0.0"

dev: ## Start development server
	pnpm dev

build: ## Build production application
	pnpm build

lint: ## Run ESLint
	pnpm lint

format: ## Format code with Prettier
	pnpm format

test-e2e: ## Run E2E tests
	pnpm test:e2e:build && \
	pnpm test:e2e

test-all: ## Run all tests (unit + db + cleanup)
	pnpm test:run && \
	pnpm test:db:setup && \
	pnpm test:db && \
	pnpm test:db:clean

pre-ci: lint format test-all ## Run pre-commit checks (lint, format, tests)

generate: ## Generate Prisma client
	$(PNPM_PRISMA) generate

migrate: ## Run database migrations
	$(PNPM_PRISMA) migrate dev

migrate-prod: ## Deploy migrations to production
	$(PNPM_PRISMA) migrate deploy
	
seed: ## Seed database with Kana data
	$(PNPM_PRISMA) db seed

studio: ## Open Prisma Studio
	$(PNPM_PRISMA) studio

reset: ## Reset database (destructive)
	$(PNPM_PRISMA) migrate reset

setup-db: ## Setup database (generate + migrate + seed)
	$(PNPM_PRISMA) generate && \
	$(PNPM_PRISMA) migrate dev && \
	$(PNPM_PRISMA) db seed

# Docker Compose commands
docker-up: ## Start PostgreSQL database
	$(DOCKER_COMPOSE) up -d

docker-down: ## Stop services
	$(DOCKER_COMPOSE) down

docker-clean: ## Stop and remove all containers, volumes, images
	$(DOCKER_COMPOSE) $(DOCKER_DOWN_FLAGS)

# Profile-based compose commands
docker-up-build: ## Build and run from source (port 3001)
	$(call docker-profile-up,$(PROFILE_BUILD),--build)

docker-up-prod: ## Production without tunnel (port 3000)
	$(call docker-profile-up,$(PROFILE_PROD))

docker-up-prod-tunnel: ## Production with Cloudflare tunnel
	$(call docker-profile-up,$(PROFILE_PROD_TUNNEL))

docker-down-build: ## Stop build profile services
	$(call docker-profile-down,$(PROFILE_BUILD))

docker-down-prod: ## Stop prod profile services
	$(call docker-profile-down,$(PROFILE_PROD))

docker-down-prod-tunnel: ## Stop prod+tunnel profile services
	$(call docker-profile-down,$(PROFILE_PROD_TUNNEL))

docker-clean-build: ## Clean build profile (remove all)
	$(call docker-profile-clean,$(PROFILE_BUILD))

docker-clean-prod: ## Clean prod profile (remove all)
	$(call docker-profile-clean,$(PROFILE_PROD))

docker-clean-prod-tunnel: ## Clean prod+tunnel profile (remove all)
	$(call docker-profile-clean,$(PROFILE_PROD_TUNNEL))

docker-build-db-setup: ## Setup database in build container
	$(call docker-db-setup-exec,app-build)

docker-db-setup: ## Setup database in prod container
	$(call docker-db-setup-exec,app)

# Build Docker image
# Usage: make docker-build [IMAGE_NAME=sakumari] [TAG=latest]
docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME):$(TAG) .

# Set default values for image build
IMAGE_NAME ?= sakanbeer88/sakumari
TAG ?= latest

# Declare all targets as phony to prevent conflicts with files of the same name
.PHONY: help dev build lint format test-e2e test-all pre-ci generate migrate migrate-prod seed studio reset setup-db
.PHONY: docker-up docker-down docker-clean docker-up-build docker-up-prod docker-up-prod-tunnel
.PHONY: docker-down-build docker-down-prod docker-down-prod-tunnel docker-clean-build docker-clean-prod docker-clean-prod-tunnel
.PHONY: docker-build-db-setup docker-db-setup docker-build