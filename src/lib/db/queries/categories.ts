import { eq, asc, count } from "drizzle-orm"
import { nanoid } from "nanoid"
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

export async function getAllCategories() {
  const db = getDb()
  return db.select().from(categories).orderBy(asc(categories.sortOrder))
}

export async function getCategoryById(id: string) {
  const db = getDb()
  return db.select().from(categories).where(eq(categories.id, id)).get()
}

export async function createCategory(data: { name: string; slug: string; description?: string; sortOrder?: number }) {
  const db = getDb()
  const id = nanoid()
  await db.insert(categories).values({ id, ...data })
  return id
}

export async function updateCategory(id: string, data: Partial<{ name: string; slug: string; description: string; imageUrl: string; sortOrder: number; isPublished: boolean }>) {
  const db = getDb()
  await db.update(categories).set(data).where(eq(categories.id, id))
}

export async function deleteCategory(id: string) {
  const db = getDb()
  await db.delete(subServices).where(eq(subServices.categoryId, id))
  await db.delete(categories).where(eq(categories.id, id))
}

export async function getCategoryCount() {
  const db = getDb()
  const result = await db.select({ value: count() }).from(categories).get()
  return result?.value ?? 0
}
