import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCategoryCount } from "@/lib/db/queries/categories";
import { getSubServiceCount } from "@/lib/db/queries/sub-services";

import { GenerateSitemapButton } from "@/components/admin/GenerateSitemapButton";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [catCount, subCount] = await Promise.all([
    getCategoryCount(),
    getSubServiceCount(),
  ]);

  const stats = [
    { label: "Categories", value: catCount, href: "/dashboard/categories" },
    { label: "Sub-Services", value: subCount, href: "/dashboard/sub-services" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Manage your ProBuddy services and content.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-elevation-2 transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-4xl font-bold text-primary">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Sitemap */}
      <Card>
        <CardHeader>
          <CardTitle>Sitemap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-on-surface-variant">
            Generate XML sitemaps for search engines. Includes categories,
            sub-services, and location pages with verified pro coverage.
          </p>
          <GenerateSitemapButton />
        </CardContent>
      </Card>
    </div>
  );
}
