"use client"

import React from "react"
import ContactPanel from "./ContactPanel"

// Helper: check if an element is in viewport
function isInViewport(el: Element | null) {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0
  )
}

export default function ContactButton() {
  const [open, setOpen] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  // scroll visibility: appear after hero, hide when footer visible
  React.useEffect(() => {
    const hero = document.querySelector("#hero")
    const footer = document.querySelector("#page-footer")

    const onScroll = () => {
      const pastHero = hero ? window.scrollY > (hero as HTMLElement).offsetHeight - 120 : window.scrollY > 200
      const footerVisible = isInViewport(footer)
      setVisible(pastHero && !footerVisible)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  // Button breathing animation keyframes
  React.useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}`;
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <>
      {/* Quarter-circle button */}
      <button
        aria-label="Open contact panel"
        onClick={() => setOpen(true)}
        data-contact-button
        className={[
          "fixed z-[55] bottom-0 right-0 select-none",
          "w-[92px] h-[92px] md:w-[110px] md:h-[110px]",
          "rounded-tl-[9999px] shadow-lg",
          // Unified color across light and dark
          "bg-[#D7FF9A]",
          "flex items-end justify-start overflow-hidden",
          "transition-all duration-500",
          // visibility & bounce in
          visible ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-4",
        ].join(" ")}
        style={{
          // bounce appear uses JS-triggered animation via inline style toggle
          animation: visible ? "appear-bounce 500ms ease-out" : undefined,
          filter: visible ? "brightness(1)" : undefined,
        }}
        onMouseEnter={(e) => { (e.currentTarget.style.filter = "brightness(1.05)") }}
        onMouseLeave={(e) => { (e.currentTarget.style.filter = "brightness(1)") }}
      >
        <div className="relative w-full h-full">
          {/* Breathing idle animation (behind content) */}
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ animation: "breathe 5s ease-in-out infinite 2s" }} />

          {/* Content */}
          <div className="absolute z-10 bottom-2 right-2">
            <div className="text-right leading-tight uppercase">
              <div className="text-black dark:text-black font-black tracking-tight text-[16px] md:text-2xl">LET&rsquo;S</div>
              <div className="text-black dark:text-black font-black tracking-tight text-[16px] md:text-2xl">TALK</div>
            </div>
          </div>
        </div>
      </button>

      {/* Keyframes for appear bounce */}
      <style jsx global>{`
        @keyframes appear-bounce {
          0% { transform: translateY(16px) scale(0.9); }
          50% { transform: translateY(0) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Panel */}
      <ContactPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}
