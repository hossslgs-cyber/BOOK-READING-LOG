import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const supabase = createAdminClient();

const BOOKS_SEED = [
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    totalPages: 352, pagesRead: 150, status: "READING",
    notes: "Great book about software development practices",
    genres: ["Non-Fiction", "Technology"],
    tags: ["favorite", "recommended"],
  },
  {
    title: "To Kill a Mockingbird", author: "Harper Lee",
    totalPages: 281, pagesRead: 281, status: "FINISHED",
    notes: "Classic novel about racial injustice",
    finishedAt: new Date(Date.now() - 86400000),
    genres: ["Fiction", "Classic"], tags: ["must-read", "paperback"],
  },
  {
    title: "1984", author: "George Orwell",
    totalPages: 328, pagesRead: 50, status: "DROPPED",
    notes: "Found it too dystopian for my taste",
    droppedAt: new Date(Date.now() - 172800000),
    genres: ["Fiction", "Sci-Fi"], tags: ["re-read"],
  },
  {
    title: "Atomic Habits", author: "James Clear",
    totalPages: 320, pagesRead: 320, status: "FINISHED",
    notes: "Excellent framework for building good habits",
    finishedAt: new Date(Date.now() - 43200000),
    genres: ["Non-Fiction", "Self-Help"], tags: ["favorite", "must-read"],
  },
  {
    title: "Clean Code", author: "Robert C. Martin",
    totalPages: 464, pagesRead: 200, status: "READING",
    genres: ["Non-Fiction", "Technology"], tags: ["recommended"],
  },
  {
    title: "Dune", author: "Frank Herbert",
    totalPages: 688, pagesRead: 688, status: "FINISHED",
    notes: "Masterpiece of science fiction",
    finishedAt: new Date(),
    genres: ["Fiction", "Sci-Fi", "Classic"], tags: ["favorite"],
  },
];

async function upsertItem(
  table: "genres" | "tags",
  userId: string,
  name: string
): Promise<string> {
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from(table)
    .insert({ name, user_id: userId })
    .select("id")
    .single();

  return created!.id;
}

async function main() {
  const userId = "mock-user-id";

  // Check if user exists in auth.users, create in public schema if not
  const { data: existingBooks } = await supabase
    .from("books")
    .select("id")
    .limit(1);

  if (existingBooks && existingBooks.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  for (const b of BOOKS_SEED) {
    const { data: book } = await supabase
      .from("books")
      .insert({
        title: b.title,
        author: b.author,
        total_pages: b.totalPages ?? null,
        pages_read: b.pagesRead,
        status: b.status,
        notes: b.notes ?? null,
        finished_at: b.finishedAt?.toISOString() ?? null,
        dropped_at: b.droppedAt?.toISOString() ?? null,
        user_id: userId,
        source: "seed",
      })
      .select("id")
      .single();

    if (!book) {
      console.error(`Failed to create book: ${b.title}`);
      continue;
    }

    for (const g of b.genres) {
      const genreId = await upsertItem("genres", userId, g);
      await supabase.from("book_genres").insert({
        book_id: book.id,
        genre_id: genreId,
      });
    }

    for (const t of b.tags) {
      const tagId = await upsertItem("tags", userId, t);
      await supabase.from("book_tags").insert({
        book_id: book.id,
        tag_id: tagId,
      });
    }

    console.log(`Seeded book: ${b.title}`);
  }

  console.log("Database seeded successfully");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
