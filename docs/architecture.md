# SakuMari Architecture Documentation

This document provides comprehensive architectural documentation for SakuMari, a Japanese Kana flashcard app built with Next.js 15.

## System Architecture

SakuMari uses a modern Next.js 15 App Router architecture that seamlessly integrates client-side interactivity with server-side efficiency. The system centers around authenticated user sessions managed by NextAuth.js v5, flowing through three main page routes (HomePage, Practice Pages, Dashboard) that connect to a unified API layer. The FlashcardProvider manages adaptive learning state using React Context, while custom hooks handle data fetching and user interactions. All user progress flows through Prisma ORM to PostgreSQL 17, with Google Gemini AI providing personalized learning recommendations.

```mermaid
flowchart TD
    %% User Interface Layer
    User([👤 User]) --> Browser{{"🌐 Next.js App Router"}}

    %% Authentication Flow
    Browser --> Auth["🔐 NextAuth.js v5<br/>Google OAuth + Test Creds"]
    Auth --> Session["📝 Session Management<br/>30-day JWT + Cookies"]

    %% Page Routes
    Browser --> Home["🏠 HomePage<br/>Landing & Navigation"]
    Browser --> Practice["⚡ Practice Pages<br/>Hiragana/Katakana"]
    Browser --> Dashboard["📊 Dashboard<br/>Progress Tracking"]

    %% React Context & State
    Practice --> Provider["🎯 FlashcardProvider<br/>Adaptive Algorithm"]
    Provider --> Components["🃏 UI Components<br/>Flashcard, ModeSelector"]

    %% API Layer
    Components --> API["🔌 API Routes"]
    Dashboard --> API
    API --> Stats["/api/stats<br/>Progress Data"]
    API --> Submit["/api/flashcards/submit<br/>Answer Processing"]
    API --> Tips["/api/tips<br/>AI Recommendations"]
    API --> Health["/api/health<br/>System Status"]

    %% Data Layer
    Stats --> Prisma["🗄️ Prisma ORM<br/>Type-safe Queries"]
    Submit --> Prisma
    Tips --> Prisma
    Prisma --> DB[(🐘 PostgreSQL 17<br/>Kana + Progress + Auth)]

    %% AI Integration
    Tips --> Gemini["🤖 Google Gemini AI<br/>Personalized Learning"]


    %% Custom Hooks
    Components --> Hooks["⚡ React Hooks<br/>Auth, Data, Interaction"]
    Dashboard --> Hooks

    %% Styling
    classDef userLayer fill:#e8f4fd,stroke:#1e40af,stroke-width:2px
    classDef appLayer fill:#fef3c7,stroke:#d97706,stroke-width:2px
    classDef dataLayer fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    classDef aiLayer fill:#fdf4ff,stroke:#a855f7,stroke-width:2px

    class User,Browser userLayer
    class Home,Practice,Dashboard,Provider,Components,API,Hooks appLayer
    class Prisma,DB dataLayer
    class Auth,Session,Gemini aiLayer
```

## Component Architecture

The application follows a hierarchical component structure with clear separation of concerns. Components are organized into logical groups: Core components handle routing and context management, Practice components manage flashcard interactions, Dashboard components display progress data, and UI components provide reusable interface elements.

