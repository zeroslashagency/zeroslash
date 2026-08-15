"use client";
import { useEffect, useRef } from "react";
import { zkHtml } from "./zkHtml";

// CLEAN ZkView — minimal, accessible, no 404, no blocking loops
// Fixes:
// - 404 /assets/footer-land.png by fetch-patching site.js BEFORE it executes
// - "silently expandable" footer by forcing ft-head visible (no 0→1 scrub flash)
// - "loading too much" by deferring heavy engines to idle, killing MutationObserver spam and garden RAF spam
export default function ZkView() {
  const scopeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    if (!scope.innerHTML.trim()) scope.innerHTML = zkHtml;

    // asset base for any JS-built URLs
    (window as any).ASSET_BASE = "/digital-marketing-assets/";

    // mirror night class for scoped CSS
    const syncNight = () => scope.classList.toggle("night", document.body.classList.contains("night"));
    syncNight();
    const bodyObs = new MutationObserver(syncNight);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const loadScript = (src: string) =>
      new Promise<void>((res, rej) => {
        if (document.querySelector(`script[data-zk="${src}"]`)) return res();
        const s = document.createElement("script");
        s.src = src;
        s.dataset.zk = src;
        s.onload = () => res();
        s.onerror = () => rej(new Error(`load fail ${src}`));
        document.body.appendChild(s);
      });

    const loadPatchedSite = async () => {
      if ((window as any).__zkSitePatched) return;
      const res = await fetch("/digital-marketing-assets/js/site.js", { cache: "force-cache" });
      let txt = await res.text();
      // patch every hardcoded assets/ reference before the browser ever parses the template
      // covers NAV_HTML, FOOTER_HTML, CONTACT_HTML and any JS string
      txt = txt.replaceAll('src="assets/', 'src="/digital-marketing-assets/assets/');
      txt = txt.replaceAll("src='assets/", "src='/digital-marketing-assets/assets/");
      txt = txt.replaceAll('href="assets/', 'href="/digital-marketing-assets/assets/');
      txt = txt.replaceAll('data-src="assets/', 'data-src="/digital-marketing-assets/assets/');
      txt = txt.replaceAll("'assets/", "'/digital-marketing-assets/assets/");
      txt = txt.replaceAll('"assets/', '"/digital-marketing-assets/assets/');
      // throttle garden mist for accessibility (keep visuals, reduce layout thrash)
      txt = txt.replace("if (now - lastSpray > 120)", "if (now - lastSpray > 800)");
      // inline execution to satisfy CSP (blob: blocked in dev, 'unsafe-inline' allowed)
      const s = document.createElement("script");
      s.textContent = txt;
      s.dataset.zk = "site-patched";
      document.body.appendChild(s);
      (window as any).__zkSitePatched = true;
    };

    let cancelled = false;
    const run = async () => {
      // defer heavy engines to idle so first paint is instant + accessible
      const idle = (cb: () => void) =>
        (window as any).requestIdleCallback ? (window as any).requestIdleCallback(cb, { timeout: 800 }) : setTimeout(cb, 80);
      await new Promise<void>((r) => idle(r));
      if (cancelled) return;
      try {
        if (!(window as any).Scroll) await loadScript("/digital-marketing-assets/js/core/scroll.js");
        // mobile gate — keep cs-static accurate before home.js reads it
        try {
          if (window.innerWidth <= 820) document.documentElement.classList.add("cs-static");
        } catch {}
        await loadScript("/digital-marketing-assets/js/pages/home.js");
        await loadPatchedSite();
        // gallery/warp are only needed if tiles scroll into view — load lazily
        idle(() => {
          loadScript("/digital-marketing-assets/js/components/gallery.js").catch(() => {});
          loadScript("/digital-marketing-assets/js/components/warp-hero.js").catch(() => {});
          loadScript("/digital-marketing-assets/js/components/warp-phone.js").catch(() => {});
        });
        if (cancelled) return;

        // ONE-TIME footer identity fix (no MutationObserver spam)
        const footer = scope.querySelector(".footer") as HTMLElement | null;
        if (footer) {
          const c = footer.querySelector(".ft-credit");
          if (c) c.textContent = "Crafted by ZeroSlash Agency \u00B7 India @2026";
          footer.querySelectorAll(".ft-social a").forEach((a: any) => {
            const t = (a.textContent || "").trim();
            if (t.includes("LinkedIn")) a.href = "https://www.linkedin.com/company/zeroslash";
            else if (t.includes("GitHub")) { a.textContent = "Website"; a.href = "https://zeroslash.in"; }
            else if (t.includes("Behance")) { a.textContent = "Contact"; a.href = "/contact"; }
          });
          // if land still missing (race), force correct src once
          const land = footer.querySelector(".ft-land") as HTMLImageElement | null;
          if (land) {
            const s = land.getAttribute("src") || "";
            if (s === "assets/footer-land.png" || s === "/assets/footer-land.png" || s.includes("/assets/footer-land.png")) {
              land.src = "/digital-marketing-assets/assets/footer-land.png";
            }
          }
        }
        // contact drawer emails (ensure ZeroSlash contact)
        document.querySelectorAll("#contact-drawer, .contact-drawer").forEach((d: any) => {
          d.querySelectorAll("a[href^='mailto:']").forEach((a: any) => {
            if (a.href.includes("hello@zeroslash")) { a.textContent = "hello@zeroslash.in"; }
          });
        });

        (window as any).Scroll?.kick?.();
        window.dispatchEvent(new Event("resize"));
        // ensure reveals are visible if IO missed due to deferred load
        requestAnimationFrame(() => {
          scope.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.9 && r.bottom > 0) el.classList.add("is-visible");
          });
        });
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.warn("[zk] clean load failed", e);
      }
    };
    run();
    return () => {
      cancelled = true;
      bodyObs.disconnect();
    };
  }, []);
  return <div ref={scopeRef} id="zk-scope" dangerouslySetInnerHTML={{ __html: zkHtml }} suppressHydrationWarning />;
}
