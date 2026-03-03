const ADS_SEND_TO = "AW-17899660858/vQ9ICLip84AcELrMnNdC";

export function gtagConversion() {
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof g !== "function") {
    console.warn("[gtag] gtag not loaded, conversion not sent");
    return;
  }
  g("event", "conversion", { send_to: ADS_SEND_TO });
}
