import { NextResponse } from "next/server"
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/db/queries/categories"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await getCategoryById(id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await request.json()
  await updateCategory(id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await getCategoryById(id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await deleteCategory(id)
  return NextResponse.json({ ok: true })
}
