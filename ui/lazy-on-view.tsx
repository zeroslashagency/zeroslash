"use client";

import React, { useEffect, useRef, useState } from "react";

type LazyOnViewProps = {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
};

export function LazyOnView({ children, rootMargin = "200px", threshold = 0.1, className = "" }: LazyOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return; // already mounted
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible, rootMargin, threshold]);

  return <div ref={ref} className={className}>{isVisible ? children : null}</div>;
}


