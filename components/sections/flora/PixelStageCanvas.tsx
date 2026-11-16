"use client"

import { useEffect, useRef } from "react"

interface PixelStageCanvasProps {
  activeIndex: number
}

// Logical pixel grid (rendered at DPR resolution for crisp 8-bit/ASCII steps)
const GRID_W = 560
const GROUND_Y = 114

interface StagePalette {
  bg: string
  inkRgb: string
  accentRgb: string
  inkBoost: number
}

function getStagePalette(canvas: HTMLCanvasElement): StagePalette {
  const isDark = document.documentElement.classList.contains("dark")
  const host = canvas.closest("section") ?? canvas.parentElement
  const computedBg = host ? getComputedStyle(host).backgroundColor : ""
  const hasOpaqueBg = computedBg && computedBg !== "rgba(0, 0, 0, 0)" && computedBg !== "transparent"

  if (isDark) {
    return {
      bg: hasOpaqueBg ? computedBg : "#050507",
      inkRgb: "255, 255, 255",
      accentRgb: "234, 88, 40",
      inkBoost: 1,
    }
  }
  return {
    bg: hasOpaqueBg ? computedBg : "#faf9f5",
    inkRgb: "28, 25, 23",
    accentRgb: "217, 72, 27",
    inkBoost: 1.08,
  }
}

function drawDitherBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  unit: number,
  palette: StagePalette,
  accent = false,
) {
  const rgb = accent ? palette.accentRgb : palette.inkRgb
  const px = (gx: number, gy: number, gw = 1, gh = 1, alpha = 0.85) => {
    const a = Math.min(1, alpha * palette.inkBoost)
    ctx.fillStyle = `rgba(${rgb}, ${a})`
    ctx.fillRect(
      Math.round((x + gx) * unit),
      Math.round((y + gy) * unit),
      Math.max(1, Math.round(gw * unit)),
      Math.max(1, Math.round(gh * unit)),
    )
  }

  // Backing fill matching section background so ground lines don't bleed through
  ctx.fillStyle = palette.bg
  ctx.fillRect(Math.round(x * unit), Math.round(y * unit), Math.round(w * unit), Math.round(h * unit))

  // Outer crisp frame
  px(0, 0, w, 1, 0.75)
  px(0, h - 1, w, 1, 0.45)
  px(0, 0, 1, h, 0.7)
  px(w - 1, 0, 1, h, 0.4)

  // Checker / stippled rim inside frame
  for (let i = 1; i < w - 1; i++) {
    if (i % 2 === 1) {
      px(i, 1, 1, 1, 0.55)
      px(i, h - 2, 1, 1, 0.35)
    }
  }
  for (let j = 2; j < h - 2; j++) {
    if (j % 2 === 0) {
      px(1, j, 1, 1, 0.5)
      px(w - 2, j, 1, 1, 0.35)
    }
  }

  // Inner bright/ink core square with corner rivets
  const pad = 3
  if (w > pad * 2 && h > pad * 2) {
    px(pad, pad, w - pad * 2, 1, 0.9)
    px(pad, h - pad - 1, w - pad * 2, 1, 0.65)
    px(pad, pad, 1, h - pad * 2, 0.9)
    px(w - pad - 1, pad, 1, h - pad * 2, 0.65)

    // Subtle center brick dot
    const cx = Math.floor(w / 2)
    const cy = Math.floor(h / 2)
    px(cx - 1, cy - 1, 2, 2, 0.3)
  }
}

function drawRetroCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  unit: number,
  variant: 0 | 1 | 2,
  alpha: number,
  palette: StagePalette,
) {
  const shapes: Record<0 | 1 | 2, Array<[number, number, number]>> = {
    0: [
      [10, 0, 10],
      [7, 1, 4],
      [19, 1, 4],
      [5, 2, 3],
      [22, 2, 4],
      [2, 3, 4],
      [25, 3, 5],
      [1, 4, 2],
      [29, 4, 3],
      [0, 5, 2],
      [31, 5, 2],
      [0, 6, 1],
      [32, 6, 1],
      [1, 7, 2],
      [30, 7, 3],
      [2, 8, 29],
      [11, 2, 5],
      [20, 4, 3],
      [6, 5, 4],
    ],
    1: [
      [12, 0, 11],
      [9, 1, 4],
      [22, 1, 5],
      [6, 2, 4],
      [26, 2, 5],
      [3, 3, 4],
      [30, 3, 4],
      [1, 4, 3],
      [33, 4, 3],
      [0, 5, 2],
      [35, 5, 2],
      [0, 6, 1],
      [36, 6, 1],
      [1, 7, 2],
      [34, 7, 3],
      [3, 8, 32],
      [13, 2, 6],
      [24, 4, 4],
      [7, 5, 4],
    ],
    2: [
      [7, 0, 7],
      [4, 1, 3],
      [14, 1, 3],
      [2, 2, 3],
      [16, 2, 3],
      [0, 3, 2],
      [18, 3, 2],
      [0, 4, 1],
      [19, 4, 1],
      [1, 5, 18],
    ],
  }

  const spans = shapes[variant]
  const a = Math.min(1, alpha * palette.inkBoost)
  ctx.fillStyle = `rgba(${palette.inkRgb}, ${a})`
  for (const [ox, oy, ow] of spans) {
    ctx.fillRect(
      Math.round((cx + ox) * unit),
      Math.round((cy + oy) * unit),
      Math.max(1, Math.round(ow * unit)),
      Math.max(1, Math.round(unit)),
    )
  }

  ctx.fillStyle = `rgba(${palette.inkRgb}, ${Math.min(1, a * 0.35)})`
  const baseWidth = variant === 1 ? 30 : variant === 0 ? 27 : 16
  for (let i = 3; i < baseWidth; i += 2) {
    ctx.fillRect(
      Math.round((cx + i) * unit),
      Math.round((cy + (variant === 2 ? 4 : 7)) * unit),
      Math.max(1, Math.round(unit)),
      Math.max(1, Math.round(unit)),
    )
  }
}

