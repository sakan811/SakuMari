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

# Docker Compose profiles (see docker-compose.yml for service definitions)
# - build: Builds app from source code (development) - runs on port 3001
# - prod: Uses pre-built image (production) - runs on port 3000  
# - tunnel: Adds Cloudflare tunnel (production with external access)
PROFILE_BUILD = --profile build
PROFILE_PROD = --profile prod
PROFILE_TUNNEL = --profile tunnel
PROFILE_PROD_TUNNEL = $(PROFILE_PROD) $(PROFILE_TUNNEL)

# -----------------------------------------------------------------------------
# Helper Functions (Internal Use - Called by targets below)
# -----------------------------------------------------------------------------
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

# Application Deployment Profiles
docker-up-build:
	$(call docker-profile-up,$(PROFILE_BUILD),--build)

docker-up-prod:
	$(call docker-profile-up,$(PROFILE_PROD))

docker-up-prod-tunnel:
	$(call docker-profile-up,$(PROFILE_PROD_TUNNEL))

# Stop specific profiles
docker-down-build:
	$(call docker-profile-down,$(PROFILE_BUILD))

docker-down-prod:
	$(call docker-profile-down,$(PROFILE_PROD))

docker-down-prod-tunnel:
	$(call docker-profile-down,$(PROFILE_PROD_TUNNEL))

# Clean specific profiles (remove containers, volumes, images)
docker-clean-build:
	$(call docker-profile-clean,$(PROFILE_BUILD))

docker-clean-prod:
	$(call docker-profile-clean,$(PROFILE_PROD))

docker-clean-prod-tunnel:
	$(call docker-profile-clean,$(PROFILE_PROD_TUNNEL))

# Database setup in containers
docker-build-db-setup:
	$(call docker-db-setup-exec,app-build)

docker-db-setup:
	$(call docker-db-setup-exec,app)

# Build Docker image
docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .


# Declare all targets as phony to prevent conflicts with files of the same name
.PHONY: dev build lint format test-e2e test-all pre-ci generate migrate migrate-prod seed studio reset setup-db
.PHONY: docker-up docker-down docker-clean docker-up-build docker-up-prod docker-up-prod-tunnel
.PHONY: docker-down-build docker-down-prod docker-down-prod-tunnel docker-clean-build docker-clean-prod docker-clean-prod-tunnel
.PHONY: docker-build-db-setup docker-db-setup docker-build