"use client"

import { useEffect, useRef } from "react"

interface SkyWisp {
  x: number
  y: number
  scale: number
  speed: number
  alpha: number
}

interface BridgeCar {
  progress: number
  kind: "purple" | "mint" | "truck" | "peach" | "coupe"
}

interface CachedCloudLayers {
  dark: boolean
  dpr: number
  back: HTMLCanvasElement
  mid: HTMLCanvasElement
  front: HTMLCanvasElement
}

const ART_W = 1440
const ART_H = 560
const CLOUD_PAD_X = 140
const CLOUD_CANVAS_W = ART_W + CLOUD_PAD_X * 2
const CLOUD_CANVAS_H = ART_H + 90

function quadPoint(
  t: number,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number
) {
  const mt = 1 - t
  const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1
  const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1
  const dx = 2 * mt * (cx - x0) + 2 * t * (x1 - cx)
  const dy = 2 * mt * (cy - y0) + 2 * t * (y1 - cy)
  return { x, y, angle: Math.atan2(dy, dx) }
}

/**
 * Cubic Bezier helper for smooth architectural/bridge curves.
 */
function cubicPoint(
  t: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
) {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t
  const x = mt2 * mt * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t2 * t * x3
  const y = mt2 * mt * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t2 * t * y3
  const dx =
    3 * mt2 * (x1 - x0) + 6 * mt * t * (x2 - x1) + 3 * t2 * (x3 - x2)
  const dy =
    3 * mt2 * (y1 - y0) + 6 * mt * t * (y2 - y1) + 3 * t2 * (y3 - y2)
  return { x, y, angle: Math.atan2(dy, dx) }
}

/**
 * Deterministic watercolor/cardstock paper grain tile baked once per context.
 */
function createPaperGrainCanvas(dark: boolean): HTMLCanvasElement {
  const tile = document.createElement("canvas")
  tile.width = 160
  tile.height = 160
  const tctx = tile.getContext("2d")
  if (!tctx) return tile

  let seed = dark ? 9137 : 4219
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  for (let i = 0; i < 1600; i++) {
    const x = rand() * 160
    const y = rand() * 160
    const r = 0.6 + rand() * 1.4
    const bright = rand() > 0.5
    if (dark) {
      tctx.fillStyle = bright
        ? `rgba(210, 216, 245, ${0.015 + rand() * 0.025})`
        : `rgba(8, 10, 18, ${0.04 + rand() * 0.05})`
    } else {
      tctx.fillStyle = bright
        ? `rgba(255, 252, 246, ${0.04 + rand() * 0.05})`
        : `rgba(94, 82, 118, ${0.022 + rand() * 0.032})`
    }
    tctx.beginPath()
    tctx.arc(x, y, r, 0, Math.PI * 2)
    tctx.fill()
  }
  return tile
}

/**
 * Deterministic organic charcoal/nib line stroke helper (never flickers between frames).
 */
function strokeHandLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  width = 1.9,
  wobble = 0.85
) {
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy)
  if (len < 1) return
  const nx = -dy / len
  const ny = dx / len
  const steps = Math.max(2, Math.floor(len / 18))

  ctx.save()
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const jitter =
      i === steps ? 0 : Math.sin(x0 * 0.37 + y0 * 0.53 + i * 2.17) * wobble
    ctx.lineTo(x0 + dx * t + nx * jitter, y0 + dy * t + ny * jitter)
  }
  ctx.stroke()

  // Subtle dry-charcoal secondary pass for authentic nib tooth
  ctx.globalAlpha *= 0.34
  ctx.lineWidth = Math.max(0.7, width * 0.52)
  ctx.beginPath()
  ctx.moveTo(x0 + nx * 0.55, y0 + ny * 0.55)
  ctx.lineTo(x1 - nx * 0.45, y1 - ny * 0.45)
  ctx.stroke()
  ctx.restore()
}

/**
 * Organic multi-scale cloud silhouettes (large sweeping domes + medium swells + edge puffs)
 * with soft lavender/twilight watercolor mist rather than repetitive semicircular stamps.
 */
const BACK_CLOUD_PUFFS: [number, number, number][] = [
  [18, 338, 114],
  [158, 342, 108],
  [305, 355, 115],
  [445, 338, 128],
  [585, 344, 126],
  [735, 352, 116],
  [865, 340, 118],
  [995, 346, 115],
  [1135, 336, 124],
  [1295, 324, 134],
  [1435, 332, 122],
]

const MID_CLOUD_PUFFS: [number, number, number][] = [
  [-10, 412, 92],
  [108, 424, 62],
  [216, 418, 70],
  [328, 428, 72],
  [445, 408, 86],
  [555, 396, 108],
  [678, 408, 92],
  [798, 412, 94],
  [922, 416, 84],
  [1045, 392, 108],
  [1178, 398, 96],
  [1320, 412, 118],
  [1445, 404, 96],
]

const FRONT_CLOUD_PUFFS: [number, number, number][] = [
  [-25, 536, 82],
  [90, 548, 62],
  [178, 558, 44],
  [522, 540, 82],
  [622, 522, 94],
  [734, 538, 74],
  [860, 508, 106],
  [986, 514, 112],
  [1112, 502, 98],
  [1246, 488, 118],
  [1382, 508, 110],
  [1475, 526, 92],
]

function bakeUnifiedCloudMass(
  puffs: [number, number, number][],
  baseY: number,
  fillTop: string,
  fillBottom: string,
  haloColor: string,
  warmRgb: string | null,
  haloBlur: number,
  haloOffsetY: number,
  dpr: number
): HTMLCanvasElement {
  const scale = Math.min(dpr, 1.5)
  const off = document.createElement("canvas")
  off.width = Math.round(CLOUD_CANVAS_W * scale)
  off.height = Math.round(CLOUD_CANVAS_H * scale)
  const octx = off.getContext("2d")
  if (!octx) return off

  octx.setTransform(scale, 0, 0, scale, 0, 0)
  octx.translate(CLOUD_PAD_X, 0)

  // 1. Soft watercolor mist halo behind upper cloud ridge
  octx.save()
  octx.translate(0, haloOffsetY)
  octx.filter = `blur(${haloBlur}px)`
  octx.fillStyle = haloColor
  octx.beginPath()
  for (const [cx, cy, r] of puffs) {
    octx.moveTo(cx + r * 1.04, cy)
    octx.arc(cx, cy, r * 1.04, 0, Math.PI * 2)
  }
  octx.rect(-CLOUD_PAD_X, baseY, CLOUD_CANVAS_W, CLOUD_CANVAS_H - baseY)
  octx.fill()
  octx.restore()

  // 2. Unified billowing bank with clean atmospheric gradient
  const grad = octx.createLinearGradient(0, baseY - 125, 0, CLOUD_CANVAS_H)
  grad.addColorStop(0, fillTop)
  grad.addColorStop(0.55, fillBottom)
  grad.addColorStop(1, fillBottom)
  octx.fillStyle = grad
  octx.beginPath()
  for (const [cx, cy, r] of puffs) {
    octx.moveTo(cx + r, cy)
    octx.arc(cx, cy, r, 0, Math.PI * 2)
  }
  octx.rect(-CLOUD_PAD_X, baseY, CLOUD_CANVAS_W, CLOUD_CANVAS_H - baseY)
  octx.fill()

  // 3. Soft warm-lilac mist drift using matched-RGB zero-alpha endpoint (never muddy gray)
  if (warmRgb) {
    octx.save()
    octx.beginPath()
    for (const [cx, cy, r] of puffs) {
      octx.moveTo(cx + r, cy)
      octx.arc(cx, cy, r, 0, Math.PI * 2)
    }
    octx.rect(-CLOUD_PAD_X, baseY, CLOUD_CANVAS_W, CLOUD_CANVAS_H - baseY)
    octx.clip()

    const rightGlow = octx.createRadialGradient(1285, 395, 25, 1285, 395, 210)
    rightGlow.addColorStop(0, `rgba(${warmRgb}, 0.42)`)
    rightGlow.addColorStop(1, `rgba(${warmRgb}, 0)`)
    octx.fillStyle = rightGlow
    octx.fillRect(1020, 220, 480, 340)

    const leftGlow = octx.createRadialGradient(545, 345, 15, 545, 345, 180)
    leftGlow.addColorStop(0, `rgba(${warmRgb}, 0.36)`)
    leftGlow.addColorStop(1, `rgba(${warmRgb}, 0)`)
    octx.fillStyle = leftGlow
    octx.fillRect(320, 180, 440, 300)
    octx.restore()
  }

  return off
}

