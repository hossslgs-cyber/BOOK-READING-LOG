import { NextResponse } from "next/server";
import { getUserId } from "@/lib/supabase/getUser";
import { getBooks } from "@/lib/supabase/db";
import { generateBookRecommendations } from "@/lib/gemini";
import { matchAIBookToRealData } from "@/lib/book-matcher";

export async function GET() {
  try {
    const userId = await getUserId();
    const userLibrary = await getBooks(userId, { limit: 9999 });

    if (userLibrary.books.length === 0) {
      return NextResponse.json({ books: [], message: "Add books to your library to receive recommendations." });
    }

    const userBooks = userLibrary.books.map((book) => ({
      title: book.title,
      author: book.author,
      genre: book.genres?.[0]?.name,
      tags: book.tags?.map((tag) => tag.name) ?? [],
    }));

    const aiSuggestions = await generateBookRecommendations(userBooks);
    const matchedBooks = await Promise.all(
      aiSuggestions.map((suggestion) => matchAIBookToRealData(suggestion))
    );

    return NextResponse.json({ books: matchedBooks });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { books: [], error: "Unable to fetch recommendations." },
      { status: 500 }
    );
  }
}
