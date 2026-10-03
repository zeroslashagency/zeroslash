// Single source for public contact details and social profiles.

export const CONTACT = {
  email: "hello@zeroslash.in",
  phoneDisplay: "+91 95002 55291",
  phoneHref: "tel:+919500255291",
} as const

export const SOCIAL = {
  linkedin: "https://www.linkedin.com/in/mubarak-a-xyz/",
  instagram: "https://instagram.com/zeroslashx1",
  github: "https://github.com/zeroslashx1",
  x: "https://x.com/zeroslashx1",
} as const

// Number of reviews listed on /reviews. Visible rating copy and the
// AggregateRating structured data both use it, so keep it in sync.
export const REVIEW_COUNT = 16
export const RATING = "5.0"

export const SOCIAL_LIST = [
  { label: "LinkedIn", short: "in", href: SOCIAL.linkedin },
  { label: "Instagram", short: "ig", href: SOCIAL.instagram },
  { label: "X", short: "x", href: SOCIAL.x },
  { label: "GitHub", short: "gh", href: SOCIAL.github },
] as const
