# SakuMari Architecture Documentation

## System Architecture

![System Architecture](mermaid/system.svg)

**Core Stack:** Next.js 15.5.4 App Router + NextAuth.js v5.0.0-beta.29 + PostgreSQL 17 + Google Gemini AI v0.24.1

**Key Components:**

- **Authentication:** Google OAuth + session management with 30-day JWT cookies
- **Pages:** HomePage, Practice (Hiragana/Katakana), Dashboard
- **State Management:** FlashcardProvider context with confidence-weighted adaptive learning algorithm
- **Data Layer:** Prisma ORM with type-safe PostgreSQL queries + custom Prisma client generation
- **AI Integration:** Google Gemini AI v0.24.1 + React Markdown v10.1.0 for personalized learning recommendations with chat interface
- **Utilities:** Kana filtering system, API middleware, error handling, background management
- **License Management:** Automated license header management with validation scripts
- **Code Quality:** SonarQube integration for comprehensive analysis and coverage reporting

## Component Architecture

![Component Architecture](mermaid/component.svg)

**Design Principles:**

- **Separation of Concerns:** Clear boundaries between presentation and business logic
- **Component Composition:** Container → Presentation → Layout hierarchy
- **Context-Driven State:** React Context for global state, custom hooks for data fetching

**State Management:**

- **FlashcardProvider:** Confidence-weighted adaptive learning algorithm + flashcard state
- **SessionProviders:** NextAuth.js authentication context
- **Custom Hooks:** `useDashboardData`, `useSorting`, `useAuthStatus`, `useFlashcardInteraction`, `useFlashcardHandlers`
- **UI Component System:** Modular `/components/ui/` directory with Button, ButtonLink, FilterButton components
- **Error Handling:** Enhanced API utilities for foreign key constraint violations

**Component Groups:**

### Core Components

- **HomePage** - Landing page with auth-aware content
- **FlashcardApp** - Main practice session container
- **FlashcardProvider** - Confidence-weighted adaptive learning context
- **Header** - Global navigation + auth controls
- **SessionProviders** - Authentication wrapper

### Practice Components

- **Flashcard** - Dual input modes (typing/multiple-choice)
- **ModeSelector** - Input mode toggle (managed by useFlashcardHandlers)
- **MultipleChoice** - Multiple-choice interface (managed by useFlashcardHandlers)

### Dashboard Components

- **Dashboard** - Progress tracking overview
- **StatsSummary** - Statistics cards
- **CharacterProgressTable** - Sortable/filterable progress data
- **TipsModal** - AI chat interface

### Table Components

- **CharacterProgressTable** - Sortable progress data table
- **CharacterTableRow** - Individual progress row component
- **SortableTableHeader** - Sortable column headers

### Navigation Components

- **DesktopNavigation** - Desktop navigation menu
- **MobileNavigation** - Mobile navigation menu

### UI Components

- **Button** - Consistent button interface (`/components/ui/` directory)
- **ButtonLink** - Link-style button component (`/components/ui/` directory)
- **FilterButton** - Filter buttons for character type selection (`/components/ui/` directory)

**Responsive Strategy:** Mobile-first design with progressive enhancement

**Key API Endpoints:**

- `GET /api/stats` - Progress data API (protected - requires authentication)
- `POST /api/flashcards/submit` - Answer processing API (protected)
- `POST /api/tips` - AI learning tips API (protected)
- `GET /api/auth/providers` - Available login options
- `POST /api/auth/[...nextauth]` - Authentication session management
- `GET /api/health` - System health monitoring (public)

**Route Protection:**

- Protected routes: `/hiragana`, `/katakana`, `/dashboard`, `/api/stats`, `/api/flashcards/*`, `/api/tips`
- Public routes: `/`, `/api/auth/*`, `/api/health`
- Middleware enforces authentication for all practice and progress APIs

## App Architecture

![App Architecture](mermaid/app.svg)

