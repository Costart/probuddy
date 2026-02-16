"use client";

import { useSharedPage } from "@/components/SharedPageContext";

export function CityName({ fallback }: { fallback?: string }) {
  const { geoLocation } = useSharedPage();
  const city = geoLocation.city ?? fallback;
  if (!city) return <> Near You</>;
  return <> in {city}</>;
}
