"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { pageview } from "@/lib/gtag"

export default function AnalyticsListener() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Send pageview on route change in App Router
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    pageview(url)
  }, [pathname, searchParams])

  return null
}
