"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useSharedPage } from "@/components/SharedPageContext";
import { clarityEvent } from "@/lib/clarity";
import { gtagConversion } from "@/lib/gtag";
import { appendTrackingParams } from "@/lib/tracking";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SCAN_DURATION_MS = 1400;
const SCAN_GAP_MS = 200;
const SCAN_CARD_COUNT = 3;
const RANKING_HOLD_MS = 800;

const SCAN_PHASES = [
  "Reading profile...",
  "Checking reviews...",
  "Evaluating experience...",
];
const SCAN_PHASE_INTERVAL = 450;

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
  categoryId: string;
  locationLat?: string | null;
  locationLon?: string | null;
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

function ThumbstackModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data === "THUMBTACK_RF_CLOSE") {
        onClose();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl h-[85vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <iframe
          src={url}
          className="w-full h-full border-0"
          allow="payment; clipboard-write"
          title="Request a quote"
        />
      </div>
    </div>
  );
}

function SkeletonProCard({
  serviceName,
  city,
  delay = 0,
}: {
  serviceName: string;
  city?: string;
  delay?: number;
}) {
  return (
    <Card
      className="flex flex-col skeleton-card relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Shimmer sweep overlay */}
      <div
        className="skeleton-shimmer"
        style={{ animationDelay: `${delay}ms` }}
      />
      <div className="p-6 flex flex-col items-center text-center flex-1">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary/8 mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        {/* Service name */}
        <p className="text-sm font-semibold text-on-surface/40 mb-1">
          {serviceName}
        </p>
        <p className="text-xs text-on-surface-variant/40 mb-3">
          {city ? `in ${city}` : "near you"}
        </p>
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-16 bg-primary/5 rounded-full" />
          <div className="h-5 w-20 bg-primary/5 rounded-full" />
        </div>
        {/* Intro lines */}
        <div className="w-full space-y-2 mb-3">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
        </div>
        {/* Detail rows */}
        <div className="w-full space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded w-28" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        </div>
        {/* Star rating placeholder */}
        <div className="w-full border-t border-gray-100 pt-4 mb-3">
          <div className="flex items-center justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      {/* CTA button */}
      <div className="p-6 pt-0 mt-auto">
        <div className="h-11 bg-primary/8 rounded-lg w-full" />
      </div>
    </Card>
  );
}

