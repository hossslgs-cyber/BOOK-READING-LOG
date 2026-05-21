export interface ImageScanResult {
  safe: boolean;
  flagged: boolean;
  reason?: string;
}

export async function scanImage(imageBuffer: Buffer): Promise<ImageScanResult> {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      return {
        safe: true,
        flagged: true,
        reason: "Google Vision API key is not configured.",
      };
    }

    const base64 = imageBuffer.toString("base64");
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "SAFE_SEARCH_DETECTION" }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Google Vision request failed:", response.statusText);
      return {
        safe: true,
        flagged: true,
        reason: "Vision API request failed.",
      };
    }

    const payload = await response.json();
    const annotation = payload?.responses?.[0]?.safeSearchAnnotation;
    if (!annotation) {
      return { safe: true, flagged: false };
    }

    const flagged = [annotation.adult, annotation.violence].some(
      (value: string) => value === "LIKELY" || value === "VERY_LIKELY"
    );

    return {
      safe: !flagged,
      flagged,
      reason: flagged ? "Image contains adult or violent content." : undefined,
    };
  } catch (error) {
    console.error("scanImage error:", error);
    return {
      safe: true,
      flagged: true,
      reason: "Image scanning failed.",
    };
  }
}
