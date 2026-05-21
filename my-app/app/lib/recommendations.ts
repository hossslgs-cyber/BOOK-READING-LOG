import { createBook, getBooks } from "./supabase/db";

export interface RecommendedBookData {
  title: string;
  author: string;
  genre?: string;
  totalPages?: number | null;
}

export async function addRecommendedBookToLibrary(
  userId: string,
  bookData: RecommendedBookData
): Promise<{ success: boolean; book?: any; error?: string }> {
  try {
    const allBooks = await getBooks(userId, { limit: 9999 });
    const normalizedCandidate = `${bookData.title}|${bookData.author}`.toLowerCase();
    const duplicate = allBooks.books.some(
      (book) =>
        `${book.title}|${book.author}`.toLowerCase() === normalizedCandidate
    );

    if (duplicate) {
      return {
        success: false,
        error: "This book is already in your library.",
      };
    }

    const book = await createBook(userId, {
      title: bookData.title,
      author: bookData.author,
      totalPages: bookData.totalPages ?? null,
      status: "READING",
      notes: null,
      genres: bookData.genre ? [bookData.genre] : [],
      tags: [],
      source: "recommendation",
    });

    return { success: true, book };
  } catch (error) {
    console.error("addRecommendedBookToLibrary error:", error);
    return { success: false, error: "Failed to add recommended book." };
  }
}
