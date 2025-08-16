"use client"

import Image from "next/image"
import { ScrollFloat } from "@/ui/scroll-float"
import { motion } from "motion/react"

export default function WorkPage() {
  const projects = [
    { title: "Dec's Cafe", image: "/images/decs-cafe.png", tag: "Coffee Shop" },
    { title: "The Perfect Bread", image: "/images/fresh-bread.png", tag: "E‑commerce" },
    { title: "Flow Yoga Studio", image: "/images/yoga-studio.jpeg", tag: "Wellness" },
    { title: "ZenFix Mobile Repair", image: "/images/mobile.jpg", tag: "Repair" },
    { title: "Bloom & Blossom Florist", image: "/images/Works/Bloom & Blossom Florist.jpg", tag: "Retail" },
    { title: "Bright Smile Dental", image: "/images/Works/Bright Smile Dental.webp", tag: "Healthcare" },
    { title: "FitLife Personal Training", image: "/images/Works/FitLife Personal Training.webp", tag: "Fitness" },
    { title: "Moments Photography", image: "/images/Works/Moments Photography.jpeg", tag: "Creative" },
    { title: "Pampered Paws Grooming", image: "/images/Works/Pampered Paws Grooming.webp", tag: "Pets" },
    { title: "Street Eats Mobile", image: "/images/Works/Street Eats Mobile.avif", tag: "Food Truck" },
  ]
  return (
    <div className="bg-background text-foreground">
      <section className="container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-10 text-center">
        <motion.h1 className="text-4xl md:text-6xl font-black" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>Selected Work</motion.h1>
        <motion.p className="mt-4 text-foreground/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>A few highlights from recent launches.</motion.p>
      </section>
      <section className="container mx-auto px-4 md:px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {projects.map((p, i) => (
          <ScrollFloat key={p.title} delay={80 * i}>
            <div className="rounded-3xl overflow-hidden ring-1 ring-border/70 bg-card">
              <div className="relative aspect-video">
                <Image src={p.image} alt={p.title} fill className="object-cover" />
                <div className="absolute top-4 right-4 bg-black/80 text-white text-xs px-3 py-1 rounded-full">{p.tag}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">{p.title}</h3>
              </div>
            </div>
          </ScrollFloat>
        ))}
      </section>
    </div>
  )
}


