import { NextResponse } from "next/server"
import { getAiConfigBySectionId } from "@/lib/db/queries/ai-configs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sectionId = searchParams.get("sectionId")
  if (!sectionId) {
    return NextResponse.json({ error: "sectionId required" }, { status: 400 })
  }
  const config = await getAiConfigBySectionId(sectionId)
  return NextResponse.json(config ?? null)
}
