"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Stepper, { Step } from "@/src/blocks/Components/Stepper/Stepper";
import { Confetti, type ConfettiRef } from "@/src/components/magicui/confetti";
import { track } from "@/lib/gtag";
import Honeypot from "@/components/Honeypot";
import { isEmail, isOptionalPhone } from "@/lib/validation";

// Simple pill button
function Pill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors break-words whitespace-normal ${
        active
          ? "bg-foreground text-background border-foreground"
          : "border-border text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base md:text-lg font-semibold">{title}</h3>
        {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export type ProjectWizardData = {
  category?: string;
  type?: string;
  pages?: number | "10+";
  style?: string;
  addons?: string[];
};

export default function ProjectWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProjectWizardData>({});
  const [categoryOther, setCategoryOther] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // optional
  const [submitting, setSubmitting] = useState(false);
  const submitStartRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  // Stepper hides its content once "Complete" is pressed, so the outcome is rendered outside it.
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [stepperKey, setStepperKey] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);
  const trapRef = useRef<HTMLInputElement>(null);

  const resetAll = () => {
    setResult(null);
    setError(null);
    setStep(1);
    setStepperKey((k) => k + 1);
    setData({});
    setCategoryOther("");
    setName("");
    setEmail("");
    setPhone("");
    setEmailTouched(false);
    setPhoneTouched(false);
  };

  const handleOpenChange = (v: boolean) => {
    if (submitting) return;
    onOpenChange(v);
    // Clear a finished submission so the next open starts fresh; keep in-progress drafts.
    if (!v && result === "success") resetAll();
  };

  const retry = () => {
    setResult(null);
    setError(null);
    setStep(6);
    setStepperKey((k) => k + 1);
  };


  const stepName = (n: number) =>
    (
      {
        1: "intro_contact",
        2: "category",
        3: "website_type",
        4: "pages",
        5: "style",
        6: "addons_review",
      } as const
    )[n as 1 | 2 | 3 | 4 | 5 | 6] || `step_${n}`;

  // Track when wizard opens
  useEffect(() => {
    if (open) {
      track("project_wizard_open", { step: 1, step_name: stepName(1) });
    }
  }, [open]);

  const done = async () => {
    setSubmitting(true);
    submitStartRef.current = Date.now();
    setError(null);
    let success = false;
    // Track submit attempt (do not include raw PII)
    track("project_wizard_submit_attempt", {
      category: data.category || "",
      website_type: data.type || "",
      pages: String(data.pages ?? ""),
      style: data.style || "",
      addons_count: (data.addons || []).length,
      email_domain: email.includes("@") ? email.split("@").pop() : "",
      phone_provided: Boolean(phone?.trim()),
    });
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          category: data.category || "",
          websiteType: data.type || "",
          pages: String(data.pages ?? ""),
          style: data.style || "",
          addons: data.addons || [],
          website: trapRef.current?.value || "",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(
          res.status === 400
            ? "Some details look invalid. Please check your name and email."
            : json?.error || "Submission failed"
        );
      }
      success = true;
      track("project_wizard_submit_success", {
        duration_ms: Date.now() - submitStartRef.current,
        category: data.category || "",
        website_type: data.type || "",
        pages: String(data.pages ?? ""),
        style: data.style || "",
        addons_count: (data.addons || []).length,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      track("project_wizard_submit_error", {
        duration_ms: Date.now() - submitStartRef.current,
        error_message: e instanceof Error ? e.message : "unknown_error",
      });
    } finally {
      const elapsed = Date.now() - submitStartRef.current;
      const minDuration = 2000; // ms, ensure effect is visible
      const remaining = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setSubmitting(false);
        setResult(success ? "success" : "error");
      }, remaining);
    }
  };

  // Fire confetti side-cannons the ENTIRE time submitting is true
  useEffect(() => {
    if (!submitting) return;
    let cancelled = false;
    const colors: string[] = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    let last = 0;

    const start = () => {
      const frame = (t: number) => {
        if (cancelled) return;
        // Fire about every 120ms for performance
        if (!last || t - last >= 120) {
          confettiRef.current?.fire?.({
            particleCount: 6,
            angle: 60,
            spread: 60,
            startVelocity: 60,
            origin: { x: 0, y: 0.5 },
            colors: [...colors],
          });
          confettiRef.current?.fire?.({
            particleCount: 6,
            angle: 120,
            spread: 60,
            startVelocity: 60,
            origin: { x: 1, y: 0.5 },
            colors: [...colors],
          });
          last = t;
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    // Defer and ensure ref is ready
    const ensureReady = () => {
      if (cancelled) return;
      if (!confettiRef.current || typeof confettiRef.current.fire !== "function") {
        requestAnimationFrame(ensureReady);
        return;
      }
      // Kick off with a couple of immediate bursts for visibility
      confettiRef.current.fire?.({
        particleCount: 80,
        spread: 80,
        startVelocity: 50,
        origin: { x: 0.2, y: 0.6 },
        colors: [...colors],
      });
      confettiRef.current.fire?.({
        particleCount: 80,
        spread: 80,
        startVelocity: 50,
        origin: { x: 0.8, y: 0.6 },
        colors: [...colors],
      });
      start();
    };
    const raf = requestAnimationFrame(ensureReady);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [submitting]);

  const canProceed = (s: number) => {
    // Step 1: Name/Email validation
    if (s === 1) {
      return name.trim().length > 0 && isEmail(email) && isOptionalPhone(phone);
    }
    // Step 2: Category
    if (s === 2) {
      if (!data.category) return false;
      const isOther = data.category === "Other" || data.category?.startsWith("Other:");
      return isOther ? categoryOther.trim().length > 0 : true;
    }
    // Step 3: Website Type
    if (s === 3) return !!data.type;
    // Step 4: Pages
    if (s === 4) return !!data.pages;
    // Step 5: Style
    if (s === 5) return !!data.style;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-transparent border-0 shadow-none rounded-none p-0 relative">
        {/* Accessible title for screen readers (required by Radix) */}
        <DialogTitle className="sr-only">Project Wizard</DialogTitle>
        {submitting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent">
            {/* Confetti canvas overlay (fullscreen, below spinner but above backdrop) */}
            <Confetti
              key="submit-confetti"
              ref={confettiRef}
              manualstart
              globalOptions={{ resize: true, useWorker: false }}
              className="pointer-events-none fixed inset-0 w-screen h-screen z-[120]"
            />
            <div className="flex flex-col items-center gap-3 z-[130]">
              <div className="h-10 w-10 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              <div className="text-sm text-foreground/80">Submitting your project…</div>
            </div>
          </div>
        )}
        {result ? (
          <div className="w-full max-w-5xl mx-auto p-4">
            <div
              role={result === "error" ? "alert" : "status"}
              aria-live="polite"
              className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center space-y-4"
            >
              {result === "success" ? (
                <>
                  <h3 className="text-xl md:text-2xl font-semibold">Thanks{name.trim() ? `, ${name.trim().split(/\s+/)[0]}` : ""}. We have your project.</h3>
                  <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                    We&apos;ll review the details and reply to <span className="text-foreground">{email}</span>, usually within one business day.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenChange(false)}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground text-background px-6 text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-semibold">We couldn&apos;t send your project</h3>
                  <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                    {error || "Something went wrong."} Your answers are still here.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={retry}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground text-background px-6 text-sm font-medium"
                    >
                      Review and try again
                    </button>
                    <a
                      href="mailto:hello@zeroslash.in"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium"
                    >
                      Email us instead
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
        <Stepper
          key={stepperKey}
          className="w-full max-w-5xl mx-auto"
          initialStep={step}
          onStepChange={(n) => {
            setStep(n);
            track("project_wizard_step_view", {
              step: n,
              step_name: stepName(n),
            });
          }}
          onFinalStepCompleted={done}
          nextButtonText={"Next"}
          contentClassName="pt-2"
          footerClassName=""
          stepCircleContainerClassName="bg-card border border-border rounded-3xl max-w-5xl"
          stepContainerClassName=""
          backButtonProps={{ disabled: step === 1 || submitting }}
          nextButtonProps={{ disabled: !canProceed(step) || submitting }}
        >
          {/* Step 1: Name / Email */}
          <Step>
            <Section title="Let's start with you" subtitle="Tell us who to contact about this project.">
              <div className="relative grid gap-3">
                <Honeypot ref={trapRef} />
                <input
                  type="text"
                  aria-label="Your name"
                  autoComplete="name"
                  required
                  className="w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div>
                  <input
                    type="email"
                    aria-label="Email"
                    autoComplete="email"
                    required
                    aria-invalid={emailTouched && !isEmail(email)}
                    aria-describedby="wizard-email-hint"
                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 ${
                      emailTouched && !isEmail(email) ? "border-red-500" : ""
                    }`}
                    placeholder="Email (so we can reply)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                  />
                  {emailTouched && !isEmail(email) ? (
                    <p id="wizard-email-hint" className="mt-1 px-4 text-xs text-red-600">
                      {email.trim() ? "Enter a valid email address." : "Email is required so we can reply."}
                    </p>
                  ) : null}
                </div>
                <div>
                  <input
                    type="tel"
                    aria-label="Phone (optional)"
                    autoComplete="tel"
                    aria-invalid={phoneTouched && !isOptionalPhone(phone)}
                    aria-describedby="wizard-phone-hint"
                    className={`w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20 ${
                      phoneTouched && !isOptionalPhone(phone) ? "border-red-500" : ""
                    }`}
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setPhoneTouched(true)}
                  />
                  {phoneTouched && !isOptionalPhone(phone) ? (
                    <p id="wizard-phone-hint" className="mt-1 px-4 text-xs text-red-600">
                      Use at least 7 digits; spaces, +, ( ) and - are fine.
                    </p>
                  ) : null}
                </div>
              </div>
            </Section>
          </Step>

          {/* Step 2: Category */}
          <Step>
            <Section title="Choose Category (Niche)" subtitle="Pick what best describes your project.">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "🏋️ Gym / Fitness Website",
                  "🩺 Doctor / Healthcare",
                  "🎨 Creative Portfolio",
                  "🛒 E-commerce / Shop",
                  "🏢 Startup / Business",
                  "Other",
                ].map((label) => {
                  const isOtherLabel = label === "Other";
                  const isActive = isOtherLabel
                    ? data.category === "Other" || (data.category?.startsWith("Other:") ?? false)
                    : data.category === label;
                  return (
                    <Pill
                      key={label}
                      active={isActive}
                      onClick={() => {
                        if (isOtherLabel) {
                          setData((d) => ({ ...d, category: "Other" }));
                        } else {
                          setData((d) => ({ ...d, category: label }));
                          setCategoryOther("");
                        }
                      }}
                    >
                      {label}
                    </Pill>
                  );
                })}
              </div>
              {data.category === "Other" || (data.category?.startsWith("Other:") ?? false) ? (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Type your category"
                    className="w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                    value={categoryOther}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCategoryOther(v);
                      setData((d) => ({ ...d, category: v ? `Other: ${v}` : "Other" }));
                    }}
                  />
                </div>
              ) : null}
            </Section>
          </Step>

          {/* Step 3: Website Type */}
          <Step>
            <Section title="Choose Website Type">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Static Showcase",
                  "Professional Business Website",
                  "Landing Page",
                  "Multi-page SEO Optimized Site",
                  "Other",
                ].map((label) => (
                  <Pill
                    key={label}
                    active={data.type === label}
                    onClick={() => setData((d) => ({ ...d, type: label }))}
                  >
                    {label}
                  </Pill>
                ))}
              </div>
            </Section>
          </Step>

          {/* Step 4: Pages */}
          <Step>
            <Section title="Pages Required">
              <div className="grid grid-cols-6 gap-2">
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"] as const).map((n) => (
                  <Pill key={n} active={data.pages === n} onClick={() => setData((d) => ({ ...d, pages: n }))}>
                    {n}
                  </Pill>
                ))}
              </div>
            </Section>
          </Step>

          {/* Step 5: Style */}
          <Step>
            <Section title="Style & Animation">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Minimal / Clean",
                  "Animated / Scroll Effects",
                  "Luxury Aesthetic",
                  "Bold & Trendy",
                  "Other",
                ].map((label) => (
                  <Pill
                    key={label}
                    active={data.style === label}
                    onClick={() => setData((d) => ({ ...d, style: label }))}
                  >
                    {label}
                  </Pill>
                ))}
              </div>
            </Section>
          </Step>

          {/* Step 6: Add-ons / Complete */}
          <Step>
            <Section title="Add-ons / Extras" subtitle="Select any that apply.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "SEO Setup",
                  "Branding Kit (Logo + Colors)",
                  "Copywriting Support",
                  "Website Maintenance",
                  "Automation / CRM",
                ].map((label) => {
                  const active = (data.addons || []).includes(label);
                  return (
                    <Pill
                      key={label}
                      active={active}
                      onClick={() =>
                        setData((d) => {
                          const a = new Set(d.addons || []);
                          if (a.has(label)) a.delete(label);
                          else a.add(label);
                          return { ...d, addons: Array.from(a) };
                        })
                      }
                    >
                      {label}
                    </Pill>
                  );
                })}
              </div>
              {/* Summary */}
              <div className="mt-4 rounded-lg border p-3 text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1">Summary</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Category: <span className="text-foreground/90">{data.category || "—"}</span></li>
                  <li>Name: <span className="text-foreground/90">{name || "—"}</span></li>
                  <li>Email: <span className="text-foreground/90">{email || "—"}</span></li>
                  <li>Phone: <span className="text-foreground/90">{phone || "—"}</span></li>
                  <li>Website Type: <span className="text-foreground/90">{data.type || "—"}</span></li>
                  <li>Pages: <span className="text-foreground/90">{data.pages ?? "—"}</span></li>
                  <li>Style: <span className="text-foreground/90">{data.style || "—"}</span></li>
                  <li>Add-ons: <span className="text-foreground/90">{(data.addons || []).join(", ") || "—"}</span></li>
                </ul>
                {error ? <div className="mt-2 text-red-600">{error}</div> : null}
              </div>
            </Section>
          </Step>
        </Stepper>
        )}
      </DialogContent>
    </Dialog>
  );
}
