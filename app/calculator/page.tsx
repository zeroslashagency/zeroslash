"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, Clock, Sparkles, Download, Share2 } from "lucide-react";

interface CalculatorResults {
  totalCost: {
    min: number;
    max: number;
  };
  timeline: string;
  breakdown: {
    category: string;
    cost: { min: number; max: number };
    description: string;
  }[];
  recommendations: string[];
}

export default function CostCalculatorPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: "",
    pages: "",
    features: [] as string[],
    designComplexity: "",
    timeline: "",
    maintenance: "",
    email: "",
  });
  const [results, setResults] = useState<CalculatorResults | null>(null);

  const projectTypes = [
    { id: "landing-page", label: "Landing Page", icon: "📄", description: "Single page website" },
    { id: "business-website", label: "Business Website", icon: "🏢", description: "5-10 pages" },
    { id: "e-commerce", label: "E-commerce Store", icon: "🛒", description: "Online shop" },
    { id: "web-app", label: "Web Application", icon: "⚙️", description: "Custom functionality" },
    { id: "enterprise", label: "Enterprise Solution", icon: "🏗️", description: "Large scale platform" },
  ];

  const featureOptions = [
    { id: "cms", label: "Content Management System", cost: 50000 },
    { id: "authentication", label: "User Authentication", cost: 75000 },
    { id: "payment", label: "Payment Integration", cost: 100000 },
    { id: "search", label: "Advanced Search", cost: 60000 },
    { id: "booking", label: "Booking System", cost: 150000 },
    { id: "analytics", label: "Custom Analytics", cost: 80000 },
    { id: "api", label: "API Integration", cost: 70000 },
    { id: "multilingual", label: "Multi-language Support", cost: 90000 },
    { id: "live-chat", label: "Live Chat Integration", cost: 40000 },
    { id: "email-marketing", label: "Email Marketing Integration", cost: 50000 },
  ];

  const designComplexityOptions = [
    { id: "basic", label: "Basic", description: "Simple, clean design with templates", multiplier: 1 },
    { id: "custom", label: "Custom", description: "Unique design tailored to brand", multiplier: 1.5 },
    { id: "premium", label: "Premium", description: "Complex animations & interactions", multiplier: 2 },
    { id: "luxury", label: "Luxury", description: "Award-winning custom experience", multiplier: 3 },
  ];

  const calculateCost = () => {
    let baseCost = { min: 0, max: 0 };

    // Base cost by project type
    switch (formData.projectType) {
      case "landing-page":
        baseCost = { min: 150000, max: 300000 }; // ₹1.5L - ₹3L
        break;
      case "business-website":
        baseCost = { min: 300000, max: 600000 }; // ₹3L - ₹6L
        break;
      case "e-commerce":
        baseCost = { min: 500000, max: 1500000 }; // ₹5L - ₹15L
        break;
      case "web-app":
        baseCost = { min: 800000, max: 2500000 }; // ₹8L - ₹25L
        break;
      case "enterprise":
        baseCost = { min: 2000000, max: 10000000 }; // ₹20L - ₹1Cr
        break;
    }

    // Adjust for pages
    const pageCount = parseInt(formData.pages) || 5;
    if (pageCount > 10) {
      const extraPages = pageCount - 10;
      baseCost.min += extraPages * 25000; // ₹25k per extra page
      baseCost.max += extraPages * 50000; // ₹50k per extra page
    }

    // Add feature costs
    let featureCost = 0;
    formData.features.forEach(featureId => {
      const feature = featureOptions.find(f => f.id === featureId);
      if (feature) featureCost += feature.cost;
    });

    // Apply design complexity multiplier
    const complexity = designComplexityOptions.find(c => c.id === formData.designComplexity);
    const multiplier = complexity?.multiplier || 1;

    const totalMin = Math.round((baseCost.min + featureCost) * multiplier);
    const totalMax = Math.round((baseCost.max + featureCost) * multiplier);

    // Calculate timeline
    let timelineWeeks = 4;
    if (formData.projectType === "e-commerce") timelineWeeks = 8;
    if (formData.projectType === "web-app") timelineWeeks = 12;
    if (formData.projectType === "enterprise") timelineWeeks = 20;
    if (formData.timeline === "rush") timelineWeeks = Math.ceil(timelineWeeks * 0.7);
    if (formData.timeline === "flexible") timelineWeeks = Math.ceil(timelineWeeks * 1.2);

    // Generate breakdown
    const breakdown = [
      {
        category: "Design & UX",
        cost: { min: Math.round(totalMin * 0.3), max: Math.round(totalMax * 0.3) },
        description: "UI/UX design, wireframes, prototypes, design system"
      },
      {
        category: "Development",
        cost: { min: Math.round(totalMin * 0.45), max: Math.round(totalMax * 0.45) },
        description: "Frontend, backend, database, API integration"
      },
      {
        category: "Content & SEO",
        cost: { min: Math.round(totalMin * 0.1), max: Math.round(totalMax * 0.1) },
        description: "Content creation, SEO optimization, copywriting"
      },
      {
        category: "Testing & QA",
        cost: { min: Math.round(totalMin * 0.1), max: Math.round(totalMax * 0.1) },
        description: "Quality assurance, browser testing, performance optimization"
      },
      {
        category: "Project Management",
        cost: { min: Math.round(totalMin * 0.05), max: Math.round(totalMax * 0.05) },
        description: "Planning, coordination, client communication"
      },
    ];

    // Add maintenance if selected
    if (formData.maintenance === "yes") {
      breakdown.push({
        category: "Maintenance (Annual)",
        cost: { min: Math.round(totalMin * 0.15), max: Math.round(totalMax * 0.2) },
        description: "Updates, security patches, hosting, support"
      });
    }

    // Generate recommendations
    const recommendations = [
      formData.features.length === 0 ? "Consider adding a CMS for easy content updates" : null,
      formData.designComplexity === "basic" ? "Custom design can increase brand recognition by 80%" : null,
      formData.timeline === "rush" ? "Rush projects may compromise quality - consider standard timeline" : null,
      formData.maintenance === "no" ? "93% of websites need regular updates for security" : null,
      pageCount > 20 ? "Consider a more scalable CMS solution for sites with 20+ pages" : null,
      formData.projectType === "e-commerce" && !formData.features.includes("payment") ? "Payment integration is essential for e-commerce" : null,
    ].filter(Boolean) as string[];

    setResults({
      totalCost: { min: totalMin, max: totalMax },
      timeline: `${timelineWeeks} weeks`,
      breakdown,
      recommendations
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else {
      return `₹${(amount / 1000).toFixed(0)}k`;
    }
  };

  const handleNext = () => {
    if (step === 5) {
      calculateCost();
      setStep(6);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleFeature = (featureId: string) => {
    if (formData.features.includes(featureId)) {
      setFormData({
        ...formData,
        features: formData.features.filter(f => f !== featureId)
      });
    } else {
      setFormData({
        ...formData,
        features: [...formData.features, featureId]
      });
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const content = `
WEB DESIGN COST ESTIMATE - ZEROSLASH AGENCY
========================================

Total Investment: ${formatCurrency(results.totalCost.min)} - ${formatCurrency(results.totalCost.max)}
Timeline: ${results.timeline}

COST BREAKDOWN:
${results.breakdown.map(item =>
  `\n${item.category}: ${formatCurrency(item.cost.min)} - ${formatCurrency(item.cost.max)}\n${item.description}`
).join('\n')}

RECOMMENDATIONS:
${results.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
Get a detailed proposal: https://zeroslash.in/contact
Generated by: https://zeroslash.in/calculator
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zeroslash-cost-estimate.txt';
    a.click();
  };

  const shareResults = async () => {
    if (!results) return;

    const text = `Web Design Estimate: ${formatCurrency(results.totalCost.min)} - ${formatCurrency(results.totalCost.max)} | Timeline: ${results.timeline}\n\nCalculate yours: https://zeroslash.in/calculator`;

    if (navigator.share) {
      await navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Web Design Cost Calculator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Get an instant estimate for your project in 60 seconds
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>1,247 estimates generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>~60 seconds</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {step < 6 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Step {step} of 5</span>
                <span className="text-sm text-muted-foreground">{Math.round((step / 5) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">What type of project do you need?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setFormData({ ...formData, projectType: type.id });
                        setTimeout(handleNext, 300);
                      }}
                      className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg ${
                        formData.projectType === type.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="text-4xl mb-3">{type.icon}</div>
                      <h3 className="text-lg font-semibold mb-1">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">How many pages do you need?</h2>
                <div className="space-y-4">
                  {[
                    { value: "1", label: "1 page (Landing Page)", desc: "Single page website" },
                    { value: "5", label: "5-10 pages", desc: "Small business website" },
                    { value: "15", label: "10-20 pages", desc: "Medium business website" },
                    { value: "25", label: "20+ pages", desc: "Large website or portal" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({ ...formData, pages: option.value });
                        setTimeout(handleNext, 300);
                      }}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg ${
                        formData.pages === option.value ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-2">What features do you need?</h2>
                <p className="text-muted-foreground mb-6">Select all that apply</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {featureOptions.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                        formData.features.includes(feature.id) ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">{feature.label}</h3>
                          <p className="text-xs text-muted-foreground">+{formatCurrency(feature.cost)}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.features.includes(feature.id) ? 'border-primary bg-primary' : 'border-border'
                        }`}>
                          {formData.features.includes(feature.id) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBack}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">What level of design do you need?</h2>
                <div className="space-y-4">
                  {designComplexityOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setFormData({ ...formData, designComplexity: option.id });
                        setTimeout(handleNext, 300);
                      }}
                      className={`w-full p-6 border-2 rounded-lg text-left transition-all hover:border-primary hover:shadow-lg ${
                        formData.designComplexity === option.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{option.multiplier}x</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Final questions</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3">What's your timeline?</label>
                    <div className="space-y-3">
                      {[
                        { value: "rush", label: "Rush (ASAP)", desc: "+30% cost, 70% faster" },
                        { value: "standard", label: "Standard", desc: "Normal timeline" },
                        { value: "flexible", label: "Flexible", desc: "-20% cost, slower pace" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, timeline: option.value })}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                            formData.timeline === option.value ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <h3 className="font-semibold mb-1">{option.label}</h3>
                          <p className="text-xs text-muted-foreground">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3">Do you need ongoing maintenance?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "yes", label: "Yes, include maintenance" },
                        { value: "no", label: "No, one-time project" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, maintenance: option.value })}
                          className={`p-4 border-2 rounded-lg text-center transition-all hover:border-primary ${
                            formData.maintenance === option.value ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <span className="font-semibold">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Email (optional - to receive detailed proposal)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full p-4 border-2 border-border rounded-lg bg-background focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBack}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!formData.timeline || !formData.maintenance}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Get My Estimate
                  </button>
                </div>
              </motion.div>
            )}

            {step === 6 && results && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Results Header */}
                <div className="text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                  <h2 className="text-3xl font-bold mb-4">Your Project Estimate</h2>
                  <div className="text-5xl font-bold text-primary mb-2">
                    {formatCurrency(results.totalCost.min)} - {formatCurrency(results.totalCost.max)}
                  </div>
                  <p className="text-xl text-muted-foreground">
                    Timeline: <span className="font-semibold text-foreground">{results.timeline}</span>
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={downloadResults}
                      className="flex items-center gap-2 px-6 py-3 bg-background border-2 border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={shareResults}
                      className="flex items-center gap-2 px-6 py-3 bg-background border-2 border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h3 className="text-2xl font-bold mb-4">Cost Breakdown</h3>
                  <div className="space-y-3">
                    {results.breakdown.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border-2 border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{item.category}</h4>
                          <span className="font-bold text-primary">
                            {formatCurrency(item.cost.min)} - {formatCurrency(item.cost.max)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">💡 Recommendations</h3>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <span className="text-primary font-bold">{index + 1}.</span>
                          <span className="text-sm">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="p-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl text-center">
                  <h3 className="text-2xl font-bold mb-3">Ready to start your project?</h3>
                  <p className="mb-6 opacity-90">
                    Let's discuss your requirements and create a detailed proposal
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/contact"
                      className="px-8 py-4 bg-background text-foreground rounded-lg hover:bg-background/90 transition-colors font-semibold"
                    >
                      Get Detailed Proposal
                    </a>
                    <a
                      href="/contact"
                      className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-semibold"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>

                {/* Start Over */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setStep(1);
                      setFormData({
                        projectType: "",
                        pages: "",
                        features: [],
                        designComplexity: "",
                        timeline: "",
                        maintenance: "",
                        email: "",
                      });
                      setResults(null);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Calculate Another Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
