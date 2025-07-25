# =============================================================================
# SakuMari Kana Flashcard App - Makefile
# =============================================================================
# This Makefile provides commands for development, testing, and deployment.

# -----------------------------------------------------------------------------
# Variables and Configuration
# -----------------------------------------------------------------------------
PNPM_PRISMA = pnpm exec prisma
DOCKER_COMPOSE = docker compose
DOCKER_DOWN_FLAGS = down -v --remove-orphans --rmi all

# Docker image configuration (used by docker-build command)
IMAGE_NAME ?= sakanbeer88/sakumari
TAG ?= latest

# Docker pull policy configuration
# - build: Builds app from source code (local development)
# - always: Pulls pre-built image from registry (production)
PULL_POLICY_BUILD = PULL_POLICY=build
PULL_POLICY_PROD = PULL_POLICY=always

# -----------------------------------------------------------------------------
# Helper Functions (Internal Use - Called by targets below)
# -----------------------------------------------------------------------------
define docker-pull-policy-up
	$(1) $(DOCKER_COMPOSE) up -d $(2)
endef

define docker-tunnel-up
	$(1) $(DOCKER_COMPOSE) --profile tunnel up -d $(2)
endef

define docker-db-setup-exec
	$(DOCKER_COMPOSE) exec app $(PNPM_PRISMA) generate && \
	$(DOCKER_COMPOSE) exec app $(PNPM_PRISMA) migrate deploy && \
	$(DOCKER_COMPOSE) exec app $(PNPM_PRISMA) db seed
endef

# =============================================================================
# TARGETS
# =============================================================================


# -----------------------------------------------------------------------------
# Development Commands
# -----------------------------------------------------------------------------
dev:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint

format:
	pnpm format

# -----------------------------------------------------------------------------
# Testing Commands  
# -----------------------------------------------------------------------------
test-e2e:
	pnpm test:e2e:build && \
	pnpm test:e2e

test-all:
	pnpm test:run && \
	pnpm test:db:setup && \
	pnpm test:db && \
	pnpm test:db:clean

pre-ci: lint format test-all

# -----------------------------------------------------------------------------
# Database Commands (Prisma ORM)
# -----------------------------------------------------------------------------
generate:
	$(PNPM_PRISMA) generate

migrate:
	$(PNPM_PRISMA) migrate dev

migrate-prod:
	$(PNPM_PRISMA) migrate deploy
	
seed:
	$(PNPM_PRISMA) db seed

studio:
	$(PNPM_PRISMA) studio

reset:
	$(PNPM_PRISMA) migrate reset

setup-db:
	$(PNPM_PRISMA) generate && \
	$(PNPM_PRISMA) migrate dev && \
	$(PNPM_PRISMA) db seed

# -----------------------------------------------------------------------------
# Docker Commands
# -----------------------------------------------------------------------------

# Basic Docker Compose (database + pgAdmin only)
docker-up:
	$(DOCKER_COMPOSE) up -d

docker-down:
	$(DOCKER_COMPOSE) down

docker-clean:
	$(DOCKER_COMPOSE) $(DOCKER_DOWN_FLAGS)

# Application Deployment with Pull Policy
docker-up-build:
	$(call docker-pull-policy-up,$(PULL_POLICY_BUILD))

docker-up-prod:
	$(call docker-pull-policy-up,$(PULL_POLICY_PROD))

docker-up-build-tunnel:
	$(call docker-tunnel-up,$(PULL_POLICY_BUILD))

docker-up-prod-tunnel:
	$(call docker-tunnel-up,$(PULL_POLICY_PROD))

# Database setup in app container
docker-db-setup:
	$(call docker-db-setup-exec)

# Build Docker image
docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .


# Declare all targets as phony to prevent conflicts with files of the same name
.PHONY: dev build lint format test-e2e test-all pre-ci generate migrate migrate-prod seed studio reset setup-db
.PHONY: docker-up docker-down docker-clean docker-up-build docker-up-prod docker-up-build-tunnel docker-up-prod-tunnel
.PHONY: docker-db-setup docker-build