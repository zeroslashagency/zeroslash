"use client"

import dynamic from "next/dynamic"

// CardSwipe (client, heavy) - no SSR
export const CardSwipeClient = dynamic(
  () => import("@/src/components/ui/card-swipe").then((m) => m.CardSwipe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/5] max-w-[520px] mx-auto rounded-2xl bg-black/5 dark:bg-white/5" aria-hidden />
    ),
  }
)

// TiltedCard (client)
export const TiltedCardClient = dynamic(
  () => import("@/src/blocks/Components/TiltedCard/TiltedCard"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-2xl bg-black/5 dark:bg-white/5" aria-hidden />
    ),
  }
)

// CircularText (client)
export const CircularTextClient = dynamic(
  () => import("@/src/blocks/TextAnimations/CircularText/CircularText"),
  {
    ssr: false,
    loading: () => (
      <div className="w-[164px] h-[164px] md:w-[184px] md:h-[184px] rounded-full bg-black/5 dark:bg-white/5" aria-hidden />
    ),
  }
)

// FlipLink (client)
export const FlipLinkClient = dynamic(
  () => import("@/ui/text-effect-flipper"),
  {
    ssr: false,
    loading: () => <span className="opacity-70">Loading…</span>,
  }
)

// CountUpOnView (client)
export const CountUpOnViewClient = dynamic(
  () => import("@/components/CountUpOnView"),
  {
    ssr: false,
    loading: () => <span className="inline-block">&nbsp;</span>,
  }
)
