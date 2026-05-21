Product Requirements Document (PRD)
AI-Powered Book Discovery & Recommendations

Book Reading Log — Feature Extension v1.0

Date: 2026-05-20
Author: Herbert (Feature Lead)
Branch:  herbert 
Status: Ready for Implementation

1. Feature Overview

1.1 Purpose

Add a Discover page to the Book Reading Log app that displays:
1. Trending Books — horizontally scrolling carousel of popular books fetched from external APIs
2. Personalized Recommendations — vertically scrolling list of books tailored to the user's reading history, powered by AI

1.2 Design Reference

Layout inspired by Webtoon app: horizontal trending section at top with clear labels, vertical personalized feed below.

1.3 User Value
 
Users discover new books without manual searching
 
Recommendations improve as users log more books
 
Bridges the gap between "tracking" and "discovery"



| ID | Story | Priority |
| --- | --- | --- |
| US-DISC-01 | As a user, I want to see trending/popular books so I can discover what's currently popular. | Must Have |
| US-DISC-02 | As a user, I want personalized book recommendations based on my reading history so I can find books I'll enjoy. | Must Have |
| US-DISC-03 | As a user, I want to add a recommended book to my library with one click so I can start tracking it immediately. | Must Have |
| US-DISC-04 | As a user, I want to see book covers, titles, authors, and brief descriptions for each recommendation so I can decide quickly. | Must Have |
| US-DISC-05 | As a user, I want the recommendations to refresh periodically so I see new suggestions. | Should Have |
| US-DISC-06 | As a user, I want to dismiss a recommendation I'm not interested in so my feed stays relevant. | Could Have |



3. Functional Requirements

3.1 Trending Books Section(Horizontal Carousel)

FR-TREND-01: Display a horizontally scrollable carousel labeled "Trending Now" at the top of the Discover page.

FR-TREND-02: Fetch trending books from OpenLibrary API (primary) and Google Books API (fallback).

FR-TREND-03: Each trending book card must display:
 
• Book cover image (fallback to placeholder if unavailable)
 
•Title (max 2 lines, truncate with ellipsis)
 
•Author name
 
•Average rating (if available from API)
 
•"Add to Library" button
FR-TREND-04: Carousel must support:
 
•Touch/swipe on mobile
 
•Mouse drag on desktop
 
•Arrow buttons for navigation
 
•Snap-to-card behavior


FR-TREND-05: Show 8-12 trending books at a time. Cache results for 6 hours to reduce API calls.

FR-TREND-06: If APIs fail, show a friendly error message: "Unable to load trending books. Try again later." 


3.2 Personalized Recommendations Section (Vertical Feed)

FR-REC-01: Display a vertically scrolling list labeled "Recommended For You" below the trending section.

FR-REC-02: AI recommendation engine must analyze the user's library to generate suggestions:
 
•Input: User's existing books (genres, tags, authors, ratings if available)
 
•Output: List of recommended book titles/authors
 
•AI Provider: Google Gemini (free tier, generous limits)

FR-REC-03: AI prompt template:

You are a book recommendation engine. Based on the user's reading history below, suggest 10 books they might enjoy.

User's books:
{formatted_list_of_user_books_with_genres_and_tags}

Rules:
- Suggest diverse authors and genres related to their interests
- Include a mix of classics and contemporary
- For each book, provide: title, author, 1-sentence description, primary genre
- Return ONLY a valid JSON array in this format:
[
  {"title": "...", "author": "...", "description": "...", "genre": "..."}
]



FR-REC-04: After AI generates recommendations, fetch real book data (cover, rating, page count) from OpenLibrary/Google Books APIs.

FR-REC-05: Each recommendation card must display:
 
•Book cover image
 
•Title
 
•Author
 
•AI-generated description (1-2 lines)
 
•Genre tag
 
•"Add to Library" button
 
•"Not Interested" dismiss button (optional v2)

FR-REC-06: Generate recommendations:
 
•On first visit to Discover page
 
•When user adds/removes books from their library
 
•Maximum once per session (cache for 24 hours)

FR-REC-07: If user has no books in library, show:
 
•Message: "Add some books to your library to get personalized recommendations!" 
 
•Fallback to trending books as recommendations

3.3 Add to Library Flow


FR-ADD-01: Clicking "Add to Library" opens a pre-filled "Add Book" modal/page with:
 
•Title, author pre-populated from API data
 
•Genre pre-selected (if matched)
 
•Status default: "reading"
 
•Total pages pre-filled (if available from API)


FR-ADD-02: User can edit any field before saving.

FR-ADD-03: On save, book is added to user's library via existing CRUD actions.

FR-ADD-04: Show success toast: "[Book Title] added to your library!"


 
4. Non-Functional Requirements


