"use client"

export const dynamic = 'force-static'

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ArrowRight, Sparkles, Compass, Workflow, Briefcase, TrendingUp, Users, Search, Cog, Rocket, Star, ArrowDown, ChevronDown } from "lucide-react"
import nextDynamic from "next/dynamic"
import { motion, useReducedMotion } from "motion/react"
import CountUpOnView from "../components/CountUpOnView"
import SectionPill from "@/components/SectionPill"
import ShineBorder from "@/components/magicui/shine-border"
import FlowConnector from "@/components/FlowConnector"
import ContactButton from "@/components/ContactButton"
import ProjectWizard from "@/components/ProjectWizard"
import CloudHorizonCanvas from "@/components/hero/CloudHorizonCanvas"
import { VelocityScroll } from "@/components/VelocityScroll"
import { LazyOnView } from "@/components/lazy-on-view"
import { RATING, REVIEW_COUNT, SOCIAL } from "@/lib/site"
import { useState, useEffect, useRef } from "react"
import BrandRibbonsSection from "@/components/sections/brand-ribbons/BrandRibbonsSection"
import TeamLanyardPasses from "@/components/sections/TeamLanyardPasses"
import ApproachShowcase from "@/components/sections/ApproachShowcase"
import TransformPillarsShowcase from "@/components/sections/TransformPillarsShowcase"

const ServicesSection = nextDynamic(() => import("@/components/sections/flora/ServicesFlora"), { ssr: false, loading: () => null })
const TestimonialsSection = nextDynamic(() => import("@/components/sections/Testimonials"), { ssr: false, loading: () => null })

const CurvedLoop = nextDynamic(() => import("../src/blocks/TextAnimations/CurvedLoop/CurvedLoop"), { ssr: false, loading: () => null })


const APPROACH_STEPS = [
  {
    num: "01",
    title: "Define",
    summary: "Goals, audience & strategy foundation",
    description:
      "We start by understanding your goals, audience, and market position, creating a rock-solid strategy that sets the foundation for success.",
  },
  {
    num: "02",
    title: "Design",
    summary: "Bold, user-focused brand & UI",
    description:
      "Our team transforms insights into bold, user-focused designs that elevate your brand identity and captivate your audience.",
  },
  {
    num: "03",
    title: "Build",
    summary: "Fast, scalable modern engineering",
    description:
      "We engineer fast, scalable, and reliable solutions using modern technology and best practices — built to perform and grow with you.",
  },
  {
    num: "04",
    title: "Launch",
    summary: "Rollout, testing & ongoing care",
    description:
      "From testing to rollout, we ensure a flawless launch backed by continuous support, updates, and optimisation to keep your digital presence thriving.",
  },
] as const

const FEATURED_PROJECTS = [
  {
    title: "Dec's Cafe",
    tag: "Coffee Shop",
    subtitle: "Premium coffee experience with seamless online ordering",
    highlight: "500+ customers · 4.7★ rating",
    image: "/images/decs-cafe.png",
    alt: "Dec's Cafe - Premium Coffee Experience",
  },
  {
    title: "The Perfect Fresh Bread",
    tag: "Bakery Website",
    subtitle: "Artisanal bakery with elegant e-commerce experience",
    highlight: "300+ daily orders · 60% growth",
    image: "/images/fresh-bread.png",
    alt: "The Perfect Fresh Bread - Artisanal Bakery",
  },
  {
    title: "Flow Yoga Studio",
    tag: "Fitness & Wellness",
    subtitle: "Class bookings, memberships, and a calming brand system",
    highlight: "200+ weekly bookings · 2x retention",
    image: "/images/yoga-studio.jpeg",
    alt: "Flow Yoga Studio - Wellness & Classes",
  },
  {
    title: "ZenFix Mobile Repair",
    tag: "Repair Service",
    subtitle: "Booking flows, status tracking, and trust-building UX",
    highlight: "250+ monthly repairs · 4.9★ rating",
    image: "/images/mobile.jpg",
    alt: "ZenFix Mobile Repair - Same-day device repairs",
  },
] as const

