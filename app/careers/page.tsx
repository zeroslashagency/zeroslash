import { redirect } from "next/navigation"

export default function CareersRedirectPage() {
  // Immediate server-side redirect to external careers site
  redirect("/wishlist")
}
