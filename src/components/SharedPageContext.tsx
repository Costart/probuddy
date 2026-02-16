"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

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
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileReady(true);
        },
        size: "invisible",
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
      <div ref={turnstileRef} className="hidden" />
      {children}
    </SharedPageContext.Provider>
  );
}
