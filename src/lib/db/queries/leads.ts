import { nanoid } from "nanoid"
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
