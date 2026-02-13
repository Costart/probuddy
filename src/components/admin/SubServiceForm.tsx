"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface SubService {
  id: string
  categoryId: string
  slug: string
  name: string
  description: string | null
  priceLow: number | null
  priceHigh: number | null
  durationEstimate: string | null
  imageUrl: string | null
  sortOrder: number | null
  isPublished: boolean | null
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export function SubServiceForm({
  subService,
  categories,
}: {
  subService: SubService | null | undefined
  categories: Category[]
}) {
  const router = useRouter()
  const isNew = !subService

  const [categoryId, setCategoryId] = useState(subService?.categoryId ?? categories[0]?.id ?? "")
  const [name, setName] = useState(subService?.name ?? "")
  const [slug, setSlug] = useState(subService?.slug ?? "")
  const [description, setDescription] = useState(subService?.description ?? "")
  const [priceLow, setPriceLow] = useState(subService?.priceLow ? String(subService.priceLow / 100) : "")
  const [priceHigh, setPriceHigh] = useState(subService?.priceHigh ? String(subService.priceHigh / 100) : "")
  const [durationEstimate, setDurationEstimate] = useState(subService?.durationEstimate ?? "")
  const [sortOrder, setSortOrder] = useState(subService?.sortOrder ?? 0)
  const [isPublished, setIsPublished] = useState(subService?.isPublished ?? false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        categoryId,
        name,
        slug,
        description,
        priceLow: priceLow ? Math.round(Number(priceLow) * 100) : null,
        priceHigh: priceHigh ? Math.round(Number(priceHigh) * 100) : null,
        durationEstimate: durationEstimate || null,
        sortOrder,
        isPublished,
      }
      if (isNew) {
        const res = await fetch("/api/admin/sub-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (res.ok) {
          router.push(`/dashboard/sub-services/${data.id}`)
          router.refresh()
        }
      } else {
        await fetch(`/api/admin/sub-services/${subService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this sub-service?")) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/sub-services/${subService!.id}`, { method: "DELETE" })
      router.push("/dashboard/sub-services")
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? "Create Sub-Service" : "Sub-Service Details"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Name"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (isNew) setSlug(autoSlug(e.target.value))
            }}
            placeholder="e.g. Tile Repair"
          />
          <Input
            label="Slug"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. tile-repair"
          />
          <Input
            label="Duration Estimate"
            id="duration"
            value={durationEstimate}
            onChange={(e) => setDurationEstimate(e.target.value)}
            placeholder="e.g. 2-4 hours"
          />
          <Input
            label="Price Low ($)"
            id="priceLow"
            type="number"
            value={priceLow}
            onChange={(e) => setPriceLow(e.target.value)}
            placeholder="e.g. 150"
          />
          <Input
            label="Price High ($)"
            id="priceHigh"
            type="number"
            value={priceHigh}
            onChange={(e) => setPriceHigh(e.target.value)}
            placeholder="e.g. 500"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description</label>
            <textarea
              className="flex w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this sub-service"
            />
          </div>
          <Input
            label="Sort Order"
            id="sortOrder"
            type="number"
            value={String(sortOrder)}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          {!isNew && (
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <label htmlFor="published" className="text-sm font-medium text-on-surface">Published</label>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/50">
          <Button onClick={handleSave} disabled={saving || !name || !slug || !categoryId}>
            {saving ? "Saving..." : isNew ? "Create" : "Save Changes"}
          </Button>
          <Button variant="outlined" onClick={() => router.push("/dashboard/sub-services")}>
            Cancel
          </Button>
          {!isNew && (
            <Button variant="text" className="ml-auto text-error" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
