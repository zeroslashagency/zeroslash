export type PillarId = "design" | "build" | "grow"

export interface TransformPillar {
  id: PillarId
  index: string
  discipline: string
  title: "Design" | "Build" | "Grow"
  monoSubtitle: string
  description: string
  ctaLabel: string
  artworkAlt: string
  items: readonly string[]
}

export const TRANSFORM_PILLARS: readonly TransformPillar[] = [
  {
    id: "design",
    index: "01",
    discipline: "Strategy & UX",
    title: "Design",
    monoSubtitle: "Strategy & UI craft that turns visitors into trust.",
    description:
      "We design conversion-focused websites that don’t just look great—they build trust and turn visitors into customers.",
    ctaLabel: "Start a Design project",
    artworkAlt:
      "Monochrome etched ink illustration of two classical sculptural busts facing each other across studio columns",
    items: [
      "Discovery & Strategy",
      "Web Design & UI/UX",
      "User-Centered Experience",
      "Accessible, Inclusive Design",
    ],
  },
  {
    id: "build",
    index: "02",
    discipline: "Engineering",
    title: "Build",
    monoSubtitle: "Fast, scalable architecture built to endure and perform.",
    description:
      "We engineer fast, scalable, and reliable platforms that adapt to your growth and deliver seamless performance.",
    ctaLabel: "Start a Build project",
    artworkAlt:
      "Monochrome engraved architectural illustration of a monumental stone colosseum amphitheater",
    items: [
      "Website Development",
      "Shopify & E-commerce",
      "CMS Solutions (Custom & Headless)",
      "Technical SEO Foundations",
    ],
  },
  {
    id: "grow",
    index: "03",
    discipline: "Performance",
    title: "Grow",
    monoSubtitle: "Focused campaigns built to compound measurable growth.",
    description:
      "We craft data-driven marketing campaigns that help you attract, engage, and retain customers.",
    ctaLabel: "Start a Grow project",
    artworkAlt:
      "Monochrome stippled ink illustration of a lone armored strategist with spear and round shield",
    items: [
      "Paid Advertising (PPC)",
      "Search Engine Optimisation",
      "Content & Email Marketing",
      "Social Media Growth",
    ],
  },
] as const

export interface CardRect {
  left: number
  top: number
  width: number
  height: number
}

export interface CardTiltState {
  rotateX: number
  rotateY: number
  glowX: number
  glowY: number
}

export const NEUTRAL_TILT: CardTiltState = {
  rotateX: 0,
  rotateY: 0,
  glowX: 50,
  glowY: 35,
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Computes clamped 3D perspective tilt angles and subtle sheen coordinates from a pointer event.
 */
export function computeCardTilt(params: {
  clientX: number
  clientY: number
  rect: CardRect
  maxDeg?: number
  reducedMotion?: boolean
}): CardTiltState {
  const { clientX, clientY, rect, maxDeg = 5.5, reducedMotion = false } = params
  if (reducedMotion || rect.width <= 0 || rect.height <= 0) {
    return NEUTRAL_TILT
  }

  const normX = clampNumber((clientX - rect.left) / rect.width, 0, 1)
  const normY = clampNumber((clientY - rect.top) / rect.height, 0, 1)

  const rotateY = Number(((normX - 0.5) * 2 * maxDeg).toFixed(2))
  const rotateX = Number(((0.5 - normY) * 2 * maxDeg).toFixed(2))

  return {
    rotateX,
    rotateY,
    glowX: Number((normX * 100).toFixed(1)),
    glowY: Number((normY * 100).toFixed(1)),
  }
}

export function findPillarById(id: PillarId | null): TransformPillar | null {
  if (!id) return null
  return TRANSFORM_PILLARS.find((pillar) => pillar.id === id) ?? null
}

export function getAdjacentPillarId(
  currentId: PillarId,
  direction: 1 | -1
): PillarId {
  const idx = TRANSFORM_PILLARS.findIndex((pillar) => pillar.id === currentId)
  if (idx === -1) return TRANSFORM_PILLARS[0].id
  const nextIdx =
    (idx + direction + TRANSFORM_PILLARS.length) % TRANSFORM_PILLARS.length
  return TRANSFORM_PILLARS[nextIdx].id
}
