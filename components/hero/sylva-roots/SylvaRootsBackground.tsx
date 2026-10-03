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
            // to the right of the type stays readable as a form. Narrowed from
            // 40%x30% once the type moved up: a wide wash here was also greying
            // out the arch, which is the thing we want visible.
            // Tightened again (0.93/0.58 → 0.80/0.42, 31%x25% → 27%x22%) now that
            // the additive glow and the white pollen are gone. The measured
            // headline contrast had huge margin — glyphs at luminance 0 on a 249
            // background — so this was spending scene visibility it did not need.
            "radial-gradient(27% 22% at 8% 46%, rgba(251,250,248,0.80) 0%, rgba(251,250,248,0.42) 50%, rgba(251,250,248,0) 82%)",
            // A narrow left edge, enough to seat the first characters of each
            // line without reaching into the middle of the frame.
            "linear-gradient(to right, rgba(251,250,248,0.95) 0%, rgba(251,250,248,0.55) 14%, rgba(251,250,248,0.14) 26%, rgba(251,250,248,0) 36%)",
          ].join(", "),
        }}
      />

      {/*
        Bottom fade.

        The moss overscans past the hero's lower edge, so without this it
        terminates on a hard horizontal line where the section clips. Fading it
        into the cream makes the scene read as continuing below the fold.

        Now 9% tall, down from 30% → 18% → 9%, and it stays fully transparent
        through its first third. The job here is only to erase the clip line, and
        the clip line is one pixel: everything above it that the taller gradients
        covered was scene being hidden for no reason. Anything more generous also
        reads as blur, which is the complaint this is answering.
      */}
      <div
        className="absolute inset-x-0 bottom-0 h-[9%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(251,250,248,0) 0%, rgba(251,250,248,0) 30%, rgba(251,250,248,0.10) 52%, rgba(251,250,248,0.30) 72%, rgba(251,250,248,0.68) 89%, rgb(251,250,248) 100%)",
        }}
      />
    </div>
  )
}
