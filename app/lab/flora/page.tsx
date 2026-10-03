"use client"

export const dynamic = "force-static"

import nextDynamic from "next/dynamic"

/* Standalone harness for the flower stage.
 *
 * Deliberately isolated from the homepage: this route mounts the section on an
 * otherwise empty cream page so it can be judged, profiled and tuned without
 * the hero's own WebGL scene competing for a GL context or muddying a
 * performance trace. Nothing here ships to the marketing site. */
const ServicesFlora = nextDynamic(
  () => import("@/components/sections/flora/ServicesFlora"),
  { ssr: false, loading: () => null },
)

export default function FloraLab() {
  return (
    <main className="min-h-[100dvh] bg-[rgb(251,250,248)]">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <p className="font-[family-name:var(--font-geist-mono)] text-[0.62rem] uppercase tracking-[0.22em] text-black/40">
          Lab - flower stage
        </p>
      </div>

      <ServicesFlora />
    </main>
  )
}
