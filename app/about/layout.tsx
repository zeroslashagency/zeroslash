import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  path: "/about",
  title: "About Us",
  description:
    "Meet ZeroSlash, a Chennai-based digital agency designing, building, and growing websites for clients worldwide.",
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
