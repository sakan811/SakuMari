# SakuMari Architecture Documentation

## System Architecture

![System Architecture](mermaid/system.svg)

**Core Stack:** Next.js 15.5.4 App Router + React 19.2.0 + NextAuth.js v5.0.0-beta.29 + PostgreSQL 17 + Google Gemini AI v0.24.1

**Key Components:**

- **Authentication:** Google OAuth + test credentials with 30-day JWT cookies
- **Pages:** HomePage, Practice (Hiragana/Katakana), Dashboard
- **State Management:** FlashcardProvider with confidence-weighted adaptive learning
- **Data Layer:** Prisma ORM 6.16.3 with PostgreSQL 17
- **AI Integration:** Google Gemini AI v0.24.1 for personalized learning recommendations
- **Styling:** Tailwind CSS v4.1.14 with mobile-first responsive design
- **Testing:** Vitest v3.2.4 + Playwright v1.55.1 for comprehensive testing
- **Code Quality:** ESLint 9.36.0 + Prettier with React and TypeScript plugins

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
- **UI Components:** Modular `/components/ui/` directory with Button, ButtonLink, FilterButton
- **Error Handling:** API utilities (`lib/api-errors.ts`) for constraint violations and proper responses
- **Kana Filtering:** Character filtering utilities (`lib/kana-filter.ts`) for hiragana/katakana selection

**Component Groups:**

### Core Components
- **HomePage** - Landing page with auth-aware content
- **FlashcardApp** - Main practice session container
- **FlashcardProvider** - Adaptive learning context
- **Header** - Global navigation + auth controls
- **SessionProviders** - Authentication wrapper

### Practice Components
- **Flashcard** - Dual input modes (typing/multiple-choice) with adaptive learning
- **ModeSelector** - Input mode toggle
- **MultipleChoice** - Multiple-choice interface
- **FilterButton** - Character type filtering (hiragana/katakana/all)

### Dashboard Components
- **Dashboard** - Progress tracking overview
- **StatsSummary** - Statistics cards
- **CharacterProgressTable** - Sortable/filterable progress data
- **TipsModal** - AI chat interface

### Navigation Components
- **DesktopNavigation** - Desktop navigation menu
- **MobileNavigation** - Mobile navigation menu

### UI Components
- **Button** - Consistent button interface (`/components/ui/`)
- **ButtonLink** - Link-style button component (`/components/ui/`)
- **FilterButton** - Character type selection (`/components/ui/`)

**API Endpoints:**

- `GET /api/stats` - Progress data (protected)
- `POST /api/flashcards/submit` - Answer processing (protected)
- `POST /api/tips` - AI learning tips (protected)
- `GET /api/auth/providers` - Available login options
- `POST /api/auth/[...nextauth]` - Authentication session management
- `GET /api/health` - System health monitoring (public)

**Route Protection:**
- Protected: `/hiragana`, `/katakana`, `/dashboard`, `/api/stats`, `/api/flashcards/*`, `/api/tips`
- Public: `/`, `/api/auth/*`, `/api/health`
- Middleware enforces authentication for practice and progress APIs

## App Architecture

![App Architecture](mermaid/app.svg)

**Next.js 15 App Router** - File-system based routing with enhanced SSR capabilities

**Key Features:**

- **File-based Routing:** `page.tsx` → automatic routes, `layout.tsx` → shared UI
- **Hybrid Rendering:** Server components (default) + client components (`"use client"`)
- **Co-located APIs:** Route handlers alongside pages
- **SEO Optimized:** Dynamic `sitemap.ts`, `robots.ts`, and page-level metadata
- **Performance:** Automatic code splitting, SSR, and static generation with React 19.2.0
- **Health Monitoring:** Database connectivity endpoint (`/api/health`)
- **Middleware Protection:** Enforcement for practice and progress APIs
- **Type Safety:** TypeScript 5.9.3 with dedicated `/types/` directory

## Project Structure

**Route Structure:**

```
app/
├── page.tsx              # Homepage
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── robots.ts             # SEO configuration
├── sitemap.ts            # Dynamic sitemap
├── hiragana/page.tsx     # Hiragana practice (protected)
├── katakana/page.tsx     # Katakana practice (protected)
├── dashboard/page.tsx    # Progress dashboard (protected)
├── api/
│   ├── auth/             # Authentication routes
│   ├── stats/            # Progress data API (protected)
│   ├── flashcards/       # Flashcard APIs (protected)
│   ├── tips/             # AI learning tips (protected)
│   └── health/           # System health monitoring
└── middleware.ts         # Route protection
```

**Core Libraries:**

```
lib/
├── auth.ts                     # NextAuth.js configuration
├── prisma.ts                   # Database client
├── env.ts                      # Environment variables
├── api-errors.ts               # API error handling
├── metadata.ts                 # SEO & metadata
├── kana-filter.ts              # Character filtering
├── flashcard-utils.ts          # Flashcard helpers
└── flashcard-submit-utils.ts   # Submission utilities
```

**Custom Hooks:**

```
hooks/
├── useAuthStatus.ts            # Authentication state
├── useDashboardData.ts         # Dashboard data fetching
├── useFlashcardHandlers.ts     # Mode and choice handling
├── useFlashcardInteraction.ts  # Card interaction logic
└── useSorting.ts               # Table sorting
```

**Testing:**

```
__tests__/
├── api/                        # API endpoint tests
├── auth/                       # Authentication flow tests
├── db/                         # Database tests (SQLite)
├── e2e/                        # End-to-end Playwright tests
├── hooks/                      # Custom hooks tests
├── flashcard-provider/         # Provider logic tests
├── seo/                        # SEO and metadata tests
└── utils/                      # Test utilities
```

**Development:**

```
docker/
├── Dockerfile                  # Application container
└── docker-compose.yml          # PostgreSQL development
scripts/
└── manage-license-headers.js   # License management
generated/
└── prisma_client/              # Custom Prisma client output
```
