"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

interface LocationCardProps {
  pageType: string;
  pageId: string;
  pageName: string;
  categorySlug: string;
  country: string;
  region: string;
  regionCode: string | null;
  city: string;
  countrySlugged: string;
  regionSlugged: string;
  citySlugged: string;
}

interface LocationData {
  blurb: string | null;
  cityDisplay: string;
  regionDisplay: string;
  countryDisplay: string;
}

export function LocationCard({
  pageType,
  pageId,
  pageName,
  categorySlug,
  country,
  region,
  regionCode,
  city,
  countrySlugged,
  regionSlugged,
  citySlugged,
}: LocationCardProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrGenerate() {
      try {
        const res = await fetch("/api/locations/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageType,
            pageId,
            pageName,
            country: countrySlugged,
            region: regionSlugged,
            city: citySlugged,
            cityDisplay: city,
            regionDisplay: regionCode || region,
            countryDisplay: country,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.location) setLocation(data.location);
        }
      } catch {
        // Silently fail — location content is optional
      } finally {
        setLoading(false);
      }
    }
    loadOrGenerate();
  }, [
    pageType,
    pageId,
    pageName,
    country,
    region,
    regionCode,
    city,
    countrySlugged,
    regionSlugged,
    citySlugged,
  ]);

  if (loading || !location) return null;

  const locationUrl = `/services/${categorySlug}/loc/${countrySlugged}/${regionSlugged}/${citySlugged}`;
  const displayLocation = `${location.cityDisplay}, ${location.regionDisplay}`;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-on-surface mb-1">
              {pageName} in {displayLocation}
            </h3>
            {location.blurb && (
              <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
                {location.blurb}
              </p>
            )}
            <Link
              href={locationUrl}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              See full guide
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
