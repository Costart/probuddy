import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { searchResults } from "@/lib/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug");

  const db = getDb();

  if (categorySlug) {
    // All zip codes for a specific category
    const rows = await db
      .select({
        zipCode: searchResults.zipCode,
        thumbtackCategory: searchResults.thumbtackCategory,
        resultCount: searchResults.resultCount,
        searchedAt: searchResults.searchedAt,
      })
      .from(searchResults)
      .where(eq(searchResults.categorySlug, categorySlug))
      .orderBy(desc(searchResults.resultCount));

    return NextResponse.json({
      categorySlug,
      totalZips: rows.length,
      zipsWithResults: rows.filter((r) => r.resultCount > 0).length,
      rows,
    });
  }

  // Summary across all categories
  const summary = await db
    .select({
      categorySlug: searchResults.categorySlug,
      thumbtackCategory: searchResults.thumbtackCategory,
      totalZips: sql<number>`count(*)`,
      zipsWithResults: sql<number>`sum(case when ${searchResults.resultCount} > 0 then 1 else 0 end)`,
      avgResultCount: sql<number>`round(avg(${searchResults.resultCount}), 1)`,
    })
    .from(searchResults)
    .groupBy(searchResults.categorySlug)
    .orderBy(searchResults.categorySlug);

  return NextResponse.json({ summary });
}
