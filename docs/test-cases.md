# Test Cases Overview

Comprehensive test suite for the SakuMari Japanese kana learning application with 50+ test files organized across unit, integration, and E2E testing.

## Test Organization

### **Unit Tests** (`*.test.*`)

**Components** (`*.test.tsx`)

- **Core UI**: button, button-link, header, layout
- **Learning**: flashcard, flashcard-app, flashcard-interaction, multiple-choice, mode-selector
- **Pages**: home, hiragana-page, katakana-page, dashboard
- **Navigation**: desktop-navigation, mobile-navigation
- **UI**: stats-summary, tips-modal
- **Providers**: SessionProviders

**Hooks** (`__tests__/hooks/*.test.*`)

- `useDashboardData.test.tsx` - Dashboard data fetching
- `useFlashcardInteraction.test.tsx` - Flashcard interaction logic
- `useFlashcardHandlers.test.tsx` - Mode selection handlers
- `useSorting.test.ts` - Table sorting functionality

**API** (`__tests__/api/*.test.ts`)

- `health.test.ts` - System health checks
- `stats.test.ts` - Progress statistics
- `tips.test.ts` - AI learning recommendations
- `flashcard-submit.test.ts` - Answer submission
- `additional-edge-cases.test.ts` - Edge case handling

**Authentication** (`__tests__/auth/*.test.*`)

- `auth-config.test.ts` - NextAuth.js configuration
- `auth.test.tsx` - Login/logout flows
- `auth-routes.test.ts` - Route protection
- `api-authentication.test.ts` - API authentication

**Utilities** (`__tests__/utils/*.test.ts`)

- `api-errors.test.ts` - Error handling utilities
- `api-middleware.test.ts` - API proxy
- `backgrounds.test.ts` - Background management
- `env.test.ts` - Environment variables
- `flashcard-utils.test.ts` - Flashcard algorithms
- `flashcard-submit-utils.test.ts` - Submission helpers
- `kana-filter.test.ts` - Character filtering
- `prisma.test.ts` - Database client utilities
- `should-fetch-kana-data.test.ts` - Data fetching logic

**Test Setup Files** (`__tests__/utils/*.ts`)

- `api-test-setup.ts` - API testing setup
- `mock-setup.ts` - Mock configuration
- `page-test-utils.ts` - Page testing utilities
- `test-assertions.ts` - Custom test assertions
- `test-helpers.ts` - Test helper functions

**Libraries** (`__tests__/lib/*.test.ts`)

- `rate-limit.test.ts` - Custom ioredis rate limiting

**Flashcard Provider** (`__tests__/flashcard-provider/*.test.tsx`)

- `FlashcardProvider.test.tsx` - Flashcard context provider logic

### **Root Level Tests** (`__tests__/*.test.*`)

- `button.test.tsx` - Button component
- `button-link.test.tsx` - Button link component
- `dashboard.test.tsx` - Dashboard page
- `flashcard.test.tsx` - Flashcard component
- `flashcard-app.test.tsx` - Flashcard application
- `header.test.tsx` - Header component
- `hiragana-page.test.tsx` - Hiragana practice page
- `home.test.tsx` - Homepage
- `integration.test.tsx` - Cross-component integration
- `katakana-page.test.tsx` - Katakana practice page
- `layout.test.tsx` - Root layout
- `mode-selector.test.tsx` - Learning mode selector
- `multiple-choice.test.tsx` - Multiple choice component
- `desktop-navigation.test.tsx` - Desktop navigation
- `proxy.test.ts` - Route protection proxy
- `stats-summary.test.tsx` - Statistics summary component

### **Component Tests** (`__tests__/components/*.test.tsx`)

- `SessionProviders.test.tsx` - Session providers
- `mobile-navigation.test.tsx` - Mobile navigation
- `tips-modal.test.tsx` - Tips modal component

### **Integration Tests**

**Database** (`__tests__/db/*.test.ts`)

- `kana-progress.test.ts` - Progress tracking
- `concurrent-operations.test.ts` - Parallel operations
- `rls.test.ts` - Row Level Security verification
- `user-data.test.ts` - User data management

**SEO** (`__tests__/seo/*.test.tsx`)

- `seo.test.tsx` - SEO metadata validation

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
- Rate limiting with custom ioredis implementation

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

# Database tests (isolated SQLite)
pnpm test:db:full       # Fresh setup + run
pnpm test:db            # Run once (watch mode: test:db:watch)
pnpm test:db:coverage   # With coverage
pnpm test:db:clean      # Cleanup test database

# E2E tests (requires Docker setup)
pnpm test:e2e:full      # Complete workflow (setup + build + run)
pnpm test:e2e:setup     # Setup environment
pnpm test:e2e:build     # Build for E2E testing
pnpm test:e2e:clean     # Cleanup environment

# All tests + quality checks
pnpm test:all           # Run lint, format, typecheck, and all tests
```

## Test Environment

- **Database**: Isolated SQLite (`__tests__/db/test.db`) with custom Prisma schema
- **Authentication**: Mocked NextAuth.js with test credentials provider
- **API**: MSW for comprehensive API mocking
- **Rate Limiting**: Mocked ioredis for testing
- **Cleanup**: Automatic isolation and cleanup between tests
