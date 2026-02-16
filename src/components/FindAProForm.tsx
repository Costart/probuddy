"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { GeoData } from "@/lib/geo";

const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

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

interface FindAProFormProps {
  geoData: GeoData;
  categorySlug: string;
  subServiceSlug?: string;
  serviceName?: string;
}

export function FindAProForm({
  geoData,
  categorySlug,
  subServiceSlug,
  serviceName,
}: FindAProFormProps) {
  const [name, setName] = useState("");
  const [postalCode, setPostalCode] = useState(geoData.postalCode ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [pros, setPros] = useState<Business[]>([]);
  const [prosLoading, setProsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Load Turnstile
  const onTurnstileLoad = useCallback(() => {
    if (turnstileRef.current && (window as any).turnstile) {
      (window as any).turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileReady(true);
        },
        size: "invisible",
      });
    }
  }, []);

  useEffect(() => {
    if (document.querySelector('script[src*="turnstile"]')) {
      if ((window as any).turnstile) onTurnstileLoad();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded";
    script.async = true;
    (window as any).onTurnstileLoaded = onTurnstileLoad;
    document.head.appendChild(script);
    return () => {
      delete (window as any).onTurnstileLoaded;
    };
  }, [onTurnstileLoad]);

  async function searchPros(zip: string) {
    const query =
      serviceName ||
      subServiceSlug?.replace(/-/g, " ") ||
      categorySlug.replace(/-/g, " ");
    setProsLoading(true);
    try {
      const res = await fetch("/api/pros/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          zipCode: zip.trim().slice(0, 5),
          turnstileToken,
          limit: 5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPros(data.businesses || []);
      }
    } catch {
      // silently fail — pros are supplementary
    } finally {
      setProsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !postalCode.trim()) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug,
          subServiceSlug,
          name: name.trim(),
          postalCode: postalCode.trim(),
          jobDescription: jobDescription.trim() || undefined,
          detectedCity: geoData.city,
          detectedRegion: geoData.region,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
      // Search for pros after successful lead submission
      searchPros(postalCode);
    } catch {
      setStatus("error");
    }
  }

  function renderStars(rating: number) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) {
      stars.push(
        <span key={`f${i}`} className="text-amber-400">
          &#9733;
        </span>,
      );
    }
    if (half) {
      stars.push(
        <span key="h" className="text-amber-400">
          &#9733;
        </span>,
      );
    }
    return stars;
  }

  if (status === "success") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-success-container bg-success-container/30 p-8 text-center space-y-3">
          <h3 className="font-display text-xl font-bold text-on-surface">
            Request Submitted!
          </h3>
          <p className="text-on-surface-variant">
            We&apos;re connecting you with pros
            {geoData.city ? ` in ${geoData.city}` : " near you"}. You&apos;ll
            hear back soon.
          </p>
        </div>

        {/* Pro Results */}
        {prosLoading && (
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
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
              Finding pros near you...
            </div>
          </div>
        )}

        {pros.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-on-surface">
              Top Pros Near You
            </h3>
            {pros.map((pro) => (
              <Card key={pro.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Pro image */}
                    {pro.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={pro.imageUrl}
                          alt={pro.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {/* Name + badges */}
                      <div className="flex items-start gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-on-surface text-sm">
                          {pro.name}
                        </h4>
                        {pro.isTopPro && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                            Top Pro
                          </span>
                        )}
                        {pro.isBackgroundChecked && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                            <svg
                              className="w-2.5 h-2.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            BG Checked
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {pro.rating && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="flex">
                            {renderStars(pro.rating)}
                          </span>
                          <span className="text-xs font-medium text-on-surface">
                            {pro.rating.toFixed(1)}
                          </span>
                          {pro.reviewCount != null && (
                            <span className="text-xs text-on-surface-variant">
                              ({pro.reviewCount})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface-variant flex-wrap">
                        {pro.numberOfHires != null && pro.numberOfHires > 0 && (
                          <span>{pro.numberOfHires} hires</span>
                        )}
                        {pro.yearsInBusiness != null &&
                          pro.yearsInBusiness > 0 && (
                            <span>{pro.yearsInBusiness}yr in business</span>
                          )}
                        {pro.quote && (
                          <span className="font-medium text-on-surface">
                            From {pro.quote.startingCost}
                            {pro.quote.costUnit ? `/${pro.quote.costUnit}` : ""}
                          </span>
                        )}
                      </div>

                      {/* Introduction */}
                      {pro.introduction && (
                        <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">
                          {pro.introduction}
                        </p>
                      )}

                      {/* Featured review */}
                      {pro.featuredReview && (
                        <p className="text-xs text-on-surface-variant mt-1.5 italic line-clamp-2">
                          &ldquo;{pro.featuredReview}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  {pro.requestFlowUrl && (
                    <a
                      href={pro.requestFlowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block w-full text-center text-sm font-semibold py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Request a Quote
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!prosLoading && pros.length === 0 && (
          <p className="text-sm text-on-surface-variant text-center">
            We&apos;ll match you with the best pros in your area shortly.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hidden Turnstile container */}
      <div ref={turnstileRef} className="hidden" />

      {geoData.city && (
        <p className="text-sm text-accent font-medium flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
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
          Finding pros near {geoData.city}
          {geoData.region ? `, ${geoData.region}` : ""}
        </p>
      )}
      <Input
        id="name"
        label="Your Name"
        placeholder="John Smith"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="postalCode"
        label="Zip Code / Postcode"
        placeholder="Enter your zip code"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        required
      />
      <div className="w-full">
        <label
          htmlFor="jobDescription"
          className="block text-sm font-medium text-on-surface-variant mb-1.5"
        >
          Describe Your Job (optional)
        </label>
        <textarea
          id="jobDescription"
          className={cn(
            "flex w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "placeholder:text-outline min-h-[100px] resize-y",
          )}
          placeholder="Tell us what you need help with..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-error">
          Something went wrong. Please try again.
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={status === "submitting" || !turnstileReady}
      >
        {status === "submitting" ? "Submitting..." : "Find Pros"}
      </Button>
    </form>
  );
}
