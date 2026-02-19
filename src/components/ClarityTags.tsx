"use client";

import { useEffect } from "react";
import { clarityTag } from "@/lib/clarity";

interface ClarityTagsProps {
  pageType: string;
  category?: string;
  city?: string;
}

/** Sets Clarity custom tags for the current page. Render once per page. */
export function ClarityTags({ pageType, category, city }: ClarityTagsProps) {
  useEffect(() => {
    clarityTag("pageType", pageType);
    if (category) clarityTag("category", category);
    if (city) clarityTag("city", city);
  }, [pageType, category, city]);

  return null;
}
