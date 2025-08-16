"use client";

import { AnimatedSection, AnimatedSectionStaggered, AnimatedSectionSlide } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ScrollAnimationDemo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <AnimatedSection className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Smooth Scroll Animations
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience buttery-smooth, premium animations that trigger as you scroll through sections.
          </p>
          <Button size="lg" className="mt-8">
            Get Started
          </Button>
        </div>
      </AnimatedSection>

      {/* Features Section with Staggered Animation */}
      <AnimatedSectionStaggered 
        className="py-20 px-4"
        delay={0.2}
        staggerDelay={0.15}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each feature card animates in with a staggered delay for a polished experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:border-border transition-colors">
              <CardHeader>
                <CardTitle>Smooth Transitions</CardTitle>
                <CardDescription>
                  Premium easing curves for natural motion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every animation uses carefully crafted cubic-bezier curves for smooth, professional transitions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-border transition-colors">
              <CardHeader>
                <CardTitle>Performance Optimized</CardTitle>
                <CardDescription>
                  Hardware-accelerated animations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built with Framer Motion for 60fps animations that don&rsquo;t impact performance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-border transition-colors">
              <CardHeader>
                <CardTitle>Responsive Design</CardTitle>
                <CardDescription>
                  Works perfectly on all devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Animations adapt to different screen sizes and respect user preferences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedSectionStaggered>

      {/* Slide Animations from Different Directions */}
      <div className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Directional Animations</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Elements can slide in from any direction with smooth easing.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSectionSlide direction="left" distance={60} duration={0.8}>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">From the Left</h3>
                <p className="text-muted-foreground">
                  This content slides in smoothly from the left side with a gentle fade-in effect.
                </p>
                <Button variant="outline">Learn More</Button>
              </div>
            </AnimatedSectionSlide>

            <AnimatedSectionSlide direction="right" distance={60} duration={0.8} delay={0.2}>
              <div className="space-y-4 text-right">
                <h3 className="text-2xl font-semibold">From the Right</h3>
                <p className="text-muted-foreground">
                  This content slides in from the right with a slight delay for a staggered effect.
                </p>
                <Button variant="outline">Discover More</Button>
              </div>
            </AnimatedSectionSlide>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <AnimatedSection className="py-20" delay={0.3}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">By the Numbers</h2>
            <p className="text-muted-foreground text-lg">
              Performance metrics that matter
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">60fps</div>
              <div className="text-sm text-muted-foreground">Smooth Animations</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">0.8s</div>
              <div className="text-sm text-muted-foreground">Average Duration</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Responsive</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Final CTA Section */}
      <AnimatedSectionSlide 
        direction="up" 
        distance={50} 
        className="py-20 bg-primary/5"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Implement these smooth scroll animations in your project today.
          </p>
          <div className="space-x-4">
            <Button size="lg">
              View Documentation
            </Button>
            <Button variant="outline" size="lg">
              See Examples
            </Button>
          </div>
        </div>
      </AnimatedSectionSlide>
    </div>
  );
}
