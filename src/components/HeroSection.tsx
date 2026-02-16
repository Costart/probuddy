"use client";

import { MapBackground } from "@/components/MapBackground";
import { useSharedPage } from "@/components/SharedPageContext";

export function HeroSection({ children }: { children: React.ReactNode }) {
  const { geoLocation } = useSharedPage();

  return (
    <section className="relative overflow-hidden bg-gray-100">
      {geoLocation.lat && geoLocation.lon && (
        <MapBackground lat={geoLocation.lat} lon={geoLocation.lon} />
      )}
      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-12 md:pt-16 md:pb-16">
        {children}
      </div>
    </section>
  );
}
