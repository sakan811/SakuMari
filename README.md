# SakuMari - Japanese Kana Flashcard App

A web application built with **Next.js 15** and **React 19** for practicing Japanese Hiragana and Katakana characters with interactive flashcards and progress tracking.

[![Web-App Test](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml)
[![E2E Test](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml)
[![Docker CI](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml)

## Features

- **Interactive Flashcards**: Practice Hiragana and Katakana with two interaction modes (typing and multiple-choice)
- **Adaptive Learning**: Advanced weighted selection algorithm presents characters with lower accuracy more frequently
- **Comprehensive Progress Tracking**: Detailed dashboard with accuracy statistics, attempt history, and filterable character progress
- **User Authentication**: Secure Google OAuth integration with JWT session management
- **Responsive Design**: Mobile-friendly interface optimized for all devices
- **Modern Architecture**: Built with Next.js 15 App Router and React 19 Server/Client components

## Try It Live

🚀 **[https://sakumari.fukudev.org/](https://sakumari.fukudev.org/)** - No setup required!

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL 17 with Prisma ORM v6
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Testing**: Vitest (unit), React Testing Library, Playwright (E2E)
- **Deployment**: Docker with multi-stage builds, Docker Compose profiles
- **Package Manager**: pnpm

## Quick Start (Recommended)

For the fastest development setup with Docker database:

```bash
# Clone and setup
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
cp .env.example .env
# Edit .env with your credentials

# Start database services and setup
docker compose up -d
pnpm install && make setup-db && pnpm dev
```

Open <http://localhost:3000> and start developing!

## Development Setup

### Prerequisites

- **Node.js** (v20 or higher)
- **pnpm** ([installation guide](https://pnpm.io/installation))
- **PostgreSQL** (v17 or higher) OR **Docker** for containerized database

### Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

**Required Variables:**

```bash
# Database
POSTGRES_DB=sakumari
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_PRISMA_URL=postgresql://postgres:your_password@localhost:5432/sakumari
POSTGRES_URL_NON_POOLING=postgresql://postgres:your_password@localhost:5432/sakumari

# Authentication
AUTH_URL=http://localhost:3000
AUTH_SECRET=your_generated_secret  # Generate at https://auth-secret-gen.vercel.app/
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Optional (for pgAdmin)
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin_password

# Environment
NODE_ENV=development
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Set up OAuth consent screen: "APIs & Services" → "OAuth consent screen"
4. Fill required fields (App name, User support email, Developer contact information)
5. Create credentials: "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth client ID" → "Web application"
6. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to your `.env` file

For more details: [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

## Local Development (No Docker)

**Prerequisites**: PostgreSQL installed and running locally

```bash
# Clone and setup
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
cp .env.example .env
# Edit .env with your credentials

# Install dependencies
pnpm install

# Database setup
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma db seed

# Start development server
pnpm run dev
```

Open <http://localhost:3000>

## Local Development (Docker Database Only)

**Prerequisites**: Docker and Docker Compose installed

Use this approach to run PostgreSQL in Docker while running the Next.js app locally.

```bash
# Clone and setup
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
cp .env.example .env
# Edit .env with your credentials (use POSTGRES_HOST=localhost for local app)

# Start database services only
docker compose up -d

# Install dependencies
pnpm install

# Database setup (runs from local machine against Docker database)
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma db seed

# Start development server locally
pnpm run dev
```

**Database Management:**

- pgAdmin: <http://localhost:8080> (use credentials from .env)
- Portainer: <http://localhost:9000> (Docker container management)
- Direct PostgreSQL: `localhost:5432`

### Full Stack Docker Deployment

**Option 1: Build from source (Local Development)**

```bash
# Edit .env with your credentials (use POSTGRES_HOST=db for Docker networking)
PULL_POLICY=build docker compose up -d

# Database setup (run inside Docker container)
docker compose exec app pnpm exec prisma generate
docker compose exec app pnpm exec prisma migrate deploy
docker compose exec app pnpm exec prisma db seed
```

- App runs on port 3000
- Builds from local source code
- Database setup runs inside the Docker container

**Option 2: Production deployment**

```bash
# Edit .env with your credentials (use POSTGRES_HOST=db for Docker networking)

# Production without tunnel (default: PULL_POLICY=always)
docker compose up -d

# Production with Cloudflare tunnel
docker compose --profile tunnel up -d

# Database setup (run inside Docker container)
docker compose exec app pnpm exec prisma generate
docker compose exec app pnpm exec prisma migrate deploy
docker compose exec app pnpm exec prisma db seed
```

- App runs on port 3000
- Uses pre-built image from registry
- Optional Cloudflare tunnel support
- Database setup runs inside the Docker container

**Database only:**

```bash
docker compose up -d
```

- Runs PostgreSQL, pgAdmin, and Portainer only
- Use for external app development (see "Local Development (Docker Database Only)" above)

## Testing

The project includes a comprehensive multi-layered testing strategy:

### Test Types
- **Unit & Integration Tests**: React components, API routes, and business logic using Vitest + React Testing Library
- **Database Tests**: Separate SQLite test database to validate queries, constraints, and relationships
- **End-to-End Tests**: Full user journey testing with Playwright, including authentication flows
- **SEO Tests**: Metadata and Open Graph validation

### Running Tests

```bash
# Unit tests
pnpm test                 # Watch mode
pnpm run test:run         # Single run

# Database tests (separate SQLite test database)
pnpm run test:db:setup    # Setup test database
pnpm run test:db          # Run database tests

# E2E tests (Playwright)
pnpm run test:e2e:build   # Build for E2E testing
pnpm run test:e2e         # Run E2E tests

# All tests
make test-all             # Run all tests + cleanup
make pre-ci               # Run lint, format, and all tests (recommended before committing)
```

## Useful Makefile Commands

The project includes a comprehensive Makefile with convenient commands for development:

### Development Commands

```bash
make dev                  # Start development server
make build                # Build production application
make lint                 # Run ESLint
make format               # Format code with Prettier
make pre-ci               # Run lint, format, and all tests (recommended before committing)
```

### Database Management

```bash
make setup-db             # One-command database setup: generate + migrate + seed
make generate             # Generate Prisma client
make migrate              # Run database migrations (development)
make migrate-prod         # Run database migrations (production)
make seed                 # Seed database with Kana data
make studio               # Open Prisma Studio for database management
make reset                # Reset database (removes all data)
```

### Docker Commands

```bash
make docker-up            # Start database and pgAdmin services
make docker-down          # Stop all services
make docker-clean         # Clean up Docker resources (volumes, images, orphans)
make docker-up-build      # Build and run full stack from source (PULL_POLICY=build)
make docker-up-prod       # Run production deployment (PULL_POLICY=always)
make docker-up-build-tunnel  # Build and run with Cloudflare tunnel
make docker-up-prod-tunnel   # Run production with Cloudflare tunnel
make docker-build         # Build Docker image (default: sakumari:latest)
```

### Docker Database Setup

```bash
make docker-db-setup      # Setup database in app container
```
