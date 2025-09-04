"use client"

export const dynamic = 'force-static'

import Link from "next/link"
import Image from "next/image"
import ShinyText from "../components/ShinyText"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollReveal } from "@/ui/scroll-reveal"
import { ScrollFloat } from "@/ui/scroll-float"
import { ArrowRight, Sparkles, Box, Layers, Sparkle, Search, Cog, Rocket, Star, Diamond, Check } from "lucide-react"
import nextDynamic from "next/dynamic"
import CountUpOnView from "../components/CountUpOnView"
import SectionPill from "@/components/SectionPill"
import ShineBorder from "@/components/magicui/shine-border"
import FlowConnector from "@/components/FlowConnector"
import ContactButton from "@/components/ContactButton"
import ProjectWizard from "@/components/ProjectWizard"
import { VelocityScroll } from "@/components/VelocityScroll"
import { LazyOnView } from "@/ui/lazy-on-view"
import { useState } from "react"
const ServicesSection = nextDynamic(() => import("@/components/sections/Services"), { ssr: false, loading: () => null })
const TestimonialsSection = nextDynamic(() => import("@/components/sections/Testimonials"), { ssr: false, loading: () => null })

const CurvedLoop = nextDynamic(() => import("../src/blocks/TextAnimations/CurvedLoop/CurvedLoop"), { ssr: false, loading: () => null })
// (removed unused DynamicFlowConnector)

