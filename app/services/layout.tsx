import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zeroslash.in"
const title = "Services We Offer | ZeroSlash Agency"
const description =
  "Conversion-focused web design, bold branding, and data-driven marketing. Premium delivery tailored for results."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/services`,
    siteName: "ZeroSlash Agency",
    title,
    description,
    images: [
      { url: "/placeholder-logo.png", width: 1200, height: 630, alt: `${title}` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: "/placeholder-logo.png", alt: `${title}` }],
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
