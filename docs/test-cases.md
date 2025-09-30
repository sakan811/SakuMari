# Test Cases Overview

This document provides a comprehensive overview of the test cases in the `__tests__` directory for the SakuMari Japanese learning application.

## Test Structure

The test suite is organized into several main categories:

### 1. **Unit Tests**

- **Components**: Individual React component testing
- **Hooks**: Custom hook functionality testing
- **Utilities**: Helper functions and utilities
- **API**: API endpoint testing
- **Authentication**: Auth-related functionality

### 2. **Integration Tests**

- **Database**: Database operations and Prisma client testing
- **Critical Edge Cases**: Complex user flows and error handling
- **SEO**: Search engine optimization metadata testing

### 3. **End-to-End (E2E) Tests**

- **Critical Flows**: Complete user journeys
- **Essential Core**: Core functionality verification
- **Mobile**: Mobile-specific interactions
- **Performance**: Performance-critical scenarios
- **SEO Health**: SEO validation

## Test Categories

### Component Tests (`*.test.tsx`)

#### Core Components

- **`button.test.tsx`** - Button component rendering and interactions
- **`button-link.test.tsx`** - Button link navigation and accessibility
- **`header.test.tsx`** - Header navigation and branding
- **`layout.test.tsx`** - Root layout structure and providers

#### Learning Components

- **`flashcard.test.tsx`** - Flashcard display and interactions
- **`flashcard-app.test.tsx`** - Main flashcard application
- **`flashcard-interaction.test.tsx`** - User interaction handling
- **`multiple-choice.test.tsx`** - Multiple choice question component
- **`multiple-choice-component.test.tsx`** - Multiple choice implementation
- **`mode-selector.test.tsx`** - Learning mode selection interface

#### Page Components

- **`home.test.tsx`** - Homepage functionality and SEO
- **`hiragana-page.test.tsx`** - Hiragana practice page
- **`katakana-page.test.tsx`** - Katakana practice page
- **`dashboard.test.tsx`** - Dashboard progress display
- **`dashboard-page.test.tsx`** - Dashboard page interactions
- **`dashboard-interaction.test.tsx`** - Dashboard user interactions
- **`dashboard-tips.test.tsx`** - Learning tips display

#### Navigation Components

- **`desktop-navigation.test.tsx`** - Desktop navigation menu
- **`mobile-navigation.test.tsx`** - Mobile navigation and hamburger menu

#### UI Components

- **`stats-summary.test.tsx`** - Statistics summary display
- **`tips-modal.test.tsx`** - Tips modal interactions

### Hook Tests (`hooks/*.test.tsx`)

- **`useDashboardData.test.tsx`** - Dashboard data fetching
- **`useFlashcardInteraction.test.tsx`** - Flashcard interaction logic
- **`use-flashcard-handlers.test.ts`** - Mode selection handlers
- **`useSorting.test.ts`** - Data sorting functionality

### API Tests (`api/*.test.ts`)

- **`flashcards.test.ts`** - Flashcard data retrieval and submission
- **`flashcard-submit.test.ts`** - Answer submission processing
- **`stats.test.ts`** - User progress statistics
- **`tips.test.ts`** - AI-powered learning tips
- **`health.test.ts`** - API health checks
- **`additional-edge-cases.test.ts`** - Edge case handling

### Authentication Tests (`auth/*.test.tsx`)

- **`auth-config.test.ts`** - Authentication configuration
- **`auth-flows.test.tsx`** - Authentication user flows
- **`auth-routes.test.ts`** - Protected route handling
- **`session-management.test.tsx`** - Session persistence
- **`session-provider.test.tsx`** - Session context provider
- **`api-authentication.test.ts`** - API authentication middleware
- **`protected-routes.test.tsx`** - Route protection logic

### Database Tests (`db/*.test.ts`)

- **`setup.ts`** - Database test setup utilities
- **`kana-progress.test.ts`** - Kana progress tracking
- **`concurrent-operations.test.ts`** - Concurrent database operations
- **`kana-filtering.test.ts`** - Kana character filtering
- **`user-data.test.ts`** - User data management

### SEO Tests (`seo/*.test.ts`)

- **`metadata.test.ts`** - SEO metadata validation
- **`seo-files.test.ts`** - SEO file generation

### Utility Tests (`utils/*.test.ts`)

- **`api-errors.test.ts`** - API error handling
- **`api-middleware.test.ts`** - API middleware functionality
- **`backgrounds.test.ts`** - Background image utilities
- **`env.test.ts`** - Environment variable handling
- **`flashcard-utils.test.ts`** - Flashcard algorithm utilities
- **`kana-filter.test.ts`** - Kana filtering logic
- **`prisma.test.ts`** - Prisma client utilities
- **`should-fetch-kana-data.test.ts`** - Data fetching logic

### Integration Tests

- **`integration.test.tsx`** - Cross-component integration
- **`critical-edge-cases.test.tsx`** - Critical error scenarios

### End-to-End Tests (`e2e/*.spec.ts`)

- **`critical-flows.spec.ts`** - Complete user journeys across devices
- **`essential-core.spec.ts`** - Core application functionality
- **`mobile-essential.spec.ts`** - Mobile-specific features
- **`performance-critical.spec.ts`** - Performance validation
- **`seo-health.spec.ts`** - SEO and accessibility checks

### E2E Setup and Teardown

- **`auth.setup.ts`** - Authentication test setup
- **`cleanup.teardown.ts`** - Test environment cleanup
- **`db-reset.ts`** - Database reset between tests

## Key Test Scenarios

### Authentication & Authorization

- Google OAuth integration
- Credential-based authentication
- Session management and persistence
- Protected route access control
- Role-based authorization

### Learning Functionality

- Flashcard display and progression
- Adaptive learning algorithm
- Multiple choice and typing modes
- Progress tracking and statistics
- Accuracy calculation and improvement

### Data Management

- User progress persistence
- Kana character filtering
- Database operations and transactions
- Concurrent operation handling
- Data validation and error handling

### User Experience

- Mobile responsive design
- Navigation flows
- Loading states and error handling
- Accessibility features
- Performance optimization

### API Integration

- RESTful endpoint testing
- Request validation
- Error handling and response formatting
- Authentication middleware
- Rate limiting and security

### SEO & Accessibility

- Meta tags and structured data
- Image optimization
- Screen reader compatibility
- Keyboard navigation
- Performance metrics

## Testing Framework

The test suite uses:

- **Vitest** for unit and integration testing
- **Testing Library** for React component testing
- **Playwright** for end-to-end testing
- **MSW (Mock Service Worker)** for API mocking
- **Prisma** with SQLite for isolated database testing

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run unit tests only
pnpm test:run

# Run database tests
pnpm test:db:full

# Run E2E tests
pnpm test:e2e:full
```

## Test Configuration

- **Isolated Database**: Uses SQLite for testing to avoid interference with development data
- **Mock Authentication**: Comprehensive mocking of NextAuth.js for reliable test execution
- **Environment Mocking**: Proper environment variable handling for different test scenarios
- **Cleanup Procedures**: Automatic cleanup between tests to ensure isolation
