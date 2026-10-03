import ContactChannels from "@/components/contact/ContactChannels"
import ContactForm from "@/components/contact/ContactForm"

const mono = { fontFamily: "var(--font-geist-mono)" }
const sans = { fontFamily: "var(--font-sans)" }

const STUDIO = [
  { label: "Studio", value: "Bengaluru, India" },
  { label: "Clients", value: "Worldwide, remote-first" },
  { label: "Timezone", value: "IST, UTC+5:30" },
  { label: "Response", value: "Within 24 hours" },
] as const

export default function ContactPage() {
  return (
    <div className="bg-background text-foreground">
      <section aria-labelledby="contact-heading" className="container mx-auto px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <div
            className="contact-reveal rounded-[24px] border border-foreground/10 bg-white px-6 py-10 shadow-[0_32px_80px_-40px_rgba(20,16,12,0.28)] sm:px-10 md:p-14 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
            style={{ ["--index" as string]: 0 }}
          >
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 [&>*]:min-w-0">
              {/* Left: pitch + direct channels + studio facts */}
              <div className="flex min-w-0 flex-col">
                <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45" style={mono}>
                  We&rsquo;re here to help you
                </p>
                <h1
                  id="contact-heading"
                  className="mt-5 text-4xl leading-[1.04] tracking-[-0.02em] text-foreground sm:text-5xl"
                  style={sans}
                >
                  <span className="font-bold">Tell us</span>
                  <br />
                  <span className="font-light">what you&rsquo;re building.</span>
                </h1>
                <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-foreground/60">
                  Websites, brands, and marketing for businesses that want to grow. Send a few lines about the project
                  and we&rsquo;ll reply within 24 hours with next steps, not a sales script.
                </p>

                <div className="mt-9">
                  <ContactChannels />
                </div>

                <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-foreground/10 pt-7">
                  {STUDIO.map((s) => (
                    <div key={s.label}>
                      <dt className="text-[10px] uppercase tracking-[0.18em] text-foreground/45 sm:text-[11px]" style={mono}>
                        {s.label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-foreground sm:text-[15px]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Right: inquiry form in a soft inset panel */}
              <div className="min-w-0">
                <div className="h-full rounded-2xl bg-background p-6 sm:p-8 dark:bg-white/[0.04]">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
