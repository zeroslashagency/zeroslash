import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  path: "/contact",
  title: "Contact",
  description:
    "Talk to ZeroSlash about your website, branding, or marketing project. Email, call, or message us directly.",
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
