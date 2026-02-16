import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubServiceBySlug } from "@/lib/db/queries/sub-services";
import { getPageSections } from "@/lib/db/queries/sections";
import { getLocationPage } from "@/lib/db/queries/locations";
import { getGeoData, slugify } from "@/lib/geo";
import { FindAProForm } from "@/components/FindAProForm";
import { LocationCard } from "@/components/LocationCard";
import { MapBackground } from "@/components/MapBackground";
import { AiBuddyCard } from "@/components/AiBuddyCard";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; subSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const data = await getSubServiceBySlug(slug, subSlug);
  if (!data) return { title: "Service Not Found" };
  return {
    title: `${data.name} | ${data.category.name} | ProBuddy`,
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

  function formatPrice(cents: number | null) {
    if (cents === null) return null;
    return `\$${(cents / 100).toFixed(0)}`;
  }

  const heroImage = data.imageUrl || data.category.imageUrl;

  return (
    <div>
      {/* Hero */}
      {locationData ? (
        <section className="relative overflow-hidden bg-gray-100">
          {/* Map tile background */}
          {locationData.lat && locationData.lon && (
            <MapBackground lat={locationData.lat} lon={locationData.lon} />
          )}
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-32 md:pt-16 md:pb-40">
            <div className="inline-block bg-white/75 backdrop-blur-sm rounded-full px-10 py-6 shadow-lg">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface">
                {data.name} in {locationData.cityDisplay}
              </h1>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-br from-primary/5 via-surface to-accent/5 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-sm font-medium text-accent uppercase tracking-wider">
              {data.category.name}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              {data.name}
              {geo.city ? ` in ${geo.city}` : " Near You"}
            </h1>
            {data.description && (
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
                {data.description}
              </p>
            )}
            {geo.city && (
              <p className="text-sm text-accent font-medium">
                Showing pros near {geo.city}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Facts */}
            {(data.priceLow !== null ||
              data.priceHigh !== null ||
              data.durationEstimate) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.priceLow !== null || data.priceHigh !== null) && (
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm text-on-surface-variant mb-1">
                        Estimated Cost
                      </p>
                      <p className="font-display text-2xl font-bold text-on-surface">
                        {formatPrice(data.priceLow)}
                        {data.priceLow !== null && data.priceHigh !== null
                          ? " – "
                          : ""}
                        {formatPrice(data.priceHigh)}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {data.durationEstimate && (
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm text-on-surface-variant mb-1">
                        Estimated Duration
                      </p>
                      <p className="font-display text-2xl font-bold text-on-surface">
                        {data.durationEstimate}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Page Sections */}
            <SectionRenderer sections={sections} />

            {/* Hidden location generator — triggers creation for next visit */}
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

          {/* Sidebar */}
          <div className="lg:-mt-52 relative z-10">
            <div className="sticky top-8 space-y-6">
              <AiBuddyCard
                categoryName={data.name}
                city={geo.city}
                sectionTypes={sections.map((s) => s.sectionType)}
                pageContext={pageContext}
              />
              {locationData?.blurb && (
                <Card className="bg-white shadow-elevation-1 border border-gray-100">
                  <CardContent className="p-5">
                    <h3 className="font-display font-bold text-on-surface text-sm mb-2">
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
              )}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-bold text-on-surface mb-4">
                    Get a Free Quote
                  </h2>
                  <FindAProForm
                    geoData={geo}
                    categorySlug={slug}
                    subServiceSlug={subSlug}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
