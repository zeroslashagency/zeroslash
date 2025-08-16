"use client"

import React from "react"
import { CardCarousel } from "@/components/ui/card-carousel"

export default function CardCarouselDemo() {
  const images = [
    { src: "/images/about/generated-image.png", alt: "About image 1" },
    { src: "/images/about/generated-image (1).png", alt: "About image 2" },
    { src: "/images/about/generated-image (2).png", alt: "About image 3" },
  ]

  return (
    <div className="w-full">
      <CardCarousel
        images={images}
        autoplayDelay={2000}
        showPagination={true}
        showNavigation={true}
      />
    </div>
  )
}
