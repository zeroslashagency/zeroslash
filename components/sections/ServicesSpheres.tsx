"use client"

import Image from "next/image"
import { memo, useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

/* ------------------------------------------------------------------ *
 * Stacked service discs
 *
 * Each service category is one very large circle, offset further down the
 * stage than the one before it, so every layer shows only its top arc.
 * At rest a disc is almost the page itself: the same cream plate, a
 * hairline, a faint bloom of its own colour, and its title. Nothing else.
 *
 * Every band shows its photograph straight away — the flower is the point,
 * so it is not hidden behind a hover. Pointing at a band holds that one at
 * full strength and drops the others behind a cream veil. The detail (what
 * the category covers) is read out on the left rail, next to the headline,
 * never printed over the petals.
 *
 * Cost control: the plates are masked to the band each disc actually shows,
 * nothing animates perpetually, and nothing is scroll-linked. Only opacity
 * and transform are animated.
 * ------------------------------------------------------------------ */

type Layer = {
  id: string
  title: string
  lede: string
  /** Macro-floral plate for the band. */
  image: string
  /** Hairline + readout accent colour. */
  tone: string
  services: string[]
}

const LAYERS: Layer[] = [
  {
    id: "web",
    title: "Web",
    lede: "Sites that carry weight",
    image: "/images/approach/investigate.webp",
    tone: "oklch(0.62 0.1 45)",
    services: ["Portfolio", "E-commerce", "Landing pages", "SaaS platforms"],
  },
  {
    id: "marketing",
    title: "Marketing",
    lede: "Attention, then retention",
    image: "/images/approach/build.webp",
    tone: "oklch(0.56 0.13 340)",
    services: ["Instagram", "Content", "Paid social", "Email", "SEO"],
  },
  {
    id: "branding",
    title: "Branding",
    lede: "The part people remember",
    image: "/images/approach/create.webp",
    tone: "oklch(0.55 0.12 265)",
    services: ["Visual identity", "Design systems", "Positioning"],
  },
  {
    id: "product",
    title: "Product",
    lede: "Where it all lands",
    image: "/images/approach/investigate.webp",
    tone: "oklch(0.58 0.1 150)",
    services: ["UI/UX", "Prototyping", "Research"],
  },
]

const MOBILE_LAYERS: Layer[] = [
  {
    id: "web",
    title: "Web",
    lede: "Sites that carry weight",
    image: "/images/approach/investigate.webp",
    tone: "oklch(0.62 0.1 45)",
    services: ["Portfolio", "E-comm", "SaaS"],
  },
  {
    id: "marketing",
    title: "Marketing",
    lede: "Attention, then retention",
    image: "/images/approach/build.webp",
    tone: "oklch(0.56 0.13 340)",
    services: ["Instagram", "Content", "SEO"],
  },
  {
    id: "shape",
    title: "Brand & Product",
    lede: "Identity through to interface",
    image: "/images/approach/create.webp",
    tone: "oklch(0.55 0.12 265)",
    services: ["Identity", "Systems", "UI/UX"],
  },
]

/* Stage geometry in percentages. `width` is the disc diameter as a share
 * of stage width — over 100% so each arc reads as a horizon, not a ball.
 * `start`/`step` are top offsets as a share of stage height, `step` being
 * the closed band height. `push` is how far the layers in front of the
 * open one travel down to give it room. */
type Geometry = {
  width: number
  start: number
  step: number
  push: string
  /** Stage width ÷ stage height. Needed to convert band % of the stage into
   * band % of a disc, which is what the plate mask is measured in. */
  aspect: number
}

const DESKTOP_GEOMETRY: Geometry = { width: 104, start: 1, step: 21, push: "14%", aspect: 6 / 5 }
const MOBILE_GEOMETRY: Geometry = { width: 112, start: 1, step: 23, push: "14%", aspect: 4 / 5 }

const CREAM = "rgb(251, 250, 248)"
const EASE = [0.16, 1, 0.3, 1] as const

/* The photograph is confined to the band the disc actually shows. `hold` is
 * where the plate is still solid and `fade` where it has gone, both as a
 * share of the circle's own height — so a stacked band only paints its arc,
 * while the front disc is allowed a longer dome before it dissolves into
 * the cream. */
function plateMask(hold: number, fade: number) {
  return `linear-gradient(to bottom, black 0%, black ${hold}%, rgba(0,0,0,0.5) ${(hold + fade) / 2}%, transparent ${fade}%)`
}

/* A disc's height equals `width`% of the stage width, so as a share of the
 * stage's own height it is `width * aspect`. Everything the mask needs is
 * measured against that: `step`% of the stage is one band, and whatever is
 * left below a disc's top edge is the room it has before the stage ends. */
function circleSpan(geometry: Geometry) {
  return geometry.width * geometry.aspect
}

/** One closed band, as a share of a disc's own height. */
function bandShareOfCircle(geometry: Geometry) {
  return (geometry.step / circleSpan(geometry)) * 100
}

/** Room between a disc's top edge and the bottom of the stage, again as a
 * share of the disc's own height — how much of it can be shown at all. */
function roomShareOfCircle(geometry: Geometry, top: number) {
  return ((100 - top) / circleSpan(geometry)) * 100
}

function useIsCompact() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return compact
}

