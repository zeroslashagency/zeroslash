"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import Counter from "./Counter";

interface CountUpOnViewProps {
  target: number;
  label?: string;
  places: number[];
  fontSize?: number;
  suffix?: string;
  textColor?: string;
}

export default function CountUpOnView({
  target,
  label,
  places,
  fontSize = 56,
  suffix,
  textColor = "#000",
}: CountUpOnViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20% 0px" });
  const [value, setValue] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (!isInView || hasRun) return;
    setHasRun(true);

    const duration = 1400; // ms
    const start = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const current = Math.round(eased * target);
      setValue(current);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView, hasRun, target]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center"
    >
      <motion.div
        className="relative inline-flex items-end justify-center gap-1 mb-3 md:mb-4"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.06)", background: "transparent" }}
        whileHover={{ scale: 1.05, y: -4 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Counter value={value} places={places} fontSize={fontSize} textColor={textColor} horizontalPadding={0} counterStyle={{ gap: 2 }} gradientHeight={0} />
        {suffix ? (
          <span
            className="font-bold"
            style={{ fontSize: Math.round(fontSize * 0.9), lineHeight: 1, marginLeft: -2 }}
          >
            {suffix}
          </span>
        ) : null}
      </motion.div>
      {label ? (
        <div className="text-gray-600 font-medium text-sm md:text-base lg:text-lg">
          {label}
        </div>
      ) : null}
    </motion.div>
  );
}
