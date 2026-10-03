"use client"

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { ArrowUpRight, Check } from "lucide-react"
import Honeypot from "@/components/Honeypot"
import { isEmail, isOptionalPhone } from "@/lib/validation"
import { CONTACT } from "@/lib/site"
import { track } from "@/lib/gtag"

type Field = "fullName" | "email" | "phone" | "message"
type Errors = Partial<Record<Field, string>>
type Status = "idle" | "sending" | "success" | "error"

type Values = {
  fullName: string
  email: string
  phone: string
  source: string
  message: string
  subscribe: boolean
}

const EMPTY: Values = { fullName: "", email: "", phone: "", source: "", message: "", subscribe: false }

const FIELD_ORDER: Field[] = ["fullName", "email", "phone", "message"]

// The API has no project-type field, so selections are prepended to `message`.
const SERVICES = ["Website", "Branding", "Digital marketing", "SEO", "Not sure yet"] as const

const SOURCES = ["Search", "Social", "Referral", "Other"] as const

const mono = { fontFamily: "var(--font-geist-mono)" }
const serif = { fontFamily: "var(--font-display-serif)" }

const inputBase =
  "block w-full rounded-lg border border-transparent bg-foreground/[0.05] px-3.5 text-[15px] text-foreground placeholder:text-foreground/35 transition-[border-color,background-color,box-shadow] duration-200 outline-none hover:bg-foreground/[0.07] focus-visible:border-foreground/40 focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-foreground/10 disabled:opacity-60 dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus-visible:bg-white/[0.04]"

const inputTone = (invalid: boolean) =>
  invalid ? "border-red-700/60 dark:border-red-400/60" : "border-transparent"

