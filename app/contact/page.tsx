"use client"

import { motion } from "motion/react"
import ContactShowcase from "@/components/ContactShowcase"

export default function ContactPage() {
  return (
    <div className="relative bg-background text-foreground overflow-hidden">
      {/* Ambient background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.6] dark:opacity-[0.9]" style={{
        background:
          "radial-gradient(40% 40% at 20% 10%, rgba(183,255,99,0.10), transparent 60%), radial-gradient(40% 40% at 80% 20%, rgba(255,122,182,0.08), transparent 60%)"
      }} />
      <section className="relative container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-12 text-center">
        <motion.div className="flex items-center justify-center" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <span
            className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest ring-1 ring-border/60 bg-foreground/5"
          >
            {/* pulsing status dot */}
            <span className="relative inline-block h-2 w-2">
              <motion.span
                className="absolute inset-0 rounded-full bg-green-500"
                animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.7, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-[-6px] rounded-full bg-green-400/30"
                animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.15, 0.0, 0.15] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.1 }}
              />
            </span>
            Available for collabs
          </span>
        </motion.div>
        <motion.h1 className="text-4xl md:text-6xl font-black mt-5 mb-3 tracking-tight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Let’s Talk</span>
        </motion.h1>
        <motion.p className="text-foreground/70 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Tell me what you’re building. I’ll respond within 24 hours with next steps.
        </motion.p>
      </section>
      {/* Contact showcase with separated, animated cards */}
      <ContactShowcase />
      {/** Form removed per request **/}
    </div>
  )
}


