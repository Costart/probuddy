/** Append an API timing entry to a rolling KV log (last 200 entries). */

export interface ApiLogEntry {
  ts: string; // ISO timestamp
  endpoint: string; // "search" | "rank" | "chat"
  ms: number; // response time
  status: "ok" | "error" | "cache";
  detail?: string; // e.g. "5 results" or error reason
  ip?: string;
  zip?: string;
}

const LOG_KEY = "api:logs";
const MAX_ENTRIES = 200;

export async function appendApiLog(cache: any, entry: ApiLogEntry) {
  if (!cache) return;
  try {
    const raw = await cache.get(LOG_KEY);
    const entries: ApiLogEntry[] = raw ? JSON.parse(raw) : [];
    entries.push(entry);
    // Keep only the last MAX_ENTRIES
    const trimmed = entries.slice(-MAX_ENTRIES);
    await cache.put(LOG_KEY, JSON.stringify(trimmed), {
      expirationTtl: 604800, // 1 week
    });
  } catch {
    // Fire-and-forget — don't break the API
  }
}

export async function getApiLogs(cache: any): Promise<ApiLogEntry[]> {
  if (!cache) return [];
  try {
    const raw = await cache.get(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
