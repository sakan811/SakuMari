# SakuMari - Japanese Kana Flashcard App

[![Web-App Test](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml)
[![E2E Test](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml)
[![Docker CI](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml)

A modern web application for learning Japanese Hiragana and Katakana characters through interactive flashcards with adaptive learning and comprehensive progress tracking.

🚀 **[Try it live](https://sakumari.fukudev.org/)** - No setup required!

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project > "APIs & Services" > "Credentials"
3. Create "OAuth client ID" (configure consent screen if prompted)
4. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Secret to `.env` file

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Required - Generate at https://auth-secret-gen.vercel.app/
AUTH_SECRET=your_generated_secret_here

# Database (default values work for Docker setup)
POSTGRES_DB=sakumari
POSTGRES_HOST=localhost  # Use 'db' for Docker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Optional - Enable test credentials
CREDS_PROVIDER=true
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!
```

## Local Development Setup

```bash
# Clone and install
git clone https://github.com/sakan811/SakuMari.git
cd SakuMari
pnpm install

# Start database
pnpm run docker:db

# Setup database
pnpm run db:setup

# Start development server
pnpm run dev
```

Visit http://localhost:3000

## Docker Compose Setup

For isolated testing environment:

```bash
# Update .env for Docker
POSTGRES_HOST=db

# Start full stack
pnpm run docker:dev-up

# Setup database
pnpm run db:setup

# Access services
# App: http://localhost:3000
# DB Admin: http://localhost:8080

# Stop services
pnpm run docker:down
```

## Kubernetes Deployment

Production deployment with persistent storage:

```bash
# Deploy all services
pnpm run k8s:up

# Setup database
pnpm run db:setup

# Check status
pnpm run k8s:status

# View logs
pnpm run k8s:logs

# Access locally (port-forward)
kubectl port-forward svc/sakumari-app-service 3000:3000 -n sakumari

# Stop deployment
pnpm run k8s:down
```

**Production Environment**: Update `.env` with production values:
- `POSTGRES_HOST=sakumari-postgres-service`
- `AUTH_URL=https://yourdomain.com`
- `NODE_ENV=production`

## E2E Test Setup

**Environment Configuration**: Ensure your `.env` file is configured for local testing:

```bash
# Database - Use localhost for E2E tests
POSTGRES_HOST=localhost
POSTGRES_DB=sakumari
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Required for test authentication
CREDS_PROVIDER=true
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!

# Other required variables
AUTH_SECRET=your_generated_secret_here
```

**Test Commands**:

```bash
# Full E2E test workflow
pnpm run test:e2e:full

# Run tests only (if already set up)
pnpm run test:e2e

# Clean up test environment
pnpm run test:e2e:clean
```