export default function Home() {
  const [wizardOpen, setWizardOpen] = useState(false)
  return (
    <div className="w-full bg-background">
      {/* Full-screen Hero Section (contain background, no crop) */}
      <section id="hero" className="relative w-[100vw] h-[100svh] overflow-hidden bg-background">
        {/* Background underlay switched to next/image for better LCP */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/about wall.png"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-contain"
          />
        </div>

        {/* Masthead meta */}
        <div className="absolute top-6 left-4 md:left-6 z-10">
          <div className="flex items-center gap-3 text-[11px] md:text-xs tracking-widest uppercase text-foreground/60">
            <span>Vol. 01</span>
            <span className="h-px w-6 bg-foreground/20" />
            <span>2025</span>
            <span className="h-px w-6 bg-foreground/20" />
            <span>Design Studio & Editorial</span>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end min-h-[100svh] py-20">
            {/* Left: Kicker + Headline */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-card/70 backdrop-blur border border-border text-foreground/80 text-sm font-medium w-fit">
                <Image src="/images/zero-agency-logo.png" alt="ZeroSlash Agency" width={20} height={20} className="mr-2 block dark:hidden" />
                <Image src="/images/zero-agency-logo.png" alt="ZeroSlash Agency" width={20} height={20} className="mr-2 hidden dark:block invert" />
                <ShinyText text="Studio & Editorial" speed={3} />
                 </div>

              <h1 className="font-black leading-[0.95] tracking-tight text-foreground" style={{ fontFamily: "var(--font-display-serif)" }}>
                <ScrollReveal delay={40}>
                  <span className="block text-5xl md:text-7xl lg:text-8xl">Timeless Craft.</span>
                </ScrollReveal>
                <ScrollReveal delay={140}>
                  <span className="block text-5xl md:text-7xl lg:text-8xl">Cutting‑Edge Delivery.</span>
                </ScrollReveal>
              </h1>

              <ScrollReveal>
                <p className="max-w-xl text-lg md:text-xl text-foreground/70">
                  Bespoke brands and digital experiences with editorial precision. Built to perform.
                </p>
              </ScrollReveal>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setWizardOpen(true)} className="px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-primary text-foreground hover:brightness-105 transition shadow-sm ring-1 ring-primary/30" aria-label="Start a project">
                  Start a project
                </Button>
                <Button asChild variant="ghost" className="px-8 py-3 rounded-full text-base md:text-lg text-foreground hover:bg-foreground/5 border border-border/60" aria-label="View selected work">
                  <Link href="/work">View selected work</Link>
                </Button>
              </div>
            </div>

            {/* Right: Editorial cover lines */}
            <div className="lg:col-span-5">
              <div className="space-y-4 lg:space-y-5">
                {["Brand Identity Systems","High-Performance Websites","Custom Design Systems"].map((line, i) => (
                  <ScrollReveal key={line} delay={120 * i} direction="up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-6 border-b border-border/60 py-3">
                      <span className="flex items-center gap-2 text-[10px] sm:text-xs tracking-widest uppercase text-foreground/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/70" /> Feature
                      </span>
                      <span className="text-base sm:text-lg md:text-xl font-medium text-foreground">{line}</span>
                </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom credits and scroll cue */}
        <div className="hidden md:block absolute bottom-6 left-4 md:left-6 z-10 text-[11px] md:text-xs text-foreground/60">
          Cover: Studio shot — © ZeroSlash
        </div>
        <div className="hidden md:flex absolute bottom-6 right-1/2 translate-x-1/2 z-10 flex-col items-center gap-2 text-foreground/60">
          <span className="text-[11px] md:text-xs tracking-widest uppercase">Scroll</span>
          <span className="h-8 w-px bg-foreground/30" />
        </div>
      </section>

      {/* Project Wizard Modal */}
      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      {/* Brand logos row */}
      <section className="w-full py-10 bg-background hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[
              'AURORA',
              'NEXUS',
              'HALCYON',
              'PRISM',
              'QUANTUM',
            ].map((brand) => (
              <div key={brand} className="px-5 py-2 rounded-full bg-white/5 text-white/70 text-sm md:text-base border border-white/10">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work - Neon minimal 3 steps */}
      <section className="w-full py-16 bg-background hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 text-white/80 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                How We Work
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Minimal. Bold. Effective.
              </h2>
            </div>

            {/* Steps row with neon arrows */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 items-start gap-10 md:gap-8">
              {/* Step 1 */}
              <div className="text-center space-y-5">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center neon-ring bg-transparent dark:bg-[rgba(158,255,0,0.08)]">
                  <Search className="w-9 h-9 text-foreground dark:text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground dark:text-white uppercase tracking-wide">Discover</h3>
                <p className="text-base text-foreground/70 dark:text-white/60">
                  Understand goals, audience, and constraints clearly.
                </p>
              </div>

              {/* Arrow 1 (hidden on mobile) */}
              <div className="hidden md:flex items-center justify-center">
                <svg width="120" height="12" viewBox="0 0 120 12" fill="none" aria-hidden="true">
                  <path d="M2 6 H112" className="arrow-neon" />
                  <path d="M104 2 L112 6 L104 10" className="arrow-neon" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-5">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center neon-ring bg-transparent dark:bg-[rgba(158,255,0,0.08)]">
                  <Cog className="w-9 h-9 text-foreground dark:text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground dark:text-white uppercase tracking-wide">Design</h3>
                <p className="text-base text-foreground/70 dark:text-white/60">
                  Craft clean, purposeful interfaces and flows.
                </p>
              </div>

              {/* Arrow 2 (hidden on mobile) */}
              <div className="hidden md:flex items-center justify-center">
                <svg width="120" height="12" viewBox="0 0 120 12" fill="none" aria-hidden="true">
                  <path d="M2 6 H112" className="arrow-neon" />
                  <path d="M104 2 L112 6 L104 10" className="arrow-neon" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-5">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center neon-ring bg-transparent dark:bg-[rgba(158,255,0,0.08)]">
                  <Rocket className="w-9 h-9 text-foreground dark:text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground dark:text-white uppercase tracking-wide">Launch</h3>
                <p className="text-base text-foreground/70 dark:text-white/60">
                  Ship confidently and iterate with insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Removed: ConnectedCards and MinimalSteps sections per request */}

      {/* Marquee Animation Section */}
      <section className="w-full py-0 bg-background overflow-hidden -mb-12 md:-mb-16 lg:-mb-20 relative z-10 fade-top">
        <div className="w-screen max-w-none mx-[calc(50%-50vw)] px-0">
          <CurvedLoop
            marqueeText="  Be ✦   Creative  ✦   With  ✦   React  ✦   Bits ✦ "
            speed={2}
            curveAmount={200}
            direction="left"
            interactive={true}
            className="text-foreground/30"
          />
        </div>
      </section>

      {/* Dedicated to Delivering Results Section */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background relative z-20 pt-20 md:pt-24 lg:pt-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-card border border-border text-gray-600 dark:text-gray-300 text-sm font-medium mb-6 shadow-sm">
                   <Sparkles className="w-4 h-4 mr-2" />
                   <ShinyText text="Our Commitment" speed={2} />
                 </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                  Dedicated to
                  <br />
                  <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent animate-shine">
                    Delivering Results
                  </span>
                  <br />
                  for Top Brands
                </h2>
                <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Collaboration is at the core of everything we do. Your goals shape the strategy, drive our creative
                  innovation, and define success at every stage.
                </p>
              </div>

              {/* Decorative Card removed per request */}
              <LazyOnView>
                <div />
              </LazyOnView>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Premium About Us Section - <span className="animate-shine">How We Work</span> */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-card border border-border text-foreground/70 text-sm font-medium mb-6 shadow-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  How We Work
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                  Our Approach to
                  <br />
                  <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    Digital Excellence
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  At ZeroSlash Agency, we fuse deep research, reliable development, and bold creativity to deliver results that move your business forward.
                </p>
              </div>

              {/* Premium Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 md:mb-16">
                {/* Investigate deeply */}
                <ScrollFloat delay={0.1}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/12 to-transparent rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500"></div>
                    <div className="relative bg-card rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/80 group-hover:-translate-y-2">
                      <div className="mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-foreground text-background rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Box className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">
                          Investigate Deeply
                        </h3>
                      </div>
                      <p className="text-foreground/70 leading-relaxed text-base md:text-lg">
                        We dig beneath the surface — industry insights, user interviews, and real data drive every solution we create.
                      </p>

                      {/* Decorative element */}
                      <div className="absolute top-6 right-6 w-2 h-2 bg-foreground/30 rounded-full opacity-50"></div>
                    </div>
                  </div>
                </ScrollFloat>

                {/* Build reliably */}
                <ScrollFloat delay={0.2}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-transparent rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-500"></div>
                    <div className="relative bg-card rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/80 group-hover:-translate-y-2">
                      <div className="mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-foreground text-background rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Layers className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">Build Reliably</h3>
                      </div>
                      <p className="text-foreground/70 leading-relaxed text-base md:text-lg">
                        Development with purpose. We engineer scalable, high-performance systems that evolve with your growth.
                      </p>

                      {/* Decorative element */}
                      <div className="absolute top-6 right-6 w-2 h-2 bg-gray-300 rounded-full opacity-50"></div>
                    </div>
                  </div>
                </ScrollFloat>

                {/* Create boldly */}
                <ScrollFloat delay={0.3}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-transparent rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500"></div>
                    <div className="relative bg-card rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/80 group-hover:-translate-y-2">
                      <div className="mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-foreground text-background rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Sparkle className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">Create Boldly</h3>
                      </div>
                      <p className="text-foreground/70 leading-relaxed text-base md:text-lg">
                        From branding to user experience, we craft digital identities and designs that demand attention and deliver impact.
                      </p>

                      {/* Decorative element */}
                      <div className="absolute top-6 right-6 w-2 h-2 bg-gray-300 rounded-full opacity-50"></div>
                    </div>
                  </div>
                </ScrollFloat>
              </div>

              {/* Premium Minimal Stats Section: dominant numbers, clean layout */}
              <div className="py-8 md:py-10 lg:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12 items-start">
                  <CountUpOnView target={30} label="Projects Delivered" places={[10,1]} fontSize={72} suffix="+" textColor="var(--foreground)" />
                  <CountUpOnView target={98} label="Client Satisfaction" places={[10,1]} fontSize={72} suffix="%" textColor="var(--foreground)" />
                  <CountUpOnView target={3} label="Years Experience" places={[1]} fontSize={72} suffix="+" textColor="var(--foreground)" />
                  <CountUpOnView target={24} label="Support Available" places={[10,1]} fontSize={72} suffix="/7" textColor="var(--foreground)" />
                </div>
              </div>


            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Our Approach Flow Section */}
      <section className="w-full py-8 md:py-12 lg:py-16 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <div className="mb-6">
                <SectionPill label="How we work" dotClassName="bg-violet-400" shiny />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                At ZeroSlash Agency, we don’t just deliver projects — we build growth engines for your brand.
              </h2>
            </div>

            {/* Process Flow Cards with Dynamic Connector Lines */}
            <div id="flow-container" className="relative max-w-4xl mx-auto">
              {/* Dynamic overlay that connects pins 1→2→3→4 */}
              <FlowConnector containerId="flow-container" />
              {/* Step 1 - Define (Top Right) */}
              <div className="relative mb-32 md:mb-40 flex justify-end pr-4 md:pr-8" id="card-1">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl p-6 md:p-8 w-72 md:w-80 shadow-2xl transform rotate-6 hover:rotate-3 transition-all duration-300 relative"
                    style={{
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Pin (used for connector targeting) */}
                    <div data-flow-pin="true" className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-foreground shadow-lg ring-4 ring-card"></div>
                    </div>

                    <div className="pt-4">
                      <div className="text-sm text-foreground/50 font-medium mb-2">01</div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Define</h3>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        We start by understanding your goals, audience, and market position, creating a rock-solid strategy that sets the foundation for success.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector overlay handles 1→2 */}

              {/* Step 2 - Design (Left) */}
              <div className="relative mb-32 md:mb-40 flex justify-start pl-4 md:pl-8" id="card-2">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl p-6 md:p-8 w-72 md:w-80 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-300 relative"
                    style={{
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Pin */}
                    <div data-flow-pin="true" className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-foreground shadow-lg ring-4 ring-card"></div>
                    </div>

                    <div className="pt-4">
                      <div className="text-sm text-foreground/50 font-medium mb-2">02</div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Design</h3>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        Our team transforms insights into bold, user-focused designs that elevate your brand identity and captivate your audience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector overlay handles 2→3 */}

              {/* Step 3 - Build (Right) */}
              <div className="relative mb-32 md:mb-40 flex justify-end pr-4 md:pr-8" id="card-3">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl overflow-visible p-6 md:p-8 w-72 md:w-80 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-300 relative"
                    style={{
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Monotone Shine Border */}
                    <ShineBorder className="sb-animate opacity-25" shineColor="hsl(var(--foreground))" borderWidth={1} />
                    {/* Pin */}
                    <div data-flow-pin="true" className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-foreground shadow-lg ring-4 ring-card"></div>
                    </div>

                    <div className="pt-4">
                      <div className="text-sm text-foreground/50 font-medium mb-2">03</div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Build</h3>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        We engineer fast, scalable, and reliable solutions using modern technology and best practices — built to perform and grow with you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector overlay handles 3→4 */}

              {/* Step 4 - Launch (Left) */}
              <div className="relative mb-12 md:mb-16 flex justify-start pl-4 md:pl-8" id="card-4">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl p-6 md:p-8 w-72 md:w-80 shadow-2xl transform -rotate-4 hover:rotate-0 transition-all duration-300 relative"
                    style={{
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Pin */}
                    <div data-flow-pin="true" className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-foreground shadow-lg ring-4 ring-card"></div>
                    </div>

                    <div className="pt-4">
                      <div className="text-sm text-foreground/50 font-medium mb-2">04</div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">Launch</h3>
                      <p className="text-foreground/70 text-sm leading-relaxed">
                        From testing to rollout, we ensure a flawless launch backed by continuous support, updates, and optimisation to keep your digital presence thriving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector overlay handles tail to completion text if needed */}

              {/* Final completion text */}
              <div className="text-center mt-6 md:mt-8">
                <p className="text-foreground/60 italic text-base md:text-lg">Ready to be delivered!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (lazy) */}
      <LazyOnView>
        <ServicesSection />
      </LazyOnView>

      {/* <span className="animate-shine"><ShinyText text="Featured Work" speed={2} /></span> Section */}
      <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <div className="mb-4">
                <SectionPill label="Featured Work" dotClassName="bg-blue-400" shiny />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight tracking-tight">
                Recent projects that delivered
                <br />
                measurable results
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Dec's Cafe Case Study */}
              <Card className="bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/decs-cafe.png"
                    alt="Dec's Cafe - Premium Coffee Experience"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                    Coffee Shop
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Dec&#39;s Cafe</h3>
                  <p className="text-foreground/70 mb-6">Premium coffee experience with seamless online ordering</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      500+ customers
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      4.7★ rating
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      15+ varieties
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-border pl-4 italic text-foreground/70">
                    &ldquo;ZeroSlash transformed our digital presence in days. The interactive menu and NYC café vibe?
                    Spot-on. Customers keep complimenting how easy it is to order iced coffee on their phones!&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium">— Samantha R., Owner</footer>
                  </blockquote>
                </CardContent>
              </Card>

              {/* Fresh Bread Case Study */}
              <Card className="bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/fresh-bread.png"
                    alt="The Perfect Fresh Bread - Artisanal Bakery"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                    Bakery Website
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">The Perfect Fresh Bread</h3>
                  <p className="text-foreground/70 mb-6">Artisanal bakery with elegant e-commerce experience</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      300+ daily orders
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      4.9★ rating
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      60% growth
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-border pl-4 italic text-foreground/70">
                    &ldquo;Our new site feels as warm as our sourdough. They captured our brand&rsquo;s heart – simple, wholesome,
                    and mobile-friendly. Orders jumped 30% in Week 1!&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium">— Maria L., Head Baker</footer>
                  </blockquote>
                </CardContent>
              </Card>

              {/* Flow Yoga Studio Case Study */}
              <Card className="bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/yoga-studio.jpeg"
                    alt="Flow Yoga Studio - Wellness & Classes"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                    Fitness & Wellness
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Flow Yoga Studio</h3>
                  <p className="text-foreground/70 mb-6">Class bookings, memberships, and a calming brand system</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      200+ weekly bookings
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      4.8★ rating
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      2x retention
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-border pl-4 italic text-foreground/70">
                    &ldquo;Members love how easy it is to reserve classes and manage passes. The brand feels zen yet premium.&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium">— Priya K., Studio Owner</footer>
                  </blockquote>
                </CardContent>
              </Card>

              {/* ZenFix Mobile Repair Case Study */}
              <Card className="bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/mobile.jpg"
                    alt="ZenFix Mobile Repair - Same-day device repairs"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                    Repair Service
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">ZenFix Mobile Repair</h3>
                  <p className="text-foreground/70 mb-6">Booking flows, status tracking, and trust-building UX</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      250+ monthly repairs
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      4.9★ rating
                    </div>
                    <div className="bg-muted border border-border px-3 py-1 rounded-full text-sm font-medium text-foreground/70">
                      <span className="tabular-nums">-20%</span> bounce rate
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-border pl-4 italic text-foreground/70">
                    &ldquo;Online bookings doubled and walk-ins are smoother thanks to clear repair timelines and updates.&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium">— Ahmed S., Owner</footer>
                  </blockquote>
                </CardContent>
              </Card>
            </div>

            {/* Soft bottom fade + blur like reviews section */}
            <div className="relative -mt-1 md:-mt-2" aria-hidden>
              <div className="pointer-events-none absolute inset-x-0 -top-3 h-10 md:h-12 bg-gradient-to-b from-transparent via-background/70 to-background backdrop-blur-sm"></div>
            </div>

            {/* Reviews CTA below Featured Work */}
            <div className="mt-4 md:mt-6 text-center">
              <Link href="/work">
                <Button className="inline-flex items-center justify-center gap-2 h-9 has-[>svg]:px-3 bg-card text-foreground border-2 border-border hover:bg-muted px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  Recent projects Works
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (lazy) */}
      <LazyOnView>
        <TestimonialsSection />
      </LazyOnView>

      {/* Helping You Transform Your Business Section */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium mb-6 shadow-sm">
                   <ArrowRight className="w-4 h-4 mr-2" />
                   <ShinyText text="Transform & Grow" speed={2} />
                 </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight tracking-tight">
                  Helping You
                  <br />
                  Transform Your
                  <br />
                  <span className="relative">
                    Business
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-pink-400 rounded-full"></div>
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Bold ideas. Smarter strategies. Game-changing results. Let&rsquo;s elevate your brand and unlock its full
                  potential.
                </p>
              </div>

              {/* Services Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Design Card */}
                <ScrollFloat delay={0.1}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500"></div>
                    <div className="relative bg-card rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/80 group-hover:-translate-y-2">
                      <div className="mb-6 md:mb-8">
                        <div className="inline-block bg-pink-400 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold text-lg md:text-xl mb-4 md:mb-6 transform -rotate-2 shadow-lg">
                          DESIGN
                        </div>
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 md:mb-6">
                          We design conversion-focused websites that don’t just look great—they build trust and turn visitors into customers.
                        </p>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Discovery & Strategy</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Web Design & UI/UX</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">User-Centered Experience</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Accessible, Inclusive Design</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollFloat>

                {/* Build Card */}
                <ScrollFloat delay={0.2}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-500"></div>
                    <div className="relative bg-card rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border group-hover:-translate-y-2">
                      <div className="mb-6 md:mb-8">
                        <div className="inline-block bg-green-400 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold text-lg md:text-xl mb-4 md:mb-6 transform rotate-1 shadow-lg">
                          BUILD
                        </div>
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 md:mb-6">
                          We engineer fast, scalable, and reliable platforms that adapt to your growth and deliver seamless performance.
                        </p>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Website Development</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Shopify & E-commerce</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">CMS Solutions (Custom & Headless)</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Technical SEO Foundations</h4>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </ScrollFloat>

                {/* Grow Card */}
                <ScrollFloat delay={0.3}>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500"></div>
                    <div className="relative bg-card rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border group-hover:-translate-y-2">
                      <div className="mb-6 md:mb-8">
                        <div className="inline-block bg-blue-400 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold text-lg md:text-xl mb-4 md:mb-6 transform -rotate-1 shadow-lg">
                          GROW
                        </div>
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 md:mb-6">
                          We craft data-driven marketing campaigns that help you attract, engage, and retain customers.
                        </p>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Paid Advertising (PPC)</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Search Engine Optimisation</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Content & Email Marketing</h4>
                        </div>
                        <div className="flex items-center py-2 md:py-3 border-b border-gray-100">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <h4 className="text-black font-semibold text-sm md:text-base">Social Media Growth</h4>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </ScrollFloat>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* A Dedicated Team of Professionals Section */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 md:mb-16 relative">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-card border border-border text-foreground/70 text-sm font-medium mb-6 shadow-sm">
                   <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                   <ShinyText text="Our Team" speed={2} />
                 </div>

                {/* Decorative Badge */}
                <div className="absolute -top-4 right-1/4 transform translate-x-1/2">
                  <div className="bg-pink-400 text-white px-4 py-2 rounded-xl font-bold text-sm transform rotate-12 shadow-lg">
                    3+ YEARS EXPER
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                  A Dedicated Team of
                  <br />
                  <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    Professionals
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Passionate, driven, and always prepared to go the extra mile, we bring expertise and creativity to
                  every project, guaranteeing your success.
                </p>
              </div>

              {/* Team Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {/* We're About Results */}
                <ScrollFloat delay={0.1}>
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500 bg-gradient-to-br from-background/0 via-background/0 to-background/0" />
                    <div className="relative rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:-translate-y-2 ring-1 ring-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)]">
                      <div className="mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-100 rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Check className="w-6 h-6 md:w-8 md:h-8 text-pink-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
                          WE’RE ABOUT RESULTS
                        </h3>
                      </div>
                      <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                        At ZeroSlash Agency, everything we create is built to drive growth and measurable impact—not just look good. We align every project with your specific business goals and long-term vision.
                      </p>
                    </div>
                  </div>
                </ScrollFloat>

                {/* Experienced Team */}
                <ScrollFloat delay={0.2}>
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-500 bg-gradient-to-br from-background/0 via-background/0 to-background/0" />
                    <div className="relative rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:-translate-y-2 ring-1 ring-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)]">
                      <div className="mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Diamond className="w-6 h-6 md:w-8 md:h-8 text-blue-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
                          EXPERIENCED TEAM
                        </h3>
                      </div>
                      <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                        A dedicated in-house crew of designers, developers, and strategists. No outsourcing, no shortcuts—just focused collaboration to deliver the best outcomes.
                      </p>
                    </div>
                  </div>
                </ScrollFloat>

                {/* Quality Assurance */}
                <ScrollFloat delay={0.3}>
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500 bg-gradient-to-br from-background/0 via-background/0 to-background/0" />
                    <div className="relative rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:-translate-y-2 ring-1 ring-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)]">
                      <div className="mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Star className="w-6 h-6 md:w-8 md:h-8 text-green-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
                          QUALITY ASSURANCE
                        </h3>
                      </div>
                      <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                        We hold ourselves to high standards. Every website, campaign, and system we launch goes through rigorous testing to ensure performance, security, and reliability.
                      </p>
                    </div>
                  </div>
                </ScrollFloat>

                {/* Support & Aftercare */}
                <ScrollFloat delay={0.4}>
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-500 bg-gradient-to-br from-background/0 via-background/0 to-background/0" />
                    <div className="relative rounded-3xl p-6 md:p-8 transition-all duration-500 group-hover:-translate-y-2 ring-1 ring-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)]">
                      <div className="mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
                          SUPPORT & AFTERCARE
                        </h3>
                      </div>
                      <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                        Our work doesn’t stop at launch. ZeroSlash Agency provides responsive support, updates, and optimisations to keep your digital presence thriving.
                      </p>
                    </div>
                  </div>
                </ScrollFloat>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Your Trusted Digital Partner Section - Changed to White Background */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left - Professional Image (place after content on mobile) */}
                <div className="relative order-2 lg:order-1 mt-6 lg:mt-0">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/x2.jpeg"
                      alt="Professional team member discussing digital strategy"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  {/* Decorative elements (hide on mobile to avoid overflow outside section) */}
                  <div className="hidden sm:block absolute -top-4 -right-4 w-8 h-8 bg-black rounded-full opacity-20"></div>
                  <div className="hidden sm:block absolute -bottom-4 -left-4 w-6 h-6 bg-black rounded-full opacity-30"></div>
                </div>

                {/* Right - Content (show before image on mobile) */}
                <div className="space-y-8 order-1 lg:order-2">
                  <div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight tracking-tight">
                      YOUR TRUSTED
                      <br />
                      <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        DIGITAL PARTNER
                      </span>
                    </h2>
                  </div>

                  <div className="space-y-6 text-lg text-foreground/70 leading-relaxed">
                    <p>
                      At ZeroSlash Agency, we help fitness, lifestyle, and growing businesses unlock their full digital potential. Based in India and working with clients worldwide, we deliver high-end web design, powerful marketing, and smart automation—all crafted to your unique needs.
                    </p>

                    <p>
                      Since our beginnings, we’ve built a reputation for clarity, creativity, and execution—transforming brands with innovative digital strategies, scalable development, and designs that perform.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => setWizardOpen(true)}
                      aria-label="Start Your Project"
                      className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Start Your Project
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-2 border-black hover:border-gray-800 text-black hover:text-gray-800 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all duration-300 bg-transparent"
                    >
                      Our Story
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Velocity scroll divider (rose + phrase) */}
      <section className="w-full py-4">
        <VelocityScroll
          text="🌹 Ready. Set. Ship. 🌹"
          default_velocity={5}
          className="text-[clamp(2rem,12vw,7rem)] font-extrabold tracking-tight bg-gradient-to-r from-neutral-300 to-white bg-clip-text text-transparent"
        />
      </section>

      {/* Footer - Lime CTA style (softened for readability) */}
      <footer
        id="page-footer"
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: "#C8FA91" }}
      >
        {/* Center spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="h-[38rem] w-[38rem] md:h-[46rem] md:w-[46rem] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side at 50% 50%, rgba(0,0,0,0.10), rgba(0,0,0,0) 60%)",
              filter: "blur(0.5px)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 items-start">
            {/* Left: contact */}
            <div className="space-y-2 text-black/90">
              <div className="font-semibold">Contact</div>
              <a href="mailto:hello@zeroslash.in" className="font-bold underline decoration-transparent hover:decoration-black">hello@zeroslash.in</a>
              <div className="font-bold">+91 95002 55291</div>
            </div>

            {/* Center: CTA */}
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-black/95 mb-5">Got a project? Want to collaborate?</h3>
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                aria-label="Discuss your project"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full text-white font-semibold shadow-sm transition-colors"
                style={{
                  background:
                    "linear-gradient(90deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)",
                  boxShadow: "0 6px 20px rgba(30,64,175,0.35)",
                }}
              >
                Discuss your project
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>

            {/* Right: offices */}
            <div className="space-y-4 text-black/90">
              <div>
                <div className="font-semibold">India</div>
                <div>Chennai, Tamil Nadu</div>
              </div>
              <div>
                <div className="font-semibold">Remote</div>
                <div>Global team across timezones</div>
              </div>
            </div>
          </div>

          {/* Bottom meta */}
          <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-4 text-black/90">
            <div className="text-sm opacity-90">© 2025 ZeroSlash Agency</div>
            <div className="flex items-center gap-6 text-sm opacity-90">
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Terms & Conditions</Link>
            </div>
            <div className="flex items-center gap-3 bg-black/15 backdrop-blur-[1px] rounded-full px-4 py-2">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium">5.0 from 76+ reviews</span>
            </div>
          </div>
        </div>

        {/* Giant background text */}
        <div className="pointer-events-none select-none absolute inset-x-0 -bottom-6 md:-bottom-8 text-black/15 font-black tracking-tight text-[16vw] md:text-[13vw] leading-none text-center">
          LET’S WORK TOGETHER
        </div>
      </footer>

      {/* Floating Contact Button */}
      <ContactButton />
    </div>
  )
}

