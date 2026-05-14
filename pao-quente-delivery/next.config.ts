import type { NextConfig } from "next";

// Blob store ID is embedded in the token so we can allow its domain in CSP.
function getBlobStoreId(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  return token.split("_")[3]?.toLowerCase() ?? "";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.blob.vercel-storage.com" }],
  },
  async headers() {
    const storeId = getBlobStoreId();
    // Allow images from the project's own Blob store.
    const blobImgSrc = storeId
      ? `https://${storeId}.public.blob.vercel-storage.com`
      : "";

    const csp = [
      "default-src 'self'",
      // 'unsafe-inline' is required by Next.js App Router for hydration scripts.
      // 'unsafe-eval' is only needed in dev (Next.js fast-refresh).
      process.env.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: ${blobImgSrc}`.trim(),
      // Blob reads happen server-side; only catalog (public blob) is fetched client-side.
      `connect-src 'self' ${blobImgSrc}`.trim(),
      "font-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          // 2 years — tells browsers to always use HTTPS for this origin.
          // Only sent in production so local dev is not affected.
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
            : []),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
