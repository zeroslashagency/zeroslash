"use client"

import Image from "next/image"
import { useState } from "react"

const APPROACH_CARDS = [
  {
    index: "01",
    title: "Investigate Deeply",
    body: "Industry insights, user interviews, and real data drive every solution we create.",
    image: "/images/approach/investigate.webp",
    alt: "Macro photograph of teal and leopard-spotted daisy petals",
    frameBg: "#c9f35c",
    restClass: "-rotate-3 translate-y-2 z-10",
  },
  {
    index: "02",
    title: "Create Boldly",
    body: "From branding to user experience, we craft digital identities that command attention.",
    image: "/images/approach/create.webp",
    alt: "Macro photograph of a blue and white spotted gerbera daisy",
    frameBg: "#128cf4",
    restClass: "-rotate-2 -translate-y-2 z-20",
  },
  {
    index: "03",
    title: "Build Reliably",
    body: "We engineer scalable, high-performance systems built to evolve with your growth.",
    image: "/images/approach/build.webp",
    alt: "Macro photograph of purple and cream leopard-spotted daisy petals",
    frameBg: "#b5e637",
    restClass: "rotate-3 translate-y-1 z-20",
  },
  {
    index: "04",
    title: "Scale & Grow",
    body: "Launch readiness, continuous optimisation, and measurable conversion performance.",
    image: "/images/flora/branding-bloom-800.webp",
    alt: "Flowering botanical branch representing brand and product growth",
    frameBg: "#fbe4e8",
    restClass: "-rotate-1 -translate-y-1 z-30",
  },
] as const

export default function ApproachShowcase() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const selected = activeIdx ?? 0
  const activeCard = APPROACH_CARDS[selected]

  return (
    <div className="py-4 sm:py-8 text-center">
      {/* Overlapping fanned 4-card stack */}
      <div
        className="mx-auto flex items-center justify-center py-4 sm:py-6"
        onMouseLeave={() => setActiveIdx(null)}
      >
        {APPROACH_CARDS.map((card, i) => {
          const isFocused = activeIdx === i
          return (
            <button
              key={card.index}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
              onClick={() => setActiveIdx(i)}
              aria-pressed={selected === i}
              aria-label={`${card.index} ${card.title}: ${card.body}`}
              style={{ backgroundColor: card.frameBg }}
              className={`relative shrink-0 overflow-hidden rounded-[16px] sm:rounded-[20px] md:rounded-[22px] w-[96px] h-[106px] sm:w-[168px] sm:h-[180px] md:w-[214px] md:h-[228px] lg:w-[252px] lg:h-[268px] xl:w-[276px] xl:h-[292px] transition-transform duration-300 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
                i > 0 ? "-ml-4 sm:-ml-7 md:-ml-8 lg:-ml-10" : ""
              } ${
                isFocused
                  ? "z-40 rotate-0 -translate-y-4 scale-[1.05] shadow-[0_32px_64px_-14px_rgba(0,0,0,0.36)] dark:shadow-[0_32px_64px_-14px_rgba(0,0,0,0.82)]"
                  : `${card.restClass} shadow-[0_24px_48px_-16px_rgba(0,0,0,0.26)] dark:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)]`
              }`}
            >
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="(max-width: 640px) 110px, (max-width: 1024px) 220px, 280px"
                className="object-cover"
                priority={i === 0}
              />
            </button>
          )
        })}
      </div>

      {/* Large muted statement underneath */}
      <p
        className="mx-auto mt-8 sm:mt-12 max-w-5xl text-[28px] sm:text-5xl md:text-6xl lg:text-[64px] font-black uppercase tracking-[-0.03em] leading-[0.94] text-foreground/25 dark:text-white/25 select-none"
        style={{ textWrap: "balance" }}
      >
        Investigate Deeply,
        <br />
        Build Reliably &amp; Create Boldly
      </p>

      {/* Bottom approach index & active detail */}
      <div className="mt-8 sm:mt-10">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs sm:text-sm md:text-[15px] uppercase tracking-[0.12em]">
          {APPROACH_CARDS.map((card, i) => (
            <span key={card.index} className="inline-flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden="true" className="text-foreground/30">
                  ·
                </span>
              )}
              <button
                type="button"
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => setActiveIdx(i)}
                className={`cursor-pointer whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground rounded-xs ${
                  selected === i
                    ? "font-bold text-foreground"
                    : "font-medium text-foreground/45 hover:text-foreground/80"
                }`}
              >
                {card.index} {card.title}
              </button>
            </span>
          ))}
        </div>
        <div className="mx-auto mt-4 min-h-[3.5rem] max-w-[54ch]">
          <p className="text-base md:text-lg leading-relaxed text-foreground/75">
            {activeCard.body}
          </p>
        </div>
      </div>
    </div>
  )
}
