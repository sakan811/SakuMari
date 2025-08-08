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
- **Authentication**: NextAuth.js v5 with Google OAuth and optional custom credentials for testing
- **Responsive Design**: Mobile-optimized interface for all devices
- **Modern Stack**: Next.js 15 App Router with React 19 Server/Client components

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Node.js 23, Prisma ORM v6, NextAuth.js v5
- **Database**: PostgreSQL 17
- **Testing**: Vitest, React Testing Library, Playwright
- **Package Manager**: pnpm

## Prerequisites

- Node.js v23+
- pnpm ([installation guide](https://pnpm.io/installation))
- Docker & Docker Compose (recommended) OR PostgreSQL 17+

## Quick Start

```bash
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
cp .env.example .env
# REQUIRED: Generate AUTH_SECRET at https://auth-secret-gen.vercel.app/
# Edit .env with your authentication credentials including AUTH_SECRET

make postgres
make install && make db-setup && make dev
```

Visit <http://localhost:3000>

## Installation & Setup

### 1. Environment Setup

Create and configure your environment file:

```bash
cp .env.example .env
```

Essential environment variables:

```bash
# Database
POSTGRES_DB=sakumari  # Required - defaults to 'kana_flashcard' if not set
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost  # Use 'db' for Docker containers
POSTGRES_PORT=5432

# Authentication
AUTH_URL=http://localhost:3000
AUTH_SECRET=your_generated_secret  # REQUIRED - Generate at https://auth-secret-gen.vercel.app/
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Optional: Custom credentials for testing
CREDS_PROVIDER=false
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!

NODE_ENV=development
```

### 2. Authentication Setup

#### Google OAuth (Recommended)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → APIs & Services → OAuth consent screen
3. Create credentials → OAuth client ID → Web application
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

#### Custom Credentials (Optional)

For testing without Google OAuth:

1. Set `CREDS_PROVIDER=true` in `.env`
2. Configure `CREDS_TEST_EMAIL` and `CREDS_TEST_PASSWORD`
3. Both OAuth and custom credentials will be available

### 3. Database & Development Setup

**Recommended: Docker Database + Local Development**

```bash
# Start database
make postgres

# Install dependencies and setup database
make install
make db-setup  # Handles Prisma generation, migrations, and seeding

# Start development server
make dev
```

**Alternative: Local PostgreSQL**

```bash
# Ensure PostgreSQL is running locally
make install
make db-setup
make dev
```

Visit <http://localhost:3000>

## Development Commands

### Essential Commands

```bash
# Core development
make dev                # Start development server
make build              # Build for production
make install            # Install dependencies

# Database
make postgres           # Start PostgreSQL database
make db-setup           # Complete database setup (automated script)

# Code quality
make lint               # Run ESLint
make format             # Format with Prettier
make test-all           # Run all tests and quality checks
```

### Testing

```bash
# Run all tests
make test-all

# Individual test types
make test-unit          # Unit tests
make test-db            # Database tests
make test-e2e           # End-to-end tests
```

### Advanced Commands

```bash
# Docker deployment
make dev-up             # Full Docker stack

# Service management
make status             # Show service status
make logs               # Show logs for all services
make logs-app           # Show app logs only
make down               # Stop services
make clean              # Clean up containers and volumes
```

## Deployment

### Docker Deployment

Quick way to test the complete application stack in an isolated environment:

```bash
# Set POSTGRES_HOST=db in .env for containers
make dev-up
make db-setup  # Setup database from host
```

