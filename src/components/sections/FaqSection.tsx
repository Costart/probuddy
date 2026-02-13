"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface FaqItem {
  question: string
  answer: string
}

interface FaqContent {
  title?: string
  items: FaqItem[]
}

interface FaqSectionProps {
  content: FaqContent
  className?: string
}

export function FaqSection({ content, className }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={cn("rounded-2xl border border-outline-variant/50 bg-white p-6 md:p-8", className)}>
      {content.title && (
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
          {content.title}
        </h2>
      )}
      <div className="divide-y divide-outline-variant/50">
        {content.items.map((item, i) => (
          <div key={i} className="py-4 first:pt-0 last:pb-0">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-medium text-on-surface pr-4">{item.question}</span>
              <svg
                className={cn("w-5 h-5 text-on-surface-variant shrink-0 transition-transform", openIndex === i && "rotate-180")}
                fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {openIndex === i && (
              <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
