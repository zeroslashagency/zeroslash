"use client"

import { ScrollFloat } from "@/ui/scroll-float"
import SectionPill from "@/components/SectionPill"
import ShineBorder from "@/components/magicui/shine-border"

export default function ServicesSection() {
  return (
    <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="mb-4">
              <SectionPill label="What we do" dotClassName="bg-pink-400" shiny />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              Premium services that grow your brand
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <ScrollFloat delay={0.05}>
              <div className="group relative overflow-hidden box-card hover-sheen text-left anim-tilt p-6 md:p-8 bg-card border border-border">
                <ShineBorder className="sb-animate opacity-20" shineColor="hsl(var(--foreground))" borderWidth={1} />
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-foreground text-background anim-float glow-ambient shadow-lg shadow-foreground/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current md:w-6 md:h-6">
                    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">Website Types</h3>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  We build conversion-focused websites that are fast, scalable, and tailored to your business goals.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Portfolio Sites",
                    "Business Websites",
                    "E-commerce Stores",
                    "Landing Pages",
                    "SaaS Platforms",
                    "Blogs & Content Hubs",
                  ].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full px-3 h-8 text-sm bg-foreground/5 ring-1 ring-border/60 text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollFloat>

            <ScrollFloat delay={0.1}>
              <div className="group relative overflow-hidden box-card hover-sheen text-left anim-tilt p-6 md:p-8 bg-card border border-border">
                <ShineBorder className="sb-animate opacity-20" shineColor="hsl(var(--foreground))" borderWidth={1} />
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-foreground text-background anim-float glow-ambient shadow-lg shadow-foreground/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current md:w-6 md:h-6">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" ry="1" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">Maintenance & Hosting</h3>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  Keep your site secure, fast, and worry-free with our ZeroSlash Care Plans.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Managed Hosting",
                    "Proactive Updates",
                    "Security & Backups",
                    "Performance Monitoring",
                    "Long-term Support",
                  ].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full px-3 h-8 text-sm bg-foreground/5 ring-1 ring-border/60 text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollFloat>

            <ScrollFloat delay={0.15}>
              <div className="group relative overflow-hidden box-card hover-sheen text-left anim-tilt p-6 md:p-8 bg-card border border-border">
                <ShineBorder className="sb-animate opacity-20" shineColor="hsl(var(--foreground))" borderWidth={1} />
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-foreground text-background anim-float glow-ambient shadow-lg shadow-foreground/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current md:w-6 md:h-6">
                    <path
                      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">Digital Marketing</h3>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  From clicks to conversions, we help you attract, retain, and scale with data-driven campaigns.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "SEO & Organic Growth",
                    "Content Strategy",
                    "Email Marketing",
                    "Paid Social Ads",
                    "Analytics & Funnels",
                  ].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full px-3 h-8 text-sm bg-foreground/5 ring-1 ring-border/60 text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollFloat>
          </div>
        </div>
      </div>
    </section>
  )
}


