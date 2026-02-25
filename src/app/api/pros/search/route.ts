import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, and } from "drizzle-orm";
import { getAccessToken, searchThumbtack } from "@/lib/thumbtack";
import { getDb } from "@/lib/db";
import { searchResults } from "@/lib/db/schema";
import { appendApiLog } from "@/lib/api-log";

export async function POST(request: Request) {
  const body = await request.json();
  const { query, zipCode, turnstileToken, categorySlug, limit = 10, cacheOnly } = body;

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

  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  // --- Layer 1: Check KV cache (no Turnstile needed for cached results) ---
  const cache = env.CACHE;
  const cacheKey = `pros:${zipCode}:${categorySlug || query}`;

  if (cache) {
    try {
      const cached = await cache.get(cacheKey, "json");
      if (cached) {
        await appendApiLog(cache, {
          ts: new Date().toISOString(),
          endpoint: "search",
          ms: 0,
          status: "cache",
          detail: "KV hit",
          ip: clientIp,
          zip: zipCode,
        });
        return NextResponse.json(cached);
      }
    } catch {
      // KV read failed — fall through to Thumbtack
    }
  }

  // Cache-only probe: caller just wants to check the cache, no Turnstile needed
  if (cacheOnly) {
    let turnstileRequired = true;
    if (cache && clientIp !== "unknown") {
      try {
        const used = await cache.get(`ratelimit:search:${clientIp}`);
        turnstileRequired = !!used;
      } catch {}
    }
    return NextResponse.json({
      cached: false,
      businesses: [],
      metadata: null,
      turnstileRequired,
    });
  }

  // --- Layer 2: IP rate limit — first search per IP per 30 min is free ---
  let usedFreePass = false;
  const rateLimitKey = `ratelimit:search:${clientIp}`;

  if (cache && clientIp !== "unknown") {
    try {
      const used = await cache.get(rateLimitKey);
      if (!used) {
        usedFreePass = true;
        console.log("[pro-search] IP free pass granted:", clientIp);
      }
    } catch {}
  }

  // --- Layer 3: Require Turnstile if no free pass ---
  if (!usedFreePass) {
    const turnstileSecret = env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Verification required" },
          { status: 403 },
        );
      }
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
  }

  // --- Layer 4: Fetch from Thumbtack API ---
  const clientId = env.THUMBTACK_CLIENT_ID;
  const clientSecret = env.THUMBTACK_CLIENT_SECRET;
  const partnerId = env.THUMBTACK_PARTNER_ID || "cma-highintentlabs";

  if (!clientId || !clientSecret) {
    return NextResponse.json({ businesses: [], metadata: null });
  }

  const thumbtackStart = Date.now();
  try {
    const accessToken = await getAccessToken(clientId, clientSecret, cache);
    const result = await searchThumbtack(accessToken, {
      query,
      zipCode,
      partnerId,
      limit,
    });
    const thumbtackMs = Date.now() - thumbtackStart;
    console.log("[pro-search] Thumbtack responded in", thumbtackMs, "ms,", result.businesses.length, "results");
    await appendApiLog(cache, {
      ts: new Date().toISOString(),
      endpoint: "search",
      ms: thumbtackMs,
      status: "ok",
      detail: `${result.businesses.length} results`,
      ip: clientIp,
      zip: zipCode,
    });

    // Write to KV cache (1 week TTL, fire-and-forget)
    if (cache && result.businesses.length > 0) {
      cache.put(cacheKey, JSON.stringify(result), { expirationTtl: 604800 }).catch(() => {});
      // Record IP rate limit (30 min TTL, fire-and-forget)
      if (usedFreePass) {
        cache.put(rateLimitKey, "1", { expirationTtl: 1800 }).catch(() => {});
      }
    }

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

    return NextResponse.json({ ...result, freePass: usedFreePass || undefined });
  } catch (err) {
    console.error("Thumbtack search failed:", err);
    await appendApiLog(cache, {
      ts: new Date().toISOString(),
      endpoint: "search",
      ms: Date.now() - thumbtackStart,
      status: "error",
      detail: String(err).substring(0, 100),
      ip: clientIp,
      zip: zipCode,
    });
    return NextResponse.json({ businesses: [], metadata: null });
  }
}
