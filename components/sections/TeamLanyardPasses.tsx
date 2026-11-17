"use client"

import { useId, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

interface PassItem {
  id: string
  bg: string
  borderClass: string
  textColor: string
  mutedColor: string
  handTitle: string
  letters: { ch: string; x: number; y: number; rot: number; size: number }[]
  propSrc: string
  propAlt: string
  propBoxClass: string
  heading: string
  description: string
  hoverTilt: number
}

const PASSES: readonly PassItem[] = [
  {
    id: "results",
    bg: "#00B4FF",
    borderClass: "shadow-[0_18px_36px_-18px_rgba(0,115,175,0.42)]",
    textColor: "#0e1726",
    mutedColor: "rgba(14,23,38,0.72)",
    handTitle: "Results",
    letters: [
      { ch: "R", x: 18, y: 178, rot: -30, size: 41 },
      { ch: "e", x: 43, y: 148, rot: -16, size: 35 },
      { ch: "s", x: 63, y: 122, rot: -14, size: 34 },
      { ch: "u", x: 85, y: 102, rot: -8, size: 35 },
      { ch: "l", x: 110, y: 92, rot: -4, size: 36 },
      { ch: "t", x: 130, y: 88, rot: 4, size: 35 },
      { ch: "s", x: 152, y: 93, rot: 12, size: 35 },
    ],
    propSrc: "/images/passes/coffee-duck.png",
    propAlt: "3D ceramic coffee cup with duckling latte art and climbing toy duck",
    propBoxClass: "-right-4 -bottom-9 w-[74%] aspect-square",
    heading: "WE’RE ABOUT RESULTS",
    description:
      "At ZeroSlash Agency, everything we create is built to drive growth and measurable impact—not just look good. We align every project with your specific business goals and long-term vision.",
    hoverTilt: -2.4,
  },
  {
    id: "team",
    bg: "#FFE900",
    borderClass: "shadow-[0_18px_36px_-18px_rgba(140,120,0,0.32)]",
    textColor: "#141414",
    mutedColor: "rgba(20,20,20,0.72)",
    handTitle: "Team",
    letters: [
      { ch: "T", x: 24, y: 186, rot: -26, size: 44 },
      { ch: "e", x: 54, y: 162, rot: -14, size: 38 },
      { ch: "a", x: 80, y: 138, rot: -18, size: 37 },
      { ch: "m", x: 108, y: 114, rot: -8, size: 38 },
    ],
    propSrc: "/images/passes/cone-duck.png",
    propAlt: "3D purple star traffic cone with miniature yellow duckling figurine",
    propBoxClass: "-right-2 -bottom-7 w-[64%] aspect-square",
    heading: "EXPERIENCED TEAM",
    description:
      "A dedicated in-house crew of designers, developers, and strategists. No outsourcing, no shortcuts—just focused collaboration to deliver the best outcomes.",
    hoverTilt: 2.2,
  },
  {
    id: "quality",
    bg: "#FF8CEE",
    borderClass: "shadow-[0_18px_36px_-18px_rgba(165,38,140,0.34)]",
    textColor: "#141414",
    mutedColor: "rgba(20,20,20,0.72)",
    handTitle: "Quality",
    letters: [
      { ch: "Q", x: 24, y: 190, rot: -20, size: 42 },
      { ch: "u", x: 52, y: 164, rot: -14, size: 36 },
      { ch: "a", x: 74, y: 140, rot: -12, size: 36 },
      { ch: "l", x: 96, y: 118, rot: -8, size: 38 },
      { ch: "i", x: 114, y: 106, rot: 4, size: 37 },
      { ch: "t", x: 132, y: 100, rot: 10, size: 36 },
      { ch: "y", x: 154, y: 98, rot: 16, size: 36 },
    ],
    propSrc: "/images/passes/vinyl-duck.png",
    propAlt: "3D black vinyl record with cyan center and tiny duckling wearing a mini cone hat",
    propBoxClass: "-right-4 -bottom-8 w-[74%] aspect-square",
    heading: "QUALITY ASSURANCE",
    description:
      "We hold ourselves to high standards. Every website, campaign, and system we launch goes through rigorous testing to ensure performance, security, and reliability.",
    hoverTilt: -2.2,
  },
  {
    id: "care",
    bg: "#FFFFFF",
    borderClass: "shadow-[0_18px_40px_-14px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.06)]",
    textColor: "#141414",
    mutedColor: "rgba(20,20,20,0.66)",
    handTitle: "Care",
    letters: [
      { ch: "C", x: 30, y: 180, rot: -26, size: 43 },
      { ch: "a", x: 60, y: 154, rot: -12, size: 38 },
      { ch: "r", x: 88, y: 128, rot: -10, size: 38 },
      { ch: "e", x: 116, y: 112, rot: 8, size: 38 },
    ],
    propSrc: "/images/passes/grass-duck.png",
    propAlt: "3D sculptural green grass tuft with wooden picket fence, ladybug, and duckling",
    propBoxClass: "-right-3 -bottom-7 w-[70%] aspect-square",
    heading: "SUPPORT & AFTERCARE",
    description:
      "Our work doesn’t stop at launch. ZeroSlash Agency provides responsive support, updates, and optimisations to keep your digital presence thriving.",
    hoverTilt: 2.4,
  },
] as const

function LanyardHardware({ compact = false }: { compact?: boolean }) {
  const uid = useId()
  const bodyGradId = `claspBodyGrad-${uid}`
  const tabGradId = `claspTabGrad-${uid}`

  return (
    <svg
      viewBox="0 0 120 186"
      className={
        compact
          ? "w-[58px] h-auto -mb-[18px] relative z-20 pointer-events-none select-none overflow-visible"
          : "w-[78px] sm:w-[86px] h-auto -mb-[26px] relative z-20 pointer-events-none select-none overflow-visible"
      }
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bodyGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6c6e75" />
          <stop offset="35%" stopColor="#94979e" />
          <stop offset="70%" stopColor="#7c7f86" />
          <stop offset="100%" stopColor="#5d6067" />
        </linearGradient>
        <linearGradient id={tabGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#767980" />
          <stop offset="50%" stopColor="#a2a5ad" />
          <stop offset="100%" stopColor="#666870" />
        </linearGradient>
      </defs>

      {/* Tall double-strand black braided lanyard oval loop matching festival pass hardware */}
      <path
        d="M 55 130 C 44 82, 32 24, 46 10 C 57 0, 74 10, 76 32 C 78 62, 69 96, 62 130"
        fill="none"
        stroke="#222326"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M 58 130 C 49 84, 39 28, 52 14 C 63 5, 79 16, 80 38 C 81 66, 71 98, 64 130"
        fill="none"
        stroke="#151618"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Top cord sleeve collar */}
      <rect x="52.5" y="124" width="14" height="10" rx="2.5" fill="#4f5158" />
      <rect x="54.5" y="125" width="4" height="8" rx="1" fill="#70737b" opacity="0.55" />

      {/* Molded matte-grey clasp body */}
      <rect x="49.5" y="133" width="20" height="27" rx="3" fill={`url(#${bodyGradId})`} />
      <rect x="48.5" y="141" width="22" height="5" rx="1.5" fill="#63656c" />
      <rect x="52" y="135.5" width="15" height="3" rx="1" fill="#a8abb3" opacity="0.65" />

      {/* Lower rectangular strap clasp snapping into the card slot */}
      <rect x="53.5" y="159" width="12" height="16" rx="2" fill={`url(#${tabGradId})`} />
      <rect x="51" y="171.5" width="17" height="6" rx="2" fill="#5e6067" />
    </svg>
  )
}

export default function TeamLanyardPasses() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const reducedMotion = useReducedMotion()

  return (
    <div>
      {/* SVG die-cut contoured sticker rim filters (zero-size hidden in layout without display:none) */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          {PASSES.map((pass) => (
            <filter
              key={pass.id}
              id={`diecut-${pass.id}`}
              x="-18%"
              y="-18%"
              width="136%"
              height="136%"
            >
              <feMorphology in="SourceAlpha" operator="dilate" radius="5.2" result="dilated" />
              <feGaussianBlur in="dilated" stdDeviation="0.8" result="smoothed" />
              <feComponentTransfer in="smoothed" result="crispMask">
                <feFuncA type="discrete" tableValues="0 1 1 1 1" />
              </feComponentTransfer>
              <feFlood floodColor={pass.bg} result="flood" />
              <feComposite in="flood" in2="crispMask" operator="in" result="stickerRim" />
              <feMerge result="sticker">
                <feMergeNode in="stickerRim" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
              <feDropShadow
                in="sticker"
                dx="0"
                dy="6"
                stdDeviation="5"
                floodColor="#000000"
                floodOpacity={pass.id === "care" ? "0.14" : "0.10"}
              />
            </filter>
          ))}
        </defs>
      </svg>

      {/* Mobile: Clean horizontal swipeable pass cards */}
      <div className="md:hidden">
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory -mx-4 px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PASSES.map((pass) => {
            const isSelected = selectedId === pass.id
            return (
              <article key={pass.id} className="w-[68vw] max-w-[238px] shrink-0 snap-center flex flex-col items-center">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${pass.heading} pass`}
                  onClick={() => setSelectedId((prev) => (prev === pass.id ? null : pass.id))}
                  className="relative flex flex-col items-center w-full max-w-[214px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-foreground rounded-2xl"
                >
                  <LanyardHardware compact />

                  <div
                    className={`relative w-full aspect-[1/1.02] rounded-[13px] mb-6 text-left overflow-visible transition-shadow duration-200 ${pass.borderClass} ${
                      isSelected ? "ring-2 ring-foreground/60 ring-offset-4 ring-offset-background" : ""
                    }`}
                    style={{ backgroundColor: pass.bg }}
                  >
                    <div
                      className="absolute top-[5.8%] left-1/2 -translate-x-1/2 w-7 h-[5px] rounded-full bg-background/95 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] z-10"
                      aria-hidden="true"
                    />

                    <div className="absolute top-[13%] inset-x-[8%] flex items-start justify-between gap-2 z-10 pointer-events-none">
                      <div className="leading-[1.12] tracking-[-0.02em]" style={{ color: pass.textColor }}>
                        <div className="text-[10px] font-bold">
                          ZeroSlash{" "}
                          <span className="font-normal text-[8px] italic" style={{ color: pass.mutedColor }}>
                            2025
                          </span>
                        </div>
                        <div className="text-[9px] font-medium" style={{ color: pass.mutedColor }}>
                          Digital Studio
                        </div>
                      </div>
                      <span className="inline-flex items-center justify-center rounded-full bg-[#FF2442] text-white text-[7px] font-bold tracking-[0.02em] px-1.5 py-[2px] leading-none shadow-xs">
                        ZEROSLASH
                      </span>
                    </div>

                    <svg
                      viewBox="0 0 240 245"
                      className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
                      aria-hidden="true"
                    >
                      {pass.letters.map((l, idx) => (
                        <text
                          key={`${pass.id}-mob-${idx}`}
                          x={l.x}
                          y={l.y}
                          transform={`rotate(${l.rot} ${l.x} ${l.y})`}
                          fill="#121212"
                          fontSize={l.size}
                          fontWeight="500"
                          style={{
                            fontFamily: "var(--font-sans)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {l.ch}
                        </text>
                      ))}
                    </svg>

                    <div
                      className={`absolute z-20 pointer-events-none select-none ${pass.propBoxClass}`}
                      style={{ filter: `url(#diecut-${pass.id})` }}
                    >
                      <Image
                        src={pass.propSrc}
                        alt={pass.propAlt}
                        fill
                        sizes="200px"
                        referrerPolicy="no-referrer"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </button>

                <div className="w-full text-center px-1">
                  <h3 className="text-sm font-bold text-foreground mb-1 tracking-tight uppercase">
                    {pass.heading}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed text-xs line-clamp-3">
                    {pass.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
        <p className="text-center text-xs text-foreground/45 mt-1">
          Swipe to explore passes
        </p>
      </div>

      {/* Desktop/Tablet: Full 2/4 column grid untouched */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-14 lg:gap-x-8 xl:gap-x-10 items-start">

      {PASSES.map((pass) => {
        const isSelected = selectedId === pass.id
        return (
          <article key={pass.id} className="flex flex-col items-center">
            <motion.button
              type="button"
              aria-pressed={isSelected}
              aria-label={`${pass.heading} pass`}
              onClick={() => setSelectedId((prev) => (prev === pass.id ? null : pass.id))}
              whileHover={reducedMotion ? undefined : { rotate: pass.hoverTilt, y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.985 }}
              animate={
                reducedMotion
                  ? undefined
                  : isSelected
                    ? { scale: 1.03, y: -4 }
                    : { scale: 1, y: 0 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="group relative flex flex-col items-center w-full max-w-[280px] origin-top cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-foreground rounded-2xl"
            >
              {/* Hanging Black Cord & Molded Grey Clasp */}
              <LanyardHardware />

              {/* Die-Cut Festival Pass Card */}
              <div
                className={`relative w-full aspect-[1/1.02] rounded-[13px] mb-10 text-left overflow-visible transition-shadow duration-200 ${pass.borderClass} ${
                  isSelected ? "ring-2 ring-foreground/60 ring-offset-4 ring-offset-background" : ""
                }`}
                style={{ backgroundColor: pass.bg }}
              >
                {/* Top-center punched lanyard slot */}
                <div
                  className="absolute top-[5.8%] left-1/2 -translate-x-1/2 w-8 h-[6px] rounded-full bg-background/95 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] z-10"
                  aria-hidden="true"
                />

                {/* Top-left micro studio lockup + Top-right brand badge */}
                <div className="absolute top-[13%] inset-x-[8%] flex items-start justify-between gap-2 z-10 pointer-events-none">
                  <div className="leading-[1.12] tracking-[-0.02em]" style={{ color: pass.textColor }}>
                    <div className="text-[11px] font-bold">
                      ZeroSlash{" "}
                      <span className="font-normal text-[9px] italic" style={{ color: pass.mutedColor }}>
                        2025
                      </span>
                    </div>
                    <div className="text-[10px] font-medium" style={{ color: pass.mutedColor }}>
                      Digital Studio
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-[#FF2442] text-white text-[8px] font-bold tracking-[0.02em] px-2 py-[3px] leading-none shadow-xs">
                    ZEROSLASH
                  </span>
                </div>

                {/* Curved hand-drawn ink marker title */}
                <svg
                  viewBox="0 0 240 245"
                  className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
                  aria-hidden="true"
                >
                  {pass.letters.map((l, idx) => (
                    <text
                      key={`${pass.id}-${idx}`}
                      x={l.x}
                      y={l.y}
                      transform={`rotate(${l.rot} ${l.x} ${l.y})`}
                      fill="#121212"
                      fontSize={l.size}
                      fontWeight="500"
                      style={{
                        fontFamily: "var(--font-sans)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {l.ch}
                    </text>
                  ))}
                </svg>

                {/* Protruding 3D miniature prop with contoured die-cut sticker outline */}
                <div
                  className={`absolute z-20 pointer-events-none select-none ${pass.propBoxClass}`}
                  style={{ filter: `url(#diecut-${pass.id})` }}
                >
                  <Image
                    src={pass.propSrc}
                    alt={pass.propAlt}
                    fill
                    sizes="(max-width: 640px) 62vw, (max-width: 1024px) 34vw, 220px"
                    referrerPolicy="no-referrer"
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.button>

            {/* Clean editorial heading & description aligned neatly beneath each hanging pass */}
            <div className="w-full max-w-[270px] text-center sm:text-left px-1">
              <h3 className="text-sm md:text-base font-bold text-foreground mb-2 tracking-tight uppercase">
                {pass.heading}
              </h3>
              <p className="text-foreground/75 leading-relaxed text-sm">
                {pass.description}
              </p>
            </div>
          </article>
        )
      })}
      </div>
    </div>
  )
}
