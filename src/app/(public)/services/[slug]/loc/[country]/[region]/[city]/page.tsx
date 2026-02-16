import { notFound } from "next/navigation";
import { getLocationPageForCategoryRoute } from "@/lib/db/queries/locations";
import { getPageSections } from "@/lib/db/queries/sections";
import { getGeoData } from "@/lib/geo";
import { FindAProForm } from "@/components/FindAProForm";
import { MapBackground } from "@/components/MapBackground";
import { AiBuddyCard } from "@/components/AiBuddyCard";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    slug: string;
    country: string;
    region: string;
    city: string;
  }>;
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
    title: `${data.categoryName} in ${data.location.cityDisplay}, ${data.location.regionDisplay} | ProBuddy`,
    description:
      data.location.blurb ??
      `Find trusted ${data.categoryName.toLowerCase()} professionals in ${data.location.cityDisplay}.`,
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug, country, region, city } = await params;
  const data = await getLocationPageForCategoryRoute(
    slug,
    country,
    region,
    city,
  );
  if (!data) notFound();

  const geo = await getGeoData();
  const { location, categoryName, categoryDescription, categoryImageUrl } =
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

  return (
    <div>
      {/* Hero with map background */}
      <section className="relative overflow-hidden bg-gray-100">
        {/* Map tile background */}
        {location.lat && location.lon && (
          <MapBackground lat={location.lat} lon={location.lon} />
        )}
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-32 md:pt-16 md:pb-40">
          <div className="inline-block bg-white/75 backdrop-blur-sm rounded-full px-10 py-6 shadow-lg">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface">
              {categoryName} Services in {location.cityDisplay}
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Reuse parent page sections */}
            <SectionRenderer sections={sections} />
          </div>

          {/* Sidebar */}
          <div className="lg:-mt-52 relative z-10">
            <div className="sticky top-8 space-y-6">
              <AiBuddyCard
                categoryName={categoryName}
                city={location.cityDisplay}
                sectionTypes={sections.map((s) => s.sectionType)}
                pageContext={pageContext}
              />
              {location.blurb && (
                <Card className="bg-white shadow-elevation-1 border border-gray-100">
                  <CardContent className="p-5">
                    <h3 className="font-display font-bold text-on-surface text-sm mb-2">
                      About {categoryName} in {location.cityDisplay}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {location.blurb}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-bold text-on-surface mb-4">
                    Get a Free Quote in {location.cityDisplay}
                  </h2>
                  <FindAProForm geoData={geo} categorySlug={slug} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
