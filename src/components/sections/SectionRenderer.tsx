import { HeroSection } from "@/components/sections/HeroSection"
import { ContentSection } from "@/components/sections/ContentSection"
import { FaqSection } from "@/components/sections/FaqSection"
import { PricingGuideSection } from "@/components/sections/PricingGuideSection"
import { ImageSection } from "@/components/sections/ImageSection"
import { TipsSection } from "@/components/sections/TipsSection"
import { QuestionsToAskSection } from "@/components/sections/QuestionsToAskSection"

interface SectionData {
  id: string
  sectionType: string
  content: string | null
  sortOrder: number | null
}

interface SectionRendererProps {
  sections: SectionData[]
}

function normalizeContent(parsed: any, sectionType: string): any {
  if (!parsed || typeof parsed !== "object") return parsed

  // Step 1: Unwrap {section_type/type: "...", content: {...}} wrappers
  if (parsed.content && typeof parsed.content === "object" && !Array.isArray(parsed.content)) {
    if (parsed.section_type || parsed.type || parsed.sectionType) {
      parsed = parsed.content
    }
  }

  // Step 2: Unwrap single-key nested objects like {faq: {...}}, {tips_section: {...}}
  const keys = Object.keys(parsed)
  if (keys.length === 1 && typeof parsed[keys[0]] === "object" && !Array.isArray(parsed[keys[0]])) {
    parsed = parsed[keys[0]]
  }

  // Step 3: Map alternative key names to expected ones per section type
  switch (sectionType) {
    case "tips": {
      // Expected: { title?, tips: string[] }
      // Alternatives: items, tip_list, suggestions
      if (!parsed.tips && Array.isArray(parsed.items)) {
        parsed.tips = parsed.items
        delete parsed.items
      }
      if (!parsed.tips && Array.isArray(parsed.tip_list)) {
        parsed.tips = parsed.tip_list
        delete parsed.tip_list
      }
      if (!parsed.tips && Array.isArray(parsed.suggestions)) {
        parsed.tips = parsed.suggestions
        delete parsed.suggestions
      }
      // Handle tips as objects with text/description fields
      if (Array.isArray(parsed.tips) && parsed.tips.length > 0 && typeof parsed.tips[0] === "object") {
        parsed.tips = parsed.tips.map((t: any) => t.tip || t.text || t.description || t.content || String(t))
      }
      break
    }
    case "content": {
      // Expected: { title?, text: string }
      // Alternatives: body, description, content (string), paragraph, paragraphs
      if (!parsed.text && typeof parsed.body === "string") {
        parsed.text = parsed.body
        delete parsed.body
      }
      if (!parsed.text && typeof parsed.description === "string") {
        parsed.text = parsed.description
        delete parsed.description
      }
      if (!parsed.text && typeof parsed.content === "string") {
        parsed.text = parsed.content
        delete parsed.content
      }
      if (!parsed.text && typeof parsed.paragraph === "string") {
        parsed.text = parsed.paragraph
        delete parsed.paragraph
      }
      if (!parsed.text && Array.isArray(parsed.paragraphs)) {
        parsed.text = parsed.paragraphs.join("\n\n")
        delete parsed.paragraphs
      }
      break
    }
    case "faq": {
      // Expected: { title?, items: { question, answer }[] }
      // Alternatives: faqs, faq_items, questions
      if (!parsed.items && Array.isArray(parsed.faqs)) {
        parsed.items = parsed.faqs
        delete parsed.faqs
      }
      if (!parsed.items && Array.isArray(parsed.faq_items)) {
        parsed.items = parsed.faq_items
        delete parsed.faq_items
      }
      if (!parsed.items && Array.isArray(parsed.questions)) {
        parsed.items = parsed.questions
        delete parsed.questions
      }
      break
    }
    case "questions": {
      // Expected: { title?, questions: string[] }
      // Alternatives: items, question_list
      if (!parsed.questions && Array.isArray(parsed.items)) {
        parsed.questions = parsed.items
        delete parsed.items
      }
      if (!parsed.questions && Array.isArray(parsed.question_list)) {
        parsed.questions = parsed.question_list
        delete parsed.question_list
      }
      // Handle questions as objects with text/question fields
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0 && typeof parsed.questions[0] === "object") {
        parsed.questions = parsed.questions.map((q: any) => q.question || q.text || q.content || String(q))
      }
      break
    }
    case "pricing": {
      // Expected: { title?, items: { name, priceLow, priceHigh, note? }[], disclaimer? }
      // Alternatives: pricing, services, price_ranges
      if (!parsed.items && Array.isArray(parsed.pricing)) {
        parsed.items = parsed.pricing
        delete parsed.pricing
      }
      if (!parsed.items && Array.isArray(parsed.services)) {
        parsed.items = parsed.services
        delete parsed.services
      }
      if (!parsed.items && Array.isArray(parsed.price_ranges)) {
        parsed.items = parsed.price_ranges
        delete parsed.price_ranges
      }
      // Normalize item fields: price_low -> priceLow, service -> name
      if (Array.isArray(parsed.items)) {
        parsed.items = parsed.items.map((item: any) => ({
          name: item.name || item.service || item.label || "Service",
          priceLow: item.priceLow ?? item.price_low ?? item.low ?? item.min ?? 0,
          priceHigh: item.priceHigh ?? item.price_high ?? item.high ?? item.max ?? 0,
          note: item.note || item.notes || item.description,
        }))
      }
      break
    }
    case "hero": {
      // Expected: { title?, subtitle?, imageUrl? }
      // Alternatives: heading, description, image_url, background
      if (!parsed.title && parsed.heading) {
        parsed.title = parsed.heading
        delete parsed.heading
      }
      if (!parsed.subtitle && parsed.description) {
        parsed.subtitle = parsed.description
        delete parsed.description
      }
      if (!parsed.imageUrl && parsed.image_url) {
        parsed.imageUrl = parsed.image_url
        delete parsed.image_url
      }
      break
    }
    case "image": {
      // Expected: { url, alt, caption? }
      // Alternatives: src, image_url, imageUrl, alt_text
      if (!parsed.url && parsed.src) {
        parsed.url = parsed.src
        delete parsed.src
      }
      if (!parsed.url && parsed.image_url) {
        parsed.url = parsed.image_url
        delete parsed.image_url
      }
      if (!parsed.url && parsed.imageUrl) {
        parsed.url = parsed.imageUrl
        delete parsed.imageUrl
      }
      if (!parsed.alt && parsed.alt_text) {
        parsed.alt = parsed.alt_text
        delete parsed.alt_text
      }
      break
    }
  }

  return parsed
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
        if (!section.content) return null

        let parsed: any
        try {
          parsed = JSON.parse(section.content)
        } catch {
          return null
        }

        parsed = normalizeContent(parsed, section.sectionType)

        switch (section.sectionType) {
          case "hero":
            return <HeroSection key={section.id} content={parsed} />
          case "content":
            return <ContentSection key={section.id} content={parsed} />
          case "faq":
            return <FaqSection key={section.id} content={parsed} />
          case "pricing":
            return <PricingGuideSection key={section.id} content={parsed} />
          case "image":
            return <ImageSection key={section.id} content={parsed} />
          case "tips":
            return <TipsSection key={section.id} content={parsed} />
          case "questions":
            return <QuestionsToAskSection key={section.id} content={parsed} />
          default:
            return null
        }
      })}
    </>
  )
}
