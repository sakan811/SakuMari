# Test Cases Overview

Comprehensive test suite for the SakuMari Japanese kana learning application with **53 test files** organized across unit, integration, database, and E2E testing. This represents a significant expansion from the previous 49 test files, with enhanced coverage for API endpoints, authentication flows, rate limiting with Upstash Redis, and comprehensive E2E scenarios.

**Test Distribution:**
- **48 Unit Tests**: Comprehensive component, hook, API, and utility testing
- **5 E2E Tests**: Cross-browser testing with mobile and desktop scenarios
- **Database Tests**: 4 SQLite-based tests with full isolation
- **Integration Tests**: Upstash Redis rate limiting with comprehensive coverage

## Test Organization

### **Unit Tests** (`*.test.*`)

**Components** (`*.test.tsx`)

- **Core UI**: button, button-link, header, layout
- **Learning**: flashcard, flashcard-app, flashcard-interaction, multiple-choice, mode-selector
- **Pages**: home, hiragana-page, katakana-page, dashboard
- **Navigation**: desktop-navigation, mobile-navigation
- **UI**: stats-summary, tips-modal
- **Providers**: SessionProviders

**Hooks** (`__tests__/hooks/*.test.*` - 4 test files)

- `useDashboardData.test.tsx` - Dashboard data fetching and error handling
- `useFlashcardInteraction.test.tsx` - Flashcard interaction logic with confidence algorithm
- `useFlashcardHandlers.test.tsx` - Mode selection handlers and choice management
- `useSorting.test.ts` - Table sorting functionality with multiple criteria

**API** (`__tests__/api/*.test.ts` - 5 test files)

- `health.test.ts` - System health checks with database connectivity
- `stats.test.ts` - Progress statistics API endpoint
- `tips.test.ts` - AI learning recommendations with Gemini integration
- `flashcard-submit.test.ts` - Answer submission with rate limiting
- `additional-edge-cases.test.ts` - Edge case handling and error scenarios

**Authentication** (`__tests__/auth/*.test.*` - 4 test files)

- `auth-config.test.ts` - NextAuth.js v5 configuration with providers
- `auth.test.tsx` - Login/logout flows with session management
- `auth-routes.test.ts` - Route protection and middleware enforcement
- `api-authentication.test.ts` - API authentication with protected endpoints

**Utilities** (`__tests__/utils/*.test.ts` - 9 test files)

- `api-errors.test.ts` - Error handling utilities with consistent error responses
- `api-middleware.test.ts` - API middleware functions for request processing
- `backgrounds.test.ts` - Background management utilities for responsive design
- `env.test.ts` - Environment variable validation and configuration
- `flashcard-utils.test.ts` - Flashcard algorithms with confidence-weighted selection
- `flashcard-submit-utils.test.ts` - Submission helpers with improved testability
- `kana-filter.test.ts` - Character filtering utilities for hiragana/katakana
- `prisma.test.ts` - Database client utilities with custom client management
- `should-fetch-kana-data.test.ts` - Data fetching logic with caching strategies

**Test Setup Files** (`__tests__/utils/*.ts`)

- `api-test-setup.ts` - API testing setup
- `mock-setup.ts` - Mock configuration
- `page-test-utils.ts` - Page testing utilities
- `test-assertions.ts` - Custom test assertions
- `test-helpers.ts` - Test helper functions

**Libraries** (`__tests__/lib/*.test.ts`)

- `rate-limit.test.ts` - Upstash Redis-based rate limiting utilities with comprehensive testing

**Flashcard Provider** (`__tests__/flashcard-provider/*.test.tsx`)

- `FlashcardProvider.test.tsx` - Flashcard context provider logic

### **Root Level Tests** (`__tests__/*.test.*` - 16 test files)

- `button.test.tsx` - Button UI component with accessibility
- `button-link.test.tsx` - Button link component with navigation
- `dashboard.test.tsx` - Dashboard page with progress analytics
- `flashcard.test.tsx` - Core flashcard component with interactions
- `flashcard-app.test.tsx` - Main flashcard application logic
- `header.test.tsx` - Application header with navigation
- `hiragana-page.test.tsx` - Hiragana practice page with mode switching
- `home.test.tsx` - Homepage with SEO and metadata
- `integration.test.tsx` - Cross-component integration testing
- `katakana-page.test.tsx` - Katakana practice page with character filtering
- `layout.test.tsx` - Root layout with metadata providers
- `mode-selector.test.tsx` - Learning mode selector with state management
- `multiple-choice.test.tsx` - Multiple choice component with answer validation
- `desktop-navigation.test.tsx` - Desktop navigation with responsive design
- `proxy.test.ts` - Route protection proxy with authentication
- `stats-summary.test.tsx` - Statistics summary component with data visualization

### **Component Tests** (`__tests__/components/*.test.tsx` - 3 test files)

- `SessionProviders.test.tsx` - NextAuth.js session providers with wrapper components
- `mobile-navigation.test.tsx` - Mobile navigation with responsive interactions
- `tips-modal.test.tsx` - AI-powered tips modal with markdown rendering

### **Database Tests** (`__tests__/db/*.test.ts` - 4 test files)

- `kana-progress.test.ts` - Progress tracking with accuracy calculations
- `concurrent-operations.test.ts` - Parallel operations and transaction handling
- `rls.test.ts` - Row Level Security verification with policy testing
- `user-data.test.ts` - User data management with foreign key constraints

### **SEO Tests** (`__tests__/seo/*.test.tsx`)

- `seo.test.tsx` - SEO metadata validation

### **Integration Tests**

**Rate Limiting** (`__tests__/lib/*.test.ts`)

