import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { appendConversionEvent } from "@/lib/conversion-stats";
import type { ConversionEventType } from "@/lib/conversion-stats";

export async function POST(request: Request) {
  try {
    const { type, categorySlug } = (await request.json()) as {
      type: string;
      categorySlug: string;
    };

    if (!type || !categorySlug || !["visit", "conversion"].includes(type)) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    let env: any;
    try {
      const ctx = await getCloudflareContext({ async: true });
      env = ctx.env;
    } catch {
      env = process.env;
    }

    await appendConversionEvent(
      env.CACHE,
      type as ConversionEventType,
      categorySlug,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
