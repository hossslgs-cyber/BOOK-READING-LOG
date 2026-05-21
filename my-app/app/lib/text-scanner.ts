export interface TextScanResult {
  clean: boolean;
  reason?: string;
  sanitized?: string;
}

const BLOCKED_KEYWORDS = [
  "porn",
  "xxx",
  "explicit",
  "adult",
  "nsfw",
  "nude",
  "hate",
  "kill",
  "torture",
  "drugs",
  "weapons",
];

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore
    const pdfParse = (await import("pdf-parse")).default || (await import("pdf-parse"));
    const data = await pdfParse(buffer);
    return String(data.text ?? "");
  } catch (error) {
    console.error("extractTextFromPDF error:", error);
    return "";
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return String(result.value ?? "");
  } catch (error) {
    console.error("extractTextFromDOCX error:", error);
    return "";
  }
}

export function sanitizeText(text: string): string {
  const withoutHtml = text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return withoutHtml.normalize("NFKC").slice(0, 2000);
}

export function scanText(text: string): TextScanResult {
  const normalized = text.toLowerCase();

  for (const keyword of BLOCKED_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        clean: false,
        reason: `Blocked keyword detected: ${keyword}`,
        sanitized: sanitizeText(text),
      };
    }
  }

  if (!normalized.trim()) {
    return {
      clean: false,
      reason: "No text content detected.",
      sanitized: "",
    };
  }

  return {
    clean: true,
    sanitized: sanitizeText(text),
  };
}
