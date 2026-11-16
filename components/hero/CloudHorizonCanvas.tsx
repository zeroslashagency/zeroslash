"use client"

import { useEffect, useRef } from "react"

interface SkyCloud {
  x: number
  y: number
  scale: number
  speed: number
  opacity: number
}

interface Vehicle {
  progress: number
  speed: number
  colorLight: string
  colorDark: string
  isTruck?: boolean
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawOutlineCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  strokeColor: string,
  fillColor: string
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)
  ctx.beginPath()
  ctx.moveTo(-46, 12)
  ctx.bezierCurveTo(-58, 12, -62, -4, -46, -8)
  ctx.bezierCurveTo(-45, -24, -22, -30, -10, -20)
  ctx.bezierCurveTo(0, -34, 24, -30, 28, -14)
  ctx.bezierCurveTo(44, -18, 56, -4, 48, 8)
  ctx.bezierCurveTo(50, 16, 36, 18, 22, 16)
  ctx.bezierCurveTo(4, 20, -18, 19, -32, 15)
  ctx.bezierCurveTo(-40, 16, -44, 14, -46, 12)
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.lineWidth = 1.4
  ctx.strokeStyle = strokeColor
  ctx.stroke()
  ctx.restore()
}

function drawWindTurbine(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  mastHeight: number,
  bladeLength: number,
  angle: number,
  dark: boolean
) {
  const ink = dark ? "rgba(214, 219, 238, 0.72)" : "#3b3842"
  const mastFill = dark ? "#5d5543" : "#efe0a2"
  const bladeFill = dark ? "#9e906b" : "#f5e39e"

  ctx.save()

  // Slender tapered tower
  const topY = baseY - mastHeight
  ctx.beginPath()
  ctx.moveTo(x - 5.5, baseY)
  ctx.lineTo(x - 1.8, topY)
  ctx.lineTo(x + 1.8, topY)
  ctx.lineTo(x + 6.5, baseY)
  ctx.closePath()
  ctx.fillStyle = mastFill
  ctx.fill()
  ctx.lineWidth = 1.35
  ctx.strokeStyle = ink
  ctx.stroke()

  // Rotating 3-blade rotor
  ctx.translate(x, topY)
  for (let i = 0; i < 3; i++) {
    ctx.save()
    ctx.rotate(angle + (i * Math.PI * 2) / 3)
    ctx.beginPath()
    ctx.moveTo(0, -2)
    ctx.quadraticCurveTo(bladeLength * 0.42, -9, bladeLength, -1)
    ctx.quadraticCurveTo(bladeLength * 0.46, 4.5, 0, 2.5)
    ctx.closePath()
    ctx.fillStyle = bladeFill
    ctx.fill()
    ctx.lineWidth = 1.3
    ctx.strokeStyle = ink
    ctx.stroke()
    ctx.restore()
  }

  // Hub nacelle
  ctx.beginPath()
  ctx.arc(0, 0, 4.2, 0, Math.PI * 2)
  ctx.fillStyle = dark ? "#c9be97" : "#f7e8af"
  ctx.fill()
  ctx.lineWidth = 1.35
  ctx.strokeStyle = ink
  ctx.stroke()

  ctx.restore()
}

