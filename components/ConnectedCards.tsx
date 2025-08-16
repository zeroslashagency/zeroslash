"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type CardItem = { n: string; t: string; d: string };

function useResizeObserver<T extends Element>(target: React.RefObject<T | null>, onResize: () => void) {
  useEffect(() => {
    if (!target.current) return;
    const ro = new ResizeObserver(() => onResize());
    ro.observe(target.current);
    return () => ro.disconnect();
  }, [target, onResize]);
}

export default function ConnectedCards({
  items = [
    { n: "01", t: "Discover", d: "Understand goals, audience, and constraints clearly." },
    { n: "02", t: "Design", d: "Craft clean, purposeful interfaces and flows." },
    { n: "03", t: "Build", d: "Develop reliable, scalable features with care." },
    { n: "04", t: "Launch", d: "Ship confidently and iterate with insights." },
  ],
}: { items?: CardItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pinRefs = useRef<HTMLDivElement[]>([]);
  const [paths, setPaths] = useState<string[]>([]);

  // Allocate refs for pins
  const setPinRef = (el: HTMLDivElement | null, i: number) => {
    if (el) pinRefs.current[i] = el;
  };

  const computePaths = () => {
    const cont = containerRef.current;
    const svg = svgRef.current;
    if (!cont || !svg) return;
    const crect = cont.getBoundingClientRect();

    const points = pinRefs.current.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - crect.left,
        y: r.top + r.height / 2 - crect.top,
      };
    });

    const newPaths: string[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = Math.abs(b.x - a.x);
      // Control point midway with slight vertical wave depending on index parity
      const cx = a.x + dx / 2;
      const wave = (i % 2 === 0 ? -1 : 1) * Math.min(40, Math.max(16, dx * 0.12));
      const cy = a.y + wave;
      newPaths.push(`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`);
    }
    setPaths(newPaths);

    // Resize SVG to container size
    svg.setAttribute("width", `${crect.width}`);
    svg.setAttribute("height", `${crect.height}`);
    svg.setAttribute("viewBox", `0 0 ${crect.width} ${crect.height}`);
  };

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(computePaths);
    return () => cancelAnimationFrame(raf);
  }, []);

  useResizeObserver(containerRef, computePaths);

  useEffect(() => {
    const onResize = () => computePaths();
    window.addEventListener("resize", onResize);
    const id = setInterval(computePaths, 400); // handle font/layout shifts
    return () => {
      window.removeEventListener("resize", onResize);
      clearInterval(id);
    };
  }, []);

  return (
    <section className="w-full py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={containerRef} className="relative max-w-6xl mx-auto">
          {/* Animated connectors */}
          <svg ref={svgRef} className="absolute inset-0 pointer-events-none z-0">
            <defs>
              <linearGradient id="connGradDyn" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(220 90% 60%)" />
                <stop offset="50%" stopColor="hsl(260 90% 60%)" />
                <stop offset="100%" stopColor="hsl(95 90% 55%)" />
              </linearGradient>
              <filter id="connShadowDyn" x="-20%" y="-50%" width="140%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="1.5" floodColor="rgba(0,0,0,0.15)" />
              </filter>
            </defs>
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                className="connector-wave"
                strokeWidth={2.5}
                stroke="url(#connGradDyn)"
                fill="none"
                filter="url(#connShadowDyn)"
              />
            ))}
          </svg>

          {/* Cards row */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 z-10">
            {items.map((item, idx) => (
              <div key={item.n} className="relative overflow-visible">
                {/* pin */}
                <div
                  ref={(el) => setPinRef(el as HTMLDivElement, idx)}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
                >
                  <div className="w-6 h-6 rounded-full bg-foreground ring-4 ring-card shadow-lg" />
                </div>

                {/* card */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-7 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-sm text-foreground/50 mb-2">{item.n}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.t}</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