function createCachedCloudLayers(isDark: boolean, dpr: number): CachedCloudLayers {
  return {
    dark: isDark,
    dpr,
    back: bakeUnifiedCloudMass(
      BACK_CLOUD_PUFFS,
      360,
      isDark ? "#25283c" : "#f5effb",
      isDark ? "#1f2233" : "#fcfaff",
      isDark ? "rgba(116, 124, 178, 0.24)" : "rgba(226, 216, 242, 0.52)",
      isDark ? "130, 108, 165" : "242, 226, 244",
      24,
      -6,
      dpr
    ),
    mid: bakeUnifiedCloudMass(
      MID_CLOUD_PUFFS,
      415,
      isDark ? "#1d202f" : "#ffffff",
      isDark ? "#181b28" : "#ffffff",
      isDark ? "rgba(96, 106, 158, 0.22)" : "rgba(234, 225, 246, 0.44)",
      isDark ? "128, 112, 160" : "245, 233, 245",
      18,
      -5,
      dpr
    ),
    front: bakeUnifiedCloudMass(
      FRONT_CLOUD_PUFFS,
      528,
      isDark ? "#161823" : "#ffffff",
      isDark ? "#12141d" : "#ffffff",
      isDark ? "rgba(92, 102, 152, 0.2)" : "rgba(234, 225, 246, 0.4)",
      null,
      16,
      -4,
      dpr
    ),
  }
}

function drawSketchyOutlineCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  strokeColor: string,
  fillColor: string
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  const trace = () => {
    ctx.beginPath()
    ctx.moveTo(-42, 12)
    ctx.bezierCurveTo(-56, 11, -59, -5, -42, -10)
    ctx.bezierCurveTo(-40, -25, -20, -30, -8, -19)
    ctx.bezierCurveTo(2, -34, 25, -29, 28, -14)
    ctx.bezierCurveTo(43, -16, 53, -3, 45, 9)
    ctx.bezierCurveTo(46, 16, 32, 18, 20, 15)
    ctx.bezierCurveTo(3, 19, -18, 18, -31, 14)
    ctx.closePath()
  }

  trace()
  ctx.fillStyle = fillColor
  ctx.fill()

  ctx.lineWidth = 1.65
  ctx.strokeStyle = strokeColor
  ctx.stroke()

  // Delicate secondary charcoal wisp line along upper left rim
  ctx.globalAlpha *= 0.45
  ctx.lineWidth = 1.05
  ctx.beginPath()
  ctx.moveTo(-40, -8)
  ctx.bezierCurveTo(-36, -21, -20, -26, -9, -18)
  ctx.stroke()

  ctx.restore()
}

function drawLeftEdgeBalloon(
  ctx: CanvasRenderingContext2D,
  dark: boolean,
  grainPattern: CanvasPattern | null
) {
  const ink = dark ? "rgba(218, 222, 242, 0.85)" : "#2f2a38"
  ctx.save()
  ctx.translate(0, 212)

  const traceEnvelope = () => {
    ctx.beginPath()
    ctx.moveTo(-42, -60)
    ctx.bezierCurveTo(24, -52, 34, 34, 4, 118)
    ctx.lineTo(-42, 118)
    ctx.closePath()
  }

  traceEnvelope()
  const baseGrad = ctx.createLinearGradient(-15, -50, 22, 105)
  baseGrad.addColorStop(0, dark ? "#685458" : "#e6a593")
  baseGrad.addColorStop(1, dark ? "#43384c" : "#cf8c7c")
  ctx.fillStyle = baseGrad
  ctx.fill()

  ctx.save()
  traceEnvelope()
  ctx.clip()

  // Center yellow/cream vertical gore
  ctx.beginPath()
  ctx.moveTo(-14, -58)
  ctx.bezierCurveTo(8, -28, 12, 32, -6, 118)
  ctx.lineTo(-24, 118)
  ctx.closePath()
  ctx.fillStyle = dark ? "#766650" : "#f2dc96"
  ctx.fill()
  if (grainPattern) {
    ctx.fillStyle = grainPattern
    ctx.fill()
  }
  ctx.lineWidth = 1.5
  ctx.strokeStyle = ink
  ctx.stroke()

  // Slate-blue left vertical gore
  ctx.beginPath()
  ctx.moveTo(-34, -58)
  ctx.bezierCurveTo(-12, -28, -10, 32, -26, 118)
  ctx.lineTo(-42, 118)
  ctx.closePath()
  ctx.fillStyle = dark ? "#45516c" : "#8fa4be"
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = ink
  ctx.stroke()

  // Charcoal curved hatching near shaded lower taper
  ctx.strokeStyle = dark ? "rgba(18, 19, 28, 0.52)" : "rgba(47, 42, 56, 0.36)"
  ctx.lineWidth = 1.05
  for (let hy = 24; hy <= 98; hy += 4.5) {
    ctx.beginPath()
    ctx.moveTo(-10, hy)
    ctx.lineTo(22, hy + 5)
    ctx.stroke()
  }
  ctx.restore()

  // Outer nib outline
  ctx.beginPath()
  ctx.moveTo(-34, -59)
  ctx.bezierCurveTo(24, -52, 34, 34, 4, 118)
  ctx.lineWidth = 2.1
  ctx.strokeStyle = ink
  ctx.stroke()

  ctx.restore()
}

