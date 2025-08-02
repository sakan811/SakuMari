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
- **Deployment**: Docker (docker/), Docker Compose, Kubernetes (Kustomize)
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
make install && make db-setup && make dev
```

The `make db-setup` command automatically handles Prisma generation, migration, and seeding - no manual database setup required.

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

# Custom Credentials (optional - for testing in any environment)
CREDS_PROVIDER=false
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!

# pgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

# Cloudflare Tunnel Configuration (optional)
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token

# Docker (required for containerized deployment)
CONTAINER_NAME_PREFIX=sakumari
DOCKER_IMAGE_NAME=sakanbeer88/sakumari
DOCKER_IMAGE_TAG=latest

NODE_ENV=development
```

**Database Connection:** The application now uses simplified environment configuration. The POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING are automatically generated from basic database variables if not explicitly provided. Set `POSTGRES_HOST=localhost` for local development or `POSTGRES_HOST=db` when using Docker containers.

**Build Optimization:** The application uses Next.js standalone output mode for optimized Docker deployments. This creates a self-contained `.next/standalone` directory with minimal dependencies, reducing container size and improving startup performance.

### 2. Authentication Setup

#### Google OAuth (Production)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → APIs & Services → OAuth consent screen
3. Create credentials → OAuth client ID → Web application
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

[Detailed OAuth guide](https://developers.google.com/identity/protocols/oauth2)

#### Custom Credentials (Testing/Development)

For testing or development environments, you can enable custom username/password authentication:

1. Set `CREDS_PROVIDER=true` in your `.env` file
2. Configure `CREDS_TEST_EMAIL` and `CREDS_TEST_PASSWORD` (optional - defaults provided)
3. Both Google OAuth and custom credentials will be available on the sign-in page

**Use Cases:**

- E2E testing in production environments
- Local development without Google OAuth setup
- Automated testing scenarios

### 3. Choose Your Setup Method

#### Option A: Docker Database + Local Development (Recommended)

```bash
# Start database services
make postgres  # Or make db-admin for pgAdmin

# Install and setup
make install
make db-setup  # Automated database setup (recommended)

# Start development
make dev
```

#### Option B: Local PostgreSQL

```bash
# Ensure PostgreSQL is running locally
make install
make db-setup  # Automated setup (recommended)

# OR manual setup:
make install
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run db:seed

make dev
```

#### Option C: Full Docker Deployment

**Important:** Database setup must be done manually outside of containers.

**Development (build from source):**

```bash
# Set POSTGRES_HOST=db in .env for container, then start services
make dev-up  # Uses docker/Dockerfile (production mode)

# Setup database from local machine (required)
make db-setup
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
make db-setup          # Automated database setup (recommended)
# OR manual setup:
pnpm run prisma:generate    # Generate Prisma client
pnpm run prisma:migrate     # Run database migrations
pnpm run db:seed           # Seed database with Kana data

# Docker Application Deployments
make dev-up             # Start app stack for development (builds with docker/Dockerfile)

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
cd .. && pnpm run prisma:generate && npx prisma migrate deploy && pnpm run db:seed

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
make test-unit          # Run unit tests
pnpm run test               # Watch mode (alternative)
pnpm run test:run           # Single run (alternative)

# Database Tests (SQLite)
make test-db            # Run database tests (includes setup)
pnpm run test:db:setup      # Setup test DB (alternative)
pnpm run test:db            # Run DB tests (alternative)

# End-to-End Tests (Playwright)
make test-e2e           # Run E2E tests (simplified: database + Playwright webServer)
pnpm run test:e2e:setup     # Setup E2E environment (start database only)
pnpm run test:e2e:build     # Build app with CREDS_PROVIDER=true
pnpm run test:e2e           # Run E2E tests (Playwright manages app)

# Comprehensive Testing
make test-all           # Run all tests and quality checks
```

### E2E Test Setup (Simplified)

**E2E Testing with Playwright webServer:**

E2E tests use Playwright's webServer configuration to manage the Next.js application, with only the database running in Docker.

```bash
# Complete E2E workflow (simplified)
make test-e2e

# Or run individual steps:
pnpm run test:e2e:setup     # Start PostgreSQL database container
pnpm run test:e2e:build     # Build app with CREDS_PROVIDER=true
pnpm run test:e2e           # Run Playwright tests (webServer manages app)
```

**Environment Configuration:**

- **Database**: Docker container with `POSTGRES_HOST=localhost` for host connection
- **Application**: Standard Next.js build with `CREDS_PROVIDER=true` for authentication
- **Playwright webServer**: Automatically starts/stops Next.js app during testing
- **Test Credentials**: Configurable via `CREDS_TEST_EMAIL` and `CREDS_TEST_PASSWORD` (defaults: `test@sakumari.local`/`TestPassword123!`)
- **Database Setup**: Runs from host using localhost connection via setup-database.sh script

**Benefits:**

- **Faster setup**: No complex container orchestration
- **Standard workflow**: Uses familiar `next build` and `next start` commands
- **Reliable**: Playwright manages app lifecycle with proper health checks
- **CI-optimized**: Uses standard GitHub Actions patterns

**Architecture:**

- Database runs in Docker container with port forwarding
- Next.js app managed by Playwright webServer configuration
- Tests run against locally managed application at localhost:3000
