"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { sponsors } from "@/constants/sponsors";

export function PartnersSection() {
  const duplicated = [...sponsors, ...sponsors];

  return (
    <section className="bg-bg pt-10.5 pb-16 border-t border-white/10">
      <div className="px-4 sm:px-6 w-full mb-10.5">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <span className="block font-medium text-[10.5px] uppercase tracking-[0.42px] text-white/60 mb-5.25 leading-[105%]">
              Our Partners
            </span>
            <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px] text-white">
              Backed by the Best
            </h2>
          </div>
          <p className="max-w-xs text-[14.7px] leading-[120%] tracking-[-0.126px] text-white/50">
            Working alongside industry leaders, public agencies, and engineering
            communities to push our missions further, faster.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <div className="relative w-full overflow-hidden border-t border-b border-white/10">
          {/* Fade masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-linear-to-r from-bg to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-linear-to-l from-bg to-transparent" />

          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop={true}
            centeredSlides={true}
            className="partners-swiper"
            breakpoints={{
              320:  { slidesPerView: 2, spaceBetween: 0 },
              640:  { slidesPerView: 3, spaceBetween: 0 },
              1024: { slidesPerView: 5, spaceBetween: 0 },
              1280: { slidesPerView: 6, spaceBetween: 0 },
            }}
            slidesPerView={2}
            spaceBetween={0}
          >
            {duplicated.map((sponsor, index) => (
              <SwiperSlide key={`${sponsor.name}-${index}`}>
                <div className="group flex items-center justify-center h-32 px-8 border-r border-white/10">
                  <Image
                    src={sponsor.image}
                    alt={sponsor.name}
                    width={140}
                    height={48}
                    sizes="140px"
                    style={{ width: "auto", height: "38px" }}
                    className="object-contain opacity-40 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mt-6 flex items-center justify-between text-[10.5px] uppercase tracking-[0.42px] text-white/40 font-medium">
          <span>{String(sponsors.length).padStart(2, "0")} Strategic Partners</span>
          <span>Kaunas · Vilnius · Worldwide</span>
        </div>
      </div>
    </section>
  );
}

