import { GoogleGenerativeAI } from "@google/generative-ai"
import type { GenerateRequest, GenerateResult } from "./index"

export async function generateWithGemini(req: GenerateRequest): Promise<GenerateResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not set")

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: req.model || "gemini-2.5-flash" })

  const systemPrompt = `You are a content generator for ProBuddy, a US-based home services website that connects homeowners with trusted local professionals. Generate structured JSON content for a "${req.sectionType}" section. Return ONLY valid JSON, no markdown fences, no explanation.

Section type formats:
- "content": { "title": "...", "body": "..." }
- "faq": { "title": "...", "items": [{ "question": "...", "answer": "..." }] }
- "pricing": { "title": "...", "items": [{ "item": "...", "lowPrice": "...", "highPrice": "...", "notes": "..." }] }
- "tips": { "title": "...", "items": ["tip1", "tip2", ...] }
- "questions": { "title": "...", "items": ["question1", "question2", ...] }
- "hero": { "title": "...", "subtitle": "..." }
- "image": { "src": "...", "alt": "...", "caption": "..." }

All prices should be in USD. Content should be written for a US audience.`

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: req.prompt }] }],
    systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: 0.7 },
  })

  const text = result.response.text()
  const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim()

  return { content: cleaned }
}
