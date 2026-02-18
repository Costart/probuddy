import { NextResponse } from "next/server";
import { getCategoryById } from "@/lib/db/queries/categories";
import {
  getCategoryImages,
  setActiveImage,
  deleteImage,
} from "@/lib/db/queries/category-images";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const images = await getCategoryImages(id);
  return NextResponse.json(images);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { imageId } = await request.json();
  if (!imageId)
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  await setActiveImage(id, imageId);
  const images = await getCategoryImages(id);
  const active = images.find((img) => img.isActive);
  return NextResponse.json({ ok: true, imageUrl: active?.imageUrl ?? null });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("imageId");
  if (!imageId)
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  await deleteImage(imageId);
  return NextResponse.json({ ok: true });
}
