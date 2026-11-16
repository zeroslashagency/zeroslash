"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

interface DriftingCloud {
  x: number
  y: number
  scale: number
  speed: number
  opacity: number
}

function drawWispCloud(
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
  ctx.moveTo(-44, 11)
  ctx.bezierCurveTo(-56, 11, -60, -3, -44, -8)
  ctx.bezierCurveTo(-42, -23, -21, -28, -9, -18)
  ctx.bezierCurveTo(1, -32, 23, -28, 27, -13)
  ctx.bezierCurveTo(42, -16, 54, -3, 46, 8)
  ctx.bezierCurveTo(48, 15, 34, 17, 21, 15)
  ctx.bezierCurveTo(4, 19, -17, 18, -30, 14)
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.lineWidth = 1.25
  ctx.strokeStyle = strokeColor
  ctx.stroke()
  ctx.restore()
}

export default function CloudHorizonCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const artLayerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const artLayer = artLayerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = container.clientWidth || 1280
    let height = container.clientHeight || 720
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let isDark = document.documentElement.classList.contains("dark")

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionQuery.matches
    let isVisible = true

    let targetPx = 0
    let targetPy = 0
    let px = 0
    let py = 0
    let scrollFactor = 0
    let simTime = 0

    const clouds: DriftingCloud[] = [
      { x: 0.12, y: 0.34, scale: 0.72, speed: 0.0052, opacity: 0.55 },
      { x: 0.38, y: 0.28, scale: 0.85, speed: 0.004, opacity: 0.45 },
      { x: 0.67, y: 0.32, scale: 0.78, speed: 0.006, opacity: 0.52 },
      { x: 0.88, y: 0.25, scale: 0.65, speed: 0.0045, opacity: 0.42 },
    ]

    const resize = () => {
      width = Math.max(320, container.clientWidth)
      height = Math.max(360, container.clientHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      isDark = document.documentElement.classList.contains("dark")
    }

    resize()

    let rafId = 0
    let lastTs = performance.now()

    const renderFrame = (dt: number) => {
      if (!reducedMotion) {
        simTime += dt
        for (const c of clouds) {
          c.x += c.speed * dt
          if (c.x > 1.12) c.x = -0.12
        }
      }

      px += (targetPx - px) * Math.min(1, dt * 5.5)
      py += (targetPy - py) * Math.min(1, dt * 5.5)

      if (artLayer) {
        if (reducedMotion) {
          artLayer.style.transform = "translate3d(0, 0, 0)"
        } else {
          const driftY = Math.sin(simTime * 0.65) * 3.5
          const shiftX = px * 10
          const shiftY = py * 5 + scrollFactor * 10 + driftY
          artLayer.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const s = Math.max(0.58, Math.min(1.08, width / 1280))
      const outline = isDark ? "rgba(182, 188, 224, 0.24)" : "rgba(164, 152, 196, 0.36)"
      const fill = isDark ? "rgba(30, 33, 48, 0.36)" : "rgba(255, 255, 255, 0.58)"

      for (const c of clouds) {
        const cx = c.x * width + px * 16
        const cy = c.y * height + py * 8 - scrollFactor * 12
        ctx.save()
        ctx.globalAlpha = c.opacity
        drawWispCloud(ctx, cx, cy, c.scale * s, outline, fill)
        ctx.restore()
      }
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
      isDark = document.documentElement.classList.contains("dark")
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
      scrollFactor = Math.max(0, Math.min(1, window.scrollY / Math.max(height, 1)))
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
      {/* Subtle animated drifting sky clouds behind & around the upper hero */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

      {/* Exact cloud, cottage, windmill & train illustration anchored cleanly along the bottom */}
      <div
        ref={artLayerRef}
        className="absolute inset-x-0 -bottom-2 flex justify-center overflow-hidden will-change-transform"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 16%, black 91%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 16%, black 91%, transparent 100%)",
        }}
      >
        <div className="relative w-[680px] sm:w-full max-w-[1680px] shrink-0 aspect-[2300/880] scale-[1.035] origin-bottom">
          <Image
            src="/assets/aistudio/Screenshot_2026-11-16_at_11.01.00_PM_a117500e.png"
            alt="Illustrated cloud horizon with cottages, lighthouse, bridge, wind turbines, and train"
            width={2300}
            height={880}
            priority
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 680px, 100vw"
            className="h-full w-full object-contain object-bottom mix-blend-multiply dark:mix-blend-lighten dark:invert-[0.91] dark:hue-rotate-180 dark:brightness-[0.95] dark:contrast-[1.06]"
          />
        </div>
      </div>

      {/* Bottom feather seam blending smoothly into the next section background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
