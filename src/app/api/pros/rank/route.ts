import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface BusinessInput {
  id: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  yearsInBusiness: number | null;
  numberOfHires: number | null;
  introduction: string | null;
  featuredReview: string | null;
  isBackgroundChecked: boolean;
  isTopPro: boolean;
  pills: string[];
}

export async function POST(request: Request) {
  try {
    const { businesses, query, zipCode, categorySlug, turnstileToken } =
      (await request.json()) as {
        businesses: BusinessInput[];
        query: string;
        zipCode: string;
        categorySlug?: string;
        turnstileToken?: string;
      };

    if (!businesses?.length || !query) {
      return NextResponse.json(null);
    }

    let env: any;
    try {
      const ctx = await getCloudflareContext({ async: true });
      env = ctx.env;
    } catch {
      env = process.env;
    }

    // Require Turnstile token presence — bots don't get AI ranking.
    // Don't re-verify server-side: tokens are single-use and already
    // verified by /api/pros/search. Just check the client sent one.
    if (env.TURNSTILE_SECRET_KEY && !turnstileToken) {
      return NextResponse.json(null);
    }

    // --- Check KV cache for existing ranking ---
    const cache = env.CACHE;
    const cacheKey = categorySlug
      ? `rank:${zipCode}:${categorySlug}:${query}`
      : null;

    if (cache && cacheKey) {
      try {
        const cached = await cache.get(cacheKey, "json");
        if (cached) {
          console.log("[Rank] Cache hit:", cacheKey);
          return NextResponse.json(cached);
        }
      } catch {
        // KV read failed — fall through to Gemini
      }
    }

    const apiKey = env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(null);
    }

    // --- Daily call counter (safety cap: ~$10/day max) ---
    const DAILY_CAP = 14000; // 1,500 free + ~12,500 paid ≈ $10
    const today = new Date().toISOString().slice(0, 10);
    const counterKey = `gemini:counter:${today}`;

    if (cache) {
      try {
        const count = parseInt((await cache.get(counterKey)) || "0", 10);
        if (count >= DAILY_CAP) {
          console.log("[Rank] Daily cap reached:", count);
          return NextResponse.json(null);
        }
      } catch {
        // KV read failed — proceed anyway
      }
    }

    const toRank = businesses;

    // Use short IDs in prompt to save tokens, map back after
    const shortIdToReal = new Map<string, string>();
    const prosDescription = toRank
      .map((p, i) => {
        const shortId = `p${i + 1}`;
        shortIdToReal.set(shortId, p.id);

        const badges = [
          p.isTopPro && "Top Pro",
          p.isBackgroundChecked && "BG Checked",
        ].filter(Boolean);
        const tags = p.pills?.length ? `Tags: ${p.pills.join(", ")}` : "";
        const meta = [
          `${p.rating ?? "?"}/5 (${p.reviewCount ?? 0} reviews)`,
          p.yearsInBusiness ? `${p.yearsInBusiness} yrs` : null,
          `${p.numberOfHires ?? 0} hires`,
          ...badges,
          tags,
        ]
          .filter(Boolean)
          .join(" | ");

        let desc = `[${shortId}] ${p.name}\n${meta}`;
        if (p.introduction) {
          desc += `\nIntro: ${p.introduction.substring(0, 120)}`;
        }
        if (p.featuredReview) {
          desc += `\nReview: ${p.featuredReview.substring(0, 120)}`;
        }
        return desc;
      })
      .join("\n\n");

    const prompt = `Rank these pros for a customer looking for "${query}" in ${zipCode}:

${prosDescription}

Rank by relevance to the job, rating, experience, hires, and review content.
For each pro, write a short reason (1 sentence) explaining why they're a good match.

Respond with JSON:
{"rankings":[{"id":"p1","reason":"why this pro is good for this job"}]}`;

    console.log(
      "[Rank] Prompt length:",
      prompt.length,
      "ranking",
      toRank.length,
      "pros",
    );

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 3000,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        "[Rank] Gemini API error:",
        res.status,
        errText.substring(0, 200),
      );
      return NextResponse.json(null);
    }

    const geminiData = await res.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      console.log("[Rank] No text in response");
      return NextResponse.json(null);
    }

    console.log("[Rank] Gemini response:", text.substring(0, 300));

    const parsed = JSON.parse(text);

    if (!parsed.rankings || !Array.isArray(parsed.rankings)) {
      return NextResponse.json(null);
    }

    // Map short IDs back to real Thumbtack IDs
    const rankings = parsed.rankings.map(
      (r: { id: string; reason?: string }) => ({
        id: shortIdToReal.get(r.id) || r.id,
        reason: r.reason || "",
      }),
    );

    const result = { rankings };

    // Increment daily counter (fire-and-forget)
    if (cache) {
      cache
        .get(counterKey)
        .then((val: string | null) => {
          const count = parseInt(val || "0", 10) + 1;
          return cache.put(counterKey, String(count), {
            expirationTtl: 86400,
          });
        })
        .catch(() => {});
    }

    // Write to KV cache (1 week TTL, fire-and-forget)
    if (cache && cacheKey) {
      cache
        .put(cacheKey, JSON.stringify(result), { expirationTtl: 604800 })
        .catch(() => {});
    }

    console.log(
      "[Rank] Success, top 3:",
      rankings.slice(0, 3).map((r: any) => r.id),
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Rank] Error:", error);
    return NextResponse.json(null);
  }
}
