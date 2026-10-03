"use client";
import { useEffect, useRef } from "react";
import { marketingHtml } from "./marketingHtml";

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

// IIFEs in the vendored engines (customElements.define, cursor, listeners) must
// not re-run on client remount. Script tags themselves are pulled when #marketing-scope
// unmounts, so this flag is what stops a second execute.
let enginesLoaded = false;

const loadScript = (src: string, root: ParentNode) =>
  new Promise<void>((resolve, reject) => {
    if (enginesLoaded) return resolve();
    const existing = root.querySelector(`script[data-marketing="${CSS.escape(src)}"]`);
    if (existing) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.dataset.marketing = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    root.appendChild(el);
  });

const whenIdle = (cb: () => void) => {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => void }).requestIdleCallback;
  if (ric) ric(cb, { timeout: 800 });
  else setTimeout(cb, 80);
};

// site.js appends the watering-can + inverse-dot cursors onto document.body
// (outside #marketing-scope). Without this, they survive client navigations to /contact
// and every other route, unstyled, sitting in normal document flow.
function stripLeakedMarketingChrome() {
  document.querySelectorAll("body > svg.ft-cursor, body > .dot-cursor").forEach((n) => n.remove());
  document.documentElement.classList.remove("dot-cursor-on", "cs-static", "pl-lock");
  document.body.classList.remove("pl-lock", "theme-fading");
  if (document.body.style.overflow === "hidden") document.body.style.removeProperty("overflow");
}

// The inverse-dot cursor's styles only exist under #marketing-scope, but the
// engine appends the node to document.body — unstyled it sits in normal flow
// with a stale pointer transform, stretching the page's scroll width (a black
// void on wide dark-mode screens). Adopt it into the scope, where its
// position:fixed styling applies and it can't affect layout.
function adoptDotCursor(scope: ParentNode) {
  document.querySelectorAll("body > .dot-cursor").forEach((n) => {
    scope.appendChild(n);
  });
}

export default function MarketingView() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = scopeRef.current?.querySelector<HTMLElement>(".sky-band");
    if (!band) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const updateMotion = () => {
      band.dataset.running = String(visible && !document.hidden && !reducedMotion.matches);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateMotion();
    });
    observer.observe(band);
    document.addEventListener("visibilitychange", updateMotion);
    reducedMotion.addEventListener("change", updateMotion);
    updateMotion();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateMotion);
      reducedMotion.removeEventListener("change", updateMotion);
      band.dataset.running = "false";
    };
  }, []);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    // Purge cursor nodes leaked by a previous mount before the engines run.
    stripLeakedMarketingChrome();

    // site.js resolves the night ridge image against this
    (window as unknown as { ASSET_BASE?: string }).ASSET_BASE = "/digital-marketing-assets/";

    // The scoped CSS keys night mode off `#marketing-scope.night`, so the class has to be
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
          if (cancelled) {
            stripLeakedMarketingChrome();
            return;
          }
          await loadScript(src, scope);
        }
        enginesLoaded = true;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") console.warn("[marketing] engine load failed", error);
        return;
      }

      if (cancelled) {
        stripLeakedMarketingChrome();
        return;
      }

      (window as unknown as { __marketingEnsureDotCursor?: () => void }).__marketingEnsureDotCursor?.();
      adoptDotCursor(scope);
      (window as unknown as { Scroll?: { kick?: () => void } }).Scroll?.kick?.();
      window.dispatchEvent(new Event("resize"));

      // Engines load after first paint, so anything already on screen missed its
      // IntersectionObserver pass and would stay hidden.
      requestAnimationFrame(() => {
        if (cancelled) return;
        scope.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) el.classList.add("is-visible");
        });
      });
    });

    return () => {
      cancelled = true;
      bodyObserver.disconnect();
      stripLeakedMarketingChrome();
      delete (window as unknown as { ASSET_BASE?: string }).ASSET_BASE;
    };
  }, []);

  return <div ref={scopeRef} id="marketing-scope" dangerouslySetInnerHTML={{ __html: marketingHtml }} suppressHydrationWarning />;
}