/* ------------------------------------------------------------------ *
 * One disc. Memoized, so pointing at a band only re-renders the bands
 * whose state actually changed.
 * ------------------------------------------------------------------ */

type DomeProps = {
  layer: Layer
  index: number
  geometry: Geometry
  animate: boolean
  activeIndex: number
  /** The last disc in the stack — nothing covers it, so it keeps a taller dome. */
  isFront: boolean
  onActivate: (id: string | null) => void
}

const Dome = memo(function Dome({
  layer,
  index,
  geometry,
  animate,
  activeIndex,
  isFront,
  onActivate,
}: DomeProps) {
  const isActive = activeIndex === index
  const isDimmed = activeIndex !== -1 && !isActive
  const pushed = activeIndex !== -1 && index > activeIndex

  const top = geometry.start + index * geometry.step

  const handleEnter = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") onActivate(layer.id)
    },
    [layer.id, onActivate],
  )
  const handleLeave = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") onActivate(null)
    },
    [onActivate],
  )

  const duration = animate ? 0.5 : 0
  const spring = animate
    ? { type: "spring" as const, stiffness: 100, damping: 20 }
    : { duration: 0 }

  /* A stacked band is covered by the disc in front of it, so its plate only
   * needs to reach a little past its own band. The front disc has nothing
   * over it, so it gets a taller dome — but one that is finished before the
   * stage runs out, so it dissolves into the cream instead of being cut off
   * by the section edge. */
  const band = bandShareOfCircle(geometry)
  const room = roomShareOfCircle(geometry, top)
  const mask = isFront
    ? plateMask(Math.min(band * 2, room * 0.42), Math.min(band * 4, room * 0.82))
    : plateMask(band * 1.25, band * 1.9)

  return (
    <motion.div
      className="absolute"
      style={{
        top: `${top}%`,
        left: "50%",
        width: `${geometry.width}%`,
        marginLeft: `${-geometry.width / 2}%`,
        aspectRatio: "1 / 1",
        zIndex: index + 1,
      }}
      initial={animate ? { opacity: 0, y: 14 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: animate ? 0.6 : 0, delay: index * 0.08, ease: EASE }}
    >
      <motion.button
        type="button"
        aria-label={`${layer.title}. ${layer.lede}. ${layer.services.join(", ")}`}
        aria-pressed={isActive}
        className="sphere-dome absolute inset-0 w-full overflow-hidden rounded-full bg-transparent text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        animate={{ y: pushed ? geometry.push : "0%" }}
        transition={spring}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onFocus={() => onActivate(layer.id)}
        onBlur={() => onActivate(null)}
        onClick={() => onActivate(isActive ? null : layer.id)}
      >
        {/* Everything painted lives inside the mask, so a disc only ever
            marks the band it shows. Outside it there is no plate, no veil
            and no rim — otherwise the full circle would ghost down the
            page as an outline. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
          {/* The photograph, visible from the start. */}
          <Image
            src={layer.image}
            alt=""
            fill
            sizes="(max-width: 767px) 115vw, 62vw"
            quality={70}
            loading="eager"
            className="object-cover"
          />

          {/* A short scrim under the title keeps the type legible — the
              rest of the petals stay petals. */}
          <span
            className="absolute inset-x-0 top-0"
            style={{
              height: `${geometry.step * 1.15}%`,
              background: `linear-gradient(to bottom, color-mix(in oklab, ${CREAM} 82%, transparent) 0%, color-mix(in oklab, ${CREAM} 26%, transparent) 62%, transparent 100%)`,
            }}
          />

          {/* The bands you are not pointing at fade back behind cream. */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: CREAM }}
            animate={{ opacity: isDimmed ? 0.55 : 0 }}
            transition={{ duration, ease: EASE }}
          />

          {/* Rim: inset hairline only, weighted up while open. Masked with
              the plate, so it reads as the band's top arc. */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${layer.tone} 34%, transparent)`,
            }}
            animate={{ opacity: isActive ? 1 : isDimmed ? 0.3 : 0.7 }}
            transition={{ duration, ease: EASE }}
          />
        </span>

        {/* Title only. Everything else about the layer is read out on the
            left rail, so nothing is printed across the petals. */}
        <motion.span
          className="sphere-ink pointer-events-none absolute left-1/2 -translate-x-1/2 text-center font-[family-name:var(--font-display-serif)] leading-[0.95] tracking-tight"
          style={{ top: "3.6%", width: "74%", fontSize: "clamp(1.1rem, 5cqw, 2.9rem)" }}
          animate={{ opacity: isDimmed ? 0.35 : 1 }}
          transition={{ duration, ease: EASE }}
        >
          {layer.title}
        </motion.span>
      </motion.button>
    </motion.div>
  )
})

/* ------------------------------------------------------------------ *
 * Left-rail readout — the open band's detail, next to the headline.
 * ------------------------------------------------------------------ */

const Readout = memo(function Readout({
  layer,
  animate,
  compact,
}: {
  layer: Layer | null
  animate: boolean
  compact: boolean
}) {
  const duration = animate ? 0.32 : 0

  return (
    <div className="mt-8 min-h-[8.5rem]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {layer ? (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: animate ? 8 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: animate ? -6 : 0 }}
            transition={{ duration, ease: EASE }}
          >
            <span
              className="inline-flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: layer.tone }}
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: layer.tone }}
              />
              {layer.title}
            </span>

            <p className="sphere-ink mt-3 font-[family-name:var(--font-display-serif)] text-xl leading-tight tracking-tight md:text-2xl">
              {layer.lede}
            </p>

            <ul className="mt-4 grid gap-1.5">
              {layer.services.map((service) => (
                <li
                  key={service}
                  className="sphere-ink-soft flex items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-[0.66rem] uppercase tracking-[0.14em]"
                >
                  <span
                    aria-hidden
                    className="inline-block h-px w-3"
                    style={{ backgroundColor: layer.tone, opacity: 0.7 }}
                  />
                  {service}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: EASE }}
            className="sphere-ink-soft font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-[0.2em] opacity-70"
          >
            {compact ? "Tap a band" : "Hover a band"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

/* ------------------------------------------------------------------ *
 * Section
 * ------------------------------------------------------------------ */

export default function ServicesSpheres() {
  const [active, setActive] = useState<string | null>(null)

  const compact = useIsCompact()
  const reduced = useReducedMotion()
  const animate = !reduced

  const layers = compact ? MOBILE_LAYERS : LAYERS
  const geometry = compact ? MOBILE_GEOMETRY : DESKTOP_GEOMETRY
  const activeIndex = layers.findIndex((layer) => layer.id === active)
  const activeLayer = activeIndex === -1 ? null : layers[activeIndex]

  // Clear the open band when the layer set swaps at the breakpoint.
  useEffect(() => setActive(null), [compact])

  return (
    <section
      aria-label="What we do"
      className="sphere-section relative mx-[calc(50%-50vw)] w-screen max-w-none overflow-hidden py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-14 md:px-6 lg:gap-20">
        {/* Left rail — headline plus the open band's detail */}
        <header>
          <span className="sphere-ink-soft inline-flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[0.62rem] uppercase tracking-[0.22em]">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "oklch(0.62 0.1 45)" }}
            />
            What we do
          </span>

          <h2 className="sphere-ink mt-5 font-[family-name:var(--font-display-serif)] text-4xl leading-[0.95] tracking-tight md:text-5xl lg:text-[3.2rem]">
            Every service
            <br />
            sits inside
            <br />
            the last one
          </h2>

          <Readout layer={activeLayer} animate={animate} compact={compact} />
        </header>

        {/* Stage */}
        <div
          className="sphere-stage relative mx-auto w-full max-w-[26rem] md:max-w-[44rem]"
          style={{ aspectRatio: String(geometry.aspect) }}
        >
          {layers.map((layer, index) => (
            <Dome
              key={layer.id}
              layer={layer}
              index={index}
              geometry={geometry}
              animate={animate}
              activeIndex={activeIndex}
              isFront={index === layers.length - 1}
              onActivate={setActive}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
