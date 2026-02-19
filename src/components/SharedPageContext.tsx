"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const TURNSTILE_SITE_KEY = "0x4AAAAAACfm-CiNXBHa4jmt";

export interface ScanStatusInfo {
  phase: "idle" | "searching" | "scanning" | "ranking" | "done";
  serviceName?: string;
  currentProName?: string;
  phaseText?: string;
  progress?: number;
  totalPros?: number;
  topMatchCount?: number;
}

export interface GeoLocation {
  lat: string | null;
  lon: string | null;
  city: string | null;
}

interface SharedPageState {
  turnstileToken: string | null;
  turnstileReady: boolean;
  scanStatus: ScanStatusInfo;
  setScanStatus: (status: ScanStatusInfo) => void;
  geoLocation: GeoLocation;
  setGeoLocation: (geo: GeoLocation) => void;
}

const SharedPageContext = createContext<SharedPageState | null>(null);

export function useSharedPage() {
  const ctx = useContext(SharedPageContext);
  if (!ctx)
    throw new Error("useSharedPage must be used within SharedPageProvider");
  return ctx;
}

export function SharedPageProvider({
  children,
  initialGeo,
}: {
  children: React.ReactNode;
  initialGeo?: GeoLocation;
}) {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatusInfo>({
    phase: "idle",
  });
  const [geoLocation, setGeoLocation] = useState<GeoLocation>(
    initialGeo ?? { lat: null, lon: null, city: null },
  );
  const turnstileRef = useRef<HTMLDivElement>(null);

  const onTurnstileLoad = useCallback(() => {
    if (turnstileRef.current && (window as any).turnstile) {
      (window as any).turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: "interaction-only",
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileReady(true);
          setShowChallenge(false);
        },
        "before-interactive-callback": () => {
          setShowChallenge(true);
        },
        "after-interactive-callback": () => {
          setShowChallenge(false);
        },
      });
    }
  }, []);

  useEffect(() => {
    if ((window as any).turnstile) {
      const t = setTimeout(onTurnstileLoad, 100);
      return () => clearTimeout(t);
    }
    if (document.querySelector('script[src*="turnstile"]')) {
      const interval = setInterval(() => {
        if ((window as any).turnstile) {
          onTurnstileLoad();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
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

  return (
    <SharedPageContext.Provider
      value={{
        turnstileToken,
        turnstileReady,
        scanStatus,
        setScanStatus,
        geoLocation,
        setGeoLocation,
      }}
    >
      {children}

      {/* Backdrop — only when Cloudflare needs interaction */}
      {showChallenge && (
        <div className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm" />
      )}

      {/* Turnstile container — always in DOM. Challenge modal wraps it when needed. */}
      <div
        className={
          showChallenge
            ? "fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-3"
            : ""
        }
      >
        {showChallenge && (
          <>
            <p className="text-sm font-semibold text-on-surface">
              Quick security check
            </p>
            <p className="text-xs text-on-surface-variant text-center">
              Please complete the verification to continue
            </p>
          </>
        )}
        <div ref={turnstileRef} />
      </div>
    </SharedPageContext.Provider>
  );
}
