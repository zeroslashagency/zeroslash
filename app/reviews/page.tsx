"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/ui/scroll-reveal"
import { ScrollFloat } from "@/ui/scroll-float"
import { Star, ArrowLeft } from "lucide-react"

export default function ReviewsPage() {
  const allReviews = [
    {
      text: "ZeroSlash transformed our digital presence in days. The interactive menu and NYC café vibe? Spot-on. Customers keep complimenting how easy it is to order iced coffee on their phones!",
      author: "Samantha R.",
      company: "Dec's Cafe (Coffee)",
      emoji: "☕",
    },
    {
      text: "Our new site feels as warm as our sourdough. They captured our brand's heart – simple, wholesome, and mobile-friendly. Orders jumped 30% in Week 1!",
      author: "Maria L.",
      company: "The Perfect Fresh Bread (Bakery)",
      emoji: "🍞",
    },
    {
      text: "I expected a basic site for my small shop. Got way more: WhatsApp booking, fabric gallery, even a 24-hour turnaround when I panicked about typos. These folks CARE.",
      author: "Ravi G.",
      company: "Stitch Story Tailoring",
      emoji: "✂️",
    },
    {
      text: "Just needed a page showing repair prices. They added live chat (!), made it load fast on cheap phones, and taught me to update it myself. Game-changer for my roadside stall.",
      author: "Faizan A.",
      company: "ZenFix Mobile Repair",
      emoji: "📱",
    },
    {
      text: "Thought my mehndi biz was 'too small' for a pro site. ZeroSlash proved me wrong – elegant gallery, Hindi/English toggle, and bookings via Instagram. Clients say it's 'so me'.",
      author: "Farah B.",
      company: "Henna by Farah",
      emoji: "🎨",
    },
    {
      text: "Wanted 'calm', not complexity. They delivered: soft colors, easy class schedule, and a 'Book Trial' button that just works. My students actually USE the site. Magic ✨",
      author: "Kavita J.",
      company: "Flow Yoga Studio",
      emoji: "🧘",
    },
    {
      text: "From zero to hero in 3 weeks! Professional portfolio, client testimonials, and a booking system that actually works. My photography business has never looked better.",
      author: "Alex M.",
      company: "Moments Photography",
      emoji: "📸",
    },
    {
      text: "They made my food truck famous! Instagram integration, location tracker, and menu updates on-the-go. Sales up 40% since launch. Best investment ever!",
      author: "Carlos D.",
      company: "Street Eats Mobile",
      emoji: "🚚",
    },
    {
      text: "Skeptical about online tutoring? Not anymore! They built a platform that makes learning fun. Students love the interactive features, parents love the progress tracking.",
      author: "Dr. Priya S.",
      company: "MathGenius Tutoring",
      emoji: "📚",
    },
    {
      text: "My handmade jewelry deserved a beautiful showcase. They delivered beyond expectations – elegant galleries, secure payments, and mobile-first design. Orders tripled!",
      author: "Emma K.",
      company: "Artisan Gems",
      emoji: "💎",
    },
    {
      text: "Fitness coaching went digital seamlessly. Custom workout plans, progress tracking, and video integration. My clients stay motivated, and I stay organized!",
      author: "Jake T.",
      company: "FitLife Personal Training",
      emoji: "💪",
    },
    {
      text: "Local flower shop to online sensation! Same-day delivery tracking, seasonal catalogs, and wedding portfolio showcase. Valentine's Day was our biggest ever!",
      author: "Rose P.",
      company: "Bloom & Blossom Florist",
      emoji: "🌸",
    },
    {
      text: "Pet grooming bookings were chaos until ZeroSlash stepped in. Online scheduling, service packages, and before/after galleries. Pet parents love the convenience!",
      author: "Mike W.",
      company: "Pampered Paws Grooming",
      emoji: "🐕",
    },
    {
      text: "Real estate needed a modern touch. Virtual tours, property search filters, and lead capture forms that actually convert. Closing deals faster than ever!",
      author: "Sarah L.",
      company: "Premier Properties",
      emoji: "🏠",
    },
    {
      text: "Dental practice marketing made simple. Appointment booking, treatment galleries, and patient testimonials. New patients find us easily, and existing ones stay loyal.",
      author: "Dr. James H.",
      company: "Bright Smile Dental",
      emoji: "🦷",
    },
    {
      text: "Event planning went from stressful to streamlined. Portfolio showcases, vendor directories, and client collaboration tools. Dream weddings made reality!",
      author: "Lisa C.",
      company: "Elegant Events Co.",
      emoji: "💒",
    },
  ]

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Header */}
      <section className="w-full py-8 md:py-12 lg:py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/">
                <Button variant="ghost" className="text-foreground hover:bg-foreground/5 dark:hover:bg-foreground/10 px-4 py-2 rounded-full font-medium">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Header Content */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                Customer Reviews
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed mb-6">
                Real stories from real clients who trusted ZeroSlash Agency to transform their digital presence.
              </p>

              {/* Star Rating Display */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex text-yellow-400 mr-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-current" />
                  ))}
                </div>
                <span className="text-foreground text-lg font-semibold">5.0 from 76+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Reviews Grid */}
      <ScrollReveal>
        <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {allReviews.map((testimonial, index) => (
                  <ScrollFloat key={index} delay={index * 0.1}>
                    <div className="bg-card rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border group hover:-translate-y-2">
                      {/* Star Rating */}
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>

                      {/* Testimonial Text */}
                      <p className="text-foreground/80 mb-6 leading-relaxed text-sm md:text-base">{testimonial.text}</p>

                      {/* Author Info */}
                      <div className="flex items-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-4 text-lg md:text-xl group-hover:scale-110 transition-transform duration-300 bg-foreground/10">
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
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="bg-background py-12 md:py-16 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-background rounded-sm"></div>
                  </div>
                  <span className="font-bold text-xl text-foreground">ZeroSlash Agency</span>
                </div>
                <p className="text-foreground/70 mb-6 max-w-md">
                  We craft digital experiences that deliver results. Partner with our team to build exceptional
                  solutions that drive growth.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-foreground/10 hover:bg-foreground hover:text-background"
                  >
                    <span className="text-sm font-bold">f</span>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-foreground/10 hover:bg-foreground hover:text-background"
                  >
                    <span className="text-sm font-bold">t</span>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-foreground/10 hover:bg-foreground hover:text-background"
                  >
                    <span className="text-sm font-bold">in</span>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-foreground mb-6">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                      Work
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-foreground/70 hover:text-foreground transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-bold text-foreground mb-6">Contact</h3>
                <div className="space-y-3">
                  <p className="text-foreground/70">+91 9500255291</p>
                  <p className="text-foreground/70">hello@zeroslash.in</p>
                  <p className="text-foreground/70">Remote-first team</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-border mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-wrap gap-6 text-sm text-foreground/60 mb-4 md:mb-0">
                <span>© 2025 ZeroSlash Agency</span>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
              <div className="flex items-center bg-foreground/10 rounded-lg px-4 py-2">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-foreground text-sm font-medium">5.0 from 76+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
