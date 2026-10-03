import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  path: "/waitlist",
  title: "Join the Waitlist",
  description: "Get early access to new ZeroSlash services and updates. Join the waitlist.",
})

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
