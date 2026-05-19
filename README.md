
readme_simple = """# 📚 Book Reading Log

A simple web app to track the books you're reading. Log your progress page-by-page, organize with genres and tags, and see your reading stats at a glance.

**Built with:** Next.js · PostgreSQL · Tailwind CSS

---

## 📁 Project Structure

```
book-reading-log/
├── app/
│   ├── (auth)/
│   │   ├── login/              # Login page
│   │   └── register/           # Sign up page
│   ├── (main)/
│   │   ├── dashboard/          # Home page — stats, filters, book grid
│   │   ├── books/
│   │   │   ├── new/            # Form to add a new book
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Book detail + notes
│   │   │       └── edit/       # Edit book form
│   │   └── settings/           # Export / import library
│   ├── api/                    # Backend routes (books, dashboard, export)
│   ├── actions/                # Server actions (auth, CRUD, progress)
│   ├── components/             # Reusable UI pieces
│   ├── lib/                    # Database, auth config, helpers
│   └── hooks/                  # Data fetching hooks
├── prisma/
│   └── schema.prisma           # Database tables & relationships
├── public/                     # Static images & assets
├── .env                        # Secret config (not committed)
├── package.json                # Dependencies & scripts
└── README.md                   # This file
```




## 🛠️ Common Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npx prisma migrate dev` | Update database after schema changes |
| `npx prisma studio` | Open a visual database editor |
| `npx prisma db seed` | Fill the database with sample genres & tags |


