"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Link from "next/link"

function GlowDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(40% 60% at 50% 50%, rgba(183,255,99,0.35), rgba(183,255,99,0.0) 60%)",
          filter: "blur(18px)",
        }}
      />
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </div>
  )
}

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      className="group relative rounded-2xl ring-1 ring-border/70 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 p-5 md:p-6 shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "radial-gradient(600px 250px at 100% 0%, rgba(183,255,99,0.18), transparent 60%), radial-gradient(600px 250px at 0% 100%, rgba(255,122,182,0.16), transparent 60%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {}
      }}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 transition"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90">
        <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export default function ContactShowcase() {
  return (
    <section className="container mx-auto px-4 md:px-6 pb-20">
      {/* Section header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black tracking-tight"
        >
          Connect with {" "}
          <span className="relative inline-block align-baseline">
            <span className="text-foreground">
              ZeroSlash
            </span>
            <span
              aria-hidden
              className="absolute left-0 right-0 -bottom-1 h-1.5 rounded-full opacity-50"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(234,179,8,0.28), rgba(234,179,8,0))", // amber-400 glow
                filter: "blur(6px)",
              }}
            />
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-foreground/70 mt-1"
        >
          Choose how you want to reach out. I respond fast.
        </motion.p>
      </div>

      <GlowDivider className="mb-8" />

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Email */}
        <Card delay={0.05}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 ring-1 ring-border/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2"/></svg>
                </span>
                Email
              </div>
              <CopyButton value="zeroslashx1@gmail.com" />
            </div>
            <div className="mt-4 text-lg font-semibold tracking-tight">zeroslashx1@gmail.com</div>
            <p className="text-sm text-foreground/70 mt-1">Preferred for briefs, proposals, and attachments.</p>
          </div>
        </Card>

        {/* LinkedIn */}
        <Card delay={0.12}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 ring-1 ring-border/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9h3v9H6zM7.5 6.5A1.5 1.5 0 1 0 7.5 3a1.5 1.5 0 0 0 0 3.5zM10 9h3v1.5c.6-1 1.7-1.7 3-1.7 3 0 3.5 2 3.5 4.6V18h-3v-4c0-1-.1-2.4-1.6-2.4-1.6 0-1.9 1.1-1.9 2.3V18h-3z" fill="currentColor"/></svg>
                </span>
                LinkedIn
              </div>
              <Link
                href="https://www.linkedin.com/in/mubarak-a-xyz/"
                target="_blank"
                className="inline-flex items-center gap-1 h-10 px-4 rounded-full ring-1 ring-border/70 bg-background hover:bg-foreground/5 text-sm font-medium transition"
              >
                Open
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 3h7v7" stroke="currentColor" strokeWidth="2"/><path d="M10 14L21 3" stroke="currentColor" strokeWidth="2"/><path d="M10 3H3v18h18v-7" stroke="currentColor" strokeWidth="2"/></svg>
              </Link>
            </div>
            <div className="mt-4 text-lg font-semibold tracking-tight">@mubarak-a-xyz</div>
            <p className="text-sm text-foreground/70 mt-1">Connect for collabs, updates, and quick DMs.</p>
          </div>
        </Card>

        {/* Phone */}
        <Card delay={0.2}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 ring-1 ring-border/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2L8 9a16 16 0 0 0 6 6l+.8-1.1a2 2 0 0 1 2-.6c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="2"/></svg>
                </span>
                Phone
              </div>
              <a
                href="tel:+919500255291"
                className="inline-flex items-center gap-1 h-10 px-4 rounded-full ring-1 ring-border/70 bg-background hover:bg-foreground/5 text-sm font-medium transition"
              >
                Call
              </a>
            </div>
            <div className="mt-4 text-lg font-semibold tracking-tight">+91 9500255291</div>
            <p className="text-sm text-foreground/70 mt-1">Best for urgent or time-sensitive projects.</p>
          </div>
        </Card>
      </div>

      <GlowDivider className="my-8" />

      {/* Social chips */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-6xl mx-auto"
      >
        {/* soft background aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 -top-2 -bottom-2 opacity-70"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 50%, rgba(183,255,99,0.18), rgba(183,255,99,0.0) 60%)",
            filter: "blur(18px)",
          }}
        />
        <div className="relative flex flex-wrap items-center gap-4 md:gap-5 justify-center">
          {[
            { label: "Portfolio", href: "https://portfoliox1-sooty.vercel.app/", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 3h7v7" stroke="currentColor" strokeWidth="2"/><path d="M10 14L21 3" stroke="currentColor" strokeWidth="2"/><path d="M10 3H3v18h18v-7" stroke="currentColor" strokeWidth="2"/></svg>
            ) },
            { label: "Instagram", href: "https://instagram.com/zeroslashx1", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
            ) },
            { label: "GitHub", href: "https://github.com/zeroslashx1", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.6-4-1.6-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.6 1.1 1.6 1.1 1 .1.8 2.2 3.5 1.6.1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.3c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.4 11.4 0 0 1 6.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.6.2 2.9.1 3.2a4.7 4.7 0 0 1 1.2 3.3c0 4.7-2.8 5.7-5.5 6 .4.3.8 1 .8 2v3c0 .3.2.6.8.5A12 12 0 0 0 12 .5Z"/></svg>
            ) },
            { label: "X", href: "https://x.com/zeroslashx1", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2H21l-6.5 7.5L22 22h-6.8l-4.4-5.7L5.7 22H3l7-8.1L2 2h6.9l4 5.3L18.2 2Zm-2.4 18h1.9L8.4 4H6.5l9.3 16Z"/></svg>
            ) },
          ].map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              className="group relative inline-flex items-center gap-3 rounded-full h-14 px-7 md:h-14 md:px-8 text-lg ring-1 ring-border/70 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 hover:ring-foreground/30"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-foreground/80">
                {s.icon}
              </span>
              <span className="font-semibold">{s.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100"><path d="M14 3h7v7" stroke="currentColor" strokeWidth="2"/><path d="M10 14L21 3" stroke="currentColor" strokeWidth="2"/><path d="M10 3H3v18h18v-7" stroke="currentColor" strokeWidth="2"/></svg>
              {/* subtle gradient edge */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0))",
                  opacity: 0.7,
                }}
              />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <div className="mt-10">
        <Card>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-lg md:text-xl font-semibold tracking-tight">Have a brief? Let’s make it real.</div>
              <p className="text-sm text-foreground/70">Send a short overview and I’ll reply within 24 hours.</p>
            </div>
            <a
              href="mailto:zeroslashx1@gmail.com?subject=Project%20Brief"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-foreground text-background font-semibold shadow hover:opacity-90"
            >
              Email your brief
            </a>
          </div>
        </Card>
      </div>
    </section>
  )
}
