"use client";

import { useEffect, useRef, useState } from "react";

const scanPhases = [
  "Reading profile...",
  "Checking 84 reviews...",
  "Evaluating experience...",
];

export function AiScanShowcase() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setPhase((p) => {
        if (p >= scanPhases.length - 1) {
          clearInterval(interval);
          setTimeout(() => setScanDone(true), 600);
          return p;
        }
        return p + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <div ref={ref} className="relative w-full max-w-[360px] mx-auto">
      <style>{`
        @keyframes scanSweep {
          0% { top: -2px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: calc(100% - 2px); opacity: 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(10deg); }
        }
        .showcase-card-scanning {
          position: relative;
          overflow: hidden;
        }
        .showcase-card-scanning::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: -2px;
          height: 3px;
          background: linear-gradient(90deg,
            transparent,
            rgba(79, 70, 229, 0.6),
            rgba(79, 70, 229, 0.9),
            rgba(79, 70, 229, 0.6),
            transparent
          );
          box-shadow: 0 0 12px 4px rgba(79, 70, 229, 0.4), 0 0 24px 8px rgba(79, 70, 229, 0.15);
          border-radius: 2px;
          animation: scanSweep 2.8s ease-in-out forwards;
          z-index: 10;
          pointer-events: none;
        }
      `}</style>

      {/* Main pro card — matches real ProsList card structure */}
      <div
        className={`rounded-xl bg-white shadow-elevation-2 border-2 overflow-hidden transition-all duration-500 ${
          started && !scanDone
            ? "showcase-card-scanning border-primary/20"
            : scanDone
              ? "ring-2 ring-primary border-transparent"
              : "border-gray-200"
        }`}
      >
        {/* Scan overlay */}
        {started && !scanDone && (
          <div className="absolute inset-0 z-20 flex items-end justify-center pb-8 bg-gradient-to-b from-white/20 via-white/30 to-white/60 rounded-xl pointer-events-none">
            <div
              className="flex items-center gap-2 bg-white/95 rounded-full px-4 py-2 shadow-md border border-primary/10"
              style={{ animation: "fadeSlideIn 0.3s ease-out both" }}
            >
              <svg
                className="w-3.5 h-3.5 animate-spin text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-xs font-medium text-primary">
                {scanPhases[phase]}
              </span>
            </div>
          </div>
        )}

        {/* AI Top Pick banner — appears after scan */}
        {scanDone && (
          <div
            className="bg-primary/5 border-b border-primary/10 px-4 py-2.5"
            style={{ animation: "badgePop 0.4s ease-out both" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-base"
                style={{ animation: "sparkle 2s ease-in-out infinite" }}
              >
                &#10024;
              </span>
              <span className="text-sm font-bold text-primary">
                AI Top Pick
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Highest rated landscaper with 12 years experience. Customers
              consistently praise his hedge work and attention to detail.
            </p>
          </div>
        )}

        {/* Card body — centered layout like real ProsList */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Profile photo — green initials like a landscaper */}
          <div className="w-20 h-20 rounded-full mb-4 overflow-hidden bg-green-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">DK</span>
          </div>

          {/* Name */}
          <h3 className="font-display font-bold text-on-surface text-base mb-2">
            David Kim
          </h3>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
            <span className="text-[11px] font-bold text-primary border border-primary rounded-full px-2.5 py-0.5">
              Top Pro
            </span>
            <span className="text-[11px] font-medium text-green-600 border border-green-300 rounded-full px-2.5 py-0.5 flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          </div>

          {/* Intro text */}
          <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
            Professional landscaper specializing in hedge trimming, garden
            design, and outdoor maintenance. Fully insured.
          </p>

          {/* Featured review */}
          <div className="w-full mb-3">
            <p className="text-xs text-on-surface-variant italic line-clamp-2">
              &ldquo;David did an amazing job with our overgrown hedges.
              Completely transformed the front garden in just one
              afternoon!&rdquo;
            </p>
          </div>

          {/* Detail rows with icons */}
          <div className="w-full text-left space-y-1.5 text-sm text-on-surface-variant mb-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span>London, England</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
              <span>12 years in business</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              <span>Hired 84 times</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>Responds quickly</span>
            </div>
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-1.5 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-4 h-4 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-on-surface">4.9</span>
            <span className="text-xs text-on-surface-variant">
              (84 reviews)
            </span>
          </div>

          {/* Service pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center mb-4">
            {["Hedge Trimming", "Garden Design", "Lawn Care"].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5"
              >
                <svg
                  className="w-3 h-3 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                {pill}
              </span>
            ))}
          </div>

          {/* CTA button */}
          <button className="w-full py-2.5 px-4 bg-primary text-white text-sm font-semibold rounded-lg">
            Compare Free Quotes
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {started && !scanDone && (
        <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ animation: "progressFill 3.5s ease-out forwards" }}
          />
        </div>
      )}
      {started && (
        <p className="text-xs text-on-surface-variant text-center mt-2">
          {scanDone
            ? "Analysis complete — top match identified"
            : "Analyzing professionals..."}
        </p>
      )}
    </div>
  );
}
