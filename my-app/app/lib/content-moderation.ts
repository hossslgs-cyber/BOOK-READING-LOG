import { validateFile, checkFileSize } from "./file-validator";
import { extractTextFromPDF, extractTextFromDOCX, scanText } from "./text-scanner";
import { scanImage } from "./image-scanner";
import { checkImportLimit } from "./rate-limiter";

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  sanitizedText?: string;
  logData: Record<string, unknown>;
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isImageFile(extension: string, mimeType: string) {
  return ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(extension) ||
    mimeType.startsWith("image/");
}

export async function moderateImport(file: File, userId: string): Promise<ModerationResult> {
  const validation = await validateFile(file);
  const sizeCheck = checkFileSize(file);
  const ext = getExtension(file.name);
  const category = ext || file.type || "unknown";

  const logData: Record<string, unknown> = {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    category,
  };

  if (!validation.valid) {
    return {
      allowed: false,
      reason: validation.reason,
      logData,
    };
  }

  if (!sizeCheck.valid) {
    return {
      allowed: false,
      reason: sizeCheck.reason,
      logData,
    };
  }

  const limitResult = await checkImportLimit(userId);
  logData.rateLimit = limitResult;
  if (!limitResult.allowed) {
    return {
      allowed: false,
      reason: "Import limit reached. Please try again later.",
      logData,
    };
  }

  let text = "";
  const lowerExt = ext.toLowerCase();

  if (lowerExt === "pdf") {
    const buffer = Buffer.from(await file.arrayBuffer());
    text = await extractTextFromPDF(buffer);
  } else if (lowerExt === "docx") {
    const buffer = Buffer.from(await file.arrayBuffer());
    text = await extractTextFromDOCX(buffer);
  } else if (lowerExt === "txt" || lowerExt === "csv") {
    text = await file.text();
  }

  if (!text.trim()) {
    return {
      allowed: false,
      reason: "Unable to extract text from file.",
      logData,
    };
  }

  const scanResult = scanText(text);
  logData.textLength = text.length;
  logData.textScan = scanResult;

  if (!scanResult.clean) {
    return {
      allowed: false,
      reason: scanResult.reason,
      logData,
    };
  }

  let imageResult = { safe: true, flagged: false };
  if (isImageFile(lowerExt, file.type)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    imageResult = await scanImage(buffer);
    logData.imageScan = imageResult;

    if (!imageResult.safe && imageResult.flagged) {
      return {
        allowed: false,
        reason: imageResult.reason ?? "Image content rejected.",
        logData,
      };
    }
  }

  return {
    allowed: true,
    sanitizedText: scanResult.sanitized,
    logData,
  };
}
