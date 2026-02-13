import { NextResponse } from "next/server"
import { getPageSections, createSection } from "@/lib/db/queries/sections"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageType = searchParams.get("pageType")
  const pageId = searchParams.get("pageId")
  if (!pageType || !pageId) {
    return NextResponse.json({ error: "pageType and pageId are required" }, { status: 400 })
  }
  const sections = await getPageSections(pageType, pageId)
  return NextResponse.json(sections)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { pageType, pageId, sectionType, content, sortOrder } = body
  if (!pageType || !pageId || !sectionType) {
    return NextResponse.json({ error: "pageType, pageId, and sectionType are required" }, { status: 400 })
  }
  const id = await createSection({ pageType, pageId, sectionType, content, sortOrder })
  return NextResponse.json({ id }, { status: 201 })
}
