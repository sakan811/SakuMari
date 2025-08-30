# SakuMari - Japanese Kana Flashcard App

[![Web-App Test](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/test-app.yml)
[![E2E Test](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/playwright.yml)
[![Docker CI](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/sakan811/SakuMari/actions/workflows/docker-ci.yml)

A modern web application for learning Japanese Hiragana and Katakana characters through interactive flashcards with adaptive learning, comprehensive progress tracking, and AI-powered personalized learning tips.

🚀 **[Try it live](https://sakumari.fukudev.org/)** - No setup required!

## Features

- **Google Account Integration**: Securely log in and save your progress.
- **Dual Kana Support**: Practice both Hiragana and Katakana character sets.
- **Adaptive Flashcards**:
  - **Two Modes**: Choose between typing the answer (Input Mode) or selecting from options (Choice Mode).
  - **Smart Randomization**: The app prioritizes characters with lower accuracy to enhance learning efficiency.
- **Comprehensive Dashboard**:
  - **Detailed Stats**: Track your accuracy, attempts, and performance for each kana character.
  - **Dynamic Filtering**: Filter the statistics table by kana type (All, Hiragana, Katakana).
  - **Summary View**: An overview at the top of the table reflects the filtered data.
  - **Sortable Columns**: Easily sort the data by character, romaji, attempts, or accuracy.
- **AI-Powered Learning Tips**:
  - **Tips Button**: Access an AI-powered chat modal to ask for personalized learning advice.

## Architecture

SakuMari's architecture has three layers. The Frontend Layer handles user interactions through Next.js, React components, and FlashcardProvider context. The Security Layer manages authentication via NextAuth.js middleware. The Backend Layer processes data through API routes, Prisma ORM, PostgreSQL database, and Google Gemini AI for personalized learning tips.

```mermaid
flowchart TD
    User["🧑 User"]

    subgraph Frontend["Frontend Layer"]
        NextJS["Next.js<br/>App Router"]
        SessionProvider["Session<br/>Provider"]
        Pages["Pages<br/>(dashboard, hiragana, katakana)"]
        FlashcardProvider["FlashcardProvider<br/>Context"]
        Components["React<br/>Components"]
        Tailwind["Tailwind<br/>CSS"]
    end

    subgraph Security["Security Layer"]
        Middleware["🔐 Middleware"]
        NextAuth["NextAuth.js"]
    end

    subgraph Backend["Backend Layer"]
        API["API Routes"]
        Prisma["Prisma ORM"]
        PostgreSQL["PostgreSQL 17"]
        Gemini["Google<br/>Gemini AI"]
    end

    User --> NextJS
    NextJS -.-> Middleware
    Middleware -.-> NextAuth
    NextAuth -.-> Middleware
    Middleware --> SessionProvider
    SessionProvider -.-> NextAuth
    NextAuth -.-> SessionProvider
    SessionProvider --> Pages
    Pages --> FlashcardProvider
    FlashcardProvider -.-> API
    API -.-> FlashcardProvider
    FlashcardProvider --> Components
    Components --> Tailwind
    NextJS -.-> API
    API -.-> Prisma
    Prisma -.-> PostgreSQL
    API -.-> NextAuth
    API -.-> Gemini
```

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
AUTH_SECRET=your_generated_secret_here

# Database (localhost is default for local dev and E2E tests)
POSTGRES_DB=sakumari
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Database URLs
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/sakumari?pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/sakumari

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
# Start full stack (Docker automatically configures database host)
pnpm run docker:dev-up

# Setup database
pnpm run db:setup

# Access services
# App: http://localhost:3000

# Stop services
pnpm run docker:down
```

**Note**: Docker Compose automatically overrides `POSTGRES_HOST=db` for containerized services. No manual `.env` editing required.

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
# Full E2E test workflow
pnpm run test:e2e:full

# Run tests only (if already set up)
pnpm run test:e2e

# Clean up test environment
pnpm run test:e2e:clean
```
