"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import type { ApiLogEntry } from "@/lib/api-log";

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/api-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  // Compute stats
  const searchLogs = logs.filter((l) => l.endpoint === "search");
  const rankLogs = logs.filter((l) => l.endpoint === "rank");

  function stats(entries: ApiLogEntry[]) {
    const ok = entries.filter((e) => e.status === "ok");
    const errors = entries.filter((e) => e.status === "error");
    const cacheHits = entries.filter((e) => e.status === "cache");
    const times = ok.map((e) => e.ms);
    const avg = times.length
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;
    const p50 = times.length
      ? times.sort((a, b) => a - b)[Math.floor(times.length * 0.5)]
      : 0;
    const p95 = times.length
      ? times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
      : 0;
    const max = times.length ? Math.max(...times) : 0;
    return { total: entries.length, ok: ok.length, errors: errors.length, cacheHits: cacheHits.length, avg, p50, p95, max };
  }

  const searchStats = stats(searchLogs);
  const rankStats = stats(rankLogs);

  // Recent logs (newest first)
  const recent = [...logs].reverse();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface">
            API Performance
          </h1>
          <p className="mt-1 text-on-surface-variant">
            Last {logs.length} API calls (auto-refreshes every 30s)
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-on-primary hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-on-surface-variant">Loading...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Thumbtack Search"
              stats={searchStats}
            />
            <StatCard
              title="Gemini Ranking"
              stats={rankStats}
            />
          </div>

          {/* Recent logs table */}
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-outline-variant/50">
                <h2 className="font-display font-bold text-on-surface">
                  Recent Calls
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/50 text-left text-on-surface-variant">
                      <th className="p-4 font-medium">Time</th>
                      <th className="p-4 font-medium">Endpoint</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Response (ms)</th>
                      <th className="p-4 font-medium">Detail</th>
                      <th className="p-4 font-medium">Zip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((log, i) => (
                      <tr
                        key={`${log.ts}-${i}`}
                        className="border-b border-outline-variant/30 hover:bg-surface-container/50"
                      >
                        <td className="p-4 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                          {formatTime(log.ts)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              log.endpoint === "search"
                                ? "bg-blue-100 text-blue-700"
                                : log.endpoint === "rank"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {log.endpoint}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={
                              log.status === "ok"
                                ? "text-green-600 font-medium"
                                : log.status === "error"
                                  ? "text-error font-medium"
                                  : log.status === "cache"
                                    ? "text-blue-600 font-medium"
                                    : "text-on-surface-variant"
                            }
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono">
                          <span className={msColor(log.ms)}>
                            {log.ms.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant text-xs max-w-48 truncate">
                          {log.detail || "—"}
                        </td>
                        <td className="p-4 font-mono text-xs text-on-surface-variant">
                          {log.zip || "—"}
                        </td>
                      </tr>
                    ))}
                    {recent.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-on-surface-variant"
                        >
                          No API logs yet. Logs appear after pro searches and AI rankings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  stats,
}: {
  title: string;
  stats: { total: number; ok: number; errors: number; cacheHits: number; avg: number; p50: number; p95: number; max: number };
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-display font-bold text-on-surface mb-4">{title}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-on-surface-variant">Total</div>
            <div className="text-2xl font-bold text-on-surface">{stats.total}</div>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant">API Calls</div>
            <div className="text-2xl font-bold text-on-surface">{stats.ok}</div>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant">Cache Hits</div>
            <div className="text-2xl font-bold text-blue-600">{stats.cacheHits}</div>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant">Errors</div>
            <div className={`text-2xl font-bold ${stats.errors > 0 ? "text-error" : "text-green-600"}`}>
              {stats.errors}
            </div>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant">Avg (ms)</div>
            <div className={`text-2xl font-bold ${msColor(stats.avg)}`}>
              {stats.avg.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant">p95 (ms)</div>
            <div className={`text-2xl font-bold ${msColor(stats.p95)}`}>
              {stats.p95.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function msColor(ms: number): string {
  if (ms < 1000) return "text-green-600";
  if (ms < 3000) return "text-amber-600";
  return "text-error";
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
