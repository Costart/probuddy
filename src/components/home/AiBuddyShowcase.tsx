"use client";

import { useEffect, useRef, useState } from "react";

const mockConversation = {
  user: "What should I ask a plumber before hiring?",
  assistant:
    "Great question! Ask about their licensing and insurance, whether they offer warranties on their work, and request an itemized estimate before they start. It's also smart to ask about their experience with your specific issue.",
};

export function AiBuddyShowcase({ city }: { city?: string | null }) {
  const [started, setStarted] = useState(false);
  const [introTyped, setIntroTyped] = useState("");
  const [introDone, setIntroDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const introText = `I've researched plumbing services${city ? ` in ${city}` : ""}. Here's what I found:`;

  // Trigger on scroll into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Typewriter
  useEffect(() => {
    if (!started || introDone) return;
    if (introTyped.length < introText.length) {
      const t = setTimeout(
        () => setIntroTyped(introText.slice(0, introTyped.length + 1)),
        20,
      );
      return () => clearTimeout(t);
    }
    setIntroDone(true);
  }, [started, introTyped, introText, introDone]);

  return (
    <div ref={ref} className="w-full max-w-sm mx-auto">
      {/* Mock card */}
      <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-2">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
              />
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-on-surface text-sm">
              AI Pro Buddy
            </p>
            <p className="text-xs text-on-surface-variant">
              Your personal plumbing assistant
            </p>
          </div>
        </div>

        {/* Typewriter intro */}
        <div className="px-4 pb-2">
          <p className="text-sm text-on-surface-variant">
            {started ? introTyped : ""}
            {started && !introDone && (
              <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-middle" />
            )}
          </p>
          {introDone && (
            <div className="mt-1.5 space-y-1">
              <p className="text-sm text-primary">
                &#128073; Pricing guide & cost estimates
              </p>
              <p className="text-sm text-primary">
                &#128073; Expert tips & advice
              </p>
            </div>
          )}
        </div>

        {/* Mock chat exchange */}
        {introDone && (
          <div className="px-4 pb-3 space-y-2 mt-2 border-t border-gray-100 pt-3">
            {/* User message */}
            <div className="bg-primary text-white text-sm p-2.5 rounded-xl rounded-br-sm ml-12">
              {mockConversation.user}
            </div>
            {/* Assistant message */}
            <div className="bg-gray-50 text-on-surface-variant text-sm p-2.5 rounded-xl rounded-bl-sm mr-8">
              {mockConversation.assistant}
            </div>
          </div>
        )}

        {/* Mock input */}
        <div className="px-4 pb-4 pt-1">
          <div className="flex gap-2">
            <div className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-on-surface-variant/40">
              Ask me anything...
            </div>
            <div className="px-3 py-2.5 bg-primary/20 text-primary/40 rounded-lg">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
