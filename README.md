<<<<<<< HEAD
<<<<<<< herbert
📚 Book Reading Log
A simple, clean, and incredibly fast web application for book lovers to track their reading journey. Log progress page-by-page, organize your library with genres and tags, visualize your reading habits, and export your data — all without a single page reload.
 Stack 

 Stack 

 Stack 

 Stack 

 Stack 
✨ Features
⚡ Instant Progress Tracking — Update pages read with + / - buttons directly on the book card. Optimistic UI updates in milliseconds.
🎨 Color-Coded Progress Bar — Visual indicator shifts from Red (0–33%) → Yellow (34–66%) → Blue (67–99%) → Green (100%).
🔍 Smart Search & Filter — Real-time search across titles, authors, genres, and tags. Combine with status filters (All / Reading / Finished / Dropped).
🏷️ Hybrid Genres & Tags — Choose from 15 predefined options or create your own. Multiple genres and tags per book.
📊 Reading Dashboard — At-a-glance stats: total books, currently reading, finished, dropped, books finished this year, and total pages read.
📝 Book Notes — Jot down personal takeaways, quotes, and thoughts on every book's detail page.
🔐 Secure Multi-User Auth — Email + password authentication with bcrypt hashing and HTTP-only sessions.
📤 Import / Export — Back up your entire library as PDF or Word (.docx). Restore from structured documents.
📱 Fully Responsive — 4-column desktop grid, 2-column tablet, single-column mobile — built with Tailwind CSS.
🛠️ Tech Stack
Table
Layer	Technology
Framework	Next.js 15 (App Router)
Language	TypeScript
Database	PostgreSQL
ORM	Prisma
Styling	Tailwind CSS
UI Components	shadcn/ui
Auth	Auth.js (NextAuth v5)
Validation	Zod
Data Fetching	SWR
Export	Puppeteer (PDF) / docx (Word)
🚀 Getting Started
Prerequisites
Node.js 18+
PostgreSQL 15+ (local or cloud e.g. Neon, Supabase)
pnpm (recommended) or npm / yarn
1. Clone & Install
bash
Copy
git clone https://github.com/yourusername/book-reading-log.git
cd book-reading-log
pnpm install
2. Environment Variables
Create a .env file in the project root:
env
Copy
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/booklog"

# Auth.js
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
Tip: Generate a secure secret with openssl rand -base64 32
3. Database Setup
bash
Copy
# Run Prisma migrations
npx prisma migrate dev --name init

# (Optional) Seed predefined genres and tags
npx prisma db seed
4. Start Development Server
bash
Copy
pnpm dev
Open http://localhost:3000 and start tracking your books! 📖
📁 Project Structure
plain
Copy
book-reading-log/
├── app/
│   ├── (auth)/
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── (main)/
│   │   ├── dashboard/          # Home / Dashboard (stats + grid)
│   │   ├── books/
│   │   │   ├── new/            # Add new book form
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Book detail view
│   │   │       └── edit/       # Edit book form
│   │   └── settings/           # Import / Export & account settings
│   ├── api/
│   │   ├── books/              # GET /api/books (search & filter)
│   │   ├── dashboard/          # GET /api/dashboard (stats)
│   │   ├── export/             # GET /api/export/pdf & /docx
│   │   └── import/             # POST /api/import
│   ├── actions/
│   │   ├── auth.ts             # register, login, logout
│   │   ├── books.ts            # create, update, delete
│   │   └── progress.ts         # update pages_read
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── books/              # BookCard, ProgressBar, StatusBadge
│   │   ├── dashboard/          # StatCard, ReadingList
│   │   ├── filters/            # SearchBar, StatusFilter, GenreTagFilter
│   │   └── layout/             # Navbar, AuthGuard
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # Auth.js configuration
│   │   └── export.ts           # PDF / Word generation helpers
│   ├── hooks/
│   │   ├── useBooks.ts         # SWR hook for library data
│   │   └── useDashboard.ts     # SWR hook for dashboard stats
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   └── schemas/
│       └── index.ts            # Zod validation schemas
├── prisma/
│   └── schema.prisma           # Database schema definition
├── public/
│   └── ...                     # Static assets
├── .env                        # Environment variables (gitignored)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
🎯 Core User Flow
Register / Login → Secure session created
Dashboard → View stats, filter by status, search your library
Add Book → Fill title, author, total pages, pick genres/tags
Track Progress → Click + / - on the card to log pages instantly
View Detail → Click any book for full view, notes, and inline editing
Export Data → Head to Settings → download your library as PDF or Word
🧠 Business Logic Highlights
Table
Rule	Behavior
Bottom Limit	- button disables when pages_read = 0
Top Limit	Rejects pages_read > total_pages with clear error
Auto-Complete	Status flips to finished when pages_read == total_pages
Accidental Click Protection	Can step back from finished; status reverts to reading
Progress Calculation	progress_pct = round((pages_read / total_pages) * 100)
Color Thresholds	Red (0–33%) → Yellow (34–66%) → Blue (67–99%) → Green (100%)
🗄️ Database Schema Overview
plain
Copy
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│    Book     │>────│    Genre    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ email       │     │ user_id     │     │ name        │
│ passwordHash│     │ title       │     │ isPredefined│
│ name        │     │ author      │     │ user_id     │
└─────────────┘     │ status      │     └─────────────┘
                    │ total_pages │
                    │ pages_read  │     ┌─────────────┐
                    │ progress_pct│     │    Tag      │
                    │ notes       │     ├─────────────┤
                    │ started_at  │     │ id          │
                    │ finished_at │     │ name        │
                    │ dropped_at  │     │ isPredefined│
                    │ created_at  │     │ user_id     │
                    └─────────────┘     └─────────────┘
