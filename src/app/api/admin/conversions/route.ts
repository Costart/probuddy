import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getConversionStats } from "@/lib/conversion-stats";

export async function GET() {
  let env: any;
  try {
    const ctx = await getCloudflareContext({ async: true });
    env = ctx.env;
  } catch {
    env = process.env;
  }

  const today = new Date().toISOString().slice(0, 10);
  const stats = await getConversionStats(env.CACHE, today);
  return NextResponse.json(stats);
}
