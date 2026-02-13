import { NextResponse } from "next/server"
import { getAllSubServices, createSubService } from "@/lib/db/queries/sub-services"

export async function GET() {
  const subs = await getAllSubServices()
  return NextResponse.json(subs)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { categoryId, name, slug, description, priceLow, priceHigh, durationEstimate, sortOrder } = body
  if (!categoryId || !name || !slug) {
    return NextResponse.json({ error: "categoryId, name, and slug are required" }, { status: 400 })
  }
  const id = await createSubService({ categoryId, name, slug, description, priceLow, priceHigh, durationEstimate, sortOrder })
  return NextResponse.json({ id }, { status: 201 })
}
