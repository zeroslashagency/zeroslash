"use client";

import React, { useEffect, useRef } from "react";

type ParallaxProps = {
  className?: string;
  speed?: number; // 0.1 = subtle, 0.3 = stronger
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function Parallax({ className = "", speed = 0.15, style, children }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const y = window.scrollY * speed;
      // Use rAF to avoid layout thrash
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transform = `translateY(${y * -1}px)`;
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}


