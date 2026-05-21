import { NextResponse } from "next/server";
import { getUserId } from "@/lib/supabase/getUser";
import { getBooks, createBook } from "@/lib/supabase/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as string | null;

    const userId = await getUserId();
    const result = await getBooks(userId, {
      status: status ?? undefined,
      search: search || undefined,
      page,
      limit,
    });

    return NextResponse.json({
      books: result.books,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
        totalCount: result.total,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, totalPages, status, notes, genres, tags } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    const userId = await getUserId();
    const book = await createBook(userId, {
      title,
      author,
      totalPages: totalPages ?? null,
      status,
      notes: notes ?? null,
      genres: genres ?? [],
      tags: tags ?? [],
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
