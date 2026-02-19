"use client";

import { MapBackground } from "@/components/MapBackground";
import { useSharedPage } from "@/components/SharedPageContext";

export function HeroSection({ children }: { children: React.ReactNode }) {
  const { geoLocation } = useSharedPage();

  return (
    <section className="relative overflow-hidden bg-gray-100 h-auto min-h-[220px] md:h-[340px]">
      {geoLocation.lat && geoLocation.lon && (
        <MapBackground lat={geoLocation.lat} lon={geoLocation.lon} />
      )}
      <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-6 md:px-6 md:pt-16 md:pb-16">
        {children}
      </div>
    </section>
  );
}
