import { NextResponse } from "next/server"
import { getSubServiceById, updateSubService, deleteSubService } from "@/lib/db/queries/sub-services"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await getSubServiceById(id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await request.json()
  await updateSubService(id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await getSubServiceById(id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await deleteSubService(id)
  return NextResponse.json({ ok: true })
}
