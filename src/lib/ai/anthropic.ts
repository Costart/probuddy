import Anthropic from "@anthropic-ai/sdk"
import type { GenerateRequest, GenerateResult } from "./index"

export async function generateWithAnthropic(req: GenerateRequest): Promise<GenerateResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const model = req.model || "claude-sonnet-4-5-20250929"

  const systemPrompt = `You are a content generator for a home services website. Generate structured JSON content for a "${req.sectionType}" section. Return ONLY valid JSON, no markdown fences.

Section type formats:
- "content": { "title": "...", "body": "..." }
- "faq": { "title": "...", "items": [{ "question": "...", "answer": "..." }] }
- "pricing": { "title": "...", "items": [{ "item": "...", "lowPrice": "...", "highPrice": "...", "notes": "..." }] }
- "tips": { "title": "...", "items": ["tip1", "tip2", ...] }
- "questions": { "title": "...", "items": ["question1", "question2", ...] }
- "hero": { "title": "...", "subtitle": "..." }
- "image": { "src": "...", "alt": "...", "caption": "..." }`

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: req.prompt }],
  })

  const text = response.content[0]?.type === "text" ? response.content[0].text : "{}"
  const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim()

  return { content: cleaned }
}
