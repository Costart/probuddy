interface CloudflareEnv {
  DB: D1Database
  // Uncomment when you add R2 storage in wrangler.jsonc
  // BUCKET: R2Bucket
}

interface Window {
  gtag: (...args: unknown[]) => void;
  dataLayer: unknown[];
}
