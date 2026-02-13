import { cn } from "@/lib/utils"

interface HeroContent {
  title?: string
  subtitle?: string
  imageUrl?: string
}

interface HeroSectionProps {
  content: HeroContent
  className?: string
}

export function HeroSection({ content, className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 p-8 md:p-12",
        className
      )}
      style={content.imageUrl ? { backgroundImage: `url(${content.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {content.imageUrl && <div className="absolute inset-0 bg-on-surface/40" />}
      <div className={cn("relative", content.imageUrl && "text-white")}>
        {content.title && (
          <h2 className={cn("font-display text-3xl font-bold mb-3", !content.imageUrl && "text-on-surface")}>
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className={cn("text-lg max-w-2xl", !content.imageUrl && "text-on-surface-variant")}>
            {content.subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
