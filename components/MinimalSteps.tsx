import React from "react";

const steps = [
  { n: "01", t: "Discover", d: "Understand goals, audience, and constraints clearly." },
  { n: "02", t: "Design", d: "Craft clean, purposeful interfaces and flows." },
  { n: "03", t: "Build", d: "Develop reliable, scalable features with care." },
  { n: "04", t: "Launch", d: "Ship confidently and iterate with insights." },
];

export default function MinimalSteps() {
  return (
    <section className="w-full py-14 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
            {steps.map((s) => (
              <div key={s.n} className="relative overflow-visible">
                {/* pin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-black ring-4 ring-white shadow" />
                </div>
                {/* card */}
                <div className="bg-white border border-black/10 rounded-xl p-6 md:p-8 shadow-lg">
                  <div className="text-sm text-black/60 mb-2">{s.n}</div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3">{s.t}</h3>
                  <p className="text-black/70 text-sm leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