**Next.js 15 App Router** - File-system based routing with enhanced SSR capabilities

**Key Features:**

- **File-based Routing:** `page.tsx` → automatic routes, `layout.tsx` → shared UI
- **Hybrid Rendering:** Server components (default) + client components (`"use client"`)
- **Co-located APIs:** Route handlers alongside pages for better organization
- **SEO Optimized:** Dynamic `sitemap.ts`, `robots.ts`, and page-level metadata
- **Performance:** Automatic code splitting, SSR, and static generation
- **Health Monitoring:** Database connectivity endpoint (`/api/health`)
- **Enhanced Protection:** Middleware enforcement for all practice and progress APIs (`/hiragana`, `/katakana`, `/dashboard`, `/api/flashcards/*`, `/api/stats`)

## Project Structure Overview

**Route Structure:**

```
app/
├── page.tsx              # Homepage with SEO metadata
├── layout.tsx            # Root layout with comprehensive metadata
├── globals.css           # Global styles and Tailwind imports
├── robots.ts             # SEO configuration
├── sitemap.ts            # Dynamic sitemap
├── favicon.ico           # Site favicon
├── hiragana/page.tsx     # Hiragana practice (protected)
├── katakana/page.tsx     # Katakana practice (protected)
├── dashboard/page.tsx    # Progress dashboard (protected)
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.ts      # NextAuth.js authentication
    │   └── providers/route.ts          # Available auth providers
    ├── stats/route.ts                  # Progress data API (protected)
    ├── flashcards/
    │   └── submit/route.ts             # Answer processing (protected)
    ├── tips/route.ts                   # AI learning tips (protected)
    └── health/route.ts                 # System health monitoring
middleware.ts                           # Route protection middleware
```

**Libraries & Utilities:**

```
lib/
├── auth.ts                     # NextAuth.js configuration
├── prisma.ts                   # Database client setup
├── env.ts                      # Environment variable management
├── api-errors.ts               # API error handling
├── api-middleware.ts           # API middleware functions
├── backgrounds.ts              # Background management
├── metadata.ts                 # SEO & metadata configuration
├── kana-filter.ts              # Character filtering utilities
├── flashcard-submit-utils.ts   # Flashcard submission utilities and validation
├── flashcard-utils.ts          # Flashcard helper functions
└── should-fetch-kana-data.ts   # Data fetching utilities
```

**Custom Hooks:**

```
hooks/
├── useAuthStatus.ts          # Authentication state management
├── useDashboardData.ts       # Dashboard data fetching
├── useFlashcardHandlers.ts   # Flashcard mode and choice selection handlers
├── useFlashcardInteraction.ts # Flashcard interaction logic
└── useSorting.ts             # Table sorting functionality
```

**Test Infrastructure:**

```
__tests__/
├── api/                      # API endpoint tests
├── auth/                     # Authentication flow tests
├── db/                       # Database operation tests with isolated SQLite
├── e2e/                      # End-to-end Playwright tests
├── flashcard-provider/       # Provider logic tests
├── hooks/                    # Custom hooks tests
├── seo/                      # SEO and metadata tests
└── utils/                    # Test helpers and utilities
```

**Test Coverage:**

- **76 total test files** covering unit, integration, database, and E2E scenarios
- **Comprehensive API testing** with isolation and error handling
- **Cross-browser E2E testing** with Playwright
- **Database testing** with isolated SQLite environment
- **Hook testing** with dedicated `__tests__/hooks/` directory structure
- **UI component testing** with React Testing Library
- **Accessibility testing** integrated throughout test suite

**Development Infrastructure:**

```
docker/                         # Docker configuration for local testing
├── Dockerfile                  # Application container definition
└── docker-compose.yml          # PostgreSQL development environment
scripts/                        # Development automation scripts
└── manage-license-headers.js   # License header management
sonar-project.properties        # SonarQube code quality configuration
generated/                      # Generated code and clients
└── prisma_client/              # Custom Prisma client output
```
