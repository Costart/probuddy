import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import { locationPages, categories, subServices } from "@/lib/db/schema";

export async function getLocationPage(
  pageType: string,
  pageId: string,
  country: string,
  region: string,
  city: string,
) {
  const db = getDb();
  return db
    .select()
    .from(locationPages)
    .where(
      and(
        eq(locationPages.pageType, pageType),
        eq(locationPages.pageId, pageId),
        eq(locationPages.country, country),
        eq(locationPages.region, region),
        eq(locationPages.city, city),
      ),
    )
    .get();
}

export async function getLocationPageForCategoryRoute(
  categorySlug: string,
  country: string,
  region: string,
  city: string,
) {
  const db = getDb();
  const rows = await db
    .select({
      location: locationPages,
      categoryName: categories.name,
      categoryDescription: categories.description,
      categoryImageUrl: categories.imageUrl,
    })
    .from(locationPages)
    .innerJoin(categories, eq(locationPages.pageId, categories.id))
    .where(
      and(
        eq(locationPages.pageType, "category"),
        eq(categories.slug, categorySlug),
        eq(locationPages.country, country),
        eq(locationPages.region, region),
        eq(locationPages.city, city),
      ),
    )
    .get();
  return rows ?? null;
}

export async function getLocationPageForSubServiceRoute(
  categorySlug: string,
  subServiceSlug: string,
  country: string,
  region: string,
  city: string,
) {
  const db = getDb();
  const rows = await db
    .select({
      location: locationPages,
      subServiceName: subServices.name,
      subServiceDescription: subServices.description,
      subServicePriceLow: subServices.priceLow,
      subServicePriceHigh: subServices.priceHigh,
      subServiceDuration: subServices.durationEstimate,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(locationPages)
    .innerJoin(subServices, eq(locationPages.pageId, subServices.id))
    .innerJoin(categories, eq(subServices.categoryId, categories.id))
    .where(
      and(
        eq(locationPages.pageType, "sub_service"),
        eq(categories.slug, categorySlug),
        eq(subServices.slug, subServiceSlug),
        eq(locationPages.country, country),
        eq(locationPages.region, region),
        eq(locationPages.city, city),
      ),
    )
    .get();
  return rows ?? null;
}

interface CreateLocationInput {
  pageType: string;
  pageId: string;
  country: string;
  region: string;
  city: string;
  cityDisplay: string;
  regionDisplay: string;
  countryDisplay: string;
  blurb?: string;
  mapUrl?: string;
  lat?: string;
  lon?: string;
}

export async function createLocationPage(data: CreateLocationInput) {
  const db = getDb();
  const id = nanoid();
  await db.insert(locationPages).values({ id, ...data });
  return id;
}
