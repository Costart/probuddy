import { NextResponse } from "next/server"
import { getSectionById, updateSection, deleteSection } from "@/lib/db/queries/sections"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await getSectionById(id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await request.json()
  await updateSection(id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await getSectionById(id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await deleteSection(id)
  return NextResponse.json({ ok: true })
}
