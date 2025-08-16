# Smooth Scroll Animations

A collection of reusable React components for creating smooth, premium scroll-triggered animations using Framer Motion.

## Features

- ✨ **Smooth Transitions**: Premium easing curves for natural motion
- 🚀 **Performance Optimized**: Hardware-accelerated 60fps animations
- 📱 **Responsive Design**: Works perfectly on all devices
- 🎯 **One-time Triggers**: Animations trigger only once when entering viewport
- 🎨 **Customizable**: Flexible props for duration, delay, distance, and easing
- 🔧 **TypeScript Support**: Fully typed components and hooks

## Components

### AnimatedSection

Basic fade-in and slide-up animation when entering viewport.

```tsx
import { AnimatedSection } from "@/components/ui/animated-section";

<AnimatedSection
  delay={0.2}
  duration={0.8}
  slideDistance={30}
  threshold={0.1}
  className="py-20"
>
  <h2>This content fades in smoothly</h2>
  <p>With a gentle slide-up motion</p>
</AnimatedSection>
```

**Props:**
- `delay` (number): Animation delay in seconds (default: 0)
- `duration` (number): Animation duration in seconds (default: 0.8)
- `slideDistance` (number): Distance to slide in pixels (default: 30)
- `threshold` (number): Viewport intersection threshold (default: 0.1)
- `once` (boolean): Trigger animation only once (default: true)

### AnimatedSectionStaggered

Animates children with staggered delays for a polished effect.

```tsx
import { AnimatedSectionStaggered } from "@/components/ui/animated-section";

<AnimatedSectionStaggered
  staggerDelay={0.15}
  className="grid md:grid-cols-3 gap-8"
>
  <Card>Card 1</Card>  {/* Animates first */}
  <Card>Card 2</Card>  {/* Animates 0.15s later */}
  <Card>Card 3</Card>  {/* Animates 0.30s later */}
</AnimatedSectionStaggered>
```

**Additional Props:**
- `staggerDelay` (number): Delay between child animations (default: 0.1)

### AnimatedSectionSlide

Slide in from any direction with customizable distance.

```tsx
import { AnimatedSectionSlide } from "@/components/ui/animated-section";

<AnimatedSectionSlide
  direction="left"
  distance={60}
  duration={0.8}
>
  <h3>Slides in from the left</h3>
</AnimatedSectionSlide>
```

**Additional Props:**
- `direction` ("up" | "down" | "left" | "right"): Slide direction (default: "up")
- `distance` (number): Slide distance in pixels (default: 40)

## Hooks

### useScrollAnimation

Basic hook for scroll-triggered animations.

```tsx
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

function MyComponent() {
  const { ref, isInView } = useScrollAnimation({
    threshold: 0.2,
    once: true
  });

  return (
    <div ref={ref} className={isInView ? "animate-in" : "animate-out"}>
      Content
    </div>
  );
}
```

### useAdvancedScrollAnimation

Advanced hook with smooth spring animations.

```tsx
import { useAdvancedScrollAnimation } from "@/hooks/use-scroll-animation";
import { motion } from "framer-motion";

function MyComponent() {
  const { ref, style } = useAdvancedScrollAnimation({
    delay: 0.2,
    duration: 0.8
  });

  return (
    <motion.div ref={ref} style={style}>
      Smoothly animated content
    </motion.div>
  );
}
```

## Animation Presets

### Premium Easing
All components use the premium easing curve: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

This creates natural, smooth motion that feels polished and professional.

### Timing Guidelines
- **Fast interactions**: 0.2-0.3s
- **Standard animations**: 0.5-0.8s  
- **Dramatic effects**: 1.0-1.5s
- **Stagger delays**: 0.1-0.2s

## Best Practices

### Performance
- Animations are hardware-accelerated using `transform` and `opacity`
- Use `once: true` for one-time animations to prevent re-triggering
- Respect user preferences with `prefers-reduced-motion`

### Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Responsive Design
- Adjust animation distances for mobile devices
- Consider reducing animation complexity on smaller screens
- Test on various devices and connection speeds

## Examples

### Hero Section
```tsx
<AnimatedSection className="min-h-screen flex items-center justify-center">
  <div className="text-center space-y-6">
    <h1 className="text-6xl font-bold">Welcome</h1>
    <p className="text-xl text-muted-foreground">
      Beautiful animations await
    </p>
  </div>
</AnimatedSection>
```

### Feature Cards
```tsx
<AnimatedSectionStaggered 
  staggerDelay={0.15}
  className="grid md:grid-cols-3 gap-8"
>
  {features.map((feature, index) => (
    <Card key={index}>
      <CardHeader>
        <CardTitle>{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{feature.description}</p>
      </CardContent>
    </Card>
  ))}
</AnimatedSectionStaggered>
```

### Split Content
```tsx
<div className="grid md:grid-cols-2 gap-12">
  <AnimatedSectionSlide direction="left">
    <h3>Left Content</h3>
    <p>Slides in from the left</p>
  </AnimatedSectionSlide>
  
  <AnimatedSectionSlide direction="right" delay={0.2}>
    <h3>Right Content</h3>
    <p>Slides in from the right with delay</p>
  </AnimatedSectionSlide>
</div>
```

## Troubleshooting

### Animations Not Triggering
- Check that Framer Motion is installed: `npm install framer-motion`
- Ensure the component is in the viewport
- Verify `threshold` value (try 0.1 for earlier triggering)

### Performance Issues
- Reduce the number of animated elements on screen
- Use `will-change: transform` sparingly
- Consider using `AnimatedSectionStaggered` instead of multiple individual animations

### Layout Shifts
- Set explicit dimensions on animated containers
- Use `transform` instead of changing layout properties
- Consider using `scale` for size changes instead of width/height

## Browser Support

- Modern browsers with CSS transforms support
- Graceful degradation for older browsers
- Respects `prefers-reduced-motion` setting

## Dependencies

- React 18+
- Framer Motion 10+
- TypeScript (optional but recommended)
