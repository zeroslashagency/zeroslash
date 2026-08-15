"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProjectWizard from "@/components/ProjectWizard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/ui/sheet";
import { useState, useEffect } from "react";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { track } from "@/lib/gtag";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Digital Marketing", href: "/digital-marketing" },
  { label: "Contact", href: "/contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y > lastScrollY && y > 120) setIsVisible(false);
          else if (y < lastScrollY) setIsVisible(true);
          if (y < 10) setIsVisible(true);
          setLastScrollY(y);
          setIsScrolled(y > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${isScrolled ? "bg-[rgb(251,250,248)]/90 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.06)]" : "bg-[rgb(251,250,248)]/80 backdrop-blur-md border-b border-transparent"}`}
        style={{ willChange: "transform" }}
      >
        {/* top hairline accent */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-60" />

        <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8 h-[64px] md:h-[72px] flex items-center justify-between gap-4">
          {/* LEFT — Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex items-center gap-2.5">
              <Image src="/images/logo.svg" alt="ZeroSlash" width={28} height={28} className="h-[28px] w-[28px] block dark:hidden" />
              <Image src="/images/logo.svg" alt="ZeroSlash" width={28} height={28} className="h-[28px] w-[28px] hidden dark:block invert brightness-0" />
              <span className="hidden sm:inline-flex flex-col leading-none">
                <span className="text-[15px] font-bold tracking-[-0.02em] text-black dark:text-foreground">ZeroSlash</span>
                <span className="text-[10px] tracking-[0.16em] uppercase font-medium text-black/40 -mt-0.5">Agency</span>
              </span>
              <span className="sm:hidden text-[15px] font-bold tracking-[-0.02em] text-black dark:text-foreground">Zero / Agency</span>
            </div>
            <span className="hidden lg:inline-flex items-center gap-2 ml-3 pl-3 border-l border-black/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-pulse" />
              <span className="text-[11px] tracking-[0.14em] uppercase font-semibold text-black/50">Digital Marketing</span>
            </span>
          </Link>

          {/* CENTER — Pill nav (desktop) */}
          <nav className="hidden lg:flex items-center p-1 rounded-full bg-white border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04)]">
            {NAV.map((item) => {
              const isHome = item.label === "Home";
              const isDig = item.label === "Digital Marketing";
              const active = isHome ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => item.label === "Contact" && track("contact_nav_click", { location: "header_desktop" })}
                  className={`relative px-[14px] xl:px-[18px] py-[7px] rounded-full text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${
                    active
                      ? isDig
                        ? "bg-[#7C5CFF] text-white shadow-sm"
                        : "bg-black text-white shadow-sm"
                      : isDig
                        ? "text-[#7C5CFF] hover:bg-[#7C5CFF]/10 hover:text-[#6B4FE0]"
                        : "text-black/60 hover:text-black hover:bg-black/[0.04]"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isDig && <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] hidden xl:inline-block" style={active ? { background: "white" } : undefined} />}
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Theme */}
            <div className="hidden md:grid place-items-center w-9 h-9 rounded-full bg-white border border-black/10 shadow-sm">
              <AnimatedThemeToggler />
            </div>

            <button
              onClick={() => {
                track("get_started_click", { location: "header_desktop" });
                setWizardOpen(true);
              }}
              className="hidden md:inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full bg-black text-white text-[13px] font-semibold tracking-[-0.01em] hover:bg-black/90 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
            >
              Start a project
              <span className="w-7 h-7 rounded-full bg-white text-black grid place-items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* Mobile: theme + menu */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="grid place-items-center w-9 h-9 rounded-full bg-white border border-black/10 shadow-sm md:hidden">
                <AnimatedThemeToggler />
              </div>

              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label="Open menu"
                    className="w-9 h-9 rounded-full bg-black text-white grid place-items-center shadow-[0_4px_14px_rgba(0,0,0,0.12)] hover:bg-black/90 transition-colors"
                  >
                    <Menu className="w-[18px] h-[18px]" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[92vw] max-w-[380px] p-0 bg-[rgb(251,250,248)] border-l border-black/10 shadow-2xl flex flex-col overflow-hidden"
                >
                  <SheetHeader className="px-6 pt-6 pb-4 border-b border-black/5 shrink-0">
                    <div className="flex items-center justify-between">
                      <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                        <Image src="/images/logo.svg" alt="ZeroSlash" width={26} height={26} className="h-[26px] w-[26px]" />
                        <span className="text-[14px] font-bold tracking-[-0.02em] text-black">ZeroSlash Agency</span>
                      </Link>
                      <SheetClose asChild>
                        <button className="w-8 h-8 rounded-full bg-black text-white grid place-items-center">
                          <X className="w-4 h-4" />
                        </button>
                      </SheetClose>
                    </div>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                  </SheetHeader>

                  <nav className="flex-1 overflow-auto px-3 py-6 space-y-1">
                    {NAV.map((item, i) => {
                      const isDig = item.label === "Digital Marketing";
                      const final = item.label === "Home" ? pathname === "/" : pathname?.startsWith(item.href);
                      return (
                        <SheetClose asChild key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (item.label === "Contact") track("contact_nav_click", { location: "header_mobile" });
                              setMobileOpen(false);
                            }}
                            className={`group flex items-center justify-between px-4 py-4 rounded-2xl border transition-all ${final ? (isDig ? "bg-[#7C5CFF] text-white border-[#7C5CFF] shadow-lg" : "bg-black text-white border-black shadow-lg") : "bg-white border-black/5 text-black hover:border-black/10 hover:shadow-md"}`}
                          >
                            <div className="flex items-baseline gap-3">
                              <span className={`text-[11px] font-mono tracking-widest ${final ? "text-white/60" : "text-black/30"}`}>0{i + 1}</span>
                              <span className={`text-[19px] font-semibold tracking-[-0.02em] ${final ? "text-white" : isDig ? "text-[#7C5CFF]" : "text-black"}`}>
                                {item.label}
                              </span>
                              {isDig && !final && <span className="ml-1 px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#7C5CFF] text-[10px] font-bold tracking-wide uppercase">Popular</span>}
                            </div>
                            <span className={`w-8 h-8 rounded-full grid place-items-center border transition-colors ${final ? "bg-white text-black border-white" : "bg-black text-white border-black group-hover:bg-black group-hover:text-white"}`}>
                              <ArrowUpRight className="w-4 h-4" />
                            </span>
                          </Link>
                        </SheetClose>
                      );
                    })}

                    <div className="pt-6 mt-6 border-t border-black/5 space-y-3">
                      <div className="px-4 py-3 rounded-2xl bg-white border border-black/5">
                        <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-black/40 mb-1">Get in touch</p>
                        <a href="mailto:hello@zeroslash.in" className="text-[14px] font-medium text-black">hello@zeroslash.in</a>
                        <p className="text-[12px] text-black/50 mt-1">Chennai • Available worldwide</p>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <a href="https://linkedin.com" target="_blank" rel="noopener" className="text-[11px] font-bold tracking-[0.08em] uppercase text-black/60 hover:text-black">LinkedIn</a>
                        <span className="text-black/20">/</span>
                        <a href="https://instagram.com" target="_blank" rel="noopener" className="text-[11px] font-bold tracking-[0.08em] uppercase text-black/60 hover:text-black">Instagram</a>
                        <span className="ml-auto text-[11px] font-bold bg-black text-white px-2 py-1 rounded-md">EN</span>
                      </div>
                    </div>
                  </nav>

                  <div className="p-4 border-t border-black/5 bg-white/50 backdrop-blur shrink-0">
                    <button
                      onClick={() => {
                        track("get_started_click", { location: "header_mobile" });
                        setMobileOpen(false);
                        setWizardOpen(true);
                      }}
                      className="w-full inline-flex items-center justify-between pl-5 pr-1.5 py-1.5 rounded-full bg-black text-white text-[14px] font-semibold"
                    >
                      Start a project
                      <span className="w-9 h-9 rounded-full bg-white text-black grid place-items-center">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </>
  );
}
