export interface GoogleBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  genre?: string;
  totalPages?: number;
  source: string;
  externalId: string;
}

export function formatGoogleBook(book: any): GoogleBook {
  const volumeInfo = book.volumeInfo || {};
  const title = volumeInfo.title || "Untitled";
  const author = Array.isArray(volumeInfo.authors)
    ? volumeInfo.authors.join(", ")
    : volumeInfo.author || "Unknown Author";
  const coverUrl =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
  const genre = Array.isArray(volumeInfo.categories)
    ? volumeInfo.categories[0]
    : volumeInfo.categories;
  const totalPages = typeof volumeInfo.pageCount === "number" ? volumeInfo.pageCount : undefined;
  const externalId = book.id || volumeInfo.industryIdentifiers?.[0]?.identifier || title;

  return {
    id: book.id || externalId,
    title,
    author,
    coverUrl,
    genre,
    totalPages,
    source: "google-books",
    externalId: String(externalId),
  };
}

export async function searchGoogleBooks(
  query: string,
  maxResults = 10
): Promise<GoogleBook[]> {
  try {
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", String(maxResults));
    if (key) {
      url.searchParams.set("key", key);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 21600 },
    });

    if (!response.ok) {
      console.error("Google Books search failed:", response.statusText);
      return [];
    }

    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    return items.map(formatGoogleBook).slice(0, maxResults);
  } catch (error) {
    console.error("searchGoogleBooks error:", error);
    return [];
  }
}