Full schema with junction tables and indexes defined in prisma/schema.prisma
🔒 Security
✅ Password Hashing — bcrypt (12 rounds)
✅ Session Security — HTTP-only cookies, CSRF tokens via Auth.js
✅ Data Isolation — Every query scoped to user_id
✅ Input Validation — Zod schemas on all forms and API routes
✅ SQL Injection Prevention — Prisma ORM (parameterized queries)
📦 Useful Commands
Table
Command	Description
pnpm dev	Start development server
pnpm build	Production build
pnpm start	Start production server
npx prisma migrate dev	Run database migrations
npx prisma generate	Regenerate Prisma client
npx prisma studio	Open Prisma database GUI
npx prisma db seed	Seed predefined genres & tags
📝 License
MIT — Built with ❤️ for book lovers everywhere.
🙋 Questions or Feedback?
=======
Product Requirements Document (PRD)
Book Reading Log — Unified Specification v2.0
Platform: Web Application
Stack: Next.js (App Router), PostgreSQL, Tailwind CSS
Status: Approved
Date: 2026-05-19
1. What Are We Building?
A simple, clean, and incredibly fast web application where users can effortlessly keep track of the books they are reading, update how many pages they have finished, and instantly visualize their progress without tedious page reloads.
The app supports multi-user authentication (email + password), allowing each user to maintain a private, isolated library. Beyond core tracking, users can organize books with genres and tags (hybrid predefined + custom), search their entire library, view reading statistics, and import/export their data.
2. The Main Dashboard (Layout & Design)
When a user opens the web application, they are greeted by a unified, highly polished view containing four core sections designed with clean Tailwind CSS utilities:
2.1 The Stats Bar
Quick summary blocks placed at the top tracking overall metrics:
Total Books — count of all books in the library
Currently Reading — active books
Finished — completed books
Dropped — abandoned books
2.2 The Filter Tabs
Four explicit filter toggles: All, Reading, Finished, Dropped. Clicking any tab instantly constrains the list view below. If a specific tab contains no data, the UI displays an elegant placeholder:
"No books here yet! Keep on reading!"
along with a clear button to insert a book.
2.3 The Search Bar
A global search input placed above the grid. Searches across title, author, genre, and tag in real-time (debounced 300ms). A "Clear all filters" button resets both search and status tabs.
2.4 The Responsive Book Grid
A layout context displaying individual books. It renders seamlessly across viewports:
Desktop: 3–4 columns
Tablet: 2 columns
Mobile: Single vertical stack
3. Inside a Book Card (User Actions)
Every book layout item on the dashboard operates as an interactive workspace equipped with immediate controls:
3.1 The Details Layout
Title and Author (mandatory fields)
A distinct color-coded status badge (Reading = blue, Finished = green, Dropped = red/gray)
Optional personal notes or takeaways
Genre & Tag pills displayed beneath the title
3.2 The Quick-Update Controls (Plus/Minus Pattern)
To avoid forcing users to launch complex edit modals just to log progress, each card exposes an explicit + and - mechanism:
Clicking + increases pages_read by 1 unit instantly
Clicking - decreases pages_read by 1 unit instantly
Both execute clean asynchronous state synchronization down to PostgreSQL
The card updates optimistically on the frontend before the server confirms
3.3 The Dynamic Progress Bar
A visual line that scales from 0% to 100% complete and shifts background colors conditionally depending on completion thresholds:
Table
Completion Metric	Visual Accent	Status
0% to 33% Complete	Red Indicator	Early stage
34% to 66% Complete	Yellow Indicator	Mid stage
67% to 99% Complete	Blue Indicator	Near finish
100% Fully Read	Green Indicator	Complete
The progress percentage is auto-calculated from pages_read / total_pages when both values exist. If total_pages is unknown, the user may set a manual percentage via a slider in the edit form.
4. How the Rules Work (Business Logic Guardrails)
4.1 The Bottom Limit Constraint
When a book's pages_read is at 0, the decrement control (-) immediately transitions to a greyed-out disabled state, avoiding database rejections for negative value storage.
4.2 The Top Limit Guardrail
If a user attempts to manually type a numeric page entry into the configuration form that is strictly higher than the book's total_pages (e.g., inputting page 320 for a 300-page book), the system rejects the operation and alerts the user with an error notice.
4.3 The Auto-Completion Trigger
When pages_read matches total_pages perfectly via either numeric input or stepping forward with the + button, the system automatically marks the book status as finished behind the scenes and records the completion timestamp.
4.4 Accidental Click Protection
If a user mistakenly triggers the finished threshold via an extra click, the + and - buttons remain fully interactive on the finished card, permitting them to step backwards to easily fix mistakes. The status reverts to reading if pages_read drops below total_pages.
4.5 Status Reversion Rule
If a book is marked finished or dropped and the user later updates pages_read or changes status back to reading, the system clears the finished_at / dropped_at timestamps and resumes normal tracking.
5. Authentication & Multi-User Support
5.1 Registration & Login
Users register with email + password (minimum 8 characters)
Passwords are hashed (bcrypt) before storage
Secure sessions via HTTP-only cookies with CSRF protection
Users can log out from any page via the navbar
5.2 Data Isolation
Every book, genre, and tag is scoped to the authenticated user
Users can only see and modify their own data
All database queries enforce WHERE user_id = current_user
6. Genres & Tags (Organization System)
6.1 Hybrid Model
Users can organize books using a hybrid predefined + custom system:
Predefined Genres: Fiction, Non-Fiction, Sci-Fi, Fantasy, Mystery, Romance, Thriller, Biography, History, Self-Help, Science, Philosophy, Poetry, Classic, Contemporary
Predefined Tags: must-read, favorite, re-read, audiobook, ebook, paperback, hardcover, library, owned, wishlist, recommended
Custom Creation: Users can type new genres/tags which are then saved to their personal pool for future reuse
6.2 Multi-Assignment
A book can have multiple genres (suggested 1–3, soft limit of 5)
A book can have multiple tags (unlimited)
Genres and tags are displayed as removable pills in the book form
7. Book Detail Page
Clicking a book card navigates to /books/[id] — an expanded presentation screen:
7.1 Content
Full book metadata (title, author, status badge, progress bar, pages read / total)
Notes textarea — free-form personal takeaways, editable inline
Genre & tag display with full names
Created / updated timestamps
7.2 Quick Actions
Inline progress update (number input + slider)
Status dropdown toggle
Edit button → /books/[id]/edit
Delete button with confirmation dialog
8. Add / Edit Book Forms
8.1 Create Book (/books/new)
A clean structural form for creating new library entries:
Title (required)
Author (required)
Total pages (optional — if omitted, manual progress % is used)
Status (default: reading)
... (159 lines left)
>>>>>>> f9d30c034f299ebe23bfa39cd46c03204179d7d2
