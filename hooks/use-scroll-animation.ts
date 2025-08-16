"use client";

import { useInView, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { useRef, useEffect } from "react";

export interface ScrollAnimationOptions {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    amount: options.threshold || 0.1,
    once: options.once !== false,
  });

  return { ref, isInView };
}

export function useParallaxScroll() {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200]);
  
  return { ref, y };
}

export function useScrollProgress() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return { ref, progress: smoothProgress };
}

// Custom hook for advanced scroll-triggered animations
export function useAdvancedScrollAnimation({
  threshold = 0.1,
  once = true,
  delay = 0,
  duration = 0.8,
}: {
  threshold?: number;
  once?: boolean;
  delay?: number;
  duration?: number;
} = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold, once });

  const opacity = useMotionValue(0);
  const y = useMotionValue(30);
  const scale = useMotionValue(0.95);

  const smoothOpacity = useSpring(opacity, { duration: duration * 1000, bounce: 0 });
  const smoothY = useSpring(y, { duration: duration * 1000, bounce: 0 });
  const smoothScale = useSpring(scale, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        opacity.set(1);
        y.set(0);
        scale.set(1);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, opacity, y, scale, delay]);

  return {
    ref,
    isInView,
    style: {
      opacity: smoothOpacity,
      y: smoothY,
      scale: smoothScale,
    },
  };
}
