"use client"

import Link from "next/link"
import { useId, useRef, useState, type KeyboardEvent } from "react"
import { ChevronRight, Globe, Layers, Palette, TrendingUp } from "lucide-react"
import SectionPill from "@/components/SectionPill"
import PixelStageCanvas from "./PixelStageCanvas"

const SERVICES = [
  {
    id: "web",
    title: "Website",
    subtitle: "Custom sites & builds",
    description:
      "Design and engineering focused on fast, clean websites and conversion-driven web experiences built to scale.",
    ctaLabel: "Explore web builds",
    href: "/services",
    Icon: Globe,
  },
  {
    id: "marketing",
    title: "Marketing",
    subtitle: "SEO, paid & growth",
    description:
      "Data-backed performance marketing, SEO, and campaign systems built to turn qualified attention into revenue.",
    ctaLabel: "Digital marketing",
    href: "/digital-marketing",
    Icon: TrendingUp,
  },
  {
    id: "branding",
    title: "Branding",
    subtitle: "Identity & systems",
    description:
      "Distinctive visual identities, typography, and cohesive design systems crafted to make brands unmistakable.",
    ctaLabel: "View capabilities",
    href: "/services",
    Icon: Palette,
  },
  {
    id: "product",
    title: "Product",
    subtitle: "Web apps & SaaS",
    description:
      "End-to-end digital product engineering from wireframes and prototypes to scalable production applications.",
    ctaLabel: "Estimate a build",
    href: "/calculator",
    Icon: Layers,
  },
] as const

export default function ServicesFlora() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const activeService = SERVICES[activeIndex]

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % SERVICES.length
        break
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + SERVICES.length) % SERVICES.length
        break
      case "Home":
        next = 0
        break
      case "End":
        next = SERVICES.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    setActiveIndex(next)
    tabs.current[next]?.focus()
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flora-section relative left-1/2 -ml-[50vw] w-screen overflow-hidden bg-background px-5 py-16 text-foreground dark:bg-[#050507] dark:text-[#f5f5f5] md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        {/* Top split header matching the reference editorial composition */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionPill label="What we do" icon={Layers} className="mb-5" />
            <h2
              id={`${id}-heading`}
              className="max-w-[13ch] text-[34px] font-medium leading-[1.08] tracking-[-0.025em] text-foreground dark:text-[#f5f5f5] sm:text-[42px] lg:text-[46px]"
              style={{ textWrap: "balance" }}
            >
              What are we doing?
            </h2>
          </div>

          <div className="relative flex flex-col items-start lg:pr-8">
            <span
              aria-hidden="true"
              className="hidden h-1.5 w-1.5 bg-foreground dark:bg-[#f5f5f5] lg:absolute lg:right-0 lg:top-1 lg:block"
            />
            {/* Fixed min-height keeps the canvas and tab bar completely stationary when switching services */}
            <div className="min-h-[6rem] w-full">
              <p
                id={`${id}-panel-${activeService.id}`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${activeService.id}`}
                className="max-w-[46ch] text-base leading-relaxed text-foreground/65 dark:text-[#a1a1aa] md:text-lg"
              >
                {activeService.description}
              </p>
            </div>
            <Link
              href={activeService.href}
              className="mt-5 inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[6px] bg-[#EA5828] px-4 py-2 text-[13px] font-semibold text-[#050507] transition-colors duration-150 hover:bg-[#f2673a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA5828]"
            >
              <span>{activeService.ctaLabel}</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Retro pixel/ASCII platformer stage with gentle drifting clouds */}
        <div className="mt-10 mb-6 md:mt-14 md:mb-8">
          <PixelStageCanvas activeIndex={activeIndex} />
        </div>

        {/* Bottom 4-column interactive capability strip */}
        <div
          role="tablist"
          aria-label="Our services"
          className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-foreground/10 pt-8 dark:border-white/10 md:pt-10 lg:grid-cols-4 lg:gap-x-10"
        >
          {SERVICES.map((item, index) => {
            const isSelected = activeIndex === index
            const Icon = item.Icon
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabs.current[index] = el
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${item.id}`}
                aria-selected={isSelected}
                aria-controls={`${id}-panel-${item.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onPointerEnter={(event) => {
                  if ((event.pointerType === "mouse" || event.pointerType === "pen") && index !== activeIndex) {
                    setActiveIndex(index)
                  }
                }}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className="group flex min-h-[44px] cursor-pointer flex-col items-start rounded-sm text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EA5828]"
              >
                <div className="flex items-start gap-3.5">
                  <Icon
                    aria-hidden="true"
                    className={`mt-1 h-5 w-5 shrink-0 transition-colors duration-150 ${
                      isSelected
                        ? "text-[#d9481b] dark:text-[#EA5828]"
                        : "text-foreground/40 group-hover:text-foreground/75 dark:text-[#71717a] dark:group-hover:text-[#d4d4d8]"
                    }`}
                    strokeWidth={1.6}
                  />
                  <div className="min-w-0">
                    <div
                      className={`text-xl font-medium leading-none tracking-[-0.02em] transition-colors duration-150 sm:text-[26px] ${
                        isSelected
                          ? "text-foreground dark:text-[#f5f5f5]"
                          : "text-foreground/55 group-hover:text-foreground dark:text-[#a1a1aa] dark:group-hover:text-[#f5f5f5]"
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="mt-2 text-[12px] leading-snug text-foreground/50 transition-colors duration-150 group-hover:text-foreground/75 dark:text-[#71717a] dark:group-hover:text-[#a1a1aa]">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className={`mt-5 block h-[2px] w-10 transition-colors duration-150 ${
                    isSelected
                      ? "bg-foreground dark:bg-[#f5f5f5]"
                      : "bg-foreground/15 group-hover:bg-foreground/40 dark:bg-white/15 dark:group-hover:bg-white/40"
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
