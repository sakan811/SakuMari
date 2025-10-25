# Test Cases Overview

Comprehensive test suite for the SakuMari Japanese kana learning application with 48 test files organized across unit, integration, and E2E testing.

## Test Organization

### **Unit Tests** (`*.test.*`)

**Components** (`*.test.tsx`)

- **Core UI**: button, button-link, header, layout
- **Learning**: flashcard, flashcard-app, flashcard-interaction, multiple-choice, mode-selector
- **Pages**: home, hiragana-page, katakana-page, dashboard
- **Navigation**: desktop-navigation, mobile-navigation
- **UI**: stats-summary, tips-modal
- **Providers**: SessionProviders

**Hooks** (`hooks/*.test.*`)

- `useDashboardData.test.tsx` - Dashboard data fetching
- `useFlashcardInteraction.test.tsx` - Flashcard interaction logic
- `useFlashcardHandlers.test.tsx` - Mode selection handlers (moved from root `__tests__/`)
- `useSorting.test.ts` - Table sorting functionality

**API** (`api/*.test.ts`)

- `health.test.ts` - System health checks
- `stats.test.ts` - Progress statistics
- `tips.test.ts` - AI learning recommendations
- `flashcard-submit.test.ts` - Answer submission
- `additional-edge-cases.test.ts` - Edge case handling

**Authentication** (`auth/*.test.*`)

- `auth-config.test.ts` - NextAuth.js configuration
- `auth.test.tsx` - Login/logout flows
- `auth-routes.test.ts` - Route protection
- `api-authentication.test.ts` - API authentication

**Utilities** (`utils/*.test.ts`)

- `api-errors.test.ts` - Error handling utilities
- `api-middleware.test.ts` - API middleware
- `backgrounds.test.ts` - Background management
- `env.test.ts` - Environment variables
- `flashcard-utils.test.ts` - Flashcard algorithms
- `flashcard-submit-utils.test.ts` - Submission helpers
- `kana-filter.test.ts` - Character filtering
- `prisma.test.ts` - Database client utilities
- `should-fetch-kana-data.test.ts` - Data fetching logic

**Test Setup Files** (`utils/*.ts`)

- `api-test-setup.ts` - API testing setup
- `mock-setup.ts` - Mock configuration
- `page-test-utils.ts` - Page testing utilities
- `test-assertions.ts` - Custom test assertions
- `test-helpers.ts` - Test helper functions

**Libraries** (`lib/*.test.ts`)

- `rate-limit.test.ts` - Upstash Redis rate limiting

**Flashcard Provider** (`flashcard-provider/*.test.tsx`)

- `FlashcardProvider.test.tsx` - Flashcard context provider logic

### **Legacy Tests**

- `use-flashcard-handlers.test.ts` - Legacy flashcard handlers test (moved to `hooks/` directory)

### **Integration Tests**

**Database** (`db/*.test.ts`)

- `kana-progress.test.ts` - Progress tracking
- `concurrent-operations.test.ts` - Parallel operations
- `rls.test.ts` - Row Level Security verification
- `user-data.test.ts` - User data management

**Application** (`*.test.tsx`)

- `integration.test.tsx` - Cross-component integration
- `middleware.test.ts` - Route protection middleware

**SEO** (`seo/*.test.tsx`)

- `seo.test.tsx` - SEO metadata validation

### **E2E Tests** (`e2e/*.spec.ts`)

- `critical-flows.spec.ts` - Complete user journeys
- `essential-core.spec.ts` - Core functionality
- `mobile-essential.spec.ts` - Mobile interactions
- `performance-critical.spec.ts` - Performance validation
- `seo-health.spec.ts` - SEO and accessibility

## Key Test Scenarios

### Authentication & Security

- Google OAuth and test credentials authentication
- Session persistence and JWT token management
- Protected route enforcement and middleware
- API authentication middleware verification
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
- Rate limiting with Upstash Redis

### User Experience

- Responsive design across devices
- Navigation flows and accessibility
- SEO metadata validation
- Performance optimization
- Mobile-specific interactions

## Testing Framework

**Unit & Integration:** Vitest + React Testing Library
**Database:** Isolated SQLite environment with custom schema
**E2E:** Playwright with cross-browser support
**API Mocking:** MSW (Mock Service Worker)
**Authentication:** Comprehensive NextAuth.js mocking

## Running Tests

```bash
# Unit tests
pnpm test:run           # Run once
pnpm test               # Watch mode
pnpm test:coverage      # With coverage

# Database tests
pnpm test:db:run        # Run once
pnpm test:db:watch      # Watch mode
pnpm test:db:full       # Fresh setup + run

# E2E tests
pnpm test:e2e:full      # Complete workflow
pnpm test:e2e:setup     # Setup environment
pnpm test:e2e:clean     # Cleanup environment

# All tests
pnpm test:all           # Run all tests + quality checks
```

## Test Environment

- **Database**: Isolated SQLite (`__tests__/db/test.db`) with custom Prisma schema
- **Authentication**: Mocked NextAuth.js with test credentials provider
- **API**: MSW for comprehensive API mocking
- **Rate Limiting**: Mocked Upstash Redis for testing
- **Cleanup**: Automatic isolation and cleanup between tests
