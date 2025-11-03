# SakuMari - Japanese Kana Flashcard App

<div align="center">
  <img src="docs/SakuMari.png" alt="SakuMari App Screenshot" width="250" />
  <br></br>
</div>

[![Web-App Test](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml)
[![E2E Test](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml)
[![Docker CI](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml)

A modern web application for learning Japanese Hiragana and Katakana characters through interactive flashcards with adaptive learning, comprehensive progress tracking, and AI-powered personalized learning tips.

🚀 **[Try it live](https://sakumari.fukudev.org/)** - No setup required!

## Features

🔐 **Secure Login** - Sign in with Google, practice safely

🧠 **Smart Learning** - Algorithm focuses on characters you struggle with most

⌨️ **Dual Modes** - Type answers or choose from multiple-choice options

📊 **Progress Tracking** - See your improvement with detailed analytics

🤖 **AI Tips** - Get personalized learning advice from Google Gemini

📱 **Mobile Responsive** - Learn on any device with our responsive design

_For detailed technical documentation, see [docs/features.md](docs/features.md)_

## Architecture

**Tech Stack:** Next.js 16 + PostgreSQL 17 + NextAuth.js v5 + Google Gemini AI

**Key Components:** Adaptive FlashcardProvider → Practice/Dashboard Pages → API Layer → Database

_For detailed architecture documentation, see [docs/architecture.md](docs/architecture.md)_

## Package Manager

This project uses **pnpm** as its package manager. You'll need pnpm installed to run the development commands.

Visit: <https://pnpm.io/installation>

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project > "APIs & Services" > "Credentials"
3. Create "OAuth client ID" (configure consent screen if prompted)
4. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Secret to `.env` file

More details: <https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid>

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Required - Generate at https://auth-secret-gen.vercel.app/
AUTH_SECRET=your_random_secret_here

# Database (localhost is default for local dev and E2E tests)
POSTGRES_DB=sakumari
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Database URLs
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/sakumari
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/sakumari

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# AI Learning Tips
GEMINI_API_KEY=your_gemini_api_key_here
MODEL_NAME=gemini-2.5-flash-lite

# Local Redis for Rate Limiting
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# E2E test credentials only
CREDS_PROVIDER=true
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!
```

## Development Commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build production app
pnpm run lint             # Run linter
pnpm run format           # Format code with Prettier
pnpm run test:all         # Run all tests and quality checks

# License Management
pnpm run license:add      # Add license headers to all files
pnpm run license:remove   # Remove license headers from files
pnpm run license:check    # Check license header compliance
```

## Local Development Setup

```bash
# Clone and install
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
pnpm install

# Start database and Redis
pnpm run docker:db

# Setup database (migrations + seed)
pnpm run db:setup

# Start development server
pnpm run dev
```

Visit <http://localhost:3000>

## Docker Compose Setup

For isolated testing environment:

### Prerequisites

```bash
# Install dependencies first (required for Prisma commands)
pnpm install
```

**Note**: Even though services run in containers, Prisma CLI commands execute on the host machine and require local dependencies.

### Setup Steps

```bash
# Start full stack (Docker automatically configures database and Redis hosts)
pnpm run docker:dev-up

# Setup database
pnpm run db:setup

# Access services
# App: http://localhost:3000

# Docker Management
pnpm run docker:logs      # View all service logs
pnpm run docker:logs-app  # View app container logs only
pnpm run docker:status    # Check service status
pnpm run docker:down      # Stop all services
pnpm run docker:clean     # Remove all containers + volumes
```

**Note**: Docker Compose automatically overrides `POSTGRES_HOST=db` and `REDIS_HOST=redis` for containerized services. No manual `.env` editing required.

## E2E Test Setup

### Prerequisites

```bash
# Install dependencies first (required for Prisma commands and test runners)
pnpm install
```

**Note**: E2E tests use Prisma commands for database setup and Playwright for testing, both of which require local dependencies.

### Environment Configuration

Default `.env` configuration works for E2E tests:

```bash
# Database (localhost is the default)
POSTGRES_HOST=localhost
POSTGRES_DB=sakumari
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Required for E2E test authentication only
CREDS_PROVIDER=true
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!

# Other required variables
AUTH_SECRET=your_generated_secret_here
```

**Note**: No special database configuration needed - the default localhost setting works for both local development and E2E testing.

**Test Commands**:

```bash
# Unit Tests
pnpm run test             # Unit tests (watch)
pnpm run test:run         # Unit tests once
pnpm run test:coverage    # Unit tests with coverage

# Database Tests
pnpm run test:db          # Database tests (once)
pnpm run test:db:watch    # Database tests (watch)
pnpm run test:db:coverage # Database tests with coverage
pnpm run test:db:setup    # Setup database test environment
pnpm run test:db:full     # Database tests with fresh setup
pnpm run test:db:clean    # Clean database test artifacts

# Integration Tests
pnpm run test:integration           # Integration tests (rate limiting)
pnpm run test:integration:coverage  # Integration tests with coverage

# E2E Tests
pnpm run test:e2e:setup   # Setup E2E test environment
pnpm run test:e2e:build   # Build app for E2E testing
pnpm run test:e2e:full    # Full E2E test workflow
pnpm run test:e2e         # Run tests only (if already set up)
pnpm run test:e2e:clean   # Clean up test environment

# All Tests
pnpm run test:all         # Run all tests and quality checks
```

## Test Document

For comprehensive test coverage and test case documentation, see [docs/test-cases.md](docs/test-cases.md).
