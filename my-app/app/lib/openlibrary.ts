export interface OpenLibraryBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  genre?: string;
  totalPages?: number;
  source: string;
  externalId: string;
}

function buildCoverUrl(coverId: number | string) {
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

export function getCoverImageUrl(coverId: number | string) {
  return buildCoverUrl(coverId);
}

function normalizeOpenLibraryBook(data: any): OpenLibraryBook {
  const title = data.title || data.name || "Untitled";
  const author = Array.isArray(data.authors)
    ? data.authors.map((item: any) => item?.name).filter(Boolean).join(", ")
    : Array.isArray(data.author_name)
    ? data.author_name.join(", ")
    : data.by_statement || "Unknown Author";
  const coverId = data.cover_id ?? data.cover_i;
  const coverUrl = coverId ? buildCoverUrl(coverId) : undefined;
  const genre = Array.isArray(data.subject)
    ? data.subject[0]
    : Array.isArray(data.subjects)
    ? data.subjects[0]
    : undefined;
  const totalPages =
    typeof data.number_of_pages_median === "number"
      ? data.number_of_pages_median
      : typeof data.pages === "number"
      ? data.pages
      : undefined;
  const externalId = data.key || data.cover_edition_key || data.edition_key?.[0] || title;

  return {
    id: externalId,
    title,
    author,
    coverUrl,
    genre,
    totalPages,
    source: "openlibrary",
    externalId: String(externalId),
  };
}

export async function fetchTrendingBooks(
  subject = "fiction",
  limit = 12
): Promise<OpenLibraryBook[]> {
  try {
    const url = `https://openlibrary.org/subjects/${encodeURIComponent(
      subject
    )}.json?limit=${limit}`;
    const response = await fetch(url, {
      next: { revalidate: 21600 },
    });
    if (!response.ok) {
      console.error("OpenLibrary trending fetch failed:", response.statusText);
      return [];
    }
    const payload = await response.json();
    const works = Array.isArray(payload.works) ? payload.works : [];
    return works.map(normalizeOpenLibraryBook).slice(0, limit);
  } catch (error) {
    console.error("fetchTrendingBooks error:", error);
    return [];
  }
}

export async function searchBookByTitle(
  title: string,
  limit = 10
): Promise<OpenLibraryBook[]> {
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      title
    )}&limit=${limit}`;
    const response = await fetch(url, {
      next: { revalidate: 21600 },
    });
    if (!response.ok) {
      console.error("OpenLibrary search fetch failed:", response.statusText);
      return [];
    }
    const payload = await response.json();
    const docs = Array.isArray(payload.docs) ? payload.docs : [];
    return docs.map(normalizeOpenLibraryBook).slice(0, limit);
  } catch (error) {
    console.error("searchBookByTitle error:", error);
    return [];
  }
}
