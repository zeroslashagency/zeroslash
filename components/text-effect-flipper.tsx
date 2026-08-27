"use client"

import Link from "next/link"
import React from "react"

export default function FlipLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={
        "group relative inline-block align-baseline font-semibold tracking-tight whitespace-nowrap select-none " +
        "!text-black dark:!text-white " +
        className
      }
    >
      {/* Fixed height so no layout shift; nowrap so width is stable */}
      <span className="relative inline-block h-[1.2em] leading-[1.05] overflow-hidden align-baseline whitespace-nowrap">
        {/* initial text: not absolute so it defines width */}
        <span className="block will-change-transform transition-transform duration-300 ease-out translate-y-0 group-hover:-translate-y-full">
          {children}
        </span>
        {/* hover text (same content) */}
        <span aria-hidden className="absolute inset-0 will-change-transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0">
          {children}
        </span>
      </span>
    </Link>
  )
}
