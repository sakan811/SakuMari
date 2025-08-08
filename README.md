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

## Setup

### Prerequisites

- Node.js v23+
- pnpm ([installation guide](https://pnpm.io/installation))
- Docker & Docker Compose (recommended)

### Quick Start

```bash
# Clone and setup
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
cp .env.example .env

# Configure environment
# REQUIRED: Generate AUTH_SECRET at https://auth-secret-gen.vercel.app/
# Add AUTH_SECRET to .env file

# Setup and run
pnpm run docker:db
pnpm install && pnpm run db:setup && pnpm run dev
```

Visit <http://localhost:3000>

### Environment Configuration

Essential variables in `.env`:

```bash
# Database (default values work for Docker setup)
POSTGRES_DB=sakumari
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sakumari
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/sakumari
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/sakumari

# Authentication (required)
AUTH_SECRET=your_generated_secret  # REQUIRED - Generate at link above
AUTH_GOOGLE_ID=your_google_client_id      # For Google OAuth
AUTH_GOOGLE_SECRET=your_google_client_secret

# Optional: Enable credentials provider for testing
CREDS_PROVIDER=false
```

### Authentication Setup

**Google OAuth (Recommended)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type for testing
   - Fill in required app information
   - Add your email to test users
6. For application type, select "Web application"
7. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
8. Copy the Client ID and Client Secret to your `.env` file:
   ```bash
   AUTH_GOOGLE_ID=your_client_id_here
   AUTH_GOOGLE_SECRET=your_client_secret_here
   ```

**Custom Credentials (Testing)**

Set `CREDS_PROVIDER=true` in `.env` to enable test login (test@sakumari.local / TestPassword123!)

### Verification

After setup, verify everything works:
- Database: `pnpm run docker:status` shows `db` service running
- App: Visit <http://localhost:3000> and create/login to account
- Health check: Visit <http://localhost:3000/api/health>

## Development

### Essential Commands

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run docker:db    # Start PostgreSQL database
pnpm run db:setup     # Complete database setup
pnpm run lint         # Run ESLint
pnpm run test:all     # Run all tests and quality checks
```

### Testing

```bash
pnpm run test:all      # All tests and quality checks
pnpm run test:run      # Unit tests only
pnpm run test:e2e:full # End-to-end tests
```

## Docker Testing

To test the complete application stack in isolation:

```bash
# Update .env: set POSTGRES_HOST=db for containers
pnpm run docker:dev-up    # Start full stack
pnpm run db:setup         # Setup database from host
```

Services available at:
- App: <http://localhost:3000>
- Database Admin: <http://localhost:8080> (DBGate)

Cleanup: `pnpm run docker:clean`

## Production Deployment

Deploy SakuMari using Kubernetes with Cloudflare tunnel for secure remote access.

### Environment Setup

Configure production variables in `.env`:

```bash
# Database (container configuration)
POSTGRES_HOST=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=sakumari
DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/sakumari

# Authentication (required)
AUTH_SECRET=your_production_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Cloudflare tunnel (required for external access)
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token

# Docker configuration
DOCKER_IMAGE_NAME=sakanbeer88/sakumari
DOCKER_IMAGE_TAG=latest
CONTAINER_NAME_PREFIX=sakumari

NODE_ENV=production
```

### Kubernetes Deployment

```bash
# Deploy
pnpm run k8s:up

# Setup database
pnpm run db:setup
```

### Kubernetes Management

```bash
# View logs
pnpm run k8s:logs

# View app logs only
pnpm run k8s:logs-app

# Check status
pnpm run k8s:status

# Stop services
pnpm run k8s:down

# Clean up (remove namespace and resources)
pnpm run k8s:clean
```
