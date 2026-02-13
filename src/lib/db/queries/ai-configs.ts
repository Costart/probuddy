import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { getDb } from "@/lib/db"
import { aiConfigs } from "@/lib/db/schema"

export async function getAiConfigBySectionId(sectionId: string) {
  const db = getDb()
  return db
    .select()
    .from(aiConfigs)
    .where(eq(aiConfigs.sectionId, sectionId))
    .get()
}

export async function upsertAiConfig(data: {
  sectionId: string
  provider: string
  model?: string
  prompt: string
}) {
  const db = getDb()
  const existing = await getAiConfigBySectionId(data.sectionId)
  if (existing) {
    await db
      .update(aiConfigs)
      .set({
        provider: data.provider,
        model: data.model ?? null,
        prompt: data.prompt,
      })
      .where(eq(aiConfigs.id, existing.id))
    return existing.id
  } else {
    const id = nanoid()
    await db.insert(aiConfigs).values({
      id,
      sectionId: data.sectionId,
      provider: data.provider,
      model: data.model ?? null,
      prompt: data.prompt,
    })
    return id
  }
}

export async function markGenerated(sectionId: string) {
  const db = getDb()
  const config = await getAiConfigBySectionId(sectionId)
  if (config) {
    await db
      .update(aiConfigs)
      .set({ lastGeneratedAt: new Date().toISOString() })
      .where(eq(aiConfigs.id, config.id))
  }
}

export async function deleteAiConfig(sectionId: string) {
  const db = getDb()
  await db.delete(aiConfigs).where(eq(aiConfigs.sectionId, sectionId))
}
