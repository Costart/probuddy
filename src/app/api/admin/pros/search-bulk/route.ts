import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getAccessToken, searchThumbtack } from "@/lib/thumbtack";
import { getDb } from "@/lib/db";
import { searchResults } from "@/lib/db/schema";

const MAX_ZIPS_PER_REQUEST = 50;
const DEFAULT_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    zipCodes,
    query,
    categorySlug,
    delayMs = DEFAULT_DELAY_MS,
  } = body as {
    zipCodes: string[];
    query: string;
    categorySlug?: string;
    delayMs?: number;
  };

  if (!query || !Array.isArray(zipCodes) || zipCodes.length === 0) {
    return NextResponse.json(
      { error: "query and zipCodes[] are required" },
      { status: 400 },
    );
  }

  // Validate zip codes
  const validZips = zipCodes.filter((z) => /^\d{5}$/.test(z));
  if (validZips.length === 0) {
    return NextResponse.json(
      { error: "No valid 5-digit zip codes provided" },
      { status: 400 },
    );
  }

  if (validZips.length > MAX_ZIPS_PER_REQUEST) {
    return NextResponse.json(
      {
        error: `Max ${MAX_ZIPS_PER_REQUEST} zip codes per request (got ${validZips.length})`,
      },
      { status: 400 },
    );
  }

  const delay = Math.max(1000, delayMs); // minimum 1 second between requests

  let env: any;
  try {
    const ctx = await getCloudflareContext({ async: true });
    env = ctx.env;
  } catch {
    env = process.env;
  }

  const clientId = env.THUMBTACK_CLIENT_ID;
  const clientSecret = env.THUMBTACK_CLIENT_SECRET;
  const partnerId = env.THUMBTACK_PARTNER_ID || "cma-highintentlabs";

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Thumbtack credentials not configured" },
      { status: 500 },
    );
  }

  // Get one token for the entire batch
  const accessToken = await getAccessToken(clientId, clientSecret);
  const db = getDb();

  const results: {
    zipCode: string;
    resultCount: number;
    thumbtackCategory: string | null;
  }[] = [];

  for (let i = 0; i < validZips.length; i++) {
    const zipCode = validZips[i];

    // Delay between requests (skip before the first one)
    if (i > 0) {
      await sleep(delay);
    }

    try {
      const searchResult = await searchThumbtack(accessToken, {
        query,
        zipCode,
        partnerId,
        limit: 30,
      });

      const thumbtackCategory = searchResult.metadata?.categoryName || null;
      const thumbtackCategoryId = searchResult.metadata?.categoryID || null;
      const requestLocation = searchResult.metadata?.location || null;
      const resultCount = searchResult.businesses.length;

      // Upsert into searchResults
      const slug = categorySlug || null;
      const existing = slug
        ? await db
            .select({ id: searchResults.id })
            .from(searchResults)
            .where(
              and(
                eq(searchResults.zipCode, zipCode),
                eq(searchResults.categorySlug, slug),
              ),
            )
            .get()
        : null;

      if (existing) {
        await db
          .update(searchResults)
          .set({
            query,
            thumbtackCategory,
            thumbtackCategoryId,
            requestLocation,
            resultCount,
            searchedAt: new Date().toISOString(),
          })
          .where(eq(searchResults.id, existing.id));
      } else {
        await db.insert(searchResults).values({
          id: nanoid(),
          zipCode,
          query,
          categorySlug: slug,
          thumbtackCategory,
          thumbtackCategoryId,
          requestLocation,
          resultCount,
        });
      }

      results.push({ zipCode, resultCount, thumbtackCategory });
    } catch (err) {
      console.error(`Bulk search failed for zip ${zipCode}:`, err);
      results.push({ zipCode, resultCount: -1, thumbtackCategory: null });
    }
  }

  return NextResponse.json({
    searched: results.length,
    delayMs: delay,
    results,
  });
}
