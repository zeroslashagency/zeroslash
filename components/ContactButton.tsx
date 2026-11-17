"use client"

import React from "react"
import ContactPanel from "./ContactPanel"
import {
  computeScrollGaze,
  pickNextIdleCue,
  resolveContactDisplay,
  resolveMascotMood,
  shouldShowContactDome,
  type IdleCue,
  type TalkPhase,
} from "@/lib/contact-mascot"

// Helper: check if an element is in viewport
function isInViewport(el: Element | null) {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

export default function ContactButton() {
  const [open, setOpen] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [blinking, setBlinking] = React.useState(false)
  const [talkPhase, setTalkPhase] = React.useState<TalkPhase>(0)
  const [showTextPhase, setShowTextPhase] = React.useState(false)
  const [gazeX, setGazeX] = React.useState(0)
  const [gazeY, setGazeY] = React.useState(0)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  // Track prefers-reduced-motion
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Scroll visibility (appear after hero, hide when footer visible) + vertical eye gaze
  React.useEffect(() => {
    const hero = document.querySelector("#hero")
    const footer = document.querySelector("#page-footer")
    let prevScrollY = window.scrollY
    let settleTimer: number | undefined

    const updateVisibility = () => {
      const heroHeight = hero ? (hero as HTMLElement).offsetHeight : null
      setVisible(
        shouldShowContactDome({
          scrollY: window.scrollY,
          heroHeight,
          footerInView: isInViewport(footer),
        })
      )
    }

    const onScroll = () => {
      updateVisibility()
      const currentY = window.scrollY
      const deltaY = currentY - prevScrollY
      prevScrollY = currentY

      const nextGaze = computeScrollGaze(deltaY, reducedMotion)
      if (nextGaze !== 0) {
        setGazeY(nextGaze)
        window.clearTimeout(settleTimer)
        settleTimer = window.setTimeout(() => setGazeY(0), 260)
      }
    }

    updateVisibility()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", updateVisibility)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", updateVisibility)
      window.clearTimeout(settleTimer)
    }
  }, [reducedMotion])

  // Realistic non-uniform blinking (irregular intervals + occasional natural double-blink)
  React.useEffect(() => {
    if (!visible || reducedMotion) {
      setBlinking(false)
      return
    }

    let cancelled = false
    const timers: number[] = []
    const track = (id: number) => {
      timers.push(id)
      return id
    }

    const scheduleBlink = () => {
      const gap = 2200 + Math.random() * 4400
      track(
        window.setTimeout(() => {
          if (cancelled) return
          setBlinking(true)
          const closeMs = 115 + Math.random() * 40
          track(
            window.setTimeout(() => {
              if (cancelled) return
              setBlinking(false)

              // ~22% chance of a realistic quick double-blink
              if (Math.random() < 0.22) {
                track(
                  window.setTimeout(() => {
                    if (cancelled) return
                    setBlinking(true)
                    track(
                      window.setTimeout(() => {
                        if (cancelled) return
                        setBlinking(false)
                        scheduleBlink()
                      }, 110)
                    )
                  }, 150)
                )
              } else {
                scheduleBlink()
              }
            }, closeMs)
          )
        }, gap)
      )
    }

    scheduleBlink()
    return () => {
      cancelled = true
      for (const id of timers) window.clearTimeout(id)
    }
  }, [visible, reducedMotion])

  // Organic, non-loopy personality scheduler (random wait + non-repeating varied cues)
  React.useEffect(() => {
    if (!visible || reducedMotion) {
      setTalkPhase(0)
      setShowTextPhase(false)
      setGazeX(0)
      return
    }

    let cancelled = false
    let lastCue: IdleCue | null = null
    const timers: number[] = []
    const track = (id: number) => {
      timers.push(id)
      return id
    }

    const scheduleNextCue = (minWait = 3400, spanWait = 4600) => {
      const waitMs = minWait + Math.random() * spanWait
      track(
        window.setTimeout(() => {
          if (cancelled) return
          const cue = pickNextIdleCue(lastCue)
          lastCue = cue

          if (cue === "talk") {
            // Varied natural speech cadence (2 or 3 syllables, irregular rhythm)
            const syllables = Math.random() > 0.45 ? 3 : 2
            let cursor = 0
            for (let s = 0; s < syllables; s++) {
              const shape: TalkPhase = s % 2 === 0 ? 2 : 1
              const dur = 140 + Math.random() * 90
              track(
                window.setTimeout(() => {
                  if (!cancelled) setTalkPhase(shape)
                }, cursor)
              )
              cursor += dur
              track(
                window.setTimeout(() => {
                  if (!cancelled) setTalkPhase(s === syllables - 1 ? 0 : 3)
                }, cursor)
              )
              cursor += 95 + Math.random() * 65
            }
            track(
              window.setTimeout(() => {
                if (!cancelled) {
                  setTalkPhase(0)
                  scheduleNextCue(3200, 4800)
                }
              }, cursor + 60)
            )
          } else if (cue === "glance") {
            // Curious micro-glance slightly left or right, then settle back
            const dirX = Math.random() > 0.5 ? -1.9 : 1.7
            const dirY = -0.9 + Math.random() * 0.6
            setGazeX(dirX)
            setGazeY(dirY)
            const holdMs = 850 + Math.random() * 650
            track(
              window.setTimeout(() => {
                if (!cancelled) {
                  setGazeX(0)
                  setGazeY(0)
                  scheduleNextCue(2800, 4400)
                }
              }, holdMs)
            )
          } else {
            // Standalone "LET'S TALK" reveal (never shown alongside the face)
            setShowTextPhase(true)
            const readMs = 2100 + Math.random() * 900
            track(
              window.setTimeout(() => {
                if (!cancelled) {
                  setShowTextPhase(false)
                  scheduleNextCue(4200, 4800)
                }
              }, readMs)
            )
          }
        }, waitMs)
      )
    }

    // First spontaneous cue arrives organically after entering view
    scheduleNextCue(1400, 1400)

    return () => {
      cancelled = true
      for (const id of timers) window.clearTimeout(id)
    }
  }, [visible, reducedMotion])

  const mood = resolveMascotMood({
    hovered,
    focused,
    talkPhase,
    reducedMotion,
  })

  const display = resolveContactDisplay({
    hovered,
    focused,
    showTextPhase,
    reducedMotion,
  })

  return (
    <>
      {/* Quarter-circle button */}
      <button
        type="button"
        aria-label="Open contact panel"
        onClick={() => setOpen(true)}
        data-contact-button
        data-display={display}
        data-mood={mood}
        data-blinking={blinking && mood !== "wink" ? "true" : "false"}
        data-gaze-y={String(gazeY)}
        className={[
          "fixed z-[55] bottom-0 right-0 select-none cursor-pointer",
          "w-[106px] h-[106px] md:w-[132px] md:h-[132px]",
          "rounded-tl-[9999px] shadow-lg",
          // Unified acid-lime color across light and dark themes
          "bg-[#D7FF9A]",
          "flex items-end justify-end overflow-hidden",
          "transition-[opacity,transform,filter] duration-300 ease-out",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#11120E] dark:focus-visible:outline-[#D7FF9A]",
          // visibility & bounce in
          visible
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none translate-y-4",
        ].join(" ")}
        style={{
          animation:
            visible && !reducedMotion ? "appear-bounce 500ms ease-out" : undefined,
          filter: hovered ? "brightness(1.04)" : "brightness(1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <div className="relative w-full h-full">
          {/* Layer 1: Big Expressive Mascot Face ONLY (zero overlap with text layer) */}
          <div
            aria-hidden="true"
            className={[
              "absolute inset-0 flex items-end justify-end pb-3 pr-3 md:pb-4 md:pr-4 pointer-events-none",
              "transition-[opacity,transform]",
              display === "face"
                ? "opacity-100 scale-100 translate-y-0 duration-200 ease-out delay-150"
                : "opacity-0 scale-90 translate-y-1.5 duration-150 ease-in delay-0",
            ].join(" ")}
          >
            <div
              style={{
                animation:
                  visible && !reducedMotion && display === "face"
                    ? "mascot-breathe 4.6s ease-in-out infinite"
                    : undefined,
              }}
            >
              <svg
                viewBox="0 0 60 40"
                className="w-[62px] h-[44px] md:w-[78px] md:h-[54px] overflow-visible transition-transform duration-200 ease-out"
                style={{
                  transform:
                    mood === "wink" && !reducedMotion
                      ? "translateY(-1.5px) scale(1.05)"
                      : "translateY(0) scale(1)",
                }}
              >
                {/* Soft lime cheek dimples on hover/focus wink */}
                <g
                  className="transition-opacity duration-200"
                  style={{ opacity: mood === "wink" ? 1 : 0 }}
                >
                  <ellipse cx="10" cy="24.5" rx="3.6" ry="2" fill="#B5EA63" />
                  <ellipse cx="50" cy="24.5" rx="3.6" ry="2" fill="#B5EA63" />
                </g>

                {/* Left Eye */}
                <g
                  style={{
                    transformOrigin: "18px 15px",
                    transform:
                      blinking && mood !== "wink"
                        ? "scaleY(0.11)"
                        : mood === "wink"
                          ? "scale(1.05)"
                          : "scale(1)",
                    transition: "transform 125ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <ellipse
                    cx="18"
                    cy="15"
                    rx="6.2"
                    ry="7.6"
                    fill="#F7FFE8"
                    stroke="#11120E"
                    strokeWidth="2.35"
                  />
                  <g
                    style={{
                      transform: `translate(${mood === "wink" ? 0 : gazeX}px, ${mood === "wink" ? -0.6 : gazeY}px)`,
                      transition: "transform 160ms ease-out",
                    }}
                  >
                    <circle cx="18" cy="15.2" r="3.4" fill="#11120E" />
                    <circle cx="19.3" cy="13.6" r="1.15" fill="#F7FFE8" />
                  </g>
                </g>

                {/* Right Eye (normal blinking eye vs. cheeky wink arc on hover/focus) */}
                {mood === "wink" ? (
                  <path
                    d="M 35.5 16 Q 42 9.5 48.5 16"
                    fill="none"
                    stroke="#11120E"
                    strokeWidth="2.7"
                    strokeLinecap="round"
                  />
                ) : (
                  <g
                    style={{
                      transformOrigin: "42px 15px",
                      transform: blinking ? "scaleY(0.11)" : "scaleY(1)",
                      transition:
                        "transform 125ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <ellipse
                      cx="42"
                      cy="15"
                      rx="6.2"
                      ry="7.6"
                      fill="#F7FFE8"
                      stroke="#11120E"
                      strokeWidth="2.35"
                    />
                    <g
                      style={{
                        transform: `translate(${gazeX}px, ${gazeY}px)`,
                        transition: "transform 160ms ease-out",
                      }}
                    >
                      <circle cx="42" cy="15.2" r="3.4" fill="#11120E" />
                      <circle cx="43.3" cy="13.6" r="1.15" fill="#F7FFE8" />
                    </g>
                  </g>
                )}

                {/* Expressive Mouth: Hover Grin / Organic Talking / Friendly Smile */}
                {mood === "wink" ? (
                  <g>
                    <path
                      d="M 19 25.8 Q 30 27.2 41 25.8 Q 39.6 36.2 30 36.2 Q 20.4 36.2 19 25.8 Z"
                      fill="#11120E"
                    />
                    <ellipse cx="30" cy="33.5" rx="5" ry="2.2" fill="#EA6A52" />
                  </g>
                ) : mood === "talk" ? (
                  talkPhase === 1 ? (
                    <rect
                      x="25.8"
                      y="26"
                      width="8.4"
                      height="6.4"
                      rx="3.2"
                      fill="#11120E"
                    />
                  ) : talkPhase === 2 ? (
                    <g>
                      <path
                        d="M 22 26.4 Q 30 27.2 38 26.4 Q 36.8 34.8 30 34.8 Q 23.2 34.8 22 26.4 Z"
                        fill="#11120E"
                      />
                      <ellipse cx="30" cy="32.6" rx="3.7" ry="1.6" fill="#EA6A52" />
                    </g>
                  ) : (
                    <path
                      d="M 23.5 28 Q 30 32.8 36.5 28"
                      fill="none"
                      stroke="#11120E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )
                ) : (
                  <path
                    d="M 21 27.8 Q 30 34.2 39 27.8"
                    fill="none"
                    stroke="#11120E"
                    strokeWidth="2.45"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Layer 2: Text Label ONLY (zero overlap with face layer) */}
          <div
            className={[
              "absolute inset-0 flex items-end justify-end pb-3 pr-3 md:pb-3.5 md:pr-3.5 pointer-events-none",
              "transition-[opacity,transform]",
              display === "text"
                ? "opacity-100 scale-100 translate-y-0 duration-200 ease-out delay-150"
                : "opacity-0 scale-90 -translate-y-1.5 duration-150 ease-in delay-0",
            ].join(" ")}
          >
            <div className="text-right leading-[0.98] uppercase whitespace-nowrap">
              <div className="text-[#11120E] font-black tracking-tight text-[18px] md:text-[24px]">
                LET&rsquo;S
              </div>
              <div className="text-[#11120E] font-black tracking-tight text-[18px] md:text-[24px]">
                TALK
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Keyframes for appear bounce & breathing motion */}
      <style jsx global>{`
        @keyframes appear-bounce {
          0% {
            transform: translateY(16px) scale(0.92);
          }
          55% {
            transform: translateY(0) scale(1.04);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        @keyframes mascot-breathe {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-2px) scale(1.022);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          button[data-contact-button] {
            animation: none !important;
          }
        }
      `}</style>

      {/* Panel */}
      <ContactPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}
