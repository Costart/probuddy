"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SitemapResult {
  success: boolean;
  segments: number;
  static: number;
  services: number;
  us: number;
  usServices: number;
  coveredCities: number;
  coveredCategories: number;
  error?: string;
}

export function GenerateSitemapButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SitemapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/sitemap/generate", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Sitemap"}
        </Button>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View sitemap.xml
        </a>
      </div>

      {result && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm space-y-1">
          <p className="font-medium text-green-800">Sitemap generated</p>
          <div className="text-green-700 grid grid-cols-2 gap-x-6 gap-y-0.5">
            <span>Static pages: {result.static}</span>
            <span>Service pages: {result.services}</span>
            <span>US location (categories): {result.us}</span>
            <span>US location (sub-services): {result.usServices}</span>
            <span>Cities with coverage: {result.coveredCities}</span>
            <span>Categories with coverage: {result.coveredCategories}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm">
          <p className="font-medium text-red-800">Error</p>
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
