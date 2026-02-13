import { eq, and, asc } from "drizzle-orm"
import { nanoid } from "nanoid"
import { getDb } from "@/lib/db"
import { pageSections } from "@/lib/db/schema"

export async function getPageSections(pageType: string, pageId: string) {
  const db = getDb()
  return db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.pageType, pageType), eq(pageSections.pageId, pageId)))
    .orderBy(asc(pageSections.sortOrder))
}

export async function getSectionById(id: string) {
  const db = getDb()
  return db.select().from(pageSections).where(eq(pageSections.id, id)).get()
}

export async function createSection(data: { pageType: string; pageId: string; sectionType: string; content?: string; sortOrder?: number }) {
  const db = getDb()
  const id = nanoid()
  await db.insert(pageSections).values({ id, ...data })
  return id
}

export async function updateSection(id: string, data: Partial<{ sectionType: string; content: string; sortOrder: number }>) {
  const db = getDb()
  await db.update(pageSections).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(pageSections.id, id))
}

export async function deleteSection(id: string) {
  const db = getDb()
  await db.delete(pageSections).where(eq(pageSections.id, id))
}