export default function PixelStageCanvas({ activeIndex }: PixelStageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(activeIndex)
  const startTimeRef = useRef<number | null>(null)
  const paletteRef = useRef<StagePalette | null>(null)
  const isAnimatingRef = useRef(false)
  const redrawStaticRef = useRef<(() => void) | null>(null)
  activeRef.current = activeIndex

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let inView = true
    let raf = 0
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now()
    }
    paletteRef.current = getStagePalette(canvas)

    const clouds = [
      { baseX: 52, y: 20, variant: 0 as const, speed: 3.2, alpha: 0.52 },
      { baseX: 256, y: 14, variant: 2 as const, speed: 2.1, alpha: 0.34 },
      { baseX: 408, y: 22, variant: 1 as const, speed: 2.8, alpha: 0.52 },
    ]

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
    }

    const drawStaticWorld = (unit: number, tSec: number, currentIdx: number, palette: StagePalette) => {
      const ink = (alpha = 0.6) => `rgba(${palette.inkRgb}, ${Math.min(1, alpha * palette.inkBoost)})`
      const accent = (alpha = 0.9) => `rgba(${palette.accentRgb}, ${alpha})`

      const px = (x: number, y: number, w = 1, h = 1, color = ink(0.6)) => {
        ctx.fillStyle = color
        ctx.fillRect(
          Math.round(x * unit),
          Math.round(y * unit),
          Math.max(1, Math.round(w * unit)),
          Math.max(1, Math.round(h * unit)),
        )
      }

      // 1. Drifting retro clouds
      for (const c of clouds) {
        const span = GRID_W + 80
        const rawX = reducedMotion ? c.baseX : ((c.baseX + tSec * c.speed) % span) - 40
        let edgeFade = 1
        if (rawX < 12) edgeFade = Math.max(0, (rawX + 36) / 48)
        else if (rawX > GRID_W - 48) edgeFade = Math.max(0, (GRID_W + 32 - rawX) / 80)
        drawRetroCloud(ctx, rawX, c.y, unit, c.variant, c.alpha * edgeFade, palette)
      }

      // 2. Ground brick strip (full width, 2 staggered rows)
      px(0, GROUND_Y, GRID_W, 1, ink(0.28))
      const tileW = 14
      const tileH = 7
      for (let row = 0; row < 2; row++) {
        const ty = GROUND_Y + 1 + row * tileH
        const offset = row === 1 ? -7 : 0
        for (let tx = offset; tx < GRID_W; tx += tileW) {
          px(tx, ty, tileW - 1, 1, ink(0.16))
          px(tx, ty, 1, tileH, ink(0.18))
          px(tx + 3, ty + 2, 4, 1, ink(0.11))
          px(tx + 8, ty + 4, 3, 1, ink(0.11))
        }
      }

      // 3. Left Warp Pipe
      const pipeX = 20
      const pipeTopY = GROUND_Y - 22
      // Pipe rim
      px(pipeX - 2, pipeTopY, 26, 7, palette.bg)
      px(pipeX - 2, pipeTopY, 26, 1, ink(0.85))
      px(pipeX - 2, pipeTopY + 6, 26, 1, ink(0.6))
      px(pipeX - 2, pipeTopY, 1, 7, ink(0.85))
      px(pipeX + 23, pipeTopY, 1, 7, ink(0.6))
      px(pipeX + 2, pipeTopY + 1, 2, 5, ink(0.9))
      px(pipeX + 6, pipeTopY + 1, 1, 5, ink(0.45))
      for (let sx = pipeX + 16; sx <= pipeX + 21; sx += 2) {
        px(sx, pipeTopY + 1, 1, 5, ink(0.3))
      }
      // Pipe shaft
      px(pipeX, pipeTopY + 7, 22, 15, palette.bg)
      px(pipeX, pipeTopY + 7, 1, 15, ink(0.75))
      px(pipeX + 21, pipeTopY + 7, 1, 15, ink(0.5))
      px(pipeX + 3, pipeTopY + 7, 2, 15, ink(0.85))
      px(pipeX + 7, pipeTopY + 7, 1, 15, ink(0.4))
      for (let sx = pipeX + 15; sx <= pipeX + 19; sx += 2) {
        px(sx, pipeTopY + 7, 1, 15, ink(0.28))
      }

      // 4. Stepped Block Pyramid (8 columns ascending left-to-right)
      const blockW = 12
      const blockH = 11
      const stairStartX = 64
      const highlightCol = Math.min(7, 1 + currentIdx * 2)
      for (let col = 0; col < 8; col++) {
        const height = col + 1
        for (let row = 0; row < height; row++) {
          const bx = stairStartX + col * blockW
          const by = GROUND_Y - (row + 1) * blockH
          const isCapHighlight = col === highlightCol && row === height - 1
          drawDitherBlock(ctx, bx, by, blockW, blockH, unit, palette, isCapHighlight)
        }
      }

      // 5. Dotted Hill / Mound
      const hillCenterX = 286
      const hillHalfW = 36
      const hillH = 26
      for (let dy = 0; dy < hillH; dy++) {
        const span = Math.round((dy / hillH) * hillHalfW)
        px(hillCenterX - span, GROUND_Y - hillH + dy, 1, 1, ink(0.5))
        px(hillCenterX + span, GROUND_Y - hillH + dy, 1, 1, ink(0.5))
      }
      const hillDots: Array<[number, number]> = [
        [-6, -15], [4, -13], [-12, -8], [0, -7], [10, -9], [-18, -4], [-4, -3], [8, -4], [19, -3],
      ]
      for (const [dx, dy] of hillDots) {
        px(hillCenterX + dx, GROUND_Y + dy, 1, 1, ink(0.35))
      }

      // 6. Flagpole + Base Block + Pennant
      const poleX = 376
      const poleBaseTop = GROUND_Y - blockH
      drawDitherBlock(ctx, poleX - Math.floor(blockW / 2) + 1, poleBaseTop, blockW, blockH, unit, palette, false)
      const poleTopY = 14
      for (let py = poleTopY + 3; py < poleBaseTop; py++) {
        const segAlpha = py % 3 === 0 ? 0.45 : 0.82
        px(poleX, py, 1, 1, ink(segAlpha))
      }
      px(poleX - 1, poleTopY - 1, 3, 3, ink(0.9))
      px(poleX - 2, poleTopY, 5, 1, ink(0.7))

      const flutter = reducedMotion ? 0 : Math.sin(tSec * 2.2) * 0.6
      const flagTopY = poleTopY + 6
      for (let fx = 1; fx <= 16; fx++) {
        const ratio = 1 - fx / 17
        const halfHeight = Math.max(1, Math.round(ratio * 5))
        const yOff = Math.round((fx / 16) * flutter)
        px(poleX - fx, flagTopY + yOff, 1, 1, accent(0.92))
        px(poleX - fx, flagTopY + halfHeight * 2 - 1 + yOff, 1, 1, accent(0.75))
        if (fx % 2 === 1 && halfHeight > 1) {
          px(poleX - fx, flagTopY + halfHeight + yOff, 1, 1, ink(0.45))
        }
      }

      // 7. Pixel Castle / Fortress on right
      const castleX = 434
      const castleW = 84
      const castleTop = GROUND_Y - 52
      px(castleX, castleTop + 14, castleW, 38, palette.bg)
      px(castleX + 18, castleTop, 48, 52, palette.bg)

      // Upper keep battlements
      for (let m = 0; m < 5; m++) {
        const mx = castleX + 18 + m * 10
        px(mx, castleTop, 6, 4, ink(0.85))
        px(mx + 1, castleTop + 1, 4, 2, ink(0.25))
      }
      // Upper keep wall
      px(castleX + 18, castleTop + 4, 48, 12, ink(0.14))
      px(castleX + 18, castleTop + 4, 48, 1, ink(0.75))
      px(castleX + 18, castleTop + 4, 1, 12, ink(0.7))
      px(castleX + 65, castleTop + 4, 1, 12, ink(0.5))
      // Keep windows
      px(castleX + 30, castleTop + 7, 4, 6, palette.bg)
      px(castleX + 30, castleTop + 7, 4, 1, ink(0.75))
      px(castleX + 50, castleTop + 7, 4, 6, palette.bg)
      px(castleX + 50, castleTop + 7, 4, 1, ink(0.75))

      // Lower battlements
      for (let m = 0; m < 9; m++) {
        const mx = castleX + m * 10
        if (mx + 5 <= castleX + castleW) {
          px(mx, castleTop + 15, 5, 4, ink(0.85))
        }
      }

      // Main castle brick facade
      const wallY = castleTop + 19
      const wallH = GROUND_Y - wallY
      px(castleX, wallY, castleW, 1, ink(0.8))
      px(castleX, wallY, 1, wallH, ink(0.75))
      px(castleX + castleW - 1, wallY, 1, wallH, ink(0.55))

      for (let ry = 0; ry < wallH; ry += 3) {
        const stagger = (ry / 3) % 2 === 0 ? 0 : 4
        px(castleX + 1, wallY + ry, castleW - 2, 1, ink(0.22))
        for (let rx = 2 + stagger; rx < castleW - 2; rx += 8) {
          px(castleX + rx, wallY + ry + 1, 4, 1, ink(0.48))
          px(castleX + rx + 5, wallY + ry + 2, 1, 1, ink(0.28))
        }
      }

      // Arched central doorway
      const doorX = castleX + 33
      const doorW = 18
      const doorH = 22
      const doorY = GROUND_Y - doorH
      px(doorX, doorY + 5, doorW, doorH - 5, palette.bg)
      px(doorX + 2, doorY + 2, doorW - 4, 4, palette.bg)
      px(doorX + 5, doorY, doorW - 10, 3, palette.bg)
      px(doorX + 5, doorY, doorW - 10, 1, ink(0.85))
      px(doorX + 2, doorY + 1, 3, 1, ink(0.85))
      px(doorX + doorW - 5, doorY + 1, 3, 1, ink(0.85))
      px(doorX + 1, doorY + 2, 1, 3, ink(0.85))
      px(doorX + doorW - 2, doorY + 2, 1, 3, ink(0.85))
      px(doorX, doorY + 5, 1, doorH - 5, ink(0.85))
      px(doorX + doorW - 1, doorY + 5, 1, doorH - 5, ink(0.85))
    }

    const renderFrame = (now: number) => {
      if (!canvas.width || !canvas.height) resize()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const unit = canvas.width / GRID_W
      const tSec = (now - (startTimeRef.current ?? now)) / 1000
      const palette = paletteRef.current ?? getStagePalette(canvas)
      drawStaticWorld(unit, tSec, activeRef.current, palette)
    }

    const tick = (now: number) => {
      renderFrame(now)
      if (!reducedMotion && inView) {
        isAnimatingRef.current = true
        raf = requestAnimationFrame(tick)
      } else {
        isAnimatingRef.current = false
      }
    }

    redrawStaticRef.current = () => {
      if (!isAnimatingRef.current) renderFrame(performance.now())
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (!isAnimatingRef.current) renderFrame(performance.now())
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView && !reducedMotion) {
          cancelAnimationFrame(raf)
          isAnimatingRef.current = true
          raf = requestAnimationFrame(tick)
        } else {
          cancelAnimationFrame(raf)
          isAnimatingRef.current = false
          if (inView) renderFrame(performance.now())
        }
      },
      { threshold: 0.05 },
    )
    io.observe(canvas)

    // Watch <html class="dark"> changes so toggling light/dark updates the canvas immediately
    const mo = new MutationObserver(() => {
      requestAnimationFrame(() => {
        paletteRef.current = getStagePalette(canvas)
        if (!isAnimatingRef.current) renderFrame(performance.now())
      })
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    tick(performance.now())

    return () => {
      cancelAnimationFrame(raf)
      isAnimatingRef.current = false
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      redrawStaticRef.current = null
    }
  }, [])

  useEffect(() => {
    redrawStaticRef.current?.()
  }, [activeIndex])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block w-full aspect-[560/132] min-h-[160px] select-none pointer-events-none"
    />
  )
}