export default function Home() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [activeApproachStep, setActiveApproachStep] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const gapSliderRef = useRef<HTMLElement>(null)
  const gapTextRef = useRef<HTMLDivElement>(null)
  const gapFlowerRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const t = gapTextRef.current
    const f = gapFlowerRef.current
    const s = gapSliderRef.current
    if (!t || !f || !s) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      t.style.transform = "translate3d(-7.4%,0,0)"
      f.style.transform = "rotate(32deg)"
      return
    }
    let lastY = window.scrollY
    let rot = 32.7 // match initial rendered state — no pop on load
    let tx = -7.4
    let targetTx = tx
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(s)
    const tick = () => {
      if (visible) {
        const y = window.scrollY
        const dy = Math.max(-40, Math.min(40, y - lastY))
        lastY = y
        const r = s.getBoundingClientRect()
        const p = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height)))
        targetTx = -18 + p * 24
        tx += (targetTx - tx) * 0.08 // lerp — smooth, not jumpy
        t.style.transform = `translate3d(${tx}%,0,0)`
        rot = (rot + dy * 0.35) % 360
        f.style.transform = `rotate(${rot}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [])
  return (
    <div className="w-full bg-background">
      {/* Minimalist Cloud Horizon Hero */}
      <section
        id="hero"
        className="relative w-screen max-w-none mx-[calc(50%-50vw)] bg-background -mt-[60px] md:-mt-[80px] pt-[60px] md:pt-[80px] min-h-[100svh] flex flex-col overflow-hidden"
      >
        <CloudHorizonCanvas />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 md:px-8 pt-10 sm:pt-12 pb-[34vh] sm:pb-[36vh] lg:pb-[38vh]">
          <div className="max-w-3xl mx-auto">
            <h1
              className="text-[clamp(2.75rem,6.2vw,5.25rem)] font-bold leading-[0.98] tracking-[-0.03em] text-foreground [text-wrap:balance]"
              style={{ fontFamily: "var(--font-display-serif)" }}
            >
              ZeroSlash Agency
            </h1>

            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }
              className="mt-5 md:mt-6 will-change-transform"
            >
              <blockquote className="max-w-[44ch] mx-auto text-base sm:text-lg md:text-xl italic text-foreground/70 leading-relaxed">
                &ldquo;We craft quiet, unmistakable digital experiences where depth and simplicity speak for themselves.&rdquo;
              </blockquote>

              <div className="mt-7 md:mt-8 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold tracking-wide whitespace-nowrap shrink-0 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  <span>Start a project</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>

                <div className="flex items-center gap-3">
                  <a
                    href={SOCIAL.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-[40px] px-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground/55 hover:text-foreground transition-colors"
                  >
                    LinkedIn
                  </a>
                  <span className="text-xs text-foreground/30" aria-hidden="true">/</span>
                  <a
                    href={SOCIAL.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center min-h-[40px] px-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground/55 hover:text-foreground transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll continuation button */}
        <div className="absolute right-5 md:right-8 lg:right-12 bottom-5 md:bottom-6 z-20">
          <button
            type="button"
            aria-label="Scroll to next section"
            onClick={() => {
              let next = document.getElementById("hero")?.nextElementSibling as HTMLElement | null
              while (next && next.offsetHeight === 0) next = next.nextElementSibling as HTMLElement | null
              if (next) next.scrollIntoView({ behavior: "smooth", block: "start" })
              else window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
            }}
            className="w-11 h-11 rounded-full bg-card/90 text-foreground border border-border shadow-sm backdrop-blur-sm grid place-items-center hover:bg-foreground hover:text-background transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          </button>
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
            marqueeText="  Design ✦   Build  ✦   Grow  ✦   Zero  ✦   Slash ✦ "
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
              <div className="text-center mb-8 md:mb-12 lg:mb-16">
                <SectionPill label="Our Commitment" icon={Sparkles} className="mb-6" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 md:mb-6 leading-tight tracking-tight">
                  Dedicated to
                  <br />
                  <span className="text-foreground">
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

      {/* Gap slider — single layer: text bg + flower centered on text */}
      <section ref={gapSliderRef} id="gap-slider" className="relative w-screen max-w-none mx-[calc(50%-50vw)] bg-[rgb(251,250,248)] overflow-visible" suppressHydrationWarning>
        <div className="relative w-full h-[22vh] md:h-[28vh] lg:h-[34vh] xl:h-[38vh] flex items-center justify-center overflow-hidden bg-[rgb(251,250,248)]">
          <svg width="0" height="0" className="absolute" aria-hidden><filter id="gap-inset-shadow"><feOffset dx="0" dy="0" /><feGaussianBlur stdDeviation="3" result="offset-blur" /><feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" /><feFlood floodColor="#7C5CFF" floodOpacity="1" result="color" /><feComposite operator="in" in="color" in2="inverse" result="shadow" /><feComposite operator="over" in="shadow" in2="SourceGraphic" /></filter></svg>
          <div className="absolute inset-0 flex items-center overflow-hidden">
            <div ref={gapTextRef} id="gap-text" className="flex w-max whitespace-nowrap will-change-transform gap-0" style={{ transform: "translate3d(-7.4%,0,0)" }}>
              <span className="font-black uppercase tracking-[-0.03em] leading-none text-[52px] md:text-[88px] lg:text-[120px] xl:text-[148px] text-[#7C5CFF] shrink-0" style={{ filter: "url(#gap-inset-shadow)", textShadow: "0 1px 0 rgba(124,92,255,0.9), 0 6px 20px rgba(124,92,255,0.15)" }}>&nbsp;ALTIJD SCHERP, ALTIJD OP TIJD&nbsp;·&nbsp;</span>
              <span aria-hidden className="font-black uppercase tracking-[-0.03em] leading-none text-[52px] md:text-[88px] lg:text-[120px] xl:text-[148px] text-[#7C5CFF] shrink-0" style={{ filter: "url(#gap-inset-shadow)", textShadow: "0 1px 0 rgba(124,92,255,0.9), 0 6px 20px rgba(124,92,255,0.15)" }}>ALTIJD SCHERP, ALTIJD OP TIJD&nbsp;·&nbsp;</span>
              <span aria-hidden className="font-black uppercase tracking-[-0.03em] leading-none text-[52px] md:text-[88px] lg:text-[120px] xl:text-[148px] text-[#7C5CFF] shrink-0" style={{ filter: "url(#gap-inset-shadow)", textShadow: "0 1px 0 rgba(124,92,255,0.9), 0 6px 20px rgba(124,92,255,0.15)" }}>ALTIJD SCHERP, ALTIJD OP TIJD&nbsp;·&nbsp;</span>
            </div>
          </div>
        </div>
        {/* Flower — absolutely centered on the text band (not in h-0 hack layer) */}
        <Image ref={gapFlowerRef} id="gap-flower" src="/images/gap/3.avif" alt="" width={340} height={340} sizes="(max-width: 768px) 132px, (max-width: 1024px) 200px, (max-width: 1280px) 280px, 340px" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[132px] h-[132px] md:w-[200px] md:h-[200px] lg:w-[280px] lg:h-[280px] xl:w-[340px] xl:h-[340px] will-change-transform pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-10 select-none" priority aria-hidden />
      </section>

      {/* Premium About Us Section - <span className="animate-shine">How We Work</span> */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Section Header — flush left, unified badge, body offset right */}
              <div className="mb-12 md:mb-16">
                <SectionPill label="How We Work" icon={Compass} className="mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-16 items-end [&>*]:min-w-0">
                  <h2
                    className="text-[30px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1] sm:leading-[0.95] tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-display-serif)" }}
                  >
                    Our approach to
                    <br />
                    digital excellence
                  </h2>
                  <p className="text-base md:text-lg text-foreground/60 leading-relaxed max-w-[42ch] lg:pb-2">
                    Deep research, reliable engineering, and bold creative — the three passes every ZeroSlash build goes through.
                  </p>
                </div>
              </div>

              {/* Approach fanned card showcase */}
              <div className="mb-12 md:mb-16">
                <ApproachShowcase />
              </div>

              {/* Premium Minimal Stats Section: dominant numbers, clean layout */}
              <div className="py-8 md:py-10 lg:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-8 lg:gap-12 items-start [&>*]:min-w-0">
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
            <div className="text-center mb-6 md:mb-12 lg:mb-16">
              <SectionPill label="How we work" icon={Workflow} className="mb-4 md:mb-6" />
              <h2 className="text-[24px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 md:mb-6 leading-tight tracking-tight">
                At ZeroSlash Agency, we don’t just deliver projects — we build growth engines for your brand.
              </h2>
            </div>

            {/* Mobile: clean compact interactive step list (replaces 4 stacked tilted cards) */}
            <div className="md:hidden divide-y divide-border border-y border-border">
              {APPROACH_STEPS.map((step, idx) => {
                const isOpen = activeApproachStep === idx
                return (
                  <div key={step.num} className="py-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setActiveApproachStep(isOpen ? -1 : idx)}
                      className="w-full min-h-[52px] py-3 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span
                          className="text-xs text-foreground/45 tabular-nums shrink-0"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {step.num}
                        </span>
                        <div className="min-w-0">
                          <span className="text-base font-bold text-foreground">{step.title}</span>
                          {!isOpen && (
                            <p className="text-xs text-foreground/60 truncate mt-0.5">{step.summary}</p>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-foreground/50 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <p className="pl-7 pr-2 pb-3.5 text-sm text-foreground/75 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop/Tablet: Process Flow Cards with Dynamic Connector Lines */}
            <div id="flow-container" className="hidden md:block relative max-w-4xl mx-auto min-w-0">
              {/* Dynamic overlay that connects pins 1→2→3→4 */}
              <div className="hidden lg:block"><FlowConnector containerId="flow-container" /></div>
              {/* Step 1 - Define (Top Right) */}
              <div className="relative mb-10 lg:mb-40 flex justify-end pr-0 md:pr-8" id="card-1">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl p-6 md:p-8 w-full md:w-80 shadow-2xl transform rotate-0 lg:rotate-6 lg:hover:rotate-3 transition-all duration-300 relative"
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
              <div className="relative mb-10 lg:mb-40 flex justify-start pl-0 md:pl-8" id="card-2">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl p-6 md:p-8 w-full md:w-80 shadow-2xl transform rotate-0 lg:-rotate-3 hover:rotate-0 transition-all duration-300 relative"
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
              <div className="relative mb-10 lg:mb-40 flex justify-end pr-0 md:pr-8" id="card-3">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl overflow-visible p-6 md:p-8 w-full md:w-80 shadow-2xl transform rotate-0 lg:rotate-2 hover:rotate-0 transition-all duration-300 relative"
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
              <div className="relative mb-10 md:mb-12 lg:mb-16 flex justify-start pl-0 md:pl-8" id="card-4">
                <div className="relative">
                  <div
                    className="bg-card border border-border rounded-2xl p-6 md:p-8 w-full md:w-80 shadow-2xl transform rotate-0 lg:-rotate-4 hover:rotate-0 transition-all duration-300 relative"
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
            <div className="text-center mb-6 md:mb-12 lg:mb-16">
              <SectionPill label="Featured Work" icon={Briefcase} className="mb-4 md:mb-6" />
              <h2 className="text-[26px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground md:text-black mb-2 md:mb-6 leading-tight tracking-tight">
                Recent projects that delivered
                <br />
                measurable results
              </h2>
            </div>

            {/* Mobile: clean horizontal snap cards (concise copy, no stacked quote clutter) */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {FEATURED_PROJECTS.map((project) => (
                  <Card
                    key={project.title}
                    className="w-[80vw] max-w-[300px] shrink-0 snap-start min-w-0 bg-card border border-border shadow-sm rounded-2xl overflow-hidden"
                  >
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.alt}
                        fill
                        sizes="300px"
                        loading="lazy"
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/90 text-white px-2.5 py-1 rounded-full text-[11px] font-medium">
                        {project.tag}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold text-foreground mb-1">{project.title}</h3>
                      <p className="text-sm text-foreground/70 leading-snug line-clamp-2 mb-3">
                        {project.subtitle}
                      </p>
                      <div className="text-xs font-medium text-foreground/55 pt-2.5 border-t border-border/70">
                        {project.highlight}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-center text-xs text-foreground/45 mt-2">
                Swipe for more projects
              </p>
            </div>

            {/* Desktop/Tablet: Full 2x2 Grid */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              {/* Dec's Cafe Case Study */}
              <Card className="min-w-0 bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/decs-cafe.png"
                    alt="Dec's Cafe - Premium Coffee Experience"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black text-white px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium">
                    Coffee Shop
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Dec&#39;s Cafe</h3>
                  <p className="text-foreground/70 mb-6">Premium coffee experience with seamless online ordering</p>

                  <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      500+ customers
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      4.7★ rating
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      15+ varieties
                    </div>
                  </div>

                  <blockquote className="min-w-0 border-l-2 md:border-l-4 border-border pl-3 md:pl-4 italic text-foreground/70 text-sm md:text-base [overflow-wrap:anywhere]">
                    &ldquo;ZeroSlash transformed our digital presence in days. The interactive menu and NYC café vibe?
                    Spot-on. Customers keep complimenting how easy it is to order iced coffee on their phones!&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium text-sm md:text-base">— Samantha R., Owner</footer>
                  </blockquote>
                </CardContent>
              </Card>

              {/* Fresh Bread Case Study */}
              <Card className="min-w-0 bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/fresh-bread.png"
                    alt="The Perfect Fresh Bread - Artisanal Bakery"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black text-white px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium">
                    Bakery Website
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">The Perfect Fresh Bread</h3>
                  <p className="text-foreground/70 mb-6">Artisanal bakery with elegant e-commerce experience</p>

                  <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      300+ daily orders
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      4.9★ rating
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      60% growth
                    </div>
                  </div>

                  <blockquote className="min-w-0 border-l-2 md:border-l-4 border-border pl-3 md:pl-4 italic text-foreground/70 text-sm md:text-base [overflow-wrap:anywhere]">
                    &ldquo;Our new site feels as warm as our sourdough. They captured our brand&rsquo;s heart – simple, wholesome,
                    and mobile-friendly. Orders jumped 30% in Week 1!&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium text-sm md:text-base">— Maria L., Head Baker</footer>
                  </blockquote>
                </CardContent>
              </Card>

              {/* Flow Yoga Studio Case Study */}
              <Card className="min-w-0 bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/yoga-studio.jpeg"
                    alt="Flow Yoga Studio - Wellness & Classes"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black text-white px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium">
                    Fitness & Wellness
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Flow Yoga Studio</h3>
                  <p className="text-foreground/70 mb-6">Class bookings, memberships, and a calming brand system</p>

                  <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      200+ weekly bookings
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      4.8★ rating
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      2x retention
                    </div>
                  </div>

                  <blockquote className="min-w-0 border-l-2 md:border-l-4 border-border pl-3 md:pl-4 italic text-foreground/70 text-sm md:text-base [overflow-wrap:anywhere]">
                    &ldquo;Members love how easy it is to reserve classes and manage passes. The brand feels zen yet premium.&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium text-sm md:text-base">— Priya K., Studio Owner</footer>
                  </blockquote>
                </CardContent>
              </Card>

              {/* ZenFix Mobile Repair Case Study */}
              <Card className="min-w-0 bg-card border border-border shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src="/images/mobile.jpg"
                    alt="ZenFix Mobile Repair - Same-day device repairs"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black text-white px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium">
                    Repair Service
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">ZenFix Mobile Repair</h3>
                  <p className="text-foreground/70 mb-6">Booking flows, status tracking, and trust-building UX</p>

                  <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      250+ monthly repairs
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      4.9★ rating
                    </div>
                    <div className="bg-muted border border-border px-2.5 py-1 md:px-3 rounded-full text-xs md:text-sm font-medium text-foreground/70">
                      <span className="tabular-nums">-20%</span> bounce rate
                    </div>
                  </div>

                  <blockquote className="min-w-0 border-l-2 md:border-l-4 border-border pl-3 md:pl-4 italic text-foreground/70 text-sm md:text-base [overflow-wrap:anywhere]">
                    &ldquo;Online bookings doubled and walk-ins are smoother thanks to clear repair timelines and updates.&rdquo;
                    <footer className="text-foreground/60 mt-2 not-italic font-medium text-sm md:text-base">— Ahmed S., Owner</footer>
                  </blockquote>
                </CardContent>
              </Card>
            </div>

            {/* Soft bottom fade + blur like reviews section */}
            <div className="hidden md:block relative -mt-1 md:-mt-2" aria-hidden>
              <div className="pointer-events-none absolute inset-x-0 -top-3 h-10 md:h-12 bg-gradient-to-b from-transparent via-background/70 to-background backdrop-blur-sm"></div>
            </div>


          </div>
        </div>
      </section>

      {/* Testimonials Section (lazy) */}
      <LazyOnView>
        <TestimonialsSection />
      </LazyOnView>

      {/* Full-bleed statement band — sits in the seam between the reviews and
          the Transform & Grow section. Native 3:2 is kept at every width so the
          two reaching hands stay in frame; a tall crop would cut them off. */}
      <section
        className="relative w-screen max-w-none mx-[calc(50%-50vw)] aspect-[3/2] min-h-[300px] sm:min-h-0 overflow-hidden"
        aria-label="ZeroSlash — where craft meets creation"
      >
        <Image
          src="/images/band/creation.webp"
          alt="Two hands reaching toward the ZeroSlash mark, echoing Michelangelo's Creation of Adam"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Top and bottom feather so the band dissolves into the page instead of
            reading as a pasted photo with hard horizontal edges. */}
        <div className="band-fade band-fade-top" aria-hidden />
        <div className="band-fade band-fade-bottom" aria-hidden />
      </section>

      {/* Helping You Transform Your Business Section */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-6 md:mb-12 lg:mb-16">
                <SectionPill label="Transform & Grow" icon={TrendingUp} className="mb-4 md:mb-6" />
                <h2 className="text-[26px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-6 leading-tight tracking-tight">
                  Helping You
                  <br />
                  Transform Your
                  <br />
                  <span className="relative">
                    Business
                    <div className="absolute -bottom-1.5 md:-bottom-2 left-0 w-full h-1 bg-pink-400 rounded-full"></div>
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Bold ideas. Smarter strategies. Game-changing results. Let&rsquo;s elevate your brand and unlock its full
                  potential.
                </p>
              </div>

              {/* Interactive Monochrome Collector Cards (Desktop 3-Col + Mobile Horizontal Swipe) */}
              <TransformPillarsShowcase onStartProject={() => setWizardOpen(true)} />
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
              <div className="text-center mb-4 md:mb-12 lg:mb-16 relative">
                <SectionPill label="Our Team" icon={Users} className="mb-4 md:mb-6" />

                {/* Decorative Badge */}
                <div className="hidden md:block absolute -top-4 right-1/4 transform translate-x-1/2">
                  <div className="bg-pink-400 text-white px-4 py-2 rounded-xl font-bold text-sm transform rotate-12 shadow-lg">
                    3+ YEARS EXPER
                  </div>
                </div>

                <h2 className="text-[26px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-6 leading-tight tracking-tight">
                  A Dedicated Team of
                  <br />
                  <span className="text-foreground">
                    Professionals
                  </span>
                </h2>
                <p className="text-sm sm:text-base md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  Passionate, driven, and always prepared to go the extra mile, we bring expertise and creativity to
                  every project, guaranteeing your success.
                </p>
              </div>

              {/* Team Lanyard Passes Grid */}
              <TeamLanyardPasses />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 3D Interactive Brand Ribbons Showcase */}
      <BrandRibbonsSection />

      {/* Velocity scroll divider — seamless #ebebea continuation beneath overhanging ribbon straps */}
      <section className="relative z-10 w-screen max-w-none mx-[calc(50%-50vw)] bg-[#ebebea] pt-2 pb-10 md:pt-4 md:pb-14">
        <VelocityScroll
          text="Ready. Set. Ship."
          default_velocity={5}
          className="text-[clamp(2rem,12vw,7rem)] font-extrabold tracking-tight text-[#141414]/85"
        />
      </section>

      {/* Footer - Lime CTA style (softened for readability) */}
      <footer
        id="page-footer"
        className="relative z-30 overflow-hidden py-16 md:py-24"
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
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-16 items-start">
            {/* Left: contact */}
            <div className="flex flex-col items-start gap-2 text-black/90">
              <div className="font-semibold">Contact</div>
              <a href="mailto:hello@zeroslash.in" className="inline-flex items-center min-h-11 font-bold underline decoration-transparent hover:decoration-black">hello@zeroslash.in</a>
              <a href="tel:+919500255291" className="inline-flex items-center min-h-11 font-bold">+91 95002 55291</a>
            </div>

            {/* Center: CTA */}
            <div className="text-center">
              <h3 className="text-2xl lg:text-3xl font-extrabold text-black/95 mb-5">Got a project? Want to collaborate?</h3>
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
              <Link href="/reviews" className="inline-flex items-center py-3 -my-3 hover:opacity-70 transition-opacity">Reviews</Link>
              <Link href="/calculator" className="inline-flex items-center py-3 -my-3 hover:opacity-70 transition-opacity">Cost Calculator</Link>
            </div>
            <div className="flex items-center gap-3 bg-black/15 backdrop-blur-[1px] rounded-full px-4 py-2">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium">{RATING} from {REVIEW_COUNT} reviews</span>
            </div>
          </div>
        </div>

        {/* Giant background text */}
        <div className="pointer-events-none select-none absolute inset-x-0 -bottom-6 md:-bottom-8 text-black/15 font-black tracking-tight text-[12vw] sm:text-[14vw] md:text-[13vw] leading-none text-center">
          LET’S WORK TOGETHER
        </div>
      </footer>

      {/* Floating Contact Button */}
      <ContactButton />
    </div>
  )
}

