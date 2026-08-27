"use client";

import { useEffect, useRef } from 'react';

interface ScrollFloatProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollFloat({ children, delay = 0, className = "" }: ScrollFloatProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (ref.current) {
              ref.current.style.opacity = '1';
              ref.current.style.transform = 'translateY(0)';
              ref.current.style.filter = 'blur(0px)';
            }
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out opacity-0 translate-y-8 ${className}`}
      style={{ filter: 'blur(8px)' }}
    >
      {children}
    </div>
  );
}
