"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import ProjectWizard from "@/components/ProjectWizard"
import { track } from "@/lib/gtag"

const ACCENT_LIME = "#b7ff63"
const ACCENT_PINK = "#ff7ab6"
const ACCENT_BLUE = "#7db3ff"

//

// Category-specific icon selector with subtle draw animation
function PointIcon({ title, color = "#111827" }: { title: string; color?: string }) {
  const common = {
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.9, ease: "easeInOut" },
  } as const

  // Choose icon based on title keywords
  const t = title.toLowerCase()
  if (t.includes('client') || t.includes('attract')) {
    // Magnet (Client Attraction)
    return (
      <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <motion.path d="M7 7h4v5a3 3 0 1 1-6 0V7h2v5a1 1 0 1 0 2 0V7Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" {...common} />
        <motion.path d="M13 7h4v5a3 3 0 1 1-6 0V7h2v5a1 1 0 1 0 2 0V7Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" {...common} transition={{...common.transition, delay: 0.08}} />
        <motion.path d="M6 3h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" {...common} transition={{...common.transition, delay: 0.16}} />
        <motion.path d="M13 3h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" {...common} transition={{...common.transition, delay: 0.24}} />
      </motion.svg>
    )
  }
  if (t.includes('gym')) {
    // Dumbbell (Gym Expertise)
    return (
      <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <motion.path d="M5 9v6M19 9v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" {...common} />
        <motion.path d="M7 8v8M17 8v8" stroke={color} strokeWidth={1.8} strokeLinecap="round" {...common} transition={{...common.transition, delay: 0.08}} />
        <motion.path d="M9 11h6M9 13h6" stroke={color} strokeWidth={1.8} strokeLinecap="round" {...common} transition={{...common.transition, delay: 0.16}} />
      </motion.svg>
    )
  }
  if (t.includes('flexible') || t.includes('solutions')) {
    // Layers (Flexible Solutions)
    return (
      <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <motion.path d="M12 4 21 9l-9 5L3 9l9-5Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...common} />
        <motion.path d="M21 13l-9 5-9-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...common} transition={{...common.transition, delay: 0.08}} />
        <motion.path d="M21 17l-9 5-9-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...common} transition={{...common.transition, delay: 0.16}} />
      </motion.svg>
    )
  }
  // Tailored for India (use location pin / target mark)
  return (
    <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <motion.path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...common} />
      <motion.circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={1.8} {...common} transition={{...common.transition, delay: 0.12}} />
    </motion.svg>
  )
}

// (AnimatedIcon removed - unused)

// (Service type removed - unused)

export default function ServicesPage() {
  const [wizardOpen, setWizardOpen] = useState(false)
  return (
    <div className="bg-[#0a0a0a] dark:bg-[#0a0a0a] bg-white text-white dark:text-white text-gray-900 min-h-screen">
      <section className="container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16">
        <div className="relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 px-3 py-1 text-xs tracking-wide text-neutral-700 dark:text-neutral-200 dark:border-neutral-800">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-500" />
              CAPABILITIES
            </div>

            <h1 className="mt-6 text-[42px] sm:text-[56px] md:text-[68px] font-black leading-tight tracking-[-0.02em] uppercase text-gray-900 dark:text-white">
              <span className="block">Services</span>
              <span className="block">We Offer</span>
            </h1>

            <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              At ZeroSlash Agency, we craft conversion-driven websites, bold brand identities, and data-powered marketing strategies. Our focus is simple: build digital solutions that look exceptional and perform even better.
            </p>
          </div>
        </div>
      </section>
      {/* Project Wizard Modal */}
      <ProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <MinimalOurServicesSection />
      <AddOns />
      <WhyZeroSlash />
      <ContactBar onOpenWizard={() => setWizardOpen(true)} />
      <CTABanner onOpenWizard={() => setWizardOpen(true)} />
    </div>
  )
}

// (Chip3D removed - unused)

// iPhone demo removed per request