function validate(v: Values): Errors {
  const e: Errors = {}
  if (!v.fullName.trim()) e.fullName = "Please enter your name."
  if (!v.email.trim()) e.email = "Please enter your email."
  else if (!isEmail(v.email)) e.email = "That email address doesn’t look right."
  if (!isOptionalPhone(v.phone)) e.phone = "Use digits, spaces, and + ( ) - only."
  if (!v.message.trim()) e.message = "Tell us a little about the project."
  return e
}

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {hint ? (
          <span className="text-[11px] uppercase tracking-[0.14em] text-foreground/40" style={mono}>
            {hint}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] leading-snug text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [services, setServices] = useState<string[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>("idle")
  const [serverError, setServerError] = useState("")
  const [sentTo, setSentTo] = useState({ name: "", email: "" })

  const honeypotRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const fieldRefs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({})

  const sending = status === "sending"

  useEffect(() => {
    if (status === "success") successRef.current?.focus()
  }, [status])

  const update =
    (key: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value
      setValues((v) => ({ ...v, [key]: value }))
      if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

  const toggleService = (name: string) =>
    setServices((list) => (list.includes(name) ? list.filter((s) => s !== name) : [...list, name]))

  const focusFirst = (errs: Errors) => {
    const first = FIELD_ORDER.find((f) => errs[f])
    if (first) fieldRefs.current[first]?.focus()
    return Boolean(first)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return

    const errs = validate(values)
    setErrors(errs)
    if (focusFirst(errs)) {
      setStatus("idle")
      return
    }

    setStatus("sending")
    setServerError("")
    track("contact_form_submit", { services: services.join(",") || undefined, source: values.source || undefined })

    const body = values.message.trim()
    const message = services.length ? `Interested in: ${services.join(", ")}\n\n${body}` : body

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          source: values.source,
          message,
          subscribe: values.subscribe,
          website: honeypotRef.current?.value ?? "",
        }),
      })
      const data: { ok?: boolean; error?: string; fields?: Record<string, string | undefined> } | null = await res
        .json()
        .catch(() => null)

      if (res.ok && data?.ok) {
        setSentTo({ name: values.fullName.trim().split(/\s+/)[0] ?? "", email: values.email.trim() })
        setValues(EMPTY)
        setServices([])
        setStatus("success")
        track("contact_form_success")
        return
      }

      if (res.status === 400 && data?.fields) {
        const fieldErrs: Errors = {
          fullName: data.fields.fullName ? "Please enter your name." : undefined,
          email: data.fields.email ? "That email address doesn’t look right." : undefined,
          message: data.fields.message ? "Tell us a little about the project." : undefined,
        }
        setErrors(fieldErrs)
        focusFirst(fieldErrs)
      }

      setServerError(data?.error && res.status !== 400 ? data.error : "We couldn’t send your message. Please check the form and try again.")
      setStatus("error")
      track("contact_form_error", { status: res.status })
    } catch {
      setServerError("Network error. Check your connection and try again.")
      setStatus("error")
      track("contact_form_error", { status: 0 })
    }
  }

  const reset = () => {
    setStatus("idle")
    setErrors({})
    setServerError("")
  }

  const describedBy = (f: Field, hint?: string) =>
    [errors[f] ? `cf-${f}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined

  const liveText =
    status === "sending"
      ? "Sending your message."
      : status === "success"
        ? "Message sent. We’ll reply within 24 hours."
        : status === "error"
          ? serverError
          : ""

  return (
    <div className="relative">
      <p className="sr-only" role="status" aria-live="polite">
        {liveText}
      </p>

      {status === "success" ? (
        <div className="flex min-h-[520px] flex-col justify-between gap-10">
          <div>
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"
              aria-hidden
            >
              <Check className="h-5 w-5" strokeWidth={2} />
            </span>
            <h3
              ref={successRef}
              tabIndex={-1}
              className="mt-8 text-[34px] leading-[1.02] tracking-[-0.02em] font-bold text-foreground outline-none sm:text-[42px]"
              style={serif}
            >
              {sentTo.name ? `Thanks, ${sentTo.name}.` : "Thanks."}
              <br />
              Your brief is in.
            </h3>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-foreground/60">
              We’ll read it properly and reply to{" "}
              <span className="text-foreground">{sentTo.email}</span> within 24 hours with next steps.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center rounded-full border border-foreground/20 px-5 text-sm font-medium text-foreground transition-colors hover:border-foreground/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-foreground/15"
            >
              Send another message
            </button>
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex min-h-11 items-center text-sm text-foreground/60 underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-foreground/15 rounded-[2px]"
            >
              Or email {CONTACT.email}
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate aria-busy={sending} className="relative grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
          <Honeypot ref={honeypotRef} />

          <FieldShell id="cf-fullName" label="Name" error={errors.fullName}>
            <input
              ref={(el) => {
                fieldRefs.current.fullName = el
              }}
              id="cf-fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              maxLength={200}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={describedBy("fullName")}
              value={values.fullName}
              onChange={update("fullName")}
              disabled={sending}
              placeholder="Your full name"
              className={`${inputBase} ${inputTone(Boolean(errors.fullName))} h-12`}
            />
          </FieldShell>

          <FieldShell id="cf-email" label="Email" error={errors.email}>
            <input
              ref={(el) => {
                fieldRefs.current.email = el
              }}
              id="cf-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={320}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy("email")}
              value={values.email}
              onChange={update("email")}
              disabled={sending}
              placeholder="you@company.com"
              className={`${inputBase} ${inputTone(Boolean(errors.email))} h-12`}
            />
          </FieldShell>

          <FieldShell id="cf-phone" label="Phone" hint="Optional" error={errors.phone}>
            <input
              ref={(el) => {
                fieldRefs.current.phone = el
              }}
              id="cf-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={40}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy("phone")}
              value={values.phone}
              onChange={update("phone")}
              disabled={sending}
              placeholder="+91 00000 00000"
              className={`${inputBase} ${inputTone(Boolean(errors.phone))} h-12`}
            />
          </FieldShell>

          <FieldShell id="cf-source" label="How did you find us?" hint="Optional">
            <div className="relative">
              <select
                id="cf-source"
                name="source"
                value={values.source}
                onChange={update("source")}
                disabled={sending}
                className={`${inputBase} ${inputTone(false)} h-12 appearance-none pr-10 ${values.source ? "" : "text-foreground/45"}`}
              >
                <option value="">Select one</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className="pointer-events-none absolute right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-foreground/50"
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
          </FieldShell>

          <fieldset className="min-w-0 sm:col-span-2">
            <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-foreground">What do you need?</span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-foreground/40" style={mono}>
                Pick any
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => {
                const on = services.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleService(s)}
                    disabled={sending}
                    className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-foreground/15 disabled:opacity-60 ${
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/15 text-foreground/75 hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="sm:col-span-2">
            <FieldShell id="cf-message" label="Project details" error={errors.message}>
              <textarea
                ref={(el) => {
                  fieldRefs.current.message = el
                }}
                id="cf-message"
                name="message"
                rows={6}
                maxLength={4800}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={describedBy("message")}
                value={values.message}
                onChange={update("message")}
                disabled={sending}
                placeholder="What are you building, who is it for, and when do you want to launch?"
                className={`${inputBase} ${inputTone(Boolean(errors.message))} min-h-[160px] resize-y py-3 leading-relaxed`}
              />
            </FieldShell>
          </div>

          <label
            htmlFor="cf-subscribe"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground/65 sm:col-span-2"
          >
            <input
              id="cf-subscribe"
              name="subscribe"
              type="checkbox"
              checked={values.subscribe}
              onChange={update("subscribe")}
              disabled={sending}
              className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[3px] border border-foreground/30 accent-[var(--foreground)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-foreground/15"
            />
            Send me the occasional note on new work and insights.
          </label>

          {status === "error" && serverError ? (
            <div
              className="rounded-[3px] border border-red-700/25 bg-red-700/[0.04] px-4 py-3 text-sm leading-relaxed text-red-800 dark:border-red-400/30 dark:bg-red-400/[0.06] dark:text-red-300 sm:col-span-2"
            >
              {serverError} You can also write to{" "}
              <a href={`mailto:${CONTACT.email}`} className="font-medium underline underline-offset-4">
                {CONTACT.email}
              </a>
              .
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-4 border-t border-border pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-relaxed text-foreground/50">
              We reply within 24 hours. No newsletters unless you ask.
            </p>
            <button
              type="submit"
              disabled={sending}
              className="group inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-foreground py-2 pl-2 pr-7 text-[15px] font-medium text-background transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-foreground/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
            >
              {sending ? (
                <>
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background"
                  >
                    <span className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-foreground/30 border-t-foreground motion-reduce:animate-none" />
                  </span>
                  Sending…
                </>
              ) : (
                <>
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  Send inquiry
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
