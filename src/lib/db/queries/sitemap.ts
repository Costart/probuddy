import { eq, and, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { categories, subServices, searchResults } from "@/lib/db/schema";

/** Published category slugs for sitemap */
export async function getSitemapCategories() {
  const db = getDb();
  return db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.isPublished, true));
}

/** Published sub-service slugs with parent category slug */
export async function getSitemapSubServices() {
  const db = getDb();
  const subs = await db
    .select({
      slug: subServices.slug,
      categoryId: subServices.categoryId,
    })
    .from(subServices)
    .where(eq(subServices.isPublished, true));

  const cats = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(eq(categories.isPublished, true));

  const catMap = new Map(cats.map((c) => [c.id, c.slug]));

  return subs
    .filter((s) => catMap.has(s.categoryId))
    .map((s) => ({
      slug: s.slug,
      categorySlug: catMap.get(s.categoryId)!,
    }));
}

/**
 * Get covered zip × category combos from organic search data.
 * Only returns rows where result_count >= minResults
 * and the zip code is one of the seed city zips.
 */
export async function getCoveredCityCategories(
  minResults: number,
  cityZips: string[],
) {
  if (cityZips.length === 0) return [];
  const db = getDb();
  return db
    .select({
      zipCode: searchResults.zipCode,
      categorySlug: searchResults.categorySlug,
    })
    .from(searchResults)
    .where(
      and(
        gte(searchResults.resultCount, minResults),
        inArray(searchResults.zipCode, cityZips),
        sql`${searchResults.categorySlug} IS NOT NULL`,
      ),
    );
}
