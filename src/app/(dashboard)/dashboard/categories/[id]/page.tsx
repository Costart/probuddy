import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCategoryById } from "@/lib/db/queries/categories"
import { getPageSections } from "@/lib/db/queries/sections"
import { CategoryForm } from "@/components/admin/CategoryForm"
import { SectionEditor } from "@/components/admin/SectionEditor"

export const metadata = { title: "Edit Category" }

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const isNew = id === "new"
  const category = isNew ? null : await getCategoryById(id)
  if (!isNew && !category) redirect("/dashboard/categories")

  const sections = isNew ? [] : await getPageSections("category", id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface">
          {isNew ? "New Category" : `Edit: ${category!.name}`}
        </h1>
      </div>

      <CategoryForm category={category} />

      {!isNew && (
        <SectionEditor
          pageType="category"
          pageId={id}
          sections={sections}
        />
      )}
    </div>
  )
}
