"use client";

import React from "react";

type ShineBorderProps = {
  className?: string;
  duration?: number; // seconds
  shineColor?: string | string[];
  borderWidth?: number; // px
  style?: React.CSSProperties;
};

// A lightweight animated conic-gradient border that respects the current theme via CSS tokens by default.
// Usage: position the parent as relative and overflow-hidden; this component renders an absolute inset-0 layer.
export function ShineBorder({
  className = "",
  duration = 14,
  shineColor = "hsl(var(--border))",
  borderWidth = 1,
  style = {},
}: ShineBorderProps) {
  const colors = Array.isArray(shineColor) ? shineColor.join(", ") : `${shineColor}, ${shineColor}`;

  const layerStyle: React.CSSProperties = {
    padding: borderWidth,
    background: `conic-gradient(from var(--sb-angle), ${colors})`,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    ...style,
  };

  // styled-jsx to keep keyframes local and avoid global CSS edits
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
        style={layerStyle}
      />
      <style jsx>{`
        @property --sb-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        :global(html) { /* ensure browser knows about property once */ }
        :global(.sb-animate) {
          animation: sb-rotate ${duration}s linear infinite;
        }
        @keyframes sb-rotate {
          to { --sb-angle: 360deg; }
        }
      `}</style>
    </>
  );
}

export default ShineBorder;
