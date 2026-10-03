import type { Metadata } from "next"
import { notFound } from "next/navigation"

/* Internal harness routes. Available in dev; in production only when the
 * build sets ENABLE_LAB=1 (e.g. a preview deployment). Never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_LAB !== "1") {
    notFound()
  }
  return children
}
