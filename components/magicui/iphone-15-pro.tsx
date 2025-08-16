"use client"

import React from "react"

export default function Iphone15Pro({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`relative mx-auto aspect-[9/19] w-[260px] sm:w-[300px] md:w-[360px] ${className}`}>
      {/* Body */}
      <div className="absolute inset-0 rounded-[48px] bg-neutral-200 dark:bg-neutral-900 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.08),0_20px_60px_rgba(0,0,0,0.25)]" />
      {/* Bezel */}
      <div className="absolute inset-[8px] rounded-[40px] bg-black/90 dark:bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
      {/* Screen */}
      <div className="absolute inset-[14px] rounded-[34px] overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-[#0e0f12] dark:to-[#121318]">
        {children}
      </div>
      {/* Dynamic Island / Notch */}
      <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />
      {/* Side button */}
      <div className="absolute right-[-2px] top-[80px] h-12 w-1 rounded-r bg-neutral-500/70 dark:bg-neutral-700/70" />
    </div>
  )
}
