import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getApiLogs } from "@/lib/api-log";

export async function GET() {
  let env: any;
  try {
    const ctx = await getCloudflareContext({ async: true });
    env = ctx.env;
  } catch {
    env = process.env;
  }

  const logs = await getApiLogs(env.CACHE);
  return NextResponse.json(logs);
}
