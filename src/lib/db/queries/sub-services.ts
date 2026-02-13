import { eq, and, asc, count } from "drizzle-orm"
import { nanoid } from "nanoid"
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

export async function getAllSubServices() {
  const db = getDb()
  const subs = await db.select().from(subServices).orderBy(asc(subServices.sortOrder))
  const cats = await db.select().from(categories)
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]))
  return subs.map((s) => ({ ...s, category: catMap[s.categoryId] }))
}

export async function getSubServiceById(id: string) {
  const db = getDb()
  return db.select().from(subServices).where(eq(subServices.id, id)).get()
}

export async function createSubService(data: { categoryId: string; name: string; slug: string; description?: string; priceLow?: number; priceHigh?: number; durationEstimate?: string; sortOrder?: number }) {
  const db = getDb()
  const id = nanoid()
  await db.insert(subServices).values({ id, ...data })
  return id
}

export async function updateSubService(id: string, data: Partial<{ categoryId: string; name: string; slug: string; description: string; priceLow: number; priceHigh: number; durationEstimate: string; imageUrl: string; sortOrder: number; isPublished: boolean }>) {
  const db = getDb()
  await db.update(subServices).set(data).where(eq(subServices.id, id))
}

export async function deleteSubService(id: string) {
  const db = getDb()
  await db.delete(subServices).where(eq(subServices.id, id))
}

export async function getSubServiceCount() {
  const db = getDb()
  const result = await db.select({ value: count() }).from(subServices).get()
  return result?.value ?? 0
}
