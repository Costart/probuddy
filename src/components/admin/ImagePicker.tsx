"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface CategoryImage {
  id: string;
  categoryId: string;
  imageUrl: string;
  label: string | null;
  isActive: boolean | null;
  createdAt: string;
}

export function ImagePicker({
  categoryId,
  onImageChange,
}: {
  categoryId: string;
  onImageChange?: (imageUrl: string | null) => void;
}) {
  const [images, setImages] = useState<CategoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/categories/${categoryId}/images`)
      .then((r) => r.json())
      .then((data) => {
        setImages(data);
        setLoading(false);
      });
  }, [categoryId]);

  async function handleSelect(imageId: string) {
    setSetting(imageId);
    const res = await fetch(`/api/admin/categories/${categoryId}/images`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    const data = await res.json();
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isActive: img.id === imageId,
      })),
    );
    if (data.imageUrl && onImageChange) {
      onImageChange(data.imageUrl);
    }
    setSetting(null);
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(
      `/api/admin/categories/${categoryId}/images?imageId=${imageId}`,
      { method: "DELETE" },
    );
    const wasActive = images.find((img) => img.id === imageId)?.isActive;
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    if (wasActive && onImageChange) {
      onImageChange(null);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-on-surface-variant py-4">
        Loading images...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-sm text-on-surface-variant py-4">
        No generated images yet.
      </div>
    );
  }

  const activeImage = images.find((img) => img.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-on-surface">
          Generated Images ({images.length})
        </h4>
        {activeImage && (
          <span className="text-xs text-on-surface-variant">
            Active: {activeImage.label ?? "unlabeled"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
              img.isActive
                ? "border-primary shadow-elevation-2"
                : "border-transparent hover:border-outline-variant"
            }`}
          >
            <img
              src={img.imageUrl}
              alt={img.label ?? "Category image"}
              className="w-full aspect-[3/2] object-cover"
            />
            {img.isActive && (
              <div className="absolute top-1.5 left-1.5 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                ACTIVE
              </div>
            )}
            {img.label && (
              <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {img.label}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-1.5">
                {!img.isActive && (
                  <Button
                    size="sm"
                    onClick={() => handleSelect(img.id)}
                    disabled={setting === img.id}
                  >
                    {setting === img.id ? "..." : "Use"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outlined"
                  className="bg-white/90"
                  onClick={() => handleDelete(img.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
