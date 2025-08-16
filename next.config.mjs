/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the X-Powered-By: Next.js header
  poweredByHeader: false,
  // Do not emit browser source maps in production
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
      "connect-src 'self' https: ws:",
      // Allow images from self, data URLs, and HTTPS (including your configured remotePatterns)
      "img-src 'self' data: https:",
      // Inline styles are sometimes required for libs; consider removing 'unsafe-inline' if fully CSP-compliant
      "style-src 'self' 'unsafe-inline'",
      // Scripts: strict in prod; relax in dev to avoid breaking HMR/tooling
      isDev ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self'",
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
    ]
  },
}

export default nextConfig
