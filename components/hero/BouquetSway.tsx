"use client"

import { useEffect, useRef, type ReactNode } from "react"

/**
 * Wind sway for the hero bouquet.
 *
 * The bouquet sits in front of the root scene, and a dead-still PNG over moving
 * moss reads as a sticker. This puts it on the same air as the scene: the offsets
 * below reuse the frequency signature from the scene's `windOffset()` GLSL
 * (0.58 and 1.37 rad/s on x, 0.79 on y, the second harmonic at 0.45 amplitude),
 * so the flowers and the roots lean together instead of drifting apart.
 *
 * Amplitudes are in screen pixels rather than world units. The scene's numbers
 * (0.030) are sized for blades a few units tall; on a 1400px bouquet the same
 * value would be invisible, so it is retargeted to a few pixels of travel plus a
 * fraction of a degree of lean pivoting at the stems.
 */
export default function BouquetSway({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let raf = 0
    let visible = true
    const t0 = performance.now()

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(el)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return

      const t = (now - t0) / 1000
      // Slow gust envelope so the sway never reads as a metronome.
      const gust = 0.62 + 0.38 * Math.sin(t * 0.11 + 1.7)
      const x = (Math.sin(t * 0.58) + 0.45 * Math.sin(t * 1.37 + 0.9)) * 3.6 * gust
      const y = Math.sin(t * 0.79 + 2.1) * 1.9 * gust
      const rot = (Math.sin(t * 0.47) + 0.35 * Math.sin(t * 1.11 + 0.4)) * 0.28 * gust

      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rot.toFixed(3)}deg)`
    }
    raf = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [])

  return (
    <div
      ref={ref}
      // z-[1] keeps the bouquet in front of the root canvas while staying under
      // the hero's arrows and type. Pivot at the bottom centre: a plant bends
      // from its base, not its middle.
      className="absolute inset-0 z-[1] origin-[50%_100%] will-change-transform"
    >
      {children}
    </div>
  )
}
