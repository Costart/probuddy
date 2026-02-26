/** Track visit/conversion events as daily aggregates in KV. */

export type ConversionEventType = "visit" | "conversion";

export interface DailyStats {
  hours: Record<string, number>;
  categories: Record<string, number>;
  total: number;
}

const TTL = 1_209_600; // 14 days

function emptyStats(): DailyStats {
  return { hours: {}, categories: {}, total: 0 };
}

export async function appendConversionEvent(
  cache: any,
  type: ConversionEventType,
  categorySlug: string,
) {
  if (!cache) return;

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const hour = String(now.getUTCHours());
  const key = `stats:${type}s:${dateStr}`;

  try {
    const raw = await cache.get(key);
    const stats: DailyStats = raw ? JSON.parse(raw) : emptyStats();

    stats.hours[hour] = (stats.hours[hour] ?? 0) + 1;
    stats.categories[categorySlug] = (stats.categories[categorySlug] ?? 0) + 1;
    stats.total = (stats.total ?? 0) + 1;

    await cache.put(key, JSON.stringify(stats), { expirationTtl: TTL });
  } catch (err) {
    console.error("[conversion-stats] Error:", err);
  }
}

export async function getConversionStats(
  cache: any,
  dateStr: string,
): Promise<{ visits: DailyStats; conversions: DailyStats }> {
  if (!cache) return { visits: emptyStats(), conversions: emptyStats() };

  try {
    const [visitsRaw, conversionsRaw] = await Promise.all([
      cache.get(`stats:visits:${dateStr}`),
      cache.get(`stats:conversions:${dateStr}`),
    ]);

    return {
      visits: visitsRaw ? JSON.parse(visitsRaw) : emptyStats(),
      conversions: conversionsRaw ? JSON.parse(conversionsRaw) : emptyStats(),
    };
  } catch {
    return { visits: emptyStats(), conversions: emptyStats() };
  }
}
