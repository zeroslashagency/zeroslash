import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zeroslash.in"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const pages = [
    "",
    "/about",
    "/services",
    "/contact",
    "/reviews",
    "/waitlist",
  ]

  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/services" ? 0.9 : 0.7,
  }))
}