function drawCottageRow(
  ctx: CanvasRenderingContext2D,
  dark: boolean,
  grainPattern: CanvasPattern | null
) {
  const ink = dark ? "rgba(218, 222, 242, 0.88)" : "#2e2838"
  const roofLightA = "#e0a290"
  const roofLightB = "#cc8a7a"
  const roofDarkA = "#6d484e"
  const roofDarkB = "#4d3137"

  // Helper to paint textured terracotta pitched roof plane with broken horizontal shingle dashes
  const paintTerracottaRoof = (
    bl: [number, number],
    tl: [number, number],
    tr: [number, number],
    br: [number, number],
    rows: number,
    dashSeed: number
  ) => {
    const traceRoof = () => {
      ctx.beginPath()
      ctx.moveTo(bl[0], bl[1])
      ctx.lineTo(tl[0], tl[1])
      ctx.lineTo(tr[0], tr[1])
      ctx.lineTo(br[0], br[1])
      ctx.closePath()
    }

    traceRoof()
    const rGrad = ctx.createLinearGradient(tl[0], tl[1], bl[0], bl[1])
    rGrad.addColorStop(0, dark ? roofDarkA : roofLightA)
    rGrad.addColorStop(1, dark ? roofDarkB : roofLightB)
    ctx.fillStyle = rGrad
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }

    // Hand-drawn broken horizontal shingle courses inside clipped roof quad
    ctx.save()
    traceRoof()
    ctx.clip()
    const shingleInk = dark ? "rgba(220, 224, 244, 0.34)" : "rgba(46, 40, 56, 0.56)"
    ctx.strokeStyle = shingleInk
    ctx.lineWidth = 1.15
    ctx.lineCap = "round"

    for (let r = 1; r <= rows; r++) {
      const t = r / (rows + 1)
      const lx = tl[0] + (bl[0] - tl[0]) * t
      const ly = tl[1] + (bl[1] - tl[1]) * t
      const rx = tr[0] + (br[0] - tr[0]) * t
      const ry = tr[1] + (br[1] - tr[1]) * t
      const segs = 3
      for (let s = 0; s < segs; s++) {
        const s0 = s / segs + (s === 0 ? 0.04 : 0.06)
        const s1 = (s + 1) / segs - (s === segs - 1 ? 0.04 : 0.03 + ((r + s + dashSeed) % 2) * 0.04)
        if (s1 <= s0) continue
        ctx.beginPath()
        ctx.moveTo(lx + (rx - lx) * s0, ly + (ry - ly) * s0)
        ctx.lineTo(lx + (rx - lx) * s1, ly + (ry - ly) * s1)
        ctx.stroke()
      }
    }
    ctx.restore()

    // Crisp nib roof perimeter
    strokeHandLine(ctx, bl[0], bl[1], tl[0], tl[1], ink, 2.1, 0.45)
    strokeHandLine(ctx, tl[0], tl[1], tr[0], tr[1], ink, 2.2, 0.45)
    strokeHandLine(ctx, tr[0], tr[1], br[0], br[1], ink, 2.0, 0.4)
    strokeHandLine(ctx, br[0], br[1], bl[0], bl[1], ink, 2.1, 0.45)
  }

  // Helper for tall arched-top attic/facade window with soft interior tint & sill
  const drawArchedWindow = (wx: number, wy: number, w: number, h: number) => {
    ctx.save()
    if (dark) {
      ctx.shadowColor = "rgba(255, 212, 112, 0.85)"
      ctx.shadowBlur = 12
    }
    ctx.beginPath()
    ctx.roundRect(wx - w / 2, wy, w, h, [w / 2, w / 2, 1, 1])
    ctx.fillStyle = dark ? "#ffd67e" : "#bfb4cf"
    ctx.fill()
    ctx.lineWidth = 1.65
    ctx.strokeStyle = ink
    ctx.stroke()

    if (!dark) {
      ctx.beginPath()
      ctx.moveTo(wx - w * 0.12, wy + 2.5)
      ctx.lineTo(wx - w * 0.12, wy + h - 2)
      ctx.lineWidth = 0.85
      ctx.strokeStyle = "rgba(46, 40, 56, 0.4)"
      ctx.stroke()
    }
    ctx.restore()
  }

  ctx.save()

  // Draw back-to-front so foreground roofs/gables overlap cleanly in 3/4 view!
  // Using true parallel roof quads (bl extends down-left behind the adjacent house) keeps shingle lines parallel.
  // ── HOUSE 4 (Far-right Lavender) ──
  paintTerracottaRoof([251, 326], [268, 290], [303, 287], [279, 327], 3, 4)
  {
    const gGrad = ctx.createLinearGradient(0, 287, 0, 392)
    gGrad.addColorStop(0, dark ? "#3e3958" : "#cebde2")
    gGrad.addColorStop(1, dark ? "#2b2740" : "#bda9d4")
    ctx.beginPath()
    ctx.moveTo(279, 396)
    ctx.lineTo(279, 327)
    ctx.lineTo(303, 287)
    ctx.lineTo(323, 330)
    ctx.lineTo(323, 396)
    ctx.closePath()
    ctx.fillStyle = gGrad
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }
    strokeHandLine(ctx, 279, 396, 279, 327, ink, 1.9, 0.35)
    strokeHandLine(ctx, 279, 327, 303, 287, ink, 2.1, 0.4)
    strokeHandLine(ctx, 303, 287, 325, 332, ink, 2.15, 0.4)
    strokeHandLine(ctx, 323, 330, 323, 396, ink, 1.95, 0.35)
    drawArchedWindow(302, 329, 5.2, 11)
  }

  // ── HOUSE 3 (Coral / Peach) ──
  paintTerracottaRoof([196, 328], [220, 284], [262, 279], [233, 326], 4, 3)
  {
    const gGrad = ctx.createLinearGradient(0, 279, 0, 392)
    gGrad.addColorStop(0, dark ? "#573d49" : "#efb7a1")
    gGrad.addColorStop(1, dark ? "#3f2a34" : "#dfa28d")
    ctx.beginPath()
    ctx.moveTo(233, 396)
    ctx.lineTo(233, 326)
    ctx.lineTo(262, 279)
    ctx.lineTo(281, 329)
    ctx.lineTo(281, 396)
    ctx.closePath()
    ctx.fillStyle = gGrad
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }
    strokeHandLine(ctx, 233, 396, 233, 326, ink, 1.95, 0.35)
    strokeHandLine(ctx, 233, 326, 262, 279, ink, 2.15, 0.4)
    strokeHandLine(ctx, 262, 279, 282, 330, ink, 2.2, 0.4)
    strokeHandLine(ctx, 280, 328, 280, 396, ink, 1.95, 0.35)
    drawArchedWindow(259, 326, 5.8, 12)
  }

  // ── HOUSE 2 (Butter Yellow) ──
  paintTerracottaRoof([132, 326], [158, 277], [212, 271], [175, 322], 4, 2)
  {
    const gGrad = ctx.createLinearGradient(0, 271, 0, 392)
    gGrad.addColorStop(0, dark ? "#544b5a" : "#fae49d")
    gGrad.addColorStop(1, dark ? "#3c3543" : "#edd384")
    ctx.beginPath()
    ctx.moveTo(175, 396)
    ctx.lineTo(175, 322)
    ctx.lineTo(212, 271)
    ctx.lineTo(235, 327)
    ctx.lineTo(235, 396)
    ctx.closePath()
    ctx.fillStyle = gGrad
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }
    strokeHandLine(ctx, 175, 396, 175, 322, ink, 1.95, 0.35)
    strokeHandLine(ctx, 175, 322, 212, 271, ink, 2.15, 0.4)
    strokeHandLine(ctx, 212, 271, 236, 328, ink, 2.2, 0.4)
    strokeHandLine(ctx, 234, 326, 234, 396, ink, 1.95, 0.35)
    drawArchedWindow(208, 323, 6.2, 13.5)
  }

  // ── HOUSE 1 (Foreground Leftmost Lavender with Wide Side Wall & Tiled Roof) ──
  // Side wall (left face)
  {
    const sideGrad = ctx.createLinearGradient(48, 320, 48, 405)
    sideGrad.addColorStop(0, dark ? "#3d3756" : "#cebde2")
    sideGrad.addColorStop(1, dark ? "#2a263e" : "#bda9d4")
    ctx.beginPath()
    ctx.moveTo(49, 328)
    ctx.lineTo(110, 322)
    ctx.lineTo(110, 402)
    ctx.lineTo(49, 408)
    ctx.closePath()
    ctx.fillStyle = sideGrad
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }
    // Subtle eave overhang shadow along top of side wall
    ctx.beginPath()
    ctx.moveTo(49, 328)
    ctx.lineTo(110, 322)
    ctx.lineTo(110, 328)
    ctx.lineTo(49, 334)
    ctx.closePath()
    ctx.fillStyle = dark ? "rgba(14, 15, 24, 0.5)" : "rgba(46, 40, 56, 0.16)"
    ctx.fill()

    strokeHandLine(ctx, 49, 328, 49, 408, ink, 2.05, 0.4)
  }

  // Front gable wall of House 1
  {
    const fGrad = ctx.createLinearGradient(0, 266, 0, 398)
    fGrad.addColorStop(0, dark ? "#433d5d" : "#d3c3e6")
    fGrad.addColorStop(1, dark ? "#2e2943" : "#bfaed7")
    ctx.beginPath()
    ctx.moveTo(110, 402)
    ctx.lineTo(110, 322)
    ctx.lineTo(148, 266)
    ctx.lineTo(179, 326)
    ctx.lineTo(179, 398)
    ctx.closePath()
    ctx.fillStyle = fGrad
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }
    strokeHandLine(ctx, 110, 402, 110, 322, ink, 2.0, 0.35)
    strokeHandLine(ctx, 110, 322, 148, 266, ink, 2.15, 0.4)
    strokeHandLine(ctx, 148, 266, 181, 328, ink, 2.25, 0.4)
    strokeHandLine(ctx, 178, 325, 178, 398, ink, 1.95, 0.35)
    drawArchedWindow(145, 323, 6.8, 14.5)
  }

  // Wide terracotta roof of House 1 overhanging slightly past left wall & front corner
  paintTerracottaRoof([39, 329], [78, 272], [148, 266], [108, 323], 5, 1)

  ctx.restore()
}

