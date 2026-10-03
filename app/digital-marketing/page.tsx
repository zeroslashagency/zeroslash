export const dynamic = 'force-static'

import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import MarketingView from "./MarketingView"
import "./marketing-scope.css"

export const metadata: Metadata = pageMetadata({
  path: "/digital-marketing",
  title: "Digital Marketing",
  description: "Digital marketing that delivers — performance, SEO, paid and content that ships results.",
})

export default function DigitalMarketingPage() {
  return (
    <div className="dig-topfade relative w-full overflow-hidden -mt-[72px] pt-[72px]">
      {/* Seam melt: grain (same texture + density as .hero-noise) over the whole
          top wash, plus a wide feathered blur straddling wherever the hero
          boundary lands. Both scroll away with the page; header (z-50) sits above. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[520px]"
        style={{
          backgroundImage: "url(/digital-marketing-assets/assets/imgNoiseTexture.png)",
          backgroundSize: "2048px 2048px",
          opacity: 0.1,
          maskImage: "linear-gradient(to bottom, black 0px, black 380px, transparent 520px)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0px, black 380px, transparent 520px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[280px] backdrop-blur-[5px]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 30px, black 110px, black 190px, transparent 270px)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 30px, black 110px, black 190px, transparent 270px)",
        }}
      />
      {/* Direct mount under #marketing-scope. Scoped CSS isolates tokens so ZeroSlash chrome never bleeds.
          Copy and image paths live in ./marketingHtml.ts; the engines it drives are in public/digital-marketing-assets/js. */}
      <MarketingView />

      {/* Slot for your other project — isolated, outside #marketing-scope so it never inherits marketing tokens.
          e.g. <YourOtherProject /> will be inserted here when ready. */}
      <div id="digital-marketing-slot" className="hidden" />
    </div>
  )
}
