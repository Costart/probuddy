import { getCloudflareContext } from "@opennextjs/cloudflare"

export interface GeoData {
  postalCode: string | null
  city: string | null
  region: string | null
  country: string | null
}

export async function getGeoData(): Promise<GeoData> {
  try {
    const { cf } = await getCloudflareContext({ async: true })
    return {
      postalCode: (cf as any)?.postalCode ?? null,
      city: (cf as any)?.city ?? null,
      region: (cf as any)?.region ?? null,
      country: (cf as any)?.country ?? null,
    }
  } catch {
    return { postalCode: null, city: null, region: null, country: null }
  }
}
