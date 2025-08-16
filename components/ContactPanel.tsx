"use client"

import React from "react"

type ContactPanelProps = {
  open: boolean
  onClose: () => void
}

export default function ContactPanel({ open, onClose }: ContactPanelProps) {
  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  return (
    <div
      aria-hidden={!open}
      aria-modal={open}
      role="dialog"
      data-contact-panel
      className={[
        "fixed inset-0 z-[60] text-black overflow-y-auto overscroll-contain",
        // Unified color across light and dark
        "bg-[#D7FF9A]",
        "transition-[clip-path] duration-500 ease-out will-change-[clip-path]",
        // Radial reveal (water wave) from bottom-right
        open
          ? "pointer-events-auto"
          : "pointer-events-none",
      ].join(" ")}
      style={{
        // Use a large circle when open, tiny when closed, anchored at bottom-right (100% 100%)
        clipPath: open ? "circle(150% at 100% 100%)" : "circle(0% at 100% 100%)",
      }}
    >
      <button
        aria-label="Close contact panel"
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-[61] w-10 h-10 rounded-full text-black flex items-center justify-center bg-black/10 border border-black/20 transition-colors hover:bg-black/20 hover:opacity-100 focus:outline-none"
      >
        <span className="text-xl leading-none">×</span>
      </button>

      <div
        className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-24 md:pb-10 min-h-screen"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Left intro */}
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-black text-white rounded-md text-xs font-bold tracking-wide mb-4">
              CONTACT
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-black">
              LET&rsquo;S WORK TOGETHER
            </h1>
            <p className="text-lg md:text-xl text-black/80 max-w-xl mb-8">
              Are you looking for a digital partner to help with your strategy, UX, web presence, or marketing? Let&rsquo;s start a conversation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-sm text-black">
              <div>
                <div className="font-bold mb-1">GIVE US A CALL</div>
                <a href="tel:+919500255291" className="text-black underline hover:no-underline">+91 95002 55291</a>
              </div>
              <div>
                <div className="font-bold mb-1">SEND US AN EMAIL</div>
                <a href="mailto:zeroslashx1@gmail.com" className="text-black underline hover:no-underline">zeroslashx1@gmail.com</a>
              </div>
              <div>
                <div className="font-bold mb-1">JOIN US</div>
                <a href="#" className="text-black underline hover:no-underline">See Vacancies</a>
              </div>
            </div>

            <div className="flex gap-3">
              {[
                { label: "Facebook", href: "#" },
                { label: "X", href: "#" },
                { label: "Instagram", href: "#" },
                { label: "LinkedIn", href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border-2 border-black/60 text-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xs font-bold"
                >
                  {s.label[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Right form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setStatus({ type: null, message: '' })
              const form = e.currentTarget as HTMLFormElement
              const fullName = (form.querySelector('#fullName') as HTMLInputElement)?.value?.trim() || ""
              const email = (form.querySelector('#email') as HTMLInputElement)?.value?.trim() || ""
              const phone = (form.querySelector('#phone') as HTMLInputElement)?.value?.trim() || ""
              const source = (form.querySelector('#source') as HTMLSelectElement)?.value || ""
              const message = (form.querySelector('#message') as HTMLTextAreaElement)?.value?.trim() || ""
              const subscribe = (form.querySelector('#subscribe') as HTMLInputElement)?.checked || false

              setSubmitting(true)
              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fullName, email, phone, source, message, subscribe }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok || data?.ok === false) {
                  const errMsg = data?.error || data?.detail || `Request failed (${res.status})`
                  setStatus({ type: 'error', message: String(errMsg) })
                  return
                }
                setStatus({ type: 'success', message: 'Message sent successfully!' })
                form.reset()
              } catch (err) {
                setStatus({ type: 'error', message: String(err) })
              } finally {
                setSubmitting(false)
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-black" htmlFor="fullName">Full Name</label>
              <input id="fullName" className="h-11 rounded-md border-2 border-black/30 bg-white/50 backdrop-blur-[2px] px-3 outline-none text-black placeholder:text-black/50 focus-visible:border-black/60 focus-visible:ring-black/20 focus-visible:ring-[3px]" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-black" htmlFor="email">Email Address</label>
              <input id="email" type="email" className="h-11 rounded-md border-2 border-black/30 bg-white/50 backdrop-blur-[2px] px-3 outline-none text-black placeholder:text-black/50 focus-visible:border-black/60 focus-visible:ring-black/20 focus-visible:ring-[3px]" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-black" htmlFor="phone">Phone Number (Optional)</label>
              <input id="phone" className="h-11 rounded-md border-2 border-black/30 bg-white/50 backdrop-blur-[2px] px-3 outline-none text-black placeholder:text-black/50 focus-visible:border-black/60 focus-visible:ring-black/20 focus-visible:ring-[3px]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-black" htmlFor="source">How did you hear about us?</label>
              <select id="source" className="h-11 rounded-md border-2 border-black/30 bg-white/50 backdrop-blur-[2px] px-3 outline-none text-black focus-visible:border-black/60 focus-visible:ring-black/20 focus-visible:ring-[3px]">
                <option value="">Please Select</option>
                <option>Search</option>
                <option>Social</option>
                <option>Referral</option>
                <option>Other</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-sm font-bold text-black" htmlFor="message">How can we help?</label>
              <textarea id="message" rows={5} className="rounded-md border-2 border-black/30 bg-white/50 backdrop-blur-[2px] px-3 py-2 outline-none text-black placeholder:text-black/50 focus-visible:border-black/60 focus-visible:ring-black/20 focus-visible:ring-[3px]" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 text-black">
              <input id="subscribe" type="checkbox" className="w-4 h-4 border-2 border-black/60 text-black" />
              <label htmlFor="subscribe" className="text-sm">Subscribe for the latest news and insights delivered to your inbox</label>
            </div>
            <div className="sm:col-span-2 mt-2">
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-black text-white font-bold tracking-wide shadow-md hover:bg-black/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'SENDING…' : 'SEND MESSAGE'}
              </button>
              {status.type && (
                <p className={`mt-2 text-sm ${status.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Reduced motion: disable fancy reveal */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          div[role='dialog'] { transition: none !important; clip-path: none !important; }
        }
      `}</style>
    </div>
  )
}
