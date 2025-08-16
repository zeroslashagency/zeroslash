"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  containerId: string;
  pinSelector?: string; // default: [data-flow-pin="true"]
};

export default function FlowConnector({ containerId, pinSelector = '[data-flow-pin="true"]' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [endpoints, setEndpoints] = useState<{ x: number; y: number }[]>([]);

  const compute = useCallback(() => {
    const container = document.getElementById(containerId);
    const svg = svgRef.current;
    if (!container || !svg) return;

    const crect = container.getBoundingClientRect();
    const pins = Array.from(container.querySelectorAll<HTMLElement>(pinSelector));
    if (pins.length < 2) return;

    const points = pins.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - crect.left, y: r.top + r.height / 2 - crect.top };
    });

    const d: string[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const midx = a.x + dx / 2;
      const amp = Math.max(20, Math.min(60, Math.abs(dx) * 0.18)) * (i % 2 === 0 ? 1 : -1);
      const midy = (a.y + b.y) / 2 + amp;
      d.push(`M ${a.x} ${a.y} Q ${midx} ${midy} ${b.x} ${b.y}`);
    }

    setPaths(d);
    setEndpoints(points);
    svg.setAttribute("width", `${crect.width}`);
    svg.setAttribute("height", `${crect.height}`);
    svg.setAttribute("viewBox", `0 0 ${crect.width} ${crect.height}`);
  }, [containerId, pinSelector]);

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(raf);
  }, [compute]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const ro = new ResizeObserver(() => compute());
    ro.observe(container);
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    const id = setInterval(compute, 500);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      clearInterval(id);
    };
  }, [containerId, compute]);

  return (
    <svg ref={svgRef} className="absolute inset-0 pointer-events-none z-0">
      <defs>
        <filter id="flowShadow" x="-20%" y="-50%" width="140%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="1.5" floodColor="rgba(0,0,0,0.15)" />
        </filter>
      </defs>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          className="connector-wave stroke-black dark:stroke-gray-300"
          strokeWidth={2}
          fill="none"
          filter="url(#flowShadow)"
        />
      ))}
      {/* endpoint dots to visually touch pins */}
      {endpoints.map((p, i) => (
        <circle key={`end-${i}`} cx={p.x} cy={p.y} r={2.5} className="fill-black dark:fill-gray-300" filter="url(#flowShadow)" />
      ))}
    </svg>
  );
}
