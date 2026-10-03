import { describe, expect, it } from "vitest"
import sitemap from "@/app/sitemap"
import { pageMetadata, SITE_URL } from "@/lib/seo"

describe("pageMetadata", () => {
  it("sets a self-referencing canonical so routes are not duplicates of /", () => {
    const m = pageMetadata({ path: "/about", title: "About", description: "d" })
    expect(m.alternates?.canonical).toBe(`${SITE_URL}/about`)
    expect(m.openGraph?.url).toBe(`${SITE_URL}/about`)
  })

  it("references an existing public share image", () => {
    const m = pageMetadata({ path: "/x", title: "X", description: "d" })
    const images = m.openGraph?.images as { url: string }[]
    expect(images[0].url).toBe("/images/zero-agency-logo.png")
  })
})

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url.replace(SITE_URL, "") || "/")

  it("lists every public route", () => {
    for (const p of ["/", "/about", "/services", "/digital-marketing", "/calculator", "/reviews", "/contact", "/waitlist"]) {
      expect(urls).toContain(p)
    }
  })

  it("excludes internal routes", () => {
    expect(urls.some((u) => u.startsWith("/lab") || u.startsWith("/api"))).toBe(false)
  })
})
