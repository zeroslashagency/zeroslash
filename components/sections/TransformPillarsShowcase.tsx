"use client"

import React, { useEffect, useState } from "react"
import Image, { type StaticImageData } from "next/image"
import { ArrowRight, ArrowUpRight, Compass, Layers, TrendingUp, X } from "lucide-react"
import designInk from "@/src/assets/images/pillar_design_ink_1794953108208.jpg"
import buildInk from "@/src/assets/images/pillar_build_ink_1794953109533.jpg"
import growInk from "@/src/assets/images/pillar_grow_ink_1794953109748.jpg"
import {
  computeCardTilt,
  findPillarById,
  getAdjacentPillarId,
  NEUTRAL_TILT,
  TRANSFORM_PILLARS,
  type CardTiltState,
  type PillarId,
  type TransformPillar,
} from "@/lib/transform-pillars"

const PILLAR_ARTWORK: Record<PillarId, StaticImageData> = {
  design: designInk,
  build: buildInk,
  grow: growInk,
}

const PILLAR_FALLBACK_ICON: Record<PillarId, typeof Compass> = {
  design: Compass,
  build: Layers,
  grow: TrendingUp,
}

interface PillarMonolithCardProps {
  pillar: TransformPillar
  reducedMotion: boolean
  onInspect: (id: PillarId) => void
}

function PillarMonolithCard({
  pillar,
  reducedMotion,
  onInspect,
}: PillarMonolithCardProps) {
  const [tilt, setTilt] = useState<CardTiltState>(NEUTRAL_TILT)
  const [isHovered, setIsHovered] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const FallbackIcon = PILLAR_FALLBACK_ICON[pillar.id]

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || e.pointerType !== "mouse") return
    const rect = e.currentTarget.getBoundingClientRect()
    setTilt(
      computeCardTilt({
        clientX: e.clientX,
        clientY: e.clientY,
        rect,
        maxDeg: 5.5,
        reducedMotion,
      })
    )
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    setTilt(NEUTRAL_TILT)
  }

  return (
    <button
      type="button"
      onClick={() => onInspect(pillar.id)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setIsHovered(true)
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label={`${pillar.title} — ${pillar.discipline}. Inspect deliverables`}
      data-pillar-card={pillar.id}
      style={{
        transform: reducedMotion
          ? undefined
          : `perspective(1050px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) ${
              isHovered ? "translateY(-4px)" : "translateY(0px)"
            }`,
        transition: isHovered
          ? "transform 110ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease"
          : "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms ease",
      }}
      className={[
        "group relative flex flex-col justify-between text-center",
        "w-[76vw] max-w-[292px] md:w-full md:max-w-none shrink-0 snap-center",
        "min-h-[430px] sm:min-h-[455px] md:min-h-[490px]",
        "rounded-[14px] bg-[#FFFFFF] text-[#141414]",
        "border border-black/[0.07] dark:border-white/15",
        "shadow-[0_14px_36px_-22px_rgba(0,0,0,0.22)] hover:shadow-[0_24px_48px_-22px_rgba(0,0,0,0.28)]",
        "overflow-hidden cursor-pointer select-none will-change-transform",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground",
      ].join(" ")}
    >
      {/* Subtle interactive specular paper sheen on pointer hover */}
      {!reducedMotion && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-200"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 58%)`,
          }}
        />
      )}

      {/* Top centered micro ZeroSlash brand lockup matching reference */}
      <div className="relative z-10 pt-6 pb-1 px-6 flex items-center justify-center gap-1.5">
        <Image
          src="/images/logo.svg"
          alt=""
          width={15}
          height={15}
          referrerPolicy="no-referrer"
          className="w-[15px] h-[15px] object-contain opacity-90"
        />
        <span
          className="text-[14px] font-semibold tracking-[-0.02em] text-[#171717]"
          style={{ fontFamily: "var(--font-display-serif)" }}
        >
          zeroslash
        </span>
      </div>

      {/* Monochrome etched ink illustration area fading gently into paper white */}
      <div className="relative flex-1 w-full px-3 pt-1 flex items-center justify-center overflow-hidden">
        <div
          className="relative w-full h-[240px] sm:h-[255px] md:h-[275px] overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          style={{
            maskImage:
              pillar.id === "design"
                ? "radial-gradient(ellipse 88% 88% at 50% 44%, rgba(0,0,0,1) 54%, rgba(0,0,0,0) 98%)"
                : "linear-gradient(to bottom, rgba(0,0,0,1) 66%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              pillar.id === "design"
                ? "radial-gradient(ellipse 88% 88% at 50% 44%, rgba(0,0,0,1) 54%, rgba(0,0,0,0) 98%)"
                : "linear-gradient(to bottom, rgba(0,0,0,1) 66%, rgba(0,0,0,0) 100%)",
          }}
        >
          {imgFailed ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#f8f8f7] text-[#171717]/40 gap-2">
              <FallbackIcon className="w-10 h-10 stroke-[1.25]" aria-hidden="true" />
              <span
                className="text-[11px] uppercase tracking-[0.16em]"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                {pillar.discipline}
              </span>
            </div>
          ) : (
            <Image
              src={PILLAR_ARTWORK[pillar.id]}
              alt={pillar.artworkAlt}
              fill
              sizes="(max-width: 768px) 76vw, 340px"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className={[
                "pointer-events-none select-none transition-opacity duration-300",
                pillar.id === "design"
                  ? "object-cover object-center opacity-85 group-hover:opacity-95"
                  : "object-contain object-center opacity-92 group-hover:opacity-100",
              ].join(" ")}
            />
          )}
        </div>

        {/* Soft top feather on Design colonnade */}
        {pillar.id === "design" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#FFFFFF]/80 to-transparent"
          />
        )}

        {/* Bottom paper dissolve scrim guaranteeing smooth text separation */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/85 to-transparent"
        />
      </div>

      {/* Centered editorial serif title + mono subtitle */}
      <div className="relative z-10 px-6 pb-6 pt-1 bg-[#FFFFFF]">
        <h3
          className="text-[30px] md:text-[34px] font-semibold tracking-[-0.025em] leading-[1.06] text-[#161616]"
          style={{ fontFamily: "var(--font-display-serif)" }}
        >
          {pillar.title}
        </h3>

        <p
          className="mt-2.5 text-[12px] md:text-[12.5px] leading-[1.55] text-[#6d6d6a] max-w-[26ch] mx-auto"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {pillar.monoSubtitle}
        </p>

        {/* Quiet hover-brightened inspect deliverables cue */}
        <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.04em] text-[#171717]/55 group-hover:text-[#171717] transition-colors duration-200">
          <span style={{ fontFamily: "var(--font-geist-mono)" }}>Inspect deliverables</span>
          <ArrowUpRight
            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  )
}

