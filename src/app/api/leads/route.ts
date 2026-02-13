import { NextRequest, NextResponse } from "next/server"
import { createLead } from "@/lib/db/queries/leads"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categorySlug, subServiceSlug, name, postalCode, jobDescription, detectedCity, detectedRegion } = body

    if (!categorySlug || !name || !postalCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const id = await createLead({
      categorySlug,
      subServiceSlug,
      name,
      postalCode,
      jobDescription,
      detectedCity,
      detectedRegion,
    })

    return NextResponse.json({ id, status: "submitted" })
  } catch (error) {
    console.error("Failed to create lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
