import Link from "next/link";
import { getPublishedCategories } from "@/lib/db/queries/categories";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Services",
  description:
    "Browse all home and professional services. Find trusted pros for plumbing, electrical, cleaning, events, tutoring and more.",
};

export default async function ServicesPage() {
  const categories = await getPublishedCategories();

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 via-surface to-accent/5 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
            All Services
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Browse {categories.length} service categories to find the right pro
            for your project.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/services/${cat.slug}`}>
                <Card className="h-full hover:shadow-elevation-2 transition-shadow cursor-pointer overflow-hidden">
                  {cat.imageUrl ? (
                    <div className="relative h-40 w-full">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-primary/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                        />
                      </svg>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-display text-base font-bold text-on-surface mb-1">
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
          <p className="text-on-surface-variant text-center">
            No services available yet.
          </p>
        )}
      </section>
    </div>
  );
}
