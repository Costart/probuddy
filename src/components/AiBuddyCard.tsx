"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { useSharedPage } from "@/components/SharedPageContext";
import { clarityEvent } from "@/lib/clarity";

interface AiBuddyCardProps {
  categoryName: string;
  city: string | null;
  sectionTypes: string[];
  pageContext?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const sectionLabels: Record<string, string> = {
  pricing: "Pricing guide & cost estimates",
  tips: "Expert tips & advice",
  faq: "Frequently asked questions",
  content: "In-depth service guide",
  questions: "Key questions to ask pros",
  image: "Visual examples",
};

function formatReply(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

export function AiBuddyCard({
  categoryName,
  city,
  sectionTypes,
  pageContext,
}: AiBuddyCardProps) {
  // Shared context
  const { turnstileToken, turnstileReady } = useSharedPage();

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typingReply, setTypingReply] = useState("");
  const [fullReply, setFullReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const priorityOrder = [
    "pricing",
    "tips",
    "faq",
    "questions",
    "content",
    "image",
  ];
  const points = sectionTypes
    .filter((t) => sectionLabels[t])
    .sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b))
    .slice(0, 3)
    .map((t) => ({ type: t, label: sectionLabels[t] }));

  const introLine = `I've researched ${categoryName.toLowerCase()} services${city ? ` in ${city}` : ""}. Here's what I found:`;
  const pointLines = points.map((p) => `👉 ${p.label}`);
  const fullIntroText = [introLine, ...pointLines].join("\n");

  // Typewriter for AI reply only
  useEffect(() => {
    if (!fullReply) return;
    if (typingReply.length < fullReply.length) {
      const t = setTimeout(
        () => setTypingReply(fullReply.slice(0, typingReply.length + 1)),
        12,
      );
      return () => clearTimeout(t);
    }
    setMessages((prev) => {
      const updated = [...prev];
      if (updated[updated.length - 1]?.role === "assistant") {
        updated[updated.length - 1].text = fullReply;
      }
      return updated;
    });
    setFullReply("");
    setTypingReply("");
    setSending(false);
  }, [fullReply, typingReply]);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingReply]);

  async function handleSend() {
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setSending(true);
    clarityEvent("ai_buddy_message");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          turnstileToken,
          context: {
            serviceName: categoryName,
            city,
            pageContent: pageContext,
          },
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: "" }]);
        setFullReply(data.reply);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.error || "Sorry, I couldn't respond. Please try again.",
          },
        ]);
        setSending(false);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ]);
      setSending(false);
    }
  }

  return (
    <div>
      <Card className="bg-white shadow-elevation-2 border border-gray-100">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start gap-3 mb-2">
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
                Hi, I&apos;m your AI Pro Buddy
              </p>
              <p className="text-xs text-on-surface-variant">
                Your personal {categoryName.toLowerCase()} assistant
              </p>
            </div>
          </div>

          <div className="text-sm text-on-surface-variant mb-2 space-y-1">
            {fullIntroText.split("\n").map((line, i) => {
              const pointMatch = points.find((p) => line.includes(p.label));
              if (pointMatch) {
                // Hide deep links on mobile
                const isComplete = line === `👉 ${pointMatch.label}`;
                return (
                  <div key={pointMatch.type} className="hidden md:block">
                    {isComplete ? (
                      <a
                        href={`#section-${pointMatch.type}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById(`section-${pointMatch.type}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                        className="text-sm text-primary hover:text-primary-hover underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors cursor-pointer"
                      >
                        {line}
                      </a>
                    ) : (
                      <span className="text-primary">{line}</span>
                    )}
                  </div>
                );
              }
              return <p key={i}>{line}</p>;
            })}
          </div>

          {/* Chat button */}
          <button
            onClick={() => {
              clarityEvent("ai_buddy_opened");
              setChatOpen(true);
            }}
            className="w-full py-2 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-2"
          >
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
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
            Ask me anything
          </button>
        </CardContent>
      </Card>

      {/* Floating chat popup */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch pointer-events-none">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 pointer-events-auto"
            onClick={() => setChatOpen(false)}
          />

          {/* Chat window — full height, right side on desktop, full screen on mobile */}
          <div
            className="relative w-full max-w-2xl bg-white shadow-2xl border-l border-gray-200 pointer-events-auto flex flex-col ml-auto"
            style={{ animation: "chatSlideIn 0.3s ease-out" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-on-surface text-base">
                  AI Pro Buddy
                </p>
                <p className="text-sm text-on-surface-variant truncate">
                  Your {categoryName.toLowerCase()}
                  {city ? ` in ${city}` : ""} assistant
                </p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-on-surface-variant"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && !sending && (
                <div className="text-on-surface-variant bg-gray-50 rounded-xl p-4 mr-16">
                  <p className="font-medium text-on-surface mb-1">Welcome!</p>
                  <p className="text-sm">
                    I&apos;m your AI Pro Buddy. Ask me anything about{" "}
                    {categoryName.toLowerCase()}
                    {city ? ` in ${city}` : ""} — pricing, tips, what to look
                    for in a pro, and more. I can help with any home service!
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm p-3.5 rounded-xl ${
                    msg.role === "user"
                      ? "bg-primary text-white ml-16 rounded-br-sm"
                      : "bg-gray-50 text-on-surface-variant mr-16 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.text
                  ) : i === messages.length - 1 && fullReply ? (
                    <>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: formatReply(typingReply),
                        }}
                      />
                      <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse align-middle" />
                    </>
                  ) : (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: formatReply(msg.text),
                      }}
                    />
                  )}
                </div>
              ))}

              {sending && !fullReply && (
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant ml-1">
                  <span className="flex gap-0.5">
                    <span
                      className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                  Thinking...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about this service..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  disabled={sending}
                  maxLength={500}
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim() || !turnstileReady}
                  className="px-3 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant/50 mt-1.5 text-center">
                Powered by AI — responses may not be 100% accurate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
