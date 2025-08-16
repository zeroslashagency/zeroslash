"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import SectionPill from "@/components/SectionPill"
import { ScrollReveal } from "@/ui/scroll-reveal"
import { ScrollFloat } from "@/ui/scroll-float"
import { Star, ArrowRight } from "lucide-react"

export default function TestimonialsSection() {
  return (
    <ScrollReveal>
      <section className="w-full py-8 md:py-12 lg:py-16 bg-background relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <div className="mb-4">
                <SectionPill label="Reviews" dotClassName="bg-rose-400" shiny />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight tracking-tight">
                SEE WHY OUR CLIENTS{" "}
                <span className="inline-flex items-center">
                  <span className="bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-2 shadow-lg text-xl md:text-2xl">
                    ❤️
                  </span>
                </span>{" "}
                US
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
                Don&rsquo;t just take our word for it. Here&rsquo;s what our clients have to say about working with ZeroSlash
                Agency.
              </p>

              <div className="flex items-center justify-center mb-6">
                <div className="flex text-yellow-400 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  ))}
                </div>
                <span className="text-black text-base md:text-lg font-semibold">5.0 from 76+ reviews</span>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-24 md:pb-32">
                {[
                  {
                    text:
                      "ZeroSlash transformed our digital presence in days. The interactive menu and NYC café vibe? Spot-on. Customers keep complimenting how easy it is to order iced coffee on their phones!",
                    author: "Samantha R.",
                    company: "Dec's Cafe (Coffee)",
                    emoji: "☕",
                  },
                  {
                    text:
                      "Our new site feels as warm as our sourdough. They captured our brand's heart – simple, wholesome, and mobile-friendly. Orders jumped 30% in Week 1!",
                    author: "Maria L.",
                    company: "The Perfect Fresh Bread (Bakery)",
                    emoji: "🍞",
                  },
                  {
                    text:
                      "I expected a basic site for my small shop. Got way more: WhatsApp booking, fabric gallery, even a 24-hour turnaround when I panicked about typos. These folks CARE.",
                    author: "Ravi G.",
                    company: "Stitch Story Tailoring",
                    emoji: "✂️",
                  },
                  {
                    text:
                      "Just needed a page showing repair prices. They added live chat (!), made it load fast on cheap phones, and taught me to update it myself. Game-changer for my roadside stall.",
                    author: "Faizan A.",
                    company: "ZenFix Mobile Repair",
                    emoji: "📱",
                  },
                  {
                    text:
                      "Thought my mehndi biz was 'too small' for a pro site. ZeroSlash proved me wrong – elegant gallery, Hindi/English toggle, and bookings via Instagram. Clients say it's 'so me'.",
                    author: "Farah B.",
                    company: "Henna by Farah",
                    emoji: "🎨",
                  },
                  {
                    text:
                      "Wanted 'calm', not complexity. They delivered: soft colors, easy class schedule, and a 'Book Trial' button that just works. My students actually USE the site. Magic ✨",
                    author: "Kavita J.",
                    company: "Flow Yoga Studio",
                    emoji: "🧘",
                  },
                ].map((testimonial, index) => (
                  <ScrollFloat key={index} delay={index * 0.15}>
                    <div className="bg-card rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border group hover:-translate-y-2">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-foreground/80 mb-6 leading-relaxed text-sm md:text-base">{testimonial.text}</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-full flex items-center justify-center mr-4 text-lg md:text-xl group-hover:scale-110 transition-transform duration-300">
                          {testimonial.emoji}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm md:text-base">{testimonial.author}</div>
                          <div className="text-xs md:text-sm text-foreground/60">{testimonial.company}</div>
                        </div>
                      </div>
                    </div>
                  </ScrollFloat>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-36 md:h-48 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none"></div>

              <div className="absolute bottom-12 md:bottom-16 left-1/2 transform -translate-x-1/2 z-10">
                <Link href="/reviews">
                  <Button className="bg-card text-foreground border-2 border-border hover:bg-muted px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                    Read Customer Reviews
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  )
}


