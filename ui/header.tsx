"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProjectWizard from "@/components/ProjectWizard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/ui/sheet";
import { useState, useEffect } from "react";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { track } from "@/lib/gtag";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Smooth hide/show logic
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide header
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up - show header
            setIsVisible(true);
          }
          
          // Always show at top
          if (currentScrollY < 10) {
            setIsVisible(true);
          }
          
          // Update scroll state
          setLastScrollY(currentScrollY);
          setIsScrolled(currentScrollY > 50);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // no modal

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out ${
      isVisible 
        ? 'translate-y-0 opacity-100' 
        : '-translate-y-full opacity-0'
    } ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg' 
        : 'bg-background/90 backdrop-blur-sm'
    }`} style={{
      transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out, backdrop-filter 0.3s ease-out',
      willChange: 'transform, opacity'
    }}>
      <div className={`container mx-auto px-4 md:px-6 flex items-center justify-between h-[70px] transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-2'
      }`}>
        <Link href="/" className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-200 ease-out">
          {/* Light mode logo */}
          <Image src="/images/zero-agency-logo.png" alt="ZeroSlash Agency Logo" width={150} height={32} className="h-8 w-auto block dark:hidden" />
          {/* Dark mode logo (force solid black) */}
          <Image src="/images/zero-agency-logo.png" alt="ZeroSlash Agency Logo" width={150} height={32} className="h-8 w-auto hidden dark:block invert brightness-0" />
          <span className="text-lg font-semibold text-foreground">Zero / Agency</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200">
            About
          </Link>
          <Link href="/services" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200">
            Services
          </Link>
          <Link href="/work" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200">
            Work
          </Link>
          <Link href="/waitlist" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200">Components</Link>
          <Link href="/waitlist" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200">Careers</Link>

          <Link href="/contact" onClick={() => track("contact_nav_click", { location: "header_desktop" })} className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200">
            Contact
          </Link>
          <Button onClick={() => { track("get_started_click", { location: "header_desktop" }); setWizardOpen(true); }} className="px-6 py-2 rounded-full font-medium bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all duration-200">
            Get Started
          </Button>
          {/* Theme toggle in header (desktop) */}
          <AnimatedThemeToggler />
        </nav>
        
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme toggle in header (mobile) */}
          <AnimatedThemeToggler />

          {/* Mobile navigation sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground rounded-full border border-border/60 bg-background/60 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-background/80 hover:border-border transition-all duration-200 focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                aria-label="Open menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <line x1="4" x2="20" y1="12" y2="12"/>
                  <line x1="4" x2="20" y1="6" y2="6"/>
                  <line x1="4" x2="20" y1="18" y2="18"/>
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] max-w-sm p-6 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl border-l border-border/70 shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
            >
              <SheetHeader>
                <SheetTitle className="text-xl font-semibold tracking-tight">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 grid gap-2 text-base">
                <Link href="/" className="group flex items-center justify-between rounded-2xl px-4 py-3 bg-card/0 hover:bg-card/60 border border-transparent hover:border-border/60 text-foreground/90 hover:text-foreground shadow-sm hover:shadow-md transition-all">
                  <span>Home</span>
                  <svg className="h-5 w-5 text-foreground/40 group-hover:text-foreground/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
                <Link href="/about" className="group flex items-center justify-between rounded-2xl px-4 py-3 bg-card/0 hover:bg-card/60 border border-transparent hover:border-border/60 text-foreground/90 hover:text-foreground shadow-sm hover:shadow-md transition-all">
                  <span>About</span>
                  <svg className="h-5 w-5 text-foreground/40 group-hover:text-foreground/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
                <Link href="/services" className="group flex items-center justify-between rounded-2xl px-4 py-3 bg-card/0 hover:bg-card/60 border border-transparent hover:border-border/60 text-foreground/90 hover:text-foreground shadow-sm hover:shadow-md transition-all">
                  <span>Services</span>
                  <svg className="h-5 w-5 text-foreground/40 group-hover:text-foreground/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
                <Link href="/work" className="group flex items-center justify-between rounded-2xl px-4 py-3 bg-card/0 hover:bg-card/60 border border-transparent hover:border-border/60 text-foreground/90 hover:text-foreground shadow-sm hover:shadow-md transition-all">
                  <span>Work</span>
                  <svg className="h-5 w-5 text-foreground/40 group-hover:text-foreground/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
                <Link href="/waitlist" className="group flex items-center justify-between rounded-2xl px-4 py-3 bg-card/0 hover:bg-card/60 border border-transparent hover:border-border/60 text-foreground/90 hover:text-foreground shadow-sm hover:shadow-md transition-all">
                  <span>Components</span>
                  <svg className="h-5 w-5 text-foreground/40 group-hover:text-foreground/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
                <Link href="/waitlist" className="group flex items-center justify-between rounded-2xl px-4 py-3 bg-card/0 hover:bg-card/60 border border-transparent hover:border-border/60 text-foreground/90 hover:text-foreground shadow-sm hover:shadow-md transition-all">
                  <span>Careers</span>
                  <svg className="h-5 w-5 text-foreground/40 group-hover:text-foreground/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
                <Link href="/contact" onClick={() => track("contact_nav_click", { location: "header_mobile" })} className="group flex items-center justify-between rounded-2xl px-4 py-3 bg-card/0 hover:bg-card/60 border border-transparent hover:border-border/60 text-foreground/90 hover:text-foreground shadow-sm hover:shadow-md transition-all">
                  <span>Contact</span>
                  <svg className="h-5 w-5 text-foreground/40 group-hover:text-foreground/70 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              </nav>
              <div className="mt-8 sticky bottom-4">
                <Button
                  onClick={() => { track("get_started_click", { location: "header_mobile" }); setWizardOpen(true) }}
                  className="w-full rounded-full font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/20"
                >
                  Get Started
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Waitlist Modal removed; using dedicated /waitlist page */}
      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </header>
  );
}
