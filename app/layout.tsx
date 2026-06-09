import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Header } from "@/ui/header"
import { ThemeProvider } from "@/components/theme-provider"
import { faqSchema } from "./faq-schema"
// AnalyticsListener removed temporarily

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
    "international web design",
    "global digital agency",
    "SEO services",
    "e-commerce development",
    "shopify experts",
    "custom web development",
    "UI/UX design",
    "digital marketing agency",
  ],
  applicationName: SITE_NAME,
  generator: "Next.js",
  authors: [{ name: "ZeroSlash Agency" }],
  creator: "ZeroSlash Agency",
  publisher: "ZeroSlash Agency",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
      "en-GB": SITE_URL,
      "en-IN": SITE_URL,
      "x-default": SITE_URL,
    },
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
        url: "/images/zero-agency-logo.png",
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
        url: "/images/zero-agency-logo.png",
        alt: `${SITE_NAME} Open Graph Image`,
      },
    ],
  },
  icons: {
    icon: [
      { url: "/images/zero-agency-logo.png", type: "image/png", sizes: "32x32" },
      { url: "/images/zero-agency-logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/images/zero-agency-logo.png",
    shortcut: "/images/zero-agency-logo.png",
  },
  verification: {
    google: "913dXJVGzJHNm__G_CPsML1r98xkLM9oLG-wjJIo5hM",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
      </head>
      <body className={`${displaySerif.variable} ${sans.variable} ${mono.variable} antialiased`}>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5WHBQG0GVE"}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5WHBQG0GVE"}');
          `}
        </Script>

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1518659636377702');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1518659636377702&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
                logo: new URL("/images/logo.svg", SITE_URL).toString(),
                description: "We design, build, and grow high‑performance websites, marketing, and automation that deliver measurable business results.",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Chennai",
                  addressRegion: "Tamil Nadu",
                  addressCountry: "IN",
                },
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+91-95002-55291",
                  contactType: "customer service",
                  email: "hello@zeroslash.in",
                  availableLanguage: ["English"],
                },
                sameAs: [
                  "https://www.linkedin.com/in/mubarak-a-xyz/",
                  "https://instagram.com/zeroslashx1",
                  "https://github.com/zeroslashx1",
                ],
                areaServed: ["IN", "US", "GB", "AU", "CA", "AE"],
                knowsAbout: [
                  "Web Design",
                  "Web Development",
                  "Digital Marketing",
                  "SEO",
                  "E-commerce",
                  "Branding",
                  "UI/UX Design",
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
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ProfessionalService",
                name: SITE_NAME,
                image: new URL("/images/zero-agency-logo.png", SITE_URL).toString(),
                "@id": SITE_URL,
                url: SITE_URL,
                telephone: "+91-95002-55291",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Chennai",
                  addressRegion: "Tamil Nadu",
                  addressCountry: "IN",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 13.0827,
                  longitude: 80.2707,
                },
                priceRange: "$$",
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "5.0",
                  reviewCount: "76",
                },
              }),
            }}
          />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Services",
                    item: `${SITE_URL}/services`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Work",
                    item: `${SITE_URL}/work`,
                  },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: "About",
                    item: `${SITE_URL}/about`,
                  },
                  {
                    "@type": "ListItem",
                    position: 5,
                    name: "Contact",
                    item: `${SITE_URL}/contact`,
                  },
                ],
              }),
            }}
          />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqSchema),
            }}
          />
        </ThemeProvider>
        {/* Vercel Speed Insights */}
        <SpeedInsights />
      </body>
    </html>
  )
}
