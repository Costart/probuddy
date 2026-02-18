import { desc, eq, count, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { searchResults } from "@/lib/db/schema";

export async function getSearchResults(limit = 200) {
  const db = getDb();
  return db
    .select()
    .from(searchResults)
    .orderBy(desc(searchResults.searchedAt))
    .limit(limit);
}

export async function getSearchResultCount() {
  const db = getDb();
  const result = await db
    .select({ value: count() })
    .from(searchResults)
    .get();
  return result?.value ?? 0;
}

export async function getCoverageSummary() {
  const db = getDb();
  return db
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
}
