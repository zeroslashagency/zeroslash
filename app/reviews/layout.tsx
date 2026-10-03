import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  path: "/reviews",
  title: "Client Reviews",
  description: "What clients say about working with ZeroSlash on their websites, branding, and digital growth.",
})

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
