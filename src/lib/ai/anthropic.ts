import Anthropic from "@anthropic-ai/sdk";
import type { GenerateRequest, GenerateResult } from "./index";

export async function generateWithAnthropic(
  req: GenerateRequest,
): Promise<GenerateResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = req.model || "claude-sonnet-4-5-20250929";

  const systemPrompt = `You are a content generator for ProBuddy, a home services website that connects homeowners with trusted local professionals. Generate structured JSON content for a "${req.sectionType}" section.

CRITICAL RULES:
- Return ONLY the flat JSON object — no wrapping in {type, content}, {section}, or any outer object.
- No markdown fences, no explanation, no extra text.
- Use real, specific service names and realistic prices — never use generic placeholders like "Service Item 1".
- Use the local currency based on the location in the prompt. UK = £, US = $, Europe = €, etc. If no location, default to $.

The JSON must match EXACTLY one of these formats:
- "content": { "title": "...", "text": "..." }
- "faq": { "title": "...", "items": [{ "question": "...", "answer": "..." }] }
- "pricing": { "title": "...", "items": [{ "name": "...", "priceLow": 10000, "priceHigh": 30000, "note": "..." }] } (prices in cents)
- "tips": { "title": "...", "tips": ["tip1", "tip2", ...] }
- "questions": { "title": "...", "questions": ["question1", "question2", ...] }
- "hero": { "title": "...", "subtitle": "..." }
- "image": { "url": "...", "alt": "...", "caption": "..." }`;

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: req.prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "{}";
  const cleaned = text
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();

  return { content: cleaned };
}
