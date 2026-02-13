import { eq, asc } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { categories, subServices } from "@/lib/db/schema"

export async function getPublishedCategories() {
  const db = getDb()
  return db
    .select()
    .from(categories)
    .where(eq(categories.isPublished, true))
    .orderBy(asc(categories.sortOrder))
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb()
  return db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .get()
}

export async function getCategoryWithSubServices(slug: string) {
  const db = getDb()
  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .get()
  if (!category) return null

  const subs = await db
    .select()
    .from(subServices)
    .where(eq(subServices.categoryId, category.id))
    .orderBy(asc(subServices.sortOrder))

  return { ...category, subServices: subs }
}
