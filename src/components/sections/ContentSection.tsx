import { cn } from "@/lib/utils";

interface ContentData {
  title?: string;
  text: string;
}

interface ContentSectionProps {
  content: ContentData;
  className?: string;
}

function renderMarkdown(text: string): string {
  return (
    text
      // Headers: **Header** on its own line → <strong>
      // Bold: **text** → <strong>text</strong>
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Bullet lines: * text or - text → list items
      .replace(/^[\*\-]\s+/gm, "• ")
      // Numbered lines are fine as-is
      // Paragraphs: double newlines → </p><p>
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("")
  );
}

export function ContentSection({ content, className }: ContentSectionProps) {
  const text = content.text || "";
  if (!text) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant/50 bg-white p-6 md:p-8",
        className,
      )}
    >
      {content.title && (
        <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
          {content.title}
        </h2>
      )}
      <div
        className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
      />
    </div>
  );
}
