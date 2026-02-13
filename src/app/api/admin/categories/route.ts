import { NextResponse } from "next/server"
import { getAllCategories, createCategory } from "@/lib/db/queries/categories"

export async function GET() {
  const cats = await getAllCategories()
  return NextResponse.json(cats)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, slug, description, sortOrder } = body
  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 })
  }
  const id = await createCategory({ name, slug, description, sortOrder })
  return NextResponse.json({ id }, { status: 201 })
}
