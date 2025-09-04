"use client"

import React from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/dialog"

/**
 * StartProjectModal
 *
 * Usage:
 * <StartProjectModal>
 *   <button>Start Your Project</button>
 * </StartProjectModal>
 *
 * The child becomes the trigger via Radix `asChild`.
 */
export default function StartProjectModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Trigger element provided by caller */}
        {children}
      </DialogTrigger>
      <DialogContent className="bg-black text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Start Your Project</DialogTitle>
          <DialogDescription className="text-white/70">
            Tell us a bit about your project. We usually respond within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-3">
          <a
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors"
          >
            Go to Contact Page
          </a>
          <a
            href="mailto:hello@zeroslash.in?subject=Project%20Inquiry%20from%20About%20Page&body=Hi%20ZeroSlash%20Team%2C%0A%0AMy%20Name%3A%20%5BYour%20Name%5D%0ACompany%3A%20%5BCompany%20Name%5D%0APhone%3A%20%5BYour%20Phone%5D%0APreferred%20Start%20Date%3A%20%5BDate%5D%0AProject%20Details%3A%20%5BBrief%20Summary%5D%0A%0AThanks!"
            className="inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold border border-white/15 text-white hover:bg-white/10 transition-colors"
          >
            Email Us Directly
          </a>
          <p className="text-xs text-white/50 text-center">Prefer WhatsApp? Mention it in your message and we’ll follow up there.</p>
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
