export interface CollectedBook {
  title: string;
  author: string;
  totalPages: number;
  genres: string[];
  description: string;
}

const CATEGORIES = [
  "fiction", "non-fiction", "science", "technology",
  "history", "philosophy", "self-help", "business",
];

export async function collectBooksFromInternet(
  userId: string,
  count: number = 5
): Promise<CollectedBook[]> {
  const books: CollectedBook[] = [];
  const seen = new Set<string>();

  for (const category of CATEGORIES) {
    if (books.length >= count) break;
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(category)}&maxResults=10&orderBy=relevance&langRestrict=en`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data: any = await res.json();

      for (const item of data.items ?? []) {
        if (books.length >= count) break;
        const info = item.volumeInfo;
        const title = info.title;
        if (!title || seen.has(title)) continue;
        seen.add(title);

        const authors = info.authors?.join(", ") ?? "Unknown Author";
        const totalPages = info.pageCount ?? Math.floor(Math.random() * 300) + 150;
        const genres = info.categories?.length
          ? info.categories.map((c: string) => c.split("/")[0].trim()).filter(Boolean)
          : [category.charAt(0).toUpperCase() + category.slice(1)];
        const description = info.description ?? "";

        books.push({ title, author: authors, totalPages, genres: [...new Set<string>(genres)], description });
      }
    } catch {
      continue;
    }
  }

  return books;
}

export function scheduleWeeklyCollection(intervalMs: number = 7 * 24 * 60 * 60 * 1000) {
  const run = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/books/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`[Collector] Added ${data.added} books`);
      }
    } catch {
      console.log("[Collector] Server not available, skipping");
    }
  };

  run();
  setInterval(run, intervalMs);
}
