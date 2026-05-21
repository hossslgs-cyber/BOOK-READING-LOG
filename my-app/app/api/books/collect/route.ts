import { NextResponse } from "next/server";
import { collectBooksFromInternet } from "@/lib/bookCollector";
import { getUserId } from "@/lib/supabase/getUser";
import { createBook, getBooks } from "@/lib/supabase/db";

export async function POST(request: Request) {
  try {
    const { count = 5 } = await request.json();
    const userId = await getUserId();

    const collected = await collectBooksFromInternet(userId, count);

    // Get existing books to avoid duplicates
    const { books: existing } = await getBooks(userId, { limit: 9999 });
    const existingTitles = new Set(
      existing.map((b) => `${b.title}|${b.author}`.toLowerCase())
    );

    let added = 0;
    for (const book of collected) {
      const key = `${book.title}|${book.author}`.toLowerCase();
      if (existingTitles.has(key)) continue;

      await createBook(userId, {
        title: book.title,
        author: book.author,
        totalPages: book.totalPages,
        notes: book.description.slice(0, 500),
        genres: book.genres,
        status: "READING",
        source: "ai_collected",
      });
      added++;
    }

    return NextResponse.json({ added, total_collected: collected.length });
  } catch (error) {
    console.error("Error collecting books:", error);
    return NextResponse.json(
      { error: "Failed to collect books" },
      { status: 500 }
    );
  }
}
