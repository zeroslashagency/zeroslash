"use client"

import { useState } from "react"
import nextDynamic from "next/dynamic"
import Image from "next/image"

const BrandRibbonsStage = nextDynamic(() => import("./BrandRibbonsStage"), {
  ssr: false,
  loading: () => null,
})

function StaticFallbackRibbons() {
  const strips = [
    { label: "etisalat", bg: "#e61d14", fg: "#ffffff", rot: "-17deg", top: "14%", right: "-8%", width: "68%" },
    { label: "Uber", bg: "#1b1c20", fg: "#ffffff", rot: "-18deg", top: "28%", right: "-6%", width: "66%" },
    { label: "BINANCE", bg: "#e6b422", fg: "#141414", rot: "-19deg", top: "42%", right: "-8%", width: "62%" },
    { label: "twitch", bg: "#7c4be8", fg: "#ffffff", rot: "-20deg", top: "56%", right: "-6%", width: "60%" },
    { label: "GALITHIN", bg: "#6d1124", fg: "#ffffff", rot: "-18deg", top: "70%", right: "-8%", width: "58%" },
    { label: "boohoo", bg: "#d4d5da", fg: "#141416", rot: "-19deg", top: "82%", right: "-6%", width: "60%" },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {strips.map((strip) => (
        <div
          key={strip.label}
          className="absolute flex items-center justify-center h-12 sm:h-16 shadow-md font-bold tracking-tight text-sm sm:text-lg"
          style={{
            backgroundColor: strip.bg,
            color: strip.fg,
            top: strip.top,
            right: strip.right,
            width: strip.width,
            transform: `rotate(${strip.rot})`,
            clipPath: "polygon(3% 50%, 0 0, 100% 0, 100% 100%, 0 100%)",
          }}
        >
          {strip.label}
        </div>
      ))}
    </div>
  )
}

export default function BrandRibbonsSection() {
  const [webglFailed, setWebglFailed] = useState(false)

  return (
    <section
      id="brand-ribbons"
      aria-label="ZeroSlash Agency — Global Brand Showcase"
      className="relative z-20 w-screen max-w-none mx-[calc(50%-50vw)] min-h-[100svh] [overflow-x:clip] overflow-y-visible select-none"
      style={{
        background:
          "linear-gradient(180deg, rgba(235,235,234,0) 68%, #ebebea 100%), radial-gradient(115% 95% at 78% 22%, #ffffff 0%, #f5f5f3 58%, #ebebea 100%)",
      }}
    >
      {/* Full-bleed interactive 3D Ribbon Cloth Canvas (extends well past the below marquee so tips never clip) */}
      <div className="absolute inset-x-0 top-0 -bottom-[26rem] sm:-bottom-[30rem] lg:-bottom-[36rem] z-0">
        {webglFailed ? (
          <div className="absolute inset-x-0 top-0 bottom-[26rem] sm:bottom-[30rem] lg:bottom-[36rem] overflow-hidden">
            <StaticFallbackRibbons />
          </div>
        ) : (
          <BrandRibbonsStage onWebglFallback={() => setWebglFailed(true)} />
        )}
      </div>

      {/* Full-screen Editorial Overlay using the agency SVG logo */}
      <div className="relative z-10 flex flex-col justify-between min-h-[100svh] px-6 pt-24 pb-10 sm:px-10 sm:pt-28 sm:pb-12 lg:px-16 lg:pt-32 lg:pb-14 pointer-events-none">
        {/* Top-left Repo SVG Logo */}
        <div className="pointer-events-auto w-fit flex flex-col items-start">
          <div className="relative w-[180px] h-[180px] sm:w-[230px] sm:h-[230px] lg:w-[290px] lg:h-[290px] -ml-6 sm:-ml-8 lg:-ml-11 -mt-4 sm:-mt-5 lg:-mt-6">
            <Image
              src="/images/logo.svg"
              alt="ZeroSlash Agency"
              fill
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 230px, 290px"
              priority
              referrerPolicy="no-referrer"
              className="object-contain"
            />
          </div>
          <span className="-mt-9 sm:-mt-11 lg:-mt-14 text-[13px] sm:text-[15px] lg:text-[18px] font-medium tracking-[0.04em] uppercase text-[#141414]">
            ZEROSLASH AGENCY
          </span>
        </div>

        {/* Bottom-left Editorial Copy */}
        <div className="mt-auto pt-40 sm:pt-32 lg:pt-24 max-w-[34ch] pointer-events-auto [text-shadow:0_1px_14px_rgba(245,245,243,0.92)] sm:[text-shadow:none]">
          <p className="text-[12px] sm:text-[13px] font-normal tracking-[-0.01em] text-[#3a3a3a] mb-3">
            + (Zeroslash)
          </p>
          <p className="text-[20px] sm:text-[24px] lg:text-[27px] leading-[1.2] tracking-[-0.025em] font-normal text-[#111111]">
            A digital creative house operating worldwide. We shape experiences where depth, elegance, and essence are felt, not explained.
          </p>
        </div>
      </div>
    </section>
  )
}
