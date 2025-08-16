"use client"

import React from "react"
import "./marquee.css"

type MarqueeProps = {
  text?: string
  speedSeconds?: number // duration per loop
  repeat?: number // how many times to duplicate content
}

export default function Marquee({
  text = "Ready. Set. Ship.",
  speedSeconds = 20,
  repeat = 4,
}: MarqueeProps) {
  const items = Array.from({ length: repeat }).map((_, i) => (
    <span className="marquee__item" aria-hidden={i !== 0} key={i}>
      <span className="marquee__emoji" role="img" aria-label="rose">🌹</span>
      <span className="marquee__text">{text}</span>
      <span className="marquee__emoji" role="img" aria-label="rose">🌹</span>
    </span>
  ))

  return (
    <div className="marquee" style={{ backgroundColor: "#0a0a0a" }}>
      <div
        className="marquee__track"
        style={{
          animationDuration: `${speedSeconds}s`,
        }}
      >
        {items}
      </div>
    </div>
  )
}


