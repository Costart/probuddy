import Link from "next/link";
import { getGeoData } from "@/lib/geo";
import { getPublishedCategories } from "@/lib/db/queries/categories";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find a Trusted Pro Near You | ProBuddy",
  description:
    "Connect with reliable, vetted professionals for plumbing, electrical, roofing, painting and more.",
};

export default async function HomePage() {
  const geo = await getGeoData();
  const categories = await getPublishedCategories();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-surface to-accent/5 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface">
            Find a Trusted Pro{geo.city ? ` in ${geo.city}` : " Near You"}
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
            Connect with reliable professionals for your home projects. Get
            quotes, compare prices, and hire with confidence.
          </p>
          {geo.city && (
            <p className="text-sm text-accent font-medium">
              Showing pros near {geo.city}
            </p>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-on-surface mb-8">
          Popular Services
        </h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/services/${cat.slug}`}>
                <Card className="h-full hover:shadow-elevation-2 transition-shadow cursor-pointer overflow-hidden">
                  {cat.imageUrl && (
                    <div className="relative h-40 w-full">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-bold text-on-surface mb-2">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-sm text-on-surface-variant line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant">No services available yet.</p>
        )}
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-surface-container py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-on-surface mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose a Service",
                desc: "Browse our categories and find the type of pro you need.",
              },
              {
                step: "2",
                title: "Describe Your Job",
                desc: "Tell us what you need done and where you are.",
              },
              {
                step: "3",
                title: "Get Matched",
                desc: "We connect you with vetted local professionals who can help.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-display font-bold text-lg flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-bold text-on-surface">
                  {item.title}
                </h3>
                <p className="text-sm text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
