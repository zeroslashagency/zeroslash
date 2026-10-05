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
    <div className="dig-topfade relative w-full overflow-x-clip overflow-y-visible -mt-[72px] pt-[72px]">
      {/* Direct mount under #marketing-scope. Scoped CSS isolates tokens so ZeroSlash chrome never bleeds.
          Copy and image paths live in ./marketingHtml.ts; the engines it drives are in public/digital-marketing-assets/js. */}
      <MarketingView />

      {/* Slot for your other project — isolated, outside #marketing-scope so it never inherits marketing tokens.
          e.g. <YourOtherProject /> will be inserted here when ready. */}
      <div id="digital-marketing-slot" className="hidden" />
    </div>
  )
}
