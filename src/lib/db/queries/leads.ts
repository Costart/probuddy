import { nanoid } from "nanoid"
import { desc, count } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { leadSubmissions } from "@/lib/db/schema"

interface CreateLeadInput {
  categorySlug: string
  subServiceSlug?: string
  name: string
  postalCode: string
  jobDescription?: string
  detectedCity?: string
  detectedRegion?: string
}

export async function createLead(input: CreateLeadInput) {
  const db = getDb()
  const id = nanoid()
  await db.insert(leadSubmissions).values({
    id,
    ...input,
  })
  return id
}

export async function getRecentLeads(limit = 50) {
  const db = getDb()
  return db.select().from(leadSubmissions).orderBy(desc(leadSubmissions.createdAt)).limit(limit)
}

export async function getLeadCount() {
  const db = getDb()
  const result = await db.select({ value: count() }).from(leadSubmissions).get()
  return result?.value ?? 0
}
