import { searchGoogleBooks } from "./google-books";
import { formatOpenLibraryBook, searchBookByTitle } from "./openlibrary";
import type { AIRecommendation } from "./gemini";

export interface MatchedBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  genre?: string;
  totalPages?: number;
  source: string;
  externalId: string;
  description?: string;
}

function byTitleAuthorMatch(item: { title: string; author: string }, suggestion: AIRecommendation) {
  const normalizedTitle = item.title.toLowerCase().trim();
  const normalizedAuthor = item.author.toLowerCase().trim();
  return (
    normalizedTitle === suggestion.title.toLowerCase().trim() ||
    normalizedAuthor === suggestion.author.toLowerCase().trim()
  );
}

export async function matchAIBookToRealData(
  aiSuggestion: AIRecommendation
): Promise<MatchedBook> {
  try {
    const query = `${aiSuggestion.title} ${aiSuggestion.author}`.trim();
    const googleResults = await searchGoogleBooks(query, 5);
    const googleMatch = googleResults.find((item) =>
      byTitleAuthorMatch(item, aiSuggestion)
    );

    if (googleMatch) {
      return {
        ...googleMatch,
        description: aiSuggestion.description,
      };
    }

    const openLibraryResults = await searchBookByTitle(aiSuggestion.title);
    const openLibraryMatch = openLibraryResults.find((item) =>
      byTitleAuthorMatch(item, aiSuggestion)
    );

    if (openLibraryMatch) {
      return {
        ...openLibraryMatch,
        description: aiSuggestion.description,
      };
    }

    const fallbackId = `ai:${aiSuggestion.title}:${aiSuggestion.author}`;
    return {
      id: fallbackId,
      title: aiSuggestion.title,
      author: aiSuggestion.author,
      coverUrl: undefined,
      genre: aiSuggestion.genre,
      totalPages: undefined,
      source: "ai-suggestion",
      externalId: fallbackId,
      description: aiSuggestion.description,
    };
  } catch (error) {
    console.error("matchAIBookToRealData error:", error);
    const fallbackId = `ai:${aiSuggestion.title}:${aiSuggestion.author}`;
    return {
      id: fallbackId,
      title: aiSuggestion.title,
      author: aiSuggestion.author,
      source: "ai-suggestion",
      externalId: fallbackId,
      description: aiSuggestion.description,
    };
  }
}