interface TransformPillarsShowcaseProps {
  onStartProject: () => void
}

export default function TransformPillarsShowcase({
  onStartProject,
}: TransformPillarsShowcaseProps) {
  const [inspectedId, setInspectedId] = useState<PillarId | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Keyboard Escape + Left/Right pillar navigation when deliverables modal is open
  useEffect(() => {
    if (!inspectedId) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInspectedId(null)
      } else if (e.key === "ArrowRight") {
        setInspectedId((prev) => (prev ? getAdjacentPillarId(prev, 1) : null))
      } else if (e.key === "ArrowLeft") {
        setInspectedId((prev) => (prev ? getAdjacentPillarId(prev, -1) : null))
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [inspectedId])

  const inspectedPillar = findPillarById(inspectedId)

  return (
    <>
      <div className="max-w-[1040px] mx-auto">
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-7 lg:gap-9 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRANSFORM_PILLARS.map((pillar) => (
            <PillarMonolithCard
              key={pillar.id}
              pillar={pillar}
              reducedMotion={reducedMotion}
              onInspect={setInspectedId}
            />
          ))}
        </div>

        <p className="md:hidden text-center text-xs text-foreground/55 mt-3">
          Swipe cards · Tap any card for deliverables
        </p>
      </div>

      {/* Click-to-Inspect Deliverables Modal */}
      {inspectedPillar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pillar-inspector-title"
          className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-[3px]"
          onClick={() => setInspectedId(null)}
        >
          <div
            className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-card text-card-foreground border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar: pillar switcher tabs + close button */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div
                role="tablist"
                aria-label="Switch pillar deliverables"
                className="flex items-center gap-1 p-1 rounded-lg bg-muted"
              >
                {TRANSFORM_PILLARS.map((p) => {
                  const active = p.id === inspectedPillar.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setInspectedId(p.id)}
                      className={`min-h-[36px] px-3 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? "bg-card text-foreground shadow-xs"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {p.title}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                aria-label="Close deliverables"
                onClick={() => setInspectedId(null)}
                className="w-10 h-10 rounded-full grid place-items-center text-foreground/70 hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Artwork preview + Editorial summary */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-20 h-24 rounded-xl bg-[#FFFFFF] border border-black/[0.08] overflow-hidden shrink-0">
                  <Image
                    src={PILLAR_ARTWORK[inspectedPillar.id]}
                    alt={inspectedPillar.artworkAlt}
                    fill
                    sizes="80px"
                    referrerPolicy="no-referrer"
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[11px] uppercase tracking-[0.16em] text-foreground/55 tabular-nums mb-1"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {inspectedPillar.index}. {inspectedPillar.discipline}
                  </div>
                  <h3
                    id="pillar-inspector-title"
                    className="text-3xl font-semibold tracking-[-0.02em] text-foreground leading-none"
                    style={{ fontFamily: "var(--font-display-serif)" }}
                  >
                    {inspectedPillar.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-[15px] text-foreground/75 leading-relaxed mb-5">
                {inspectedPillar.description}
              </p>

              {/* Deliverables breakdown */}
              <div
                className="text-[11px] uppercase tracking-[0.14em] text-foreground/50 mb-2"
                style={{ fontFamily: "var(--font-geist-mono)" }}
              >
                Included capabilities
              </div>
              <ul className="border-t border-border divide-y divide-border">
                {inspectedPillar.items.map((item, idx) => (
                  <li key={item} className="flex items-baseline gap-3.5 py-3">
                    <span
                      className="text-xs text-foreground/45 tabular-nums shrink-0"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      0{idx + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Primary CTA opening existing Project Wizard */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setInspectedId(null)
                    onStartProject()
                  }}
                  className="w-full min-h-12 px-5 rounded-full bg-foreground text-background text-sm font-semibold inline-flex items-center justify-between gap-3 hover:opacity-90 transition-opacity"
                >
                  <span>{inspectedPillar.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
