import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as any).SITEMAP_BUCKET;

  const obj = await bucket.get("sitemaps/sitemap.xml");
  if (!obj) {
    return new Response("Sitemap not generated yet", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
