import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface GeoData {
  postalCode: string | null;
  city: string | null;
  region: string | null;
  regionCode: string | null;
  country: string | null;
}

export async function getGeoData(): Promise<GeoData> {
  try {
    const { cf } = await getCloudflareContext({ async: true });
    return {
      postalCode: (cf as any)?.postalCode ?? null,
      city: (cf as any)?.city ?? null,
      region: (cf as any)?.region ?? null,
      regionCode: (cf as any)?.regionCode ?? null,
      country: (cf as any)?.country ?? null,
    };
  } catch {
    return {
      postalCode: null,
      city: null,
      region: null,
      regionCode: null,
      country: null,
    };
  }
}

/**
 * Build an array of OSM tile URLs forming a grid around the given lat/lon.
 * Returns { tiles, cols } where tiles is a flat array of URLs and cols is the grid width.
 */
export function getMapTileGrid(
  lat: number,
  lon: number,
  zoom = 10,
  cols = 10,
  rows = 4,
): { tiles: string[]; cols: number; offsetX: number; offsetY: number } {
  const n = Math.pow(2, zoom);

  // Exact fractional tile coordinates for the center point
  const exactX = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const exactY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

  const centerX = Math.floor(exactX);
  const centerY = Math.floor(exactY);

  // Pixel offset within the center tile (0-256)
  const pixelOffsetX = (exactX - centerX) * 256;
  const pixelOffsetY = (exactY - centerY) * 256;

  // How much to shift the grid so the city point is centered
  // Grid center pixel = (cols/2) * 256, city is at tile (cols/2) + pixelOffsetX
  const offsetX = Math.round(
    (cols / 2) * 256 - (Math.floor(cols / 2) * 256 + pixelOffsetX),
  );
  const offsetY = Math.round(
    (rows / 2) * 256 - (Math.floor(rows / 2) * 256 + pixelOffsetY),
  );

  const startX = centerX - Math.floor(cols / 2);
  const startY = centerY - Math.floor(rows / 2);

  const tiles: string[] = [];
  const servers = ["a", "b", "c", "d"];
  for (let dy = 0; dy < rows; dy++) {
    for (let dx = 0; dx < cols; dx++) {
      const server = servers[(dy * cols + dx) % 4];
      tiles.push(
        `https://${server}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/${zoom}/${startX + dx}/${startY + dy}.png`,
      );
    }
  }
  return { tiles, cols, offsetX, offsetY };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
