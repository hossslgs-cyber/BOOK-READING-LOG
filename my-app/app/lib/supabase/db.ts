import { createClient } from "./server";
import type { Book, Genre, Tag } from "@/types";

type BookGenresJoin = { genres: Pick<Genre, "id" | "name"> };
type BookTagsJoin = { tags: Pick<Tag, "id" | "name"> };

type BookRow = Record<string, unknown> & {
  id: string;
  title: string;
  author: string;
  total_pages: number | null;
  pages_read: number;
  status: string;
  notes: string | null;
  finished_at: string | null;
  dropped_at: string | null;
  user_id: string;
  source: string;
  created_at: string;
  updated_at: string;
  book_genres?: BookGenresJoin[];
  book_tags?: BookTagsJoin[];
};

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    totalPages: row.total_pages ?? undefined,
    pagesRead: row.pages_read,
    status: row.status as Book["status"],
    notes: row.notes ?? undefined,
    finishedAt: row.finished_at ? new Date(row.finished_at) : null,
    droppedAt: row.dropped_at ? new Date(row.dropped_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    genres: (row.book_genres ?? []).map((bg: BookGenresJoin) => bg.genres),
    tags: (row.book_tags ?? []).map((bt: BookTagsJoin) => bt.tags),
  };
}

const BOOK_SELECT = `
  id, title, author, total_pages, pages_read, status,
  notes, finished_at, dropped_at, user_id, source,
  created_at, updated_at,
  book_genres ( genres ( id, name ) ),
  book_tags ( tags ( id, name ) )
`;

export async function getBooks(
  userId: string,
  opts?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ books: Book[]; total: number }> {
  const supabase = await createClient();
  const { status, search, page = 1, limit = 10 } = opts ?? {};

  let query = supabase
    .from("books")
    .select(BOOK_SELECT, { count: "exact" })
    .eq("user_id", userId);

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,author.ilike.%${search}%`
    );
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return {
    books: (data ?? []).map((r: unknown) => toBook(r as BookRow)),
    total: count ?? 0,
  };
}

export async function getBook(
  id: string,
  userId: string
): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return toBook(data as unknown as BookRow);
}

async function upsertGenre(
  userId: string,
  name: string
): Promise<string> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("genres")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("genres")
    .insert({ name, user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

async function upsertTag(userId: string, name: string): Promise<string> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("tags")
    .insert({ name, user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function createBook(
  userId: string,
  data: {
    title: string;
    author: string;
    totalPages?: number | null;
    status?: string;
    notes?: string | null;
    genres?: string[];
    tags?: string[];
    source?: string;
  }
): Promise<Book> {
  const supabase = await createClient();

  const { data: book, error } = await supabase
    .from("books")
    .insert({
      title: data.title,
      author: data.author,
      total_pages: data.totalPages ?? null,
      pages_read: 0,
      status: data.status ?? "READING",
      notes: data.notes ?? null,
      user_id: userId,
      source: data.source ?? "manual",
    })
    .select("id")
    .single();

  if (error) throw error;

  for (const g of data.genres ?? []) {
    const genreId = await upsertGenre(userId, g);
    await supabase.from("book_genres").insert({
      book_id: book.id,
      genre_id: genreId,
    });
  }

  for (const t of data.tags ?? []) {
    const tagId = await upsertTag(userId, t);
    await supabase.from("book_tags").insert({
      book_id: book.id,
      tag_id: tagId,
    });
  }

  const created = await getBook(book.id, userId);
  if (!created) throw new Error("Failed to fetch created book");
  return created;
}

export async function updateBook(
  id: string,
  userId: string,
  data: {
    title?: string;
    author?: string;
    totalPages?: number | null;
    pagesRead?: number;
    status?: string;
    notes?: string | null;
    genres?: string[];
    tags?: string[];
  }
): Promise<Book | null> {
  const supabase = await createClient();

  const existing = await supabase
    .from("books")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing.data) return null;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.author !== undefined) updateData.author = data.author;
  if (data.totalPages !== undefined) updateData.total_pages = data.totalPages;
  if (data.pagesRead !== undefined) updateData.pages_read = data.pagesRead;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("books")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
  }

  if (data.genres !== undefined) {
    await supabase.from("book_genres").delete().eq("book_id", id);
    for (const g of data.genres) {
      const genreId = await upsertGenre(userId, g);
      await supabase.from("book_genres").insert({
        book_id: id,
        genre_id: genreId,
      });
    }
  }

  if (data.tags !== undefined) {
    await supabase.from("book_tags").delete().eq("book_id", id);
    for (const t of data.tags) {
      const tagId = await upsertTag(userId, t);
      await supabase.from("book_tags").insert({
        book_id: id,
        tag_id: tagId,
      });
    }
  }

  return getBook(id, userId);
}

export async function deleteBook(
  id: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}

export async function getBooksExport(
  userId: string
): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r: unknown) => toBook(r as BookRow));
}
