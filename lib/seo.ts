import type { Metadata } from "next"

export const SITE_NAME = "ZeroSlash Agency"
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zeroslash.in"

// Existing public asset; the root opengraph-image route covers the home page.
const OG_IMAGE = { url: "/images/zero-agency-logo.png", width: 1200, height: 630 }

/**
 * Route metadata with a self-referencing canonical. Without this every route
 * inherits the root layout's canonical and tells search engines it is a
 * duplicate of the home page.
 */
export function pageMetadata({ path, title, description }: { path: string; title: string; description: string }): Metadata {
  const url = `${SITE_URL}${path}`
  const fullTitle = `${title} | ${SITE_NAME}`
  return {
    title,
    description,
    alternates: { canonical: url, languages: { "x-default": url } },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ ...OG_IMAGE, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: OG_IMAGE.url, alt: fullTitle }],
    },
  }
}
