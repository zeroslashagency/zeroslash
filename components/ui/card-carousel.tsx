"use client"

import Image from "next/image"
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/utils"

export type CarouselImage = { src: string; alt: string }

export interface CardCarouselProps {
  images: CarouselImage[]
  autoplayDelay?: number // in ms
  showPagination?: boolean
  showNavigation?: boolean
  className?: string
  mode?: "centered" | "natural"
  maxHeight?: number // only used in natural mode
  pauseOnHover?: boolean
  autoplayDirection?: "ltr" | "rtl"
}

export function CardCarousel({
  images,
  autoplayDelay = 3000,
  showPagination = true,
  showNavigation = true,
  className = "",
  mode = "centered",
  maxHeight = 560,
  pauseOnHover = true,
  autoplayDirection = "ltr",
}: CardCarouselProps) {
  const [index, setIndex] = useState(0)
  const safeImages = images ?? []
  const count = safeImages.length
  const hoveringRef = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const slideRefs = useRef<HTMLDivElement[]>([])
  const [dims, setDims] = useState({ containerW: 0, cardW: 0, gap: 28 })
  const LOOP_BLOCKS = 3
  const initializedRef = useRef(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(count, 1))
  }, [count])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + Math.max(count, 1)) % Math.max(count, 1))
  }, [count])

  // moved lower after scrollToIndex

  const onMouseEnter = () => {
    if (pauseOnHover) hoveringRef.current = true
  }
  const onMouseLeave = () => {
    if (pauseOnHover) hoveringRef.current = false
  }

  // Measure container and card width for precise centering (centered mode)
  useLayoutEffect(() => {
    if (mode !== "centered") return
    const measure = () => {
      const containerW = containerRef.current?.clientWidth ?? 0
      const cardW = cardRef.current?.clientWidth ?? 0
      setDims((d) => ({ ...d, containerW, cardW }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    if (cardRef.current) ro.observe(cardRef.current)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [mode])

  const translateX = useMemo(() => {
    if (mode !== "centered") return 0
    const { containerW, cardW, gap } = dims
    if (!containerW || !cardW) return 0
    const centerOffset = (containerW - cardW) / 2
    return index * (cardW + gap) - centerOffset
  }, [dims, index, mode])

  const loopImages = mode === "natural" ? Array.from({ length: LOOP_BLOCKS }).flatMap(() => safeImages) : safeImages
  const baseCount = safeImages.length
  const virtualCount = loopImages.length
  const middleStart = baseCount // start in second block

  // Natural mode helpers: scroll to slide by index
  const scrollToIndex = useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current
    const slide = slideRefs.current[i]
    if (!el || !slide) return
    el.scrollTo({ left: slide.offsetLeft - 16, behavior })
  }, [])

  // Autoplay (placed after scrollToIndex so it's in scope)
  useEffect(() => {
    if (count <= 1) return
    if (!autoplayDelay) return
    const id = setInterval(() => {
      if (hoveringRef.current) return
      if (mode === "natural") {
        const step = autoplayDirection === "rtl" ? -1 : 1
        const ni = Math.min(Math.max(0, index + step), virtualCount - 1)
        setIndex(ni)
        scrollToIndex(ni)
      } else {
        if (autoplayDirection === "rtl") prev()
        else next()
      }
    }, Math.max(autoplayDelay, 1200))
    return () => clearInterval(id)
  }, [autoplayDelay, count, index, next, prev, mode, autoplayDirection, scrollToIndex, virtualCount])

  // Initialize natural mode to middle block and manage index + seamless looping
  useEffect(() => {
    if (mode !== "natural") return
    const el = containerRef.current
    if (!el) return
    if (!initializedRef.current) {
      initializedRef.current = true
      // start at middle block
      requestAnimationFrame(() => {
        setIndex(middleStart)
        scrollToIndex(middleStart, "auto")
      })
    }

    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2
      let nearest = 0
      let minDist = Infinity
      slideRefs.current.forEach((s, i) => {
        if (!s) return
        const sCenter = s.offsetLeft + s.clientWidth / 2
        const d = Math.abs(center - sCenter)
        if (d < minDist) {
          minDist = d
          nearest = i
        }
      })
      setIndex(nearest)

      // seamless reset when crossing edges
      const threshold = 2 // slides
      if (nearest < baseCount - threshold) {
        const shifted = nearest + baseCount
        scrollToIndex(shifted, "auto")
        setIndex(shifted)
      } else if (nearest > baseCount * 2 + threshold) {
        const shifted = nearest - baseCount
        scrollToIndex(shifted, "auto")
        setIndex(shifted)
      }
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [mode, baseCount, middleStart, scrollToIndex])

  // Drag-to-scroll
  useEffect(() => {
    if (mode !== "natural") return
    const el = containerRef.current
    if (!el) return
    let isDown = false
    let startX = 0
    let scrollLeft = 0
    const down = (e: PointerEvent) => {
      isDown = true
      el.setPointerCapture(e.pointerId)
      startX = e.clientX
      scrollLeft = el.scrollLeft
      el.style.cursor = "grabbing"
    }
    const move = (e: PointerEvent) => {
      if (!isDown) return
      const dx = e.clientX - startX
      el.scrollLeft = scrollLeft - dx
    }
    const up = (e: PointerEvent) => {
      isDown = false
      el.releasePointerCapture(e.pointerId)
      el.style.cursor = "grab"
    }
    el.addEventListener("pointerdown", down)
    el.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    el.style.cursor = "grab"
    return () => {
      el.removeEventListener("pointerdown", down)
      el.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      el.style.cursor = ""
    }
  }, [mode])

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-roledescription="carousel"
    >
      {mode === "centered" ? (
        <div
          className="flex items-center"
          style={{
            gap: `${dims.gap}px`,
            transform: `translateX(-${translateX}px)`,
            transition: "transform 500ms ease-out",
          }}
        >
          {images.map((img, i) => {
            const isActive = i === index
            return (
              <div
                key={i}
                ref={i === 0 ? cardRef : undefined}
                className="shrink-0"
                style={{ width: "min(520px, 90vw)" }}
              >
                <div
                  className={`relative h-[520px] md:h-[560px] rounded-[36px] overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg transition-transform duration-500 ${
                    isActive ? "scale-100" : "scale-[0.9]"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover pointer-events-none select-none"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 520px, 520px"
                    priority={i === 0}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div
          ref={trackRef}
          className="flex items-center snap-x snap-mandatory overflow-x-auto no-scrollbar px-4"
          style={{ gap: `${dims.gap}px` }}
        >
          {loopImages.map((img, i) => {
            const isActive = i === index
            return (
              <div
                key={i}
                ref={(el) => {
                  if (el) slideRefs.current[i] = el as HTMLDivElement
                }}
                className="snap-center shrink-0"
                style={{ maxHeight: `${maxHeight}px` }}
              >
                <div
                  className={cn(
                    "relative block rounded-[36px] overflow-hidden transition-transform duration-700 ease-out will-change-transform",
                    isActive ? "scale-[1.06] shadow-2xl" : "scale-100 shadow-lg opacity-95",
                    "dark:shadow-black/40"
                  )}
                  style={{ height: maxHeight ? `${maxHeight}px` : undefined }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-contain select-none"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 560px, 560px"
                    priority={i === 0}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Navigation */}
      {showNavigation && count > 1 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1 md:px-2">
          <button
            type="button"
            onClick={() => {
              if (mode === "natural") {
                // move one slide left in virtual list
                const ni = Math.max(0, index - 1)
                setIndex(ni)
                scrollToIndex(ni)
              } else prev()
            }}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm ring-1 ring-black/10 backdrop-blur hover:bg-white dark:bg-white/20 dark:text-white dark:ring-white/10"
            aria-label="Previous slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="-ml-0.5"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === "natural") {
                const ni = Math.min(virtualCount - 1, index + 1)
                setIndex(ni)
                scrollToIndex(ni)
              } else next()
            }}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm ring-1 ring-black/10 backdrop-blur hover:bg-white dark:bg-white/20 dark:text-white dark:ring-white/10"
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ml-0.5"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && count > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                if (mode === "natural") {
                  const vi = i + middleStart
                  setIndex(vi)
                  scrollToIndex(vi)
                } else setIndex(i)
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                (mode === "natural" ? index % baseCount === i : index === i)
                  ? "w-6 bg-emerald-500"
                  : "w-2.5 bg-white/70 dark:bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CardCarousel