```mermaid
flowchart TD
    %% Authentication Layer
    SessionProviders["🔐 SessionProviders<br/>Authentication Context Provider<br/>NextAuth.js Session Management"]
    
    %% Root Application Structure
    SessionProviders --> HomePage["🏠 HomePage<br/>Landing Page Component<br/>Authentication-aware Content"]
    SessionProviders --> FlashcardApp["⚡ FlashcardApp<br/>Main Practice Application<br/>Container for All Practice Features"]
    
    %% Core Application Components
    FlashcardApp --> Header["📋 Header<br/>Global Navigation Component<br/>Authentication Controls"]
    FlashcardApp --> FlashcardProvider["🎯 FlashcardProvider<br/>React Context Provider<br/>Adaptive Learning Algorithm & State"]
    
    %% Navigation Components (Header Children)
    Header --> DesktopNavigation["🖥️ DesktopNavigation<br/>Desktop Menu Interface<br/>Large Screen Navigation"]
    Header --> MobileNavigation["📱 MobileNavigation<br/>Mobile Menu Interface<br/>Responsive Navigation"]
    
    %% Practice Flow Components
    FlashcardProvider --> Flashcard["🃏 Flashcard<br/>Main Practice Interface<br/>Dual Input Mode Support"]
    
    Flashcard --> ModeSelector["⌨️ ModeSelector<br/>Input Mode Toggle<br/>Typing vs Multiple Choice"]
    Flashcard --> MultipleChoice["📝 MultipleChoice<br/>Multiple Choice Interface<br/>Answer Selection UI"]
    
    %% Dashboard and Progress Components
    FlashcardApp --> Dashboard["📊 Dashboard<br/>Progress Tracking Main View<br/>Statistics and Analytics"]
    
    Dashboard --> StatsSummary["📈 StatsSummary<br/>Progress Overview Cards<br/>Key Metrics Display"]
    Dashboard --> CharacterProgressTable["📋 CharacterProgressTable<br/>Detailed Progress Table<br/>Character-level Statistics"]
    Dashboard --> TipsModal["🤖 TipsModal<br/>AI Chat Interface<br/>Personalized Learning Tips"]
    
    %% Table Sub-Components
    CharacterProgressTable --> SortableTableHeader["🔄 SortableTableHeader<br/>Column Sorting Controls<br/>Dynamic Table Ordering"]
    CharacterProgressTable --> CharacterTableRow["📝 CharacterTableRow<br/>Individual Character Stats<br/>Progress Data Display"]
    
    %% Custom Hooks Integration
    Dashboard --> useDashboardData["🔧 useDashboardData<br/>Data Fetching Hook<br/>Progress Statistics API"]
    Dashboard --> useSorting["🔧 useSorting<br/>Table Sorting Hook<br/>Column Sort Logic"]
    Header --> useAuthStatus["🔧 useAuthStatus<br/>Authentication Hook<br/>Session State Management"]
    
    %% Reusable UI Components
    Button["🔘 Button<br/>Reusable Button Component<br/>Consistent UI Element"]
    ButtonLink["🔗 ButtonLink<br/>Link Button Component<br/>Navigation UI Element"]
    
    %% Component Usage Relationships
    HomePage -.-> Header
    HomePage -.-> ButtonLink
    Dashboard -.-> Button
    Dashboard -.-> ButtonLink
    ModeSelector -.-> Button
    MultipleChoice -.-> Button
    Flashcard -.-> Button
    
    %% Context Provider Relationships
    FlashcardProvider -.-> Flashcard
    FlashcardProvider -.-> ModeSelector
    FlashcardProvider -.-> MultipleChoice
    SessionProviders -.-> Dashboard
    
    %% Styling Classes
    classDef coreComponent fill:#e8f4fd,stroke:#1e40af,stroke-width:2px
    classDef practiceComponent fill:#fef3c7,stroke:#d97706,stroke-width:2px
    classDef dashboardComponent fill:#f0fdf4,stroke:#16a34a,stroke-width:2px
    classDef uiComponent fill:#fdf4ff,stroke:#a855f7,stroke-width:2px
    classDef contextProvider fill:#fee2e2,stroke:#dc2626,stroke-width:3px
    classDef customHook fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,stroke-dasharray: 5 5
    
    class SessionProviders,HomePage,FlashcardApp,Header,DesktopNavigation,MobileNavigation coreComponent
    class Flashcard,ModeSelector,MultipleChoice,FlashcardProvider practiceComponent
    class Dashboard,StatsSummary,CharacterProgressTable,SortableTableHeader,CharacterTableRow,TipsModal dashboardComponent
    class Button,ButtonLink uiComponent
    class FlashcardProvider,SessionProviders contextProvider
    class useDashboardData,useSorting,useAuthStatus customHook
```

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