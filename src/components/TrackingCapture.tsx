"use client";

import { Suspense } from "react";
import { useCaptureTrackingParams } from "@/lib/tracking";

function TrackingCaptureInner() {
  useCaptureTrackingParams();
  return null;
}

export function TrackingCapture() {
  return (
    <Suspense fallback={null}>
      <TrackingCaptureInner />
    </Suspense>
  );
}
