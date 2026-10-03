import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  path: "/services",
  title: "Services We Offer",
  description:
    "Conversion-focused web design, bold branding, and data-driven marketing. Premium delivery tailored for results.",
})

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
