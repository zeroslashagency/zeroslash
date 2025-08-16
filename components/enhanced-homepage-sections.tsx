"use client";

import { AnimatedSection, AnimatedSectionStaggered, AnimatedSectionSlide } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Box, Layers, Zap, Diamond, Cog, Rocket } from "lucide-react";
import Counter from "./Counter";
import SectionPill from "./SectionPill";
import ContactButton from "./ContactButton";

// Enhanced Hero Section with smooth animations
export function EnhancedHeroSection() {
  return (
    <AnimatedSection className="relative w-full min-h-[110svh] overflow-hidden">
      <div className="radial-hero-bg" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[110svh] px-4 text-center">
        <AnimatedSectionStaggered 
          delay={0.3}
          staggerDelay={0.2}
          className="space-y-8 max-w-4xl mx-auto"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground">
              Premium Digital
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Experiences
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We craft exceptional digital solutions with smooth animations and premium user experiences.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              View Portfolio
            </Button>
          </div>
        </AnimatedSectionStaggered>
      </div>
    </AnimatedSection>
  );
}

// Enhanced Services Section with directional animations
export function EnhancedServicesSection() {
  const services = [
    {
      icon: <Box className="h-8 w-8" />,
      title: "Web Development",
      description: "Modern, responsive websites built with the latest technologies and smooth animations.",
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: "UI/UX Design",
      description: "Beautiful, intuitive interfaces that provide exceptional user experiences.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Performance Optimization",
      description: "Lightning-fast websites with smooth 60fps animations and optimal loading times.",
    },
    {
      icon: <Diamond className="h-8 w-8" />,
      title: "Brand Identity",
      description: "Comprehensive branding solutions that make your business stand out.",
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Digital Strategy",
      description: "Strategic planning to maximize your digital presence and growth.",
    },
    {
      icon: <Cog className="h-8 w-8" />,
      title: "Maintenance & Support",
      description: "Ongoing support to keep your digital assets running smoothly.",
    },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <SectionPill label="Our Services" />
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-4">
            What We Do Best
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive digital solutions with premium animations and user experiences.
          </p>
        </AnimatedSection>

        <AnimatedSectionStaggered 
          staggerDelay={0.1}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <Card key={index} className="border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                </div>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </AnimatedSectionStaggered>
      </div>
    </section>
  );
}

// Enhanced Statistics Section with counter animations
export function EnhancedStatsSection() {
  const stats = [
    { number: 150, suffix: "+", label: "Projects Completed" },
    { number: 98, suffix: "%", label: "Client Satisfaction" },
    { number: 5, suffix: "⭐", label: "Average Rating" },
    { number: 24, suffix: "/7", label: "Support Available" },
  ];

  return (
    <AnimatedSection className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-muted-foreground text-lg">
            Numbers that speak for our quality and dedication
          </p>
        </div>
        
        <AnimatedSectionStaggered 
          staggerDelay={0.15}
          className="grid md:grid-cols-4 gap-8 text-center"
        >
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-1">
                <Counter value={stat.number} fontSize={48} textColor="hsl(var(--primary))" />
                <span className="text-4xl md:text-5xl font-bold text-primary">{stat.suffix}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </AnimatedSectionStaggered>
      </div>
    </AnimatedSection>
  );
}

// Enhanced Features Section with alternating animations
export function EnhancedFeaturesSection() {
  const features = [
    {
      title: "Smooth Animations",
      description: "Premium 60fps animations that enhance user experience without compromising performance.",
      image: "/images/feature-1.jpg",
      direction: "left" as const,
    },
    {
      title: "Responsive Design",
      description: "Beautiful designs that work perfectly across all devices and screen sizes.",
      image: "/images/feature-2.jpg", 
      direction: "right" as const,
    },
    {
      title: "Performance First",
      description: "Optimized code and assets ensure lightning-fast loading times and smooth interactions.",
      image: "/images/feature-3.jpg",
      direction: "left" as const,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Our Approach
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We focus on creating digital experiences that are not just beautiful, but also performant and user-friendly.
          </p>
        </AnimatedSection>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${
              feature.direction === "right" ? "md:grid-flow-col-dense" : ""
            }`}>
              <AnimatedSectionSlide 
                direction={feature.direction}
                distance={60}
                duration={0.8}
                delay={0.2}
                className={feature.direction === "right" ? "md:col-start-2" : ""}
              >
                <div className="space-y-6">
                  <h3 className="text-2xl md:text-3xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <Button variant="outline" className="group">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </AnimatedSectionSlide>

              <AnimatedSectionSlide 
                direction={feature.direction === "left" ? "right" : "left"}
                distance={60}
                duration={0.8}
                delay={0.4}
                className={feature.direction === "right" ? "md:col-start-1" : ""}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="text-6xl opacity-20">
                      {index === 0 && <Sparkles />}
                      {index === 1 && <Layers />}
                      {index === 2 && <Zap />}
                    </div>
                  </div>
                </div>
              </AnimatedSectionSlide>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Enhanced CTA Section
export function EnhancedCTASection() {
  return (
    <AnimatedSectionSlide 
      direction="up" 
      distance={50} 
      className="py-20 bg-primary/5"
    >
      <div className="container mx-auto px-4 text-center">
        <AnimatedSectionStaggered staggerDelay={0.15}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Let&rsquo;s work together to bring your vision to life with smooth animations and premium user experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ContactButton />
            <Button variant="outline" size="lg">
              View Our Work
            </Button>
          </div>
        </AnimatedSectionStaggered>
      </div>
    </AnimatedSectionSlide>
  );
}
