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

async function upsertGenre(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  name: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("genres")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("genres")
    .insert({ name, user_id: userId })
    .select("id")
    .single();

  return created!.id;
}

async function collectBooks(userId: string, count: number = 5) {
  const supabase = createAdminClient();

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

  // Get existing titles
  const { data: existingBooks } = await supabase
    .from("books")
    .select("title, author")
    .eq("user_id", userId);

  const existingTitles = new Set(
    (existingBooks ?? []).map((b: { title: string; author: string }) => `${b.title}|${b.author}`.toLowerCase())
  );

  let added = 0;
  for (const book of books) {
    const key = `${book.title}|${book.author}`.toLowerCase();
    if (existingTitles.has(key)) continue;

    const { data: newBook } = await supabase
      .from("books")
      .insert({
        title: book.title,
        author: book.author,
        total_pages: book.totalPages ?? null,
        pages_read: 0,
        status: "READING",
        notes: book.description.slice(0, 500) || null,
        user_id: userId,
        source: "ai_collected",
      })
      .select("id")
      .single();

    if (newBook) {
      for (const g of book.genres) {
        const genreId = await upsertGenre(supabase, userId, g);
        await supabase.from("book_genres").insert({
          book_id: newBook.id,
          genre_id: genreId,
        });
      }
      added++;
    }
  }

  console.log(`Collected ${added} new books from the internet`);
  return added;
}

const userId = process.env.USER_ID ?? "mock-user-id";
const count = parseInt(process.env.COUNT ?? "5", 10);

collectBooks(userId, count).catch((e) => {
  console.error(e);
  process.exit(1);
});
