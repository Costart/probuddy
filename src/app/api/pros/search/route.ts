import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, and } from "drizzle-orm";
import { getAccessToken, searchThumbtack } from "@/lib/thumbtack";
import { getDb } from "@/lib/db";
import { searchResults } from "@/lib/db/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const { query, zipCode, turnstileToken, categorySlug, limit = 10 } = body;

  if (!query || !zipCode || !/^\d{5}$/.test(zipCode)) {
    return NextResponse.json({ businesses: [], metadata: null });
  }

  let env: any;
  try {
    const ctx = await getCloudflareContext({ async: true });
    env = ctx.env;
  } catch {
    env = process.env;
  }

  // Verify Turnstile token (skip if no token provided)
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && turnstileToken) {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
      },
    );
    const verification = await verifyRes.json();
    if (!verification.success) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 403 },
      );
    }
  }

  const clientId = env.THUMBTACK_CLIENT_ID;
  const clientSecret = env.THUMBTACK_CLIENT_SECRET;
  const partnerId = env.THUMBTACK_PARTNER_ID || "cma-highintentlabs";

  if (!clientId || !clientSecret) {
    return NextResponse.json({ businesses: [], metadata: null });
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret);
    const result = await searchThumbtack(accessToken, {
      query,
      zipCode,
      partnerId,
      limit,
    });

    // Log search result to database (fire-and-forget)
    if (categorySlug) {
      try {
        const db = getDb();
        const existing = await db
          .select({ id: searchResults.id })
          .from(searchResults)
          .where(
            and(
              eq(searchResults.zipCode, zipCode),
              eq(searchResults.categorySlug, categorySlug),
            ),
          )
          .get();

        if (existing) {
          await db
            .update(searchResults)
            .set({
              query,
              thumbtackCategory: result.metadata?.categoryName || null,
              thumbtackCategoryId: result.metadata?.categoryID || null,
              requestLocation: result.metadata?.location || null,
              resultCount: result.businesses.length,
              searchedAt: new Date().toISOString(),
            })
            .where(eq(searchResults.id, existing.id));
        } else {
          const { nanoid } = await import("nanoid");
          await db.insert(searchResults).values({
            id: nanoid(),
            zipCode,
            query,
            categorySlug,
            thumbtackCategory: result.metadata?.categoryName || null,
            thumbtackCategoryId: result.metadata?.categoryID || null,
            requestLocation: result.metadata?.location || null,
            resultCount: result.businesses.length,
          });
        }
      } catch (dbErr) {
        console.error("Failed to log search result:", dbErr);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Thumbtack search failed:", err);
    return NextResponse.json({ businesses: [], metadata: null });
  }
}
