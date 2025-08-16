"use client";

import React from "react";
import ShinyText from "./ShinyText";

interface SectionPillProps {
  label: string;
  dotClassName?: string; // tailwind classes for the dot color/gradient
  className?: string;
  shiny?: boolean;
}

export default function SectionPill({ label, dotClassName, className, shiny }: SectionPillProps) {
  return (
    <div
      className={
        "inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm " +
        "text-gray-800 text-sm md:text-base font-semibold " +
        (className ? className : "")
      }
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <span
        className={(dotClassName ? dotClassName : "bg-pink-400") + " w-3 h-3 rounded-full mr-2"}
      />
      <span className="tracking-tight">
        {shiny ? <ShinyText text={label} speed={2} /> : label}
      </span>
    </div>
  );
}
