import { getCloudflareContext } from "@opennextjs/cloudflare";
import { US_CITIES, ZIP_TO_CITY } from "@/lib/data/us-cities";
import {
  getSitemapCategories,
  getSitemapSubServices,
  getCoveredCityCategories,
} from "@/lib/db/queries/sitemap";

const BASE_URL = "https://probuddy.ai";
const MIN_RESULTS = 3;
const R2_PREFIX = "sitemaps";

function xmlHeader() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n`;
}

function urlEntry(
  loc: string,
  priority: number,
  changefreq: string,
  lastmod?: string,
) {
  return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>\n`;
}

function wrapUrlset(entries: string) {
  return `${xmlHeader()}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}</urlset>\n`;
}

function sitemapIndexEntry(loc: string) {
  const lastmod = new Date().toISOString().split("T")[0];
  return `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>\n`;
}

function wrapSitemapIndex(entries: string) {
  return `${xmlHeader()}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}</sitemapindex>\n`;
}

/** Build the static segment: homepage, /services, and all category pages */
async function buildStaticXml(categorySlugs: string[]) {
  let entries = "";
  entries += urlEntry(`${BASE_URL}/`, 1.0, "weekly");
  entries += urlEntry(`${BASE_URL}/services`, 0.9, "weekly");
  for (const slug of categorySlugs) {
    entries += urlEntry(`${BASE_URL}/services/${slug}`, 0.8, "weekly");
  }
  return wrapUrlset(entries);
}

/** Build the services segment: all sub-service pages */
async function buildServicesXml(
  subServices: { slug: string; categorySlug: string }[],
) {
  let entries = "";
  for (const sub of subServices) {
    entries += urlEntry(
      `${BASE_URL}/services/${sub.categorySlug}/${sub.slug}`,
      0.7,
      "monthly",
    );
  }
  return wrapUrlset(entries);
}

/** Build US category × location pages (only covered combos) */
function buildUsXml(
  coveredCombos: {
    citySlug: string;
    regionSlug: string;
    categorySlug: string;
  }[],
) {
  let entries = "";
  for (const combo of coveredCombos) {
    entries += urlEntry(
      `${BASE_URL}/services/${combo.categorySlug}/loc/us/${combo.regionSlug}/${combo.citySlug}`,
      0.6,
      "monthly",
    );
  }
  return wrapUrlset(entries);
}

/** Build US sub-service × location pages (inherit coverage from category) */
function buildUsServicesXml(
  coveredCombos: {
    citySlug: string;
    regionSlug: string;
    categorySlug: string;
  }[],
  subServices: { slug: string; categorySlug: string }[],
) {
  // Group sub-services by category for fast lookup
  const subsByCategory = new Map<string, { slug: string }[]>();
  for (const sub of subServices) {
    const list = subsByCategory.get(sub.categorySlug) || [];
    list.push({ slug: sub.slug });
    subsByCategory.set(sub.categorySlug, list);
  }

  let entries = "";
  for (const combo of coveredCombos) {
    const subs = subsByCategory.get(combo.categorySlug) || [];
    for (const sub of subs) {
      entries += urlEntry(
        `${BASE_URL}/services/${combo.categorySlug}/${sub.slug}/loc/us/${combo.regionSlug}/${combo.citySlug}`,
        0.5,
        "monthly",
      );
    }
  }
  return wrapUrlset(entries);
}

/** Build the sitemap index pointing to all segments */
function buildIndexXml(segments: string[]) {
  let entries = "";
  for (const segment of segments) {
    entries += sitemapIndexEntry(`${BASE_URL}/sitemap/${segment}.xml`);
  }
  return wrapSitemapIndex(entries);
}

/**
 * Generate all sitemap XML files and upload to R2.
 * Returns stats about generated URLs per segment.
 */
export async function generateSitemaps() {
  const { env } = getCloudflareContext();
  const bucket = (env as any).SITEMAP_BUCKET;

  // Query DB
  const categorySlugs = (await getSitemapCategories()).map((c) => c.slug);
  const subServicesList = await getSitemapSubServices();
  const cityZips = US_CITIES.map((c) => c.zip);
  const coveredRows = await getCoveredCityCategories(MIN_RESULTS, cityZips);

  // Map zip codes back to seed cities, build covered combos
  const coveredCombos: {
    citySlug: string;
    regionSlug: string;
    categorySlug: string;
  }[] = [];
  for (const row of coveredRows) {
    const city = ZIP_TO_CITY.get(row.zipCode);
    if (city && row.categorySlug) {
      coveredCombos.push({
        citySlug: city.citySlug,
        regionSlug: city.regionSlug,
        categorySlug: row.categorySlug,
      });
    }
  }

  // Build XML for each segment
  const staticXml = await buildStaticXml(categorySlugs);
  const servicesXml = await buildServicesXml(subServicesList);
  const usXml = buildUsXml(coveredCombos);
  const usServicesXml = buildUsServicesXml(coveredCombos, subServicesList);

  // Determine which segments to include in the index
  const segments: string[] = ["static", "services"];
  if (coveredCombos.length > 0) {
    segments.push("us", "us-services");
  }
  const indexXml = buildIndexXml(segments);

  // Upload to R2
  await bucket.put(`${R2_PREFIX}/sitemap.xml`, indexXml, {
    httpMetadata: { contentType: "application/xml" },
  });
  await bucket.put(`${R2_PREFIX}/static.xml`, staticXml, {
    httpMetadata: { contentType: "application/xml" },
  });
  await bucket.put(`${R2_PREFIX}/services.xml`, servicesXml, {
    httpMetadata: { contentType: "application/xml" },
  });
  if (coveredCombos.length > 0) {
    await bucket.put(`${R2_PREFIX}/us.xml`, usXml, {
      httpMetadata: { contentType: "application/xml" },
    });
    await bucket.put(`${R2_PREFIX}/us-services.xml`, usServicesXml, {
      httpMetadata: { contentType: "application/xml" },
    });
  }

  // Count URLs per segment (rough count based on <url> tags)
  const countUrls = (xml: string) => (xml.match(/<url>/g) || []).length;

  return {
    segments: segments.length,
    static: countUrls(staticXml),
    services: countUrls(servicesXml),
    us: countUrls(usXml),
    usServices: countUrls(usServicesXml),
    coveredCities: new Set(coveredCombos.map((c) => c.citySlug)).size,
    coveredCategories: new Set(coveredCombos.map((c) => c.categorySlug)).size,
  };
}
