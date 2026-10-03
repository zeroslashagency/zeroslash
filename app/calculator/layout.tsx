import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  path: "/calculator",
  title: "Website Cost Calculator",
  description:
    "Estimate the cost and timeline of your website, e-commerce store, or web app in a few steps. Free and instant.",
})

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
