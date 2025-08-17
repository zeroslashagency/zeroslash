"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import Stepper, { Step } from "@/src/blocks/Components/Stepper/Stepper";
import { Confetti, type ConfettiRef } from "@/src/components/magicui/confetti";
import { track } from "@/lib/gtag";

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
  const confettiRef = useRef<ConfettiRef>(null);

  const steps = 6; // Name/Email + 4 selection steps + Add-ons

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
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Submission failed");
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
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      track("project_wizard_submit_error", {
        duration_ms: Date.now() - submitStartRef.current,
        error_message: String(e?.message || "unknown_error"),
      });
    } finally {
      const elapsed = Date.now() - submitStartRef.current;
      const minDuration = 2000; // ms, ensure effect is visible
      const remaining = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setSubmitting(false);
        if (success) {
          onOpenChange(false);
          setStep(1);
          setData({});
          setCategoryOther("");
          setName("");
          setEmail("");
          setPhone("");
        }
      }, remaining);
    }
  };

  // Fire confetti side-cannons the ENTIRE time submitting is true
  useEffect(() => {
    if (!submitting) return;
    let cancelled = false;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"] as const;
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
          } as any);
          confettiRef.current?.fire?.({
            particleCount: 6,
            angle: 120,
            spread: 60,
            startVelocity: 60,
            origin: { x: 1, y: 0.5 },
            colors: [...colors],
          } as any);
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
      } as any);
      confettiRef.current.fire?.({
        particleCount: 80,
        spread: 80,
        startVelocity: 50,
        origin: { x: 0.8, y: 0.6 },
        colors: [...colors],
      } as any);
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
      const emailOk = !email || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
      const phoneOk = !phone || /^[0-9+()\-.\s]{7,}$/.test(phone);
      return name.trim().length > 0 && emailOk && phoneOk;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl bg-transparent border-0 shadow-none rounded-none p-0 relative overflow-hidden">
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
        {/* React Bits Stepper */}
        <Stepper
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
              <div className="grid gap-3">
                <input
                  type="text"
                  className="w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="email"
                  className="w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Email (for updates)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="tel"
                  className="w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
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
      </DialogContent>
    </Dialog>
  );
}
