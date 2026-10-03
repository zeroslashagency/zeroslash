"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"

export type JourneyService = "web" | "marketing" | "branding" | "product"

const STORIES = {
  web: { caption: "Ideas go live.", description: "A little train carries a browser, animated code, and a finished website. A conductor takes the idea toward launch." },
  marketing: { caption: "Word gets around.", description: "A little train carries a megaphone sending signals, a flying letter, and a growing audience. A conductor helps the message travel." },
  branding: { caption: "Make your mark.", description: "A little train carries a spinning color palette, a distinctive symbol, and expressive lettering. A conductor brings the identity together." },
  product: { caption: "Bring it to life.", description: "A little train carries a wireframe, a working prototype with a moving cursor, and a completed product. A conductor takes it from sketch to experience." },
}

function Cargo({ service }: { service: JourneyService }) {
  if (service === "web") return <>
    <g transform="translate(38 95)">
      <rect width="74" height="48" rx="5" className="journey-paper" />
      <path d="M0 11h74" /><circle cx="7" cy="6" r="1" /><circle cx="12" cy="6" r="1" />
      <g className="journey-code"><path d="m25 23-8 6 8 6m25-12 8 6-8 6m-8-15-7 23" /></g>
    </g>
    <g transform="translate(143 91)">
      <rect width="75" height="52" rx="5" className="journey-paper" />
      <path d="M0 11h75" /><circle cx="7" cy="6" r="1" /><circle cx="12" cy="6" r="1" />
      <path d="M9 20h23v24H9z" className="journey-tint" />
      <g className="journey-layout"><path d="M40 22h24M40 29h18M40 36h24M40 43h14" /></g>
    </g>
    <g transform="translate(249 87)">
      <rect width="74" height="56" rx="5" className="journey-paper" /><path d="M0 11h74" />
      <circle cx="7" cy="6" r="1" /><circle cx="12" cy="6" r="1" />
      <rect x="9" y="18" width="56" height="19" rx="2" className="journey-accent" />
      <path d="M9 45h16m6 0h15m6 0h13M9 49h12m10 0h11m10 0h10" />
      <path className="journey-spark" d="m61-9 3-7m5 14 7-2m-18-7-2-6" />
    </g>
  </>
  if (service === "marketing") return <>
    <g transform="translate(37 86)">
      <g className="journey-megaphone">
        <path d="M11 23h17L56 6v41L28 32H11z" className="journey-accent" />
        <path d="m21 32 6 24h12l-8-23M10 22H3v12h8M56 21q13 6 0 13" className="journey-paper" />
      </g>
      <g className="journey-signals"><path d="m65 9 9-6m-8 22h13m-14 15 9 6" /></g>
    </g>
    <g transform="translate(146 99)">
      <g className="journey-letter"><rect width="66" height="40" rx="4" className="journey-paper" /><path d="m1 2 32 22L65 2M1 38l23-19m41 19L42 19" /><path d="m34-10 5-8m7 13 9-4" className="journey-accent" /></g>
    </g>
    <g transform="translate(251 99)">
      <g className="journey-audience"><circle cx="35" cy="13" r="10" className="journey-tint" /><path d="M17 44v-5a18 18 0 0 1 36 0v5" className="journey-accent" /></g>
      <g className="journey-audience journey-audience-second"><circle cx="8" cy="23" r="7" className="journey-paper" /><path d="M-4 44v-4a12 12 0 0 1 22 0" /></g>
      <g className="journey-audience journey-audience-third"><circle cx="62" cy="23" r="7" className="journey-paper" /><path d="M52 40a12 12 0 0 1 22 0v4" /></g>
    </g>
  </>
  if (service === "branding") return <>
    <g transform="translate(74 115)">
      <g className="journey-palette"><path d="M-28 8C-43-12-18-36 6-29s35 28 13 30C1 2 10 20-4 24c-9 3-18-4-24-16Z" className="journey-paper" />
        <circle cx="-15" cy="-12" r="5" className="journey-accent" /><circle cx="0" cy="-17" r="5" fill="#cf9389" /><circle cx="15" cy="-10" r="5" fill="#8eafa0" /><circle cx="-24" cy="2" r="5" fill="#9985ca" /><circle cx="-9" cy="12" r="4" /></g>
    </g>
    <g transform="translate(181 114)">
      <g className="journey-brandmark"><path d="m0-28 7 17 18-7-7 18 18 7-18 7 7 18-18-7-7 18-7-18-18 7 7-18-18-7 18-7-7-18 18 7Z" className="journey-accent" /><circle r="7" className="journey-paper" /></g>
    </g>
    <g transform="translate(250 143)">
      <g className="journey-type"><path d="m2 0 20-51L42 0M9-16h27M5 0H0m38 0h9" strokeWidth="3" /><path d="M71-1v-28c0-12-25-11-25 0m25 13c-37-13-34 23 0 12" strokeWidth="3" /></g>
      <path d="M0 8h77" strokeDasharray="2 5" opacity="0.35" />
    </g>
  </>
  return <>
    <g transform="translate(39 91)">
      <rect width="71" height="52" rx="4" className="journey-paper" /><path d="M7 8h57v13H7zM7 27h25v18H7zm32 0h25v18H39z" strokeDasharray="3 3" />
      <path className="journey-wire" d="m10 37 8-6 10 10m15-2 8-8 11 12" />
    </g>
    <g transform="translate(153 78)">
      <rect width="52" height="67" rx="7" className="journey-paper" /><path d="M19 7h14M20 61h12" />
      <rect x="7" y="16" width="38" height="19" rx="3" className="journey-tint" /><path d="M9 43h30M9 49h20" />
      <path className="journey-cursor" d="m36 31 2 21 5-6 7 2Z" fill="var(--foreground)" stroke="var(--background)" />
    </g>
    <g transform="translate(263 86)">
      <rect width="51" height="59" rx="10" className="journey-accent" /><circle cx="26" cy="29" r="17" className="journey-paper" /><path className="journey-check" d="m17 29 6 6 13-14" strokeWidth="3" /><path className="journey-spark" d="m-8 6-5-5m29-10v-6m40 21 6-3" />
    </g>
  </>
}

