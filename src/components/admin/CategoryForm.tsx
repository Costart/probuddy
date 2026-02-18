"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImagePicker } from "@/components/admin/ImagePicker";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number | null;
  isPublished: boolean | null;
  createdAt: string;
}

export function CategoryForm({
  category,
}: {
  category: Category | null | undefined;
}) {
  const router = useRouter();
  const isNew = !category;

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0);
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  const [isPublished, setIsPublished] = useState(
    category?.isPublished ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function autoSlug(val: string) {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, description, sortOrder }),
        });
        const data = await res.json();
        if (res.ok) {
          router.push(`/dashboard/categories/${data.id}`);
          router.refresh();
        }
      } else {
        await fetch(`/api/admin/categories/${category.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            description,
            imageUrl: imageUrl || null,
            sortOrder,
            isPublished,
          }),
        });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this category and all its sub-services?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/categories/${category!.id}`, {
        method: "DELETE",
      });
      router.push("/dashboard/categories");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? "Create Category" : "Category Details"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (isNew) setSlug(autoSlug(e.target.value));
            }}
            placeholder="e.g. Plumber"
          />
          <Input
            label="Slug"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. plumber"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Description
            </label>
            <textarea
              className="flex w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this trade category"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Image URL"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Category preview"
                className="mt-2 h-24 w-36 object-cover rounded-lg border border-outline-variant"
              />
            )}
          </div>
          {!isNew && (
            <div className="md:col-span-2">
              <ImagePicker
                categoryId={category.id}
                onImageChange={(url) => setImageUrl(url ?? "")}
              />
            </div>
          )}
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
              <label
                htmlFor="published"
                className="text-sm font-medium text-on-surface"
              >
                Published
              </label>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/50">
          <Button onClick={handleSave} disabled={saving || !name || !slug}>
            {saving ? "Saving..." : isNew ? "Create" : "Save Changes"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/dashboard/categories")}
          >
            Cancel
          </Button>
          {!isNew && (
            <Button
              variant="text"
              className="ml-auto text-error"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
