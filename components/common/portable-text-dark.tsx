import Image from "next/image";
import type { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/image";

export const darkPortableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-[35px] font-normal leading-[125%] tracking-[-0.7px] mt-12 mb-4 text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[21px] font-bold leading-[115%] tracking-[-0.21px] mt-8 mb-3 text-white">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-[16px] font-bold leading-[120%] tracking-[-0.16px] mt-6 mb-2 text-white">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-[14.7px] leading-[170%] tracking-[-0.126px] mb-5 text-white/80">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-white/40 pl-6 my-6">
        <p className="text-[14.7px] leading-[170%] tracking-[-0.126px] m-0 text-white/70">
          {children}
        </p>
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-1 text-[14.7px] leading-[170%] tracking-[-0.126px] text-white/80">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-1 text-[14.7px] leading-[170%] tracking-[-0.126px] text-white/80">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="text-white/70">{children}</em>,
    code: ({ children }) => (
      <code className="bg-white/10 px-1.5 py-0.5 text-[13px] font-mono text-white">
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="underline underline-offset-2 text-white/80 hover:text-white transition-colors duration-300"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const imageUrl = urlFor(value).width(1440).fit("max").url();
      return (
        <figure className="my-10">
          <div className="relative w-full aspect-video">
            <Image
              src={imageUrl}
              alt={value.alt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 1120px) 100vw, 1120px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-[12px] text-white/50 mt-2 tracking-[-0.126px]">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};
