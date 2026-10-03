"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import ServiceJourney, { type JourneyService } from "./ServiceJourney"

const SERVICES: { id: JourneyService; title: string; color: string }[] = [
  { id: "web", title: "Website", color: "#b5a5d4" },
  { id: "marketing", title: "Marketing", color: "#dfb2a2" },
  { id: "branding", title: "Branding", color: "#d4bd94" },
  { id: "product", title: "Product", color: "#a8c2b1" },
]

const SERVICE_IMAGES: Record<JourneyService, { src: string; alt: string; width: number; height: number }> = {
  web: { src: "/images/flora/website-laptop", alt: "Laptop among greenery displaying a website preview", width: 1122, height: 1402 },
  marketing: { src: "/images/flora/marketing-bloom", alt: "Pink flowers climbing a leafy branch with marketing service labels", width: 1122, height: 1402 },
  branding: { src: "/images/flora/branding-bloom", alt: "Pink flowering vine illustrating brand identity, visual system, story, positioning, consistency, and recognition", width: 1122, height: 1402 },
  product: { src: "/images/flora/product-bloom", alt: "Orange tree illustrating product research, ideation, development, launch, and growth", width: 1151, height: 1367 },
}

// Include the artwork's 1.4 desktop / 1.12 mobile visual scale in resolution selection.
const IMAGE_SIZES = "(max-width: 359px) calc(112vw - 54px), (max-width: 767px) 347px, (max-width: 959px) 44vw, (max-width: 1319px) 47vw, 624px"

export default function ServicesFlora() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [warmImages, setWarmImages] = useState(false)
  const [decodedImages, setDecodedImages] = useState<boolean[]>(SERVICES.map(() => false))
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const section = useRef<HTMLElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  useEffect(() => {
    const element = section.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setWarmImages(true)
        observer.disconnect()
      }
    }, { rootMargin: "500px 0px" })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (decodedImages[activeIndex]) setDisplayedIndex(activeIndex)
  }, [activeIndex, decodedImages])

  function onImageLoad(element: HTMLImageElement, index: number) {
    const markDecoded = () => setDecodedImages((current) => current[index] ? current : current.map((value, imageIndex) => imageIndex === index || value))
    // Retain the previous illustration during an unusually early hover until decoding finishes.
    void element.decode().then(markDecoded, markDecoded)
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight": next = (index + 1) % SERVICES.length; break
      case "ArrowUp":
      case "ArrowLeft": next = (index + SERVICES.length - 1) % SERVICES.length; break
      case "Home": next = 0; break
      case "End": next = SERVICES.length - 1; break
      default: return
    }
    event.preventDefault()
    setActiveIndex(next)
    tabs.current[next]?.focus()
  }

  return (
    <section ref={section} aria-labelledby={`${id}-heading`} className="flora-section">
      <div className="flora-shell">
        <div className="flora-content">
          <p id={`${id}-heading`} className="flora-eyebrow">What we do</p>
          <div role="tablist" aria-label="Our services" aria-orientation="vertical" className="flora-tabs">
            {SERVICES.map((item, index) => (
              <button
                key={item.id}
                ref={(element) => { tabs.current[index] = element }}
                type="button"
                role="tab"
                id={`${id}-tab-${item.id}`}
                aria-selected={activeIndex === index}
                aria-controls={`${id}-panel-${item.id}`}
                tabIndex={activeIndex === index ? 0 : -1}
                className="flora-tab"
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse" || event.pointerType === "pen") setActiveIndex(index)
                }}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                <span className="flora-tab-label">{item.title}</span>
              </button>
            ))}
          </div>
          {SERVICES.map((item, index) => (
            <div
              key={item.id}
              role="tabpanel"
              id={`${id}-panel-${item.id}`}
              aria-labelledby={`${id}-tab-${item.id}`}
              hidden={index !== activeIndex}
              tabIndex={0}
              className="flora-readout"
            >
              <ServiceJourney service={item.id} color={item.color} active={index === activeIndex} />
            </div>
          ))}
        </div>
        <div className="flora-art">
          <div className="flora-flower flora-image">
            {SERVICES.map((item, index) => {
              const artwork = SERVICE_IMAGES[item.id]
              const shouldLoad = warmImages || index === 0 || index === activeIndex
              const sourceSet = [480, 800, artwork.width].map((width) => `${artwork.src}-${width}.webp ${width}w`).join(", ")
              return (
                // Exact static candidates preserve srcset widths without runtime image conversion.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={shouldLoad ? `${artwork.src}-800.webp` : undefined}
                  srcSet={shouldLoad ? sourceSet : undefined}
                  sizes={IMAGE_SIZES}
                  alt={index === activeIndex ? artwork.alt : ""}
                  aria-hidden={index !== activeIndex}
                  width={artwork.width}
                  height={artwork.height}
                  loading="eager"
                  fetchPriority={index === 0 ? "high" : "low"}
                  decoding="async"
                  onLoad={(event) => onImageLoad(event.currentTarget, index)}
                  style={{ position: "absolute", inset: 0, opacity: index === displayedIndex ? 1 : 0, visibility: index === displayedIndex ? "visible" : "hidden" }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
