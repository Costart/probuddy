import { eq, and, asc } from "drizzle-orm"
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
