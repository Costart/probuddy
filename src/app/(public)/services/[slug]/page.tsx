import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryWithSubServices } from "@/lib/db/queries/categories";
import { getPageSections } from "@/lib/db/queries/sections";
import { getLocationPage } from "@/lib/db/queries/locations";
import { getGeoData, slugify } from "@/lib/geo";
import { ProsList } from "@/components/ProsList";
import { LocationCard } from "@/components/LocationCard";
import { AiBuddyCard } from "@/components/AiBuddyCard";
import { HeroSection } from "@/components/HeroSection";
import { CityName } from "@/components/CityName";
import { SharedPageProvider } from "@/components/SharedPageContext";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { ClarityTags } from "@/components/ClarityTags";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryWithSubServices(slug);
  if (!data) return { title: "Service Not Found" };
  return {
    title: `${data.name} Services`,
    description:
      data.description ??
      `Find trusted ${data.name.toLowerCase()} professionals near you.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryWithSubServices(slug);
  if (!data) notFound();

  const geo = await getGeoData();
  const sections = await getPageSections("category", data.id);

  // Look up existing location data server-side
  const countrySlugged = geo.country?.toLowerCase() ?? "";
  const regionSlugged = slugify(geo.regionCode || geo.region || "");
  const citySlugged = slugify(geo.city || "");
  const locationData =
    geo.city && geo.country && geo.region
      ? await getLocationPage(
          "category",
          data.id,
          countrySlugged,
          regionSlugged,
          citySlugged,
        )
      : null;

  const locationUrl = locationData
    ? `/services/${slug}/loc/${countrySlugged}/${regionSlugged}/${citySlugged}`
    : null;

  // Build context string for AI chat
  const pageContext = sections
    .map((s) => {
      try {
        if (!s.content) return s.sectionType;
        const parsed = JSON.parse(s.content);
        const title = parsed.title || s.sectionType;
        if (s.sectionType === "pricing" && parsed.items) {
          return `${title}: ${parsed.items.map((i: any) => `${i.name || i.item} ($${((i.priceLow || i.lowPrice || 0) / 100).toFixed(0)}-$${((i.priceHigh || i.highPrice || 0) / 100).toFixed(0)})`).join(", ")}`;
        }
        if (s.sectionType === "faq" && parsed.items) {
          return `${title}: ${parsed.items.map((i: any) => i.question).join("; ")}`;
        }
        if (s.sectionType === "tips" && parsed.tips) {
          return `${title}: ${parsed.tips.join("; ")}`;
        }
        if (parsed.text) return `${title}: ${parsed.text.slice(0, 200)}`;
        return title;
      } catch {
        return s.sectionType;
      }
    })
    .join("\n");

  // Use location data coordinates, or fall back to Cloudflare geo coordinates
  const mapLat = locationData?.lat ?? geo.latitude;
  const mapLon = locationData?.lon ?? geo.longitude;
  const cityDisplay = locationData?.cityDisplay ?? geo.city;

  const aiBuddyCard = (
    <AiBuddyCard
      categoryName={data.name}
      city={geo.city}
      sectionTypes={sections.map((s) => s.sectionType)}
      pageContext={pageContext}
    />
  );

  return (
    <SharedPageProvider
      initialGeo={{
        lat: mapLat ?? null,
        lon: mapLon ?? null,
        city: cityDisplay ?? null,
      }}
    >
      <ClarityTags
        pageType="category"
        category={data.name}
        city={cityDisplay ?? undefined}
      />
      <div>
        {/* Hero — reactive map via SharedPageContext */}
        <HeroSection>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-8">
            <div className="flex-1 min-w-0">
              <div className="inline-block bg-white/75 backdrop-blur-sm rounded-2xl px-5 py-3 md:px-8 md:py-5 shadow-lg">
                <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
                  {data.name} Services
                  <CityName fallback={cityDisplay ?? undefined} />
                </h1>
              </div>
              {data.description && (
                <p className="text-base text-on-surface-variant mt-3 max-w-2xl line-clamp-2">
                  {data.description}
                </p>
              )}
            </div>
            <div className="hidden lg:block w-full lg:w-[360px] flex-shrink-0">
              {aiBuddyCard}
            </div>
          </div>
        </HeroSection>

        {/* Pros — right after hero */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <ProsList
            serviceName={data.name}
            postalCode={geo.postalCode}
            city={geo.city}
            categorySlug={slug}
            locationLat={mapLat}
            locationLon={mapLon}
          />
        </div>

        {/* AI Buddy — mobile only (below pros) */}
        <div className="lg:hidden max-w-7xl mx-auto px-6 pb-6">
          {aiBuddyCard}
        </div>

        {/* Sections + Location */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="max-w-4xl space-y-8">
            <SectionRenderer sections={sections} />
          </div>

          {/* Location blurb */}
          {locationData?.blurb && (
            <div className="max-w-3xl mt-8">
              <Card className="bg-white shadow-elevation-1 border border-gray-100">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-on-surface mb-2">
                    About {data.name} in {locationData.cityDisplay}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                    {locationData.blurb}
                  </p>
                  {locationUrl && (
                    <Link
                      href={locationUrl}
                      className="text-sm text-primary hover:text-primary-hover underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors font-medium"
                    >
                      Full {data.name.toLowerCase()} guide for{" "}
                      {locationData.cityDisplay} →
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Hidden location generator */}
          {!locationData && geo.city && geo.country && geo.region && (
            <div className="hidden">
              <LocationCard
                pageType="category"
                pageId={data.id}
                pageName={data.name}
                categorySlug={slug}
                country={geo.country}
                region={geo.region}
                regionCode={geo.regionCode}
                city={geo.city}
                countrySlugged={countrySlugged}
                regionSlugged={regionSlugged}
                citySlugged={citySlugged}
              />
            </div>
          )}

          {/* Sub-services — text links at bottom */}
          {data.subServices.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-display text-lg font-bold text-on-surface mb-4">
                {data.name} Services
              </h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {data.subServices.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/services/${slug}/${sub.slug}`}
                    className="text-sm text-primary hover:text-primary-hover underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SharedPageProvider>
  );
}
