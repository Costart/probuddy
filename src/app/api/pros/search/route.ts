import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const THUMBTACK_API_URL = "https://api.thumbtack.com";
const THUMBTACK_TOKEN_URL = "https://auth.thumbtack.com/oauth2/token";

async function getAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(THUMBTACK_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      audience: "urn:partner-api",
      scope: "demand::businesses/search.read",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Thumbtack OAuth error:", response.status, errorText);
    throw new Error("Failed to obtain Thumbtack access token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { query, zipCode, turnstileToken, limit = 10 } = body;

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

  // Verify Turnstile token
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken || "",
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

    const response = await fetch(
      `${THUMBTACK_API_URL}/api/v4/businesses/search-filtered`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuery: query,
          zipCode,
          utmData: {
            utm_source: partnerId,
            utm_medium: "partnership",
          },
          limit,
        }),
      },
    );

    if (!response.ok) {
      console.error("Thumbtack search error:", response.status);
      return NextResponse.json({ businesses: [], metadata: null });
    }

    const data = await response.json();

    const result = {
      businesses: (data.data || []).map((biz: any) => ({
        id: biz.businessID,
        name: biz.businessName,
        introduction: biz.businessIntroduction,
        location: biz.businessLocation,
        imageUrl: biz.businessImageURL,
        rating: biz.rating,
        reviewCount: biz.numberOfReviews,
        featuredReview: biz.featuredReview,
        yearsInBusiness: biz.yearsInBusiness,
        numberOfHires: biz.numberOfHires,
        responseTimeHours: biz.responseTimeHours,
        isTopPro: biz.isTopPro,
        isBackgroundChecked: biz.isBackgroundChecked,
        quote: biz.quote
          ? {
              startingCost: biz.quote.startingCost,
              costUnit: biz.quote.costUnit,
            }
          : null,
        servicePageUrl: biz.servicePageURL,
        requestFlowUrl: biz.widgets?.requestFlowURL,
        pills: biz.pills || [],
      })),
      metadata: data.metadata
        ? {
            categoryName: data.metadata.categoryName,
            location: data.metadata.requestLocation,
          }
        : null,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Thumbtack search failed:", err);
    return NextResponse.json({ businesses: [], metadata: null });
  }
}