function drawScallopedDome(
  ctx: CanvasRenderingContext2D,
  dark: boolean,
  grainPattern: CanvasPattern | null
) {
  const ink = dark ? "rgba(218, 222, 242, 0.85)" : "#2f2a38"
  const cx = 454
  const cy = 382
  const rx = 108
  const ry = 82

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0)
  ctx.closePath()
  const mintGrad = ctx.createLinearGradient(cx, cy - ry, cx, cy)
  mintGrad.addColorStop(0, dark ? "#336860" : "#7ad2ba")
  mintGrad.addColorStop(1, dark ? "#244c47" : "#61b7a1")
  ctx.fillStyle = mintGrad
  ctx.fill()
  if (grainPattern) {
    ctx.fillStyle = grainPattern
    ctx.fill()
  }

  ctx.save()
  ctx.clip()

  const slices = [
    { start: -1.0, end: -0.68, lavender: false },
    { start: -0.68, end: -0.34, lavender: true },
    { start: -0.34, end: 0.0, lavender: false },
    { start: 0.0, end: 0.34, lavender: true },
    { start: 0.34, end: 0.68, lavender: false },
    { start: 0.68, end: 1.0, lavender: true },
  ]

  for (const sl of slices) {
    ctx.beginPath()
    ctx.moveTo(cx, cy + 14)
    ctx.quadraticCurveTo(
      cx + sl.start * rx * 0.72,
      cy - ry * 0.65,
      cx + sl.start * rx * 0.55,
      cy - ry * 1.12
    )
    ctx.lineTo(cx + sl.end * rx * 0.55, cy - ry * 1.12)
    ctx.quadraticCurveTo(
      cx + sl.end * rx * 0.72,
      cy - ry * 0.65,
      cx,
      cy + 14
    )
    ctx.closePath()
    if (sl.lavender) {
      ctx.fillStyle = dark ? "#4b4874" : "#9f90cb"
      ctx.fill()
      if (grainPattern) {
        ctx.fillStyle = grainPattern
        ctx.fill()
      }
    }
    ctx.lineWidth = 1.65
    ctx.strokeStyle = ink
    ctx.stroke()
  }

  // Charcoal arc shading on far-left edge of dome
  ctx.strokeStyle = dark ? "rgba(15, 17, 25, 0.45)" : "rgba(47, 42, 56, 0.25)"
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    const yy = cy - ry + 14 + i * 5
    ctx.beginPath()
    ctx.moveTo(cx - rx, yy)
    ctx.lineTo(cx - rx + 26, yy + 3)
    ctx.stroke()
  }

  ctx.restore()

  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0)
  ctx.lineWidth = 2.15
  ctx.strokeStyle = ink
  ctx.stroke()
  ctx.restore()
}

