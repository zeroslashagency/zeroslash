"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import ShinyText from "./ShinyText";

interface SectionPillProps {
  label: string;
  icon?: LucideIcon;
  dotClassName?: string; // optional fallback for legacy callers without an icon
  className?: string;
  shiny?: boolean;
}

export default function SectionPill({
  label,
  icon: Icon,
  dotClassName,
  className,
  shiny = true,
}: SectionPillProps) {
  return (
    <div
      className={
        "inline-flex items-center px-4 py-2 rounded-full bg-card border border-border " +
        "text-gray-600 dark:text-gray-300 text-sm font-medium shadow-sm " +
        (className ? className : "")
      }
    >
      {Icon ? (
        <Icon className="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />
      ) : dotClassName ? (
        <span className={`${dotClassName} w-2.5 h-2.5 rounded-full mr-2 shrink-0`} aria-hidden="true" />
      ) : null}
      {shiny ? <ShinyText text={label} speed={2} /> : <span>{label}</span>}
    </div>
  );
}
