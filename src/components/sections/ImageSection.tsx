import { cn } from "@/lib/utils"

interface ImageContent {
  url: string
  alt: string
  caption?: string
}

interface ImageSectionProps {
  content: ImageContent
  className?: string
}

export function ImageSection({ content, className }: ImageSectionProps) {
  return (
    <figure className={cn("rounded-2xl overflow-hidden", className)}>
      <img
        src={content.url}
        alt={content.alt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      {content.caption && (
        <figcaption className="px-4 py-3 bg-surface-container text-sm text-on-surface-variant text-center">
          {content.caption}
        </figcaption>
      )}
    </figure>
  )
}
