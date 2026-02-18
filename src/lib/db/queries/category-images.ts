import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { categoryImages, categories } from "@/lib/db/schema";

export async function getCategoryImages(categoryId: string) {
  const db = getDb();
  return db
    .select()
    .from(categoryImages)
    .where(eq(categoryImages.categoryId, categoryId))
    .orderBy(categoryImages.createdAt);
}

export async function setActiveImage(categoryId: string, imageId: string) {
  const db = getDb();
  // Deactivate all images for this category
  await db
    .update(categoryImages)
    .set({ isActive: false })
    .where(eq(categoryImages.categoryId, categoryId));
  // Activate the selected one
  await db
    .update(categoryImages)
    .set({ isActive: true })
    .where(
      and(
        eq(categoryImages.id, imageId),
        eq(categoryImages.categoryId, categoryId),
      ),
    );
  // Also update the category's imageUrl so public pages show the selected image
  const selected = await db
    .select()
    .from(categoryImages)
    .where(eq(categoryImages.id, imageId))
    .get();
  if (selected) {
    await db
      .update(categories)
      .set({ imageUrl: selected.imageUrl })
      .where(eq(categories.id, categoryId));
  }
}

export async function deleteImage(imageId: string) {
  const db = getDb();
  await db.delete(categoryImages).where(eq(categoryImages.id, imageId));
}
