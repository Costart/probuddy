"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import type { DailyStats } from "@/lib/conversion-stats";

interface StatsData {
  visits: DailyStats;
  conversions: DailyStats;
}

export default function ConversionsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/conversions");
      if (res.ok) setData(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const visits = data?.visits ?? { hours: {}, categories: {}, total: 0 };
  const conversions = data?.conversions ?? { hours: {}, categories: {}, total: 0 };
  const rate = visits.total > 0 ? (conversions.total / visits.total) * 100 : 0;

  // Build hourly data (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = String(i);
    return {
      hour: i,
      visits: visits.hours[h] ?? 0,
      conversions: conversions.hours[h] ?? 0,
    };
  });
  const maxHourly = Math.max(1, ...hours.map((h) => h.visits));

  // Build category tiles — merge all slugs from visits + conversions
  const allSlugs = new Set([
    ...Object.keys(visits.categories),
    ...Object.keys(conversions.categories),
  ]);
  const categoryTiles = [...allSlugs]
    .map((slug) => {
      const v = visits.categories[slug] ?? 0;
      const c = conversions.categories[slug] ?? 0;
      const r = v > 0 ? (c / v) * 100 : 0;
      return { slug, visits: v, conversions: c, rate: r };
    })
    .sort((a, b) => a.rate - b.rate); // worst first

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface">
            Conversions
          </h1>
          <p className="mt-1 text-on-surface-variant">
            Today&apos;s funnel activity (auto-refreshes every 60s)
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-on-surface-variant">Loading...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-xs text-on-surface-variant">Searches Today</div>
                <div className="text-3xl font-bold text-on-surface mt-1">
                  {visits.total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-xs text-on-surface-variant">Quote Starts</div>
                <div className="text-3xl font-bold text-primary mt-1">
                  {conversions.total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-xs text-on-surface-variant">Conversion Rate</div>
                <div className={`text-3xl font-bold mt-1 ${rateColor(rate)}`}>
                  {visits.total > 0 ? `${rate.toFixed(1)}%` : "—"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 24-hour chart */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-on-surface">
                  Last 24 Hours
                </h2>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-primary/70" />
                    Searches
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-teal-500" />
                    Quote Starts
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-[3px] h-32">
                {hours.map((h) => {
                  const visitH = (h.visits / maxHourly) * 100;
                  const convH = (h.conversions / maxHourly) * 100;
                  return (
                    <div
                      key={h.hour}
                      className="flex-1 flex flex-col items-center gap-0 relative group"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {formatHour(h.hour)}: {h.visits} searches, {h.conversions} quotes
                      </div>
                      <div className="w-full flex items-end gap-[1px]" style={{ height: "128px" }}>
                        <div
                          className="flex-1 bg-primary/60 rounded-t-sm transition-all"
                          style={{ height: `${Math.max(visitH > 0 ? 4 : 0, visitH)}%` }}
                        />
                        <div
                          className="flex-1 bg-teal-500 rounded-t-sm transition-all"
                          style={{ height: `${Math.max(convH > 0 ? 4 : 0, convH)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-on-surface-variant mt-1">
                        {h.hour % 3 === 0 ? formatHour(h.hour) : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category tiles */}
          <div>
            <h2 className="font-display font-bold text-on-surface mb-4">
              By Category
            </h2>
            {categoryTiles.length === 0 ? (
              <p className="text-on-surface-variant text-sm">
                No data yet. Stats appear once visitors search for pros.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryTiles.map((cat) => (
                  <Card key={cat.slug}>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-on-surface text-sm capitalize truncate">
                        {cat.slug.replace(/-/g, " ")}
                      </h3>
                      <div className="mt-2 space-y-1 text-xs text-on-surface-variant">
                        <div className="flex justify-between">
                          <span>Searches</span>
                          <span className="font-medium text-on-surface">{cat.visits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quote Starts</span>
                          <span className="font-medium text-primary">{cat.conversions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion</span>
                          <span className={`font-bold ${rateColor(cat.rate)}`}>
                            {cat.visits > 0 ? `${cat.rate.toFixed(1)}%` : "—"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function rateColor(rate: number): string {
  if (rate >= 15) return "text-green-600";
  if (rate >= 5) return "text-amber-600";
  return "text-error";
}

function formatHour(h: number): string {
  if (h === 0) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}
