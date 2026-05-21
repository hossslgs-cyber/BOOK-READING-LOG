import { NextResponse } from "next/server";
import { fetchTrendingBooks, searchBookByTitle } from "@/lib/openlibrary";
import { searchGoogleBooks } from "@/lib/google-books";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject") || "fiction";
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    let books = await fetchTrendingBooks(subject, limit);
    if (books.length === 0) {
      books = await searchGoogleBooks(subject, limit);
    }

    return NextResponse.json({ books });
  } catch (error) {
    console.error("Error fetching trending books:", error);
    return NextResponse.json(
      { books: [], error: "Unable to fetch trending books." },
      { status: 500 }
    );
  }
}