function drawLighthouse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  topY: number,
  bottomHalfW: number,
  topHalfW: number,
  stripeLight: string,
  stripeDark: string,
  hasOvalPorthole: boolean,
  dark: boolean,
  beamPhase: number,
  grainPattern: CanvasPattern | null
) {
  const ink = dark ? "rgba(218, 222, 242, 0.86)" : "#2c2735"
  const bodyTop = dark ? "#383f56" : "#f9f8fc"
  const bodyBot = dark ? "#2a3044" : "#ebe8f3"
  const stripe = dark ? stripeDark : stripeLight
  const lanternY = topY - 13

  ctx.save()

  if (dark) {
    const angle = -0.16 + Math.sin(beamPhase) * 0.24
    ctx.save()
    ctx.translate(cx, lanternY)
    ctx.rotate(angle)
    const beam = ctx.createRadialGradient(0, 0, 4, 0, 0, 260)
    beam.addColorStop(0, "rgba(255, 224, 148, 0.42)")
    beam.addColorStop(0.55, "rgba(255, 214, 128, 0.12)")
    beam.addColorStop(1, "rgba(255, 214, 128, 0)")
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(255, -46)
    ctx.lineTo(255, 46)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Tapered tower body
  const traceBody = () => {
    ctx.beginPath()
    ctx.moveTo(cx - bottomHalfW, baseY)
    ctx.lineTo(cx - topHalfW, topY)
    ctx.lineTo(cx + topHalfW, topY)
    ctx.lineTo(cx + bottomHalfW, baseY)
    ctx.closePath()
  }

  ctx.save()
  traceBody()
  const bGrad = ctx.createLinearGradient(cx - bottomHalfW, topY, cx + bottomHalfW, topY)
  bGrad.addColorStop(0, bodyTop)
  bGrad.addColorStop(0.7, bodyTop)
  bGrad.addColorStop(1, bodyBot)
  ctx.fillStyle = bGrad
  ctx.fill()
  ctx.clip()

  // Bold diagonal stripes
  const step = (baseY - topY) * 0.27
  ctx.fillStyle = stripe
  for (let sy = topY - 8; sy < baseY + 34; sy += step * 1.92) {
    ctx.beginPath()
    ctx.moveTo(cx - bottomHalfW - 14, sy + 24)
    ctx.lineTo(cx + bottomHalfW + 14, sy - 10)
    ctx.lineTo(cx + bottomHalfW + 14, sy + step * 0.88 - 10)
    ctx.lineTo(cx - bottomHalfW - 14, sy + step * 0.88 + 24)
    ctx.closePath()
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
      ctx.fillStyle = stripe
    }
    ctx.lineWidth = 1.65
    ctx.strokeStyle = ink
    ctx.stroke()
  }

  // Charcoal vertical cross-hatching down the right cylinder shadow
  ctx.strokeStyle = dark ? "rgba(15, 17, 25, 0.55)" : "rgba(44, 39, 53, 0.42)"
  ctx.lineWidth = 1.05
  for (let i = 0; i < 5; i++) {
    const off = i * 3.1
    ctx.beginPath()
    ctx.moveTo(cx + topHalfW - 2.5 - off, topY + 2)
    ctx.lineTo(cx + bottomHalfW - 3.5 - off * 1.35, baseY)
    ctx.stroke()
  }
  ctx.restore()

  strokeHandLine(ctx, cx - bottomHalfW, baseY, cx - topHalfW, topY, ink, 2.2, 0.45)
  strokeHandLine(ctx, cx + topHalfW, topY, cx + bottomHalfW, baseY, ink, 2.2, 0.45)

  // Signature oval porthole
  if (hasOvalPorthole) {
    ctx.beginPath()
    ctx.ellipse(cx - 1.5, topY + (baseY - topY) * 0.42, 4.2, 6.8, 0, 0, Math.PI * 2)
    ctx.fillStyle = dark ? "#ffd37a" : "#ffffff"
    ctx.fill()
    ctx.lineWidth = 2.0
    ctx.strokeStyle = ink
    ctx.stroke()
  }

  // Curved 3D elliptical gallery deck + thick shadow underside
  const galW = topHalfW * 1.44
  ctx.beginPath()
  ctx.ellipse(cx, topY + 2, galW, 5.2, 0, 0, Math.PI * 2)
  ctx.fillStyle = dark ? "#434a62" : "#e9e6f0"
  ctx.fill()
  ctx.lineWidth = 1.9
  ctx.strokeStyle = ink
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx - galW + 2, topY + 3.5)
  ctx.quadraticCurveTo(cx, topY + 8, cx + galW - 2, topY + 3.5)
  ctx.lineWidth = 3.2
  ctx.strokeStyle = ink
  ctx.stroke()

  // Lantern room glass housing
  const lanW = topHalfW * 0.88
  ctx.beginPath()
  ctx.roundRect(cx - lanW, topY - 22, lanW * 2, 19, 3)
  ctx.fillStyle = dark ? "#ffe094" : "#fbfafc"
  ctx.fill()
  ctx.lineWidth = 1.95
  ctx.strokeStyle = ink
  ctx.stroke()

  // Circular cream lens disk with two subtle diagonal glass glint ticks
  const lensR = Math.max(5.2, lanW * 0.62)
  ctx.beginPath()
  ctx.arc(cx, topY - 12.5, lensR, 0, Math.PI * 2)
  ctx.fillStyle = dark ? "#fff0b8" : "#f8f2dc"
  ctx.fill()
  ctx.strokeStyle = ink
  ctx.lineWidth = 1.45
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx - lensR * 0.35, topY - 12.5 + lensR * 0.42)
  ctx.lineTo(cx + lensR * 0.25, topY - 12.5 - lensR * 0.42)
  ctx.moveTo(cx - lensR * 0.05, topY - 12.5 + lensR * 0.45)
  ctx.lineTo(cx + lensR * 0.45, topY - 12.5 - lensR * 0.28)
  ctx.lineWidth = 1.05
  ctx.strokeStyle = dark ? "rgba(80, 62, 24, 0.65)" : "rgba(44, 39, 53, 0.52)"
  ctx.stroke()

  // Dome cap with shaded right crescent
  ctx.beginPath()
  ctx.arc(cx, topY - 22, lanW * 1.02, Math.PI, 0)
  ctx.closePath()
  ctx.fillStyle = dark ? "#464e67" : "#ecebf3"
  ctx.fill()
  ctx.lineWidth = 1.95
  ctx.strokeStyle = ink
  ctx.stroke()

  // Lightning finial spire
  strokeHandLine(
    ctx,
    cx,
    topY - 22 - lanW * 1.02,
    cx,
    topY - 40 - lanW * 0.8,
    ink,
    1.85,
    0.25
  )

  ctx.restore()
}

