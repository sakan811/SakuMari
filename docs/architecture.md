# SakuMari Architecture Documentation

This document provides comprehensive architectural documentation for SakuMari, a Japanese Kana flashcard app built with Next.js 15.

## System Architecture

SakuMari uses a modern Next.js 15 App Router architecture that seamlessly integrates client-side interactivity with server-side efficiency. The system centers around authenticated user sessions managed by NextAuth.js v5, flowing through three main page routes (HomePage, Practice Pages, Dashboard) that connect to a unified API layer. The FlashcardProvider manages adaptive learning state using React Context, while custom hooks handle data fetching and user interactions. All user progress flows through Prisma ORM to PostgreSQL 17, with Google Gemini AI providing personalized learning recommendations.

![System Architecture Diagram](mermaid/system.svg)

## Component Architecture

The application follows a hierarchical component structure with clear separation of concerns. Components are organized into logical groups: Core components handle routing and context management, Practice components manage flashcard interactions, Dashboard components display progress data, and UI components provide reusable interface elements.

![Component Architecture Diagram](mermaid/component.svg)

## Key Architectural Patterns

### Context-Based State Management

- **FlashcardProvider**: Manages adaptive learning algorithm, flashcard state, and user interactions
- **SessionProviders**: Wraps the app with NextAuth.js session context for authentication

### Component Composition

- **Container Components**: FlashcardApp, Dashboard handle overall page logic
- **Presentation Components**: Flashcard, ModeSelector focus on user interface
- **Layout Components**: Header provides navigation across all pages

### Data Flow Patterns

- **Top-Down Props**: Parent components pass configuration and callbacks to children
- **Context Consumption**: Components access shared state through React Context hooks
- **Custom Hooks**: Encapsulate data fetching and business logic (useDashboardData, useSorting, useAuthStatus)

### Responsive Design Strategy

- **Mobile-First**: Components include responsive breakpoints (sm:, lg:)
- **Adaptive Navigation**: Separate desktop and mobile navigation components
- **Progressive Enhancement**: Core functionality works on all devices, enhanced features on larger screens

### Component Categories

#### Core Components

- **HomePage**: Landing page with authentication-aware content
- **FlashcardApp**: Main container for practice sessions
- **Header**: Global navigation with authentication controls
- **SessionProviders**: Authentication context wrapper

#### Practice Components

- **FlashcardProvider**: Context provider for flashcard logic and adaptive algorithm
- **Flashcard**: Main practice interface with dual input modes
- **ModeSelector**: Toggle between typing and multiple-choice modes
- **TypingMode**: Handles typing practice interface and validation
- **MultipleChoiceMode**: Handles multiple choice practice interface and validation
- **FlashcardFeedback**: Displays results and feedback for user answers
- **MultipleChoice**: Multiple-choice answer interface

#### Dashboard Components

- **Dashboard**: Progress tracking main view
- **StatsSummary**: Overview statistics cards
- **CharacterProgressTable**: Detailed progress table with filtering and sorting
- **TipsModal**: Modal interface for AI chat functionality

#### Supporting Components

- **Navigation Components**: DesktopNavigation, MobileNavigation for responsive menus
- **Table Components**: SortableTableHeader, CharacterTableRow for data presentation
- **UI Components**: Button, ButtonLink for consistent interface elements

This architecture ensures maintainable code through clear component boundaries, predictable data flow, and separation of concerns between presentation and business logic.

## App Architecture

The SakuMari app follows the Next.js 15 App Router paradigm, which provides a file-system based routing structure with enhanced capabilities for layouts, middleware, and API routes. The app directory serves as the foundation for all pages, API endpoints, and shared resources, creating a cohesive and scalable application structure.

The App Router architecture enables server-side rendering, static site generation, and client-side routing seamlessly. Each page.tsx file becomes a route, while layout.tsx files provide shared UI components across route segments. API routes are co-located with pages, making the codebase more organized and maintainable.

![App Router Architecture Diagram](mermaid/app.svg)

### App Router Key Features

#### File-based Routing

- **Automatic Route Creation**: Each `page.tsx` file automatically becomes a route
- **Nested Routes**: Folder structure maps directly to URL structure
- **Layout Inheritance**: `layout.tsx` files provide shared UI across route segments

#### Server and Client Components

- **Server Components**: Default rendering on the server for better performance
- **Client Components**: Interactive components with `"use client"` directive
- **Hybrid Rendering**: Seamless integration of server and client components

#### API Route Integration

- **Co-located APIs**: API routes live alongside pages for better organization
- **Route Handlers**: Modern `route.ts` files replace legacy API pages
- **Dynamic Routes**: `[...nextauth]` enables catch-all authentication routes

#### Metadata and SEO

- **Page-level Metadata**: Each page can export metadata for SEO optimization
- **Dynamic Generation**: `sitemap.ts` and `robots.ts` generate SEO files automatically
- **Structured Data**: JSON-LD schema markup for search engines

#### Performance Optimizations

- **Automatic Code Splitting**: Routes are automatically split for optimal loading
- **Server-side Rendering**: Enhanced SSR capabilities with React Server Components
- **Static Generation**: Build-time optimization for non-dynamic content

This App Router architecture provides a scalable foundation that separates concerns while maintaining close relationships between related functionality, enabling efficient development and optimal user experience.
