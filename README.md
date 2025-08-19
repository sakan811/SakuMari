# SakuMari - Japanese Kana Flashcard App

[![Web-App Test](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml)
[![E2E Test](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml)
[![Docker CI](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml)

A modern web application for learning Japanese Hiragana and Katakana characters through interactive flashcards with adaptive learning, comprehensive progress tracking, and AI-powered personalized learning tips.

🚀 **[Try it live](https://sakumari.fukudev.org/)** - No setup required!

## Package Manager

This project uses **pnpm** as its package manager. You'll need pnpm installed to run the development commands.

Visit: https://pnpm.io/installation

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

# Database (localhost is default for local dev and E2E tests)
POSTGRES_DB=sakumari
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# AI Learning Tips
GEMINI_API_KEY=your_gemini_api_key_here
MODEL_NAME=gemini-2.5-flash-lite

# E2E test credentials only
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
# Start full stack (Docker automatically configures database host)
pnpm run docker:dev-up

# Setup database
pnpm run db:setup

# Access services
# App: http://localhost:3000
# pgAdmin : http://localhost:8080

# Stop services
pnpm run docker:down
```

**Note**: Docker Compose automatically overrides `POSTGRES_HOST=db` for containerized services. No manual `.env` editing required.

## Kubernetes Deployment

Production deployment with persistent storage:

### Setup Steps

1. **Copy environment file to Kubernetes directory**:

```bash
# Copy .env file to k8s directory (required for deployment)
cp .env k8s/.env
```

2. **Deploy all services**:

```bash
# Deploy all Kubernetes resources
pnpm run k8s:up

# Check deployment status
pnpm run k8s:status
```

3. **Database setup** (single terminal):

```bash
# Port-forward database service in background
kubectl port-forward svc/postgres-service 5432:5432 -n sakumari &

# Press Enter to get a clean prompt after port-forward messages appear
# Setup database (same terminal)
pnpm run db:setup

# Kill the background port-forward process after setup
kill %1
```

4. **Access application**:

```bash
# Port-forward app service for local access
kubectl port-forward svc/sakumari-app-service 3000:3000 -n sakumari
```

5. **Monitor deployment**:

```bash
# View application logs
pnpm run k8s:logs

# Stop deployment when done
pnpm run k8s:down
```

**Production Environment**: Update `.env` with production values before copying to k8s/:

- `POSTGRES_HOST=postgres-service` (for Kubernetes service discovery)
- `AUTH_URL=https://yourdomain.com`
- `NODE_ENV=production`

## E2E Test Setup

**Environment Configuration**: Default `.env` configuration works for E2E tests:

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
# Full E2E test workflow
pnpm run test:e2e:full

# Run tests only (if already set up)
pnpm run test:e2e

# Clean up test environment
pnpm run test:e2e:clean
```
