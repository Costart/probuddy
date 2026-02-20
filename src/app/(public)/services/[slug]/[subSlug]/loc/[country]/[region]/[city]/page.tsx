import { notFound } from "next/navigation";
import { getLocationPageForSubServiceRoute } from "@/lib/db/queries/locations";
import { getSubServiceBySlug } from "@/lib/db/queries/sub-services";
import { getPageSections } from "@/lib/db/queries/sections";
import { getGeoData } from "@/lib/geo";
import { ProsList } from "@/components/ProsList";
import { AiBuddyCard } from "@/components/AiBuddyCard";
import { HeroSection } from "@/components/HeroSection";
import { CityName } from "@/components/CityName";
import { SharedPageProvider } from "@/components/SharedPageContext";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { ClarityTags } from "@/components/ClarityTags";
import type { Metadata } from "next";

function unslugify(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface Props {
  params: Promise<{
    slug: string;
    subSlug: string;
    country: string;
    region: string;
    city: string;
  }>;
  searchParams: Promise<{ zip?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subSlug, country, region, city } = await params;
  const data = await getLocationPageForSubServiceRoute(
    slug,
    subSlug,
    country,
    region,
    city,
  );
  if (!data) {
    const sub = await getSubServiceBySlug(slug, subSlug);
    if (!sub) return { title: "Service Not Found" };
    const cityDisplay = unslugify(city);
    const regionDisplay = unslugify(region);
    return {
      title: `${sub.name} in ${cityDisplay}, ${regionDisplay}`,
      description: `Find trusted professionals for ${sub.name.toLowerCase()} in ${cityDisplay}.`,
    };
  }
  return {
    title: `${data.subServiceName} in ${data.location.cityDisplay}, ${data.location.regionDisplay}`,
    description:
      data.location.blurb ??
      `Find trusted professionals for ${data.subServiceName.toLowerCase()} in ${data.location.cityDisplay}.`,
  };
}

export default async function SubServiceLocationPage({
  params,
  searchParams,
}: Props) {
  const { slug, subSlug, country, region, city } = await params;
  const { zip: urlZip } = await searchParams;
  const data = await getLocationPageForSubServiceRoute(
    slug,
    subSlug,
    country,
    region,
    city,
  );

  // Location pages are only created via the zip code flow (/api/locations/generate)
  if (!data) notFound();

  const geo = await getGeoData();
  const {
    location,
    subServiceName,
    subServicePriceLow,
    subServicePriceHigh,
    subServiceDuration,
    categoryId,
    categoryName,
    categorySlug,
  } = data;
  const sections = await getPageSections(location.pageType, location.pageId);

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

  const quickFactsPills =
    subServicePriceLow !== null ||
    subServicePriceHigh !== null ||
    subServiceDuration ? (
      <div className="flex flex-wrap gap-2 mt-4">
        {(subServicePriceLow !== null || subServicePriceHigh !== null) && (
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
            {formatPrice(subServicePriceLow)}
            {subServicePriceLow !== null && subServicePriceHigh !== null
              ? " – "
              : ""}
            {formatPrice(subServicePriceHigh)}
          </span>
        )}
        {subServiceDuration && (
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
            {subServiceDuration}
          </span>
        )}
      </div>
    ) : null;

  const aiBuddyCard = (
    <AiBuddyCard
      categoryName={subServiceName}
      city={location.cityDisplay}
      sectionTypes={sections.map((s) => s.sectionType)}
      pageContext={pageContext}
    />
  );

  return (
    <SharedPageProvider
      initialGeo={{
        lat: location.lat ?? null,
        lon: location.lon ?? null,
        city: location.cityDisplay,
      }}
    >
      <ClarityTags
        pageType="location"
        category={subServiceName}
        city={location.cityDisplay}
      />
      <div>
        {/* Hero */}
        <HeroSection>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">
                {categoryName}
              </p>
              <div className="inline-block">
                <div className="bg-white/75 backdrop-blur-sm rounded-2xl px-5 py-3 md:px-8 md:py-5 shadow-lg">
                  <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
                    {subServiceName}
                    <CityName fallback={location.cityDisplay} />
                  </h1>
                </div>
                <div id="zip-badge-portal" className="mt-1.5 flex justify-end" />
              </div>
              {quickFactsPills}
            </div>
            <div className="hidden lg:block w-full lg:w-[360px] flex-shrink-0">
              {aiBuddyCard}
            </div>
          </div>
        </HeroSection>

        {/* Pros */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <ProsList
            key={`${city}-${urlZip || ""}`}
            serviceName={subServiceName}
            postalCode={urlZip || geo.postalCode}
            city={location.cityDisplay}
            categorySlug={slug}
            categoryId={categoryId}
            locationLat={location.lat}
            locationLon={location.lon}
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
          {location.blurb && (
            <div className="max-w-3xl mt-8">
              <Card className="bg-white shadow-elevation-1 border border-gray-100">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-on-surface mb-2">
                    About {subServiceName} in {location.cityDisplay}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {location.blurb}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </SharedPageProvider>
  );
}
