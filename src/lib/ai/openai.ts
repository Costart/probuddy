import OpenAI from "openai"
import type { GenerateRequest, GenerateResult } from "./index"

export async function generateWithOpenAI(req: GenerateRequest): Promise<GenerateResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const model = req.model || "gpt-4o"

  const systemPrompt = `You are a content generator for a home services website. Generate structured JSON content for a "${req.sectionType}" section. Return ONLY valid JSON, no markdown fences.

Section type formats:
- "content": { "title": "...", "body": "..." }
- "faq": { "title": "...", "items": [{ "question": "...", "answer": "..." }] }
- "pricing": { "title": "...", "items": [{ "item": "...", "lowPrice": "...", "highPrice": "...", "notes": "..." }] }
- "tips": { "title": "...", "items": ["tip1", "tip2", ...] }
- "questions": { "title": "...", "items": ["question1", "question2", ...] }
- "hero": { "title": "...", "subtitle": "..." }
- "image": { "src": "...", "alt": "...", "caption": "..." }`

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: req.prompt },
    ],
    temperature: 0.7,
  })

  const text = response.choices[0]?.message?.content ?? "{}"
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim()

  return { content: cleaned }
}
