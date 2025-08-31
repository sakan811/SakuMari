# SakuMari Features Documentation

Comprehensive technical documentation covering all features of the SakuMari Japanese Kana Flashcard App.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Adaptive Learning Engine](#adaptive-learning-engine)  
3. [Dual Practice Modes](#dual-practice-modes)
4. [Character Set Support](#character-set-support)
5. [Progress Analytics Dashboard](#progress-analytics-dashboard)
6. [AI-Powered Learning Assistant](#ai-powered-learning-assistant)
7. [Progressive Web App Features](#progressive-web-app-features)
8. [Technical Architecture](#technical-architecture)

---

## Authentication System

### Google Account Integration

**Implementation**: NextAuth.js v5 with Prisma adapter for secure session management.

**Technical Details**:
- **OAuth Provider**: Google OAuth 2.0 integration via `GoogleProvider`
- **Session Strategy**: JWT-based sessions with 30-day expiration
- **Database Storage**: User profiles and sessions stored in PostgreSQL via Prisma
- **Security**: PKCE flow with secure cookie configuration for production
- **Session Management**: Automatic token refresh and secure cookie handling

**User Flow**:
1. User clicks "Sign in with Google" on homepage
2. Redirected to Google OAuth consent screen
3. Upon consent, Google returns to `/api/auth/callback/google`
4. NextAuth.js creates user record in database if first login
5. JWT token issued with user ID for subsequent API authentication
6. Session persists across browser sessions for 30 days

**Code Implementation**:
```typescript
// lib/auth.ts - NextAuth configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [googleProvider],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt: ({ token, user }) => { if (user) token.id = user.id; return token; },
    session: ({ session, token }) => ({ ...session, user: { ...session.user, id: token.id } })
  }
})
```

**Database Schema**:
- `User`: Core user profile (id, name, email, emailVerified, image)
- `Account`: OAuth provider connections
- `Session`: Active user sessions for session-based auth
- `VerificationToken`: Email verification tokens

---

## Adaptive Learning Engine

### Confidence-Weighted Character Selection

**Algorithm**: Advanced weighted randomization that prevents "first-success penalty" and optimizes learning efficiency.

**Technical Implementation**:

**Core Algorithm** (`components/FlashcardProvider.tsx`):
```typescript
const selectRandomKana = useCallback((data: KanaWithAccuracy[]) => {
  const weights = data.map((kana) => {
    // New characters get high priority (2.0x weight)
    if (kana.attempts === 0) return 2.0;
    
    // Base weight from accuracy (lower accuracy = higher weight)
    const accuracyWeight = Math.max(1 - kana.accuracy, 0.1);
    
    // Confidence boost for high accuracy + few attempts
    const confidenceBoost = kana.attempts < 3 && kana.accuracy > 0.8
      ? 1 + (3 - kana.attempts) * 0.5 : 1;
      
    return accuracyWeight * confidenceBoost;
  });
  
  // Weighted random selection implementation
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let randomVal = Math.random() * totalWeight;
  
  for (let i = 0; i < data.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0) return data[i];
  }
}, []);
```

**Smart Prioritization Logic**:
- **New Characters**: 2.0x priority for unlearned kana
- **Struggling Characters**: Higher weight for accuracy < 70%
- **Confidence Boost**: Prevents first-success penalty by giving extra weight to high-accuracy characters with few attempts
- **Minimum Weight**: 0.1 minimum ensures mastered characters still appear occasionally

**Progress Tracking**:
- **Database**: PostgreSQL with `KanaProgress` table tracking per-user, per-character statistics
- **Real-time Updates**: Immediate accuracy recalculation after each answer
- **Atomic Operations**: Database upsert operations ensure data consistency

---

## Dual Practice Modes

### Input Mode (Typing)

**User Experience**: Traditional flashcard experience where users type the romanized pronunciation.

**Technical Implementation**:
- **Component**: `components/Flashcard.tsx` with controlled input handling
- **Validation**: Case-insensitive comparison with `.toLowerCase()` normalization
- **Real-time Feedback**: Instant result display with visual feedback animations
- **Keyboard Support**: Enter key submission, focus management

**Features**:
- Auto-focus on input field for seamless typing flow
- Real-time character validation with immediate feedback
- Support for both correct answer confirmation and error handling

### Multiple Choice Mode

**User Experience**: Four-option selection interface optimized for mobile and accessibility.

**Technical Implementation**:
- **Component**: `components/MultipleChoice.tsx` with keyboard navigation
- **Choice Generation**: Intelligent wrong answer selection from other kana characters
- **Accessibility**: ARIA labels, keyboard navigation (Enter/Space), focus management
- **Visual Feedback**: Selected state indication with checkmarks

**Algorithm for Choice Generation**:
```typescript
const generateChoices = (correctKana: KanaWithAccuracy, kanaData: KanaWithAccuracy[]) => {
  const correctAnswer = correctKana.romaji;
  
  // Get unique wrong answers (no duplicates)
  const uniqueWrongAnswers = Array.from(
    new Set(
      kanaData
        .filter((kana) => kana.romaji !== correctAnswer)
        .map((kana) => kana.romaji),
    ),
  ).sort(() => Math.random() - 0.5).slice(0, 3);
  
  // Combine and shuffle
  return [correctAnswer, ...uniqueWrongAnswers].sort(() => Math.random() - 0.5);
};
```

### Mode Switching

**Component**: `components/ModeSelector.tsx` with persistent mode selection.

**Features**:
- **Seamless Switching**: Change modes without losing current character
- **Visual Indicators**: Clear mode identification with icons and labels
- **State Persistence**: Mode preference maintained throughout session
- **Responsive Design**: Adaptive labels for mobile devices

---

## Character Set Support

### Hiragana and Katakana Separation

**Technical Implementation**: Unicode-based character detection and filtering.

**Character Detection Logic**:
```typescript
// Filter by kana type based on Unicode ranges
const filteredData = data.filter((kana: KanaWithAccuracy) => {
  const isHiragana = kana.character.charCodeAt(0) >= 0x3040 && 
                    kana.character.charCodeAt(0) <= 0x309f;
  return kanaType === "hiragana" ? isHiragana : !isHiragana;
});
```

**Unicode Ranges**:
- **Hiragana**: U+3040 to U+309F (あ-ゟ)
- **Katakana**: U+30A0 to U+30FF (ア-ヿ)

**Route Organization**:
- `/hiragana` - Dedicated hiragana practice page
- `/katakana` - Dedicated katakana practice page
- Each route filters the same base kana dataset by character type

**Database Design**:
- Single `Kana` table contains both character sets
- Runtime filtering eliminates need for separate tables
- Progress tracking works identically for both sets

---

## Progress Analytics Dashboard

### Real-Time Statistics

**Data Source**: Live queries to PostgreSQL via `/api/stats` endpoint.

**API Implementation** (`app/api/stats/route.ts`):
```typescript
const kanaWithProgress = await prisma.kana.findMany({
  include: {
    progress: {
      where: { user_id: context.userId },
      select: { attempts: true, correct_attempts: true, accuracy: true }
    }
  }
});
```

**Metrics Calculated**:
- **Per-Character Stats**: Individual accuracy, attempt count, correct attempts
- **Overall Progress**: Total characters learned, average accuracy
- **Learning Trends**: Characters needing practice vs. mastered characters

### Interactive Data Table

**Component**: `components/CharacterProgressTable.tsx` with advanced sorting and filtering.

**Sorting Features**:
- **Multi-Column Support**: Sort by character, romaji, attempts, or accuracy  
- **Direction Toggle**: Ascending/descending with visual indicators
- **State Management**: Custom `useSorting` hook maintains sort preferences

**Filtering System**:
```typescript
const filteredStats = stats.filter((kana) => {
  if (filter === "all") return true;
  
  const charCode = kana.character.charCodeAt(0);
  const isHiragana = charCode >= 0x3040 && charCode <= 0x309f;
  const isKatakana = charCode >= 0x30a0 && charCode <= 0x30ff;
  
  return filter === "hiragana" ? isHiragana : isKatakana;
});
```

**Visual Design**:
- **Responsive Layout**: Mobile-optimized table with horizontal scrolling
- **Color-Coded Accuracy**: Visual accuracy indicators with gradient backgrounds
- **Loading States**: Skeleton loading with smooth transitions

### Statistics Summary Cards

**Component**: `components/StatsSummary.tsx` with key performance indicators.

**Metrics Displayed**:
- **Total Characters**: Count of characters with practice attempts
- **Average Accuracy**: Weighted average across all practiced characters
- **Characters Mastered**: Count of characters with >90% accuracy
- **Active Learning**: Count of characters currently being practiced

---

## AI-Powered Learning Assistant

### Google Gemini Integration

**Model**: Gemini 2.5 Flash Lite for fast, cost-effective responses.

**Technical Architecture**:
- **API Endpoint**: `/api/tips` with authenticated access
- **Context Awareness**: User progress data integrated into AI prompts
- **Conversation Memory**: Maintains conversation history for context
- **Rate Limiting**: Input validation and length restrictions for API efficiency

### Personalized Learning Context

**Progress Analysis** (`app/api/tips/route.ts`):
```typescript
const strugglingKana = userProgress
  .filter((p) => p.attempts > 0 && p.accuracy < 0.7)
  .slice(0, 5);

const progressingKana = userProgress
  .filter((p) => p.attempts > 0 && p.accuracy >= 0.7 && p.accuracy < 0.9)
  .slice(0, 5);

const masteringKana = userProgress
  .filter((p) => p.attempts > 0 && p.accuracy >= 0.9)
  .slice(0, 5);
```

**AI Prompt Engineering**:
- **Role Definition**: Japanese kana learning specialist
- **Scope Limitation**: Focused only on hiragana/katakana learning
- **Progress Integration**: User's struggling/progressing/mastered characters included
- **Response Guidelines**: Concise, practical, educational responses under 300 words

### Interactive Chat Interface

**Component**: `components/TipsModal.tsx` with full-featured chat experience.

**Features**:
- **Conversation History**: Message persistence during session
- **Markdown Support**: Rich text formatting with ReactMarkdown
- **Loading States**: Animated typing indicators during AI processing
- **Error Handling**: Graceful failure handling with retry options
- **Responsive Design**: Mobile-optimized modal with proper keyboard handling

**User Experience**:
- **Quick Access**: Tips button on dashboard for immediate help
- **Context Awareness**: AI knows user's specific learning challenges
- **Educational Focus**: Responses tailored to learning techniques and strategies
- **Example Questions**: Suggested prompts for new users

---

## Progressive Web App Features

### Installation Support

**Manifest Configuration** (`app/manifest.ts`):
```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SakuMari - Japanese Kana Flashcards",
    short_name: "SakuMari",
    description: "Learn Japanese Hiragana and Katakana with adaptive flashcards",
    start_url: "/",
    display: "standalone",
    background_color: "#fad182",
    theme_color: "#d1622b",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  }
}
```

### Offline Capabilities

**Service Worker**: Automatic Next.js service worker for static asset caching.

**Cached Resources**:
- Application shell (HTML, CSS, JavaScript)
- Static assets (icons, images)
- Font files for consistent typography
- API responses cached with background refresh

**User Benefits**:
- **Installable**: Add to home screen on mobile devices
- **Offline Access**: Practice characters without internet connection
- **Fast Loading**: Cached assets provide instant app startup
- **Native Feel**: Full-screen experience similar to native apps

---

## Technical Architecture

### Frontend Architecture

**Framework**: Next.js 15 with App Router and React 19

**State Management**:
- **React Context**: `FlashcardProvider` for practice session state
- **Custom Hooks**: `useDashboardData`, `useSorting` for data management
- **Local State**: Component-level state with React hooks

**Component Hierarchy**:
```
App Router (app/)
├── layout.tsx (Root layout with metadata)
├── page.tsx (Home page)
├── dashboard/page.tsx (Progress dashboard)
├── hiragana/page.tsx (Hiragana practice)
└── katakana/page.tsx (Katakana practice)

Components (components/)
├── FlashcardProvider.tsx (Context provider)
├── FlashcardApp.tsx (Practice session container)
├── Flashcard.tsx (Individual flashcard display)
├── Dashboard.tsx (Analytics dashboard)
├── TipsModal.tsx (AI chat interface)
└── [Various UI components]
```

### Backend Architecture

**API Design**: RESTful endpoints with TypeScript and middleware authentication.

**Key Endpoints**:
- `GET /api/stats` - User progress data for dashboard and practice
- `POST /api/flashcards/submit` - Answer submission with accuracy tracking
- `POST /api/tips` - AI-powered learning recommendations
- `GET /api/health` - Database connectivity monitoring

**Database Layer**:
- **ORM**: Prisma with PostgreSQL 17
- **Schema**: Normalized design with user progress tracking
- **Queries**: Optimized joins and indexing for performance
- **Migrations**: Version-controlled schema evolution

**Authentication Middleware**:
```typescript
// lib/api-middleware.ts
export function withAuth<T extends (...args: any[]) => any>(handler: T) {
  return async (request: NextRequest, ...args: any[]) => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, { userId: session.user.id }, ...args);
  };
}
```

### Data Flow Architecture

**Practice Session Flow**:
1. User navigates to practice page (`/hiragana` or `/katakana`)
2. `FlashcardProvider` fetches user progress via `/api/stats`
3. Adaptive algorithm selects character based on confidence weights
4. User submits answer through typing or multiple choice
5. Answer processed via `/api/flashcards/submit` with database update
6. New character selected and cycle repeats

**Dashboard Flow**:
1. User visits `/dashboard`
2. `Dashboard` component fetches stats via `/api/stats`
3. Real-time filtering and sorting applied to progress data
4. Summary cards and detailed table updated reactively
5. AI tips accessible through modal interface

**Authentication Flow**:
1. Unauthenticated users see homepage with login option
2. Google OAuth flow handled by NextAuth.js
3. Successful login creates/updates user record
4. JWT token issued for subsequent API authentication
5. Middleware protects all practice and API routes

---

This comprehensive documentation covers all technical aspects of SakuMari's feature set, from user-facing functionality to underlying implementation details. Each feature is designed with modern web standards, accessibility, and optimal user experience in mind.