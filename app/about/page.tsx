"use client"
// import Link from "next/link"
import { Star, Sparkles } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
} from "@/ui/dialog"
import ProjectWizard from "@/components/ProjectWizard"
import {
  CardSwipeClient,
  TiltedCardClient,
  CircularTextClient,
  FlipLinkClient,
} from "@/components/about/client-widgets"

const ACCENT_LIME = "#b7ff63"

// Client widgets are dynamically imported inside `components/about/client-widgets.tsx`

export default function AboutPage() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white">
      {/* Hero */}
      <section className="relative w-full h-[100vh] overflow-visible bg-white text-black dark:bg-white dark:text-black">
        {/* Background underlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/about wall.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "50% 85%",
            backgroundSize: "cover",
            backgroundColor: "transparent",
          }}
          aria-label="About studio wall"
          role="img"
        />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full text-center px-4 pt-2 md:pt-4 lg:pt-6 transform -translate-y-8 md:-translate-y-12">
          <div className="mt-3 md:mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs tracking-widest uppercase ring-1 ring-border/60 text-black/70 bg-white/70 dark:bg-white/10 dark:text-black/70 backdrop-blur-sm">
            <span>About</span>
          </div>
          <h1
            className="mt-2 font-black leading-[0.95] tracking-tight !text-black dark:!text-black"
            style={{ fontFamily: "var(--font-display-serif)" }}
          >
            <span className="block text-3xl md:text-5xl lg:text-6xl tracking-[0.02em] -mt-2 md:-mt-4 mb-0 md:mb-0.5 !text-black dark:!text-black">WE’RE   ALL</span>
            <span className="block text-3xl md:text-5xl lg:text-6xl !text-black dark:!text-black">
              <span className="mr-4 md:mr-6 !text-black dark:!text-black">ABOUT</span>
              <span className="inline-block ml-1 md:ml-2 !text-black dark:!text-black">DIGITAL</span>
            </span>
          </h1>
          {/* Intro paragraph and CTAs removed per request */}
        </div>
      </section>

      {/* Project Wizard Modal */}
      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      
      {/* Features section removed per request */}

      {/* Tagline Hero */}
      <section id="about-tagline" className="relative w-full overflow-hidden py-20 md:py-28 bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Ribbon tag */}
          <div className="relative">
            <div className="absolute right-2 -top-6 rotate-6 select-none">
              <div className="inline-flex items-center gap-2 rounded-md bg-pink-300 text-pink-900 px-3 py-1 text-[10px] font-bold shadow-sm">
                <span>EXPERIENCE</span>
                <span className="opacity-60">•</span>
                <span>3+ YRS</span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center">
            <h2 className="mx-auto font-extrabold leading-[0.95] tracking-tight text-5xl md:text-7xl lg:text-8xl">
              <span className="block">3+ YEARS AND</span>
              <span className="mt-4 inline-flex items-center justify-center gap-4">
                <span className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-lime-200 text-2xl md:text-3xl">✌️</span>
                <span>STILL KILLIN’ IT</span>
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-base md:text-lg text-foreground/70 dark:text-white/70">
              Since our launch, ZeroSlash Agency has partnered with ambitious brands to craft impactful digital experiences that convert, scale, and deliver results.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different (moved under Tagline) */}
      <section id="what-makes-us-different" className="relative w-full overflow-hidden py-20 md:py-24 bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white">
        {/* premium subtle radial background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-40"
          style={{
            background:
              "radial-gradient(1200px 400px at 50% -10%, rgba(183,255,99,0.12), transparent 55%), radial-gradient(900px 400px at 100% 10%, rgba(125,179,255,0.10), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div
            className="mb-8 md:mb-12 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              What Makes ZeroSlash Agency Different?
            </h2>
            <div className="mx-auto mt-4 h-[3px] w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${ACCENT_LIME}, transparent)` }} />
            <p className="mt-5 max-w-3xl mx-auto text-base md:text-lg text-foreground/70 dark:text-white/70">
              Bold strategies. Proven expertise. Real results. At ZeroSlash Agency, we combine creativity, strategy, and execution to drive measurable growth and lasting impact for fitness and gym businesses.
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <li
              className="space-y-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm shadow-sm shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow duration-300"
            >
              <h3 className="text-xl md:text-2xl font-bold">Proven Expertise</h3>
              <p className="text-foreground/70 dark:text-white/70">
                With years of hands-on experience, countless successful projects, and industry-recognised results, ZeroSlash Agency knows what works—and how to make it happen fast.
              </p>
            </li>
            <li
              className="space-y-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm shadow-sm shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow duration-300"
            >
              <h3 className="text-xl md:text-2xl font-bold">Strategic Execution</h3>
              <p className="text-foreground/70 dark:text-white/70">
                Every move we make is backed by data and designed to deliver measurable growth. We don’t guess—we strategise, implement, and optimise for maximum ROI.
              </p>
            </li>
            <li
              className="space-y-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm shadow-sm shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow duration-300"
            >
              <h3 className="text-xl md:text-2xl font-bold">Efficiency That Delivers</h3>
              <p className="text-foreground/70 dark:text-white/70">
                Our streamlined processes, seamless teamwork, and clear communication keep every project on track and impactful—no wasted time, no unnecessary costs.
              </p>
            </li>
            <li
              className="space-y-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm shadow-sm shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow duration-300"
            >
              <h3 className="text-xl md:text-2xl font-bold">We Design. We Build. We Grow.</h3>
              <p className="text-foreground/70 dark:text-white/70">
                As a full-service digital partner, ZeroSlash Agency turns strategy into action. We create, execute, and refine high-performance websites, marketing campaigns, and automation that deliver measurable results.
              </p>
            </li>
            <li
              className="space-y-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm shadow-sm shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow duration-300"
            >
              <h3 className="text-xl md:text-2xl font-bold">No Fluff. Just Results.</h3>
              <p className="text-foreground/70 dark:text-white/70">
                We’re straight-talking, down-to-earth professionals who make digital simple, effective, and profitable for your business.
              </p>
            </li>
            <li
              className="space-y-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white/60 dark:bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm shadow-sm shadow-black/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-shadow duration-300"
            >
              <h3 className="text-xl md:text-2xl font-bold">We Make Digital Work for You</h3>
              <p className="text-foreground/70 dark:text-white/70">
                ZeroSlash Agency is a close-knit team combining creativity, strategy, and execution to deliver real impact. Let’s build something that grows your business and keeps you ahead of the competition.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Card Carousel (now follows differentiators) */}
      <section id="card-carousel" className="relative w-full overflow-hidden py-16 md:py-20 bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-5 rounded-full border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-white/5">
              <Sparkles className="h-4 w-4 mr-1" /> Latest component
            </Badge>
            <h2 className="text-3xl md:text-5xl font-semibold">Card Carousel</h2>
            <p className="mt-2 text-foreground/70 dark:text-white/60">Seamless Images carousel animation.</p>
          </div>

          <div className="mt-8 md:mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center">
              {/* Left: Card swipe */}
              <div className="w-full max-w-[520px] mx-auto lg:mx-0 lg:ml-[-16px] xl:ml-[-32px]">
                <CardSwipeClient
                  images={[
                    { src: "/images/about/generated-image.png", alt: "About image 1" },
                    { src: "/images/about/generated-image (2).png", alt: "About image 2" },
                    { src: "/images/about/generated-image (3).png", alt: "About image 3" },
                    { src: "/images/about/generated-image (5).png", alt: "About image 4" },
                  ]}
                  autoplayDelay={2600}
                  slideShadows={false}
                  speedMs={900}
                />
              </div>

              {/* Right: Heading, copy, actions */}
              <div className="px-2 md:px-4">
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-800 dark:text-white">
                  YOUR TRUSTED
                  <br />
                  DIGITAL PARTNER
                </h3>
                <p className="mt-4 text-neutral-700/90 dark:text-white/70 leading-relaxed">
                  At ZeroSlash Agency, we help fitness, lifestyle, and growing businesses unlock their full digital potential. Based in India and working with clients worldwide, we deliver high-end web design, powerful marketing, and smart automation—all crafted to your unique needs.
                </p>
                <p className="mt-4 text-neutral-700/90 dark:text-white/70 leading-relaxed">
                  Since our beginnings, we’ve built a reputation for clarity, creativity, and execution—transforming brands with innovative digital strategies, scalable development, and designs that perform.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setWizardOpen(true)}
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-black dark:text-black bg-emerald-400 hover:bg-emerald-300 transition-colors"
                    type="button"
                  >
                    Start Your Project
                  </button>
                  <a
                    href="#about"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-black/10 text-neutral-800 hover:bg-black/5 dark:text-white dark:border-white/15 transition-colors"
                  >
                    Our Story
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work section removed per request */}

      {/* Careers CTA (moved up to follow Card Carousel) */}
      <section id="careers-cta" className="relative w-full overflow-hidden py-12 md:py-16 bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div
            className="text-center p-4 md:p-6"
          >
            <h2 className="text-3xl md:text-5xl font-semibold">Want to join us?</h2>
            <p className="mt-2 md:mt-3 text-foreground/70 dark:text-white/70 max-w-2xl mx-auto">
              We’re always on the lookout for talented people to join our growing team. If you see a role that fits, we’d love to hear from you.
            </p>
            <div className="mt-4">
              <a
                href="/careers"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm md:text-base font-semibold border border-emerald-500/60 text-emerald-600 hover:text-black dark:hover:text-black bg-transparent hover:bg-emerald-400/80 transition-colors"
              >
                View Open Roles
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work section removed per request */}

      {/* About Stats section removed per request */}

      

      
      {/* Social links with flip effect (hidden on mobile) */}
      <section id="social-flip-links" className="relative w-full overflow-hidden py-16 md:py-24 bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white hidden md:block">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-8 rounded-[14px] border border-black/10 bg-white text-sm dark:border-white/10 dark:bg-white/5">
              <Sparkles className="h-4 w-4 mr-1" /> Hover Over Links
            </Badge>
          </div>
          <div className="mx-auto grid gap-5 md:gap-7 place-items-center">
            {/* Row: Portfolio (briefcase SVG) */}
            <div className="group flex items-center gap-6 md:gap-8 w-full max-w-5xl">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl grid place-items-center transition-colors duration-200 bg-black/10 dark:bg-white/10 group-hover:bg-[#00C853]">
                <svg
                  className="h-16 w-16 md:h-20 md:w-20 text-black dark:text-black group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v7A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-7Z" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M3 11h18" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="font-black tracking-tight text-5xl md:text-7xl lg:text-8xl">
                <FlipLinkClient href="/portfolio">PORTFOLIO</FlipLinkClient>
              </div>
            </div>

            {/* Row: Instagram (camera SVG) */}
            <div className="group flex flex-row-reverse items-center gap-4 md:gap-6 w-full max-w-5xl">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl grid place-items-center transition-colors duration-200 bg-black/10 dark:bg-white/10 group-hover:bg-[linear-gradient(45deg,#f58529,#feda77,#dd2a7b,#8134af,#515bd4)]">
                <svg
                  className="h-16 w-16 md:h-20 md:w-20 text-black dark:text-black group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
                </svg>
              </div>
              <div className="font-black tracking-tight text-5xl md:text-7xl lg:text-8xl">
                <FlipLinkClient href="https://instagram.com">INSTAGRAM</FlipLinkClient>
              </div>
            </div>

            {/* Row: LinkedIn (real logo, bigger) */}
            <div className="group flex items-center gap-6 md:gap-8 w-full max-w-5xl">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl grid place-items-center transition-colors duration-200 bg-black/10 dark:bg-white/10 group-hover:bg-[#0077B5]">
                {/* LinkedIn logo SVG */}
                <svg
                  className="h-16 w-16 md:h-20 md:w-20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path className="text-black dark:text-black group-hover:text-white" d="M20.447 20.452h-3.554v-5.569c0-1.328-.025-3.036-1.85-3.036-1.853 0-2.136 1.445-2.136 2.939v5.666H9.354V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.37-1.85 3.604 0 4.269 2.371 4.269 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.996 20.452H3.676V9h3.32v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div className="font-black tracking-tight text-5xl md:text-7xl lg:text-8xl">
                <FlipLinkClient href="https://linkedin.com">LINKEDIN</FlipLinkClient>
              </div>
            </div>

            {/* Row: GitHub (octocat mark) */}
            <div className="group flex flex-row-reverse items-center gap-4 md:gap-6 w-full max-w-5xl">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl grid place-items-center transition-colors duration-200 bg-black/10 dark:bg-white/10 group-hover:bg-black">
                <svg
                  className="h-16 w-16 md:h-20 md:w-20 text-black dark:text-black group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.86 3.15 8.98 7.51 10.43.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.67-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.61-1.22-1.61-.99-.67.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.91.1-.71.38-1.2.69-1.48-2.44-.28-5-1.22-5-5.43 0-1.2.43-2.19 1.13-2.96-.11-.28-.49-1.41.11-2.94 0 0 .93-.3 3.05 1.13A10.6 10.6 0 0 1 12 5.8c.94.01 1.89.13 2.78.38 2.12-1.43 3.05-1.13 3.05-1.13.6 1.53.22 2.66.11 2.94.7.77 1.13 1.76 1.13 2.96 0 4.22-2.56 5.15-5 5.43.39.34.73 1.01.73 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.76.53 4.35-1.45 7.5-5.57 7.5-10.43C23.02 5.24 18.27.5 12 .5Z"/>
                </svg>
              </div>
              <div className="font-black tracking-tight text-5xl md:text-7xl lg:text-8xl">
                <FlipLinkClient href="https://github.com">GITHUB</FlipLinkClient>
              </div>
            </div>

            {/* Row: Email (envelope) */}
            <div className="group flex items-center gap-6 md:gap-8 w-full max-w-5xl">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl grid place-items-center transition-colors duration-200 bg-black/10 dark:bg-white/10 group-hover:bg-[#E0E0E0]">
                <svg
                  className="h-16 w-16 md:h-20 md:w-20 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="font-black tracking-tight text-5xl md:text-7xl lg:text-8xl">
                <FlipLinkClient href="mailto:zeroslashx1@gmail.com">EMAIL</FlipLinkClient>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Outro (moved below Social) */}
      <section id="portfolio-outro" className="relative w-full overflow-hidden py-20 md:py-28 bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Headshot / Hero visual */}
            <div className="order-1 lg:order-1 mb-8 lg:mb-0">
              <div className="relative w-full aspect-[4/5] md:aspect-[5/6]">
                <TiltedCardClient
                  imageSrc="/images/about/me.png"
                  altText="Mubarak A headshot"
                  containerHeight="100%"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  scaleOnHover={1}
                  rotateAmplitude={6}
                  showMobileWarning={false}
                  showTooltip={false}
                />
              </div>
            </div>

            {/* Copy & CTAs */}
            <div className="order-2 lg:order-2">
              <h2 className="font-extrabold leading-[0.95] tracking-tight text-4xl md:text-6xl">
                <span className="block">Great things</span>
                <span className="block">can happen</span>
                <span className="block">with a simple</span>
                <span className="block">“Let’s work together.”</span>
              </h2>

              <div className="mt-6 md:mt-8">
                <div className="text-lg md:text-xl font-semibold">Mubarak A</div>
                <div className="text-foreground/70 dark:text-white/70">Founder & Creative Director — ZeroSlash Agency</div>
              </div>

              <p className="mt-5 text-foreground/80 dark:text-white/80 max-w-xl">
                I help brands grow through design that converts and strategies that scale. From high‑performance websites to data‑driven
                marketing, my work is about delivering impact, not just aesthetics.
              </p>

              <div className="mt-7 flex items-center gap-4 md:gap-5 justify-between">
                <div className="flex flex-wrap items-center gap-4 md:gap-5">
                  <a
                    href="https://www.linkedin.com/in/mubarak-a-xyz/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm md:text-base font-semibold text-black dark:text-black shadow-sm hover:shadow transition-colors"
                    style={{ backgroundColor: ACCENT_LIME }}
                  >
                    🔗 Connect with me on LinkedIn
                  </a>
                  <a href="https://instagram.com/zeroslashx1" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm md:text-base underline underline-offset-4 hover:opacity-90">
                    📷 Instagram — @zeroslashx1
                  </a>
                  <a href="mailto:zeroslashx1@gmail.com" className="inline-flex items-center gap-2 text-sm md:text-base underline underline-offset-4 hover:opacity-90">
                    💌 Email — zeroslashx1@gmail.com
                  </a>
                </div>
                <a href="https://portfoliox1-sooty.vercel.app/" target="_blank" rel="noreferrer" className="inline-block shrink-0">
                  <CircularTextClient
                    text="VIEW PORTFOLIO "
                    spinDuration={28}
                    onHover="speedUp"
                    className="w-[164px] h-[164px] md:w-[184px] md:h-[184px] !text-black dark:!text-white [&>span]:text-[26px] md:[&>span]:text-[32px]"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews stack (moved to bottom) */}
      <section id="reviews-stacked" className="relative w-full overflow-hidden py-16 md:py-24 bg-white text-foreground dark:bg-[#0b0b0e] dark:text-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="text-[12px] uppercase tracking-widest text-foreground/60 dark:text-white/60">Rating & Reviews</div>
          <h2 className="mt-2 text-3xl md:text-5xl font-semibold">Trusted by people</h2>

          <div className="relative mt-10 md:mt-14 h-[360px] md:h-[420px]">
            {/* Card 1 */}
            <div className="absolute left-1/2 md:left-[10%] -translate-x-1/2 md:translate-x-0 top-[18%] -rotate-6 w-60 md:w-72 rounded-2xl p-5 text-left shadow-xl ring-1 ring-black/10 dark:ring-white/10 bg-black text-white transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-2xl will-change-transform">
              <div className="flex text-yellow-400">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4" />))}</div>
              <p className="mt-3 text-sm leading-relaxed opacity-90">ZeroSlash transformed our digital presence in days. The interactive menu and NYC café vibe? Spot-on. Customers keep complimenting how easy it is to order iced coffee on their phones!”</p>
              <div className="mt-4 text-xs opacity-70">Samantha R., Dec’s Café</div>
            </div>

            {/* Card 2 */}
            <div className="absolute left-1/2 md:left-[33%] -translate-x-1/2 md:translate-x-0 top-[6%] -rotate-3 w-60 md:w-72 rounded-2xl p-5 text-left shadow-xl ring-1 ring-black/10 dark:ring-white/10 bg-white text-black dark:bg-white/10 dark:text-white transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-2xl will-change-transform">
              <div className="flex text-yellow-400">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4" />))}</div>
              <p className="mt-3 text-sm leading-relaxed opacity-90">Our new site feels as warm as our sourdough. They captured our brand’s heart – simple, wholesome, and mobile-friendly. Orders jumped 30% in Week 1!</p>
              <div className="mt-4 text-xs opacity-70">Maria L., The Perfect Fresh Bread</div>
            </div>

            {/* Card 3 */}
            <div className="absolute left-1/2 md:left-[56%] -translate-x-1/2 md:translate-x-0 top-[16%] rotate-3 w-60 md:w-72 rounded-2xl p-5 text-left shadow-xl ring-1 ring-black/10 dark:ring-white/10 bg-white text-black dark:bg-white/10 dark:text-white transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-2xl will-change-transform">
              <div className="flex text-yellow-400">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4" />))}</div>
              <p className="mt-3 text-sm leading-relaxed opacity-90">I expected a basic site. Got way more: WhatsApp booking, fabric gallery, and even a 24-hour turnaround. These folks CARE.</p>
              <div className="mt-4 text-xs opacity-70">Ravi G., Stitch Story</div>
            </div>

            {/* Card 4 (accent) */}
            <div className="absolute left-1/2 md:left-[22%] -translate-x-1/2 md:translate-x-0 top-[46%] rotate-6 w-60 md:w-72 rounded-2xl p-5 text-left shadow-xl ring-1 ring-black/10 dark:ring-white/10 transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-2xl will-change-transform" style={{ backgroundColor: ACCENT_LIME }}>
              <div className="flex text-black/80">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4" />))}</div>
              <p className="mt-3 text-sm leading-relaxed text-black/90">Thought my biz was too small for a pro site. ZeroSlash proved me wrong – elegant gallery, Hindi/English toggle, and bookings via Instagram.</p>
              <div className="mt-4 text-xs text-black/70">Farah B., Henna by Farah</div>
            </div>

            {/* Card 5 */}
            <div className="absolute left-1/2 md:left-[45%] -translate-x-1/2 md:translate-x-0 top-[54%] -rotate-2 w-60 md:w-72 rounded-2xl p-5 text-left shadow-xl ring-1 ring-black/10 dark:ring-white/10 bg-white text-black dark:bg-white/10 dark:text-white transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-2xl will-change-transform">
              <div className="flex text-yellow-400">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4" />))}</div>
              <p className="mt-3 text-sm leading-relaxed opacity-90">Wanted calm, not complexity. They delivered: soft colors, easy class schedule, and a ‘Book Trial’ button that just works.</p>
              <div className="mt-4 text-xs opacity-70">Kavita J., Flow Yoga Studio</div>
            </div>
          </div>
        </div>
      </section>



    </div>
  )
}