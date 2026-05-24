"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/queries";

interface MediaGalleryProps {
  images: SanityImage[];
  /** Used as the fallback alt-text prefix ("<title> — image N"). */
  title: string;
}

// Thumbnail: 16:9 crop — 4-col desktop (≈1120/4 ≈ 280px) at 2× retina = 560px source
const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 360;

// Lightbox full-size — 2560 covers any display without waste
const FULL_WIDTH = 2560;

export function MediaGallery({ images, title }: MediaGalleryProps) {
  const [index, setIndex] = useState(-1);

  const slides = images.map((img, i) => ({
    src: urlFor(img).width(FULL_WIDTH).fit("max").auto("format").url(),
    alt: img.alt ?? `${title} — image ${i + 1}`,
    description: img.caption,
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((img, i) => {
          const thumbSrc = urlFor(img)
            .width(THUMB_WIDTH)
            .height(THUMB_HEIGHT)
            .fit("crop")
            .auto("format")
            .url();
          const altText = img.alt ?? `${title} — image ${i + 1}`;

          return (
            <figure key={i} className="m-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group relative block w-full aspect-video overflow-hidden cursor-zoom-in p-0 border-0 bg-transparent"
                aria-label={`Open ${altText} in lightbox`}
              >
                <Image
                  src={thumbSrc}
                  alt={altText}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
              </button>
              {img.caption && (
                <figcaption className="text-[12px] text-white/50 mt-2 tracking-[-0.126px]">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
        noScroll={{ disabled: true }}
        animation={{ fade: 220, swipe: 280 }}
        styles={{ container: { backgroundColor: "rgba(1,1,1,0.96)" } }}
      />
    </>
  );
}