| ID | Requirement | Target |
| --- | --- | --- |
| NFR-DISC-01 | Trending section load time | < 1.5 seconds |
| NFR-DISC-02 | Recommendations generation time | < 3 seconds (AI + API fetch) |
| NFR-DISC-03 | API rate limit handling | Graceful fallback, no crashes |
| NFR-DISC-04 | Mobile responsiveness | Full touch support, no horizontal page scroll |
| NFR-DISC-05 | Accessibility | WCAG 2.1 AA — labels, focus states, alt text |
| NFR-DISC-06 | Data isolation | Users only see their own recommendations |



5. UI/UX Requirements



5.1 Page Structure

Discover Page (/discover)
├── Header: "Discover" page title
├── Section: "Trending Now" (horizontal carousel)
│   ├── Label: "Trending Now" with fire icon
│   ├── Sub-label: "Popular books around the world"
│   └── Carousel: [Book Card] [Book Card] [Book Card] ...
├── Divider
└── Section: "Recommended For You" (vertical list)
    ├── Label: "Recommended For You" with sparkle icon
    ├── Sub-label: "Based on your reading history"
    └── Vertical List: [Book Card Large] [Book Card Large] ...



5.2 Book Card — Trending (Compact)

┌─────────────────┐
│  [Cover Image]  │  ← 120x180px, rounded-lg, object-cover
│                 │
│                 │
├─────────────────┤
│ Title...        │  ← font-semibold, text-sm, max 2 lines
│ Author Name     │  ← text-xs, text-muted-foreground
│ ⭐ 4.5          │  ← text-xs, amber color
│ [+ Add]         │  ← small button, primary color
└─────────────────┘
Width: ~140px






5.3 Book Card — Recommendation (Large)



┌─────────────────────────────────────┐
│ ┌──────────┐                        │
│ │  Cover   │  Title                │  ← font-bold, text-lg
│ │  80x120  │  Author               │  ← text-sm, muted
│ │          │  Genre Tag            │  ← badge component
│ └──────────┘  Description...      │  ← text-sm, max 2 lines
│               [+ Add to Library]    │  ← button, full width
└─────────────────────────────────────┘





5.4 Design System Compliance
 
•Primary color: Deep indigo/slate blue (existing)
 
•Accent: Warm amber for trending icon, purple for recommendations
 
•Cards: White background, subtle shadow, rounded-xl
 
•Spacing: Consistent with existing app (gap-4, p-4)
 
•Typography: Inter/Geist (existing)
 
•Empty states: Friendly illustration + CTA button


5.5 Interactions
 
•Skeleton loaders while data fetches
 
•Smooth carousel transitions (300ms ease)
 
•Toast notifications for add/remove actions
 
•Pull-to-refresh on mobile (optional)



6. Technical Architecture



6.1 New Files to Create


book-reading-log/
├── app/
│   ├── (main)/
│   │   └── discover/
│   │       └── page.tsx              # Main discover page
│   ├── api/
│   │   ├── trending/
│   │   │   └── route.ts              # GET /api/trending
│   │   └── recommendations/
│   │       └── route.ts              # GET /api/recommendations
│   └── actions/
│       └── recommendations.ts        # Server actions for AI + DB
├── lib/
│   ├── openlibrary.ts               # OpenLibrary API client
│   ├── google-books.ts              # Google Books API client
│   ├── gemini.ts                    # Google Gemini AI client
│   └── book-matcher.ts              # Match AI suggestions to real books
├── components/
│   ├── discover/
│   │   ├── TrendingCarousel.tsx     # Horizontal carousel
│   │   ├── RecommendationFeed.tsx   # Vertical list
│   │   ├── TrendingBookCard.tsx     # Compact card
│   │   ├── RecommendationCard.tsx   # Large card
│   │   ├── AddBookModal.tsx         # Pre-filled add form
│   │   ├── SectionLabel.tsx         # "Trending Now" / "Recommended" header
│   │   └── EmptyState.tsx           # No books fallback
│   └── ui/
│       └── carousel.tsx             # Reusable carousel (shadcn)
├── prisma/
│   └── schema.prisma                # Add ExternalBook model
└── .env                             # Add GEMINI_API_KEY, GOOGLE_BOOKS_API_KEY




6.2 API Integrations


•OpenLibrary API (Free, No Key Required)
 
•Trending subjects:  https://openlibrary.org/subjects/{genre}.json?limit=12 
 
•Book details:  https://openlibrary.org/works/{key}.json 
 
•Cover images:  https://covers.openlibrary.org/b/id/{cover_id}-M.jpg 




Google Books API (Free, 1000 req/day)
 
•Search:  https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=10 
 
•Key required: Get from Google Cloud Console (free tier)





Google Gemini API (Free, 60 req/min)
 
•Model:  gemini-1.5-flash  (fast, cheap, good enough)
 
•Endpoint:  https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent 
 
•Key required: Get from Google AI Studio (free tier)





6.3 Database Schema Addition



// Add to existing schema.prisma

model ExternalBook {
  id          String   @id @default(cuid())
  title       String
  author      String
  coverUrl    String?
  description String?  @db.Text
  genre       String?
  rating      Float?
  totalPages  Int?
  source      String   // "openlibrary", "google-books"
  externalId  String
  fetchedAt   DateTime @default(now())
  
  @@unique([source, externalId])
  @@index([genre])
}

