# SakuMari Architecture Documentation

## System Architecture

![System Architecture](mermaid/system.svg)

**Core Stack:** Next.js 15 App Router + NextAuth.js v5 + PostgreSQL 17 + Google Gemini AI

**Key Components:**

- **Authentication:** Google OAuth + session management with 30-day JWT cookies
- **Pages:** HomePage, Practice (Hiragana/Katakana), Dashboard
- **State Management:** FlashcardProvider context with adaptive learning algorithm
- **Data Layer:** Prisma ORM with type-safe PostgreSQL queries
- **AI Integration:** Google Gemini for personalized learning recommendations

## Component Architecture

![Component Architecture](mermaid/component.svg)

**Design Principles:**

- **Separation of Concerns:** Clear boundaries between presentation and business logic
- **Component Composition:** Container → Presentation → Layout hierarchy
- **Context-Driven State:** React Context for global state, custom hooks for data fetching

**State Management:**

- **FlashcardProvider:** Adaptive learning algorithm + flashcard state
- **SessionProviders:** NextAuth.js authentication context
- **Custom Hooks:** `useDashboardData`, `useSorting`, `useAuthStatus`

**Component Groups:**

### Core Components

- **HomePage** - Landing page with auth-aware content
- **FlashcardApp** - Main practice session container
- **Header** - Global navigation + auth controls
- **SessionProviders** - Authentication wrapper

### Practice Components

- **Flashcard** - Dual input modes (typing/multiple-choice)
- **ModeSelector** - Input mode toggle
- **MultipleChoice** - Multiple-choice interface

### Dashboard Components

- **Dashboard** - Progress tracking overview
- **StatsSummary** - Statistics cards
- **CharacterProgressTable** - Sortable/filterable progress data
- **TipsModal** - AI chat interface

### UI Components

- **Navigation** - Desktop/Mobile responsive menus
- **Table** - Sortable headers, data rows
- **Buttons** - Consistent interface elements

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

**Route Structure:**

```
app/
├── page.tsx              # Homepage
├── hiragana/page.tsx     # Hiragana practice
├── katakana/page.tsx     # Katakana practice
├── dashboard/page.tsx    # Progress dashboard
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── stats/route.ts
    ├── flashcards/submit/route.ts
    └── tips/route.ts
```
