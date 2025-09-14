# SakuMari Architecture Documentation

## System Architecture

![System Architecture](mermaid/system.svg)

**Core Stack:** Next.js 15 App Router + NextAuth.js v5 + PostgreSQL 17 + Google Gemini AI

**Key Components:**

- **Authentication:** Google OAuth + session management with 30-day JWT cookies
- **Pages:** HomePage, Practice (Hiragana/Katakana), Dashboard
- **State Management:** FlashcardProvider context with confidence-weighted adaptive learning algorithm
- **Data Layer:** Prisma ORM with type-safe PostgreSQL queries + custom Prisma client generation
- **AI Integration:** Google Gemini for personalized learning recommendations
- **Utilities:** Kana filtering system, API middleware, error handling, background management

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

**Component Groups:**

### Core Components

- **HomePage** - Landing page with auth-aware content
- **FlashcardApp** - Main practice session container
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

### UI Components

- **Navigation** - Desktop/Mobile responsive menus
- **Table** - Sortable headers, data rows
- **Buttons** - Consistent interface elements (`/components/ui/` directory)
- **Filtering** - Filter buttons for character type selection (all/hiragana/katakana)

**Responsive Strategy:** Mobile-first design with progressive enhancement

## App Architecture

![App Architecture](mermaid/app.svg)

**Next.js 15 App Router** - File-system based routing with enhanced SSR capabilities

**Key Features:**

- **File-based Routing:** `page.tsx` → automatic routes, `layout.tsx` → shared UI
- **Hybrid Rendering:** Server components (default) + client components (`"use client"`)
- **Co-located APIs:** Route handlers alongside pages for better organization
- **SEO Optimized:** Dynamic `sitemap.ts`, `robots.ts`, and page-level metadata
- **Performance:** Automatic code splitting, SSR, and static generation

## Project Structure Overview

**Route Structure:**

```
app/
├── page.tsx              # Homepage
├── hiragana/page.tsx     # Hiragana practice
├── katakana/page.tsx     # Katakana practice
├── dashboard/page.tsx    # Progress dashboard
├── globals.css           # Global styles
├── layout.tsx            # Root layout
├── robots.ts             # SEO configuration
├── sitemap.ts            # Dynamic sitemap
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.ts
    │   └── providers/route.ts
    ├── stats/route.ts
    ├── flashcards/
    │   └── submit/route.ts
    ├── tips/route.ts
    └── health/route.ts
middleware.ts             # Route protection middleware (root level)
```

**Libraries & Utilities:**

```
lib/
├── auth.ts               # NextAuth.js configuration
├── prisma.ts             # Database client setup
├── env.ts                # Environment variable management
├── api-errors.ts         # API error handling
├── api-middleware.ts     # API middleware functions
├── backgrounds.ts        # Background management
├── metadata.ts           # SEO & metadata configuration
├── kana-filter.ts        # Character filtering utilities
└── flashcard-submit-utils.ts # Flashcard submission utilities
```

**Custom Hooks:**

```
hooks/
├── useAuthStatus.ts          # Authentication state management
├── useDashboardData.ts       # Dashboard data fetching
├── useFlashcardInteraction.ts # Flashcard interaction logic
├── useFlashcardHandlers.ts   # Flashcard mode and choice selection handlers
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