// Add to User model (optional, for caching)
model UserRecommendation {
  id        String   @id @default(cuid())
  userId    String
  bookData  String   @db.Text // JSON string of recommendation
  source    String   // "ai", "trending"
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}






6.4 Data Flow



User visits /discover
│
├─→ Trending Section
│   ├─→ Client calls GET /api/trending
│   ├─→ Server fetches from OpenLibrary (cached 6h)
│   └─→ Returns formatted book array → Carousel render
│
└─→ Recommendations Section
    ├─→ Client calls GET /api/recommendations
    ├─→ Server fetches user's books from DB
    ├─→ Server sends book list to Gemini AI
    ├─→ AI returns suggested titles/authors
    ├─→ Server fetches real book data from OpenLibrary/Google
    ├─→ Server caches result for 24h
    └─→ Returns formatted array → Vertical list render









7. Implementation Order


Phase 1: Foundation (Day 1)

1. Add  ExternalBook  model to Prisma schema

2. Run  npx prisma migrate dev
 
3. Create API clients:  lib/openlibrary.ts ,  lib/google-books.ts 

4. Set up environment variables in  .env 




Phase 2: Trending Section (Day 1-2)

1. Create  app/api/trending/route.ts 

2. Create  TrendingCarousel.tsx  component

3. Create  TrendingBookCard.tsx 

4. Build  /discover  page with trending section only

5. Test API responses and error handling


Phase 3: AI Recommendations (Day 2-3)
1. Sign up for Google AI Studio, get Gemini API key

2. Create  lib/gemini.ts  client

3. Create  app/api/recommendations/route.ts 

4. Create  RecommendationFeed.tsx  and  RecommendationCard.tsx 

5. Build AI prompt and test with sample user libraries

6. Add to  /discover  page




Phase 4: Add to Library (Day 3)

1. Create  AddBookModal.tsx  (pre-filled form)

2. Wire up "Add to Library" buttons

3. Integrate with existing book CRUD actions

4. Add toast notifications


Phase 5: Polish (Day 4)

1. Add skeleton loaders

2. Add empty states

3. Mobile responsiveness testing

4. Accessibility audit

5. Performance optimization (caching, image optimization)






8. Environment Variables


Add these to  .env  (never commit):


# Google Books API (get from Google Cloud Console)
GOOGLE_BOOKS_API_KEY=your_key_here

# Google Gemini API (get from Google AI Studio)
GEMINI_API_KEY=your_key_here




9. API Keys Setup Guide


Google Books API Key

1. Go to Google Cloud Console
2. Create a new project (or use existing)
3. Enable Books API
4. Go to Credentials → Create API Key
5. Restrict key to HTTP referrers (your domain)
6. Copy key to  .env 



Google Gemini API Key

1. Go to Google AI Studio
2. Sign in with Google account
3. Click Get API Key
4. Create new key
5. Copy key to  .env 
6. Free tier: 60 requests/minute, sufficient for this feature






10. Error Handling & Edge Cases


| Scenario | Handling |
| --- | --- |
| OpenLibrary down | Fallback to Google Books API |
| Both APIs fail | Show error message + cached data if available |
| AI API rate limited | Show trending books as fallback |
| User has no books | Show message + trending as fallback |
| Book cover missing | Show placeholder with initials |
| AI returns malformed JSON | Retry once, then show error |
| Slow network | Skeleton loaders + timeout after 10s |



11. Acceptance Criteria


AC-DISC-01: Given a user on the Discover page, when the page loads, they see a "Trending Now" horizontal carousel with at least 8 book cards within 2 seconds.

AC-DISC-02: Given a user with books in their library, when they scroll down, they see a "Recommended For You" vertical list with AI-generated suggestions.

AC-DISC-03: Given a user clicks "Add to Library" on any book, when they confirm, the book appears in their library dashboard with pre-filled data.

AC-DISC-04: Given APIs are unavailable, when the page loads, the user sees a friendly error message instead of a blank screen.

AC-DISC-05: Given a user on mobile, when they interact with the carousel, it supports touch swipe and snap-to-card behavior.




12. Future Enhancements (Out of Scope)
 
•Genre-based filtering in Discover page
 
•"Because you read [Book Title]" recommendation clusters
 
•Social recommendations (friends' favorites)
 
•Reading goal-based recommendations
 
•Integration with Goodreads API
 
•Book cover image upload for AI-recommended books without covers



13. Notes for Developer
 
•Reuse existing components wherever possible (Button, Card, Badge, etc.)
 
•Follow existing code patterns in  app/actions/  and  app/api/ 
 
•Use shadcn/ui components for consistency (carousel, skeleton, toast)
 
•Test on mobile first — most users will access this on phones
 
•Cache aggressively — APIs have rate limits
 
•Keep AI prompts simple — complex prompts increase latency and cost
 
•Log API errors to console for debugging, but don't expose to user











Document Version: 1.0 
Generated for: VS Code Implementation 
Branch: herbert 





