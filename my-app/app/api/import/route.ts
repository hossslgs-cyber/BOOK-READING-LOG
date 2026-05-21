import { NextResponse } from "next/server";
import { getUserId } from "@/lib/supabase/getUser";
import { createBook, getBooks } from "@/lib/supabase/db";

const REQUIRED_FIELDS = ["title", "author"];

function parseStructuredText(text: string): any[] {
  const books: any[] = [];
  const blocks = text.split(/(?=^Title:\s)/m);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const entry: Record<string, any> = {};
    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      if (value) entry[key] = value;
    }
    if (entry.title) books.push(entry);
  }
  return books;
}

function validateBook(entry: any): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (!entry[field]) return `Missing required field: ${field}`;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const entries = parseStructuredText(text);

    // Get existing books to avoid duplicates
    const { books: existingBooks } = await getBooks(userId, { limit: 9999 });
    const existingTitles = new Set(
      existingBooks.map((b) => `${b.title}|${b.author}`.toLowerCase())
    );

    const result = { success: 0, errors: [] as string[] };

    for (const entry of entries) {
      const error = validateBook(entry);
      if (error) {
        result.errors.push(`"${entry.title ?? "unknown"}": ${error}`);
        continue;
      }

      const key = `${entry.title}|${entry.author}`.toLowerCase();
      if (existingTitles.has(key)) {
        result.errors.push(`"${entry.title}" already exists`);
        continue;
      }

      const genres = entry.genres
        ? entry.genres.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
      const tags = entry.tags
        ? entry.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      const totalPages = parseInt(entry.totalpages ?? entry.pages, 10) || null;
      const pagesRead = parseInt(entry.pagesread ?? "0", 10) || 0;
      const status = (entry.status?.toUpperCase() ?? "READING") as string;

      await createBook(userId, {
        title: entry.title,
        author: entry.author,
        totalPages,
        status: ["READING", "FINISHED", "DROPPED"].includes(status) ? status : "READING",
        notes: entry.notes ?? null,
        genres,
        tags,
        source: "imported",
      });
      result.success++;
      existingTitles.add(key);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing books:", error);
    return NextResponse.json(
      { error: "Failed to import" },
      { status: 500 }
    );
  }
}
