# SakuMari - Japanese Kana Flashcard App

[![Web-App Test](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml)
[![E2E Test](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml)
[![Docker CI](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml)

A modern web application for learning Japanese Hiragana and Katakana characters through interactive flashcards with adaptive learning and comprehensive progress tracking.

🚀 **[Try it live](https://sakumari.fukudev.org/)** - No setup required!

## Features

- **Interactive Flashcards**: Practice with typing or multiple-choice modes
- **Adaptive Learning**: Weighted algorithm presents difficult characters more frequently
- **Progress Tracking**: Detailed dashboard with accuracy statistics and character-specific progress
- **Google OAuth**: Secure authentication with JWT session management
- **Responsive Design**: Mobile-optimized interface for all devices
- **Modern Stack**: Next.js 15 App Router with React 19 Server/Client components

## Technology Stack

- **Frontend**: Next.js 15 (standalone output), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Node.js 23, Prisma ORM v6, NextAuth.js v5
- **Database**: PostgreSQL 17
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Docker, Docker Compose, Kubernetes (Kustomize)
- **Package Manager**: pnpm

## Prerequisites

- Node.js v23+
- pnpm ([installation guide](https://pnpm.io/installation))
- Docker & Docker Compose (recommended) OR PostgreSQL 17+

## Quick Start

**Fastest setup with Docker:**

```bash
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
cp .env.example .env
# Edit .env with your Google OAuth credentials

make postgres
pnpm install && ./scripts/setup-database.sh && pnpm dev
```

The `./scripts/setup-database.sh` script automatically handles Prisma generation, migration, and seeding - no manual database setup required.

Visit <http://localhost:3000>

## Installation & Setup

### 1. Environment Configuration

Create `.env` from the example and configure:

```bash
cp .env.example .env
```

**Required environment variables:**

```bash
# Database
POSTGRES_DB=sakumari
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost  # Use 'db' for Docker deployment
POSTGRES_PORT=5432
# Required for Prisma
POSTGRES_PRISMA_URL=postgresql://postgres:your_password@localhost:5432/sakumari
POSTGRES_URL_NON_POOLING=postgresql://postgres:your_password@localhost:5432/sakumari

# Authentication
AUTH_URL=http://localhost:3000
AUTH_SECRET=your_generated_secret  # Generate at https://auth-secret-gen.vercel.app/
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Docker (required for containerized deployment)
CONTAINER_NAME_PREFIX=sakumari
DOCKER_IMAGE_NAME=your_registry/sakumari
DOCKER_IMAGE_TAG=latest

NODE_ENV=development
```

**Database Connection:** The application now uses simplified environment configuration. The POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING are automatically generated from basic database variables if not explicitly provided. Set `POSTGRES_HOST=localhost` for local development or `POSTGRES_HOST=db` when using Docker containers.

**Build Optimization:** The application uses Next.js standalone output mode for optimized Docker deployments. This creates a self-contained `.next/standalone` directory with minimal dependencies, reducing container size and improving startup performance.

### 2. Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → APIs & Services → OAuth consent screen
3. Create credentials → OAuth client ID → Web application
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

[Detailed OAuth guide](https://developers.google.com/identity/protocols/oauth2)

### 3. Choose Your Setup Method

#### Option A: Docker Database + Local Development (Recommended)

```bash
# Start database services
make postgres  # Or make db-admin for pgAdmin, make db-tools for all tools

# Install and setup
pnpm install
./scripts/setup-database.sh  # Automated database setup (recommended)

# Start development
pnpm dev
```

#### Option B: Local PostgreSQL

```bash
# Ensure PostgreSQL is running locally
pnpm install
./scripts/setup-database.sh  # Automated setup (recommended)

# OR manual setup:
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed

pnpm dev
```

#### Option C: Full Docker Deployment

**Important:** Database setup must be done manually outside of containers.

**Development (build from source):**

```bash
# Set POSTGRES_HOST=db in .env for container, then start services
make dev-up

# Setup database from local machine (required)
./scripts/setup-database.sh
```

**Production (use registry image):**

```bash
# Set POSTGRES_HOST=db in .env for container, then start services
make prod-up
# Or with Cloudflare tunnel:
make tunnel-up

# Setup database from local machine (required)
./scripts/setup-database.sh
```

## Development Commands

```bash
# Development
make dev                # Start dev server
make build              # Build for production (includes standalone output optimization)
make install            # Install dependencies

# Code Quality
make lint               # Run ESLint
make format             # Format with Prettier
make test-all           # Lint + format + all tests

# Database
make postgres           # Start PostgreSQL database only
make db-admin           # Start PostgreSQL with pgAdmin
make db-tools           # Start PostgreSQL with pgAdmin and Portainer
./scripts/setup-database.sh  # Automated database setup (recommended)
# OR manual setup:
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run database migrations
pnpm db:seed           # Seed database with Kana data

# Docker Application Deployments
make dev-up             # Start app stack with build policy (excludes tunnel)
make prod-up            # Start app stack with always pull policy (excludes tunnel)
make tunnel-up          # Start production stack with Cloudflare tunnel

# Service Management
make logs               # Show logs for all services
make logs-app           # Show app logs only
make status             # Show service status
make down               # Stop all services
make clean              # Stop and remove all containers, volumes, images

# Kubernetes Deployments
make k8s-deploy         # Deploy to Kubernetes using Kustomize
make k8s-status         # Show Kubernetes deployment status  
make k8s-logs           # Show application logs in Kubernetes
make k8s-secrets        # Show generated secrets (with hash suffixes)
make k8s-port-forward   # Port forward to database for setup
make k8s-db-setup       # Setup database in Kubernetes
make k8s-clean          # Delete Kubernetes namespace and all resources
```

## Kubernetes Deployment

For production-ready Kubernetes deployments with enterprise features:

**✨ Features:**
- **Kustomize-based**: Secure secret management from `.env` files
- **No hardcoded secrets**: Safe for public repositories
- **Single replica deployment**: Starts with 1 replica, auto-scales to max 3 based on CPU/memory
- **Security hardened**: Non-root containers, dropped capabilities, minimal privileges
- **Multiple services**: App, PostgreSQL, pgAdmin, Portainer, Cloudflare tunnel
- **Ingress options**: NGINX ingress OR Cloudflare tunnel for self-hosting

**🚀 Quick Deploy:**
```bash
# Setup secrets from root .env file
cp .env k8s/.env  # Edit k8s/.env with your values if needed

# Deploy to Kubernetes (Kustomize generates secrets from k8s/.env)
cd k8s && kubectl apply -k .

# Setup database (requires separate terminal for port-forward)
kubectl port-forward -n sakumari svc/postgres-service 5432:5432 &
cd .. && pnpm prisma migrate deploy && pnpm db:seed

# Or use Makefile commands
make k8s-deploy
make k8s-port-forward &  # In separate terminal
make k8s-db-setup
```

**📖 Full Documentation:** [k8s/README.md](/k8s/README.md)

## Testing

Comprehensive multi-layer testing strategy:

```bash
# Unit & Integration Tests
pnpm test               # Watch mode
pnpm test:run           # Single run

# Database Tests (SQLite)
pnpm test:db:setup      # Setup test DB
pnpm test:db            # Run DB tests

# End-to-End Tests (Playwright)
pnpm test:e2e:setup     # Setup E2E environment
pnpm test:e2e:build     # Build for testing
pnpm test:e2e           # Run E2E tests

# Makefile Test Commands
make test-unit          # Run unit tests
make test-db            # Run database tests
make test-e2e           # Run E2E tests (full workflow)
make test-all           # Run all tests and quality checks
```

### E2E Test Setup (Local)

**One-Time Environment Setup:**

```bash
# 1. Start PostgreSQL (use existing Docker container)
make postgres

# 2. Ensure POSTGRES_HOST=localhost in your .env file for local development
# E2E tests will automatically use NODE_ENV=test
```

**Run E2E Tests:**

```bash
# Complete E2E workflow (setup + build + test)
make test-e2e

# Or run individual steps:
pnpm test:e2e:setup     # Setup test database
pnpm test:e2e:build     # Build for testing
pnpm test:e2e           # Run tests
```

**Authentication:**

- E2E tests automatically set `NODE_ENV=test` in Playwright configuration **before server startup**
- **Important:** `NODE_ENV=test` must be set before the Next.js server starts to trigger authentication provider switching in `lib/auth.ts`
- The test credentials provider automatically switches when NODE_ENV=test, replacing Google OAuth with test credentials
- Test credentials: `test@sakumari.local` with password `test123`
- No additional environment file needed - uses your existing `.env` with `NODE_ENV=test` override applied at runtime
