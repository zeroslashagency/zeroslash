"use client"

import { useEffect, useRef, useState } from "react"

import type { SylvaSceneHandle } from "./index"

/**
 * Decorative living-root scene for the homepage hero.
 *
 * Mounts as the hero's background layer. Inert to input (the scene reads the
 * cursor from a window listener of its own), so it never steals clicks from the
 * hero's buttons or links, and it carries no accessible content.
 *
 * The render loop is gated twice — on scroll position and on tab visibility —
 * because the source it was ported from rendered unconditionally for the life
 * of the page.
 */
export default function SylvaRootsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return

    let disposed = false
    let scene: SylvaSceneHandle | null = null
    let io: IntersectionObserver | null = null

    const onVisibility = () => {
      if (document.hidden) scene?.setActive(false)
      else scene?.setActive(true)
    }

    // Dynamic import keeps three out of the initial homepage bundle.
    import("./scene")
      .then(({ createScene }) => {
        if (disposed) return
        scene = createScene({
          canvas,
          container: host,
          onReady: () => setReady(true),
        })
        if (!scene) return

        io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) scene?.setActive(entry.isIntersecting)
          },
          { rootMargin: "120px" },
        )
        io.observe(host)
        document.addEventListener("visibilitychange", onVisibility)
      })
      .catch((err) => {
        // No WebGL, a blocked chunk, or a build failure: the hero simply stays
        // on its cream plate.
        console.error("[sylva-roots] failed to load scene", err)
      })

    return () => {
      disposed = true
      io?.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      scene?.dispose()
      scene = null
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 select-none"
      style={{
        opacity: ready ? 1 : 0,
        transition: "opacity .7s cubic-bezier(.22,.61,.36,1)",
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/*
        Legibility scrim, kept as tight as the type allows.

        The hero's ink lives in the left 46%: the Playfair headline, the black/40
        meta row, and a solid black social bar at 95% height. Measured on the real
        page, moss behind that bottom-left corner sat at luminance 99, which black
        type cannot survive.

        Earlier versions washed the whole left column, which bought contrast at
        the cost of erasing the far ridge behind it. So the coverage is now
        pinned to where glyphs actually are — the headline band and the bottom-left
        corner — and the rest of the left side is left alone so the ridge keeps
        its silhouette.
      */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            // Protects the social bar / pagination dots corner.
            "radial-gradient(62% 44% at 0% 104%, rgb(251,250,248) 0%, rgba(251,250,248,0.95) 34%, rgba(251,250,248,0.6) 60%, rgba(251,250,248,0) 86%)",
            // Sits under the headline and meta row only, so the ridge below and
            // to the right of the type stays readable as a form.
            "radial-gradient(40% 30% at 10% 54%, rgba(251,250,248,0.94) 0%, rgba(251,250,248,0.62) 52%, rgba(251,250,248,0) 84%)",
            // A narrow left edge, enough to seat the first characters of each
            // line without reaching into the middle of the frame.
            "linear-gradient(to right, rgba(251,250,248,0.95) 0%, rgba(251,250,248,0.55) 14%, rgba(251,250,248,0.14) 26%, rgba(251,250,248,0) 36%)",
          ].join(", "),
        }}
      />

      {/*
        Bottom fade.

        The moss overscans well past the hero's lower edge, so without this it
        terminates on a hard horizontal line where the section clips. Fading it
        into the cream makes the scene read as continuing below the fold.

        Deepened from 22% to 34% with a much slower ramp. The previous curve
        still had a locatable start, which put a soft but findable horizon across
        the frame. Spreading the same total coverage over more height and holding
        the first quarter nearly clear means no single row is where the fade
        visibly begins — the moss just gets further away until it is paper. The
        extra depth is also what lets the eye travel under the roots.
      */}
      <div
        className="absolute inset-x-0 bottom-0 h-[30%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(251,250,248,0) 0%, rgba(251,250,248,0.06) 30%, rgba(251,250,248,0.20) 52%, rgba(251,250,248,0.46) 70%, rgba(251,250,248,0.76) 85%, rgb(251,250,248) 100%)",
        }}
      />
    </div>
  )
}
