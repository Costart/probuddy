import { cn } from "@/lib/utils"

interface QuestionsContent {
  title?: string
  questions: string[]
}

interface QuestionsToAskSectionProps {
  content: QuestionsContent
  className?: string
}

export function QuestionsToAskSection({ content, className }: QuestionsToAskSectionProps) {
  return (
    <div className={cn("rounded-2xl border border-outline-variant/50 bg-white p-6 md:p-8", className)}>
      {content.title && (
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
          {content.title}
        </h2>
      )}
      <ul className="space-y-3">
        {content.questions.map((q, i) => (
          <li key={i} className="flex gap-3 items-start">
            <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            <span className="text-sm text-on-surface-variant">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
