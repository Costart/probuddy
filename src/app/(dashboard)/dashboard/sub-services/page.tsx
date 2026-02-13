import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllSubServices } from "@/lib/db/queries/sub-services"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export const metadata = { title: "Manage Sub-Services" }

export default async function SubServicesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const subs = await getAllSubServices()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface">Sub-Services</h1>
          <p className="mt-1 text-on-surface-variant">{subs.length} sub-services</p>
        </div>
        <Link href="/dashboard/sub-services/new">
          <Button>Add Sub-Service</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 text-left text-on-surface-variant">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price Range</th>
                <th className="p-4 font-medium">Published</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => (
                <tr key={sub.id} className="border-b border-outline-variant/30 hover:bg-surface-container/50">
                  <td className="p-4 font-medium text-on-surface">{sub.name}</td>
                  <td className="p-4 text-on-surface-variant">{sub.category?.name ?? "—"}</td>
                  <td className="p-4 text-on-surface-variant">
                    {sub.priceLow && sub.priceHigh
                      ? `$${(sub.priceLow / 100).toFixed(0)} – $${(sub.priceHigh / 100).toFixed(0)}`
                      : "—"}
                  </td>
                  <td className="p-4">
                    <span className={sub.isPublished ? "text-primary font-medium" : "text-outline"}>
                      {sub.isPublished ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/sub-services/${sub.id}`}>
                      <Button variant="text" size="sm">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    No sub-services yet. Add your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