function drawCurvedBridgeAndTraffic(
  ctx: CanvasRenderingContext2D,
  cars: BridgeCar[],
  dark: boolean,
  grainPattern: CanvasPattern | null
) {
  const ink = dark ? "rgba(218, 222, 242, 0.88)" : "#2a2533"
  const stoneTop = dark ? "#303549" : "#f7f5fa"
  const stoneBot = dark ? "#222636" : "#eae5f2"
  const archVoid = dark ? "#141622" : "#2f2a38"

  // Sweeping J/S viaduct path: loops forward on the left bend then arches cleanly rightward
  const p0 = { x: 185, y: 552 }
  const c1 = { x: 256, y: 458 }
  const c2 = { x: 438, y: 444 }
  const p1 = { x: 632, y: 472 }

  // 1. Vehicles riding smoothly along the bridge crest (crafted storybook scale)
  for (const car of cars) {
    const pt = cubicPoint(car.progress, p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p1.x, p1.y)
    ctx.save()
    ctx.translate(pt.x, pt.y - 2)
    ctx.rotate(pt.angle)

    // Subtle grounding contact shadow
    ctx.beginPath()
    ctx.ellipse(0, 0, car.kind === "truck" ? 28 : 16, 2.2, 0, 0, Math.PI * 2)
    ctx.fillStyle = dark ? "rgba(0, 0, 0, 0.45)" : "rgba(42, 37, 51, 0.22)"
    ctx.fill()

    if (car.kind === "truck") {
      // Cargo box
      ctx.beginPath()
      ctx.roundRect(-29, -22, 41, 18.5, 2)
      ctx.fillStyle = dark ? "#dcd8eb" : "#ffffff"
      ctx.fill()
      ctx.lineWidth = 1.85
      ctx.strokeStyle = ink
      ctx.stroke()

      // Handwritten cursive "fly" mark + tiny flourish
      ctx.save()
      ctx.font = "italic 700 11px Georgia, serif"
      ctx.fillStyle = dark ? "#383446" : "#3a3544"
      ctx.textAlign = "center"
      ctx.fillText("fly", -8.5, -9.5)
      ctx.beginPath()
      ctx.moveTo(-17, -6.5)
      ctx.quadraticCurveTo(-8.5, -5.2, 1, -7.2)
      ctx.lineWidth = 0.85
      ctx.strokeStyle = dark ? "#383446" : "#565063"
      ctx.stroke()
      ctx.restore()

      // Peach/coral cab with fender nose
      ctx.beginPath()
      ctx.moveTo(12, -3.5)
      ctx.lineTo(12, -17)
      ctx.lineTo(22, -17)
      ctx.lineTo(28, -10)
      ctx.lineTo(28, -3.5)
      ctx.closePath()
      ctx.fillStyle = dark ? "#9c686e" : "#ebb29f"
      ctx.fill()
      ctx.lineWidth = 1.8
      ctx.strokeStyle = ink
      ctx.stroke()

      // Cab windshield
      ctx.beginPath()
      ctx.moveTo(15, -14.5)
      ctx.lineTo(21, -14.5)
      ctx.lineTo(25, -10)
      ctx.lineTo(15, -10)
      ctx.closePath()
      ctx.fillStyle = dark ? "#ffe196" : "#dbe8f0"
      ctx.fill()
      ctx.lineWidth = 1.1
      ctx.stroke()

      // Wheels
      for (const wx of [-17, 19]) {
        ctx.beginPath()
        ctx.arc(wx, -2, 3.8, 0, Math.PI * 2)
        ctx.fillStyle = ink
        ctx.fill()
        ctx.beginPath()
        ctx.arc(wx, -2, 1.4, 0, Math.PI * 2)
        ctx.fillStyle = dark ? "#9ea4bd" : "#eceaf2"
        ctx.fill()
      }
      if (dark) {
        ctx.beginPath()
        ctx.arc(30, -6.5, 3, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 224, 145, 0.9)"
        ctx.fill()
      }
    } else {
      const fills: Record<Exclude<BridgeCar["kind"], "truck">, [string, string]> = {
        purple: ["#b9a3d9", "#725e91"],
        mint: ["#74cbb3", "#3f7a6c"],
        peach: ["#e8a791", "#925e50"],
        coupe: ["#e4d088", "#7a6d44"],
      }
      const [lightC, darkC] = fills[car.kind]
      const s = car.kind === "coupe" ? 1.05 : 1.18

      ctx.save()
      ctx.scale(s, s)
      ctx.beginPath()
      ctx.moveTo(-14, -2.5)
      ctx.lineTo(-13, -8.5)
      ctx.quadraticCurveTo(-8.5, -15, 0, -15)
      ctx.quadraticCurveTo(8, -15, 11, -8.5)
      ctx.lineTo(14.5, -6.5)
      ctx.lineTo(14.5, -2.5)
      ctx.closePath()
      ctx.fillStyle = dark ? darkC : lightC
      ctx.fill()
      ctx.lineWidth = 1.65
      ctx.strokeStyle = ink
      ctx.stroke()

      // Divided cabin windows
      ctx.beginPath()
      ctx.roundRect(-6.5, -12.8, 11.5, 4.8, 1.5)
      ctx.fillStyle = dark ? "#ffe096" : "#edf4f9"
      ctx.fill()
      ctx.lineWidth = 1.05
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-0.5, -12.8)
      ctx.lineTo(-0.5, -8)
      ctx.stroke()

      // Wheels with bright hubcaps
      for (const wx of [-8, 8]) {
        ctx.beginPath()
        ctx.arc(wx, -1.5, 3.1, 0, Math.PI * 2)
        ctx.fillStyle = ink
        ctx.fill()
        ctx.beginPath()
        ctx.arc(wx, -1.5, 1.1, 0, Math.PI * 2)
        ctx.fillStyle = dark ? "#9ea4bd" : "#eceaf2"
        ctx.fill()
      }
      ctx.restore()
    }

    ctx.restore()
  }

  // 2. Sculpted bridge masonry deck + foreshortened left curve road surface
  ctx.save()
  const traceViaduct = () => {
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p1.x, p1.y)
    ctx.lineTo(p1.x, p1.y + 84)
    ctx.lineTo(p0.x + 18, p0.y + 62)
    ctx.closePath()
  }

  // Foreshortened upper road loop on the far-left bend (gives 3D perspective depth)
  ctx.beginPath()
  ctx.moveTo(192, 548)
  ctx.quadraticCurveTo(212, 474, 306, 464)
  ctx.quadraticCurveTo(234, 488, 224, 548)
  ctx.closePath()
  ctx.fillStyle = dark ? "#2a2e40" : "#f1eef7"
  ctx.fill()
  ctx.lineWidth = 1.8
  ctx.strokeStyle = ink
  ctx.stroke()

  traceViaduct()
  const mGrad = ctx.createLinearGradient(0, 445, 0, 560)
  mGrad.addColorStop(0, stoneTop)
  mGrad.addColorStop(1, stoneBot)
  ctx.fillStyle = mGrad
  ctx.fill()
  if (grainPattern) {
    ctx.fillStyle = grainPattern
    ctx.fill()
  }
  ctx.lineWidth = 2.1
  ctx.strokeStyle = ink
  ctx.stroke()

  // Parapet double top trim line
  ctx.beginPath()
  ctx.moveTo(p0.x + 6, p0.y + 5.5)
  ctx.bezierCurveTo(c1.x + 2, c1.y + 6, c2.x, c2.y + 6, p1.x, p1.y + 6)
  ctx.lineWidth = 1.35
  ctx.strokeStyle = ink
  ctx.stroke()

  // Clipped deep stone arch vaults with dense vertical charcoal hatching
  traceViaduct()
  ctx.clip()

  const archTs = [0.22, 0.4, 0.58, 0.76, 0.93]
  for (const t of archTs) {
    const pt = cubicPoint(t, p0.x, p0.y, c1.x, c1.y, c2.x, c2.y, p1.x, p1.y)
    ctx.save()
    ctx.translate(pt.x, pt.y + 39)
    ctx.rotate(pt.angle * 0.72)

    ctx.beginPath()
    ctx.arc(0, -4, 19, Math.PI, 0)
    ctx.lineTo(19, 54)
    ctx.lineTo(-19, 54)
    ctx.closePath()
    ctx.fillStyle = stoneBot
    ctx.fill()

    // Heavy vertical charcoal shading inside arch vault
    ctx.save()
    ctx.clip()
    ctx.strokeStyle = archVoid
    ctx.lineWidth = 1.35
    for (let hx = -20; hx <= 20; hx += 2.8) {
      ctx.beginPath()
      ctx.moveTo(hx, -26)
      ctx.lineTo(hx + 1.2, 54)
      ctx.stroke()
    }
    ctx.restore()

    ctx.beginPath()
    ctx.arc(0, -4, 19, Math.PI, 0)
    ctx.lineTo(19, 54)
    ctx.moveTo(-19, -4)
    ctx.lineTo(-19, 54)
    ctx.lineWidth = 1.95
    ctx.strokeStyle = ink
    ctx.stroke()

    ctx.restore()
  }

  ctx.restore()
}

