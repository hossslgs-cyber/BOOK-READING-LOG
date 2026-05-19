import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { createHash } from "crypto";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  const userId = "mock-user-id";

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: userId,
        email: "demo@example.com",
        name: "Demo User",
        password: hashPassword("password123"),
      },
    });
    console.log("Created demo user");
  }

  const bookCount = await prisma.book.count();
  if (bookCount === 0) {
    const books = [
      { title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", totalPages: 352, pagesRead: 150, status: "READING", notes: "Great book about software development practices", genres: ["Non-Fiction", "Technology"], tags: ["favorite", "recommended"] },
      { title: "To Kill a Mockingbird", author: "Harper Lee", totalPages: 281, pagesRead: 281, status: "FINISHED", notes: "Classic novel about racial injustice", finishedAt: new Date(Date.now() - 86400000), genres: ["Fiction", "Classic"], tags: ["must-read", "paperback"] },
      { title: "1984", author: "George Orwell", totalPages: 328, pagesRead: 50, status: "DROPPED", notes: "Found it too dystopian for my taste", droppedAt: new Date(Date.now() - 172800000), genres: ["Fiction", "Sci-Fi"], tags: ["re-read"] },
      { title: "Atomic Habits", author: "James Clear", totalPages: 320, pagesRead: 320, status: "FINISHED", notes: "Excellent framework for building good habits", finishedAt: new Date(Date.now() - 43200000), genres: ["Non-Fiction", "Self-Help"], tags: ["favorite", "must-read"] },
      { title: "Clean Code", author: "Robert C. Martin", totalPages: 464, pagesRead: 200, status: "READING", genres: ["Non-Fiction", "Technology"], tags: ["recommended"] },
      { title: "Dune", author: "Frank Herbert", totalPages: 688, pagesRead: 688, status: "FINISHED", notes: "Masterpiece of science fiction", finishedAt: new Date(), genres: ["Fiction", "Sci-Fi", "Classic"], tags: ["favorite"] },
    ];

    for (const b of books) {
      const genres = b.genres.map((name) => ({
        where: { userId_name: { userId, name } },
        create: { name, userId },
      }));
      const tags = b.tags.map((name) => ({
        where: { userId_name: { userId, name } },
        create: { name, userId },
      }));

      await prisma.book.create({
        data: {
          title: b.title,
          author: b.author,
          totalPages: b.totalPages,
          pagesRead: b.pagesRead,
          status: b.status,
          notes: b.notes ?? null,
          finishedAt: b.finishedAt ?? null,
          droppedAt: b.droppedAt ?? null,
          userId,
          source: "seed",
          genres: { connectOrCreate: genres },
          tags: { connectOrCreate: tags },
        },
      });
    }
    console.log(`Seeded ${books.length} books`);
  }

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
