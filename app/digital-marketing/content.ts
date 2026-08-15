export const zkContent = {
  hero: {
    eyebrow: "Hello, we're ZeroSlash. A –",
    line1: "We grow",
    line2: "Brands",
    vertical: "STRATEGY / CREATIVE / GROWTH",
    recTitle: "Our growth playbook, in 2 min",
    // keep ZeroSlash swappable: edit these strings only
    // Images below are path strings; keep filenames same when swapping
    sun: "/digital-marketing-assets/assets/sun.svg",
    moon: "/digital-marketing-assets/assets/moon.svg",
    cloud: "/digital-marketing-assets/assets/cloud.svg",
    shader: "/digital-marketing-assets/assets/hero-shader.webp",
    diskTexture: "/digital-marketing-assets/assets/imgDisk.png",
    ellipse14: "/digital-marketing-assets/assets/imgEllipse14.svg",
    ellipse13: "/digital-marketing-assets/assets/imgEllipse13.svg",
    ellipse12: "/digital-marketing-assets/assets/imgEllipse12.svg",
    ellipse11: "/digital-marketing-assets/assets/imgEllipse11.svg",
    playRing: "/digital-marketing-assets/assets/imgPlayCircle.svg",
    playTri: "/digital-marketing-assets/assets/imgGroup.svg",
  },
  intro: {
    p1: "Six years across web, product and performance marketing — from zero-to-one launches to scaling acquisition for startups and enterprise, with campaigns shipped across India and global markets.",
    p2: "We believe great marketing is a growth system, not a one-off. We build it, measure it, and keep scaling it.",
  },
  featured: {
    heading: "Trusted by fast-moving brands",
    // NOTE: work/* offline copy removed for clean professional build — tiles now link to contact
    tiles: [
      {
        href: "/contact",
        title: "E-com SEO",
        subtitle: "+186% organic in 90 days<br class=\"tile-break\"> for D2C scale-up.",
        plate: "/digital-marketing-assets/assets/case-hatcha/hero/hero-plate.jpg",
        poster: "/digital-marketing-assets/assets/case-hatcha/hero/hero-screen-poster.jpg",
        variant: "tile-wide" as const,
      },
      {
        href: "/contact",
        title: "SaaS PPC",
        subtitle: "3.2× ROAS, −41% CAC<br class=\"tile-break\"> live on paid search.",
        plate: "/digital-marketing-assets/assets/case-fireflut/mwc-hero-plate.jpg",
        poster: "/digital-marketing-assets/assets/case-fireflut/mwc-hero-screen-poster.jpg",
        variant: "tile-narrow" as const,
      },
      {
        href: "/contact",
        title: "D2C Social",
        subtitle: "UGC system that 4× engagement<br class=\"tile-break\"> at launch.",
        plate: "/digital-marketing-assets/assets/case-existence/hero/hero-plate.jpg",
        poster: "/digital-marketing-assets/assets/case-existence/hero/hero-screen-poster.jpg",
        variant: "tile-narrow" as const,
      },
      {
        href: "/contact",
        title: "B2B Brand",
        subtitle: "Repositioned for Series A<br class=\"tile-break\"> — doubled inbound.",
        plate: "/digital-marketing-assets/assets/case-jumpable/hero/hero-plate.jpg",
        poster: "/digital-marketing-assets/assets/case-jumpable/hero/hero-screen-poster.jpg",
        variant: "tile-wide" as const,
      },
    ],
    logos: {
      gskinner: "/digital-marketing-assets/assets/logo-gskinner.svg",
      existence: "/digital-marketing-assets/assets/logo-existence.svg",
      google: "/digital-marketing-assets/assets/logo-google.svg",
      pga: "/digital-marketing-assets/assets/logo-pga.png",
      jumpable: "/digital-marketing-assets/assets/logo-jumpable.png",
      vibes: "/digital-marketing-assets/assets/logo-vibes.png",
    },
  },
  testimonials: {
    eyebrow: "RESULTS",
    heading: "In their words",
    cards: [
      {
        quote:
          "ZeroSlash is a detail-obsessed growth partner. Their strength is marrying creative with performance — they ship fast, measure everything, and communicate like an in-house team. A reliable partner with a bright, data-driven approach that scales.",
        name: "Aarav Mehta",
        role: "Founder at ScaleUp",
        avatar: "/images/zero-agency-logo.png",
        pos: 0,
      },
      {
        quote:
          "ZeroSlash deeply cares about performance marketing that converts. They made our campaigns easy to understand and took care of complex targeting and analytics, which helped us scale efficiently and keep acquisition costs predictable.",
        name: "Roopam Mishra",
        role: "Founder at Phionike",
        avatar: "/images/zero-agency-logo.png",
        pos: 1,
      },
      {
        quote:
          "Their work truly speaks for itself: research-backed, resilient against edge cases, and built with a beautiful aesthetic that converts. The team's confidence and attention to detail make even the most complex challenges feel manageable. Whether testing new channels or building conversion funnels, they tackle new tools with fearlessness.",
        name: "Ananya Rao",
        role: "CMO at BrightStart",
        avatar: "/images/zero-agency-logo.png",
        pos: -1,
      },
    ],
  },
} as const;

export type ZkContent = typeof zkContent;
