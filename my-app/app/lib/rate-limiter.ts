import { createAdminClient } from "./supabase/admin";

interface RateLimitEntry {
  timestamps: number[];
}

const inMemoryRateLimits = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
}

function cleanupTimestamps(entry: RateLimitEntry) {
  const cutoff = Date.now() - 60 * 60 * 1000;
  entry.timestamps = entry.timestamps.filter((timestamp) => timestamp > cutoff);
}

export async function checkImportLimit(userId: string): Promise<RateLimitResult> {
  try {
    const admin = createAdminClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error } = await admin
      .from("import_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if (error) {
      throw error;
    }

    const current = typeof count === "number" ? count : 0;
    const remaining = Math.max(0, 5 - current);
    return { allowed: current < 5, remaining };
  } catch (error) {
    console.warn("Falling back to in-memory rate limiting:", error);
    const entry = inMemoryRateLimits.get(userId) || { timestamps: [] };
    cleanupTimestamps(entry);
    const current = entry.timestamps.length;
    return { allowed: current < 5, remaining: Math.max(0, 5 - current) };
  }
}

export function recordImportAttempt(userId: string) {
  const entry = inMemoryRateLimits.get(userId) || { timestamps: [] };
  cleanupTimestamps(entry);
  entry.timestamps.push(Date.now());
  inMemoryRateLimits.set(userId, entry);
}
