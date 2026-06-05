"use client";

import { useState } from "react";
import Image from "next/image";

interface GifProgressiveImageProps {
  staticSrc: string;
  gifSrc: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  hovered?: boolean;
}

export function GifProgressiveImage({
  staticSrc,
  gifSrc,
  alt,
  fill,
  sizes,
  className,
  hovered = false,
}: GifProgressiveImageProps) {
  const [gifReady, setGifReady] = useState(false);

  const transform = hovered ? "scale(1.05)" : "scale(1)";

  return (
    <>
      <Image
        src={staticSrc}
        alt={alt}
        fill={fill}
        className={className}
        style={{
          transition: "transform 0.7s ease-out, opacity 0.5s ease-out",
          transform,
          opacity: gifReady ? 0 : 1,
        }}
        sizes={sizes}
      />
      <Image
        src={gifSrc}
        alt={alt}
        fill={fill}
        className={className}
        style={{
          transition: "transform 0.7s ease-out, opacity 0.5s ease-out",
          transform,
          opacity: gifReady ? 1 : 0,
        }}
        sizes={sizes}
        unoptimized
        loading="eager"
        onLoad={() => setGifReady(true)}
      />
    </>
  );
}
