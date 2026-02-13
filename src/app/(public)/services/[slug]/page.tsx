import Link from "next/link"
import { notFound } from "next/navigation"
import { getCategoryWithSubServices } from "@/lib/db/queries/categories"
import { getPageSections } from "@/lib/db/queries/sections"
import { getGeoData } from "@/lib/geo"
import { FindAProForm } from "@/components/FindAProForm"
import { Card, CardContent } from "@/components/ui/Card"
import { SectionRenderer } from "@/components/sections/SectionRenderer"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryWithSubServices(slug)
  if (!data) return { title: "Service Not Found" }
  return {
    title: `${data.name} Services | FindaPro`,
    description: data.description ?? `Find trusted ${data.name.toLowerCase()} professionals near you.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const data = await getCategoryWithSubServices(slug)
  if (!data) notFound()

  const geo = await getGeoData()
  const sections = await getPageSections("category", data.id)

  function formatPrice(cents: number | null) {
    if (cents === null) return null
    return `\$${(cents / 100).toFixed(0)}`
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-surface to-accent/5 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
            {data.name} Services
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
          <div className="lg:col-span-2 space-y-12">
            {/* Sub-services */}
            {data.subServices.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
                  {data.name} Services We Cover
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.subServices.map((sub) => (
                    <Link key={sub.id} href={`/services/${slug}/${sub.slug}`}>
                      <Card className="h-full hover:shadow-elevation-2 transition-shadow cursor-pointer">
                        <CardContent className="p-5">
                          <h3 className="font-display text-base font-bold text-on-surface mb-1">
                            {sub.name}
                          </h3>
                          {sub.description && (
                            <p className="text-sm text-on-surface-variant line-clamp-2 mb-2">
                              {sub.description}
                            </p>
                          )}
                          {(sub.priceLow !== null || sub.priceHigh !== null) && (
                            <p className="text-sm font-medium text-accent">
                              {formatPrice(sub.priceLow)}
                              {sub.priceLow !== null && sub.priceHigh !== null ? " – " : ""}
                              {formatPrice(sub.priceHigh)}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
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
