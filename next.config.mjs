/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the X-Powered-By: Next.js header
  poweredByHeader: false,
  // Keep source out of production bundles. Flip on locally when debugging a prod build.
  productionBrowserSourceMaps: false,
  // Enforce linting and type-checking during builds to catch issues early
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  // Add common security headers including a baseline Content Security Policy (CSP)
  async headers() {
    // Note: Adjust CSP directives to match any analytics, fonts, or third-party embeds you add.
    const isDev = process.env.NODE_ENV !== 'production'
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      // Next.js dev (HMR) may use websockets; keep ws: in connect-src to avoid breaking dev
      "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://*.facebook.com https://*.facebook.net ws:",
      // Allow images from self, data URLs, and HTTPS (including your configured remotePatterns)
      "img-src 'self' data: https: https://*.facebook.com",
      // Inline styles are sometimes required for libs; consider removing 'unsafe-inline' if fully CSP-compliant
      "style-src 'self' 'unsafe-inline'",
      // Scripts: allow Google Analytics, Meta Pixel, and the inline GA/pixel bootstraps.
      // No 'unsafe-eval' in production: neither the app bundles nor gtag/fbevents need it.
      isDev ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://connect.facebook.net blob:",
      // Fonts may be loaded as data URLs
      "font-src 'self' data:"
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          // Enable HTTP Strict Transport Security (HSTS). Only effective over HTTPS.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      {
        // Next static build assets
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: isDev ? 'no-store' : 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Public images
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: isDev ? 'no-store' : 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Public fonts
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: isDev ? 'no-store' : 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