function drawLighthouse(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  stripeColor: string,
  dark: boolean,
  beamPhase: number
) {
  const ink = dark ? "rgba(214, 219, 238, 0.75)" : "#36343d"
  const bodyColor = dark ? "#32374a" : "#f6f5fa"
  const stripe = dark ? "#2e525d" : stripeColor

  ctx.save()
  ctx.translate(x, baseY)
  ctx.scale(scale, scale)

  // Soft sweeping lantern beam in dark mode
  if (dark) {
    const beamAngle = -0.15 + Math.sin(beamPhase) * 0.28
    ctx.save()
    ctx.translate(0, -90)
    ctx.rotate(beamAngle)
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 175)
    grad.addColorStop(0, "rgba(255, 224, 150, 0.36)")
    grad.addColorStop(0.55, "rgba(255, 215, 130, 0.11)")
    grad.addColorStop(1, "rgba(255, 215, 130, 0)")
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(170, -34)
    ctx.lineTo(170, 34)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Tower body
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(-16, 0)
  ctx.lineTo(-9, -78)
  ctx.lineTo(9, -78)
  ctx.lineTo(16, 0)
  ctx.closePath()
  ctx.fillStyle = bodyColor
  ctx.fill()
  ctx.clip()

  // Diagonal nautical bands
  ctx.fillStyle = stripe
  for (let sy = -72; sy <= 18; sy += 28) {
    ctx.beginPath()
    ctx.moveTo(-22, sy + 8)
    ctx.lineTo(22, sy - 6)
    ctx.lineTo(22, sy + 6)
    ctx.lineTo(-22, sy + 20)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  // Tower outline
  ctx.beginPath()
  ctx.moveTo(-16, 0)
  ctx.lineTo(-9, -78)
  ctx.lineTo(9, -78)
  ctx.lineTo(16, 0)
  ctx.closePath()
  ctx.lineWidth = 1.4
  ctx.strokeStyle = ink
  ctx.stroke()

  // Gallery deck
  drawRoundedRect(ctx, -13, -82, 26, 5, 2)
  ctx.fillStyle = dark ? "#434a62" : "#e5e3ee"
  ctx.fill()
  ctx.strokeStyle = ink
  ctx.stroke()

  // Lantern chamber
  drawRoundedRect(ctx, -7.5, -96, 15, 14, 2)
  ctx.fillStyle = dark ? "#ffd97d" : "#fef6d6"
  ctx.fill()
  ctx.strokeStyle = ink
  ctx.stroke()

  // Dome cap
  ctx.beginPath()
  ctx.arc(0, -96, 8.5, Math.PI, 0)
  ctx.closePath()
  ctx.fillStyle = stripe
  ctx.fill()
  ctx.strokeStyle = ink
  ctx.stroke()

  // Finial spire
  ctx.beginPath()
  ctx.moveTo(0, -104.5)
  ctx.lineTo(0, -110)
  ctx.strokeStyle = ink
  ctx.stroke()

  // Small porthole window
  ctx.beginPath()
  ctx.ellipse(0, -40, 2.5, 4, 0, 0, Math.PI * 2)
  ctx.fillStyle = dark ? "#ffd275" : "#44424d"
  ctx.fill()

  ctx.restore()
}

function drawCottageRow(
  ctx: CanvasRenderingContext2D,
  startX: number,
  baseY: number,
  scale: number,
  dark: boolean
) {
  const ink = dark ? "rgba(214, 219, 238, 0.72)" : "#383540"
  const houses = [
    { w: 46, h: 40, peak: 26, wallLight: "#d2c4e3", wallDark: "#302d45", roofLight: "#d5967e", roofDark: "#5b3b3f" },
    { w: 42, h: 38, peak: 25, wallLight: "#f6e29c", wallDark: "#3c3749", roofLight: "#d99d85", roofDark: "#634242" },
    { w: 44, h: 41, peak: 26, wallLight: "#ebb6a1", wallDark: "#43313d", roofLight: "#cf8c75", roofDark: "#59383c" },
    { w: 46, h: 39, peak: 25, wallLight: "#cbbfe0", wallDark: "#2d2e42", roofLight: "#d79882", roofDark: "#5b3c41" },
  ]

  ctx.save()
  ctx.translate(startX, baseY)
  ctx.scale(scale, scale)

  let curX = 0
  for (const h of houses) {
    const wallTop = -h.h
    const roofPeakY = wallTop - h.peak
    const midX = curX + h.w / 2

    // Cottage facade + gable
    ctx.beginPath()
    ctx.moveTo(curX, 0)
    ctx.lineTo(curX, wallTop)
    ctx.lineTo(midX, roofPeakY)
    ctx.lineTo(curX + h.w, wallTop)
    ctx.lineTo(curX + h.w, 0)
    ctx.closePath()
    ctx.fillStyle = dark ? h.wallDark : h.wallLight
    ctx.fill()
    ctx.lineWidth = 1.35
    ctx.strokeStyle = ink
    ctx.stroke()

    // Sloped roof eaves
    ctx.beginPath()
    ctx.moveTo(curX - 3, wallTop + 2)
    ctx.lineTo(midX, roofPeakY - 2)
    ctx.lineTo(curX + h.w + 3, wallTop + 2)
    ctx.lineTo(curX + h.w, wallTop + 6)
    ctx.lineTo(midX, roofPeakY + 4)
    ctx.lineTo(curX, wallTop + 6)
    ctx.closePath()
    ctx.fillStyle = dark ? h.roofDark : h.roofLight
    ctx.fill()
    ctx.strokeStyle = ink
    ctx.stroke()

    // Subtle horizontal roof-tile lines
    ctx.lineWidth = 0.8
    ctx.strokeStyle = dark ? "rgba(214,219,238,0.22)" : "rgba(56,53,64,0.28)"
    for (let r = 1; r <= 3; r++) {
      const ty = roofPeakY + (h.peak * r) / 4
      const span = ((h.w / 2) * r) / 4
      ctx.beginPath()
      ctx.moveTo(midX - span, ty)
      ctx.lineTo(midX + span, ty)
      ctx.stroke()
    }

    // Two cozy arched windows (glow warmly in dark mode)
    const winColor = dark ? "#ffd37a" : "#44404d"
    const winOffsets = [-10, 10]
    for (const wx of winOffsets) {
      ctx.save()
      if (dark) {
        ctx.shadowColor = "rgba(255, 209, 112, 0.55)"
        ctx.shadowBlur = 8
      }
      ctx.beginPath()
      ctx.roundRect(midX + wx - 2.6, -24, 5.2, 8, [3, 3, 0, 0])
      ctx.fillStyle = winColor
      ctx.fill()
      ctx.restore()
    }

    curX += h.w - 3
  }

  ctx.restore()
}

function drawScallopedDome(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  radius: number,
  dark: boolean
) {
  const ink = dark ? "rgba(214, 219, 238, 0.72)" : "#383540"
  const c1 = dark ? "#2e5c57" : "#70cbb0"
  const c2 = dark ? "#3f466b" : "#7b82bb"

  ctx.save()
  ctx.translate(cx, baseY)
  ctx.beginPath()
  ctx.arc(0, 0, radius, Math.PI, 0)
  ctx.closePath()
  ctx.fillStyle = c1
  ctx.fill()
  ctx.save()
  ctx.clip()

  const ribCount = 7
  for (let i = 0; i < ribCount; i++) {
    if (i % 2 === 1) {
      const a0 = Math.PI + (i / ribCount) * Math.PI
      const a1 = Math.PI + ((i + 1) / ribCount) * Math.PI
      ctx.beginPath()
      ctx.moveTo(0, 8)
      ctx.lineTo(Math.cos(a0) * radius * 1.1, Math.sin(a0) * radius * 1.1)
      ctx.lineTo(Math.cos(a1) * radius * 1.1, Math.sin(a1) * radius * 1.1)
      ctx.closePath()
      ctx.fillStyle = c2
      ctx.fill()
    }
  }
  ctx.restore()

  ctx.beginPath()
  ctx.arc(0, 0, radius, Math.PI, 0)
  ctx.lineWidth = 1.4
  ctx.strokeStyle = ink
  ctx.stroke()
  ctx.restore()
}

function getBridgePoint(
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
  const angle = Math.atan2(dy, dx)
  return { x, y, angle }
}

function drawBridgeAndTraffic(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  scale: number,
  vehicles: Vehicle[],
  dark: boolean
) {
  const ink = dark ? "rgba(214, 219, 238, 0.72)" : "#33313b"
  const deckFill = dark ? "#2a2d3d" : "#f2eef7"
  const archVoid = dark ? "#141621" : "#2e2c36"

  // Draw tiny animated vehicles riding along the bridge top curve
  for (const v of vehicles) {
    const pt = getBridgePoint(v.progress, x0, y0, cx, cy, x1, y1)
    ctx.save()
    ctx.translate(pt.x, pt.y - 2 * scale)
    ctx.rotate(pt.angle)
    ctx.scale(scale, scale)

    if (v.isTruck) {
      // Box delivery van
      drawRoundedRect(ctx, -18, -12, 26, 11, 2)
      ctx.fillStyle = dark ? "#d8d6e8" : "#fffcf9"
      ctx.fill()
      ctx.lineWidth = 1.2
      ctx.strokeStyle = ink
      ctx.stroke()
      // Cab
      ctx.beginPath()
      ctx.moveTo(8, -1)
      ctx.lineTo(8, -9)
      ctx.lineTo(14, -9)
      ctx.lineTo(17, -4)
      ctx.lineTo(17, -1)
      ctx.closePath()
      ctx.fillStyle = dark ? "#907f99" : "#e7b8be"
      ctx.fill()
      ctx.stroke()
      // Wheels
      for (const wx of [-11, 11]) {
        ctx.beginPath()
        ctx.arc(wx, 0, 2.3, 0, Math.PI * 2)
        ctx.fillStyle = ink
        ctx.fill()
      }
      if (dark) {
        ctx.beginPath()
        ctx.arc(18, -3, 2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 224, 145, 0.85)"
        ctx.fill()
      }
    } else {
      // Compact rounded sedan
      const carFill = dark ? v.colorDark : v.colorLight
      ctx.beginPath()
      ctx.moveTo(-10, -1)
      ctx.lineTo(-9, -6)
      ctx.lineTo(-4, -9.5)
      ctx.lineTo(4, -9.5)
      ctx.lineTo(8, -5.5)
      ctx.lineTo(10, -1)
      ctx.closePath()
      ctx.fillStyle = carFill
      ctx.fill()
      ctx.lineWidth = 1.2
      ctx.strokeStyle = ink
      ctx.stroke()
      for (const wx of [-5.5, 5.5]) {
        ctx.beginPath()
        ctx.arc(wx, 0, 2.1, 0, Math.PI * 2)
        ctx.fillStyle = ink
        ctx.fill()
      }
    }

    ctx.restore()
  }

  // Bridge deck and arched stone facade
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.quadraticCurveTo(cx, cy, x1, y1)
  ctx.lineTo(x1, y1 + 38 * scale)
  ctx.quadraticCurveTo(cx, cy + 38 * scale, x0, y0 + 38 * scale)
  ctx.closePath()
  ctx.fillStyle = deckFill
  ctx.fill()
  ctx.lineWidth = 1.4
  ctx.strokeStyle = ink
  ctx.stroke()

  // Dark arched openings beneath deck
  const archCount = 5
  for (let i = 0; i < archCount; i++) {
    const tMid = (i + 0.5) / archCount
    const pt = getBridgePoint(tMid, x0, y0, cx, cy, x1, y1)
    ctx.save()
    ctx.translate(pt.x, pt.y + 34 * scale)
    ctx.rotate(pt.angle)
    ctx.beginPath()
    ctx.arc(0, 0, 12 * scale, Math.PI, 0)
    ctx.lineTo(12 * scale, 16 * scale)
    ctx.lineTo(-12 * scale, 16 * scale)
    ctx.closePath()
    ctx.fillStyle = archVoid
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}

function drawRightTrainViaduct(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  scale: number,
  trainProgress: number,
  dark: boolean
) {
  const ink = dark ? "rgba(214, 219, 238, 0.72)" : "#33313b"
  const railFill = dark ? "#4b4958" : "#dfcf96"

  // Elevated curved track
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.quadraticCurveTo(cx, cy, x1, y1)
  ctx.lineTo(x1, y1 + 12 * scale)
  ctx.quadraticCurveTo(cx, cy + 12 * scale, x0, y0 + 12 * scale)
  ctx.closePath()
  ctx.fillStyle = railFill
  ctx.fill()
  ctx.lineWidth = 1.35
  ctx.strokeStyle = ink
  ctx.stroke()

  // Sleek 3-segment commuter train gliding smoothly along curve
  const carCount = 3
  for (let c = 0; c < carCount; c++) {
    const t = trainProgress - c * 0.145
    if (t < -0.1 || t > 1.1) continue
    const pt = getBridgePoint(t, x0, y0, cx, cy, x1, y1)
    ctx.save()
    ctx.translate(pt.x, pt.y - 1.5 * scale)
    ctx.rotate(pt.angle)
    ctx.scale(scale, scale)

    const isLead = c === 0
    ctx.beginPath()
    if (isLead) {
      ctx.moveTo(-22, 0)
      ctx.lineTo(-22, -13)
      ctx.lineTo(14, -13)
      ctx.quadraticCurveTo(24, -12, 26, 0)
    } else {
      ctx.roundRect(-22, -13, 44, 13, [2, 2, 0, 0])
    }
    ctx.closePath()
    ctx.fillStyle = dark ? "#5c5b7a" : "#c8bddb"
    ctx.fill()
    ctx.lineWidth = 1.25
    ctx.strokeStyle = ink
    ctx.stroke()

    // Passenger windows
    for (let w = -16; w <= 8; w += 8) {
      drawRoundedRect(ctx, w, -9.5, 5.5, 4.5, 1)
      ctx.fillStyle = dark ? "#ffe099" : "#f6f5fb"
      ctx.fill()
      ctx.lineWidth = 0.8
      ctx.strokeStyle = ink
      ctx.stroke()
    }
    ctx.restore()
  }

  ctx.restore()
}

function drawCloudBank(
  ctx: CanvasRenderingContext2D,
  W: number,
  baseY: number,
  H: number,
  scale: number,
  offsetX: number,
  fillTop: string,
  fillBottom: string,
  rimStroke: string,
  bgColor: string,
  isFront: boolean
) {
  ctx.save()
  const step = Math.max(85, 110 * scale)
  const count = Math.ceil((W + 240) / step) + 1

  ctx.beginPath()
  ctx.moveTo(-160, H + 40)
  ctx.lineTo(-160, baseY)

  for (let i = 0; i <= count; i++) {
    const px = -120 + i * step + (offsetX % step)
    const archSeed = Math.sin(i * 1.7 + (isFront ? 0.8 : 2.3))
    const r = (56 + archSeed * 18) * scale
    const crestY = baseY - (14 + Math.cos(i * 1.15) * 16) * scale
    ctx.quadraticCurveTo(px + step * 0.5, crestY - r * 0.65, px + step, baseY + archSeed * 6 * scale)
  }

  ctx.lineTo(W + 160, H + 40)
  ctx.closePath()

  const grad = ctx.createLinearGradient(0, baseY - 60 * scale, 0, H)
  grad.addColorStop(0, fillTop)
  grad.addColorStop(0.55, fillBottom)
  grad.addColorStop(1, bgColor)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.lineWidth = isFront ? 1.1 : 0.8
  ctx.strokeStyle = rimStroke
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
    let bgColor = getComputedStyle(container).backgroundColor || (isDark ? "#171717" : "#fbfaf8")

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionQuery.matches
    let isVisible = true

    // Pointer & scroll depth targets (smoothed in rAF)
    let targetPx = 0
    let targetPy = 0
    let px = 0
    let py = 0
    let scrollFactor = 0

    // Persistent animated sky clouds & bridge traffic state
    const skyClouds: SkyCloud[] = [
      { x: 0.14, y: 0.44, scale: 0.78, speed: 0.0055, opacity: 0.75 },
      { x: 0.48, y: 0.41, scale: 0.88, speed: 0.0042, opacity: 0.68 },
      { x: 0.73, y: 0.36, scale: 0.92, speed: 0.0062, opacity: 0.72 },
      { x: 0.9, y: 0.47, scale: 0.68, speed: 0.0048, opacity: 0.62 },
    ]

    const vehicles: Vehicle[] = [
      { progress: 0.14, speed: 0.036, colorLight: "#bda3db", colorDark: "#705d8f" },
      { progress: 0.36, speed: 0.036, colorLight: "#8ecbb4", colorDark: "#457666" },
      { progress: 0.62, speed: 0.036, colorLight: "#fffcf9", colorDark: "#d8d6e8", isTruck: true },
      { progress: 0.88, speed: 0.036, colorLight: "#e3a691", colorDark: "#8f5f52" },
    ]

    let trainProgress = 0.25

    const updateThemeColors = () => {
      isDark = document.documentElement.classList.contains("dark")
      const parentEl = container.closest("section") || document.body
      bgColor = getComputedStyle(parentEl).backgroundColor || (isDark ? "#171717" : "#fbfaf8")
    }

    const resize = () => {
      width = Math.max(320, container.clientWidth)
      height = Math.max(360, container.clientHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      updateThemeColors()
    }

    resize()

    let rafId = 0
    let lastTs = performance.now()
    let simTime = 0

    const renderFrame = (dt: number) => {
      if (!reducedMotion) {
        simTime += dt
        for (const c of skyClouds) {
          c.x += c.speed * dt
          if (c.x > 1.12) c.x = -0.12
        }
        for (const v of vehicles) {
          v.progress += v.speed * dt
          if (v.progress > 1.1) v.progress = -0.1
        }
        trainProgress += 0.048 * dt
        if (trainProgress > 1.38) trainProgress = -0.08
      }

      // Smooth pointer parallax easing
      px += (targetPx - px) * Math.min(1, dt * 6)
      py += (targetPy - py) * Math.min(1, dt * 6)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const s = Math.max(0.56, Math.min(1.18, width / 1280))
      const horizonY = height - Math.max(54, 72 * s) - scrollFactor * 16

      // Subtle atmospheric twilight glow in dark mode behind horizon
      if (isDark) {
        const skyGlow = ctx.createRadialGradient(
          width * 0.52,
          horizonY - 40 * s,
          20,
          width * 0.52,
          horizonY - 40 * s,
          width * 0.65
        )
        skyGlow.addColorStop(0, "rgba(116, 126, 178, 0.14)")
        skyGlow.addColorStop(0.55, "rgba(62, 68, 108, 0.06)")
        skyGlow.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = skyGlow
        ctx.fillRect(0, 0, width, height)
      } else {
        const dayMist = ctx.createLinearGradient(0, horizonY - 190 * s, 0, height)
        dayMist.addColorStop(0, "rgba(235, 229, 246, 0)")
        dayMist.addColorStop(0.65, "rgba(235, 229, 246, 0.28)")
        dayMist.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = dayMist
        ctx.fillRect(0, horizonY - 200 * s, width, height)
      }

      // 1. Back layer: gently drifting sky outline clouds
      const cloudOutline = isDark ? "rgba(182, 188, 224, 0.28)" : "rgba(154, 146, 176, 0.45)"
      const cloudTint = isDark ? "rgba(32, 35, 50, 0.42)" : "rgba(255, 255, 255, 0.65)"
      for (const c of skyClouds) {
        const cx = c.x * width + px * 12
        const cy = horizonY - (195 - (c.y - 0.36) * 260) * s + py * 6 - scrollFactor * 10
        ctx.save()
        ctx.globalAlpha = c.opacity
        drawOutlineCloud(ctx, cx, cy, c.scale * s, cloudOutline, cloudTint)
        ctx.restore()
      }

      // 2. Back cloud crest silhouette behind landmarks
      drawCloudBank(
        ctx,
        width,
        horizonY - 18 * s + py * 8,
        height,
        s,
        px * 14 + simTime * 4,
        isDark ? "rgba(42, 46, 66, 0.65)" : "rgba(236, 229, 246, 0.72)",
        isDark ? "rgba(27, 30, 42, 0.85)" : "rgba(248, 245, 252, 0.88)",
        isDark ? "rgba(160, 168, 210, 0.14)" : "rgba(170, 158, 198, 0.25)",
        bgColor,
        false
      )

      // 3. Midground landmarks layer (cottages, dome, turbines, lighthouses, bridge, train)
      const midX = px * 22
      const midY = py * 10 + scrollFactor * 8
      ctx.save()
      ctx.translate(midX, midY)

      // Back wind turbine on right ridge
      drawWindTurbine(
        ctx,
        width * 0.81,
        horizonY - 24 * s,
        118 * s,
        58 * s,
        reducedMotion ? 0.6 : simTime * 0.42 + 1.1,
        isDark
      )

      // Scalloped mint/indigo dome behind left clouds
      drawScallopedDome(ctx, width * 0.305, horizonY - 2 * s, 44 * s, isDark)

      // Cozy left cottage row
      drawCottageRow(ctx, width * 0.055, horizonY - 2 * s, 0.96 * s, isDark)

      // Left striped lighthouse peeking in foreground-left
      drawLighthouse(
        ctx,
        width * 0.048,
        horizonY + 20 * s,
        0.74 * s,
        "#9cd2c6",
        isDark,
        simTime * 0.7
      )

      // Curved stone bridge + moving vehicles (cars & delivery truck)
      drawBridgeAndTraffic(
        ctx,
        width * 0.14,
        horizonY + 18 * s,
        width * 0.295,
        horizonY - 46 * s,
        width * 0.445,
        horizonY + 14 * s,
        s,
        vehicles,
        isDark
      )

      // Smaller right-center striped lighthouse
      drawLighthouse(
        ctx,
        width * 0.655,
        horizonY - 2 * s,
        0.64 * s,
        "#89c4ba",
        isDark,
        simTime * 0.55 + 1.8
      )

      // Foreground wind turbine (center)
      drawWindTurbine(
        ctx,
        width * 0.515,
        horizonY + 18 * s,
        104 * s,
        52 * s,
        reducedMotion ? -0.35 : simTime * 0.55,
        isDark
      )

      // Right elevated viaduct + sleek gliding train
      drawRightTrainViaduct(
        ctx,
        width * 0.785,
        horizonY + 18 * s,
        width * 0.905,
        horizonY - 42 * s,
        width * 1.03,
        horizonY - 20 * s,
        s,
        reducedMotion ? 0.58 : trainProgress,
        isDark
      )

      ctx.restore()

      // 4. Foreground pillowy cloud bank framing landmark bases + seamless blend into --background
      drawCloudBank(
        ctx,
        width,
        horizonY + 18 * s + py * 14,
        height,
        s,
        px * 30 - simTime * 5,
        isDark ? "#202330" : "#ffffff",
        isDark ? "#181a24" : "#fbfaf9",
        isDark ? "rgba(182, 190, 232, 0.16)" : "rgba(186, 176, 210, 0.34)",
        bgColor,
        true
      )

      // Extra soft bottom feather matching page background cleanly
      const feather = ctx.createLinearGradient(0, height - 48, 0, height)
      feather.addColorStop(0, "rgba(0,0,0,0)")
      feather.addColorStop(1, bgColor)
      ctx.fillStyle = feather
      ctx.fillRect(0, height - 48, width, 48)
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
      updateThemeColors()
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

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion) return
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      targetPx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      targetPy = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const onPointerLeave = () => {
      targetPx = 0
      targetPy = 0
    }

    const onScroll = () => {
      if (reducedMotion) return
      const sy = window.scrollY
      scrollFactor = Math.max(0, Math.min(1, sy / Math.max(height, 1)))
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches
      stopLoop()
      startLoop()
    }

    const hostSection = container.closest("section") || container
    hostSection.addEventListener("pointermove", onPointerMove, { passive: true })
    hostSection.addEventListener("pointerleave", onPointerLeave, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    motionQuery.addEventListener("change", onMotionChange)

    renderFrame(0)
    startLoop()

    return () => {
      stopLoop()
      ro.disconnect()
      mo.disconnect()
      io.disconnect()
      hostSection.removeEventListener("pointermove", onPointerMove)
      hostSection.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("scroll", onScroll)
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
