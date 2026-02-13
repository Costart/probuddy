import { cn } from "@/lib/utils"

interface PricingItem {
  name: string
  priceLow: number
  priceHigh: number
  note?: string
}

interface PricingContent {
  title?: string
  items: PricingItem[]
  disclaimer?: string
}

interface PricingGuideSectionProps {
  content: PricingContent
  className?: string
}

export function PricingGuideSection({ content, className }: PricingGuideSectionProps) {
  const items = Array.isArray(content.items) ? content.items : []
  if (items.length === 0) return null

  function fmt(cents: number) {
    return "$" + (Number(cents) / 100).toFixed(0)
  }

  return (
    <div className={cn("rounded-2xl border border-outline-variant/50 bg-white p-6 md:p-8", className)}>
      {content.title && (
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
          {content.title}
        </h2>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/50">
              <th className="text-left py-3 pr-4 font-semibold text-on-surface">Service</th>
              <th className="text-right py-3 pl-4 font-semibold text-on-surface">Price Range</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-outline-variant/30 last:border-0">
                <td className="py-3 pr-4 text-on-surface">
                  {item.name}
                  {item.note && <span className="block text-xs text-on-surface-variant mt-0.5">{item.note}</span>}
                </td>
                <td className="py-3 pl-4 text-right font-medium text-accent whitespace-nowrap">
                  {fmt(item.priceLow)} – {fmt(item.priceHigh)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {content.disclaimer && (
        <p className="mt-4 text-xs text-on-surface-variant italic">{content.disclaimer}</p>
      )}
    </div>
  )
}
