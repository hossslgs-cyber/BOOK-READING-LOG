Book Reading Log
A simple, clean, and incredibly fast web application for book lovers to track their reading journey. Log progress page-by-page, organize your library with genres and tags, visualize your reading habits, and export your data — all without a single page reload.


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
