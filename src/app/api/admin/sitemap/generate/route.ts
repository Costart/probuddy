import { NextResponse } from "next/server";
import { generateSitemaps } from "@/lib/sitemap-generator";

export async function POST() {
  try {
    const stats = await generateSitemaps();
    return NextResponse.json({
      success: true,
      message: "Sitemaps generated and uploaded to R2",
      ...stats,
    });
  } catch (error: any) {
    console.error("Sitemap generation failed:", error);
    return NextResponse.json(
      { error: error.message || "Sitemap generation failed" },
      { status: 500 },
    );
  }
}