function Wheels({ x }: { x: number }) {
  return <g transform={`translate(${x} 169)`}><g className="journey-wheel"><circle r="8" className="journey-paper" /><circle r="2" /><path d="M-6 0H6M0-6V6" /></g></g>
}

export default function ServiceJourney({ service, color, active }: { service: JourneyService; color: string; active: boolean }) {
  const scene = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const id = useId()
  const story = STORIES[service]

  useEffect(() => {
    const element = scene.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(element)
    const onVisibility = () => setTabVisible(!document.hidden)
    onVisibility()
    document.addEventListener("visibilitychange", onVisibility)
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility) }
  }, [])

  return <div ref={scene} className="service-journey" data-running={active && visible && tabVisible && !paused} style={{ "--journey-color": color } as CSSProperties}>
    <svg viewBox="0 0 530 220" role="img" aria-labelledby={`${id}-title ${id}-description`} className={`journey-svg journey-${service}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <title id={`${id}-title`}>{service[0].toUpperCase() + service.slice(1)} in motion</title>
      <desc id={`${id}-description`}>{story.description}</desc>
      <defs><clipPath id={`${id}-clip`}><rect x="2" y="8" width="526" height="180" /></clipPath></defs>
      <g clipPath={`url(#${id}-clip)`}>
        <g className="journey-clouds" opacity="0.22"><path d="M72 46h40a10 10 0 0 0-13-10 14 14 0 0 0-27 10Zm247-13h34a8 8 0 0 0-11-8 12 12 0 0 0-23 8Z" /></g>
        <g className="journey-scenery" opacity="0.28"><path d="M-40 179v-26m-6 7 6-7 6 7M490 178v-23m-7 7 7-7 7 7M514 178v-13m-5 5 5-5 5 5" /></g>
        <path d="M4 180h522" opacity="0.45" />
        <g className="journey-sleepers" opacity="0.35">{Array.from({ length: 31 }, (_, index) => <path key={index} d={`M${index * 20 - 40} 185h9`} />)}</g>
        <g className="journey-train">
          <Cargo service={service} />
          {[29, 135, 241].map((x) => <g key={x}><path d={`M${x} 146h93v15a5 5 0 0 1-5 5h-83a5 5 0 0 1-5-5Z`} className="journey-tint" /><path d={`M${x + 8} 153h77M${x + 94} 159h11`} /><Wheels x={x + 20} /><Wheels x={x + 73} /></g>)}
          <g transform="translate(349 0)">
            <path d="M-10 159H0M0 108h56v57H0z" className="journey-accent" />
            <path d="M-5 106h66v-7H-5Z" className="journey-paper" />
            <path d="M9 116h37v25H9z" className="journey-paper" />
            <g className="journey-conductor"><path d="M23 139v-5q5-6 12 0v5" className="journey-tint" /><circle cx="29" cy="125" r="7" className="journey-paper" /><path d="M21 120h18m-17 0v-4h12l3 4M31 126h1m-5 2q2 2 4 0" /><g transform="translate(36 133)"><path className="journey-wave" d="m-1 3 6-7V-9m0 4 4-2" /></g></g>
            <path d="M56 128h55a15 15 0 0 1 15 15v22H56z" className="journey-tint" /><path d="M96 128v-20h14v20M93 106h20v-5H93zM56 145h67M122 164l12 9H51" className="journey-paper" />
            <circle cx="112" cy="142" r="3" className="journey-accent" />
            <Wheels x={16} /><Wheels x={44} /><Wheels x={96} />
            <g className="journey-steam" opacity="0.5"><circle cx="103" cy="88" r="5" /><circle cx="96" cy="70" r="7" /><circle cx="85" cy="49" r="10" /></g>
          </g>
        </g>
      </g>
    </svg>
    <div className="journey-footer"><p>{story.caption}</p><button type="button" onClick={() => setPaused((value) => !value)} aria-label={`${paused ? "Play" : "Pause"} ${service} animation`} aria-pressed={paused} className="journey-control"><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">{paused ? <path d="m5 3 8 5-8 5Z" fill="currentColor" /> : <path d="M5 3v10M11 3v10" fill="none" stroke="currentColor" strokeWidth="2" />}</svg><span>{paused ? "Play" : "Pause"}</span></button></div>
  </div>
}
