"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { teamMembers } from "@/constants/team";

export function TeamSection() {
  return (
    <section className="py-[42px] overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="container-content mb-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow block mb-3">Team</span>
            <h2 className="section-heading text-white m-0">The People Behind It</h2>
          </div>
          <Link href="/team" className="action-link text-white hidden sm:flex">
            Meet The Team
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Swiper with fade edges */}
      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10"
          style={{ background: "linear-gradient(to right, #010101, transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10"
          style={{ background: "linear-gradient(to left, #010101, transparent)" }}
        />
        <Swiper
          modules={[Autoplay]}
          spaceBetween={1}
          slidesPerView={1.3}
          loop
          centeredSlides
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2.2, spaceBetween: 1 },
            1024: { slidesPerView: 3.2, spaceBetween: 1 },
            1280: { slidesPerView: 4.2, spaceBetween: 1 },
          }}
          className="py-4"
        >
          {teamMembers.map((member) => (
            <SwiperSlide key={member.name}>
              <div
                className="flex flex-col items-center p-6 mx-1"
                style={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  minHeight: "320px",
                }}
              >
                {/* Photo */}
                <div
                  className="relative mb-4 overflow-hidden"
                  style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)" }}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Name & role */}
                <h3
                  className="text-white text-center m-0 mb-1"
                  style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.21px" }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-center m-0 mb-3"
                  style={{ fontSize: "11px", letterSpacing: "0.42px", color: "var(--color-accent)", textTransform: "uppercase" }}
                >
                  {member.role}
                </p>

                {/* Description */}
                <p
                  className="text-center m-0 mb-4 line-clamp-3"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", letterSpacing: "-0.126px", lineHeight: "140%" }}
                >
                  {member.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: "10px",
                        padding: "3px 7px",
                        background: "rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Mobile CTA */}
      <div className="container-content sm:hidden mt-4">
        <Link href="/team" className="action-link text-white">
          Meet The Team
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
