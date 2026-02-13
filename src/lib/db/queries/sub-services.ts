import { eq, and } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { subServices, categories } from "@/lib/db/schema"

export async function getSubServiceBySlug(categorySlug: string, subSlug: string) {
  const db = getDb()
  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .get()
  if (!category) return null

  const subService = await db
    .select()
    .from(subServices)
    .where(and(eq(subServices.categoryId, category.id), eq(subServices.slug, subSlug)))
    .get()
  if (!subService) return null

  return { ...subService, category }
}
