"use client"

import { useRef, useState } from "react"
import { motion } from "motion/react"
import Link from "next/link"

const ACCENT_LIME = "#b7ff63"

export default function WaitlistPage() {
  const [bgScroll, setBgScroll] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background blob / glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 60% 20%, rgba(183,255,99,0.14), transparent 60%), radial-gradient(50% 50% at 40% 70%, rgba(255,122,182,0.10), transparent 60%), radial-gradient(45% 45% at 80% 50%, rgba(125,179,255,0.10), transparent 60%)",
          maskImage:
            "radial-gradient(80% 60% at 50% 40%, rgba(0,0,0,0.20), rgba(0,0,0,0.02))",
        }}
      />

      {/* Full-page background label scroller (static until submit) */}
      <motion.div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none select-none"
      >
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-0 text-center font-black uppercase text-foreground/10"
          style={{ letterSpacing: "-0.04em" }}
          animate={bgScroll ? { y: ["0%", "-50%"] } : { y: "0%" }}
          transition={{ duration: 30, repeat: bgScroll ? Infinity : 0, ease: "linear" }}
        >
          {/* Big repeated rows to cover viewport height */}
          <div className="leading-[0.88]">
            {Array.from({ length: 8 }).map((_, r) => (
              <div key={`row-top-${r}`} className="text-[18vw]">Waitlist</div>
            ))}
          </div>
          <div className="leading-[0.88]">
            {Array.from({ length: 8 }).map((_, r) => (
              <div key={`row-bot-${r}`} className="text-[18vw]">Waitlist</div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <main className="relative z-10 container mx-auto px-4 md:px-6 py-20 md:py-28">
        {/* Top badge */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest ring-1 ring-border/60 bg-foreground/5 backdrop-blur">
            <motion.span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: ACCENT_LIME, boxShadow: "0 0 0 0 rgba(183,255,99,0.7)" }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(183,255,99,0.7)",
                  "0 0 0 8px rgba(183,255,99,0)",
                  "0 0 0 0 rgba(183,255,99,0.7)",
                ],
                scale: [1, 1.15, 1],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            Waitlist
          </span>
        </div>

        {/* Coming soon */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 text-center text-5xl md:text-7xl font-black tracking-tight"
          style={{ textShadow: "0 6px 40px rgba(0,0,0,0.25)" }}
        >
          Coming soon!
        </motion.h1>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mx-auto mt-8 w-full max-w-2xl rounded-[28px] bg-card/80 backdrop-blur-xl ring-1 ring-border/60 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
        >
          <h2 className="text-center text-2xl md:text-3xl font-black">Join our waitlist!</h2>
          <p className="mt-2 text-center text-foreground/70 max-w-xl mx-auto">
            Sign up for our newsletter to receive the latest updates and insights straight to your inbox.
          </p>

          <form
            className="mt-6 flex flex-col sm:flex-row items-center gap-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              if (submitting) return
              const email = emailRef.current?.value?.trim() || ""
              if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email)) {
                setError("Please enter a valid email.")
                return
              }
              try {
                setSubmitting(true)
                const res = await fetch("/api/waitlist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok || !data?.ok) {
                  throw new Error(data?.error || "Failed to submit")
                }
                setSubmitted(true)
                setBgScroll(true)
                // bring the animated background into view
                scrollerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
              } catch (err: any) {
                setError(err?.message || "Something went wrong")
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <input
              ref={emailRef}
              type="email"
              required
              placeholder="Enter email"
              className="w-full flex-1 h-12 rounded-full px-5 bg-foreground/5 border border-border/60 text-foreground placeholder-foreground/40 outline-none focus:border-foreground/40"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 rounded-full font-semibold text-black dark:text-black disabled:opacity-70"
              style={{ backgroundColor: ACCENT_LIME, filter: "drop-shadow(0 0 16px rgba(183,255,99,0.35))", color: "#000", WebkitTextFillColor: "#000" }}
            >
              {submitting ? "Submitting…" : submitted ? "Thanks!" : "Join Waitlist"}
            </button>
          </form>

          {error && (
            <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Socials */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/in/mubarak-a-xyz/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="h-12 w-12 rounded-full ring-1 ring-border/60 bg-foreground/5 hover:bg-foreground/10 transition-colors flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
                <path d="M6 9h3v9H6zM7.5 6.5A1.5 1.5 0 1 0 7.5 3a1.5 1.5 0 0 0 0 3.5zM10 9h3v1.5c.6-1 1.7-1.7 3-1.7 3 0 3.5 2 3.5 4.6V18h-3v-4c0-1-.1-2.4-1.6-2.4-1.6 0-1.9 1.1-1.9 2.3V18h-3z" />
              </svg>
            </Link>

            {/* Email */}
            <a
              href="mailto:zeroslashx1@gmail.com"
              aria-label="Email"
              className="h-12 w-12 rounded-full ring-1 ring-border/60 bg-foreground/5 hover:bg-foreground/10 transition-colors flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="2" />
              </svg>
            </a>

            {/* Portfolio */}
            <Link
              href="https://portfoliox1-sooty.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Portfolio"
              className="h-12 w-12 rounded-full ring-1 ring-border/60 bg-foreground/5 hover:bg-foreground/10 transition-colors flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M14 3h7v7" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 3H3v18h18v-7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>

          {/* Footer mini */}
          <div className="mt-6 text-center text-xs text-foreground/60">
            9 ZeroSlash — Waitlist Template
            <span className="mx-2">•</span>
            <Link href="/" className="underline hover:text-foreground/80">Home</Link>
          </div>
        </motion.div>

        {/* Removed limited-height scroller; full-page scroller above */}
      </main>
    </div>
  )
}
