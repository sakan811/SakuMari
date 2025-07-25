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

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Node.js 23, Prisma ORM v6, NextAuth.js v5
- **Database**: PostgreSQL 17
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Docker, Docker Compose
- **Package Manager**: pnpm

## Prerequisites

- Node.js v20+
- pnpm ([installation guide](https://pnpm.io/installation))
- Docker & Docker Compose (recommended) OR PostgreSQL 17+

## Quick Start

**Fastest setup with Docker:**

```bash
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
cp .env.example .env
# Edit .env with your Google OAuth credentials

docker compose up -d
pnpm install && make setup-db && pnpm dev
```

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
POSTGRES_PRISMA_URL=postgresql://postgres:your_password@localhost:5432/sakumari
POSTGRES_URL_NON_POOLING=postgresql://postgres:your_password@localhost:5432/sakumari

# Authentication
AUTH_URL=http://localhost:3000
AUTH_SECRET=your_generated_secret  # Generate at https://auth-secret-gen.vercel.app/
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

NODE_ENV=development
```

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
docker compose up -d

# Install and setup
pnpm install
make setup-db  # Generate + migrate + seed

# Start development
pnpm dev
```

**Services:**
- App: <http://localhost:3000>
- pgAdmin: <http://localhost:8080>
- Portainer: <http://localhost:9000>

#### Option B: Local PostgreSQL

```bash
# Ensure PostgreSQL is running locally
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm dev
```

#### Option C: Full Docker Deployment

**Development (build from source):**
```bash
# Set POSTGRES_HOST=db in .env
PULL_POLICY=build docker compose up -d
make docker-db-setup
```

**Production (use registry image):**
```bash
# Set POSTGRES_HOST=db in .env
docker compose up -d  # Default: PULL_POLICY=always
# Or with Cloudflare tunnel:
docker compose --profile tunnel up -d
make docker-db-setup
```

## Development Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server

# Code Quality
pnpm lint               # Run ESLint
pnpm format             # Format with Prettier
make pre-ci             # Lint + format + all tests

# Database
make setup-db           # Generate + migrate + seed
make studio             # Open Prisma Studio
make reset              # Reset database

# Docker
make docker-up          # Start database services
make docker-down        # Stop services
make docker-clean       # Clean up resources
```

## Testing

Comprehensive multi-layer testing strategy:

```bash
# Unit & Integration Tests
pnpm test               # Watch mode
pnmp test:run           # Single run

# Database Tests (SQLite)
pnpm test:db:setup      # Setup test DB
pnpm test:db            # Run DB tests

# End-to-End Tests (Playwright)
make test-e2e           # Build + run E2E tests
pnpm test:e2e:build     # Build for testing
pnpm test:e2e           # Run E2E tests

# All Tests
make test-all           # Unit + DB + cleanup
```