function drawWindTurbine(
  ctx: CanvasRenderingContext2D,
  x: number,
  hubY: number,
  baseY: number,
  bladeLen: number,
  bladeWidth: number,
  angle: number,
  dark: boolean,
  grainPattern: CanvasPattern | null
) {
  const ink = dark ? "rgba(218, 222, 242, 0.88)" : "#2c2735"
  const mastLight = dark ? "#7a6f54" : "#f5e3a4"
  const mastDark = dark ? "#5b523d" : "#dec882"
  const bladeBright = dark ? "#9a8c66" : "#f8e8ad"
  const bladeShade = dark ? "#776b4c" : "#e7d28b"

  ctx.save()

  // Tapered tower mast with sunlit left & shaded right bevel
  ctx.beginPath()
  ctx.moveTo(x - 11, baseY)
  ctx.lineTo(x - 3.5, hubY)
  ctx.lineTo(x + 3.5, hubY)
  ctx.lineTo(x + 12.5, baseY)
  ctx.closePath()
  const mastGrad = ctx.createLinearGradient(x - 10, hubY, x + 12, hubY)
  mastGrad.addColorStop(0, mastLight)
  mastGrad.addColorStop(0.58, mastLight)
  mastGrad.addColorStop(1, mastDark)
  ctx.fillStyle = mastGrad
  ctx.fill()
  if (grainPattern) {
    ctx.fillStyle = grainPattern
    ctx.fill()
  }
  ctx.lineWidth = 2.15
  ctx.strokeStyle = ink
  ctx.stroke()

  // Vertical spine shading line down mast
  strokeHandLine(
    ctx,
    x + 1.2,
    hubY + 5,
    x + 4.5,
    baseY,
    dark ? "rgba(18, 19, 28, 0.55)" : "rgba(44, 39, 53, 0.35)",
    1.15,
    0.35
  )

  // Three beveled sculpted airfoil blades
  ctx.translate(x, hubY)
  for (let i = 0; i < 3; i++) {
    ctx.save()
    ctx.rotate(angle + (i * Math.PI * 2) / 3)

    // Upper sunlit facet
    ctx.beginPath()
    ctx.moveTo(6, -1.5)
    ctx.lineTo(bladeLen * 0.42, -bladeWidth)
    ctx.lineTo(bladeLen, -1.5)
    ctx.lineTo(bladeLen * 0.42, 1.5)
    ctx.closePath()
    ctx.fillStyle = bladeBright
    ctx.fill()

    // Lower shaded facet
    ctx.beginPath()
    ctx.moveTo(6, -1.5)
    ctx.lineTo(bladeLen * 0.42, 1.5)
    ctx.lineTo(bladeLen, -1.5)
    ctx.lineTo(bladeLen * 0.5, bladeWidth * 0.55)
    ctx.lineTo(6, 3.8)
    ctx.closePath()
    ctx.fillStyle = bladeShade
    ctx.fill()

    // Crisp airfoil outline
    ctx.beginPath()
    ctx.moveTo(6, -2.5)
    ctx.lineTo(bladeLen * 0.42, -bladeWidth)
    ctx.lineTo(bladeLen, -1.5)
    ctx.lineTo(bladeLen * 0.5, bladeWidth * 0.55)
    ctx.lineTo(6, 3.8)
    ctx.closePath()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }
    ctx.lineWidth = 2.05
    ctx.lineJoin = "round"
    ctx.strokeStyle = ink
    ctx.stroke()

    // Central ridge line
    strokeHandLine(ctx, 8, 0.2, bladeLen * 0.94, -1.2, ink, 1.25, 0.3)

    ctx.restore()
  }

  // Hub nacelle + inner cap ring
  ctx.beginPath()
  ctx.arc(0, 0, 8.8, 0, Math.PI * 2)
  ctx.fillStyle = dark ? "#baab7e" : "#f7e8af"
  ctx.fill()
  ctx.lineWidth = 2.15
  ctx.strokeStyle = ink
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, 2.8, 0, Math.PI * 2)
  ctx.strokeStyle = ink
  ctx.lineWidth = 1.35
  ctx.stroke()

  ctx.restore()
}

function drawRightViaductAndTrain(
  ctx: CanvasRenderingContext2D,
  trainProgress: number,
  dark: boolean,
  grainPattern: CanvasPattern | null
) {
  const ink = dark ? "rgba(218, 222, 242, 0.88)" : "#2c2735"
  const deckFill = dark ? "#685c44" : "#e7d494"
  const underFill = dark ? "#2a2733" : "#494352"

  const x0 = 1152
  const y0 = 472
  const cx = 1312
  const cy = 362
  const x1 = 1468
  const y1 = 336

  ctx.save()

  // Sculpted hollow viaduct under-arch rim
  ctx.beginPath()
  ctx.moveTo(x0 + 18, y0 + 28)
  ctx.quadraticCurveTo(cx + 10, cy + 28, x1, y1 + 36)
  ctx.lineTo(x1, y1 + 14)
  ctx.quadraticCurveTo(cx, cy + 12, x0 + 6, y0 + 15)
  ctx.closePath()
  ctx.fillStyle = underFill
  ctx.fill()
  ctx.lineWidth = 1.75
  ctx.strokeStyle = ink
  ctx.stroke()

  // Tightly coupled 3-car streamlined lavender commuter train
  const cars = 3
  for (let c = 0; c < cars; c++) {
    const t = trainProgress + c * 0.242
    if (t < -0.22 || t > 1.24) continue
    const pt = quadPoint(t, x0, y0, cx, cy, x1, y1)

    ctx.save()
    ctx.translate(pt.x, pt.y - 1.5)
    ctx.rotate(pt.angle)

    const isLead = c === 0
    ctx.beginPath()
    if (isLead) {
      ctx.moveTo(-48, 0)
      ctx.bezierCurveTo(-44, -18, -20, -27, -2, -27)
      ctx.lineTo(39, -27)
      ctx.lineTo(39, 0)
    } else {
      ctx.roundRect(-38, -27, 76, 27, [3, 3, 0, 0])
    }
    ctx.closePath()
    const bodyGrad = ctx.createLinearGradient(0, -27, 0, 0)
    bodyGrad.addColorStop(0, dark ? "#6c6490" : "#cabae2")
    bodyGrad.addColorStop(1, dark ? "#534c72" : "#b39fd1")
    ctx.fillStyle = bodyGrad
    ctx.fill()
    if (grainPattern) {
      ctx.fillStyle = grainPattern
      ctx.fill()
    }
    ctx.lineWidth = 2.05
    ctx.strokeStyle = ink
    ctx.stroke()

    // Panoramic window strip with slender vertical mullions
    ctx.beginPath()
    if (isLead) {
      ctx.moveTo(-38, -11)
      ctx.quadraticCurveTo(-30, -22, -6, -22)
      ctx.lineTo(34, -22)
      ctx.lineTo(34, -11)
    } else {
      ctx.roundRect(-34, -22, 68, 11, 2)
    }
    ctx.closePath()
    ctx.fillStyle = dark ? "#ffd98c" : "#edf4fa"
    ctx.fill()
    ctx.lineWidth = 1.45
    ctx.strokeStyle = ink
    ctx.stroke()

    // Window pillar dividers
    const cols = isLead ? [-16, 4, 20] : [-18, -2, 14]
    ctx.lineWidth = 1.2
    for (const px of cols) {
      ctx.beginPath()
      ctx.moveTo(px, -22)
      ctx.lineTo(px, -11)
      ctx.stroke()
    }

    // Characteristic wavy trim stripe along carriage skirt
    ctx.beginPath()
    ctx.moveTo(isLead ? -34 : -34, -5.5)
    ctx.bezierCurveTo(-12, -8, 12, -3, 34, -5.5)
    ctx.lineWidth = 1.3
    ctx.strokeStyle = dark ? "rgba(218, 222, 242, 0.58)" : "rgba(44, 39, 53, 0.65)"
    ctx.stroke()

    ctx.restore()
  }

  // Golden curved viaduct deck beam
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.quadraticCurveTo(cx, cy, x1, y1)
  ctx.lineTo(x1, y1 + 19)
  ctx.quadraticCurveTo(cx + 2, cy + 18, x0 + 6, y0 + 18)
  ctx.closePath()
  ctx.fillStyle = deckFill
  ctx.fill()
  if (grainPattern) {
    ctx.fillStyle = grainPattern
    ctx.fill()
  }
  ctx.lineWidth = 2.15
  ctx.strokeStyle = ink
  ctx.stroke()

  ctx.restore()
}

