import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { generateContent } from "@/lib/ai";
import { getDb } from "@/lib/db";
import { categories, subServices } from "@/lib/db/schema";
import { getSectionById, updateSection } from "@/lib/db/queries/sections";
import { upsertAiConfig, markGenerated } from "@/lib/db/queries/ai-configs";

async function resolveTopicName(
  pageType: string,
  pageId: string,
): Promise<string | null> {
  const db = getDb();
  if (pageType === "category") {
    const row = await db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.id, pageId))
      .get();
    return row?.name ?? null;
  }
  if (pageType === "sub_service") {
    const row = await db
      .select({ name: subServices.name })
      .from(subServices)
      .where(eq(subServices.id, pageId))
      .get();
    return row?.name ?? null;
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { sectionId, provider, model, prompt, sectionType } = body;

  if (!sectionId || !provider || !prompt || !sectionType) {
    return NextResponse.json(
      { error: "sectionId, provider, prompt, and sectionType are required" },
      { status: 400 },
    );
  }

  const section = await getSectionById(sectionId);
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  try {
    // Save/update the AI config (store template with {{topic}})
    await upsertAiConfig({ sectionId, provider, model, prompt });

    // Resolve {{topic}} to the actual service/category name
    const topicName = await resolveTopicName(section.pageType, section.pageId);
    const resolvedPrompt = topicName
      ? prompt.replace(/\{\{topic\}\}/g, topicName)
      : prompt;

    // Generate content
    const result = await generateContent({
      provider,
      model,
      prompt: resolvedPrompt,
      sectionType,
    });

    // Validate JSON
    JSON.parse(result.content);

    // Update the section content
    await updateSection(sectionId, { content: result.content });

    // Mark as generated
    await markGenerated(sectionId);

    return NextResponse.json({ content: result.content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
