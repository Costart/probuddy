const THUMBTACK_API_URL = "https://api.thumbtack.com";
const THUMBTACK_TOKEN_URL = "https://auth.thumbtack.com/oauth2/token";

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  cache?: any,
): Promise<string> {
  // Check KV cache for existing token
  if (cache) {
    try {
      const cached = await cache.get("thumbtack:token");
      if (cached) return cached;
    } catch {
      // KV read failed — fetch fresh token
    }
  }

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

  // Cache token in KV (25 min TTL — tokens typically last 30 min)
  if (cache && data.access_token) {
    const ttl = Math.max((data.expires_in || 1800) - 300, 60);
    cache.put("thumbtack:token", data.access_token, { expirationTtl: ttl }).catch(() => {});
  }

  return data.access_token;
}

export interface ThumbtackSearchParams {
  query: string;
  zipCode: string;
  partnerId: string;
  limit?: number;
}

export interface ThumbtackBusiness {
  id: string;
  name: string;
  introduction: string | null;
  location: string | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  featuredReview: string | null;
  yearsInBusiness: number | null;
  numberOfHires: number | null;
  responseTimeHours: number | null;
  isTopPro: boolean;
  isBackgroundChecked: boolean;
  quote: { startingCost: string; costUnit: string } | null;
  servicePageUrl: string | null;
  requestFlowUrl: string | null;
  pills: string[];
}

export interface ThumbtackSearchResult {
  businesses: ThumbtackBusiness[];
  metadata: {
    categoryID: string;
    categoryName: string;
    location: string;
  } | null;
}

export async function searchThumbtack(
  accessToken: string,
  params: ThumbtackSearchParams,
): Promise<ThumbtackSearchResult> {
  const response = await fetch(
    `${THUMBTACK_API_URL}/api/v4/businesses/search-filtered`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userQuery: params.query,
        zipCode: params.zipCode,
        utmData: {
          utm_source: params.partnerId,
          utm_medium: "partnership",
        },
        limit: params.limit || 10,
      }),
    },
  );

  if (!response.ok) {
    console.error("Thumbtack search error:", response.status);
    return { businesses: [], metadata: null };
  }

  const data = await response.json();

  return {
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
          categoryID: data.metadata.categoryID,
          categoryName: data.metadata.categoryName,
          location: data.metadata.requestLocation,
        }
      : null,
  };
}
