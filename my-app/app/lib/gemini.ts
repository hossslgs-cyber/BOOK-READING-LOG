export interface AIRecommendation {
  title: string;
  author: string;
  description?: string;
  genre?: string;
  tags?: string[];
}

function extractJsonArray(raw: string): any[] {
  const markdownMatch = raw.match(/```json\s*([\s\S]*?)```/i);
  const jsonText = markdownMatch?.[1] ?? raw;
  const arrayMatch = jsonText.match(/\[([\s\S]*)\]/);
  if (!arrayMatch) {
    throw new Error("Could not extract JSON array from Gemini response");
  }
  return JSON.parse(`[${arrayMatch[1]}]`);
}

export async function generateBookRecommendations(
  userBooks: { title: string; author: string; genre?: string; tags: string[] }[]
): Promise<AIRecommendation[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured");
      return [];
    }

    const prompt = `You are a helpful book recommendation engine.
Given the user's current library, recommend 10 new books in JSON array format.
Each item should include title, author, description, and genre.
Do not include any additional text outside the array.

User books:
${userBooks
      .map(
        (book) => `- ${book.title} by ${book.author}${book.genre ? ` (${book.genre})` : ""}${book.tags && book.tags.length ? ` [${book.tags.join(", ")}]` : ""}`
      )
      .join("\n")}

Return exactly valid JSON.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          temperature: 0.7,
          candidateCount: 1,
          prompt: {
            messages: [
              {
                role: "user",
                content: { text: prompt },
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini request failed:", response.statusText);
      return [];
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.[0]?.text ?? data?.output?.[0]?.content?.text ?? "";
    if (!content) {
      console.error("Gemini returned no content");
      return [];
    }

    const parsed = extractJsonArray(content.trim());
    return parsed.map((item: any) => ({
      title: String(item.title ?? "Untitled"),
      author: String(item.author ?? "Unknown Author"),
      description: item.description ? String(item.description) : undefined,
      genre: item.genre ? String(item.genre) : undefined,
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    }));
  } catch (error) {
    console.error("generateBookRecommendations error:", error);
    return [];
  }
}
