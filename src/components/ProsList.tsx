"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useSharedPage } from "@/components/SharedPageContext";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SCAN_DURATION_MS = 2000;
const SCAN_GAP_MS = 400;
const SCAN_CARD_COUNT = 3;
const RANKING_HOLD_MS = 1200;

const SCAN_PHASES = [
  "Reading profile...",
  "Checking reviews...",
  "Evaluating experience...",
];
const SCAN_PHASE_INTERVAL = 650;

interface Business {
  id: string;
  name: string;
  introduction: string | null;
  location: string | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  featuredReview: string | null;
  yearsInBusiness: number | null;
  numberOfHires: number | null;
  responseTimeHours: number | null;
  isTopPro: boolean;
  isBackgroundChecked: boolean;
  quote: { startingCost: string; costUnit: string } | null;
  servicePageUrl: string | null;
  requestFlowUrl: string | null;
  pills: string[];
}

interface AiRanking {
  rankings: { id: string; reason?: string }[];
}

interface ProsListProps {
  serviceName: string;
  postalCode: string | null;
  city?: string | null;
  categorySlug: string;
}

function ExpandableText({
  text,
  maxLines,
  className,
}: {
  text: string;
  maxLines: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p
        className={`${className || ""} ${expanded ? "" : maxLines === 3 ? "line-clamp-3" : "line-clamp-2"}`}
      >
        {text}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-primary text-xs font-medium hover:text-primary-hover mt-0.5"
      >
        {expanded ? "Show Less" : "Read More +"}
      </button>
    </div>
  );
}

