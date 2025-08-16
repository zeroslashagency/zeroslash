"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { ScrollFloat } from "@/ui/scroll-float"
import SectionPill from "@/components/SectionPill"

const testimonials = [
  {
    name: "Samantha R.",
    company: "Dec's Cafe (Coffee)",
    rating: 5,
    text: "ZeroSlash transformed our digital presence in days. The interactive menu and NYC café vibe? Spot-on. Customers keep complimenting how easy it is to order iced coffee on their phones!",
  },
  {
    name: "Maria L.",
    company: "The Perfect Fresh Bread (Bakery)",
    rating: 5,
    text: "Our new site feels as warm as our sourdough. They captured our brand's heart – simple, wholesome, and mobile-friendly. Orders jumped 30% in Week 1!",
  },
  {
    name: "Ravi G.",
    company: "Stitch Story Tailoring",
    rating: 5,
    text: "I expected a basic site for my small shop. Got way more: WhatsApp booking, fabric gallery, even a 24-hour turnaround when I panicked about typos. These folks CARE.",
  },
  {
    name: "Faizan A.",
    company: "ZenFix Mobile Repair",
    rating: 5,
    text: "Just needed a page showing repair prices. They added live chat (!), made it load fast on cheap phones, and taught me to update it myself. Game-changer for my roadside stall.",
  },
  {
    name: "Farah B.",
    company: "Henna by Farah",
    rating: 5,
    text: "Thought my mehndi biz was 'too small' for a pro site. ZeroSlash proved me wrong – elegant gallery, Hindi/English toggle, and bookings via Instagram. Clients say it's 'so me'.",
  },
  {
    name: "Kavita J.",
    company: "Flow Yoga Studio",
    rating: 5,
    text: "Wanted 'calm', not complexity. They delivered: soft colors, easy class schedule, and a 'Book Trial' button that just works. My students actually USE the site. Magic ✨",
  },
  {
    name: "Neha D.",
    company: "Whisk & Whip Bakery",
    rating: 5,
    text: "Home baker here. ZeroSlash built my site while I slept! Woke up to a sweet, phone-friendly page with cake photos and a contact form. No jargon, just help.",
  },
  {
    name: "Karan L.",
    company: "FixWell Services",
    rating: 5,
    text: "AC repair guy. Needed my number ONLINE. They made a 1-page site loading fast on 2G networks. Calls doubled. Real heroes for small shops 🙏",
  },
  {
    name: "Rhea T.",
    company: "InkSpace Tattoos",
    rating: 5,
    text: "DM'd them at midnight. Reply in 5 mins! Dark theme, aftercare FAQ, portfolio grid – perfect for my tattoo studio. Felt like collaborating with friends.",
  },
  {
    name: "Aarti P.",
    company: "The Masala Table",
    rating: 5,
    text: "Home caterer panic! ZeroSlash saved me with a simple site: menu PDF, tasting photos, quote button. My daughter updates it now. Stress-free ❤️",
  },
  {
    name: "Naveen K.",
    company: "Brick & Board Interiors",
    rating: 5,
    text: "Updated my ancient site in 8 days. Added a 'Before/After' slider even my carpenter understood. 'Looks expensive!' he said. Paid ₹18k – worth it.",
  },
  {
    name: "Divya K.",
    company: "Candle & Clay",
    rating: 5,
    text: "Handmade candle biz. They added workshop dates with a calendar I can edit. Mubarak trained me for free. More like big brothers than an agency!",
  },
  {
    name: "Jatin D.",
    company: "Elite Dry Cleaners",
    rating: 5,
    text: "No website for 20 years. ZeroSlash made one in 3 DAYS with prices/open hours. Old uncles find me now. Simple = brilliant.",
  },
  {
    name: "Rahul S.",
    company: "GrowWithRahul Coaching",
    rating: 5,
    text: "Life coach newbie. They built a site that doesn't scream 'FAKE GURU'. Clean, warm, with real testimonials. Bookings up 60%.",
  },
  {
    name: "Lakshmi & Sons",
    company: "Royal Sweets & Snacks",
    rating: 5,
    text: "70-year sweet shop finally online! Just photos + location. Grandkids added WhatsApp orders. Old customers cried seeing Babuji's recipes 😭",
  },
  {
    name: "Suresh T.",
    company: "ColorHub Prints",
    rating: 5,
    text: "Ran my print shop 5 years website-less. ZeroSlash made a 1-pager with my services PDF. Now I look legit. Took 5 days, cost less than my printer ink!",
  },
]

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with proper spacing */}
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center mb-16">
            {/* Section Pills Row */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <SectionPill label="What we do" dotClassName="bg-pink-400" shiny />
              <SectionPill label="Featured Work" dotClassName="bg-blue-400" shiny />
            </div>
            {/* Customer Reviews Tag */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium mb-8 shadow-sm">
              <Star className="w-4 h-4 mr-2" />
              CUSTOMER REVIEWS
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              See Why Our Clients{" "}
              <span className="inline-flex items-center">
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full w-16 h-16 flex items-center justify-center mx-2 shadow-lg text-2xl">
                  ❤️
                </span>
              </span>{" "}
              <span className="bg-gradient-to-r from-black via-gray-700 to-black bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              We believe in getting the details right, keeping our promises, and always going the extra mile. It's how
              we work and why our clients trust us.
            </p>

            {/* Overall Rating Display */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex text-yellow-400 mr-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-current" />
                ))}
              </div>
              <span className="text-black text-lg font-semibold">5.0 from 76+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Testimonials Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollFloat key={index} delay={index * 0.05}>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
                {/* Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mr-4 border border-gray-200 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-medium text-gray-700">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-black">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </ScrollFloat>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Let's Work Together */}
            <div className="md:col-span-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                LET'S WORK
                <br />
                TOGETHER{" "}
                <span className="inline-flex items-center">
                  <span className="bg-pink-400 text-black rounded-full w-12 h-12 flex items-center justify-center ml-2">
                    ☺
                  </span>
                </span>
              </h2>
              <Link href="/">
                <Button className="bg-green-400 hover:bg-green-500 text-black font-medium px-8 py-3 rounded-full">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-green-400"></div>
                      <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-green-400"></div>
                      <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-green-400"></div>
                    </div>
                    LET'S TALK
                  </div>
                </Button>
              </Link>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-xl font-bold mb-6">EXPLORE</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/#work" className="text-gray-300 hover:text-white transition-colors">
                    Work
                  </Link>
                </li>
                <li>
                  <Link href="/#services" className="text-gray-300 hover:text-white transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="text-gray-300 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-300 hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="text-gray-300 hover:text-white transition-colors">
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Say Hello */}
            <div>
              <h3 className="text-xl font-bold mb-6">SAY HELLO</h3>
              <div className="space-y-4 mb-6">
                <p className="text-gray-300">+91 9500255291</p>
                <p className="text-gray-300">zeroslashx1@gmail.com</p>
              </div>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-4 md:mb-0">
              <span>© 2025 ZeroSlash Ltd</span>
              <span>Company Reg Number NI045770</span>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility Statement
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/manage-cookies" className="hover:text-white transition-colors">
                Manage Cookies
              </Link>
            </div>
            <div className="flex items-center bg-white rounded-lg px-3 py-2">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-black text-sm font-medium">5.0 from 76+ reviews</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