export default function CloudHorizonCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = container.clientWidth || 1280
    let height = container.clientHeight || 720
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let isDark = document.documentElement.classList.contains("dark")
    let cloudLayers = createCachedCloudLayers(isDark, dpr)
    let grainPattern = ctx.createPattern(createPaperGrainCanvas(isDark), "repeat")

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionQuery.matches
    let isVisible = true

    // True-to-nature serene speeds (high cumulus wisps, realistic bridge traffic & coastal breeze)
    const skyWisps: SkyWisp[] = [
      { x: 716, y: 274, scale: 1.0, speed: 2.1, alpha: 0.88 },
      { x: 1074, y: 204, scale: 0.96, speed: 1.7, alpha: 0.85 },
      { x: 378, y: 174, scale: 0.78, speed: 1.4, alpha: 0.5 },
    ]

    const cars: BridgeCar[] = [
      { progress: 0.24, kind: "purple" },
      { progress: 0.4, kind: "mint" },
      { progress: 0.58, kind: "truck" },
      { progress: 0.77, kind: "peach" },
      { progress: 0.91, kind: "coupe" },
    ]

    let trainProgress = 0.58
    let simTime = 0

    const syncThemeAndCache = () => {
      const nextDark = document.documentElement.classList.contains("dark")
      if (nextDark !== isDark || Math.abs(cloudLayers.dpr - dpr) > 0.01) {
        isDark = nextDark
        cloudLayers = createCachedCloudLayers(isDark, dpr)
        grainPattern = ctx.createPattern(createPaperGrainCanvas(isDark), "repeat")
      }
    }

    const resize = () => {
      width = Math.max(320, container.clientWidth)
      height = Math.max(380, container.clientHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      syncThemeAndCache()
    }

    resize()

    let rafId = 0
    let lastTs = performance.now()

    const renderFrame = (dt: number) => {
      if (!reducedMotion) {
        simTime += dt

        for (const w of skyWisps) {
          w.x += w.speed * dt
          if (w.x > ART_W + 95) w.x = -95
        }

        // Calm highway cruise (~48 seconds across full curved viaduct)
        for (const c of cars) {
          c.progress += 0.019 * dt
          if (c.progress > 1.08) c.progress = -0.08
        }

        // Smooth elevated commuter rail glide (~34 seconds per crossing)
        trainProgress -= 0.028 * dt
        if (trainProgress < -0.68) trainProgress = 1.22
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      // Responsive artboard fit: edge-to-edge on desktop, balanced storybook landmarks on mobile
      const maxHorizonH = height * 0.6
      const widthScale = width < 640 ? Math.max(width / ART_W, 0.39) : width / ART_W
      const scale = Math.min(widthScale, maxHorizonH / ART_H)
      const drawW = ART_W * scale
      const drawH = ART_H * scale
      const offsetX = width < 640 ? (width - drawW) * 0.22 : (width - drawW) / 2
      const offsetY = height - drawH

      if (isDark) {
        const glow = ctx.createRadialGradient(
          width * 0.55,
          height - drawH * 0.34,
          20,
          width * 0.55,
          height - drawH * 0.34,
          width * 0.65
        )
        glow.addColorStop(0, "rgba(116, 126, 178, 0.14)")
        glow.addColorStop(0.55, "rgba(56, 62, 102, 0.06)")
        glow.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, width, height)
      }

      ctx.save()
      ctx.translate(offsetX, offsetY)
      ctx.scale(scale, scale)

      // 1. Floating outline sky clouds (delicate lilac outlines)
      const outlineStroke = isDark ? "rgba(204, 210, 240, 0.28)" : "rgba(192, 180, 214, 0.68)"
      const outlineFill = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.82)"
      for (const w of skyWisps) {
        ctx.save()
        ctx.globalAlpha = w.alpha
        drawSketchyOutlineCloud(ctx, w.x, w.y, w.scale, outlineStroke, outlineFill)
        ctx.restore()
      }

      // 2. Smooth back lavender/twilight mist cloud bank (cached offscreen)
      ctx.drawImage(cloudLayers.back, -CLOUD_PAD_X, 0, CLOUD_CANVAS_W, CLOUD_CANVAS_H)

      // 3. Tall right wind turbine behind right clouds (serene real-world breeze ~18s rev)
      drawWindTurbine(
        ctx,
        1192,
        146,
        360,
        118,
        14,
        reducedMotion ? 0.52 : simTime * 0.34 + 0.52,
        isDark,
        grainPattern
      )

      // 4. Center-right distant striped lighthouse peeking through cloud crest
      drawLighthouse(
        ctx,
        958,
        418,
        282,
        26,
        14,
        "#89aec6",
        "#324c63",
        false,
        isDark,
        simTime * 0.38 + 1.4,
        grainPattern
      )

      // 5. Left edge hot-air balloon + 4 pastel gables + green/lavender dome
      drawLeftEdgeBalloon(ctx, isDark, grainPattern)
      drawCottageRow(ctx, isDark, grainPattern)
      drawScallopedDome(ctx, isDark, grainPattern)

      // 6. Smooth mid white/slate cloud bank framing cottage bases & dome (cached offscreen)
      ctx.drawImage(cloudLayers.mid, -CLOUD_PAD_X, 0, CLOUD_CANVAS_W, CLOUD_CANVAS_H)

      // 7. Right elevated golden viaduct + gliding commuter train
      drawRightViaductAndTrain(
        ctx,
        reducedMotion ? 0.58 : trainProgress,
        isDark,
        grainPattern
      )

      // 8. Center foreground wind turbine rising out of lower center cloud bank
      drawWindTurbine(
        ctx,
        762,
        400,
        560,
        108,
        13.5,
        reducedMotion ? -0.35 : simTime * 0.42 - 0.35,
        isDark,
        grainPattern
      )

      // 9. Curved stone arch bridge + moving vehicles (purple, mint, "fly" truck, peach, coupe)
      drawCurvedBridgeAndTraffic(ctx, cars, isDark, grainPattern)

      // 10. Foreground left striped lighthouse (in front of left bridge curve)
      drawLighthouse(
        ctx,
        78,
        556,
        372,
        32,
        17,
        "#9ed4c8",
        "#2e545b",
        true,
        isDark,
        simTime * 0.44,
        grainPattern
      )

      // 11. Smooth foreground pillowy cloud bank overlapping landmark bases (cached offscreen)
      ctx.drawImage(cloudLayers.front, -CLOUD_PAD_X, 0, CLOUD_CANVAS_W, CLOUD_CANVAS_H)

      // Bottom center small outline cloud accent
      drawSketchyOutlineCloud(ctx, 720, 532, 0.78, outlineStroke, outlineFill)

      ctx.restore()

      // Soft bottom fade matching --background cleanly (same RGB endpoints avoid gray band)
      const fadeRgb = isDark ? "13, 13, 14" : "251, 250, 248"
      const bottomFade = ctx.createLinearGradient(0, height - 26, 0, height)
      bottomFade.addColorStop(0, `rgba(${fadeRgb}, 0)`)
      bottomFade.addColorStop(1, `rgba(${fadeRgb}, 1)`)
      ctx.fillStyle = bottomFade
      ctx.fillRect(0, height - 26, width, 26)
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000)
      lastTs = now
      if (isVisible) {
        renderFrame(dt)
      }
      if (!reducedMotion && isVisible) {
        rafId = requestAnimationFrame(tick)
      } else {
        rafId = 0
      }
    }

    const startLoop = () => {
      if (reducedMotion) {
        renderFrame(0)
        return
      }
      if (!rafId && isVisible) {
        lastTs = performance.now()
        rafId = requestAnimationFrame(tick)
      }
    }

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    }

    const ro = new ResizeObserver(() => {
      resize()
      renderFrame(0)
    })
    ro.observe(container)

    const mo = new MutationObserver(() => {
      syncThemeAndCache()
      renderFrame(0)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) startLoop()
        else stopLoop()
      },
      { threshold: 0 }
    )
    io.observe(container)

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches
      stopLoop()
      startLoop()
    }
    motionQuery.addEventListener("change", onMotionChange)

    renderFrame(0)
    startLoop()

    return () => {
      stopLoop()
      ro.disconnect()
      mo.disconnect()
      io.disconnect()
      motionQuery.removeEventListener("change", onMotionChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