export function ProsList({
  serviceName,
  postalCode,
  city,
  categorySlug,
}: ProsListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { turnstileToken, setScanStatus } = useSharedPage();
  const displayCity = city;
  const initialZip = postalCode?.match(/^\d{5}/)?.[0] || "";
  const [pros, setPros] = useState<Business[]>([]);
  const [loading, setLoading] = useState(!!initialZip);
  const hasFetched = useRef(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  // Editable zip code
  const [activeZip, setActiveZip] = useState(initialZip);
  const [isEditingZip, setIsEditingZip] = useState(false);
  const [zipInput, setZipInput] = useState(initialZip);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [noResults, setNoResults] = useState(false);
  const navigatingRef = useRef(false);

  // Scan animation state
  const [scanningIndex, setScanningIndex] = useState(-1);
  const [scanPhaseText, setScanPhaseText] = useState(SCAN_PHASES[0]);
  // 'idle' | 'scanning' | 'ranking' | 'done'
  const [phase, setPhase] = useState<"idle" | "scanning" | "ranking" | "done">(
    "idle",
  );
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTextTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // AI ranking state
  const [aiRanking, setAiRanking] = useState<AiRanking | null>(null);
  const [aiDone, setAiDone] = useState(false);
  const aiReadyRef = useRef(false);

  const searchterm = searchParams.get("searchterm");
  const query = searchterm ? `${serviceName} for ${searchterm}` : serviceName;

  // Handle zip code change — geocode and navigate to location page
  function handleZipSubmit() {
    const newZip = zipInput.trim();
    setIsEditingZip(false);
    if (!/^\d{5}$/.test(newZip)) {
      setZipInput(activeZip);
      return;
    }
    if (newZip === activeZip && !noResults) return;

    // Show loading while we geocode — don't update activeZip to avoid triggering fetch effect
    navigatingRef.current = true;
    setActiveZip(newZip);
    setPros([]);
    setNoResults(false);
    setLoading(true);
    setScanStatus({ phase: "searching", serviceName });

    // Look up zip to get city/state, then navigate to location page
    fetch(`https://api.zippopotam.us/us/${newZip}`)
      .then((res) => {
        if (!res.ok) throw new Error("Zip not found");
        return res.json();
      })
      .then((data) => {
        const place = data.places?.[0];
        if (place) {
          const cityName = place["place name"];
          const stateName = place.state;
          if (cityName && stateName) {
            const url = `/services/${categorySlug}/loc/us/${slugify(stateName)}/${slugify(cityName)}`;
            router.push(url);
            return;
          }
        }
        navigatingRef.current = false;
        setLoading(false);
        setNoResults(true);
        setScanStatus({ phase: "idle" });
      })
      .catch(() => {
        navigatingRef.current = false;
        setLoading(false);
        setNoResults(true);
        setScanStatus({ phase: "idle" });
      });
  }

  // Cycling scan phase text during each card scan
  useEffect(() => {
    if (phase !== "scanning" || scanningIndex < 0) return;

    let idx = 0;
    setScanPhaseText(SCAN_PHASES[0]);
    setScanStatus({
      phase: "scanning",
      currentProName: pros[scanningIndex]?.name,
      phaseText: SCAN_PHASES[0],
      progress: (scanningIndex + 1) / SCAN_CARD_COUNT,
      totalPros: pros.length,
    });
    phaseTextTimer.current = setInterval(() => {
      idx = (idx + 1) % SCAN_PHASES.length;
      setScanPhaseText(SCAN_PHASES[idx]);
      setScanStatus({
        phase: "scanning",
        currentProName: pros[scanningIndex]?.name,
        phaseText: SCAN_PHASES[idx],
        progress: (scanningIndex + 1) / SCAN_CARD_COUNT,
        totalPros: pros.length,
      });
    }, SCAN_PHASE_INTERVAL);

    return () => {
      if (phaseTextTimer.current) clearInterval(phaseTextTimer.current);
    };
  }, [phase, scanningIndex, pros, setScanStatus]);

  // Scan sequence: advance through cards one at a time with gaps
  useEffect(() => {
    if (phase !== "scanning" || scanningIndex < 0) return;

    if (scanningIndex >= SCAN_CARD_COUNT || scanningIndex >= pros.length) {
      // Scan phase done — transition to ranking or done
      if (aiReadyRef.current) {
        setPhase("ranking");
      }
      return;
    }

    // Wait for scan duration + gap, then advance
    scanTimer.current = setTimeout(() => {
      if (aiReadyRef.current && scanningIndex >= SCAN_CARD_COUNT - 1) {
        // AI ready and this is the last scan card — go to ranking
        setScanningIndex((prev) => prev + 1);
        setPhase("ranking");
      } else {
        setScanningIndex((prev) => prev + 1);
      }
    }, SCAN_DURATION_MS + SCAN_GAP_MS);

    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    };
  }, [phase, scanningIndex, pros.length]);

  // "Ranking" transition — hold then reveal
  useEffect(() => {
    if (phase !== "ranking") return;

    setScanStatus({ phase: "ranking", totalPros: pros.length });

    // If AI isn't ready yet, wait for it
    if (!aiReadyRef.current) return;

    const timer = setTimeout(() => {
      setPhase("done");
      setScanStatus({
        phase: "done",
        totalPros: pros.length,
        topMatchCount: Math.min(3, aiRanking?.rankings?.length ?? 0),
      });
    }, RANKING_HOLD_MS);

    return () => clearTimeout(timer);
  }, [phase, aiDone, pros.length, setScanStatus, aiRanking]);

  // When AI arrives during scanning phase and scans are done
  useEffect(() => {
    if (aiDone && phase === "scanning" && scanningIndex >= SCAN_CARD_COUNT) {
      setPhase("ranking");
    }
  }, [aiDone, phase, scanningIndex]);

  // Fetch pros + AI ranking in parallel
  useEffect(() => {
    if (
      !turnstileToken ||
      !activeZip ||
      hasFetched.current ||
      navigatingRef.current
    )
      return;

    if (!/^\d{5}$/.test(activeZip)) {
      setLoading(false);
      return;
    }

    hasFetched.current = true;
    const zipCode = activeZip;

    // Broadcast searching phase immediately
    setScanStatus({ phase: "searching", serviceName });

    async function fetchPros() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch("/api/pros/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            zipCode,
            turnstileToken,
            limit: 30,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const businesses: Business[] = data.businesses || [];
          setPros(businesses);
          setLoading(false);

          if (businesses.length === 0) {
            setNoResults(true);
            setScanStatus({ phase: "idle" });
            return;
          }

          setScanningIndex(0);
          setPhase("scanning");

          if (businesses.length > 1) {
            fetchAiRanking(businesses, zipCode);
          } else {
            setAiDone(true);
            aiReadyRef.current = true;
          }
        } else {
          setLoading(false);
          setNoResults(true);
          setScanStatus({ phase: "idle" });
        }
      } catch {
        setLoading(false);
        setNoResults(true);
        setScanStatus({ phase: "idle" });
      }
    }

    async function fetchAiRanking(businesses: Business[], zip: string) {
      try {
        const res = await fetch("/api/pros/rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businesses: businesses.slice(0, 10).map((b) => ({
              id: b.id,
              name: b.name,
              rating: b.rating,
              reviewCount: b.reviewCount,
              yearsInBusiness: b.yearsInBusiness,
              numberOfHires: b.numberOfHires,
              introduction: b.introduction,
              featuredReview: b.featuredReview,
              isBackgroundChecked: b.isBackgroundChecked,
              isTopPro: b.isTopPro,
              pills: b.pills,
            })),
            query,
            zipCode: zip,
          }),
        });
        const data = await res.json();
        if (data?.rankings) {
          setAiRanking(data);
          const rankPosition = new Map<string, number>();
          data.rankings.forEach(
            (r: { id: string; reason?: string }, i: number) => {
              rankPosition.set(r.id, i);
            },
          );
          setPros((prev) => {
            const sorted = [...prev].sort((a, b) => {
              const pa = rankPosition.get(a.id) ?? 999;
              const pb = rankPosition.get(b.id) ?? 999;
              return pa - pb;
            });
            return sorted;
          });
        }
      } catch {
        // AI failed silently
      } finally {
        setAiDone(true);
        aiReadyRef.current = true;
      }
    }

    fetchPros();

    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
      if (phaseTextTimer.current) clearInterval(phaseTextTimer.current);
    };
  }, [turnstileToken, activeZip, query, setScanStatus, serviceName]);

  if (!postalCode) return null;

  // Zip code badge — editable pill
  const zipBadge = activeZip ? (
    isEditingZip ? (
      <input
        ref={zipInputRef}
        type="text"
        value={zipInput}
        onChange={(e) =>
          setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") handleZipSubmit();
          if (e.key === "Escape") {
            setIsEditingZip(false);
            setZipInput(activeZip);
          }
        }}
        onBlur={handleZipSubmit}
        className="inline-block w-24 text-base font-mono text-center border-2 border-primary rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        autoFocus
      />
    ) : (
      <button
        onClick={() => {
          setIsEditingZip(true);
          setZipInput(activeZip);
          setTimeout(() => zipInputRef.current?.select(), 0);
        }}
        className="inline-flex items-center gap-1.5 text-base font-semibold text-on-surface-variant bg-white border-2 border-gray-200 rounded-lg px-3.5 py-1.5 hover:border-primary hover:text-primary transition-colors cursor-pointer shadow-sm"
        title="Click to change zip code"
      >
        <svg
          className="w-4 h-4 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
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
        {activeZip}
        <svg
          className="w-3.5 h-3.5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"
          />
        </svg>
      </button>
    )
  ) : null;

  function renderStars(rating: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={
            i <= Math.round(rating) ? "text-amber-400" : "text-gray-200"
          }
        >
          &#9733;
        </span>,
      );
    }
    return stars;
  }

  // Build AI pick map for top 3
  const aiPickMap = new Map<string, { rank: number; reason: string }>();
  if (aiRanking?.rankings) {
    aiRanking.rankings.slice(0, 3).forEach((r, i) => {
      aiPickMap.set(r.id, { rank: i, reason: r.reason || "" });
    });
  }

  // Loading — show minimal searching state (AI buddy card shows the detail)
  if (loading) {
    return (
      <div id="pros-list" className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-display text-2xl font-bold text-on-surface">
            Finding Top Pros{displayCity ? ` in ${displayCity}` : " Near You"}
            ...
          </h2>
          {zipBadge}
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 animate-spin text-primary"
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
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary">
              Searching for {serviceName} pros
              {displayCity ? ` in ${displayCity}` : ""}...
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Checking availability and reviews
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No valid zip or no results — show prompt to enter/change zip
  if (!activeZip || noResults || (!loading && pros.length === 0)) {
    return (
      <div id="pros-list" className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-on-surface">
          {serviceName} Pros{displayCity ? ` in ${displayCity}` : ""}
        </h2>
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-6 py-8 text-center max-w-lg mx-auto">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-3"
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
          <p className="text-on-surface font-semibold mb-1">
            {noResults
              ? "No pros found in this area"
              : "Enter a US zip code to find pros"}
          </p>
          <p className="text-sm text-on-surface-variant mb-4">
            {noResults
              ? "Try a different zip code to search another area"
              : "We need a 5-digit US zip code to search for local professionals"}
          </p>
          <div className="flex items-center justify-center gap-2">
            <input
              ref={zipInputRef}
              type="text"
              value={zipInput}
              onChange={(e) =>
                setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleZipSubmit();
              }}
              placeholder="e.g. 10001"
              className="w-28 text-base font-mono text-center border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              onClick={handleZipSubmit}
              disabled={!/^\d{5}$/.test(zipInput.trim())}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isDone = phase === "done";
  const isScanning = phase === "scanning" && scanningIndex >= 0;
  const isRanking = phase === "ranking";

  // Visible cards
  const visiblePros = isDone
    ? pros
    : pros.slice(0, Math.max(0, scanningIndex + 1));

  return (
    <div id="pros-list" className="space-y-6">
      {/* Animation CSS */}
      <style>{`
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scanLine {
          0% { top: -2px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: calc(100% - 2px); opacity: 0; }
        }
        @keyframes cardSettle {
          0% { transform: scale(1); }
          50% { transform: scale(1.015); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(10deg); }
        }
        @keyframes badgeReveal {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .card-slide-in {
          animation: cardSlideIn 0.35s ease-out both;
        }
        .card-scanning {
          position: relative;
          overflow: hidden;
        }
        .card-scanning::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: -2px;
          height: 4px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(79, 70, 229, 0.3) 20%,
            rgba(79, 70, 229, 0.8) 50%,
            rgba(79, 70, 229, 0.3) 80%,
            transparent 100%
          );
          box-shadow: 0 0 12px 4px rgba(79, 70, 229, 0.4), 0 0 24px 8px rgba(79, 70, 229, 0.15);
          border-radius: 2px;
          animation: scanLine 1.5s ease-in-out forwards;
          animation-delay: 0.35s;
          z-index: 10;
          pointer-events: none;
        }
        .card-settled {
          animation: cardSettle 0.3s ease-out both;
        }
        .card-bulk-reveal {
          animation: fadeIn 0.4s ease-out both;
        }
        .badge-reveal {
          animation: badgeReveal 0.4s ease-out both;
        }
        .sparkle-icon {
          animation: sparkle 2s ease-in-out infinite;
        }
        .progress-pulse {
          animation: progressPulse 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-display text-2xl font-bold text-on-surface">
          Top {serviceName} Pros
          {displayCity ? ` in ${displayCity}` : " Near You"}
        </h2>
        {zipBadge}
      </div>

      {/* AI Status Bar — Scanning phase */}
      {isScanning && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 animate-spin text-primary"
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
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">
                {scanningIndex < pros.length
                  ? `Scanning ${pros[scanningIndex]?.name}`
                  : "Finishing scan..."}
              </p>
              <span className="text-xs font-bold text-primary/60">
                {Math.min(scanningIndex + 1, SCAN_CARD_COUNT)}/{SCAN_CARD_COUNT}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {scanPhaseText}
            </p>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-primary/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((scanningIndex + 1) / SCAN_CARD_COUNT) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Status Bar — Ranking phase */}
      {isRanking && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-base progress-pulse">&#10024;</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary">
              Ranking your best matches...
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Comparing all {pros.length} pros to find your top picks
            </p>
            <div className="mt-2 h-1 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary/50 rounded-full w-full progress-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* AI Summary — done phase */}
      {isDone && aiRanking && (
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 badge-reveal">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-base sparkle-icon">&#10024;</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              AI analyzed {pros.length} pros and selected your top{" "}
              {Math.min(3, aiRanking.rankings.length)} matches
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Ranked by relevance to{" "}
              {searchterm ? `"${searchterm}"` : serviceName.toLowerCase()}
              {displayCity ? ` in ${displayCity}` : ""}, rating quality,
              experience & reviews
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePros.map((pro, index) => {
          const aiPick = isDone ? aiPickMap.get(pro.id) : undefined;

          const isCurrentlyScan =
            !isDone && phase === "scanning" && index === scanningIndex;
          const isPlaced = !isDone && index < scanningIndex;
          const isBulkRevealed = isDone && index >= SCAN_CARD_COUNT;

          let cardClass = "flex flex-col";
          if (isCurrentlyScan) {
            cardClass += " card-slide-in card-scanning";
          } else if (isPlaced) {
            cardClass += " card-settled";
          } else if (isBulkRevealed) {
            cardClass += " card-bulk-reveal";
          }
          if (aiPick) {
            cardClass += " ring-2 ring-primary";
          }

          return (
            <Card
              key={pro.id}
              className={cardClass}
              style={
                isBulkRevealed
                  ? {
                      animationDelay: `${(index - SCAN_CARD_COUNT) * 100}ms`,
                    }
                  : undefined
              }
            >
              {/* Scan overlay with cycling text */}
              {isCurrentlyScan && (
                <div className="scan-overlay absolute inset-0 z-20 flex items-end justify-center pb-20 bg-gradient-to-b from-white/30 via-white/40 to-white/60 rounded-xl pointer-events-none">
                  <div className="flex items-center gap-2 bg-white/95 rounded-full px-4 py-2 shadow-md border border-primary/10">
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
                      {scanPhaseText}
                    </span>
                  </div>
                </div>
              )}

              {/* AI Pick badge — top 3, with reveal animation */}
              {aiPick && (
                <div
                  className="bg-primary/5 border-b border-primary/10 px-4 py-2.5 badge-reveal"
                  style={{ animationDelay: `${300 + aiPick.rank * 200}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="sparkle-icon text-base">&#10024;</span>
                    <span className="text-sm font-bold text-primary">
                      {aiPick.rank === 0 ? "AI Top Pick" : "AI Pick"}
                    </span>
                  </div>
                  {aiPick.reason && (
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {aiPick.reason}
                    </p>
                  )}
                </div>
              )}

              <div className="p-6 flex flex-col items-center text-center flex-1">
                {pro.imageUrl ? (
                  <img
                    src={pro.imageUrl}
                    alt={pro.name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}

                <h3 className="font-display font-bold text-on-surface text-base mb-2">
                  {pro.name}
                </h3>

                <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
                  {pro.isTopPro && (
                    <span className="text-[11px] font-bold text-primary border border-primary rounded-full px-2.5 py-0.5">
                      Top Pro
                    </span>
                  )}
                  {pro.isBackgroundChecked && (
                    <span className="text-[11px] font-medium text-green-600 border border-green-300 rounded-full px-2.5 py-0.5 flex items-center gap-0.5">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                {pro.introduction && (
                  <div className="w-full mb-3">
                    <ExpandableText
                      text={pro.introduction}
                      maxLines={3}
                      className="text-sm text-on-surface-variant"
                    />
                  </div>
                )}

                <div className="w-full text-left space-y-1.5 text-sm text-on-surface-variant mb-4">
                  {pro.location && (
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
                      <span>{pro.location}</span>
                    </div>
                  )}
                  {pro.yearsInBusiness != null && pro.yearsInBusiness > 0 && (
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
                      <span>{pro.yearsInBusiness} years in business</span>
                    </div>
                  )}
                  {pro.numberOfHires != null && pro.numberOfHires > 0 && (
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
                      <span>Hired {pro.numberOfHires} times</span>
                    </div>
                  )}
                  {pro.responseTimeHours != null &&
                    pro.responseTimeHours <= 2 && (
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
                    )}
                </div>

                <div className="w-full border-t border-gray-100 pt-4 mb-3">
                  {pro.rating != null && (
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="flex text-lg">
                        {renderStars(pro.rating)}
                      </span>
                      <span className="font-bold text-on-surface">
                        {pro.rating.toFixed(2)}
                      </span>
                      {pro.reviewCount != null && (
                        <span className="text-sm text-on-surface-variant">
                          - {pro.reviewCount} reviews
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {pro.featuredReview && (
                  <div className="w-full mb-3">
                    <ExpandableText
                      text={`"${pro.featuredReview}"`}
                      maxLines={2}
                      className="text-xs text-on-surface-variant italic"
                    />
                  </div>
                )}

                {pro.pills.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap justify-center mb-4">
                    {pro.pills.map((pill, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium text-green-600 flex items-center gap-0.5"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                        {pill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 pt-0 mt-auto">
                {pro.requestFlowUrl ? (
                  <button
                    onClick={() => setIframeUrl(pro.requestFlowUrl)}
                    className="block w-full text-center text-sm font-semibold py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Compare Free Quotes
                  </button>
                ) : pro.servicePageUrl ? (
                  <button
                    onClick={() => setIframeUrl(pro.servicePageUrl)}
                    className="block w-full text-center text-sm font-semibold py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Iframe modal */}
      {iframeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIframeUrl(null)}
          />
          <div className="relative w-full max-w-3xl h-[85vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="font-display font-bold text-on-surface text-sm">
                Get Your Free Quote
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={iframeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => setIframeUrl(null)}
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
            </div>
            <iframe
              src={iframeUrl}
              className="flex-1 w-full border-0"
              allow="payment; clipboard-write"
              title="Request a quote"
            />
          </div>
        </div>
      )}
    </div>
  );
}
