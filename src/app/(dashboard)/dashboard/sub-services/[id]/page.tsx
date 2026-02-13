import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSubServiceById } from "@/lib/db/queries/sub-services"
import { getAllCategories } from "@/lib/db/queries/categories"
import { getPageSections } from "@/lib/db/queries/sections"
import { SubServiceForm } from "@/components/admin/SubServiceForm"
import { SectionEditor } from "@/components/admin/SectionEditor"

export const metadata = { title: "Edit Sub-Service" }

export default async function SubServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const isNew = id === "new"
  const [subService, allCategories] = await Promise.all([
    isNew ? Promise.resolve(null) : getSubServiceById(id),
    getAllCategories(),
  ])
  if (!isNew && !subService) redirect("/dashboard/sub-services")

  const sections = isNew ? [] : await getPageSections("sub_service", id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface">
          {isNew ? "New Sub-Service" : `Edit: ${subService!.name}`}
        </h1>
      </div>

      <SubServiceForm subService={subService} categories={allCategories} />

      {!isNew && (
        <SectionEditor
          pageType="sub_service"
          pageId={id}
          sections={sections}
        />
      )}
    </div>
  )
}
