import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Header } from "@/ui/header"
import { ThemeProvider } from "@/components/theme-provider"

const displaySerif = Playfair_Display({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["600", "800", "900"],
})

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const SITE_NAME = "ZeroSlash Agency"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zeroslash.in"
const SITE_TWITTER = "@zeroslashx1"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Digital Solutions That Deliver Results`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "We design, build, and grow high‑performance websites, marketing, and automation that deliver measurable business results.",
  keywords: [
    "web design",
    "web development",
    "digital agency",
    "branding",
    "marketing",
    "automation",
    "India",
  ],
  applicationName: SITE_NAME,
  generator: "Next.js",
  authors: [{ name: "ZeroSlash Agency" }],
  creator: "ZeroSlash Agency",
  publisher: "ZeroSlash Agency",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Digital Solutions That Deliver Results`,
    description:
      "We design, build, and grow high‑performance websites, marketing, and automation that deliver measurable business results.",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Open Graph Image`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_TWITTER,
    creator: SITE_TWITTER,
    title: `${SITE_NAME} — Digital Solutions That Deliver Results`,
    description:
      "We design, build, and grow high‑performance websites, marketing, and automation that deliver measurable business results.",
    images: [
      {
        url: "/placeholder-logo.png",
        alt: `${SITE_NAME} Open Graph Image`,
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displaySerif.variable} ${sans.variable} ${mono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="pt-[60px] md:pt-[80px]">{children}</main>
          {/* Organization & WebSite JSON-LD */}
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
                logo: new URL("/placeholder-logo.png", SITE_URL).toString(),
                sameAs: [
                  "https://www.linkedin.com/in/mubarak-a-xyz/",
                  "https://instagram.com/zeroslashx1",
                  "https://github.com/zeroslashx1",
                ],
              }),
            }}
          />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${SITE_URL}/search?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
