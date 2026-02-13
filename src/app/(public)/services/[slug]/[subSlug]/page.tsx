import { notFound } from "next/navigation"
import { getSubServiceBySlug } from "@/lib/db/queries/sub-services"
import { getPageSections } from "@/lib/db/queries/sections"
import { getGeoData } from "@/lib/geo"
import { FindAProForm } from "@/components/FindAProForm"
import { Card, CardContent } from "@/components/ui/Card"
import { SectionRenderer } from "@/components/sections/SectionRenderer"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string; subSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subSlug } = await params
  const data = await getSubServiceBySlug(slug, subSlug)
  if (!data) return { title: "Service Not Found" }
  return {
    title: `${data.name} | ${data.category.name} | FindaPro`,
    description: data.description ?? `Find trusted professionals for ${data.name.toLowerCase()}.`,
  }
}

export default async function SubServicePage({ params }: Props) {
  const { slug, subSlug } = await params
  const data = await getSubServiceBySlug(slug, subSlug)
  if (!data) notFound()

  const geo = await getGeoData()
  const sections = await getPageSections("sub_service", data.id)

  function formatPrice(cents: number | null) {
    if (cents === null) return null
    return `\$${(cents / 100).toFixed(0)}`
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-surface to-accent/5 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-sm font-medium text-accent uppercase tracking-wider">
            {data.category.name}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
            {data.name}
          </h1>
          {data.description && (
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
              {data.description}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Facts */}
            {(data.priceLow !== null || data.priceHigh !== null || data.durationEstimate) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(data.priceLow !== null || data.priceHigh !== null) && (
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm text-on-surface-variant mb-1">Estimated Cost</p>
                      <p className="font-display text-2xl font-bold text-on-surface">
                        {formatPrice(data.priceLow)}
                        {data.priceLow !== null && data.priceHigh !== null ? " – " : ""}
                        {formatPrice(data.priceHigh)}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {data.durationEstimate && (
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm text-on-surface-variant mb-1">Estimated Duration</p>
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
          </div>

          {/* Sidebar with Form */}
          <div>
            <div className="sticky top-8">
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
  )
}
