import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const VALID_SEGMENTS = ["static", "services", "us", "us-services"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ segment: string }> },
) {
  const { segment: rawSegment } = await params;

  // Strip .xml extension if present (URL is /sitemap/static.xml but param captures "static.xml")
  const segment = rawSegment.replace(/\.xml$/, "");

  if (!VALID_SEGMENTS.includes(segment)) {
    return new Response("Not found", { status: 404 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as any).SITEMAP_BUCKET;

  const obj = await bucket.get(`sitemaps/${segment}.xml`);
  if (!obj) {
    return new Response("Sitemap segment not generated yet", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
