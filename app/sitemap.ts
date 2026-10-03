import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

// Public, indexable routes only. /lab and /api are disallowed in robots.ts.
const PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/digital-marketing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/calculator", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/waitlist", priority: 0.5, changeFrequency: "monthly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
