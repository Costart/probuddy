import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllCategories } from "@/lib/db/queries/categories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export const metadata = { title: "Manage Categories" }

export default async function CategoriesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const cats = await getAllCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface">Categories</h1>
          <p className="mt-1 text-on-surface-variant">{cats.length} categories</p>
        </div>
        <Link href="/dashboard/categories/new">
          <Button>Add Category</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 text-left text-on-surface-variant">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Published</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((cat) => (
                <tr key={cat.id} className="border-b border-outline-variant/30 hover:bg-surface-container/50">
                  <td className="p-4 font-medium text-on-surface">{cat.name}</td>
                  <td className="p-4 text-on-surface-variant">{cat.slug}</td>
                  <td className="p-4 text-on-surface-variant">{cat.sortOrder}</td>
                  <td className="p-4">
                    <span className={cat.isPublished ? "text-primary font-medium" : "text-outline"}>
                      {cat.isPublished ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/categories/${cat.id}`}>
                      <Button variant="text" size="sm">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {cats.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    No categories yet. Add your first one.
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
