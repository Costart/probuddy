import { generateWithOpenAI } from "./openai"
import { generateWithAnthropic } from "./anthropic"
import { generateWithReplicate } from "./replicate"
import { generateWithGemini } from "./gemini"

export interface GenerateRequest {
  provider: string
  model?: string
  prompt: string
  sectionType: string
}

export interface GenerateResult {
  content: string // JSON string for the section
}

export async function generateContent(req: GenerateRequest): Promise<GenerateResult> {
  switch (req.provider) {
    case "openai":
      return generateWithOpenAI(req)
    case "anthropic":
      return generateWithAnthropic(req)
    case "replicate":
      return generateWithReplicate(req)
    case "gemini":
      return generateWithGemini(req)
    default:
      throw new Error(`Unknown provider: ${req.provider}`)
  }
}
