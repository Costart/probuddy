import { notFound } from "next/navigation";
import { getLocationPageForCategoryRoute } from "@/lib/db/queries/locations";
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
    country: string;
    region: string;
    city: string;
  }>;
  searchParams: Promise<{ zip?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, country, region, city } = await params;
  const data = await getLocationPageForCategoryRoute(
    slug,
    country,
    region,
    city,
  );
  if (!data) return { title: "Location Not Found" };
  return {
    title: `${data.categoryName} in ${data.location.cityDisplay}, ${data.location.regionDisplay}`,
    description:
      data.location.blurb ??
      `Find trusted ${data.categoryName.toLowerCase()} professionals in ${data.location.cityDisplay}.`,
  };
}

export default async function LocationPage({ params, searchParams }: Props) {
  const { slug, country, region, city } = await params;
  const { zip: urlZip } = await searchParams;
  const data = await getLocationPageForCategoryRoute(slug, country, region, city);

  // Location pages are only created via the zip code flow (/api/locations/generate)
  if (!data) notFound();

  const geo = await getGeoData();
  const { location, categoryId, categoryName, categoryDescription, categoryImageUrl } =
    data;
  const sections = await getPageSections(location.pageType, location.pageId);
  const displayLocation = `${location.cityDisplay}, ${location.regionDisplay}`;

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

  const aiBuddyCard = (
    <AiBuddyCard
      categoryName={categoryName}
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
        category={categoryName}
        city={location.cityDisplay}
      />
      <div>
        {/* Hero — reactive map via SharedPageContext */}
        <HeroSection>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-8">
            <div className="flex-1 min-w-0">
              <div className="inline-block bg-white/75 backdrop-blur-sm rounded-2xl px-5 py-3 md:px-8 md:py-5 shadow-lg">
                <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
                  {categoryName} Services
                  <CityName fallback={location.cityDisplay} />
                </h1>
              </div>
            </div>
            <div className="hidden lg:block w-full lg:w-[360px] flex-shrink-0">
              {aiBuddyCard}
            </div>
          </div>
        </HeroSection>

        {/* Pros — full width */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <ProsList
            key={`${city}-${urlZip || ""}`}
            serviceName={categoryName}
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
                    About {categoryName} in {location.cityDisplay}
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