export function ProsList({
  serviceName,
  postalCode,
  city,
  categorySlug,
  categoryId,
  locationLat,
  locationLon,
}: ProsListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { turnstileToken, setScanStatus } = useSharedPage();
  const displayCity = city;
  const initialZip = postalCode?.match(/^\d{5}/)?.[0] || "";
  const [pros, setPros] = useState<Business[]>([]);
  const scanCount = Math.min(SCAN_CARD_COUNT, pros.length || SCAN_CARD_COUNT);
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
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // Find the portal target in the hero before paint to avoid layout shift
  useLayoutEffect(() => {
    const el = document.getElementById("zip-badge-portal");
    if (el) setPortalTarget(el);
  }, []);

  // Reverse-geocode location lat/lon to get a US zip when visitor has no US zip
  useEffect(() => {
    if (activeZip || !locationLat || !locationLon) return;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${locationLat}&lon=${locationLon}&format=json&addressdetails=1&zoom=14`,
      { headers: { "User-Agent": "ProBuddy/1.0" } },
    )
      .then((res) => res.json())
      .then((data) => {
        const pc = data?.address?.postcode;
        if (pc && /^\d{5}/.test(pc)) {
          const zip = pc.match(/^\d{5}/)![0];
          setActiveZip(zip);
          setZipInput(zip);
          setLoading(true);
        }
      })
      .catch(() => {
        // Couldn't resolve zip — user can enter one manually
      });
  }, [locationLat, locationLon, activeZip]);

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
  const baseQuery = searchterm
    ? `${serviceName} for ${searchterm}`
    : serviceName;
  const query =
    baseQuery.length < 13 ? `${baseQuery} services near me` : baseQuery;

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
    clarityEvent("zip_changed");
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
      .then(async (data) => {
        const place = data.places?.[0];
        if (place) {
          const cityName = place["place name"];
          const stateName = place.state;
          if (cityName && stateName) {
            // Create location page before navigating so it exists when the page loads
            await fetch("/api/locations/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pageType: "category",
                pageId: categoryId,
                pageName: serviceName,
                country: "us",
                region: slugify(stateName),
                city: slugify(cityName),
                cityDisplay: cityName,
                regionDisplay: stateName,
                countryDisplay: "United States",
                turnstileToken,
              }),
            }).catch(() => {});
            const url = `/services/${categorySlug}/loc/us/${slugify(stateName)}/${slugify(cityName)}?zip=${newZip}`;
            window.location.href = url;
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
      progress: (scanningIndex + 1) / scanCount,
      totalPros: pros.length,
    });
    phaseTextTimer.current = setInterval(() => {
      idx = (idx + 1) % SCAN_PHASES.length;
      setScanPhaseText(SCAN_PHASES[idx]);
      setScanStatus({
        phase: "scanning",
        currentProName: pros[scanningIndex]?.name,
        phaseText: SCAN_PHASES[idx],
        progress: (scanningIndex + 1) / scanCount,
        totalPros: pros.length,
      });
    }, SCAN_PHASE_INTERVAL);

    return () => {
      if (phaseTextTimer.current) clearInterval(phaseTextTimer.current);
    };
  }, [phase, scanningIndex, pros, setScanStatus]);

  // Scan sequence: advance through cards one at a time (skipped early if AI finishes)
  useEffect(() => {
    if (phase !== "scanning" || scanningIndex < 0) return;

    console.log("[ProsList] scan tick", { scanningIndex, scanCount, aiDone, aiReady: aiReadyRef.current });

    if (scanningIndex >= scanCount) {
      // All cards scanned — transition to ranking if AI ready
      if (aiReadyRef.current) {
        console.log("[ProsList] all scanned + AI ready → ranking");
        setPhase("ranking");
      }
      return;
    }

    // Wait for scan duration + gap, then advance
    scanTimer.current = setTimeout(() => {
      setScanningIndex((prev) => prev + 1);
    }, SCAN_DURATION_MS + SCAN_GAP_MS);

    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    };
  }, [phase, scanningIndex, scanCount]);

  // "Ranking" transition — hold then reveal
  useEffect(() => {
    if (phase !== "ranking") return;

    console.log("[ProsList] ranking phase", { aiReady: aiReadyRef.current, aiDone, rankings: aiRanking?.rankings?.length });
    setScanStatus({ phase: "ranking", totalPros: pros.length });

    // If AI isn't ready yet, wait for it
    if (!aiReadyRef.current) return;

    const timer = setTimeout(() => {
      console.log("[ProsList] ranking hold done → done phase", { rankings: aiRanking?.rankings?.length });
      setPhase("done");
      setScanStatus({
        phase: "done",
        totalPros: pros.length,
        topMatchCount: Math.min(3, aiRanking?.rankings?.length ?? 0),
      });
    }, RANKING_HOLD_MS);

    return () => clearTimeout(timer);
  }, [phase, aiDone, pros.length, setScanStatus, aiRanking]);

  // When AI arrives during scanning phase — skip remaining scans
  useEffect(() => {
    if (aiDone && phase === "scanning") {
      console.log("[ProsList] AI done during scanning → fast-forward to ranking", { scanningIndex, scanCount });
      setScanningIndex(scanCount);
      setPhase("ranking");
    }
  }, [aiDone, phase, scanCount]);

  // Track latest turnstile token in a ref so async functions can read it
  const turnstileTokenRef = useRef(turnstileToken);
  const turnstileWaitersRef = useRef<((token: string) => void)[]>([]);
  useEffect(() => {
    turnstileTokenRef.current = turnstileToken;
    if (turnstileToken && turnstileWaitersRef.current.length > 0) {
      // Resolve all pending waiters
      turnstileWaitersRef.current.forEach((resolve) => resolve(turnstileToken));
      turnstileWaitersRef.current = [];
    }
  }, [turnstileToken]);

  // Fetch pros + AI ranking — cache-first (no Turnstile needed for cached results)
  useEffect(() => {
    if (!activeZip || hasFetched.current || navigatingRef.current) return;

    if (!/^\d{5}$/.test(activeZip)) {
      setLoading(false);
      return;
    }

    hasFetched.current = true;
    const zipCode = activeZip;

    // Broadcast searching phase immediately
    setScanStatus({ phase: "searching", serviceName });
    clarityEvent("pro_search");
    fetch("/api/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visit", categorySlug }),
    }).catch(() => {});

    function waitForTurnstile(): Promise<string> {
      // Check ref for latest value (closure may be stale)
      if (turnstileTokenRef.current) return Promise.resolve(turnstileTokenRef.current);
      return new Promise((resolve, reject) => {
        turnstileWaitersRef.current.push(resolve);
        setTimeout(() => reject(new Error("Turnstile timeout")), 10000);
      });
    }

    function handleProsLoaded(businesses: Business[], zip: string, source: string, freePass?: boolean) {
      console.log(`[ProsList] handleProsLoaded (${source})`, { count: businesses.length, zip, freePass });
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
        console.log("[ProsList] starting AI ranking...");
        fetchAiRanking(businesses, zip, freePass);
      } else {
        setAiDone(true);
        aiReadyRef.current = true;
      }
    }

    async function fetchPros() {
      try {
        // Phase 1: Try cache-only (no Turnstile needed, fires immediately)
        console.log("[ProsList] cache probe starting...");
        const cacheController = new AbortController();
        const cacheTimeout = setTimeout(() => cacheController.abort(), 5000);
        const cacheRes = await fetch("/api/pros/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            zipCode,
            categorySlug,
            limit: 30,
            cacheOnly: true,
          }),
          signal: cacheController.signal,
        });
        clearTimeout(cacheTimeout);

        if (cacheRes.ok) {
          const cacheData = await cacheRes.json();
          console.log("[ProsList] cache probe result", { cached: cacheData.cached !== false, businesses: cacheData.businesses?.length, turnstileRequired: cacheData.turnstileRequired });
          if (cacheData.businesses?.length > 0 && cacheData.cached !== false) {
            // Cache hit — use immediately, skip Turnstile wait
            handleProsLoaded(cacheData.businesses, zipCode, "cache-hit");
            return;
          }

          // Phase 2: Cache miss — check if IP gets a free pass
          if (cacheData.turnstileRequired === false) {
            console.log("[ProsList] IP free pass — skipping Turnstile");
            const fpController = new AbortController();
            const fpTimeout = setTimeout(() => fpController.abort(), 15000);
            const fpRes = await fetch("/api/pros/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query,
                zipCode,
                categorySlug,
                limit: 30,
              }),
              signal: fpController.signal,
            });
            clearTimeout(fpTimeout);
            if (fpRes.ok) {
              const fpData = await fpRes.json();
              const businesses: Business[] = fpData.businesses || [];
              console.log("[ProsList] free pass fetch done", { count: businesses.length, freePass: fpData.freePass });
              handleProsLoaded(businesses, zipCode, "free-pass", fpData.freePass);
              return;
            }
            // Free pass failed (race condition?) — fall through to Turnstile
          }
        }
      } catch (err) {
        console.log("[ProsList] cache probe failed", err);
        // Cache probe failed — fall through to full fetch
      }

      // Phase 3: Turnstile required — wait then full fetch
      try {
        console.log("[ProsList] waiting for Turnstile...", { hasToken: !!turnstileToken });
        const token = await waitForTurnstile();
        console.log("[ProsList] Turnstile ready — fetching pros...");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch("/api/pros/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            zipCode,
            turnstileToken: token,
            categorySlug,
            limit: 30,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const businesses: Business[] = data.businesses || [];
          console.log("[ProsList] full fetch done", { count: businesses.length });
          handleProsLoaded(businesses, zipCode, "full-fetch");
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

    async function fetchAiRanking(businesses: Business[], zip: string, freePass?: boolean) {
      try {
        let token: string | undefined;
        if (freePass) {
          console.log("[ProsList] AI ranking: using free pass, skipping Turnstile wait");
          token = turnstileTokenRef.current || undefined;
        } else {
          console.log("[ProsList] AI ranking: waiting for Turnstile...", { hasToken: !!turnstileToken });
          token = await waitForTurnstile();
        }
        console.log("[ProsList] AI ranking: calling /api/pros/rank...");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const res = await fetch("/api/pros/rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businesses: businesses.map((b) => ({
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
            categorySlug,
            turnstileToken: token,
            freePass: !!freePass,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await res.json();
        console.log("[ProsList] Rank API response:", res.status, JSON.stringify(data));
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
      } catch (err) {
        console.error("[ProsList] AI ranking failed:", err);
      } finally {
        console.log("[ProsList] AI ranking complete → setAiDone(true)", { phase });
        setAiDone(true);
        aiReadyRef.current = true;
      }
    }

    fetchPros();

    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
      if (phaseTextTimer.current) clearInterval(phaseTextTimer.current);
    };
  }, [activeZip, query, setScanStatus, serviceName, turnstileToken]);

  if (!postalCode && !locationLat) return null;

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

  // Loading — show skeleton cards so users see content is coming
  if (loading) {
    return (
      <div id="pros-list" className="space-y-6">
        {portalTarget && createPortal(
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span>Showing results for</span>
            {zipBadge}
          </div>,
          portalTarget,
        )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonProCard serviceName={serviceName} city={displayCity || undefined} delay={0} />
          <SkeletonProCard serviceName={serviceName} city={displayCity || undefined} delay={150} />
          <SkeletonProCard serviceName={serviceName} city={displayCity || undefined} delay={300} />
        </div>
      </div>
    );
  }

  // No valid zip or no results — show prompt to enter/change zip
  if (!activeZip || noResults || (!loading && pros.length === 0)) {
    return (
      <div id="pros-list" className="space-y-5">
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

  // Visible cards — show all scan cards immediately so grid is full
  const visiblePros = isDone
    ? pros
    : pros.slice(0, Math.max(0, Math.max(scanningIndex + 1, scanCount)));

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
        @keyframes skeletonFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-card {
          animation: skeletonFadeIn 0.4s ease-out both;
        }
        .skeleton-shimmer {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(79, 70, 229, 0.04) 30%,
            rgba(79, 70, 229, 0.08) 50%,
            rgba(79, 70, 229, 0.04) 70%,
            transparent 100%
          );
          animation: shimmerSweep 1.8s ease-in-out infinite;
        }
        .card-slide-in {
          animation: cardSlideIn 0.35s ease-out both;
          transition: opacity 0.3s ease-out;
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
          animation: scanLine 1.1s ease-in-out forwards;
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

      {/* Zip badge — portaled into hero */}
      {portalTarget && createPortal(
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span>Showing results for</span>
          {zipBadge}
        </div>,
        portalTarget,
      )}

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
                {Math.min(scanningIndex + 1, scanCount)}/{scanCount}
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
                  width: `${((scanningIndex + 1) / scanCount) * 100}%`,
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
          const isWaiting = !isDone && phase === "scanning" && index > scanningIndex && index < scanCount;
          const isBulkRevealed = isDone && index >= scanCount;

          let cardClass = "flex flex-col";
          if (isCurrentlyScan) {
            cardClass += " card-slide-in card-scanning";
          } else if (isPlaced) {
            cardClass += " card-settled";
          } else if (isWaiting) {
            cardClass += " card-slide-in opacity-50";
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
                  ? { animationDelay: `${(index - scanCount) * 100}ms` }
                  : isWaiting
                    ? { animationDelay: `${index * 100}ms` }
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
                    onClick={() => {
                      clarityEvent("quote_flow_started");
                      gtagConversion();
                      fetch("/api/events/track", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "conversion", categorySlug }),
                      }).catch(() => {});
                      setIframeUrl(appendTrackingParams(pro.requestFlowUrl!));
                    }}
                    className="block w-full text-center text-sm font-semibold py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Compare Free Quotes
                  </button>
                ) : pro.servicePageUrl ? (
                  <button
                    onClick={() => {
                      clarityEvent("pro_profile_viewed");
                      setIframeUrl(appendTrackingParams(pro.servicePageUrl!));
                    }}
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
        <ThumbstackModal
          url={iframeUrl}
          onClose={() => {
            clarityEvent("quote_modal_closed");
            setIframeUrl(null);
          }}
        />
      )}
    </div>
  );
}
