import { cn } from "@/lib/utils"

interface ContentData {
  title?: string
  text: string
}

interface ContentSectionProps {
  content: ContentData
  className?: string
}

export function ContentSection({ content, className }: ContentSectionProps) {
  return (
    <div className={cn("rounded-2xl border border-outline-variant/50 bg-white p-6 md:p-8", className)}>
      {content.title && (
        <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
          {content.title}
        </h2>
      )}
      <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed whitespace-pre-line">
        {content.text}
      </div>
    </div>
  )
}
