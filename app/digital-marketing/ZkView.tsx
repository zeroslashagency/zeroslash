"use client";
import { useEffect, useRef } from "react";
import { zkHtml } from "./zkHtml";

// Vendored design mounted into a scoped container. Asset paths and brand strings
// are already correct in the vendored sources on disk, so nothing is rewritten at
// runtime — the engines just get loaded once the first paint is done.
//
// Load order matters: scroll.js installs the rAF scheduler that home.js and
// site.js both schedule work on.
const ENGINES = [
  "/digital-marketing-assets/js/core/scroll.js",
  "/digital-marketing-assets/js/pages/home.js",
  "/digital-marketing-assets/js/site.js",
  // drives the perspective warp on the phone tiles ([data-hero-mock])
  "/digital-marketing-assets/js/components/warp-hero.js",
];

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-zk="${src}"]`);
    if (existing) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.dataset.zk = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(el);
  });

const whenIdle = (cb: () => void) => {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => void }).requestIdleCallback;
  if (ric) ric(cb, { timeout: 800 });
  else setTimeout(cb, 80);
};

export default function ZkView() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    // site.js resolves the night ridge image against this
    (window as unknown as { ASSET_BASE?: string }).ASSET_BASE = "/digital-marketing-assets/";

    // The scoped CSS keys night mode off `#zk-scope.night`, so the class has to be
    // mirrored from <body> onto the scope element.
    const syncNight = () => scope.classList.toggle("night", document.body.classList.contains("night"));
    syncNight();
    const bodyObserver = new MutationObserver(syncNight);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    let cancelled = false;

    whenIdle(async () => {
      if (cancelled) return;
      // home.js reads this flag on init to skip the desktop-only pinned canvas
      if (window.innerWidth <= 820) document.documentElement.classList.add("cs-static");

      try {
        for (const src of ENGINES) {
          if (cancelled) return;
          await loadScript(src);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") console.warn("[zk] engine load failed", error);
        return;
      }

      (window as unknown as { Scroll?: { kick?: () => void } }).Scroll?.kick?.();
      window.dispatchEvent(new Event("resize"));

      // Engines load after first paint, so anything already on screen missed its
      // IntersectionObserver pass and would stay hidden.
      requestAnimationFrame(() => {
        scope.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) el.classList.add("is-visible");
        });
      });
    });

    return () => {
      cancelled = true;
      bodyObserver.disconnect();
    };
  }, []);

  return <div ref={scopeRef} id="zk-scope" dangerouslySetInnerHTML={{ __html: zkHtml }} suppressHydrationWarning />;
}
