import { NextResponse } from "next/server"
import { generateContent } from "@/lib/ai"
import { getSectionById, updateSection } from "@/lib/db/queries/sections"
import { upsertAiConfig, markGenerated } from "@/lib/db/queries/ai-configs"

export async function POST(request: Request) {
  const body = await request.json()
  const { sectionId, provider, model, prompt, sectionType } = body

  if (!sectionId || !provider || !prompt || !sectionType) {
    return NextResponse.json(
      { error: "sectionId, provider, prompt, and sectionType are required" },
      { status: 400 }
    )
  }

  const section = await getSectionById(sectionId)
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 })
  }

  try {
    // Save/update the AI config
    await upsertAiConfig({ sectionId, provider, model, prompt })

    // Generate content
    const result = await generateContent({ provider, model, prompt, sectionType })

    // Validate JSON
    JSON.parse(result.content)

    // Update the section content
    await updateSection(sectionId, { content: result.content })

    // Mark as generated
    await markGenerated(sectionId)

    return NextResponse.json({ content: result.content })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
