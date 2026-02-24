"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const TRACKING_KEYS = ["gclid", "utm_source", "utm_medium", "utm_campaign"] as const;
const STORAGE_PREFIX = "tracking_";

export function useCaptureTrackingParams() {
  const searchParams = useSearchParams();

  useEffect(() => {
    TRACKING_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
      }
    });
  }, [searchParams]);
}

export function appendTrackingParams(url: string): string {
  try {
    const urlObj = new URL(url);
    const gclid = sessionStorage.getItem(`${STORAGE_PREFIX}gclid`);

    if (gclid && !urlObj.searchParams.has("utm_google_click_id")) {
      urlObj.searchParams.set("utm_google_click_id", gclid);
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}
