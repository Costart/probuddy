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

        // Normalize: unwrap if AI returned nested like {faq: {title, items}} or {section_type: ..., content: {...}}
        if (parsed && typeof parsed === "object") {
          // Handle {section_type: "...", content: {...}} wrapper
          if (parsed.content && typeof parsed.content === "object" && parsed.section_type) {
            parsed = parsed.content
          }
          // Handle {faq: {...}}, {tips: {...}}, {questions: {...}} etc
          const keys = Object.keys(parsed)
          if (keys.length === 1 && typeof parsed[keys[0]] === "object" && !Array.isArray(parsed[keys[0]])) {
            parsed = parsed[keys[0]]
          }
        }

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
