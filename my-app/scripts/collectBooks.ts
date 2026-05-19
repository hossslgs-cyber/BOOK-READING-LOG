import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  "fiction", "non-fiction", "science", "technology",
  "history", "philosophy", "self-help", "business",
  "fantasy", "biography",
];

interface VolumeInfo {
  title?: string;
  authors?: string[];
  pageCount?: number;
  categories?: string[];
  description?: string;
}

async function collectBooks(userId: string, count: number = 5) {
  const books: { title: string; author: string; totalPages: number; genres: string[]; description: string }[] = [];
  const seen = new Set<string>();

  for (const category of CATEGORIES) {
    if (books.length >= count) break;
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(category)}&maxResults=10&orderBy=relevance&langRestrict=en`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data: any = await res.json();

      for (const item of (data.items ?? []) as { volumeInfo: VolumeInfo }[]) {
        if (books.length >= count) break;
        const info = item.volumeInfo;
        const title = info.title;
        if (!title || seen.has(title)) continue;
        seen.add(title);

        books.push({
          title,
          author: info.authors?.join(", ") ?? "Unknown Author",
          totalPages: info.pageCount ?? Math.floor(Math.random() * 300) + 150,
          genres: info.categories?.length
            ? [...new Set(info.categories.map((c: string) => c.split("/")[0].trim()))]
            : [category.charAt(0).toUpperCase() + category.slice(1)],
          description: info.description ?? "",
        });
      }
    } catch {
      continue;
    }
  }

  let added = 0;
  for (const book of books) {
    const existing = await prisma.book.findFirst({
      where: { title: book.title, author: book.author, userId },
    });
    if (existing) continue;

    await prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        totalPages: book.totalPages ?? null,
        pagesRead: 0,
        status: "READING",
        notes: book.description.slice(0, 500) || null,
        userId,
        source: "ai_collected",
        genres: {
          connectOrCreate: book.genres.map((name) => ({
            where: { userId_name: { userId, name } },
            create: { name, userId },
          })),
        },
      },
    });
    added++;
  }

  console.log(`Collected ${added} new books from the internet`);
  return added;
}

const userId = process.env.USER_ID ?? "mock-user-id";
const count = parseInt(process.env.COUNT ?? "5", 10);

collectBooks(userId, count)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
