"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { sponsors } from "@/constants/sponsors";

export function PartnersSection() {
  const duplicated = [...sponsors, ...sponsors];

  return (
    <section className="bg-bg py-10.5 border-t border-white/10">
      <div className="px-4 sm:px-6 max-w-280 mx-auto mb-8 text-center">
        <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] text-white/60 leading-[105%]">
          Our Partners
        </span>
      </div>

      <div className="relative max-w-280 mx-auto overflow-hidden">
        {/* Fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-linear-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-linear-to-l from-bg to-transparent" />

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          loop={true}
          centeredSlides={true}
          className="partners-swiper"
          breakpoints={{
            320:  { slidesPerView: 2, spaceBetween: 0 },
            640:  { slidesPerView: 3, spaceBetween: 0 },
            1024: { slidesPerView: 4, spaceBetween: 0 },
          }}
          slidesPerView={2}
          spaceBetween={0}
        >
          {duplicated.map((sponsor, index) => (
            <SwiperSlide key={`${sponsor.name}-${index}`}>
              <div className="flex items-center justify-center h-20 px-8 border-r border-white/10 group">
                <Image
                  src={sponsor.image}
                  alt={sponsor.name}
                  width={110}
                  height={36}
                  className="object-contain opacity-40 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                  style={{ maxHeight: "36px", width: "auto" }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

