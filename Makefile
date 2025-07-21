dev:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint

format:
	pnpm format

test-e2e:
	pnpm test:e2e:build && \
	pnpm test:e2e

test-all:
	pnpm test:run && \
	pnpm test:db:setup && \
	pnpm test:db && \
	pnpm test:db:clean

pre-ci: lint format test-all

generate:
	pnpm exec prisma generate

migrate:
	pnpm exec prisma migrate dev

migrate-prod:
	pnpm exec prisma migrate deploy
	
seed:
	pnpm exec prisma db seed

studio:
	pnpm exec prisma studio

reset:
	pnpm exec prisma migrate reset

setup-db:
	pnpm exec prisma generate && \
	pnpm exec prisma migrate dev && \
	pnpm exec prisma db seed

# Docker Compose commands
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-clean:
	docker compose down -v --remove-orphans --rmi all

# Profile-based compose commands
docker-up-build:
	docker compose --profile build up -d --build

docker-up-prod:
	docker compose --profile prod up -d

docker-up-prod-tunnel:
	docker compose --profile prod --profile tunnel up -d

docker-build-db-setup:
	docker compose exec app-build pnpm exec prisma generate && \
	docker compose exec app-build pnpm exec prisma migrate deploy && \
	docker compose exec app-build pnpm exec prisma db seed

docker-db-setup:
	docker compose exec app pnpm exec prisma generate && \
	docker compose exec app pnpm exec prisma migrate deploy && \
	docker compose exec app pnpm exec prisma db seed

# Build Docker image
# Usage: make docker-build [IMAGE_NAME=sakumari] [TAG=latest]
docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) .

# Set default values for image build
IMAGE_NAME ?= sakumari
TAG ?= latest