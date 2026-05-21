import { createBook, getBooks } from "./supabase/db";
import { createAdminClient } from "./supabase/admin";
import { moderateImport } from "./content-moderation";
import { recordImportAttempt } from "./rate-limiter";

interface ImportResult {
  success: boolean;
  booksImported: number;
  errors: string[];
  reason?: string;
}

function parseStructuredText(text: string) {
  const books: Array<Record<string, string>> = [];
  const blocks = text.split(/(?=^Title:\s)/mi);

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    const entry: Record<string, string> = {};

    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      if (value) {
        entry[key] = value;
      }
    }

    if (entry.title) {
      books.push(entry);
    }
  }

  return books;
}

function normalizeEntry(entry: Record<string, string>) {
  return {
    title: entry.title?.trim() ?? "",
    author: entry.author?.trim() ?? "",
    notes: entry.notes?.trim() ?? null,
    genres: entry.genres
      ? entry.genres.split(",").map((genre) => genre.trim()).filter(Boolean)
      : [],
    tags: entry.tags
      ? entry.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [],
    totalPages: entry.totalpages
      ? parseInt(entry.totalpages, 10)
      : entry.pages
      ? parseInt(entry.pages, 10)
      : null,
    status: entry.status ? entry.status.toUpperCase() : "READING",
  };
}

export async function logImportAttempt(
  userId: string,
  file: File,
  status: string,
  reason?: string,
  category?: string
) {
  const admin = createAdminClient();
  try {
    await admin.from("import_logs").insert({
      user_id: userId,
      file_name: file.name,
      file_type: file.type || category || "unknown",
      file_size: file.size,
      status,
      reason: reason ?? null,
      category: category ?? null,
    });
  } catch (error) {
    console.error("Failed to log import attempt:", error);
    recordImportAttempt(userId);
  }
}

export async function importBooksWithModeration(
  userId: string,
  file: File
): Promise<ImportResult> {
  const moderation = await moderateImport(file, userId);
  if (!moderation.allowed) {
    await logImportAttempt(userId, file, "rejected", moderation.reason, "moderation");
    return {
      success: false,
      booksImported: 0,
      errors: [],
      reason: moderation.reason,
    };
  }

  const sanitizedText = moderation.sanitizedText ?? "";
  const entries = parseStructuredText(sanitizedText);
  const existingBooks = await getBooks(userId, { limit: 9999 });
  const existingSet = new Set(
    existingBooks.books.map((book) => `${book.title}|${book.author}`.toLowerCase())
  );

  let importedCount = 0;
  const errors: string[] = [];

  for (const rawEntry of entries) {
    const entry = normalizeEntry(rawEntry);

    if (!entry.title || !entry.author) {
      errors.push(`Missing required fields for entry: ${JSON.stringify(rawEntry)}`);
      continue;
    }

    const key = `${entry.title}|${entry.author}`.toLowerCase();
    if (existingSet.has(key)) {
      errors.push(`Duplicate book skipped: ${entry.title}`);
      continue;
    }

    try {
      await createBook(userId, {
        title: entry.title,
        author: entry.author,
        totalPages: entry.totalPages,
        status: ["READING", "FINISHED", "DROPPED"].includes(entry.status)
          ? entry.status
          : "READING",
        notes: entry.notes,
        genres: entry.genres,
        tags: entry.tags,
        source: "imported",
      });
      existingSet.add(key);
      importedCount++;
    } catch (error) {
      console.error("Failed to import book entry:", error);
      errors.push(`Failed to import ${entry.title}`);
    }
  }

  await logImportAttempt(userId, file, "success", errors.length ? errors.join(", ") : undefined, "import");

  return {
    success: true,
    booksImported: importedCount,
    errors,
  };
}