- `rate-limit.test.ts` - Upstash Redis-based rate limiting with comprehensive integration testing

### **E2E Tests** (`__tests__/e2e/*.spec.ts`)

- `critical-flows.spec.ts` - Complete user journeys
- `essential-core.spec.ts` - Core functionality
- `mobile-essential.spec.ts` - Mobile interactions
- `performance-critical.spec.ts` - Performance validation
- `seo-health.spec.ts` - SEO and accessibility

## Key Test Scenarios

### Authentication & Security

- Google OAuth and test credentials authentication
- Session persistence and JWT token management
- Protected route enforcement and proxy
- API authentication proxy verification
- Row Level Security (RLS) configuration

### Learning Functionality

- Flashcard display and adaptive algorithm
- Multiple choice and typing practice modes
- Character filtering (hiragana/katakana)
- Progress tracking and accuracy calculation
- AI-powered learning tips generation

### Data Management

- User progress persistence with concurrent operations
- Database transactions and error handling
- Environment variable configuration
- API endpoint validation and error handling
- Prisma client utility functions
- Upstash Redis-based rate limiting with automatic fail-open functionality

### User Experience

- Responsive design across devices
- Navigation flows and accessibility
- SEO metadata validation
- Performance optimization
- Mobile-specific interactions

## Testing Framework

**Unit Tests:** Vitest v4.0.9 + React Testing Library v16.3.0 + Happy DOM v20.0.10
**Database Tests:** Vitest v4.0.9 with Node.js environment + isolated SQLite with sequential execution
**Integration Tests:** Vitest v4.0.9 with separate configuration for rate limiting (vitest.config.integration.mts)
**E2E Tests:** Playwright v1.56.1 with cross-browser support (Chrome, Firefox, Safari) and authentication setup
**API Mocking:** MSW (Mock Service Worker) for unit tests with comprehensive API mocking
**Authentication:** Comprehensive NextAuth.js v5 mocking with credentials provider across all test types
**Coverage:** V8 provider with separate coverage reports for different test types (unit, db, integration)

## Running Tests

```bash
# Unit tests
pnpm test:run           # Run once
pnpm test               # Watch mode
pnpm test:coverage      # With coverage

# Database tests (isolated SQLite)
pnpm test:db:full       # Fresh setup + run
pnpm test:db            # Run once (watch mode: test:db:watch)
pnpm test:db:coverage   # With coverage
pnpm test:db:clean      # Cleanup test database
pnpm test:db:setup      # Setup database test environment

# Integration tests (rate limiting with Upstash Redis)
pnpm test:integration           # Run once
pnpm test:integration:coverage  # With coverage

# E2E tests (requires Docker setup with PostgreSQL + Redis)
pnpm test:e2e:full      # Complete workflow (setup + build + run)
pnpm test:e2e:setup     # Setup environment with Docker containers
pnpm test:e2e:build     # Build for E2E testing
pnpm test:e2e:clean     # Cleanup Docker environment
pnpm test:e2e           # Run E2E tests (requires setup)

# Docker support for local testing
pnpm docker:db          # Start PostgreSQL + Redis containers
pnpm docker:dev-up      # Start full stack (DB + App + Redis)
pnpm docker:down        # Stop all containers

# All tests + quality checks
pnpm test:all           # Run lint, format, and all tests
```

## Test Environment

- **Unit Tests**: Happy DOM v20.0.10 environment with MSW for API mocking and Redis simulation
- **Database Tests**: Isolated SQLite (`__tests__/db/test.db`) with custom Prisma schema (`__tests__/db/schema.prisma`) for sequential execution with full isolation
- **Integration Tests**: Separate Vitest configuration (`vitest.config.integration.mts`) for Upstash Redis rate limiting tests with real Redis integration
- **Authentication**: Comprehensive NextAuth.js v5 mocking with test credentials provider across all test types, supporting both Google OAuth and credentials provider
- **E2E Tests**: Playwright v1.56.1 with setup/teardown projects, cross-browser testing (Chrome, Firefox, Safari, mobile), and credentials provider with PostgreSQL + Redis containers
- **Docker Support**: Docker Compose configuration with PostgreSQL 17 and Redis containers for isolated testing environments
- **Cleanup**: Automatic test isolation and cleanup between tests with proper Redis database separation and SQLite database recreation
- **Coverage**: Separate coverage reports for different test types using V8 provider with meaningful exclusions

## Test Configurations

### Vitest Configurations

- **Unit Tests**: `vitest.config.mts` - Happy DOM environment with React plugin and path aliases
- **Database Tests**: `vitest.config.db.mts` - Node.js environment with SQLite database and sequential execution
- **Integration Tests**: `vitest.config.integration.mts` - Happy DOM environment with Redis integration setup

### Playwright Configuration

- **E2E Tests**: `playwright.config.ts` - Multi-project setup with:
  - Setup/teardown projects for authentication state management
  - Cross-browser testing (Chrome, Firefox, Safari)
  - Mobile device simulation (iPhone 12)
  - Separate test matching for different test categories
  - PostgreSQL + Redis container integration
  - Optimized timeouts and performance settings

### Database Configuration

- **Test Database**: SQLite with custom schema (`__tests__/db/schema.prisma`) for isolated testing
- **Production Database**: PostgreSQL 17 with Row Level Security (RLS)
- **Docker Integration**: PostgreSQL 17 Alpine container for consistent testing environments

### Rate Limiting Configuration

- **Production**: Upstash Redis with endpoint-specific limits
- **Testing**: Increased limits for automated tests with local Redis fallback
- **Fail-Open**: Automatic Redis failure handling to prevent service disruption
