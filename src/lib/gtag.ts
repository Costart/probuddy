export function gtagConversion() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/vQ9ICLip84AcELrMnNdC`,
    });
  }
}