// Minimal, clean, white-background Our Services Section (4 cards)
function MinimalOurServicesSection() {
  const items = [
    { key: 'web',  title: 'Web Design',          desc: 'Clean, responsive websites that convert.',      color: '#22c55e', letter: 'W' },
    { key: 'mkt',  title: 'Marketing',           desc: 'Growth-focused campaigns and content.',        color: '#ec4899', letter: 'M' },
    { key: 'biz',  title: 'Business Strategy',   desc: 'Roadmaps, analysis, and support.',            color: '#60a5fa', letter: 'B' },
    { key: 'adv',  title: 'Advanced Solutions',  desc: 'SaaS builds and security.',                   color: '#a78bfa', letter: 'A' },
  ]

  const GOLD = '#FFD700'
  const [active, setActive] = useState<string>('web')

  // Compose hex with alpha for subtle per-card tints
  const alpha = (hex: string, a: number) => {
    const h = hex.replace('#', '')
    const r = h.slice(0, 2)
    const g = h.slice(2, 4)
    const b = h.slice(4, 6)
    const al = Math.round(a * 255).toString(16).padStart(2, '0')
    return `#${r}${g}${b}${al}`
  }

  return (
    <section className="relative py-16 md:py-20 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">        
        <div className="absolute inset-x-0 top-0 h-48 opacity-70 dark:opacity-60"
             style={{background: `linear-gradient(180deg, ${GOLD}22, transparent)`}}/>
        <div className="absolute inset-0">
          {Array.from({length: 40}).map((_,i)=> (
            <motion.span key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${(i*137)%100}%`,
                top: `${(i*89)%100}%`,
                background: `radial-gradient(circle, ${GOLD}, transparent)`
              }}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.15, 0.6, 0.15] }}
              transition={{ duration: 3 + (i%5)*0.4, repeat: Infinity, delay: i*0.07 }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Our Services</h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-200">Premium solutions with a minimal, modern touch.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x border-t border-b border-neutral-200 dark:border-neutral-800 divide-neutral-200 dark:divide-neutral-800">
          {items.map((it, i) => (
            <motion.div
              key={it.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
              onMouseEnter={() => setActive(it.key)}
              onFocus={() => setActive(it.key)}
              role="button"
              aria-pressed={active === it.key}
              tabIndex={0}
              className={"group relative min-h-[420px] px-6 md:px-8 py-12 bg-transparent outline-none"}
              style={active === it.key ? { background: `linear-gradient(180deg, ${alpha(it.color, 0.10)}, transparent)` } : undefined}
            >
              <span aria-hidden className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
                <span className={`leading-none tracking-tight translate-y-2 transition-transform duration-300 ${
                  active === it.key ? 'scale-[1.04]' : 'scale-100'
                } text-[128px] md:text-[160px] lg:text-[180px] text-gray-900/5 dark:text-white/5`}>
                  {it.letter}
                </span>
              </span>

              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold shadow-sm" style={{backgroundColor: it.color, boxShadow: active===it.key? `0 0 0 6px ${alpha(it.color, 0.18)}`:''}}>
                  {it.letter}
                </span>
                <span className={`h-px w-10 transition-colors ${active===it.key? '' : 'bg-neutral-300 dark:bg-neutral-700'}`} style={active===it.key? { backgroundColor: alpha(it.color, 0.7) } : undefined}/>
              </div>

              <div className="relative mt-6">
                <h3 className={`text-4xl md:text-5xl leading-tight tracking-[-0.01em] ${active===it.key? 'font-extrabold text-gray-900 dark:text-white' : 'font-bold text-gray-900 dark:text-gray-100'}`}>
                  {it.title}
                </h3>
                <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md">
                  {it.desc}
                </p>
              </div>

              {it.key !== 'web' && (
                <div className="absolute left-6 md:left-8 bottom-6 flex items-end gap-4">
                  <Link
                    href="/waitlist"
                    onClick={() => track("services_read_more_click", { item_key: it.key, item_title: it.title, location: "services_our_services" })}
                    className="group/link inline-flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    <span className="underline decoration-transparent group-hover/link:decoration-current transition-colors">Read More</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover/link:translate-x-0.5">
                      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8}}
        >
            <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
              <div className="text-center mb-12">
                <motion.div
                  initial={{opacity: 0, y: 15}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.2, duration: 0.6}}
                  className="mb-8"
                >
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                    Web Design <span className="text-green-500">Excellence</span>
                  </h2>
                  <div className="w-24 h-1 bg-green-500 mx-auto rounded-full" />
                </motion.div>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-xl leading-relaxed"
                  initial={{opacity: 0, y: 15}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.4}}
                >
                  Crafting high-impact digital experiences that not only look stunning but drive measurable results.
                </motion.p>
              </div>

              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 overflow-visible">
                {[
                  { title: 'Visual Identity', desc: 'Cohesive, modern design systems that reflect your brand’s personality and values.' },
                  { title: 'Performance', desc: 'Lightning-fast, optimised websites engineered for speed, reliability, and SEO performance.' },
                  { title: 'User Experience', desc: 'Intuitive, conversion-focused interfaces that make it easy for users to engage and take action.' },
                  { title: 'Responsive Design', desc: 'Pixel-perfect layouts that adapt seamlessly across all devices, browsers, and platforms.' },
                ].map((item, i) => {
                  const tones = [
                    { bg: 'bg-black text-white dark:bg-black', ring: 'ring-white/10', arrow: '#ffffff', numBg: 'bg-white/10', numText: 'text-white' },
                    { bg: 'bg-gray-100 text-gray-900 dark:bg-[#141414] dark:text-white', ring: 'ring-black/5 dark:ring-white/10', arrow: '#0A0A0A', numBg: 'bg-black/5 dark:bg-white/10', numText: 'text-gray-900 dark:text-white' },
                    { bg: 'bg-[#f1f9ee] text-gray-900 dark:bg-[#0f1410] dark:text-white', ring: 'ring-green-600/10 dark:ring-green-500/10', arrow: '#16a34a', numBg: 'bg-green-500/10', numText: 'text-green-700 dark:text-green-300' },
                    { bg: 'bg-black text-white dark:bg-black', ring: 'ring-white/10', arrow: '#ffffff', numBg: 'bg-white/10', numText: 'text-white' },
                  ][i % 4]
                  const angles = [-10, 4, -6, 8]
                  const translates = ['-translate-y-1', 'translate-y-0', 'translate-y-1', '-translate-y-1']
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                      whileHover={{ y: -6 }}
                      className={`group relative rounded-[36px] p-0 transition-transform ${translates[i % 4]}`}
                      style={{ minHeight: 340 }}
                    >
                      <div
                        className={`absolute inset-0 rounded-[36px] ${tones.bg.split(' ').slice(0,1).join(' ')} ${tones.ring} ring-1 shadow-[0_16px_46px_rgba(0,0,0,0.10)]`}
                        style={{ transform: `rotate(${angles[i % 4]}deg)`, transformOrigin: 'center', willChange: 'transform' }}
                      />

                      <div
                        className={`relative z-10 h-full w-full p-6 md:p-7 ${tones.bg.split(' ').slice(1).join(' ')}`}
                        style={{ transform: `rotate(${angles[i % 4]}deg)`, transformOrigin: 'center' }}
                      >
                        <div className={`absolute top-4 left-4 ${tones.numBg} ${tones.numText} rounded-full h-8 w-8 grid place-items-center text-[12px] font-bold`}>{String(i+1).padStart(2,'0')}</div>
                        <svg className="absolute top-5 right-5" width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M7 17L17 7M11 7h6v6" stroke={tones.arrow} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <div className="mt-6">
                          <div className="text-xs uppercase tracking-[0.18em] opacity-70">Capability</div>
                          <h3 className="mt-2 text-xl md:text-2xl font-extrabold tracking-tight">{item.title}</h3>
                          <p className="mt-3 text-sm md:text-base opacity-80 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    )
}

// Add-ons Section with scroller
function AddOns() {
  const addons: { t: string; d: string; c: string }[] = [
    { t: "Website Maintenance Plan", d: "Monthly updates, backups, and performance monitoring.", c: ACCENT_LIME },
    { t: "SEO Essentials", d: "Technical fixes, on-page SEO, and baseline keyword tracking.", c: ACCENT_BLUE },
    { t: "Brand Identity Starter", d: "Logo refresh, color system, and typography setup.", c: ACCENT_PINK },
    { t: "Speed Optimisation", d: "Core Web Vitals improvements and image/CDN tuning.", c: ACCENT_LIME },
  ]

  return (
    <section className="relative container mx-auto px-4 md:px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-8 left-10 w-56 h-56 rounded-full blur-3xl opacity-30" style={{ background: `${ACCENT_LIME}33` }} />
        <div className="absolute bottom-0 right-10 w-64 h-64 rounded-full blur-3xl opacity-25" style={{ background: `${ACCENT_PINK}30` }} />
      </div>

      <div className="text-center mb-10">
        <h3 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Add-ons</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">Enhance your core package with focused upgrades.</p>
      </div>

      <AddOnsScroller addons={addons} />
    </section>
  )
}

function AddOnsScroller({ addons }: { addons: { t: string; d: string; c: string }[] }) {
  const [active, setActive] = useState<number>(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const btn = el.querySelectorAll<HTMLButtonElement>('button')[active]
    btn?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' })
  }, [active])

  async function submitAddon() {
    setSubmitting(true)
    setStatus({ type: null, message: '' })
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), addon: addons[active].t }
      const res = await fetch('/api/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.ok === false) {
        const msg = data?.error || data?.detail || `Request failed (${res.status})`
        setStatus({ type: 'error', message: String(msg) })
        return
      }
      setStatus({ type: 'success', message: 'Added to proposal. We will contact you shortly!' })
      setForm({ name: '', email: '', phone: '' })
      // Auto close after short delay
      setTimeout(() => { setModalOpen(false); setStatus({ type: null, message: '' }) }, 900)
    } catch (err) {
      setStatus({ type: 'error', message: String(err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        ref={listRef}
        role="tablist"
        className="flex gap-3 overflow-x-auto no-scrollbar py-2"
        aria-label="Add-on options"
      >
        {addons.map((a, i) => (
          <motion.button
            key={a.t}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            whileTap={{ scale: 0.97 }}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === i
                ? 'border-green-600 text-green-700 dark:text-green-300 bg-green-50/60 dark:bg-green-500/10'
                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-[#0e0e0e]'
            }`}
            style={{ boxShadow: active === i ? `0 0 0 1px ${a.c}55, 0 8px 30px ${a.c}25` : undefined }}
          >
            {a.t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-[#0b0b0e]/70 backdrop-blur-md p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{addons[active].t}</h4>
              <p className="mt-2 text-gray-600 dark:text-gray-200">{addons[active].d}</p>
            </div>
            <div className="shrink-0">
              <motion.button
                type="button"
                onClick={() => { setModalOpen(true); setStatus({ type: null, message: '' }); track("services_addon_add_to_proposal_click", { addon: addons[active].t }) }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Add to proposal</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative z-[71] w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0b0e] p-6 text-gray-900 dark:text-gray-100"
              initial={{ scale: 0.96, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-lg font-bold">Add to proposal</h5>
                <button onClick={() => setModalOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-70"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </button>
              </div>
              <p className="text-sm mb-4">Selected service: <span className="font-semibold">{addons[active].t}</span></p>
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <label htmlFor="addon-name" className="text-xs font-medium">Full Name</label>
                  <input id="addon-name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} className="h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f14] px-3 outline-none focus:ring-2 focus:ring-green-600/30" placeholder="Your name" />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="addon-email" className="text-xs font-medium">Email</label>
                  <input id="addon-email" type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} className="h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f14] px-3 outline-none focus:ring-2 focus:ring-green-600/30" placeholder="you@example.com" />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="addon-phone" className="text-xs font-medium">Phone (optional)</label>
                  <input id="addon-phone" value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} className="h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f14] px-3 outline-none focus:ring-2 focus:ring-green-600/30" placeholder="+91 ..." />
                </div>
                <button disabled={submitting} onClick={submitAddon} className="mt-2 inline-flex items-center justify-center h-10 rounded-full px-5 bg-black text-white dark:bg-white dark:text-black font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? 'Sending…' : 'Send'}
                </button>
                {status.type && (
                  <p className={`text-sm ${status.type==='success'?'text-green-700':'text-red-700'}`}>{status.message}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WhyZeroSlash() {
  return (
    <section className="relative container mx-auto px-4 md:px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-8 left-10 w-56 h-56 rounded-full blur-3xl opacity-30" style={{ background: `${ACCENT_LIME}33` }} />
        <div className="absolute bottom-0 right-10 w-64 h-64 rounded-full blur-3xl opacity-25" style={{ background: `${ACCENT_PINK}30` }} />
      </div>

      <div className="text-center mb-10">
        <h3 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">Why ZeroSlash Agency?</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">Premium delivery. Local understanding. Results that matter.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { t: "Tailored for India", d: "Focused on local businesses with competitive offerings.", c: ACCENT_LIME },
          { t: "Gym Niche Expertise", d: "Specialized weekly Instagram + web packages for gyms.", c: ACCENT_PINK },
          { t: "Flexible Solutions", d: "Tiered and combo options for any stage.", c: ACCENT_BLUE },
          { t: "Client Attraction", d: "Optimized for cold calls and promotions to generate leads.", c: ACCENT_LIME },
        ].map((p, i) => (
          <motion.div
            key={`${p.t}-${i}`}
            initial={false}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
            className="relative rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0b0b0e] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] will-change-transform"
          >
            <span aria-hidden className="absolute -inset-px rounded-2xl pointer-events-none" style={{ boxShadow: `0 0 0 1px ${p.c}40, 0 10px 30px ${p.c}25` }} />
            <div className="w-10 h-10 rounded-xl mb-4 grid place-items-center bg-white dark:bg-[#0f0f14] text-slate-900 dark:text-slate-100" style={{ boxShadow: `inset 0 0 0 1px ${p.c}55` }}>
              <PointIcon title={p.t} color="currentColor" />
            </div>
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{p.t}</h4>
            <p className="text-gray-600 dark:text-gray-200">{p.d}</p>
            <motion.span layoutId={`underline-${p.t}`} className="absolute left-6 right-6 bottom-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// Premium CTA Banner Component
function CTABanner({ onOpenWizard }: { onOpenWizard?: () => void }) {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a]" />
      
      <div className="absolute inset-0 opacity-30 dark:opacity-30 opacity-60">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_LIME, animationDelay: '0s' }} />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_PINK, animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_BLUE, animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_LIME, animationDelay: '3s' }} />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center">
          <motion.h2 
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="text-gray-900 dark:text-white">LET&rsquo;S CREATE</span>
            <br />
            <span 
              className="bg-gradient-to-r from-[#b7ff63] to-[#7db3ff] bg-clip-text text-transparent"
              style={{
                textShadow: `0 0 40px ${ACCENT_LIME}30`
              }}
            >
              SOMETHING AMAZING
            </span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.button
              type="button"
              onClick={() => { track("cta_click", { id: "work_with_us", location: "services_cta_banner" }); onOpenWizard?.() }}
              className="group relative px-12 py-4 text-lg font-bold text-black rounded-full overflow-hidden transition-all duration-300"
              style={{ backgroundColor: ACCENT_LIME }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: `0 0 30px ${ACCENT_LIME}60, 0 0 60px ${ACCENT_LIME}30`
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ 
                  scale: 1.5, 
                  opacity: [0, 0.3, 0],
                  transition: { duration: 0.6, ease: "easeOut" }
                }}
              />
              <span className="relative z-10 tracking-wide">
                WORK WITH US
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Contact Bar
function ContactBar({ onOpenWizard }: { onOpenWizard?: () => void }) {
  return (
    <section className="container mx-auto px-4 md:px-6 py-12">
      <div
        className="rounded-3xl overflow-hidden"
        style={{ boxShadow: `0 10px 40px ${ACCENT_LIME}25` }}
      >
        <div
          className="flex flex-col md:flex-row items-center md:items-stretch justify-between gap-8 p-8 md:p-12 dark:text-black"
          style={{ backgroundColor: ACCENT_LIME }}
        >
          <div className="flex-1 min-w-0">
            <h4
              className="text-3xl md:text-4xl font-black tracking-tight text-black dark:!text-black dark:[text-shadow:0_1px_0_rgba(0,0,0,0.35)] dark:[-webkit-text-stroke:0.35px_#000] dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]"
              style={{ color: '#000', WebkitTextFillColor: '#000', mixBlendMode: 'normal' }}
            >
              Let’s Discuss
              <br className="hidden md:block" />
              With Our Team
            </h4>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xs md:text-sm text-black/80 dark:text-black/80 max-w-xs">
              <div className="uppercase tracking-wide font-bold text-black/70 mb-1">Giving You The Best</div>
              <div>Get the best price and coverage for your needs. Quick proposal, fast kickoff.</div>
            </div>
            <button
              type="button"
              onClick={() => { track("cta_click", { id: "discuss_with_team", location: "services_contact_bar" }); onOpenWizard?.() }}
              className="shrink-0 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-black/80 bg-transparent text-black hover:translate-x-1 hover:-translate-y-1 transition-transform"
              aria-label="Discuss your project"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 text-[13px] text-foreground/60">Website: https://zeroslash.in/ · Email: hello@zeroslash.in · WhatsApp: +91 9500255291</div>
    </section>
  )
}

