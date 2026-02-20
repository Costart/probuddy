import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubServiceBySlug } from "@/lib/db/queries/sub-services";
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
  params: Promise<{ slug: string; subSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const data = await getSubServiceBySlug(slug, subSlug);
  if (!data) return { title: "Service Not Found" };
  return {
    title: `${data.name} | ${data.category.name}`,
    description:
      data.description ??
      `Find trusted professionals for ${data.name.toLowerCase()}.`,
  };
}

export default async function SubServicePage({ params }: Props) {
  const { slug, subSlug } = await params;
  const data = await getSubServiceBySlug(slug, subSlug);
  if (!data) notFound();

  const geo = await getGeoData();
  const sections = await getPageSections("sub_service", data.id);

  // Look up existing location data server-side
  const countrySlugged = geo.country?.toLowerCase() ?? "";
  const regionSlugged = slugify(geo.regionCode || geo.region || "");
  const citySlugged = slugify(geo.city || "");
  const locationData =
    geo.city && geo.country && geo.region
      ? await getLocationPage(
          "sub_service",
          data.id,
          countrySlugged,
          regionSlugged,
          citySlugged,
        )
      : null;

  const locationUrl = locationData
    ? `/services/${slug}/${subSlug}/loc/${countrySlugged}/${regionSlugged}/${citySlugged}`
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

  function formatPrice(cents: number | null) {
    if (cents === null) return null;
    return `\$${(cents / 100).toFixed(0)}`;
  }

  // Use location data coordinates, or fall back to Cloudflare geo coordinates
  const mapLat = locationData?.lat ?? geo.latitude;
  const mapLon = locationData?.lon ?? geo.longitude;
  const cityDisplay = locationData?.cityDisplay ?? geo.city;

  const quickFactsPills =
    data.priceLow !== null ||
    data.priceHigh !== null ||
    data.durationEstimate ? (
      <div className="flex flex-wrap gap-2 mt-4">
        {(data.priceLow !== null || data.priceHigh !== null) && (
          <span className="inline-flex items-center gap-1.5 bg-white/85 backdrop-blur-sm rounded-full px-4 py-2 shadow-md text-sm font-semibold text-on-surface">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {formatPrice(data.priceLow)}
            {data.priceLow !== null && data.priceHigh !== null ? " – " : ""}
            {formatPrice(data.priceHigh)}
          </span>
        )}
        {data.durationEstimate && (
          <span className="inline-flex items-center gap-1.5 bg-white/85 backdrop-blur-sm rounded-full px-4 py-2 shadow-md text-sm font-semibold text-on-surface">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {data.durationEstimate}
          </span>
        )}
      </div>
    ) : null;

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
        pageType="sub-service"
        category={data.name}
        city={cityDisplay ?? undefined}
      />
      <div>
        {/* Hero — reactive map via SharedPageContext */}
        <HeroSection>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">
                {data.category.name}
              </p>
              <div className="inline-block">
                <div className="bg-white/75 backdrop-blur-sm rounded-2xl px-5 py-3 md:px-8 md:py-5 shadow-lg">
                  <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
                    {data.name}
                    <CityName fallback={cityDisplay ?? undefined} />
                  </h1>
                </div>
                <div id="zip-badge-portal" className="mt-1.5 flex justify-end" />
              </div>
              {data.description && (
                <p className="text-base text-on-surface-variant mt-3 max-w-2xl line-clamp-2">
                  {data.description}
                </p>
              )}
              {quickFactsPills}
            </div>
            <div className="hidden lg:block w-full lg:w-[360px] flex-shrink-0">
              {aiBuddyCard}
            </div>
          </div>
        </HeroSection>

        {/* Pros — full width */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <ProsList
            serviceName={data.name}
            postalCode={geo.postalCode}
            city={geo.city}
            categorySlug={slug}
            categoryId={data.category.id}
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
                      Full {data.category.name.toLowerCase()} guide for{" "}
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
                pageType="sub_service"
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
        </div>
      </div>
    </SharedPageProvider>
  );
}
