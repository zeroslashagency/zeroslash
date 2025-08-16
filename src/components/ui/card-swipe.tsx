"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/effect-cards"
import { Autoplay, EffectCards } from "swiper/modules"

interface CarouselProps {
  images: { src: string; alt: string }[]
  autoplayDelay?: number
  slideShadows: boolean
  speedMs?: number
}

export const CardSwipe: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  slideShadows = false,
  speedMs = 800,
}) => {
  const css = `
  .swiper { width: 100%; }
  .swiper-slide { display: flex; align-items: center; justify-content: center; }
  .swiper-slide img { display: block; width: 100%; height: auto; }
  `
  return (
    <div className="w-full">
      <style>{css}</style>
      <Swiper
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        effect={"cards"}
        grabCursor={true}
        loop={true}
        rewind={true}
        speed={speedMs}
        cardsEffect={{ slideShadows }}
        modules={[EffectCards, Autoplay]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="size-full rounded-3xl">
              <Image
                src={image.src}
                width={560}
                height={560}
                className="size-full rounded-3xl"
                alt={image.alt}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
