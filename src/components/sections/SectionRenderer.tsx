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
