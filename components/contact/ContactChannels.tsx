"use client"

import { ArrowUpRight, Instagram, Linkedin, Mail, Phone } from "lucide-react"
import { CONTACT, SOCIAL } from "@/lib/site"
import { track } from "@/lib/gtag"

const handle = (url: string) => `@${url.replace(/\/+$/, "").split("/").pop()}`

const CHANNELS = [
  {
    label: "E-mail",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    event: "email_click",
    external: false,
    Icon: Mail,
  },
  {
    label: "Phone number",
    value: CONTACT.phoneDisplay,
    href: CONTACT.phoneHref,
    event: "phone_click",
    external: false,
    Icon: Phone,
  },
  {
    label: "Instagram",
    value: handle(SOCIAL.instagram),
    href: SOCIAL.instagram,
    event: "social_click",
    external: true,
    Icon: Instagram,
  },
  {
    label: "LinkedIn",
    value: handle(SOCIAL.linkedin),
    href: SOCIAL.linkedin,
    event: "linkedin_click",
    external: true,
    Icon: Linkedin,
  },
] as const

export default function ContactChannels() {
  return (
    <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 sm:gap-y-1">
      {CHANNELS.map((c) => (
        <li key={c.label}>
          <a
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={() => track(c.event, { network: c.label.toLowerCase(), location: "contact_channels" })}
            className="group flex items-center gap-4 py-4 outline-none transition-transform duration-200 active:scale-[0.99] focus-visible:ring-[3px] focus-visible:ring-foreground/15 motion-reduce:transition-none"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground transition-colors duration-200 group-hover:bg-foreground group-hover:text-background motion-reduce:transition-none"
            >
              <c.Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] text-foreground/50">{c.label}</span>
              <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                {c.value}
              </span>
            </span>
            <ArrowUpRight
              aria-hidden
              className="ml-auto h-4 w-4 shrink-0 text-foreground/30 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
            />
            {c.external ? <span className="sr-only">(opens in a new tab)</span> : null}
          </a>
        </li>
      ))}
    </ul>
  )
}
