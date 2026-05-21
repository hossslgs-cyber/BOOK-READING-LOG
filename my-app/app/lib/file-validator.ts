export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

function bufferStartsWith(buffer: Buffer, signature: number[]) {
  return signature.every((byte, index) => buffer[index] === byte);
}

export async function validateFile(file: File): Promise<FileValidationResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const header = buffer.slice(0, 4);
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (bufferStartsWith(header, [0x25, 0x50, 0x44, 0x46])) {
      return { valid: true };
    }

    if (bufferStartsWith(header, [0x50, 0x4b, 0x03, 0x04])) {
      return { valid: true };
    }

    if (extension === "txt" || extension === "csv") {
      const text = buffer.toString("utf8");
      const asciiFraction = Array.from(text.slice(0, 512)).filter((char) => {
        const code = char.charCodeAt(0);
        return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126);
      }).length;
      if (asciiFraction / Math.max(text.length, 1) > 0.8) {
        return { valid: true };
      }
      return { valid: false, reason: "Text file appears to contain non-text content" };
    }

    return { valid: false, reason: "Unsupported file type. Allowed types: PDF, DOCX, TXT, CSV." };
  } catch (error) {
    console.error("validateFile error:", error);
    return { valid: false, reason: "File validation failed" };
  }
}

export function checkFileSize(file: File, maxBytes = 10 * 1024 * 1024) {
  if (file.size > maxBytes) {
    return {
      valid: false,
      reason: `File size exceeds limit of ${maxBytes} bytes`,
    };
  }

  return { valid: true };
}
