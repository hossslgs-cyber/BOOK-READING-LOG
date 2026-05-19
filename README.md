<<<<<<< HEAD
📚 Book Reading Log
A simple, clean, and incredibly fast web application for book lovers to track their reading journey. Log progress page-by-page, organize your library with genres and tags, visualize your reading habits, and export your data — all without a single page reload.
 Stack 

 Stack 

 Stack 

 Stack 
=======
Book Reading Log
A simple, clean, and incredibly fast web application for book lovers to track their reading journey. Log progress page-by-page, organize your library with genres and tags, visualize your reading habits, and export your data — all without a single page reload.

>>>>>>> d46442b549f2a2baa466ee08277e34ad2f86558a

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
<<<<<<< HEAD
=======

>>>>>>> d46442b549f2a2baa466ee08277e34ad2f86558a
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
<<<<<<< HEAD
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
Copygit commit -m "Resolve merge conflict in README.md"
=======

>>>>>>> d46442b549f2a2baa466ee08277e34ad2f86558a
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
<<<<<<< HEAD
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
Open an issue or reach out — happy reading! 📖
=======
>>>>>>> d46442b549f2a2baa466ee08277e34ad2f86558a
