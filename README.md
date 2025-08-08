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

## Project Overview

SakuMari is a modern web application for learning Japanese Hiragana and Katakana characters through interactive flashcards with adaptive learning and comprehensive progress tracking.

## Quick Start

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

## Development Workflow

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

### Docker Testing

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

## Configuration

### Environment Variables

Configure essential variables in `.env`:

#### Database Configuration
```bash
# Database (default values work for Docker setup)
POSTGRES_DB=sakumari
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/sakumari
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/sakumari
```

#### Authentication Configuration
```bash
# Authentication (required)
AUTH_SECRET=your_generated_secret  # REQUIRED - Generate at https://auth-secret-gen.vercel.app/
AUTH_GOOGLE_ID=your_google_client_id      # For Google OAuth
AUTH_GOOGLE_SECRET=your_google_client_secret

# Optional: Enable credentials provider for testing
CREDS_PROVIDER=false
CREDS_TEST_EMAIL=test@sakumari.local    # Optional - Test email (only used if CREDS_PROVIDER=true)
CREDS_TEST_PASSWORD=TestPassword123!    # Optional - Test password (only used if CREDS_PROVIDER=true)
```

#### Production Configuration
```bash
# Authentication Base URL
AUTH_URL=https://yourdomain.com          # REQUIRED - Base URL for authentication callbacks

# Docker image settings
DOCKER_IMAGE_NAME=sakanbeer88/sakumari  # REQUIRED - Docker image name
DOCKER_IMAGE_TAG=latest                 # REQUIRED - Docker image tag
CONTAINER_NAME_PREFIX=sakumari          # REQUIRED - Container name prefix

# Cloudflare tunnel for secure external access
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token-here  # REQUIRED - Cloudflare tunnel token

# Node.js environment
NODE_ENV=production                     # REQUIRED - Set to production for deployment
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

## Testing

End-to-end (E2E) tests are written using Playwright to ensure the application's core functionalities work as expected across different browsers.

### Running E2E Tests

To run the E2E tests locally, you'll need to set up the environment and run the test suite:

1.  **Setup Environment and Build**:
    This command starts the database, runs database migrations, seeds the database, and builds the application for production.

    ```bash
    pnpm run test:e2e:full
    ```

2.  **Run Tests Only** (if environment is already set up):
    If you have already run the setup and build process, you can run the tests directly:

    ```bash
    pnpm run test:e2e
    ```

### Test Execution Details

*   **Headless Mode**: By default, tests run in a headless browser (no visible browser window).
*   **UI Mode**: For debugging purposes, you can run tests in UI mode to see the browser in action. This can be enabled by setting the `headed` flag:
    ```bash
    pnpm run test:e2e -- --headed
    ```
*   **Authentication**: The E2E tests use a dedicated authentication setup. They require `CREDS_PROVIDER=true` in the environment and will use the test credentials defined by `CREDS_TEST_EMAIL` and `CREDS_TEST_PASSWORD` (defaults: `test@sakumari.local` / `TestPassword123!`). Playwright automatically handles the login process and saves the authentication state for subsequent tests.
*   **Web Server**: Playwright automatically starts and manages a Next.js production server on `http://localhost:3000` for the duration of the tests.
*   **Report**: HTML reports are generated by default and can be viewed after test execution.

### Cleaning Up Test Environment

To stop the database and clean up resources created during the E2E test setup:

```bash
pnpm run test:e2e:clean
```

## Deployment

Deploy SakuMari using Kubernetes with Cloudflare tunnel for secure remote access.

### Environment Setup

Configure production variables in `.env` (see Configuration section above for details).

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
