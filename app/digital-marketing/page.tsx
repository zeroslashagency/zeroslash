export const dynamic = 'force-static'

import type { Metadata } from "next"
import ZkView from "./ZkView"
import "./zk-scope.css"

export const metadata: Metadata = {
  title: "Digital Marketing | ZeroSlash Agency",
  description: "Digital marketing that delivers — performance, SEO, paid and content that ships results.",
}

export default function DigitalMarketingPage() {
  return (
    <div className="w-full overflow-hidden bg-[rgb(251,250,248)] -mt-[72px] pt-[72px]">
      {/* B — direct mount under #zk-scope. Scoped CSS isolates tokens so ZeroSlash chrome never bleeds.
          Content + images are content-only: edit app/digital-marketing/content.ts and keep same filenames to rebrand to 0/ */}
      <ZkView />

      {/* Slot for your other project — isolated, outside #zk-scope so it never inherits marketing tokens.
          e.g. <YourOtherProject /> will be inserted here when ready. */}
      <div id="digital-marketing-slot" className="hidden" />
    </div>
  )
}
