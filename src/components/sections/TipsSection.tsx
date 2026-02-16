import { cn } from "@/lib/utils";

interface TipsContent {
  title?: string;
  tips: string[];
}

interface TipsSectionProps {
  content: TipsContent;
  className?: string;
}

export function TipsSection({ content, className }: TipsSectionProps) {
  const tips = Array.isArray(content.tips) ? content.tips : [];
  if (tips.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant/50 bg-white p-6 md:p-8",
        className,
      )}
    >
      {content.title && (
        <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
          {content.title}
        </h2>
      )}
      <ol className="space-y-4">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-display font-bold text-sm flex items-center justify-center">
              {i + 1}
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed pt-1">
              {(() => {
                const text = typeof tip === "string" ? tip : String(tip);
                const match = text.match(/^\*\*(.+?)\*\*\s*(.*)$/);
                if (match) {
                  return (
                    <>
                      <strong className="text-on-surface font-semibold">
                        {match[1]}
                      </strong>{" "}
                      {match[2]}
                    </>
                  );
                }
                return text;
              })()}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
